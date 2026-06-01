import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { AuditService } from "../common/audit.service";
import { ok } from "../common/api-response";
import { SystemConfigService } from "../system/system-config.service";
import { AdminDashboardService } from "./admin-dashboard.service";
import { AdminLogsService } from "./admin-logs.service";
import { AdminAiMonitorService } from "./admin-ai-monitor.service";
import { AdminFeedClusterService } from "./admin-feed-cluster.service";
import { AdminFeedService } from "./admin-feed.service";
import { AdminFeedClusterQueryDto, SetClusterRepresentativeDto } from "./dto/admin-feed-cluster.dto";
import { AdminInsightService } from "./admin-insight.service";
import { AdminKolService } from "./admin-kol.service";
import { AdminNarrativeService } from "./admin-narrative.service";
import { AdminPromptService } from "./admin-prompt.service";
import { AdminSourceService } from "./admin-source.service";
import { AdminTokenService } from "./admin-token.service";
import { AdminUserService } from "./admin-user.service";
import { CreateAdminKolDto, UpdateAdminKolDto } from "./dto/admin-kol.dto";
import { CreateAdminNarrativeDto, MergeAdminNarrativeDto, UpdateAdminNarrativeDto } from "./dto/admin-narrative.dto";
import { UpdateAdminTokenDto } from "./dto/admin-token.dto";
import { AdminFeedQueryDto, CreateAdminFeedDto, UpdateAdminFeedDto } from "./dto/admin-feed.dto";
import { CreatePromptDto, PromptQueryDto, TestPromptDto, UpdatePromptDto } from "./dto/admin-prompt.dto";
import { UpdateSourceDto } from "./dto/admin-source.dto";
import { PatchAdminConfigDto } from "./dto/admin-config.dto";
import { AdminLogsQueryDto } from "./dto/admin-logs-query.dto";
import { AdminPaginationDto } from "./dto/admin-pagination.dto";
import { UpdateAdminUserDto } from "./dto/admin-user.dto";
import { AdminSendPushDto } from "../push/dto/admin-send-push.dto";
import { PushService } from "../push/push.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @Inject(AdminDashboardService) private readonly adminDashboardService: AdminDashboardService,
    @Inject(AdminLogsService) private readonly adminLogsService: AdminLogsService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(AdminFeedService) private readonly adminFeedService: AdminFeedService,
    @Inject(AdminFeedClusterService) private readonly adminFeedClusterService: AdminFeedClusterService,
    @Inject(AdminSourceService) private readonly adminSourceService: AdminSourceService,
    @Inject(AdminPromptService) private readonly adminPromptService: AdminPromptService,
    @Inject(AdminAiMonitorService) private readonly adminAiMonitorService: AdminAiMonitorService,
    @Inject(AdminNarrativeService) private readonly adminNarrativeService: AdminNarrativeService,
    @Inject(AdminTokenService) private readonly adminTokenService: AdminTokenService,
    @Inject(AdminKolService) private readonly adminKolService: AdminKolService,
    @Inject(AdminInsightService) private readonly adminInsightService: AdminInsightService,
    @Inject(AdminUserService) private readonly adminUserService: AdminUserService,
    @Inject(PushService) private readonly pushService: PushService
  ) {}

  @Get("dashboard")
  async dashboard() {
    return ok(await this.adminDashboardService.getOverview());
  }

  @Get("users")
  async users() {
    return ok(await this.adminUserService.list());
  }

  @Patch("users/:id")
  async updateUser(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAdminUserDto
  ) {
    return ok(await this.adminUserService.update(id, dto, req.user.id));
  }

  @Get("feed")
  async feed(@Query() query: AdminFeedQueryDto) {
    return ok(await this.adminFeedService.list(query));
  }

  @Get("feed/clusters")
  async feedClusters(@Query() query: AdminFeedClusterQueryDto) {
    return ok(await this.adminFeedClusterService.list(query));
  }

  @Post("feed/clusters/reassign")
  async reassignFeedClusters(@Req() req: { user: { id: string } }) {
    return ok(await this.adminFeedClusterService.reassign(req.user.id));
  }

  @Patch("feed/clusters/:clusterId/representative")
  async setClusterRepresentative(
    @Req() req: { user: { id: string } },
    @Param("clusterId") clusterId: string,
    @Body() dto: SetClusterRepresentativeDto
  ) {
    return ok(await this.adminFeedClusterService.setRepresentative(clusterId, dto.feed_item_id, req.user.id));
  }

  @Post("feed/clusters/:clusterId/dissolve")
  async dissolveFeedCluster(@Req() req: { user: { id: string } }, @Param("clusterId") clusterId: string) {
    return ok(await this.adminFeedClusterService.dissolve(clusterId, req.user.id));
  }

  @Delete("feed/:id/cluster")
  async removeFeedFromCluster(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminFeedClusterService.removeMember(id, req.user.id));
  }

  @Post("feed")
  async createFeed(@Req() req: { user: { id: string } }, @Body() dto: CreateAdminFeedDto) {
    return ok(await this.adminFeedService.create(dto, req.user.id));
  }

  @Patch("feed/:id")
  async updateFeed(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAdminFeedDto
  ) {
    return ok(await this.adminFeedService.update(id, dto, req.user.id));
  }

  @Post("feed/:id/pin")
  async pinFeed(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminFeedService.pin(id, req.user.id));
  }

  @Post("feed/:id/hide")
  async hideFeed(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminFeedService.hide(id, req.user.id));
  }

  @Delete("feed/:id")
  async deleteFeed(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminFeedService.delete(id, req.user.id));
  }

  @Get("sources")
  async sources(@Query() query: AdminPaginationDto) {
    return ok(await this.adminSourceService.list(query));
  }

  @Patch("sources/:id")
  async updateSource(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateSourceDto
  ) {
    return ok(await this.adminSourceService.update(id, dto, req.user.id));
  }

  @Post("sources/:id/retry")
  async retrySource(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminSourceService.retry(id, req.user.id));
  }

  @Get("sources/:id/logs")
  async sourceLogs(@Param("id") id: string) {
    return ok(await this.adminSourceService.logs(id));
  }

  @Post("feed/:id/regenerate-ai")
  async regenerateAi(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminFeedService.regenerateAi(id, req.user.id));
  }

  @Get("prompts")
  async prompts(@Query() query: PromptQueryDto) {
    return ok({ items: await this.adminPromptService.list(query.prompt_key) });
  }

  @Post("prompts")
  async createPrompt(@Req() req: { user: { id: string } }, @Body() dto: CreatePromptDto) {
    return ok(await this.adminPromptService.create(dto, req.user.id));
  }

  @Patch("prompts/:id")
  async updatePrompt(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdatePromptDto
  ) {
    return ok(await this.adminPromptService.update(id, dto.content, req.user.id));
  }

  @Patch("prompts/:id/activate")
  async activatePrompt(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminPromptService.activate(id, req.user.id));
  }

  @Patch("prompts/:id/archive")
  async archivePrompt(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminPromptService.archive(id, req.user.id));
  }

  @Post("prompts/:id/test")
  async testPrompt(@Param("id") id: string, @Body() dto: TestPromptDto) {
    return ok(await this.adminPromptService.test(id, dto.variables));
  }

  @Get("ai-monitor")
  async aiMonitor() {
    return ok(await this.adminAiMonitorService.getStats());
  }

  @Get("narratives")
  async narratives() {
    return ok(await this.adminNarrativeService.list());
  }

  @Post("narratives")
  async createNarrative(@Req() req: { user: { id: string } }, @Body() dto: CreateAdminNarrativeDto) {
    return ok(await this.adminNarrativeService.create(dto, req.user.id));
  }

  @Patch("narratives/:id")
  async updateNarrative(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAdminNarrativeDto
  ) {
    return ok(await this.adminNarrativeService.update(id, dto, req.user.id));
  }

  @Post("narratives/:id/merge")
  async mergeNarrative(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: MergeAdminNarrativeDto
  ) {
    return ok(await this.adminNarrativeService.merge(id, dto, req.user.id));
  }

  @Get("narratives/:id/feeds")
  async narrativeFeeds(@Param("id") id: string) {
    return ok(await this.adminNarrativeService.relatedFeeds(id));
  }

  @Post("narratives/:id/regenerate-ai")
  async regenerateNarrativeAi(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminNarrativeService.regenerateAi(id, req.user.id));
  }

  @Get("tokens")
  async tokens(@Query() query: AdminPaginationDto) {
    return ok(await this.adminTokenService.list(query));
  }

  @Patch("tokens/:id")
  async updateToken(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAdminTokenDto
  ) {
    return ok(await this.adminTokenService.update(id, dto, req.user.id));
  }

  @Post("tokens/:id/refresh")
  async refreshToken(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminTokenService.refresh(id, req.user.id));
  }

  @Get("kols")
  async kols(@Query() query: AdminPaginationDto) {
    return ok(await this.adminKolService.list(query));
  }

  @Post("kols")
  async createKol(@Req() req: { user: { id: string } }, @Body() dto: CreateAdminKolDto) {
    return ok(await this.adminKolService.create(dto, req.user.id));
  }

  @Patch("kols/:id")
  async updateKol(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAdminKolDto
  ) {
    return ok(await this.adminKolService.update(id, dto, req.user.id));
  }

  @Get("logs")
  async logs(@Query() query: AdminLogsQueryDto) {
    return ok(await this.adminLogsService.list(query));
  }

  @Get("push")
  async pushMessages() {
    return ok(await this.pushService.adminList());
  }

  @Post("push/send")
  async sendPush(@Req() req: { user: { id: string } }, @Body() dto: AdminSendPushDto) {
    const result = await this.pushService.createAndSend({
      userId: dto.user_id,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      detailUrl: dto.detail_url,
      relatedFeedItemId: dto.related_feed_item_id
    });
    await this.audit.log({
      adminUserId: req.user.id,
      action: "push.send",
      entityType: "push_message",
      entityId: result.id,
      after: result
    });
    return ok(result);
  }

  @Get("config")
  async config() {
    return ok({ items: await this.systemConfig.listForAdmin() });
  }

  @Get("insights")
  async insights() {
    return ok(await this.adminInsightService.list());
  }

  @Get("insights/:id")
  async insightDetail(@Param("id") id: string) {
    return ok(await this.adminInsightService.getById(id));
  }

  @Post("insights/:id/resynthesize")
  async resynthesizeInsight(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminInsightService.resynthesize(id, req.user.id));
  }

  @Patch("config")
  async patchConfig(@Req() req: { user: { id: string } }, @Body() dto: PatchAdminConfigDto) {
    const before = this.systemConfig.snapshot;
    await this.systemConfig.update(dto.key, dto.value, req.user.id);
    await this.audit.log({
      adminUserId: req.user.id,
      action: "system_config.update",
      entityType: "system_setting",
      entityId: dto.key,
      before: { [dto.key]: (before as Record<string, unknown>)[dto.key] },
      after: { [dto.key]: dto.value }
    });
    return ok({ items: await this.systemConfig.listForAdmin() });
  }
}
