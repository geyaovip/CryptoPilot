"use client";

import type { MvpPromptKey, PromptSummary } from "@cryptopilot/types";
import { Button, Card } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { activatePrompt, archivePrompt, createPrompt, testPrompt, updatePrompt } from "../../lib/api";

const promptKeys: MvpPromptKey[] = [
  "feed_summary_prompt",
  "narrative_summary_prompt",
  "sentiment_prompt",
  "ai_search_prompt",
  "push_prompt",
  "insight_synthesis_prompt"
];

type AdminPromptsPanelProps = {
  items: PromptSummary[];
};

export function AdminPromptsPanel({ items }: AdminPromptsPanelProps) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<MvpPromptKey>("feed_summary_prompt");
  const [draftContent, setDraftContent] = useState("");
  const [message, setMessage] = useState("");

  const versions = useMemo(
    () => items.filter((item) => item.prompt_key === selectedKey).sort((a, b) => b.version - a.version),
    [items, selectedKey]
  );
  const active = versions.find((item) => item.status === "active");
  const latestDraft = versions.find((item) => item.status === "draft");

  const refresh = () => router.refresh();

  const run = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      setMessage(success);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h1 className="text-lg font-semibold text-slate-900">Prompt 管理</h1>
        <p className="mt-1 text-sm text-slate-600">同一 prompt_key 仅允许一个 active 版本。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {promptKeys.map((key) => (
            <button
              className={`rounded-full px-3 py-1 text-xs ${selectedKey === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              key={key}
              onClick={() => setSelectedKey(key)}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-slate-600">当前 Active：v{active?.version ?? "-"}</p>
        <textarea
          className="mt-3 min-h-40 w-full rounded-lg border border-slate-200 p-3 text-sm"
          onChange={(event) => setDraftContent(event.target.value)}
          placeholder="创建或编辑 draft 内容"
          value={draftContent || latestDraft?.content || active?.content || ""}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() =>
              void run(async () => {
                await createPrompt({ prompt_key: selectedKey, content: draftContent || active?.content || "" });
              }, "已创建 draft")
            }
            type="button"
          >
            新建 Draft
          </Button>
          {latestDraft ? (
            <Button
              onClick={() =>
                void run(async () => {
                  await updatePrompt(latestDraft.id, draftContent || latestDraft.content);
                }, "Draft 已更新")
              }
              type="button"
            >
              保存 Draft
            </Button>
          ) : null}
          {latestDraft ? (
            <Button
              onClick={() => void run(async () => activatePrompt(latestDraft.id), "已激活")}
              type="button"
            >
              激活 Draft
            </Button>
          ) : null}
          {active ? (
            <Button onClick={() => void run(async () => archivePrompt(active.id), "已归档")} type="button">
              归档 Active
            </Button>
          ) : null}
          {(latestDraft ?? active) ? (
            <Button
              onClick={() =>
                void run(async () => {
                  const target = latestDraft ?? active;
                  if (!target) return;
                  const result = await testPrompt(target.id, {
                    query: "ETH",
                    context: "latest market context",
                    sources: "source: CryptoPilot"
                  });
                  setMessage(`测试渲染成功（${result.rendered.length} 字符）`);
                }, "测试完成")
              }
              type="button"
            >
              测试 Prompt
            </Button>
          ) : null}
        </div>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">版本列表</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {versions.map((item) => (
            <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2" key={item.id}>
              <span>
                v{item.version} · {item.status}
              </span>
              <span className="text-xs text-slate-500">{new Date(item.updated_at).toLocaleString("zh-CN")}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
