# Number DNA: Product Data Schema

The signature visualization is driven by data, not by decorative particles.

## Node

Each node contains a stable ID, calculation type, numerical value, system ID, derivation reference, display label, and optional cycle/time scope.

## Edge

Each edge contains source and target node IDs plus an explicit relationship classification. Relationship classifications are interpretive metadata, not mathematical transformations.

Initial relationship vocabulary:

- amplifier
- tension
- bridge
- repetition
- cycle-overlap
- alternate-system

## Claims

`rare` is not an allowed relationship or badge by default. A rarity claim requires a documented population/model, generation assumptions, sample size or exact enumeration method, frequency calculation, and reproducible evidence.

## Interaction

Zoom, rotate, filter, expand, save, and alternate-system views operate on graph presentation state. None may mutate deterministic calculation results.

## Accessibility

Every graph view has an equivalent ordered list/table representation exposing node value, calculation, system, derivation, and connected relationships.
