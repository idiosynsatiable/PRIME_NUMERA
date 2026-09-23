# Foundation Formula Specifications

Status: implementation specifications. Historical/methodological source citations remain a separate research gate.

## Expression / Destiny

Map all supported normalized letters under the selected system, sum them, then apply that system's configured reduction policy.

## Soul Urge / Heart's Desire

Select vowels under an explicit vowel/Y policy, map them using the selected system, sum them, and reduce under the selected system policy.

## Personality

Select consonants under the same explicit vowel/Y policy, map them using the selected system, sum them, and reduce.

## Life Path

Two strategies are modeled independently because published numerology methods can differ:

- `reduce-components`: reduce month, day, and year independently, add the reduced components, then reduce the aggregate.
- `reduce-total-digits`: sum the decimal digits of year, month, and day, then reduce the aggregate.

The selected strategy is part of the returned result.

## Birthday

Reduce the calendar day under the configured reduction policy.

## Attitude

Add birth month and day, then reduce.

## Maturity

Add the already-calculated Life Path and Expression values, then reduce under the configured policy.

## Bridge primitive

Absolute difference between two supplied numerical values. Higher-level bridge calculations must identify exactly which source numbers they compare.

## Methodology warning

These specifications document what the software computes. They are not, by themselves, evidence that a historical tradition used a formula. Published-reference fixtures and citations must be reviewed before PRIME NUMERA represents methodology research as complete.
