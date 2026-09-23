import { describe, expect, it } from "vitest";
import { calculateLifePath } from "../src/index.js";

const preserveMasters = { preserveMasterNumbers: [11, 22, 33] as const };

describe("calculateLifePath", () => {
  it("exposes component reductions for the component strategy", () => {
    const result = calculateLifePath(
      { year: 1990, month: 12, day: 29 },
      "reduce-components",
      preserveMasters,
    );
    expect(result.strategy).toBe("reduce-components");
    expect(result.componentReductions).toBeDefined();
    expect(result.value).toBe(result.reduction.value);
  });

  it("supports total-digit reduction as a distinct strategy", () => {
    const result = calculateLifePath(
      { year: 2000, month: 1, day: 1 },
      "reduce-total-digits",
      preserveMasters,
    );
    expect(result.aggregate).toBe(4);
    expect(result.value).toBe(4);
  });

  it("accepts leap day on a leap year", () => {
    expect(() =>
      calculateLifePath(
        { year: 2000, month: 2, day: 29 },
        "reduce-total-digits",
        preserveMasters,
      ),
    ).not.toThrow();
  });

  it("rejects an impossible calendar date", () => {
    expect(() =>
      calculateLifePath(
        { year: 2001, month: 2, day: 29 },
        "reduce-total-digits",
        preserveMasters,
      ),
    ).toThrow(RangeError);
  });
});
