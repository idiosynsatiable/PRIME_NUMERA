import { describe, expect, it } from "vitest";
import { calculateAttitudeNumber, calculateBirthdayNumber } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("basic date calculations", () => {
  it("calculates and exposes Birthday reduction", () => {
    const result = calculateBirthdayNumber({ year: 2000, month: 1, day: 29 }, policy);
    expect(result.day).toBe(29);
    expect(result.reduction.steps[0]?.output).toBe(11);
    expect(result.value).toBe(11);
  });

  it("calculates Attitude from month plus day", () => {
    const result = calculateAttitudeNumber({ year: 2000, month: 7, day: 15 }, policy);
    expect(result.aggregate).toBe(22);
    expect(result.value).toBe(22);
  });
});
