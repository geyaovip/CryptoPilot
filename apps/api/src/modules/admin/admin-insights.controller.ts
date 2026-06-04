import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { ok } from "../common/api-response";
import { AdminInsightService } from "./admin-insight.service";
import { AdminInsightQueryDto } from "./dto/admin-insight.dto";

@Controller("admin/insights")
@UseGuards(AdminGuard)
export class AdminInsightsController {
  constructor(@Inject(AdminInsightService) private readonly adminInsightService: AdminInsightService) {}

  @Get()
  async insights(@Query() query: AdminInsightQueryDto) {
    return ok(await this.adminInsightService.list(query));
  }

  @Get(":id")
  async insightDetail(@Param("id") id: string) {
    return ok(await this.adminInsightService.getById(id));
  }

  @Post(":id/resynthesize")
  async resynthesizeInsight(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.adminInsightService.resynthesize(id, req.user.id));
  }

  @Patch(":id")
  async updateInsightTitle(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body("aiInsight") aiInsight: string
  ) {
    return ok(await this.adminInsightService.updateTitle(id, aiInsight, req.user.id));
  }
}
