import { expect, it } from "vitest";
import { parseProfile, readSaved } from "../src/profile-storage";
import { reflection } from "../src/reflections";
it("rejects malformed saves, impossible dates, unsupported characters and unknown fields", () => {
  for (const input of [
    { name: "Ada", date: "2023-02-29", system: "pythagorean" },
    { name: "Ada<script>", date: "2000-01-01", system: "pythagorean" },
    { name: "Ada", date: "2000-01-01", system: "pythagorean", extra: 1 },
  ])
    expect(() => parseProfile(input)).toThrow();
  expect(() => readSaved("[{}]")).toThrow();
});
it("round-trips explicitly saved names and separates the selected methodology", () => {
  const input = parseProfile({
    name: "Élodie",
    date: "2000-02-29",
    system: "chaldean",
  });
  const saved = [{ id: "12345678-1234-1234-1234-123456789abc", input }];
  expect(readSaved(JSON.stringify(saved))).toEqual(saved);
  expect(readSaved(null)).toEqual([]);
});
it("covers all reduced values and supported master values with structured reflection", () => {
  for (const value of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    const t = reflection(value);
    expect(t.title).toBeTruthy();
    expect(t.strength).toBeTruthy();
    expect(t.challenge).toBeTruthy();
    expect(t.prompt).toBeTruthy();
  }
});
