import { describe, expect, it } from "vitest";
import { compareCompatibilityDimensions } from "../src/index.js";

describe("compatibility comparison", () => {
  it("preserves dimensions rather than manufacturing one percentage", () => {
    const result = compareCompatibilityDimensions([
      { calculation: "life-path", firstValue: 7, secondValue: 7 },
      { calculation: "expression", firstValue: 8, secondValue: 6 },
    ]);
    expect(result.dimensions[0]?.shared).toBe(true);
    expect(result.dimensions[1]?.absoluteDifference).toBe(2);
    expect(result.singlePercentageProvided).toBe(false);
  });
});
