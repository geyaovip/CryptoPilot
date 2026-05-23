import { describe, expect, it, vi } from "vitest";
import { AdminFeedService } from "./admin-feed.service";

describe("AdminFeedService", () => {
  it("applies feed filters when listing", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new AdminFeedService({ feedItem: { findMany } } as never, {
      queueGeneration: vi.fn()
    } as never);

    await service.list({ status: "hidden", type: "news", source_id: "source-1" });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "HIDDEN",
          type: "NEWS",
          sourceId: "source-1"
        })
      })
    );
  });
});
