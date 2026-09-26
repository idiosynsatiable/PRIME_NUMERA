import { describe, expect, it } from "vitest";
import { calculatePersonalCalendar } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("direct personal calendar", () => {
  it("preserves the published arithmetic path for May 15 on February 3, 2026", () => {
    const result = calculatePersonalCalendar(
      { year: 1990, month: 5, day: 15 },
      { year: 2026, month: 2, day: 3 },
      policy,
    );

    expect(result.year.aggregate).toBe(2046);
    expect(result.year.value).toBe(3);
    expect(result.month.aggregate).toBe(2048);
    expect(result.month.value).toBe(5);
    expect(result.day.aggregate).toBe(2051);
    expect(result.day.value).toBe(8);
  });

  it("rejects an impossible target date", () => {
    expect(() =>
      calculatePersonalCalendar(
        { year: 1990, month: 5, day: 15 },
        { year: 2026, month: 2, day: 30 },
        policy,
      ),
    ).toThrow(RangeError);
  });
});
