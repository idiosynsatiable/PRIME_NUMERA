import { describe, expect, it } from "vitest";
import {
  buildNumberDnaFromProfile,
  calculatePythagoreanProfile,
  validateNumberDnaGraph,
} from "../src/index.js";

describe("profile Number DNA graph", () => {
  it("creates auditable core, bridge, and cycle nodes from one profile", () => {
    const profile = calculatePythagoreanProfile({
      birthName: {
        firstNames: "Thomas",
        middleNames: "Cruise",
        lastNames: "Mapother",
      },
      birthDate: { year: 1962, month: 7, day: 3 },
      vowelPolicy: { y: "contextual" },
    });

    const graph = buildNumberDnaFromProfile(profile);
    expect(() => validateNumberDnaGraph(graph)).not.toThrow();

    expect(graph.nodes.find(({ id }) => id === "core:life-path")?.value).toBe(1);
    expect(graph.nodes.find(({ id }) => id === "core:expression")?.value).toBe(4);
    expect(
      graph.nodes.find(({ id }) => id === "bridge:life-path-expression")?.value,
    ).toBe(3);

    expect(graph.nodes.filter(({ calculation }) => calculation === "pinnacle")).toHaveLength(4);
    expect(graph.nodes.filter(({ calculation }) => calculation === "period-cycle")).toHaveLength(3);

    expect(
      graph.edges.some(
        ({ source, target, relationship }) =>
          source === "core:life-path" &&
          target === "bridge:life-path-expression" &&
          relationship === "bridge",
      ),
    ).toBe(true);
  });

  it("adds repetition edges only from equal deterministic values", () => {
    const profile = calculatePythagoreanProfile({
      birthName: {
        firstNames: "Thomas",
        middleNames: "Cruise",
        lastNames: "Mapother",
      },
      birthDate: { year: 1962, month: 7, day: 3 },
      vowelPolicy: { y: "contextual" },
    });
    const graph = buildNumberDnaFromProfile(profile);
    const repetitionEdges = graph.edges.filter(
      ({ relationship }) => relationship === "repetition",
    );

    for (const edge of repetitionEdges) {
      const source = graph.nodes.find(({ id }) => id === edge.source)!;
      const target = graph.nodes.find(({ id }) => id === edge.target)!;
      expect(source.value).toBe(target.value);
    }
  });

  it("includes explicit forecast nodes only when forecast inputs exist", () => {
    const staticProfile = calculatePythagoreanProfile({
      birthName: { firstNames: "Ada", lastNames: "Lovelace" },
      birthDate: { year: 1815, month: 12, day: 10 },
      vowelPolicy: { y: "always-consonant" },
    });
    expect(
      buildNumberDnaFromProfile(staticProfile).nodes.some(({ id }) =>
        id.startsWith("forecast:"),
      ),
    ).toBe(false);

    const forecastProfile = calculatePythagoreanProfile({
      birthName: {
        firstNames: "Mary",
        middleNames: "Elizabeth",
        lastNames: "Johnson",
      },
      birthDate: { year: 1990, month: 5, day: 15 },
      vowelPolicy: { y: "contextual" },
      targetDate: { year: 2026, month: 2, day: 3 },
      forecastAge: 0,
    });
    const ids = buildNumberDnaFromProfile(forecastProfile).nodes.map(({ id }) => id);
    expect(ids).toContain("forecast:personal-year");
    expect(ids).toContain("forecast:personal-month");
    expect(ids).toContain("forecast:personal-day");
    expect(ids).toContain("forecast:essence");
  });
});
