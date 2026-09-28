import { DatabaseSync, backup } from "node:sqlite";
import { chmodSync, closeSync, openSync } from "node:fs";
import { assertOpaqueShareId, assertShareRecordSafe, parseShareTimestamp, type OpaqueShareId, type ShareRecord, type ShareStore } from "./index.js";

/** Single-host adapter. Use a private persistent volume; not an ephemeral container filesystem. */
export class SqliteShareStore implements ShareStore {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") {
      closeSync(openSync(path, "a", 0o600));
      chmodSync(path, 0o600);
    }
    this.#database = new DatabaseSync(path, { timeout: 5000 });
    try {
      const version = this.#database.prepare("PRAGMA user_version").get()?.user_version;
      if (version !== 0 && version !== 1) throw new Error("Unsupported share database version.");
      this.#database.exec(`
        PRAGMA secure_delete = ON;
        PRAGMA synchronous = FULL;
        BEGIN IMMEDIATE;
        CREATE TABLE IF NOT EXISTS shares (
          id TEXT PRIMARY KEY NOT NULL,
          expires_at INTEGER,
          record TEXT NOT NULL
        ) STRICT;
        CREATE INDEX IF NOT EXISTS shares_expiry ON shares(expires_at);
        PRAGMA user_version = 1;
        COMMIT;
      `);
    } catch (error) {
      this.#database.close();
      throw error;
    }
  }

  async put(record: ShareRecord): Promise<void> {
    assertShareRecordSafe(record);
    if (record.ownerId === undefined) throw new TypeError("Persisted shares require an owner for revocation.");
    // INSERT deliberately fails on collisions: an identifier never changes owners or disclosure.
    this.#database.prepare("INSERT INTO shares (id, expires_at, record) VALUES (?, ?, ?)").run(
      record.id, record.expiresAt === null ? null : parseShareTimestamp(record.expiresAt), JSON.stringify(record),
    );
  }

  async get(id: OpaqueShareId): Promise<ShareRecord | null> {
    assertOpaqueShareId(id);
    const row = this.#database.prepare("SELECT record FROM shares WHERE id = ?").get(id);
    if (!row) return null;
    if (typeof row.record !== "string") throw new Error("Invalid stored share.");
    const record: unknown = JSON.parse(row.record);
    assertShareRecordSafe(record);
    if (record.id !== id) throw new Error("Stored share identifier mismatch.");
    return record;
  }

  async delete(id: OpaqueShareId): Promise<void> {
    assertOpaqueShareId(id);
    this.#database.prepare("DELETE FROM shares WHERE id = ?").run(id);
  }

  async purgeExpired(now: string): Promise<number> {
    const result = this.#database.prepare("DELETE FROM shares WHERE expires_at IS NOT NULL AND expires_at <= ?").run(parseShareTimestamp(now));
    return Number(result.changes);
  }

  async backupTo(path: string): Promise<void> {
    // Destination must be an operator-controlled fresh path, outside the public web root.
    closeSync(openSync(path, "wx", 0o600));
    await backup(this.#database, path);
  }

  close(): void { this.#database.close(); }
}
