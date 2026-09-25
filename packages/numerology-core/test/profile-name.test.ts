import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, calculatePersonality, calculateSoulUrge } from "../src/index.js";

describe("name profile calculations", () => {
  it("separates vowels for Soul Urge with the declared Y policy", () => {
    const result = calculateSoulUrge("Ray", PYTHAGOREAN, { y: "always-consonant" });
    expect(result.selectedLetters.map((letter) => letter.character)).toEqual(["A"]);
    expect(result.vowelPolicy.y).toBe("always-consonant");
  });

  it("separates consonants for Personality", () => {
    const result = calculatePersonality("Ray", PYTHAGOREAN, { y: "always-consonant" });
    expect(result.selectedLetters.map((letter) => letter.character)).toEqual(["R", "Y"]);
  });

  it("changes the auditable selection when the Y policy changes", () => {
    const vowelY = calculateSoulUrge("Ray", PYTHAGOREAN, { y: "always-vowel" });
    const consonantY = calculateSoulUrge("Ray", PYTHAGOREAN, { y: "always-consonant" });
    expect(vowelY.selectedLetters.map((letter) => letter.character)).toEqual(["A", "Y"]);
    expect(consonantY.selectedLetters.map((letter) => letter.character)).toEqual(["A"]);
  });
});
