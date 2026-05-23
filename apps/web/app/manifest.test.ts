import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("PWA manifest", () => {
  it("exposes CryptoPilot install metadata", () => {
    const data = manifest();
    expect(data.name).toBe("CryptoPilot");
    expect(data.display).toBe("standalone");
    expect(data.icons?.length).toBeGreaterThan(0);
  });
});
