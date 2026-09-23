import { describe, expect, it } from "vitest";
import { detectKarmicDebt } from "../src/index.js";

describe("karmic debt detector", () => {
  it("reports configured traditional debt values with their arithmetic source", () => {
    expect(
      detectKarmicDebt([
        { value: 13, source: "expression-pre-reduction" },
        { value: 8, source: "life-path" },
        { value: 19, source: "birthday" },
      ]),
    ).toEqual([
      { value: 13, source: "expression-pre-reduction" },
      { value: 19, source: "birthday" },
    ]);
  });
});
