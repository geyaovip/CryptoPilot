import "dotenv/config";
import { config } from "dotenv";
import { DEFAULT_PROMPT_CONTENT, MVP_PROMPT_KEYS } from "@cryptopilot/prompts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const rssSources = [
  ["CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/"],
  ["Cointelegraph", "https://cointelegraph.com/rss"],
  ["Decrypt", "https://decrypt.co/feed"],
  ["The Block", "https://www.theblock.co/rss.xml"]
] as const;

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
    update: { email: adminEmail, name: "管理员", role: "ADMIN" },
    create: { id: adminUserId, email: adminEmail, name: "管理员", role: "ADMIN" }
  });
  const demoUserId = "00000000-0000-0000-0000-000000000002";
  const demoEmail = "user@cryptopilot.local";
  const emailOwner = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (emailOwner && emailOwner.id !== demoUserId) {
    await prisma.user.update({ where: { id: emailOwner.id }, data: { email: null } });
  }
  await prisma.user.upsert({
    where: { id: demoUserId },
    update: { email: demoEmail, name: "示例用户", role: "USER" },
    create: { id: demoUserId, email: demoEmail, name: "示例用户", role: "USER" }
  });

  for (const [id, email, name] of extraUsers) {
    await prisma.user.upsert({
      where: { id },
      update: { email, name, role: "USER" },
      create: { id, email, name, role: "USER" }
    });
  }

  const sourceRecords = await Promise.all(
    rssSources.map(([name, url]) =>
      prisma.source.upsert({
        where: { id: nameToStableId(name) },
        update: { url, status: "ACTIVE" },
        create: {
          id: nameToStableId(name),
          name,
          url,
          type: "RSS",
          status: "ACTIVE",
          fetchIntervalSeconds: 300,
          sourceWeight: 50
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

  await createFeed(sourceRecords[0].id, "BTC ETF 资金流继续支撑市场风险偏好", "https://example.com/feed/btc-etf-flow", ["BTC"], ["ethereum", "stablecoin"], 86);
  await createFeed(sourceRecords[1].id, "ETH Layer 2 活跃度回升，费用保持低位", "https://example.com/feed/eth-l2-activity", ["ETH"], ["layer2", "ethereum"], 74);
  await createFeed(sourceRecords[2].id, "Solana 生态交易量走高，市场关注 Meme 与 DeFi", "https://example.com/feed/solana-activity", ["SOL"], ["solana", "meme"], 82);
  await createFeed(sourceRecords[3].id, "AI Crypto 板块出现轮动，资金关注基础设施项目", "https://example.com/feed/ai-crypto-rotation", ["LINK"], ["ai", "depin"], 68);

  const feedTopics = [
    "稳定币监管讨论升温",
    "RWA 代币化试点扩大",
    "DePIN 网络节点增长",
    "Meme 币波动加剧",
    "Layer2 费用竞争",
    "以太坊质押收益率变化",
    "比特币减半后矿工收入",
    "链上 DEX 交易量回升",
    "NFT 市场流动性低迷",
    "跨链桥安全事件回顾",
    "央行数字货币试点进展",
    "加密 ETF 净流入数据",
    "山寨币轮动信号",
    "宏观利率预期影响风险资产",
    "交易所储备变化",
    "鲸鱼地址异动监测"
  ];
  for (let i = 0; i < feedTopics.length; i += 1) {
    const source = sourceRecords[i % sourceRecords.length];
    const slug = narratives[i % narratives.length][1];
    const symbol = tokens[i % tokens.length][0];
    await createFeed(
      source.id,
      feedTopics[i],
      `https://example.com/feed/v06-sample-${i + 1}`,
      [symbol],
      [slug],
      55 + (i % 30)
    );
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

async function createFeed(sourceId: string, title: string, sourceUrl: string, tokenSymbols: string[], narrativeSlugs: string[], heatScore: number) {
  const content = `${title}。这是 V0.2 的示例 Feed 内容，用于验证首页、详情页、排序和后台管理流程。真实 RSS 采集会写入同样的数据结构。`;
  const feed = await prisma.feedItem.upsert({
    where: { sourceUrl },
    update: { title, content, aiSummary: content.slice(0, 160), heatScore, rankScore: heatScore },
    create: {
      sourceId,
      title,
      content,
      aiSummary: content.slice(0, 160),
      sourceUrl,
      heatScore,
      rankScore: heatScore,
      publishTime: new Date()
    }
  });

  for (const symbol of tokenSymbols) {
    const token = await prisma.token.findUnique({ where: { symbol } });
    if (token) {
      await prisma.feedItemToken.upsert({
        where: { feedItemId_tokenId: { feedItemId: feed.id, tokenId: token.id } },
        update: {},
        create: { feedItemId: feed.id, tokenId: token.id }
      });
    }
  }

  for (const slug of narrativeSlugs) {
    const narrative = await prisma.narrative.findUnique({ where: { slug } });
    if (narrative) {
      await prisma.feedItemNarrative.upsert({
        where: { feedItemId_narrativeId: { feedItemId: feed.id, narrativeId: narrative.id } },
        update: {},
        create: { feedItemId: feed.id, narrativeId: narrative.id }
      });
    }
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
