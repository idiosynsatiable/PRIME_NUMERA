import {
  calculatePythagoreanProfile,
  calculateExpression,
  SYSTEMS,
  normalizeLatinName,
} from "@prime-numera/numerology-core";
export interface ProfileInput {
  name: string;
  date: string;
  system: "pythagorean" | "chaldean";
}
export interface SavedProfile {
  id: string;
  input: ProfileInput;
}
export function parseProfile(input: unknown): ProfileInput {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Enter a name, birth date, and methodology.");
  const x = input as Record<string, unknown>;
  if (
    Object.keys(x).length !== 3 ||
    typeof x.name !== "string" ||
    x.name.trim().length < 1 ||
    x.name.length > 200 ||
    typeof x.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(x.date) ||
    !["pythagorean", "chaldean"].includes(String(x.system))
  )
    throw new Error("Check your name, birth date, and methodology.");
  const normalized = normalizeLatinName(x.name);
  if (!normalized.normalized || normalized.ignoredCharacters.length)
    throw new Error(
      "Use Latin letters, spaces, hyphens, or straight apostrophes. Accents are normalized; unsupported characters are not silently removed.",
    );
  const result = {
    name: x.name.trim(),
    date: x.date,
    system: x.system as ProfileInput["system"],
  };
  // Validate dates consistently using the established core, including Chaldean input.
  buildProfile(result);
  return result;
}
export function buildProfile(input: ProfileInput) {
  const [year, month, day] = input.date.split("-").map(Number);
  return calculatePythagoreanProfile({
    birthName: { firstNames: input.name },
    birthDate: { year: year!, month: month!, day: day! },
    vowelPolicy: { y: "always-consonant" },
  });
}
export function buildChaldean(input: ProfileInput) {
  return calculateExpression(input.name, SYSTEMS.chaldean);
}
export function readSaved(raw: string | null): SavedProfile[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > 20)
    throw new Error(
      "Saved profile data is invalid. Export or clear this browser’s storage to recover.",
    );
  const ids = new Set<string>();
  return value.map((x) => {
    if (
      !x ||
      typeof x !== "object" ||
      Object.keys(x).length !== 2 ||
      typeof x.id !== "string" ||
      !/^[a-f0-9-]{36}$/.test(x.id) ||
      ids.has(x.id)
    )
      throw new Error("Saved profile data is invalid.");
    ids.add(x.id);
    return { id: x.id, input: parseProfile(x.input) };
  });
}
