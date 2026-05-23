import { describe, expect, it, vi } from "vitest";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  it("coerces string limit before pagination", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const userInterest = { loadContext: vi.fn().mockResolvedValue(null), scoreFeed: vi.fn().mockReturnValue(0) };
    const service = new FeedService({ feedItem: { findMany } } as never, userInterest as never);

    await service.list({ limit: "2" as unknown as number });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 3 }));
  });
});
