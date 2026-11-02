import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "../env";
import { prisma } from "../prisma";
import { HttpError } from "../http";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const hashCode = (email: string, code: string) =>
  createHmac("sha256", env.OTP_SECRET).update(`${email}:${code}`).digest();

export async function createOtp(email: string): Promise<string> {
  const last = await prisma.emailOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    throw new HttpError(429, "OTP_COOLDOWN", "Зачекайте хвилину перед повторним запитом коду");
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  // Попередні невикористані коди більше не дійсні
  await prisma.emailOtp.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await prisma.emailOtp.create({
    data: {
      email,
      codeHash: hashCode(email, code).toString("hex"),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  return code;
}

export async function verifyOtp(email: string, code: string): Promise<void> {
  const otp = await prisma.emailOtp.findFirst({
    where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.attempts >= MAX_ATTEMPTS) {
    throw new HttpError(400, "INVALID_CODE", "Код невірний або застарів");
  }

  const matches = timingSafeEqual(Buffer.from(otp.codeHash, "hex"), hashCode(email, code));

  if (!matches) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, "INVALID_CODE", "Код невірний або застарів");
  }

  const { count } = await prisma.emailOtp.updateMany({
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (count === 0) throw new HttpError(400, "INVALID_CODE", "Код невірний або застарів");
}
