import Link from "next/link";
import { Card, EmptyState } from "@cryptopilot/ui";
import { FeedCard } from "../../components/feed-card";
import { FollowButton } from "../../components/follow-button";
import { WebShell } from "../../_components/web-shell";
import { getNarrativeDetail } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function NarrativeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const narrative = await getNarrativeDetail(slug);

  return (
    <WebShell>
      <div className="space-y-5">
        <Card className="border-[#D9D5C9] bg-white/90 p-6">
          <Link className="text-sm text-[#5F6868] hover:underline" href="/narratives">
            ← 返回叙事列表
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-[#102A2C]">{narrative.name}</h1>
            <FollowButton
              initialFollowed={narrative.is_followed}
              initialWatchlistId={narrative.watchlist_id}
              targetId={narrative.id}
              targetType="narrative"
            />
          </div>
          <p className="mt-3 text-sm leading-7 text-[#5F6868]">{narrative.ai_summary ?? narrative.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5F6868]">
            <span>热度 {narrative.heat_score}</span>
            <span>24h 趋势 {narrative.trend_score_24h}</span>
            <span>7d 趋势 {narrative.trend_score_7d}</span>
            <span>情绪 {narrative.sentiment}</span>
          </div>
          <Link
            className="mt-4 inline-block text-sm font-medium text-[#102A2C] underline"
            href={`/home?narrative=${narrative.slug}`}
          >
            在首页查看该叙事相关 Feed →
          </Link>
        </Card>

        {narrative.top_tokens.length > 0 ? (
          <Card className="border-[#D9D5C9] p-6">
            <h2 className="text-sm font-semibold text-[#102A2C]">Top Tokens</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {narrative.top_tokens.map((token) => (
                <span
                  className="rounded-full bg-[#F7F5EE] px-3 py-1 text-sm text-[#102A2C]"
                  key={token.id}
                  title={token.name}
                >
                  {token.symbol}
                  {token.price_change_24h !== null ? (
                    <span className="ml-2 text-xs text-[#5F6868]">{token.price_change_24h.toFixed(2)}%</span>
                  ) : null}
                </span>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="border-[#D9D5C9] p-6">
          <h2 className="text-sm font-semibold text-[#102A2C]">热度趋势（24h）</h2>
          {narrative.heat_chart.h24.length > 0 ? (
            <div className="mt-4 flex h-24 items-end gap-1">
              {narrative.heat_chart.h24.map((point) => (
                <div
                  className="flex-1 rounded-t bg-[#C8A96A]"
                  key={point.captured_at}
                  style={{ height: `${Math.max(12, point.heat_score)}%` }}
                  title={`热度 ${point.heat_score}`}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#5F6868]">暂无热度快照数据。</p>
          )}
        </Card>

        {narrative.top_sources.length > 0 ? (
          <Card className="border-[#D9D5C9] p-6">
            <h2 className="text-sm font-semibold text-[#102A2C]">Top Sources</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#5F6868]">
              {narrative.top_sources.map((source) => (
                <li className="flex justify-between gap-4" key={source.source_name}>
                  <span>{source.source_name}</span>
                  <span>{source.feed_count} 篇</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card className="border-[#D9D5C9] p-6">
          <h2 className="text-sm font-semibold text-[#102A2C]">相关 Feed</h2>
          {narrative.related_feed.length > 0 ? (
            <div className="mt-4 space-y-3">
              {narrative.related_feed.map((item) => (
                <FeedCard feed={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                description="该叙事下暂无已发布 Feed，可稍后再看或从首页浏览全站动态。"
                title="暂无相关报道"
              />
            </div>
          )}
        </Card>
      </div>
    </WebShell>
  );
}
