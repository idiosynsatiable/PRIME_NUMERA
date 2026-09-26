import { describe, expect, it } from "vitest";
import {
  FOUNDATION_CULTURAL_ATLAS,
  validateCulturalAtlasCatalog,
} from "../src/index.js";

describe("cultural atlas foundation", () => {
  it("validates all seeded source and claim references", () => {
    expect(() => validateCulturalAtlasCatalog(FOUNDATION_CULTURAL_ATLAS)).not.toThrow();
  });

  it("classifies runes as writing rather than numerology", () => {
    const runes = FOUNDATION_CULTURAL_ATLAS.modules.find(
      ({ id }) => id === "scandinavian-runic-writing",
    )!;
    expect(runes.kinds).toContain("runic-writing");
    expect(runes.claims.find(({ id }) => id === "runes-are-writing-signs")?.statement)
      .toContain("rather than a numerology system");
  });

  it("classifies Maya material as calendrical systems and mathematics", () => {
    const maya = FOUNDATION_CULTURAL_ATLAS.modules.find(
      ({ id }) => id === "maya-calendrical-systems",
    )!;
    expect(maya.kinds).toContain("calendar");
    expect(maya.kinds).toContain("calendar-mathematics");
    expect(maya.communities).toContain("Maya peoples");
  });

  it("requires cautions that prevent cultural flattening", () => {
    for (const module of FOUNDATION_CULTURAL_ATLAS.modules) {
      expect(module.cautions.length).toBeGreaterThan(0);
    }
  });

  it("rejects claims that reference invented sources", () => {
    const invalid = {
      ...FOUNDATION_CULTURAL_ATLAS,
      modules: [
        {
          ...FOUNDATION_CULTURAL_ATLAS.modules[0],
          claims: [
            {
              ...FOUNDATION_CULTURAL_ATLAS.modules[0]!.claims[0]!,
              sourceIds: ["invented-source"],
            },
          ],
        },
        FOUNDATION_CULTURAL_ATLAS.modules[1],
      ],
    };
    expect(() => validateCulturalAtlasCatalog(invalid)).toThrow(RangeError);
  });
});
