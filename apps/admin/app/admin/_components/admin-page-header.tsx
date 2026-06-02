"use client";

import type { ReactNode } from "react";
import { Card } from "@cryptopilot/ui";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <Card className="border-slate-200 bg-white p-4">
      <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </Card>
  );
}
