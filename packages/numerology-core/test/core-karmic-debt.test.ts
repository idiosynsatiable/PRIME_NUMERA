import { describe, expect, it } from "vitest";
import {
  PYTHAGOREAN,
  calculateBirthdayNumber,
  calculateExpressionComponents,
  calculateLifePath,
  detectCoreKarmicDebt,
} from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("core Karmic Debt stage detection", () => {
  it("detects a published-style 16/7 Expression compound without scanning unrelated values", () => {
    const expression = calculateExpressionComponents(
      "HATE",
      PYTHAGOREAN,
      "reduce-components",
    );
    expect(detectCoreKarmicDebt({ expression })).toEqual([
      { value: 16, source: "expression.component[0].compound" },
    ]);
  });

  it("detects a 13/4 Life Path from the final component aggregate", () => {
    const lifePath = calculateLifePath(
      { year: 1950, month: 1, day: 6 },
      "reduce-components",
      policy,
    );
    expect(lifePath.aggregate).toBe(13);
    expect(lifePath.value).toBe(4);
    expect(detectCoreKarmicDebt({ lifePath })).toEqual([
      { value: 13, source: "life-path.final-compound" },
    ]);
  });

  it("detects a Karmic Debt Birth Day from the raw calendar day", () => {
    const birthday = calculateBirthdayNumber(
      { year: 2000, month: 5, day: 14 },
      policy,
    );
    expect(detectCoreKarmicDebt({ birthday })).toEqual([
      { value: 14, source: "birthday.day" },
    ]);
  });

  it("rejects a whole-name shortcut for sourced core Karmic Debt detection", () => {
    const expression = calculateExpressionComponents(
      "HATE",
      PYTHAGOREAN,
      "whole-name",
    );
    expect(() => detectCoreKarmicDebt({ expression })).toThrow(RangeError);
  });
});
