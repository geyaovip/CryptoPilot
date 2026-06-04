import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import { AppHttpException } from "../common/app-http.exception";
import { LlmService } from "./llm.service";

describe("LlmService real provider guard", () => {
  const prisma = {
    llmCallLog: { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]) }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.llmCallLog.findMany.mockResolvedValue([]);
  });

  it("rejects mock provider for user-visible generation when requireReal is set", async () => {
    const service = new LlmService(prisma as never, new ConfigService({ LLM_DEFAULT: "mock" }));

    await expect(
      service.generateJson({
        promptKey: "feed_summary_prompt",
        user: "summarize",
        requireReal: true
      })
    ).rejects.toMatchObject({
      errorCode: "LLM_PROVIDER_ERROR"
    } satisfies Partial<AppHttpException>);
    expect(prisma.llmCallLog.create).not.toHaveBeenCalled();
  });

  it("still allows mock embeddings because they are retrieval infrastructure", async () => {
    const service = new LlmService(prisma as never, new ConfigService({ LLM_DEFAULT: "mock" }));

    await expect(service.embed(["BTC market"], "search_embedding")).resolves.toMatchObject({
      provider: "mock"
    });
  });

  it("blocks generation after the daily token budget is exhausted", async () => {
    prisma.llmCallLog.findMany.mockResolvedValueOnce([
      { inputTokens: 900, outputTokens: 100, costUsd: 0.1 }
    ]);
    const service = new LlmService(
      prisma as never,
      new ConfigService({ LLM_DEFAULT: "mock", LLM_DAILY_TOKEN_BUDGET: "1000", LLM_DAILY_COST_BUDGET_USD: "0" })
    );

    await expect(
      service.generateJson({
        promptKey: "feed_summary_prompt",
        user: "summarize this market update"
      })
    ).rejects.toMatchObject({
      errorCode: "LLM_PROVIDER_ERROR"
    } satisfies Partial<AppHttpException>);
  });
});
