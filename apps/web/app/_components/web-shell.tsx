import { AppShell, type NavItem } from "@cryptopilot/ui";
import type { ReactNode } from "react";
import { WebUserMenu } from "./web-user-menu";

const navIconClass = "h-[18px] w-[18px] stroke-[1.9]";

export const webNavItems: NavItem[] = [
  {
    label: "首页",
    href: "/home",
    icon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <path d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.25v-6h-4.5v6H5.5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    activeIcon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <path d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.25v-6h-4.5v6H5.5a1 1 0 0 1-1-1v-9.5Z" fill="currentColor" />
      </svg>
    )
  },
  {
    label: "搜索",
    href: "/search",
    icon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <path d="m20 20-4.6-4.6" stroke="currentColor" strokeLinecap="round" />
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" />
      </svg>
    ),
    activeIcon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" opacity="0.18" />
        <path d="m20 20-4.6-4.6" stroke="currentColor" strokeLinecap="round" />
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" />
      </svg>
    )
  },
  {
    label: "关注",
    href: "/watchlist",
    icon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V21l-6-3.6L6 21V5.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    activeIcon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V21l-6-3.6L6 21V5.5Z" fill="currentColor" />
      </svg>
    )
  },
  {
    label: "我的",
    href: "/me",
    icon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.75" stroke="currentColor" />
        <path d="M5 20c1.2-3.1 3.6-4.75 7-4.75S17.8 16.9 19 20" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
    activeIcon: (
      <svg className={navIconClass} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.75" fill="currentColor" />
        <path d="M5 20c1.2-3.1 3.6-4.75 7-4.75S17.8 16.9 19 20" stroke="currentColor" strokeLinecap="round" />
      </svg>
    )
  }
];

export function WebShell({ children }: { children: ReactNode }) {
  return (
    <AppShell title="CryptoPilot" navItems={webNavItems} variant="perplexity" renderSidebarFooter={() => <WebUserMenu />}>
      {children}
    </AppShell>
  );
}
