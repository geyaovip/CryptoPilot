import { describe, expect, it, vi } from "vitest";
import { fetchRedditSignals } from "./reddit-provider";

const tokenResponse = { access_token: "reddit-token" };
const listingResponse = {
  data: {
    children: [
      {
        data: {
          title: "Ethereum ETF inflows trigger renewed staking debate",
          selftext: "ETH ETF and staking regulation are being discussed by market participants.",
          permalink: "/r/ethereum/comments/1/eth_etf/",
          created_utc: 1_780_000_000,
          score: 120,
          num_comments: 45,
          author: "researcher"
        }
      },
      {
        data: {
          title: "Daily Discussion - simple questions thread",
          selftext: "General chat",
          permalink: "/r/CryptoCurrency/comments/2/daily/",
          created_utc: 1_780_000_000,
          score: 999,
          num_comments: 999,
          author: "mod",
          stickied: true
        }
      },
      {
        data: {
          title: "What should I buy today?",
          selftext: "help me choose a coin",
          permalink: "/r/CryptoCurrency/comments/3/buy/",
          created_utc: 1_780_000_000,
          score: 88,
          num_comments: 30,
          author: "trader"
        }
      }
    ]
  }
};

describe("fetchRedditSignals", () => {
  it("keeps relevant Reddit posts and filters low-value threads", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(tokenResponse) })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(listingResponse) });
    vi.stubGlobal("fetch", fetchMock);

    const items = await fetchRedditSignals(
      { url: "https://oauth.reddit.com/r/ethereum", sourceWeight: 50 },
      { clientId: "id", clientSecret: "secret", userAgent: "CryptoPilot test" },
      10
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toContain("Ethereum ETF");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("access_token"),
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer reddit-token" })
      })
    );
  });
});
