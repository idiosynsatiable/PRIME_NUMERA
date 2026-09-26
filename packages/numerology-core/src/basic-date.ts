import { assertValidBirthDate, type BirthDateInput } from "./date.js";
import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface BirthdayNumberResult {
  readonly calculation: "birthday";
  readonly day: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface AttitudeNumberResult {
  readonly calculation: "attitude";
  readonly month: number;
  readonly day: number;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export function calculateBirthdayNumber(
  input: BirthDateInput,
  policy: ReductionPolicy,
): BirthdayNumberResult {
  assertValidBirthDate(input);
  const reduction = reduceNumber(input.day, policy);
  return { calculation: "birthday", day: input.day, reduction, value: reduction.value };
}

export function calculateAttitudeNumber(
  input: BirthDateInput,
  policy: ReductionPolicy,
): AttitudeNumberResult {
  assertValidBirthDate(input);
  const aggregate = input.month + input.day;
  const reduction = reduceNumber(aggregate, policy);
  return {
    calculation: "attitude",
    month: input.month,
    day: input.day,
    aggregate,
    reduction,
    value: reduction.value,
  };
}
