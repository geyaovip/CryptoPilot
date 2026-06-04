import { describe, expect, it } from "vitest";
import {
  buildClusterCards,
  clusterBucketKey,
  pickClusterRepresentative,
  planClusterAssignments,
  toClusteredSummaries
} from "./feed-cluster.util";
import type { ClusterFeedRow } from "./feed-cluster.util";

function row(
  id: string,
  clusterId: string | null,
  slug: string,
  rank: number,
  isClusterLead = false,
  sourceName = "CoinDesk"
): ClusterFeedRow {
  const publishTime = new Date("2026-05-25T10:00:00Z");
  return {
    id,
    clusterId,
    isClusterLead,
    title: `title-${id}`,
    content: "c",
    aiSummary: "s",
    sourceUrl: `https://example.com/${id}`,
    publishTime,
    sentiment: "NEUTRAL",
    heatScore: rank,
    rankScore: rank,
    type: "NEWS",
    status: "PUBLISHED",
    isPinned: false,
    source: { name: sourceName },
    feedItemTokens: [],
    feedItemNarratives: [
      {
        narrativeId: "n1",
        narrative: { id: "n1", name: slug, slug, heatScore: 50, weight: 50 }
      }
    ]
  };
}

describe("feed-cluster.util", () => {
  it("merges cluster members into one card", () => {
    const cards = buildClusterCards([row("a", "c1", "ai", 10), row("b", "c1", "ai", 8)]);
    const summaries = toClusteredSummaries(cards);
    expect(summaries).toHaveLength(1);
    expect(summaries[0].related_source_count).toBe(2);
    expect(summaries[0].cluster_id).toBe("c1");
  });

  it("prefers admin-selected cluster lead", () => {
    const members = [row("a", "c1", "ai", 90), row("b", "c1", "ai", 50, true)];
    expect(pickClusterRepresentative(members).id).toBe("b");
    const cards = buildClusterCards(members);
    expect(cards[0].representative.id).toBe("b");
  });

  it("plans clusters for same narrative window", () => {
    const plans = planClusterAssignments([row("a", null, "ai", 10), row("b", null, "ai", 8, false, "PANews")]);
    expect(plans).toHaveLength(1);
    expect(plans[0].ids).toHaveLength(2);
  });

  it("does not plan a cluster from one source only", () => {
    const plans = planClusterAssignments([row("a", null, "ai", 10), row("b", null, "ai", 8)]);
    expect(plans).toHaveLength(0);
  });

  it("does not cluster untagged generic market items", () => {
    const first = row("a", null, "ai", 10);
    first.feedItemNarratives = [];
    first.title = "Crypto market update";
    first.content = "Traders wait for the next macro data release.";
    const second = row("b", null, "ai", 8, false, "PANews");
    second.feedItemNarratives = [];
    second.title = "Market digest";
    second.content = "Several assets moved during the Asian session.";

    expect(clusterBucketKey(first)).toBeNull();
    expect(planClusterAssignments([first, second])).toHaveLength(0);
  });

  it("can cluster untagged items only when a strong fallback topic matches", () => {
    const first = row("a", null, "ai", 10);
    first.feedItemNarratives = [];
    first.title = "Bitcoin ETF inflows rise";
    const second = row("b", null, "ai", 8, false, "PANews");
    second.feedItemNarratives = [];
    second.title = "BTC funds extend inflow streak";

    expect(planClusterAssignments([first, second])).toHaveLength(1);
  });
});
