import type { Metadata } from "next";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cryptopilot.chat");

export const siteName = "CryptoPilot";

export const siteTagline = "AI 加密市场情报终端";

export const defaultDescription =
  "CryptoPilot 聚合多来源加密新闻、市场叙事、资产信号与 AI 解读，帮助研究者快速跟踪 Web3 市场变化。仅供研究参考，不提供投资建议。";

export const siteKeywords = [
  "CryptoPilot",
  "AI Market Intelligence",
  "加密市场",
  "Crypto",
  "Web3",
  "市场叙事",
  "AI 解读",
  "加密新闻",
  "市场雷达"
];

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function truncateDescription(value: string, maxLength = 155): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

export function seoTitle(value: string, suffix = " | CryptoPilot", maxLength = 62): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  const available = Math.max(12, maxLength - suffix.length);
  const title = normalized.length > available ? `${normalized.slice(0, available - 1)}…` : normalized;
  return `${title}${suffix}`;
}

export function publicPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const description = truncateDescription(input.description);
  const url = absoluteUrl(input.path);

  return {
    title: input.title,
    description,
    keywords: siteKeywords,
    authors: [{ name: siteName, url: absoluteUrl("/") }],
    creator: siteName,
    publisher: siteName,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    alternates: { canonical: input.path },
    icons: {
      icon: [
        { url: "/icon.png", sizes: "64x64", type: "image/png" },
        { url: "/favicon.svg", sizes: "64x64", type: "image/svg+xml" },
        { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
        { url: "/icon.svg", sizes: "64x64", type: "image/svg+xml" }
      ],
      shortcut: "/favicon.svg",
      apple: "/icon-192.svg"
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    },
    openGraph: {
      title: input.title,
      description,
      url,
      siteName,
      locale: "zh_CN",
      type: input.type ?? "website",
      images: [
        {
          url: absoluteUrl("/og-image.svg"),
          width: 1200,
          height: 630,
          alt: "CryptoPilot AI 加密市场情报终端"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [absoluteUrl("/og-image.svg")]
    }
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: defaultDescription,
    alternateName: siteTagline,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: siteTagline,
    url: absoluteUrl("/"),
    description: defaultDescription,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/cryptopilot-social-avatar.svg"),
      width: 512,
      height: 512
    },
    sameAs: [absoluteUrl("/")]
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    alternateName: siteTagline,
    url: absoluteUrl("/"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    description: defaultDescription,
    inLanguage: "zh-CN",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/")
    }
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function pageJsonLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: truncateDescription(input.description, 200),
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/")
    },
    inLanguage: "zh-CN"
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: truncateDescription(input.headline, 110),
    description: truncateDescription(input.description, 200),
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: input.authorName ?? siteName
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.svg")
      }
    },
    inLanguage: "zh-CN",
    isAccessibleForFree: true
  };
}
