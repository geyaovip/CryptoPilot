import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AppHttpException } from "../common/app-http.exception";

const buckets = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { id: string }; headers: Record<string, string> }>();
    const userId = request.user?.id ?? String(request.headers["x-user-id"] ?? "guest");
    const key = `ai:${userId}`;
    const now = Date.now();
    const windowMs = 60_000;
    const limit = 12;
    const bucket = buckets.get(key) ?? { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > limit) {
      throw new AppHttpException("RATE_LIMITED", "AI 搜索请求过于频繁，请稍后再试", 429);
    }
    return true;
  }
}
