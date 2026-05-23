# Home Feed 产品演进路线（三阶段）

本文档定义首页 **从「能每天打开」到「市场智能」** 的分阶段策略。  
模块实现细节见 `docs/modules/Home_Feed_and_Feed_Detail.md`。  
版本映射见本文 §5。

---

## 0. 核心判断

最大风险不是「产品不够高级」，而是 **一上来就做 AI Narrative Engine**，导致复杂度爆炸、无法上线验证习惯。

CryptoPilot 首页第一阶段的目标：

> **先形成高频打开习惯** — 做 Feed 产品，不是做复杂 AI。

参考：

- Perplexity 早期 ≈ 搜索 + 聚合。
- Twitter ≈ Feed。
- 终局可以像 Perplexity Discover + 市场感，但 **MVP 不一步到位**。

---

## 1. 产品定位（随阶段变化）

| 阶段 | 对外定位 | 一句话 |
| --- | --- | --- |
| **Phase 1** | **AI Curated Market Feed** | AI 帮你聚合、去重、总结、排序，节省阅读时间 |
| **Phase 2** | **Narrative-aware Feed** | Feed 开始表达「叙事变化」，而不只是新闻摘要 |
| **Phase 3** | **AI Market Intelligence** | 市场雷达：情绪、轮动、信号、KOL/Smart Money（Post-MVP） |

**禁止** 在 Phase 1 对用户承诺：叙事推理、行情预测、Smart Money 洞察。

---

## 2. Phase 1 — AI 内容聚合（MVP 重点）

### 2.1 目标

- 信息流 **跑起来、值得刷**。
- AI 价值 = **省时间**，不是 **懂市场**。
- 气质：**80% Perplexity Discover + 20% Twitter Market Feed**。

### 2.2 首页结构

1. **顶部 Search**（必须显眼 — 未来核心入口）。
2. **热门 Topic Chips**（AI、Meme、BTC、ETH、Solana、ETF… — 筛选/导航，Phase 1 不做叙事推理）。
3. **AI Curated Feed**（主列表）。

可选轻量：**Heat Strip**（BTC/ETH 涨跌），不阻塞 Feed。

### 2.3 Feed Card（Phase 1）

自上而下：

| 层 | 内容 |
| --- | --- |
| 1. Source | 来源名称（CoinDesk、Twitter…） |
| 2. **AI Summary** | **最大字号核心文案** |
| 3. Related Headlines | 例如「3 related sources」（Similar / 轻聚合，可无新表） |
| 4. Tags | Token / Topic tags |
| 5. Actions | Save、Share、Ask AI（Track 可 V0.4 Watchlist） |

**不要** 用媒体原标题作为最大字号。  
**不要** 强调「2 mins ago」；可显示 heat 或 「🔥 Hot」。

### 2.4 数据模型（Phase 1）

`feed_items` 足够：

- `title`（原文标题，详情/溯源用）
- `ai_summary`（列表主展示）
- `source` / `source_url`
- `tags`（tokens、简单 topic）
- `heat_score` / `rank_score`
- `created_at` / `publish_time`
- `sentiment`（可选，LLM 轻量输出）

**不需要**：`narrative_graph`、`market_rotation`、`entity_relationship`、`market_insights` 主表。

### 2.5 AI 能力边界（Phase 1）

| 做 | 不做 |
| --- | --- |
| 单篇/轻量总结 | 叙事推理、行情预测 |
| 去重（URL/title） | 复杂聚类引擎 |
| 分类 tags | Narrative shift 检测 |
| heat + rank 排序 | Smart Money 权重 |

### 2.6 详情页（Phase 1）

- AI Summary（主）
- 原文 title + 链接
- Key Reasons / Market Impact（V0.3 已有可展示，文案偏「摘要延伸」非「市场预测」）
- Related items 当作 **related sources**
- Ask AI 跳转 Search

---

## 3. Phase 2 — Narrative Layer

### 3.1 目标

Feed 不再只是「新闻总结」，开始出现 **叙事化表达**。

示例卡片主文案：

> AI infrastructure narrative heating up again.

### 3.2 新增能力

- Feed 类型：`narrative_shift`、`sentiment_spike`、`market_rotation`（UI 徽章）。
- 主 Narrative Tag 与 Narrative 页/Chips 深度联动。
- `narrative_importance` 进入排序。
- 可选：轻量聚类（2–5 篇 → 1 张卡片），仍可不引入完整 Insight 引擎。

### 3.3 与 V0.4 关系

- V0.4 的 `/narratives` **列表/详情** = Phase 2 的 **入口与基础设施**。
- Phase 2 **不要求** V0.4 改首页 Feed 为 Narrative Engine。

---

## 4. Phase 3 — AI Market Intelligence

### 4.1 目标

市场雷达：解释 **变化** 与 **接下来可能在炒什么**。

### 4.2 新增能力（Post-MVP）

- `market_insights` 实体（或等价），多源 Drill Down。
- `heat_velocity`、`mention_delta`、Heating Up / Cooling。
- KOL Signal、社交数据源。
- Smart Money（完整产品蓝图，受 MVP 后规划约束）。
- Insight-first 七层卡片、完整动态 rank 公式。

### 4.3 风险

- 新实体 + 聚类 + 合成 Prompt + Admin + Bookmark 迁移 = **中–大** 工程。
- **仅在本阶段立项**，不提前挤入 MVP。

---

## 5. 版本映射

| 产品阶段 | 版本文档 | 说明 |
| --- | --- | --- |
| Phase 1 基础 | V0.2 Feed | 采集、列表、排序骨架 |
| Phase 1 AI | V0.3 AI | 单篇 summary、Search |
| Phase 1 叙事入口 | V0.4 Narrative + Watchlist | Chips、Narrative 页、兴趣分；**Feed 仍可策展态** |
| Phase 1 推送 | V0.5 Telegram（延后最后） | 非 MVP 主线下一版 |
| Phase 1 收口 | V0.6 MVP Beta | 稳定上线，不新增长期功能 |
| **Phase 1 体验完成** | **V0.7 AI Curated Feed** | Summary-first UI、related sources、Search 置顶 |
| Phase 2 | **V0.8 Narrative Feed** | 叙事化卡片与类型、排序增强 |
| Phase 3 | **V0.9 Market Intelligence** | Insight 实体、多源、市场信号层 |

未完成前一 **已发布版本** 验收前，不得开发下一版本文档中的功能。

---

## 6. 文档优先级

当 Phase 描述与旧版「AI Narrative Engine」表述冲突时，以 **本文件 + 模块文档 Phase 1 节** 为准。

已废弃的表述：

- MVP 首页 = AI Narrative Engine。
- MVP 必须 Insight-first + 多源 Insight 表。

---

## 7. 给 AI Agent 的执行提醒

- 开发 **V0.4–V0.6** 时：禁止实现 `market_insights`、Smart Money、`narrative_shift` 首页类型（除非版本文档明确）。
- 开发 **V0.7** 时：只做 Phase 1 体验，禁止提前做 Phase 3 数据模型。
- 所有 AI 输出仍有来源；禁止投资建议。
