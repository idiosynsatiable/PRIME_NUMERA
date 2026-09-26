import { normalizeLatinName } from "./name.js";
import { reduceNumber } from "./reduction.js";
import type { NumerologySystem, ReductionPolicy, ReductionResult } from "./types.js";

export type TransitChannelId = "physical" | "mental" | "spiritual" | "mental-spiritual";

export interface TransitChannelInput {
  readonly id: TransitChannelId;
  readonly name: string;
}

export interface TransitResult {
  readonly channel: TransitChannelId;
  readonly originalName: string;
  readonly normalizedName: string;
  readonly age: number;
  readonly cycleDuration: number;
  readonly cycleIndex: number;
  readonly letterIndex: number;
  readonly letter: string;
  readonly value: number;
  readonly startAge: number;
  readonly endAgeExclusive: number;
}

export interface EssenceResult {
  readonly calculation: "essence";
  readonly age: number;
  readonly transits: readonly TransitResult[];
  readonly aggregate: number;
  readonly reduction: ReductionResult;
  readonly value: number;
}

export const ESSENCE_REDUCTION_POLICY: ReductionPolicy = Object.freeze({
  preserveMasterNumbers: [],
});

export function buildStandardTransitChannels(
  firstNames: string,
  middleNames: string | null | undefined,
  lastNames: string,
): readonly TransitChannelInput[] {
  const middle = middleNames?.trim() ?? "";
  if (middle) {
    return [
      { id: "physical", name: firstNames },
      { id: "mental", name: middle },
      { id: "spiritual", name: lastNames },
    ];
  }
  return [
    { id: "physical", name: firstNames },
    { id: "mental-spiritual", name: lastNames },
  ];
}

export function calculateTransitAtAge(
  channel: TransitChannelInput,
  age: number,
  system: NumerologySystem,
): TransitResult {
  if (!Number.isSafeInteger(age) || age < 0) {
    throw new RangeError("Transit age must be a non-negative safe integer.");
  }

  const normalizedName = normalizeLatinName(channel.name).normalized;
  if (!normalizedName) {
    throw new RangeError(`Transit channel ${channel.id} must contain a supported Latin letter.`);
  }

  const letters = [...normalizedName];
  const values = letters.map((letter) => {
    const value = system.mappings[letter];
    if (value === undefined || value <= 0) {
      throw new Error(`No positive ${system.id} mapping for ${letter}.`);
    }
    return value;
  });

  const cycleDuration = values.reduce((sum, value) => sum + value, 0);
  const cycleIndex = Math.floor(age / cycleDuration);
  const offset = age % cycleDuration;

  let cursor = 0;
  for (let letterIndex = 0; letterIndex < letters.length; letterIndex += 1) {
    const value = values[letterIndex]!;
    const next = cursor + value;
    if (offset < next) {
      const startAge = cycleIndex * cycleDuration + cursor;
      return {
        channel: channel.id,
        originalName: channel.name,
        normalizedName,
        age,
        cycleDuration,
        cycleIndex,
        letterIndex,
        letter: letters[letterIndex]!,
        value,
        startAge,
        endAgeExclusive: startAge + value,
      };
    }
    cursor = next;
  }

  throw new Error("Transit resolution failed despite a non-empty positive-duration cycle.");
}

export function calculateEssenceAtAge(
  channels: readonly TransitChannelInput[],
  age: number,
  system: NumerologySystem,
  policy: ReductionPolicy = ESSENCE_REDUCTION_POLICY,
): EssenceResult {
  if (channels.length === 0) throw new RangeError("Essence requires at least one Transit channel.");
  const transits = channels.map((channel) => calculateTransitAtAge(channel, age, system));
  const aggregate = transits.reduce((sum, transit) => sum + transit.value, 0);
  const reduction = reduceNumber(aggregate, policy);
  return { calculation: "essence", age, transits, aggregate, reduction, value: reduction.value };
}
