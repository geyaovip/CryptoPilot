import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { UserGuard } from "../auth/user.guard";
import { ok } from "../common/api-response";
import { CreateWatchlistDto } from "./dto/create-watchlist.dto";
import { UpdateWatchlistNotificationDto } from "./dto/update-watchlist-notification.dto";
import { WatchlistService } from "./watchlist.service";

@Controller("watchlist")
@UseGuards(UserGuard)
export class WatchlistController {
  constructor(@Inject(WatchlistService) private readonly watchlistService: WatchlistService) {}

  @Get()
  async list(@Req() req: { user: { id: string } }) {
    return ok(await this.watchlistService.list(req.user.id));
  }

  @Post()
  async create(@Req() req: { user: { id: string } }, @Body() dto: CreateWatchlistDto) {
    return ok(await this.watchlistService.create(req.user.id, dto.target_type, dto.target_id));
  }

  @Delete(":id")
  async delete(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.watchlistService.delete(req.user.id, id));
  }

  @Patch(":id/notification")
  async patchNotification(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateWatchlistNotificationDto
  ) {
    return ok(await this.watchlistService.updateNotification(req.user.id, id, dto.notifications_enabled));
  }
}
