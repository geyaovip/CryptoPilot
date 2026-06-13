import Link from "next/link";

export const siteFooterLinks = [
  { href: "/narratives", label: "市场叙事" },
  { href: "/search", label: "AI 研究" },
  { href: "/about", label: "关于" },
  { href: "/methodology", label: "方法论" },
  { href: "/faq", label: "FAQ" },
  { href: "/disclaimer", label: "免责声明" }
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[#E8E2D4] pt-6">
      <nav aria-label="站点导航" className="flex flex-wrap gap-2 text-sm">
        {siteFooterLinks.map((item) => (
          <Link
            className="rounded-full border border-[#D9D5C9] bg-white px-3 py-1.5 text-[#5F6868] hover:border-[#20808D] hover:text-[#20808D]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-xs text-[#8A918C]">CryptoPilot 仅供研究参考，不构成投资建议。</p>
    </footer>
  );
}
