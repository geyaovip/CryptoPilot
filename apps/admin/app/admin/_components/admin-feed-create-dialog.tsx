"use client";

import { Button, Card } from "@cryptopilot/ui";
import { useState } from "react";

type AdminFeedCreateDialogProps = {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; content: string; source_url: string }) => Promise<boolean>;
};

export function AdminFeedCreateDialog({ open, pending, onClose, onCreate }: AdminFeedCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("https://example.com/manual-feed");

  if (!open) return null;

  const resetAndClose = () => {
    if (pending) return;
    setTitle("");
    setContent("");
    setSourceUrl("https://example.com/manual-feed");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6">
      <Card className="w-full max-w-2xl space-y-4 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">创建原始内容</h2>
            <p className="mt-1 text-sm text-slate-500">用于手动录入重要来源，提交后会进入原始内容列表并排队生成 AI 摘要。</p>
          </div>
          <button aria-label="关闭" className="rounded-full px-2 text-xl leading-none text-slate-400 hover:text-slate-700" disabled={pending} onClick={resetAndClose} type="button">
            ×
          </button>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const created = await onCreate({ title, content, source_url: sourceUrl });
            if (!created) return;
            setTitle("");
            setContent("");
            setSourceUrl("https://example.com/manual-feed");
            onClose();
          }}
        >
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setTitle(e.target.value)} placeholder="标题" value={title} />
          <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setContent(e.target.value)} placeholder="正文" rows={5} value={content} />
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" onChange={(e) => setSourceUrl(e.target.value)} placeholder="原文链接" value={sourceUrl} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button disabled={pending} onClick={resetAndClose} type="button">
              取消
            </Button>
            <Button className="bg-slate-950 text-white hover:bg-slate-800" disabled={pending || !title || !content || !sourceUrl} type="submit">
              创建
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
