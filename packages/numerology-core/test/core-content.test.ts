import { describe, expect, it } from "vitest";
import { CORE_INTERPRETATIONS, validateInterpretationCatalog, queryInterpretations, interpretRepetitions, describeCompatibilityContext } from "../src/index.js";

describe("labeled interpretation content", () => {
  it("covers ordinary and preserved master values with explicitly modern content", () => {
    expect(() => validateInterpretationCatalog(CORE_INTERPRETATIONS)).not.toThrow();
    expect(CORE_INTERPRETATIONS.records.map((record) => record.applicability.values?.[0])).toEqual([1,2,3,4,5,6,7,8,9,11,22,33]);
    expect(queryInterpretations(CORE_INTERPRETATIONS, { system: "pythagorean", calculation: "life-path", value: 9, locale: "en-US", ageMode: "standard" })).toHaveLength(1);
    expect(queryInterpretations(CORE_INTERPRETATIONS, { system: "chaldean", calculation: "expression", value: 9, locale: "en-US", ageMode: "standard" })).toHaveLength(0);
  });
  it("does not attach rarity or a compatibility score", () => {
    expect(interpretRepetitions({ kind: "interpretive-analysis-input", repetitions: [{ value: 4, nodeIds: ["a","b"], count: 2 }], rarityClaimed: false })[0]?.rarityClaimed).toBe(false);
    const context = describeCompatibilityContext({ mode: "friendship", system: "pythagorean", coreDimensions: [], cycleOverlap: [], singlePercentageProvided: false });
    expect(context.singlePercentageProvided).toBe(false);
    expect(context.category).toBe("modern");
  });
});
