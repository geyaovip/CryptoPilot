import { describe, expect, it, vi } from "vitest";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  it("defaults to insight list (V0.9)", async () => {
    const insightService = {
      list: vi.fn().mockResolvedValue({ entity: "insight", items: [], next_cursor: null })
    };
    const service = new FeedService({} as never, {} as never, insightService as never, {} as never);

    await service.list({ limit: 2 });

    expect(insightService.list).toHaveBeenCalled();
  });

  it("returns clustered feed_item list (V0.8 scheme B)", async () => {
    const rows = [
      {
        id: "f1",
        clusterId: "c1",
        title: "t1",
        content: "c",
        aiSummary: "s",
        sourceUrl: "https://a.com/1",
        publishTime: new Date(),
        sentiment: "NEUTRAL",
        heatScore: 50,
        rankScore: 50,
        type: "NEWS",
        status: "PUBLISHED",
        isPinned: false,
        source: { name: "A" },
        feedItemTokens: [],
        feedItemNarratives: []
      },
      {
        id: "f2",
        clusterId: "c1",
        title: "t2",
        content: "c",
        aiSummary: "s",
        sourceUrl: "https://b.com/2",
        publishTime: new Date(),
        sentiment: "NEUTRAL",
        heatScore: 40,
        rankScore: 40,
        type: "NEWS",
        status: "PUBLISHED",
        isPinned: false,
        source: { name: "B" },
        feedItemTokens: [],
        feedItemNarratives: []
      }
    ];
    const findMany = vi.fn().mockResolvedValue(rows);
    const userInterest = { loadContext: vi.fn().mockResolvedValue(null), scoreFeed: vi.fn().mockReturnValue(0) };
    const insightService = { list: vi.fn() };
    const service = new FeedService({ feedItem: { findMany } } as never, userInterest as never, insightService as never, {} as never);

    const result = await service.list({ limit: 10, entity: "feed_item", tab: "latest" });

    expect(result.entity).toBe("feed_item");
    if (result.entity !== "feed_item") throw new Error("Expected feed_item response");
    expect(result.aggregation).toBe("cluster");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].related_source_count).toBe(2);
  });
});
