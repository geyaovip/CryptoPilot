import type { Metadata } from "next";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cryptopilot.chat");

export const siteName = "CryptoPilot";

export const defaultDescription =
  "CryptoPilot 是 AI 加密市场情报终端，聚合多来源新闻、市场叙事与资产信号，帮助研究者快速跟踪加密市场变化。";

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
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description,
      url,
      siteName,
      locale: "zh_CN",
      type: input.type ?? "website"
    },
    twitter: {
      card: "summary",
      title: input.title,
      description
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
    url: absoluteUrl("/"),
    description: defaultDescription
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
      name: siteName
    },
    inLanguage: "zh-CN",
    isAccessibleForFree: true
  };
}
