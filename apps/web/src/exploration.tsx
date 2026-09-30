import { useId, useState } from "react";
import {
  buildTimelineModel,
  compareNameVariants,
  SYSTEMS,
  type PythagoreanProfile,
} from "@prime-numera/numerology-core";
import { parseProfile, type ProfileInput } from "./profile-storage";
import { reflection } from "./reflections";

const DIMENSIONS = [
  ["lifePath", "Life Path", "A date-based theme for exploring direction."],
  [
    "expression",
    "Expression",
    "The full name, read as a theme for what you make and express.",
  ],
  [
    "soulUrge",
    "Soul Urge",
    "The vowels of your name, used as a reflective lens for motivation.",
  ],
  [
    "personality",
    "Personality",
    "The consonants of your name, used as a lens for outward expression.",
  ],
  [
    "birthday",
    "Birthday",
    "The reduced day of birth, explored as a supporting theme.",
  ],
  [
    "maturity",
    "Maturity",
    "Life Path plus Expression, reduced under the selected rules.",
  ],
] as const;
export function NumberExplorer({ profile }: { profile: PythagoreanProfile }) {
  const [selected, setSelected] = useState(0);
  const [lens, setLens] = useState<"strength" | "challenge" | "prompt">(
    "strength",
  );
  const id = useId();
  const [key, label, description] = DIMENSIONS[selected]!;
  const value = profile[key].value,
    theme = reflection(value);
  return (
    <section className="number-explorer" aria-label="Explore your core numbers">
      <p className="micro">
        Choose a number, then change the lens. Every card comes from your actual
        calculation.
      </p>
      <div className="number-deck">
        {DIMENSIONS.map(([k, title], i) => (
          <button
            className="number-card"
            key={k}
            aria-pressed={selected === i}
            aria-controls={id}
            onClick={() => setSelected(i)}
          >
            <span className="eyebrow">{title}</span>
            <strong>{profile[k].value}</strong>
            <span>{reflection(profile[k].value).title}</span>
          </button>
        ))}
      </div>
      <div className="number-detail panel" id={id}>
        <div className="number-seal" aria-hidden="true">
          {value}
        </div>
        <div>
          <p className="eyebrow">{label} · Pythagorean</p>
          <h3>{theme.title}</h3>
          <p>{description}</p>
          <div className="chips" aria-label="Interpretation lens">
            {(
              [
                ["strength", "Constructive expression"],
                ["challenge", "Growth edge"],
                ["prompt", "Reflection question"],
              ] as const
            ).map(([v, t]) => (
              <button
                key={v}
                aria-pressed={lens === v}
                onClick={() => setLens(v)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="reflection-prompt" aria-live="polite">
            {theme[lens]}
          </p>
          <small>
            Original modern reflection. A number does not establish a
            personality trait.
          </small>
        </div>
      </div>
    </section>
  );
}
export function Timeline({ profile }: { profile: PythagoreanProfile }) {
  const [age, setAge] = useState(0);
  const model = buildTimelineModel(profile.birthDate, age);
  return (
    <section className="panel" id="timeline">
      <p className="eyebrow">Move through the pattern</p>
      <h2>Your life-cycle map</h2>
      <p>
        Choose an age to explore the traditional Pythagorean cycle ranges. These
        are symbolic themes, not predictions of events.
      </p>
      <label>
        Explore age: {age}
        <input
          type="range"
          min="0"
          max="120"
          step="1"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </label>
      <div className="actions">
        <button disabled={age === 0} onClick={() => setAge(age - 1)}>
          Previous age
        </button>
        <button disabled={age === 120} onClick={() => setAge(age + 1)}>
          Next age
        </button>
      </div>
      {(["pinnacle", "period"] as const).map((track) => (
        <div key={track}>
          <h3>{track === "pinnacle" ? "Pinnacle cycles" : "Period cycles"}</h3>
          <div className="cycle-track">
            {model.segments
              .filter((s) => s.track === track)
              .map((s) => (
                <button
                  key={s.ordinal}
                  aria-pressed={s.activeAtSelectedAge}
                  onClick={() => setAge(s.startAge)}
                >
                  <span>
                    {track === "pinnacle" ? "Pinnacle" : "Period"} {s.ordinal}
                  </span>
                  <strong>{s.value}</strong>
                  <small>
                    Ages {s.startAge}
                    {s.endAgeExclusive === null
                      ? "+"
                      : `–${s.endAgeExclusive - 1}`}
                  </small>
                </button>
              ))}
          </div>
        </div>
      ))}
      <div className="timeline-reading" aria-live="polite">
        <h3>At age {age}</h3>
        {model.segments
          .filter((s) => s.activeAtSelectedAge)
          .map((s) => (
            <p key={s.track}>
              <strong>
                {s.track === "pinnacle" ? "Pinnacle" : "Period"} {s.ordinal} ·{" "}
                {s.value} · {reflection(s.value).title}
              </strong>
              <br />
              {reflection(s.value).prompt}
            </p>
          ))}
      </div>
      <details>
        <summary>How these boundaries are calculated</summary>
        <p>
          The first transition is 36 minus the single-digit Life Path: age{" "}
          {model.firstTransitionAge}. The following pinnacles span nine years
          each before the final open-ended cycle. The middle period spans 27
          years. Start ages are included; the next boundary belongs to the next
          cycle. Challenge numbers have no fixed age ranges in this methodology.
        </p>
      </details>
    </section>
  );
}
export function NameLab({ input }: { input: ProfileInput }) {
  const [name, setName] = useState(input.name),
    [system, setSystem] = useState(input.system);
  const [result, setResult] = useState<ReturnType<
      typeof compareNameVariants
    > | null>(null),
    [error, setError] = useState("");
  return (
    <section className="panel" id="name-lab">
      <p className="eyebrow">Change a letter. See the arithmetic.</p>
      <h2>Name laboratory</h2>
      <p>
        Try a spelling, a creative name, or a shorter form. Compare both names
        under one table at a time. This experiment stays on your device and does
        not change your profile.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const valid = parseProfile({ ...input, name, system });
            setResult(compareNameVariants(input.name, valid.name, system));
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Check the name.");
            setResult(null);
          }
        }}
      >
        <label>
          Alternative name
          <input
            value={name}
            maxLength={200}
            required
            autoComplete="off"
            onChange={(e) => {
              setName(e.target.value);
              setResult(null);
            }}
          />
        </label>
        <label>
          Name lab methodology
          <select
            value={system}
            onChange={(e) => {
              setSystem(e.target.value as ProfileInput["system"]);
              setResult(null);
            }}
          >
            <option value="pythagorean">Pythagorean</option>
            <option value="chaldean">Chaldean / Cheiro</option>
          </select>
        </label>
        <div className="actions">
          <button className="primary" type="submit">
            Compare name variants
          </button>
          <button
            type="button"
            onClick={() => {
              setName(input.name);
              setResult(null);
              setError("");
            }}
          >
            Reset name experiment
          </button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div className="name-lab-result" aria-live="polite">
          <h3>{SYSTEMS[result.system].name}: the change in numbers</h3>
          <div className="form-row">
            {(
              [
                ["Original", result.before],
                ["Alternative", result.after],
              ] as const
            ).map(([title, r]) => (
              <article key={title}>
                <h4>
                  {title} · {r.value}
                </h4>
                <div
                  className="letter-values"
                  aria-label={`${title} letter values`}
                >
                  {r.mappings.map((m, i) => (
                    <span key={i}>
                      {m.normalizedCharacter}
                      <strong>{m.value}</strong>
                    </span>
                  ))}
                </div>
                <p>
                  Letter sum {r.sum} → reduced value {r.value}
                </p>
              </article>
            ))}
          </div>
          <p>
            {result.reducedValueChanged
              ? `The reduced value changes from ${result.before.value} to ${result.after.value}.`
              : "The reduced value stays the same even if the spelling or sum differs."}{" "}
            Sum difference: {result.after.sum - result.before.sum}.
          </p>
          <small>
            This lab uses the whole-name letter sum for each name. The profile’s
            component-aware stages may differ when separate name components are
            supplied. No spelling is claimed to improve luck or outcomes.
          </small>
        </div>
      )}
    </section>
  );
}
