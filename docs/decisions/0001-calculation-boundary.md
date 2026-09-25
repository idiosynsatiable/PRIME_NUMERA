# ADR 0001: Deterministic calculation boundary

Status: Accepted for foundation implementation

## Decision

Numerical calculations are implemented as pure deterministic functions in `packages/numerology-core`. Calculation results expose derivation data. Interpretations and visualizations consume those results but cannot alter them.

Pythagorean and Chaldean mappings are separate system definitions. New systems cannot be introduced merely by swapping a table and assigning an ancient label.

## Why

This prevents visual or editorial layers from silently changing arithmetic, enables reproducible tests and share artifacts, and makes disagreements about methodology inspectable rather than mysterious.

## Consequences

- Methodology changes are versioned and tested.
- Master-number preservation is configurable rather than universal.
- Unsupported scripts are not transliterated silently.
- Historical claims about system origins require research documentation before stronger wording is adopted.
