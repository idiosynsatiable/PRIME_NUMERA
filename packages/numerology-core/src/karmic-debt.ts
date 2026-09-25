export const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19] as const;
export type KarmicDebtNumber = (typeof KARMIC_DEBT_NUMBERS)[number];

export interface KarmicDebtOccurrence {
  readonly value: KarmicDebtNumber;
  readonly source: string;
}

export function detectKarmicDebt(
  values: readonly { readonly value: number; readonly source: string }[],
): readonly KarmicDebtOccurrence[] {
  return values.flatMap(({ value, source }) =>
    KARMIC_DEBT_NUMBERS.includes(value as KarmicDebtNumber)
      ? [{ value: value as KarmicDebtNumber, source }]
      : [],
  );
}
