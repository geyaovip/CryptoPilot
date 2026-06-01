import { WebShell } from "../../_components/web-shell";
import { noIndexMetadata } from "../../lib/seo";
import { NotificationsPanel } from "./notifications-panel";

export const metadata = noIndexMetadata;

const defaultSettings = {
  telegram_bound: false,
  telegram_bound_at: null,
  telegram_push_enabled: true,
  daily_digest_enabled: true,
  market_alert_enabled: true,
  watchlist_alert_enabled: true,
  timezone: "Asia/Shanghai"
};

export default function NotificationSettingsPage() {
  return (
    <WebShell>
      <NotificationsPanel initialSettings={defaultSettings} />
    </WebShell>
  );
}
