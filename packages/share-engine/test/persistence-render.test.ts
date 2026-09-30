import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";
import { PNG } from "pngjs";
import { calculatePythagoreanProfile, createPublicSharePayload, type ShareAspectRatio } from "@prime-numera/numerology-core";
import { assertShareRecordSafe, buildShareUrl, createShareRecord, deleteShare, resolveShare, resolveSharePayload, SHARE_CANVAS_SIZES } from "../src/index.js";
import { SqliteShareStore } from "../src/sqlite.js";
import { renderShareCardSvg, renderShareQrPng, renderShareQrSvg } from "../src/render.js";

const jsQR: typeof import("jsqr").default = createRequire(import.meta.url)("jsqr");

const profile = calculatePythagoreanProfile({ birthName: { firstNames: "Ada", lastNames: "Lovelace" }, birthDate: { year: 1815, month: 12, day: 10 }, vowelPolicy: { y: "always-consonant" } });
const payload = createPublicSharePayload(profile, { calculations: ["life-path", "expression"], aspectRatio: "1:1" });
const now = "2026-09-28T00:00:00Z";
const later = "2026-10-01T00:00:00Z";
const clock = { now: () => now };
const record = (visibility: "public" | "private" = "public") => createShareRecord(payload, { createdAt: now, expiresAt: later, ownerId: "owner-1", visibility });
const directories: string[] = [];
const stores: SqliteShareStore[] = [];
function database() {
  const directory = mkdtempSync(join(tmpdir(), "numera-shares-"));
  directories.push(directory);
  return join(directory, "shares.sqlite");
}
function open(path: string) { const store = new SqliteShareStore(path); stores.push(store); return store; }
afterEach(() => { for (const store of stores.splice(0)) { try { store.close(); } catch { /* explicitly closed in restart tests */ } } for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });

describe("persistent shares", () => {
  it("survives restart, excludes source inputs, and stores private file permissions", async () => {
    const path = database();
    const original = record();
    const first = open(path);
    await first.put(original);
    first.close();
    const second = open(path);
    expect(await resolveSharePayload(second, original.id, clock)).toEqual(payload);
    const bytes = readFileSync(path).toString();
    expect(bytes).not.toContain("Ada");
    expect(bytes).not.toContain("Lovelace");
    expect(bytes).not.toContain("1815");
    expect(statSync(path).mode & 0o777).toBe(0o600);
  });

  it("public access does not grant deletion or reveal owner metadata", async () => {
    const store = open(database());
    const original = record();
    await store.put(original);
    expect(await resolveShare(store, original.id, clock, "other-user")).not.toBeNull();
    expect(await resolveSharePayload(store, original.id, clock)).not.toHaveProperty("ownerId");
    expect(await deleteShare(store, original.id, "other-user")).toBe(false);
    expect(await deleteShare(store, original.id, "owner-1")).toBe(true);
    expect(await resolveSharePayload(store, original.id, clock)).toBeNull();
  });

  it("fails closed on private and legacy owned shares", async () => {
    const store = open(database());
    const original = record("private");
    const { visibility: _unused, ...legacy } = original;
    await store.put(legacy);
    expect(await resolveSharePayload(store, original.id, clock)).toBeNull();
    expect(await resolveSharePayload(store, original.id, clock, "other-user")).toBeNull();
    expect(await resolveSharePayload(store, original.id, clock, "owner-1")).toEqual(payload);
  });

  it("rejects identifier collisions across two connections instead of changing owners", async () => {
    const path = database();
    const first = open(path);
    const second = open(path);
    const original = record();
    await first.put(original);
    await expect(second.put({ ...original, ownerId: "attacker" })).rejects.toThrow();
    expect((await first.get(original.id))?.ownerId).toBe("owner-1");
  });

  it("purges only expired records at the exact expiry boundary", async () => {
    const store = open(database());
    const expired = record();
    const permanent = createShareRecord(payload, { createdAt: now, ownerId: "owner-2" });
    await store.put(expired);
    await store.put(permanent);
    expect(await store.purgeExpired("2026-09-30T23:59:59Z")).toBe(0);
    expect(await store.purgeExpired(later)).toBe(1);
    expect(await store.get(expired.id)).toBeNull();
    expect(await store.get(permanent.id)).not.toBeNull();
    expect(await store.purgeExpired(later)).toBe(0);
  });

  it("backs up and restores a readable database without overwriting destinations", async () => {
    const path = database();
    const source = open(path);
    const original = record();
    await source.put(original);
    const destination = `${path}.backup`;
    await source.backupTo(destination);
    await expect(source.backupTo(destination)).rejects.toThrow();
    expect(await open(destination).get(original.id)).toEqual(original);
    expect(statSync(destination).mode & 0o777).toBe(0o600);
  });

  it("rejects unrevocable persistence and malformed stored records", async () => {
    const path = database();
    const store = open(path);
    await expect(store.put(createShareRecord(payload, { createdAt: now }))).rejects.toThrow("owner");
    const original = record();
    await store.put(original);
    const raw = new DatabaseSync(path);
    raw.prepare("UPDATE shares SET record = ? WHERE id = ?").run(JSON.stringify({ ...original, expiresAt: "never" }), original.id);
    raw.close();
    await expect(store.get(original.id)).rejects.toThrow();
  });

  it("rejects metadata injection, invalid timestamps, owner PII and ownerless private access", () => {
    for (const extra of [ { notes: "private data" }, { expiresAt: "invalid" }, { createdAt: "2026-02-30T00:00:00Z" }, { ownerId: "person@example.com" }, { visibility: "secret" }, { ownerId: "" } ]) {
      expect(() => assertShareRecordSafe({ ...record(), ...extra })).toThrow();
    }
    expect(() => createShareRecord(payload, { createdAt: now, visibility: "private" })).toThrow();
  });

  it("rejects a store returning another identifier and a corrupt clock", async () => {
    const first = record();
    const second = record();
    const badStore = { async put() {}, async get() { return second; }, async delete() {} };
    await expect(resolveShare(badStore, first.id, clock)).rejects.toThrow("mismatched");
    await expect(deleteShare(badStore, first.id, "owner-1")).rejects.toThrow("mismatched");
    await expect(resolveShare(badStore, first.id, { now: () => "bad" })).rejects.toThrow();
  });
});

describe("share rendering", () => {
  it.each(Object.keys(SHARE_CANVAS_SIZES) as ShareAspectRatio[])("renders exact %s dimensions and only selected facts", aspectRatio => {
    const { width, height } = SHARE_CANVAS_SIZES[aspectRatio];
    const svg = renderShareCardSvg({ ...payload, aspectRatio });
    expect(svg).toContain(`width="${width}" height="${height}"`);
    expect(svg).toContain("Life Path");
    expect(svg).not.toContain("owner-1");
    expect(svg).not.toContain("Ada");
    expect(svg).not.toContain("1815");
  });

  it("escapes untrusted labels and rejects arbitrary calculation labels", () => {
    const svg = renderShareCardSvg({ ...payload, displayLabel: '<script>alert("x")</script>' });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
    expect(() => renderShareCardSvg({ ...payload, values: [{ ...payload.values[0]!, label: "Ada Lovelace" }] })).toThrow();
  });

  it("decodes the actual generated PNG to exactly the opaque URL", async () => {
    const id = record().id;
    const origin = "https://numera.example";
    const image = PNG.sync.read(Buffer.from(await renderShareQrPng(origin, id)));
    const decoded = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
    expect(decoded?.data).toBe(buildShareUrl(origin, id));
    const svg = await renderShareQrSvg(origin, id);
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("Ada");
    await expect(renderShareQrSvg("https://numera.example/?birthDate=1815", id)).rejects.toThrow();
  });
});
