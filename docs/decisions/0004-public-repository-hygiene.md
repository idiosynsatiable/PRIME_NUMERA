# ADR 0004: Public repository hygiene

Status: Accepted

The repository is currently public. No secrets, private credentials, private user profiles, real private birth records, unpublished sensitive business information, or personal test fixtures may be committed.

Tests use synthetic or explicitly non-sensitive example data. Environment-specific credentials belong in secret stores and ignored local environment files.

Changing repository visibility is an owner-level publication decision and is not performed implicitly by implementation work.
