# CryptoPilot MVP PRD（AI 开发执行版）

版本：v1.0  
产品名称：CryptoPilot  
文档类型：MVP 开发执行文档  
文档目标：让 AI 开发 Agent 可以仅根据本文档完成 CryptoPilot MVP 的产品设计、前后端开发、数据库建模、AI Pipeline、后台 CMS 和基础部署。  
执行原则：本文中的“必须”表示 P0 强制需求；“暂不做”表示 MVP 禁止实现；“后续阶段”只作为未来规划，不进入 MVP 开发范围。

---

## 0. AI 开发执行方式

本文件是 MVP 总规格，不作为一次性开发输入。AI 开发必须按版本文档逐步执行。

### 0.1 必读文档顺序

AI 开发 Agent 必须按以下顺序读取：

1. `CryptoPilot_MVP_PRD_AI_Execution.md`
2. 当前版本文档，例如 `docs/versions/CryptoPilot_V0.1_Skeleton.md`
3. 当前版本涉及的模块文档，例如 `docs/modules/Admin_CMS.md`

### 0.2 版本开发顺序

必须按以下顺序开发：

1. `V0.1 Skeleton`
2. `V0.2 Feed`
3. `V0.3 AI`
4. `V0.4 Narrative + Watchlist`
5. `V0.5 Telegram Push`
6. `V0.6 MVP Beta`

未完成前一版本验收前，不得开发后一版本功能。

### 0.3 版本文档

版本文档位于：

```txt
docs/versions/
  CryptoPilot_V0.1_Skeleton.md
  CryptoPilot_V0.2_Feed.md
  CryptoPilot_V0.3_AI.md
  CryptoPilot_V0.4_Narrative_Watchlist.md
  CryptoPilot_V0.5_Telegram_Push.md
  CryptoPilot_V0.6_MVP_Beta.md
```

### 0.4 模块文档

模块文档位于：

```txt
docs/modules/
  Home_Feed_and_Feed_Detail.md
  AI_Search_and_AI_Pipeline.md
  Admin_CMS.md
  Data_Ingestion.md
  Telegram_Push.md
```

### 0.5 冲突处理规则

当文档出现冲突时，优先级如下：

1. 当前版本文档。
2. 当前模块文档。
3. 本 MVP 总规格。
4. 完整版 PRD。

AI 不得用完整版 PRD 中的长期功能覆盖 MVP 版本文档。

---

## 1. 产品定义

### 1.1 产品定位

CryptoPilot 是面向加密货币用户的 AI 情报终端。产品核心不是聊天机器人，而是通过 AI 聚合、总结、分类和解释市场信息，帮助用户更快理解 crypto 市场热点、叙事变化和潜在风险。

### 1.2 一句话目标

帮助用户在 3 分钟内理解当前 crypto 市场发生了什么、为什么发生、影响哪些资产、是否需要关注。

### 1.3 MVP 核心假设

MVP 只验证以下假设：

1. 用户是否愿意每天打开 CryptoPilot 查看市场热点。
2. 用户是否愿意使用 AI Search 理解 crypto 问题。
3. 用户是否认为 AI 总结比自己刷新闻、Twitter/X、社区更省时间。
4. Telegram 推送是否能提升次日留存。

### 1.4 MVP 不验证的内容

MVP 不验证交易、钱包、链上复杂图谱、自动交易、社交发帖、评论社区、原生 App、付费订阅转化。

---

## 2. MVP 范围

### 2.1 MVP 必须实现模块

| 模块 | 端 | 优先级 | 说明 |
| --- | --- | --- | --- |
| Home Feed | Web/PWA | P0 | AI 热点信息流，产品默认首页 |
| Feed Detail | Web/PWA | P0 | 单条热点详情与来源引用 |
| AI Search | Web/PWA | P0 | Crypto 专属 AI 问答搜索 |
| Narrative | Web/PWA | P0 | 叙事列表与详情 |
| Watchlist | Web/PWA | P0 | 用户关注 Token、Narrative、KOL |
| Telegram Push | Telegram | P0 | 每日总结与异动推送 |
| Admin CMS | Web | P0 | 内容、Narrative、Prompt、Push 管理 |
| 用户系统 | Web/API | P0 | 登录、用户身份、基础权限 |

### 2.2 MVP 暂不做功能

以下功能不得在 MVP 中实现：

- 交易所功能
- 钱包功能
- 发币功能
- NFT 市场
- DAO 功能
- GameFi 功能
- AI 自动交易
- 用户发帖
- 评论系统
- 私信系统
- 自研大模型
- 复杂链上关系图谱
- React Native 原生 App
- 付费订阅支付闭环
- 广告系统

### 2.3 MVP 产品形态

MVP 只做 Web-first + PWA：

- 必须使用响应式 Web 页面覆盖移动端和桌面端。
- 必须支持 PWA 安装体验。
- 暂不开发 React Native App。
- 暂不开发 iOS/Android 原生能力。

---

## 3. 用户与权限

### 3.1 用户类型

| 用户类型 | 典型行为 | 核心需求 |
| --- | --- | --- |
| 高频 Crypto 用户 | 高频刷 Twitter/X、新闻、KOL、行情 | 更快发现热点，减少信息筛选成本 |
| 普通投资用户 | 主要关注 BTC/ETH，不理解复杂叙事 | 用简单语言理解市场变化 |
| 内容创作者/KOL | 需要选题、观点和热点素材 | 快速获得市场总结和叙事线索 |

### 3.2 MVP 登录方式

MVP 必须支持：

- Google 登录
- Telegram 绑定
- 邮箱 Magic Link 登录

MVP 暂不支持：

- Apple 登录
- 钱包登录

### 3.3 MVP 权限模型

MVP 只实现两种权限：

| 角色 | 权限 |
| --- | --- |
| user | 使用前台产品、保存 Watchlist、绑定 Telegram |
| admin | 访问 Admin CMS、编辑内容、管理 Prompt、触发 Push |

MVP 不实现 Pro 订阅限制。所有登录用户均可使用 AI Search，但必须做每日调用次数限制，默认每用户每天 30 次。

---

## 4. 信息架构

### 4.1 Mobile 导航

移动端底部导航必须固定为 4 个 Tab：

1. Home
2. Search
3. Watchlist
4. Me

移动端不得新增第 5 个以上一级 Tab。Narrative 不放入底部导航，只能通过 Home 卡片、Search 结果、Narrative Chip 进入。

### 4.2 Desktop 导航

桌面端使用左侧 Sidebar，必须包含：

1. Home
2. Search
3. Narrative
4. Watchlist
5. Notifications
6. Settings

### 4.3 Admin 导航

Admin CMS 必须包含：

1. Dashboard
2. Feed 管理
3. Narrative 管理
4. Prompt 管理
5. Push 管理
6. 数据源监控
7. 用户管理
8. 日志中心

---

## 5. Home Feed

### 5.1 页面目标

用户打开 Home 后，必须在首屏看到：

1. BTC 与 ETH 最新价格和 24h 涨跌幅。
2. 当前市场情绪。
3. 当前最热 3 个 Narrative。
4. 至少 5 条按热度排序的 Feed 卡片。

### 5.2 页面布局

#### Mobile 布局

移动端必须使用单列布局：

1. 顶部 Header：Logo、Search 入口、通知入口。
2. Market Heat Bar：BTC、ETH、Fear & Greed、总市值变化。
3. Trending Narrative Chips：最多展示 5 个。
4. Feed Tabs：For You、Latest、Breaking。
5. Feed List：无限滚动。
6. Bottom Navigation：固定底部。

#### Desktop 布局

桌面端必须使用三栏布局：

1. 左栏：固定 Sidebar。
2. 中栏：Feed 主体。
3. 右栏：Market Panel，展示 Trending Tokens、Trending Narratives、AI Market Summary 和 Watchlist 快捷入口。

### 5.3 Feed 卡片类型

MVP 必须支持 4 种 Feed 类型：

| 类型 | type 值 | 说明 |
| --- | --- | --- |
| 新闻热点 | news | 来自 RSS 或可信新闻源 |
| Narrative 热点 | narrative | 叙事热度明显变化 |
| 市场异动 | market_move | Token 价格或成交量显著变化 |
| 社区热议 | social_trend | Twitter/X 或 Reddit 讨论热度上升 |

### 5.4 Feed 卡片字段

每张 Feed 卡片必须展示：

- title：标题，最多 90 个中文字符或 160 个英文字符。
- ai_summary：AI 总结，最多 160 个中文字符或 280 个英文字符。
- source：来源名称。
- publish_time：发布时间。
- related_tokens：相关 Token，最多 5 个。
- narrative_tags：相关 Narrative，最多 3 个。
- sentiment：bullish、neutral、bearish 三选一。
- heat_score：0-100 的整数。

### 5.5 Feed 卡片交互

每张 Feed 卡片必须支持：

- 点击卡片进入 Feed Detail。
- 点击来源打开原文链接，新窗口打开。
- 收藏到 Bookmarks。
- 添加相关 Token 或 Narrative 到 Watchlist。
- 分享链接。

### 5.6 Feed 排序

默认排序使用综合分数 `rank_score`，公式必须实现为：

```txt
rank_score =
heat_score * 0.40
+ recency_score * 0.25
+ source_weight * 0.15
+ engagement_score * 0.10
+ user_interest_score * 0.10
```

字段定义：

- heat_score：0-100，由热度算法产生。
- recency_score：0-100，发布时间越近分数越高。
- source_weight：0-100，来源权重。
- engagement_score：0-100，点击、收藏、分享综合分。
- user_interest_score：0-100，根据用户 Watchlist 匹配度计算。

未登录用户的 `user_interest_score` 固定为 0。

### 5.7 Feed 刷新

MVP 必须实现：

- 页面首次加载拉取最新 Feed。
- 用户手动下拉刷新。
- 前端每 60 秒自动刷新一次列表顶部数据。
- MVP 不实现 WebSocket。

---

## 6. Feed Detail

### 6.1 页面目标

Feed Detail 必须帮助用户理解单个事件的事实、原因、影响和引用来源。

### 6.2 页面结构

Feed Detail 必须包含：

1. 标题。
2. 发布时间与来源。
3. AI Summary。
4. Key Reasons：最多 5 条要点。
5. Market Impact：对相关 Token/Narrative 的影响。
6. Related Tokens。
7. Related Narratives。
8. Sources：引用来源列表。
9. Similar Feed：相似内容，最多 5 条。

### 6.3 Sources 展示规则

每个 Source 必须包含：

- source_name
- source_type：news、twitter、reddit、official、market_data
- url
- published_at

AI 生成内容必须可追溯到至少 1 个 Source。没有 Source 的 Feed 不得展示给普通用户。

---

## 7. AI Search

### 7.1 页面目标

AI Search 允许用户用自然语言提问，并返回带引用来源的 crypto 市场解释。

### 7.2 用户输入

输入框必须支持：

- 中文问题
- 英文问题
- Token Symbol，例如 `ETH`、`SOL`
- Narrative 名称，例如 `AI`、`Meme`

输入为空时不得提交。单次输入最大 500 字符。

### 7.3 推荐问题

搜索页默认展示 6 个推荐问题：

1. 为什么 BTC 今天上涨或下跌？
2. 最近最热的 Narrative 是什么？
3. ETH 最近有什么重要事件？
4. Meme 币现在热度如何？
5. 哪些 Token 过去 24 小时异动明显？
6. 今天 crypto 市场最大的风险是什么？

### 7.4 AI 回答结构

AI Search 返回结果必须包含：

1. AI Answer：不超过 500 字。
2. Key Reasons：3-6 条。
3. Market Impact：影响说明。
4. Related Tokens：最多 8 个。
5. Related Narratives：最多 5 个。
6. Sentiment：bullish、neutral、bearish 三选一。
7. Sources：至少 2 个来源。
8. Updated At：回答生成时间。

### 7.5 AI Search 处理流程

后端必须按以下流程处理：

```txt
用户问题
→ Query Parser 提取 token、narrative、时间范围、意图
→ 从 PostgreSQL 与 Vector Search 检索相关内容
→ 组装 RAG Context
→ 调用 LLM 生成结构化回答
→ 保存 ai_search_history
→ 返回前端
```

### 7.6 AI 输出硬规则

AI 回答必须遵守：

- 不得承诺收益。
- 不得给出直接买入、卖出、杠杆建议。
- 必须区分事实、推测和市场情绪。
- 必须展示来源。
- 信息不足时必须明确说明“当前可用来源不足，以下为有限信息总结”。
- 必须使用简洁市场语言，不得输出泛泛而谈的 ChatGPT 式套话。

---

## 8. Narrative 模块

### 8.1 MVP Narrative 范围

MVP 只支持 8 个初始 Narrative：

1. AI
2. Meme
3. RWA
4. DePIN
5. Stablecoin
6. Layer2
7. Solana
8. Ethereum

Admin 可新增、编辑、隐藏 Narrative。

### 8.2 Narrative 列表页

列表页每个 Narrative 必须展示：

- name
- heat_score
- 24h_change
- 7d_change
- top_tokens：最多 5 个
- twitter_mentions
- feed_count_24h
- ai_summary

### 8.3 Narrative 排序

默认按 `heat_score` 降序排序。用户可切换：

- Hottest：按 heat_score。
- Fastest Rising：按 24h_change。
- Most Discussed：按 twitter_mentions。

### 8.4 Narrative 详情页

详情页必须包含：

1. Narrative Header：名称、热度、24h/7d 变化。
2. AI Narrative Summary：当前状态总结。
3. Heat Chart：24h、7d、30d 三个时间范围。
4. Top Tokens：最多 10 个。
5. Related Feed：相关 Feed，最多 20 条。
6. Top Sources：相关来源，最多 10 个。
7. Sentiment：bullish、neutral、bearish。
8. Follow 按钮：加入 Watchlist。

---

## 9. Watchlist

### 9.1 可关注对象

MVP 支持关注：

- Token
- Narrative
- KOL

MVP 不支持关注钱包地址。

### 9.2 Watchlist 页面

Watchlist 页面必须展示：

1. 用户关注对象列表。
2. 每个对象的最新动态。
3. 每个对象的 24h 热度变化。
4. AI Summary：对关注对象最近变化的总结。
5. 通知开关：是否接收 Telegram Push。

### 9.3 Watchlist 触发 Push 条件

当满足以下任一条件时，系统必须创建一条待推送记录：

- 用户关注 Token 24h 价格变化绝对值 >= 8%。
- 用户关注 Narrative heat_score 1 小时变化 >= 15。
- 用户关注 KOL 发布内容被系统判定为 high impact。
- 用户关注对象出现在 Breaking Feed 中。

---

## 10. Telegram Push

### 10.1 功能目标

Telegram Push 用于提升留存和实时感。MVP 必须支持用户绑定 Telegram，并接收每日总结和异动推送。

### 10.2 绑定流程

绑定流程必须为：

1. 用户在 Web 端点击绑定 Telegram。
2. 系统生成一次性绑定码，有效期 10 分钟。
3. 用户在 Telegram Bot 输入绑定码。
4. 后端校验绑定码并保存 `telegram_chat_id`。
5. Web 端显示绑定成功。

### 10.3 Push 类型

MVP 必须支持 3 种 Push：

| 类型 | 触发方式 | 默认频率 |
| --- | --- | --- |
| daily_digest | 定时触发 | 每天 09:00，按用户本地时区 |
| market_alert | 异动触发 | 每用户每小时最多 3 条 |
| watchlist_alert | Watchlist 触发 | 每用户每小时最多 5 条 |

### 10.4 Push 内容结构

每条 Push 必须包含：

- 标题
- 3-5 条要点
- 相关 Token/Narrative
- 查看详情链接
- 风险提示文案：“Not financial advice.”

### 10.5 Push 限流

MVP 必须实现：

- 每用户每天最多 20 条 Push。
- 同一 Feed 事件不得对同一用户重复推送。
- 用户可在 Settings 中关闭 Telegram Push。

---

## 11. Admin CMS

### 11.1 Admin 目标

Admin CMS 是 AI 内容运营控制中心，必须支持人工接管 AI 输出。

### 11.2 Dashboard

Dashboard 必须展示：

- 今日 Feed 数量
- 今日 AI Search 次数
- 今日 Telegram Push 数量
- 热门 Narrative Top 10
- Token 消耗
- LLM 调用错误率
- 数据源状态

### 11.3 Feed 管理

Feed 管理列表必须展示：

- title
- type
- source
- heat_score
- narrative_tags
- publish_time
- status
- is_pinned

必须支持操作：

- 编辑 title
- 编辑 ai_summary
- 编辑 narrative_tags
- 置顶/取消置顶
- 隐藏/恢复
- 删除
- 标记 AI 错误

### 11.4 Narrative 管理

必须支持：

- 创建 Narrative
- 编辑名称、描述、summary
- 设置是否展示
- 设置权重
- 合并 Narrative
- 查看关联 Feed

### 11.5 Prompt 管理

必须支持管理以下 Prompt：

- feed_summary_prompt
- narrative_summary_prompt
- sentiment_prompt
- ai_search_prompt
- push_prompt

每个 Prompt 必须有版本管理：

- prompt_key
- version
- content
- status：draft、active、archived
- created_by
- created_at

同一个 `prompt_key` 只能有一个 active 版本。

### 11.6 Push 管理

必须支持：

- 查看 Push 记录
- 手动创建 Push
- 选择目标用户：全部用户、指定用户、指定 Watchlist 人群
- 预览 Push 内容
- 立即发送或定时发送
- 查看发送状态

### 11.7 数据源监控

必须展示：

- source_name
- source_type
- last_success_at
- last_error_at
- error_message
- status：active、paused、error
- fetch_interval_seconds

必须支持：

- 启停数据源
- 手动重试
- 查看最近 50 条采集日志

### 11.8 用户管理

MVP 用户管理必须支持：

- 查看用户列表。
- 按 email、role、Telegram 绑定状态搜索用户。
- 查看单个用户的 AI Search 使用量。
- 查看单个用户的 Watchlist 数量。
- 修改用户角色：user、admin。
- 禁用或恢复用户账号。

MVP 不支持复杂 RBAC，只支持 user 和 admin 两种角色。

### 11.9 AI Monitor

MVP AI Monitor 必须展示：

- 今日 LLM 调用次数。
- 今日 Token 消耗。
- 今日 LLM 成本估算。
- Prompt 调用分布。
- Provider 错误率。
- 平均响应时间。
- 最近 50 条 LLM 错误日志。

### 11.10 系统配置

MVP 系统配置必须支持：

- 修改 Heat Score 权重参数。
- 修改 Feed 自动刷新间隔。
- 修改 AI Search 每用户每日次数限制。
- 修改 Telegram Push 每日上限。
- 切换 LLM Provider 和模型。
- 启停 Feature Flag。

系统配置修改必须写入 Admin 审计日志。

### 11.11 Token 与 KOL 管理

MVP Token 管理必须支持：

- 查看 Token 列表。
- 编辑 Token 名称、symbol、coingecko_id。
- 设置 Token 是否展示。
- 手动刷新 Token 行情。

MVP KOL 管理必须支持：

- 创建 KOL。
- 编辑 KOL 名称、handle、platform、profile_url。
- 设置 KOL influence_score。
- 设置 KOL 是否启用。

### 11.12 手动内容管理

Admin 必须支持手动创建 Feed Item，用于外部数据源异常或运营补充内容。

手动 Feed Item 必须包含：

- title
- content
- ai_summary
- source_name
- source_url
- related_tokens
- narrative_tags
- publish_time
- status

手动创建的 Feed 必须标记 source_type 为 manual。

### 11.13 日志中心与审计

日志中心必须展示：

- API 错误日志。
- 数据采集错误日志。
- LLM 调用错误日志。
- Push 发送错误日志。
- Admin 操作审计日志。

以下 Admin 操作必须写入审计日志：

- 修改 Feed。
- 隐藏、恢复、删除 Feed。
- 修改 Prompt。
- 启用 Prompt 版本。
- 修改系统配置。
- 修改用户角色。
- 禁用或恢复用户。

---

## 12. 数据源

### 12.1 MVP 数据源

MVP 必须接入：

| 数据源 | 用途 | 刷新频率 |
| --- | --- | --- |
| RSS 新闻 | 新闻热点 | 5 分钟 |
| CoinGecko | Token 价格、市值、涨跌幅 | 60 秒 |
| Twitter/X API 或可替代数据服务 | KOL、讨论热度、Narrative 提及 | 5 分钟 |
| Reddit API | 社区讨论 | 10 分钟 |

如果 Twitter/X API 无法使用，必须通过 Admin 数据源配置关闭 Twitter/X，并使用 RSS + Reddit + CoinGecko 保持产品可运行。

### 12.2 初始 RSS 来源

MVP 默认配置：

- CoinDesk
- Cointelegraph
- Decrypt
- The Block

### 12.3 数据清洗规则

采集服务必须执行：

- 去重：相同 URL 不重复入库。
- 标题相似度去重：相似度 >= 0.92 的标题只保留最新一条。
- 空内容过滤：title 或 url 为空的数据不得入库。
- 语言保留：中文和英文均保留。
- 来源权重：每个 source 必须有 `source_weight`。

---

## 13. AI 系统

### 13.1 MVP AI 能力

MVP 只实现：

- Feed AI Summary
- Narrative 分类
- Sentiment 分析
- AI Search RAG 回答
- Push 文案生成

MVP 不实现：

- 自动交易建议
- 自研模型训练
- 多 Agent 自主决策
- 复杂链上因果推断

### 13.2 LLM Provider

必须支持 OpenAI 与 Anthropic 两个 Provider 的配置。默认使用 OpenAI。Provider、模型名、温度、最大输出 Token 必须可在环境变量中配置。

### 13.3 Embedding 与 Vector Search

MVP 必须使用 PostgreSQL + pgvector。不得在 MVP 引入 Pinecone。

### 13.4 AI Pipeline

```txt
数据采集
→ 数据清洗
→ 内容入库
→ Embedding
→ Narrative 分类
→ Feed Summary
→ Sentiment 分析
→ Heat Score 计算
→ Feed Ranking
→ 前台展示 / Push 触发
```

### 13.5 Heat Score 算法

必须实现 0-100 分热度：

```txt
raw_heat =
mentions_1h * 0.25
+ engagement_1h * 0.25
+ price_change_abs_24h * 0.20
+ volume_change_24h * 0.15
+ source_weight * 0.15

heat_score = min(100, round(raw_heat))
```

字段不足时按 0 计算。算法参数必须可在 Admin 系统配置中调整。

### 13.6 Sentiment 输出

Sentiment 只能输出：

- bullish
- neutral
- bearish

不得输出其他字符串。

---

## 14. API 规格

### 14.1 通用规则

所有 API 必须：

- 使用 RESTful 风格。
- 请求和响应使用 JSON。
- 错误响应包含 `code`、`message`、`request_id`。
- 需要登录的接口必须校验用户身份。
- Admin 接口必须校验 admin 角色。

### 14.2 Auth API

必须实现：

- POST /api/auth/magic-link：发送邮箱登录链接。
- POST /api/auth/callback：完成 Magic Link 登录。
- GET /api/auth/me：返回当前用户信息。
- POST /api/auth/logout：退出登录。
- POST /api/auth/google：完成 Google OAuth 登录。

`GET /api/auth/me` Response 必须包含：

```json
{
  "id": "string",
  "email": "user@example.com",
  "name": "string",
  "role": "user",
  "telegram_bound": true,
  "daily_ai_search_remaining": 30
}
```

### 14.3 Feed API

#### GET /api/feed

Query：

- tab：for_you、latest、breaking，默认 for_you。
- cursor：分页游标，可选。
- limit：默认 20，最大 50。

Response：

```json
{
  "items": [
    {
      "id": "string",
      "type": "news",
      "title": "string",
      "ai_summary": "string",
      "source": "string",
      "source_url": "string",
      "publish_time": "string",
      "related_tokens": ["ETH"],
      "narrative_tags": ["AI"],
      "sentiment": "neutral",
      "heat_score": 82
    }
  ],
  "next_cursor": "string"
}
```

#### GET /api/feed/:id

返回 Feed Detail 所需全部字段。

### 14.4 Bookmark API

必须实现：

- GET /api/bookmarks
- POST /api/bookmarks
- DELETE /api/bookmarks/:id

Bookmark 只支持收藏 Feed Item。

### 14.5 Trending API

#### GET /api/trending

Response 必须包含：

- tokens
- narratives
- market_summary

### 14.6 AI Search API

#### POST /api/ai/search

Request：

```json
{
  "query": "Why is ETH moving today?"
}
```

Response：

```json
{
  "answer": "string",
  "key_reasons": ["string"],
  "market_impact": "string",
  "related_tokens": ["ETH"],
  "related_narratives": ["Ethereum"],
  "sentiment": "neutral",
  "sources": [
    {
      "source_name": "CoinDesk",
      "source_type": "news",
      "url": "https://example.com",
      "published_at": "2026-05-22T00:00:00Z"
    }
  ],
  "updated_at": "2026-05-22T00:00:00Z"
}
```

### 14.7 Narrative API

#### GET /api/narratives

返回 Narrative 列表。

#### GET /api/narratives/:id

返回 Narrative 详情。

### 14.8 Watchlist API

必须实现：

- GET /api/watchlist
- POST /api/watchlist
- DELETE /api/watchlist/:id
- PATCH /api/watchlist/:id/notification

### 14.9 Settings API

必须实现：

- GET /api/settings/notifications
- PATCH /api/settings/notifications

通知设置必须包含：

- telegram_push_enabled
- daily_digest_enabled
- market_alert_enabled
- watchlist_alert_enabled

### 14.10 Telegram API

必须实现：

- POST /api/telegram/bind-code
- POST /api/telegram/webhook
- POST /api/telegram/unbind

### 14.11 Admin API

必须实现：

- GET /api/admin/dashboard
- GET /api/admin/feed
- POST /api/admin/feed
- PATCH /api/admin/feed/:id
- POST /api/admin/feed/:id/pin
- POST /api/admin/feed/:id/hide
- GET /api/admin/narratives
- POST /api/admin/narratives
- PATCH /api/admin/narratives/:id
- GET /api/admin/prompts
- POST /api/admin/prompts
- PATCH /api/admin/prompts/:id/activate
- GET /api/admin/push
- POST /api/admin/push/send
- GET /api/admin/sources
- PATCH /api/admin/sources/:id
- POST /api/admin/sources/:id/retry
- GET /api/admin/users
- PATCH /api/admin/users/:id
- GET /api/admin/ai-monitor
- GET /api/admin/config
- PATCH /api/admin/config
- GET /api/admin/tokens
- PATCH /api/admin/tokens/:id
- POST /api/admin/tokens/:id/refresh
- GET /api/admin/kols
- POST /api/admin/kols
- PATCH /api/admin/kols/:id
- GET /api/admin/logs
- GET /api/admin/audit-logs

---

## 15. 数据库模型

### 15.1 必须使用 PostgreSQL

MVP 必须使用 PostgreSQL。所有表必须包含：

- id
- created_at
- updated_at

删除优先使用软删除字段 `deleted_at`，除日志表外不得直接物理删除核心业务数据。

### 15.2 核心表

#### users

- id
- email
- name
- avatar_url
- role：user、admin
- telegram_chat_id
- telegram_bound_at
- daily_ai_search_count
- last_ai_search_reset_at

#### auth_accounts

- id
- user_id
- provider：google、email
- provider_account_id
- access_token_encrypted
- refresh_token_encrypted
- expires_at

#### magic_link_tokens

- id
- email
- token_hash
- expires_at
- consumed_at

#### feed_items

- id
- type：news、narrative、market_move、social_trend
- title
- content
- ai_summary
- source_id
- source_url
- publish_time
- sentiment
- heat_score
- rank_score
- status：draft、published、hidden、deleted
- is_pinned

#### sources

- id
- name
- type：rss、twitter、reddit、coingecko、manual
- url
- source_weight
- status：active、paused、error
- last_success_at
- last_error_at
- last_error_message

#### narratives

- id
- name
- slug
- description
- ai_summary
- heat_score
- trend_score_24h
- trend_score_7d
- is_active
- weight

#### tokens

- id
- symbol
- name
- coingecko_id
- price_usd
- market_cap_usd
- volume_24h_usd
- price_change_24h

#### kols

- id
- name
- handle
- platform：twitter、reddit、telegram
- profile_url
- influence_score
- is_active

#### feed_item_tokens

- feed_item_id
- token_id

#### feed_item_narratives

- feed_item_id
- narrative_id

#### watchlist_items

- id
- user_id
- target_type：token、narrative、kol
- target_id
- notification_enabled

#### bookmarks

- id
- user_id
- feed_item_id

#### notification_preferences

- id
- user_id
- telegram_push_enabled
- daily_digest_enabled
- market_alert_enabled
- watchlist_alert_enabled
- quiet_hours_start
- quiet_hours_end

#### telegram_bind_codes

- id
- user_id
- code_hash
- expires_at
- consumed_at

#### ai_search_history

- id
- user_id
- query
- answer
- sources_json
- tokens_used
- provider
- model

#### prompts

- id
- prompt_key
- version
- content
- status：draft、active、archived
- created_by

#### push_messages

- id
- user_id
- type：daily_digest、market_alert、watchlist_alert、manual
- related_feed_item_id
- title
- body
- status：pending、sent、failed、cancelled
- scheduled_at
- sent_at
- error_message

#### push_delivery_logs

- id
- push_message_id
- user_id
- channel：telegram
- provider_message_id
- status：sent、failed
- error_message
- delivered_at

#### ingestion_logs

- id
- source_id
- status：success、failed
- items_found
- items_created
- error_message
- started_at
- finished_at

#### llm_call_logs

- id
- user_id
- prompt_key
- provider
- model
- input_tokens
- output_tokens
- cost_usd
- latency_ms
- status：success、failed
- error_message

#### system_configs

- id
- config_key
- config_value_json
- updated_by

#### feature_flags

- id
- flag_key
- enabled
- description
- updated_by

#### audit_logs

- id
- admin_user_id
- action
- entity_type
- entity_id
- before_json
- after_json
- ip_address
- user_agent

#### user_events

- id
- user_id
- event_name
- entity_type
- entity_id
- metadata_json

---

## 16. 技术架构

### 16.1 Monorepo 结构

项目必须使用以下目录结构：

```txt
/apps
  /web
  /admin
  /api

/packages
  /ui
  /types
  /prompts
  /config
  /shared

/docs/rules
  MASTER_RULES.md
  frontend-rules.md
  backend-rules.md
  ui-rules.md
  architecture-rules.md
```

### 16.2 前端

必须使用：

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand
- PWA

### 16.3 后端

必须使用：

- NestJS
- TypeScript
- PostgreSQL
- pgvector
- Redis
- BullMQ

### 16.4 部署

MVP 默认部署：

- Web：Vercel
- Admin：Vercel
- API：Railway
- PostgreSQL：Railway PostgreSQL
- Redis：Railway Redis

---

## 17. UI Design System

### 17.1 风格定位

CryptoPilot 必须采用浅色、克制、高信息密度的 AI 金融终端风格。页面必须以信息阅读效率、清晰分组、低视觉噪音和稳定布局为第一优先级。

### 17.2 主题规则

CryptoPilot MVP 必须统一使用浅色 UI 主题。

必须遵守：

- Web 前台、Admin CMS、PWA 安装后的界面必须使用同一套浅色主题。
- MVP 不实现暗色主题。
- MVP 不实现主题切换开关。
- 所有页面背景必须以 #FFFFFF、#FAFAFA、#F5F5F5 为基础。
- 所有文本、边框、卡片、表格、弹窗、导航、Feed Card 必须符合浅色主题对比度。
- 图表、涨跌色、状态色只能作为信息提示色，不得改变整体浅色 UI 主题。

禁止：

- 使用深色背景作为主界面。
- 使用黑色或深灰色大面积 Terminal 风格界面。
- 使用暗色 Sidebar、暗色 Header、暗色 Feed Card。
- 实现 dark mode class、theme switcher、system theme auto-detect。

### 17.3 禁止风格

禁止使用：

- Crypto 赌博风格
- 大面积荧光色
- 大面积渐变背景
- Gaming 风格
- 交易所重交易面板风格
- 大面积 Banner
- 低信息密度营销页

### 17.4 颜色

必须使用以下基础色：

- Background：#FFFFFF、#FAFAFA、#F5F5F5
- Border：#E5E7EB
- Primary Text：#111827
- Secondary Text：#6B7280
- Primary Accent：#2563EB
- Bullish：#16A34A
- Bearish：#DC2626
- Warning：#D97706

### 17.5 字体

必须使用 Inter。中文环境下可回退到系统无衬线字体。

### 17.6 组件规则

- 所有基础 UI 必须使用 shadcn/ui 或 packages/ui 中封装的组件。
- Feed Card 圆角不得超过 8px。
- 按钮、输入框、Tabs、Dialog、Table 必须统一组件。
- 移动端文字不得溢出容器。
- 桌面端三栏布局不得出现横向滚动。

---

## 18. 开发规范

### 18.1 TypeScript

- 所有业务代码必须使用 TypeScript。
- 不得使用 `any` 作为核心业务类型。
- API 请求和响应类型必须放入 `/packages/types`。

### 18.2 文件长度

- 单文件不得超过 300 行。
- 超过 300 行必须拆分组件、service、hook 或 util。

### 18.3 状态管理

- 服务端数据必须使用 TanStack Query。
- 纯客户端 UI 状态可使用 Zustand。
- 不得把远程数据长期复制到 Zustand 中。

### 18.4 主题实现

- Tailwind 配置必须以浅色主题 Token 为唯一默认主题。
- 不得引入暗色主题 Token。
- 不得在根节点、布局组件或页面组件中使用 `dark` class。
- 不得实现根据系统偏好自动切换主题的逻辑。
- shadcn/ui 组件必须统一改造成浅色样式。

### 18.5 错误处理

前端必须展示：

- Loading 状态
- Empty 状态
- Error 状态
- Retry 操作

后端必须记录：

- request_id
- error code
- stack trace
- user_id（如已登录）

### 18.6 测试要求

MVP 必须至少包含：

- API service 单元测试
- Heat Score 算法测试
- AI 输出 schema 校验测试
- 关键页面 smoke test

---

## 19. MVP 开发顺序

### Week 1：基础架构与 Home Feed

必须完成：

- Monorepo 初始化
- Web/Admin/API 基础工程
- PostgreSQL/Redis 连接
- Feed 数据模型
- RSS 采集
- CoinGecko 价格采集
- Home Feed 页面
- Feed Detail 页面

### Week 2：AI 与 Narrative

必须完成：

- Prompt 管理基础能力
- Feed AI Summary
- Sentiment 分析
- Narrative 分类
- Narrative 列表页
- Narrative 详情页
- AI Search API 与页面

### Week 3：Watchlist、Telegram、Admin

必须完成：

- 登录系统
- Watchlist
- Telegram 绑定
- Telegram Push
- Admin Dashboard
- Feed 管理
- Narrative 管理
- Push 管理

### Week 4：稳定性、体验与上线

必须完成：

- PWA
- 响应式适配
- 错误处理
- 限流
- 基础测试
- 部署配置
- 生产环境数据源配置

---

## 20. MVP 验收标准

### 20.1 功能验收

MVP 上线前必须满足：

- 用户可以登录。
- 用户可以退出登录。
- 用户可以浏览 Home Feed。
- 用户可以查看 Feed Detail。
- 用户可以使用 AI Search 并看到引用来源。
- 用户可以查看 Narrative 列表和详情。
- 用户可以添加 Watchlist。
- 用户可以收藏和取消收藏 Feed。
- 用户可以绑定 Telegram。
- 用户可以关闭 Telegram Push。
- 系统可以发送每日总结 Push。
- Admin 可以编辑 Feed Summary。
- Admin 可以编辑 Prompt 并启用新版本。

### 20.2 数据验收

必须满足：

- RSS 新闻每 5 分钟自动采集。
- CoinGecko 价格每 60 秒自动更新。
- Feed 生成后必须有 AI Summary。
- Published Feed 必须至少有 1 个 Source。
- AI Search 必须至少返回 2 个 Source；不足 2 个时必须提示信息不足。

### 20.3 性能验收

必须满足：

- Home 首屏接口 P95 响应时间 < 1.5 秒。
- AI Search 非 Streaming 首包 P95 < 5 秒。
- Feed 列表每页默认 20 条。
- 移动端 Lighthouse Performance >= 80。

### 20.4 安全验收

必须满足：

- Admin API 必须校验 admin 角色。
- Telegram webhook 必须校验 secret。
- AI Search 必须做用户级限流。
- 环境变量不得提交到代码库。
- 所有外部 URL 打开时必须使用安全属性。

### 20.5 UI 主题验收

必须满足：

- Web 前台所有页面均为浅色主题。
- Admin CMS 所有页面均为浅色主题。
- 代码中不得存在暗色主题切换入口。
- 代码中不得存在全局 `dark` class 或系统主题自动检测逻辑。
- 任一主要页面截图不得出现大面积深色背景、深色 Sidebar 或深色 Feed Card。

---

## 21. 成功指标

### 21.1 MVP 产品指标

上线后 30 天观察：

- DAU
- 次日留存
- 7 日留存
- 人均 Feed 浏览数
- 人均 AI Search 次数
- Telegram 绑定率
- Push 点击率

### 21.2 MVP 目标值

MVP 目标值：

- 次日留存 >= 20%
- 7 日留存 >= 8%
- 登录用户中 Telegram 绑定率 >= 15%
- AI Search 后用户继续浏览 Feed 的比例 >= 30%
- Push 点击率 >= 8%

---

## 22. 非功能要求

### 22.1 可观测性

必须记录：

- API 请求日志
- 数据采集日志
- LLM 调用日志
- Push 发送日志
- 用户关键行为事件

### 22.2 成本控制

必须实现：

- AI Search 每用户每日次数限制。
- Feed Summary 不重复生成。
- 相同内容使用缓存。
- Admin Dashboard 展示 Token 消耗。

### 22.3 合规与风险提示

所有 AI 生成的市场分析页面必须展示：

```txt
CryptoPilot provides market information and AI summaries only. This is not financial advice.
```

中文界面展示：

```txt
CryptoPilot 仅提供市场信息和 AI 总结，不构成投资建议。
```

---

## 23. 后续阶段规划

后续阶段不进入 MVP 开发范围。

### Phase 2

- 高级 Smart Money 钱包追踪
- 更多 Narrative 自动发现
- 更完整 Push 策略

### Phase 3

- Pro 订阅
- 支付系统
- 高级 AI Search
- API 产品化

### Phase 4

- React Native App
- 链上复杂图谱
- 多 Agent Alpha Engine

---

## 24. AI 开发 Agent 执行约束

AI 开发 Agent 必须遵守：

1. 不得自行新增 MVP 范围外功能。
2. 不得把后续阶段功能提前实现。
3. 不得改变产品名称 CryptoPilot。
4. 不得改变 Mobile 底部导航结构。
5. 不得改变 Web-first + PWA 的产品形态。
6. 不得删除 Admin 人工修正 AI 内容的能力。
7. 不得生成无引用来源的 AI 市场结论。
8. 不得输出投资建议或收益承诺。
9. 遇到第三方 API 不可用时，必须实现降级方案并记录在 Admin 数据源监控中。
10. 每完成一个模块，必须补齐 Loading、Empty、Error 状态。
