# Interaction upgrade — 2026-09-30 UTC

## Scope

This upgrade turns existing numerical capabilities and local preference contracts into user-facing exploration. No core calculation, fixture, methodology, database schema, share contract or analytics contract changes.

| Surface | Previous behavior | Implemented behavior |
|---|---|---|
| Profile | Six static interpretation articles | Six selectable number cards; constructive, growth and question lenses; selected detail panel |
| Navigation | Long scroll through results | Profile exploration links to archetypes, DNA, cycles, comparison, name lab, Atlas and sharing |
| Life cycles | Timeline core existed without an interface | Keyboard-operable age slider, boundary jumps, previous/next age, active pinnacle/period and formula explanation |
| Name lab | Comparison API existed without an interface | Validated private name experiment, per-letter arithmetic, methodology switch, differences, reset, no profile mutation |
| Archetypes | One prompt and next-card control | Two selectable paths, completion checkbox, 18-prompt progress, explicit more/less feedback using existing persistent contract |
| DNA | Node buttons changed explanatory text | Selected node and actual edges highlighted; connected values listed; full accessible table retained |
| Compatibility | Static comparison table | Shared/contrasting filters and per-dimension conversation prompts derived from displayed values |
| Atlas | Static disclosures | Local search across titles, geography, periods and claims; result count; clearable empty state |

## Safety and methodology

- Uses existing `buildTimelineModel`, `compareNameVariants` and profile/DNA APIs. Core packages are unchanged.
- Name experiments use the existing profile input validator to reject unsupported characters rather than silently discard them.
- Name experiments never mutate, save or transmit the original profile or variant. Existing explicit save/export behavior is preserved.
- Timeline age ranges retain inclusive starts and exclusive ends, with no invented ages for Challenge numbers.
- Reflection text is labeled original modern editorial material; no outcome, luck or compatibility score is fabricated.
- Progress stores only bounded task IDs in the existing version-1 local experience schema; no free-text journal or new analytics events.
- Memoized profile assembly prevents unrelated preference changes from rebuilding the complete profile.

## Verification

- `npm run lint`, `npm run typecheck`, `npm test`: pass; 145 existing unit/integration/contract tests preserved.
- `npm run build`: pass; 58 modules; JS 302.16 kB / 93.71 kB gzip, CSS 9.59 kB / 2.98 kB gzip.
- Playwright covers original create/save/compare/share/open/revoke journey; Chaldean separation; all new interactions; name validation; cycle boundary/keyboard behavior; stored progress after reload; comparison filters and discussion disclosures.
- Browser plugin unavailable; regular Playwright uses an extracted Chromium 153 because the standard browser ZIP download was truncated. No dependency/lockfile changes or browser-security bypass flags.
- Accessibility: axe WCAG A/AA checks on exercised screens. Responsive checks at 320–1920 px in existing flow and 320/390/768/1280 px for new controls. This is a smoke test, not a formal audit or physical-device certification.

## Remaining release work

Custom-domain DNS, operational backup/restore and alert routing still need separate evidence. This upgrade does not establish full commercial production readiness or a claim of market leadership. Interpretive content remains an intentionally bounded editorial collection. No automatic psychological inference or reward-pressure system is introduced.
