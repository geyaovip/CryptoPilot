import Link from "next/link";
import { CryptoPilotLogo } from "./cryptopilot-logo";

export function HomeHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CryptoPilotLogo markClassName="h-12 w-12 text-[#111111]" />
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#102A2C]">AI 市场雷达</h1>
        </div>
        <Link className="rounded-full border border-[#D9D5C9] px-4 py-2 text-sm text-[#5F6868] hover:bg-white" href="/me">
          我的
        </Link>
      </div>
      <Link
        className="flex h-12 items-center rounded-2xl border border-[#D9D5C9] bg-[#FCFCF9] px-4 text-sm text-[#8A918C] shadow-inner hover:border-[#20808D] hover:text-[#5F6868]"
        data-testid="home-search-entry"
        href="/search"
      >
        搜索市场问题、代币或叙事…
      </Link>
    </div>
  );
}
