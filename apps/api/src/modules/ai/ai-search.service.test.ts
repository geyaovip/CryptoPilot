import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHttpException } from "../common/app-http.exception";
import { AiSearchService } from "./ai-search.service";

describe("AiSearchService quota", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    aiSearchHistory: { create: vi.fn() }
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
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      dailyAiSearchCount: 0,
      lastAiSearchResetAt: new Date()
    });

    await expect(service.search("u1", "ETH today")).rejects.toMatchObject({
      errorCode: "LLM_PROVIDER_ERROR"
    });
    expect(rag.retrieve).not.toHaveBeenCalled();
    expect(llm.generateJson).not.toHaveBeenCalled();
  });
});
