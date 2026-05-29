export const ADMIN_AUTH_COOKIE_NAME = "cryptopilot_admin_token";

export function adminAuthCookieOptions() {
  return {
    path: "/admin",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  };
}
