import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

type HealthStatus = {
  status: "ok";
  postgres: "ok" | "error";
  redis: "ok" | "error";
};

@Injectable()
export class HealthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService
  ) {}

  async check(): Promise<HealthStatus> {
    const postgres = await this.checkPostgres();
    const redis = await this.redis.ping();

    return {
      status: "ok",
      postgres,
      redis
    };
  }

  private async checkPostgres(): Promise<"ok" | "error"> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return "ok";
    } catch (error) {
      console.error("PostgreSQL health check failed", { error });
      return "error";
    }
  }
}
