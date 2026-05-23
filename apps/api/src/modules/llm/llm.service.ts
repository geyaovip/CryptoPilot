import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LlmCallStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { createLlmProvider, createMockLlmProvider, registryEmbeddingsEnabled } from "./llm-provider.factory";
import { featureFromPromptKey, resolveRegistryProviderId, type LlmFeature } from "./llm-routing";
import { MockLlmProvider } from "./mock.provider";
import type { LlmEmbedResult, LlmJsonInput, LlmJsonResult, LlmProvider, LlmTextInput, LlmTextResult } from "./types";

@Injectable()
export class LlmService {
  private readonly config: ConfigService;
  private readonly prisma: PrismaService;
  private readonly providers = new Map<string, LlmProvider>();
  private readonly mockProvider = createMockLlmProvider();

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) config: ConfigService
  ) {
    this.prisma = prisma;
    this.config = config;
  }

  getProviderName(feature: LlmFeature = "default"): string {
    return this.resolveProvider(feature).name;
  }

  async generateJson(input: LlmJsonInput): Promise<LlmJsonResult> {
    const feature = featureFromPromptKey(input.promptKey);
    const provider = this.resolveProvider(feature);
    return this.runWithLog(input, feature, () => provider.generateJson(input));
  }

  async generateText(input: LlmTextInput): Promise<LlmTextResult> {
    const feature = featureFromPromptKey(input.promptKey);
    const provider = this.resolveProvider(feature);
    return this.runWithLog(input, feature, () => provider.generateText(input));
  }

  async embed(texts: string[], promptKey = "embedding"): Promise<LlmEmbedResult> {
    const feature = featureFromPromptKey(promptKey);
    const provider = this.resolveEmbedProvider(feature);
    const result = await provider.embed(texts, promptKey);
    await this.logCall({
      promptKey,
      provider: result.provider,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: 0,
      latencyMs: result.latencyMs,
      status: "SUCCESS"
    });
    return result;
  }

  private resolveProvider(feature: LlmFeature): LlmProvider {
    const providerId = resolveRegistryProviderId(this.config, feature);
    if (!providerId) return this.mockProvider;

    const cached = this.providers.get(providerId);
    if (cached) return cached;

    const created = createLlmProvider(this.config, providerId);
    const provider = created ?? this.mockProvider;
    this.providers.set(providerId, provider);
    return provider;
  }

  private resolveEmbedProvider(feature: LlmFeature): LlmProvider {
    const providerId = resolveRegistryProviderId(this.config, feature);
    if (!providerId || !registryEmbeddingsEnabled(providerId)) {
      return this.mockProvider;
    }
    return this.resolveProvider(feature);
  }

  private async runWithLog<T extends LlmJsonResult | LlmTextResult>(
    input: LlmJsonInput,
    feature: LlmFeature,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await fn();
      await this.logCall({
        userId: input.userId,
        promptKey: input.promptKey,
        provider: result.provider,
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        status: "SUCCESS"
      });
      return result;
    } catch (error) {
      await this.logCall({
        userId: input.userId,
        promptKey: input.promptKey,
        provider: this.getProviderName(feature),
        model: "unknown",
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: 0,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "LLM 调用失败"
      });
      throw error;
    }
  }

  private async logCall(input: {
    userId?: string;
    promptKey: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    status: LlmCallStatus;
    errorMessage?: string;
  }) {
    const costUsd = (input.inputTokens * 0.00000015 + input.outputTokens * 0.0000006).toFixed(6);
    await this.prisma.llmCallLog.create({
      data: {
        userId: input.userId,
        promptKey: input.promptKey,
        provider: input.provider,
        model: input.model,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        costUsd,
        latencyMs: input.latencyMs,
        status: input.status,
        errorMessage: input.errorMessage
      }
    });
  }
}
