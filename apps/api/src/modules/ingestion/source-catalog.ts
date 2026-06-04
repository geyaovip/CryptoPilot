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
    name: "Flashbots Medium",
    url: "https://medium.com/feed/flashbots",
    locale: "EN",
    sourceWeight: 56,
    ingest: "rss"
  },
  {
    name: "Dragonfly Research Medium",
    url: "https://medium.com/feed/dragonfly-research",
    locale: "EN",
    sourceWeight: 54,
    ingest: "rss"
  },
  {
    name: "The Crypto Times Medium",
    url: "https://medium.com/feed/the-crypto-times",
    locale: "EN",
    sourceWeight: 48,
    ingest: "rss"
  },
  {
    name: "a16z crypto Substack",
    url: "https://a16zcrypto.substack.com/feed",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Messari Substack",
    url: "https://messari.substack.com/feed",
    locale: "EN",
    sourceWeight: 56,
    ingest: "rss"
  },
  {
    name: "Milk Road Substack",
    url: "https://milkroad.substack.com/feed",
    locale: "EN",
    sourceWeight: 48,
    ingest: "rss"
  },
  {
    name: "Compound Finance Medium",
    url: "https://medium.com/feed/compound-finance",
    locale: "EN",
    sourceWeight: 52,
    ingest: "rss"
  },
  {
    name: "Arbitrum Foundation Medium",
    url: "https://arbitrumfoundation.medium.com/feed",
    locale: "EN",
    sourceWeight: 54,
    ingest: "rss"
  },
  {
    name: "IOSG Ventures Medium",
    url: "https://medium.com/feed/iosg-ventures",
    locale: "EN",
    sourceWeight: 52,
    ingest: "rss"
  },
  {
    name: "1kx Medium",
    url: "https://medium.com/feed/1kxnetwork",
    locale: "EN",
    sourceWeight: 50,
    ingest: "rss"
  },
  {
    name: "Gnosis Medium",
    url: "https://medium.com/feed/gnosis-pm",
    locale: "EN",
    sourceWeight: 50,
    ingest: "rss"
  },
  {
    name: "NEAR Protocol Medium",
    url: "https://medium.com/feed/nearprotocol",
    locale: "EN",
    sourceWeight: 48,
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
    name: "Bankless",
    url: "https://www.bankless.com/feed",
    locale: "EN",
    sourceWeight: 55,
    ingest: "rss",
    defaultActive: false
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
    name: "BTC Study",
    url: "https://www.btcstudy.org/atom.xml",
    locale: "ZH",
    sourceWeight: 62,
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
    name: "Optimism Collective Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40the-optimism-collective",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "Base Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40base",
    locale: "EN",
    sourceWeight: 58,
    ingest: "rss"
  },
  {
    name: "EigenLayer Paragraph",
    url: "https://api.paragraph.com/blogs/rss/%40eigenlayer",
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
