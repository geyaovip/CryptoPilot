import { describe, expect, it } from "vitest";
import { BackgroundJobsService } from "./background-jobs.service";

function serviceWith(value?: string) {
  return new BackgroundJobsService({ get: () => value } as never);
}

describe("BackgroundJobsService", () => {
  it("is disabled by default", () => {
    expect(serviceWith().enabled).toBe(false);
  });

  it("is enabled only when explicitly configured", () => {
    expect(serviceWith("true").enabled).toBe(true);
    expect(serviceWith("false").enabled).toBe(false);
  });
});
