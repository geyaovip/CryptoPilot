"use client";

import type { IngestionLogSummary, SourceSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSourceLogs, retryAdminSource, updateAdminSource } from "../../lib/api";

export function AdminSourcesPanel({ items }: { items: SourceSummary[] }) {
  const router = useRouter();
  const [logs, setLogs] = useState<IngestionLogSummary[]>([]);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setPending(true);
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setPending(false);
    }
  };

  const loadLogs = async (sourceId: string, sourceName: string) => {
    setPending(true);
    setMessage("");
    try {
      const data = await getSourceLogs(sourceId);
      setLogs(data.items);
      setActiveSource(sourceName);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "日志加载失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-950">数据源</h1>
        <p className="mt-1 text-sm text-slate-500">支持启停、手动重试和查看最近 50 条采集日志。</p>
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["名称", "语言", "类型", "状态", "最近成功", "最近错误", "间隔(秒)", "操作"].map((column) => (
                <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((source) => (
              <tr className="border-b border-slate-100" key={source.id}>
                <td className="px-4 py-3 text-slate-700">{source.name}</td>
                <td className="px-4 py-3 text-slate-700">
                  {source.content_locale === "zh" ? "中文" : "英文"}
                </td>
                <td className="px-4 py-3 text-slate-700">{source.type}</td>
                <td className="px-4 py-3 text-slate-700">{source.status}</td>
                <td className="px-4 py-3 text-slate-700">
                  {source.last_success_at ? new Date(source.last_success_at).toLocaleString("zh-CN") : "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {source.last_error_at ? new Date(source.last_error_at).toLocaleString("zh-CN") : "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">{source.fetch_interval_seconds}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="text-[#20808D]"
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => updateAdminSource(source.id, source.status === "active" ? "paused" : "active"),
                          "数据源状态已更新"
                        )
                      }
                      type="button"
                    >
                      {source.status === "active" ? "暂停" : "启用"}
                    </button>
                    <button className="text-slate-700" disabled={pending} onClick={() => run(() => retryAdminSource(source.id), "已触发手动重试")} type="button">
                      重试
                    </button>
                    <button className="text-slate-700" disabled={pending} onClick={() => loadLogs(source.id, source.name)} type="button">
                      日志
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {activeSource ? (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-950">{activeSource} · 最近采集日志</h2>
            <Button onClick={() => setActiveSource(null)} type="button">
              关闭
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" key={log.id}>
                  <p>
                    {log.status} · 发现 {log.items_found} · 新增 {log.items_created}
                  </p>
                  <p className="text-slate-500">
                    {new Date(log.started_at).toLocaleString("zh-CN")}
                    {log.error_message ? ` · ${log.error_message}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">暂无采集日志。</p>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
