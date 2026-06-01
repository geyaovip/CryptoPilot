import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { CommonModule } from "./common/common.module";
import { SystemModule } from "./system/system.module";
import { AdminModule } from "./admin/admin.module";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { BookmarksModule } from "./bookmarks/bookmarks.module";
import { FeedModule } from "./feed/feed.module";
import { InsightsModule } from "./insights/insights.module";
import { KolsModule } from "./kols/kols.module";
import { NarrativesModule } from "./narratives/narratives.module";
import { SettingsModule } from "./settings/settings.module";
import { TelegramModule } from "./telegram/telegram.module";
import { TokensModule } from "./tokens/tokens.module";
import { WatchlistModule } from "./watchlist/watchlist.module";
import { HealthModule } from "./health/health.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PushModule } from "./push/push.module";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ["../../.env", ".env"], isGlobal: true }),
    ScheduleModule.forRoot(),
    CommonModule,
    SystemModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    SettingsModule,
    TelegramModule,
    InsightsModule,
    FeedModule,
    BookmarksModule,
    NarrativesModule,
    WatchlistModule,
    TokensModule,
    KolsModule,
    IngestionModule,
    AiModule,
    PushModule,
    AdminModule
  ]
})
export class AppModule {}
