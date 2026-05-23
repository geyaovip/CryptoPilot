import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
