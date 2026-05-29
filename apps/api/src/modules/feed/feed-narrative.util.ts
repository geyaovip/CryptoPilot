import type { FeedType } from "@cryptopilot/types";
import { pickChineseDisplayText } from "../ingestion/chinese-content.util";

type LinkedNarrative = {
  id: string;
  name: string;
  slug: string;
  heatScore: number;
  weight: number;
};

type FeedWithNarratives = {
  type: string;
  title?: string;
  aiSummary?: string;
  narrativeHook?: string | null;
  feedItemNarratives: { narrative: LinkedNarrative }[];
};

export function pickPrimaryNarrative(feed: FeedWithNarratives): LinkedNarrative | null {
  if (feed.feedItemNarratives.length === 0) return null;
  return [...feed.feedItemNarratives]
    .map((row) => row.narrative)
    .sort((a, b) => b.heatScore - a.heatScore || b.weight - a.weight)[0];
}

export function buildNarrativeHook(feed: FeedWithNarratives): string {
  const stored = feed.narrativeHook?.trim();
  if (stored) return stored;

  const chinese = pickChineseDisplayText([cleanFeedDisplayText(feed.aiSummary), feed.title]);
  if (chinese) return chinese.slice(0, 120);

  const primary = pickPrimaryNarrative(feed);
  const name = primary?.name ?? "市场";
  const type = feed.type.toLowerCase();

  switch (type) {
    case "narrative_shift":
      return `${name} 叙事再度升温`;
    case "sentiment_spike":
      return `${name} 情绪出现明显波动`;
    case "market_rotation":
      return `资金轮动信号：${name}`;
    case "breaking":
      return `${name} 出现突发进展`;
    case "kol_signal":
      return `KOL 关注度上升：${name}`;
    default:
      return primary ? `${name} 持续受到关注` : "市场动态更新";
  }
}

export function cleanFeedDisplayText(value?: string | null): string {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return "";
  const disclaimerPattern = /[:：]\s*基于已收录来源的简要摘要.*?(不构成投资建议。?)?$/;
  return text.replace(disclaimerPattern, "").trim();
}

export function narrativeImportanceScore(feed: FeedWithNarratives): number {
  const primary = pickPrimaryNarrative(feed);
  if (!primary) return 0;
  return Math.round(primary.heatScore * 0.12 + primary.weight * 0.08);
}

export function toApiFeedType(type: string): FeedType {
  const normalized = type.toLowerCase();
  const allowed: FeedType[] = [
    "news",
    "narrative",
    "market_move",
    "social_trend",
    "breaking",
    "narrative_shift",
    "sentiment_spike",
    "market_rotation",
    "kol_signal"
  ];
  return (allowed.includes(normalized as FeedType) ? normalized : "news") as FeedType;
}
