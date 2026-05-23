# CryptoPilot 后端规则

本文件定义 CryptoPilot API、NestJS 模块、Service、Job、权限、日志和错误处理规则。适用于 `apps/api`。

---

## 1. 后端目标

后端必须保证：

- API contract 稳定。
- 业务模块边界清晰。
- 数据采集可追踪。
- AI 调用可观测。
- Admin 操作可审计。
- 外部服务可替换。
- 错误可定位。

---

## 2. 技术栈

必须使用：

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- pgvector
- Redis
- BullMQ

禁止：

- 同时使用 Prisma 和 TypeORM。
- 在 controller 中写复杂业务逻辑。
- 在 job 中直接拼接 SQL。
- 在 service 中硬编码第三方密钥。

---

## 3. 模块结构

每个领域模块必须按以下结构组织：

```txt
modules/{domain}
  {domain}.module.ts
  {domain}.controller.ts
  {domain}.service.ts
  dto/
  schemas/
  repositories/
  tests/
```

领域模块包括：

- auth
- users
- feed
- sources
- ingestion
- tokens
- narratives
- watchlist
- bookmarks
- ai
- prompts
- telegram
- push
- admin
- logs
- config

禁止创建承载业务逻辑的全局 `misc`、`common-service`、`helpers-service`。

---

## 4. Controller 规则

Controller 只能负责：

- 路由。
- DTO 校验。
- 权限 guard。
- 调用 service。
- 返回 response。

Controller 禁止：

- 直接访问数据库。
- 写复杂业务逻辑。
- 调用外部 provider。
- 处理长任务。

---

## 5. Service 规则

Service 负责业务流程编排。

Service 必须：

- 明确输入输出类型。
- 处理业务错误。
- 调用 repository 或 provider。
- 记录必要日志。

Service 禁止：

- 返回未类型化对象。
- 捕获错误后静默失败。
- 直接返回 provider 原始响应给前端。

---

## 6. Repository 规则

数据库访问必须集中在 repository 或 Prisma access layer。

必须：

- 使用 Prisma query。
- 对列表查询加分页。
- 对筛选字段使用 index。
- 对唯一业务约束使用 unique constraint。

禁止：

- 在多个 service 中重复写同一段复杂 query。
- 无分页返回大列表。
- 直接拼接未校验 SQL。

---

## 7. Job 与 Queue 规则

异步任务必须使用 BullMQ。

任务包括：

- RSS ingestion。
- CoinGecko sync。
- AI summary generation。
- Embedding generation。
- Narrative classification。
- Telegram push。

Job 必须：

- 幂等。
- 有 retry 上限。
- 写成功/失败日志。
- 可从 Admin 手动重试。

Job 禁止：

- 无限制重试。
- 在 API request 中同步执行长任务。
- 失败后不记录原因。

---

## 8. Provider 规则

外部服务必须通过 provider interface 封装：

- RSS provider。
- CoinGecko provider。
- Twitter/X provider 或替代 provider。
- Reddit provider。
- LLM provider。
- Embedding provider。
- Telegram provider。

Provider 必须：

- 有统一错误转换。
- 有 timeout。
- 有 retry 策略。
- 不把原始错误直接暴露给前端。

---

## 9. 权限规则

必须实现：

- Auth guard。
- Admin guard。
- Telegram webhook secret guard。
- AI Search daily limit guard。

规则：

- `/api/admin/*` 必须 admin。
- Watchlist API 必须登录。
- Bookmark API 必须登录。
- Settings API 必须登录。
- Telegram bind 必须登录。
- Telegram webhook 必须校验 secret。

---

## 10. 错误处理

错误响应格式固定：

```json
{
  "code": "string",
  "message": "string",
  "request_id": "string"
}
```

必须支持错误码：

- `AUTH_REQUIRED`
- `ADMIN_REQUIRED`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `RATE_LIMITED`
- `DAILY_LIMIT_EXCEEDED`
- `SOURCE_UNAVAILABLE`
- `LLM_PROVIDER_ERROR`
- `TELEGRAM_WEBHOOK_INVALID`
- `INTERNAL_ERROR`

禁止：

- 返回 raw stack trace 给前端。
- 使用不稳定的自然语言作为错误码。
- 不带 request_id。

---

## 11. 日志规则

必须记录：

- API error logs。
- ingestion logs。
- LLM call logs。
- Push delivery logs。
- Admin audit logs。

Admin 写操作必须记录：

- admin_user_id。
- action。
- entity_type。
- entity_id。
- before_json。
- after_json。
- ip_address。
- user_agent。

---

## 12. AI 后端规则

AI 调用必须经过：

```txt
Prompt active version
→ Context Builder
→ LLM Provider
→ JSON Schema Validation
→ Persistence
→ llm_call_logs
```

禁止：

- 在业务代码中硬编码 prompt 正文。
- 未校验 schema 就保存 AI 输出。
- 没有 sources 就发布市场结论。
- AI 失败后静默使用空字符串。

---

## 13. 安全规则

必须：

- 所有输入 DTO 校验。
- 环境变量不提交。
- Webhook secret 校验。
- 外部 URL 做安全处理。
- Rate limit 高成本 API。
- 加密存储敏感 token。

禁止：

- 明文日志输出 API key。
- 把 provider secret 存到前端。
- 把用户输入直接拼进 SQL。

---

## 14. 测试规则

后端每个版本必须至少包含：

- Service unit test。
- Guard test。
- API integration test。
- Job handler test。
- Provider mock test。

关键逻辑必须测试：

- Heat Score。
- AI output schema。
- Feed dedupe。
- Push rate limit。
- Admin permission。

