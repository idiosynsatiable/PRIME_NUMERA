import { describe, expect, it } from "vitest";
import {
  calculatePythagoreanProfile,
  comparePythagoreanProfiles,
} from "../src/index.js";

const first = calculatePythagoreanProfile({
  birthName: {
    firstNames: "Thomas",
    middleNames: "Cruise",
    lastNames: "Mapother",
  },
  birthDate: { year: 1962, month: 7, day: 3 },
  vowelPolicy: { y: "contextual" },
  targetDate: { year: 2026, month: 2, day: 3 },
});

const second = calculatePythagoreanProfile({
  birthName: {
    firstNames: "Mary",
    middleNames: "Elizabeth",
    lastNames: "Johnson",
  },
  birthDate: { year: 1990, month: 5, day: 15 },
  vowelPolicy: { y: "contextual" },
  targetDate: { year: 2026, month: 2, day: 3 },
});

describe("profile compatibility", () => {
  it("compares named dimensions without returning a compatibility percentage", () => {
    const result = comparePythagoreanProfiles(first, second, "friendship");

    expect(result.mode).toBe("friendship");
    expect(result.singlePercentageProvided).toBe(false);
    expect(result.coreDimensions.map(({ calculation }) => calculation)).toEqual([
      "life-path",
      "expression",
      "soul-urge",
      "personality",
      "birthday",
    ]);

    for (const dimension of result.coreDimensions) {
      expect(dimension.absoluteDifference).toBe(
        Math.abs(dimension.firstValue - dimension.secondValue),
      );
    }
  });

  it("treats relationship mode as context metadata rather than changing arithmetic", () => {
    const romantic = comparePythagoreanProfiles(first, second, "romantic");
    const business = comparePythagoreanProfiles(
      first,
      second,
      "business-collaboration",
    );

    expect(romantic.coreDimensions).toEqual(business.coreDimensions);
    expect(romantic.cycleOverlap).toEqual(business.cycleOverlap);
  });

  it("compares cycle overlap only when both profiles contain that cycle", () => {
    const result = comparePythagoreanProfiles(first, second, "family");
    expect(result.cycleOverlap.map(({ calculation }) => calculation)).toEqual([
      "personal-year",
      "personal-month",
      "personal-day",
    ]);
  });
});
