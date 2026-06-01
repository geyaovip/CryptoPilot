import { describe, expect, it, vi } from "vitest";
import { ConfigService } from "@nestjs/config";
import { AppHttpException } from "../common/app-http.exception";
import { LlmService } from "./llm.service";

describe("LlmService real provider guard", () => {
  const prisma = {
    llmCallLog: { create: vi.fn() }
  };

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
});
