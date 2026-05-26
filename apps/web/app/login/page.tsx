import { Suspense } from "react";
import { noIndexMetadata } from "../lib/seo";
import { LoginForm } from "./login-form";

export const metadata = noIndexMetadata;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FCFCF9] p-4 text-[#102A2C]">
      <Suspense fallback={<p className="text-sm text-[#5F6868]">加载中…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
