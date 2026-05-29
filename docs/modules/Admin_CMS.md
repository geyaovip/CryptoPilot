# 模块规格：Admin CMS

适用版本：V0.1 起逐步实现  
目标：定义后台管理系统的页面、权限、操作、审计和最小运营闭环。

---

## 1. Admin 目标

Admin 是 AI 内容运营控制中心，必须支持：

- 内容管理。
- AI 修正。
- Prompt 管理。
- 数据源监控。
- Push 管理。
- 用户管理。
- 日志排障。
- 成本监控。
- 系统配置。

## 2. 权限

- 只有 role=`admin` 的用户可访问。
- 所有 `/api/admin/*` 必须校验 admin。
- 所有写操作必须写入 audit_logs。

## 3. 页面清单

MVP 必须包含：

- `/admin/dashboard`
- `/admin/feed`
- `/admin/narratives`
- `/admin/prompts`
- `/admin/feed-clusters`
- `/admin/kols`
- `/admin/sources`
- `/admin/users`
- `/admin/ai-monitor`
- `/admin/insights` 或等价 Insight 管理入口（V0.9）
- `/admin/config`
- `/admin/logs`

延后：

- `/admin/push`：随 V0.5 Telegram Push 单独实现；当前只允许保留日志/配置占位。

## 4. Dashboard

展示：

- 今日 Feed 数。
- 今日 AI Search 次数。
- 今日 Push 数。
- 热门 Narrative。
- Token 消耗。
- LLM 错误率。
- 数据源状态。

## 5. Feed 管理

表格字段：

- title
- type
- source
- heat_score
- status
- is_pinned
- publish_time

操作：

- 创建。
- 编辑。
- 置顶。
- 隐藏。
- 删除。
- 标记 AI 错误。
- 重新生成 AI Summary。

## 6. Prompt 管理

操作：

- 查看版本。
- 创建 draft。
- 编辑 draft。
- 测试。
- 激活。
- 归档。

限制：

- active 唯一。
- active 不允许直接编辑，只能创建新版本。

## 7. 数据源监控

必须展示：

- source name。
- status。
- last_success_at。
- last_error_at。
- consecutive_failures。
- error_message。
- fetch_interval。

操作：

- 启停。
- 重试。
- 查看日志。
- 表格分页。

## 8. 用户管理

必须支持：

- 搜索用户。
- 查看详情。
- 修改角色。
- 禁用/恢复。
- 查看 AI Search 使用量。
- 查看 Telegram 绑定状态。

## 8.1 KOL 源管理

定位：

- KOL 源是 KOL / 社交信号与用户 Watchlist 的账号画像库，不是 RSS/API 采集管道。
- 完整 KOL Signal 采集属于 V0.9 Post-MVP 子阶段；未接入前后台需明确标注其用途。

必须支持：

- 创建 KOL。
- 编辑 handle、platform、profile_url、influence_score。
- 启用/停用。
- 表格分页。

## 8.2 Insight 管理

适用版本：V0.9 起。

必须支持：

- 查看 Insight 列表与来源。
- 查看关联 Signals。
- 重新合成。
- 写操作审计。
- Insight 发布前必须满足去重后至少 2 个可点击来源。

## 9. 系统配置

必须支持：

- Heat Score 参数。
- AI Search 限额。
- Push 上限。
- LLM Provider。
- Feature Flag。

## 10. 日志中心

必须展示：

- API 错误。
- 采集错误。
- LLM 错误。
- Push 错误。
- Admin 审计。

## 11. 验收

- 非 admin 无法访问。
- Admin 写操作有审计。
- 页面均有 Loading/Empty/Error。
- 表格支持分页。
- 所有页面为浅色主题。
