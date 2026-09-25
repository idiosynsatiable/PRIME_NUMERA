# Threat Model: Initial Scope

## Assets

User-entered names, birth dates, saved profiles, relationship/compatibility profiles, account identifiers, private share configuration, and authentication/session material.

## Initial threats

- accidental disclosure through URLs, logs, analytics, metadata, screenshots, or share cards
- enumeration of public share identifiers
- XSS through user-controlled names/profile labels
- CSRF on state-changing account actions
- credential/session theft
- abusive automated calculation/share generation
- dependency or secret compromise
- cross-profile authorization failures

## Required mitigations before production

Opaque high-entropy share IDs, output encoding, schema validation, CSP, secure cookie/session policy, CSRF protection where applicable, authorization tests, rate limits, dependency/secret scanning, telemetry redaction, and explicit share-field allow-lists.

This is an initial model, not a completed security review.
