import { describe, expect, it } from "vitest";
import {
  buildClusterCards,
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
  isClusterLead = false
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
    source: { name: "CoinDesk" },
    feedItemTokens: [],
    feedItemNarratives: [
      {
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
    const plans = planClusterAssignments([row("a", null, "ai", 10), row("b", null, "ai", 8)]);
    expect(plans).toHaveLength(1);
    expect(plans[0].ids).toHaveLength(2);
  });
});
