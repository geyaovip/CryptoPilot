"use client";

import { Card } from "@cryptopilot/ui";
import { AdminPageHeader } from "./admin-page-header";
import { AdminNarrativeActions } from "./admin-narrative-actions";

type Item = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  heat_score: number;
  weight: number;
  ai_summary: string | null;
};

export function AdminNarrativesPanel({ items }: { items: Item[] }) {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="叙事管理" description="维护内容归属的叙事主题、热度权重和前台展示状态。" />
      <AdminNarrativeActions items={items} />
      <div className="grid gap-3">
        {items.map((item) => (
          <Card className="p-4" key={item.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-950">{item.name}</p>
                <p className="text-sm text-slate-500">{item.slug}</p>
                {item.ai_summary ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.ai_summary}</p>
                ) : null}
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>热度 {item.heat_score}</p>
                <p>权重 {item.weight}</p>
                <p>{item.is_active ? "展示中" : "已隐藏"}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
