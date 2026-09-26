import { normalizeLatinName } from "./name.js";
import type { NumerologySystem } from "./types.js";

export type ExpressionPlane = "physical" | "mental" | "emotional" | "intuitive";

export interface PlaneDefinition {
  readonly plane: ExpressionPlane;
  readonly letters: readonly string[];
}

export interface PlaneResult {
  readonly plane: ExpressionPlane;
  readonly configuredLetters: readonly string[];
  readonly matchedLetters: readonly string[];
  readonly mappedValues: readonly number[];
  readonly count: number;
  readonly rawValue: number;
}

export interface PlanesMethodology {
  readonly id: string;
  readonly definitions: readonly PlaneDefinition[];
}

export const FOUNDATION_PLANES_METHODOLOGY = Object.freeze({
  id: "decoz-western-planes-v1",
  definitions: [
    { plane: "physical", letters: ["D", "E", "M", "W"] },
    { plane: "mental", letters: ["A", "G", "H", "J", "L", "N", "P"] },
    { plane: "emotional", letters: ["B", "I", "O", "R", "S", "T", "X", "Z"] },
    { plane: "intuitive", letters: ["C", "F", "K", "Q", "U", "V", "Y"] },
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
    const matchedLetters = [...normalized].filter((letter) => definition.letters.includes(letter));
    const mappedValues = matchedLetters.map((letter) => {
      const value = system.mappings[letter];
      if (value === undefined) throw new Error(`No ${system.id} mapping for ${letter}.`);
      return value;
    });
    return {
      plane: definition.plane,
      configuredLetters: definition.letters,
      matchedLetters,
      mappedValues,
      count: matchedLetters.length,
      rawValue: mappedValues.reduce((sum, value) => sum + value, 0),
    };
  });
}
