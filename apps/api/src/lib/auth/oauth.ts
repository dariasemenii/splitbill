import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env";
import { HttpError } from "../http";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type OAuthProfile = {
  providerUserId: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
};

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : undefined);

export async function verifyGoogleIdToken(idToken: string): Promise<OAuthProfile> {
  const audience = env.GOOGLE_CLIENT_IDS.split(",").map((s) => s.trim()).filter(Boolean);
  if (audience.length === 0) throw new HttpError(500, "GOOGLE_NOT_CONFIGURED");

  try {
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience,
    });
    if (!payload.sub) throw new Error("no sub");
    return {
      providerUserId: payload.sub,
      email: str(payload.email)?.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: str(payload.name),
    };
  } catch {
    throw new HttpError(401, "INVALID_ID_TOKEN");
  }
}

export async function verifyAppleIdToken(idToken: string): Promise<OAuthProfile> {
  if (!env.APPLE_BUNDLE_ID) throw new HttpError(500, "APPLE_NOT_CONFIGURED");

  try {
    const { payload } = await jwtVerify(idToken, appleJwks, {
      issuer: "https://appleid.apple.com",
      audience: env.APPLE_BUNDLE_ID,
    });
    if (!payload.sub) throw new Error("no sub");
    return {
      providerUserId: payload.sub,
      email: str(payload.email)?.toLowerCase(),
      // Apple іноді повертає це поле рядком
      emailVerified: payload.email_verified === true || payload.email_verified === "true",
      // Ім'я Apple у токені не передає: клієнт отримує його лише при першому вході
    };
  } catch {
    throw new HttpError(401, "INVALID_ID_TOKEN");
  }
}
