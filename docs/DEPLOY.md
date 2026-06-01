# CryptoPilot MVP Beta 部署

## 架构

| 组件 | 建议平台 |
|------|----------|
| `apps/web` | Vercel |
| `apps/admin` | Vercel（独立项目或子路径） |
| `apps/api` | Railway / Render |
| PostgreSQL | Railway / Neon |
| Redis | Railway / Upstash |

## 环境变量

复制根目录 `.env.example`，在生产控制台配置：

- `DATABASE_URL` / `REDIS_URL`
- `AUTH_SECRET`（至少 16 字符，勿入库）
- `APP_URL` / `ADMIN_URL` / `API_URL`
- `NEXT_PUBLIC_API_URL`（Web/Admin 指向 API 公网地址）
- `NODE_ENV=production`
- `ADMIN_APP_URL`（管理端 Magic Link 回跳地址）
- `RESEND_API_KEY` / `MAIL_FROM`（生产 Magic Link 邮件发送）
- `MAGIC_LINK_EXPOSE=false`
- `BETA_DEV_LOGIN=false`
- LLM 相关 `MOONSHOT_*` / `DEEPSEEK_*` / `OPENAI_*`

生产服务器同步代码时必须排除 `.env`，避免本地开发配置覆盖线上密钥和域名：

```bash
rsync -az --delete \
  --exclude .env \
  --exclude node_modules \
  --exclude .git \
  --exclude apps/web/.next \
  --exclude apps/admin/.next \
  --exclude apps/api/dist \
  ./ ubuntu@<server>:/home/ubuntu/apps/CryptoPilot-release/
```

Magic Link 验证：

- 用户端请求应返回 `登录链接已发送，请查收邮件。`，且响应中不应出现 `magic_link_url`。
- 邮件链接应指向 `https://cryptopilot.chat/login?...`。
- 管理端邮件链接应指向 `https://admin.cryptopilot.chat/admin/login?...`。

## API（Railway）

1. 新建服务，根目录 monorepo，启动命令：`pnpm --filter @cryptopilot/api start`（或 `node dist/main.js` 若已 build）。
2. 部署前执行：`pnpm --filter @cryptopilot/api db:deploy && pnpm --filter @cryptopilot/api db:seed`（仅 staging；生产勿自动 seed 弱账号）。
3. 健康检查：`GET /api/health`。

## Web（Vercel）

1. Root：`apps/web`，Framework：Next.js。
2. 环境变量：`NEXT_PUBLIC_API_URL=https://<api-host>`。
3. `vercel.json` 已配置 PWA 静态资源缓存头。

## Admin（Vercel）

1. Root：`apps/admin`。
2. `NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_ADMIN_USER_ID`（可选，未登录 Bearer 时回退管理员 UUID）。

## 验证清单

- [ ] `POST /api/auth/login` 返回 token
- [ ] Web `/login` → `/home` Feed 可浏览
- [ ] Admin `/admin/logs`、`/admin/config` 可加载
- [ ] PWA manifest 与 `/sw.js` 可访问
- [ ] 无暗色主题开关
