import type { FeedItemSummary, MarketInsightSummary } from "@cryptopilot/types";
import { getFeed } from "./api";

export const SITEMAP_LIST_LIMIT = 50;
export const SITEMAP_MAX_FEED_ITEMS = 2000;
export const SITEMAP_MAX_INSIGHT_ITEMS = 500;

type CursorPage<T> = {
  items: T[];
  next_cursor: string | null;
};

export async function collectCursorPages<T extends { id: string }>(
  fetchPage: (cursor?: string) => Promise<CursorPage<T>>,
  maxItems: number
): Promise<T[]> {
  const seen = new Set<string>();
  const items: T[] = [];
  let cursor: string | undefined;

  while (items.length < maxItems) {
    const page = await fetchPage(cursor);
    if (!page.items.length) break;

    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      if (items.length >= maxItems) break;
    }

    if (!page.next_cursor) break;
    cursor = page.next_cursor;
  }

  return items;
}

export async function listSitemapFeedItems(): Promise<FeedItemSummary[]> {
  return collectCursorPages<FeedItemSummary>(
    async (cursor) => {
      const feed = await getFeed("latest", cursor, undefined, "feed_item", SITEMAP_LIST_LIMIT);
      return {
        items: feed.entity === "feed_item" ? (feed.items as FeedItemSummary[]) : [],
        next_cursor: feed.next_cursor
      };
    },
    SITEMAP_MAX_FEED_ITEMS
  );
}

export async function listSitemapInsights(): Promise<MarketInsightSummary[]> {
  return collectCursorPages<MarketInsightSummary>(
    async (cursor) => {
      const feed = await getFeed("latest", cursor, undefined, "insight", SITEMAP_LIST_LIMIT);
      return {
        items: feed.entity === "insight" ? (feed.items as MarketInsightSummary[]) : [],
        next_cursor: feed.next_cursor
      };
    },
    SITEMAP_MAX_INSIGHT_ITEMS
  );
}
