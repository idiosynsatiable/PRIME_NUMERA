/** Inscriptional evidence and modern symbolic play remain independent layers. */
export interface RuneEvidenceEntry {
  readonly id: string;
  readonly title: string;
  readonly layer: "historical-inscription";
  readonly period: string;
  readonly context: string;
  readonly sourceUrl: string;
  readonly attribution: string;
  readonly caution: string;
}

export interface ModernRuneActivity {
  readonly id: string;
  readonly layer: "modern-entertainment";
  readonly title: string;
  readonly instructions: string;
  readonly disclaimer: string;
}

export const RUNE_EVIDENCE: readonly RuneEvidenceEntry[] = [
  {
    id: "unna-stone",
    title: "Unna's stone",
    layer: "historical-inscription",
    period: "mid-11th century",
    context: "A memorial inscription associated with Unna and her son Östen. The museum reports evidence of more than one craftsperson in its carving.",
    sourceUrl: "https://historiska.se/en/explore-history/history-hub/unnas-stone/",
    attribution: "Swedish History Museum",
    caution: "The inscription is a historical memorial, not a personal divination reading.",
  },
  {
    id: "piraeus-lion",
    title: "The Piraeus lion",
    layer: "historical-inscription",
    period: "Viking Age inscription",
    context: "An inscribed object whose carved text is presented with museum context and partial readings.",
    sourceUrl: "https://historiska.se/en/explore-history/history-hub/the-piraeus-lion-with-viking-tattoos/",
    attribution: "Swedish History Museum",
    caution: "An incomplete or contested reading must not be filled in with invented meaning.",
  },
] as const;

export const MODERN_RUNE_ACTIVITY: ModernRuneActivity = {
  id: "reflective-prompt",
  layer: "modern-entertainment",
  title: "Reflective symbol prompt",
  instructions: "Choose a rune as a creative prompt, then write what its shape or sound suggests to you.",
  disclaimer: "A contemporary reflective activity. It is not an attested historical inscription practice or a prediction.",
};

export function getRuneEvidence(id: string): RuneEvidenceEntry | null {
  return RUNE_EVIDENCE.find((entry) => entry.id === id) ?? null;
}
