# Integrated application architecture

The browser owns raw profile data. Its form validates bounded names, strict calendar dates and enumerated methodologies before calling the unchanged numerology core. Profile saves are explicit versioned local storage and exports; imports validate and recalculate instead of trusting imported result objects.

The UI exposes the existing Pythagorean profile assembler, Number DNA graph and comparison engine. Chaldean name analysis remains separate. `reflections.ts` contains original modern prompts for 0, 1–9, 11, 22 and 33. It does not claim traditional provenance. Atlas renders the existing structured citations and uncertainty labels.

A share crosses one narrow boundary: explicit projection → strict HTTP request schema → anonymous derived values → session-owned share record → private SQLite persistence → projected public response. No raw profile endpoint exists. The HTTP contract rejects arbitrary labels even though the reusable package permits them, and omits birthday disclosure. Server authorization derives owner identity from an HttpOnly session, never request JSON.

The application has no external analytics sink. Names and dates cannot be attached to its separate exact-shape analytics event type at runtime; compile-time callsites only accept known event names. Consent-gated client behavior remains available to a future explicitly configured integration.

Server state uses three private SQLite databases. Session ownership and expiry control private reads/deletes. Origin and CSRF checks protect mutations. An independently preserved revocation journal blocks old snapshots from reactivating links. CSP disallows inline scripts/styles and third-party connections; shared resources have no-store/noindex headers.

Adaptation uses a versioned deterministic rule function from the inherited experience module. It changes content order, never arithmetic. Explicit interest, saved cards and recent choices stay locally; personalization can be disabled/reset.

No account, password, billing, or cloud-profile system is synthesized. Anonymous owner-session capability is the implemented access model. See operations documentation for retention, ownership limits, restoration and single-host deployment constraints.
