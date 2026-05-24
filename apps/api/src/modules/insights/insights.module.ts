import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PromptModule } from "../prompt/prompt.module";
import { PrismaModule } from "../prisma/prisma.module";
import { LlmModule } from "../llm/llm.module";
import { UserInterestService } from "../feed/user-interest.service";
import { InsightClusterService } from "./insight-cluster.service";
import { InsightService } from "./insight.service";
import { InsightSynthesisService } from "./insight-synthesis.service";
import { InsightsController } from "./insights.controller";

@Module({
  imports: [PrismaModule, PromptModule, LlmModule, AiModule],
  controllers: [InsightsController],
  providers: [InsightService, InsightClusterService, InsightSynthesisService, UserInterestService],
  exports: [InsightService, InsightClusterService, InsightSynthesisService]
})
export class InsightsModule {}
