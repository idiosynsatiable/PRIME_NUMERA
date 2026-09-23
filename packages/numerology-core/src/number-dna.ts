import type { NumerologySystemId } from "./types.js";

export type NumberDnaRelationship =
  | "amplifier"
  | "tension"
  | "bridge"
  | "repetition"
  | "cycle-overlap"
  | "alternate-system";

export interface NumberDnaNode {
  readonly id: string;
  readonly calculation: string;
  readonly label: string;
  readonly value: number;
  readonly system: NumerologySystemId;
  readonly derivationRef: string;
  readonly timeScope?: string;
}

export interface NumberDnaEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly relationship: NumberDnaRelationship;
  readonly interpretationRef?: string;
}

export interface NumberDnaGraph {
  readonly nodes: readonly NumberDnaNode[];
  readonly edges: readonly NumberDnaEdge[];
}

export function validateNumberDnaGraph(graph: NumberDnaGraph): void {
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (!node.id) throw new RangeError("Number DNA node IDs cannot be empty.");
    if (ids.has(node.id)) throw new RangeError(`Duplicate Number DNA node ID: ${node.id}`);
    if (!Number.isSafeInteger(node.value) || node.value < 0) {
      throw new RangeError(`Invalid Number DNA value for ${node.id}.`);
    }
    ids.add(node.id);
  }
  for (const edge of graph.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      throw new RangeError(`Number DNA edge ${edge.id} references a missing node.`);
    }
  }
}
