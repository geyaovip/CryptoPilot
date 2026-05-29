import type { FeedType, PrismaClient, Sentiment } from "@prisma/client";
import { isChineseContent } from "../../src/modules/ingestion/chinese-content.util";
import { ingestSourceItems } from "../../src/modules/ingestion/ingest-source.util";
import {
  applyClusterPlans,
  clusterFeedInclude,
  planClusterAssignments,
  type ClusterFeedRow
} from "../../src/modules/feed/feed-cluster.util";
import { pickPrimaryNarrative } from "../../src/modules/feed/feed-narrative.util";

const EXAMPLE_PREFIX = "https://example.com/";

const narrativeKeywords: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: "ai", patterns: [/\bai\b/i, /artificial intelligence/i, /infrastructure/i] },
  { slug: "meme", patterns: [/\bmeme\b/i, /dogecoin/i, /pepe/i] },
  { slug: "rwa", patterns: [/\brwa\b/i, /tokeniz/i, /real.?world asset/i] },
  { slug: "depin", patterns: [/\bdepin\b/i, /decentralized physical/i] },
  { slug: "stablecoin", patterns: [/\bstablecoin\b/i, /usdt/i, /usdc/i] },
  { slug: "layer2", patterns: [/\blayer\s*2\b/i, /\bl2\b/i, /rollup/i] },
  { slug: "solana", patterns: [/\bsolana\b/i, /\bsol\b/i] },
  { slug: "ethereum", patterns: [/\bethereum\b/i, /\beth\b/i] }
];

const tokenKeywords: Array<{ symbol: string; patterns: RegExp[] }> = [
  { symbol: "BTC", patterns: [/\bbitcoin\b/i, /\bbtc\b/i] },
  { symbol: "ETH", patterns: [/\bethereum\b/i, /\beth\b/i] },
  { symbol: "SOL", patterns: [/\bsolana\b/i, /\bsol\b/i] },
  { symbol: "BNB", patterns: [/\bbnb\b/i, /binance/i] },
  { symbol: "XRP", patterns: [/\bxrp\b/i, /ripple/i] },
  { symbol: "DOGE", patterns: [/\bdoge\b/i, /dogecoin/i] },
  { symbol: "LINK", patterns: [/\bchainlink\b/i, /\blink\b/i] }
];

export async function assignFeedClusters(prisma: PrismaClient) {
  await prisma.feedItem.updateMany({ data: { clusterId: null, isClusterLead: false } });
  const feeds = (await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: clusterFeedInclude,
    orderBy: { publishTime: "desc" },
    take: 500
  })) as ClusterFeedRow[];
  const plans = planClusterAssignments(feeds);
  const linked = await applyClusterPlans(prisma, plans);
  return { clusters: plans.length, linked };
}

export async function countRealPublishedFeeds(prisma: PrismaClient) {
  return prisma.feedItem.count({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      NOT: { sourceUrl: { startsWith: EXAMPLE_PREFIX } }
    }
  });
}

export async function purgeExampleContent(prisma: PrismaClient) {
  const now = new Date();
  const exampleFeeds = await prisma.feedItem.findMany({
    where: { sourceUrl: { startsWith: EXAMPLE_PREFIX }, deletedAt: null },
    select: { id: true }
  });
  const exampleIds = exampleFeeds.map((row) => row.id);

  if (exampleIds.length > 0) {
    await prisma.feedItem.updateMany({
      where: { id: { in: exampleIds } },
      data: { deletedAt: now, status: "DELETED", insightId: null }
    });
  }

  await prisma.marketInsight.updateMany({
    where: { deletedAt: null },
    data: { deletedAt: now, status: "DELETED" }
  });

  return { removed_feeds: exampleIds.length };
}

export async function ingestAllRssSources(prisma: PrismaClient, maxPerSource = 25) {
  const sources = await prisma.source.findMany({
    where: { type: "RSS", status: "ACTIVE", deletedAt: null }
  });

  let created = 0;
  let found = 0;

  for (const source of sources) {
    if (!source.url) continue;
    try {
      const result = await ingestSourceItems(prisma, source, maxPerSource, async (feedItemId, item) => {
        await attachHeuristicTags(prisma, feedItemId, item.title, item.content);
      });
      found += result.items_found;
      created += result.items_created;

      await prisma.source.update({
        where: { id: source.id },
        data: { lastSuccessAt: new Date(), errorMessage: null, status: "ACTIVE" }
      });
    } catch (error) {
      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastErrorAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "采集失败"
        }
      });
    }
  }

  return { sources: sources.length, items_found: found, items_created: created };
}

async function attachHeuristicTags(prisma: PrismaClient, feedItemId: string, title: string, content: string) {
  const text = `${title} ${content}`;
  for (const token of tokenKeywords) {
    if (!token.patterns.some((pattern) => pattern.test(text))) continue;
    const row = await prisma.token.findUnique({ where: { symbol: token.symbol } });
    if (!row) continue;
    await prisma.feedItemToken.upsert({
      where: { feedItemId_tokenId: { feedItemId, tokenId: row.id } },
      update: {},
      create: { feedItemId, tokenId: row.id }
    });
  }
  for (const narrative of narrativeKeywords) {
    if (!narrative.patterns.some((pattern) => pattern.test(text))) continue;
    const row = await prisma.narrative.findUnique({ where: { slug: narrative.slug } });
    if (!row) continue;
    await prisma.feedItemNarrative.upsert({
      where: { feedItemId_narrativeId: { feedItemId, narrativeId: row.id } },
      update: {},
      create: { feedItemId, narrativeId: row.id }
    });
  }
}

export async function backfillHeuristicTags(prisma: PrismaClient) {
  const feeds = await prisma.feedItem.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      NOT: { sourceUrl: { startsWith: EXAMPLE_PREFIX } }
    },
    select: {
      id: true,
      title: true,
      content: true,
      narrativeHook: true,
      source: { select: { contentLocale: true } }
    }
  });

  for (const feed of feeds) {
    await attachHeuristicTags(prisma, feed.id, feed.title, feed.content);
    if (
      !feed.narrativeHook?.trim() &&
      feed.source.contentLocale === "ZH" &&
      isChineseContent(feed.title)
    ) {
      await prisma.feedItem.update({
        where: { id: feed.id },
        data: { narrativeHook: feed.title.slice(0, 120) }
      });
    }
  }

  const withNarrative = await prisma.feedItem.count({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      feedItemNarratives: { some: {} },
      NOT: { sourceUrl: { startsWith: EXAMPLE_PREFIX } }
    }
  });

  return { feeds_processed: feeds.length, feeds_with_narrative: withNarrative };
}

export async function rebuildInsightsFromFeeds(prisma: PrismaClient) {
  await prisma.feedItem.updateMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    data: { insightId: null }
  });

  const feeds = await prisma.feedItem.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
      insightId: null,
      NOT: { sourceUrl: { startsWith: EXAMPLE_PREFIX } }
    },
    include: {
      source: true,
      feedItemTokens: { include: { token: true } },
      feedItemNarratives: { include: { narrative: true } }
    },
    orderBy: { publishTime: "desc" },
    take: 200
  });

  const groups = new Map<string, typeof feeds>();
  for (const feed of feeds) {
    const primary = pickPrimaryNarrative(feed);
    const tokenSymbol = feed.feedItemTokens[0]?.token.symbol;
    const key = primary?.slug ?? (tokenSymbol ? `token:${tokenSymbol}` : "general");
    const bucket = groups.get(key) ?? [];
    bucket.push(feed);
    groups.set(key, bucket);
  }

  const sortedGroups = [...groups.entries()].sort((a, b) => {
    const heatA = Math.max(...a[1].map((item) => item.heatScore));
    const heatB = Math.max(...b[1].map((item) => item.heatScore));
    return heatB - heatA;
  });

  let created = 0;
  for (const [, group] of sortedGroups) {
    if (group.length < 2) continue;

    const batch = group.slice(0, 5);
    const primary = pickPrimaryNarrative(batch[0]);
    const narrativeRow = primary
      ? batch[0].feedItemNarratives.find((row) => row.narrative.id === primary.id)?.narrative
      : undefined;
    const tokenLabel = batch[0].feedItemTokens[0]?.token.symbol;
    const heatScore = Math.max(...batch.map((item) => item.heatScore));
    const heatVelocity = narrativeRow
      ? Math.max(-10, Math.min(25, narrativeRow.trendScore24h))
      : 3;

    const label = primary?.name ?? (tokenLabel ? `${tokenLabel} 相关` : "市场");
    const headline = `${label} 雷达：${batch[0].title.slice(0, 72)}`;
    const summary = buildInsightSummary(label, batch);

    const sources = batch.map((signal) => ({
      feed_item_id: signal.id,
      title: signal.title,
      source_name: signal.source.name,
      source_url: signal.sourceUrl,
      published_at: signal.publishTime.toISOString()
    }));

    const insight = await prisma.marketInsight.create({
      data: {
        aiInsight: headline,
        aiSummary: summary,
        type: "NEWS" as FeedType,
        sentiment: (narrativeRow?.sentiment ?? "NEUTRAL") as Sentiment,
        heatScore,
        heatVelocity,
        heatLabel: heatVelocity >= 6 ? "HEATING_UP" : heatVelocity <= -3 ? "COOLING" : "STABLE",
        primaryNarrativeId: primary?.id ?? null,
        rankScore: heatScore + heatVelocity,
        sourcesJson: sources,
        keyReasons: buildInsightReasons(batch),
        marketImpact: "多来源信号正在指向同一主题，适合继续跟踪叙事热度、来源更新与后续数据变化。",
        status: "PUBLISHED",
        publishedAt: batch[0].publishTime
      }
    });

    await prisma.feedItem.updateMany({
      where: { id: { in: batch.map((item) => item.id) } },
      data: { insightId: insight.id }
    });
    created += 1;
  }

  return { insights_created: created };
}

function buildInsightSummary(label: string, batch: Array<{ title: string; aiSummary: string; source: { name: string } }>): string {
  const first = batch[0];
  const second = batch[1];
  const sourceNames = [...new Set(batch.map((signal) => signal.source.name))].slice(0, 3).join("、");
  const firstText = compactText(first.title, 48);
  const secondText = second ? `，并由「${compactText(second.title, 42)}」提供交叉背景` : "";
  return `${batch.length} 个来源（${sourceNames}）正在共同指向 ${label} 相关信号：「${firstText}」${secondText}。该总结用于快速理解多来源动态，不构成投资建议。`;
}

function buildInsightReasons(batch: Array<{ title: string; source: { name: string } }>): string[] {
  return batch.slice(0, 4).map((signal) => `${signal.source.name} 报道：${compactText(signal.title, 64)}`);
}

function compactText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}
