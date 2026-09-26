# @prime-numera/numerology-core

Pure deterministic calculation package for PRIME NUMERA.

## Purpose

Provide auditable numerical results without UI, persistence, network access, analytics, or interpretive prose affecting arithmetic.

## Implemented calculation foundation

### Systems and policies

- Separate Pythagorean and Chaldean / Cheiro-style mapping definitions.
- System-specific reduction policies, master-number behavior, citations, supported calculations, and normalization metadata.
- Latin NFKD normalization with no silent transliteration.
- Explicit Y/vowel policy.
- Configurable reduction with full step history.

### Core name and date calculations

- Expression / Destiny, including component-aware first/middle/last reduction.
- Soul Urge / Heart's Desire with explicit vowel policy.
- Personality with explicit vowel policy.
- Life Path with named reduction strategies.
- Birthday, Attitude, Maturity, Balance, and Rational Thought.
- Cornerstone, Capstone, and First Vowel with first-name-only scope.
- Hidden Passion, Karmic Lessons, Subconscious Self, and raw name frequencies.
- Karmic Debt stage detection with explicit provenance.
- Named Bridge calculations.

### Cycles and forecasting arithmetic

- Personal Year, Month, and Day.
- Pinnacles.
- Challenges.
- Period Cycles.
- Long-term Pinnacle and Period age ranges.
- Transits.
- Essence values.

### Product-support primitives

- Name Lab value diffing.
- Number DNA renderer-independent graph contract.
- Deterministic repetition/collision facts without unsupported rarity claims.
- Multidimensional compatibility comparison without a fabricated percentage.

## Verification posture

- Strict TypeScript.
- Vitest unit and invariant tests.
- Published external regression fixtures for selected Pythagorean calculations.
- Reproducible npm lockfile and `npm ci`.
- GitHub Actions typecheck, tests, and high-severity dependency audit.
- Methodology provenance maintained separately from interpretation.

## Deliberate limitations

- Unsupported scripts are reported rather than silently romanized.
- Modern numerology methodology is not presented as scientific validation.
- Modern Pythagorean/Chaldean labels are not treated as proof of direct ancient continuity.
- Some conventions differ among numerology authors; alternate methods must be represented explicitly rather than blended.
- Interpretation content, cultural/historical Atlas modules, UI, persistence, accounts, sharing, analytics, and deployment are outside this package.

## Security/privacy

The package is pure and does not persist input. Applications consuming it remain responsible for consent, storage, logging, telemetry, authentication, and public-share privacy controls.
