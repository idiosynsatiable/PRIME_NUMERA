# Interpretation Architecture

Interpretation content is versioned data and cannot alter deterministic calculations.

## Record contract

Every record declares:

- stable ID and positive integer version
- locale
- category: `traditional`, `modern`, `entertainment`, or `historical-context`
- evidence class
- editorial status: draft, reviewed, approved, deprecated
- permitted age modes: Family, Standard, and/or optional 18+
- applicable numerology systems
- applicable calculation types
- optional exact numerical values
- title, summary, and body
- source references where the claim depends on sources
- optional disclaimers

## Evidence classes

- `arithmetic`: reserved for factual calculation/method context, not personality prose
- `historical-source`: claims about source-attested historical context
- `traditional-interpretation`: source-backed traditional interpretation
- `modern-interpretation`: source-backed modern numerology interpretation
- `entertainment-interpretation`: editorial entertainment content

Traditional and modern interpretations require source references. Entertainment content may be source-free when clearly labeled as entertainment.

## Safety and scientific-claim boundary

The validator rejects known forms of prohibited certainty such as:

- “scientifically proven” personality assertions
- guaranteed wealth/success/love/health claims
- definite future-event claims
- diagnostic language
- lifespan/death prediction claims
- content framed as medical advice

The deterministic calculation remains separate from the interpretation. The presence of a calculated value does not upgrade an interpretation into scientific evidence.

## Query boundary

Interpretation lookup filters by:

- system
- calculation
- optional value
- locale
- age mode
- editorial status

Draft content is excluded by default. Deprecated content is never returned from the normal query path.

## Collision and Number DNA

Collision or Number DNA interpretation records reference deterministic calculation/graph facts. They never overwrite node values or create arithmetic facts.

## Current implementation

The executable schema and validation/query functions live in:

`packages/numerology-core/src/interpretation.ts`

The current location keeps the contract beside deterministic result types while the product is still establishing package boundaries. It can be extracted into a dedicated interpretation package later without changing the schema semantics.
