import "dotenv/config";
import { config } from "dotenv";
import { DEFAULT_PROMPT_CONTENT, MVP_PROMPT_KEYS } from "@cryptopilot/prompts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { SOURCE_CATALOG } from "../../src/modules/ingestion/source-catalog";

config({ path: "../../.env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const tokens = [
  ["BTC", "Bitcoin", "bitcoin"],
  ["ETH", "Ethereum", "ethereum"],
  ["SOL", "Solana", "solana"],
  ["BNB", "BNB", "binancecoin"],
  ["XRP", "XRP", "ripple"],
  ["DOGE", "Dogecoin", "dogecoin"],
  ["ADA", "Cardano", "cardano"],
  ["AVAX", "Avalanche", "avalanche-2"],
  ["LINK", "Chainlink", "chainlink"],
  ["TON", "Toncoin", "the-open-network"]
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

const settings: Array<[string, unknown]> = [
  ["ai_search_daily_limit", 30],
  ["feed_fetch_interval_seconds", 300],
  ["heat_score_source_weight", 0.4],
  ["heat_score_recency_weight", 0.6],
  ["telegram_push_daily_limit", 10],
  ["feature_flags", { ai_search: true, watchlist: true, pwa_install: true, telegram_push: false }]
];

export function nameToStableId(name: string): string {
  const hex = Buffer.from(name).toString("hex").padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function main() {
  // --- Sources ---
  for (const entry of SOURCE_CATALOG) {
    await prisma.source.upsert({
      where: { id: nameToStableId(entry.name) },
      update: {
        url: entry.url,
        status: entry.defaultActive === false ? "PAUSED" : "ACTIVE",
        contentLocale: entry.locale,
        sourceWeight: entry.sourceWeight,
        fetchIntervalSeconds: entry.fetchIntervalSeconds ?? 300
      },
      create: {
        id: nameToStableId(entry.name),
        name: entry.name,
        url: entry.url,
        type: entry.type ?? "RSS",
        status: entry.defaultActive === false ? "PAUSED" : "ACTIVE",
        contentLocale: entry.locale,
        fetchIntervalSeconds: entry.fetchIntervalSeconds ?? 300,
        sourceWeight: entry.sourceWeight
      }
    });
  }
  console.log(`Sources synced: ${SOURCE_CATALOG.length}`);

  // --- Tokens (create missing only, don't overwrite live prices) ---
  for (const [symbol, name, coingeckoId] of tokens) {
    await prisma.token.upsert({
      where: { symbol },
      update: { name, coingeckoId },
      create: { symbol, name, coingeckoId }
    });
  }
  console.log(`Tokens synced: ${tokens.length}`);

  // --- Narratives (upsert non-live fields only) ---
  const legacySlugs = ["etf-flow", "layer-2-scaling", "solana-ecosystem", "ai-crypto"];
  await prisma.narrative.updateMany({
    where: { slug: { in: legacySlugs } },
    data: { isActive: false }
  });
  for (const [name, slug, description] of narratives) {
    await prisma.narrative.upsert({
      where: { slug },
      update: { description, name, isActive: true },
      create: {
        name,
        slug,
        description,
        isActive: true,
        aiSummary: `${name} 叙事近期讨论升温，关注相关 Token 与新闻来源。`,
        heatScore: 50,
        trendScore24h: 0,
        trendScore7d: 0,
        feedCount24h: 0,
        sentiment: "NEUTRAL"
      }
    });
  }
  console.log(`Narratives synced: ${narratives.length}`);

  // --- KOLs ---
  for (const [name, handle, platform] of kols) {
    await prisma.kol.upsert({
      where: { platform_handle: { platform: platform as "TWITTER", handle } },
      update: { name, isActive: true },
      create: { name, handle, platform: platform as "TWITTER", influenceScore: 60, isActive: true }
    });
  }
  console.log(`KOLs synced: ${kols.length}`);

  // --- System Settings ---
  for (const [key, value] of settings) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { valueJson: value },
      create: { key, valueJson: value }
    });
  }
  console.log(`Settings synced: ${settings.length}`);

  // --- Prompts ---
  for (const promptKey of MVP_PROMPT_KEYS) {
    await prisma.prompt.upsert({
      where: { promptKey_version: { promptKey, version: 1 } },
      update: { content: DEFAULT_PROMPT_CONTENT[promptKey], status: "ACTIVE", deletedAt: null },
      create: { promptKey, version: 1, content: DEFAULT_PROMPT_CONTENT[promptKey], status: "ACTIVE" }
    });
  }
  console.log(`Prompts synced: ${MVP_PROMPT_KEYS.length}`);

  // --- Clean up orphan sources not in catalog ---
  const catalogNames = new Set(SOURCE_CATALOG.map((e) => e.name));
  const dbSources = await prisma.source.findMany({ where: { deletedAt: null } });
  let cleaned = 0;
  for (const s of dbSources) {
    if (!catalogNames.has(s.name)) {
      await prisma.source.update({ where: { id: s.id }, data: { deletedAt: new Date() } });
      cleaned += 1;
    }
  }
  if (cleaned > 0) console.log(`Cleaned orphan sources: ${cleaned}`);
}

main()
  .finally(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch((error) => { console.error(error); process.exitCode = 1; });
