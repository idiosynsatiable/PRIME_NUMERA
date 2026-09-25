export type YPolicy = "always-vowel" | "always-consonant" | "contextual";

export interface VowelPolicy {
  readonly y: YPolicy;
}

const BASE_VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function isVowel(
  character: string,
  policy: VowelPolicy,
  context?: { readonly previous?: string; readonly next?: string },
): boolean {
  const upper = character.toUpperCase();
  if (BASE_VOWELS.has(upper)) return true;
  if (upper !== "Y") return false;
  if (policy.y === "always-vowel") return true;
  if (policy.y === "always-consonant") return false;

  // Contextual Y is intentionally explicit and deterministic: treat Y as a vowel
  // when neither adjacent supported letter is a base vowel. Consumers can select
  // another policy instead of silently inheriting this rule.
  const previousIsVowel = context?.previous ? BASE_VOWELS.has(context.previous.toUpperCase()) : false;
  const nextIsVowel = context?.next ? BASE_VOWELS.has(context.next.toUpperCase()) : false;
  return !previousIsVowel && !nextIsVowel;
}
