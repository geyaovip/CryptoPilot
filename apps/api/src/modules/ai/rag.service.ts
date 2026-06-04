import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiSourceRef } from "@cryptopilot/types";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "./embedding.service";

export type RagContextItem = {
  id: string;
  title: string;
  content: string;
  ai_summary: string;
  source_name: string;
  source_url: string;
  publish_time: string;
};

@Injectable()
export class RagService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmbeddingService) private readonly embeddingService: EmbeddingService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  async retrieve(query: string): Promise<RagContextItem[]> {
    const keywordIds = await this.keywordSearch(query, 10);
    const vectorIds =
      keywordIds.length >= 4 || this.config.get<string>("RAG_ENABLE_VECTOR_SEARCH") !== "true"
        ? []
        : await this.embeddingService.vectorSearch(query, 10);
    const mergedIds = [...new Set([...keywordIds, ...vectorIds])].slice(0, 12);
    if (mergedIds.length === 0) return [];

    const feeds = await this.prisma.feedItem.findMany({
      where: { id: { in: mergedIds }, deletedAt: null, status: "PUBLISHED" },
      include: { source: true }
    });
    const order = new Map(mergedIds.map((id, index) => [id, index]));
    feeds.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));

    return feeds.map((feed) => ({
      id: feed.id,
      title: feed.title,
      content: feed.content.slice(0, 600),
      ai_summary: feed.aiSummary,
      source_name: feed.source.name,
      source_url: feed.sourceUrl,
      publish_time: feed.publishTime.toISOString()
    }));
  }

  toSources(items: RagContextItem[]): AiSourceRef[] {
    return items.map((item) => ({
      source_name: item.source_name,
      source_type: "news",
      url: item.source_url,
      published_at: item.publish_time
    }));
  }

  private async keywordSearch(query: string, limit: number): Promise<string[]> {
    const terms = query
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length >= 2)
      .slice(0, 5);
    if (terms.length === 0) return [];

    const feeds = await this.prisma.feedItem.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        OR: terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { content: { contains: term, mode: "insensitive" as const } },
          { aiSummary: { contains: term, mode: "insensitive" as const } }
        ])
      },
      orderBy: { publishTime: "desc" },
      take: limit,
      select: { id: true }
    });
    return feeds.map((feed) => feed.id);
  }
}
