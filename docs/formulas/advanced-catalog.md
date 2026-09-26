# Advanced Calculation Catalog

Status: implementation primitives added; methodology provenance is being attached before release claims.

## Balance

The Balance primitive derives the initials of the full birth name, maps those initials through the selected letter-value system, sums them, and reduces to a single digit by default. The documented Decoz method does not preserve Master Numbers for Balance.

The returned result preserves initials, mapped values, aggregate, reduction steps, and final value.

## Planes of Expression

Planes are represented by a named methodology object rather than inferred from number buckets.

The documented Decoz letter grouping used by the current foundation methodology is:

- Physical: D, E, M, W
- Mental: A, G, H, J, L, N, P
- Emotional: B, I, O, R, S, T, X, Z
- Intuitive: C, F, K, Q, U, V, Y

The engine reports participating letters, their mapped numerical values, counts, and raw totals. Interpretive claims remain outside the deterministic layer.

## Rational Thought

The first-name letter values are added to the calendar day of birth and the result reduces to a single digit by default. The documented Decoz method does not apply Master Number preservation to Rational Thought.

## Transit and Essence cycles

Transit channels advance through the letters of a birth-name component. Each letter remains active for a number of years equal to its mapped value, beginning at age 0; after the end of the name, the sequence repeats.

The standard channel builder models first, middle, and last birth-name groups as Physical, Mental, and Spiritual Transits. When no middle name exists, it exposes a combined Mental-Spiritual channel explicitly instead of inventing a hidden third value.

The Essence for a given age is the raw sum of the active Transit values. PRIME NUMERA preserves that compound total and separately exposes its reduced value.

## Sources used for the implemented convention

- Hans Decoz, World Numerology, “How to Do Your Own Numerology Reading: Calculate Every Number”: https://www.worldnumerology.com/do-your-own-reading/
- Hans Decoz, World Numerology, “The Balance Number”: https://www.worldnumerology.com/numerology-balance-number/
- Hans Decoz, World Numerology, “Planes of Expression”: https://www.worldnumerology.com/numerology-articles/planes-of-expression.html
- Hans Decoz, World Numerology, “Transits”: https://www.worldnumerology.com/numerology-articles/numerology-transits.html
- Hans Decoz, World Numerology, “Essence Cycles”: https://www.worldnumerology.com/numerology-articles/essence-cycles.html

These are sources for a modern numerology methodology. They are not evidence that the same formulas were used in ancient Greece, Babylonia, or another historical culture.

## Release rule

These calculations must not be described as historically universal or scientifically validated personality/forecast mechanisms. Alternate documented methodologies should be modeled as separate configuration rather than silently blended.
