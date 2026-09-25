import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, analyzeNameFrequencies } from "../src/index.js";

describe("name frequencies", () => {
  it("derives missing values hidden-passion ties and subconscious count", () => {
    const result = analyzeNameFrequencies("AAAA", PYTHAGOREAN);
    expect(result.hiddenPassionValues).toEqual([1]);
    expect(result.missingValues).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.subconsciousSelfCount).toBe(1);
  });
});
