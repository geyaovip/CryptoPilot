# API App Agent Rules

Applies to `apps/api`.

## Cursor Rules

- `.cursor/rules/backend.mdc`
- `.cursor/rules/database.mdc`
- `.cursor/rules/security.mdc`
- `.cursor/rules/prompt-ai.mdc` when touching AI.
- `.cursor/rules/testing.mdc`

## MUST

- Use NestJS.
- Use TypeScript.
- Use Prisma for database access.
- Use BullMQ for async jobs.
- Use provider interfaces for external services.
- Validate DTOs.
- Return consistent API responses.
- Log errors with `request_id`.

## Domain Modules

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

## FORBIDDEN

- No business logic in controllers.
- No raw SQL unless explicitly justified.
- No secrets in logs.
- No admin route without admin guard.
- No long-running AI or ingestion task inside request thread.

