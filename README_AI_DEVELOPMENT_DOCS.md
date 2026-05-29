# CryptoPilot AI 开发文档索引

本目录用于让 Cursor / AI 开发 Agent 按版本自主开发 CryptoPilot。

---

## 1. 顶层文档

- `.cursor/rules/*`：Cursor 项目规则，按全局或文件 glob 自动注入。
- `AGENTS.md`：跨 Agent 兼容入口，保留项目介绍、技术栈和开发流程。
- `docs/development-kickoff-checklist.md`：正式开发 V0.1 前的准备清单。
- `docs/cursor-rules-index.md`：Cursor rules 索引。
- `docs/rules/MASTER_RULES.md`：AI 开发最高优先级规则。
- `docs/rules/agent-verification-workflow.md`：修复后自测流程（通过后再向用户汇报）。
- `docs/rules/architecture-rules.md`：架构边界、模块、依赖方向规则。
- `docs/rules/frontend-rules.md`：前端开发、布局、状态、主题规则。
- `docs/rules/ui-rules.md`：UI 视觉、布局、组件、状态、响应式规则。
- `docs/rules/backend-rules.md`：NestJS 后端、Job、权限、日志、错误处理规则。
- `docs/rules/api-rules.md`：API 路径、响应、错误码、分页、权限、测试规则。
- `docs/rules/db-rules.md`：数据库建模、字段、约束、索引、迁移、审计规则。
- `docs/rules/prompt-rules.md`：Prompt 版本、变量、Schema、RAG、安全边界规则。
- `CryptoPilot_Full_PRD_AI_Execution.md`：完整产品蓝图，不直接作为 MVP 一次性开发输入。
- `CryptoPilot_MVP_PRD_AI_Execution.md`：MVP 总规格，定义 MVP 范围和约束。

## 2. 版本文档

AI 按版本路线推进，但当前仓库已经进入 V0.8 轻聚合与 V0.9 Market Insight 的部分实现阶段。后续开发应以“补齐当前实现与验收差距”为主，不再把 V0.7–V0.9 视为禁止进入的未来能力。

1. `docs/versions/CryptoPilot_V0.1_Skeleton.md`
2. `docs/versions/CryptoPilot_V0.2_Feed.md`
3. `docs/versions/CryptoPilot_V0.3_AI.md`
4. `docs/versions/CryptoPilot_V0.4_Narrative_Watchlist.md`
5. `docs/versions/CryptoPilot_V0.6_MVP_Beta.md` — MVP Beta 收口（PWA、权限、日志、限流、测试、部署）
6. `docs/versions/CryptoPilot_V0.7_AI_Curated_Feed.md` — Phase 1 Summary-first 首页体验
7. `docs/versions/CryptoPilot_V0.8_Narrative_Feed.md` — **当前重点补齐**：Phase 2 Narrative Layer + 方案 B 轻聚合（`cluster_id` + 信号流 Tab）
8. `docs/versions/CryptoPilot_V0.9_Market_Intelligence.md` — **当前部分实现，继续补齐**：Phase 3 Insight 实体与市场雷达

**延后至 MVP 主线完成之后（单独版本，不插队）：**

9. `docs/versions/CryptoPilot_V0.5_Telegram_Push.md` — Telegram 绑定与推送（最后做，不着急）

Smart Money、Pro 订阅、Native App、支付、交易等仍然禁止进入 MVP。Insight 已进入 V0.9 路线，相关功能应继续按 V0.9 验收补齐。

## 3. 产品路线与模块文档

- `docs/design/Home_Feed_Evolution_Phases.md`：首页三阶段演进（Curated → Narrative → Intelligence）
- `docs/modules/Home_Feed_and_Feed_Detail.md`
- `docs/modules/AI_Search_and_AI_Pipeline.md`
- `docs/modules/Admin_CMS.md`
- `docs/modules/Data_Ingestion.md`
- `docs/modules/Telegram_Push.md`

## 4. 文档优先级

当文档冲突时，优先级如下：

1. 当前用户请求。
2. `.cursor/rules/global.mdc` 与当前文件匹配的 Cursor rules。
3. 当前目录最近的 `AGENTS.md`。
4. 当前版本文档。
5. 当前模块文档。
6. `docs/rules/MASTER_RULES.md`。
7. `docs/rules/*-rules.md`。
8. `CryptoPilot_MVP_PRD_AI_Execution.md`。
9. `CryptoPilot_Full_PRD_AI_Execution.md`。

## 5. 强制约束

- 产品名称固定为 CryptoPilot。
- MVP 只做 Web-first + PWA。
- MVP 不开发 React Native。
- MVP 不开发 Smart Money。
- MVP 不开发 Pro 订阅。
- MVP 不开发暗色主题。
- 所有 AI 输出必须有来源。
- 不得输出投资建议。
- 每个版本必须通过验收标准后再进入下一版本。
