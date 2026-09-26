import { assertValidBirthDate, type BirthDateInput } from "./date.js";
import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface CycleValue {
  readonly ordinal: 1 | 2 | 3 | 4;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface ChallengeValue {
  readonly ordinal: 1 | 2 | 3 | 4;
  readonly left: number;
  readonly right: number;
  readonly value: number;
}

export interface PeriodCycleValue {
  readonly ordinal: 1 | 2 | 3;
  readonly source: "month" | "day" | "year";
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface CycleMethodology {
  readonly id: string;
  readonly preserveMasterNumbersInPinnacles: boolean;
  readonly preserveMasterNumbersInPeriods: boolean;
  readonly challengeComponentsReduceToSingleDigit: boolean;
}

export const FOUNDATION_CYCLE_METHODOLOGY: CycleMethodology = Object.freeze({
  id: "foundation-configurable-v1",
  preserveMasterNumbersInPinnacles: true,
  preserveMasterNumbersInPeriods: true,
  challengeComponentsReduceToSingleDigit: true,
});

const singleDigitPolicy: ReductionPolicy = { preserveMasterNumbers: [] };

function componentReduction(
  value: number,
  policy: ReductionPolicy,
  preserveMasters: boolean,
): ReductionResult {
  return reduceNumber(value, preserveMasters ? policy : singleDigitPolicy);
}

export function calculatePinnacles(
  input: BirthDateInput,
  policy: ReductionPolicy,
  methodology: CycleMethodology = FOUNDATION_CYCLE_METHODOLOGY,
): readonly CycleValue[] {
  assertValidBirthDate(input);
  const month = componentReduction(input.month, policy, methodology.preserveMasterNumbersInPinnacles).value;
  const day = componentReduction(input.day, policy, methodology.preserveMasterNumbersInPinnacles).value;
  const year = componentReduction(input.year, policy, methodology.preserveMasterNumbersInPinnacles).value;
  const cyclePolicy = methodology.preserveMasterNumbersInPinnacles ? policy : singleDigitPolicy;
  const aggregates = [month + day, day + year] as const;
  const first = reduceNumber(aggregates[0], cyclePolicy);
  const second = reduceNumber(aggregates[1], cyclePolicy);
  const thirdAggregate = first.value + second.value;
  const fourthAggregate = month + year;
  const third = reduceNumber(thirdAggregate, cyclePolicy);
  const fourth = reduceNumber(fourthAggregate, cyclePolicy);
  return [
    { ordinal: 1, aggregate: aggregates[0], reduction: first, value: first.value },
    { ordinal: 2, aggregate: aggregates[1], reduction: second, value: second.value },
    { ordinal: 3, aggregate: thirdAggregate, reduction: third, value: third.value },
    { ordinal: 4, aggregate: fourthAggregate, reduction: fourth, value: fourth.value },
  ];
}

export function calculateChallenges(
  input: BirthDateInput,
  policy: ReductionPolicy,
  methodology: CycleMethodology = FOUNDATION_CYCLE_METHODOLOGY,
): readonly ChallengeValue[] {
  assertValidBirthDate(input);
  const componentPolicy = methodology.challengeComponentsReduceToSingleDigit ? singleDigitPolicy : policy;
  const month = reduceNumber(input.month, componentPolicy).value;
  const day = reduceNumber(input.day, componentPolicy).value;
  const year = reduceNumber(input.year, componentPolicy).value;
  const first = Math.abs(day - month);
  const second = Math.abs(day - year);
  const third = Math.abs(first - second);
  const fourth = Math.abs(month - year);
  return [
    { ordinal: 1, left: day, right: month, value: first },
    { ordinal: 2, left: day, right: year, value: second },
    { ordinal: 3, left: first, right: second, value: third },
    { ordinal: 4, left: month, right: year, value: fourth },
  ];
}

export function calculatePeriodCycles(
  input: BirthDateInput,
  policy: ReductionPolicy,
  methodology: CycleMethodology = FOUNDATION_CYCLE_METHODOLOGY,
): readonly PeriodCycleValue[] {
  assertValidBirthDate(input);
  const periodPolicy = methodology.preserveMasterNumbersInPeriods ? policy : singleDigitPolicy;
  const values = [
    [1, "month", input.month],
    [2, "day", input.day],
    [3, "year", input.year],
  ] as const;
  return values.map(([ordinal, source, raw]) => {
    const reduction = reduceNumber(raw, periodPolicy);
    return { ordinal, source, reduction, value: reduction.value };
  });
}
