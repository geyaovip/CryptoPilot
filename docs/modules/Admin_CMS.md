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
- `/admin/push`
- `/admin/sources`
- `/admin/users`
- `/admin/ai-monitor`
- `/admin/config`
- `/admin/logs`

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
- error_message。
- fetch_interval。

操作：

- 启停。
- 重试。
- 查看日志。

## 8. 用户管理

必须支持：

- 搜索用户。
- 查看详情。
- 修改角色。
- 禁用/恢复。
- 查看 AI Search 使用量。
- 查看 Telegram 绑定状态。

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

