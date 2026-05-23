# CryptoPilot V0.3 AI 开发规格

版本目标：为 Feed、Narrative 和 Search 接入 AI 能力，实现 Prompt 管理、结构化 AI 输出、RAG 检索、AI Monitor 和成本日志。  
依赖版本：V0.2 Feed 已完成。

---

## 1. 本版本必须完成

- LLM Provider 抽象。
- OpenAI Provider。
- Anthropic Provider 配置位。
- Prompt 管理。
- Feed AI Summary。
- Sentiment 分析。
- Narrative 分类。
- Embedding 入库。
- pgvector 检索。
- AI Search 页面和 API。
- AI 输出 JSON Schema 校验。
- LLM 调用日志。
- Admin Prompt 管理。
- Admin AI Monitor。

## 2. 本版本禁止实现

- 不实现 Telegram Push。
- 不实现 Watchlist 个性化推送。
- 不实现 Smart Money。
- 不实现 Pro 订阅。
- 不输出投资建议。

---

## 3. LLM Provider

必须支持配置：

```txt
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=
OPENAI_EMBEDDING_MODEL=
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
LLM_TEMPERATURE=0.2
LLM_MAX_OUTPUT_TOKENS=1200
```

Provider 接口必须包含：

- `generateJson(input)`
- `generateText(input)`
- `embed(texts)`

所有调用必须记录到 `llm_call_logs`。

## 4. Prompt

必须初始化 5 个 Prompt：

- `feed_summary_prompt`
- `narrative_summary_prompt`
- `sentiment_prompt`
- `ai_search_prompt`
- `push_prompt`

每个 Prompt 必须有一个 active 版本。

Prompt 变量必须显式声明，例如：

```txt
{{title}}
{{content}}
{{sources}}
{{related_tokens}}
{{narrative_candidates}}
```

## 5. Feed AI Summary

触发条件：

- 新 Feed 入库后。
- Admin 手动重新生成。

输出 Schema：

```json
{
  "summary": "string",
  "key_reasons": ["string"],
  "market_impact": "string",
  "related_tokens": ["string"],
  "narrative_tags": ["string"],
  "sentiment": "bullish"
}
```

规则：

- `sentiment` 只能是 `bullish`、`neutral`、`bearish`。
- `summary` 不超过 280 英文字符或 160 中文字符。
- 没有来源不得生成发布态 AI 结论。
- 失败后最多重试 2 次。

## 6. AI Search

### 页面 `/search`

必须包含：

- Search Input。
- 推荐问题。
- Streaming 或加载状态。
- AI Answer。
- Key Reasons。
- Market Impact。
- Related Tokens。
- Related Narratives。
- Sources。
- Error State。

### API

`POST /api/ai/search`

Request：

```json
{
  "query": "Why is ETH moving today?"
}
```

流程：

```txt
校验登录
→ 校验每日次数
→ Query Parser
→ PostgreSQL keyword search
→ pgvector semantic search
→ 组装 RAG context
→ 调用 LLM
→ JSON Schema 校验
→ 保存 ai_search_history
→ 返回结果
```

错误：

- `QUERY_EMPTY`
- `QUERY_TOO_LONG`
- `DAILY_LIMIT_EXCEEDED`
- `INSUFFICIENT_SOURCES`
- `LLM_OUTPUT_INVALID`
- `LLM_PROVIDER_ERROR`

## 7. Embedding

必须为以下内容生成 embedding：

- feed_items.title + content + ai_summary

表：`content_embeddings`

字段：

- id
- entity_type: `feed_item`
- entity_id
- embedding
- embedding_model
- created_at

## 8. Admin Prompt 管理

页面 `/admin/prompts` 必须支持：

- 查看 Prompt 列表。
- 查看版本。
- 创建 draft 版本。
- 编辑 draft。
- 测试 Prompt。
- 激活版本。
- 归档版本。

同一 `prompt_key` 只能有一个 active 版本。

## 9. Admin AI Monitor

页面 `/admin/ai-monitor` 必须展示：

- 今日 LLM 调用次数。
- 今日 Token 消耗。
- 今日成本估算。
- Prompt 调用分布。
- Provider 错误率。
- 平均响应时间。
- 最近 50 条错误日志。

## 10. 数据库新增

必须新增或完善：

- prompts
- ai_search_history
- llm_call_logs
- content_embeddings

索引：

- `ai_search_history(user_id, created_at)`
- `llm_call_logs(prompt_key, created_at)`
- `content_embeddings(entity_type, entity_id)`

## 11. 测试清单

必须包含：

- Prompt active 唯一性测试。
- Sentiment enum 测试。
- AI 输出 Schema 校验测试。
- AI Search 每日次数限制测试。
- RAG source 数量不足测试。
- LLM Provider mock 测试。
- Admin Prompt 权限测试。

## 12. 验收标准

V0.3 完成必须满足：

- 新 Feed 可自动生成 AI Summary。
- Feed Detail 展示 Key Reasons 和 Market Impact。
- AI Search 可返回带 Sources 的回答。
- AI Search 每用户每天最多 30 次。
- AI Search 来源不足时明确提示。
- Admin 可编辑并激活 Prompt。
- Admin 可查看 LLM 调用和错误。
- 所有 AI 结论有来源。
- 不输出投资建议。

