import { normalizeLatinName } from "./name.js";
import { reduceNumber } from "./reduction.js";
import type { LetterMapping, NumerologySystem, ReductionResult } from "./types.js";
import { isVowel, type VowelPolicy } from "./vowels.js";

export type NameProfileCalculation = "expression" | "soul-urge" | "personality";
export type NameReductionStrategy = "reduce-components" | "whole-name";

export interface NameComponentResult {
  readonly originalComponent: string;
  readonly normalizedComponent: string;
  readonly mappings: readonly LetterMapping[];
  readonly sum: number;
  readonly reduction: ReductionResult;
}

export interface ComponentAwareNameResult {
  readonly system: NumerologySystem["id"];
  readonly calculation: NameProfileCalculation;
  readonly strategy: NameReductionStrategy;
  readonly originalInput: string;
  readonly components: readonly NameComponentResult[];
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
  readonly vowelPolicy: VowelPolicy | null;
}

function splitSupportedComponents(input: string): readonly string[] {
  const components = input.trim().split(/\s+/u).filter(Boolean);
  const supported = components.filter((component) => normalizeLatinName(component).normalized.length > 0);
  if (supported.length === 0) {
    throw new RangeError("Name must contain at least one supported Latin name component.");
  }
  return supported;
}

function selectMappings(
  component: string,
  system: NumerologySystem,
  calculation: NameProfileCalculation,
  vowelPolicy: VowelPolicy | null,
): NameComponentResult {
  const normalizedComponent = normalizeLatinName(component).normalized;
  const letters = [...normalizedComponent];

  const mappings = letters.flatMap((character, index): LetterMapping[] => {
    let selected = calculation === "expression";
    if (calculation !== "expression") {
      if (!vowelPolicy) throw new Error(`${calculation} requires an explicit vowel policy.`);
      const vowel = isVowel(character, vowelPolicy, {
        ...(letters[index - 1] !== undefined ? { previous: letters[index - 1] } : {}),
        ...(letters[index + 1] !== undefined ? { next: letters[index + 1] } : {}),
      });
      selected = calculation === "soul-urge" ? vowel : !vowel;
    }
    if (!selected) return [];

    const value = system.mappings[character];
    if (value === undefined) throw new Error(`No ${system.id} mapping for ${character}.`);
    return [{ character, normalizedCharacter: character, value }];
  });

  const sum = mappings.reduce((total, mapping) => total + mapping.value, 0);
  const reduction = reduceNumber(sum, system.reductionPolicy);
  return { originalComponent: component, normalizedComponent, mappings, sum, reduction };
}

function calculateComponentAwareName(
  input: string,
  system: NumerologySystem,
  calculation: NameProfileCalculation,
  strategy: NameReductionStrategy,
  vowelPolicy: VowelPolicy | null,
): ComponentAwareNameResult {
  const components = splitSupportedComponents(input).map((component) =>
    selectMappings(component, system, calculation, vowelPolicy),
  );

  const aggregate =
    strategy === "reduce-components"
      ? components.reduce((sum, component) => sum + component.reduction.value, 0)
      : components.reduce((sum, component) => sum + component.sum, 0);

  const reduction = reduceNumber(aggregate, system.reductionPolicy);
  return {
    system: system.id,
    calculation,
    strategy,
    originalInput: input,
    components,
    aggregate,
    reduction,
    value: reduction.value,
    vowelPolicy,
  };
}

export function calculateExpressionComponents(
  input: string,
  system: NumerologySystem,
  strategy: NameReductionStrategy = "reduce-components",
): ComponentAwareNameResult {
  return calculateComponentAwareName(input, system, "expression", strategy, null);
}

export function calculateSoulUrgeComponents(
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
  strategy: NameReductionStrategy = "reduce-components",
): ComponentAwareNameResult {
  return calculateComponentAwareName(input, system, "soul-urge", strategy, vowelPolicy);
}

export function calculatePersonalityComponents(
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
  strategy: NameReductionStrategy = "reduce-components",
): ComponentAwareNameResult {
  return calculateComponentAwareName(input, system, "personality", strategy, vowelPolicy);
}
