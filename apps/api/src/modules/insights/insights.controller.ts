import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ok } from "../common/api-response";
import { InsightService } from "./insight.service";

@Controller()
export class InsightsController {
  constructor(@Inject(InsightService) private readonly insightService: InsightService) {}

  @Get("insights/:id")
  async getById(@Param("id") id: string) {
    return ok(await this.insightService.getById(id));
  }
}
