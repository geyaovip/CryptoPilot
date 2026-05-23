import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
