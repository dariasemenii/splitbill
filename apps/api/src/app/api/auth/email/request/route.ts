import { z } from "zod";
import { json, parseBody, route } from "@/lib/http";
import { createOtp } from "@/lib/auth/otp";
import { sendLoginCode } from "@/lib/email";
import { emailSchema } from "@/lib/validation";

const Body = z.object({ email: emailSchema });

// POST /api/auth/email/request  { email }
export const POST = route(async (req) => {
  const { email } = await parseBody(req, Body);
  const code = await createOtp(email);
  await sendLoginCode(email, code);
  return json({ ok: true });
});
