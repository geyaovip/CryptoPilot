"use client";

import { SidebarUserMenu } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/auth-store";
import { getApiUrl } from "../lib/api-url";

const LOGGED_IN_ITEMS = [
  { label: "个人中心", href: "/me" },
  { label: "通知设置", href: "/settings/notifications" }
] as const;

type MeUser = {
  name: string | null;
  email: string | null;
};

export function WebUserMenu() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
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
        setUser(body.data.user);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      });
  }, [token, setAccessToken]);

  function goLogin() {
    router.push("/login");
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  if (!hydrated) {
    return (
      <SidebarUserMenu
        avatarText="…"
        name="加载中"
        menuLabel="用户菜单"
        items={[]}
        variant="perplexity"
        onPrimaryClick={() => undefined}
      />
    );
  }

  if (!token) {
    return (
      <SidebarUserMenu
        avatarText="登"
        name="登录"
        subtitle="邮箱一次性登录链接"
        menuLabel="用户菜单"
        items={[]}
        variant="perplexity"
        onPrimaryClick={goLogin}
      />
    );
  }

  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "用户";
  const avatarText = displayName.slice(0, 1).toUpperCase();

  return (
    <SidebarUserMenu
      avatarText={avatarText}
      name={displayName}
      subtitle={user?.email ?? undefined}
      menuLabel="用户菜单"
      items={[...LOGGED_IN_ITEMS]}
      variant="perplexity"
      onLogout={logout}
    />
  );
}
