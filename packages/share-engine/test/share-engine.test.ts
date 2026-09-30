import { describe, expect, it } from "vitest";
import {
  calculatePythagoreanProfile,
  createPublicSharePayload,
} from "@prime-numera/numerology-core";
import {
  assertOpaqueShareId,
  assertShareRecordSafe,
  buildPublicSharePath,
  createShareRecord,
  generateOpaqueShareId,
  buildShareUrl,
  deleteShare,
  resolveShare,
  SHARE_CANVAS_SIZES,
  type ShareRecord,
} from "../src/index.js";

const profile = calculatePythagoreanProfile({
  birthName: {
    firstNames: "Mary",
    middleNames: "Elizabeth",
    lastNames: "Johnson",
  },
  birthDate: { year: 1990, month: 5, day: 15 },
  vowelPolicy: { y: "contextual" },
});

describe("share lifecycle", () => {
  it("expires, authorizes, and deletes owner-controlled records", async () => {
    const record = createShareRecord(payload, {
      createdAt: "2026-09-26T12:00:00Z",
      expiresAt: "2026-09-28T12:00:00Z",
      ownerId: "owner-1",
      randomFill: deterministicFill,
    });
    const records = new Map<string, ShareRecord>([[record.id, record]]);
    const store = {
      async put(value: ShareRecord) { records.set(value.id, value); },
      async get(id: string) { return records.get(id) ?? null; },
      async delete(id: string) { records.delete(id); },
    };
    const before = { now: () => "2026-09-27T12:00:00Z" };
    expect(await resolveShare(store, record.id, before)).toBeNull();
    expect(await resolveShare(store, record.id, before, "owner-1")).toEqual(record);
    expect(await deleteShare(store, record.id, "other")).toBe(false);
    expect(await resolveShare(store, record.id, { now: () => "2026-09-28T12:00:00Z" }, "owner-1")).toBeNull();
    expect(records.size).toBe(0);
  });

  it("creates a safe QR/deep-link target and exact render dimensions", () => {
    const id = generateOpaqueShareId(deterministicFill);
    expect(buildShareUrl("https://example.com/", id)).toBe(`https://example.com/s/${id}`);
    expect(() => buildShareUrl("http://example.com/", id)).toThrow();
    expect(() => buildShareUrl("https://example.com/?birthDate=1990", id)).toThrow();
    expect(Object.keys(SHARE_CANVAS_SIZES)).toEqual(["9:16", "1:1", "4:5", "16:9"]);
  });
});

const payload = createPublicSharePayload(profile, {
  calculations: ["life-path", "expression"],
  displayLabel: "M.",
  aspectRatio: "1:1",
});

const deterministicFill = (bytes: Uint8Array): void => {
  bytes.fill(0xab);
};

describe("opaque public shares", () => {
  it("generates a 192-bit opaque ID", () => {
    const id = generateOpaqueShareId(deterministicFill);
    expect(id).toBe(`sh_${"ab".repeat(24)}`);
    expect(() => assertOpaqueShareId(id)).not.toThrow();
  });

  it("builds a path containing only the opaque ID", () => {
    const id = generateOpaqueShareId(deterministicFill);
    const path = buildPublicSharePath(id);
    expect(path).toBe(`/s/sh_${"ab".repeat(24)}`);
    expect(path).not.toContain("Mary");
    expect(path).not.toContain("1990");
  });

  it("creates a public-safe record with injected time and entropy", () => {
    const record = createShareRecord(payload, {
      createdAt: "2026-09-26T12:00:00Z",
      expiresAt: "2026-10-26T12:00:00Z",
      randomFill: deterministicFill,
    });

    expect(record.createdAt).toBe("2026-09-26T12:00:00Z");
    expect(record.expiresAt).toBe("2026-10-26T12:00:00Z");
    expect(() => assertShareRecordSafe(record)).not.toThrow();

    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain("Mary");
    expect(serialized).not.toContain("Elizabeth");
    expect(serialized).not.toContain("Johnson");
    expect(serialized).not.toContain("1990");
  });

  it("rejects malformed or guessable-looking IDs", () => {
    expect(() => assertOpaqueShareId("mary-1990-life-path-7")).toThrow(RangeError);
    expect(() => assertOpaqueShareId("sh_deadbeef")).toThrow(RangeError);
  });

  it("rejects invalid expiration ordering", () => {
    expect(() =>
      createShareRecord(payload, {
        createdAt: "2026-09-26T12:00:00Z",
        expiresAt: "2026-09-25T12:00:00Z",
        randomFill: deterministicFill,
      }),
    ).toThrow(RangeError);
  });
});
