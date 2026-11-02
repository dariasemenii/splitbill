import { RefreshBody } from "@split/shared";
import { json, parseBody, route } from "@/lib/http";
import { rotateRefreshToken } from "@/lib/auth/tokens";

// POST /api/auth/refresh  { refreshToken }
export const POST = route(async (req) => {
  const { refreshToken } = await parseBody(req, RefreshBody);
  const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken);
  return json({ accessToken, refreshToken: newRefreshToken });
});
