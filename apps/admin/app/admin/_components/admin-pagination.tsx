"use client";

type AdminPaginationProps = {
  basePath: string;
  page: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  limit?: number;
  extraParams?: Record<string, string>;
};

function buildUrl(basePath: string, targetPage: number, limit?: number, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set("page", String(targetPage));
  if (limit) params.set("limit", String(limit));
  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }
  return `${basePath}?${params.toString()}`;
}

function paginationLinkClass(disabled: boolean): string {
  return disabled
    ? "inline-flex h-9 cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-400"
    : "inline-flex h-9 items-center rounded-lg border border-transparent bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800";
}

export function AdminPagination({
  basePath,
  page,
  total,
  totalPages,
  hasPrev,
  hasNext,
  limit,
  extraParams
}: AdminPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        共 {total} 条，第 {page} / {totalPages} 页
      </span>
      <div className="flex gap-2">
        {hasPrev ? (
          <a className={paginationLinkClass(false)} href={buildUrl(basePath, page - 1, limit, extraParams)}>
            上一页
          </a>
        ) : (
          <span className={paginationLinkClass(true)}>上一页</span>
        )}
        {hasNext ? (
          <a className={paginationLinkClass(false)} href={buildUrl(basePath, page + 1, limit, extraParams)}>
            下一页
          </a>
        ) : (
          <span className={paginationLinkClass(true)}>下一页</span>
        )}
      </div>
    </div>
  );
}
