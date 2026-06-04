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

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: [{ publishTime: "desc" }] }));
    expect(result.entity).toBe("feed_item");
    if (result.entity !== "feed_item") throw new Error("Expected feed_item response");
    expect(result.aggregation).toBe("cluster");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].related_source_count).toBe(2);
  });

  it("returns explainable market intelligence metrics for trending", async () => {
    const prisma = {
      $queryRawUnsafe: vi.fn().mockResolvedValue([
        { id: "n1", name: "AI", slug: "ai", heatScore: 80, trendScore24h: 12 },
        { id: "n2", name: "Meme", slug: "meme", heatScore: 50, trendScore24h: -6 }
      ]),
      token: {
        findMany: vi.fn().mockResolvedValue([
          { id: "btc", symbol: "BTC", name: "Bitcoin", priceUsd: 100, priceChange24h: -3.5 },
          { id: "eth", symbol: "ETH", name: "Ethereum", priceUsd: 50, priceChange24h: 1.2 },
          { id: "sol", symbol: "SOL", name: "Solana", priceUsd: 10, priceChange24h: 5.1 }
        ])
      },
      narrative: {},
      marketInsight: {
        aggregate: vi.fn().mockResolvedValue({ _avg: { heatScore: 66, heatVelocity: 21 }, _count: { id: 4 } }),
        findFirst: vi.fn().mockResolvedValue({
          primaryNarrative: { id: "n1", name: "AI", slug: "ai" }
        }),
        findMany: vi.fn().mockResolvedValue([
          { sentiment: "BEARISH", heatVelocity: 21, sourcesJson: [{}, {}] },
          { sentiment: "BEARISH", heatVelocity: 10, sourcesJson: [{}, {}] },
          { sentiment: "BEARISH", heatVelocity: 8, sourcesJson: [{}, {}] }
        ])
      }
    };
    const service = new FeedService(prisma as never, {} as never, {} as never, { getIndex: vi.fn().mockResolvedValue(null) } as never);

    const result = await service.trending();

    expect(prisma.token.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ displayOrder: "asc" }, { symbol: "asc" }]
    });
    expect(result.market_heat.breadth.advance_ratio).toBe(67);
    expect(result.market_heat.narrative_rotation.heating[0].name).toBe("AI");
    expect(result.market_heat.unusual_moves.map((item) => item.symbol)).toContain("SOL");
    expect(result.market_heat.risk_signals.map((item) => item.code)).toEqual(
      expect.arrayContaining(["major_drawdown", "bearish_insight", "high_velocity"])
    );
  });
});
