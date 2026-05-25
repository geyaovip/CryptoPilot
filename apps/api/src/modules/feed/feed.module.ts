import { Module, forwardRef } from "@nestjs/common";
import { InsightsModule } from "../insights/insights.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FeedClusterService } from "./feed-cluster.service";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";
import { UserInterestService } from "./user-interest.service";

@Module({
  imports: [PrismaModule, forwardRef(() => InsightsModule)],
  controllers: [FeedController],
  providers: [FeedService, FeedClusterService, UserInterestService],
  exports: [FeedService, FeedClusterService, UserInterestService]
})
export class FeedModule {}
