import { describe, expect, it } from "vitest";
import {
  CHALDEAN,
  PYTHAGOREAN,
  calculateExpression,
  normalizeLatinName,
  reduceNumber,
} from "../src/index.js";

describe("normalization edge cases", () => {
  it("preserves supported Latin letters through diacritics and structural punctuation", () => {
    const result = normalizeLatinName("Élodie O'Connor-Sáenz");
    expect(result.normalized).toBe("ELODIEOCONNORSAENZ");
    expect(result.ignoredCharacters).toEqual([]);
  });

  it("reports unsupported non-Latin scripts instead of silently transliterating them", () => {
    const result = normalizeLatinName("李雷");
    expect(result.normalized).toBe("");
    expect(result.ignoredCharacters).toEqual(["李", "雷"]);
    expect(() => calculateExpression("李雷", PYTHAGOREAN)).toThrow(RangeError);
  });

  it("handles long deterministic input without truncating arithmetic", () => {
    const input = "A".repeat(10_000);
    const result = calculateExpression(input, PYTHAGOREAN);
    expect(result.normalizedInput.length).toBe(10_000);
    expect(result.sum).toBe(10_000);
    expect(result.value).toBe(1);
  });
});

describe("reduction invariants", () => {
  it("always terminates at a single digit or configured master number", () => {
    for (let value = 0; value <= 5_000; value += 1) {
      const result = reduceNumber(value, { preserveMasterNumbers: [11, 22, 33] });
      expect(
        result.value <= 9 || result.value === 11 || result.value === 22 || result.value === 33,
      ).toBe(true);
    }
  });

  it("never creates a master number in a policy that preserves none", () => {
    for (let value = 0; value <= 500; value += 1) {
      expect(reduceNumber(value, { preserveMasterNumbers: [] }).value).toBeLessThanOrEqual(9);
    }
  });
});

describe("system mapping invariants", () => {
  it("maps every supported Latin letter exactly once per system", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const system of [PYTHAGOREAN, CHALDEAN]) {
      expect(Object.keys(system.mappings).sort().join("")).toBe(alphabet);
    }
  });

  it("keeps Chaldean value 9 intentionally unassigned", () => {
    expect(Object.values(CHALDEAN.mappings)).not.toContain(9);
  });
});
