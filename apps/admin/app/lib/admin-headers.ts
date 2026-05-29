import { ADMIN_AUTH_COOKIE_NAME } from "./admin-auth-cookie";

const ADMIN_AUTH_STORAGE_KEY = "cryptopilot-admin-auth";

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
    ...(authorization || cookieToken ? { Authorization: authorization ?? `Bearer ${cookieToken}` } : {})
  };
}

async function readBearerFromCookie(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  const { cookies } = await import("next/headers");
  return (await cookies()).get(ADMIN_AUTH_COOKIE_NAME)?.value ?? null;
}
