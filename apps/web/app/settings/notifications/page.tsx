import { Card } from "@cryptopilot/ui";
import { WebShell } from "../../_components/web-shell";

export default function NotificationSettingsPage() {
  return (
    <WebShell>
      <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <h1 className="text-xl font-semibold text-[#102A2C]">通知设置</h1>
        <p className="mt-2 text-sm leading-6 text-[#5F6868]">
          通知中心正在逐步开放。当前你可以先在关注列表管理关注对象，后续将支持重要叙事与资产变化提醒。
        </p>
        <a className="mt-4 inline-block text-sm font-medium text-[#20808D]" href="/watchlist">
          前往关注列表
        </a>
      </Card>
    </WebShell>
  );
}
