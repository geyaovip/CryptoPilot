import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { clusterFeedInclude, planClusterAssignments, type ClusterFeedRow } from "./feed-cluster.util";

@Injectable()
export class FeedClusterService {
  private readonly logger = new Logger(FeedClusterService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Cron("*/30 * * * *")
  async clusterScheduled(): Promise<void> {
    await this.assignClusters().catch((error) => {
      this.logger.warn(error instanceof Error ? error.message : "cluster assign failed");
    });
  }

  async assignClusters(reset = false): Promise<{ clusters: number; linked: number }> {
    if (reset) {
      await this.prisma.feedItem.updateMany({ data: { clusterId: null } });
    }

    const feeds = (await this.prisma.feedItem.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: clusterFeedInclude,
      orderBy: { publishTime: "desc" },
      take: 500
    })) as ClusterFeedRow[];

    const plans = planClusterAssignments(feeds);
    let linked = 0;
    for (const plan of plans) {
      await this.prisma.feedItem.updateMany({
        where: { id: { in: plan.ids } },
        data: { clusterId: plan.clusterId }
      });
      linked += plan.ids.length;
    }

    return { clusters: plans.length, linked };
  }
}
