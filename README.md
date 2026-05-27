# CryptoPilot

CryptoPilot is an AI-assisted crypto market intelligence product. It aggregates market news, narratives, token signals, and source-backed AI summaries to help users understand what is moving in the crypto market without turning the product into trading advice.

> CryptoPilot is for research and information discovery only. It does not provide financial, investment, trading, or legal advice.

## What It Does

- Curated market feed with AI summaries and source links.
- AI Search for natural-language crypto market questions.
- Narrative and token tracking for market themes.
- Admin console for feeds, sources, prompts, AI monitoring, narratives, tokens, and logs.
- RSS ingestion, feed quality filtering, clustering, and optional background AI jobs.

## Monorepo Structure

```txt
apps/
  web/      User-facing Next.js app
  admin/    Admin Next.js app
  api/      NestJS API, jobs, Prisma, ingestion, AI pipeline
packages/
  types/    Shared API/domain types
  ui/       Shared UI primitives
  config/   Shared config helpers
  shared/   Shared utilities
  prompts/  Prompt templates and metadata
docs/       Product, module, deployment, and agent development docs
infra/      Database initialization assets
```

## Tech Stack

- Frontend: Next.js App Router, TypeScript, TailwindCSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL, Prisma, pgvector
- Cache/queue foundation: Redis
- AI: provider-routed OpenAI-compatible LLM layer with mock fallback
- Deployment: Cloudflare Workers for frontend apps, Linux server/API deployment support

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11.2.2
- Docker Desktop or Docker Engine

### Install

```bash
corepack enable
corepack prepare pnpm@11.2.2 --activate
pnpm install
```

### Configure Environment

```bash
cp .env.example .env
```

For local development, the defaults use local PostgreSQL and Redis:

```env
DATABASE_URL="postgresql://cryptopilot:cryptopilot_dev_password@localhost:5432/cryptopilot?schema=public"
REDIS_URL="redis://localhost:6379"
APP_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
API_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3002"
ENABLE_BACKGROUND_JOBS="false"
```

`ENABLE_BACKGROUND_JOBS` is intentionally off by default for local development. Set it to `true` only for the API instance that should run RSS ingestion, price sync, AI generation, clustering, and other scheduled jobs.

### Start Local Services

```bash
pnpm docker:up
pnpm db:deploy
pnpm db:seed
pnpm dev
```

Local URLs:

- Web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- API: `http://localhost:3002/api/health`

## Useful Commands

```bash
pnpm dev                  # Run web, admin, and API in parallel
pnpm typecheck            # Type-check all workspace packages/apps
pnpm test                 # Run all tests
pnpm db:deploy            # Apply Prisma migrations
pnpm db:seed              # Seed initial data
pnpm db:refresh-content   # Refresh real content from configured sources
pnpm db:sync-sources      # Sync source catalog into the database
pnpm db:hide-low-value-feeds
```

## AI And LLM Providers

The API can route different AI features to different providers:

```env
LLM_DEFAULT="moonshot"
LLM_ROUTE_AI_SEARCH="moonshot"
LLM_ROUTE_FEED_SUMMARY="deepseek"
LLM_ROUTE_EMBEDDING="openai"
```

Supported OpenAI-compatible provider IDs currently include:

- `openai`
- `deepseek`
- `moonshot` / `kimi`
- `mock`

If no real API key is configured, the system falls back to mock behavior. Mock output is intended for development only.

## Deployment Notes

Current frontend deployment is designed for Cloudflare Workers via OpenNext:

```bash
pnpm --filter @cryptopilot/web build:cloudflare
pnpm --filter @cryptopilot/web deploy:cloudflare
pnpm --filter @cryptopilot/admin build:cloudflare
pnpm --filter @cryptopilot/admin deploy:cloudflare
```

Production API instances should set:

```env
NODE_ENV="production"
ENABLE_BACKGROUND_JOBS="true"
APP_URL="https://cryptopilot.chat"
ADMIN_URL="https://admin.cryptopilot.chat"
API_URL="https://api.cryptopilot.chat"
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for more deployment details.

## Safety Boundaries

- Do not commit secrets or production `.env` files.
- AI-generated market output must include sources where applicable.
- The product must not output trading instructions, return promises, leverage advice, or direct buy/sell recommendations.
- Keep background jobs enabled on only one production API instance unless distributed locking is introduced.

## Development Docs

Start with [README_AI_DEVELOPMENT_DOCS.md](README_AI_DEVELOPMENT_DOCS.md) for the AI-agent-oriented project documentation index, version plan, and module specs.
