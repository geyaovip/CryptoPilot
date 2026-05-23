import { describe, expect, it } from "vitest";
import { createMagicLinkRawToken, hashMagicLinkToken } from "./magic-link.util";

describe("magic-link.util", () => {
  it("hashes token deterministically", () => {
    const raw = "test-token-value-12345";
    expect(hashMagicLinkToken(raw)).toBe(hashMagicLinkToken(raw));
    expect(hashMagicLinkToken(raw)).not.toBe(raw);
  });

  it("generates unique raw tokens", () => {
    const a = createMagicLinkRawToken();
    const b = createMagicLinkRawToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });
});
