import { connection } from "next/server";
import { json, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";

// GET /api/health — перевірка, що сервер і база живі
export const GET = route(async () => {
  await connection(); // не виконувати під час збірки, лише на реальний запит
  await prisma.$queryRaw`SELECT 1`;
  return json({ ok: true });
});
