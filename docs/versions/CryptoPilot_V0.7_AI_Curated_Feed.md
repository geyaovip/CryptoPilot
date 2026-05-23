# CryptoPilot V0.7 AI Curated Feed 开发规格

**产品阶段：Phase 1 体验完成**（见 `docs/design/Home_Feed_Evolution_Phases.md`）  
版本目标：将首页落实为 **AI Curated Market Feed** — Summary-first 卡片、related sources 展示、Search 置顶；**不**引入 Narrative Engine 或 Insight 主表。  
依赖版本：**V0.6 MVP Beta** 已完成。

---

## 1. 本版本必须完成

### 1.1 Web 首页

- **Search 入口**在首屏显眼位置（Header 或 Feed 上方固定）。
- **Topic Chips** 可筛选 Feed（`?topic=` 或 `?narrative=`，与 V0.4 Chips 数据一致）。
- **Feed Card Phase 1 结构**（见模块文档 §2.3）：
  - 主文案 = `ai_summary`
  - `title` 不在列表主标题展示
  - 显示 `related_source_count`（由 `similar_feed.length` 或后端计数，至少 0）
- 弱化列表时间；可选展示 `heat_score` 或 Hot 标签。
- Actions：Save（Bookmark）、Share（链接）、Ask AI（带 feed id 或 title 跳转 Search）。

### 1.2 Feed Detail

- 顶部 **AI Summary** 为主。
- **Related sources** 区块：列出 similar_feed（source_name + url + 时间）。
- Key Reasons / Market Impact 保持 V0.3 数据，文案偏解读而非预测。
- Ask AI 按钮。

### 1.3 API（可选增强，优先前端映射）

- `GET /api/feed` 响应可增加 `related_source_count: number`（或由前端从 detail 懒加载，优先服务端一次算出）。
- `GET /api/feed/:id` 确保 `similar_feed` 含 source_name、source_url、publish_time。
- 不新增 `GET /api/insights`。

### 1.4 Admin

- 可编辑 `ai_summary`（已有则强化入口说明：列表展示字段）。
- 无 Insight 管理菜单。

---

## 2. 本版本禁止实现

- 新增 `market_insights` 表或 `insight_id` 聚类流水线。
- Feed 类型 `narrative_shift`、`smart_money` 及叙事推理 Prompt。
- `heat_velocity`、Heating Up 状态机（留 V0.8/V0.9）。
- Smart Money、KOL 全量采集。
- 修改 Bookmark 主实体为 insight。

---

## 3. 数据模型

**不迁移主实体**。继续使用 `feed_items`：

- `title` — 详情/溯源
- `ai_summary` — 列表主展示
- 其余字段不变

---

## 4. 测试清单

- 首页卡片 DOM/快照：最大字号区域为 summary 文本，非 title。
- Search 链接可达 `/search`。
- Topic Chip 筛选改变列表（或跳转 Narrative）。
- Detail 页 related sources >= 0 条时布局正常。
- Ask AI 跳转带参数 smoke。
- 类型检查与现有 vitest 通过。

---

## 5. 验收标准

- 产品对外可描述为 **AI Curated Market Feed**。
- 用户首屏感知为「AI 已帮我读过并总结」，而非新闻标题列表。
- 仍基于 `feed_items`，无 Insight 表。
- 所有 AI 文案有来源；无投资建议。

---

## 6. 与相邻版本

| 版本 | 关系 |
| --- | --- |
| V0.6 | 本版本依赖；Beta 不强制 Summary-first |
| V0.8 | 在此之后做 Narrative Feed（Phase 2） |
| V0.9 | Market Intelligence（Phase 3） |
