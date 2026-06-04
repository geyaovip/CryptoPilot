"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useState } from "react";
import { patchAdminConfig } from "../../lib/api";
import { AdminPageHeader } from "../_components/admin-page-header";

export function ConfigPanel({
  items,
  loadError
}: {
  items: Array<{ key: string; value: unknown }>;
  loadError: string | null;
}) {
  const [configItems, setConfigItems] = useState(items);
  const [error, setError] = useState<string | null>(loadError);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string, raw: string) {
    setSaving(key);
    setError(null);
    try {
      let value: unknown = raw;
      if (key === "feature_flags") {
        value = JSON.parse(raw) as unknown;
      } else if (key === "llm_provider") {
        value = raw.trim();
      } else {
        value = Number(raw);
      }
      const data = await patchAdminConfig(key, value);
      setConfigItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="系统设置" description="修改会写入审计日志并即时生效（API 内存缓存）。" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {configItems.map((item) => (
        <Card className="p-4" key={item.key}>
          <label className="text-sm font-medium text-slate-700">{item.key}</label>
          <textarea
            className="mt-2 min-h-[72px] w-full rounded-xl border border-slate-200 p-3 font-mono text-xs"
            defaultValue={
              typeof item.value === "object" ? JSON.stringify(item.value, null, 2) : String(item.value)
            }
            id={`cfg-${item.key}`}
          />
          <Button
            className="mt-3"
            disabled={saving === item.key}
            onClick={() => {
              const el = document.getElementById(`cfg-${item.key}`) as HTMLTextAreaElement | null;
              if (el) void save(item.key, el.value);
            }}
          >
            {saving === item.key ? "保存中…" : "保存"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
