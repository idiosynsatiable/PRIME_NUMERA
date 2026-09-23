import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, calculateNameStructure } from "../src/index.js";

describe("name structure", () => {
  it("exposes cornerstone capstone and first vowel", () => {
    const result = calculateNameStructure("Dallas", PYTHAGOREAN, { y: "always-consonant" });
    expect(result.cornerstone).toBe("D");
    expect(result.capstone).toBe("S");
    expect(result.firstVowel).toBe("A");
    expect(result.cornerstoneValue).toBe(4);
    expect(result.capstoneValue).toBe(1);
  });
});
