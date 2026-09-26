import type { NumerologySystemId } from "./types.js";

export type InterpretationCategory =
  | "traditional"
  | "modern"
  | "entertainment"
  | "historical-context";

export type InterpretationEditorialStatus =
  | "draft"
  | "reviewed"
  | "approved"
  | "deprecated";

export type InterpretationAgeMode = "family" | "standard" | "adult-18-plus";

export type InterpretationEvidenceClass =
  | "arithmetic"
  | "historical-source"
  | "traditional-interpretation"
  | "modern-interpretation"
  | "entertainment-interpretation";

export interface InterpretationSource {
  readonly id: string;
  readonly title: string;
  readonly url?: string;
  readonly author?: string;
  readonly publishedAt?: string;
  readonly classification:
    | "primary-historical"
    | "academic-secondary"
    | "modern-methodology"
    | "modern-interpretation"
    | "editorial";
  readonly note?: string;
}

export interface InterpretationApplicability {
  readonly systems: readonly NumerologySystemId[];
  readonly calculations: readonly string[];
  readonly values?: readonly number[];
}

export interface InterpretationRecord {
  readonly id: string;
  readonly version: number;
  readonly locale: string;
  readonly category: InterpretationCategory;
  readonly evidenceClass: InterpretationEvidenceClass;
  readonly editorialStatus: InterpretationEditorialStatus;
  readonly ageModes: readonly InterpretationAgeMode[];
  readonly applicability: InterpretationApplicability;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly sourceIds: readonly string[];
  readonly disclaimers?: readonly string[];
}

export interface InterpretationCatalog {
  readonly schemaVersion: 1;
  readonly sources: readonly InterpretationSource[];
  readonly records: readonly InterpretationRecord[];
}

export interface InterpretationQuery {
  readonly system: NumerologySystemId;
  readonly calculation: string;
  readonly value?: number;
  readonly locale: string;
  readonly ageMode: InterpretationAgeMode;
  readonly includeDrafts?: boolean;
}

const FORBIDDEN_CERTAINTY_PATTERNS = [
  /scientifically proven/iu,
  /guarantees? (?:wealth|success|love|health)/iu,
  /will definitely/iu,
  /diagnos(?:e|es|ed|is)/iu,
  /predicts? your (?:health|death|lifespan)/iu,
  /medical advice/iu,
] as const;

function assertUniqueNonEmpty(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value.trim()) throw new RangeError(`${field} cannot contain an empty value.`);
    if (seen.has(value)) throw new RangeError(`${field} contains duplicate value: ${value}.`);
    seen.add(value);
  }
}

function validateSource(source: InterpretationSource): void {
  if (!source.id.trim()) throw new RangeError("Interpretation source ID cannot be empty.");
  if (!source.title.trim()) throw new RangeError(`Source ${source.id} must have a title.`);
  if (source.url) {
    let parsed: URL;
    try {
      parsed = new URL(source.url);
    } catch {
      throw new RangeError(`Source ${source.id} has an invalid URL.`);
    }
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new RangeError(`Source ${source.id} must use http or https.`);
    }
  }
}

function validateRecord(
  record: InterpretationRecord,
  sourceIds: ReadonlySet<string>,
): void {
  if (!record.id.trim()) throw new RangeError("Interpretation record ID cannot be empty.");
  if (!Number.isSafeInteger(record.version) || record.version < 1) {
    throw new RangeError(`Interpretation ${record.id} version must be a positive integer.`);
  }
  if (!record.locale.trim()) throw new RangeError(`Interpretation ${record.id} locale cannot be empty.`);
  if (!record.title.trim() || !record.summary.trim() || !record.body.trim()) {
    throw new RangeError(`Interpretation ${record.id} requires title, summary, and body.`);
  }
  if (record.applicability.systems.length === 0 || record.applicability.calculations.length === 0) {
    throw new RangeError(`Interpretation ${record.id} must declare system and calculation applicability.`);
  }
  if (record.ageModes.length === 0) {
    throw new RangeError(`Interpretation ${record.id} must declare at least one age mode.`);
  }

  assertUniqueNonEmpty(record.sourceIds, `${record.id}.sourceIds`);
  assertUniqueNonEmpty(record.applicability.calculations, `${record.id}.calculations`);

  for (const sourceId of record.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      throw new RangeError(`Interpretation ${record.id} references missing source ${sourceId}.`);
    }
  }

  if (
    record.evidenceClass === "arithmetic" &&
    record.category !== "historical-context"
  ) {
    throw new RangeError(
      `Interpretation ${record.id} cannot label interpretive prose as arithmetic evidence.`,
    );
  }

  if (
    (record.evidenceClass === "traditional-interpretation" ||
      record.evidenceClass === "modern-interpretation") &&
    record.sourceIds.length === 0
  ) {
    throw new RangeError(
      `Interpretation ${record.id} requires a source for sourced interpretive claims.`,
    );
  }

  const prose = `${record.title}\n${record.summary}\n${record.body}`;
  for (const pattern of FORBIDDEN_CERTAINTY_PATTERNS) {
    if (pattern.test(prose)) {
      throw new RangeError(
        `Interpretation ${record.id} contains prohibited certainty/scientific/medical phrasing.`,
      );
    }
  }
}

export function validateInterpretationCatalog(catalog: InterpretationCatalog): void {
  if (catalog.schemaVersion !== 1) {
    throw new RangeError("Unsupported interpretation catalog schema version.");
  }

  const sourceIds = new Set<string>();
  for (const source of catalog.sources) {
    validateSource(source);
    if (sourceIds.has(source.id)) {
      throw new RangeError(`Duplicate interpretation source ID: ${source.id}.`);
    }
    sourceIds.add(source.id);
  }

  const recordVersions = new Set<string>();
  for (const record of catalog.records) {
    validateRecord(record, sourceIds);
    const versionKey = `${record.id}@${record.version}`;
    if (recordVersions.has(versionKey)) {
      throw new RangeError(`Duplicate interpretation record version: ${versionKey}.`);
    }
    recordVersions.add(versionKey);
  }
}

export function queryInterpretations(
  catalog: InterpretationCatalog,
  query: InterpretationQuery,
): readonly InterpretationRecord[] {
  validateInterpretationCatalog(catalog);

  return catalog.records.filter((record) => {
    if (!query.includeDrafts && record.editorialStatus === "draft") return false;
    if (record.editorialStatus === "deprecated") return false;
    if (record.locale !== query.locale) return false;
    if (!record.ageModes.includes(query.ageMode)) return false;
    if (!record.applicability.systems.includes(query.system)) return false;
    if (!record.applicability.calculations.includes(query.calculation)) return false;

    if (
      query.value !== undefined &&
      record.applicability.values !== undefined &&
      !record.applicability.values.includes(query.value)
    ) {
      return false;
    }

    return true;
  });
}
