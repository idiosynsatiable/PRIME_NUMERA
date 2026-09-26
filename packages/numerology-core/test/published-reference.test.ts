import { describe, expect, it } from "vitest";
import {
  PYTHAGOREAN,
  calculateExpression,
  calculateExpressionComponents,
} from "../src/index.js";

describe("published Pythagorean reference fixtures", () => {
  it("matches the published Tom Cruise component-aware Expression example", () => {
    const result = calculateExpressionComponents(
      "Thomas Cruise Mapother",
      PYTHAGOREAN,
      "reduce-components",
    );

    expect(result.components.map(({ normalizedComponent, sum, reduction }) => ({
      name: normalizedComponent,
      sum,
      value: reduction.value,
    }))).toEqual([
      { name: "THOMAS", sum: 22, value: 22 },
      { name: "CRUISE", sum: 30, value: 3 },
      { name: "MAPOTHER", sum: 42, value: 6 },
    ]);
    expect(result.aggregate).toBe(31);
    expect(result.value).toBe(4);
  });

  it("matches the published HATE Expression 16/7 example", () => {
    const result = calculateExpression("HATE", PYTHAGOREAN);
    expect(result.sum).toBe(16);
    expect(result.value).toBe(7);
  });

  it("matches the published LIGHT Expression 29/11 example", () => {
    const result = calculateExpression("LIGHT", PYTHAGOREAN);
    expect(result.sum).toBe(29);
    expect(result.value).toBe(11);
  });

  it("matches the published WORK Expression 22 example", () => {
    const result = calculateExpression("WORK", PYTHAGOREAN);
    expect(result.sum).toBe(22);
    expect(result.value).toBe(22);
  });
});
