# CryptoPilot 架构规则

本文件定义 CryptoPilot 的架构边界、模块组织、依赖方向和可维护性规则。AI 开发 Agent 必须遵守，避免项目在多轮开发后失控。

---

## 1. 架构目标

架构必须优先保证：

- AI 能读懂模块边界。
- 支持按版本增量开发。
- API contract 清晰。
- 类型可共享。
- 外部数据源可替换。
- Admin 可以人工接管 AI 输出。
- AI 成本和错误可观测。

架构不得为了未来功能提前引入复杂微服务、过度抽象或当前版本不需要的能力。

---

## 2. Monorepo 结构

必须使用：

```txt
/apps/web
/apps/admin
/apps/api
/packages/ui
/packages/types
/packages/config
/packages/shared
/packages/prompts
/infra/db
/docs/rules
```

目录职责：

- `apps/web`：用户前台 PWA。
- `apps/admin`：Admin CMS。
- `apps/api`：NestJS API、jobs、queues、integrations。
- `packages/ui`：共享 UI 组件。
- `packages/types`：DTO、enum、API response type。
- `packages/config`：环境变量和共享配置。
- `packages/shared`：纯工具函数。
- `packages/prompts`：prompt key、schema、默认 prompt。
- `infra/db`：migration、seed、数据库说明。

禁止：

- `apps/web` 和 `apps/admin` 互相引用内部代码。
- 把业务逻辑写在 React component 内。
- 在前端应用里重复定义 API 类型。
- 无明确原因创建新的顶层目录。

---

## 3. 后端领域模块

Backend 必须按领域组织模块：

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

每个后端领域模块应包含：

- controller
- service
- repository 或 prisma access layer
- dto
- schema 或 validator
- tests

禁止创建承载业务逻辑的泛化 `utils` 模块。

---

## 4. 依赖方向

允许的依赖方向：

```txt
apps/*
→ packages/*

apps/api domain modules
→ packages/types
→ packages/shared
→ packages/prompts
```

禁止：

- `packages/*` 从 `apps/*` import。
- 前端 import 后端 service 代码。
- 后端 import 前端 component。
- 领域模块依赖 Admin UI。

---

## 5. 数据源 Provider 架构

外部数据源必须可替换。

以下能力必须通过 provider interface 接入：

- RSS
- CoinGecko
- Twitter/X 或替代服务
- Reddit
- LLM
- Embedding
- Telegram

Provider implementation 不得泄漏到 controller 或 React component 中。

示例：

```ts
interface MarketDataProvider {
  getTokenMarkets(symbols: string[]): Promise<TokenMarket[]>
}
```

---

## 6. AI 架构

AI 必须被当作基础设施依赖，而不是直接写进业务逻辑。

必须分层：

```txt
Prompt Registry
→ Context Builder
→ LLM Provider
→ Output Schema Validator
→ Persistence
→ Observability Logs
```

规则：

- Prompt 内容必须在数据库中版本化。
- AI 输出必须通过 schema validation。
- 每次 LLM 调用必须写入 `llm_call_logs`。
- 失败的 AI 输出不得静默进入 published 内容。
- Admin 必须能修正 AI summary。

---

## 7. Job 与 Queue 架构

异步任务必须使用 BullMQ：

- RSS ingestion
- CoinGecko sync
- AI summary generation
- Embedding generation
- Narrative classification
- Telegram push

规则：

- Job 必须幂等。
- Job 必须记录成功和失败。
- Job 必须设置 retry 上限。
- 长时间 AI 任务不得阻塞 API request thread。

---

## 8. API 架构

API 必须按领域分组：

- `/api/auth/*`
- `/api/feed/*`
- `/api/ai/*`
- `/api/narratives/*`
- `/api/watchlist/*`
- `/api/bookmarks/*`
- `/api/telegram/*`
- `/api/settings/*`
- `/api/admin/*`

规则：

- 使用 DTO validation。
- 列表接口使用 cursor pagination。
- 使用统一错误码。
- 所有响应包含 `request_id`。
- 所有 admin route 使用 admin guard。

---

## 9. 数据库架构

规则：

- 使用 PostgreSQL。
- 使用 pgvector 存储 embedding。
- 使用 Redis 处理 queue、cache、rate limit。
- 核心业务数据使用 soft delete。
- foreign key 和列表筛选字段必须加 index。
- 去重逻辑必须使用 unique constraint。

禁止在数据库中明文存储 secret。

仅以下字段可加密存储：

- OAuth token。
- provider credential。

---

## 10. 版本架构

每次实现都必须映射到一个当前版本：

- V0.1：skeleton
- V0.2：feed
- V0.3：AI
- V0.4：narrative and watchlist
- V0.5：telegram push
- V0.6：beta hardening

如果用户要求不属于当前版本，必须说明它是 future work，不得直接实现。

---

## 11. 可观测性

必须支持：

- API error logs。
- ingestion logs。
- LLM call logs。
- Push delivery logs。
- Admin audit logs。

Admin 必须能查看：

- source failures。
- AI failures。
- Push failures。
- recent admin write operations。

