import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <Suspense fallback={<p className="text-sm text-slate-500">加载中…</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
