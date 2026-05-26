"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { NavItem } from "./app-shell";

type MobileDrawerNavProps = {
  navItems: NavItem[];
  title: string;
  footer?: ReactNode;
  variant?: "default" | "perplexity";
};

export function MobileDrawerNav({ navItems, title, footer, variant = "default" }: MobileDrawerNavProps) {
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const isPerplexity = variant === "perplexity";

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 md:hidden",
          isPerplexity ? "border-[#D9D5C9] bg-[#FCFCF9]/95 backdrop-blur" : "border-slate-200 bg-white/95 backdrop-blur"
        )}
      >
        <button
          aria-expanded={open}
          aria-label="打开导航菜单"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          onClick={() => setOpen(true)}
          type="button"
        >
          菜单
        </button>
        <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
        <span className="h-9 w-14" aria-hidden />
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="关闭导航菜单" className="absolute inset-0 bg-slate-950/30" onClick={() => setOpen(false)} type="button" />
          <aside className="absolute inset-y-0 left-0 flex w-[84vw] max-w-80 flex-col border-r border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-xs text-slate-500">运营后台导航</p>
              </div>
              <button className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50" onClick={() => setOpen(false)} type="button">
                关闭
              </button>
            </div>
            <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(`${item.href}/`));
                return (
                  <a
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm transition",
                      active ? "bg-[#E8F4F6] font-medium text-[#186A73]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            {footer ? (
              <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
                <p className="mb-2 text-xs font-medium text-slate-500">当前账号</p>
                {footer}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}
