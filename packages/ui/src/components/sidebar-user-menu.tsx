"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../lib/cn";

export type SidebarUserMenuItem = {
  label: string;
  href: string;
};

type SidebarUserMenuProps = {
  avatarText: string;
  name: string;
  subtitle?: string;
  menuLabel: string;
  items: SidebarUserMenuItem[];
  logoutLabel?: string;
  variant?: "default" | "perplexity";
  /** When set, primary button triggers this instead of opening the menu (e.g. go to login). */
  onPrimaryClick?: () => void;
  /** Called when user chooses logout; omit to hide the logout action. */
  onLogout?: () => void;
};

export function SidebarUserMenu({
  avatarText,
  name,
  subtitle,
  menuLabel,
  items,
  logoutLabel = "退出登录",
  variant = "default",
  onPrimaryClick,
  onLogout
}: SidebarUserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isPerplexity = variant === "perplexity";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
          isPerplexity
            ? "border-[#D9D5C9] bg-white hover:bg-[#FCFCF9]"
            : "border-slate-200 bg-white hover:bg-slate-50"
        )}
        onClick={() => {
          if (onPrimaryClick) {
            onPrimaryClick();
            return;
          }
          setOpen((value) => !value);
        }}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
            isPerplexity ? "bg-[#20808D]" : "bg-slate-900"
          )}
        >
          {avatarText}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-medium", isPerplexity ? "text-[#102A2C]" : "text-slate-950")}>
            {name}
          </span>
          {subtitle ? (
            <span className={cn("block truncate text-xs", isPerplexity ? "text-[#5F6868]" : "text-slate-500")} translate="no">
              {subtitle}
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          className={cn(
            "absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-full rounded-lg border p-2 shadow-lg",
            isPerplexity ? "border-[#D9D5C9] bg-white" : "border-slate-200 bg-white"
          )}
        >
          {items.map((item) => (
            <a
              key={item.href}
              role="menuitem"
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                isPerplexity ? "text-[#5F6868] hover:bg-[#F7F5EE] hover:text-[#102A2C]" : "text-slate-700 hover:bg-slate-50"
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {onLogout ? (
            <button
              role="menuitem"
              type="button"
              className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              {logoutLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
