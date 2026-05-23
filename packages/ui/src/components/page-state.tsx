import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";

type PageStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children
}: PageStateProps) {
  return (
    <Card className="flex min-h-40 flex-col items-start justify-center gap-3 bg-slate-50">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </Card>
  );
}

export function LoadingState({ title = "加载中" }: { title?: string }) {
  return (
    <Card className="space-y-3 bg-slate-50" aria-label={title}>
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
    </Card>
  );
}

export function ErrorState({ title, description, actionLabel, onAction }: PageStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <h2 className="text-base font-semibold text-red-950">{title}</h2>
      <p className="mt-1 text-sm text-red-700">{description}</p>
      {actionLabel ? (
        <Button className="mt-3 border-red-200" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
