import Link from "next/link";
import { Card } from "@cryptopilot/ui";
import { WebShell } from "../_components/web-shell";
import { JsonLd } from "./json-ld";
import { breadcrumbJsonLd, pageJsonLd } from "../lib/seo";

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  sections: InfoSection[];
};

const relatedLinks = [
  { href: "/about", label: "关于 CryptoPilot" },
  { href: "/methodology", label: "方法论" },
  { href: "/faq", label: "FAQ" },
  { href: "/disclaimer", label: "免责声明" }
];

export function InfoPage({ eyebrow, title, description, path, sections }: InfoPageProps) {
  return (
    <WebShell>
      <JsonLd
        data={[
          pageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: title, path }
          ])
        ]}
      />
      <article className="mx-auto max-w-3xl space-y-5">
        <Card className="border-[#D9D5C9] bg-white/90 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#20808D]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#102A2C]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#5F6868]">{description}</p>
        </Card>
        <Card className="border-[#D9D5C9] bg-[#FCFCF9] p-6">
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-[#102A2C]">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#5F6868]">{section.body}</p>
              </section>
            ))}
          </div>
        </Card>
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="相关说明页面">
          {relatedLinks.map((item) => (
            <Link className="rounded-full border border-[#D9D5C9] bg-white px-3 py-1.5 text-[#5F6868] hover:border-[#20808D]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </article>
    </WebShell>
  );
}
