import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">页面不存在</h1>
      <p className="mt-2 text-sm text-slate-500">请检查地址，或返回管理后台首页。</p>
      <Link className="mt-6 text-sm text-slate-700 underline" href="/admin/dashboard">
        返回仪表盘
      </Link>
    </main>
  );
}
