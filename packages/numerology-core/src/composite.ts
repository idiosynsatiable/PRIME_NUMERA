import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface CompositeNumberResult {
  readonly calculation: "maturity" | "bridge";
  readonly inputs: readonly number[];
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export function calculateMaturityNumber(
  lifePath: number,
  expression: number,
  policy: ReductionPolicy,
): CompositeNumberResult {
  const aggregate = lifePath + expression;
  const reduction = reduceNumber(aggregate, policy);
  return {
    calculation: "maturity",
    inputs: [lifePath, expression],
    aggregate,
    reduction,
    value: reduction.value,
  };
}

export function calculateBridgeNumber(first: number, second: number): CompositeNumberResult {
  if (![first, second].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new RangeError("Bridge inputs must be non-negative safe integers.");
  }
  const aggregate = Math.abs(first - second);
  const reduction: ReductionResult = { value: aggregate, steps: [] };
  return {
    calculation: "bridge",
    inputs: [first, second],
    aggregate,
    reduction,
    value: aggregate,
  };
}
