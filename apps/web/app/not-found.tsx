import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCF9] p-6 text-center text-[#102A2C]">
      <h1 className="text-2xl font-semibold">页面不存在</h1>
      <p className="mt-2 text-sm text-[#5F6868]">请检查地址，或返回首页继续浏览。</p>
      <Link className="mt-6 text-sm text-[#20808D] underline" href="/home">
        返回首页
      </Link>
    </main>
  );
}
