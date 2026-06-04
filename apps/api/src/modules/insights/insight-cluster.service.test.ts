import { describe, expect, it, vi } from "vitest";
import { InsightClusterService } from "./insight-cluster.service";

function signal(id: string, sourceId: string, sourceName: string, rankScore = 70) {
  return {
    id,
    sourceId,
    title: `BTC market signal ${id}`,
    content: "Bitcoin ETF market update",
    sourceUrl: `https://example.com/${id}`,
    publishTime: new Date("2026-06-04T08:00:00.000Z"),
    type: "NEWS",
    heatScore: rankScore,
    rankScore,
    source: { id: sourceId, name: sourceName },
    feedItemTokens: [],
    feedItemNarratives: []
  };
}

describe("InsightClusterService cost gates", () => {
  it("does not synthesize weak groups below the signal threshold", async () => {
    const synthesize = vi.fn();
    const service = new InsightClusterService(
      {
        feedItem: { findMany: vi.fn().mockResolvedValue([signal("a", "s1", "PANews"), signal("b", "s2", "CoinDesk")]) },
        marketInsight: { findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() }
      } as never,
      { synthesize } as never,
      { enabled: true } as never,
      { get: vi.fn() } as never
    );

    await expect(service.clusterPending(3)).resolves.toBe(0);
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("synthesizes only qualified multi-source groups", async () => {
    const synthesize = vi.fn().mockResolvedValue(true);
    const updateMany = vi.fn();
    const service = new InsightClusterService(
      {
        feedItem: {
          findMany: vi
            .fn()
            .mockResolvedValue([signal("a", "s1", "PANews"), signal("b", "s2", "CoinDesk"), signal("c", "s1", "PANews")]),
          updateMany
        },
        marketInsight: {
          findFirst: vi.fn(),
          create: vi.fn().mockResolvedValue({ id: "insight-1" }),
          delete: vi.fn()
        }
      } as never,
      { synthesize } as never,
      { enabled: true } as never,
      { get: vi.fn() } as never
    );

    await expect(service.clusterPending(3)).resolves.toBe(1);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { insightId: "insight-1" } })
    );
    expect(synthesize).toHaveBeenCalledWith("insight-1");
  });
});
