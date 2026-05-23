import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SystemModule } from "../system/system.module";
import { AiRateLimitGuard } from "./rate-limit.guard";
import { LlmModule } from "../llm/llm.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PromptModule } from "../prompt/prompt.module";
import { AiController } from "./ai.controller";
import { AiSearchService } from "./ai-search.service";
import { EmbeddingService } from "./embedding.service";
import { FeedAiService } from "./feed-ai.service";
import { RagService } from "./rag.service";

@Module({
  imports: [PrismaModule, AuthModule, SystemModule, LlmModule, PromptModule],
  controllers: [AiController],
  providers: [AiSearchService, EmbeddingService, RagService, FeedAiService, AiRateLimitGuard],
  exports: [FeedAiService, EmbeddingService]
})
export class AiModule {}
