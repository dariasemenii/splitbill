import { CreateGroupBody } from "@split/shared";
import { HttpError, json, parseBody, route } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";

// GET /api/groups  — групи, де користувач є активним учасником
export const GET = route(async (req) => {
  const userId = await requireUserId(req);

  const memberships = await prisma.groupMember.findMany({
    where: { userId, leftAt: null, group: { archivedAt: null } },
    orderBy: { group: { updatedAt: "desc" } },
    select: {
      id: true,
      role: true,
      group: {
        select: {
          id: true,
          name: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { members: { where: { leftAt: null } } } },
        },
      },
    },
  });

  return json({
    groups: memberships.map(({ id, role, group }) => ({
      id: group.id,
      name: group.name,
      currency: group.currency,
      memberCount: group._count.members,
      myMemberId: id,
      myRole: role,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    })),
  });
});

// POST /api/groups  { name, currency?, displayName?, members? }
export const POST = route(async (req) => {
  const userId = await requireUserId(req);
  const body = await parseBody(req, CreateGroupBody);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new HttpError(404, "USER_NOT_FOUND");

  const ownerName = body.displayName ?? user.name ?? user.email.split("@")[0];

  const group = await prisma.group.create({
    data: {
      name: body.name,
      currency: body.currency,
      createdById: userId,
      members: {
        create: [
          { userId, displayName: ownerName, role: "OWNER" },
          ...body.members.map((displayName) => ({ displayName })),
        ],
      },
    },
    select: {
      id: true,
      name: true,
      currency: true,
      createdAt: true,
      members: {
        select: { id: true, userId: true, displayName: true, role: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  return json({ group }, 201);
});
