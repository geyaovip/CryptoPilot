import { Controller, Get, Inject } from "@nestjs/common";
import { ok } from "../common/api-response";
import { SystemConfigService } from "./system-config.service";

@Controller("system")
export class SystemPublicController {
  constructor(@Inject(SystemConfigService) private readonly systemConfig: SystemConfigService) {}

  @Get("public-config")
  getPublicConfig() {
    const { feature_flags } = this.systemConfig.snapshot;
    return ok({ feature_flags });
  }
}
