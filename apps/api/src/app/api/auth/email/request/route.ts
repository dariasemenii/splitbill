import { RequestCodeBody } from "@split/shared";
import { json, parseBody, route } from "@/lib/http";
import { createOtp } from "@/lib/auth/otp";
import { sendLoginCode } from "@/lib/email";

// POST /api/auth/email/request  { email }
export const POST = route(async (req) => {
  const { email } = await parseBody(req, RequestCodeBody);
  const code = await createOtp(email);
  await sendLoginCode(email, code);
  return json({ ok: true });
});
