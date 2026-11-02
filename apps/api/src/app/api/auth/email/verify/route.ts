import { z } from "zod";
import { json, parseBody, route } from "@/lib/http";
import { verifyOtp } from "@/lib/auth/otp";
import { issueTokens } from "@/lib/auth/tokens";
import { findOrCreateUserByEmail } from "@/lib/auth/users";
import { deviceNameSchema, emailSchema } from "@/lib/validation";

const Body = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/),
  deviceName: deviceNameSchema,
});

// POST /api/auth/email/verify  { email, code, deviceName? }
export const POST = route(async (req) => {
  const { email, code, deviceName } = await parseBody(req, Body);
  await verifyOtp(email, code);

  const user = await findOrCreateUserByEmail(email);
  const tokens = await issueTokens(user.id, deviceName);

  return json({ user, ...tokens, needsOnboarding: !user.name });
});
