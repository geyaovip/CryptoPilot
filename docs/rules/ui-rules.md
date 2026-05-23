# CryptoPilot UI 规则

本文件定义 CryptoPilot 的界面视觉、布局密度、组件使用、响应式和交互状态规则。适用于 `apps/web`、`apps/admin` 和 `packages/ui`。

---

## 1. UI 目标

CryptoPilot UI 必须像一个浅色的 AI 金融情报工具，而不是营销网站、交易所、游戏产品或 crypto 赌博页面。

UI 必须优先保证：

- 信息扫描效率。
- 清晰层级。
- 高信息密度。
- 稳定布局。
- 低视觉噪音。
- 可长期使用的工作台体验。

---

## 2. 主题规则

MVP 只能使用浅色主题。

必须使用：

- 用户端页面主背景：`#FCFCF9`
- 用户端次级背景：`#F7F5EE`
- 用户端面板背景：`#FFFFFF`
- 用户端边框：`#D9D5C9`
- 用户端主文本：`#102A2C`
- 用户端次文本：`#5F6868`
- 用户端主强调色：`#20808D`
- 用户端强调 hover：`#186A73`
- 管理端可继续使用中性浅色工作台背景：`#FFFFFF`、`#FAFAFA`、`#F5F5F5`
- Bullish：`#16A34A`
- Bearish：`#DC2626`
- Warning：`#D97706`

禁止：

- Dark mode。
- 主题切换。
- 系统主题自动检测。
- 大面积深色背景。
- 深色 Sidebar。
- 深色 Header。
- 深色 Feed Card。
- 荧光绿色、荧光紫、霓虹渐变。
- 大面积渐变背景。

---

## 3. 视觉风格

必须使用：

- 用户端参考 Perplexity 风格：暖白页面、柔和米灰面板、墨色文字、青绿色强调色、大圆角搜索框。
- 克制的边框。
- 轻量阴影或无阴影。
- 紧凑 spacing。
- 明确的信息分组。
- 小面积状态色。
- 8px 以内圆角。

禁止：

- 大 Hero。
- 大 Banner。
- 大插画。
- 卡片套卡片。
- 过度装饰性背景。
- 玻璃拟态。
- 厚重阴影。
- 高饱和 crypto 风格。

---

## 4. Typography

必须使用：

- 字体：Inter。
- 中文回退：system sans-serif。
- 正文字号：14px 或 16px。
- 行高：1.5 - 1.6。
- 标题字重：600。
- 正文字重：400 或 500。

禁止：

- viewport width 驱动的字体缩放。
- 负 letter spacing。
- 在 card 内使用 hero 级大标题。
- 长文本无换行。

---

## 5. Layout

### Mobile

必须：

- 单列布局。
- Bottom Navigation 固定底部。
- Feed-first。
- Search 全屏。
- 内容左右 padding 16px。
- 不出现横向滚动。

Mobile Bottom Navigation 只能包含：

- Home
- Search
- Watchlist
- Me

禁止把 Narrative 加到底部导航。

### Desktop

Home 必须使用三栏布局：

- 左侧固定 Sidebar。
- 中间 Feed 主体。
- 右侧 Market Panel。

Admin 必须使用工作台布局：

- 左侧导航。
- 顶部页面标题。
- 主区域表格或配置面板。

禁止使用营销页式 split hero layout。

---

## 6. Feed UI

Feed Card 必须展示：

- title
- ai_summary
- source
- publish_time
- heat_score
- related_tokens
- narrative_tags
- sentiment

Feed Card 规则：

- 圆角最大 8px。
- 信息密度高但不拥挤。
- `ai_summary` 优先展示。
- Token 和 Narrative 使用 Badge。
- sentiment 只用小面积颜色提示。
- 原文链接必须明显但不抢主信息。

禁止：

- Feed Card 高度过大。
- 大图新闻卡。
- 大面积情绪色背景。
- 每条 Feed 使用复杂装饰。

---

## 7. Admin UI

Admin 必须优先使用：

- Table。
- Filter。
- Search。
- Tabs。
- Drawer 或 Dialog。
- Confirm Dialog。
- Toast。

Admin 列表页必须包含：

- 表格。
- 筛选。
- 搜索。
- 分页。
- Loading。
- Empty。
- Error。

Admin 写操作必须：

- 有明确按钮文案。
- destructive action 二次确认。
- 成功或失败反馈。

---

## 8. 组件规则

必须优先使用 shadcn/ui：

- Button
- Input
- Textarea
- Select
- Tabs
- Table
- Dialog
- Sheet
- Dropdown
- Tooltip
- Toast
- Badge
- Switch
- Checkbox

图标：

- 常见操作优先使用 lucide-react。
- icon button 必须有 tooltip 或 accessible label。

禁止：

- 手写重复基础组件。
- 每个页面各自定义按钮样式。
- 不同页面出现不同表格风格。

---

## 9. 状态规则

每个异步区域必须有：

- Loading。
- Empty。
- Error。
- Retry。

Loading：

- Feed 使用 skeleton。
- Table 使用 skeleton rows。
- Button 使用 pending state。

Empty：

- 必须说明当前没有什么。
- 必须提供下一步操作。

Error：

- 必须说明失败原因。
- 必须提供 Retry。

---

## 10. 响应式规则

断点：

- Mobile：`<768px`
- Tablet：`768px - 1280px`
- Desktop：`>1280px`

规则：

- Mobile 不显示三栏。
- Desktop 不使用 Bottom Navigation。
- Tablet 可使用双栏。
- 所有固定格式组件必须有稳定尺寸。

禁止：

- 文本溢出。
- 横向滚动。
- 组件因 hover 或 loading 改变布局尺寸。

---

## 11. 可访问性

必须：

- 所有按钮可键盘访问。
- 所有 icon button 有 accessible label。
- Focus state 清晰。
- Dialog 打开后 focus 在 Dialog 内。
- 表单错误能被用户明确看到。

---

## 12. UI 验收

每个版本完成前必须检查：

- 主要页面均为浅色主题。
- 不存在 `dark` class。
- 不存在 theme switcher。
- Mobile 无横向滚动。
- Admin 表格状态完整。
- Feed Card 信息层级清晰。
- Loading、Empty、Error、Retry 完整。

