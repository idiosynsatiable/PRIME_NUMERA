import { normalizeLatinName } from "./name.js";
import { reduceNumber } from "./reduction.js";
import type { NumerologySystem, ReductionPolicy, ReductionResult } from "./types.js";

export interface BalanceResult {
  readonly calculation: "balance";
  readonly initials: readonly string[];
  readonly values: readonly number[];
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export const BALANCE_REDUCTION_POLICY: ReductionPolicy = Object.freeze({
  preserveMasterNumbers: [],
});

export function calculateBalance(
  fullName: string,
  system: NumerologySystem,
  policy: ReductionPolicy = BALANCE_REDUCTION_POLICY,
): BalanceResult {
  const words = fullName.trim().split(/\s+/u).filter(Boolean);
  const initials = words
    .map((word) => normalizeLatinName(word).normalized[0])
    .filter((value): value is string => Boolean(value));
  if (initials.length === 0) {
    throw new RangeError("Name must contain at least one supported Latin initial.");
  }
  const values = initials.map((letter) => {
    const value = system.mappings[letter];
    if (value === undefined) throw new Error(`No ${system.id} mapping for ${letter}.`);
    return value;
  });
  const aggregate = values.reduce((sum, value) => sum + value, 0);
  const reduction = reduceNumber(aggregate, policy);
  return { calculation: "balance", initials, values, aggregate, reduction, value: reduction.value };
}
