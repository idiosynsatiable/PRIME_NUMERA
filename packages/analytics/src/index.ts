/** Closed, input-free product analytics. Callers cannot attach arbitrary properties. */
export const EVENT_NAMES = [
  "calculator_started", "calculator_completed", "calculation_expanded",
  "dna_explored", "alternate_system_selected", "timeline_opened",
  "name_variant_compared", "compatibility_started", "share_created",
  "share_opened", "referral_conversion", "profile_saved", "return_visit",
] as const;

export type AnalyticsEventName = (typeof EVENT_NAMES)[number];
export type AnalyticsEvent = Readonly<{
  schemaVersion: 1;
  name: AnalyticsEventName;
}>;

export interface AnalyticsSink {
  send(event: AnalyticsEvent): Promise<void>;
}

const known = new Set<string>(EVENT_NAMES);

export function parseAnalyticsEvent(input: unknown): AnalyticsEvent {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("Analytics event must be an object.");
  }
  const record = input as Record<string, unknown>;
  if (
    Object.keys(record).length !== 2 ||
    !Object.hasOwn(record, "schemaVersion") ||
    !Object.hasOwn(record, "name") ||
    record.schemaVersion !== 1 ||
    typeof record.name !== "string" ||
    !known.has(record.name)
  ) {
    throw new TypeError("Analytics event contains an unknown field or event name.");
  }
  return { schemaVersion: 1, name: record.name as AnalyticsEventName };
}

export function createAnalyticsClient(sink: AnalyticsSink, hasConsent: () => boolean) {
  return {
    async track(name: AnalyticsEventName): Promise<boolean> {
      if (!hasConsent()) return false;
      await sink.send(parseAnalyticsEvent({ schemaVersion: 1, name }));
      return true;
    },
  };
}
