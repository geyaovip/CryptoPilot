import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BackgroundJobsService {
  constructor(private readonly config: ConfigService) {}

  get enabled(): boolean {
    return this.config.get<string>("ENABLE_BACKGROUND_JOBS") === "true";
  }
}
