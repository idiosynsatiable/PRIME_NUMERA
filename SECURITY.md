# Security Policy

## Reporting

Do not disclose suspected vulnerabilities publicly. Report them privately to the repository owner through an authorized private channel.

## Baseline controls

PRIME NUMERA treats names, birth dates, saved profiles, relationship comparisons, and account metadata as potentially sensitive personal data.

Engineering requirements include data minimization, explicit save consent, TLS in transit, secure authentication, secure cookies where applicable, CSRF/XSS defenses, Content Security Policy, input validation, rate limiting, dependency scanning, secret scanning, least privilege, and opaque identifiers for public shares.

Birth information must not be placed in public URLs. Public artifacts may contain only fields the user explicitly approves for sharing.

## Scope

Security findings are tracked separately from interpretive or historical-content corrections. A numerology interpretation must never be allowed to modify the deterministic calculation layer.
