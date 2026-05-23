import { narrativeImportanceScore } from "./feed-narrative.util";

type RankableFeed = Parameters<typeof narrativeImportanceScore>[0] & {
  rankScore: number;
  isPinned: boolean;
  publishTime: Date;
  feedItemNarratives: {
    narrative: { slug: string };
  }[];
};

export function effectiveFeedSortScore(
  feed: RankableFeed,
  userInterestBonus: number,
  narrativeSlug?: string
): number {
  let score = feed.rankScore + narrativeImportanceScore(feed) + userInterestBonus;
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
