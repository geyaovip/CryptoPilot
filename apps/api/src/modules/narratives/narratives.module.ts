import { Module } from "@nestjs/common";
import { LlmModule } from "../llm/llm.module";
import { PromptModule } from "../prompt/prompt.module";
import { PrismaModule } from "../prisma/prisma.module";
import { NarrativeAiService } from "./narrative-ai.service";
import { NarrativeMetricsService } from "./narrative-metrics.service";
import { NarrativesController } from "./narratives.controller";
import { NarrativesService } from "./narratives.service";

@Module({
  imports: [PrismaModule, PromptModule, LlmModule],
  controllers: [NarrativesController],
  providers: [NarrativesService, NarrativeMetricsService, NarrativeAiService],
  exports: [NarrativeMetricsService, NarrativeAiService]
})
export class NarrativesModule {}
