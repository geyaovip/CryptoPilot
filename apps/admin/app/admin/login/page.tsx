import { Suspense } from "react";
import { redirect } from "next/navigation";
import { hasAdminSession } from "../../lib/admin-session";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <Suspense fallback={<p className="text-sm text-slate-500">加载中…</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
