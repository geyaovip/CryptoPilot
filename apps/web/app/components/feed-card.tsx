import type { FeedItemSummary } from "@cryptopilot/types";
import { Card } from "@cryptopilot/ui";
import { FeedCardActions } from "./feed-card-actions";

function isHot(heatScore: number) {
  return heatScore >= 85;
}

export function FeedCard({ feed }: { feed: FeedItemSummary }) {
  const summary = feed.ai_summary?.trim() || "AI 摘要生成中，请稍后刷新。";
  const sourceLabel =
    feed.related_source_count > 1
      ? `${feed.related_source_count} 个相关来源`
      : "1 个来源";

  return (
    <Card className="border-[#D9D5C9] bg-white/95 p-5 shadow-[0_12px_40px_rgba(16,42,44,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-[#5F6868]">{feed.source_name}</p>
        {isHot(feed.heat_score) ? (
          <span className="shrink-0 rounded-full bg-[#FFF4E5] px-2.5 py-0.5 text-xs font-medium text-[#B45309]">🔥 热点</span>
        ) : (
          <span className="shrink-0 rounded-full bg-[#E4F2F2] px-2.5 py-0.5 text-xs font-medium text-[#20808D]">
            热度 {feed.heat_score}
          </span>
        )}
      </div>
      <a
        className="mt-2 block text-lg font-semibold leading-7 text-[#102A2C] hover:text-[#20808D]"
        data-testid="feed-card-summary"
        href={`/feed/${feed.id}`}
      >
        {summary}
      </a>
      <p className="mt-2 text-xs text-[#8A918C]">{sourceLabel}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {feed.related_tokens.map((token) => (
          <span className="rounded-full border border-[#D9D5C9] bg-[#FCFCF9] px-2.5 py-1 text-xs text-[#5F6868]" key={token.id}>
            {token.symbol}
          </span>
        ))}
        {feed.narrative_tags.map((narrative) => (
          <span className="rounded-full bg-[#F7F5EE] px-2.5 py-1 text-xs text-[#5F6868]" key={narrative.id}>
            {narrative.name}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE8DA] pt-4">
        <a className="text-sm text-[#5F6868] hover:text-[#20808D]" href={feed.source_url} rel="noreferrer" target="_blank">
          查看原文
        </a>
        <FeedCardActions askQuery={summary} feedId={feed.id} />
      </div>
    </Card>
  );
}
