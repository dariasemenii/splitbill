import { RefreshBody } from "@split/shared";
import { json, parseBody, route } from "@/lib/http";
import { revokeRefreshToken } from "@/lib/auth/tokens";

// POST /api/auth/logout  { refreshToken }
export const POST = route(async (req) => {
  const { refreshToken } = await parseBody(req, RefreshBody);
  await revokeRefreshToken(refreshToken);
  return json({ ok: true });
});
