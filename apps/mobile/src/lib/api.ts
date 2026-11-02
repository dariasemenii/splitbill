import type { ApiErrorBody, TokenPair } from '@split/shared';

import { API_URL } from './config';
import { tokenStorage } from './token-storage';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
    public issues?: unknown[],
  ) {
    super(message ?? code);
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, 'INVALID_RESPONSE');
    }
  }

  if (!res.ok) {
    const error = (data as ApiErrorBody | null)?.error;
    throw new ApiError(res.status, error?.code ?? 'HTTP_ERROR', error?.message, error?.issues);
  }
  return data as T;
}

// Оновлення пари токенів. Якщо кілька запитів одночасно отримали 401,
// усі вони чекають на один і той самий запит: сервер відкликає старий
// refresh-токен, тож два паралельні оновлення розлогінили б користувача.
// Повертає новий access-токен або null, якщо сесії більше немає.
// Помилки мережі прокидаються далі: без інтернету ми не виходимо з акаунта.
export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.status === 401) {
        await tokenStorage.clear();
        accessToken = null;
        return null;
      }

      const tokens = await parseResponse<TokenPair>(res);
      await tokenStorage.setRefreshToken(tokens.refreshToken);
      accessToken = tokens.accessToken;
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** false — для публічних ендпоінтів (вхід, реєстрація) */
  auth?: boolean;
  signal?: AbortSignal;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;

  const send = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await send(accessToken);

  if (auth && res.status === 401) {
    const newToken = await refreshSession();
    if (!newToken) {
      onSessionExpired?.();
      throw new ApiError(401, 'SESSION_EXPIRED');
    }
    res = await send(newToken);
  }

  return parseResponse<T>(res);
}
