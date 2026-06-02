import Link from "next/link";
import { Card } from "@cryptopilot/ui";

const infoLinks = [
  {
    href: "/about",
    title: "关于 CryptoPilot",
    description: "了解产品定位、适合人群与核心能力。"
  },
  {
    href: "/methodology",
    title: "方法论",
    description: "查看来源聚合、AI 解读与风险控制原则。"
  },
  {
    href: "/faq",
    title: "FAQ",
    description: "快速回答常见问题、数据来源与使用边界。"
  },
  {
    href: "/disclaimer",
    title: "免责声明",
    description: "明确研究用途与非投资建议边界。"
  }
];

export function SiteInfoFooter() {
  return (
    <Card className="border-[#D9D5C9] bg-[#FCFCF9] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#20808D]">Learn CryptoPilot</p>
          <h2 className="mt-2 text-lg font-semibold text-[#102A2C]">了解 CryptoPilot</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[#5F6868]">
          这些页面说明 CryptoPilot 的产品定位、AI 解读方法、常见问题与风险边界，方便用户和搜索引擎理解本站。
        </p>
      </div>
      <nav className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="CryptoPilot 信息页面">
        {infoLinks.map((item) => (
          <Link
            className="rounded-2xl border border-[#E6E0D3] bg-white px-4 py-3 transition hover:border-[#20808D] hover:shadow-sm"
            href={item.href}
            key={item.href}
          >
            <span className="text-sm font-semibold text-[#102A2C]">{item.title}</span>
            <span className="mt-1 block text-xs leading-5 text-[#5F6868]">{item.description}</span>
          </Link>
        ))}
      </nav>
    </Card>
  );
}
