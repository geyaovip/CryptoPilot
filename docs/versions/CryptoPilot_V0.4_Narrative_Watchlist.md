# CryptoPilot V0.4 Narrative + Watchlist 开发规格

版本目标：完善 Narrative 页面、Narrative 详情、Watchlist 和用户兴趣匹配，让产品从新闻流升级为叙事驱动的信息终端。  
依赖版本：V0.3 AI 已完成。

**首页 Phase 1 体验（Summary-first）不在本版本范围**；本版本只做 Narrative **页面**与 Watchlist（Phase 2 入口）。路线见 `docs/design/Home_Feed_Evolution_Phases.md`；Summary-first UI 见 **V0.7**。

---

## 1. 本版本必须完成

- Narrative 列表页。
- Narrative 详情页。
- Narrative 热度趋势。
- Narrative AI Summary。
- Watchlist 页面。
- Watchlist API。
- Token、Narrative、KOL 关注。
- User Interest Score。
- Admin Narrative 管理增强。
- Admin Token/KOL 管理。

## 2. 本版本禁止实现

- 不支持钱包 Watchlist。
- 不实现 Telegram Push。
- 不实现 Smart Money。
- 不实现 Pro 订阅。
- 不实现自定义 Alert Center。

---

## 3. Narrative 范围

MVP 必须内置：

- AI
- Meme
- RWA
- DePIN
- Stablecoin
- Layer2
- Solana
- Ethereum

Admin 可新增 Narrative，但前台默认只展示 `is_active=true` 的 Narrative。

## 4. Narrative 页面

### `/narratives`

Desktop 从 Sidebar 进入，Mobile 通过 Home Chip 或 Search 进入。

列表字段：

- name
- heat_score
- trend_score_24h
- trend_score_7d
- top_tokens
- feed_count_24h
- ai_summary
- sentiment
- Follow 按钮

排序：

- Hottest：heat_score。
- Fastest Rising：trend_score_24h。
- Most Discussed：feed_count_24h。

状态：

- Loading skeleton。
- Empty。
- Error + Retry。

### `/narratives/:slug`

必须展示：

- Narrative Header。
- AI Narrative Summary。
- Heat Chart：24h、7d、30d。
- Top Tokens。
- Related Feed。
- Top Sources。
- Sentiment。
- Follow 按钮。

## 5. Watchlist

### `/watchlist`

必须展示：

- 关注对象 Tabs：All、Tokens、Narratives、KOL。
- 每个对象的名称、类型、24h 变化、最新动态。
- AI Summary。
- 通知开关。
- Remove 操作。

Empty State：

- 未关注时显示可添加 Token/Narrative/KOL 的入口。

## 6. User Interest Score

Feed Ranking 增加：

```txt
user_interest_score =
token_match_score * 0.45
+ narrative_match_score * 0.45
+ kol_match_score * 0.10
```

规则：

- Feed related token 命中 Watchlist Token：100。
- Feed narrative 命中 Watchlist Narrative：100。
- Feed source/KOL 命中 Watchlist KOL：100。
- 未登录用户固定 0。

## 7. API 清单

必须实现：

- `GET /api/narratives`
- `GET /api/narratives/:slug`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:id`
- `PATCH /api/watchlist/:id/notification`
- `GET /api/tokens`
- `GET /api/kols`
- `GET /api/admin/narratives`
- `POST /api/admin/narratives`
- `PATCH /api/admin/narratives/:id`
- `GET /api/admin/tokens`
- `PATCH /api/admin/tokens/:id`
- `POST /api/admin/tokens/:id/refresh`
- `GET /api/admin/kols`
- `POST /api/admin/kols`
- `PATCH /api/admin/kols/:id`

## 8. 数据库新增

必须完善：

- narratives
- tokens
- kols
- watchlist_items
- narrative_heat_snapshots

### narrative_heat_snapshots

- id
- narrative_id
- heat_score
- twitter_mentions
- feed_count
- token_volume_change
- captured_at

索引：

- `narrative_heat_snapshots(narrative_id, captured_at)`
- `watchlist_items(user_id, target_type, target_id)` unique。

## 9. Admin

### Narrative 管理

必须支持：

- 创建、编辑、隐藏。
- 合并 Narrative。
- 设置权重。
- 编辑 AI Summary。
- 查看关联 Feed。

### Token 管理

必须支持：

- 查看列表。
- 编辑 symbol、name、coingecko_id。
- 设置展示状态。
- 手动刷新行情。

### KOL 管理

必须支持：

- 创建 KOL。
- 编辑 handle、platform、profile_url。
- 设置 influence_score。
- 启用/停用。

## 10. 测试清单

必须包含：

- Narrative 列表排序测试。
- Narrative 详情数据组装测试。
- Watchlist 添加重复限制测试。
- Watchlist 删除测试。
- User Interest Score 测试。
- Admin Narrative 权限测试。
- Watchlist 页面 smoke test。

## 11. 验收标准

V0.4 完成必须满足：

- 用户可浏览 Narrative 列表和详情。
- 用户可关注 Token、Narrative、KOL。
- 用户可在 Watchlist 看到关注对象动态。
- Home Feed 对已登录用户使用 user_interest_score。
- Admin 可管理 Narrative、Token、KOL。
- Mobile 底部导航仍然只有 Home、Search、Watchlist、Me。
- 不出现钱包关注功能。
- 首页 Feed **允许保持 V0.2–V0.3 过渡态**（RSS 标题 + ai_summary）；不要求 Insight-first 改版。

## 12. 实现补充（V0.4 收尾，已完成）

- Web：叙事列表/详情 **关注按钮**；Watchlist **通知开关**；详情 **Top Tokens / Top Sources**；首页 `?narrative=` 筛选。
- API：`NarrativeAiService` 定时刷新 `ai_summary`；Admin **重生 AI 摘要**。
- Admin：Narrative 创建/隐藏/合并/编辑摘要与权重；Token 编辑/刷新；KOL 创建/停用。
- Seed：8 个内置叙事激活，旧示例叙事 `is_active=false`。

**下一版本**：`CryptoPilot_V0.6_MVP_Beta.md`（Telegram 见 V0.5，延后最后）。

