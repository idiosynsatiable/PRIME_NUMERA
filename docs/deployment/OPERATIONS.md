# Deployment and operations

## Runtime contract

- Node 24.19+; start from repository root with `npm start` after `npm ci && npm run build`.
- `NODE_ENV=production` makes missing `APP_ORIGIN` or `DATA_DIRECTORY` fatal.
- `APP_ORIGIN`: bare HTTPS public origin, no path/query/credentials. The origin is trusted configuration, never inferred from request Host or forwarding headers.
- `DATA_DIRECTORY`: private persistent disk, writable by the process UID. Docker runs as `node` (UID 1000); provision volume permissions accordingly. Do not put it inside the public static directory.
- `PORT`: hosting-platform supplied port, default 4173.
- Exactly one application replica against this SQLite volume. Horizontal scaling requires a transactional shared store, distributed rate limiting, and independently tested migration.
- TLS terminates at the trusted hosting proxy. Restrict direct backend network exposure. Session cookies are Secure, HttpOnly, SameSite=Strict, host-only on HTTPS.
- `/health` is the readiness URL; monitor it externally and alert on failure and repeated `numera_request_failed` / `numera_cleanup_failed` events.

## Railway deployment verified 2026-09-29

Project `a821627e-ae70-44b5-ba5f-ba1bab779267`, production environment `b1e6f208-c349-4e67-9641-1aad819fd18d`, service `prime-numera-web` (`d9d6cea8-e19c-4e18-b85e-4c3dfe9e3799`).

- Deployed candidate `e1b3d871baf6677adfd64616b484a324b9205ecc` from `feat/astra-product-integration`; Dockerfile builder, `npm start`, GET `/health`, one us-west2 replica, ON_FAILURE with three retries, sleep disabled.
- Persistent 512 MB volume `prime-numera-data` (`048cda35-a92a-4c62-839c-ade258fa2f36`) mounted at `/data`.
- Variables: `APP_ORIGIN=https://prime-numera-web-production.up.railway.app`, `DATA_DIRECTORY=/data/numera`, `NODE_ENV=production`, `RAILWAY_RUN_UID=0`. Railway's root-owned volume currently requires the documented UID override; the Docker image otherwise defaults to UID 1000.
- Canonical public URL: https://prime-numera-web-production.up.railway.app . The custom domain `numera.e11evenprime.com` returned NXDOMAIN from Google's public DNS resolver on this date. Do not configure it as APP_ORIGIN until its DNS and TLS work.
- The staged branch/volume changes were inspected and applied with owner authorization. Initial candidate deployment `7611ffae-9404-4a20-af76-2925b5a52da9` and canonical-origin deployment `0e584e41-ddc2-4d82-b66a-d02f03cd16d0` succeeded.
- Live HTTPS probes passed: health and root, Secure/HttpOnly session, public/private sharing and anonymous access denial, SVG/PNG/QR exports, deletion and revoked-link rejection, prohibited-property rejection, origin/CSRF rejection, malformed-ID rejection.
- Unused service `prime-numera-live` was left unchanged.

## Exact release order

1. Require candidate CI green; record candidate SHA. Reconcile the existing staged patch explicitly.
2. On the intended `prime-numera-web` service, provision a private persistent volume (e.g. `/data`) and UID 1000 write access. Review the associated hosting cost.
3. Select the verified candidate branch/revision; use repository Dockerfile and explicit Railway service settings (`railway.toml` config-as-code is deprecated by the current platform) (the old start-command override must not retain `node server.mjs`). Keep one replica.
4. Configure `APP_ORIGIN=https://numera.e11evenprime.com`, `DATA_DIRECTORY=/data/numera`, `NODE_ENV=production`. Verify custom domain/TLS before using that origin; alternatively choose the Railway HTTPS origin consistently.
5. Confirm hosting access-log retention and ensure no request bodies, cookies, query values, or share paths are exported to analytics/logging systems. The app itself logs only constant error event names.
6. Deploy, require `/health` 200, load root on Android, run real HTTPS create/open/revoke and QR/PNG checks from separate browser sessions.
7. Restart the service; verify a created share survives and a revoked share does not. Check privacy/no-store/noindex headers.
8. Enable tested off-host backups and alert routing; complete a restore rehearsal before commercial launch.

## Database/migration model

- `shares.sqlite`: existing version-1 share adapter, strict table and expiry index; insert-only IDs.
- `sessions.sqlite`: transactionally initialized version-1 schema with session ownership, indexed owned-share list, and request limiter. Unknown schema versions refuse startup.
- `revocations.sqlite`: independent append-only table of opaque revoked IDs and timestamps. Keep indefinitely to deny resurrection from old share snapshots; contains no profile names/dates or numerical payloads.
- Migrations run during server construction before listening. No undocumented manual SQL is required.
- Session tokens are random 256-bit values; only SHA-256 hashes are stored. Sessions expire 90 days after session initialization/refresh. Shares last at most 30 days. Expiry cleanup runs at startup and once per minute. Rate-limit address hashes expire after a minute. A hard cap bounds active stored sessions.
- Creating a share uses compensating cleanup if ownership-list insertion fails. A crash in that small window can leave an unlisted share until its 30-day expiry; the URL has not been returned. Deletion writes the independent revocation journal first, so even a crash before physical deletion keeps the link inaccessible.

## Backup/restore and deletion safety

Use an operator-controlled encrypted backup location outside the web root. Stop the application for a coherent copy of the three DB files, or use the SQLite online backup API and a documented consistent snapshot process. Keep backup access private, cap snapshot retention at 30 days, and test restoration.

**Never restore `revocations.sqlite` backward.** Preserve its current version independently before restoring an older share/session snapshot. Restored shares are checked against the current journal at every HTTP read, including images. The automated restore test copies an older shares DB back and proves the revoked URL still returns 404.

If the current revocation journal is unavailable, fail closed: retire all prior share records before reopening service. Do not resurrect an old share snapshot on trust. Browser-local profiles are not in these backups; users can export/import them explicitly.

## Rollback

Stop traffic, retain all current database files and the current revocation journal, and restore the last known application image that understands the current schema. Never downgrade an unknown schema in place. The old landing-page deployment can serve as a read-only fallback but cannot supply sharing. Test `/health` and access boundaries before reopening.

## Resource and operational limits

8 KiB JSON bodies, 15-second request timeout, 10-second header timeout, 50 active shares per session, 180 API/share requests per socket address per minute, 100,000 stored sessions maximum. Forwarding headers are ignored to prevent spoofing; many users behind one proxy can share the conservative limit. Before scaling, configure a trusted-edge limiter rather than weakening this check or trusting arbitrary X-Forwarded-For.

Remote backup jobs, restore rehearsal, external alert routing, physical-device acceptance and custom-domain DNS/TLS still require operational evidence. HTTPS and live API checks passed on the Railway domain; this does not establish all commercial-launch gates.
