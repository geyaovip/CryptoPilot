"use client";

import { SidebarUserMenu } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuthStore } from "../../lib/auth-store";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const MENU_ITEMS = [
  { label: "账号资料", href: "/admin/users" },
  { label: "系统设置", href: "/admin/config" },
  { label: "操作日志", href: "/admin/logs" }
] as const;

type MeUser = {
  name: string | null;
  email: string | null;
  role: string;
};

export function AdminUserMenu() {
  const router = useRouter();
  const token = useAdminAuthStore((state) => state.accessToken);
  const setAccessToken = useAdminAuthStore((state) => state.setAccessToken);
  const [user, setUser] = useState<MeUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    void fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (response) => {
        if (!response.ok) {
          setAccessToken(null);
          setUser(null);
          return;
        }
        const body = (await response.json()) as { data: { user: MeUser } };
        if (body.data.user.role !== "admin") {
          setAccessToken(null);
          setUser(null);
          return;
        }
        setUser(body.data.user);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      });
  }, [token, setAccessToken]);

  function goLogin() {
    router.push("/admin/login");
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
    router.push("/admin/login");
    router.refresh();
  }

  if (!hydrated) {
    return (
      <SidebarUserMenu
        avatarText="…"
        name="加载中"
        menuLabel="管理员菜单"
        items={[]}
        onPrimaryClick={() => undefined}
      />
    );
  }

  if (!token) {
    return (
      <SidebarUserMenu
        avatarText="登"
        name="管理员登录"
        subtitle="需要 Bearer Token"
        menuLabel="管理员菜单"
        items={[]}
        onPrimaryClick={goLogin}
      />
    );
  }

  const displayName = user?.name ?? "管理员";
  const email = user?.email ?? "admin@cryptopilot.local";

  return (
    <SidebarUserMenu
      avatarText="管"
      name={displayName}
      subtitle={email}
      menuLabel="管理员菜单"
      items={[...MENU_ITEMS]}
      onLogout={logout}
    />
  );
}
