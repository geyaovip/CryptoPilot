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

export function clusterBucketKey(feed: ClusterFeedRow): string | null {
  const topic = clusterTopicKey(feed);
  if (!topic) return null;
  const windowMs = 6 * 60 * 60 * 1000;
  const window = Math.floor(feed.publishTime.getTime() / windowMs);
  return `${topic}:${window}`;
}

export function clusterTopicKey(feed: ClusterFeedRow): string | null {
  const primary = pickPrimaryNarrative(feed);
  if (primary) return `narrative:${primary.slug}`;
  const token = feed.feedItemTokens[0]?.token.symbol;
  if (token) return `token:${token.toLowerCase()}`;
  return strongFallbackTopic(`${feed.title}\n${feed.content}`);
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
    if (!key) continue;
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

function strongFallbackTopic(text: string): string | null {
  const rules: Array<[RegExp, string]> = [
    [/bitcoin|btc|比特币/i, "topic:btc"],
    [/ethereum|eth|以太坊/i, "topic:eth"],
    [/solana|sol\b/i, "topic:solana"],
    [/stablecoin|稳定币|usdt|usdc/i, "topic:stablecoin"],
    [/\brwa\b|real.?world asset|tokeni[sz]|代币化/i, "topic:rwa"],
    [/\bai\b|artificial intelligence|人工智能|agent|模型/i, "topic:ai"],
    [/sec|监管|合规|法院|牌照|批准/i, "topic:regulation"],
    [/黑客|攻击|漏洞|安全|私钥|exploit|hack/i, "topic:security"],
    [/defi|借贷|dex|流动性/i, "topic:defi"],
    [/layer\s*2|\bl2\b|rollup|二层|扩容/i, "topic:layer2"]
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? null;
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
