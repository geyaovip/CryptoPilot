import { AppShell, type NavItem } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { WebUserMenu } from "./web-user-menu";

export const webNavItems: NavItem[] = [
  { label: "首页", href: "/home" },
  { label: "搜索", href: "/search" },
  { label: "关注", href: "/watchlist" },
  { label: "我的", href: "/me" }
];

export function WebShell({ children }: { children: ReactNode }) {
  return (
    <AppShell title="CryptoPilot" navItems={webNavItems} variant="perplexity" renderSidebarFooter={() => <WebUserMenu />}>
      {children}
    </AppShell>
  );
}
