import type { FeedType } from "@prisma/client";

type ClassifiableFeed = {
  title: string;
  content: string;
  source: { name: string };
  sentiment?: string;
  feedItemNarratives?: { narrativeId: string }[];
  feedItemTokens?: { tokenId: string }[];
};

/** Long-form analytical sources that typically produce in-depth content. */
const ANALYTICAL_SOURCES = new Set([
  "Vitalik Blog",
  "Ethereum Foundation Blog",
  "CoinDesk",
  "Cointelegraph",
  "Cointelegraph 中文",
  "Decrypt",
  "The Block",
  "Polynya Paragraph",
  "EthDaily Paragraph",
  "ChainFeeds Mirror",
  "Aave Governance Forum",
  "Lido Blog",
  "Aave Mirror",
  "Optimism Mirror",
  "Safe Mirror"
]);

/** Title patterns indicating breaking / urgent news. */
const BREAKING_PATTERNS = [
  /(?:紧急|刚刚|突发|重磅|确认|宣布|批准|出台|通过|禁止|叫停|起诉|罚款|制裁|攻击|被盗|清算|破产|暂停|恢复|解锁)/,
  /(?:遭|被|将|拟)(?:采取|实施|收购|合并|注资|融资|上市)/,
  /(?:ETF|SEC|美联储|央行|监管|法院|稽查|空投|漏洞|黑客|安全事件|并购)/i,
  /(?:mainnet|testnet|hard.?fork|exploit|hacked|acqui|merger|IPO)/i
];

/** Title patterns indicating token price / market movement. */
const MARKET_PATTERNS = [
  /(?:涨|跌|突破|跌破|暴跌|暴涨|新高|新低|拉升|砸盘|插针|反弹|回调|震荡|异动)/,
  /(?:BTC|ETH|SOL|比特币|以太坊|Solana)\s*(?:突破|跌破|站上|失守|触及|达到)/,
  /(?:price|surge|plunge|all.time.high|ATH|all.time.low|rally|dump|crash)/i,
  /(?:行情|大幅|急剧)(?:异动|波动|拉升|下跌)/,
  /\d{1,3}%/
];

export function classifyFeedContentType(feed: ClassifiableFeed): FeedType {
  const narrativeCount = feed.feedItemNarratives?.length ?? 0;
  const tokenCount = feed.feedItemTokens?.length ?? 0;
  const contentLen = feed.content.length;
  const isAnalytical = ANALYTICAL_SOURCES.has(feed.source.name);
  const hasSentiment = !!feed.sentiment && feed.sentiment !== "NEUTRAL";

  // BREAKING: urgency keywords in title — classify first (highest specificity)
  if (BREAKING_PATTERNS.some((pat) => pat.test(feed.title))) return "BREAKING";

  // MARKET_MOVE: strong token / price indicators
  if (tokenCount >= 2 && MARKET_PATTERNS.some((pat) => pat.test(feed.title))) return "MARKET_MOVE";
  if (tokenCount >= 3) return "MARKET_MOVE";
  if (MARKET_PATTERNS.some((pat) => pat.test(feed.title)) && narrativeCount === 0) return "MARKET_MOVE";

  // NARRATIVE: deep / analytical content
  if (contentLen > 800 && narrativeCount >= 1) return "NARRATIVE";
  if (isAnalytical && narrativeCount >= 1) return "NARRATIVE";
  if (narrativeCount >= 2 && contentLen > 300) return "NARRATIVE";
  if (hasSentiment && narrativeCount >= 1 && contentLen > 400) return "NARRATIVE";

  // Fallback: generic flash / bulletin → NEWS
  return "NEWS";
}
