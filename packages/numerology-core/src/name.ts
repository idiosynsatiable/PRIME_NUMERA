import { reduceNumber } from "./reduction.js";
import type {
  NameCalculationResult,
  NameNormalizationResult,
  NumerologySystem,
} from "./types.js";

export function normalizeLatinName(input: string): NameNormalizationResult {
  const original = input;
  const decomposed = input.normalize("NFKD").toUpperCase();
  const normalizedCharacters: string[] = [];
  const ignoredCharacters: string[] = [];

  for (const character of decomposed) {
    if (/\p{M}/u.test(character)) continue;
    if (/[A-Z]/.test(character)) normalizedCharacters.push(character);
    else if (!/\s/u.test(character) && character !== "-" && character !== "'") {
      ignoredCharacters.push(character);
    }
  }

  return {
    original,
    normalized: normalizedCharacters.join(""),
    ignoredCharacters,
  };
}

export function calculateExpression(
  input: string,
  system: NumerologySystem,
): NameCalculationResult {
  const normalized = normalizeLatinName(input);
  if (normalized.normalized.length === 0) {
    throw new RangeError("Name must contain at least one supported Latin letter.");
  }

  const mappings = [...normalized.normalized].map((character) => {
    const value = system.mappings[character];
    if (value === undefined) throw new Error(`No ${system.id} mapping for ${character}.`);
    return { character, normalizedCharacter: character, value };
  });

  const sum = mappings.reduce((total, mapping) => total + mapping.value, 0);
  const reduction = reduceNumber(sum, system.reductionPolicy);

  return {
    system: system.id,
    calculation: "expression",
    originalInput: input,
    normalizedInput: normalized.normalized,
    mappings,
    sum,
    reduction,
    value: reduction.value,
  };
}
