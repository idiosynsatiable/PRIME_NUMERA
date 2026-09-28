import { describe, expect, it } from "vitest";
import {
  assertPublicSharePayloadSafe,
  calculatePythagoreanProfile,
  createPublicSharePayload,
} from "../src/index.js";

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

describe("public-safe sharing", () => {
  it("shares only explicitly selected derived values", () => {
    const payload = createPublicSharePayload(profile, {
      calculations: ["life-path", "expression", "personal-year"],
      displayLabel: "M.",
      aspectRatio: "9:16",
    });

    expect(payload.values.map(({ calculation }) => calculation)).toEqual([
      "life-path",
      "expression",
      "personal-year",
    ]);
    expect(payload.displayLabel).toBe("M.");
    expect(() => assertPublicSharePayloadSafe(payload)).not.toThrow();

    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("Mary");
    expect(serialized).not.toContain("Elizabeth");
    expect(serialized).not.toContain("Johnson");
    expect(serialized).not.toContain("1990");
  });

  it("does not include birth name or birth date fields by schema", () => {
    const payload = createPublicSharePayload(profile, {
      calculations: ["soul-urge", "personality"],
      aspectRatio: "1:1",
    });
    expect(payload.privacy).toEqual({
      containsBirthName: false,
      containsBirthDate: false,
      containsRawInput: false,
    });
    expect(Object.keys(payload)).not.toContain("birthName");
    expect(Object.keys(payload)).not.toContain("birthDate");
  });

  it("rejects duplicate requested values", () => {
    expect(() =>
      createPublicSharePayload(profile, {
        calculations: ["life-path", "life-path"],
        aspectRatio: "4:5",
      }),
    ).toThrow(RangeError);
  });

  it("rejects forecast sharing when forecast inputs do not exist", () => {
    const staticProfile = calculatePythagoreanProfile({
      birthName: { firstNames: "Ada", lastNames: "Lovelace" },
      birthDate: { year: 1815, month: 12, day: 10 },
      vowelPolicy: { y: "always-consonant" },
    });

    expect(() =>
      createPublicSharePayload(staticProfile, {
        calculations: ["personal-year"],
        aspectRatio: "16:9",
      }),
    ).toThrow(RangeError);
  });

  it("bounds user-provided public labels", () => {
    expect(() =>
      createPublicSharePayload(profile, {
        calculations: ["life-path"],
        displayLabel: "X".repeat(81),
        aspectRatio: "1:1",
      }),
    ).toThrow(RangeError);
  });

  it("rejects extra and malformed runtime fields even when types are bypassed", () => {
    const payload = createPublicSharePayload(profile, { calculations: ["life-path"], aspectRatio: "1:1" });
    expect(() => assertPublicSharePayloadSafe({ ...payload, birthDate: "1990-05-15" } as never)).toThrow();
    expect(() => assertPublicSharePayloadSafe({ ...payload, values: [{ ...payload.values[0], originalInput: "Mary" }] } as never)).toThrow();
    expect(() => assertPublicSharePayloadSafe({ ...payload, aspectRatio: "bad" } as never)).toThrow();
  });
});

describe("share boundary fail-closed validation", () => {
  it("requires literal false privacy flags, never merely falsy values", () => {
    const payload = createPublicSharePayload(profile, { calculations: ["life-path"], aspectRatio: "1:1" });
    for (const value of [0, null, undefined, "", true]) {
      expect(() => assertPublicSharePayloadSafe({ ...payload, privacy: { ...payload.privacy, containsRawInput: value } })).toThrow();
    }
  });

  it("rejects non-data properties and inherited serialization hooks", () => {
    const payload = createPublicSharePayload(profile, { calculations: ["life-path"], aspectRatio: "1:1" });
    const inherited = Object.assign(Object.create({ toJSON() { return { birthName: "secret" }; } }), payload);
    expect(() => assertPublicSharePayloadSafe(inherited)).toThrow();
    const accessor = { ...payload };
    Object.defineProperty(accessor, "displayLabel", { get() { throw new Error("must not run"); } });
    expect(() => assertPublicSharePayloadSafe(accessor)).toThrow("shape");
  });

  it("validates the constructed payload even when compile-time types are bypassed", () => {
    expect(() => createPublicSharePayload(profile, { calculations: ["life-path"], aspectRatio: "fake" as never })).toThrow();
  });
});

it("rejects array serialization hooks, sparse values and index accessors", () => {
  const payload = createPublicSharePayload(profile, { calculations: ["life-path"], aspectRatio: "1:1" });
  const hooked = Object.assign([...payload.values], { toJSON() { return [{ birthName: "Mary" }]; } });
  expect(() => assertPublicSharePayloadSafe({ ...payload, values: hooked })).toThrow();
  expect(() => assertPublicSharePayloadSafe({ ...payload, values: new Array(1) })).toThrow();
  const accessor = [...payload.values];
  Object.defineProperty(accessor, 0, { get() { throw new Error("must not run"); } });
  expect(() => assertPublicSharePayloadSafe({ ...payload, values: accessor })).toThrow("shape");
});
