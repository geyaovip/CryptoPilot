import { Controller, Get, Headers, Inject, Param, Query } from "@nestjs/common";
import { ok } from "../common/api-response";
import { NarrativeListQueryDto } from "./dto/narrative-list-query.dto";
import { NarrativesService } from "./narratives.service";

@Controller("narratives")
export class NarrativesController {
  constructor(@Inject(NarrativesService) private readonly narrativesService: NarrativesService) {}

  @Get()
  async list(@Query() query: NarrativeListQueryDto, @Headers("x-user-id") userId?: string) {
    return ok(await this.narrativesService.list(query, userId));
  }

  @Get(":slug")
  async getBySlug(@Param("slug") slug: string, @Headers("x-user-id") userId?: string) {
    return ok(await this.narrativesService.getBySlug(slug, userId));
  }
}
