"use client";

import { Card } from "@cryptopilot/ui";
import { useEffect, useState } from "react";
import { getAdminLogs, type AdminLogItem } from "../../lib/api";

const types = ["", "api", "ingestion", "llm", "push", "audit"] as const;

export function LogsPanel() {
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState<AdminLogItem[]>([]);
  const [selected, setSelected] = useState<AdminLogItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void getAdminLogs({
      type: type || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      limit: 50
    })
      .then((data) => setItems(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [type, from, to]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <label className="text-sm text-slate-600">
          类型
          <select
            className="ml-2 rounded-lg border border-slate-200 px-2 py-1"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {types.map((value) => (
              <option key={value || "all"} value={value}>
                {value || "全部"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          起始
          <input
            className="ml-2 rounded-lg border border-slate-200 px-2 py-1"
            type="datetime-local"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="text-sm text-slate-600">
          结束
          <input
            className="ml-2 rounded-lg border border-slate-200 px-2 py-1"
            type="datetime-local"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </Card>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">消息</th>
              <th className="px-4 py-3">时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={4}>
                  加载中…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={4}>
                  暂无日志
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => setSelected(item)}
                >
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.message}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      {selected ? (
        <Card className="p-4">
          <h2 className="font-semibold text-slate-950">详情</h2>
          <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
