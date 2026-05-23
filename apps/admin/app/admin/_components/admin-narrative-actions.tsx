"use client";

import { useState } from "react";
import { Button, Card } from "@cryptopilot/ui";
import {
  createAdminNarrative,
  mergeAdminNarratives,
  regenerateAdminNarrativeAi,
  updateAdminNarrative
} from "../../lib/api";

type NarrativeRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  ai_summary?: string | null;
  weight?: number;
};

export function AdminNarrativeActions({ items }: { items: NarrativeRow[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState(items[0]?.id ?? "");
  const [aiSummary, setAiSummary] = useState(items[0]?.ai_summary ?? "");
  const [weight, setWeight] = useState(String(items[0]?.weight ?? 50));
  const [mergeSourceId, setMergeSourceId] = useState(items[0]?.id ?? "");
  const [mergeTargetId, setMergeTargetId] = useState(items[1]?.id ?? "");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage("操作成功，请刷新页面查看最新数据。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3 p-4">
        <h2 className="font-medium text-slate-950">新建 Narrative</h2>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => setName(e.target.value)}
          placeholder="名称"
          value={name}
        />
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug（小写-连字符）"
          value={slug}
        />
        <Button
          disabled={busy || !name || !slug}
          onClick={() =>
            run(async () => {
              await createAdminNarrative({ name, slug, is_active: true });
              setName("");
              setSlug("");
            })
          }
          type="button"
        >
          创建
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="font-medium text-slate-950">编辑 / 隐藏 / 重生 AI</h2>
        <select
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => {
            const next = items.find((item) => item.id === e.target.value);
            setEditId(e.target.value);
            setAiSummary(next?.ai_summary ?? "");
            setWeight(String(next?.weight ?? 50));
          }}
          value={editId}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <textarea
          className="min-h-24 w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => setAiSummary(e.target.value)}
          placeholder="AI 摘要（可手工编辑）"
          value={aiSummary}
        />
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          onChange={(e) => setWeight(e.target.value)}
          placeholder="权重 0-100"
          type="number"
          value={weight}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={busy || !editId}
            onClick={() =>
              run(() =>
                updateAdminNarrative(editId, {
                  ai_summary: aiSummary,
                  weight: Number(weight)
                })
              )
            }
            type="button"
          >
            保存摘要与权重
          </Button>
          <Button disabled={busy || !editId} onClick={() => run(() => updateAdminNarrative(editId, { is_active: false }))} type="button">
            隐藏
          </Button>
          <Button disabled={busy || !editId} onClick={() => run(() => regenerateAdminNarrativeAi(editId))} type="button">
            重生 AI 摘要
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 p-4 lg:col-span-2">
        <h2 className="font-medium text-slate-950">合并 Narrative</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="rounded border px-3 py-2 text-sm"
            onChange={(e) => setMergeSourceId(e.target.value)}
            value={mergeSourceId}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                源：{item.name}
              </option>
            ))}
          </select>
          <select
            className="rounded border px-3 py-2 text-sm"
            onChange={(e) => setMergeTargetId(e.target.value)}
            value={mergeTargetId}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                目标：{item.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={busy || !mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
          onClick={() => run(() => mergeAdminNarratives(mergeSourceId, mergeTargetId))}
          type="button"
        >
          合并到目标
        </Button>
      </Card>

      {message ? <p className="text-sm text-slate-600 lg:col-span-2">{message}</p> : null}
    </div>
  );
}
