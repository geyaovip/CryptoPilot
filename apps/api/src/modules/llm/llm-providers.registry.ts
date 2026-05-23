/**
 * LLM 提供商注册表（只增不改）
 *
 * 新增大模型时：在 LLM_PROVIDER_REGISTRY 末尾添加新条目，并在 llm-routing.ts 的
 * LLM_ROUTE_ENV 中为需要该模型的功能配置环境变量。不要修改已有条目的字段含义。
 *
 * 路由见 .env 中 LLM_DEFAULT / LLM_ROUTE_*（docs/modules/LLM_Providers.md）
 */

export type OpenAiCompatibleRegistryEntry = {
  kind: "openai-compatible";
  /** 路由与环境变量中使用的 canonical id */
  id: string;
  /** 别名，例如 kimi -> moonshot */
  aliases?: string[];
  /** 日志与 llm_call_logs 中的 provider 名 */
  providerName: string;
  apiStyle: "openai" | "deepseek";
  apiKeyEnv: string[];
  baseUrl: { env: string[]; default: string };
  chatModel: { env: string[]; default: string };
  embeddingModel: { env: string[]; default: string };
  embeddingsEnabled: boolean;
  temperatureDefault: number;
  extraBody?: Record<string, unknown>;
};

export type LlmProviderRegistryEntry = OpenAiCompatibleRegistryEntry;

/** 按 id 索引；新增提供商请 append，勿改已有 key */
export const LLM_PROVIDER_REGISTRY: Record<string, LlmProviderRegistryEntry> = {
  openai: {
    kind: "openai-compatible",
    id: "openai",
    providerName: "openai",
    apiStyle: "openai",
    apiKeyEnv: ["OPENAI_API_KEY"],
    baseUrl: { env: ["OPENAI_BASE_URL"], default: "https://api.openai.com/v1" },
    chatModel: { env: ["OPENAI_CHAT_MODEL"], default: "gpt-4o-mini" },
    embeddingModel: { env: ["OPENAI_EMBEDDING_MODEL"], default: "text-embedding-3-small" },
    embeddingsEnabled: true,
    temperatureDefault: 0.2
  },
  /** 保留备用；通过 LLM_ROUTE_*=deepseek 启用，无需改代码 */
  deepseek: {
    kind: "openai-compatible",
    id: "deepseek",
    providerName: "deepseek",
    apiStyle: "deepseek",
    apiKeyEnv: ["DEEPSEEK_API_KEY", "OPENAI_API_KEY"],
    baseUrl: { env: ["DEEPSEEK_BASE_URL", "OPENAI_BASE_URL"], default: "https://api.deepseek.com" },
    chatModel: { env: ["DEEPSEEK_CHAT_MODEL", "OPENAI_CHAT_MODEL"], default: "deepseek-v4-pro" },
    embeddingModel: { env: ["OPENAI_EMBEDDING_MODEL"], default: "text-embedding-3-small" },
    embeddingsEnabled: false,
    temperatureDefault: 0.2
  },
  moonshot: {
    kind: "openai-compatible",
    id: "moonshot",
    aliases: ["kimi"],
    providerName: "moonshot",
    apiStyle: "openai",
    apiKeyEnv: ["MOONSHOT_API_KEY", "OPENAI_API_KEY"],
    baseUrl: {
      env: ["MOONSHOT_BASE_URL", "OPENAI_BASE_URL"],
      default: "https://api.moonshot.cn/v1"
    },
    chatModel: { env: ["MOONSHOT_CHAT_MODEL", "OPENAI_CHAT_MODEL"], default: "kimi-k2.5" },
    embeddingModel: { env: ["OPENAI_EMBEDDING_MODEL"], default: "text-embedding-3-small" },
    embeddingsEnabled: false,
    temperatureDefault: 0.6,
    extraBody: { thinking: { type: "disabled" } }
  }
  // 示例：新增其它模型时在此追加，例如：
  // anthropic: { kind: "anthropic", id: "anthropic", ... }  // 需实现对应 Provider 类
};

export function findRegistryEntry(providerId: string): LlmProviderRegistryEntry | undefined {
  const normalized = providerId.trim().toLowerCase();
  if (LLM_PROVIDER_REGISTRY[normalized]) return LLM_PROVIDER_REGISTRY[normalized];
  return Object.values(LLM_PROVIDER_REGISTRY).find(
    (entry) => entry.id === normalized || entry.aliases?.includes(normalized)
  );
}
