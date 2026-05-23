import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { AuthModule } from "../auth/auth.module";
import { IngestionModule } from "../ingestion/ingestion.module";
import { NarrativesModule } from "../narratives/narratives.module";
import { PromptModule } from "../prompt/prompt.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemModule } from "../system/system.module";
import { AdminAiMonitorService } from "./admin-ai-monitor.service";
import { AdminLogsService } from "./admin-logs.service";
import { AdminController } from "./admin.controller";
import { AdminFeedService } from "./admin-feed.service";
import { AdminKolService } from "./admin-kol.service";
import { AdminNarrativeService } from "./admin-narrative.service";
import { AdminPromptService } from "./admin-prompt.service";
import { AdminSourceService } from "./admin-source.service";
import { AdminTokenService } from "./admin-token.service";

@Module({
  imports: [AuthModule, PrismaModule, SystemModule, IngestionModule, PromptModule, AiModule, NarrativesModule],
  controllers: [AdminController],
  providers: [
    AdminLogsService,
    AdminFeedService,
    AdminSourceService,
    AdminPromptService,
    AdminAiMonitorService,
    AdminNarrativeService,
    AdminTokenService,
    AdminKolService
  ]
})
export class AdminModule {}
