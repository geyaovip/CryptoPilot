import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const redisUrl = configService.get<string>("REDIS_URL") ?? "redis://localhost:6379";
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
  }

  async ping(): Promise<"ok" | "error"> {
    try {
      if (this.client.status === "wait") {
        await this.client.connect();
      }
      await this.client.ping();
      return "ok";
    } catch (error) {
      console.error("Redis health check failed", { error });
      return "error";
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.client.disconnect();
  }
}
