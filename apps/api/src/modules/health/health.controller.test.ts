import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  it("returns a typed health response", async () => {
    const healthService = {
      check: async () => ({ status: "ok", postgres: "ok", redis: "ok" })
    } as HealthService;
    const controller = new HealthController(healthService);
    const response = await controller.getHealth();

    expect(response.data).toEqual({
      status: "ok",
      postgres: "ok",
      redis: "ok"
    });
    expect(response.request_id).toBeTruthy();
  });
});
