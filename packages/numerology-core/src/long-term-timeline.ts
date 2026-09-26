import type { BirthDateInput } from "./date.js";
import { calculatePeriodCycles, calculatePinnacles } from "./cycles.js";
import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy } from "./types.js";

export interface AgeRange {
  readonly startAge: number;
  readonly endAgeExclusive: number | null;
}

export interface LongTermCycleRange extends AgeRange {
  readonly ordinal: 1 | 2 | 3 | 4;
  readonly value: number;
}

export interface PeriodCycleRange extends AgeRange {
  readonly ordinal: 1 | 2 | 3;
  readonly value: number;
}

export interface LongTermTimeline {
  readonly lifePathSingleDigit: number;
  readonly firstTransitionAge: number;
  readonly pinnacles: readonly LongTermCycleRange[];
  readonly periods: readonly PeriodCycleRange[];
  readonly challengesHaveFixedRanges: false;
}

const SINGLE_DIGIT_POLICY: ReductionPolicy = { preserveMasterNumbers: [] };

export function calculateLongTermTimeline(
  birthDate: BirthDateInput,
  lifePath: number,
  policy: ReductionPolicy,
): LongTermTimeline {
  if (!Number.isSafeInteger(lifePath) || lifePath < 0) {
    throw new RangeError("Life Path must be a non-negative safe integer.");
  }

  const lifePathSingleDigit = reduceNumber(lifePath, SINGLE_DIGIT_POLICY).value;
  const firstTransitionAge = 36 - lifePathSingleDigit;

  const pinnacleValues = calculatePinnacles(birthDate, policy);
  const periodValues = calculatePeriodCycles(birthDate, policy);

  const pinnacleStarts = [
    0,
    firstTransitionAge,
    firstTransitionAge + 9,
    firstTransitionAge + 18,
  ] as const;
  const pinnacleEnds = [
    firstTransitionAge,
    firstTransitionAge + 9,
    firstTransitionAge + 18,
    null,
  ] as const;

  const pinnacles = pinnacleValues.map((cycle, index) => ({
    ordinal: cycle.ordinal,
    value: cycle.value,
    startAge: pinnacleStarts[index]!,
    endAgeExclusive: pinnacleEnds[index]!,
  }));

  const periodStarts = [0, firstTransitionAge, firstTransitionAge + 27] as const;
  const periodEnds = [firstTransitionAge, firstTransitionAge + 27, null] as const;

  const periods = periodValues.map((cycle, index) => ({
    ordinal: cycle.ordinal,
    value: cycle.value,
    startAge: periodStarts[index]!,
    endAgeExclusive: periodEnds[index]!,
  }));

  return {
    lifePathSingleDigit,
    firstTransitionAge,
    pinnacles,
    periods,
    challengesHaveFixedRanges: false,
  };
}
