"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, EmptyState } from "@cryptopilot/ui";
import type { WatchlistItemView } from "@cryptopilot/types";
import {
  addWatchlist,
  getKols,
  getNarratives,
  getTokens,
  patchWatchlistNotification,
  removeWatchlist
} from "../lib/api";

type Tab = "all" | "token" | "narrative" | "kol";

export function WatchlistPanel({ initialItems }: { initialItems: WatchlistItemView[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<Tab>("all");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((item) => item.target_type === tab);
  }, [items, tab]);

  async function toggleNotification(id: string, enabled: boolean) {
    setBusy(true);
    try {
      const updated = await patchWatchlistNotification(id, enabled);
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, notifications_enabled: updated.notifications_enabled } : item
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id: string) {
    setBusy(true);
    try {
      await removeWatchlist(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setBusy(false);
    }
  }

  async function quickAdd(type: "token" | "narrative" | "kol") {
    setBusy(true);
    try {
      const target =
        type === "token"
          ? (await getTokens()).items[0]
          : type === "narrative"
            ? (await getNarratives()).items[0]
            : (await getKols()).items[0];
      if (!target) return;
      await addWatchlist(type, target.id);
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="还没有关注对象"
        description="可从 Token、叙事或 KOL 开始添加关注，便于在首页获得更相关的 Feed 排序。"
        actionLabel={busy ? "处理中..." : "添加示例叙事"}
        onAction={() => void quickAdd("narrative")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "token", "narrative", "kol"] as Tab[]).map((value) => (
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              tab === value ? "bg-[#102A2C] text-white" : "bg-[#F7F5EE] text-[#5F6868]"
            }`}
            key={value}
            onClick={() => setTab(value)}
            type="button"
          >
            {value === "all" ? "全部" : value}
          </button>
        ))}
      </div>
      {filtered.map((item) => (
        <Card className="border-[#D9D5C9] p-5" key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#5F6868]">{item.target_type}</p>
              <h2 className="text-lg font-semibold text-[#102A2C]">{item.name}</h2>
              {item.subtitle ? <p className="text-sm text-[#5F6868]">{item.subtitle}</p> : null}
              {item.latest_update ? <p className="mt-2 text-sm text-[#5F6868]">{item.latest_update}</p> : null}
              {item.ai_summary ? <p className="mt-2 text-sm leading-6 text-[#5F6868]">{item.ai_summary}</p> : null}
            </div>
            <div className="text-right text-sm text-[#5F6868]">
              {item.change_24h !== null ? <p>24h {item.change_24h}</p> : null}
              <p className="mt-1">{item.notifications_enabled ? "通知开" : "通知关"}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {item.target_type === "narrative" ? (
              <Link className="text-sm text-[#102A2C] underline" href={`/narratives/${item.subtitle}`}>
                查看叙事
              </Link>
            ) : null}
            <Button
              disabled={busy}
              onClick={() => void toggleNotification(item.id, !item.notifications_enabled)}
              type="button"
            >
              {item.notifications_enabled ? "关闭通知" : "开启通知"}
            </Button>
            <Button disabled={busy} onClick={() => void handleRemove(item.id)} type="button">
              取消关注
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
