"use client";

import type { FeedTab, MarketInsightSummary } from "@cryptopilot/types";
import { EmptyState, LoadingState } from "@cryptopilot/ui";
import { useState } from "react";
import { getFeed } from "../lib/api";
import { InsightCard } from "./insight-card";

const tabs: Array<{ id: FeedTab; label: string }> = [
  { id: "for_you", label: "推荐" },
  { id: "latest", label: "最新" },
  { id: "breaking", label: "突发" }
];

type HomeFeedPanelProps = {
  initialTab: FeedTab;
  initialItems: MarketInsightSummary[];
  initialCursor: string | null;
  narrativeSlug?: string;
};

export function HomeFeedPanel({
  initialTab,
  initialItems,
  initialCursor,
  narrativeSlug
}: HomeFeedPanelProps) {
  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTab = async (nextTab: FeedTab) => {
    setLoading(true);
    setError("");
    try {
      const data = await getFeed(nextTab, undefined, narrativeSlug);
      setTab(nextTab);
      setItems(data.items as MarketInsightSummary[]);
      setCursor(data.next_cursor);
    } catch {
      setError("市场雷达加载失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    setError("");
    try {
      const data = await getFeed(tab, cursor, narrativeSlug);
      setItems((current) => [...current, ...(data.items as MarketInsightSummary[])]);
      setCursor(data.next_cursor);
    } catch {
      setError("加载更多失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            className={`rounded-full px-4 py-2 text-sm ${
              tab === item.id ? "bg-[#20808D] text-white" : "border border-[#D9D5C9] bg-white text-[#5F6868]"
            }`}
            key={item.id}
            onClick={() => loadTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && items.length === 0 ? <LoadingState title="市场雷达加载中" /> : null}
      {error ? <EmptyState actionLabel="重试" description={error} title="加载失败" /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          description="暂无已发布的 Insight（需至少 2 个来源）。可执行 seed 或等待聚类任务。"
          title="暂无市场雷达信号"
        />
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <InsightCard insight={item} key={item.id} />
        ))}
      </div>

      {cursor ? (
        <button
          className="w-full rounded-full border border-[#D9D5C9] bg-white px-4 py-3 text-sm text-[#5F6868] hover:bg-[#F7F5EE]"
          disabled={loading}
          onClick={loadMore}
          type="button"
        >
          加载更多
        </button>
      ) : null}
    </section>
  );
}
