import { createHmac, timingSafeEqual } from "node:crypto";

type TokenPayload = {
  sub: string;
  role: "user" | "admin";
  exp: number;
};

export function signAuthToken(input: { userId: string; role: "user" | "admin"; secret: string; ttlSeconds?: number }) {
  const exp = Math.floor(Date.now() / 1000) + (input.ttlSeconds ?? 60 * 60 * 24 * 7);
  const payload: TokenPayload = { sub: input.userId, role: input.role, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", input.secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAuthToken(token: string, secret: string): TokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
