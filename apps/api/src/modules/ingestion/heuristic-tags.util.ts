import type { PrismaClient } from "@prisma/client";
import type { CleanRssItem } from "./rss-cleaner";

export type HeuristicTagCatalog = {
  tokens: Array<{ id: string; symbol: string; name: string }>;
  narratives: Array<{ id: string; slug: string; name: string }>;
};

const TOKEN_ALIASES: Record<string, RegExp[]> = {
  BTC: [/\bbitcoin\b/i, /\bbtc\b/i, /比特币/],
  ETH: [/\bethereum\b/i, /\beth\b/i, /以太坊/],
  SOL: [/\bsolana\b/i, /\bsol\b/i],
  BNB: [/\bbnb\b/i, /\bbinance\b/i, /币安/],
  XRP: [/\bxrp\b/i, /\bripple\b/i],
  DOGE: [/\bdogecoin\b/i, /\bdoge\b/i],
  ADA: [/\bcardano\b/i, /\bada\b/i],
  AVAX: [/\bavalanche\b/i, /\bavax\b/i],
  LINK: [/\bchainlink\b/i, /\$link\b/i],
  TON: [/\btoncoin\b/i, /\bthe open network\b/i, /\bton\b/i]
};

const NARRATIVE_ALIASES: Record<string, RegExp[]> = {
  ai: [/\bai\b/i, /artificial intelligence/i, /\bagents?\b/i, /人工智能|模型|算力/],
  meme: [/\bmeme\b/i, /dogecoin|pepe|shib|bonk/i, /土狗|迷因/],
  rwa: [/\brwa\b/i, /real.?world asset/i, /tokeni[sz]/i, /代币化|国债|美股|基金/],
  depin: [/\bdepin\b/i, /decentralized physical/i, /物理基础设施/],
  stablecoin: [/\bstablecoins?\b/i, /\busdt\b/i, /\busdc\b/i, /稳定币/],
  layer2: [/\blayer\s*2\b/i, /\bl2\b/i, /rollups?/i, /arbitrum|optimism|base|zkSync/i, /二层|扩容/],
  solana: [/\bsolana\b/i, /\bsol\b/i, /pump\.fun/i],
  ethereum: [/\bethereum\b/i, /\beth\b/i, /以太坊/]
};

export async function loadHeuristicTagCatalog(prisma: PrismaClient): Promise<HeuristicTagCatalog> {
  const [tokens, narratives] = await Promise.all([
    prisma.token.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, symbol: true, name: true }
    }),
    prisma.narrative.findMany({
      where: { deletedAt: null, isActive: true, mergedIntoId: null },
      select: { id: true, slug: true, name: true }
    })
  ]);
  return { tokens, narratives };
}

export function inferHeuristicTags(
  input: Pick<CleanRssItem, "title" | "content">,
  catalog: HeuristicTagCatalog
): { tokenIds: string[]; narrativeIds: string[] } {
  const text = `${input.title}\n${input.content}`;
  const tokenIds = catalog.tokens
    .filter((token) => matchesToken(text, token.symbol, token.name))
    .map((token) => token.id);
  const narrativeIds = catalog.narratives
    .filter((narrative) => matchesNarrative(text, narrative.slug, narrative.name))
    .map((narrative) => narrative.id);
  return { tokenIds, narrativeIds };
}

export async function attachHeuristicTags(
  prisma: PrismaClient,
  feedItemId: string,
  input: Pick<CleanRssItem, "title" | "content">,
  catalog?: HeuristicTagCatalog
): Promise<{ tokenCount: number; narrativeCount: number }> {
  const tagCatalog = catalog ?? (await loadHeuristicTagCatalog(prisma));
  const { tokenIds, narrativeIds } = inferHeuristicTags(input, tagCatalog);

  if (tokenIds.length > 0) {
    await prisma.feedItemToken.createMany({
      data: tokenIds.map((tokenId) => ({ feedItemId, tokenId })),
      skipDuplicates: true
    });
  }
  if (narrativeIds.length > 0) {
    await prisma.feedItemNarrative.createMany({
      data: narrativeIds.map((narrativeId) => ({ feedItemId, narrativeId })),
      skipDuplicates: true
    });
  }

  return { tokenCount: tokenIds.length, narrativeCount: narrativeIds.length };
}

function matchesToken(text: string, symbol: string, name: string): boolean {
  const patterns = TOKEN_ALIASES[symbol.toUpperCase()] ?? [wordPattern(symbol), wordPattern(name)];
  return patterns.some((pattern) => pattern.test(text));
}

function matchesNarrative(text: string, slug: string, name: string): boolean {
  const patterns = NARRATIVE_ALIASES[slug] ?? [wordPattern(slug), wordPattern(name)];
  return patterns.some((pattern) => pattern.test(text));
}

function wordPattern(value: string): RegExp {
  return new RegExp(`(^|[^a-zA-Z0-9])${escapeRegExp(value)}([^a-zA-Z0-9]|$)`, "i");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
