import { normalizeLatinName } from "./name.js";
import type { NumerologySystem } from "./types.js";

export interface NumberFrequency {
  readonly value: number;
  readonly count: number;
  readonly letters: readonly string[];
}

export interface FrequencyAnalysis {
  readonly frequencies: readonly NumberFrequency[];
  readonly missingValues: readonly number[];
  readonly hiddenPassionValues: readonly number[];
  readonly representedValueCount: number;
  readonly karmicLessonValues: readonly number[] | null;
  readonly subconsciousSelfValue: number | null;
  /** @deprecated Use representedValueCount for the raw fact or subconsciousSelfValue for the sourced Pythagorean derivation. */
  readonly subconsciousSelfCount: number;
}

function supportsOneThroughNineDerivations(system: NumerologySystem): boolean {
  const values = [...new Set(Object.values(system.mappings))].sort((a, b) => a - b);
  return values.length === 9 && values.every((value, index) => value === index + 1);
}

export function analyzeNameFrequencies(input: string, system: NumerologySystem): FrequencyAnalysis {
  const normalized = normalizeLatinName(input).normalized;
  if (!normalized) throw new RangeError("Name must contain a supported Latin letter.");
  const supportedValues = [...new Set(Object.values(system.mappings))].sort((a, b) => a - b);
  const frequencies = supportedValues.map((value) => {
    const letters = [...normalized].filter((letter) => system.mappings[letter] === value);
    return { value, count: letters.length, letters };
  });
  const missingValues = frequencies.filter((item) => item.count === 0).map((item) => item.value);
  const max = Math.max(...frequencies.map((item) => item.count));
  const hiddenPassionValues = frequencies
    .filter((item) => item.count === max && max > 0)
    .map((item) => item.value);
  const representedValueCount = supportedValues.length - missingValues.length;
  const pythagoreanDerivationsApply = supportsOneThroughNineDerivations(system);

  return {
    frequencies,
    missingValues,
    hiddenPassionValues,
    representedValueCount,
    karmicLessonValues: pythagoreanDerivationsApply ? missingValues : null,
    subconsciousSelfValue: pythagoreanDerivationsApply ? 9 - missingValues.length : null,
    subconsciousSelfCount: representedValueCount,
  };
}
