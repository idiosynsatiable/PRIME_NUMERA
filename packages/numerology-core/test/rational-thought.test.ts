import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, calculateRationalThought } from "../src/index.js";

describe("rational thought primitive", () => {
  it("exposes first-name raw value plus birth-day arithmetic", () => {
    const result = calculateRationalThought("Ana", 7, PYTHAGOREAN);
    expect(result.firstName).toBe("ANA");
    expect(result.firstNameRawValue).toBe(7);
    expect(result.aggregate).toBe(14);
    expect(result.value).toBe(5);
  });

  it("reduces an 11 aggregate to 2 under the documented default", () => {
    const result = calculateRationalThought("Ana", 4, PYTHAGOREAN);
    expect(result.aggregate).toBe(11);
    expect(result.value).toBe(2);
  });
});
