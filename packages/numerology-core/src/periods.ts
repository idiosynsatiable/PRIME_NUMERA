import { reduceNumber } from "./reduction.js";
import type { ReductionPolicy, ReductionResult } from "./types.js";
import type { BirthDateInput } from "./date.js";

export interface PersonalYearResult {
  readonly calculation: "personal-year";
  readonly birthMonth: number;
  readonly birthDay: number;
  readonly calendarYear: number;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface PersonalMonthResult {
  readonly calculation: "personal-month";
  readonly personalYear: number;
  readonly calendarMonth: number;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface PersonalDayResult {
  readonly calculation: "personal-day";
  readonly personalMonth: number;
  readonly calendarDay: number;
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

const sumDigits = (value: number): number =>
  Math.abs(value).toString().split("").reduce((sum, digit) => sum + Number(digit), 0);

export function calculatePersonalYear(
  birthDate: BirthDateInput,
  calendarYear: number,
  policy: ReductionPolicy,
): PersonalYearResult {
  if (!Number.isSafeInteger(calendarYear) || calendarYear < 1) throw new RangeError("Calendar year must be positive.");
  const aggregate = birthDate.month + birthDate.day + sumDigits(calendarYear);
  const reduction = reduceNumber(aggregate, policy);
  return {
    calculation: "personal-year",
    birthMonth: birthDate.month,
    birthDay: birthDate.day,
    calendarYear,
    aggregate,
    reduction,
    value: reduction.value,
  };
}

export function calculatePersonalMonth(
  personalYear: number,
  calendarMonth: number,
  policy: ReductionPolicy,
): PersonalMonthResult {
  if (!Number.isInteger(calendarMonth) || calendarMonth < 1 || calendarMonth > 12) throw new RangeError("Calendar month must be 1-12.");
  const aggregate = personalYear + calendarMonth;
  const reduction = reduceNumber(aggregate, policy);
  return { calculation: "personal-month", personalYear, calendarMonth, aggregate, reduction, value: reduction.value };
}

export function calculatePersonalDay(
  personalMonth: number,
  calendarDay: number,
  policy: ReductionPolicy,
): PersonalDayResult {
  if (!Number.isInteger(calendarDay) || calendarDay < 1 || calendarDay > 31) throw new RangeError("Calendar day must be 1-31.");
  const aggregate = personalMonth + calendarDay;
  const reduction = reduceNumber(aggregate, policy);
  return { calculation: "personal-day", personalMonth, calendarDay, aggregate, reduction, value: reduction.value };
}
