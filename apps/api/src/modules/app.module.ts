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
import { KolsModule } from "./kols/kols.module";
import { NarrativesModule } from "./narratives/narratives.module";
import { TokensModule } from "./tokens/tokens.module";
import { WatchlistModule } from "./watchlist/watchlist.module";
import { HealthModule } from "./health/health.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { PrismaModule } from "./prisma/prisma.module";
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
    FeedModule,
    BookmarksModule,
    NarrativesModule,
    WatchlistModule,
    TokensModule,
    KolsModule,
    IngestionModule,
    AiModule,
    AdminModule
  ]
})
export class AppModule {}
