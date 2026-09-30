import { DatabaseSync } from "node:sqlite";
import { chmodSync } from "node:fs";
/** Keep this journal current when restoring the share database. Never restore it backwards. */
export class Revocations {
  private db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    chmodSync(path, 0o600);
    this.db.exec(
      "PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS revoked (id TEXT PRIMARY KEY, revoked_at INTEGER NOT NULL) STRICT;",
    );
  }
  add(id: string, at: number) {
    this.db.prepare("INSERT OR IGNORE INTO revoked VALUES (?,?)").run(id, at);
  }
  has(id: string) {
    return !!this.db.prepare("SELECT 1 FROM revoked WHERE id=?").get(id);
  }
  close() {
    this.db.close();
  }
}
