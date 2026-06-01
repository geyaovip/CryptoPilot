"use client";

import { Button, Card } from "@cryptopilot/ui";
import type { PushMessageSummary } from "@cryptopilot/types";
import { useState } from "react";
import { sendAdminPush, type AdminUserItem } from "../../lib/api";

const pushTypes = ["all", "daily_digest", "market_alert", "watchlist_alert", "manual"] as const;
const pushStatuses = ["all", "pending", "sent", "failed", "cancelled"] as const;
const pushTypeLabels: Record<(typeof pushTypes)[number], string> = {
  all: "全部类型",
  daily_digest: "每日摘要",
  market_alert: "市场异动",
  watchlist_alert: "关注提醒",
  manual: "手动推送"
};
const pushStatusLabels: Record<(typeof pushStatuses)[number], string> = {
  all: "全部状态",
  pending: "待发送",
  sent: "已发送",
  failed: "发送失败",
  cancelled: "已取消"
};

export function PushPanel({
  items,
  users
}: {
  items: PushMessageSummary[];
  users: AdminUserItem[];
}) {
  const defaultUser = users.find((user) => user.telegram_bound) ?? users[0];
  const [userId, setUserId] = useState(defaultUser?.id ?? "");
  const [title, setTitle] = useState("CryptoPilot 市场提醒");
  const [body, setBody] = useState("这里填写推送正文。");
  const [typeFilter, setTypeFilter] = useState<(typeof pushTypes)[number]>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof pushStatuses)[number]>("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const filteredItems = items.filter((item) => {
    const matchType = typeFilter === "all" || item.type === typeFilter;
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchType && matchStatus;
  });

  async function submit() {
    setBusy(true);
    setNotice(null);
    try {
      const result = await sendAdminPush({ user_id: userId, type: "manual", title, body });
      if (result.status === "sent") {
        setNotice({ type: "success", text: "Push 已发送，Telegram 应该会收到消息。" });
      } else {
        setNotice({ type: "error", text: result.error_message ?? "Push 发送失败，请查看下方记录。" });
      }
      window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "发送失败" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-[#D9D5C9] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#102A2C]">手动发送 Push</h2>
        <p className="mt-1 text-sm text-[#5F6868]">用于测试 Telegram 绑定和发送链路。用户关闭 Push 或未绑定时会发送失败并记录日志。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-[#5F6868]">
            目标用户
            <select className="rounded-xl border border-[#D9D5C9] px-3 py-2" onChange={(event) => setUserId(event.target.value)} value={userId}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email ?? user.uid}{user.telegram_bound ? " · Telegram 已绑定" : " · 未绑定"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-[#5F6868]">
            标题
            <input className="rounded-xl border border-[#D9D5C9] px-3 py-2" onChange={(event) => setTitle(event.target.value)} value={title} />
          </label>
          <label className="grid gap-1 text-sm text-[#5F6868] md:col-span-2">
            正文
            <textarea className="min-h-28 rounded-xl border border-[#D9D5C9] px-3 py-2" onChange={(event) => setBody(event.target.value)} value={body} />
          </label>
        </div>
        <Button className="mt-4" disabled={busy || !userId} onClick={() => void submit()} type="button">
          {busy ? "发送中…" : "立即发送"}
        </Button>
        {notice ? (
          <p className={`mt-3 text-sm ${notice.type === "success" ? "text-[#20808D]" : "text-[#B54708]"}`}>{notice.text}</p>
        ) : null}
      </Card>

      <Card className="border-[#D9D5C9] bg-white p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#102A2C]">Push 列表</h2>
            <p className="mt-1 text-sm text-[#5F6868]">共 {filteredItems.length} 条，可按类型和发送状态排查。</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select className="rounded-xl border border-[#D9D5C9] px-3 py-2 text-sm" onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)} value={typeFilter}>
              {pushTypes.map((type) => (
                <option key={type} value={type}>
                  {pushTypeLabels[type]}
                </option>
              ))}
            </select>
            <select className="rounded-xl border border-[#D9D5C9] px-3 py-2 text-sm" onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} value={statusFilter}>
              {pushStatuses.map((status) => (
                <option key={status} value={status}>
                  {pushStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-[#8A918C]">
              <tr>
                <th className="py-2">类型</th>
                <th className="py-2">状态</th>
                <th className="py-2">标题</th>
                <th className="py-2">内容预览</th>
                <th className="py-2">发送时间</th>
                <th className="py-2">失败原因</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DA]">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">{pushTypeLabels[item.type]}</td>
                  <td className="py-3">{pushStatusLabels[item.status]}</td>
                  <td className="max-w-sm py-3">{item.title}</td>
                  <td className="max-w-md py-3 text-[#5F6868]">{item.body.slice(0, 120)}{item.body.length > 120 ? "…" : ""}</td>
                  <td className="py-3">{item.sent_at ? new Date(item.sent_at).toLocaleString("zh-CN") : "-"}</td>
                  <td className="max-w-sm py-3 text-[#B54708]">{item.error_message ?? "-"}</td>
                </tr>
              ))}
              {filteredItems.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-[#8A918C]" colSpan={6}>
                    暂无符合筛选条件的 Push 记录
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
