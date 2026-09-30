import type { CollisionAnalysis } from "./collision.js";
import type { CompatibilityMode, ProfileCompatibilityComparison } from "./profile-compatibility.js";

export interface CollisionInterpretation {
  readonly kind: "modern-interpretation";
  readonly signalValue: number;
  readonly nodeIds: readonly string[];
  readonly prompt: string;
  readonly rarityClaimed: false;
}

export function interpretRepetitions(analysis: CollisionAnalysis): readonly CollisionInterpretation[] {
  return analysis.repetitions.map(({ value, nodeIds }) => ({
    kind: "modern-interpretation", signalValue: value, nodeIds,
    prompt: `The value ${value} occurs in several defined calculations. Compare their formulas and reflect on their different roles.`,
    rarityClaimed: false,
  }));
}

const contexts: Record<CompatibilityMode, string> = {
  romantic: "Discuss expectations and communication without treating numbers as a relationship forecast.",
  friendship: "Compare how you support each other and respect separate needs.",
  family: "Consider shared habits and individual boundaries without labeling anyone's character.",
  "creative-partnership": "Explore different working rhythms and ways to make decisions together.",
  "business-collaboration": "Discuss roles, accountability, and practical agreements before committing resources.",
};

export function describeCompatibilityContext(comparison: ProfileCompatibilityComparison) {
  return {
    mode: comparison.mode,
    category: "modern" as const,
    evidenceClass: "modern-interpretation" as const,
    prompt: contexts[comparison.mode],
    sharedDimensions: comparison.coreDimensions.filter((dimension) => dimension.shared).map((dimension) => dimension.calculation),
    singlePercentageProvided: false as const,
    disclaimer: "A reflective comparison, not a prediction or measurement of relationship quality.",
  };
}
