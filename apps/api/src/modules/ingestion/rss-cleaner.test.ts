import { describe, expect, it } from "vitest";
import { cleanRssItems } from "./rss-cleaner";

describe("cleanRssItems", () => {
  it("filters invalid items and dedupes by title and source url", () => {
    const items = cleanRssItems([
      { title: "", link: "https://example.com/empty" },
      { title: "BTC News", link: "" },
      { title: "BTC News", link: "https://example.com/btc", contentSnippet: "content" },
      { title: "BTC News", link: "https://example.com/btc", contentSnippet: "duplicate" }
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("BTC News");
    expect(items[0]?.content).toBe("content");
  });
});
