import { AppShell, type NavItem } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { requireAdminSession } from "../../lib/admin-session";
import { AdminUserMenu } from "./admin-user-menu";
import { CryptoPilotMark } from "./cryptopilot-mark";

const navItems: NavItem[] = [
  { label: "仪表盘", href: "/admin/dashboard" },
  { label: "Feed 管理", href: "/admin/feed" },
  { label: "Feed 簇", href: "/admin/feed-clusters" },
  { label: "Prompt 管理", href: "/admin/prompts" },
  { label: "AI 监控", href: "/admin/ai-monitor" },
  { label: "叙事管理", href: "/admin/narratives" },
  { label: "资产管理", href: "/admin/tokens" },
  { label: "KOL 源", href: "/admin/kols" },
  { label: "数据源", href: "/admin/sources" },
  { label: "用户管理", href: "/admin/users" },
  { label: "日志中心", href: "/admin/logs" },
  { label: "系统设置", href: "/admin/config" }
];

export async function AdminShell({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <AppShell
      className="bg-white"
      title="CryptoPilot 管理后台"
      brandMark={<CryptoPilotMark showText />}
      navItems={navItems}
      mobileNavMode="drawer"
      renderSidebarFooter={() => <AdminUserMenu />}
    >
      {children}
    </AppShell>
  );
}
