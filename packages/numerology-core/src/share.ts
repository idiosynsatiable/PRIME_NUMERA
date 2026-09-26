import type { PythagoreanProfile } from "./profile.js";

export type ShareAspectRatio = "9:16" | "1:1" | "4:5" | "16:9";

export type ShareCalculation =
  | "life-path"
  | "expression"
  | "soul-urge"
  | "personality"
  | "birthday"
  | "maturity"
  | "personal-year"
  | "personal-month"
  | "personal-day"
  | "essence";

export interface PublicShareSelection {
  readonly calculations: readonly ShareCalculation[];
  readonly displayLabel?: string;
  readonly aspectRatio: ShareAspectRatio;
}

export interface PublicShareValue {
  readonly calculation: ShareCalculation;
  readonly label: string;
  readonly value: number;
  readonly compoundValue?: number;
}

export interface PublicSharePayload {
  readonly schemaVersion: 1;
  readonly system: "pythagorean";
  readonly displayLabel: string | null;
  readonly aspectRatio: ShareAspectRatio;
  readonly values: readonly PublicShareValue[];
  readonly privacy: {
    readonly containsBirthName: false;
    readonly containsBirthDate: false;
    readonly containsRawInput: false;
  };
}

function normalizeDisplayLabel(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.length > 80) {
    throw new RangeError("Public display label must be 80 characters or fewer.");
  }
  return trimmed;
}

function valueFor(
  profile: PythagoreanProfile,
  calculation: ShareCalculation,
): PublicShareValue {
  switch (calculation) {
    case "life-path":
      return {
        calculation,
        label: "Life Path",
        value: profile.lifePath.value,
        compoundValue: profile.lifePath.aggregate,
      };
    case "expression":
      return {
        calculation,
        label: "Expression",
        value: profile.expression.value,
        compoundValue: profile.expression.aggregate,
      };
    case "soul-urge":
      return {
        calculation,
        label: "Soul Urge",
        value: profile.soulUrge.value,
        compoundValue: profile.soulUrge.aggregate,
      };
    case "personality":
      return {
        calculation,
        label: "Personality",
        value: profile.personality.value,
        compoundValue: profile.personality.aggregate,
      };
    case "birthday":
      return {
        calculation,
        label: "Birthday",
        value: profile.birthday.value,
        compoundValue: profile.birthday.day,
      };
    case "maturity":
      return {
        calculation,
        label: "Maturity",
        value: profile.maturity.value,
        compoundValue: profile.maturity.aggregate,
      };
    case "personal-year":
      if (!profile.personalCalendar) {
        throw new RangeError("Personal Year sharing requires an explicit target date.");
      }
      return {
        calculation,
        label: "Personal Year",
        value: profile.personalCalendar.year.value,
        compoundValue: profile.personalCalendar.year.aggregate,
      };
    case "personal-month":
      if (!profile.personalCalendar) {
        throw new RangeError("Personal Month sharing requires an explicit target date.");
      }
      return {
        calculation,
        label: "Personal Month",
        value: profile.personalCalendar.month.value,
        compoundValue: profile.personalCalendar.month.aggregate,
      };
    case "personal-day":
      if (!profile.personalCalendar) {
        throw new RangeError("Personal Day sharing requires an explicit target date.");
      }
      return {
        calculation,
        label: "Personal Day",
        value: profile.personalCalendar.day.value,
        compoundValue: profile.personalCalendar.day.aggregate,
      };
    case "essence":
      if (!profile.essence) {
        throw new RangeError("Essence sharing requires an explicit forecast age.");
      }
      return {
        calculation,
        label: "Essence",
        value: profile.essence.value,
        compoundValue: profile.essence.aggregate,
      };
  }
}

export function createPublicSharePayload(
  profile: PythagoreanProfile,
  selection: PublicShareSelection,
): PublicSharePayload {
  if (selection.calculations.length === 0) {
    throw new RangeError("At least one derived calculation must be selected for sharing.");
  }

  const seen = new Set<ShareCalculation>();
  const values = selection.calculations.map((calculation) => {
    if (seen.has(calculation)) {
      throw new RangeError(`Duplicate share calculation: ${calculation}.`);
    }
    seen.add(calculation);
    return valueFor(profile, calculation);
  });

  return {
    schemaVersion: 1,
    system: "pythagorean",
    displayLabel: normalizeDisplayLabel(selection.displayLabel),
    aspectRatio: selection.aspectRatio,
    values,
    privacy: {
      containsBirthName: false,
      containsBirthDate: false,
      containsRawInput: false,
    },
  };
}

export function assertPublicSharePayloadSafe(payload: PublicSharePayload): void {
  const serialized = JSON.stringify(payload);
  const forbiddenKeys = ["birthName", "birthDate", "fullBirthName", "originalInput", "normalizedInput"];

  for (const key of forbiddenKeys) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Public share payload contains forbidden field: ${key}.`);
    }
  }

  if (
    payload.privacy.containsBirthName ||
    payload.privacy.containsBirthDate ||
    payload.privacy.containsRawInput
  ) {
    throw new Error("Public share payload privacy flags are inconsistent with public-safe sharing.");
  }
}
