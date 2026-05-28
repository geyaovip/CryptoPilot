import { describe, expect, it } from "vitest";
import { formatShortUid } from "./index";

describe("formatShortUid", () => {
  it("formats UUID as stable 8-character alphanumeric UID", () => {
    const uid = formatShortUid("123e4567-e89b-12d3-a456-426614174000");

    expect(uid).toMatch(/^CP-[0-9A-Z]{8}$/);
    expect(formatShortUid("123e4567-e89b-12d3-a456-426614174000")).toBe(uid);
  });
});
