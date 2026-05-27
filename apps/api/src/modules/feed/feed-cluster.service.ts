import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BackgroundJobsService } from "../common/background-jobs.service";
import { PrismaService } from "../prisma/prisma.service";
import { applyClusterPlans, clusterFeedInclude, planClusterAssignments, type ClusterFeedRow } from "./feed-cluster.util";

@Injectable()
export class FeedClusterService {
  private readonly logger = new Logger(FeedClusterService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BackgroundJobsService) private readonly jobs: BackgroundJobsService
  ) {}

  @Cron("*/30 * * * *")
  async clusterScheduled(): Promise<void> {
    if (!this.jobs.enabled) return;
    await this.assignClusters().catch((error) => {
      this.logger.warn(error instanceof Error ? error.message : "cluster assign failed");
    });
  }

  async assignClusters(reset = false): Promise<{ clusters: number; linked: number }> {
    if (reset) {
      await this.prisma.feedItem.updateMany({ data: { clusterId: null, isClusterLead: false } });
    }

    const feeds = (await this.prisma.feedItem.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: clusterFeedInclude,
      orderBy: { publishTime: "desc" },
      take: 500
    })) as ClusterFeedRow[];

    const plans = planClusterAssignments(feeds);
    const linked = await applyClusterPlans(this.prisma, plans);
    return { clusters: plans.length, linked };
  }
}
