import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../env";
import { prisma } from "../prisma";
import { HttpError } from "../http";

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 60;
const ISSUER = "split-api";
const AUDIENCE = "split-app";

const jwtKey = new TextEncoder().encode(env.JWT_SECRET);
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const newRefreshToken = () => randomBytes(32).toString("base64url");
const refreshExpiry = () => new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

export type TokenPair = { accessToken: string; refreshToken: string };

export async function signAccessToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(jwtKey);
}

export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, jwtKey, { issuer: ISSUER, audience: AUDIENCE });
  if (!payload.sub) throw new Error("Token without subject");
  return payload.sub;
}

export async function issueTokens(userId: string, deviceName?: string): Promise<TokenPair> {
  const refreshToken = newRefreshToken();
  await prisma.refreshToken.create({
    data: { userId, tokenHash: sha256(refreshToken), deviceName, expiresAt: refreshExpiry() },
  });
  return { accessToken: await signAccessToken(userId), refreshToken };
}

// Ротація: старий refresh-токен відкликається, видається новий.
// Якщо хтось пред'являє вже відкликаний токен, це ознака крадіжки:
// відкликаємо всі сесії користувача.
export async function rotateRefreshToken(token: string): Promise<TokenPair & { userId: string }> {
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(token) } });

  if (!existing || existing.expiresAt < new Date()) {
    throw new HttpError(401, "INVALID_REFRESH_TOKEN");
  }

  if (existing.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, "REFRESH_TOKEN_REUSED");
  }

  const refreshToken = newRefreshToken();

  await prisma.$transaction(async (tx) => {
    const created = await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: sha256(refreshToken),
        deviceName: existing.deviceName,
        expiresAt: refreshExpiry(),
      },
    });
    // Умова revokedAt: null захищає від двох паралельних refresh-запитів
    const { count } = await tx.refreshToken.updateMany({
      where: { id: existing.id, revokedAt: null },
      data: { revokedAt: new Date(), replacedById: created.id },
    });
    if (count === 0) throw new HttpError(401, "INVALID_REFRESH_TOKEN");
  });

  return {
    userId: existing.userId,
    accessToken: await signAccessToken(existing.userId),
    refreshToken,
  };
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
