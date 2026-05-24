import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { LlmService } from "../llm/llm.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(LlmService) private readonly llm: LlmService
  ) {}

  async upsertFeedEmbedding(feedItemId: string, text: string): Promise<void> {
    await this.upsertEntityEmbedding("feed_item", feedItemId, text, "feed_embedding");
  }

  async upsertEntityEmbedding(
    entityType: string,
    entityId: string,
    text: string,
    purpose: "feed_embedding" | "search_embedding" = "feed_embedding"
  ): Promise<void> {
    const result = await this.llm.embed([text], purpose);
    const vector = result.vectors[0];
    if (!vector) return;
    const literal = `[${vector.join(",")}]`;
    await this.prisma.$executeRaw`
      INSERT INTO content_embeddings (id, entity_type, entity_id, embedding, embedding_model, created_at)
      VALUES (gen_random_uuid(), ${entityType}, ${entityId}::uuid, ${literal}::vector, ${result.model}, now())
      ON CONFLICT (entity_type, entity_id)
      DO UPDATE SET embedding = EXCLUDED.embedding, embedding_model = EXCLUDED.embedding_model, created_at = now()`;
  }

  async vectorSearch(query: string, limit = 10): Promise<string[]> {
    const result = await this.llm.embed([query], "search_embedding");
    const vector = result.vectors[0];
    if (!vector) return [];
    const literal = `[${vector.join(",")}]`;
    const rows = await this.prisma.$queryRaw<{ entity_id: string }[]>(
      Prisma.sql`
        SELECT entity_id::text
        FROM content_embeddings
        WHERE entity_type = 'feed_item'
        ORDER BY embedding <=> ${literal}::vector
        LIMIT ${limit}`
    );
    return rows.map((row) => row.entity_id);
  }
}
