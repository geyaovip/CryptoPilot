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

  it("normalizes html, encoded entities, and publisher boilerplate", () => {
    const items = cleanRssItems([
      {
        title: "Aave proposal &amp; liquidity update",
        link: "https://example.com/aave",
        contentSnippet: "short fallback",
        "content:encoded": `
          <p>Aave governance approved a new liquidity update.</p>
          <script>window.track()</script>
          <p>Continue reading on Medium.</p>
        `
      }
    ]);

    expect(items[0]?.title).toBe("Aave proposal & liquidity update");
    expect(items[0]?.content).toBe("Aave governance approved a new liquidity update.");
  });

  it("removes common Substack sharing footers", () => {
    const items = cleanRssItems([
      {
        title: "Stablecoin market structure",
        link: "https://example.com/stablecoins",
        content: "Stablecoin liquidity is moving toward regulated issuers. This post is public so feel free to share it."
      }
    ]);

    expect(items[0]?.content).toBe("Stablecoin liquidity is moving toward regulated issuers.");
  });

  it("removes common Paragraph subscription footers", () => {
    const items = cleanRssItems([
      {
        title: "Rollup economics",
        link: "https://example.com/rollups",
        content: "Rollup fees are compressing as blob markets mature. Subscribe to EthDaily on Paragraph."
      }
    ]);

    expect(items[0]?.content).toBe("Rollup fees are compressing as blob markets mature.");
  });
});
