# CryptoPilot API 规则

本文件定义 CryptoPilot API 的路径、请求、响应、错误码、分页、权限、版本兼容和测试规则。适用于 `apps/api` 以及前端调用 API 的类型定义。

---

## 1. API 基本原则

所有 API 必须：

- 使用 RESTful 风格。
- 使用 JSON request/response。
- 返回 `request_id`。
- 使用统一错误结构。
- 使用 DTO validation。
- 使用 `/packages/types` 中的共享类型。
- 对需要登录的接口校验 auth。
- 对 `/api/admin/*` 校验 admin。

禁止：

- 同一业务使用多种 response shape。
- 返回 HTML 错误页。
- 直接返回 ORM entity。
- 直接暴露 provider 原始响应。

---

## 2. 路径规范

MVP API 必须按领域分组：

- `/api/auth/*`
- `/api/feed/*`
- `/api/trending`
- `/api/ai/*`
- `/api/narratives/*`
- `/api/watchlist/*`
- `/api/bookmarks/*`
- `/api/tokens/*`
- `/api/kols/*`
- `/api/telegram/*`
- `/api/settings/*`
- `/api/admin/*`

路径规则：

- 使用小写 kebab-case。
- 资源使用复数名词。
- 详情使用 `/:id` 或明确 slug，例如 `/api/narratives/:slug`。
- 动作接口只在必要时使用动词，例如 `/retry`、`/activate`、`/refresh`。

禁止：

- `/getFeed`
- `/createUser`
- `/adminDoSomething`
- 同一资源同时使用单数和复数路径。

---

## 3. 成功响应

单对象响应：

```json
{
  "data": {},
  "request_id": "string"
}
```

列表响应：

```json
{
  "data": {
    "items": [],
    "next_cursor": "string"
  },
  "request_id": "string"
}
```

无内容操作：

```json
{
  "data": {
    "success": true
  },
  "request_id": "string"
}
```

---

## 4. 错误响应

错误响应固定为：

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
- `CONFLICT`
- `RATE_LIMITED`
- `DAILY_LIMIT_EXCEEDED`
- `SOURCE_UNAVAILABLE`
- `INSUFFICIENT_SOURCES`
- `LLM_OUTPUT_INVALID`
- `LLM_PROVIDER_ERROR`
- `TELEGRAM_WEBHOOK_INVALID`
- `INTERNAL_ERROR`

禁止：

- 用自然语言作为 `code`。
- 返回 raw stack trace。
- 不返回 `request_id`。

---

## 5. 分页规范

列表接口必须使用 cursor pagination。

Query：

- `cursor`: string, optional。
- `limit`: number, default 20, max 50。

Response：

- `items`: array。
- `next_cursor`: string or null。

禁止：

- 无分页返回大列表。
- 默认返回超过 50 条。
- 同一接口同时混用 page pagination 和 cursor pagination。

---

## 6. 筛选与排序

筛选参数必须显式定义。

Feed 示例：

- `tab`: `for_you`、`latest`、`breaking`
- `source`
- `type`
- `status`

排序参数必须使用白名单。

禁止：

- 允许用户传任意 SQL 字段名排序。
- 将 filter JSON 直接透传给 ORM。

---

## 7. 权限规则

必须登录：

- Watchlist API。
- Bookmark API。
- Settings API。
- AI Search API。
- Telegram bind/unbind。

必须 admin：

- 所有 `/api/admin/*`。

特殊规则：

- Telegram webhook 必须校验 secret。
- AI Search 必须校验每日次数限制。

---

## 8. DTO 与类型

必须：

- 在后端定义 request DTO。
- 在 `/packages/types` 定义共享 response type。
- enum 使用共享定义。
- DTO 变化时同步更新前端类型。

禁止：

- 前端手写一份不同的 response interface。
- DTO 中使用 `any`。
- API 返回未定义字段。

---

## 9. API 日志

每个请求必须产生 `request_id`。

错误日志必须包含：

- request_id。
- method。
- path。
- status_code。
- user_id，如果已登录。
- error code。
- stack trace，仅服务端日志。

禁止把 API key、OAuth token、Telegram secret 写入日志。

---

## 10. API 测试

每个版本必须为新增 API 添加：

- success case。
- validation error case。
- auth required case。
- admin required case，如果是 admin API。
- not found case，如果存在详情接口。

关键接口必须有 integration test：

- `GET /api/feed`
- `GET /api/feed/:id`
- `POST /api/ai/search`
- `GET /api/watchlist`
- `POST /api/telegram/webhook`
- `/api/admin/*`

