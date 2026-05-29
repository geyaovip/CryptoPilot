# CryptoPilot V0.9 Market Intelligence 开发规格

**产品阶段：Phase 3 — AI Market Intelligence**  
版本目标：首页升级为 **市场雷达** — Insight 实体、多源 Drill Down、动态热度与完整四层信息模型。  
依赖版本：**V0.8 Narrative Feed** 已完成。  
产品依据：原「AI Narrative Feed 重方案」收敛至本版本，避免 MVP 复杂度爆炸。

当前实现状态（2026-05）：

- `market_insights`、`feed_items.insight_id`、Insight 列表/详情 API、Admin 重合成、Bookmark/AI Search 的 `insight_id` 已进入代码实现。
- Insight 来源已按 URL 去重；去重后不足 2 个来源不发布、不在前台展示。
- 仍需继续补齐完整 Heat Strip、运营级 Insight CRUD、性能/质量监控与 KOL Signal 子阶段。

---

## 1. 为什么在本阶段才做

以下能力 **改动中–大**，禁止在 V0.7 提前实现：

- `market_insights` 主表 + `feed_items` 作为 signal
- 聚类 + `insight_synthesis_prompt`
- Bookmark/RAG/Admin 迁移到 `entity_type = insight`
- `heat_velocity`、Heating Up / Cooling
- 完整多源 `sources[]`（>= 2 才发布）

---

## 2. 本版本必须完成

### 2.1 数据与流水线

- 表 **`market_insights`**（对外 API：`insight`）。
- `feed_items.insight_id`（nullable）；聚类 Job；合成 Job。
- 字段：`ai_insight`, `ai_summary`, `type`, `sentiment`, `heat_score`, `heat_velocity`, `heat_label`, `primary_narrative_id`, `rank_score`, `sources_json`。
- Prompt：`insight_synthesis_prompt` + Schema 校验。
- Embedding：`entity_type = insight`。
- 发布门槛：`sources_json` 必须为去重后的可点击来源数组，长度 >= 2。

### 2.2 API

- `GET /api/feed` 默认返回 Insight 列表（`feed_item` legacy 参数短期兼容后移除）。
- `GET /api/insights/:id` Drill Down。
- Bookmark、`POST /api/ai/search` 支持 `insight_id`。

### 2.3 Web

- Heat Strip 完整字段（含 Fear 等，可占位）。
- Insight-first 七层卡片（见 Evolution Phases Phase 3 / 历史模块附录）。
- 列表展示 `heat_label`（Heating Up），弱化时间。

### 2.4 Admin

- Insight CRUD、关联 Signals、重新合成、审计。

### 2.5 Post-MVP 扩展（本版本可选/子阶段）

- KOL 信号数据源
- Smart Money **仅当** 产品禁令解除后单独立项，**不**默认包含在 V0.9 首包

---

## 3. 本版本禁止实现

- Pro 订阅、React Native、暗色主题。
- 未解禁前的 Smart Money 采集。

---

## 4. 迁移

1. 新表上线；历史 `feed_items` 批处理聚类。
2. 新入库 RSS → signal → 异步归并 insight。
3. Bookmark 迁移脚本（可选）。

---

## 5. 验收标准

- 首页主文案为 **ai_insight**。
- 每条 Insight >= 2 个去重后的可点击 sources。
- For You 含 `heat_velocity` 或等价动态信号。
- Ask AI、Save、Drill Down 完整。
- 无投资建议；LLM 日志完整。

---

## 6. 文档沿革

本文档承接原 `CryptoPilot_V0.7_AI_Narrative_Feed.md` 中的 **重工程** 部分；轻量首页改版已迁至 **V0.7 AI Curated Feed**。
