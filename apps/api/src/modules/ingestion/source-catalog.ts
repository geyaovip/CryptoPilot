import type { ContentLocale } from "@prisma/client";

export type CatalogIngestKind = "rss" | "blockbeats_flash";

export type SourceCatalogEntry = {
  name: string;
  url: string;
  locale: ContentLocale;
  sourceWeight: number;
  ingest: CatalogIngestKind;
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
  }
];
