# ADR 0003: Number DNA is a graph model

Status: Accepted for design and engineering

## Decision

Number DNA is represented as renderer-independent graph data. Calculation nodes reference deterministic calculation results. Relationship edges contain explicit relationship types and interpretation references rather than altering node values.

## Required behavior

- node derivation remains inspectable
- filtering does not change underlying calculations
- alternate-system values remain identifiable by system
- collision/relationship analysis is labeled interpretive
- “rare” is prohibited unless frequency is calculated against a defined model/population
- 2D accessible rendering remains available without WebGL

## Why

This makes the signature feature reusable across web, mobile, sharing, accessibility surfaces, and future visualization technologies without coupling mathematical truth to one renderer.
