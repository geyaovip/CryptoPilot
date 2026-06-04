import { Body, Controller, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { ok } from "../common/api-response";
import { AuditService } from "../common/audit.service";
import { AdminSendPushDto } from "../push/dto/admin-send-push.dto";
import { PushService } from "../push/push.service";

@Controller("admin/push")
@UseGuards(AdminGuard)
export class AdminPushController {
  constructor(
    @Inject(PushService) private readonly pushService: PushService,
    @Inject(AuditService) private readonly audit: AuditService
  ) {}

  @Get()
  async pushMessages() {
    return ok(await this.pushService.adminList());
  }

  @Post("send")
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
}
