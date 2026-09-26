import type { BirthdayNumberResult } from "./basic-date.js";
import type { ComponentAwareNameResult } from "./component-name.js";
import type { LifePathResult } from "./date.js";

export const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19] as const;
export type KarmicDebtNumber = (typeof KARMIC_DEBT_NUMBERS)[number];

export interface KarmicDebtOccurrence {
  readonly value: KarmicDebtNumber;
  readonly source: string;
}

export interface KarmicDebtStage {
  readonly value: number;
  readonly source: string;
}

export interface CoreKarmicDebtInput {
  readonly lifePath?: LifePathResult;
  readonly birthday?: BirthdayNumberResult;
  readonly expression?: ComponentAwareNameResult;
  readonly soulUrge?: ComponentAwareNameResult;
  readonly personality?: ComponentAwareNameResult;
}

export function detectKarmicDebt(
  values: readonly KarmicDebtStage[],
): readonly KarmicDebtOccurrence[] {
  return values.flatMap(({ value, source }) =>
    KARMIC_DEBT_NUMBERS.includes(value as KarmicDebtNumber)
      ? [{ value: value as KarmicDebtNumber, source }]
      : [],
  );
}

function nameStages(
  label: "expression" | "soul-urge" | "personality",
  result: ComponentAwareNameResult | undefined,
): readonly KarmicDebtStage[] {
  if (!result) return [];
  if (result.strategy !== "reduce-components") {
    throw new RangeError(
      `${label} Karmic Debt detection requires the component-aware reduction strategy.`,
    );
  }

  return [
    ...result.components.map((component, index) => ({
      value: component.sum,
      source: `${label}.component[${index}].compound`,
    })),
    { value: result.aggregate, source: `${label}.final-compound` },
  ];
}

export function collectCoreKarmicDebtStages(
  input: CoreKarmicDebtInput,
): readonly KarmicDebtStage[] {
  const stages: KarmicDebtStage[] = [];

  if (input.lifePath) {
    if (input.lifePath.strategy !== "reduce-components") {
      throw new RangeError(
        "Life Path Karmic Debt detection requires the reduce-components strategy.",
      );
    }
    stages.push({
      value: input.lifePath.aggregate,
      source: "life-path.final-compound",
    });
  }

  if (input.birthday) {
    stages.push({
      value: input.birthday.day,
      source: "birthday.day",
    });
  }

  stages.push(...nameStages("expression", input.expression));
  stages.push(...nameStages("soul-urge", input.soulUrge));
  stages.push(...nameStages("personality", input.personality));

  return stages;
}

export function detectCoreKarmicDebt(
  input: CoreKarmicDebtInput,
): readonly KarmicDebtOccurrence[] {
  return detectKarmicDebt(collectCoreKarmicDebtStages(input));
}
