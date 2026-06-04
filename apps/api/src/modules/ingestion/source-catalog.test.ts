import { describe, expect, it } from "vitest";
import { SOURCE_CATALOG } from "./source-catalog";

describe("SOURCE_CATALOG", () => {
  it("does not include Mirror feeds because they hit rate limits in the API ingestion runtime", () => {
    const urls = SOURCE_CATALOG.map((source) => source.url.toLowerCase());

    expect(urls.some((url) => url.includes("mirror.xyz"))).toBe(false);
  });

  it("keeps curated Substack, Medium, and Paragraph sources for research-heavy coverage", () => {
    const substackSources = SOURCE_CATALOG.filter((source) => source.url.includes("substack.com"));
    const mediumSources = SOURCE_CATALOG.filter((source) => source.url.includes("medium.com"));
    const paragraphSources = SOURCE_CATALOG.filter((source) => source.url.includes("api.paragraph.com"));

    expect(substackSources.map((source) => source.name)).toEqual(
      expect.arrayContaining(["a16z crypto Substack", "Messari Substack", "Milk Road Substack"])
    );
    expect(substackSources.every((source) => source.defaultActive !== false)).toBe(true);
    expect(mediumSources.length).toBeGreaterThanOrEqual(6);
    expect(paragraphSources.length).toBeGreaterThanOrEqual(6);
    expect(paragraphSources.map((source) => source.name)).toEqual(
      expect.arrayContaining(["Optimism Collective Paragraph", "Base Paragraph", "EigenLayer Paragraph"])
    );
  });
});
