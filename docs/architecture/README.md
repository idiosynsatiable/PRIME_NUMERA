# PRIME NUMERA Architecture

## Boundary rule

The deterministic calculation layer is authoritative for numerical outputs. Interpretation, visualization, cultural research, sharing, analytics, and presentation consume calculation results but may not mutate them.

## Target monorepo

```text
apps/
  web/
  api/
  admin/
packages/
  numerology-core/
  cultural-engines/
  visualization-engine/
  compatibility-engine/
  timeline-engine/
  interpretation-engine/
  share-engine/
  analytics/
  design-system/
  schemas/
  database/
  testing/
  security/
docs/
  architecture/
  algorithms/
  formulas/
  historical-sources/
  decisions/
  threat-model/
  accessibility/
  privacy/
  seo/
  analytics/
  release/
```

## Auditable calculation contract

Every calculation result must expose the system and methodology version, original and normalized input, mappings used, intermediate arithmetic, reduction steps, master-number policy, final value, and derivation metadata. Methodology citations belong with the system definition rather than being invented at runtime.

## Separation of concerns

Pythagorean and Chaldean engines remain distinct. Additional systems require historical research before implementation. Symbolic Atlas and rune material are separate knowledge domains and must not be represented as interchangeable numerology engines.

## Number DNA

Number DNA is structured graph data first and a visual effect second. Nodes represent calculated facts. Edges represent explicit interpretive relationships. Accessible 2D rendering is a baseline; enhanced 3D/WebGL rendering is optional and must never be required for core calculations.
