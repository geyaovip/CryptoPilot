# 模块规格：Home Feed 与 Feed Detail

适用版本：V0.2 起  
产品路线：`docs/design/Home_Feed_Evolution_Phases.md`  
**MVP 首页定位：AI Curated Market Feed**（不是 AI Narrative Engine）。

---

## 1. 产品灵魂与阶段

首页决定用户是否 **每天刷**。分三阶段演进，禁止跳阶段做终局能力。

| 阶段 | 定位 | 首页主文案 |
| --- | --- | --- |
| **Phase 1** | AI Curated Market Feed | **AI Summary** 为核心，帮用户省阅读时间 |
| **Phase 2** | Narrative-aware Feed | 叙事变化表达（如 narrative heating up） |
| **Phase 3** | AI Market Intelligence | Insight 实体、多源、市场雷达信号 |

当前实现（V0.2–V0.3）= Phase 1 **后端部分完成**，**展示层仍为 RSS 标题主导**（待 V0.7 对齐）。

---

## 2. Phase 1 — AI Curated Market Feed（MVP 目标态）

### 2.1 用户目标（3 秒内）

- 今天有什么值得看的热点（已筛选、已总结）。
- 顶部能去 Search、能按 Topic 筛选。
- 点一条能看摘要、来源、相关问题 — **不必** 理解完整叙事或预测。

### 2.2 首页结构

**Mobile / Desktop 共性（中栏 Feed 主体）：**

1. **Header + Search 入口**（Search 必须保留且显眼）。
2. **Heat Strip**（可选轻量）：BTC/ETH 涨跌等。
3. **Topic Chips**（横向滚动）：AI、Meme、BTC、ETH、Solana、ETF…  
   - 点击：筛选 Feed 或进入 Narrative 详情（V0.4）。
4. **Feed Tabs**：For You（默认）、Latest、Breaking。
5. **AI Curated Feed 列表**。
6. Bottom Nav：Home、Search、Watchlist、Me。

Desktop 右栏：Trending Tokens、Narratives、Market Summary 占位（按 PRD）。

### 2.3 Feed Card（Phase 1）

| 顺序 | 字段 | 规则 |
| --- | --- | --- |
| 1 | `source_name` | 小字来源 |
| 2 | **`ai_summary`** | **最大字号**，核心文案 |
| 3 | `related_source_count` + 摘要 | 如「3 related sources」，来自 Similar Feed 或轻去重，**可无新表** |
| 4 | `tags` | `related_tokens`、`narrative_tags`（tags 非叙事推理） |
| 5 | Actions | Save、Share、Ask AI；Track → Watchlist（V0.4） |

**禁止**：媒体 `title` 作为列表主标题。`title` 仅用于详情溯源、SEO、Admin。

**时间**：列表弱化 `publish_time`；可用 `heat_score` 或 「🔥 Hot」。

### 2.4 Feed Detail（Phase 1）

1. **AI Summary**（主）
2. Original headline（`title`）+ 打开原文
3. Key Reasons、Market Impact（V0.3 字段，表述为摘要延伸，非预测行情）
4. Related Tokens / Tags
5. **Related sources**（Similar Feed 列表，每条含 source_name + url）
6. Ask AI、Save、风险提示

### 2.5 排序（Phase 1）

For You 使用 `rank_score`（V0.2 公式即可）：

```txt
rank_score =
  heat_score * 0.40
+ recency_score * 0.25
+ source_weight * 0.15
+ engagement_score * 0.10
+ user_interest_score * 0.10
```

V0.4 起 `user_interest_score` 对登录用户生效。  
Latest 可按时间；Breaking 按 type/heat。

### 2.6 数据与 AI（Phase 1）

- 主实体：**`feed_items`**（1 URL = 1 条）。
- 字段：`title`, `content`, `ai_summary`, `source_url`, `heat_score`, `rank_score`, `sentiment`, tags 关联表。
- AI：`feed_summary_prompt` 生成 `ai_summary`；**不要求** `ai_insight`、叙事推理、聚类表。

### 2.7 Phase 1 API

- `GET /api/feed`
- `GET /api/feed/:id`（含 `similar_feed` 作 related sources）
- `GET /api/trending`
- `POST /api/ai/search`
- Bookmarks → `feed_item_id`（Phase 1 不改为 insight）

### 2.8 Phase 1 验收

- 列表主文案为 **ai_summary**，不是媒体 title。
- Search 入口可见；Topic Chips 可用。
- 每条可溯源至少 1 个 source_url；详情可看到 related sources。
- For You 非纯时间排序；无投资建议。
- **未要求**：narrative_shift 类型、Insight 表、Smart Money。

---

## 3. Phase 2 — Narrative Layer（目标态摘要）

> 完整版本规格：`docs/versions/CryptoPilot_V0.8_Narrative_Feed.md`

- Feed 卡片出现 **叙事化主文案**（可与 `ai_summary` 并存或升级字段）。
- 类型徽章：`narrative_shift`、`sentiment_spike`、`market_rotation`、`breaking`、`kol_signal`。
- Topic Chips 与 Feed 排序联动 `narrative_importance`。
- V0.4 已有 Narrative 列表/详情页为本阶段基础设施。

**仍不做**：Smart Money、完整 Insight 引擎（留 Phase 3）。

---

## 4. Phase 3 — AI Market Intelligence（目标态摘要）

> 完整版本规格：`docs/versions/CryptoPilot_V0.9_Market_Intelligence.md`

- 主实体 **`market_insights`**，`feed_items` 作为 signal。
- 多源 `sources[]`、Insight-first 卡片、AI Drill Down。
- `heat_velocity`、Heating Up、KOL/社交信号；Smart Money 按 Post-MVP 规划。
- Bookmark/RAG/Admin 以 `insight` 为 `entity_type`。

---

## 5. 四层模型（Phase 2+ 逐步补齐）

Phase 1 只需隐式覆盖 **Source + AI Summary** 两层。完整四层在 Phase 2–3 展开：

| 层级 | Phase 1 | Phase 2+ |
| --- | --- | --- |
| Source | ✅ | ✅ 多源 |
| AI Summary / Insight | ✅ summary | + 叙事化 insight 文案 |
| Narrative | Chips 导航 only | Feed 叙事表达 |
| Market | heat、sentiment 可选 | velocity、信号、影响 |

---

## 6. 实现状态对照（截至 V0.3）

| 能力 | 状态 |
| --- | --- |
| RSS 采集、去重 | ✅ |
| ai_summary 生成 | ✅ |
| Search API + 页 | ✅ |
| Topic Chips / Tabs / Heat Bar 骨架 | ✅ |
| 列表 Summary-first | ❌ 待 V0.7 |
| related sources 展示 | ⚠️ 有 similar_feed，UI 未按 Phase 1 组装 |
| Narrative 页 | 待 V0.4 |
| Insight 实体 | ❌ Phase 3 |

---

## 7. 扩展口子（V0.4–V0.6 遵守）

- API 返回 `sources` 时用 **数组** 形态（Similar 可映射）。
- `content_embeddings`、`bookmarks` 预留 `entity_type`（见 `db-rules.md`）。
- 保留 `feed_items` 全量原始字段供后续聚类。

---

## 8. 后台管理

Phase 1：Admin 管理 `feed_items`（现有）。  
Phase 3：增加 Insight 管理（见 V0.9）。

所有写操作审计。

---

## 9. 状态与布局

Loading / Empty / Error 与 V0.2 相同。  
Mobile 单列；Desktop 三栏。浅色主题。  
模块文档与版本文档冲突时，以 **当前开发版本文档** 为准；产品阶段边界以 **Evolution Phases** 为准。
