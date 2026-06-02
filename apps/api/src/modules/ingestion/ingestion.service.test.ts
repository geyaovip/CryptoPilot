import { beforeEach, describe, expect, it, vi } from "vitest";
import { IngestionService } from "./ingestion.service";
import { fetchRedditItemsForSource, ingestSourceItems } from "./ingest-source.util";

vi.mock("./ingest-source.util", () => ({
  fetchRedditItemsForSource: vi.fn(),
  ingestSourceItems: vi.fn()
}));

const source = {
  id: "00000000-0000-0000-0000-000000000101",
  url: "https://example.com/rss.xml",
  consecutiveFailures: 0,
  status: "ACTIVE"
};

function createService() {
  const prisma = {
    source: {
      findUnique: vi.fn().mockResolvedValue(source),
      update: vi.fn()
    },
    ingestionLog: {
      create: vi.fn()
    }
  };
  const feedAi = { queueGeneration: vi.fn() };
  const jobs = { enabled: true };
  const config = { get: vi.fn() };
  const coinGecko = { fetchPrices: vi.fn() };
  return {
    service: new IngestionService(prisma as never, feedAi as never, jobs as never, config as never, coinGecko as never),
    prisma,
    coinGecko
  };
}

describe("IngestionService", () => {
  beforeEach(() => {
    vi.mocked(ingestSourceItems).mockReset();
    vi.mocked(fetchRedditItemsForSource).mockReset();
  });

  it("retries a source twice before recording success", async () => {
    const mockedIngest = vi.mocked(ingestSourceItems);
    mockedIngest
      .mockRejectedValueOnce(new Error("temporary"))
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce({ items_found: 3, items_created: 1 });
    const { service, prisma } = createService();

    await expect(service.ingestRssSource(source.id)).resolves.toEqual({ items_found: 3, items_created: 1 });

    expect(mockedIngest).toHaveBeenCalledTimes(3);
    expect(prisma.source.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ consecutiveFailures: 0, status: "ACTIVE" })
      })
    );
    expect(prisma.ingestionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCESS",
          errorMessage: expect.stringContaining("第 3 次重试成功")
        })
      })
    );
  });

  it("records one failed log after all retry attempts fail", async () => {
    vi.mocked(ingestSourceItems).mockRejectedValue(new Error("rss timeout"));
    const { service, prisma } = createService();

    await expect(service.ingestRssSource(source.id)).rejects.toThrow("rss timeout");

    expect(ingestSourceItems).toHaveBeenCalledTimes(3);
    expect(prisma.source.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          consecutiveFailures: 1,
          errorMessage: expect.stringContaining("已重试 2 次")
        })
      })
    );
    expect(prisma.ingestionLog.create).toHaveBeenCalledTimes(1);
  });

  it("uses reddit provider output for reddit sources", async () => {
    vi.mocked(fetchRedditItemsForSource).mockResolvedValue([
      {
        title: "Bitcoin ETF discussion heats up",
        content: "BTC ETF liquidity discussion",
        sourceUrl: "https://www.reddit.com/r/Bitcoin/comments/1/etf/",
        publishTime: new Date("2026-06-01T00:00:00.000Z")
      }
    ]);
    vi.mocked(ingestSourceItems).mockResolvedValue({ items_found: 1, items_created: 1 });
    const redditSource = { ...source, type: "REDDIT", sourceWeight: 50 };
    const prisma = {
      source: {
        findUnique: vi.fn().mockResolvedValue(redditSource),
        update: vi.fn()
      },
      ingestionLog: {
        create: vi.fn()
      }
    };
    const feedAi = { queueGeneration: vi.fn() };
    const jobs = { enabled: true };
    const config = { get: vi.fn((key: string) => (key === "REDDIT_CLIENT_ID" ? "id" : "secret")) };
    const coinGecko = { fetchPrices: vi.fn() };
    const service = new IngestionService(prisma as never, feedAi as never, jobs as never, config as never, coinGecko as never);

    await expect(service.ingestSource(source.id)).resolves.toEqual({ items_found: 1, items_created: 1 });

    expect(fetchRedditItemsForSource).toHaveBeenCalledWith(
      redditSource,
      expect.objectContaining({ clientId: "id", clientSecret: "secret" }),
      25
    );
    expect(ingestSourceItems).toHaveBeenCalledWith(
      prisma,
      redditSource,
      25,
      expect.any(Function),
      expect.arrayContaining([expect.objectContaining({ title: "Bitcoin ETF discussion heats up" })])
    );
  });

  it("skips CoinGecko sync when market jobs are disabled", async () => {
    const { service, prisma, coinGecko } = createService();
    (service as unknown as { jobs: { marketEnabled: boolean } }).jobs = { marketEnabled: false };

    await service.syncCoinGeckoPrices();

    expect(prisma.source.findUnique).not.toHaveBeenCalled();
    expect(coinGecko.fetchPrices).not.toHaveBeenCalled();
  });
});
