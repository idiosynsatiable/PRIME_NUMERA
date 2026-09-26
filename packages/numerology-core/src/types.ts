export type NumerologySystemId = "pythagorean" | "chaldean";

export type MasterNumber = 11 | 22 | 33;

export interface ReductionPolicy {
  readonly preserveMasterNumbers: readonly MasterNumber[];
}

export interface ReductionStep {
  readonly input: number;
  readonly digits: readonly number[];
  readonly output: number;
  readonly preservedAsMaster: boolean;
}

export interface ReductionResult {
  readonly value: number;
  readonly steps: readonly ReductionStep[];
}

export interface LetterMapping {
  readonly character: string;
  readonly normalizedCharacter: string;
  readonly value: number;
}

export interface NameNormalizationResult {
  readonly original: string;
  readonly normalized: string;
  readonly ignoredCharacters: readonly string[];
}

export interface NameCalculationResult {
  readonly system: NumerologySystemId;
  readonly calculation: "expression";
  readonly originalInput: string;
  readonly normalizedInput: string;
  readonly mappings: readonly LetterMapping[];
  readonly sum: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export interface NormalizationPolicy {
  readonly id: string;
  readonly unicodeForm: "NFKD";
  readonly supportedScript: "latin";
  readonly transliteration: "none";
  readonly separators: readonly string[];
  readonly unsupportedCharacters: "report";
}

export type SupportedSystemCalculation =
  | "expression"
  | "soul-urge"
  | "personality"
  | "name-frequency"
  | "name-diff"
  | "balance"
  | "rational-thought"
  | "planes-of-expression"
  | "transits"
  | "essence";

export interface NumerologyCitation {
  readonly title: string;
  readonly url: string;
  readonly classification:
    | "modern-methodology"
    | "bibliographic-primary"
    | "historical-secondary";
  readonly note?: string;
}

export interface NumerologySystem {
  readonly id: NumerologySystemId;
  readonly name: string;
  readonly historicalContext: string;
  readonly mappings: Readonly<Record<string, number>>;
  readonly normalizationPolicy: NormalizationPolicy;
  readonly reductionPolicy: ReductionPolicy;
  readonly masterNumbers: readonly MasterNumber[];
  readonly supportedCalculations: readonly SupportedSystemCalculation[];
  readonly citations: readonly NumerologyCitation[];
}
