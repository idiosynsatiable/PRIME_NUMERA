import { describe, expect, it } from "vitest";
import { buildTimelineModel, calculateSandbox, compareNameVariants } from "../src/index.js";

describe("product APIs", () => {
  it("compares name variants with auditable arithmetic in separate systems", () => {
    const p = compareNameVariants("Anna", "Anne", "pythagorean");
    const c = compareNameVariants("Anna", "Anne", "chaldean");
    expect(p.arithmeticChange.totalValueDelta).toBe(p.after.sum - p.before.sum);
    expect(c.arithmeticChange.totalValueDelta).toBe(c.after.sum - c.before.sum);
    expect(p.interpretiveClaimsIncluded).toBe(false);
    expect(() => compareNameVariants("Anna", "Anne", "bogus" as never)).toThrow();
  });

  it("exposes selectable, inclusive-start and exclusive-end timeline segments", () => {
    const birthDate = { year: 1993, month: 11, day: 21 };
    const first = buildTimelineModel(birthDate, 0);
    const transition = buildTimelineModel(birthDate, first.firstTransitionAge);
    expect(first.segments.filter((s) => s.activeAtSelectedAge)).toHaveLength(2);
    expect(transition.segments.find((s) => s.track === "pinnacle" && s.ordinal === 1)?.activeAtSelectedAge).toBe(false);
    expect(transition.segments.find((s) => s.track === "pinnacle" && s.ordinal === 2)?.activeAtSelectedAge).toBe(true);
    expect(() => buildTimelineModel(birthDate, -1)).toThrow();
  });

  it("runs a local calculation sandbox without blending methodology", () => {
    expect(calculateSandbox({ kind: "name", name: "Anna", system: "chaldean" }).system).toBe("chaldean");
    expect(calculateSandbox({ kind: "life-path", birthDate: { year: 1993, month: 11, day: 21 }, strategy: "reduce-components" }).system).toBe("pythagorean");
  });
});
