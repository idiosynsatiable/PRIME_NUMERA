import type {
  CulturalAtlasCatalog,
  CulturalClaim,
  CulturalModule,
  CulturalSource,
} from "./types.js";

function nonEmpty(value: string, label: string): void {
  if (!value.trim()) throw new RangeError(`${label} cannot be empty.`);
}

function unique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    nonEmpty(value, label);
    if (seen.has(value)) throw new RangeError(`${label} contains duplicate value: ${value}.`);
    seen.add(value);
  }
}

function validateSource(source: CulturalSource): void {
  nonEmpty(source.id, "source.id");
  nonEmpty(source.title, `${source.id}.title`);
  unique(source.languages, `${source.id}.languages`);

  let parsed: URL;
  try {
    parsed = new URL(source.url);
  } catch {
    throw new RangeError(`${source.id}.url is invalid.`);
  }
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new RangeError(`${source.id}.url must use http or https.`);
  }
}

function validateClaim(
  module: CulturalModule,
  claim: CulturalClaim,
  sourceIds: ReadonlySet<string>,
): void {
  nonEmpty(claim.id, `${module.id}.claim.id`);
  nonEmpty(claim.statement, `${module.id}.${claim.id}.statement`);
  unique(claim.sourceIds, `${module.id}.${claim.id}.sourceIds`);

  if (claim.sourceIds.length === 0 && claim.status !== "modern") {
    throw new RangeError(
      `${module.id}.${claim.id} requires sources unless explicitly classified as modern.`,
    );
  }

  for (const sourceId of claim.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      throw new RangeError(`${module.id}.${claim.id} references missing source ${sourceId}.`);
    }
  }
}

function validateModule(
  module: CulturalModule,
  sourceIds: ReadonlySet<string>,
): void {
  nonEmpty(module.id, "module.id");
  nonEmpty(module.title, `${module.id}.title`);
  if (module.kinds.length === 0) throw new RangeError(`${module.id} requires a system kind.`);
  unique(module.geography, `${module.id}.geography`);
  unique(module.periods, `${module.id}.periods`);
  unique(module.sourceIds, `${module.id}.sourceIds`);
  unique(module.cautions, `${module.id}.cautions`);

  if (module.geography.length === 0) {
    throw new RangeError(`${module.id} requires geographic scope.`);
  }
  if (module.periods.length === 0) {
    throw new RangeError(`${module.id} requires period scope.`);
  }
  if (module.cautions.length === 0) {
    throw new RangeError(`${module.id} requires at least one scope/caution note.`);
  }

  for (const sourceId of module.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      throw new RangeError(`${module.id} references missing source ${sourceId}.`);
    }
  }

  const claimIds = new Set<string>();
  for (const claim of module.claims) {
    if (claimIds.has(claim.id)) {
      throw new RangeError(`${module.id} has duplicate claim ID ${claim.id}.`);
    }
    claimIds.add(claim.id);
    validateClaim(module, claim, sourceIds);
  }
}

export function validateCulturalAtlasCatalog(catalog: CulturalAtlasCatalog): void {
  if (catalog.schemaVersion !== 1) throw new RangeError("Unsupported cultural atlas schema version.");

  const sourceIds = new Set<string>();
  for (const source of catalog.sources) {
    validateSource(source);
    if (sourceIds.has(source.id)) throw new RangeError(`Duplicate source ID: ${source.id}.`);
    sourceIds.add(source.id);
  }

  const moduleIds = new Set<string>();
  for (const module of catalog.modules) {
    if (moduleIds.has(module.id)) throw new RangeError(`Duplicate module ID: ${module.id}.`);
    moduleIds.add(module.id);
    validateModule(module, sourceIds);
  }
}
