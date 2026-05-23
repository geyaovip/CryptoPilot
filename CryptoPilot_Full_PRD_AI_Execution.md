# CryptoPilot 完整版 PRD（AI 开发执行版）

版本：v1.0  
产品名称：CryptoPilot  
文档类型：完整产品功能文档  
文档目标：定义 CryptoPilot 从 MVP 到完整产品的产品范围、模块边界、技术方向、数据系统、AI 系统、商业化与阶段规划。  
执行原则：本文描述完整产品目标，不等同于 MVP 一次性开发范围。MVP 开发必须以《CryptoPilot MVP PRD（AI 开发执行版）》为准。

---

## 0. 文档使用说明

本文是完整产品蓝图，用于定义长期方向、模块边界和阶段规划，不直接作为 AI 一次性开发输入。

MVP 开发必须使用：

- `CryptoPilot_MVP_PRD_AI_Execution.md`
- `docs/versions/*`
- `docs/modules/*`

AI 开发 Agent 不得因为本文包含完整功能，就在 MVP 阶段提前实现 Smart Money、Pro 订阅、Native App、API 产品化或 AI Alpha Engine。

---

## 1. 产品定义

### 1.1 产品定位

CryptoPilot 是面向加密货币用户的 AI 情报终端。它通过 AI 聚合、搜索、总结、分类、追踪和预警能力，帮助用户快速理解 crypto 市场热点、叙事变化、聪明钱动向、资产异动和潜在风险。

### 1.2 产品目标

CryptoPilot 的长期目标是成为 crypto 用户每天打开的 AI 市场入口：

1. 用最短时间理解市场发生了什么。
2. 发现正在形成的热点和 Narrative。
3. 跟踪 Token、Narrative、KOL、钱包和市场异动。
4. 将分散在新闻、Twitter/X、Reddit、链上数据、行情数据中的信息统一解释。
5. 在重要变化发生时主动提醒用户。

### 1.3 核心产品原则

- Feed-first：热点信息流优先于聊天入口。
- Evidence-first：所有 AI 结论必须有来源。
- Narrative-first：围绕市场叙事组织信息，而不是只按新闻时间线展示。
- Action-aware：帮助用户判断是否需要继续关注，但不提供投资建议。
- Human-in-the-loop：Admin 必须支持人工接管 AI 输出。

### 1.4 产品不做什么

完整产品仍不做以下业务：

- 交易所
- 托管钱包
- 发币平台
- NFT 市场
- DAO 治理工具
- GameFi 平台
- AI 自动交易
- 收益承诺

---

## 2. 产品形态

### 2.1 终端形态

完整产品支持：

| 终端 | 目标 | 阶段 |
| --- | --- | --- |
| Web | 核心产品体验，桌面分析与移动 PWA | MVP 起 |
| PWA | 移动端高频打开和轻量安装 | MVP 起 |
| Telegram Bot | 通知层与轻量 AI 助手 | MVP 起 |
| Native App | 高频移动端体验、系统通知、桌面小组件 | Phase 4 |
| API | 面向开发者、KOL、机构的数据与 AI 能力输出 | Phase 4 |

### 2.2 UI 主题

完整产品必须统一采用浅色 UI 主题。MVP 和后续版本均不得引入暗色主题作为默认主界面。

必须遵守：

- Web、Admin、PWA、Native App 均使用统一浅色设计系统。
- 不实现暗色主题切换，除非后续单独立项。
- 不使用大面积深色 Sidebar、Header、Feed Card 或 Terminal 风格背景。
- 图表和状态色只能用于信息表达，不得改变整体浅色主题。

---

## 3. 用户画像

### 3.1 高频 Crypto 用户

特点：

- 高频浏览 Twitter/X、KOL、新闻、行情和链上数据。
- 对热点敏感，容易 FOMO。
- 需要快速判断热点是否值得继续跟踪。

核心需求：

- 更快发现市场异动。
- 更快理解热点原因。
- 减少无效信息筛选。
- 跟踪自己关注的 Token、Narrative、KOL 和钱包。

### 3.2 普通投资用户

特点：

- 主要关注 BTC、ETH 和主流资产。
- 不熟悉复杂链上数据和 crypto Narrative。
- 需要简单解释，不需要复杂术语。

核心需求：

- 用自然语言理解市场变化。
- 快速知道风险和热点。
- 通过 AI Search 提问。

### 3.3 内容创作者/KOL

特点：

- 需要每天获得选题、观点和市场素材。
- 关注叙事、社群热度、热门项目和事件时间线。

核心需求：

- 热点聚合。
- Narrative 总结。
- 事件时间线。
- 可引用来源。

### 3.4 专业用户/机构用户

特点：

- 需要更高信息密度、筛选能力和数据导出。
- 关注聪明钱、链上指标、资金流、项目动态和风险预警。

核心需求：

- 高级筛选。
- Smart Money 跟踪。
- API 和数据导出。
- 自定义预警规则。

---

## 4. 完整信息架构

### 4.1 前台一级模块

| 模块 | 说明 |
| --- | --- |
| Home | AI 热点 Feed，默认首页 |
| Search | Crypto AI Search |
| Narrative | 叙事中心 |
| Market | 市场概览 |
| Watchlist | 用户关注列表 |
| Smart Money | 钱包、VC、巨鲸、聪明钱追踪 |
| Alerts | 预警中心 |
| Notifications | 通知中心 |
| Bookmarks | 收藏内容 |
| Profile | 用户中心 |
| Settings | 账号、通知、订阅、偏好设置 |

### 4.2 Admin CMS 模块

| 模块 | 说明 |
| --- | --- |
| Dashboard | 业务、内容、AI、成本总览 |
| Feed 管理 | 热点内容管理和人工修正 |
| Narrative 管理 | 叙事创建、合并、权重、总结 |
| Market 管理 | Token、价格、市场数据管理 |
| Smart Money 管理 | 钱包标签、来源、风险标记 |
| Prompt 管理 | Prompt 编辑、测试、版本、灰度 |
| Push 管理 | Telegram、App、Email 推送 |
| 数据源管理 | RSS、Twitter/X、Reddit、链上和行情源 |
| AI Monitor | 模型调用、Token、错误率、成本 |
| 用户管理 | 用户、角色、订阅、封禁 |
| 系统配置 | Feature Flag、算法参数、模型切换 |
| 日志中心 | API、AI、采集、Push 错误日志 |

### 4.3 模块阶段优先级

完整产品必须按阶段推进，避免一次性开发全部模块。

| 模块 | Phase | 说明 |
| --- | --- | --- |
| Home Feed | Phase 1 | MVP 核心入口 |
| Feed Detail | Phase 1 | AI 总结与来源引用 |
| AI Search | Phase 1 | RAG 问答搜索 |
| Narrative 基础版 | Phase 1 | 固定 Narrative 列表与详情 |
| Watchlist 基础版 | Phase 1 | Token、Narrative、KOL 关注 |
| Telegram Push 基础版 | Phase 1 | 每日总结与异动提醒 |
| Admin CMS 基础版 | Phase 1 | Feed、Narrative、Prompt、Push 管理 |
| Market 模块 | Phase 2 | 市场概览、Token 详情、热力图 |
| Alerts Center | Phase 2 | 自定义预警规则 |
| Notification Center | Phase 2 | 站内通知与通知历史 |
| Smart Money | Phase 3 | 钱包、巨鲸、链上资金流 |
| Pro 订阅 | Phase 4 | 支付、权限、用量限制 |
| Native App | Phase 4 | React Native / Expo |
| API 产品化 | Phase 4 | 外部 API 和团队能力 |
| AI Alpha Engine | Phase 5 | 多源信号和高级机会线索 |

---

## 5. Home Feed

### 5.1 页面目标

Home Feed 是 DAU 核心页面。用户打开首页后必须快速理解：

1. 今天市场最重要的热点。
2. 当前最热 Narrative。
3. 主要 Token 和市场情绪变化。
4. 哪些事件值得继续追踪。

### 5.2 Feed 类型

完整产品支持：

| 类型 | 说明 |
| --- | --- |
| news | 新闻热点 |
| breaking | 突发新闻 |
| social_trend | 社区热议 |
| narrative | Narrative 热点 |
| market_move | Token 价格或成交量异动 |
| whale_move | 巨鲸交易 |
| smart_money | 聪明钱建仓、减仓、迁移 |
| risk_alert | 风险事件 |
| project_update | 项目官方动态 |

### 5.3 Feed 卡片字段

Feed 卡片必须包含：

- title
- ai_summary
- source
- source_url
- publish_time
- related_tokens
- narrative_tags
- sentiment
- heat_score
- market_impact
- confidence_score

### 5.4 Feed 详情页

详情页必须包含：

- 事实摘要
- 原因解释
- 市场影响
- 相关 Token
- 相关 Narrative
- 时间线
- 来源引用
- 社区情绪
- 相似事件
- AI 风险提示

### 5.5 排序规则

完整产品排序必须支持：

- For You：结合用户兴趣和全局热度。
- Latest：按发布时间。
- Hottest：按热度。
- Breaking：只展示突发内容。
- Following：只展示 Watchlist 相关内容。

默认排序使用：

```txt
rank_score =
heat_score * 0.35
+ recency_score * 0.20
+ source_weight * 0.15
+ engagement_score * 0.10
+ user_interest_score * 0.15
+ confidence_score * 0.05
```

---

## 6. AI Search

### 6.1 产品定位

AI Search 是 CryptoPilot 的问答式研究入口。用户可以用自然语言提问，系统必须基于已采集数据、向量检索和外部来源返回带引用的结构化回答。

### 6.2 支持问题类型

必须支持：

- Token 问题：例如“为什么 ETH 今天上涨？”
- Narrative 问题：例如“AI 叙事最近热度如何？”
- 市场总结：例如“今天 crypto 市场最大的风险是什么？”
- 项目事件：例如“某项目最近发生了什么？”
- 对比分析：例如“SOL 和 ETH 最近谁更强？”
- 时间线问题：例如“过去 7 天 Meme 叙事发生了什么？”
- 风险问题：例如“某 Token 最近有什么风险信号？”

### 6.3 输出结构

AI Search 必须返回：

- answer
- key_reasons
- market_impact
- timeline
- related_tokens
- related_narratives
- sentiment
- confidence_score
- sources
- updated_at

### 6.4 安全规则

AI Search 不得：

- 直接建议买入、卖出、开杠杆。
- 承诺收益。
- 输出无来源的市场结论。
- 将推测伪装成事实。

---

## 7. Narrative 系统

### 7.1 Narrative 定义

Narrative 是市场围绕某个主题形成的注意力、资金、社群讨论和项目活动集合。CryptoPilot 必须用 Narrative 组织信息，而不是只展示孤立新闻。

### 7.2 初始 Narrative

完整产品至少支持：

- AI
- Meme
- RWA
- DePIN
- Stablecoin
- Layer2
- Solana
- Ethereum
- Bitcoin Ecosystem
- GameFi
- Privacy
- Restaking
- Infrastructure
- DeFi

### 7.3 Narrative 指标

每个 Narrative 必须计算：

- heat_score
- trend_score_1h
- trend_score_24h
- trend_score_7d
- twitter_mentions
- reddit_mentions
- news_count_24h
- related_token_volume_change
- sentiment

### 7.4 Narrative 详情页

必须展示：

- AI Narrative Summary
- Heat Chart
- Top Tokens
- Related Feed
- Top KOL
- Community Discussion
- Risk Signals
- Key Events Timeline
- Follow 按钮

### 7.5 Narrative 管理

Admin 必须支持：

- 创建、编辑、隐藏 Narrative。
- 合并重复 Narrative。
- 调整 Narrative 权重。
- 修改 AI Summary。
- 设置热门 Narrative。
- 查看关联内容和来源。

---

## 8. Market 模块

### 8.1 页面目标

Market 模块用于展示整体市场状态和关键资产变化。

### 8.2 必须展示

- BTC、ETH 价格与 24h 涨跌幅。
- Crypto 总市值。
- 24h 总成交量。
- Fear & Greed 指标。
- Trending Tokens。
- Top Gainers。
- Top Losers。
- Volume Spikes。
- Narrative Heat Map。

### 8.3 Token 详情页

完整产品必须支持 Token 详情页：

- 价格与 K 线。
- 市值、成交量、流通量。
- AI Token Summary。
- 相关新闻。
- 相关 Narrative。
- 社区情绪。
- Watchlist 按钮。
- 预警设置。

---

## 9. Watchlist

### 9.1 可关注对象

完整产品支持关注：

- Token
- Narrative
- KOL
- Wallet
- Project

### 9.2 Watchlist 页面

必须展示：

- 关注对象列表。
- 每个对象的最新动态。
- 热度变化。
- AI Summary。
- 预警开关。
- 自定义预警规则。

### 9.3 自定义预警

用户可以设置：

- Token 价格涨跌幅。
- Narrative heat_score 变化。
- KOL 发布高影响内容。
- 钱包买入或卖出指定 Token。
- 官方公告或安全风险事件。

---

## 10. Smart Money

### 10.1 产品定位

Smart Money 模块用于追踪 VC、巨鲸、KOL 钱包、链上聪明钱和高胜率地址的活动，并用 AI 解释其行为可能代表的市场信号。

### 10.2 钱包列表

字段：

- wallet_name
- address
- chain
- tags
- estimated_pnl
- win_rate
- recent_activity
- top_holdings
- preferred_narratives
- risk_level

### 10.3 钱包详情页

必须展示：

- 持仓
- 最近交易
- 历史 PnL
- 资金流入流出
- Narrative 偏好
- 关联 Token
- AI 行为分析
- Follow 按钮

### 10.4 AI 分析

AI 必须分析：

- 是否在建仓。
- 是否在减仓。
- 是否在追热点。
- 是否在抄底。
- 该行为影响哪些 Narrative。
- 该行为是否具有高置信度。

### 10.5 数据来源

完整产品可接入：

- Arkham
- Dune
- DexScreener
- DefiLlama
- Etherscan 类浏览器 API
- 自建钱包标签库

---

## 11. Alerts 与 Notifications

### 11.1 Alert 类型

完整产品必须支持：

- price_alert
- narrative_alert
- whale_alert
- smart_money_alert
- breaking_news_alert
- risk_alert
- watchlist_alert

### 11.2 通知渠道

支持：

- Web Notification
- PWA Push
- Telegram Push
- Email
- Native App Push

### 11.3 限流

必须支持用户级限流：

- 每小时最大通知数。
- 每日最大通知数。
- 安静时段。
- 只推高优先级事件。

---

## 12. Telegram Bot

### 12.1 产品定位

Telegram Bot 是通知层和轻量 AI 助手。

### 12.2 必须支持

- 账号绑定。
- AI 问答。
- 每日总结。
- Watchlist 异动推送。
- Narrative 异动推送。
- 巨鲸异动推送。
- 用户通过命令管理通知。

### 12.3 Bot 命令

必须支持：

- `/start`
- `/bind`
- `/summary`
- `/watchlist`
- `/alerts`
- `/pause`
- `/resume`
- `/help`

---

## 13. Admin CMS

### 13.1 核心目标

Admin CMS 是 AI 内容运营控制中心，必须支持人工修正、人工审核、Prompt 管理、数据源管理和成本控制。

### 13.2 Dashboard

必须展示：

- DAU、WAU、MAU。
- Feed 浏览量。
- AI Search 次数。
- Push 点击率。
- 热门 Narrative。
- Token 消耗。
- API 错误率。
- 数据源状态。
- LLM 成本。

### 13.3 Feed 管理

必须支持：

- 查看 Feed 列表。
- 编辑 title、summary、tags、Narrative。
- 置顶、降权、隐藏、删除。
- 标记 AI 错误。
- 查看来源和生成日志。
- 手动创建 Feed。
- 批量隐藏、批量降权、批量打标签。
- 查看相似内容和去重结果。
- 查看 Feed 的 AI 处理链路：采集、清洗、分类、总结、排序。

### 13.4 Narrative 管理

必须支持：

- 创建、编辑、隐藏 Narrative。
- 合并重复 Narrative。
- 设置 Narrative 权重。
- 编辑 Narrative AI Summary。
- 查看 Narrative 关联 Token、Feed、KOL、钱包。
- 查看 Narrative 热度变化和来源构成。
- 手动触发 Narrative 重新计算。

### 13.5 Market 与 Token 管理

必须支持：

- 查看 Token 列表。
- 编辑 Token 基础信息。
- 设置 Token 是否展示。
- 手动绑定外部数据源 ID。
- 手动刷新行情。
- 查看 Token 关联 Feed、Narrative、Watchlist 用户数。
- 标记高风险 Token。

### 13.6 Smart Money 管理

必须支持：

- 创建和编辑钱包标签。
- 设置钱包类型：VC、whale、KOL、smart_money、exchange、project。
- 设置钱包风险等级。
- 查看钱包最近交易和持仓摘要。
- 标记错误钱包标签。
- 暂停或恢复钱包追踪。

### 13.7 Prompt 管理

必须支持：

- Prompt 编辑。
- Prompt 版本管理。
- Prompt 测试。
- Prompt 灰度。
- Prompt 回滚。

Prompt 类型包括：

- feed_summary_prompt
- narrative_prompt
- sentiment_prompt
- push_prompt
- ai_search_prompt
- smart_money_prompt
- risk_prompt

### 13.8 Push 与 Alert 管理

必须支持：

- 查看 Push 记录。
- 手动创建 Push。
- 预览 Push 内容。
- 选择目标用户：全部用户、指定用户、指定 Watchlist、指定订阅层级。
- 支持 Telegram、Email、PWA、Native App Push。
- 查看发送状态、点击率、失败原因。
- 管理系统级 Alert 模板。
- 暂停或恢复某类 Alert。

### 13.9 数据源管理

必须支持：

- 查看所有数据源状态。
- 新增、编辑、启停数据源。
- 设置抓取频率和来源权重。
- 手动重试采集。
- 查看采集日志。
- 查看数据源质量评分。
- 配置降级策略。

### 13.10 AI Monitor

必须展示：

- 模型调用量。
- Token 消耗。
- 错误率。
- 响应时间。
- 成本统计。
- Provider 可用性。
- Prompt 维度成本。
- 用户维度调用量。
- 失败重试次数。
- 降级模型使用次数。

### 13.11 用户与订阅管理

必须支持：

- 查看用户列表。
- 搜索用户。
- 查看用户详情、Watchlist、AI Search 使用量、Push 接收记录。
- 修改用户角色。
- 禁用或恢复用户。
- 查看订阅状态。
- 手动调整订阅层级。
- 查看支付和发票记录。

### 13.12 系统配置

必须支持：

- Feature Flag。
- Feed 权重。
- Heat Score 算法参数。
- AI 模型切换。
- Push 策略。
- 免费/Pro 用量限制。
- 数据源降级策略。
- 风险词与安全策略。

### 13.13 日志中心与审计

必须展示：

- API 错误日志。
- AI 错误日志。
- 数据采集错误日志。
- Push 错误日志。
- 支付错误日志。
- Admin 操作审计日志。

所有 Admin 写操作必须写入 audit_logs，记录操作者、操作对象、修改前后内容、IP、User Agent 和时间。

---

## 14. 数据系统

### 14.1 数据源

完整产品支持：

| 数据源 | 用途 |
| --- | --- |
| Twitter/X | KOL、社区讨论、Narrative 热度 |
| RSS 新闻 | 新闻热点 |
| Reddit | 社区讨论 |
| CoinGecko | 价格、市值、排名 |
| DexScreener | DEX 行情、Meme 币异动 |
| DefiLlama | TVL、协议数据 |
| Arkham | 钱包标签与资金流 |
| Dune | 链上分析数据 |
| 官方博客/RSS | 项目官方动态 |

### 14.2 数据刷新策略

| 数据 | 默认频率 |
| --- | --- |
| Token 价格 | 30-60 秒 |
| 新闻 RSS | 5 分钟 |
| Twitter/X | 1-5 分钟 |
| Reddit | 10 分钟 |
| Narrative 热度 | 5 分钟 |
| Smart Money | 1-5 分钟 |
| 链上指标 | 5-30 分钟 |

### 14.3 数据质量要求

必须实现：

- URL 去重。
- 标题相似度去重。
- 来源权重。
- 内容质量评分。
- 来源异常监控。
- 数据采集日志。

### 14.4 完整产品核心数据实体

完整产品数据模型必须覆盖以下实体：

| 实体 | 用途 |
| --- | --- |
| users | 用户身份、角色、订阅状态 |
| auth_accounts | 第三方登录账号 |
| subscriptions | 订阅计划、状态、周期 |
| feed_items | 信息流内容 |
| sources | 数据源配置和状态 |
| narratives | Narrative 定义、热度、总结 |
| tokens | Token 行情与基础信息 |
| kols | KOL 身份、平台、影响力 |
| wallets | 钱包地址、标签、链、风险等级 |
| wallet_transactions | 钱包交易记录 |
| watchlist_items | 用户关注对象 |
| alerts | 用户自定义预警规则 |
| notifications | 站内通知 |
| push_messages | 多渠道推送记录 |
| prompts | Prompt 版本管理 |
| ai_search_history | AI Search 查询历史 |
| embeddings | 内容向量索引 |
| ingestion_logs | 数据采集日志 |
| audit_logs | Admin 操作审计日志 |

所有涉及 AI 输出、Push、Admin 人工修改和付费权限的核心行为必须写入日志，便于追溯。

---

## 15. AI 系统

### 15.1 AI 能力

完整产品必须支持：

- 信息总结。
- 情绪分析。
- 热点聚类。
- Narrative 分类。
- AI Search RAG。
- 机会线索发现。
- 风险提示。
- Smart Money 行为分析。
- Push 文案生成。
- 每日市场总结。

### 15.2 AI Pipeline

```txt
数据采集
→ 数据清洗
→ 内容入库
→ Embedding
→ Vector Search
→ Clustering
→ Narrative Classification
→ AI Summary
→ Sentiment Analysis
→ Heat Score
→ Ranking
→ Feed / Search / Push / Alerts
```

### 15.3 模型策略

系统必须支持多 Provider：

- OpenAI
- Anthropic
- Gemini

必须支持：

- Provider 切换。
- 模型级配置。
- 成本监控。
- 失败重试。
- 降级模型。

### 15.4 风险规则

AI 输出必须：

- 展示来源。
- 区分事实和推测。
- 不提供投资建议。
- 不承诺收益。
- 信息不足时明确说明来源不足。

---

## 16. 用户系统与商业化

### 16.1 登录方式

完整产品支持：

- Google
- Apple
- Email Magic Link
- Telegram
- Wallet 登录

### 16.2 订阅层级

| 层级 | 权限 |
| --- | --- |
| Free | 基础 Feed、基础 AI Search、基础 Watchlist |
| Pro | 高级 AI Search、实时预警、Smart Money、更多 Watchlist |
| Team | 团队席位、共享 Watchlist、导出、API 配额 |

### 16.3 商业模式

支持：

- 订阅。
- Sponsor。
- Affiliate。
- API。
- 数据报告。

---

## 17. 技术架构

### 17.1 前端

Web 必须使用：

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand
- PWA

Phase 4 Native App 必须使用：

- React Native
- Expo

### 17.2 后端

必须使用：

- NestJS
- PostgreSQL
- pgvector
- Redis
- BullMQ

### 17.3 AI 与数据

必须支持：

- OpenAI/Anthropic/Gemini。
- Embedding。
- Vector Search。
- 定时采集任务。
- 异步队列。

### 17.4 Monorepo 结构

```txt
/apps
  /web
  /admin
  /api
  /mobile

/packages
  /ui
  /types
  /prompts
  /config
  /shared
  /analytics
```

### 17.5 API 分组

完整产品 API 必须按领域拆分：

- `/api/auth/*`
- `/api/feed/*`
- `/api/search/*`
- `/api/narratives/*`
- `/api/market/*`
- `/api/tokens/*`
- `/api/watchlist/*`
- `/api/alerts/*`
- `/api/notifications/*`
- `/api/smart-money/*`
- `/api/telegram/*`
- `/api/billing/*`
- `/api/admin/*`

### 17.6 权限边界

必须实现：

- 普通用户只能访问自己的 Watchlist、Alerts、Notifications、Search History。
- Pro 功能必须通过订阅状态校验。
- Team 功能必须通过 workspace/team membership 校验。
- Admin API 必须校验 admin 角色。
- 所有 Admin 写操作必须写入 audit_logs。

---

## 18. 阶段规划

### Phase 1：MVP

以《CryptoPilot MVP PRD（AI 开发执行版）》为准。

必须完成：

- Home Feed
- Feed Detail
- AI Search
- Narrative
- Watchlist 基础版
- Telegram Push 基础版
- Admin CMS 基础版

### Phase 2：Narrative 与预警增强

新增：

- 更多 Narrative。
- Narrative 自动发现。
- 自定义 Alert。
- Market 模块。
- Token 详情页。
- 更完整 Notification Center。

### Phase 3：Smart Money

新增：

- 钱包追踪。
- 巨鲸异动。
- 链上数据源。
- Smart Money AI 分析。
- 钱包 Watchlist。

### Phase 4：商业化与多端

新增：

- Pro 订阅。
- 支付系统。
- Native App。
- Email Push。
- API。
- 团队功能。

### Phase 5：AI Alpha Engine

新增：

- 多源信号聚类。
- 高级机会线索发现。
- 风险信号提前预警。
- 个性化研究助手。
- 自动生成市场研究报告。

---

## 19. 完整产品成功指标

### 19.1 用户指标

- DAU
- WAU
- MAU
- 次日留存
- 7 日留存
- 30 日留存
- 人均 Feed 浏览数
- 人均 AI Search 次数

### 19.2 内容指标

- Feed 点击率
- Source 点击率
- Push 点击率
- AI Search 满意度
- AI 错误标记率
- Narrative Follow 率

### 19.3 商业指标

- Free 到 Pro 转化率
- ARPU
- MRR
- Churn
- API 收入

### 19.4 系统指标

- API P95 延迟
- AI Search P95 延迟
- 数据源可用率
- LLM 错误率
- Token 成本/活跃用户

---

## 20. 完整产品验收原则

完整产品每个阶段上线前必须满足：

1. 核心功能有明确来源数据。
2. AI 输出可追溯。
3. Admin 可以人工修正关键内容。
4. 用户可以关闭或调整通知。
5. UI 保持统一浅色主题。
6. 不输出投资建议。
7. 成本、错误、数据源状态可观测。
