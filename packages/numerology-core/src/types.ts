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

export interface NumerologySystem {
  readonly id: NumerologySystemId;
  readonly name: string;
  readonly historicalContext: string;
  readonly mappings: Readonly<Record<string, number>>;
  readonly reductionPolicy: ReductionPolicy;
}
