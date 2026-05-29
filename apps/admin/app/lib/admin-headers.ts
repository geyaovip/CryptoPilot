import { ADMIN_AUTH_COOKIE_NAME } from "./admin-auth-cookie";

const ADMIN_AUTH_STORAGE_KEY = "cryptopilot-admin-auth";
const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID ?? "00000000-0000-0000-0000-000000000001";

function readBearerFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null } };
    const token = parsed.state?.accessToken;
    return token ? `Bearer ${token}` : null;
  } catch {
    return null;
  }
}

/** Safe for Server Components and client-side fetch helpers. */
export async function adminHeaders(): Promise<Record<string, string>> {
  const authorization = readBearerFromStorage();
  const cookieToken = await readBearerFromCookie();
  return {
    "Content-Type": "application/json",
    ...(authorization || cookieToken
      ? { Authorization: authorization ?? `Bearer ${cookieToken}` }
      : { "x-user-id": adminUserId })
  };
}

async function readBearerFromCookie(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  const { cookies } = await import("next/headers");
  return (await cookies()).get(ADMIN_AUTH_COOKIE_NAME)?.value ?? null;
}
