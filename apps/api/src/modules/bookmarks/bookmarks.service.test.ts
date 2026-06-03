import { describe, expect, it, vi } from "vitest";
import { BookmarksService } from "./bookmarks.service";

describe("BookmarksService", () => {
  it("omits bookmarked insights that do not have enough sources for detail view", async () => {
    const prisma = {
      bookmark: {
        findMany: vi.fn().mockResolvedValue([
          { entityType: "insight", entityId: "i1", feedItem: null },
          { entityType: "insight", entityId: "i2", feedItem: null }
        ])
      },
      marketInsight: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "i1",
            aiInsight: "single source",
            aiSummary: "summary",
            type: "NEWS",
            sentiment: "NEUTRAL",
            heatScore: 50,
            heatVelocity: 0,
            heatLabel: "STABLE",
            rankScore: 50,
            sourcesJson: [{ feed_item_id: "f1", source_name: "A", source_url: "https://a.com" }],
            keyReasons: [],
            marketImpact: null,
            createdAt: new Date(),
            primaryNarrative: null,
            signals: []
          },
          {
            id: "i2",
            aiInsight: "multi source",
            aiSummary: "summary",
            type: "NEWS",
            sentiment: "NEUTRAL",
            heatScore: 60,
            heatVelocity: 0,
            heatLabel: "STABLE",
            rankScore: 60,
            sourcesJson: [
              { feed_item_id: "f1", source_name: "A", source_url: "https://a.com" },
              { feed_item_id: "f2", source_name: "B", source_url: "https://b.com" }
            ],
            keyReasons: [],
            marketImpact: null,
            createdAt: new Date(),
            primaryNarrative: null,
            signals: []
          }
        ])
      }
    };

    const service = new BookmarksService(prisma as never);
    const result = await service.list("u1");

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.item.id).toBe("i2");
  });
});
