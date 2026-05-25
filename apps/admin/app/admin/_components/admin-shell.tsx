import { AppShell, type NavItem } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { AdminUserMenu } from "./admin-user-menu";

const navItems: NavItem[] = [
  { label: "仪表盘", href: "/admin/dashboard" },
  { label: "Feed 管理", href: "/admin/feed" },
  { label: "Feed 簇", href: "/admin/feed-clusters" },
  { label: "Prompt 管理", href: "/admin/prompts" },
  { label: "AI Monitor", href: "/admin/ai-monitor" },
  { label: "Narrative", href: "/admin/narratives" },
  { label: "Token", href: "/admin/tokens" },
  { label: "KOL", href: "/admin/kols" },
  { label: "数据源", href: "/admin/sources" },
  { label: "用户管理", href: "/admin/users" },
  { label: "日志中心", href: "/admin/logs" },
  { label: "系统设置", href: "/admin/config" }
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      className="bg-white"
      title="CryptoPilot 管理后台"
      navItems={navItems}
      renderSidebarFooter={() => <AdminUserMenu />}
    >
      {children}
    </AppShell>
  );
}
