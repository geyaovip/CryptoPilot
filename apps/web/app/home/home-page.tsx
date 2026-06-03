import type { MarketInsightSummary } from "@cryptopilot/types";
import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { WebShell } from "../_components/web-shell";
import { HomeFeedPanel } from "../components/home-feed-panel";
import { HomeHeader } from "../components/home-header";
import { JsonLd } from "../components/json-ld";
import { MarketHeatBar } from "../components/market-heat-bar";
import { getFeed, getTrending } from "../lib/api";
import { organizationJsonLd, webApplicationJsonLd, websiteJsonLd } from "../lib/seo";

const MARKET_SNAPSHOT_PRIORITY = ["BTC", "ETH"];
const MARKET_SNAPSHOT_LIMIT = 10;

export async function CryptoPilotHomePage({
  searchParams
}: {
  searchParams: Promise<{ narrative?: string }>;
}) {
  const params = await searchParams;
  const narrativeSlug = params.narrative?.trim() || undefined;
  let loadError: string | null = null;
  let feed: Awaited<ReturnType<typeof getFeed>> = { entity: "insight", items: [], next_cursor: null };
  let trending: Awaited<ReturnType<typeof getTrending>> = {
    tokens: [],
    narratives: [],
    market_heat: {
      score: 0,
      velocity: 0,
      label: "stable",
      active_narrative_count: 0,
      leading_narrative: null,
      major_move: "flat",
      breadth: {
        advancing: 0,
        declining: 0,
        unchanged: 0,
        total: 0,
        advance_ratio: 0
      },
      narrative_rotation: {
        heating: [],
        cooling: []
      },
      unusual_moves: [],
      risk_signals: [],
      updated_at: new Date().toISOString()
    },
    fear_greed_index: null
  };
  const [feedResult, trendingResult] = await Promise.allSettled([
    getFeed("for_you", undefined, narrativeSlug),
    getTrending()
  ]);
  if (feedResult.status === "fulfilled") {
    feed = feedResult.value;
  } else {
    loadError = feedResult.reason instanceof Error ? feedResult.reason.message : "Feed 加载失败";
  }
  if (trendingResult.status === "fulfilled") {
    trending = trendingResult.value;
  } else if (!loadError) {
    loadError = trendingResult.reason instanceof Error ? trendingResult.reason.message : "趋势数据加载失败";
  }
  const activeNarrative = narrativeSlug
    ? trending.narratives.find((item) => item.slug === narrativeSlug)
    : undefined;
  const marketSnapshotTokens = [...trending.tokens]
    .sort((a, b) => {
      const aPriority = MARKET_SNAPSHOT_PRIORITY.indexOf(a.symbol);
      const bPriority = MARKET_SNAPSHOT_PRIORITY.indexOf(b.symbol);
      if (aPriority !== -1 || bPriority !== -1) {
        return (aPriority === -1 ? MARKET_SNAPSHOT_PRIORITY.length : aPriority) - (bPriority === -1 ? MARKET_SNAPSHOT_PRIORITY.length : bPriority);
      }
      return 0;
    })
    .slice(0, MARKET_SNAPSHOT_LIMIT);

  return (
    <WebShell>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(), webApplicationJsonLd()]} />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="space-y-5">
          {loadError ? (
            <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError}</Card>
          ) : null}
          <Card className="border-[#D9D5C9] bg-white/90 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
            <HomeHeader />
            {activeNarrative ? (
              <p className="mt-2 text-sm text-[#102A2C]">
                当前筛选叙事：
                <Link className="ml-1 underline" href={`/narratives/${activeNarrative.slug}`}>
                  {activeNarrative.name}
                </Link>
                <Link className="ml-3 text-[#5F6868]" href="/">
                  清除筛选
                </Link>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2" data-testid="topic-chips">
              {trending.narratives.slice(0, 8).map((item) => {
                const active = narrativeSlug === item.slug;
                return (
                  <Link
                    className={
                      active
                        ? "rounded-full bg-[#20808D] px-3 py-1 text-xs font-medium text-white"
                        : "rounded-full bg-[#F7F5EE] px-3 py-1 text-xs text-[#5F6868] hover:bg-[#EDE8DA]"
                    }
                    href={active ? "/" : `/?narrative=${item.slug}`}
                    key={item.id}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </Card>
          <HomeFeedPanel
            key={narrativeSlug ?? "_all"}
            initialCursor={feed.next_cursor}
            initialItems={(feed.entity === "insight" ? feed.items : []) as MarketInsightSummary[]}
            initialTab="for_you"
            narrativeSlug={narrativeSlug}
          />
        </section>
        <aside className="hidden space-y-4 lg:block">
          <div className="space-y-4">
            <Card className="border-[#D9D5C9] bg-[#F7F5EE]">
              <h2 className="text-sm font-semibold text-[#102A2C]">市场雷达</h2>
              <p className="mt-2 text-xs leading-5 text-[#5F6868]">快速查看市场热度、情绪和风险变化。</p>
              <div className="mt-4">
                <MarketHeatBar compact fearGreedIndex={trending.fear_greed_index} marketHeat={trending.market_heat} showTokenSnapshot={false} tokens={trending.tokens} />
              </div>
            </Card>
            <Card className="border-[#D9D5C9] bg-[#F7F5EE]">
              <h2 className="text-sm font-semibold text-[#102A2C]">市场快照</h2>
              <p className="mt-2 text-xs leading-5 text-[#5F6868]">按资产管理展示重点资产，BTC / ETH 优先。</p>
              <div className="mt-4 space-y-2">
                {marketSnapshotTokens.map((item) => (
                  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-[#5F6868]" key={item.id}>
                    <div>
                      <span className="font-medium text-[#102A2C]">{item.symbol}</span>
                      <span className="ml-2 text-xs text-[#8A918C]">
                        {item.price_usd ? `$${item.price_usd.toLocaleString()}` : "价格更新中"}
                      </span>
                    </div>
                    <span className={`shrink-0 ${(item.price_change_24h ?? 0) >= 0 ? "text-[#20808D]" : "text-red-600"}`}>
                      {item.price_change_24h?.toFixed(2) ?? "0.00"}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </WebShell>
  );
}
