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

export function calculateNameStructure(
  input: string,
  system: NumerologySystem,
  vowelPolicy: VowelPolicy,
): NameStructureResult {
  const normalizedInput = normalizeLatinName(input).normalized;
  if (!normalizedInput) throw new RangeError("Name must contain a supported Latin letter.");
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
