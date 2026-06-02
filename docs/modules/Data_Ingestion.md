# 模块规格：数据采集

适用版本：V0.2 起  
目标：定义 RSS、CoinGecko、Twitter/X 替代源、Reddit 的采集、清洗、日志和降级规则。

---

## 1. 数据源

MVP：

- RSS 新闻。
- CoinGecko。
- Twitter/X API 或替代服务。
- Reddit。

### 1.1 中文读者（默认）

- 种子数据包含 **中文源**（如律动 BlockBeats 开放快讯 API）与 **英文源**（CoinDesk 等）；`sources.content_locale` 为 `zh` / `en`。
- 中文源 `source_weight` 更高；列表 API 支持 `locale=zh` 提升中文条目排序。
- 英文条目经 `feed_summary_prompt` 生成 **中文 headline + summary**（卡片主文案为中文）。
- Admin → 数据源 可查看「语言」列；可在库中追加可用中文 RSS URL（部分国内站点无公开 RSS，需 API 或运营录入）。
- Medium、Substack、Mirror、Paragraph、项目方博客作为 RSS 内容源接入，不单独新增 source 类型；优先收录项目方、研究机构和高质量作者的 feed，避免直接接大标签流。
- 当前实现状态：RSS、Medium/Substack/Mirror/Paragraph/项目博客 RSS、CoinGecko 已接入；Reddit Provider 已预留但目录源默认暂停，需 API 注册/OAuth 配置后再启用；Twitter/X 仍为规划源，正式接入前不得在 UI 中暗示其已稳定运行。

## 2. 采集频率

- RSS：5 分钟。
- CoinGecko：60 秒。
- Twitter/X：5 分钟。
- Reddit：10 分钟。

## 3. 数据清洗

必须执行：

- URL 去重。
- title 为空过滤。
- source_url 为空过滤。
- 标题相似度去重。
- 内容长度过短过滤。
- 来源权重。

Reddit 额外过滤：

- 仅采白名单 subreddit。
- 过滤 daily discussion、megathread、simple questions、giveaway、referral、100x、moonshot、shill、price prediction、what should I buy 等低价值内容。
- 必须命中至少一个资产、叙事或市场主题关键词。
- 结合 score、comments、时效性和 source_weight 计算社交信号分数，低分不入库。
- 入库类型为 `social_trend`，后续进入 Feed 聚类和 Market Insight 合成。

## 4. 失败处理

必须记录：

- source_id。
- started_at。
- finished_at。
- status。
- items_found。
- items_created。
- error_message。

失败重试：

- 单次任务失败最多重试 2 次。
- `sources.consecutive_failures` 记录连续失败次数。
- 采集成功必须将 `consecutive_failures` 清零。
- 连续失败 5 次将 source 标记为 error，并在 `error_message` 中说明自动降级原因。
- error 状态 source 不自动采集，等待 Admin 手动恢复。

## 5. 降级

Twitter/X 不可用时：

- Admin 可停用 source。
- 系统继续使用 RSS + Reddit + CoinGecko。
- 前台不得因为单一数据源失败而不可用。

Reddit 未启用、未配置 OAuth 或触发限流时：

- 默认不自动采集 Reddit，避免未获 API 权限时产生无效失败噪音。
- 已启用的 Reddit source 需要写入失败日志并增加 `consecutive_failures`。
- 连续失败 5 次自动标记为 error。
- RSS、Medium/Substack/Mirror/Paragraph/项目博客 RSS、CoinGecko 和前台页面必须继续可用。

## 6. 输出

采集结果进入：

- feed_items
- sources
- tokens
- ingestion_logs

## 7. 验收

- RSS 可定时采集。
- Reddit 可在配置 OAuth 并手动启用 source 后定时采集公开 subreddit。
- Medium/Substack/Mirror/Paragraph/项目博客 RSS 可作为普通 RSS 源采集，并清理 HTML、平台页脚与常见发布平台样板文案。
- CoinGecko 可定时更新。
- 失败有日志。
- Source 状态可在 Admin 查看。
- Admin 可查看连续失败次数。
- 采集任务不会重复创建同 URL Feed。
