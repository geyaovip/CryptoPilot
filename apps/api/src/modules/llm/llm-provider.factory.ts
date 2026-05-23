import type { ConfigService } from "@nestjs/config";
import { MockLlmProvider } from "./mock.provider";
import { OpenAiProvider } from "./openai.provider";
import {
  findRegistryEntry,
  type LlmProviderRegistryEntry,
  type OpenAiCompatibleRegistryEntry
} from "./llm-providers.registry";
import type { LlmProvider } from "./types";

function readEnv(config: ConfigService, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = config.get<string>(key)?.trim();
    if (value) return value;
  }
  return fallback;
}

function readApiKey(config: ConfigService, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = config.get<string>(key)?.trim();
    if (value) return value;
  }
  return undefined;
}

export function createLlmProvider(config: ConfigService, providerId: string): LlmProvider | null {
  const entry = findRegistryEntry(providerId);
  if (!entry) return null;

  const apiKey = readApiKey(config, entry.apiKeyEnv);
  if (!apiKey) return null;

  if (entry.kind === "openai-compatible") {
    return buildOpenAiCompatibleProvider(config, entry, apiKey);
  }

  return null;
}

export function createMockLlmProvider(): MockLlmProvider {
  return new MockLlmProvider();
}

function buildOpenAiCompatibleProvider(
  config: ConfigService,
  entry: OpenAiCompatibleRegistryEntry,
  apiKey: string
): OpenAiProvider {
  const globalTemperature = config.get<string>("LLM_TEMPERATURE")?.trim();
  const maxOutputTokens = Number(config.get<string>("LLM_MAX_OUTPUT_TOKENS") ?? "1200");

  return new OpenAiProvider({
    apiKey,
    baseUrl: readEnv(config, entry.baseUrl.env, entry.baseUrl.default),
    providerName: entry.providerName,
    apiStyle: entry.apiStyle,
    chatModel: readEnv(config, entry.chatModel.env, entry.chatModel.default),
    embeddingModel: readEnv(config, entry.embeddingModel.env, entry.embeddingModel.default),
    temperature: Number(globalTemperature ?? String(entry.temperatureDefault)),
    maxOutputTokens,
    embeddingsEnabled: entry.embeddingsEnabled,
    extraBody: entry.extraBody
  });
}

export function registryEmbeddingsEnabled(providerId: string): boolean {
  const entry = findRegistryEntry(providerId);
  return entry?.kind === "openai-compatible" ? entry.embeddingsEnabled : false;
}

export type { LlmProviderRegistryEntry };
