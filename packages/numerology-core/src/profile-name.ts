import { normalizeLatinName } from "./name.js";
import { reduceNumber } from "./reduction.js";
import type { NumerologySystem, ReductionResult } from "./types.js";
import { isVowel, type VowelPolicy } from "./vowels.js";

export interface FilteredNameCalculationResult {
  readonly system: NumerologySystem["id"];
  readonly calculation: "soul-urge" | "personality";
  readonly originalInput: string;
  readonly normalizedInput: string;
  readonly selectedLetters: readonly { readonly character: string; readonly value: number }[];
  readonly sum: number;
  readonly reduction: ReductionResult;
  readonly value: number;
  readonly vowelPolicy: VowelPolicy;
}

function calculateFilteredName(
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
  selectVowels: boolean,
): FilteredNameCalculationResult {
  const normalized = normalizeLatinName(input);
  if (!normalized.normalized) throw new RangeError("Name must contain a supported Latin letter.");
  const letters = [...normalized.normalized];
  const selectedLetters = letters.flatMap((character, index) => {
    const vowel = isVowel(character, vowelPolicy, {
      ...(letters[index - 1] !== undefined ? { previous: letters[index - 1] } : {}),
      ...(letters[index + 1] !== undefined ? { next: letters[index + 1] } : {}),
    });
    if (vowel !== selectVowels) return [];
    const value = system.mappings[character];
    if (value === undefined) throw new Error(`No ${system.id} mapping for ${character}.`);
    return [{ character, value }];
  });
  const sum = selectedLetters.reduce((total, letter) => total + letter.value, 0);
  const reduction = reduceNumber(sum, system.reductionPolicy);
  return {
    system: system.id,
    calculation: selectVowels ? "soul-urge" : "personality",
    originalInput: input,
    normalizedInput: normalized.normalized,
    selectedLetters,
    sum,
    reduction,
    value: reduction.value,
    vowelPolicy,
  };
}

export const calculateSoulUrge = (
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
): FilteredNameCalculationResult => calculateFilteredName(input, system, vowelPolicy, true);

export const calculatePersonality = (
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
): FilteredNameCalculationResult => calculateFilteredName(input, system, vowelPolicy, false);
