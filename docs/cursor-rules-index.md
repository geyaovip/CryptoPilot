# Cursor Rules 索引

`.cursor/rules/` 是 Cursor 使用的项目级规则目录。Cursor 会根据 `alwaysApply` 和 `globs` 自动把相关规则注入上下文。

---

## Rules 列表

| Rule | 路径 | 作用范围 |
| --- | --- | --- |
| Global | `.cursor/rules/global.mdc` | 全局规则、版本边界、MVP 禁止范围 |
| Frontend | `.cursor/rules/frontend.mdc` | `apps/web`、`apps/admin`、`packages/ui` |
| UI | `.cursor/rules/ui.mdc` | 浅色主题、布局、组件状态、响应式 |
| Backend | `.cursor/rules/backend.mdc` | `apps/api` 的 NestJS、API、Job、日志 |
| Database | `.cursor/rules/database.mdc` | Prisma、PostgreSQL、pgvector、migration、索引 |
| Prompt AI | `.cursor/rules/prompt-ai.mdc` | Prompt、RAG、JSON Schema、LLM 日志、AI 安全 |
| Testing | `.cursor/rules/testing.mdc` | 单元测试、集成测试、smoke test、验收检查 |
| Security | `.cursor/rules/security.mdc` | Auth、Admin guard、Webhook、Rate limit、Secrets |
| Web App | `.cursor/rules/web-app.mdc` | 用户前台 PWA 路由和边界 |
| Admin App | `.cursor/rules/admin-app.mdc` | Admin CMS 路由、权限和表格工作台 |
| UI Package | `.cursor/rules/ui-package.mdc` | `packages/ui` 共享组件边界 |

---

## 使用方式

Cursor 会自动读取匹配规则。开发前只需要明确当前版本和任务范围：

```txt
请开始开发 CryptoPilot V0.1 Skeleton。

请遵守 .cursor/rules/ 中自动匹配的规则，并重点参考：
- README_AI_DEVELOPMENT_DOCS.md
- docs/design/Home_Feed_Evolution_Phases.md（首页三阶段）
- docs/rules/MASTER_RULES.md
- docs/versions/CryptoPilot_V0.1_Skeleton.md

严格只实现 V0.1 范围，不要实现 V0.2 或后续功能。
完成后请对照 V0.1 的验收标准输出验证结果。
```

---

## 维护规则

- Cursor 主规则只维护 `.cursor/rules/*.mdc`。
- `docs/rules/*.md` 保留为完整规格和人工阅读文档。
- `AGENTS.md` 只保留跨 Agent 兼容入口，不复制所有 Cursor rule 全文。
- 新增规则时优先使用明确的 `MUST` 和 `FORBIDDEN`，避免模糊建议。
