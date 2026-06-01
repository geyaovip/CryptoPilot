"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useEffect, useState } from "react";
import { createTelegramBindCode, unbindTelegram } from "../lib/api";

export function TelegramCard({ bound }: { bound: boolean }) {
  const [isBound, setIsBound] = useState(bound);
  const [code, setCode] = useState<string | null>(null);
  const [botLink, setBotLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsBound(bound);
  }, [bound]);

  async function createCode() {
    setBusy(true);
    setError(null);
    try {
      const data = await createTelegramBindCode();
      setCode(data.code);
      setBotLink(data.bot_link);
      setExpiresAt(data.expires_at);
      if (data.bot_link) {
        window.location.href = data.bot_link;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成 Telegram 绑定链接失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnbind() {
    setBusy(true);
    setError(null);
    try {
      await unbindTelegram();
      setIsBound(false);
      setCode(null);
      setBotLink(null);
      setExpiresAt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解绑 Telegram 失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#102A2C]">Telegram 推送</h2>
          <p className="mt-1 text-sm text-[#5F6868]">
            {isBound ? "已绑定 Telegram，可在通知设置里管理推送。" : "点击一键绑定会打开 Telegram Bot，并自动完成账号绑定。"}
          </p>
        </div>
        <span className="rounded-full bg-[#F7F5EE] px-3 py-1 text-xs text-[#5F6868]">
          {isBound ? "已绑定" : "未绑定"}
        </span>
      </div>
      {code ? (
        <div className="mt-4 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-4">
          <p className="text-sm font-medium text-[#102A2C]">{botLink ? "Telegram 已打开，点击 Bot 里的 Start 即可完成绑定。" : "复制下面的绑定码，在 Telegram Bot 中发送 /bind 绑定码。"}</p>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-[0.2em] text-[#102A2C]">{code}</p>
          <p className="mt-2 text-xs text-[#8A918C]">备用绑定码，有效期至 {expiresAt ? new Date(expiresAt).toLocaleString("zh-CN") : "10 分钟后"}</p>
          {botLink ? (
            <a className="mt-3 inline-flex rounded-full border border-[#D9D5C9] px-4 py-2 text-sm font-medium text-[#20808D]" href={botLink} rel="noreferrer" target="_blank">
              重新打开 Telegram Bot
            </a>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[#B54708]">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => void createCode()} type="button">
          {busy ? "处理中…" : "一键绑定 Telegram"}
        </Button>
        {isBound ? (
          <Button disabled={busy} onClick={() => void handleUnbind()} type="button">
            解绑 Telegram
          </Button>
        ) : null}
        <a className="inline-flex items-center text-sm font-medium text-[#20808D]" href="/settings/notifications">
          通知设置
        </a>
      </div>
    </Card>
  );
}
