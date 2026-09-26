import { normalizeLatinName } from "./name.js";
import type { NumerologySystem } from "./types.js";
import { isVowel, type VowelPolicy } from "./vowels.js";

export interface NameStructureResult {
  readonly normalizedInput: string;
  readonly cornerstone: string;
  readonly capstone: string;
  readonly firstVowel: string | null;
  readonly cornerstoneValue: number;
  readonly capstoneValue: number;
  readonly firstVowelValue: number | null;
  readonly vowelPolicy: VowelPolicy;
}

function assertSingleFirstNameInput(input: string): void {
  if (/\s/u.test(input.trim())) {
    throw new RangeError(
      "Cornerstone, Capstone, and First Vowel require the first name only, not a full name.",
    );
  }
}

export function calculateFirstNameStructure(
  firstName: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
): NameStructureResult {
  assertSingleFirstNameInput(firstName);
  const normalizedInput = normalizeLatinName(firstName).normalized;
  if (!normalizedInput) throw new RangeError("First name must contain a supported Latin letter.");
  const letters = [...normalizedInput];
  const cornerstone = letters[0]!;
  const capstone = letters[letters.length - 1]!;
  const firstVowelIndex = letters.findIndex((letter, index) =>
    isVowel(letter, vowelPolicy, {
      ...(letters[index - 1] !== undefined ? { previous: letters[index - 1] } : {}),
      ...(letters[index + 1] !== undefined ? { next: letters[index + 1] } : {}),
    }),
  );
  const firstVowel = firstVowelIndex >= 0 ? letters[firstVowelIndex]! : null;
  return {
    normalizedInput,
    cornerstone,
    capstone,
    firstVowel,
    cornerstoneValue: system.mappings[cornerstone]!,
    capstoneValue: system.mappings[capstone]!,
    firstVowelValue: firstVowel ? system.mappings[firstVowel]! : null,
    vowelPolicy,
  };
}

/** @deprecated Use calculateFirstNameStructure to make the input scope explicit. */
export const calculateNameStructure = calculateFirstNameStructure;
