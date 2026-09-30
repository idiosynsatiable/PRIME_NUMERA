# PRIME NUMERA

A local-first numerology application with transparent Pythagorean calculations, separate Chaldean/Cheiro name analysis, Number DNA, reflective archetypes, a sourced cultural Atlas, and revocable anonymous sharing.

**Status:** the integrated application is deployed at https://prime-numera-web-production.up.railway.app . Deployment evidence is in `docs/deployment/OPERATIONS.md`; the interaction upgrade is documented in `docs/release/INTERACTION-UPGRADE.md`. Not every commercial release gate is satisfied. The name remains a working codename pending commercial clearance.

## Run

Node **24.19+**, npm **11**. From the repository root:

```sh
npm ci
npm run build
npm start
```

Open `http://127.0.0.1:4173`. The application and API share one origin. For frontend-only development, `npm run dev --workspace @prime-numera/web` uses Vite; live sharing requires the production server, not that standalone development server.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm audit --audit-level=high
```

Production requires `APP_ORIGIN` (bare HTTPS origin) and `DATA_DIRECTORY` (private persistent volume). See `.env.example`, `Dockerfile`, `railway.toml`, and `docs/deployment/OPERATIONS.md`. The process reads environment variables; it does not automatically load a `.env` file.

## Product behavior

- Names and birth dates are calculated in the browser. Optional saved profiles are local to that browser; they are not encrypted or synchronized to an account.
- Pythagorean profile calculations use the established component reduction rules, with Y explicitly treated as a consonant in this UI. Full derivations and letter tables are visible.
- Chaldean uses its own letter table and reduction policy; it supports name-number analysis. We do not relabel a Pythagorean date profile as Chaldean.
- Selectable number cards offer constructive, growth, and reflection lenses. Number DNA highlights selected nodes and their actual relationships, with buttons, connected-value explanations, and a complete accessible table.
- The life-cycle map uses the established timeline model: explore ages 0–120, jump to cycle boundaries, and inspect the range formula.
- The private name laboratory compares variants with letter-by-letter values under either methodology without modifying the original profile.
- Compatibility compares explicit values without a scientific match score. Shared/contrasting filters and dimension-specific discussion prompts make the arithmetic explorable. An anonymous comparison can be exported.
- Modern reflections and archetypes are labeled original creative material; the cultural Atlas retains source and uncertainty distinctions.
- Device-local adaptation uses explicit interests, saved archetypes and recent selections. It is deterministic, explainable and resettable. Two paths per archetype expose 18 reflection prompts; explored prompts and explicit feedback persist locally. The Atlas supports local text search.
- Public/private shares contain only selected derived values. HTTP rejects labels, birthday disclosure, unknown fields and raw input. Public links work across devices; private links require the owning browser session.
- Links have 192-bit random identifiers, expire after 30 days, and can be revoked. SVG and PNG downloads support 1:1, 4:5, 9:16 and 16:9; QR codes are available on configured HTTPS deployments.
- No analytics events or third-party trackers are sent by this release. The independent analytics package retains a closed, consent-gated event contract.

## Source map

| Location | Responsibility |
|---|---|
| `packages/numerology-core` | Unchanged arithmetic, fixtures, profile assembly, DNA, compatibility and share projection |
| `packages/cultural-engines` | Sourced Atlas and distinct cultural material |
| `packages/share-engine` | Strict share contracts, SQLite storage and deterministic card/QR rendering |
| `packages/analytics` | Exact-shape analytics contract; no raw input fields |
| `apps/web/src` | Browser experience, local saves, interpretations and adaptation |
| `apps/web/server` | Sessions, CSRF/origin checks, share HTTP API, rate limits and revocation journal |
| `apps/web/test` | Application and HTTP integration tests |
| `apps/web/e2e` | Critical journey, responsive and automated accessibility checks |

## Boundaries

No cloud profile account/sync, full offline installation, payment system, or scientific/predictive claims are implied. The app works offline for calculations in an already-open page; shares require a network. Automated axe checks are not a substitute for physical-device and assistive-technology acceptance testing.

Owner: Dallas Cullen Whitten / IDIOSYNSATIABLE.
