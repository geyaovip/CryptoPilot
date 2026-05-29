import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE_NAME, adminAuthCookieOptions } from "../../../lib/admin-auth-cookie";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { access_token?: string };
  const token = body.access_token?.trim();
  if (!token) {
    return NextResponse.json({ message: "缺少登录凭证" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE_NAME, token, {
    ...adminAuthCookieOptions(),
    httpOnly: true
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE_NAME, "", {
    ...adminAuthCookieOptions(),
    httpOnly: true,
    maxAge: 0
  });
  return NextResponse.json({ ok: true });
}
