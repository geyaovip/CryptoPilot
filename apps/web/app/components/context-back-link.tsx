"use client";

import type { MouseEvent, ReactNode } from "react";

type ContextBackLinkProps = {
  fallbackHref: string;
  children?: ReactNode;
};

export function ContextBackLink({ fallbackHref, children = "返回上一页" }: ContextBackLinkProps) {
  function handleBack(event: MouseEvent<HTMLAnchorElement>) {
    if (hasSameOriginReferrer()) {
      event.preventDefault();
      window.history.back();
    }
  }

  return (
    <a className="text-sm font-medium text-[#20808D]" href={fallbackHref} onClick={handleBack}>
      ← {children}
    </a>
  );
}

function hasSameOriginReferrer(): boolean {
  if (typeof window === "undefined" || !document.referrer || window.history.length <= 1) return false;
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}
