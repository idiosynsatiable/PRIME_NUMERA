import type { NumerologySystem } from "./types.js";
import { normalizeLatinName } from "./name.js";

export interface NameValueDelta {
  readonly letter: string;
  readonly beforeCount: number;
  readonly afterCount: number;
  readonly countDelta: number;
  readonly valuePerLetter: number;
  readonly valueDelta: number;
}

export interface NameComparison {
  readonly beforeNormalized: string;
  readonly afterNormalized: string;
  readonly deltas: readonly NameValueDelta[];
  readonly totalValueDelta: number;
}

export function compareNameValues(
  before: string,
  after: string,
  system: NumerologySystem,
): NameComparison {
  const beforeNormalized = normalizeLatinName(before).normalized;
  const afterNormalized = normalizeLatinName(after).normalized;
  const alphabet = new Set([...beforeNormalized, ...afterNormalized]);
  const count = (value: string, letter: string): number => [...value].filter((x) => x === letter).length;
  const deltas = [...alphabet]
    .sort()
    .map((letter) => {
      const beforeCount = count(beforeNormalized, letter);
      const afterCount = count(afterNormalized, letter);
      const countDelta = afterCount - beforeCount;
      const valuePerLetter = system.mappings[letter];
      if (valuePerLetter === undefined) throw new Error(`No ${system.id} mapping for ${letter}.`);
      return { letter, beforeCount, afterCount, countDelta, valuePerLetter, valueDelta: countDelta * valuePerLetter };
    })
    .filter((delta) => delta.countDelta !== 0);

  return {
    beforeNormalized,
    afterNormalized,
    deltas,
    totalValueDelta: deltas.reduce((sum, delta) => sum + delta.valueDelta, 0),
  };
}
