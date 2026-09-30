import type { InterpretationCatalog } from "./interpretation.js";

/** Original editorial reflections. They are modern interpretations, not mathematical results. */
const themes: readonly [number, string, string][] = [
  [1, "Initiative", "Consider where taking the first step feels useful, and where listening first may help."],
  [2, "Cooperation", "Notice how you negotiate, listen, and preserve your own boundaries."],
  [3, "Expression", "Explore the ways you communicate and what helps an idea become clear."],
  [4, "Structure", "Reflect on the routines that support you and the ones that may need changing."],
  [5, "Change", "Consider how curiosity and a steady base can coexist."],
  [6, "Care", "Notice the balance between responsibility to others and care for yourself."],
  [7, "Inquiry", "Make space to question assumptions and examine the evidence available to you."],
  [8, "Stewardship", "Reflect on how you use resources and what accountability means to you."],
  [9, "Perspective", "Consider what a wider view reveals and where a concrete action matters."],
  [11, "Sensitivity", "Explore how attention and rest can both support your creative work."],
  [22, "Building", "Consider how a large ambition becomes a sequence of practical steps."],
  [33, "Service", "Reflect on the limits and possibilities of helping others without self-erasure."],
];

export const CORE_INTERPRETATIONS: InterpretationCatalog = {
  schemaVersion: 1,
  sources: [{
    id: "prime-numera-editorial-v1",
    title: "PRIME NUMERA original editorial reflection series, version 1",
    classification: "modern-interpretation",
    note: "Original creative prompts; not historical, statistical, medical, or predictive evidence.",
  }],
  records: themes.map(([value, title, body]) => ({
    id: `modern-core-${value}`,
    version: 1,
    locale: "en-US",
    category: "modern",
    evidenceClass: "modern-interpretation",
    editorialStatus: "reviewed",
    ageModes: ["family", "standard", "adult-18-plus"],
    applicability: { systems: ["pythagorean"], calculations: ["life-path", "expression", "soul-urge", "personality", "maturity"], values: [value] },
    title: `${value} · ${title}`,
    summary: `A modern reflection on ${title.toLowerCase()}.`,
    body,
    sourceIds: ["prime-numera-editorial-v1"],
    disclaimers: ["Interpretive prompt for reflection; the calculation itself makes no personality or future claim."],
  })),
};
