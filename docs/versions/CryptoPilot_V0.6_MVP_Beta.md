# CryptoPilot V0.6 MVP Beta 开发规格

版本目标：将 V0.1–V0.4 功能整合为可小范围真实用户试用的 MVP Beta，补齐稳定性、权限、安全、观测、PWA、测试和部署。  
依赖版本：V0.4 Narrative + Watchlist 已完成。  
**说明**：Telegram Push（`CryptoPilot_V0.5_Telegram_Push.md`）为独立延后版本，**不是**本版本前置依赖。

---

## 1. 本版本必须完成

- PWA 安装体验。
- 全站响应式 QA。
- 权限校验收口。
- Admin 审计日志。
- 日志中心。
- 系统配置。
- Feature Flag。
- 错误处理统一。
- API 限流。
- 环境变量检查。
- 部署配置。
- Seed 数据。
- Smoke Test。
- 性能优化。
- 安全检查。

## 2. 本版本禁止实现

- 不新增长期功能。
- V0.7–V0.9 首页阶段能力已进入后续路线；本文件只保留 V0.6 稳定性、权限、安全、观测、PWA、测试和部署要求，不再阻止后续首页/Insight 能力补齐。
- 不实现 Smart Money。
- 不实现 Pro 订阅。
- 不实现 Native App。
- 不引入暗色主题。

---

## 3. PWA

必须实现：

- manifest。
- app icon。
- service worker。
- offline fallback。
- installable。

PWA 名称：CryptoPilot。

## 4. 权限收口

必须检查：

- 所有 `/api/admin/*` 必须 admin 角色。
- 所有 Watchlist API 必须登录。
- 所有 Bookmark API 必须登录。
- AI Search 必须登录并限流。
- Telegram bind 必须登录。
- Telegram webhook 必须校验 secret。

## 5. 日志中心

Admin `/admin/logs` 必须展示：

- API 错误日志。
- 数据采集错误日志。
- LLM 错误日志。
- Push 错误日志。
- Admin 审计日志。

必须支持：

- 按类型筛选。
- 按时间筛选。
- 查看详情。

## 6. 系统配置

Admin `/admin/config` 必须支持：

- heat_score 参数。
- AI Search 每日次数。
- Feed 自动刷新间隔。
- Telegram Push 每日上限。
- LLM Provider。
- Feature Flag。

配置更新必须写入 audit_logs。

## 7. 错误码

必须统一：

- `AUTH_REQUIRED`
- `ADMIN_REQUIRED`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `RATE_LIMITED`
- `DAILY_LIMIT_EXCEEDED`
- `SOURCE_UNAVAILABLE`
- `LLM_PROVIDER_ERROR`
- `TELEGRAM_WEBHOOK_INVALID`
- `INTERNAL_ERROR`

## 8. Seed 数据

必须提供：

- 1 个 admin 用户。
- 3 个普通用户。
- 4 个 RSS source。
- 10 个 Token。
- 8 个 Narrative。
- 20 条 Feed 示例。
- 5 个 KOL。
- 5 个 Prompt active 版本。

不得在生产环境自动创建弱密码账号。

## 9. 性能目标

必须满足：

- Home Feed API P95 < 1.5 秒。
- Feed Detail API P95 < 1 秒。
- AI Search 首包 P95 < 5 秒。
- Admin Feed 列表 P95 < 2 秒。
- Mobile Lighthouse Performance >= 80。

## 10. 安全要求

必须满足：

- 环境变量不入库。
- 外部链接使用安全属性。
- Webhook secret 校验。
- Admin 写操作审计。
- API 输入校验。
- SQL 注入防护。
- XSS 防护。
- CORS 限制。

## 11. 测试清单

必须包含：

- API 单元测试。
- API 集成测试。
- Heat Score 测试。
- AI Schema 测试。
- Push 限流测试。
- Admin 权限测试。
- 关键页面 smoke test。
- PWA manifest 测试。
- 移动端布局截图检查。

## 12. MVP Beta 验收

**说明**：Telegram 绑定与 Daily Digest 验收项延后至 `CryptoPilot_V0.5_Telegram_Push.md`，不阻塞 V0.6 主线发布。

V0.6 完成必须满足：

- 新用户可登录（Magic Link；Beta 可用 `*@cryptopilot.local` 或 `BETA_ALLOW_SIGNUP` 注册）。
- 用户可浏览 Feed。
- 用户可查看 Feed Detail。
- 用户可使用 AI Search。
- 用户可查看 Narrative。
- 用户可添加 Watchlist。
- 用户可收藏 Feed。
- ~~用户可绑定 Telegram。~~（V0.5）
- ~~用户可接收 Daily Digest。~~（V0.5）
- Admin 可管理 Feed。
- Admin 可管理 Narrative。
- Admin 可管理 Prompt。
- Admin 可查看 AI Monitor。
- Admin 可查看日志。
- Admin 可调整系统配置。
- 所有主要页面为浅色主题。
- 代码中无暗色主题切换。
- 可部署到 Vercel + Railway。

## 13. 从 V0.6 到 V1.0

V0.6 是 MVP Beta，可给小范围真实用户试用。  
V1.0 正式 MVP 必须基于真实试用反馈完成：

- Bug 修复。
- 文案优化。
- 性能优化。
- 数据源稳定性优化。
- AI 输出质量优化。
- 上线监控。
