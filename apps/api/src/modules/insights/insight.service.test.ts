import { describe, expect, it, vi } from "vitest";
import { InsightService } from "./insight.service";

function insight(id: string, slug: string, rankScore: number) {
  return {
    id,
    aiInsight: `洞察 ${id}`,
    aiSummary: `摘要 ${id}`,
    type: "NEWS",
    sentiment: "NEUTRAL",
    heatScore: rankScore,
    heatVelocity: 0,
    heatLabel: "STABLE",
    rankScore,
    sourcesJson: [
      { feed_item_id: `${id}-1`, title: "来源一", source_name: "PANews", source_url: `https://a.com/${id}`, published_at: new Date().toISOString() },
      { feed_item_id: `${id}-2`, title: "来源二", source_name: "CoinDesk", source_url: `https://b.com/${id}`, published_at: new Date().toISOString() }
    ],
    keyReasons: [],
    marketImpact: null,
    createdAt: new Date("2026-06-04T08:00:00.000Z"),
    publishedAt: new Date("2026-06-04T08:00:00.000Z"),
    primaryNarrative: { id: slug, name: slug, slug },
    signals: []
  };
}

describe("InsightService", () => {
  it("diversifies the default insight list across narratives", async () => {
    const findMany = vi.fn().mockResolvedValue([
      insight("rwa-1", "rwa", 100),
      insight("rwa-2", "rwa", 98),
      insight("rwa-3", "rwa", 96),
      insight("ai-1", "ai", 80)
    ]);
    const service = new InsightService(
      {
        marketInsight: {
          findMany
        }
      } as never,
      { loadContext: vi.fn().mockResolvedValue(null) } as never
    );

    const result = await service.list({ limit: 4 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 16 }));
    expect(result.items.map((item) => item.id)).toEqual(["rwa-1", "ai-1", "rwa-2", "rwa-3"]);
  });

  it("orders the latest tab by published time instead of update time", async () => {
    const findMany = vi.fn().mockResolvedValue([insight("latest-1", "rwa", 100)]);
    const service = new InsightService(
      {
        marketInsight: {
          findMany
        }
      } as never,
      { loadContext: vi.fn().mockResolvedValue(null) } as never
    );

    await service.list({ limit: 1, tab: "latest" });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: [{ publishedAt: "desc" }] }));
  });
});
