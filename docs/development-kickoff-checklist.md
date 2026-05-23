# CryptoPilot AI 开发前准备清单

本文件用于在正式进入 `V0.1 Skeleton` 开发前检查项目准备情况。未完成本清单前，不建议开始写业务代码。

---

## 1. 当前开发目标

第一阶段只启动：

- `V0.1 Skeleton`

必须读取：

1. `.cursor/rules/global.mdc`
2. `README_AI_DEVELOPMENT_DOCS.md`
3. `docs/rules/MASTER_RULES.md`
4. `docs/versions/CryptoPilot_V0.1_Skeleton.md`
5. 当前任务匹配的 `.cursor/rules/*.mdc`

---

## 2. 开发前需要确认的决策

以下决策已经固定，不得在开发中改动：

- 产品名称：CryptoPilot。
- MVP 形态：Web-first + PWA。
- Frontend：Next.js App Router + TypeScript + TailwindCSS + shadcn/ui。
- State：TanStack Query + Zustand。
- Backend：NestJS + TypeScript。
- Database：PostgreSQL + Prisma + pgvector。
- Queue/cache：Redis + BullMQ。
- UI 主题：浅色主题。

---

## 3. MVP 禁止范围

V0.1 到 V0.6 均不得实现：

- React Native App。
- Smart Money。
- Pro subscription。
- Payment。
- Wallet login。
- Wallet tracking。
- Trading。
- AI auto-trading。
- Dark theme。

---

## 4. 开发环境准备

本地需要准备：

- Node.js LTS。
- pnpm。
- PostgreSQL。
- Redis。
- Git。

V0.1 开发时必须生成：

- `.env.example`
- monorepo package scripts
- database migration
- seed script

真实 `.env` 不得提交到仓库。

---

## 5. 第三方账号准备

V0.1 可先不填真实 key，但后续版本需要准备：

### V0.1

- Google OAuth Client ID/Secret。

### V0.2

- CoinGecko API key，如果使用免费公开接口则先留空。
- RSS source URLs。

### V0.3

- OpenAI API key。
- Anthropic API key，可选但配置位必须保留。

### V0.5

- Telegram Bot token。
- Telegram webhook secret。

### 部署

- Vercel 账号。
- Railway 账号。
- Railway PostgreSQL。
- Railway Redis。

---

## 6. 推荐启动指令

给 Cursor 的第一条开发指令建议：

```txt
请开始开发 CryptoPilot V0.1 Skeleton。

请遵守 .cursor/rules/ 中自动匹配的规则，并重点参考：
- README_AI_DEVELOPMENT_DOCS.md
- docs/rules/MASTER_RULES.md
- docs/versions/CryptoPilot_V0.1_Skeleton.md

严格只实现 V0.1 范围，不要实现 V0.2 或后续功能。
完成后请对照 V0.1 的验收标准输出验证结果。
```

---

## 7. 每个版本完成前必须检查

必须输出：

- 实现了哪些内容。
- 修改了哪些文件。
- 如何运行。
- 如何验证。
- 已完成哪些验收项。
- 未完成哪些验收项和原因。
- 哪些测试已运行。
- 哪些测试未运行和原因。

---

## 8. 开发节奏

每个版本按以下节奏执行：

1. 读取文档。
2. 列出实现计划。
3. 实现当前版本。
4. 运行 lint/typecheck/test。
5. 对照验收标准检查。
6. 修复问题。
7. 输出版本完成报告。

不得在一个任务中同时开发多个版本。

