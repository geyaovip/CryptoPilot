"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuthStore } from "../../lib/auth-store";
import { getApiUrl } from "../../lib/api-url";
import { CryptoPilotMark } from "../_components/cryptopilot-mark";

const betaDevLogin = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_BETA_DEV_LOGIN === "true";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAdminAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishLogin(accessToken: string) {
    const sessionResponse = await fetch("/admin/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken })
    });
    if (!sessionResponse.ok) throw new Error("登录会话保存失败，请刷新后重试");
    setAccessToken(accessToken);
    router.replace("/admin/dashboard");
    router.refresh();
  }

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setLoading(true);
    setInfo("正在验证登录链接...");
    const apiUrl = getApiUrl();
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
        await finishLogin(body.data?.access_token ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "登录失败"))
      .finally(() => {
        setInfo(null);
        setLoading(false);
      });
  }, [searchParams, setAccessToken, router]);

  async function handleMagicLink() {
    const normalizedEmail = email.trim().toLowerCase();
    if (loading || !normalizedEmail) {
      setError("请输入管理员邮箱");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo("正在发送登录邮件...");
    setMagicLinkUrl(null);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, redirect_path: "/admin/login" })
      });
      const body = (await response.json()) as {
        data?: { message?: string; magic_link_url?: string };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message ?? "发送失败");
      setInfo(body.data?.message ?? "登录链接已发送，请查收邮件。");
      if (body.data?.magic_link_url) setMagicLinkUrl(body.data.magic_link_url);
    } catch (err) {
      setInfo(null);
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo("正在登录...");
    try {
      const apiUrl = getApiUrl();
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
      await finishLogin(body.data?.access_token ?? "");
    } catch (err) {
      setInfo(null);
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CryptoPilotMark className="h-11 w-11" showText />
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">管理员登录</h1>
      <p className="mt-2 text-sm text-slate-500">输入管理员邮箱，我们会发送一个一次性登录链接到你的邮箱。</p>
      <input
        className="mt-4 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
        placeholder="you@example.com"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError(null);
          setInfo(null);
        }}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {info ? <p className="mt-2 text-sm text-emerald-700">{info}</p> : null}
      {magicLinkUrl ? (
        <a className="mt-2 block break-all text-sm text-slate-700 underline" href={magicLinkUrl}>
          点此完成管理员登录（开发环境）
        </a>
      ) : null}
      <Button className="mt-4 w-full" disabled={loading || !email.trim()} onClick={() => void handleMagicLink()}>
        {loading ? "处理中..." : "发送一次性登录链接"}
      </Button>
      {betaDevLogin ? (
        <Button
          className="mt-2 w-full border border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
          disabled={loading}
          onClick={() => void handleQuickLogin()}
        >
          快速登录（开发）
        </Button>
      ) : null}
    </Card>
  );
}
