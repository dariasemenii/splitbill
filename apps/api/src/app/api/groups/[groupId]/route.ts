import { z } from "zod";
import { HttpError, json, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";

// GET /api/groups/:groupId — група з учасниками (лише для її учасників)
export const GET = route(async (req, ctx: RouteContext<"/api/groups/[groupId]">) => {
  const userId = await requireUserId(req);
  const { groupId } = await ctx.params;

  // Невалідний UUID — це просто «не знайдено», а не помилка бази
  if (!z.uuid().safeParse(groupId).success) throw new HttpError(404, "GROUP_NOT_FOUND");

  const me = await prisma.groupMember.findFirst({
    where: { groupId, userId, leftAt: null },
    select: { id: true },
  });
  if (!me) throw new HttpError(404, "GROUP_NOT_FOUND");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      currency: true,
      createdAt: true,
      members: {
        where: { leftAt: null },
        orderBy: { joinedAt: "asc" },
        select: { id: true, userId: true, displayName: true, role: true },
      },
    },
  });
  if (!group) throw new HttpError(404, "GROUP_NOT_FOUND");

  return json({ group: { ...group, myMemberId: me.id } });
});
