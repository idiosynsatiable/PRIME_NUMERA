import { describe, expect, it } from "vitest";
import { calculateBridgeNumber, calculateMaturityNumber } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("composite calculations", () => {
  it("calculates maturity from life path and expression", () => {
    const result = calculateMaturityNumber(7, 4, policy);
    expect(result.aggregate).toBe(11);
    expect(result.value).toBe(11);
  });

  it("calculates a bridge as an absolute difference", () => {
    expect(calculateBridgeNumber(8, 6).value).toBe(2);
    expect(calculateBridgeNumber(6, 8).value).toBe(2);
  });
});
