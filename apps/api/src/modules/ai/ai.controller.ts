import { Body, Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response";
import { UserGuard } from "../auth/user.guard";
import { AiRateLimitGuard } from "./rate-limit.guard";
import { AiSearchService } from "./ai-search.service";
import { AiSearchDto } from "./dto/ai-search.dto";

@Controller("ai")
export class AiController {
  constructor(@Inject(AiSearchService) private readonly aiSearchService: AiSearchService) {}

  @Post("search")
  @UseGuards(UserGuard, AiRateLimitGuard)
  async search(@Req() req: { user: { id: string } }, @Body() dto: AiSearchDto) {
    return ok(await this.aiSearchService.search(req.user.id, dto.query, dto.insight_id));
  }
}
