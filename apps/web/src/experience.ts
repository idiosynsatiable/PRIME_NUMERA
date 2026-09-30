/** Original modern creative content. This layer never changes numerical results. */
export const INTENTS = ["create", "explore", "reflect"] as const;
export type Intent = (typeof INTENTS)[number];
export const CARD_IDS = ["phoenix", "architect", "wayfinder"] as const;
export type CardId = (typeof CARD_IDS)[number];
export interface ArcanaCard {
  id: CardId;
  title: string;
  intent: Intent;
  subtitle: string;
  story: string;
  values: readonly number[];
  paths: readonly [string, string];
  tasks: readonly [readonly string[], readonly string[]];
}
export const CARDS: readonly ArcanaCard[] = [
  {
    id: "phoenix",
    title: "The Phoenix",
    intent: "reflect",
    subtitle: "Make room for what comes next.",
    story:
      "The Phoenix keeps a small flame for unfinished beginnings. Nothing has to burn down for something new to grow. Set one thing down. See what your hands can hold now.",
    values: [2, 6, 9, 11, 33],
    paths: ["Begin again", "Keep the ember"],
    tasks: [
      [
        "Name one expectation you are ready to put down. What would replace it?",
        "Give an unfinished idea a smaller, kinder beginning. What is the first step?",
        "Look at something familiar from across the room. What did you stop noticing?",
      ],
      [
        "Choose one thing worth carrying into your next chapter. Why does it matter?",
        "Think of a small kindness you received. Find your own way to pass it on.",
        "Name something you learned the hard way. How can you use it gently?",
      ],
    ],
  },
  {
    id: "architect",
    title: "The Architect",
    intent: "create",
    subtitle: "Turn a spark into something real.",
    story:
      "The Architect draws stairways before she knows where they lead. Her palace began as a line on an empty page. You do not need the whole plan. Give one good idea a place to stand.",
    values: [1, 3, 4, 8, 22],
    paths: ["A fresh idea", "A steady habit"],
    tasks: [
      [
        "Invent a tiny tool that would make your day easier. Sketch it or describe it in one sentence.",
        "Combine two things that usually stay apart. What could they become together?",
        "Make a three-step plan for something you have been waiting to start. Do the smallest step.",
      ],
      [
        "Choose a five-minute practice you could repeat. What would make it enjoyable?",
        "Remove one unnecessary step from a routine. Keep the part that helps.",
        "Build a small place for your next idea: a note, a page, a shelf, a conversation.",
      ],
    ],
  },
  {
    id: "wayfinder",
    title: "The Wayfinder",
    intent: "explore",
    subtitle: "Some doors open when you take a different turn.",
    story:
      "The Wayfinder has never owned a perfect map. He follows questions, keeps good company, and leaves room for a detour. The next door does not need to be the biggest one. It only needs to open.",
    values: [5, 7],
    paths: ["Hidden path", "Familiar ground"],
    tasks: [
      [
        "Find one question you have never asked about a place you know well. Follow the answer.",
        "Choose a subject outside your usual interests. Learn one surprising fact from a reliable source.",
        "Try a small, safe variation on your usual route or routine. What changes?",
      ],
      [
        "Revisit an old favorite. What do you notice now that you missed before?",
        "Ask someone you trust what they enjoy making or learning. Listen for the unexpected detail.",
        "Look closely at an everyday object. How many decisions went into making it?",
      ],
    ],
  },
];
export const cardById = (id: CardId): ArcanaCard =>
  CARDS.find((card) => card.id === id)!;
export interface ExperienceState {
  version: 1;
  seed: number;
  draw: number;
  intent: Intent;
  adaptive: boolean;
  history: CardId[];
  saved: CardId[];
  feedback: Partial<Record<CardId, -1 | 1>>;
  completed: string[];
}
export function initialExperience(seed: number): ExperienceState {
  return {
    version: 1,
    seed: seed >>> 0,
    draw: 0,
    intent: "reflect",
    adaptive: true,
    history: [],
    saved: [],
    feedback: {},
    completed: [],
  };
}
function hash(value: string): number {
  let result = 2166136261;
  for (const char of value)
    result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0) / 4294967296;
}
export interface Selection {
  card: ArcanaCard;
  reasons: string[];
  chapter: number;
}
/** Versioned, deterministic weighted selection. Variety is bounded; interest dominates. */
export function selectEncounter(
  state: ExperienceState,
  lifePath?: number,
): Selection {
  const ranking = CARDS.map((card) => {
    const reasons: string[] = [];
    let score = 0;
    if (state.adaptive) {
      if (card.intent === state.intent) {
        score += 5;
        reasons.push(`You chose ${state.intent}.`);
      }
      if (state.saved.includes(card.id)) {
        score += 1;
        reasons.push("You saved this character.");
      }
      if (state.feedback[card.id] === 1) {
        score += 2;
        reasons.push("You asked for more of this character.");
      }
      if (state.feedback[card.id] === -1) score -= 5;
      if (lifePath !== undefined && card.values.includes(lifePath)) {
        score += 1;
        reasons.push(
          `Its creative theme is associated with your Life Path ${lifePath}. This is a modern editorial association.`,
        );
      }
      const recent = state.history
        .slice(-3)
        .filter((id) => id === card.id).length;
      score -= recent * 3;
      if (recent === 0 && state.history.length) {
        score += 1;
        reasons.push("It adds a different theme to your recent chapters.");
      }
    }
    score += hash(`arcana-v1:${state.seed}:${state.draw}:${card.id}`) * 2;
    return { card, score, reasons };
  }).sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id));
  const chosen = ranking[0]!;
  return {
    card: chosen.card,
    reasons: [
      ...chosen.reasons,
      state.adaptive
        ? "A small, repeatable variation helps keep each reveal surprising."
        : "Personalization is off. Only the repeatable shuffle chooses this card.",
    ],
    chapter: Math.floor(
      hash(`chapter-v1:${state.seed}:${state.draw}:${chosen.card.id}`) * 3,
    ),
  };
}
export function parseExperience(value: unknown): ExperienceState | null {
  if (!value || typeof value !== "object") return null;
  const x = value as Record<string, unknown>;
  const cardList = (v: unknown): v is CardId[] =>
    Array.isArray(v) &&
    v.length <= 100 &&
    v.every((id) => CARD_IDS.includes(id));
  if (
    x.version !== 1 ||
    !Number.isSafeInteger(x.seed) ||
    Number(x.seed) < 0 ||
    Number(x.seed) > 4294967295 ||
    !Number.isSafeInteger(x.draw) ||
    Number(x.draw) < 0 ||
    Number(x.draw) > 1000000 ||
    !INTENTS.includes(x.intent as Intent) ||
    typeof x.adaptive !== "boolean" ||
    !cardList(x.history) ||
    !cardList(x.saved) ||
    !x.feedback ||
    typeof x.feedback !== "object" ||
    !Array.isArray(x.completed) ||
    x.completed.length > 100 ||
    !x.completed.every(
      (v) =>
        typeof v === "string" &&
        /^(phoenix|architect|wayfinder)-[01]-[0-2]$/.test(v),
    )
  )
    return null;
  const feedback: ExperienceState["feedback"] = {};
  for (const [id, val] of Object.entries(x.feedback)) {
    if (!CARD_IDS.includes(id as CardId) || ![-1, 1].includes(val as number))
      return null;
    feedback[id as CardId] = val as -1 | 1;
  }
  return {
    version: 1,
    seed: Number(x.seed),
    draw: Number(x.draw),
    intent: x.intent as Intent,
    adaptive: x.adaptive,
    history: x.history.slice(-12),
    saved: [...new Set(x.saved)],
    feedback,
    completed: [...new Set(x.completed)],
  };
}
