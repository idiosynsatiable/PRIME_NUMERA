import { describe, expect, it } from "vitest";
import { CHALDEAN, PYTHAGOREAN, analyzeNameFrequencies } from "../src/index.js";

describe("name frequencies", () => {
  it("derives Pythagorean Karmic Lessons and Subconscious Self from one-through-nine coverage", () => {
    const result = analyzeNameFrequencies("AAAA", PYTHAGOREAN);
    expect(result.hiddenPassionValues).toEqual([1]);
    expect(result.missingValues).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.karmicLessonValues).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.subconsciousSelfValue).toBe(1);
    expect(result.representedValueCount).toBe(1);
  });

  it("does not relabel Chaldean missing values as Pythagorean Karmic Lessons", () => {
    const result = analyzeNameFrequencies("AAAA", CHALDEAN);
    expect(result.missingValues.length).toBeGreaterThan(0);
    expect(result.karmicLessonValues).toBeNull();
    expect(result.subconsciousSelfValue).toBeNull();
  });
});
