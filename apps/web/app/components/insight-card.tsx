import type { MarketInsightSummary } from "@cryptopilot/types";
import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { FeedTypeBadge } from "./feed-type-badge";
import { InsightCardActions } from "./insight-card-actions";

const HEAT_LABELS: Record<MarketInsightSummary["heat_label"], string> = {
  heating_up: "升温中",
  cooling: "降温中",
  stable: "平稳"
};

const SENTIMENT_LABELS: Record<MarketInsightSummary["sentiment"], string> = {
  bullish: "偏积极",
  neutral: "中性",
  bearish: "偏谨慎"
};

const SENTIMENT_STYLES: Record<MarketInsightSummary["sentiment"], string> = {
  bullish: "bg-[#E8F4F6] text-[#20808D]",
  neutral: "bg-[#F3F4F6] text-[#6B7280]",
  bearish: "bg-red-50 text-red-700"
};

export function InsightCard({ insight }: { insight: MarketInsightSummary }) {
  const headline = insight.ai_insight?.trim() || "市场雷达更新中…";
  const summary = insight.ai_summary?.trim() || "";

  return (
    <Card className="border-[#D9D5C9] bg-white/95 p-5 shadow-[0_12px_40px_rgba(16,42,44,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <FeedTypeBadge feedType={insight.feed_type} />
        <span className="rounded-full bg-[#FFF4E5] px-2.5 py-0.5 text-xs font-medium text-[#B45309]">
          {HEAT_LABELS[insight.heat_label]}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_STYLES[insight.sentiment]}`}>
          {SENTIMENT_LABELS[insight.sentiment]}
        </span>
        {insight.primary_narrative ? (
          <Link
            className="rounded-full bg-[#20808D]/10 px-2.5 py-0.5 text-xs font-medium text-[#20808D]"
            href={`/narratives/${insight.primary_narrative.slug}`}
          >
            🔥 {insight.primary_narrative.name}
          </Link>
        ) : null}
        <span className="ml-auto text-xs text-[#8A918C]">热度 {insight.heat_score}</span>
      </div>
      <a
        className="mt-3 block text-lg font-semibold leading-7 text-[#102A2C] hover:text-[#20808D]"
        data-testid="insight-card-headline"
        href={`/insights/${insight.id}`}
      >
        {headline}
      </a>
      {summary && summary !== headline ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5F6868]">{summary}</p>
      ) : null}
      <p className="mt-2 text-xs text-[#8A918C]">{insight.source_count} 个可点击来源</p>
      <ul className="mt-2 space-y-1">
        {insight.sources.slice(0, 3).map((source) => (
          <li className="text-xs" key={source.feed_item_id}>
            <a className="text-[#20808D] hover:underline" href={source.source_url} rel="noopener noreferrer" target="_blank">
              {source.source_name}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {insight.related_tokens.map((token) => (
          <span className="rounded-full border border-[#D9D5C9] bg-[#FCFCF9] px-2.5 py-1 text-xs" key={token.id}>
            {token.symbol}
          </span>
        ))}
      </div>
      <div className="mt-4 border-t border-[#EDE8DA] pt-4">
        <InsightCardActions askQuery={headline} insightId={insight.id} />
      </div>
    </Card>
  );
}
