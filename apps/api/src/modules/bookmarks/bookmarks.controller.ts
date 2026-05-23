import { Body, Controller, Delete, Get, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response";
import { UserGuard } from "../auth/user.guard";
import { BookmarksService } from "./bookmarks.service";
import { CreateBookmarkDto } from "./dto/create-bookmark.dto";

@Controller("bookmarks")
@UseGuards(UserGuard)
export class BookmarksController {
  constructor(@Inject(BookmarksService) private readonly bookmarksService: BookmarksService) {}

  @Get()
  async list(@Req() req: { user: { id: string } }) {
    return ok(await this.bookmarksService.list(req.user.id));
  }

  @Post()
  async create(@Req() req: { user: { id: string } }, @Body() dto: CreateBookmarkDto) {
    return ok(await this.bookmarksService.create(req.user.id, dto.feed_item_id));
  }

  @Delete(":id")
  async delete(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return ok(await this.bookmarksService.delete(req.user.id, id));
  }
}
