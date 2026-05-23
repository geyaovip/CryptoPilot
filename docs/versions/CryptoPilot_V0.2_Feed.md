# CryptoPilot V0.2 Feed 开发规格

版本目标：实现可浏览的 Home Feed、Feed Detail、RSS 采集、CoinGecko 行情采集、Feed 排序和 Admin Feed 管理。  
依赖版本：V0.1 Skeleton 已完成。  
版本性质：信息流 MVP，不调用 LLM，不实现 AI Search。

---

## 1. 本版本必须完成

- Feed 数据模型。
- Source 数据模型。
- Token 数据模型。
- Narrative 数据模型基础版。
- RSS 采集任务。
- CoinGecko Token 行情同步任务。
- Feed 去重。
- Heat Score 基础计算。
- Home Feed 页面。
- Feed Detail 页面。
- Trending API。
- Admin Feed 管理。
- Admin Source 监控基础版。
- Bookmark 功能。

## 2. 本版本禁止实现

- 不调用 LLM 生成总结。
- 不实现 AI Search。
- 不实现 Telegram Push。
- 不实现 Watchlist。
- 不实现 Smart Money。
- 不实现 WebSocket。
- 不实现暗色主题。

---

## 3. 数据源

### RSS

默认接入：

- CoinDesk
- Cointelegraph
- Decrypt
- The Block

刷新频率：每 5 分钟。

### CoinGecko

默认同步 Token：

- BTC
- ETH
- SOL
- BNB
- XRP
- DOGE
- ADA
- AVAX
- LINK
- TON

刷新频率：每 60 秒。

## 4. 数据清洗

必须实现：

- URL 唯一去重。
- title 为空的数据不入库。
- source_url 为空的数据不入库。
- 相同 title + source 只保留一条。
- `publish_time` 为空时使用采集时间。
- source_weight 默认 50。

## 5. Heat Score

V0.2 使用基础算法：

```txt
heat_score =
recency_score * 0.45
+ source_weight * 0.30
+ token_move_score * 0.25
```

`recency_score`：

- 1 小时内：100
- 6 小时内：80
- 24 小时内：60
- 72 小时内：30
- 超过 72 小时：10

`token_move_score`：

- related token 24h 绝对涨跌幅 >= 10%：100
- >= 5%：70
- >= 2%：40
- 未匹配 Token：0

## 6. 页面规格

### Web `/home`

布局：

- Mobile：单列。
- Desktop：左 Sidebar、中 Feed、右 Market Panel。

必须显示：

- Header：Logo、Search 入口、用户入口。
- Market Heat Bar：BTC、ETH 价格和 24h 涨跌。
- Trending Narrative Chips：最多 5 个。
- Feed Tabs：For You、Latest、Breaking。
- Feed List。

Feed Card 字段：

- title
- ai_summary：V0.2 使用 `content` 前 160 字截断，字段名仍为 `ai_summary`
- source
- publish_time
- related_tokens
- narrative_tags
- sentiment：固定 `neutral`
- heat_score

状态：

- Loading：骨架屏。
- Empty：显示“暂无热点内容”。
- Error：显示重试按钮。

### Web `/feed/:id`

必须显示：

- title
- source
- publish_time
- ai_summary
- content
- related_tokens
- narrative_tags
- source_url
- Similar Feed

V0.2 的 Key Reasons、Market Impact 可展示占位 Empty State，不调用 AI。

### Admin `/admin/feed`

表格字段：

- title
- type
- source
- heat_score
- publish_time
- status
- is_pinned

筛选：

- status
- source
- type
- publish_time range

操作：

- 编辑 title。
- 编辑 ai_summary。
- 置顶/取消置顶。
- 隐藏/恢复。
- 删除。
- 手动创建 Feed。

### Admin `/admin/sources`

表格字段：

- name
- type
- status
- last_success_at
- last_error_at
- fetch_interval_seconds

操作：

- 启停。
- 手动重试。
- 查看最近 50 条采集日志。

## 7. API 清单

必须实现：

- `GET /api/feed`
- `GET /api/feed/:id`
- `GET /api/trending`
- `GET /api/bookmarks`
- `POST /api/bookmarks`
- `DELETE /api/bookmarks/:id`
- `GET /api/admin/feed`
- `POST /api/admin/feed`
- `PATCH /api/admin/feed/:id`
- `POST /api/admin/feed/:id/pin`
- `POST /api/admin/feed/:id/hide`
- `GET /api/admin/sources`
- `PATCH /api/admin/sources/:id`
- `POST /api/admin/sources/:id/retry`

## 8. 数据库新增

必须新增：

- sources
- feed_items
- tokens
- narratives
- feed_item_tokens
- feed_item_narratives
- bookmarks
- ingestion_logs

关键约束：

- `feed_items.source_url` unique。
- `tokens.symbol` indexed。
- `narratives.slug` unique。
- `bookmarks(user_id, feed_item_id)` unique。

## 9. 后台审计

以下操作写入 audit_logs：

- 创建 Feed。
- 编辑 Feed。
- 置顶 Feed。
- 隐藏 Feed。
- 删除 Feed。
- 启停 Source。
- 手动重试 Source。

## 10. 测试清单

必须包含：

- RSS parser 单元测试。
- Feed 去重测试。
- Heat Score 测试。
- `GET /api/feed` 集成测试。
- `GET /api/feed/:id` 集成测试。
- Admin Feed 权限测试。
- Home 页面 smoke test。
- Feed Detail 页面 smoke test。

## 11. 验收标准

V0.2 完成必须满足：

- RSS 可自动采集并生成 Feed。
- CoinGecko 可同步价格。
- Home 能展示真实 Feed。
- Feed Detail 能打开并跳转原文。
- Feed 支持分页。
- Bookmark 可新增和删除。
- Admin 可编辑、隐藏、置顶 Feed。
- Admin 可查看 Source 状态。
- Feed 列表接口 P95 < 1.5 秒。
- 全部新增页面为浅色主题。

