"use client";

import type { IngestionLogSummary, SourceSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSourceLogs, retryAdminSource, updateAdminSource } from "../../lib/api";
import { AdminPageHeader } from "./admin-page-header";
import { AdminPagination } from "./admin-pagination";

type SourceListData = {
  items: SourceSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
};

export function AdminSourcesPanel({ data }: { data: SourceListData }) {
  const router = useRouter();
  const [platformFilter, setPlatformFilter] = useState("all");
  const platforms = Array.from(new Set(data.items.map((source) => source.platform))).sort(platformSort);
  const items =
    platformFilter === "all"
      ? data.items
      : data.items.filter((source) => source.platform === platformFilter);
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
      <AdminPageHeader
        title="数据源"
        description="支持启停、手动重试和查看最近 50 条采集日志；连续失败 5 次会自动标记为异常，避免异常源反复影响采集。"
      >
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </AdminPageHeader>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">平台分类</span>
          <button
            className={`rounded-full px-3 py-1.5 text-sm ${platformFilter === "all" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
            onClick={() => setPlatformFilter("all")}
            type="button"
          >
            全部 {data.items.length}
          </button>
          {platforms.map((platform) => (
            <button
              className={`rounded-full px-3 py-1.5 text-sm ${platformFilter === platform ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
              key={platform}
              onClick={() => setPlatformFilter(platform)}
              type="button"
            >
              {platformLabel(platform)} {data.items.filter((source) => source.platform === platform).length}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["名称", "平台", "语言", "类型", "状态", "失败次数", "错误信息", "最近成功", "最近错误", "间隔(秒)", "操作"].map((column) => (
                  <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((source) => (
                <tr className="border-b border-slate-100" key={source.id}>
                  <td className="px-4 py-3 text-slate-700">
                    <p className="font-medium text-slate-950">{source.name}</p>
                    {source.url ? (
                      <a className="mt-1 block max-w-[260px] truncate text-xs text-[#20808D] hover:underline" href={source.url} rel="noopener noreferrer" target="_blank">
                        {source.url}
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {platformLabel(source.platform)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{source.content_locale === "zh" ? "中文" : "英文"}</td>
                  <td className="px-4 py-3 text-slate-700">{source.type}</td>
                  <td className="px-4 py-3 text-slate-700">{source.status}</td>
                  <td className="px-4 py-3 text-slate-700">{source.consecutive_failures}</td>
                  <td className="max-w-[260px] px-4 py-3 text-slate-700">
                    <span className="line-clamp-2">{source.error_message ?? "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{source.last_success_at ? new Date(source.last_success_at).toLocaleString("zh-CN") : "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{source.last_error_at ? new Date(source.last_error_at).toLocaleString("zh-CN") : "-"}</td>
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
        </div>
      </Card>

      <AdminPagination
        basePath="/admin/sources"
        hasNext={data.has_next}
        hasPrev={data.has_prev}
        limit={data.limit}
        page={data.page}
        total={data.total}
        totalPages={data.total_pages}
      />

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

function platformSort(a: string, b: string) {
  const order = ["zh_media", "web3_media", "medium", "substack", "mirror", "paragraph", "project_blog", "governance_forum", "reddit", "manual", "other"];
  return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
}

function platformLabel(platform: string) {
  const map: Record<string, string> = {
    medium: "Medium",
    substack: "Substack",
    mirror: "Mirror",
    paragraph: "Paragraph",
    reddit: "Reddit",
    zh_media: "中文媒体",
    web3_media: "Web3 媒体",
    project_blog: "项目博客",
    governance_forum: "治理论坛",
    manual: "手动录入",
    other: "其他"
  };
  return map[platform] ?? platform;
}
