# CryptoPilot

CryptoPilot 是一款 **AI 加密市场情报终端**。它聚合多来源新闻、市场叙事、资产信号与带来源的 AI 解读，帮助用户快速理解市场正在发生什么——**仅供研究参考，不提供投资建议**。

线上地址：[cryptopilot.chat](https://cryptopilot.chat)

> CryptoPilot 仅用于信息发现与研究，不构成财务、投资、交易或法律建议。

## 核心能力

- **Insight 市场雷达**：以多来源 AI 解读为主入口，可下钻查看相关市场信号
- **市场动态 Feed**：带来源链接、确定性标签与叙事感知聚类
- **AI 研究搜索**：自然语言提问，基于 RAG 检索已收录内容并生成带来源的研究简报
- **叙事与资产跟踪**：按市场主题跟踪热度、相关 Token 与最新动态
- **Telegram 推送**：日报、市场预警、关注列表提醒与发送日志
- **管理后台**：Feed、Insight、来源、Prompt、AI 监控、叙事、Token、用户、推送、配置与日志
- **数据管线**：RSS 采集、来源目录同步、质量过滤、聚类，以及可选的后台 AI 任务

## 仓库结构

```txt
apps/
  web/      用户端 Next.js 应用
  admin/    管理端 Next.js 应用
  api/      NestJS API、定时任务、Prisma、采集与 AI 管线
packages/
  types/    共享 API / 领域类型
  ui/       共享 UI 组件
  config/   共享配置工具
  shared/   共享工具函数
  prompts/  Prompt 模板与元数据
docs/       产品、模块、部署与开发文档
infra/      数据库初始化资源
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js App Router、TypeScript、TailwindCSS |
| 后端 | NestJS、TypeScript |
| 数据库 | PostgreSQL、Prisma、pgvector |
| 缓存 / 队列 | Redis |
| AI | 可路由的 OpenAI 兼容 LLM 层，支持 mock 降级 |
| 部署 | 前端 Cloudflare Workers（OpenNext）；API 支持 Linux 服务器部署 |

## 本地开发

### 环境要求

- Node.js 22+
- pnpm 11.2.2
- Docker Desktop 或 Docker Engine

### 安装依赖

```bash
corepack enable
corepack prepare pnpm@11.2.2 --activate
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env
```

本地开发默认使用本机 PostgreSQL 与 Redis：

```env
DATABASE_URL="postgresql://cryptopilot:cryptopilot_dev_password@localhost:5432/cryptopilot?schema=public"
REDIS_URL="redis://localhost:6379"
APP_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
API_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3002"
ENABLE_BACKGROUND_JOBS="false"
LLM_DEFAULT="mock"
LLM_ENABLE_EMBEDDINGS="false"
RAG_ENABLE_VECTOR_SEARCH="false"
```

说明：

- `ENABLE_BACKGROUND_JOBS` 本地默认关闭。仅在需要测试 RSS 采集、价格同步、AI 生成、聚类等后台任务时，对**单个** API 实例设为 `true`
- 本地开发默认使用 `mock` LLM，避免消耗真实 token；仅在联调模型提供商时切换为真实配置

### 启动服务

```bash
pnpm docker:up
pnpm db:deploy
pnpm db:seed
pnpm dev
```

本地访问地址：

| 服务 | 地址 |
|------|------|
| 用户端 | http://localhost:3000 |
| 管理端 | http://localhost:3001 |
| API 健康检查 | http://localhost:3002/api/health |

## 常用命令

```bash
pnpm dev                  # 并行启动 web、admin、api
pnpm typecheck            # 全仓库类型检查
pnpm test                 # 运行全部测试
pnpm db:deploy            # 应用 Prisma 迁移
pnpm db:seed              # 写入初始数据
pnpm db:refresh-content   # 从已配置来源刷新真实内容
pnpm db:sync-sources      # 同步来源目录到数据库
pnpm db:sync              # 同步 Prompt、系统配置、来源等运营配置
pnpm db:cluster-assign    # 重建 Feed 聚类分配
pnpm db:hide-low-value-feeds
```

## AI 与 LLM 配置

API 支持为不同 AI 能力路由到不同提供商：

```env
LLM_DEFAULT="moonshot"
LLM_ROUTE_AI_SEARCH="moonshot"
LLM_ROUTE_FEED_SUMMARY="deepseek"
LLM_ROUTE_EMBEDDING="openai"
```

当前支持的 OpenAI 兼容提供商 ID：

- `openai`
- `deepseek`
- `moonshot` / `kimi`
- `mock`

未配置真实 API Key 时，系统会降级到 mock 输出，**仅适用于开发环境**。

生产环境建议配置成本护栏：

```env
LLM_MAX_OUTPUT_TOKENS="800"
LLM_DAILY_TOKEN_BUDGET="250000"
LLM_DAILY_COST_BUDGET_USD="3"
LLM_FEED_AI_BATCH_SIZE="2"
LLM_INSIGHT_BATCH_SIZE="3"
```

此外，标签、聚类与低价值 Feed 摘要等场景内置确定性降级规则，本地开发与成本受控的生产环境不必对每条内容都调用 LLM。

### 向量检索（pgvector）

项目已集成 pgvector，用于 AI 搜索的语义召回，但默认关闭：

```env
LLM_ENABLE_EMBEDDINGS="true"      # 开启 embedding 写入与查询
RAG_ENABLE_VECTOR_SEARCH="true"   # 关键词命中不足时启用向量检索
```

Feed AI 摘要与 Insight 合成完成后会写入 `content_embeddings`；AI 搜索默认以关键词检索为主，向量检索作为补充。

## 数据来源

来源定义位于 `apps/api/src/modules/ingestion/source-catalog.ts`，通过以下命令同步：

```bash
pnpm db:sync-sources
```

默认目录包括：

- 中文媒体与快讯：BlockBeats、PANews、Cointelegraph CN、BTC Study 等
- Web3 媒体与项目博客：CoinDesk、Cointelegraph、Decrypt、The Block、Ethereum Foundation、Vitalik、Lido、Aave Governance 等
- 精选 Medium、Substack、Paragraph RSS
- Reddit 来源已定义但默认暂停，待配置 API 凭证后启用

镜像 Feed 未纳入默认目录，因在 API 采集运行时曾触发限流。

## 部署说明

前端通过 OpenNext 部署到 Cloudflare Workers：

```bash
pnpm --filter @cryptopilot/web build:cloudflare
pnpm --filter @cryptopilot/web deploy:cloudflare
pnpm --filter @cryptopilot/admin build:cloudflare
pnpm --filter @cryptopilot/admin deploy:cloudflare
```

推送到 `main` 分支时，GitHub Actions 会自动部署 web 与 admin。生产 API 建议配置：

```env
NODE_ENV="production"
ENABLE_BACKGROUND_JOBS="true"
APP_URL="https://cryptopilot.chat"
ADMIN_URL="https://admin.cryptopilot.chat"
API_URL="https://api.cryptopilot.chat"
```

API 部署流程会执行 Prisma 迁移、构建服务、重启、健康检查，并通过 `pnpm --filter @cryptopilot/api db:sync` 同步运营配置到数据库。

更多细节见 [docs/DEPLOY.md](docs/DEPLOY.md)。

## 安全与产品边界

- 不要提交密钥或生产环境 `.env` 文件
- AI 生成的市场内容应尽可能附带可核验来源
- 产品不得输出交易指令、收益承诺、杠杆建议或直接买卖推荐
- 后台任务默认只在一个生产 API 实例上启用，除非引入分布式锁
- 管理端写操作需记录审计日志；`/admin/logs` 应可用于 API、采集、LLM、推送与审计排查

## 开发文档

面向 AI Agent 与开发者的文档索引见 [README_AI_DEVELOPMENT_DOCS.md](README_AI_DEVELOPMENT_DOCS.md)，包含版本规划与模块规格说明。
