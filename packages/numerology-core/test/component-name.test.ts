import { describe, expect, it } from "vitest";
import {
  PYTHAGOREAN,
  calculateExpressionComponents,
  calculateSoulUrgeComponents,
} from "../src/index.js";

describe("component-aware name calculations", () => {
  it("preserves per-component reduction evidence", () => {
    const result = calculateExpressionComponents("AHT A", PYTHAGOREAN, "reduce-components");
    expect(result.components).toHaveLength(2);
    expect(result.components[0]?.sum).toBe(11);
    expect(result.components[0]?.reduction.value).toBe(11);
    expect(result.components[1]?.sum).toBe(1);
    expect(result.aggregate).toBe(12);
    expect(result.value).toBe(3);
  });

  it("can expose the alternate whole-name reduction strategy without mixing it silently", () => {
    const result = calculateExpressionComponents("AHT A", PYTHAGOREAN, "whole-name");
    expect(result.strategy).toBe("whole-name");
    expect(result.aggregate).toBe(12);
    expect(result.value).toBe(3);
  });

  it("keeps vowel policy explicit within each name component", () => {
    const result = calculateSoulUrgeComponents(
      "Ray Lynn",
      PYTHAGOREAN,
      { y: "always-consonant" },
      "reduce-components",
    );
    expect(result.vowelPolicy).toEqual({ y: "always-consonant" });
    expect(result.components[0]?.mappings.map(({ character }) => character)).toEqual(["A"]);
  });
});
