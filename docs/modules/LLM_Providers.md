# LLM 多提供商与按功能路由

## 原则

- **新增模型只追加配置**，不要改已有 `LLM_PROVIDER_REGISTRY` 条目的语义或删除 key。
- **不同功能可用不同 API**：通过 `LLM_ROUTE_*` 环境变量指定。
- 密钥只放在 `.env`，不要写入仓库。

## 代码位置

| 文件 | 作用 |
|------|------|
| `apps/api/src/modules/llm/llm-providers.registry.ts` | 提供商定义（只增条目） |
| `apps/api/src/modules/llm/llm-routing.ts` | 功能 → 环境变量、`promptKey` 映射 |
| `apps/api/src/modules/llm/llm-provider.factory.ts` | 根据 registry 实例化 Provider |
| `apps/api/src/modules/llm/llm.service.ts` | 按功能解析并调用 |

## 环境变量

```env
# 默认 chat（未单独配置的功能）
LLM_DEFAULT=moonshot

# 按功能路由（可选；未设置则回退 LLM_DEFAULT → LLM_PROVIDER）
LLM_ROUTE_AI_SEARCH=moonshot
LLM_ROUTE_FEED_SUMMARY=deepseek
LLM_ROUTE_EMBEDDING=openai

# 兼容旧配置（等同 LLM_DEFAULT）
LLM_PROVIDER=moonshot
```

各提供商独立变量（`OPENAI_*` 仍可作为 moonshot/deepseek 的 fallback）：

- **moonshot**：`MOONSHOT_API_KEY`、`MOONSHOT_BASE_URL`、`MOONSHOT_CHAT_MODEL`
- **deepseek**：`DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_CHAT_MODEL`
- **openai**：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_CHAT_MODEL`、`OPENAI_EMBEDDING_MODEL`

全局：`LLM_TEMPERATURE`、`LLM_MAX_OUTPUT_TOKENS`

## 功能与 promptKey

| 功能 | 环境变量 | 典型 promptKey |
|------|----------|----------------|
| `ai_search` | `LLM_ROUTE_AI_SEARCH` | `ai_search_prompt` |
| `feed_summary` | `LLM_ROUTE_FEED_SUMMARY` | `feed_summary_prompt` |
| `embedding` | `LLM_ROUTE_EMBEDDING` | `feed_embedding`, `search_embedding` |
| `default` | `LLM_DEFAULT` / `LLM_PROVIDER` | 其它 |

## 新增一个大模型（检查清单）

1. 在 `llm-providers.registry.ts` **末尾**增加新对象（如 `qwen: { ... }`）。
2. 若需新功能路由，在 `llm-routing.ts` 的 `LLM_ROUTE_ENV` 与 `PROMPT_KEY_TO_FEATURE` 中**追加**（勿改已有映射）。
3. 在 `.env.example` 增加该模型的 `*_API_KEY`、`*_BASE_URL`、`*_CHAT_MODEL` 占位。
4. 本地 `.env` 设置 `LLM_ROUTE_*` 指向新 id。
5. 非 OpenAI 兼容协议时，新增 Provider 类并在 factory 的 `kind` 分支中挂载（仍不要改旧条目）。

## 当前内置 id

- `openai` — 支持 Embedding
- `deepseek` — 仅 Chat，Embedding 走 mock
- `moonshot`（别名 `kimi`）— 仅 Chat，Embedding 走 mock
