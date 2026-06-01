import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { AuthModule } from "../auth/auth.module";
import { FeedModule } from "../feed/feed.module";
import { IngestionModule } from "../ingestion/ingestion.module";
import { InsightsModule } from "../insights/insights.module";
import { NarrativesModule } from "../narratives/narratives.module";
import { PromptModule } from "../prompt/prompt.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PushModule } from "../push/push.module";
import { SystemModule } from "../system/system.module";
import { AdminAiMonitorService } from "./admin-ai-monitor.service";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminLogsService } from "./admin-logs.service";
import { AdminController } from "./admin.controller";
import { AdminFeedClusterService } from "./admin-feed-cluster.service";
import { AdminFeedService } from "./admin-feed.service";
import { AdminInsightService } from "./admin-insight.service";
import { AdminKolService } from "./admin-kol.service";
import { AdminNarrativeService } from "./admin-narrative.service";
import { AdminPromptService } from "./admin-prompt.service";
import { AdminSourceService } from "./admin-source.service";
import { AdminTokenService } from "./admin-token.service";
import { AdminUserService } from "./admin-user.service";

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SystemModule,
    IngestionModule,
    FeedModule,
    PromptModule,
    AiModule,
    NarrativesModule,
    InsightsModule,
    PushModule
  ],
  controllers: [AdminController],
  providers: [
    AdminDashboardService,
    AdminLogsService,
    AdminFeedService,
    AdminFeedClusterService,
    AdminSourceService,
    AdminPromptService,
    AdminAiMonitorService,
    AdminNarrativeService,
    AdminTokenService,
    AdminKolService,
    AdminInsightService,
    AdminUserService
  ]
})
export class AdminModule {}
