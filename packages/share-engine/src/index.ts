import { assertPublicSharePayloadSafe, type PublicSharePayload } from "@prime-numera/numerology-core";

export type OpaqueShareId = string & { readonly __opaqueShareId: unique symbol };
export type ShareVisibility = "public" | "private";

export interface ShareRecord {
  readonly id: OpaqueShareId;
  readonly payload: PublicSharePayload;
  readonly createdAt: string;
  readonly expiresAt: string | null;
  readonly ownerId?: string;
  /** Legacy owned records without visibility remain private. */
  readonly visibility?: ShareVisibility;
}

export interface ShareStore {
  /** Insert only. An existing identifier must never be overwritten. */
  readonly put: (record: ShareRecord) => Promise<void>;
  readonly get: (id: OpaqueShareId) => Promise<ShareRecord | null>;
  readonly delete: (id: OpaqueShareId) => Promise<void>;
}

export interface ShareRecordOptions {
  readonly createdAt: string;
  readonly expiresAt?: string | null;
  readonly randomFill?: (bytes: Uint8Array) => void;
  readonly ownerId?: string;
  readonly visibility?: ShareVisibility;
}

const SHARE_ID_PATTERN = /^sh_[0-9a-f]{48}$/u;

export function parseShareTimestamp(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value)) {
    throw new RangeError("Share timestamps must be full ISO UTC timestamps.");
  }
  const timestamp = Date.parse(value);
  const canonical = value.includes(".") ? value : value.replace("Z", ".000Z");
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== canonical) {
    throw new RangeError("Invalid share timestamp.");
  }
  return timestamp;
}

function defaultRandomFill(bytes: Uint8Array): void {
  globalThis.crypto.getRandomValues(bytes);
}

export function assertOpaqueShareId(value: unknown): asserts value is OpaqueShareId {
  if (typeof value !== "string" || !SHARE_ID_PATTERN.test(value)) {
    throw new RangeError("Share ID must be a 192-bit opaque identifier.");
  }
}

export function generateOpaqueShareId(randomFill: (bytes: Uint8Array) => void = defaultRandomFill): OpaqueShareId {
  const bytes = new Uint8Array(24);
  randomFill(bytes);
  const id = `sh_${[...bytes].map(value => value.toString(16).padStart(2, "0")).join("")}`;
  assertOpaqueShareId(id);
  return id;
}

export function buildPublicSharePath(id: OpaqueShareId): string {
  assertOpaqueShareId(id);
  return `/s/${id}`;
}

export function createShareRecord(payload: PublicSharePayload, options: ShareRecordOptions): ShareRecord {
  assertPublicSharePayloadSafe(payload);
  const record: ShareRecord = {
    id: generateOpaqueShareId(options.randomFill),
    payload: structuredClone(payload),
    createdAt: options.createdAt,
    expiresAt: options.expiresAt ?? null,
    visibility: options.visibility ?? (options.ownerId === undefined ? "public" : "private"),
    ...(options.ownerId === undefined ? {} : { ownerId: options.ownerId }),
  };
  assertShareRecordSafe(record);
  return record;
}

export interface ShareClock { now(): string; }

export function shareVisibility(record: ShareRecord): ShareVisibility {
  return record.visibility ?? (record.ownerId === undefined ? "public" : "private");
}

/** Internal service API: never serialize its record (which contains owner metadata) in a response. */
export async function resolveShare(store: ShareStore, idInput: string, clock: ShareClock, requesterId?: string): Promise<ShareRecord | null> {
  assertOpaqueShareId(idInput);
  const now = parseShareTimestamp(clock.now());
  const record = await store.get(idInput);
  if (!record) return null;
  assertShareRecordSafe(record);
  if (record.id !== idInput) throw new Error("Share store returned a mismatched record.");
  if (record.expiresAt !== null && parseShareTimestamp(record.expiresAt) <= now) {
    await store.delete(idInput);
    return null;
  }
  if (parseShareTimestamp(record.createdAt) > now) return null;
  if (shareVisibility(record) === "private" && record.ownerId !== requesterId) return null;
  return record;
}

/** HTTP renderers receive only the explicit disclosure projection, never ownership metadata. */
export async function resolveSharePayload(store: ShareStore, idInput: string, clock: ShareClock, requesterId?: string): Promise<PublicSharePayload | null> {
  const record = await resolveShare(store, idInput, clock, requesterId);
  return record ? structuredClone(record.payload) : null;
}

export async function deleteShare(store: ShareStore, idInput: string, requesterId: string): Promise<boolean> {
  assertOpaqueShareId(idInput);
  const record = await store.get(idInput);
  if (!record) return false;
  assertShareRecordSafe(record);
  if (record.id !== idInput) throw new Error("Share store returned a mismatched record.");
  if (record.ownerId === undefined || record.ownerId !== requesterId) return false;
  await store.delete(idInput);
  return true;
}

/** Origins come from trusted server configuration, never the request Host header. */
export function buildShareUrl(origin: string, id: OpaqueShareId): string {
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new RangeError("Share origin must be a bare HTTPS origin.");
  }
  return new URL(buildPublicSharePath(id), url).toString();
}

export const SHARE_CANVAS_SIZES = {
  "9:16": { width: 1080, height: 1920 }, "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 }, "16:9": { width: 1920, height: 1080 },
} as const;

export function assertShareRecordSafe(input: unknown): asserts input is ShareRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Invalid share record.");
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError("Invalid share record prototype.");
  const required = ["id", "payload", "createdAt", "expiresAt"];
  const allowed = [...required, "ownerId", "visibility"];
  if (required.some(key => !Object.hasOwn(input, key)) || Reflect.ownKeys(input).some(key =>
    typeof key !== "string" || !allowed.includes(key) || !Object.hasOwn(Object.getOwnPropertyDescriptor(input, key)!, "value"))) {
    throw new TypeError("Invalid share record fields.");
  }
  const record = input as Record<string, unknown>;
  assertOpaqueShareId(record.id);
  assertPublicSharePayloadSafe(record.payload);
  const created = parseShareTimestamp(record.createdAt);
  if (record.expiresAt !== null && parseShareTimestamp(record.expiresAt) <= created) throw new RangeError("Expiration must follow creation.");
  if (Object.hasOwn(record, "ownerId") && (typeof record.ownerId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/u.test(record.ownerId))) {
    throw new TypeError("Owner must be an opaque internal identifier.");
  }
  if (Object.hasOwn(record, "visibility") && record.visibility !== "public" && record.visibility !== "private") throw new TypeError("Invalid share visibility.");
  if (record.visibility === "private" && record.ownerId === undefined) throw new TypeError("Private shares require an owner.");
}
