import { calculateExpression } from "./name.js";
import { compareNameValues } from "./name-diff.js";
import { calculateLifePath, assertValidBirthDate, type BirthDateInput } from "./date.js";
import { calculateLongTermTimeline } from "./long-term-timeline.js";
import { SYSTEMS } from "./systems.js";
import type { NumerologySystemId } from "./types.js";

export type SupportedNameSystem = keyof typeof SYSTEMS;

export interface NameLabResult {
  readonly system: SupportedNameSystem;
  readonly before: ReturnType<typeof calculateExpression>;
  readonly after: ReturnType<typeof calculateExpression>;
  readonly arithmeticChange: ReturnType<typeof compareNameValues>;
  readonly reducedValueChanged: boolean;
  readonly interpretiveClaimsIncluded: false;
}

export function compareNameVariants(before: string, after: string, system: SupportedNameSystem): NameLabResult {
  const selected = SYSTEMS[system];
  if (!selected) throw new RangeError("Unsupported Name Lab system.");
  if (before.length > 200 || after.length > 200) throw new RangeError("Name input is too long.");
  const first = calculateExpression(before, selected);
  const second = calculateExpression(after, selected);
  return {
    system,
    before: first,
    after: second,
    arithmeticChange: compareNameValues(before, after, selected),
    reducedValueChanged: first.value !== second.value,
    interpretiveClaimsIncluded: false,
  };
}

export interface TimelineSegment {
  readonly track: "pinnacle" | "period";
  readonly ordinal: number;
  readonly value: number;
  readonly startAge: number;
  readonly endAgeExclusive: number | null;
  readonly activeAtSelectedAge: boolean;
}

export interface InteractiveTimelineModel {
  readonly selectedAge: number;
  readonly firstTransitionAge: number;
  readonly segments: readonly TimelineSegment[];
  readonly challengesHaveFixedRanges: false;
}

export function buildTimelineModel(birthDate: BirthDateInput, selectedAge: number): InteractiveTimelineModel {
  assertValidBirthDate(birthDate);
  if (!Number.isSafeInteger(selectedAge) || selectedAge < 0 || selectedAge > 120) {
    throw new RangeError("Selected age must be an integer between 0 and 120.");
  }
  const policy = SYSTEMS.pythagorean.reductionPolicy;
  const lifePath = calculateLifePath(birthDate, "reduce-components", policy);
  const timeline = calculateLongTermTimeline(birthDate, lifePath.value, policy);
  const segments: TimelineSegment[] = [...timeline.pinnacles.map((segment) => ({ ...segment, track: "pinnacle" as const })),
    ...timeline.periods.map((segment) => ({ ...segment, track: "period" as const }))]
    .map((segment) => ({ ...segment, activeAtSelectedAge: selectedAge >= segment.startAge &&
      (segment.endAgeExclusive === null || selectedAge < segment.endAgeExclusive) }));
  return { selectedAge, firstTransitionAge: timeline.firstTransitionAge, segments, challengesHaveFixedRanges: false };
}

export type SandboxRequest =
  | { readonly kind: "name"; readonly name: string; readonly system: SupportedNameSystem }
  | { readonly kind: "life-path"; readonly birthDate: BirthDateInput; readonly strategy: "reduce-components" | "reduce-total-digits" };

export function calculateSandbox(request: SandboxRequest) {
  if (request.kind === "name") {
    if (request.name.length > 200) throw new RangeError("Name input is too long.");
    const system = SYSTEMS[request.system];
    if (!system) throw new RangeError("Unsupported system.");
    return { kind: "name" as const, system: system.id as NumerologySystemId,
      result: calculateExpression(request.name, system) };
  }
  if (request.kind === "life-path") {
    return { kind: "life-path" as const, system: "pythagorean" as const,
      result: calculateLifePath(request.birthDate, request.strategy, SYSTEMS.pythagorean.reductionPolicy) };
  }
  throw new RangeError("Unsupported sandbox calculation.");
}
