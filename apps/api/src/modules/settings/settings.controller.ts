import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { UserGuard } from "../auth/user.guard";
import { ok } from "../common/api-response";
import { UpdateNotificationSettingsDto } from "./dto/notification-settings.dto";
import { SettingsService } from "./settings.service";

@Controller("settings")
@UseGuards(UserGuard)
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

  @Get("notifications")
  async notifications(@Req() req: { user: { id: string } }) {
    return ok(await this.settings.getNotifications(req.user.id));
  }

  @Patch("notifications")
  async updateNotifications(@Req() req: { user: { id: string } }, @Body() dto: UpdateNotificationSettingsDto) {
    return ok(await this.settings.updateNotifications(req.user.id, dto));
  }
}
