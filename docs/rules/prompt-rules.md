# CryptoPilot Prompt 规则

本文件定义 CryptoPilot 中所有 AI Prompt、RAG Context、结构化输出、Schema 校验、安全边界和 Prompt 版本管理规则。适用于 `packages/prompts`、`apps/api` 的 AI 模块和 Admin Prompt 管理。

---

## 1. Prompt 基本原则

Prompt 是产品能力的一部分，必须版本化、可测试、可回滚。

必须：

- Prompt 存储在数据库。
- Prompt metadata 放在 `/packages/prompts`。
- Prompt 输出必须有 JSON Schema。
- Prompt 调用必须记录 `llm_call_logs`。
- Admin 可以创建、测试、激活、归档 Prompt。

禁止：

- 在业务代码中硬编码 Prompt 正文。
- 无版本地覆盖 active Prompt。
- 未校验输出就保存 AI 结果。
- AI 输出无来源市场结论。

---

## 2. Prompt 类型

MVP 必须包含：

- `feed_summary_prompt`
- `narrative_summary_prompt`
- `sentiment_prompt`
- `ai_search_prompt`
- `push_prompt`

后续完整产品可增加：

- `smart_money_prompt`
- `risk_prompt`
- `daily_digest_prompt`
- `market_report_prompt`

---

## 3. Prompt 版本

Prompt 表必须支持：

- `prompt_key`
- `version`
- `content`
- `status`: `draft`, `active`, `archived`
- `created_by`
- `created_at`
- `updated_at`

规则：

- 同一个 `prompt_key` 只能有一个 active。
- active Prompt 不允许直接编辑。
- 修改 active Prompt 必须创建新 draft。
- draft 测试通过后才能 activate。
- activate 新版本时，旧 active 自动 archived。

---

## 4. Prompt 变量

Prompt 必须显式声明变量。

示例：

```txt
{{title}}
{{content}}
{{source_name}}
{{source_url}}
{{publish_time}}
{{related_tokens}}
{{narrative_candidates}}
{{sources}}
```

禁止：

- 使用未声明变量。
- 将用户输入无处理地拼接进系统指令。
- 把 secret 放进 Prompt。

---

## 5. 输出格式

AI 输出必须优先使用 JSON。

Feed Summary 输出：

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

AI Search 输出：

```json
{
  "answer": "string",
  "key_reasons": ["string"],
  "market_impact": "string",
  "related_tokens": ["string"],
  "related_narratives": ["string"],
  "sentiment": "neutral",
  "sources": [
    {
      "source_name": "string",
      "source_type": "news",
      "url": "string",
      "published_at": "string"
    }
  ]
}
```

Push 输出：

```json
{
  "title": "string",
  "bullets": ["string"],
  "related_tokens": ["string"],
  "related_narratives": ["string"],
  "risk_note": "Not financial advice."
}
```

---

## 6. Schema 校验

所有 AI 输出必须通过 schema validation。

规则：

- 校验失败不得保存为 published 内容。
- 可重试 1 次修复 JSON。
- 重试后仍失败，记录错误并进入人工处理。
- `sentiment` 只能是 `bullish`, `neutral`, `bearish`。

禁止：

- 用正则手工解析复杂 JSON。
- 容忍缺失必填字段。
- AI 输出失败时写入空字符串。

---

## 7. Sources 规则

AI 市场结论必须有 sources。

Feed Summary：

- 至少 1 个 source。

AI Search：

- 至少 2 个 sources。

Source 必须包含：

- `source_name`
- `source_type`
- `url`
- `published_at`

来源不足时必须输出信息不足提示，不得假装确定。

---

## 8. 安全边界

AI 禁止：

- 直接建议买入。
- 直接建议卖出。
- 建议开杠杆。
- 承诺收益。
- 预测确定性价格。
- 编造新闻。
- 编造来源。
- 把市场情绪说成事实。

AI 必须：

- 区分事实、推测、情绪。
- 使用简洁市场语言。
- 明确展示风险提示。
- 输出 `Not financial advice.` 或中文等价提示。

---

## 9. RAG Context 规则

Context Builder 必须：

- 去重 source。
- 限制 context 数量。
- 优先使用发布时间近、source_weight 高的内容。
- 保留 source_url。
- 保留 publish_time。

AI Search Context：

- keyword search top 10。
- vector search top 10。
- 合并去重后最多 12 条。

禁止：

- 传入无限长 context。
- 丢失 source URL。
- 混入无来源内容。

---

## 10. LLM 调用日志

每次 LLM 调用必须写入 `llm_call_logs`：

- user_id，可为空。
- prompt_key。
- provider。
- model。
- input_tokens。
- output_tokens。
- cost_usd。
- latency_ms。
- status。
- error_message。

禁止记录：

- API key。
- OAuth token。
- Telegram secret。

---

## 11. Admin Prompt 管理

Admin 必须支持：

- 查看 Prompt 列表。
- 查看版本。
- 创建 draft。
- 编辑 draft。
- 测试 Prompt。
- 激活版本。
- 归档版本。
- 查看调用日志。

Prompt 测试必须：

- 使用固定测试输入。
- 展示原始输出。
- 展示 schema validation 结果。
- 展示 token 使用量。

---

## 12. Prompt 测试

必须测试：

- Prompt active 唯一性。
- 缺少变量时报错。
- JSON Schema 校验。
- sentiment enum 校验。
- sources 不足处理。
- 投资建议禁用规则。
- LLM provider 失败处理。

