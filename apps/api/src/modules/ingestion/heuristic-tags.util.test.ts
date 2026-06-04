import { describe, expect, it, vi } from "vitest";
import { attachHeuristicTags, inferHeuristicTags } from "./heuristic-tags.util";

const catalog = {
  tokens: [
    { id: "btc", symbol: "BTC", name: "Bitcoin" },
    { id: "eth", symbol: "ETH", name: "Ethereum" },
    { id: "link", symbol: "LINK", name: "Chainlink" }
  ],
  narratives: [
    { id: "rwa", slug: "rwa", name: "RWA" },
    { id: "stable", slug: "stablecoin", name: "Stablecoin" },
    { id: "ai", slug: "ai", name: "AI" }
  ]
};

describe("heuristic-tags.util", () => {
  it("infers token and narrative tags without an LLM call", () => {
    const tags = inferHeuristicTags(
      {
        title: "Bitcoin ETF inflows and RWA tokenization lead market focus",
        content: "USDC liquidity also improved across stablecoin rails."
      },
      catalog
    );

    expect(tags.tokenIds).toEqual(["btc"]);
    expect(tags.narrativeIds).toEqual(["rwa", "stable"]);
  });

  it("avoids broad LINK false positives", () => {
    const tags = inferHeuristicTags(
      {
        title: "Protocol link page update",
        content: "The article includes a link to documentation."
      },
      catalog
    );

    expect(tags.tokenIds).not.toContain("link");
  });

  it("writes deterministic relations with skipDuplicates", async () => {
    const createTokenLinks = vi.fn();
    const createNarrativeLinks = vi.fn();
    await attachHeuristicTags(
      {
        feedItemToken: { createMany: createTokenLinks },
        feedItemNarrative: { createMany: createNarrativeLinks }
      } as never,
      "feed-1",
      { title: "ETH AI agent update", content: "Ethereum builders discuss artificial intelligence agents." },
      catalog
    );

    expect(createTokenLinks).toHaveBeenCalledWith({
      data: [{ feedItemId: "feed-1", tokenId: "eth" }],
      skipDuplicates: true
    });
    expect(createNarrativeLinks).toHaveBeenCalledWith({
      data: [{ feedItemId: "feed-1", narrativeId: "ai" }],
      skipDuplicates: true
    });
  });
});
