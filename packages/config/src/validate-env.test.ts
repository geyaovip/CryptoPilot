import { describe, expect, it } from "vitest";
import { validateEnv } from "./validate-env";

describe("validateEnv", () => {
  it("passes with required vars", () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: "postgresql://localhost/db",
        REDIS_URL: "redis://localhost:6379",
        AUTH_SECRET: "change-me-for-local-development"
      })
    ).not.toThrow();
  });

  it("fails when AUTH_SECRET is too short", () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: "postgresql://localhost/db",
        REDIS_URL: "redis://localhost:6379",
        AUTH_SECRET: "short"
      })
    ).toThrow(/AUTH_SECRET/);
  });
});
