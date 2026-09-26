import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, calculateFirstNameStructure } from "../src/index.js";

describe("first-name structure", () => {
  it("exposes cornerstone capstone and first vowel", () => {
    const result = calculateFirstNameStructure("Dallas", PYTHAGOREAN, { y: "always-consonant" });
    expect(result.cornerstone).toBe("D");
    expect(result.capstone).toBe("S");
    expect(result.firstVowel).toBe("A");
    expect(result.cornerstoneValue).toBe(4);
    expect(result.capstoneValue).toBe(1);
  });

  it("rejects a full-name input instead of silently using the last surname letter as Capstone", () => {
    expect(() =>
      calculateFirstNameStructure("Dallas Cullen Whitten", PYTHAGOREAN, { y: "always-consonant" }),
    ).toThrow(RangeError);
  });
});
