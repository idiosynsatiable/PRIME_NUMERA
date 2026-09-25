import { describe, expect, it } from "vitest";
import { isVowel } from "../src/index.js";

describe("Y vowel policy", () => {
  it("never silently decides Y when an explicit policy is supplied", () => {
    expect(isVowel("Y", { y: "always-vowel" })).toBe(true);
    expect(isVowel("Y", { y: "always-consonant" })).toBe(false);
  });

  it("supports a deterministic contextual policy", () => {
    expect(isVowel("Y", { y: "contextual" }, { previous: "R", next: "N" })).toBe(true);
    expect(isVowel("Y", { y: "contextual" }, { previous: "A", next: "N" })).toBe(false);
  });
});
