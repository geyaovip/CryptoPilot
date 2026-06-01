# CryptoPilot V0.5 Telegram Push 开发规格

> **当前状态**：产品方已明确启动 V0.5 Telegram Push 专项，本版本进入实现与验收阶段。

版本目标：实现 Telegram 绑定、每日总结、市场异动、Watchlist 异动、Push 管理、通知设置和限流。  
依赖版本：V0.6 MVP Beta 已完成，或产品方明确启动 Telegram 专项。

---

## 1. 本版本必须完成

- Telegram Bot 基础命令。
- Web 端绑定 Telegram。
- 一次性绑定码。
- Telegram webhook。
- Daily Digest 生成与发送。
- Market Alert 触发。
- Watchlist Alert 触发。
- Push 限流。
- 用户通知设置。
- Admin Push 管理。
- Push 发送日志。

## 2. 本版本禁止实现

- 不实现 App Push。
- 不实现 Email Push。
- 不实现 Native App。
- 不实现复杂自定义 Alert Center。
- 不实现付费订阅。

---

## 3. Telegram Bot 命令

必须支持：

- `/start`
- `/bind <code>`
- `/summary`
- `/watchlist`
- `/pause`
- `/resume`
- `/help`

命令行为：

- `/start`：展示欢迎语和绑定说明。
- `/bind <code>`：完成绑定。
- `/summary`：返回最近一次 Daily Digest。
- `/watchlist`：返回用户 Watchlist 概览。
- `/pause`：关闭 Telegram Push。
- `/resume`：开启 Telegram Push。
- `/help`：展示命令列表。

## 4. 绑定流程

Web：

1. 用户进入 `/me` 或 Settings。
2. 点击绑定 Telegram。
3. 调用 `POST /api/telegram/bind-code`。
4. 显示绑定码和 Bot 链接。

Telegram：

1. 用户向 Bot 发送 `/bind <code>`。
2. Webhook 校验 code。
3. 保存 `telegram_chat_id`。
4. 标记 code consumed。
5. 返回绑定成功。

绑定码规则：

- 6 位数字或字母。
- 有效期 10 分钟。
- 一次性使用。
- 仅绑定当前登录用户。

## 5. Push 类型

### daily_digest

默认每天 09:00 按用户本地时区发送。

内容：

- 今日市场总结。
- Top 3 Feed。
- Top 3 Narrative。
- Top Movers。
- 风险提示。

### market_alert

触发条件：

- Token 24h 绝对涨跌幅 >= 8%。
- Feed type = breaking。
- Narrative heat_score 1 小时变化 >= 15。

### watchlist_alert

触发条件：

- 关注 Token 触发 market_alert。
- 关注 Narrative heat_score 1 小时变化 >= 15。
- 关注 KOL 发布 high impact 内容。

## 6. 限流

必须实现：

- 每用户每天最多 20 条 Push。
- 每用户每小时最多 5 条 watchlist_alert。
- 每用户每小时最多 3 条 market_alert。
- 同一 Feed 不得重复推给同一用户。
- 用户关闭 Telegram Push 后不得发送。

## 7. 页面

### `/me`

必须展示：

- Telegram 绑定状态。
- 绑定按钮。
- 解绑按钮。
- Push 开关。

### `/settings/notifications`

必须展示：

- telegram_push_enabled。
- daily_digest_enabled。
- market_alert_enabled。
- watchlist_alert_enabled。

### Admin `/admin/push`

必须支持：

- 查看 Push 列表。
- 筛选 type/status。
- 预览内容。
- 手动创建 Push。
- 选择目标用户。
- 立即发送。
- 查看失败原因。

## 8. API 清单

必须实现：

- `POST /api/telegram/bind-code`
- `POST /api/telegram/webhook`
- `POST /api/telegram/unbind`
- `GET /api/settings/notifications`
- `PATCH /api/settings/notifications`
- `GET /api/admin/push`
- `POST /api/admin/push/send`

## 9. 数据库新增

必须完善：

- telegram_bind_codes
- notification_preferences
- push_messages
- push_delivery_logs

唯一性：

- `push_messages(user_id, related_feed_item_id, type)` 防重复。

## 10. AI Push 文案

Push Prompt 输出 Schema：

```json
{
  "title": "string",
  "bullets": ["string"],
  "related_tokens": ["string"],
  "related_narratives": ["string"],
  "risk_note": "仅供研究参考，不构成投资建议。"
}
```

规则：

- 标题不超过 60 字符。
- bullets 3-5 条。
- 必须包含中文风险提示：`仅供研究参考，不构成投资建议。`。

## 11. 测试清单

必须包含：

- 绑定码过期测试。
- 绑定码重复使用测试。
- Telegram webhook secret 校验测试。
- Push 限流测试。
- 重复 Push 防重测试。
- 用户关闭 Push 后不发送测试。
- Admin 手动 Push 权限测试。

## 12. 验收标准

V0.5 完成必须满足：

- 用户可绑定和解绑 Telegram。
- 用户可关闭和开启 Telegram Push。
- 系统可发送 Daily Digest。
- Watchlist 变化可生成待发送 Push。
- Push 限流生效。
- Admin 可查看和手动发送 Push。
- Push 失败有日志。
