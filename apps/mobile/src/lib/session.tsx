import type { AuthResponse, PublicUser } from '@split/shared';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, ApiError, refreshSession, setAccessToken, setSessionExpiredHandler } from './api';
import { tokenStorage } from './token-storage';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn' | 'error';

type SessionContextValue = {
  status: SessionStatus;
  user: PublicUser | null;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: PublicUser) => void;
  /** Повторити відновлення сесії після помилки з'єднання */
  retry: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);
  const [attempt, setAttempt] = useState(0);

  const clearLocalSession = useCallback(async () => {
    setAccessToken(null);
    await tokenStorage.clear();
    queryClient.clear();
    setUser(null);
    setStatus('signedOut');
  }, [queryClient]);

  // Якщо під час роботи refresh-токен перестав бути дійсним — виходимо
  useEffect(() => {
    setSessionExpiredHandler(() => void clearLocalSession());
    return () => setSessionExpiredHandler(null);
  }, [clearLocalSession]);

  // Відновлення сесії при запуску застосунку
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await refreshSession();
        if (!token) {
          if (!cancelled) setStatus('signedOut');
          return;
        }
        const { user } = await api<{ user: PublicUser }>('/api/me');
        if (cancelled) return;
        setUser(user);
        setStatus('signedIn');
      } catch (error) {
        if (cancelled) return;
        // 401 означає, що сесії немає; усе інше (немає мережі, сервер лежить)
        // показуємо як помилку з'єднання, не викидаючи користувача з акаунта
        if (error instanceof ApiError && error.status === 401) setStatus('signedOut');
        else setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const signIn = useCallback(async (auth: AuthResponse) => {
    await tokenStorage.setRefreshToken(auth.refreshToken);
    setAccessToken(auth.accessToken);
    setUser(auth.user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Відкликаємо токен на сервері, але не блокуємо вихід, якщо це не вдалося
      await api('/api/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }).catch(() => {});
    }
    await clearLocalSession();
  }, [clearLocalSession]);

  const retry = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, setUser, retry }),
    [status, user, signIn, signOut, retry],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
