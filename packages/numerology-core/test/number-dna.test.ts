import { describe, expect, it } from "vitest";
import { validateNumberDnaGraph } from "../src/index.js";

describe("Number DNA graph contract", () => {
  it("accepts renderer-independent calculation nodes", () => {
    expect(() =>
      validateNumberDnaGraph({
        nodes: [
          { id: "life", calculation: "life-path", label: "Life Path", value: 7, system: "pythagorean", derivationRef: "calc:life" },
          { id: "expression", calculation: "expression", label: "Expression", value: 8, system: "pythagorean", derivationRef: "calc:expression" },
        ],
        edges: [
          { id: "life-expression", source: "life", target: "expression", relationship: "bridge" },
        ],
      }),
    ).not.toThrow();
  });

  it("rejects edges that invent missing calculation nodes", () => {
    expect(() =>
      validateNumberDnaGraph({
        nodes: [
          { id: "life", calculation: "life-path", label: "Life Path", value: 7, system: "pythagorean", derivationRef: "calc:life" },
        ],
        edges: [{ id: "bad", source: "life", target: "ghost", relationship: "tension" }],
      }),
    ).toThrow(RangeError);
  });
});
