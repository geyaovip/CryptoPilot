"use client";

import { Button, Card } from "@cryptopilot/ui";
import type { NotificationSettings } from "@cryptopilot/types";
import { useState } from "react";
import { updateNotificationSettings } from "../../lib/api";

const rows: Array<{ key: keyof NotificationSettings; title: string; description: string }> = [
  {
    key: "telegram_push_enabled",
    title: "Telegram Push",
    description: "总开关。关闭后不会发送任何 Telegram 通知。"
  },
  {
    key: "daily_digest_enabled",
    title: "Daily Digest",
    description: "每天发送一次市场摘要。"
  },
  {
    key: "market_alert_enabled",
    title: "Market Alert",
    description: "市场异动、突发 Feed 与高热叙事提醒。"
  },
  {
    key: "watchlist_alert_enabled",
    title: "Watchlist Alert",
    description: "只针对你关注的资产、叙事与 KOL 发送提醒。"
  }
];

export function NotificationsPanel({ initialSettings }: { initialSettings: NotificationSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function toggle(key: keyof NotificationSettings) {
    const next = !settings[key];
    setBusyKey(String(key));
    try {
      const updated = await updateNotificationSettings({ [key]: next });
      setSettings(updated);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <h1 className="text-xl font-semibold text-[#102A2C]">通知设置</h1>
        <p className="mt-2 text-sm leading-6 text-[#5F6868]">
          管理 Telegram 推送范围。所有内容仅用于研究参考，不构成投资建议。
        </p>
        <div className="mt-4 rounded-2xl bg-[#FCFCF9] p-4 text-sm text-[#5F6868]">
          Telegram：{settings.telegram_bound ? "已绑定" : "未绑定"}，时区：{settings.timezone}
        </div>
      </Card>
      {rows.map((row) => {
        const enabled = Boolean(settings[row.key]);
        return (
          <Card className="border-[#D9D5C9] bg-white/95 p-5" key={row.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-[#102A2C]">{row.title}</h2>
                <p className="mt-1 text-sm text-[#5F6868]">{row.description}</p>
              </div>
              <Button disabled={busyKey === row.key} onClick={() => void toggle(row.key)} type="button">
                {enabled ? "关闭" : "开启"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
