import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE_NAME } from "./admin-auth-cookie";
import { getApiUrl } from "./api-url";

type AdminSessionResponse = {
  data?: {
    user?: {
      role?: string | null;
    };
  };
};

export async function getAdminSessionToken(): Promise<string | null> {
  return (await cookies()).get(ADMIN_AUTH_COOKIE_NAME)?.value ?? null;
}

export async function hasAdminSession(): Promise<boolean> {
  const token = await getAdminSessionToken();
  if (!token) return false;

  try {
    const response = await fetch(`${getApiUrl()}/api/auth/me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return false;
    const body = (await response.json()) as AdminSessionResponse;
    return body.data?.user?.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
