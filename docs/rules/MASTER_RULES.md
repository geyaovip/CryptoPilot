# CryptoPilot AI 开发总规则

本文件是 CryptoPilot 项目的最高优先级开发规则。所有 AI 开发 Agent 在写代码前必须先读取并遵守本文件。

如果不同文档之间出现冲突，必须按以下优先级执行：

1. 当前用户明确要求。
2. 当前版本文档：`docs/versions/`。
3. 当前模块文档：`docs/modules/`。
4. 本文件：`docs/rules/MASTER_RULES.md`。
5. 其他规则文件：`docs/rules/*-rules.md`。
6. `CryptoPilot_MVP_PRD_AI_Execution.md`。
7. `CryptoPilot_Full_PRD_AI_Execution.md`。

---

## 1. 产品范围

产品名称固定为：

- CryptoPilot

MVP 产品形态固定为：

- Web-first
- PWA
- Admin Web
- NestJS API
- Telegram Bot

MVP 禁止实现：

- Native React Native app
- Smart Money
- Pro subscription
- Payment
- Wallet login
- Wallet tracking
- Trading
- AI auto-trading
- Dark theme

除非当前版本文档明确要求，否则 AI 不得实现未来阶段功能。

---

## 2. 开发顺序

AI 必须按以下顺序开发：

1. V0.1 Skeleton
2. V0.2 Feed
3. V0.3 AI
4. V0.4 Narrative + Watchlist
5. V0.5 Telegram Push
6. V0.6 MVP Beta

前一版本未通过验收前，不得开发后一版本功能。

---

## 3. 写代码前必须读取

每次开发某个版本前，AI 必须读取：

1. `README_AI_DEVELOPMENT_DOCS.md`
2. `CryptoPilot_MVP_PRD_AI_Execution.md`
3. 当前版本文档：`docs/versions/*`
4. 当前任务相关模块文档：`docs/modules/*`
5. 相关规则文件：`docs/rules/*-rules.md`

如果当前开发版本不明确，必须先询问，不得直接写代码。

---

## 4. 代码库边界

必须使用以下 Monorepo 结构：

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
```

禁止创建替代根目录，例如：

- `/client`
- `/server`
- `/backend`
- `/frontend`
- `/dashboard`

---

## 5. 技术栈

Frontend 必须使用：

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand

Backend 必须使用：

- NestJS
- TypeScript
- PostgreSQL
- pgvector
- Redis
- BullMQ

数据库 ORM：

- 默认使用 Prisma。
- 如果项目已经初始化了其他 ORM，必须先说明再继续。
- 禁止同时混用 Prisma 和 TypeORM。

---

## 6. UI 主题

CryptoPilot MVP 只能使用浅色主题。

必须使用：

- 白色和中性色背景。
- 浅色 Card。
- 浅色 Sidebar。
- 浅色 Header。
- 清晰边框。
- 金融工具类高信息密度布局。

禁止：

- Dark mode。
- 主题切换。
- `dark` class。
- 系统主题自动检测。
- 大面积深色面板。
- 荧光 crypto 赌博风格。
- 大面积渐变背景。

---

## 7. AI 输出规则

AI 生成的市场内容必须：

- 包含来源。
- 区分事实和推测。
- 不输出投资建议。
- 不承诺收益。
- 在要求结构化输出时必须使用 JSON。
- 保存前必须通过 schema validation。

AI 生成的市场内容禁止：

- 直接建议 buy、sell、long、short、leverage。
- 编造来源。
- 隐藏证据不足。
- 把推测写成事实。

---

## 8. 文件与模块规则

必须遵守：

- 单文件不超过 300 行。
- 超过 300 行必须拆分为 component、service、hook、schema 或 util。
- 所有业务代码必须使用 TypeScript。
- 核心业务类型不得使用 `any`。
- 共享 API 类型必须放在 `/packages/types`。
- 共享 UI 基础组件必须放在 `/packages/ui`。
- Prompt 模板或 Prompt 元数据必须放在 `/packages/prompts`。

---

## 9. API 规则

所有 API 必须：

- 使用 JSON。
- 返回 `request_id`。
- 使用统一错误结构。
- 校验输入。
- 按需校验登录态。
- `/api/admin/*` 必须校验 admin 角色。

错误响应格式：

```json
{
  "code": "string",
  "message": "string",
  "request_id": "string"
}
```

---

## 10. 数据与日志规则

所有核心表必须包含：

- `id`
- `created_at`
- `updated_at`

业务数据默认使用软删除：

- `deleted_at`

必须记录：

- API errors
- ingestion errors
- LLM call logs
- Push delivery logs
- Admin audit logs

所有 Admin 写操作必须创建 audit log。

---

## 11. 质量门禁

一个版本被视为完成前，必须满足：

- 当前版本文档中的所有验收标准已通过。
- 新增页面必须有 Loading、Empty、Error、Retry 状态。
- Admin 权限校验通过。
- API 输入校验通过。
- 主要页面保持浅色主题。
- 不存在 MVP 禁止功能。

如果测试无法运行，必须明确说明原因和未验证项。

### 11.1 每次修复后的 Agent 自测（强制）

完成 bug 修复或联调相关改动后，**必须先自行验证，通过后再向用户汇报**；验证失败则继续修改，不得让用户充当第一轮 QA。

详细步骤见：`docs/rules/agent-verification-workflow.md`（Fix → `pnpm typecheck` / `pnpm test` → 针对性 API/页面验证 → 汇报）。

向用户说明「已修好」时，必须列出**已执行的验证命令或步骤**及结果。

