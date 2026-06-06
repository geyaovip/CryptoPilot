import { describe, expect, it } from "vitest";
import { extractSearchTerms, normalizeSearchQuery } from "./rag-search.util";

describe("rag-search.util", () => {
  it("strips trailing punctuation from queries", () => {
    expect(normalizeSearchQuery("比特币今天怎么样？")).toBe("比特币今天怎么样");
  });

  it("extracts CJK bigrams from long Chinese questions", () => {
    const terms = extractSearchTerms("BTC 今天的波动主要受哪些事件影响？");
    expect(terms).toContain("BTC");
    expect(terms.some((term) => term.includes("波动") || term.includes("今天"))).toBe(true);
  });

  it("keeps short Chinese phrases as whole terms", () => {
    expect(extractSearchTerms("比特币")).toEqual(["比特币"]);
  });
});
