# Share Engine

Server-safe share lifecycle and rendering built on the deterministic core's public projection.

## Entry points

- `@prime-numera/share-engine`: IDs, validators, lifecycle, configured HTTPS URLs and output sizes.
- `@prime-numera/share-engine/sqlite`: Node 24 file-backed `SqliteShareStore` with insert-only writes, expiry cleanup and backup.
- `@prime-numera/share-engine/render`: SVG cards in four aspect ratios and QR output as SVG or PNG.

The separate SQLite entry point keeps Node storage code out of browser consumers.

## Security contract

Create records from an already approved public payload. The optional display label is deliberately public and can itself identify someone; the library cannot make voluntary text anonymous. Canonical calculation labels cannot carry arbitrary text. The original name, birth date and derivation are never copied into the public projection.

`visibility: "public"` and `ownerId` coexist so a share is public **and** revocable by its owner. Legacy owned records without visibility remain private. Private records require an owner. Owners are opaque internal IDs, not email addresses. Persisted records require ownership; anonymous public links need a separately verified revocation-capability design before being enabled.

Only trusted server code may provide `requesterId`. Never accept it from a form, query string or request body as proof of authorization. HTTP routes must bind it to the verified session. `resolveShare` returns private metadata for internal use. Renderers and HTTP responses use `resolveSharePayload`, which returns only the approved payload. Callers must not cache private responses or forward owner metadata to clients.

`ShareStore.put` must insert only and reject existing IDs. Identifiers cannot be reassigned. This prevents concurrent authorization checks from acting on a replaced record. Expiration is checked at resolution; `purgeExpired` performs indexed cleanup. Timestamps are canonical full UTC ISO strings, with optional three-digit milliseconds. Unknown metadata, accessors, inherited serialization, malformed timestamps and invalid privacy flags fail closed.

Cards contain escaped text and no scripts, third-party references or owner identifiers. QR codes encode only a configured HTTPS origin plus the opaque share path. Origins must come from trusted deployment configuration, not a Host header. Card styling is a technical baseline awaiting the approved visual design.

## Persistence boundary

The SQLite adapter is a tested **single-host** option, not a selected production database architecture. Use a private directory and persistent volume, never a public asset directory or ephemeral Railway filesystem. Files are mode 0600. This is file-access restriction, not encryption at rest. Synchronous database calls can block the event loop; measure limits before production. Multi-host deployments require a shared database adapter with the same insert-only contract. No production volume has been provisioned by this change.

Schema version 1 is additive; unsupported versions fail. Inserts use bound SQL parameters. Backup destinations must be fresh operator-controlled paths. `backupTo` uses SQLite's backup API, not a potentially inconsistent live-file copy. A restore of an older backup can resurrect revoked shares: production restore must apply the deletion journal/retention policy before serving links. Downloaded cards and previously distributed backups cannot be recalled by deleting the live record.

HTTP authentication, CSRF, body-size/rate limits, scheduled cleanup, deployment wiring, encrypted storage/backup policy, deletion-journal replay, raster card downloads and browser/device verification remain release requirements.

## Verification and references

Tests cover restart recovery, collisions across two connections, private reads, public-owner deletion, expiry boundaries, backup restore, malformed persistence, four card dimensions, label escaping and independent decoding of the generated QR PNG.

- Node SQLite API: https://nodejs.org/docs/latest-v24.x/api/sqlite.html
- QR encoder API/license: https://github.com/soldair/node-qrcode
- QR decoder used in tests: https://github.com/cozmo/jsQR

Run `npm ci`, `npm run typecheck`, `npm test`, and `npm audit --audit-level=high` from the repository root.
