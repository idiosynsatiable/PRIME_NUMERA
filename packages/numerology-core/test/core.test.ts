import { describe, expect, it } from "vitest";
import {
  CHALDEAN,
  PYTHAGOREAN,
  calculateExpression,
  normalizeLatinName,
  reduceNumber,
} from "../src/index.js";

describe("reduceNumber", () => {
  it("records every reduction step", () => {
    expect(reduceNumber(29)).toEqual({
      value: 11,
      steps: [
        { input: 29, digits: [2, 9], output: 11, preservedAsMaster: false },
        { input: 11, digits: [1, 1], output: 11, preservedAsMaster: true },
      ],
    });
  });

  it("can reduce a master number when policy requires it", () => {
    expect(reduceNumber(11, { preserveMasterNumbers: [] }).value).toBe(2);
  });
});

describe("name normalization", () => {
  it("normalizes case, spaces, punctuation, and Latin diacritics transparently", () => {
    expect(normalizeLatinName("  José O'Neil-Smith  ")).toEqual({
      original: "  José O'Neil-Smith  ",
      normalized: "JOSEONEILSMITH",
      ignoredCharacters: [],
    });
  });
});

describe("system isolation", () => {
  it("produces auditable Pythagorean mappings", () => {
    const result = calculateExpression("ABC", PYTHAGOREAN);
    expect(result.mappings.map(({ value }) => value)).toEqual([1, 2, 3]);
    expect(result.sum).toBe(6);
    expect(result.value).toBe(6);
  });

  it("uses Chaldean mappings independently", () => {
    const result = calculateExpression("ABC", CHALDEAN);
    expect(result.mappings.map(({ value }) => value)).toEqual([1, 2, 3]);
    expect(CHALDEAN.mappings.F).toBe(8);
    expect(PYTHAGOREAN.mappings.F).toBe(6);
  });

  it("keeps a Chaldean compound total visible while reducing it without Pythagorean master preservation", () => {
    const result = calculateExpression("AFB", CHALDEAN);
    expect(result.sum).toBe(11);
    expect(result.value).toBe(2);
    expect(CHALDEAN.masterNumbers).toEqual([]);
  });

  it("exposes system methodology metadata", () => {
    expect(PYTHAGOREAN.normalizationPolicy.transliteration).toBe("none");
    expect(PYTHAGOREAN.supportedCalculations).toContain("planes-of-expression");
    expect(CHALDEAN.supportedCalculations).not.toContain("planes-of-expression");
  });

  it("rejects an empty supported name instead of inventing a result", () => {
    expect(() => calculateExpression("---", PYTHAGOREAN)).toThrow(RangeError);
  });
});
