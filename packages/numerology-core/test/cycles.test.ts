import { describe, expect, it } from "vitest";
import { calculateChallenges, calculatePeriodCycles, calculatePinnacles } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };
const birth = { year: 1993, month: 11, day: 21 };

describe("cycle primitives", () => {
  it("returns four auditable pinnacle values", () => {
    const result = calculatePinnacles(birth, policy);
    expect(result).toHaveLength(4);
    expect(result[0]?.aggregate).toBe(14);
    expect(result[0]?.value).toBe(5);
    expect(result[3]?.aggregate).toBe(33);
    expect(result[3]?.value).toBe(33);
  });

  it("returns four absolute-difference challenges", () => {
    const result = calculateChallenges(birth, policy);
    expect(result.map(({ value }) => value)).toEqual([1, 1, 0, 2]);
  });

  it("keeps period-cycle sources explicit", () => {
    const result = calculatePeriodCycles(birth, policy);
    expect(result.map(({ source }) => source)).toEqual(["month", "day", "year"]);
    expect(result.map(({ value }) => value)).toEqual([11, 3, 22]);
  });
});
