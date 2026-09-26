import { describe, expect, it } from "vitest";
import { calculateBalance, calculatePlanesOfExpression, PYTHAGOREAN } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("advanced catalog primitives", () => {
  it("calculates Balance from normalized word initials", () => {
    const result = calculateBalance("Ada Lovelace", PYTHAGOREAN, policy);
    expect(result.initials).toEqual(["A", "L"]);
    expect(result.values).toEqual([1, 3]);
    expect(result.aggregate).toBe(4);
    expect(result.value).toBe(4);
  });

  it("keeps planes definitions explicit and auditable", () => {
    const result = calculatePlanesOfExpression("Ada Lovelace", PYTHAGOREAN);
    expect(result.map(({ plane }) => plane)).toEqual(["physical", "mental", "emotional", "intuitive"]);
    expect(result.reduce((sum, plane) => sum + plane.count, 0)).toBe("ADALOVELACE".length);
  });
});
