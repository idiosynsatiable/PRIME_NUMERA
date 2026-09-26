import { describe, expect, it } from "vitest";
import {
  PYTHAGOREAN,
  buildStandardTransitChannels,
  calculateEssenceAtAge,
  calculateTransitAtAge,
} from "../src/index.js";

describe("Transit and Essence cycles", () => {
  it("uses a letter for as many ages as its mapped value", () => {
    const channel = { id: "physical" as const, name: "Mary" };
    expect(calculateTransitAtAge(channel, 0, PYTHAGOREAN).letter).toBe("M");
    expect(calculateTransitAtAge(channel, 3, PYTHAGOREAN).letter).toBe("M");
    const ageFour = calculateTransitAtAge(channel, 4, PYTHAGOREAN);
    expect(ageFour.letter).toBe("A");
    expect(ageFour.value).toBe(1);
    expect(ageFour.startAge).toBe(4);
    expect(ageFour.endAgeExclusive).toBe(5);
  });

  it("restarts the name after its full duration", () => {
    const channel = { id: "physical" as const, name: "Mary" };
    const initial = calculateTransitAtAge(channel, 0, PYTHAGOREAN);
    const repeated = calculateTransitAtAge(channel, initial.cycleDuration, PYTHAGOREAN);
    expect(repeated.letter).toBe("M");
    expect(repeated.cycleIndex).toBe(1);
  });

  it("calculates Mary Elizabeth Johnson age-zero Essence as 10/1", () => {
    const channels = buildStandardTransitChannels("Mary", "Elizabeth", "Johnson");
    const result = calculateEssenceAtAge(channels, 0, PYTHAGOREAN);
    expect(result.transits.map(({ letter }) => letter)).toEqual(["M", "E", "J"]);
    expect(result.transits.map(({ value }) => value)).toEqual([4, 5, 1]);
    expect(result.aggregate).toBe(10);
    expect(result.value).toBe(1);
  });

  it("makes the no-middle-name merge explicit rather than inventing a third channel", () => {
    expect(buildStandardTransitChannels("Ada", null, "Lovelace")).toEqual([
      { id: "physical", name: "Ada" },
      { id: "mental-spiritual", name: "Lovelace" },
    ]);
  });
});
