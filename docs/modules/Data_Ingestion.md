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
- 连续失败 5 次将 source 标记为 error。
- error 状态 source 不自动采集，等待 Admin 手动恢复。

## 5. 降级

Twitter/X 不可用时：

- Admin 可停用 source。
- 系统继续使用 RSS + Reddit + CoinGecko。
- 前台不得因为单一数据源失败而不可用。

## 6. 输出

采集结果进入：

- feed_items
- sources
- tokens
- ingestion_logs

## 7. 验收

- RSS 可定时采集。
- CoinGecko 可定时更新。
- 失败有日志。
- Source 状态可在 Admin 查看。
- 采集任务不会重复创建同 URL Feed。

