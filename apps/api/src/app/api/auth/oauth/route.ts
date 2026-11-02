import { OAuthBody } from "@split/shared";
import { json, parseBody, route } from "@/lib/http";
import { verifyAppleIdToken, verifyGoogleIdToken } from "@/lib/auth/oauth";
import { issueTokens } from "@/lib/auth/tokens";
import { findOrCreateOAuthUser } from "@/lib/auth/users";

// POST /api/auth/oauth  { provider, idToken, name?, deviceName? }
export const POST = route(async (req) => {
  const { provider, idToken, name, deviceName } = await parseBody(req, OAuthBody);

  const profile =
    provider === "google" ? await verifyGoogleIdToken(idToken) : await verifyAppleIdToken(idToken);

  const user = await findOrCreateOAuthUser(
    provider === "google" ? "GOOGLE" : "APPLE",
    profile,
    name,
  );
  const tokens = await issueTokens(user.id, deviceName);

  return json({ user, ...tokens, needsOnboarding: !user.name });
});
