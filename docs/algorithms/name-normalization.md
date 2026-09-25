# Name Normalization: Foundation Policy

Status: provisional and testable

The initial engine supports Latin letters without silently transliterating unsupported scripts.

For the foundation Expression calculation:

1. Preserve the original input in the result.
2. Apply Unicode NFKD decomposition.
3. Convert supported Latin letters to uppercase A-Z.
4. Remove combining marks produced by Latin diacritic decomposition.
5. Treat spaces, apostrophes, and hyphens as structural separators that do not carry a numerical value.
6. Report other ignored characters rather than assigning invented values.
7. Reject an input with no supported letters.

Non-Latin scripts require an explicit system/language policy. They must not be silently romanized because transliteration can change the calculated result.

Y vowel/consonant classification is intentionally outside this foundation Expression calculation and will require an explicit policy for Soul Urge and Personality calculations.
