import { describe, expect, it } from "vitest";
import { calculateHeatScore, calculateRecencyScore, calculateTokenMoveScore } from "./heat-score";

describe("heat score", () => {
  it("scores recent content highest", () => {
    const now = new Date("2026-05-22T10:00:00.000Z");

    expect(calculateRecencyScore(new Date("2026-05-22T09:30:00.000Z"), now)).toBe(100);
    expect(calculateRecencyScore(new Date("2026-05-19T09:00:00.000Z"), now)).toBe(10);
  });

  it("scores token moves by absolute 24h change", () => {
    expect(calculateTokenMoveScore([11])).toBe(100);
    expect(calculateTokenMoveScore([-6])).toBe(70);
    expect(calculateTokenMoveScore([3])).toBe(40);
  });

  it("combines recency source weight and token move", () => {
    const score = calculateHeatScore({
      publishTime: new Date("2026-05-22T09:30:00.000Z"),
      sourceWeight: 50,
      tokenMoves: [10],
      now: new Date("2026-05-22T10:00:00.000Z")
    });

    expect(score).toBe(85);
  });
});
