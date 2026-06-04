import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHttpException } from "../common/app-http.exception";
import { AiSearchService } from "./ai-search.service";

describe("AiSearchService quota", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    aiSearchHistory: { create: vi.fn(), findFirst: vi.fn() }
  };
  const promptService = { getActiveContent: vi.fn(), renderTemplate: vi.fn() };
  const llm = { generateJson: vi.fn(), getProviderName: vi.fn(() => "mock") };
  const rag = { retrieve: vi.fn(), toSources: vi.fn() };
  const systemConfig = {
    snapshot: { ai_search_daily_limit: 30, feature_flags: { ai_search: true } }
  };

  const service = new AiSearchService(
    prisma as never,
    promptService as never,
    llm as never,
    rag as never,
    systemConfig as never
  );

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.aiSearchHistory.findFirst.mockResolvedValue(null);
  });

  it("throws DAILY_LIMIT_EXCEEDED when quota reached", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      dailyAiSearchCount: 30,
      lastAiSearchResetAt: new Date()
    });

    await expect(service.search("u1", "ETH today")).rejects.toBeInstanceOf(AppHttpException);
    await expect(service.search("u1", "ETH today")).rejects.toMatchObject({
      errorCode: "DAILY_LIMIT_EXCEEDED"
    });
  });

  it("does not return mock AI search results as real answers", async () => {
    const items = [
      {
        id: "feed-1",
        title: "ETH ETF flow changes",
        content: "content",
        ai_summary: "summary",
        source_name: "PANews",
        source_url: "https://example.com/1",
        publish_time: new Date().toISOString()
      },
      {
        id: "feed-2",
        title: "ETH whale position changes",
        content: "content",
        ai_summary: "summary",
        source_name: "CoinDesk",
        source_url: "https://example.com/2",
        publish_time: new Date().toISOString()
      }
    ];
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      dailyAiSearchCount: 0,
      lastAiSearchResetAt: new Date()
    });
    rag.retrieve.mockResolvedValue(items);
    rag.toSources.mockReturnValue(
      items.map((item) => ({
        source_name: item.source_name,
        source_type: "news",
        url: item.source_url,
        published_at: item.publish_time
      }))
    );
    promptService.getActiveContent.mockResolvedValue("{{query}} {{context}} {{sources}}");
    promptService.renderTemplate.mockReturnValue("rendered prompt");
    llm.generateJson.mockRejectedValue(
      new AppHttpException("LLM_PROVIDER_ERROR", "ai_search_prompt 未配置真实模型")
    );

    await expect(service.search("u1", "ETH today")).rejects.toMatchObject({
      errorCode: "LLM_PROVIDER_ERROR"
    });
    expect(llm.generateJson).toHaveBeenCalledWith(
      expect.objectContaining({
        promptKey: "ai_search_prompt",
        requireReal: true
      })
    );
  });
});
