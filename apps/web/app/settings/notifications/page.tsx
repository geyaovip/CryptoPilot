import { Card } from "@cryptopilot/ui";
import { WebShell } from "../../_components/web-shell";

export default function NotificationSettingsPage() {
  return (
    <WebShell>
      <Card className="max-w-xl border-[#D9D5C9] bg-white/95 p-6 shadow-[0_18px_60px_rgba(16,42,44,0.06)]">
        <h1 className="text-xl font-semibold text-[#102A2C]">通知设置</h1>
        <p className="mt-2 text-sm leading-6 text-[#5F6868]">Telegram 推送与通知偏好将在 V0.5 接入，当前为占位页。</p>
      </Card>
    </WebShell>
  );
}
