"use client";

import { Button, Card } from "@cryptopilot/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/auth-store";
import { getApiUrl } from "../lib/api-url";
import { useBookmarkStore } from "../lib/bookmark-store";
import { getNotificationSettings } from "../lib/api";
import { TelegramCard } from "./telegram-card";

type MeUser = {
  id: string;
  uid: string;
  email: string | null;
  name: string | null;
  role: string;
};

const helpLinks = [
  { href: "/about", title: "关于 CryptoPilot", description: "产品定位、适合人群与核心能力" },
  { href: "/methodology", title: "方法论", description: "来源聚合、AI 解读与风险边界" },
  { href: "/faq", title: "FAQ", description: "常见问题、数据来源与使用边界" },
  { href: "/disclaimer", title: "免责声明", description: "研究用途与非投资建议说明" }
];

export function MePanel() {
  const token = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [user, setUser] = useState<MeUser | null>(null);
  const [telegramBound, setTelegramBound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const bookmarkItems = useBookmarkStore((state) => state.items);
  const bookmarkLoading = useBookmarkStore((state) => state.loading);
  const loadBookmarks = useBookmarkStore((state) => state.load);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const apiUrl = getApiUrl();
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

  useEffect(() => {
    if (!user) return;
    void getNotificationSettings()
      .then((settings) => setTelegramBound(settings.telegram_bound))
      .catch(() => setTelegramBound(false));
  }, [user]);

  useEffect(() => {
    if (user) void loadBookmarks();
  }, [user, loadBookmarks]);

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
    <div className="grid gap-5">
      <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <h1 className="text-xl font-semibold text-[#102A2C]">{user.name ?? "用户"}</h1>
        <p className="mt-2 text-sm text-[#5F6868]">{user.email}</p>
        <p className="mt-1 font-mono text-xs text-[#8A918C]">UID：{user.uid}</p>
        <Button className="mt-6 border-[#D9D5C9] bg-white text-[#102A2C] hover:bg-[#F7F5EE]" onClick={logout}>
          退出登录
        </Button>
      </Card>

      <TelegramCard bound={telegramBound} />

      <Card className="border-[#D9D5C9] bg-white/95 p-0 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <button
          type="button"
          aria-expanded={helpOpen}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          onClick={() => setHelpOpen((value) => !value)}
        >
          <span>
            <span className="block text-lg font-semibold text-[#102A2C]">帮助与说明</span>
            <span className="mt-1 block text-sm text-[#5F6868]">了解 CryptoPilot、方法论、FAQ 与免责声明。</span>
          </span>
          <span className="text-xl text-[#8A918C]" aria-hidden>
            {helpOpen ? "−" : "+"}
          </span>
        </button>
        {helpOpen ? (
          <div className="border-t border-[#EDE8DA] px-3 pb-3">
            {helpLinks.map((item) => (
              <Link
                className="block rounded-2xl px-3 py-3 transition hover:bg-[#F7F5EE]"
                href={item.href}
                key={item.href}
              >
                <span className="block text-sm font-medium text-[#102A2C]">{item.title}</span>
                <span className="mt-1 block text-xs text-[#5F6868]">{item.description}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#102A2C]">我的收藏</h2>
            <p className="mt-1 text-sm text-[#5F6868]">保存过的市场信号和 Feed 会集中在这里。</p>
          </div>
          <span className="rounded-full bg-[#F7F5EE] px-3 py-1 text-xs text-[#5F6868]">{bookmarkItems.length} 条</span>
        </div>

        {bookmarkLoading ? <p className="mt-5 text-sm text-[#8A918C]">正在加载收藏…</p> : null}
        {!bookmarkLoading && bookmarkItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#D9D5C9] bg-[#FCFCF9] p-5 text-sm text-[#5F6868]">
            还没有收藏内容。你可以在首页列表里点击“收藏”，稍后回到这里继续查看。
          </div>
        ) : null}
        {bookmarkItems.length ? (
          <div className="mt-5 divide-y divide-[#EDE8DA]">
            {bookmarkItems.map(({ kind, item }) => {
              const href = kind === "insight" ? `/insights/${item.id}` : `/feed/${item.id}`;
              const title = kind === "insight" ? item.ai_insight : item.narrative_hook || item.ai_summary;
              const subtitle = kind === "insight" ? item.ai_summary : item.source_name;
              return (
                <a className="block py-4 hover:bg-[#FCFCF9]" href={href} key={`${kind}-${item.id}`}>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#E8F4F6] px-2 py-0.5 text-xs text-[#20808D]">
                      {kind === "insight" ? "Insight" : "Feed"}
                    </span>
                    <span className="text-xs text-[#8A918C]">热度 {item.heat_score}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#102A2C]">{title}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#8A918C]">{subtitle}</p>
                </a>
              );
            })}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
