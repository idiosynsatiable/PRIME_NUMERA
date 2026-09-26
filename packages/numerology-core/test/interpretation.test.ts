import { describe, expect, it } from "vitest";
import {
  queryInterpretations,
  validateInterpretationCatalog,
  type InterpretationCatalog,
} from "../src/index.js";

const catalog: InterpretationCatalog = {
  schemaVersion: 1,
  sources: [
    {
      id: "decoz-expression",
      title: "Expression Number",
      url: "https://www.worldnumerology.com/numerology-expression/",
      classification: "modern-methodology",
    },
  ],
  records: [
    {
      id: "expression-4-modern",
      version: 1,
      locale: "en-US",
      category: "modern",
      evidenceClass: "modern-interpretation",
      editorialStatus: "approved",
      ageModes: ["standard", "adult-18-plus"],
      applicability: {
        systems: ["pythagorean"],
        calculations: ["expression"],
        values: [4],
      },
      title: "Expression 4",
      summary: "A modern numerology interpretation associated with structure and practical effort.",
      body: "This is interpretive tradition rather than a scientifically established personality measurement.",
      sourceIds: ["decoz-expression"],
    },
    {
      id: "expression-family-generic",
      version: 1,
      locale: "en-US",
      category: "entertainment",
      evidenceClass: "entertainment-interpretation",
      editorialStatus: "approved",
      ageModes: ["family"],
      applicability: {
        systems: ["pythagorean"],
        calculations: ["expression"],
      },
      title: "Expression Number",
      summary: "Explore how the name calculation is traditionally described.",
      body: "Use this as a pattern-exploration activity and compare the interpretation with your own experience.",
      sourceIds: [],
    },
  ],
};

describe("interpretation catalog", () => {
  it("validates sourced modern interpretations and entertainment content", () => {
    expect(() => validateInterpretationCatalog(catalog)).not.toThrow();
  });

  it("filters by system, calculation, value, locale, and age mode", () => {
    expect(
      queryInterpretations(catalog, {
        system: "pythagorean",
        calculation: "expression",
        value: 4,
        locale: "en-US",
        ageMode: "standard",
      }).map(({ id }) => id),
    ).toEqual(["expression-4-modern"]);

    expect(
      queryInterpretations(catalog, {
        system: "pythagorean",
        calculation: "expression",
        value: 4,
        locale: "en-US",
        ageMode: "family",
      }).map(({ id }) => id),
    ).toEqual(["expression-family-generic"]);
  });

  it("rejects missing source references", () => {
    const invalid: InterpretationCatalog = {
      ...catalog,
      records: [
        {
          ...catalog.records[0]!,
          sourceIds: ["ghost-source"],
        },
      ],
    };
    expect(() => validateInterpretationCatalog(invalid)).toThrow(RangeError);
  });

  it("rejects sourced interpretation claims with no sources", () => {
    const invalid: InterpretationCatalog = {
      schemaVersion: 1,
      sources: [],
      records: [
        {
          ...catalog.records[0]!,
          sourceIds: [],
        },
      ],
    };
    expect(() => validateInterpretationCatalog(invalid)).toThrow(RangeError);
  });

  it("rejects prohibited scientific certainty phrasing", () => {
    const invalid: InterpretationCatalog = {
      ...catalog,
      records: [
        {
          ...catalog.records[0]!,
          body: "This number is scientifically proven to define your personality.",
        },
      ],
    };
    expect(() => validateInterpretationCatalog(invalid)).toThrow(RangeError);
  });

  it("does not return draft or deprecated content to normal queries", () => {
    const expanded: InterpretationCatalog = {
      ...catalog,
      records: [
        ...catalog.records,
        {
          ...catalog.records[0]!,
          id: "draft-record",
          editorialStatus: "draft",
        },
        {
          ...catalog.records[0]!,
          id: "deprecated-record",
          editorialStatus: "deprecated",
        },
      ],
    };

    const results = queryInterpretations(expanded, {
      system: "pythagorean",
      calculation: "expression",
      value: 4,
      locale: "en-US",
      ageMode: "standard",
    });

    expect(results.map(({ id }) => id)).toEqual(["expression-4-modern"]);
  });
});
