import { normalizeLatinName } from "./name.js";
import type { NumerologySystem } from "./types.js";

export type ExpressionPlane = "physical" | "mental" | "emotional" | "intuitive";

export interface PlaneDefinition {
  readonly plane: ExpressionPlane;
  readonly values: readonly number[];
}

export interface PlaneResult extends PlaneDefinition {
  readonly letters: readonly string[];
  readonly count: number;
  readonly rawValue: number;
}

export interface PlanesMethodology {
  readonly id: string;
  readonly definitions: readonly PlaneDefinition[];
}

export const FOUNDATION_PLANES_METHODOLOGY = Object.freeze({
  id: "western-planes-configurable-v1",
  definitions: [
    { plane: "physical", values: [4, 5] },
    { plane: "mental", values: [1, 8] },
    { plane: "emotional", values: [2, 3, 6] },
    { plane: "intuitive", values: [7, 9] },
  ] as const,
} satisfies PlanesMethodology);

export function calculatePlanesOfExpression(
  input: string,
  system: NumerologySystem,
  methodology: PlanesMethodology = FOUNDATION_PLANES_METHODOLOGY,
): readonly PlaneResult[] {
  const normalized = normalizeLatinName(input).normalized;
  if (!normalized) throw new RangeError("Name must contain a supported Latin letter.");
  return methodology.definitions.map((definition) => {
    const letters = [...normalized].filter((letter) => {
      const value = system.mappings[letter];
      return value !== undefined && definition.values.includes(value);
    });
    return {
      ...definition,
      letters,
      count: letters.length,
      rawValue: letters.reduce((sum, letter) => sum + (system.mappings[letter] ?? 0), 0),
    };
  });
}
