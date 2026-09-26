import {
  assertPublicSharePayloadSafe,
  type PublicSharePayload,
} from "@prime-numera/numerology-core";

export type OpaqueShareId = string & { readonly __opaqueShareId: unique symbol };

export interface ShareRecord {
  readonly id: OpaqueShareId;
  readonly payload: PublicSharePayload;
  readonly createdAt: string;
  readonly expiresAt: string | null;
}

export interface ShareStore {
  readonly put: (record: ShareRecord) => Promise<void>;
  readonly get: (id: OpaqueShareId) => Promise<ShareRecord | null>;
  readonly delete: (id: OpaqueShareId) => Promise<void>;
}

export interface ShareRecordOptions {
  readonly createdAt: string;
  readonly expiresAt?: string | null;
  readonly randomFill?: (bytes: Uint8Array) => void;
}

const SHARE_ID_PATTERN = /^sh_[0-9a-f]{48}$/u;

function parseTimestamp(value: string, label: string): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${label} must be a valid ISO-compatible timestamp.`);
  }
  return timestamp;
}

function defaultRandomFill(bytes: Uint8Array): void {
  globalThis.crypto.getRandomValues(bytes);
}

export function assertOpaqueShareId(value: string): asserts value is OpaqueShareId {
  if (!SHARE_ID_PATTERN.test(value)) {
    throw new RangeError("Share ID must be a 192-bit opaque identifier.");
  }
}

export function generateOpaqueShareId(
  randomFill: (bytes: Uint8Array) => void = defaultRandomFill,
): OpaqueShareId {
  const bytes = new Uint8Array(24);
  randomFill(bytes);
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  const id = `sh_${hex}`;
  assertOpaqueShareId(id);
  return id;
}

export function buildPublicSharePath(id: OpaqueShareId): string {
  assertOpaqueShareId(id);
  return `/s/${id}`;
}

export function createShareRecord(
  payload: PublicSharePayload,
  options: ShareRecordOptions,
): ShareRecord {
  assertPublicSharePayloadSafe(payload);

  const createdTimestamp = parseTimestamp(options.createdAt, "createdAt");
  const expiresAt = options.expiresAt ?? null;
  if (expiresAt !== null) {
    const expiresTimestamp = parseTimestamp(expiresAt, "expiresAt");
    if (expiresTimestamp <= createdTimestamp) {
      throw new RangeError("expiresAt must be later than createdAt.");
    }
  }

  return {
    id: generateOpaqueShareId(options.randomFill),
    payload,
    createdAt: options.createdAt,
    expiresAt,
  };
}

export function assertShareRecordSafe(record: ShareRecord): void {
  assertOpaqueShareId(record.id);
  assertPublicSharePayloadSafe(record.payload);

  const serialized = JSON.stringify(record);
  const forbiddenKeys = [
    "birthName",
    "birthDate",
    "fullBirthName",
    "originalInput",
    "normalizedInput",
    "email",
    "phone",
  ];

  for (const key of forbiddenKeys) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Share record contains forbidden field: ${key}.`);
    }
  }
}
