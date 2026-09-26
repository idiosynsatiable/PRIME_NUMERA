import { normalizeLatinName } from "./name.js";
import { reduceNumber } from "./reduction.js";
import type { NumerologySystem, ReductionPolicy, ReductionResult } from "./types.js";

export interface RationalThoughtResult {
  readonly calculation: "rational-thought";
  readonly firstName: string;
  readonly firstNameRawValue: number;
  readonly birthDay: number;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export const RATIONAL_THOUGHT_REDUCTION_POLICY: ReductionPolicy = Object.freeze({
  preserveMasterNumbers: [],
});

export function calculateRationalThought(
  firstName: string,
  birthDay: number,
  system: NumerologySystem,
  policy: ReductionPolicy = RATIONAL_THOUGHT_REDUCTION_POLICY,
): RationalThoughtResult {
  const normalized = normalizeLatinName(firstName).normalized;
  if (!normalized) throw new RangeError("First name must contain a supported Latin letter.");
  if (!Number.isInteger(birthDay) || birthDay < 1 || birthDay > 31) {
    throw new RangeError("Birth day must be 1-31.");
  }
  const firstNameRawValue = [...normalized].reduce((sum, letter) => {
    const value = system.mappings[letter];
    if (value === undefined) throw new Error(`No ${system.id} mapping for ${letter}.`);
    return sum + value;
  }, 0);
  const aggregate = firstNameRawValue + birthDay;
  const reduction = reduceNumber(aggregate, policy);
  return {
    calculation: "rational-thought",
    firstName: normalized,
    firstNameRawValue,
    birthDay,
    aggregate,
    reduction,
    value: reduction.value,
  };
}
