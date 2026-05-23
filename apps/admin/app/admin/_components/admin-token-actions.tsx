"use client";

import { useState } from "react";
import { Button, Card } from "@cryptopilot/ui";
import { refreshAdminToken, updateAdminToken } from "../../lib/api";

type TokenRow = { id: string; symbol: string; name: string; is_active: boolean };

export function AdminTokenActions({ items }: { items: TokenRow[] }) {
  const [tokenId, setTokenId] = useState(items[0]?.id ?? "");
  const [symbol, setSymbol] = useState(items[0]?.symbol ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage("已保存，请刷新页面。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <h2 className="font-medium text-slate-950">编辑 Token</h2>
      <select
        className="w-full rounded border px-3 py-2 text-sm"
        onChange={(e) => {
          const next = items.find((item) => item.id === e.target.value);
          setTokenId(e.target.value);
          setSymbol(next?.symbol ?? "");
        }}
        value={tokenId}
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.symbol}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded border px-3 py-2 text-sm"
        onChange={(e) => setSymbol(e.target.value)}
        value={symbol}
      />
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy || !tokenId} onClick={() => run(() => updateAdminToken(tokenId, { symbol }))} type="button">
          保存 Symbol
        </Button>
        <Button disabled={busy || !tokenId} onClick={() => run(() => refreshAdminToken(tokenId))} type="button">
          刷新行情
        </Button>
        <Button disabled={busy || !tokenId} onClick={() => run(() => updateAdminToken(tokenId, { is_active: false }))} type="button">
          隐藏
        </Button>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </Card>
  );
}
