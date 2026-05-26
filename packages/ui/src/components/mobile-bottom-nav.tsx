"use client";

import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import type { NavItem } from "./app-shell";

type MobileBottomNavProps = {
  navItems: NavItem[];
  variant?: "default" | "perplexity";
};

export function MobileBottomNav({ navItems, variant = "default" }: MobileBottomNavProps) {
  const [currentPath, setCurrentPath] = useState("");
  const isPerplexity = variant === "perplexity";

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 grid grid-cols-4 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden",
        isPerplexity
          ? "border-[#D9D5C9] bg-[#FCFCF9]/95 shadow-[0_-10px_30px_rgba(16,42,44,0.07)] backdrop-blur"
          : "border-slate-200 bg-white"
      )}
    >
      {navItems.slice(0, 4).map((item) => (
        <MobileNavLink currentPath={currentPath} isPerplexity={isPerplexity} item={item} key={item.href} />
      ))}
    </nav>
  );
}

function MobileNavLink({ currentPath, isPerplexity, item }: { currentPath: string; isPerplexity: boolean; item: NavItem }) {
  const isActive = currentPath === item.href || (item.href !== "/home" && currentPath.startsWith(`${item.href}/`));

  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-center text-[11px] font-medium transition",
        isPerplexity
          ? isActive
            ? "bg-[#E7F3F1] text-[#102A2C] shadow-[inset_0_0_0_1px_rgba(32,128,141,0.16)]"
            : "text-[#5F6868] hover:bg-[#F7F5EE] hover:text-[#102A2C]"
          : isActive
            ? "bg-slate-100 text-slate-950"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      )}
      href={item.href}
    >
      {isActive ? (
        <span
          aria-hidden
          className={cn("absolute top-1 h-1 w-1 rounded-full", isPerplexity ? "bg-[#20808D]" : "bg-slate-900")}
        />
      ) : null}
      {item.icon ? (
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition",
            isPerplexity ? (isActive ? "text-[#186A73]" : "text-[#20808D]") : isActive ? "text-slate-950" : "text-slate-700"
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span>{item.label}</span>
    </a>
  );
}
