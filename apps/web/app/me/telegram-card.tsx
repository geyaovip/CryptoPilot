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

  useEffect(() => {
    setIsBound(bound);
  }, [bound]);

  async function createCode() {
    setBusy(true);
    try {
      const data = await createTelegramBindCode();
      setCode(data.code);
      setBotLink(data.bot_link);
      setExpiresAt(data.expires_at);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnbind() {
    setBusy(true);
    try {
      await unbindTelegram();
      setIsBound(false);
      setCode(null);
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
            {isBound ? "已绑定 Telegram，可在通知设置里管理推送。" : "生成一次性绑定码，在 Telegram Bot 中发送 /bind code 完成绑定。"}
          </p>
        </div>
        <span className="rounded-full bg-[#F7F5EE] px-3 py-1 text-xs text-[#5F6868]">
          {isBound ? "已绑定" : "未绑定"}
        </span>
      </div>
      {code ? (
        <div className="mt-4 rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] p-4">
          <p className="font-mono text-2xl font-semibold tracking-[0.2em] text-[#102A2C]">{code}</p>
          <p className="mt-2 text-xs text-[#8A918C]">有效期至 {expiresAt ? new Date(expiresAt).toLocaleString("zh-CN") : "10 分钟后"}</p>
          {botLink ? (
            <a className="mt-3 inline-block text-sm font-medium text-[#20808D]" href={botLink} rel="noreferrer" target="_blank">
              打开 Telegram Bot
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => void createCode()} type="button">
          {busy ? "处理中…" : "生成绑定码"}
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
