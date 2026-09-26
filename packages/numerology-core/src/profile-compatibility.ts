import {
  compareCompatibilityDimensions,
  type CompatibilityDimension,
} from "./compatibility.js";
import type { PythagoreanProfile } from "./profile.js";

export type CompatibilityMode =
  | "romantic"
  | "friendship"
  | "family"
  | "creative-partnership"
  | "business-collaboration";

export interface CycleOverlapDimension {
  readonly calculation: "personal-year" | "personal-month" | "personal-day" | "essence";
  readonly firstValue: number;
  readonly secondValue: number;
  readonly shared: boolean;
}

export interface ProfileCompatibilityComparison {
  readonly mode: CompatibilityMode;
  readonly system: "pythagorean";
  readonly coreDimensions: readonly CompatibilityDimension[];
  readonly cycleOverlap: readonly CycleOverlapDimension[];
  readonly singlePercentageProvided: false;
}

function pushCycle(
  target: CycleOverlapDimension[],
  calculation: CycleOverlapDimension["calculation"],
  firstValue: number | undefined,
  secondValue: number | undefined,
): void {
  if (firstValue === undefined || secondValue === undefined) return;
  target.push({
    calculation,
    firstValue,
    secondValue,
    shared: firstValue === secondValue,
  });
}

export function comparePythagoreanProfiles(
  first: PythagoreanProfile,
  second: PythagoreanProfile,
  mode: CompatibilityMode,
): ProfileCompatibilityComparison {
  const coreDimensions = compareCompatibilityDimensions([
    {
      calculation: "life-path",
      firstValue: first.lifePath.value,
      secondValue: second.lifePath.value,
    },
    {
      calculation: "expression",
      firstValue: first.expression.value,
      secondValue: second.expression.value,
    },
    {
      calculation: "soul-urge",
      firstValue: first.soulUrge.value,
      secondValue: second.soulUrge.value,
    },
    {
      calculation: "personality",
      firstValue: first.personality.value,
      secondValue: second.personality.value,
    },
    {
      calculation: "birthday",
      firstValue: first.birthday.value,
      secondValue: second.birthday.value,
    },
  ]).dimensions;

  const cycleOverlap: CycleOverlapDimension[] = [];
  pushCycle(
    cycleOverlap,
    "personal-year",
    first.personalCalendar?.year.value,
    second.personalCalendar?.year.value,
  );
  pushCycle(
    cycleOverlap,
    "personal-month",
    first.personalCalendar?.month.value,
    second.personalCalendar?.month.value,
  );
  pushCycle(
    cycleOverlap,
    "personal-day",
    first.personalCalendar?.day.value,
    second.personalCalendar?.day.value,
  );
  pushCycle(
    cycleOverlap,
    "essence",
    first.essence?.value,
    second.essence?.value,
  );

  return {
    mode,
    system: "pythagorean",
    coreDimensions,
    cycleOverlap,
    singlePercentageProvided: false,
  };
}
