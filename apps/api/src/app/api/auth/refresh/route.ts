import { z } from "zod";
import { json, parseBody, route } from "@/lib/http";
import { rotateRefreshToken } from "@/lib/auth/tokens";

const Body = z.object({ refreshToken: z.string().min(1) });

// POST /api/auth/refresh  { refreshToken }
export const POST = route(async (req) => {
  const { refreshToken } = await parseBody(req, Body);
  const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken);
  return json({ accessToken, refreshToken: newRefreshToken });
});
