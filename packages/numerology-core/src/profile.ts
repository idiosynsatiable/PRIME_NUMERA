import { calculateAttitudeNumber, calculateBirthdayNumber } from "./basic-date.js";
import { calculateBalance } from "./balance.js";
import {
  calculateExpressionComponents,
  calculatePersonalityComponents,
  calculateSoulUrgeComponents,
  type ComponentAwareNameResult,
} from "./component-name.js";
import {
  calculateLifePathBirthdayBridge,
  calculateLifePathExpressionBridge,
  calculateMaturityNumber,
  calculateSoulUrgePersonalityBridge,
  type BridgeNumberResult,
  type CompositeNumberResult,
} from "./composite.js";
import {
  calculateChallenges,
  calculatePeriodCycles,
  calculatePinnacles,
  type ChallengeValue,
  type CycleValue,
  type PeriodCycleValue,
} from "./cycles.js";
import {
  calculateLifePath,
  type BirthDateInput,
  type LifePathResult,
} from "./date.js";
import { analyzeNameFrequencies, type FrequencyAnalysis } from "./frequencies.js";
import {
  detectCoreKarmicDebt,
  type KarmicDebtOccurrence,
} from "./karmic-debt.js";
import {
  calculateLongTermTimeline,
  type LongTermTimeline,
} from "./long-term-timeline.js";
import {
  calculateFirstNameStructure,
  type NameStructureResult,
} from "./name-structure.js";
import {
  calculatePersonalCalendar,
  type PersonalCalendarResult,
} from "./personal-calendar.js";
import {
  calculatePlanesOfExpression,
  type PlaneResult,
} from "./planes.js";
import {
  calculateRationalThought,
  type RationalThoughtResult,
} from "./rational-thought.js";
import { PYTHAGOREAN } from "./systems.js";
import {
  buildStandardTransitChannels,
  calculateEssenceAtAge,
  type EssenceResult,
  type TransitChannelInput,
} from "./transits.js";
import type { VowelPolicy } from "./vowels.js";

export interface BirthNameParts {
  readonly firstNames: string;
  readonly middleNames?: string | null;
  readonly lastNames?: string | null;
}

export interface PythagoreanProfileInput {
  readonly birthName: BirthNameParts;
  readonly birthDate: BirthDateInput;
  readonly vowelPolicy: VowelPolicy;
  readonly targetDate?: BirthDateInput;
  readonly forecastAge?: number;
}

export interface PythagoreanProfile {
  readonly system: "pythagorean";
  readonly fullBirthName: string;
  readonly birthDate: BirthDateInput;
  readonly lifePath: LifePathResult;
  readonly birthday: ReturnType<typeof calculateBirthdayNumber>;
  readonly attitude: ReturnType<typeof calculateAttitudeNumber>;
  readonly expression: ComponentAwareNameResult;
  readonly soulUrge: ComponentAwareNameResult;
  readonly personality: ComponentAwareNameResult;
  readonly maturity: CompositeNumberResult;
  readonly balance: ReturnType<typeof calculateBalance>;
  readonly specialLetters: NameStructureResult;
  readonly nameFrequencies: FrequencyAnalysis;
  readonly planes: readonly PlaneResult[];
  readonly rationalThought: RationalThoughtResult;
  readonly karmicDebts: readonly KarmicDebtOccurrence[];
  readonly bridges: {
    readonly lifePathExpression: BridgeNumberResult;
    readonly soulUrgePersonality: BridgeNumberResult;
    readonly lifePathBirthday: BridgeNumberResult;
  };
  readonly pinnacles: readonly CycleValue[];
  readonly challenges: readonly ChallengeValue[];
  readonly periodCycles: readonly PeriodCycleValue[];
  readonly longTermTimeline: LongTermTimeline;
  readonly personalCalendar: PersonalCalendarResult | null;
  readonly transitChannels: readonly TransitChannelInput[] | null;
  readonly essence: EssenceResult | null;
}

function compactName(parts: BirthNameParts): string {
  const values = [
    parts.firstNames.trim(),
    parts.middleNames?.trim() ?? "",
    parts.lastNames?.trim() ?? "",
  ].filter(Boolean);
  if (values.length === 0) throw new RangeError("Birth name cannot be empty.");
  return values.join(" ");
}

function firstGivenName(firstNames: string): string {
  const first = firstNames.trim().split(/\s+/u).find(Boolean);
  if (!first) throw new RangeError("At least one first/given name is required.");
  return first;
}

function buildForecastChannels(parts: BirthNameParts): readonly TransitChannelInput[] {
  const lastNames = parts.lastNames?.trim() ?? "";
  if (!lastNames) {
    throw new RangeError("Forecast Transit channels require a last/family name.");
  }
  return buildStandardTransitChannels(
    parts.firstNames,
    parts.middleNames,
    lastNames,
  );
}

export function calculatePythagoreanProfile(
  input: PythagoreanProfileInput,
): PythagoreanProfile {
  const system = PYTHAGOREAN;
  const fullBirthName = compactName(input.birthName);
  const firstName = firstGivenName(input.birthName.firstNames);
  const policy = system.reductionPolicy;

  const lifePath = calculateLifePath(input.birthDate, "reduce-components", policy);
  const birthday = calculateBirthdayNumber(input.birthDate, policy);
  const attitude = calculateAttitudeNumber(input.birthDate, policy);

  const expression = calculateExpressionComponents(
    fullBirthName,
    system,
    "reduce-components",
  );
  const soulUrge = calculateSoulUrgeComponents(
    fullBirthName,
    system,
    input.vowelPolicy,
    "reduce-components",
  );
  const personality = calculatePersonalityComponents(
    fullBirthName,
    system,
    input.vowelPolicy,
    "reduce-components",
  );

  const maturity = calculateMaturityNumber(lifePath.value, expression.value, policy);
  const balance = calculateBalance(fullBirthName, system);
  const specialLetters = calculateFirstNameStructure(
    firstName,
    system,
    input.vowelPolicy,
  );
  const nameFrequencies = analyzeNameFrequencies(fullBirthName, system);
  const planes = calculatePlanesOfExpression(fullBirthName, system);
  const rationalThought = calculateRationalThought(
    firstName,
    input.birthDate.day,
    system,
  );

  const karmicDebts = detectCoreKarmicDebt({
    lifePath,
    birthday,
    expression,
    soulUrge,
    personality,
  });

  const bridges = {
    lifePathExpression: calculateLifePathExpressionBridge(
      lifePath.value,
      expression.value,
    ),
    soulUrgePersonality: calculateSoulUrgePersonalityBridge(
      soulUrge.value,
      personality.value,
    ),
    lifePathBirthday: calculateLifePathBirthdayBridge(
      lifePath.value,
      birthday.value,
    ),
  };

  const pinnacles = calculatePinnacles(input.birthDate, policy);
  const challenges = calculateChallenges(input.birthDate, policy);
  const periodCycles = calculatePeriodCycles(input.birthDate, policy);
  const longTermTimeline = calculateLongTermTimeline(
    input.birthDate,
    lifePath.value,
    policy,
  );

  const personalCalendar = input.targetDate
    ? calculatePersonalCalendar(input.birthDate, input.targetDate, policy)
    : null;

  const transitChannels =
    input.forecastAge !== undefined ? buildForecastChannels(input.birthName) : null;
  const essence =
    transitChannels && input.forecastAge !== undefined
      ? calculateEssenceAtAge(
          transitChannels,
          input.forecastAge,
          system,
        )
      : null;

  return {
    system: "pythagorean",
    fullBirthName,
    birthDate: input.birthDate,
    lifePath,
    birthday,
    attitude,
    expression,
    soulUrge,
    personality,
    maturity,
    balance,
    specialLetters,
    nameFrequencies,
    planes,
    rationalThought,
    karmicDebts,
    bridges,
    pinnacles,
    challenges,
    periodCycles,
    longTermTimeline,
    personalCalendar,
    transitChannels,
    essence,
  };
}
