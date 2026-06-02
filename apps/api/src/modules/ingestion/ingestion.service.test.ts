import { beforeEach, describe, expect, it, vi } from "vitest";
import { IngestionService } from "./ingestion.service";
import { ingestSourceItems } from "./ingest-source.util";

vi.mock("./ingest-source.util", () => ({
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
  return {
    service: new IngestionService(prisma as never, feedAi as never, jobs as never),
    prisma
  };
}

describe("IngestionService", () => {
  beforeEach(() => {
    vi.mocked(ingestSourceItems).mockReset();
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
});
