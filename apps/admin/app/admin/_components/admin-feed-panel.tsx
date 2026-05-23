"use client";

import type { FeedItemSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminFeedFilters } from "../../lib/api";
import {
  createAdminFeed,
  deleteAdminFeed,
  hideAdminFeed,
  pinAdminFeed,
  updateAdminFeed
} from "../../lib/api";

type AdminFeedPanelProps = {
  items: FeedItemSummary[];
  sources: Array<{ id: string; name: string }>;
  filters: AdminFeedFilters;
};

export function AdminFeedPanel({ items, sources, filters }: AdminFeedPanelProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createUrl, setCreateUrl] = useState("https://example.com/manual-feed");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const refresh = () => router.refresh();

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setPending(true);
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setPending(false);
    }
  };

  const startEdit = (item: FeedItemSummary) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditSummary(item.ai_summary);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-950">Feed 管理</h1>
        <p className="mt-1 text-sm text-slate-500">支持筛选、编辑、置顶、隐藏、删除和手动创建。</p>
        {message ? <p className="mt-2 text-sm text-[#20808D]">{message}</p> : null}
      </Card>

      <Card className="p-4">
        <form
          className="grid gap-3 md:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const query = new URLSearchParams();
            ["status", "source_id", "type", "published_from", "published_to"].forEach((key) => {
              const value = String(form.get(key) ?? "");
              if (value) query.set(key, value);
            });
            router.push(`/admin/feed?${query.toString()}`);
          }}
        >
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={filters.status ?? ""} name="status">
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="hidden">已隐藏</option>
            <option value="deleted">已删除</option>
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={filters.source_id ?? ""} name="source_id">
            <option value="">全部来源</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={filters.type ?? ""} name="type">
            <option value="">全部类型</option>
            <option value="news">news</option>
            <option value="breaking">breaking</option>
            <option value="narrative">narrative</option>
            <option value="narrative_shift">narrative_shift</option>
            <option value="sentiment_spike">sentiment_spike</option>
            <option value="market_rotation">market_rotation</option>
            <option value="kol_signal">kol_signal</option>
          </select>
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={filters.published_from ?? ""} name="published_from" type="date" />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue={filters.published_to ?? ""} name="published_to" type="date" />
          <Button className="md:col-span-5" disabled={pending} type="submit">
            应用筛选
          </Button>
        </form>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-slate-950">手动创建 Feed</h2>
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setCreateTitle(e.target.value)} placeholder="标题" value={createTitle} />
        <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setCreateContent(e.target.value)} placeholder="正文" rows={3} value={createContent} />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setCreateUrl(e.target.value)} placeholder="原文链接" value={createUrl} />
        <Button
          disabled={pending || !createTitle || !createContent}
          onClick={() => run(() => createAdminFeed({ title: createTitle, content: createContent, source_url: createUrl }), "Feed 已创建")}
          type="button"
        >
          创建 Feed
        </Button>
      </Card>

      {editingId ? (
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-semibold text-slate-950">编辑 Feed</h2>
          <p className="text-xs text-slate-500">
            用户首页列表主文案为 <strong>AI 摘要（ai_summary）</strong>；标题仅用于详情溯源与 SEO，不在列表主标题展示。
          </p>
          <label className="block text-xs font-medium text-slate-600">原文标题（详情 / SEO）</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} />
          <label className="block text-xs font-medium text-slate-600">AI 摘要（首页列表展示）</label>
          <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setEditSummary(e.target.value)} rows={3} value={editSummary} />
          <div className="flex gap-2">
            <Button disabled={pending} onClick={() => run(() => updateAdminFeed(editingId, { title: editTitle, ai_summary: editSummary }), "Feed 已更新")} type="button">
              保存
            </Button>
            <Button disabled={pending} onClick={() => setEditingId(null)} type="button">
              取消
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["标题", "类型", "来源", "热度", "状态", "置顶", "发布时间", "操作"].map((column) => (
                <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-slate-100 align-top" key={item.id}>
                <td className="max-w-xs px-4 py-3 text-slate-700">{item.title}</td>
                <td className="px-4 py-3 text-slate-700">{item.type}</td>
                <td className="px-4 py-3 text-slate-700">{item.source_name}</td>
                <td className="px-4 py-3 text-slate-700">{item.heat_score}</td>
                <td className="px-4 py-3 text-slate-700">{item.status}</td>
                <td className="px-4 py-3 text-slate-700">{item.is_pinned ? "是" : "否"}</td>
                <td className="px-4 py-3 text-slate-700">{new Date(item.publish_time).toLocaleString("zh-CN")}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="text-[#20808D]" disabled={pending} onClick={() => startEdit(item)} type="button">
                      编辑
                    </button>
                    <button className="text-slate-700" disabled={pending} onClick={() => run(() => pinAdminFeed(item.id), "置顶状态已更新")} type="button">
                      置顶
                    </button>
                    <button className="text-slate-700" disabled={pending} onClick={() => run(() => hideAdminFeed(item.id), "隐藏状态已更新")} type="button">
                      隐藏
                    </button>
                    <button className="text-red-600" disabled={pending} onClick={() => run(() => deleteAdminFeed(item.id), "Feed 已删除")} type="button">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
