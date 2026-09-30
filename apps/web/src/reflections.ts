/** Original modern reflective prompts. No historical attribution or predictive claim. */
export const THEMES: Record<
  number,
  { title: string; strength: string; challenge: string; prompt: string }
> = {
  0: {
    title: "An open question",
    strength: "Room to explore a theme without assigning a fixed identity.",
    challenge: "Do not mistake an absent subtotal for an absent human quality.",
    prompt: "What would you like to understand on your own terms?",
  },
  1: {
    title: "The Initiator",
    strength: "A willingness to begin and make a clear choice.",
    challenge: "Leave room for another perspective before deciding alone.",
    prompt: "Where could one small beginning help?",
  },
  2: {
    title: "The Listener",
    strength: "Attention to cooperation and the space between people.",
    challenge: "Agreement can become self-silencing without boundaries.",
    prompt: "What would honest cooperation sound like today?",
  },
  3: {
    title: "The Storyteller",
    strength: "Turning an idea into a form someone else can understand.",
    challenge: "Keep room for revision after the excitement of expression.",
    prompt: "What deserves a clearer or more playful expression?",
  },
  4: {
    title: "The Architect",
    strength: "Patience with structure, practice, and careful construction.",
    challenge: "A useful routine can become too rigid.",
    prompt: "Which structure supports you, and which needs a door?",
  },
  5: {
    title: "The Wayfinder",
    strength: "Curiosity, variety, and openness to another route.",
    challenge: "Choose a steady point to return to when exploring.",
    prompt: "What small, safe experiment could you try?",
  },
  6: {
    title: "The Keeper",
    strength: "Care expressed through attention and responsibility.",
    challenge: "Helping is sustainable when your needs also count.",
    prompt: "What would balanced care look like this week?",
  },
  7: {
    title: "The Seeker",
    strength: "Space for inquiry, observation, and careful questions.",
    challenge: "Reflection benefits from contact with evidence and others.",
    prompt: "Which assumption is ready to be examined?",
  },
  8: {
    title: "The Steward",
    strength: "Attention to resources, responsibility, and follow-through.",
    challenge: "Results are not the only measure of a worthwhile effort.",
    prompt: "How can you use one resource more responsibly?",
  },
  9: {
    title: "The Horizon",
    strength: "A broad view that makes room for different experiences.",
    challenge: "A wide ambition still needs a concrete next step.",
    prompt: "What can you finish, release, or make useful to someone?",
  },
  11: {
    title: "The Lantern",
    strength:
      "A reflective association with sensitivity and creative attention.",
    challenge: "Rest and boundaries can support a demanding creative practice.",
    prompt: "What helps you notice clearly without becoming overwhelmed?",
  },
  22: {
    title: "The Master Builder",
    strength: "An editorial theme of turning large plans into workable steps.",
    challenge: "Scale should not erase the value of a small beginning.",
    prompt: "What is the smallest useful version of your idea?",
  },
  33: {
    title: "The Hearth",
    strength: "An editorial theme of service joined with creativity.",
    challenge: "Care does not require taking responsibility for everything.",
    prompt: "Where can you contribute without losing your own footing?",
  },
};
export function reflection(value: number) {
  return THEMES[value] ?? THEMES[0]!;
}
