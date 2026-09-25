export interface CompatibilityDimension {
  readonly calculation: string;
  readonly firstValue: number;
  readonly secondValue: number;
  readonly shared: boolean;
  readonly absoluteDifference: number;
}

export interface CompatibilityComparison {
  readonly dimensions: readonly CompatibilityDimension[];
  readonly singlePercentageProvided: false;
}

export function compareCompatibilityDimensions(
  dimensions: readonly {
    readonly calculation: string;
    readonly firstValue: number;
    readonly secondValue: number;
  }[],
): CompatibilityComparison {
  return {
    dimensions: dimensions.map(({ calculation, firstValue, secondValue }) => ({
      calculation,
      firstValue,
      secondValue,
      shared: firstValue === secondValue,
      absoluteDifference: Math.abs(firstValue - secondValue),
    })),
    singlePercentageProvided: false,
  };
}
