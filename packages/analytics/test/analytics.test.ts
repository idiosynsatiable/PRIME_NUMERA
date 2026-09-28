import { describe, expect, it } from "vitest";
import { createAnalyticsClient, parseAnalyticsEvent, type AnalyticsEvent } from "../src/index.js";

describe("closed analytics", () => {
  it("rejects raw names, dates, identifiers and unknown events even when cast", () => {
    for (const extra of [{ birthName: "Mary" }, { birthDate: "1990-05-15" }, { userId: "123" }]) {
      expect(() => parseAnalyticsEvent({ schemaVersion: 1, name: "calculator_started", ...extra })).toThrow();
    }
    expect(() => parseAnalyticsEvent({ schemaVersion: 1, name: "unlisted" })).toThrow();
  });

  it("sends only a fixed event with consent", async () => {
    const sent: AnalyticsEvent[] = [];
    let consent = false;
    const client = createAnalyticsClient({ async send(event) { sent.push(event); } }, () => consent);
    expect(await client.track("calculator_completed")).toBe(false);
    consent = true;
    expect(await client.track("calculator_completed")).toBe(true);
    expect(sent).toEqual([{ schemaVersion: 1, name: "calculator_completed" }]);
  });
});
