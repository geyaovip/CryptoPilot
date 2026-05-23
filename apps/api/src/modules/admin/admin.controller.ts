import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { AuditService } from "../common/audit.service";
import { ok } from "../common/api-response";
import { SystemConfigService } from "../system/system-config.service";
import { AdminLogsService } from "./admin-logs.service";
import { AdminAiMonitorService } from "./admin-ai-monitor.service";
import { AdminFeedService } from "./admin-feed.service";
import { AdminKolService } from "./admin-kol.service";
import { AdminNarrativeService } from "./admin-narrative.service";
import { AdminPromptService } from "./admin-prompt.service";
import { AdminSourceService } from "./admin-source.service";
import { AdminTokenService } from "./admin-token.service";
import { CreateAdminKolDto, UpdateAdminKolDto } from "./dto/admin-kol.dto";
import { CreateAdminNarrativeDto, MergeAdminNarrativeDto, UpdateAdminNarrativeDto } from "./dto/admin-narrative.dto";
import { UpdateAdminTokenDto } from "./dto/admin-token.dto";
import { AdminFeedQueryDto, CreateAdminFeedDto, UpdateAdminFeedDto } from "./dto/admin-feed.dto";
import { CreatePromptDto, PromptQueryDto, TestPromptDto, UpdatePromptDto } from "./dto/admin-prompt.dto";
import { UpdateSourceDto } from "./dto/admin-source.dto";
import { PatchAdminConfigDto } from "./dto/admin-config.dto";
import { AdminLogsQueryDto } from "./dto/admin-logs-query.dto";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @Inject(AdminLogsService) private readonly adminLogsService: AdminLogsService,
    @Inject(SystemConfigService) private readonly systemConfig: SystemConfigService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(AdminFeedService) private readonly adminFeedService: AdminFeedService,
    @Inject(AdminSourceService) private readonly adminSourceService: AdminSourceService,
    @Inject(AdminPromptService) private readonly adminPromptService: AdminPromptService,
    @Inject(AdminAiMonitorService) private readonly adminAiMonitorService: AdminAiMonitorService,
    @Inject(AdminNarrativeService) private readonly adminNarrativeService: AdminNarrativeService,
    @Inject(AdminTokenService) private readonly adminTokenService: AdminTokenService,
    @Inject(AdminKolService) private readonly adminKolService: AdminKolService
  ) {}

  @Get("feed")
  async feed(@Query() query: AdminFeedQueryDto) {
    return ok(await this.adminFeedService.list(query));
  }

  @Post("feed")
  async createFeed(@Body() dto: CreateAdminFeedDto) {
    return ok(await this.adminFeedService.create(dto));
  }

  @Patch("feed/:id")
  async updateFeed(@Param("id") id: string, @Body() dto: UpdateAdminFeedDto) {
    return ok(await this.adminFeedService.update(id, dto));
  }

  @Post("feed/:id/pin")
  async pinFeed(@Param("id") id: string) {
    return ok(await this.adminFeedService.pin(id));
  }

  @Post("feed/:id/hide")
  async hideFeed(@Param("id") id: string) {
    return ok(await this.adminFeedService.hide(id));
  }

  @Delete("feed/:id")
  async deleteFeed(@Param("id") id: string) {
    return ok(await this.adminFeedService.delete(id));
  }

  @Get("sources")
  async sources() {
    return ok(await this.adminSourceService.list());
  }

  @Patch("sources/:id")
  async updateSource(@Param("id") id: string, @Body() dto: UpdateSourceDto) {
    return ok(await this.adminSourceService.update(id, dto));
  }

  @Post("sources/:id/retry")
  async retrySource(@Param("id") id: string) {
    return ok(await this.adminSourceService.retry(id));
  }

  @Get("sources/:id/logs")
  async sourceLogs(@Param("id") id: string) {
    return ok(await this.adminSourceService.logs(id));
  }

  @Post("feed/:id/regenerate-ai")
  async regenerateAi(@Param("id") id: string) {
    return ok(await this.adminFeedService.regenerateAi(id));
  }

  @Get("prompts")
  async prompts(@Query() query: PromptQueryDto) {
    return ok({ items: await this.adminPromptService.list(query.prompt_key) });
  }

  @Post("prompts")
  async createPrompt(@Body() dto: CreatePromptDto) {
    return ok(await this.adminPromptService.create(dto));
  }

  @Patch("prompts/:id")
  async updatePrompt(@Param("id") id: string, @Body() dto: UpdatePromptDto) {
    return ok(await this.adminPromptService.update(id, dto.content));
  }

  @Patch("prompts/:id/activate")
  async activatePrompt(@Param("id") id: string) {
    return ok(await this.adminPromptService.activate(id));
  }

  @Patch("prompts/:id/archive")
  async archivePrompt(@Param("id") id: string) {
    return ok(await this.adminPromptService.archive(id));
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
  async createNarrative(@Body() dto: CreateAdminNarrativeDto) {
    return ok(await this.adminNarrativeService.create(dto));
  }

  @Patch("narratives/:id")
  async updateNarrative(@Param("id") id: string, @Body() dto: UpdateAdminNarrativeDto) {
    return ok(await this.adminNarrativeService.update(id, dto));
  }

  @Post("narratives/:id/merge")
  async mergeNarrative(@Param("id") id: string, @Body() dto: MergeAdminNarrativeDto) {
    return ok(await this.adminNarrativeService.merge(id, dto));
  }

  @Get("narratives/:id/feeds")
  async narrativeFeeds(@Param("id") id: string) {
    return ok(await this.adminNarrativeService.relatedFeeds(id));
  }

  @Post("narratives/:id/regenerate-ai")
  async regenerateNarrativeAi(@Param("id") id: string) {
    return ok(await this.adminNarrativeService.regenerateAi(id));
  }

  @Get("tokens")
  async tokens() {
    return ok(await this.adminTokenService.list());
  }

  @Patch("tokens/:id")
  async updateToken(@Param("id") id: string, @Body() dto: UpdateAdminTokenDto) {
    return ok(await this.adminTokenService.update(id, dto));
  }

  @Post("tokens/:id/refresh")
  async refreshToken(@Param("id") id: string) {
    return ok(await this.adminTokenService.refresh(id));
  }

  @Get("kols")
  async kols() {
    return ok(await this.adminKolService.list());
  }

  @Post("kols")
  async createKol(@Body() dto: CreateAdminKolDto) {
    return ok(await this.adminKolService.create(dto));
  }

  @Patch("kols/:id")
  async updateKol(@Param("id") id: string, @Body() dto: UpdateAdminKolDto) {
    return ok(await this.adminKolService.update(id, dto));
  }

  @Get("logs")
  async logs(@Query() query: AdminLogsQueryDto) {
    return ok(await this.adminLogsService.list(query));
  }

  @Get("config")
  async config() {
    return ok({ items: await this.systemConfig.listForAdmin() });
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
