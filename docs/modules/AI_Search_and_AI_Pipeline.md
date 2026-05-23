# 模块规格：AI Search 与 AI Pipeline

适用版本：V0.3 起  
目标：定义 AI Search、Prompt、Embedding、RAG、AI 输出校验和成本监控。

---

## 1. AI 基本原则

AI 必须：

- 有来源。
- 区分事实和推测。
- 不输出投资建议。
- 输出结构化 JSON。
- 失败可追踪。
- 成本可监控。

## 2. AI Pipeline

```txt
采集内容
→ 清洗入库
→ Embedding
→ Narrative 分类
→ Feed Summary
→ Sentiment
→ Heat Score
→ Feed 展示 / Search 检索 / Push
```

## 3. Prompt 管理

Prompt 必须存在于数据库，不硬编码在业务逻辑中。

必须支持：

- draft
- active
- archived

同一 prompt_key 只能有一个 active。

## 4. Feed Summary

输入：

- title
- content
- source
- source_url
- related_tokens
- narrative_candidates

输出：

```json
{
  "summary": "string",
  "key_reasons": ["string"],
  "market_impact": "string",
  "related_tokens": ["string"],
  "narrative_tags": ["string"],
  "sentiment": "neutral"
}
```

## 5. AI Search

输入限制：

- 不为空。
- 最大 500 字符。
- 必须登录。
- 每用户每天 30 次。

检索：

- keyword search top 10。
- vector search top 10。
- 合并去重后最多 12 条 context。

输出：

- answer
- key_reasons
- market_impact
- related_tokens
- related_narratives
- sentiment
- sources
- updated_at

## 6. Sources 规则

- AI Search 至少 2 个 Sources。
- Feed Summary 至少 1 个 Source。
- Source 必须包含 URL。
- 来源不足时不得假装确定。

## 7. 错误处理

必须处理：

- Provider timeout。
- Provider 429。
- JSON parse fail。
- Schema validation fail。
- source insufficient。

失败重试：

- LLM 调用最多 2 次。
- Schema fail 可追加修复提示重试 1 次。

## 8. Admin AI Monitor

必须展示：

- 调用量。
- Token 消耗。
- 成本。
- 错误率。
- 平均延迟。
- 最近错误。
- Prompt 维度统计。

## 9. 验收

- AI Search 有引用。
- AI Search 限流有效。
- AI 输出 Schema 校验有效。
- Prompt 可编辑和激活。
- LLM 调用日志完整。
- 不输出投资建议。

