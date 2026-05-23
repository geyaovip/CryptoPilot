# CryptoPilot 前端规则

本文件适用于 `apps/web`、`apps/admin` 和 `packages/ui` 中的所有前端代码。

---

## 1. 技术栈

Frontend 必须使用：

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand

禁止引入：

- Redux
- Material UI
- Chakra UI
- Ant Design
- 新功能使用 CSS modules
- styled-components
- dark mode libraries

---

## 2. 应用边界

`apps/web` 只用于用户前台产品。

`apps/admin` 只用于内部 Admin CMS。

共享组件只有在两个应用都会使用，或明确具有复用价值时，才放入 `packages/ui`。

禁止 `apps/web` 和 `apps/admin` 直接互相 import component。

---

## 3. 路由

Web MVP 路由：

- `/`
- `/home`
- `/feed/[id]`
- `/search`
- `/narratives`
- `/narratives/[slug]`
- `/watchlist`
- `/me`
- `/login`
- `/settings/notifications`

Admin MVP 路由：

- `/admin`
- `/admin/login`
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

除非当前版本文档明确要求，否则不得新增一级核心路由。

---

## 4. UI 主题

只能使用浅色主题。

必须使用：

- Background: `#FFFFFF`
- Muted background: `#FAFAFA`
- Panel background: `#F5F5F5`
- Border: `#E5E7EB`
- Primary text: `#111827`
- Secondary text: `#6B7280`
- Accent: `#2563EB`
- Bullish: `#16A34A`
- Bearish: `#DC2626`
- Warning: `#D97706`

禁止：

- `dark` class。
- theme switcher。
- system theme detection。
- dark sidebar。
- dark header。
- dark cards。
- neon colors。
- large gradients。

---

## 5. 布局规则

Mobile：

- 单列布局。
- 固定 Bottom Navigation。
- Feed-first。
- Search 使用全屏体验。
- 不得出现横向滚动。

Desktop：

- Home 使用三栏布局。
- 左侧固定 Sidebar。
- 中间 Feed。
- 右侧 Market Panel。
- Admin 使用 dashboard/table 布局。

Mobile Bottom Navigation 只能包含：

- Home
- Search
- Watchlist
- Me

不得把 Narrative 加入 mobile bottom tab。

---

## 6. 组件规则

以下基础组件必须优先使用 shadcn/ui：

- Button
- Input
- Dialog
- Sheet
- Table
- Tabs
- Dropdown
- Select
- Tooltip
- Toast
- Badge
- Card

规则：

- Feed Card 圆角最大 8px。
- 避免 card 套 card。
- 避免大面积 hero section。
- 使用紧凑但可读的 spacing。
- 常见操作优先使用 icon。
- 文本不得溢出 button 或 card。
- 所有交互控件必须有 disabled/loading state。

---

## 7. 数据获取

服务端数据必须使用 TanStack Query：

- Feed list。
- Feed detail。
- AI Search history/result。
- Narratives。
- Watchlist。
- Admin tables。
- Settings。

Zustand 只能用于：

- 临时 UI state。
- sidebar state。
- command/search dialog open state。
- 提交前的本地 filter state。

禁止把 server cache 长期复制到 Zustand。

---

## 8. 页面状态

每个页面和异步区域必须实现：

- Loading。
- Empty。
- Error。
- Retry。

Admin table 必须实现：

- Loading rows。
- Empty table state。
- Error banner。
- Pagination。

---

## 9. 表单规则

表单必须：

- submit 前校验。
- 展示字段级错误。
- pending 时禁用 submit。
- 成功或失败后给出反馈。

Admin 破坏性操作必须二次确认。

---

## 10. API 类型

必须使用 `/packages/types` 中的类型。

禁止在 `apps/web` 或 `apps/admin` 中重复定义 DTO。

如果 API response shape 变化，必须先更新 `/packages/types`。

---

## 11. 可访问性

必须支持：

- 键盘可访问。
- 清晰 focus state。
- icon button 必须有 accessible label。
- 使用语义化 heading。
- Dialog focus management 使用 shadcn/ui。

---

## 12. 前端测试

每个版本必须为新增关键页面提供 smoke test。

至少覆盖：

- Home page。
- Feed Detail。
- AI Search。
- Watchlist。
- Admin Dashboard。
- Admin Feed。

