import type { ContentLocale, SourceType } from "@prisma/client";

export type CatalogIngestKind = "rss" | "blockbeats_flash" | "reddit";

export type SourceCatalogEntry = {
  name: string;
  url: string;
  type?: SourceType;
  locale: ContentLocale;
  sourceWeight: number;
  ingest: CatalogIngestKind;
  fetchIntervalSeconds?: number;
  /** Pause low-priority overseas feeds by default in new seeds. */
  defaultActive?: boolean;
};

/** Curated for Chinese readers; overseas feeds kept at lower weight. */
export const SOURCE_CATALOG: SourceCatalogEntry[] = [
  {
    name: "律动 BlockBeats",
    url: "https://api.theblockbeats.news/v1/open-api/open-flash",
    locale: "ZH",
    sourceWeight: 88,
    ingest: "blockbeats_flash"
  },
  {
    name: "PANews",
    url: "https://www.panewslab.com/rss.xml?type=NEWS&lang=zh",
    locale: "ZH",
    sourceWeight: 82,
    ingest: "rss"
  },
  {
    name: "Cointelegraph 中文",
    url: "https://cointelegraph-cn.com/rss",
    locale: "ZH",
    sourceWeight: 68,
    ingest: "rss"
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    locale: "EN",
    sourceWeight: 38,
    ingest: "rss"
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    locale: "EN",
    sourceWeight: 38,
    ingest: "rss"
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    locale: "EN",
    sourceWeight: 35,
    ingest: "rss"
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    locale: "EN",
    sourceWeight: 35,
    ingest: "rss"
  },
  {
    name: "Ethereum Foundation Blog",
    url: "https://blog.ethereum.org/feed.xml",
    locale: "EN",
    sourceWeight: 62,
    ingest: "rss"
  },
  {
    name: "a16z crypto Medium",
    url: "https://medium.com/feed/a16zcrypto",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Vitalik Blog",
    url: "https://vitalik.eth.limo/feed.xml",
    locale: "EN",
    sourceWeight: 66,
    ingest: "rss"
  },
  {
    name: "Bankless Substack",
    url: "https://bankless.substack.com/feed",
    locale: "EN",
    sourceWeight: 55,
    ingest: "rss"
  },
  {
    name: "Lido Blog",
    url: "https://blog.lido.fi/rss/",
    locale: "EN",
    sourceWeight: 54,
    ingest: "rss"
  },
  {
    name: "Aave Governance Forum",
    url: "https://governance.aave.com/posts.rss",
    locale: "EN",
    sourceWeight: 56,
    ingest: "rss"
  },
  {
    name: "Aave Mirror",
    url: "https://aave.mirror.xyz/feed/atom",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Optimism Mirror",
    url: "https://optimism.mirror.xyz/feed/atom",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Safe Mirror",
    url: "https://safe.mirror.xyz/feed/atom",
    locale: "EN",
    sourceWeight: 54,
    ingest: "rss"
  },
  {
    name: "ChainFeeds Mirror",
    url: "https://mirror.xyz/chainfeeds.eth/feed/atom",
    locale: "ZH",
    sourceWeight: 64,
    ingest: "rss"
  },
  {
    name: "EthDaily Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40ethdaily",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Polynya Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40polynya",
    locale: "EN",
    sourceWeight: 60,
    ingest: "rss"
  },
  {
    name: "ZKsync Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40zksync",
    locale: "EN",
    sourceWeight: 56,
    ingest: "rss"
  },
  {
    name: "r/CryptoCurrency",
    url: "https://oauth.reddit.com/r/CryptoCurrency",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 48,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  },
  {
    name: "r/Bitcoin",
    url: "https://oauth.reddit.com/r/Bitcoin",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 50,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  },
  {
    name: "r/ethereum",
    url: "https://oauth.reddit.com/r/ethereum",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 50,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  },
  {
    name: "r/solana",
    url: "https://oauth.reddit.com/r/solana",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 45,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  },
  {
    name: "r/ethfinance",
    url: "https://oauth.reddit.com/r/ethfinance",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 45,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  },
  {
    name: "r/CryptoMarkets",
    url: "https://oauth.reddit.com/r/CryptoMarkets",
    type: "REDDIT",
    locale: "EN",
    sourceWeight: 42,
    ingest: "reddit",
    fetchIntervalSeconds: 600,
    defaultActive: false
  }
];
