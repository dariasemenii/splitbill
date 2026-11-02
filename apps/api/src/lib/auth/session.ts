import { HttpError } from "../http";
import { verifyAccessToken } from "./tokens";

// Повертає id користувача з заголовка Authorization: Bearer <accessToken>
export async function requireUserId(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "UNAUTHORIZED");

  try {
    return await verifyAccessToken(header.slice("Bearer ".length));
  } catch {
    throw new HttpError(401, "UNAUTHORIZED");
  }
}
