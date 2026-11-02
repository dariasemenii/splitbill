import { z } from "zod";
import { HttpError, json, parseBody, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";
import { publicUserSelect } from "@/lib/auth/users";
import { currencySchema, personNameSchema } from "@/lib/validation";

// GET /api/me
export const GET = route(async (req) => {
  const userId = await requireUserId(req);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw new HttpError(404, "USER_NOT_FOUND");
  return json({ user });
});

const PatchBody = z
  .object({
    name: personNameSchema,
    avatarUrl: z.url().nullable(),
    defaultCurrency: currencySchema,
  })
  .partial();

// PATCH /api/me  { name?, avatarUrl?, defaultCurrency? }
export const PATCH = route(async (req) => {
  const userId = await requireUserId(req);
  const data = await parseBody(req, PatchBody);
  const user = await prisma.user.update({ where: { id: userId }, data, select: publicUserSelect });
  return json({ user });
});
