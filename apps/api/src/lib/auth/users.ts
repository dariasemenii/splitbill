import type { AuthProvider } from "@/generated/prisma/client";
import { prisma } from "../prisma";
import { HttpError } from "../http";
import type { OAuthProfile } from "./oauth";

// Поля користувача, які безпечно віддавати клієнту
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  defaultCurrency: true,
  createdAt: true,
} as const;

export async function findOrCreateUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: publicUserSelect,
  });
}

export async function findOrCreateOAuthUser(
  provider: AuthProvider,
  profile: OAuthProfile,
  fallbackName?: string,
) {
  const identity = await prisma.authIdentity.findUnique({
    where: { provider_providerUserId: { provider, providerUserId: profile.providerUserId } },
    select: { user: { select: publicUserSelect } },
  });
  if (identity) return identity.user;

  // Прив'язуємо до існуючого акаунта лише за підтвердженим email
  const email = profile.email;
  if (!email || !profile.emailVerified) throw new HttpError(400, "EMAIL_REQUIRED");

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email },
      update: {},
      create: { email, name: profile.name ?? fallbackName ?? null },
      select: publicUserSelect,
    });
    await tx.authIdentity.create({
      data: { userId: user.id, provider, providerUserId: profile.providerUserId, email },
    });
    return user;
  });
}
