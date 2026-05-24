import { describe, expect, it, vi } from "vitest";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  it("defaults to insight list (V0.9)", async () => {
    const insightService = {
      list: vi.fn().mockResolvedValue({ entity: "insight", items: [], next_cursor: null })
    };
    const service = new FeedService({} as never, {} as never, insightService as never);

    await service.list({ limit: 2 });

    expect(insightService.list).toHaveBeenCalled();
  });

  it("supports legacy feed_item list", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const userInterest = { loadContext: vi.fn().mockResolvedValue(null), scoreFeed: vi.fn().mockReturnValue(0) };
    const insightService = { list: vi.fn() };
    const service = new FeedService({ feedItem: { findMany } } as never, userInterest as never, insightService as never);

    await service.list({ limit: "2" as unknown as number, entity: "feed_item", tab: "latest" });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 3 }));
    expect(insightService.list).not.toHaveBeenCalled();
  });
});
