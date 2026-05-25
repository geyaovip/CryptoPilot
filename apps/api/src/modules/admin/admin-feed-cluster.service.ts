import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { FeedClusterService } from "../feed/feed-cluster.service";
import {
  clusterFeedInclude,
  pickClusterRepresentative,
  type ClusterFeedRow
} from "../feed/feed-cluster.util";
import { toFeedSummary } from "../feed/feed.mapper";
import { AuditService } from "../common/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminFeedClusterQueryDto } from "./dto/admin-feed-cluster.dto";

type ClusterRow = { cluster_id: string; member_count: number; latest_publish: Date };

@Injectable()
export class AdminFeedClusterService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FeedClusterService) private readonly feedClusterService: FeedClusterService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  async list(query: AdminFeedClusterQueryDto = {}) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const clusterFilter = query.cluster_id
      ? Prisma.sql`AND cluster_id = ${query.cluster_id}::uuid`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<ClusterRow[]>`
      SELECT cluster_id, COUNT(*)::int AS member_count, MAX(publish_time) AS latest_publish
      FROM feed_items
      WHERE cluster_id IS NOT NULL AND deleted_at IS NULL ${clusterFilter}
      GROUP BY cluster_id
      HAVING COUNT(*) >= 2
      ORDER BY latest_publish DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countRows = await this.prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total FROM (
        SELECT cluster_id FROM feed_items
        WHERE cluster_id IS NOT NULL AND deleted_at IS NULL ${clusterFilter}
        GROUP BY cluster_id HAVING COUNT(*) >= 2
      ) AS grouped
    `;
    const total = countRows[0]?.total ?? 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const items = await Promise.all(rows.map((row) => this.buildClusterSummary(row.cluster_id)));

    return {
      items,
      total,
      page: totalPages === 0 ? 1 : Math.min(page, totalPages),
      limit,
      total_pages: totalPages,
      has_prev: page > 1,
      has_next: page < totalPages
    };
  }

  async setRepresentative(clusterId: string, feedItemId: string, adminUserId: string) {
    const member = await this.ensureClusterMember(clusterId, feedItemId);
    await this.prisma.$transaction([
      this.prisma.feedItem.updateMany({
        where: { clusterId, deletedAt: null },
        data: { isClusterLead: false }
      }),
      this.prisma.feedItem.update({
        where: { id: feedItemId },
        data: { isClusterLead: true, rankScore: Math.max(member.rankScore, 95) }
      })
    ]);
    await this.audit.log({
      adminUserId,
      action: "feed_cluster.set_representative",
      entityType: "feed_cluster",
      entityId: clusterId,
      after: { feed_item_id: feedItemId }
    });
    return this.buildClusterSummary(clusterId);
  }

  async dissolve(clusterId: string, adminUserId: string) {
    await this.ensureClusterExists(clusterId);
    const updated = await this.prisma.feedItem.updateMany({
      where: { clusterId, deletedAt: null },
      data: { clusterId: null, isClusterLead: false }
    });
    await this.audit.log({
      adminUserId,
      action: "feed_cluster.dissolve",
      entityType: "feed_cluster",
      entityId: clusterId,
      after: { unlinked: updated.count }
    });
    return { success: true, unlinked: updated.count };
  }

  async removeMember(feedItemId: string, adminUserId: string) {
    const feed = await this.prisma.feedItem.findFirst({
      where: { id: feedItemId, deletedAt: null }
    });
    if (!feed?.clusterId) throw new BadRequestException("该 Feed 不在任何簇中");
    const clusterId = feed.clusterId;
    await this.prisma.feedItem.update({
      where: { id: feedItemId },
      data: { clusterId: null, isClusterLead: false }
    });
    const remaining = await this.prisma.feedItem.count({
      where: { clusterId, deletedAt: null }
    });
    if (remaining === 1) {
      await this.prisma.feedItem.updateMany({
        where: { clusterId, deletedAt: null },
        data: { clusterId: null, isClusterLead: false }
      });
    } else if (feed.isClusterLead) {
      const next = await this.prisma.feedItem.findFirst({
        where: { clusterId, deletedAt: null },
        orderBy: [{ rankScore: "desc" }, { publishTime: "desc" }]
      });
      if (next) {
        await this.prisma.feedItem.update({ where: { id: next.id }, data: { isClusterLead: true } });
      }
    }
    await this.audit.log({
      adminUserId,
      action: "feed_cluster.remove_member",
      entityType: "feed_item",
      entityId: feedItemId,
      before: { cluster_id: clusterId }
    });
    return { success: true };
  }

  async reassign(adminUserId: string) {
    const result = await this.feedClusterService.assignClusters(true);
    await this.audit.log({
      adminUserId,
      action: "feed_cluster.reassign",
      entityType: "feed_cluster",
      entityId: "all",
      after: result
    });
    return result;
  }

  private async buildClusterSummary(clusterId: string) {
    const members = (await this.prisma.feedItem.findMany({
      where: { clusterId, deletedAt: null },
      include: clusterFeedInclude,
      orderBy: [{ isClusterLead: "desc" }, { rankScore: "desc" }, { publishTime: "desc" }]
    })) as ClusterFeedRow[];

    if (members.length < 2) {
      throw new NotFoundException("簇不存在或成员不足");
    }

    const representative = pickClusterRepresentative(members);
    const narratives = [
      ...new Set(
        members.flatMap((row) => row.feedItemNarratives.map(({ narrative }) => narrative.name))
      )
    ];

    return {
      cluster_id: clusterId,
      member_count: members.length,
      narrative_names: narratives,
      representative: {
        ...toFeedSummary(representative, members.length),
        is_cluster_lead: true
      },
      members: members.map((row) => ({
        ...toFeedSummary(row, 1),
        is_cluster_lead: row.isClusterLead
      }))
    };
  }

  private async ensureClusterExists(clusterId: string) {
    const count = await this.prisma.feedItem.count({
      where: { clusterId, deletedAt: null }
    });
    if (count < 2) throw new NotFoundException("簇不存在");
  }

  private async ensureClusterMember(clusterId: string, feedItemId: string) {
    const member = await this.prisma.feedItem.findFirst({
      where: { id: feedItemId, clusterId, deletedAt: null }
    });
    if (!member) throw new NotFoundException("Feed 不属于该簇");
    return member;
  }
}
