"use client";

import { useState } from "react";
import { Button, Card } from "@cryptopilot/ui";
import { createAdminKol, updateAdminKol } from "../../lib/api";

type KolRow = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  profile_url: string | null;
  influence_score: number;
  is_active: boolean;
};

export function AdminKolActions({ items }: { items: KolRow[] }) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [influenceScore, setInfluenceScore] = useState("50");
  const [editId, setEditId] = useState(items[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = items.find((item) => item.id === editId);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage("操作成功，请刷新页面。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3 p-4">
        <h2 className="font-medium text-slate-950">新建 KOL</h2>
        <input className="w-full rounded border px-3 py-2 text-sm" onChange={(e) => setName(e.target.value)} placeholder="名称" value={name} />
        <input className="w-full rounded border px-3 py-2 text-sm" onChange={(e) => setHandle(e.target.value)} placeholder="handle" value={handle} />
        <Button
          disabled={busy || !name || !handle}
          onClick={() => run(() => createAdminKol({ name, handle, platform: "twitter", is_active: true }))}
          type="button"
        >
          创建
        </Button>
      </Card>
      <Card className="space-y-3 p-4">
        <h2 className="font-medium text-slate-950">运营调整</h2>
        <select className="w-full rounded border px-3 py-2 text-sm" onChange={(e) => setEditId(e.target.value)} value={editId}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} @{item.handle}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          max={100}
          min={0}
          onChange={(event) => setInfluenceScore(event.target.value)}
          placeholder="影响力 0-100"
          type="number"
          value={influenceScore}
        />
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || !editId} onClick={() => run(() => updateAdminKol(editId, { is_active: !selected?.is_active }))} type="button">
            {selected?.is_active ? "停用" : "启用"}
          </Button>
          <Button
            disabled={busy || !editId}
            onClick={() => run(() => updateAdminKol(editId, { influence_score: Number(influenceScore) }))}
            type="button"
          >
            更新影响力
          </Button>
        </div>
      </Card>
      {message ? <p className="text-sm text-slate-600 lg:col-span-2">{message}</p> : null}
    </div>
  );
}
