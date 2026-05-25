import { describe, expect, it, vi } from "vitest";
import { AdminFeedService } from "./admin-feed.service";

describe("AdminFeedService", () => {
  it("applies feed filters when listing", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const service = new AdminFeedService(
      { feedItem: { findMany, count } } as never,
      { queueGeneration: vi.fn() } as never,
      { log: vi.fn() } as never
    );

    await service.list({ status: "hidden", type: "news", source_id: "source-1" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "HIDDEN",
          type: "NEWS",
          sourceId: "source-1"
        }),
        skip: 0,
        take: 25
      })
    );
  });

  it("returns total and page metadata", async () => {
    const rows = Array.from({ length: 17 }, (_, index) => ({
      id: `feed-${25 + index}`,
      title: "t",
      content: "c",
      aiSummary: "s",
      sourceUrl: "https://example.com/a",
      publishTime: new Date(),
      sentiment: "NEUTRAL",
      heatScore: 50,
      type: "NEWS",
      status: "PUBLISHED",
      isPinned: false,
      source: { name: "CoinDesk" },
      feedItemTokens: [],
      feedItemNarratives: []
    }));
    const findMany = vi.fn().mockResolvedValue(rows);
    const count = vi.fn().mockResolvedValue(42);
    const service = new AdminFeedService(
      { feedItem: { findMany, count } } as never,
      { queueGeneration: vi.fn() } as never,
      { log: vi.fn() } as never
    );

    const result = await service.list({ page: 2, limit: 25 });

    expect(result.items).toHaveLength(17);
    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(result.total_pages).toBe(2);
    expect(result.has_prev).toBe(true);
    expect(result.has_next).toBe(false);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 25, take: 25 }));
  });
});
