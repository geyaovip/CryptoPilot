"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallBanner() {
  const [enabled, setEnabled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api"}/system/public-config`)
      .then((res) => res.json())
      .then((body: { data?: { feature_flags?: { pwa_install?: boolean } } }) => {
        setEnabled(Boolean(body.data?.feature_flags?.pwa_install));
      })
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [enabled]);

  if (!enabled || !deferred || dismissed) return null;

  return (
    <div className="border-b border-[#E5E7E6] bg-[#F0FAFA] px-4 py-3 text-sm text-[#1A1F1C]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
        <span>将 CryptoPilot 安装到主屏幕，离线可查看缓存页。</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-[#20808D] px-3 py-1.5 text-white"
            onClick={() => {
              void deferred.prompt().then(() => setDeferred(null));
            }}
          >
            安装
          </button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-[#5F6868]" onClick={() => setDismissed(true)}>
            稍后
          </button>
        </div>
      </div>
    </div>
  );
}
