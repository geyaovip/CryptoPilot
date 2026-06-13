import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";
import { listSitemapFeedItems, listSitemapInsights } from "./lib/sitemap-sources";
import { getNarratives } from "./lib/api";

const now = new Date();

function entry(
  path: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date | string;
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: options.lastModified ?? now,
    changeFrequency: options.changeFrequency,
    priority: options.priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "hourly", priority: 1 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/methodology", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/faq", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/disclaimer", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/narratives", { changeFrequency: "hourly", priority: 0.9 }),
    entry("/search", { changeFrequency: "weekly", priority: 0.5 })
  ];

  try {
    const [narratives, feedItems, insights] = await Promise.all([
      getNarratives("hottest"),
      listSitemapFeedItems(),
      listSitemapInsights()
    ]);

    return [
      ...staticPages,
      ...narratives.items.map((item) =>
        entry(`/narratives/${item.slug}`, {
          changeFrequency: "hourly",
          priority: 0.85
        })
      ),
      ...feedItems.map((item) =>
        entry(`/feed/${item.id}`, {
          changeFrequency: "daily",
          priority: 0.8,
          lastModified: item.publish_time
        })
      ),
      ...insights.map((item) =>
        entry(`/insights/${item.id}`, {
          changeFrequency: "daily",
          priority: 0.75,
          lastModified: item.sources[0]?.published_at ?? now
        })
      )
    ];
  } catch {
    return staticPages;
  }
}
