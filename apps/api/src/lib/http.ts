import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

// Обгортка для route handlers: єдиний формат помилок для мобільного клієнта
export function route<Ctx = unknown>(handler: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      // Внутрішні помилки Next.js (напр. від connection() під час збірки) не перехоплюємо
      unstable_rethrow(e);
      if (e instanceof HttpError) {
        return json({ error: { code: e.code, message: e.message } }, e.status);
      }
      if (e instanceof ZodError) {
        return json({ error: { code: "VALIDATION_ERROR", issues: e.issues } }, 400);
      }
      console.error(e);
      return json({ error: { code: "INTERNAL_ERROR" } }, 500);
    }
  };
}

export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
  return schema.parse(body);
}
