import Parser from "rss-parser";
import type { FeedType, PrismaClient, Sentiment } from "@prisma/client";
import {
  clusterFeedInclude,
  planClusterAssignments,
  type ClusterFeedRow
} from "../../src/modules/feed/feed-cluster.util";
import { pickPrimaryNarrative } from "../../src/modules/feed/feed-narrative.util";
import { cleanRssItems } from "../../src/modules/ingestion/rss-cleaner";
import { calculateHeatScore } from "../../src/modules/ingestion/heat-score";

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
  await prisma.feedItem.updateMany({ data: { clusterId: null } });
  const feeds = (await prisma.feedItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: clusterFeedInclude,
    orderBy: { publishTime: "desc" },
    take: 500
  })) as ClusterFeedRow[];
  const plans = planClusterAssignments(feeds);
  let linked = 0;
  for (const plan of plans) {
    await prisma.feedItem.updateMany({
      where: { id: { in: plan.ids } },
      data: { clusterId: plan.clusterId }
    });
    linked += plan.ids.length;
  }
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
  const parser = new Parser();
  const sources = await prisma.source.findMany({
    where: { type: "RSS", status: "ACTIVE", deletedAt: null }
  });

  let created = 0;
  let found = 0;

  for (const source of sources) {
    if (!source.url) continue;
    const startedAt = new Date();
    try {
      const feed = await parser.parseURL(source.url);
      const items = cleanRssItems(feed.items ?? [], startedAt).slice(0, maxPerSource);
      found += items.length;

      for (const item of items) {
        const existing = await prisma.feedItem.findUnique({ where: { sourceUrl: item.sourceUrl } });
        if (existing) continue;

        const heatScore = calculateHeatScore({
          publishTime: item.publishTime,
          sourceWeight: source.sourceWeight,
          tokenMoves: []
        });
        const summary = item.content.replace(/\s+/g, " ").trim().slice(0, 220);

        const row = await prisma.feedItem.create({
          data: {
            sourceId: source.id,
            title: item.title,
            content: item.content,
            aiSummary: summary || item.title,
            narrativeHook: null,
            sourceUrl: item.sourceUrl,
            publishTime: item.publishTime,
            heatScore,
            rankScore: heatScore,
            status: "PUBLISHED"
          }
        });

        await attachHeuristicTags(prisma, row.id, item.title, item.content);
        created += 1;
      }

      await prisma.source.update({
        where: { id: source.id },
        data: { lastSuccessAt: new Date(), errorMessage: null, status: "ACTIVE" }
      });
    } catch (error) {
      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastErrorAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "RSS 采集失败"
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
    select: { id: true, title: true, content: true }
  });

  for (const feed of feeds) {
    await attachHeuristicTags(prisma, feed.id, feed.title, feed.content);
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
    const summary = batch
      .map((signal) => signal.aiSummary)
      .join(" ")
      .slice(0, 280);

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
        keyReasons: batch.map((signal) => signal.title).slice(0, 3),
        marketImpact: "多来源报道同一主题线索，建议结合原文交叉阅读。",
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
