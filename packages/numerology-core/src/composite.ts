import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface CompositeNumberResult {
  readonly calculation: "maturity" | "bridge";
  readonly inputs: readonly number[];
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export type BridgeKind =
  | "generic"
  | "life-path-expression"
  | "soul-urge-personality"
  | "life-path-birthday";

export interface BridgeNumberResult extends CompositeNumberResult {
  readonly calculation: "bridge";
  readonly bridgeKind: BridgeKind;
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

export function calculateBridgeNumber(
  first: number,
  second: number,
  bridgeKind: BridgeKind = "generic",
): BridgeNumberResult {
  if (![first, second].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new RangeError("Bridge inputs must be non-negative safe integers.");
  }
  const aggregate = Math.abs(first - second);
  const reduction: ReductionResult = { value: aggregate, steps: [] };
  return {
    calculation: "bridge",
    bridgeKind,
    inputs: [first, second],
    aggregate,
    reduction,
    value: aggregate,
  };
}

export const calculateLifePathExpressionBridge = (
  lifePath: number,
  expression: number,
): BridgeNumberResult => calculateBridgeNumber(lifePath, expression, "life-path-expression");

export const calculateSoulUrgePersonalityBridge = (
  soulUrge: number,
  personality: number,
): BridgeNumberResult => calculateBridgeNumber(soulUrge, personality, "soul-urge-personality");

export const calculateLifePathBirthdayBridge = (
  lifePath: number,
  birthday: number,
): BridgeNumberResult => calculateBridgeNumber(lifePath, birthday, "life-path-birthday");
