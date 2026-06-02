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
            initialCursor={feed.next_cursor}
            initialItems={(feed.entity === "insight" ? feed.items : []) as MarketInsightSummary[]}
            initialTab="for_you"
            narrativeSlug={narrativeSlug}
          />
        </section>
        <aside className="hidden space-y-4 lg:block">
          <Card className="sticky top-6 border-[#D9D5C9] bg-[#F7F5EE]">
            <h2 className="text-sm font-semibold text-[#102A2C]">市场雷达</h2>
            <p className="mt-2 text-xs leading-5 text-[#5F6868]">快速查看市场热度、情绪和重点资产变化。</p>
            <div className="mt-4">
              <MarketHeatBar compact fearGreedIndex={trending.fear_greed_index} marketHeat={trending.market_heat} tokens={trending.tokens} />
            </div>
          </Card>
        </aside>
      </div>
    </WebShell>
  );
}
