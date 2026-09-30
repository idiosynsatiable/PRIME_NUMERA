# Analytics Contract

Analytics measure product behavior without transmitting raw names or birth dates.

Initial event vocabulary:

- `calculator_started`
- `calculator_completed`
- `calculation_expanded`
- `dna_explored`
- `alternate_system_selected`
- `timeline_opened`
- `name_variant_compared`
- `compatibility_started`
- `share_created`
- `share_opened`
- `referral_conversion`
- `profile_saved`
- `return_visit`

The primary funnel is Landing → Start → Result → Explore → Share → Referred visitor → Referred calculation.

`@prime-numera/analytics` defines a closed event vocabulary. Each event has exactly
`schemaVersion` and `name`; runtime parsing rejects extra fields including raw names,
birth dates, user IDs, URLs and free text. The client sends only after an explicit
consent predicate returns true. No provider is selected or authorized here.

Before production instrumentation, specify a retention period, withdrawal behavior,
and aggregation policy. Never attach calculation inputs in transport wrappers or
provider defaults, including page URL query strings.
