import { WebShell } from "../../_components/web-shell";
import { getNotificationSettings } from "../../lib/api";
import { noIndexMetadata } from "../../lib/seo";
import { NotificationsPanel } from "./notifications-panel";

export const metadata = noIndexMetadata;

export default async function NotificationSettingsPage() {
  const settings = await getNotificationSettings();
  return (
    <WebShell>
      <NotificationsPanel initialSettings={settings} />
    </WebShell>
  );
}
