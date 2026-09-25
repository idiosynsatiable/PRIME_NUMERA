import type { ReductionPolicy, ReductionResult, ReductionStep } from "./types.js";

export const DEFAULT_REDUCTION_POLICY: ReductionPolicy = {
  preserveMasterNumbers: [11, 22, 33],
};

const digitsOf = (value: number): number[] =>
  Math.abs(value)
    .toString()
    .split("")
    .map((digit) => Number(digit));

export function reduceNumber(
  input: number,
  policy: ReductionPolicy = DEFAULT_REDUCTION_POLICY,
): ReductionResult {
  if (!Number.isSafeInteger(input) || input < 0) {
    throw new RangeError("Reduction input must be a non-negative safe integer.");
  }

  const steps: ReductionStep[] = [];
  let current = input;

  while (current > 9) {
    if (policy.preserveMasterNumbers.includes(current as 11 | 22 | 33)) {
      steps.push({
        input: current,
        digits: digitsOf(current),
        output: current,
        preservedAsMaster: true,
      });
      break;
    }

    const digits = digitsOf(current);
    const output = digits.reduce((sum, digit) => sum + digit, 0);
    steps.push({ input: current, digits, output, preservedAsMaster: false });
    current = output;
  }

  return { value: current, steps };
}
