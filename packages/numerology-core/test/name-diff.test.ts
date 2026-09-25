import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, compareNameValues } from "../src/index.js";

describe("Name Lab value diff", () => {
  it("shows exactly which letters changed and their mapped contribution", () => {
    const result = compareNameValues("Anna", "Ana", PYTHAGOREAN);
    expect(result.deltas).toEqual([
      { letter: "N", beforeCount: 2, afterCount: 1, countDelta: -1, valuePerLetter: 5, valueDelta: -5 },
    ]);
    expect(result.totalValueDelta).toBe(-5);
  });
});
