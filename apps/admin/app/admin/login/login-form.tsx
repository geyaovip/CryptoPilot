"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuthStore } from "../../lib/auth-store";
import { CryptoPilotMark } from "../_components/cryptopilot-mark";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAdminAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState("admin@cryptopilot.local");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function finishLogin(accessToken: string) {
    setAccessToken(accessToken);
    router.push("/admin/dashboard");
    router.refresh();
  }

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setLoading(true);
    void fetch(`${apiUrl}/api/auth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (response) => {
        const body = (await response.json()) as {
          data?: { access_token: string; user?: { role: string } };
          message?: string;
        };
        if (!response.ok) throw new Error(body.message ?? "登录链接无效");
        if (body.data?.user?.role !== "admin") throw new Error("该账号不是管理员");
        finishLogin(body.data?.access_token ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "登录失败"))
      .finally(() => setLoading(false));
  }, [searchParams, setAccessToken, router]);

  async function handleMagicLink() {
    setLoading(true);
    setError(null);
    setMagicLinkUrl(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as {
        data?: { magic_link_url?: string };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message ?? "发送失败");
      if (body.data?.magic_link_url) {
        const adminUrl = body.data.magic_link_url.replace("/login?", "/admin/login?");
        setMagicLinkUrl(adminUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as {
        data?: { access_token: string; user?: { role: string } };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message ?? "登录失败");
      if (body.data?.user?.role !== "admin") throw new Error("该账号不是管理员");
      finishLogin(body.data?.access_token ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CryptoPilotMark className="h-10 w-10" showText />
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">管理员登录</h1>
      <p className="mt-2 text-sm text-slate-500">使用管理员邮箱获取 Magic Link，或开发环境快速登录。</p>
      <input
        className="mt-4 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {magicLinkUrl ? (
        <a className="mt-2 block break-all text-sm text-slate-700 underline" href={magicLinkUrl}>
          点此完成管理员登录（开发环境）
        </a>
      ) : null}
      <Button className="mt-4 w-full" disabled={loading} onClick={() => void handleMagicLink()}>
        发送 Magic Link
      </Button>
      <Button
        className="mt-2 w-full border border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
        disabled={loading}
        onClick={() => void handleQuickLogin()}
      >
        快速登录（开发）
      </Button>
    </Card>
  );
}
