import type { ConfigService } from "@nestjs/config";
import { findRegistryEntry } from "./llm-providers.registry";

/** 可按功能使用不同 LLM；新增功能时在此追加 key 与 env 名 */
export type LlmFeature = "default" | "ai_search" | "feed_summary" | "embedding";

/** 功能 -> 环境变量（值为 LLM_PROVIDER_REGISTRY 中的 id 或别名） */
export const LLM_ROUTE_ENV: Record<LlmFeature, string> = {
  default: "LLM_DEFAULT",
  ai_search: "LLM_ROUTE_AI_SEARCH",
  feed_summary: "LLM_ROUTE_FEED_SUMMARY",
  embedding: "LLM_ROUTE_EMBEDDING"
};

const PROMPT_KEY_TO_FEATURE: Record<string, LlmFeature> = {
  ai_search_prompt: "ai_search",
  feed_summary_prompt: "feed_summary",
  feed_embedding: "embedding",
  search_embedding: "embedding"
};

export function featureFromPromptKey(promptKey: string): LlmFeature {
  return PROMPT_KEY_TO_FEATURE[promptKey] ?? "default";
}

export function resolveRoutedProviderId(config: ConfigService, feature: LlmFeature): string {
  const routed = config.get<string>(LLM_ROUTE_ENV[feature])?.trim();
  if (routed) return routed.toLowerCase();

  if (feature === "default") {
    return (
      config.get<string>("LLM_DEFAULT")?.trim() ||
      config.get<string>("LLM_PROVIDER")?.trim() ||
      "mock"
    ).toLowerCase();
  }

  return (
    config.get<string>("LLM_DEFAULT")?.trim() ||
    config.get<string>("LLM_PROVIDER")?.trim() ||
    "mock"
  ).toLowerCase();
}

export function resolveRegistryProviderId(config: ConfigService, feature: LlmFeature): string | null {
  const raw = resolveRoutedProviderId(config, feature);
  if (raw === "mock" || !raw) return null;
  const entry = findRegistryEntry(raw);
  return entry?.id ?? null;
}
