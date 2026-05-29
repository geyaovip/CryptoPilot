import { Module, forwardRef } from "@nestjs/common";
import { InsightsModule } from "../insights/insights.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FeedClusterService } from "./feed-cluster.service";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";
import { FearGreedService } from "./fear-greed.service";
import { UserInterestService } from "./user-interest.service";

@Module({
  imports: [PrismaModule, forwardRef(() => InsightsModule)],
  controllers: [FeedController],
  providers: [FeedService, FeedClusterService, UserInterestService, FearGreedService],
  exports: [FeedService, FeedClusterService, UserInterestService]
})
export class FeedModule {}
