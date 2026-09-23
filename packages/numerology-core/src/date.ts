import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface BirthDateInput {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export type LifePathStrategy = "reduce-components" | "reduce-total-digits";

export interface LifePathResult {
  readonly calculation: "life-path";
  readonly input: BirthDateInput;
  readonly strategy: LifePathStrategy;
  readonly componentReductions?: {
    readonly month: ReductionResult;
    readonly day: ReductionResult;
    readonly year: ReductionResult;
  };
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

function assertValidDate(input: BirthDateInput): void {
  const { year, month, day } = input;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError("Birth date components must be integers.");
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("Birth date is not a valid Gregorian calendar date.");
  }
}

const sumDigits = (value: number): number =>
  value.toString().split("").reduce((sum, digit) => sum + Number(digit), 0);

export function calculateLifePath(
  input: BirthDateInput,
  strategy: LifePathStrategy,
  policy: ReductionPolicy,
): LifePathResult {
  assertValidDate(input);

  if (strategy === "reduce-components") {
    const componentReductions = {
      month: reduceNumber(input.month, policy),
      day: reduceNumber(input.day, policy),
      year: reduceNumber(input.year, policy),
    };
    const aggregate =
      componentReductions.month.value +
      componentReductions.day.value +
      componentReductions.year.value;
    const reduction = reduceNumber(aggregate, policy);
    return {
      calculation: "life-path",
      input,
      strategy,
      componentReductions,
      aggregate,
      reduction,
      value: reduction.value,
    };
  }

  const aggregate = sumDigits(input.year) + sumDigits(input.month) + sumDigits(input.day);
  const reduction = reduceNumber(aggregate, policy);
  return { calculation: "life-path", input, strategy, aggregate, reduction, value: reduction.value };
}
