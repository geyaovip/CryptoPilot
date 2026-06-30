import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileDrawerNav } from "./mobile-drawer-nav";

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  activeIcon?: ReactNode;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

type AppShellProps = {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  brandMark?: ReactNode;
  className?: string;
  navGroups?: NavGroup[];
  /** 工厂函数：桌面与移动端各渲染一份，避免同一 React 节点被挂载两次。 */
  renderSidebarFooter?: () => ReactNode;
  variant?: "default" | "perplexity";
  mobileNavMode?: "bottom" | "drawer" | "none";
};

export function AppShell({
  title,
  navItems,
  children,
  brandMark,
  className,
  navGroups,
  renderSidebarFooter,
  variant = "default",
  mobileNavMode = "bottom"
}: AppShellProps) {
  const isPerplexity = variant === "perplexity";
  const mobileDrawerFooter = mobileNavMode === "drawer" ? renderSidebarFooter?.() : null;
  const groupedNav = navGroups ?? [{ label: "", items: navItems }];

  return (
    <div className={cn("min-h-screen", isPerplexity ? "bg-[#FCFCF9] text-[#102A2C]" : "bg-white text-slate-950")}>
      {mobileNavMode === "drawer" ? (
        <MobileDrawerNav footer={mobileDrawerFooter} navGroups={groupedNav} navItems={navItems} title={title} variant={variant} />
      ) : null}
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside
          className={cn(
            "hidden w-56 shrink-0 flex-col border-r p-4 md:sticky md:top-0 md:flex md:h-screen",
            isPerplexity ? "border-[#D9D5C9] bg-[#F7F5EE]" : "border-slate-200 bg-slate-50"
          )}
        >
          {brandMark ?? (
            <p className={cn("shrink-0 text-sm font-semibold", isPerplexity ? "text-[#102A2C]" : "text-slate-950")}>{title}</p>
          )}
          <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {groupedNav.map((group) => (
              <div className="space-y-1 pb-3 last:pb-0" key={group.label || "default"}>
                {group.label ? (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.label}</p>
                ) : null}
                {group.items.map((item) => (
                  <a
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition",
                      isPerplexity
                        ? "text-[#5F6868] hover:bg-white hover:text-[#102A2C]"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
          {renderSidebarFooter ? (
            <div className="mt-auto hidden shrink-0 pt-4 md:block">{renderSidebarFooter()}</div>
          ) : null}
        </aside>
        <main className={cn("flex-1 p-4 md:p-6", mobileNavMode === "bottom" ? "pb-24" : "pb-6", className)}>{children}</main>
      </div>
      {mobileNavMode === "bottom" ? <MobileBottomNav navItems={navItems} variant={variant} /> : null}
    </div>
  );
}
