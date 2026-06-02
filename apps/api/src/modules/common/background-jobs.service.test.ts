import { describe, expect, it } from "vitest";
import { BackgroundJobsService } from "./background-jobs.service";

function serviceWith(value?: string) {
  return new BackgroundJobsService({ get: () => value } as never);
}

function serviceWithEnv(env: Record<string, string | undefined>) {
  return new BackgroundJobsService({ get: (key: string) => env[key] } as never);
}

describe("BackgroundJobsService", () => {
  it("is disabled by default", () => {
    expect(serviceWith().enabled).toBe(false);
  });

  it("is enabled only when explicitly configured", () => {
    expect(serviceWith("true").enabled).toBe(true);
    expect(serviceWith("false").enabled).toBe(false);
  });

  it("allows market jobs to be enabled independently", () => {
    expect(serviceWithEnv({ ENABLE_BACKGROUND_JOBS: "false", ENABLE_MARKET_JOBS: "true" }).marketEnabled).toBe(true);
    expect(serviceWithEnv({ ENABLE_BACKGROUND_JOBS: "false", ENABLE_MARKET_JOBS: "false" }).marketEnabled).toBe(false);
    expect(serviceWithEnv({ ENABLE_BACKGROUND_JOBS: "true" }).marketEnabled).toBe(true);
  });
});
