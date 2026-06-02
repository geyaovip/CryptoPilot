"use client";

import { SidebarUserMenu } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiUrl } from "../../lib/api-url";
import { useAdminAuthStore } from "../../lib/auth-store";

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
    const apiUrl = getApiUrl();
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
    void fetch("/admin/auth/session", { method: "DELETE" });
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
        name="尚未登录"
        subtitle="请重新登录后台"
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
