import { ExecutionContext } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { AppHttpException } from "./app-http.exception";
import { GlobalRateLimitGuard } from "./global-rate-limit.guard";

function createContext(path: string, ip = "1.2.3.4"): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method: "GET", url: path, ip, headers: {} })
    })
  } as unknown as ExecutionContext;
}

describe("GlobalRateLimitGuard", () => {
  it("skips health checks", () => {
    const guard = new GlobalRateLimitGuard();
    expect(guard.canActivate(createContext("/api/health"))).toBe(true);
  });

  it("skips public read endpoints", () => {
    const guard = new GlobalRateLimitGuard();
    expect(guard.canActivate(createContext("/api/feed?tab=for_you"))).toBe(true);
    expect(guard.canActivate(createContext("/api/trending"))).toBe(true);
  });

  it("rate limits repeated requests", () => {
    const guard = new GlobalRateLimitGuard();
    const ctx = createContext("/api/ai/search", "9.9.9.9");
    for (let i = 0; i < 180; i += 1) {
      guard.canActivate(ctx);
    }
    expect(() => guard.canActivate(ctx)).toThrow(AppHttpException);
  });
});
