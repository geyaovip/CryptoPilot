import { DEMO_USER_ID } from "@cryptopilot/types";

const AUTH_STORAGE_KEY = "cryptopilot-auth";
const demoUserId = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? DEMO_USER_ID;

function readBearerFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null } };
    const token = parsed.state?.accessToken;
    return token ? `Bearer ${token}` : null;
  } catch {
    return null;
  }
}

/** Safe for Server Components and client-side fetch helpers. */
export function buildUserHeaders(extra?: Record<string, string>): Record<string, string> {
  const authorization = readBearerFromStorage();
  const headers: Record<string, string> = { ...extra };
  if (authorization) {
    headers.Authorization = authorization;
  } else {
    headers["x-user-id"] = demoUserId;
  }
  return headers;
}
