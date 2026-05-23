"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/auth-store";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type MeUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};

export function MePanel() {
  const token = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    void fetch(`${apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (response) => {
        if (!response.ok) {
          setUser(null);
          return;
        }
        const body = (await response.json()) as { data: { user: MeUser } };
        setUser(body.data.user);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function logout() {
    setAccessToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  if (loading) {
    return <p className="text-sm text-[#5F6868]">加载中…</p>;
  }

  if (!user) {
    return (
      <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <h1 className="text-xl font-semibold text-[#102A2C]">未登录</h1>
        <p className="mt-2 text-sm leading-6 text-[#5F6868]">登录后可同步收藏、关注与 AI 搜索配额。</p>
        <a className="mt-4 inline-flex" href="/login">
          <Button className="border-[#20808D] bg-[#20808D] text-white hover:bg-[#186A73]">前往登录</Button>
        </a>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
      <h1 className="text-xl font-semibold text-[#102A2C]">{user.name ?? "用户"}</h1>
      <p className="mt-2 text-sm text-[#5F6868]">{user.email}</p>
      <p className="mt-1 text-xs text-[#8A918C]">角色：{user.role}</p>
      <Button className="mt-6 border-[#D9D5C9] bg-white text-[#102A2C] hover:bg-[#F7F5EE]" onClick={logout}>
        退出登录
      </Button>
    </Card>
  );
}
