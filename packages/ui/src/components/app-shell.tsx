import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

type AppShellProps = {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  className?: string;
  /** 工厂函数：桌面与移动端各渲染一份，避免同一 React 节点被挂载两次。 */
  renderSidebarFooter?: () => ReactNode;
  variant?: "default" | "perplexity";
};

export function AppShell({ title, navItems, children, className, renderSidebarFooter, variant = "default" }: AppShellProps) {
  const isPerplexity = variant === "perplexity";

  return (
    <div className={cn("min-h-screen", isPerplexity ? "bg-[#FCFCF9] text-[#102A2C]" : "bg-white text-slate-950")}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside
          className={cn(
            "hidden w-56 shrink-0 flex-col border-r p-4 md:sticky md:top-0 md:flex md:h-screen",
            isPerplexity ? "border-[#D9D5C9] bg-[#F7F5EE]" : "border-slate-200 bg-slate-50"
          )}
        >
          <p className={cn("shrink-0 text-sm font-semibold", isPerplexity ? "text-[#102A2C]" : "text-slate-950")}>{title}</p>
          <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
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
          </nav>
          {renderSidebarFooter ? (
            <div className="mt-auto hidden shrink-0 pt-4 md:block">{renderSidebarFooter()}</div>
          ) : null}
        </aside>
        <main className={cn("flex-1 p-4 pb-24 md:p-6", className)}>{children}</main>
      </div>
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 grid grid-cols-4 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden",
          isPerplexity
            ? "border-[#D9D5C9] bg-[#FCFCF9]/95 shadow-[0_-10px_30px_rgba(16,42,44,0.07)] backdrop-blur"
            : "border-slate-200 bg-white"
        )}
      >
        {navItems.slice(0, 4).map((item) => (
          <a
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-center text-[11px] font-medium transition",
              isPerplexity
                ? "text-[#5F6868] hover:bg-[#F7F5EE] hover:text-[#102A2C]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            )}
            href={item.href}
            key={item.href}
          >
            {item.icon ? (
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  isPerplexity ? "text-[#20808D]" : "text-slate-700"
                )}
              >
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
