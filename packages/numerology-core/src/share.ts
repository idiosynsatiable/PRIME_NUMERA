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

  const payload: PublicSharePayload = {
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
  assertPublicSharePayloadSafe(payload);
  return payload;
}

export const SHARE_CALCULATION_LABELS: Readonly<Record<ShareCalculation, string>> = {
  "life-path": "Life Path", expression: "Expression", "soul-urge": "Soul Urge",
  personality: "Personality", birthday: "Birthday", maturity: "Maturity",
  "personal-year": "Personal Year", "personal-month": "Personal Month",
  "personal-day": "Personal Day", essence: "Essence",
};

function exactDataRecord(value: unknown, expected: readonly string[]): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Reflect.ownKeys(value);
  return keys.length === expected.length && keys.every(key =>
    typeof key === "string" && expected.includes(key) &&
    Object.hasOwn(Object.getOwnPropertyDescriptor(value, key)!, "value"));
}

export function assertPublicSharePayloadSafe(input: unknown): asserts input is PublicSharePayload {
  if (!exactDataRecord(input, ["schemaVersion", "system", "displayLabel", "aspectRatio", "values", "privacy"])) {
    throw new TypeError("Invalid public share payload shape.");
  }
  const payload = input;
  if (
      payload.schemaVersion !== 1 || payload.system !== "pythagorean" ||
      typeof payload.aspectRatio !== "string" || !["9:16", "1:1", "4:5", "16:9"].includes(payload.aspectRatio) ||
      (payload.displayLabel !== null && (typeof payload.displayLabel !== "string" || payload.displayLabel.length > 80 || /[\u0000-\u001f\u007f]/u.test(payload.displayLabel))) ||
      !Array.isArray(payload.values) || Object.getPrototypeOf(payload.values) !== Array.prototype ||
      payload.values.length < 1 || payload.values.length > 10 ||
      Reflect.ownKeys(payload.values).length !== payload.values.length + 1 ||
      Array.from({ length: payload.values.length }, (_, index) => index).some(index => !Object.hasOwn(Object.getOwnPropertyDescriptor(payload.values, index) ?? {}, "value")) ||
      !exactDataRecord(payload.privacy, ["containsBirthName", "containsBirthDate", "containsRawInput"]) ||
      payload.privacy.containsBirthName !== false || payload.privacy.containsBirthDate !== false || payload.privacy.containsRawInput !== false) {
    throw new TypeError("Invalid public share payload shape.");
  }
  const seen = new Set<string>();
  for (const value of payload.values) {
    if (!value || typeof value !== "object" ||
        !exactDataRecord(value, Object.hasOwn(value, "compoundValue") ? ["calculation", "label", "value", "compoundValue"] : ["calculation", "label", "value"]) ||
        typeof value.calculation !== "string" || !Object.hasOwn(SHARE_CALCULATION_LABELS, value.calculation) || seen.has(value.calculation) ||
        value.label !== SHARE_CALCULATION_LABELS[value.calculation as ShareCalculation] ||
        typeof value.value !== "number" || !Number.isSafeInteger(value.value) || value.value < 0 || value.value > 999 ||
        (Object.hasOwn(value, "compoundValue") && (typeof value.compoundValue !== "number" || !Number.isSafeInteger(value.compoundValue) || value.compoundValue < 0))) {
      throw new TypeError("Invalid public share value.");
    }
    seen.add(value.calculation);
  }
}
