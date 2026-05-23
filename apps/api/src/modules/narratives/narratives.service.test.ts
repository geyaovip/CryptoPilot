import { describe, expect, it, vi } from "vitest";
import { NarrativesService } from "./narratives.service";

describe("NarrativesService list sorting", () => {
  it("uses hottest order by default", async () => {
    const prisma = {
      narrative: {
        findMany: vi.fn().mockResolvedValue([
          { id: "1", name: "A", slug: "a", heatScore: 10, trendScore24h: 1, trendScore7d: 1, feedCount24h: 1, aiSummary: null, sentiment: "NEUTRAL" },
          { id: "2", name: "B", slug: "b", heatScore: 90, trendScore24h: 2, trendScore7d: 2, feedCount24h: 2, aiSummary: null, sentiment: "BULLISH" }
        ])
      },
      watchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
      feedItemToken: { findMany: vi.fn().mockResolvedValue([]) }
    };
    const metrics = { refreshAll: vi.fn().mockResolvedValue(undefined) };
    const service = new NarrativesService(prisma as never, metrics as never);
    const result = await service.list({}, undefined);
    expect(result.items[0]?.slug).toBe("a");
    expect(prisma.narrative.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ heatScore: "desc" }, { trendScore24h: "desc" }] })
    );
  });
});
