import { chineseTextRatio, isChineseContent } from "../ingestion/chinese-content.util";
import { narrativeImportanceScore } from "./feed-narrative.util";

type RankableFeed = Parameters<typeof narrativeImportanceScore>[0] & {
  rankScore: number;
  isPinned: boolean;
  publishTime: Date;
  title?: string;
  aiSummary?: string;
  narrativeHook?: string | null;
  source?: { contentLocale?: string };
  type?: string;
  feedItemNarratives: {
    narrative: { slug: string };
  }[];
};

export function chineseLocaleBoost(feed: RankableFeed): number {
  if (feed.source?.contentLocale === "ZH") return 36;
  const text = `${feed.narrativeHook ?? ""} ${feed.aiSummary ?? ""} ${feed.title ?? ""}`;
  if (isChineseContent(text)) return 22;
  if (chineseTextRatio(text) > 0.02) return 8;
  return 0;
}

/**
 * Content quality boost for curated tabs (for_you).
 * NARRATIVE 深度 > BREAKING 突发 > MARKET_MOVE 行情 > 0.
 * NEWS items are filtered at the query level and should not reach scoring,
 * but receive 0 if they do.
 */
export function contentTypeBoost(type?: string): number {
  switch (type) {
    case "NARRATIVE":
      return 80;
    case "BREAKING":
      return 50;
    case "MARKET_MOVE":
      return 30;
    default:
      return 0;
  }
}

export function effectiveFeedSortScore(
  feed: RankableFeed,
  userInterestBonus: number,
  narrativeSlug?: string
): number {
  let score =
    feed.rankScore +
    narrativeImportanceScore(feed) +
    contentTypeBoost(feed.type) +
    userInterestBonus +
    chineseLocaleBoost(feed);
  if (narrativeSlug) {
    const matches = feed.feedItemNarratives.some((row) => row.narrative.slug === narrativeSlug);
    if (matches) score += 25;
  }
  return score;
}

export function compareFeedsForTab(
  a: RankableFeed,
  b: RankableFeed,
  scoreA: number,
  scoreB: number
): number {
  if (scoreB !== scoreA) return scoreB - scoreA;
  if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
  return b.publishTime.getTime() - a.publishTime.getTime();
}
