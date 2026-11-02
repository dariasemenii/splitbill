import { VerifyCodeBody } from "@split/shared";
import { json, parseBody, route } from "@/lib/http";
import { verifyOtp } from "@/lib/auth/otp";
import { issueTokens } from "@/lib/auth/tokens";
import { findOrCreateUserByEmail } from "@/lib/auth/users";

// POST /api/auth/email/verify  { email, code, deviceName? }
export const POST = route(async (req) => {
  const { email, code, deviceName } = await parseBody(req, VerifyCodeBody);
  await verifyOtp(email, code);

  const user = await findOrCreateUserByEmail(email);
  const tokens = await issueTokens(user.id, deviceName);

  return json({ user, ...tokens, needsOnboarding: !user.name });
});
