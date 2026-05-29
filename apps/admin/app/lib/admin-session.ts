import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE_NAME } from "./admin-auth-cookie";

export async function getAdminSessionToken(): Promise<string | null> {
  return (await cookies()).get(ADMIN_AUTH_COOKIE_NAME)?.value ?? null;
}

export async function hasAdminSession(): Promise<boolean> {
  return Boolean(await getAdminSessionToken());
}

export async function requireAdminSession(): Promise<void> {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
