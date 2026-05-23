import { describe, expect, it } from "vitest";
import { UserInterestService } from "./user-interest.service";

describe("UserInterestService", () => {
  const service = new UserInterestService({} as never);

  it("returns zero for guests", () => {
    const score = service.scoreFeed(
      {
        feedItemTokens: [{ tokenId: "t1", token: { id: "t1" } }],
        feedItemNarratives: [{ narrativeId: "n1", narrative: { id: "n1" } }],
        source: { name: "CoinDesk" }
      } as never,
      null
    );
    expect(score).toBe(0);
  });

  it("weights token and narrative matches", () => {
    const score = service.scoreFeed(
      {
        feedItemTokens: [{ tokenId: "t1", token: { id: "t1" } }],
        feedItemNarratives: [{ narrativeId: "n1", narrative: { id: "n1" } }],
        source: { name: "Other" }
      } as never,
      { tokenIds: new Set(["t1"]), narrativeIds: new Set(["n1"]), kolHandles: new Set() }
    );
    expect(score).toBe(90);
  });
});
