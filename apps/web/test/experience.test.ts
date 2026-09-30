import { describe, expect, it } from "vitest";
import {
  initialExperience,
  parseExperience,
  selectEncounter,
} from "../src/experience";
describe("explainable local encounter selection", () => {
  it("replays the same inputs, preserving the state and numerical input", () => {
    const state = initialExperience(91);
    const before = JSON.stringify(state);
    expect(selectEncounter(state, 9)).toEqual(selectEncounter(state, 9));
    expect(JSON.stringify(state)).toBe(before);
    expect(selectEncounter(state, 9).reasons.join(" ")).toContain(
      "Life Path 9",
    );
  });
  it("explicit intent guides the first encounter across seeds", () => {
    for (let seed = 0; seed < 100; seed++) {
      expect(
        selectEncounter({ ...initialExperience(seed), intent: "create" }).card
          .id,
      ).toBe("architect");
      expect(
        selectEncounter({ ...initialExperience(seed), intent: "explore" }).card
          .id,
      ).toBe("wayfinder");
    }
  });
  it("feedback and history diversify a repeated session", () => {
    const state = initialExperience(1);
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const picked = selectEncounter(state);
      seen.add(picked.card.id);
      state.history.push(picked.card.id);
      state.draw++;
    }
    expect(seen.size).toBe(3);
    expect(
      selectEncounter({ ...initialExperience(1), feedback: { phoenix: -1 } })
        .card.id,
    ).not.toBe("phoenix");
  });
  it("personalization off ignores preferences and number associations", () => {
    const a = { ...initialExperience(123), adaptive: false };
    expect(selectEncounter(a, 9)).toEqual(
      selectEncounter(
        {
          ...a,
          intent: "create",
          saved: ["architect"],
          feedback: { phoenix: -1 },
          history: ["phoenix"],
        },
        4,
      ),
    );
  });
  it("restores only bounded known local fields and rejects corrupted storage", () => {
    expect(
      parseExperience({ ...initialExperience(5), rawName: "must not survive" }),
    ).toEqual(initialExperience(5));
    expect(
      parseExperience({ ...initialExperience(5), history: ["unknown"] }),
    ).toBeNull();
    expect(parseExperience({ ...initialExperience(5), seed: NaN })).toBeNull();
    expect(
      parseExperience({ ...initialExperience(5), completed: ["<script>"] }),
    ).toBeNull();
  });
});
