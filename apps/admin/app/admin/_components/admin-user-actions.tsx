"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAdminUser } from "../../lib/api";

type AdminUserActionsProps = {
  user: {
    id: string;
    role: "user" | "admin";
    disabled_at: string | null;
  };
};

export function AdminUserActions({ user }: AdminUserActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage("已更新");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  const nextRole = user.role === "admin" ? "user" : "admin";
  const disabled = Boolean(user.disabled_at);

  return (
    <div className="flex min-w-[160px] flex-wrap items-center gap-2">
      <button
        className="text-[#20808D] disabled:text-slate-400"
        disabled={busy}
        onClick={() => run(() => updateAdminUser(user.id, { role: nextRole }))}
        type="button"
      >
        {user.role === "admin" ? "设为用户" : "设为管理员"}
      </button>
      <button
        className="text-slate-700 disabled:text-slate-400"
        disabled={busy}
        onClick={() => run(() => updateAdminUser(user.id, { disabled: !disabled }))}
        type="button"
      >
        {disabled ? "恢复" : "禁用"}
      </button>
      {message ? <span className="text-xs text-slate-500">{message}</span> : null}
    </div>
  );
}
