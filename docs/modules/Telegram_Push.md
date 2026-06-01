# 模块规格：Telegram Push

适用版本：V0.5（Telegram Push 专项）  
目标：定义 Telegram 绑定、推送类型、限流、后台管理和失败处理。

---

## 1. 绑定

Web 生成绑定码，Telegram Bot 消费绑定码。

规则：

- 绑定码有效期 10 分钟。
- 一次性使用。
- 绑定成功后保存 telegram_chat_id。
- 用户可解绑。

## 2. Bot 命令

- `/start`
- `/bind <code>`
- `/summary`
- `/watchlist`
- `/pause`
- `/resume`
- `/help`

## 3. Push 类型

- daily_digest
- market_alert
- watchlist_alert
- manual

## 4. Push 内容

必须包含：

- title
- bullets
- related_tokens
- related_narratives
- detail_url
- 中文风险提示：仅供研究参考，不构成投资建议。

## 5. 限流

- 每用户每天最多 20 条。
- market_alert 每小时最多 3 条。
- watchlist_alert 每小时最多 5 条。
- 同一 Feed 不重复发送。

## 6. 用户设置

用户可关闭：

- Telegram Push。
- Daily Digest。
- Market Alert。
- Watchlist Alert。

## 7. Admin

必须支持：

- 查看 Push 列表。
- 手动发送。
- 预览。
- 查看发送状态。
- 查看失败原因。

## 8. 验收

- 可绑定。
- 可解绑。
- 可发送 daily_digest。
- 限流有效。
- 关闭通知后不发送。
- 失败有日志。
