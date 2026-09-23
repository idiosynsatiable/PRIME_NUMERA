# Personal Period Calculations

Status: implemented convention, pending published-source review.

The foundation engine computes:

- Personal Year from birth month + birth day + digits of the selected calendar year, followed by configured reduction.
- Personal Month from the calculated Personal Year value + calendar month, followed by configured reduction.
- Personal Day from the calculated Personal Month value + calendar day, followed by configured reduction.

Every returned object preserves its aggregate and reduction steps.

Calendar-period conventions vary among numerology authors, including questions about when a personal year is considered to begin. PRIME NUMERA must expose the selected convention and must not silently present one convention as universal historical fact.
