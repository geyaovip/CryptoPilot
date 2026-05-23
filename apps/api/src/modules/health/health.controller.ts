import { Controller, Get, Inject } from "@nestjs/common";
import { ok } from "../common/api-response";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return ok(await this.healthService.check());
  }
}
