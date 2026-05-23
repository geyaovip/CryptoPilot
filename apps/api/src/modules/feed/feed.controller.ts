import { Controller, Get, Headers, Inject, Param, Query } from "@nestjs/common";
import { ok } from "../common/api-response";
import { FeedQueryDto } from "./dto/feed-query.dto";
import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(@Inject(FeedService) private readonly feedService: FeedService) {}

  @Get("feed")
  async list(@Query() query: FeedQueryDto, @Headers("x-user-id") userId?: string) {
    return ok(await this.feedService.list(query, userId));
  }

  @Get("feed/:id")
  async getById(@Param("id") id: string) {
    return ok(await this.feedService.getById(id));
  }

  @Get("trending")
  async trending() {
    return ok(await this.feedService.trending());
  }
}
