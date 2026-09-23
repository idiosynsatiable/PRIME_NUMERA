import { describe, expect, it } from "vitest";
import { calculatePersonalDay, calculatePersonalMonth, calculatePersonalYear } from "../src/index.js";

const policy = { preserveMasterNumbers: [11, 22, 33] as const };

describe("personal periods", () => {
  it("chains year month and day while exposing each aggregate", () => {
    const year = calculatePersonalYear({ year: 1990, month: 11, day: 21 }, 2026, policy);
    const month = calculatePersonalMonth(year.value, 9, policy);
    const day = calculatePersonalDay(month.value, 23, policy);
    expect(year.calendarYear).toBe(2026);
    expect(month.calendarMonth).toBe(9);
    expect(day.calendarDay).toBe(23);
    expect(day.value).toBe(day.reduction.value);
  });

  it("rejects invalid calendar month input", () => {
    expect(() => calculatePersonalMonth(4, 13, policy)).toThrow(RangeError);
  });
});
