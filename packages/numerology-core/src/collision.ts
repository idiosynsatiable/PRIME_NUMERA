import type { NumberDnaNode } from "./number-dna.js";

export interface RepetitionSignal {
  readonly value: number;
  readonly nodeIds: readonly string[];
  readonly count: number;
}

export interface CollisionAnalysis {
  readonly kind: "interpretive-analysis-input";
  readonly repetitions: readonly RepetitionSignal[];
  readonly rarityClaimed: false;
}

export function analyzeDeterministicPatterns(nodes: readonly NumberDnaNode[]): CollisionAnalysis {
  const byValue = new Map<number, string[]>();
  for (const node of nodes) {
    const bucket = byValue.get(node.value) ?? [];
    bucket.push(node.id);
    byValue.set(node.value, bucket);
  }

  const repetitions = [...byValue.entries()]
    .filter(([, nodeIds]) => nodeIds.length > 1)
    .map(([value, nodeIds]) => ({ value, nodeIds, count: nodeIds.length }))
    .sort((a, b) => b.count - a.count || a.value - b.value);

  return { kind: "interpretive-analysis-input", repetitions, rarityClaimed: false };
}
