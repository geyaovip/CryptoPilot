import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { AppHttpException } from "./app-http.exception";

const buckets = new Map<string, { count: number; resetAt: number }>();
const PUBLIC_READ_PATHS = [
  "/api/feed",
  "/api/trending",
  "/api/narratives",
  "/api/tokens",
  "/api/kols",
  "/api/insights"
];

@Injectable()
export class GlobalRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method === "OPTIONS") return true;

    const path = request.url ?? "";
    if (path.includes("/health")) return true;
    if (request.method === "GET" && PUBLIC_READ_PATHS.some((publicPath) => path.startsWith(publicPath))) {
      return true;
    }

    const ip = String(request.headers["x-forwarded-for"] ?? request.ip ?? "unknown").split(",")[0].trim();
    const key = `api:${ip}`;
    const now = Date.now();
    const windowMs = 60_000;
    const limit = 180;
    const bucket = buckets.get(key) ?? { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > limit) {
      throw new AppHttpException("RATE_LIMITED", "请求过于频繁，请稍后再试", 429);
    }
    return true;
  }
}
