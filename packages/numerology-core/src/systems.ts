import type { NormalizationPolicy, NumerologySystem } from "./types.js";

const mapGroups = (groups: Readonly<Record<number, string>>): Readonly<Record<string, number>> => {
  const result: Record<string, number> = {};
  for (const [value, letters] of Object.entries(groups)) {
    for (const letter of letters) result[letter] = Number(value);
  }
  return Object.freeze(result);
};

const LATIN_NAME_NORMALIZATION: NormalizationPolicy = Object.freeze({
  id: "latin-nfkd-no-transliteration-v1",
  unicodeForm: "NFKD",
  supportedScript: "latin",
  transliteration: "none",
  separators: ["space", "hyphen", "apostrophe"],
  unsupportedCharacters: "report",
});

export const PYTHAGOREAN: NumerologySystem = {
  id: "pythagorean",
  name: "Pythagorean",
  historicalContext:
    "Modern Western numerology commonly described as Pythagorean. The sequential Latin-letter mapping used here is a modern numerology convention and is not presented as proof of direct use by ancient Pythagoras.",
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
  normalizationPolicy: LATIN_NAME_NORMALIZATION,
  reductionPolicy: { preserveMasterNumbers: [11, 22, 33] },
  masterNumbers: [11, 22, 33],
  supportedCalculations: [
    "expression",
    "soul-urge",
    "personality",
    "name-frequency",
    "name-diff",
    "balance",
    "rational-thought",
    "planes-of-expression",
    "transits",
    "essence",
  ],
  citations: [
    {
      title: "How to Do Your Own Numerology Reading: Calculate Every Number",
      url: "https://www.worldnumerology.com/do-your-own-reading/",
      classification: "modern-methodology",
    },
  ],
};

export const CHALDEAN: NumerologySystem = {
  id: "chaldean",
  name: "Chaldean / Cheiro-style",
  historicalContext:
    "A modern Latin-letter numerology table conventionally called Chaldean and popularized in Western print through Cheiro. Direct continuity with ancient Chaldean or Mesopotamian practice is not claimed by PRIME NUMERA.",
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
  normalizationPolicy: LATIN_NAME_NORMALIZATION,
  reductionPolicy: { preserveMasterNumbers: [] },
  masterNumbers: [],
  supportedCalculations: ["expression", "name-frequency", "name-diff"],
  citations: [
    {
      title: "Cheiro's Book of Numbers",
      url: "https://openlibrary.org/books/OL5909902M/Cheiro%27s_book_of_numbers",
      classification: "bibliographic-primary",
      note: "Bibliographic record for the modern source associated with the Cheiro-style table.",
    },
    {
      title: "Chaldean calculator and explainer",
      url: "https://www.gemater.com/methods/chaldean",
      classification: "historical-secondary",
      note: "Documents the common table while explicitly distinguishing the table from unverified ancient-continuity claims.",
    },
  ],
};

export const SYSTEMS = Object.freeze({
  pythagorean: PYTHAGOREAN,
  chaldean: CHALDEAN,
});
