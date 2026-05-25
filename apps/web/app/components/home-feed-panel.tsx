"use client";

import type { FeedItemSummary, FeedTab, MarketInsightSummary } from "@cryptopilot/types";
import { EmptyState, LoadingState } from "@cryptopilot/ui";
import { useState } from "react";
import { getFeed } from "../lib/api";
import { FeedCard } from "./feed-card";
import { InsightCard } from "./insight-card";

const tabs: Array<{ id: FeedTab; label: string }> = [
  { id: "for_you", label: "推荐" },
  { id: "latest", label: "最新" },
  { id: "breaking", label: "突发" }
];

type HomeView = "insight" | "signals";

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
  const [view, setView] = useState<HomeView>("insight");
  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [insightItems, setInsightItems] = useState(initialItems);
  const [signalItems, setSignalItems] = useState<FeedItemSummary[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (nextView: HomeView, nextTab: FeedTab, nextCursor?: string) => {
    setLoading(true);
    setError("");
    try {
      const entity = nextView === "signals" ? "feed_item" : "insight";
      const data = await getFeed(nextTab, nextCursor, narrativeSlug, entity);
      setView(nextView);
      setTab(nextTab);
      if (entity === "feed_item") {
        if (nextCursor) {
          setSignalItems((current) => [...current, ...(data.items as FeedItemSummary[])]);
        } else {
          setSignalItems(data.items as FeedItemSummary[]);
        }
      } else if (nextCursor) {
        setInsightItems((current) => [...current, ...(data.items as MarketInsightSummary[])]);
      } else {
        setInsightItems(data.items as MarketInsightSummary[]);
      }
      setCursor(data.next_cursor);
    } catch {
      setError(nextView === "signals" ? "信号流加载失败，请重试。" : "市场雷达加载失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const loadTab = (nextTab: FeedTab) => load(view, nextTab);
  const switchView = (nextView: HomeView) => load(nextView, tab);
  const loadMore = () => {
    if (!cursor) return;
    void load(view, tab, cursor);
  };

  const list = view === "signals" ? signalItems : insightItems;
  const emptyTitle = view === "signals" ? "暂无聚合信号" : "暂无市场雷达信号";
  const emptyDesc =
    view === "signals"
      ? "暂无满足条件的 Feed 簇（需至少 2 个来源）。可执行 db:refresh-content 或等待聚类任务。"
      : "暂无已发布的 Insight（需至少 2 个来源）。可执行 seed 或等待聚类任务。";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-full px-4 py-2 text-sm ${
            view === "insight" ? "bg-[#102A2C] text-white" : "border border-[#D9D5C9] bg-white text-[#5F6868]"
          }`}
          onClick={() => switchView("insight")}
          type="button"
        >
          市场雷达
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm ${
            view === "signals" ? "bg-[#102A2C] text-white" : "border border-[#D9D5C9] bg-white text-[#5F6868]"
          }`}
          onClick={() => switchView("signals")}
          type="button"
        >
          信号流（聚合）
        </button>
      </div>

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

      {loading && list.length === 0 ? <LoadingState title="加载中" /> : null}
      {error ? <EmptyState actionLabel="重试" description={error} title="加载失败" /> : null}

      {!loading && !error && list.length === 0 ? (
        <EmptyState description={emptyDesc} title={emptyTitle} />
      ) : null}

      <div className="space-y-4">
        {view === "signals"
          ? signalItems.map((item) => <FeedCard feed={item} key={item.id} />)
          : insightItems.map((item) => <InsightCard insight={item} key={item.id} />)}
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
