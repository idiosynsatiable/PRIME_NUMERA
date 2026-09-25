import { describe, expect, it } from "vitest";
import { analyzeDeterministicPatterns } from "../src/index.js";

describe("collision pattern primitives", () => {
  it("detects repeated calculated values without claiming statistical rarity", () => {
    const analysis = analyzeDeterministicPatterns([
      { id: "a", calculation: "expression", label: "Expression", value: 8, system: "pythagorean", derivationRef: "a" },
      { id: "b", calculation: "birthday", label: "Birthday", value: 8, system: "pythagorean", derivationRef: "b" },
      { id: "c", calculation: "life-path", label: "Life Path", value: 7, system: "pythagorean", derivationRef: "c" },
    ]);
    expect(analysis.repetitions).toEqual([{ value: 8, nodeIds: ["a", "b"], count: 2 }]);
    expect(analysis.rarityClaimed).toBe(false);
  });
});
