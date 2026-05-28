import "dotenv/config";
import { config } from "dotenv";
import { DEFAULT_PROMPT_CONTENT, MVP_PROMPT_KEYS } from "@cryptopilot/prompts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  assignFeedClusters,
  backfillHeuristicTags,
  countRealPublishedFeeds,
  ingestAllRssSources,
  purgeExampleContent,
  rebuildInsightsFromFeeds
} from "./lib/real-content";
import { SOURCE_CATALOG } from "../src/modules/ingestion/source-catalog";
import { Pool } from "pg";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const tokens = [
  ["BTC", "Bitcoin", "bitcoin", 104250, 2.4],
  ["ETH", "Ethereum", "ethereum", 3820, 1.7],
  ["SOL", "Solana", "solana", 172, 4.2],
  ["BNB", "BNB", "binancecoin", 690, 0.8],
  ["XRP", "XRP", "ripple", 2.42, -1.2],
  ["DOGE", "Dogecoin", "dogecoin", 0.24, 5.4],
  ["ADA", "Cardano", "cardano", 0.82, 1.1],
  ["AVAX", "Avalanche", "avalanche-2", 38, 3.8],
  ["LINK", "Chainlink", "chainlink", 18.4, 2.3],
  ["TON", "Toncoin", "the-open-network", 6.1, -0.6]
] as const;

const narratives = [
  ["AI", "ai", "AI 与加密基础设施、算力与应用叙事。"],
  ["Meme", "meme", "Meme 币与社区驱动行情。"],
  ["RWA", "rwa", "现实世界资产上链与合规叙事。"],
  ["DePIN", "depin", "去中心化物理基础设施网络。"],
  ["Stablecoin", "stablecoin", "稳定币监管、发行与流动性。"],
  ["Layer2", "layer2", "以太坊 Layer2 扩容与生态。"],
  ["Solana", "solana", "Solana 链上活跃度与应用。"],
  ["Ethereum", "ethereum", "以太坊主网升级与生态。"]
] as const;

const kols = [
  ["CoinDesk", "coindesk", "TWITTER"],
  ["Cointelegraph", "cointelegraph", "TWITTER"],
  ["Decrypt", "decrypt", "TWITTER"],
  ["The Block", "theblock", "TWITTER"],
  ["Wu Blockchain", "wublockchain", "TWITTER"]
] as const;

const extraUsers = [
  ["00000000-0000-0000-0000-000000000003", "beta1@cryptopilot.local", "Beta 用户 1"],
  ["00000000-0000-0000-0000-000000000004", "beta2@cryptopilot.local", "Beta 用户 2"]
] as const;

async function main() {
  const adminUserId = "00000000-0000-0000-0000-000000000001";
  const adminEmail = "admin@cryptopilot.local";
  const adminByEmail = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminByEmail && adminByEmail.id !== adminUserId) {
    await prisma.user.update({ where: { id: adminByEmail.id }, data: { email: null } });
  }
  await prisma.user.upsert({
    where: { id: adminUserId },
    update: { email: adminEmail, name: "管理员", role: "ADMIN", shortUid: "CP-A7K9Q2M4" },
    create: { id: adminUserId, shortUid: "CP-A7K9Q2M4", email: adminEmail, name: "管理员", role: "ADMIN" }
  });
  const demoUserId = "00000000-0000-0000-0000-000000000002";
  const demoEmail = "user@cryptopilot.local";
  const emailOwner = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (emailOwner && emailOwner.id !== demoUserId) {
    await prisma.user.update({ where: { id: emailOwner.id }, data: { email: null } });
  }
  await prisma.user.upsert({
    where: { id: demoUserId },
    update: { email: demoEmail, name: "示例用户", role: "USER", shortUid: "CP-D3X8N6P1" },
    create: { id: demoUserId, shortUid: "CP-D3X8N6P1", email: demoEmail, name: "示例用户", role: "USER" }
  });

  for (const [index, [id, email, name]] of extraUsers.entries()) {
    const shortUid = index === 0 ? "CP-B4T7L2Z9" : "CP-X6N3Q8R5";
    await prisma.user.upsert({
      where: { id },
      update: { email, name, role: "USER", shortUid },
      create: { id, email, name, role: "USER", shortUid }
    });
  }

  await Promise.all(
    SOURCE_CATALOG.map((entry) =>
      prisma.source.upsert({
        where: { id: nameToStableId(entry.name) },
        update: {
          url: entry.url,
          status: "ACTIVE",
          contentLocale: entry.locale,
          sourceWeight: entry.sourceWeight
        },
        create: {
          id: nameToStableId(entry.name),
          name: entry.name,
          url: entry.url,
          type: "RSS",
          status: "ACTIVE",
          contentLocale: entry.locale,
          fetchIntervalSeconds: 300,
          sourceWeight: entry.sourceWeight
        }
      })
    )
  );

  await Promise.all(
    tokens.map(([symbol, name, coingeckoId, priceUsd, priceChange24h]) =>
      prisma.token.upsert({
        where: { symbol },
        update: { priceUsd, priceChange24h },
        create: { symbol, name, coingeckoId, priceUsd, priceChange24h }
      })
    )
  );

  const legacySlugs = ["etf-flow", "layer-2-scaling", "solana-ecosystem", "ai-crypto"];
  await prisma.narrative.updateMany({
    where: { slug: { in: legacySlugs } },
    data: { isActive: false }
  });

  await Promise.all(
    narratives.map(([name, slug, description], index) =>
      prisma.narrative.upsert({
        where: { slug },
        update: {
          description,
          name,
          isActive: true,
          aiSummary: `${name} 叙事近期讨论升温，关注相关 Token 与新闻来源。`,
          heatScore: 70 + index * 2,
          trendScore24h: 12 + index,
          trendScore7d: 30 + index * 3,
          feedCount24h: 3 + (index % 4),
          sentiment: index % 3 === 0 ? "BULLISH" : index % 3 === 1 ? "NEUTRAL" : "BEARISH"
        },
        create: {
          name,
          slug,
          description,
          isActive: true,
          aiSummary: `${name} 叙事近期讨论升温，关注相关 Token 与新闻来源。`,
          heatScore: 70 + index * 2,
          trendScore24h: 12 + index,
          trendScore7d: 30 + index * 3,
          feedCount24h: 3 + (index % 4),
          sentiment: index % 3 === 0 ? "BULLISH" : index % 3 === 1 ? "NEUTRAL" : "BEARISH"
        }
      })
    )
  );

  await Promise.all(
    kols.map(([name, handle, platform]) =>
      prisma.kol.upsert({
        where: { platform_handle: { platform: platform as "TWITTER", handle } },
        update: { name, isActive: true },
        create: { name, handle, platform: platform as "TWITTER", influenceScore: 60, isActive: true }
      })
    )
  );

  await prisma.narrativeHeatSnapshot.deleteMany({});
  const narrativeRows = await prisma.narrative.findMany({ where: { deletedAt: null } });
  for (const narrative of narrativeRows) {
    for (let hours = 24; hours >= 0; hours -= 6) {
      await prisma.narrativeHeatSnapshot.create({
        data: {
          narrativeId: narrative.id,
          heatScore: Math.max(40, narrative.heatScore - hours),
          feedCount: Math.max(1, narrative.feedCount24h),
          twitterMentions: narrative.feedCount24h * 2,
          capturedAt: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      });
    }
  }

  if (process.env.SEED_SKIP_RSS !== "1") {
    console.log("Seed: 清理示例数据并采集真实 RSS…");
    const purged = await purgeExampleContent(prisma);
    const ingested = await ingestAllRssSources(prisma, 20);
    await backfillHeuristicTags(prisma);
    const insights = await rebuildInsightsFromFeeds(prisma);
    const clusters = await assignFeedClusters(prisma);
    const feedCount = await countRealPublishedFeeds(prisma);
    console.log(
      `Seed RSS: 移除示例 ${purged.removed_feeds} 条，新建 Feed ${ingested.items_created} 条，Insight ${insights.insights_created} 条，Feed 簇 ${clusters.clusters} 个，真实 Feed 共 ${feedCount} 条`
    );
    if (feedCount < 20) {
      console.warn("Seed: 真实 Feed 少于 20 条，请检查 RSS 网络或执行 cd apps/api && pnpm db:refresh-content");
    }
  }

  const settings: Array<[string, unknown]> = [
    ["ai_search_daily_limit", 30],
    ["feed_fetch_interval_seconds", 300],
    ["heat_score_source_weight", 0.4],
    ["heat_score_recency_weight", 0.6],
    ["telegram_push_daily_limit", 10],
    ["llm_provider", "moonshot"],
    [
      "feature_flags",
      { ai_search: true, watchlist: true, pwa_install: true, telegram_push: false }
    ]
  ];
  for (const [key, value] of settings) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { valueJson: value },
      create: { key, valueJson: value }
    });
  }

  for (const promptKey of MVP_PROMPT_KEYS) {
    await prisma.prompt.upsert({
      where: { promptKey_version: { promptKey, version: 1 } },
      update: { content: DEFAULT_PROMPT_CONTENT[promptKey], status: "ACTIVE", deletedAt: null },
      create: {
        promptKey,
        version: 1,
        content: DEFAULT_PROMPT_CONTENT[promptKey],
        status: "ACTIVE"
      }
    });
  }
}

function nameToStableId(name: string): string {
  const hex = Buffer.from(name).toString("hex").padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
