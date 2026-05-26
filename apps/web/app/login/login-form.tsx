"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/auth-store";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
const betaDevLogin = process.env.NEXT_PUBLIC_BETA_DEV_LOGIN === "true";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState("user@cryptopilot.local");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          data?: { access_token: string };
          message?: string;
        };
        if (!response.ok) throw new Error(body.message ?? "登录链接无效");
        setAccessToken(body.data?.access_token ?? null);
        router.replace("/");
        router.refresh();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "登录失败"))
      .finally(() => setLoading(false));
  }, [router, searchParams, setAccessToken]);

  async function handleMagicLink() {
    setLoading(true);
    setError(null);
    setInfo(null);
    setMagicLinkUrl(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as {
        data?: { message: string; magic_link_url?: string };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message ?? "发送失败");
      setInfo(body.data?.message ?? "请查收登录链接");
      if (body.data?.magic_link_url) setMagicLinkUrl(body.data.magic_link_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDevLogin() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const body = (await response.json()) as {
        data?: { access_token: string };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message ?? "登录失败");
      setAccessToken(body.data?.access_token ?? null);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-3xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_70px_rgba(16,42,44,0.08)]">
      <p className="text-xs font-medium uppercase tracking-wide text-[#20808D]">CryptoPilot</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#102A2C]">登录</h1>
      <p className="mt-2 text-sm leading-6 text-[#5F6868]">
        输入邮箱获取 Magic Link。Beta 新用户可使用 <code className="text-xs">*@cryptopilot.local</code> 自动注册。
      </p>
      <div className="mt-6 space-y-3">
        <input
          className="h-12 w-full rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] px-4 text-sm outline-none placeholder:text-[#8A918C] focus:border-[#20808D]"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {info ? <p className="text-sm text-[#20808D]">{info}</p> : null}
        {magicLinkUrl ? (
          <a className="block break-all text-sm text-[#20808D] underline" href={magicLinkUrl}>
            点此完成登录（开发环境链接）
          </a>
        ) : null}
        <Button
          className="w-full rounded-2xl border-[#20808D] bg-[#20808D] text-white hover:bg-[#186A73]"
          disabled={loading}
          onClick={() => void handleMagicLink()}
        >
          {loading ? "处理中…" : "发送 Magic Link"}
        </Button>
        {betaDevLogin ? (
          <Button
            className="w-full rounded-2xl border-[#D9D5C9] bg-white text-[#102A2C] hover:bg-[#F7F5EE]"
            disabled={loading}
            onClick={() => void handleDevLogin()}
          >
            Beta 快速登录（开发）
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
