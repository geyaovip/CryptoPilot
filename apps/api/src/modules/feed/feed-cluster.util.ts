import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { pickPrimaryNarrative } from "./feed-narrative.util";
import { compareFeedsForTab, effectiveFeedSortScore } from "./feed-ranking.util";
import { toFeedSummary } from "./feed.mapper";
import type { FeedItemSummary } from "@cryptopilot/types";

export type ClusterFeedRow = {
  id: string;
  clusterId: string | null;
  isClusterLead?: boolean;
  title: string;
  content: string;
  aiSummary: string;
  narrativeHook?: string | null;
  sourceUrl: string;
  publishTime: Date;
  sentiment: string;
  heatScore: number;
  rankScore: number;
  type: string;
  status: string;
  isPinned: boolean;
  source: { name: string; contentLocale?: string };
  feedItemTokens: {
    tokenId: string;
    token: { id: string; symbol: string; name: string; priceUsd: unknown; priceChange24h: unknown };
  }[];
  feedItemNarratives: {
    narrativeId: string;
    narrative: { id: string; name: string; slug: string; heatScore: number; weight: number };
  }[];
};

export function clusterBucketKey(feed: ClusterFeedRow): string {
  const primary = pickPrimaryNarrative(feed);
  const windowMs = 6 * 60 * 60 * 1000;
  const window = Math.floor(feed.publishTime.getTime() / windowMs);
  return `${primary?.slug ?? "general"}:${window}`;
}

export function pickClusterRepresentative(members: ClusterFeedRow[]): ClusterFeedRow {
  const lead = members.find((row) => row.isClusterLead);
  if (lead) return lead;
  return [...members].sort(
    (a, b) => b.rankScore - a.rankScore || b.publishTime.getTime() - a.publishTime.getTime()
  )[0];
}

export function buildClusterCards(feeds: ClusterFeedRow[]): Array<{ representative: ClusterFeedRow; members: ClusterFeedRow[] }> {
  const byCluster = new Map<string, ClusterFeedRow[]>();
  const orphanCluster: ClusterFeedRow[] = [];

  for (const feed of feeds) {
    if (feed.clusterId) {
      const bucket = byCluster.get(feed.clusterId) ?? [];
      bucket.push(feed);
      byCluster.set(feed.clusterId, bucket);
    } else {
      orphanCluster.push(feed);
    }
  }

  const cards: Array<{ representative: ClusterFeedRow; members: ClusterFeedRow[] }> = [];

  for (const feed of orphanCluster) {
    cards.push({ representative: feed, members: [feed] });
  }

  for (const members of byCluster.values()) {
    if (members.length < 2) {
      for (const feed of members) cards.push({ representative: feed, members: [feed] });
      continue;
    }
    const sorted = [...members].sort((a, b) => b.rankScore - a.rankScore || b.publishTime.getTime() - a.publishTime.getTime());
    cards.push({ representative: pickClusterRepresentative(sorted), members: sorted.slice(0, 5) });
  }

  return cards;
}

export function toClusteredSummaries(
  cards: Array<{ representative: ClusterFeedRow; members: ClusterFeedRow[] }>
): FeedItemSummary[] {
  return cards.map(({ representative, members }) => {
    const summary = toFeedSummary(representative, members.length);
    return {
      ...summary,
      cluster_id: members.length >= 2 ? representative.clusterId : null,
      related_source_count: members.length,
      related_sources: members.map((row) => ({
        feed_item_id: row.id,
        title: row.title,
        source_name: row.source.name,
        source_url: row.sourceUrl,
        published_at: row.publishTime.toISOString()
      }))
    };
  });
}

export function sortClusterCards(
  cards: Array<{ representative: ClusterFeedRow; members: ClusterFeedRow[] }>,
  narrative?: string,
  interestScore?: (feed: ClusterFeedRow) => number
) {
  return [...cards].sort((a, b) => {
    const interestA = interestScore ? interestScore(a.representative) : 0;
    const interestB = interestScore ? interestScore(b.representative) : 0;
    const scoreA = effectiveFeedSortScore(a.representative, interestA, narrative);
    const scoreB = effectiveFeedSortScore(b.representative, interestB, narrative);
    return compareFeedsForTab(a.representative, b.representative, scoreA, scoreB);
  });
}

export function paginateClusterSummaries(items: FeedItemSummary[], limit: number, cursor?: string) {
  const start = cursor ? items.findIndex((row) => row.id === cursor) + 1 : 0;
  const page = items.slice(start, start + limit);
  const next = start + limit < items.length ? items[start + limit] : null;
  return { items: page, next_cursor: next?.id ?? null };
}

export function planClusterAssignments(feeds: ClusterFeedRow[]): Array<{ ids: string[]; clusterId: string }> {
  const buckets = new Map<string, ClusterFeedRow[]>();
  for (const feed of feeds) {
    const key = clusterBucketKey(feed);
    const list = buckets.get(key) ?? [];
    list.push(feed);
    buckets.set(key, list);
  }

  const plans: Array<{ ids: string[]; clusterId: string }> = [];
  for (const list of buckets.values()) {
    const sorted = [...list].sort((a, b) => b.rankScore - a.rankScore || b.publishTime.getTime() - a.publishTime.getTime());
    const slice = sorted.slice(0, 5);
    if (slice.length < 2 || uniqueSourceCount(slice) < 2) continue;
    plans.push({ ids: slice.map((row) => row.id), clusterId: randomUUID() });
  }
  return plans;
}

function uniqueSourceCount(feeds: ClusterFeedRow[]): number {
  return new Set(feeds.map((feed) => feed.source.name)).size;
}

/** Apply cluster_id and default representative (highest rank in plan.ids[0]). */
export async function applyClusterPlans(
  prisma: PrismaClient,
  plans: Array<{ ids: string[]; clusterId: string }>
): Promise<number> {
  let linked = 0;
  for (const plan of plans) {
    const leadId = plan.ids[0];
    if (!leadId) continue;
    await prisma.feedItem.updateMany({
      where: { id: { in: plan.ids } },
      data: { clusterId: plan.clusterId, isClusterLead: false }
    });
    await prisma.feedItem.update({
      where: { id: leadId },
      data: { isClusterLead: true }
    });
    linked += plan.ids.length;
  }
  return linked;
}

export const clusterFeedInclude = {
  source: { select: { name: true, contentLocale: true } },
  feedItemTokens: { include: { token: true } },
  feedItemNarratives: { include: { narrative: true } }
} satisfies Prisma.FeedItemInclude;
