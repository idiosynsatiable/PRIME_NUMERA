import {
  validateNumberDnaGraph,
  type NumberDnaEdge,
  type NumberDnaGraph,
  type NumberDnaNode,
} from "./number-dna.js";
import type { PythagoreanProfile } from "./profile.js";

function node(
  id: string,
  calculation: string,
  label: string,
  value: number,
  derivationRef: string,
  timeScope?: string,
): NumberDnaNode {
  return {
    id,
    calculation,
    label,
    value,
    system: "pythagorean",
    derivationRef,
    ...(timeScope ? { timeScope } : {}),
  };
}

function rangeLabel(startAge: number, endAgeExclusive: number | null): string {
  return endAgeExclusive === null
    ? `age ${startAge}+`
    : `age ${startAge}–${endAgeExclusive - 1}`;
}

export function buildNumberDnaFromProfile(
  profile: PythagoreanProfile,
): NumberDnaGraph {
  const nodes: NumberDnaNode[] = [
    node("core:life-path", "life-path", "Life Path", profile.lifePath.value, "profile.lifePath"),
    node("core:expression", "expression", "Expression", profile.expression.value, "profile.expression"),
    node("core:soul-urge", "soul-urge", "Soul Urge", profile.soulUrge.value, "profile.soulUrge"),
    node("core:personality", "personality", "Personality", profile.personality.value, "profile.personality"),
    node("core:birthday", "birthday", "Birthday", profile.birthday.value, "profile.birthday"),
    node("modifier:attitude", "attitude", "Attitude", profile.attitude.value, "profile.attitude"),
    node("modifier:maturity", "maturity", "Maturity", profile.maturity.value, "profile.maturity"),
    node("modifier:balance", "balance", "Balance", profile.balance.value, "profile.balance"),
    node(
      "modifier:rational-thought",
      "rational-thought",
      "Rational Thought",
      profile.rationalThought.value,
      "profile.rationalThought",
    ),
    node(
      "bridge:life-path-expression",
      "bridge",
      "Life Path / Expression Bridge",
      profile.bridges.lifePathExpression.value,
      "profile.bridges.lifePathExpression",
    ),
    node(
      "bridge:soul-urge-personality",
      "bridge",
      "Soul Urge / Personality Bridge",
      profile.bridges.soulUrgePersonality.value,
      "profile.bridges.soulUrgePersonality",
    ),
    node(
      "bridge:life-path-birthday",
      "bridge",
      "Life Path / Birthday Bridge",
      profile.bridges.lifePathBirthday.value,
      "profile.bridges.lifePathBirthday",
    ),
  ];

  for (const cycle of profile.longTermTimeline.pinnacles) {
    nodes.push(
      node(
        `cycle:pinnacle:${cycle.ordinal}`,
        "pinnacle",
        `Pinnacle ${cycle.ordinal}`,
        cycle.value,
        `profile.longTermTimeline.pinnacles[${cycle.ordinal - 1}]`,
        rangeLabel(cycle.startAge, cycle.endAgeExclusive),
      ),
    );
  }

  for (const cycle of profile.longTermTimeline.periods) {
    nodes.push(
      node(
        `cycle:period:${cycle.ordinal}`,
        "period-cycle",
        `Period ${cycle.ordinal}`,
        cycle.value,
        `profile.longTermTimeline.periods[${cycle.ordinal - 1}]`,
        rangeLabel(cycle.startAge, cycle.endAgeExclusive),
      ),
    );
  }

  if (profile.personalCalendar) {
    nodes.push(
      node(
        "forecast:personal-year",
        "personal-year",
        "Personal Year",
        profile.personalCalendar.year.value,
        "profile.personalCalendar.year",
      ),
      node(
        "forecast:personal-month",
        "personal-month",
        "Personal Month",
        profile.personalCalendar.month.value,
        "profile.personalCalendar.month",
      ),
      node(
        "forecast:personal-day",
        "personal-day",
        "Personal Day",
        profile.personalCalendar.day.value,
        "profile.personalCalendar.day",
      ),
    );
  }

  if (profile.essence) {
    nodes.push(
      node(
        "forecast:essence",
        "essence",
        "Essence",
        profile.essence.value,
        "profile.essence",
        `age ${profile.essence.age}`,
      ),
    );
  }

  const edges: NumberDnaEdge[] = [
    {
      id: "edge:life-path:life-expression-bridge",
      source: "core:life-path",
      target: "bridge:life-path-expression",
      relationship: "bridge",
    },
    {
      id: "edge:expression:life-expression-bridge",
      source: "core:expression",
      target: "bridge:life-path-expression",
      relationship: "bridge",
    },
    {
      id: "edge:soul-urge:soul-personality-bridge",
      source: "core:soul-urge",
      target: "bridge:soul-urge-personality",
      relationship: "bridge",
    },
    {
      id: "edge:personality:soul-personality-bridge",
      source: "core:personality",
      target: "bridge:soul-urge-personality",
      relationship: "bridge",
    },
    {
      id: "edge:life-path:life-birthday-bridge",
      source: "core:life-path",
      target: "bridge:life-path-birthday",
      relationship: "bridge",
    },
    {
      id: "edge:birthday:life-birthday-bridge",
      source: "core:birthday",
      target: "bridge:life-path-birthday",
      relationship: "bridge",
    },
  ];

  const repetitionCandidates = nodes.filter((item) =>
    item.id.startsWith("core:") || item.id.startsWith("modifier:"),
  );
  for (let left = 0; left < repetitionCandidates.length; left += 1) {
    for (let right = left + 1; right < repetitionCandidates.length; right += 1) {
      const source = repetitionCandidates[left]!;
      const target = repetitionCandidates[right]!;
      if (source.value !== target.value) continue;
      edges.push({
        id: `edge:repetition:${source.id}:${target.id}`,
        source: source.id,
        target: target.id,
        relationship: "repetition",
      });
    }
  }

  const graph = { nodes, edges } satisfies NumberDnaGraph;
  validateNumberDnaGraph(graph);
  return graph;
}
