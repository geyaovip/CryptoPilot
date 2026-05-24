import { Module, forwardRef } from "@nestjs/common";
import { InsightsModule } from "../insights/insights.module";
import { PrismaModule } from "../prisma/prisma.module";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";
import { UserInterestService } from "./user-interest.service";

@Module({
  imports: [PrismaModule, forwardRef(() => InsightsModule)],
  controllers: [FeedController],
  providers: [FeedService, UserInterestService],
  exports: [FeedService, UserInterestService]
})
export class FeedModule {}
