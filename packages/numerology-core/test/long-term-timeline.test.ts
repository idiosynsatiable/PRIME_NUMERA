import { describe, expect, it } from "vitest";
import { calculateLongTermTimeline } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("long-term timeline", () => {
  it("uses 36 minus single-digit Life Path for the first Period/Pinnacle transition", () => {
    const result = calculateLongTermTimeline(
      { year: 1949, month: 5, day: 15 },
      8,
      policy,
    );
    expect(result.lifePathSingleDigit).toBe(8);
    expect(result.firstTransitionAge).toBe(28);
    expect(result.pinnacles.map(({ startAge, endAgeExclusive }) => [startAge, endAgeExclusive])).toEqual([
      [0, 28],
      [28, 37],
      [37, 46],
      [46, null],
    ]);
    expect(result.periods.map(({ startAge, endAgeExclusive }) => [startAge, endAgeExclusive])).toEqual([
      [0, 28],
      [28, 55],
      [55, null],
    ]);
  });

  it("reduces a Master Life Path only for timeline-duration arithmetic", () => {
    const result = calculateLongTermTimeline(
      { year: 1983, month: 11, day: 22 },
      11,
      policy,
    );
    expect(result.lifePathSingleDigit).toBe(2);
    expect(result.firstTransitionAge).toBe(34);
  });

  it("explicitly refuses to pretend Challenges use hard cycle ranges", () => {
    const result = calculateLongTermTimeline(
      { year: 1962, month: 7, day: 3 },
      1,
      policy,
    );
    expect(result.challengesHaveFixedRanges).toBe(false);
  });
});
