# CryptoPilot V0.1 Skeleton 开发规格

版本目标：搭建可运行的 Monorepo、Web、Admin、API、数据库、Redis、浅色 UI Design System 和基础认证骨架。  
版本性质：工程底座，不实现真实 Feed、AI、Narrative、Push。  
上游文档：`CryptoPilot_MVP_PRD_AI_Execution.md`

---

## 1. 本版本必须完成

- Monorepo 初始化。
- `/apps/web` 前台应用。
- `/apps/admin` 后台应用。
- `/apps/api` NestJS API。
- `/packages/ui` 共享 UI 组件。
- `/packages/types` 共享 TypeScript 类型。
- `/packages/config` 共享配置。
- `/packages/shared` 通用工具。
- PostgreSQL 连接。
- Redis 连接。
- 数据库迁移系统。
- 基础用户表和认证表。
- Magic Link 登录骨架。
- Google OAuth 登录骨架。
- 前台浅色布局。
- Admin 浅色布局。
- Loading、Empty、Error 基础组件。
- 全局错误格式。
- 环境变量示例文件。

## 2. 本版本禁止实现

- 不实现真实 Feed 数据。
- 不接入 RSS、CoinGecko、Twitter/X、Reddit。
- 不调用 LLM。
- 不实现 AI Search。
- 不实现 Telegram Bot。
- 不实现 Watchlist。
- 不实现 Push。
- 不实现 Pro 订阅。
- 不实现暗色主题。

---

## 3. 项目结构

必须创建：

```txt
/apps
  /web
  /admin
  /api

/packages
  /ui
  /types
  /config
  /shared
  /prompts

/infra
  /db

/docs/rules
  MASTER_RULES.md
  frontend-rules.md
  backend-rules.md
  ui-rules.md
  architecture-rules.md
```

## 4. 技术栈

Web/Admin：

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand

API：

- NestJS
- TypeScript
- PostgreSQL
- Redis
- Prisma。

## 5. UI 主题

必须统一浅色主题：

- `background`: `#FFFFFF`
- `muted background`: `#FAFAFA`
- `panel background`: `#F5F5F5`
- `border`: `#E5E7EB`
- `primary text`: `#111827`
- `secondary text`: `#6B7280`
- `accent`: `#2563EB`

禁止：

- dark mode。
- 主题切换。
- 系统主题自动检测。
- 大面积深色 Sidebar/Header/Card。

## 6. 页面清单

### Web

必须实现：

- `/`：跳转到 `/home`。
- `/home`：空状态首页，显示 Market Header 占位、Feed Empty State。
- `/search`：空状态搜索页，只展示输入框和推荐问题占位。
- `/watchlist`：未实现状态页。
- `/me`：用户信息页，未登录显示登录入口。
- `/login`：登录页。

### Admin

必须实现：

- `/admin`：跳转 `/admin/dashboard`。
- `/admin/login`：后台登录页。
- `/admin/dashboard`：空指标卡片。
- `/admin/feed`：空表格。
- `/admin/prompts`：空表格。
- `/admin/sources`：空表格。
- `/admin/users`：空表格。
- `/admin/logs`：空表格。

## 7. API 清单

### 通用响应

成功：

```json
{
  "data": {},
  "request_id": "string"
}
```

失败：

```json
{
  "code": "string",
  "message": "string",
  "request_id": "string"
}
```

### 必须实现

- `GET /api/health`
- `GET /api/auth/me`
- `POST /api/auth/magic-link`
- `POST /api/auth/callback`
- `POST /api/auth/google`
- `POST /api/auth/logout`

## 8. 数据库

### users

字段：

- id: uuid, primary key
- email: varchar, unique, nullable
- name: varchar, nullable
- avatar_url: text, nullable
- role: enum(`user`, `admin`), default `user`
- telegram_chat_id: varchar, nullable
- telegram_bound_at: timestamp, nullable
- daily_ai_search_count: int, default 0
- last_ai_search_reset_at: timestamp, nullable
- disabled_at: timestamp, nullable
- deleted_at: timestamp, nullable
- created_at: timestamp
- updated_at: timestamp

### auth_accounts

- id: uuid
- user_id: uuid, foreign key users.id
- provider: enum(`google`, `email`)
- provider_account_id: varchar
- access_token_encrypted: text, nullable
- refresh_token_encrypted: text, nullable
- expires_at: timestamp, nullable
- created_at
- updated_at

唯一约束：

- `(provider, provider_account_id)`

### magic_link_tokens

- id: uuid
- email: varchar
- token_hash: varchar, unique
- expires_at: timestamp
- consumed_at: timestamp, nullable
- created_at
- updated_at

索引：

- `email`
- `expires_at`

## 9. 权限规则

- 未登录用户可访问 `/home`、`/search`、`/login`，但 API 只返回公开空数据。
- `GET /api/auth/me` 未登录返回 `401 AUTH_REQUIRED`。
- Admin 页面必须要求 admin 角色。
- 非 admin 访问 Admin API 返回 `403 ADMIN_REQUIRED`。

## 10. 环境变量

必须提供 `.env.example`：

```txt
DATABASE_URL=
REDIS_URL=
APP_URL=
ADMIN_URL=
API_URL=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

不得提交真实密钥。

## 11. 测试清单

必须包含：

- API health test。
- Auth service 单元测试。
- Admin role guard 单元测试。
- Web 首页 smoke test。
- Admin Dashboard smoke test。

## 12. 验收标准

V0.1 完成必须满足：

- `apps/web` 可启动并访问 `/home`。
- `apps/admin` 可启动并访问 `/admin/dashboard`。
- `apps/api` 可启动并访问 `/api/health`。
- 数据库迁移可执行。
- Redis 连接失败时 API 给出明确错误日志。
- 登录页可展示。
- `GET /api/auth/me` 可正确返回 401 或用户信息。
- 所有页面为浅色主题。
- 代码中不存在 `dark` class 或主题切换逻辑。

