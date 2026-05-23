export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCF9] p-6 text-center text-[#102A2C]">
      <p className="text-xs font-medium uppercase tracking-wide text-[#20808D]">CryptoPilot</p>
      <h1 className="mt-2 text-2xl font-semibold">当前离线</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#5F6868]">
        网络不可用。请检查连接后刷新页面；已缓存的页面可能仍可浏览。
      </p>
      <a className="mt-6 rounded-2xl bg-[#20808D] px-5 py-3 text-sm font-medium text-white" href="/home">
        返回首页
      </a>
    </main>
  );
}
