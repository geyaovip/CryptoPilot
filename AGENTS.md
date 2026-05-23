# CryptoPilot Agent Rules

This is the cross-agent fallback instruction file. Cursor should primarily use `.cursor/rules/*.mdc`; keep this file as a concise project overview for tools that read `AGENTS.md`.

## Required Reading

Before any coding task, read:

1. `README_AI_DEVELOPMENT_DOCS.md`
2. `docs/rules/MASTER_RULES.md`
3. The active version spec in `docs/versions/`
4. Relevant module specs in `docs/modules/`
5. Relevant Cursor rules in `.cursor/rules/`

If the active version is not specified, ask before coding.

## Stack

- Frontend: Next.js App Router + TypeScript + TailwindCSS + shadcn/ui
- State: TanStack Query + Zustand
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma + pgvector
- Queue/cache: Redis + BullMQ
- Product form: Web-first + PWA + Admin Web + Telegram Bot

## Version Order

Develop only one version at a time:

1. V0.1 Skeleton
2. V0.2 Feed
3. V0.3 AI
4. V0.4 Narrative + Watchlist（当前）
5. V0.6 MVP Beta（下一版本；Telegram 不插队）
6. V0.7 AI Curated Feed（Phase 1 首页体验）
7. V0.8 Narrative Feed（Phase 2）
8. V0.9 Market Intelligence（Phase 3）
9. V0.5 Telegram Push（**延后最后**，单独版本）

Do not implement later-version features before the active version passes acceptance.

Home Feed 路线见 `docs/design/Home_Feed_Evolution_Phases.md`。MVP 定位为 **AI Curated Market Feed**，不是 AI Narrative Engine。Insight 主表仅在 V0.9。

## Forbidden In MVP

- Dark theme
- Theme switcher
- React Native app
- Smart Money
- Pro subscription
- Payment
- Wallet login
- Wallet tracking
- Trading
- AI auto-trading

## Global Rules

- Keep files under 300 lines.
- Use TypeScript for all business code.
- Do not use `any` for core domain types.
- Put shared API types in `/packages/types`.
- Put shared UI primitives in `/packages/ui`.
- Do not commit secrets.
- Do not disable lint or tests to make work pass.
- All AI market output must have sources.
- Never output investment advice.

## Cursor Rules

Cursor project rules live in `.cursor/rules/`:

- `global.mdc`
- `frontend.mdc`
- `ui.mdc`
- `backend.mdc`
- `database.mdc`
- `prompt-ai.mdc`
- `testing.mdc`
- `security.mdc`
- `web-app.mdc`
- `admin-app.mdc`
- `ui-package.mdc`

## Before Finishing

**Self-verify first** (`docs/rules/agent-verification-workflow.md`): run `pnpm typecheck` and `pnpm test`, then targeted checks for what you changed (API curl, Admin/Web pages). Only report success after verification passes; otherwise keep fixing.

Report:

1. What changed.
2. Files changed.
3. How to run.
4. **Verification already run** (commands/steps + pass/fail).
5. How the user can re-verify (if different from above).
6. Version acceptance items completed.
7. Unverified items and why.

