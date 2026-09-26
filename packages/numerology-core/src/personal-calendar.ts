import { assertValidBirthDate, type BirthDateInput } from "./date.js";
import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";

export interface PersonalCalendarPeriod {
  readonly calculation: "personal-year" | "personal-month" | "personal-day";
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface PersonalCalendarResult {
  readonly birthDate: BirthDateInput;
  readonly targetDate: BirthDateInput;
  readonly year: PersonalCalendarPeriod;
  readonly month: PersonalCalendarPeriod;
  readonly day: PersonalCalendarPeriod;
}

export function calculatePersonalCalendar(
  birthDate: BirthDateInput,
  targetDate: BirthDateInput,
  policy: ReductionPolicy,
): PersonalCalendarResult {
  assertValidBirthDate(birthDate);
  assertValidBirthDate(targetDate);

  const yearAggregate = birthDate.month + birthDate.day + targetDate.year;
  const monthAggregate = yearAggregate + targetDate.month;
  const dayAggregate = monthAggregate + targetDate.day;

  const yearReduction = reduceNumber(yearAggregate, policy);
  const monthReduction = reduceNumber(monthAggregate, policy);
  const dayReduction = reduceNumber(dayAggregate, policy);

  return {
    birthDate,
    targetDate,
    year: {
      calculation: "personal-year",
      aggregate: yearAggregate,
      reduction: yearReduction,
      value: yearReduction.value,
    },
    month: {
      calculation: "personal-month",
      aggregate: monthAggregate,
      reduction: monthReduction,
      value: monthReduction.value,
    },
    day: {
      calculation: "personal-day",
      aggregate: dayAggregate,
      reduction: dayReduction,
      value: dayReduction.value,
    },
  };
}
