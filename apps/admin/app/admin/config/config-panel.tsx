"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useEffect, useState } from "react";
import { getAdminConfig, patchAdminConfig } from "../../lib/api";

export function ConfigPanel() {
  const [items, setItems] = useState<{ key: string; value: unknown }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    void getAdminConfig()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"));
  }, []);

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
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-950">系统设置</h1>
        <p className="mt-1 text-sm text-slate-500">修改会写入 audit_logs 并即时生效（API 内存缓存）。</p>
      </Card>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {items.map((item) => (
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
