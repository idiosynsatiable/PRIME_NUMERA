import { describe, expect, it } from "vitest";
import { getRuneEvidence, MODERN_RUNE_ACTIVITY, RUNE_EVIDENCE } from "../src/index.js";

describe("Runes Lab separation", () => {
  it("keeps sourced inscriptions distinct from contemporary activity", () => {
    expect(RUNE_EVIDENCE.every((entry) => entry.layer === "historical-inscription" && entry.sourceUrl.startsWith("https://"))).toBe(true);
    expect(MODERN_RUNE_ACTIVITY.layer).toBe("modern-entertainment");
    expect(getRuneEvidence("unna-stone")?.attribution).toBe("Swedish History Museum");
    expect(getRuneEvidence("invented")).toBeNull();
  });
});
