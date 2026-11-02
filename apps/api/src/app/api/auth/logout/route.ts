import { z } from "zod";
import { json, parseBody, route } from "@/lib/http";
import { revokeRefreshToken } from "@/lib/auth/tokens";

const Body = z.object({ refreshToken: z.string().min(1) });

// POST /api/auth/logout  { refreshToken }
export const POST = route(async (req) => {
  const { refreshToken } = await parseBody(req, Body);
  await revokeRefreshToken(refreshToken);
  return json({ ok: true });
});
