import type { FeedType } from "@cryptopilot/types";

const LABELS: Record<FeedType, string> = {
  news: "资讯",
  narrative: "叙事",
  market_move: "行情",
  social_trend: "社媒",
  breaking: "突发",
  narrative_shift: "叙事变化",
  sentiment_spike: "情绪波动",
  market_rotation: "资金轮动",
  kol_signal: "KOL 信号"
};

const STYLES: Record<FeedType, string> = {
  news: "bg-[#F7F5EE] text-[#5F6868]",
  narrative: "bg-[#E4F2F2] text-[#20808D]",
  market_move: "bg-[#EDE8DA] text-[#5F6868]",
  social_trend: "bg-[#F7F5EE] text-[#5F6868]",
  breaking: "bg-[#FEE2E2] text-[#B91C1C]",
  narrative_shift: "bg-[#FFF4E5] text-[#B45309]",
  sentiment_spike: "bg-[#F3E8FF] text-[#7C3AED]",
  market_rotation: "bg-[#E0F2FE] text-[#0369A1]",
  kol_signal: "bg-[#ECFDF5] text-[#047857]"
};

export function FeedTypeBadge({ feedType }: { feedType: FeedType }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[feedType] ?? STYLES.news}`}>
      {LABELS[feedType] ?? feedType}
    </span>
  );
}
