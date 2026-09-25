import type { NumerologySystem } from "./types.js";

const mapGroups = (groups: Readonly<Record<number, string>>): Readonly<Record<string, number>> => {
  const result: Record<string, number> = {};
  for (const [value, letters] of Object.entries(groups)) {
    for (const letter of letters) result[letter] = Number(value);
  }
  return Object.freeze(result);
};

export const PYTHAGOREAN: NumerologySystem = {
  id: "pythagorean",
  name: "Pythagorean",
  historicalContext:
    "Modern Western numerology commonly described as Pythagorean. Historical claims connecting modern letter mappings directly to Pythagoras require careful sourcing and must not be overstated.",
  mappings: mapGroups({
    1: "AJS",
    2: "BKT",
    3: "CLU",
    4: "DMV",
    5: "ENW",
    6: "FOX",
    7: "GPY",
    8: "HQZ",
    9: "IR",
  }),
  reductionPolicy: { preserveMasterNumbers: [11, 22, 33] },
};

export const CHALDEAN: NumerologySystem = {
  id: "chaldean",
  name: "Chaldean",
  historicalContext:
    "A modern numerological letter-value system conventionally called Chaldean. Claims about direct continuity with ancient Mesopotamian practice require source-specific historical qualification.",
  mappings: mapGroups({
    1: "AIJQY",
    2: "BKR",
    3: "CGLS",
    4: "DMT",
    5: "EHNX",
    6: "UVW",
    7: "OZ",
    8: "FP",
  }),
  reductionPolicy: { preserveMasterNumbers: [11, 22, 33] },
};

export const SYSTEMS = Object.freeze({
  pythagorean: PYTHAGOREAN,
  chaldean: CHALDEAN,
});
