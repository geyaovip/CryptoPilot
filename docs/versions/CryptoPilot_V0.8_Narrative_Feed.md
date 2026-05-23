# CryptoPilot V0.8 Narrative Feed 开发规格

**产品阶段：Phase 2 — Narrative Layer**  
版本目标：Feed 从「新闻摘要」升级为 **叙事化表达**；与 V0.4 Narrative 页深度联动；**仍不**上 Insight 主表与 Smart Money。  
依赖版本：**V0.7 AI Curated Feed** 已完成。

---

## 1. 本版本必须完成

### 1.1 Feed 叙事化展示

- 卡片支持 **主 Narrative Tag**（如 🔥 AI）与叙事化副文案（可与 `ai_summary` 分工：一句 narrative hook + 一段 summary）。
- 新 Feed **类型**（枚举扩展 + UI 徽章）：
  - `narrative_shift`
  - `sentiment_spike`
  - `market_rotation`
  - `breaking`
  - `kol_signal`（无 KOL 数据时可用运营标签降级）
- 示例主文案风格：*AI infrastructure narrative heating up again.*

### 1.2 排序

- `rank_score` 增加 `narrative_importance` 权重（见模块文档 Phase 2）。
- Topic Chip 筛选与 Narrative slug 绑定。

### 1.3 可选轻聚合（二选一，验收前定案）

- **方案 A（推荐）**：仍 1 feed_item = 1 卡，仅文案与类型叙事化。
- **方案 B**：2–5 条相似 item 合并展示为 1 卡，`related_source_count` 必选 >= 2；**不**要求 `market_insights` 表，可用 `cluster_id` 字段 on `feed_items`。

### 1.4 Narrative 联动

- `/narratives/:slug` 的 Related Feed 与首页 Chip 筛选一致。
- Narrative 详情 `ai_summary` 由 `narrative_summary_prompt` 生成（V0.3 Prompt 已有则接通）。

---

## 2. 本版本禁止实现

- `market_insights` 主实体（Phase 3）。
- Smart Money 类型与钱包数据。
- `heat_velocity` 完整市场雷达（可预留字段 null）。
- Pro 订阅、暗色主题。

---

## 3. API

- `GET /api/feed` 支持 `type` 筛选；返回 `feed_type`、`primary_narrative`。
- 可选 `cluster_id`、`related_source_count`（若方案 B）。

---

## 4. 验收标准

- 首页 Feed 明显区分类型，不止一种「新闻卡」。
- 至少 1 条示例呈现 **叙事变化** 文案，而非纯转载标题。
- Narrative Chip → 筛选或详情路径畅通。
- 仍无 Smart Money；无投资建议。

---

## 5. 参考

- 模块文档 Phase 2：`docs/modules/Home_Feed_and_Feed_Detail.md` §3
- 产品路线：`docs/design/Home_Feed_Evolution_Phases.md` §3
