# ASTRA integration evidence — 2026-09-29

**Verdict: FUNCTIONING WITH CONDITIONS — locally exercised candidate, not deployed production.**

Baseline `20eb2a1`; branch `feat/astra-product-integration`. The original checkout and all pre-existing uncommitted work were preserved. No numerology-core/package implementation or mathematical semantics changed (`git diff -- packages` empty).

## Completed and exercised

- Real React/Vite application connected to existing deterministic calculation, DNA, comparison and Atlas modules.
- Distinct Pythagorean and Chaldean journeys, traceable rules/tables, modern structured interpretations and explainable original archetypes.
- Explicit device-local save/load/delete/export/import, privacy disclosures, accessible alternatives and reduced motion.
- Node HTTP service: durable shares, 192-bit IDs, 256-bit owner-session tokens stored as hashes, CSRF/origin controls, server-side authorization, strict input contracts and rate/body/time limits.
- Public/private share modes; 30-day expiration; owner revocation; SVG/PNG formats; HTTPS QR and Open Graph image endpoint.
- Independent revocation journal; tested restoration of an old share snapshot cannot reactivate a revoked URL.
- CI now includes lint, typecheck, tests, production build, browser tests and dependency audit.
- Deployment configuration, environment example, architecture, privacy, retention, backup/restore and rollback documentation.

## Observed local release checks

| Gate | Result | Evidence |
|---|---|---|
| Clean locked install | PASS | `npm ci`: 193 packages installed, exit 0 |
| Lint | PASS | `npm run lint`: exit 0 |
| TypeScript | PASS | All 5 workspace checks, exit 0 |
| Unit/integration/contracts | PASS | 145 tests: web 14, analytics 3, cultural 6, core 100, share 22 |
| Production build | PASS | Vite: 57 modules; JS 289.85 kB / 90.48 kB gzip, CSS 7.75 / 2.54 kB gzip |
| Critical browser journey | PASS | Playwright Chromium: 2 tests pass after clean install |
| Accessibility smoke | PASS within tested screens | axe WCAG 2/2.1/2.2 A/AA tags, zero violations in Pythagorean and Chaldean journeys; keyboard skip link and reduced motion exercised |
| Responsive smoke | PASS | 320, 360, 390, 768, 1280, 1920px horizontal-overflow assertions, including populated Pythagorean results |
| Browser runtime | PASS within tested journey | No uncaught page exceptions; title/content/loaded artwork checked; screenshots visually inspected |
| Dependency audit | PASS | `npm audit --audit-level=high`: found 0 vulnerabilities |
| HTTP access boundaries | PASS | Cross-user private reads/deletes, spoofed owner, missing CSRF, wrong origin, malformed/guessed IDs rejected |
| HTTP privacy boundaries | PASS | Name/date/label/extra-field/unsafe-flag injection rejected; raw input not present in public browser result |
| Storage lifecycle | PASS locally | SQLite creation/migration, restart, expiry cleanup, revocation and restore-journal integration tests |
| Git whitespace | PASS | `git diff --check` |
| Placeholder scan | PASS for runtime source | No TODO/FIXME/HACK/placeholder/coming-soon/stub/fake markers in application/package implementation source |
| Remote CI / production deployment | NOT established by local checks | Track exact published SHA and Railway state separately |

The flow exercised was: load → create profile → interpret → DNA node → Atlas → compare → save → create anonymous share → open in separate browser context → revoke → confirm 404 with useful page → reload saved profile → delete. The second flow checks Chaldean separation, viewport sizes and reduced motion. A separate HTTP test confirms PNG signature and restores an old database after revocation.

## Test environment and limitation

Node 24.19.0/npm 11.9.0, local HTTP `127.0.0.1:4173`, Linux, Chromium 153. The Browser plugin/skill was unavailable; regular Playwright was used. The standard Chromium ZIP download was truncated, so a locally extracted Chromium distribution supplied the executable. The temporary executable was not committed. Browser web-security remained enabled; no security-bypass flags were used. CI uses the standard Playwright browser installer.

No physical Android/iPhone, Safari/WebKit, real screen reader, production TLS, DNS, hosting access logs, container build, operational backup scheduler, or production capacity was verified. A separate-browser-context check is not falsely described as a physical second-device check. No coverage percentage or formal security certification is claimed.

## Visual evidence

- `evidence/desktop-landing.png`: dark teal/ivory/gold landing page with original Architect art.
- `evidence/mobile-dna.png`: narrow-screen graph and accessible interactive controls.
- Phoenix image repaired with built-in image generation and optimized for web; prompt/provenance in `../design/ASSET-PROVENANCE.md`.

## Remaining external release conditions

The inspected Railway environment has **no persistent volume**, old landing-page source/start configuration, a failed duplicate service and an existing stale staged patch. Do not deploy the new SQLite service there until storage and source settings are reconciled. Exact IDs and steps are in `../deployment/OPERATIONS.md`.

Physical-device/assistive-technology acceptance, production health/HTTPS/share checks, logs/alerts/backups and final commercial/editorial clearance remain. Profiles are intentionally device-local with no cloud sync; interpretations are explicitly modern reflective material rather than unsupported historical attributions.

## Publication result

Local implementation commit `eff058f`; documentation commit `475ea95`. The attempt to push `feat/astra-product-integration` to `https://github.com/idiosynsatiable/PRIME_NUMERA.git` was rejected by automatic approval review. Reason: source and generated assets would be disclosed to an unverified GitHub destination; the reviewer requires explicit authorization for that payload/destination. No alternate publication route was attempted, no pull request was created, and no remote CI result is claimed. Owner approval must explicitly cover pushing these PRIME NUMERA changes and assets to that repository.
