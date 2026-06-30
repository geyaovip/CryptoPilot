import { AppShell, type NavGroup, type NavItem } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { requireAdminSession } from "../../lib/admin-session";
import { AdminUserMenu } from "./admin-user-menu";
import { CryptoPilotMark } from "./cryptopilot-mark";

const navGroups: NavGroup[] = [
  {
    label: "总览",
    items: [{ label: "仪表盘", href: "/admin/dashboard" }]
  },
  {
    label: "内容运营",
    items: [
      { label: "市场情报", href: "/admin/insights" },
      { label: "原始内容", href: "/admin/feed" },
      { label: "内容聚类", href: "/admin/feed-clusters" },
      { label: "叙事管理", href: "/admin/narratives" },
      { label: "Prompt 管理", href: "/admin/prompts" }
    ]
  },
  {
    label: "数据与用户",
    items: [
      { label: "数据源", href: "/admin/sources" },
      { label: "KOL 源", href: "/admin/kols" },
      { label: "资产管理", href: "/admin/tokens" },
      { label: "用户管理", href: "/admin/users" }
    ]
  },
  {
    label: "系统运营",
    items: [
      { label: "AI 监控", href: "/admin/ai-monitor" },
      { label: "Push 管理", href: "/admin/push" },
      { label: "日志中心", href: "/admin/logs" },
      { label: "系统设置", href: "/admin/config" }
    ]
  }
];

const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export async function AdminShell({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <AppShell
      className="bg-white"
      title="CryptoPilot 管理后台"
      brandMark={<CryptoPilotMark showText />}
      navGroups={navGroups}
      navItems={navItems}
      mobileNavMode="drawer"
      renderSidebarFooter={() => <AdminUserMenu />}
    >
      {children}
    </AppShell>
  );
}
