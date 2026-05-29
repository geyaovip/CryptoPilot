"use client";

import { Button } from "@cryptopilot/ui";
import { useRouter } from "next/navigation";

type AdminPaginationProps = {
  basePath: string;
  page: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  limit?: number;
};

export function AdminPagination({
  basePath,
  page,
  total,
  totalPages,
  hasPrev,
  hasNext,
  limit
}: AdminPaginationProps) {
  const router = useRouter();

  const go = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (limit) params.set("limit", String(limit));
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        共 {total} 条，第 {page} / {totalPages} 页
      </span>
      <div className="flex gap-2">
        <Button disabled={!hasPrev} onClick={() => go(page - 1)} type="button">
          上一页
        </Button>
        <Button disabled={!hasNext} onClick={() => go(page + 1)} type="button">
          下一页
        </Button>
      </div>
    </div>
  );
}
