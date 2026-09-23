import { describe, expect, it } from "vitest";
import { PYTHAGOREAN, calculateRationalThought } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("rational thought primitive", () => {
  it("exposes first-name raw value plus birth-day arithmetic", () => {
    const result = calculateRationalThought("Ana", 7, PYTHAGOREAN, policy);
    expect(result.firstName).toBe("ANA");
    expect(result.firstNameRawValue).toBe(7);
    expect(result.aggregate).toBe(14);
    expect(result.value).toBe(5);
  });
});
