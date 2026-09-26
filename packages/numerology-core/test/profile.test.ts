import { describe, expect, it } from "vitest";
import { calculatePythagoreanProfile } from "../src/index.js";

describe("deterministic Pythagorean profile assembler", () => {
  it("matches published Tom Cruise core-number relationships", () => {
    const profile = calculatePythagoreanProfile({
      birthName: {
        firstNames: "Thomas",
        middleNames: "Cruise",
        lastNames: "Mapother",
      },
      birthDate: { year: 1962, month: 7, day: 3 },
      vowelPolicy: { y: "contextual" },
    });

    expect(profile.lifePath.value).toBe(1);
    expect(profile.expression.value).toBe(4);
    expect(profile.soulUrge.value).toBe(9);
    expect(profile.personality.value).toBe(4);

    expect(profile.bridges.lifePathExpression.value).toBe(3);
    expect(profile.bridges.soulUrgePersonality.value).toBe(5);

    expect(profile.expression.components.map(({ reduction }) => reduction.value)).toEqual([
      22,
      3,
      6,
    ]);

    expect(profile.fullBirthName).toBe("Thomas Cruise Mapother");
    expect(profile.personalCalendar).toBeNull();
    expect(profile.essence).toBeNull();
  });

  it("adds deterministic forecast data only when the caller supplies explicit time inputs", () => {
    const profile = calculatePythagoreanProfile({
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

    expect(profile.personalCalendar?.year.aggregate).toBe(2046);
    expect(profile.personalCalendar?.month.aggregate).toBe(2048);
    expect(profile.personalCalendar?.day.aggregate).toBe(2051);

    expect(profile.essence?.transits.map(({ letter }) => letter)).toEqual([
      "M",
      "E",
      "J",
    ]);
    expect(profile.essence?.aggregate).toBe(10);
    expect(profile.essence?.value).toBe(1);
  });

  it("does not read the system clock implicitly", () => {
    const profile = calculatePythagoreanProfile({
      birthName: {
        firstNames: "Ada",
        lastNames: "Lovelace",
      },
      birthDate: { year: 1815, month: 12, day: 10 },
      vowelPolicy: { y: "always-consonant" },
    });

    expect(profile.personalCalendar).toBeNull();
    expect(profile.transitChannels).toBeNull();
    expect(profile.essence).toBeNull();
  });
});
