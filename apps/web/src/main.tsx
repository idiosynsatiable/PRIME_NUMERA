import React, {
  Component,
  useEffect,
  useState,
  useId,
  useMemo,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import {
  buildNumberDnaFromProfile,
  comparePythagoreanProfiles,
  createPublicSharePayload,
  SYSTEMS,
  type PublicSharePayload,
  type ShareAspectRatio,
  type PythagoreanProfile,
} from "@prime-numera/numerology-core";
import { FOUNDATION_CULTURAL_ATLAS as ATLAS } from "@prime-numera/cultural-engines";
import {
  buildProfile,
  buildChaldean,
  parseProfile,
  readSaved,
  type ProfileInput,
  type SavedProfile,
} from "./profile-storage";
import {
  cardById,
  initialExperience,
  parseExperience,
  selectEncounter,
  type ExperienceState,
  type Intent,
} from "./experience";
import { reflection } from "./reflections";
import { NumberExplorer, Timeline, NameLab } from "./exploration";
import "./style.css";

const STORAGE = "numera.profiles.v1",
  EXPERIENCE = "numera.experience.v1";
const empty: ProfileInput = { name: "", date: "", system: "pythagorean" };
function download(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
let sessionPromise: Promise<{ csrf: string }> | null = null;
function startSession() {
  return (sessionPromise ??= jsonRequest("/api/session", {
    method: "POST",
  }).catch((error) => {
    sessionPromise = null;
    throw error;
  }));
}
async function jsonRequest(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  if (!response.ok) {
    const value = await response
      .json()
      .catch(() => ({ error: "Network unavailable. Try again." }));
    throw new Error(value.error ?? "Request failed.");
  }
  return response.status === 204 ? null : response.json();
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main>
        <h1>Let’s try that again</h1>
        <p>
          The page could not be displayed. Your saved profiles have not been
          removed.
        </p>
        <button onClick={() => location.reload()}>Reload PRIME NUMERA</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Form({
  onSubmit,
  label = "Reveal my numbers",
  initial = empty,
}: {
  onSubmit: (v: ProfileInput) => void;
  label?: string;
  initial?: ProfileInput;
}) {
  const nameHelp = useId();
  const [input, setInput] = useState(initial),
    [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const v = parseProfile(input);
      setError("");
      onSubmit(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check your details.");
    }
  }
  return (
    <form onSubmit={submit} className="profile-form">
      <label>
        Birth name
        <input
          name="name"
          autoComplete="off"
          maxLength={200}
          value={input.name}
          onChange={(e) => setInput({ ...input, name: e.target.value })}
          required
          aria-describedby={nameHelp}
        />
      </label>
      <small id={nameHelp}>
        Latin letters, including accents. Use the name you want to explore.
        Calculations stay on this device.
      </small>
      <label>
        Birth date
        <input
          name="birth-date"
          type="date"
          value={input.date}
          onChange={(e) => setInput({ ...input, date: e.target.value })}
          required
          min="0001-01-01"
          max="9999-12-31"
        />
      </label>
      <label>
        Methodology
        <select
          value={input.system}
          onChange={(e) =>
            setInput({
              ...input,
              system: e.target.value as ProfileInput["system"],
            })
          }
        >
          <option value="pythagorean">Pythagorean · full profile</option>
          <option value="chaldean">Chaldean / Cheiro · name number</option>
        </select>
      </label>
      <small>
        Different letter tables produce different results. Chaldean here
        supports name analysis; Pythagorean includes date-based profile
        calculations.
      </small>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary" type="submit">
        {label} <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
function Interpretation({
  value,
  system = "pythagorean",
}: {
  value: number;
  system?: string;
}) {
  const t = reflection(value);
  return (
    <div className="interpretation">
      <p className="eyebrow">
        Original modern reflection ·{" "}
        {system === "pythagorean"
          ? "Pythagorean theme"
          : "Chaldean name-number reflection"}
      </p>
      <h3>{t.title}</h3>
      <p>{t.strength}</p>
      <details>
        <summary>Explore this theme</summary>
        <dl>
          <dt>Constructive expression</dt>
          <dd>{t.strength}</dd>
          <dt>Challenge / shadow expression</dt>
          <dd>{t.challenge}</dd>
          <dt>Relationships & communication</dt>
          <dd>
            Use this theme as a conversation starter. Ask what resonates and
            what does not; let the person describe their own experience.
          </dd>
          <dt>Work & creativity</dt>
          <dd>
            Try the reflection in one small creative task, then judge it by what
            you observe.
          </dd>
          <dt>Developmental prompt</dt>
          <dd>{t.prompt}</dd>
          <dt>Methodology & attribution</dt>
          <dd>
            {system === "chaldean"
              ? "The name number comes from the separate Cheiro-style table. These original prompts are not claimed to reproduce Cheiro’s compound-number meanings."
              : "The arithmetic follows the selected Pythagorean rules. These prompts are modern editorial material."}{" "}
            No personality trait or future outcome is established by a number.
          </dd>
        </dl>
      </details>
    </div>
  );
}
function Dna({ profile }: { profile: PythagoreanProfile }) {
  const graph = useMemo(() => buildNumberDnaFromProfile(profile), [profile]),
    nodes = graph.nodes.filter(
      (n) => n.id.startsWith("core:") || n.id.startsWith("bridge:"),
    );
  const [selected, setSelected] = useState(nodes[0]!.id);
  const positions = new Map(
    nodes.map((n, i) => [
      n.id,
      {
        x: 300 + 220 * Math.cos((i * Math.PI * 2) / nodes.length - Math.PI / 2),
        y: 280 + 210 * Math.sin((i * Math.PI * 2) / nodes.length - Math.PI / 2),
      },
    ]),
  );
  const node = graph.nodes.find((n) => n.id === selected) ?? nodes[0]!;
  const connected = graph.edges.filter(
    (e) => e.source === node.id || e.target === node.id,
  );
  const connectedIds = new Set(connected.flatMap((e) => [e.source, e.target]));
  return (
    <section id="dna" className="panel">
      <p className="eyebrow">Your numerical constellation</p>
      <h2>Number DNA</h2>
      <p>
        Lines connect core values to their arithmetic bridges. A bridge is the
        absolute difference between two values. Repetition links mark equal
        values; neither predicts an outcome.
      </p>
      <svg
        className="dna"
        viewBox="0 0 600 570"
        role="img"
        aria-label="Number DNA: core values and their bridge relationships. The interactive node list and complete table follow."
      >
        {graph.edges
          .filter((e) => positions.has(e.source) && positions.has(e.target))
          .map((e) => (
            <line
              key={e.id}
              x1={positions.get(e.source)!.x}
              y1={positions.get(e.source)!.y}
              x2={positions.get(e.target)!.x}
              y2={positions.get(e.target)!.y}
              className={`${e.relationship === "repetition" ? "repeat" : "bridge"} ${e.source === node.id || e.target === node.id ? "edge-active" : "edge-muted"}`}
            />
          ))}
        {nodes.map((n) => (
          <g
            key={n.id}
            className={
              n.id === node.id
                ? "node-selected"
                : connectedIds.has(n.id)
                  ? "node-connected"
                  : "node-muted"
            }
          >
            <circle
              cx={positions.get(n.id)!.x}
              cy={positions.get(n.id)!.y}
              r="31"
            />
            <text
              x={positions.get(n.id)!.x}
              y={positions.get(n.id)!.y + 9}
              textAnchor="middle"
            >
              {n.value}
            </text>
            <text
              className="node-label"
              x={positions.get(n.id)!.x}
              y={positions.get(n.id)!.y + 50}
              textAnchor="middle"
            >
              {n.label.replace(" / ", " / ").replace(" Bridge", "")}
            </text>
          </g>
        ))}
      </svg>
      <div className="chips">
        {nodes.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n.id)}
            aria-pressed={selected === n.id}
          >
            {n.label} · {n.value}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <h3>
          {node.label}: {node.value}
        </h3>
        <p>
          {node.id.startsWith("bridge:")
            ? "Absolute difference of its connected core values."
            : "A deterministic value in your selected Pythagorean profile."}
        </p>
        <Interpretation value={node.value} />
        <h4>Connected values</h4>
        {connected.length ? (
          <ul>
            {connected.map((e) => {
              const other = graph.nodes.find(
                (n) => n.id === (e.source === node.id ? e.target : e.source),
              )!;
              return (
                <li key={e.id}>
                  {other.label} · {other.value} — {e.relationship}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No direct relationships for this node.</p>
        )}
      </div>
      <details>
        <summary>Complete accessible data table</summary>
        <div className="table-scroll">
          <table>
            <caption>All Number DNA values</caption>
            <thead>
              <tr>
                <th>Calculation</th>
                <th>Value</th>
                <th>Time scope</th>
              </tr>
            </thead>
            <tbody>
              {graph.nodes.map((n) => (
                <tr key={n.id}>
                  <td>{n.label}</td>
                  <td>{n.value}</td>
                  <td>{n.timeScope ?? "Core"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <button
        onClick={() =>
          download(
            JSON.stringify({ nodes: graph.nodes, edges: graph.edges }, null, 2),
            "application/json",
            "numera-dna.json",
          )
        }
      >
        Export anonymous DNA
      </button>
    </section>
  );
}
function Methodology({ input }: { input: ProfileInput | null }) {
  const system = SYSTEMS[input?.system ?? "pythagorean"];
  return (
    <section id="methodology" className="panel">
      <p className="eyebrow">Show your working</p>
      <h2>Methodology, openly</h2>
      <p>{system.historicalContext}</p>
      <div className="table-scroll">
        <table>
          <caption>{system.name} letter values</caption>
          <thead>
            <tr>
              <th>Value</th>
              <th>Letters</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(new Set(Object.values(system.mappings)))
              .sort()
              .map((v) => (
                <tr key={v}>
                  <td>{v}</td>
                  <td>
                    {Object.keys(system.mappings)
                      .filter((k) => system.mappings[k] === v)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p>
        Names are normalized with Unicode NFKD, converted to uppercase, and
        accent marks removed. Spaces, straight apostrophes and hyphens separate
        or exclude punctuation. Unsupported characters are reported by this
        form; no transliteration is guessed.
      </p>
      <p>
        {system.id === "pythagorean"
          ? "Each name component is summed and reduced, preserving 11, 22 and 33 at the core’s defined reduction stages; reduced components are then combined. Life Path reduces month, day and year before combining. Soul Urge uses A, E, I, O, U; Y is a consonant here. Personality uses the remaining consonants. Birthday reduces the day; Maturity combines Life Path and Expression."
          : "The complete name is summed with values 1–8, then reduced to one digit. No master numbers are preserved. The compound sum remains visible. Pythagorean date and personality meanings are not presented as Chaldean calculations."}
      </p>
      <p>
        Numerology is an interpretive tradition, not a validated personality
        assessment or scientific prediction. The illustrations and reflection
        prompts are original modern creative work.
      </p>
      <ul>
        {system.citations.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>{" "}
            — {s.classification}
          </li>
        ))}
      </ul>
    </section>
  );
}
function Atlas() {
  const [query, setQuery] = useState("");
  const modules = ATLAS.modules.filter((m) =>
    [m.title, ...m.geography, ...m.periods, ...m.claims.map((c) => c.statement)]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <section id="atlas" className="panel">
      <p className="eyebrow">Context before correspondence</p>
      <h2>Cultural Atlas</h2>
      <p>
        Explore distinct traditions in their own context. These are not
        interchangeable numerology systems.
      </p>
      <label>
        Search traditions, places, or ideas
        <input
          type="search"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <p role="status">{modules.length} traditions found</p>
      {modules.length === 0 && (
        <p>
          No matching traditions. Try a broader term or{" "}
          <button onClick={() => setQuery("")}>Clear Atlas search</button>.
        </p>
      )}
      {modules.map((m) => (
        <details key={m.id}>
          <summary>{m.title}</summary>
          <p>
            {m.geography.join(" · ")} / {m.periods.join(" · ")}
          </p>
          {m.claims.map((c) => (
            <p key={c.id}>
              <strong>{c.status}: </strong>
              {c.statement}
            </p>
          ))}
          {m.cautions.map((c) => (
            <p className="note" key={c}>
              {c}
            </p>
          ))}
          <ul>
            {m.sourceIds.map((id) => {
              const s = ATLAS.sources.find((s) => s.id === id)!;
              return (
                <li key={id}>
                  <a href={s.url} rel="noreferrer" target="_blank">
                    {s.title}
                  </a>{" "}
                  — {s.institution}
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </section>
  );
}
function ShareTools({ profile }: { profile: PythagoreanProfile | null }) {
  const [ratio, setRatio] = useState<ShareAspectRatio>("1:1"),
    [visibility, setVisibility] = useState("public"),
    [shares, setShares] = useState<{ id: string; expires: number }[]>([]),
    [csrf, setCsrf] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [created, setCreated] = useState("");
  async function load() {
    const s = await startSession();
    setCsrf(s.csrf);
    const list = await jsonRequest("/api/shares");
    setShares(list.shares);
    return s.csrf as string;
  }
  useEffect(() => {
    void load().catch((e) => setMessage(e.message));
  }, []);
  async function create() {
    if (!profile) return;
    setBusy(true);
    setMessage("");
    try {
      const key = csrf || (await load());
      const payload = createPublicSharePayload(profile, {
        calculations: [
          "life-path",
          "expression",
          "soul-urge",
          "personality",
          "maturity",
        ],
        aspectRatio: ratio,
      });
      const result = await jsonRequest("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": key },
        body: JSON.stringify({ payload, visibility }),
      });
      setCreated(result.url);
      await load();
      setMessage("Share created. It expires in 30 days.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sharing failed.");
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    setBusy(true);
    try {
      await jsonRequest(`/api/shares/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrf },
      });
      setShares(shares.filter((s) => s.id !== id));
      setCreated("");
      setMessage("Share revoked. Its URL no longer opens.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not revoke.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="share" className="panel">
      <p className="eyebrow">Keep the meaning. Leave the details.</p>
      <h2>Share selected numbers</h2>
      <p>
        Only five derived values leave your device. Your name, birth date and
        private inputs are excluded. Links expire after 30 days. Revocation is
        controlled by this browser’s secure session; clearing cookies loses that
        control.
      </p>
      <div className="form-row">
        <label>
          Card format
          <select
            value={ratio}
            onChange={(e) => setRatio(e.target.value as ShareAspectRatio)}
          >
            {["1:1", "4:5", "9:16", "16:9"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Visibility
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Anyone with the link</option>
            <option value="private">Only this browser session</option>
          </select>
        </label>
      </div>
      {!profile && (
        <p>
          Reveal a Pythagorean profile to create a new share. Existing shares
          can still be revoked below.
        </p>
      )}
      <button
        className="primary"
        disabled={busy || !profile}
        onClick={() => void create()}
      >
        {busy ? "Working…" : "Create safe share"}
      </button>
      <p role="status">{message}</p>
      {created && (
        <p>
          <a href={created} target="_blank" rel="noreferrer">
            Open new share
          </a>
        </p>
      )}
      {shares.length > 0 && (
        <ul className="share-list">
          {shares.map((s, i) => (
            <li key={s.id}>
              <a href={`/s/${s.id}`} target="_blank" rel="noreferrer">
                Share {i + 1}
              </a>
              <span>Expires {new Date(s.expires).toLocaleDateString()}</span>
              <button disabled={busy} onClick={() => void revoke(s.id)}>
                Revoke share {i + 1}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
function SharedPage({ id }: { id: string }) {
  const [payload, setPayload] = useState<PublicSharePayload | null>(null),
    [message, setMessage] = useState("Loading selected numbers…");
  useEffect(() => {
    void jsonRequest(`/api/shares/${id}`)
      .then(setPayload)
      .catch((e) => setMessage(e.message));
  }, [id]);
  async function png() {
    try {
      const response = await fetch(`/s/${id}/card.svg`);
      if (!response.ok) throw new Error("Share unavailable.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        canvas.toBlob((b) => {
          if (b) download(b, "image/png", "prime-numera-card.png");
        }, "image/png");
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setMessage("Image export failed. Try the SVG download.");
      };
      img.src = url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Export failed.");
    }
  }
  return (
    <main>
      <a href="/">← Discover PRIME NUMERA</a>
      <section className="panel">
        <p className="eyebrow">An anonymous glimpse</p>
        <h1>Selected numbers</h1>
        {payload ? (
          <>
            <p>Pythagorean · original reflective numerology</p>
            <div className="values">
              {payload.values.map((v) => (
                <article key={v.calculation}>
                  <p>{v.label}</p>
                  <strong>{v.value}</strong>
                  <Interpretation value={v.value} />
                </article>
              ))}
            </div>
            <div className="actions">
              <a href={`/s/${id}/card.svg`} download="prime-numera-card.svg">
                Download SVG
              </a>
              <button onClick={() => void png()}>Download PNG</button>
            </div>
            <img
              className="share-preview"
              src={`/s/${id}/card.svg`}
              alt="PRIME NUMERA selected numbers social card"
            />
            {location.protocol === "https:" && (
              <img
                className="qr"
                src={`/s/${id}/qr.png`}
                alt="QR code for this anonymous share link"
              />
            )}
            <p>
              Numerology is reflective entertainment, not a scientific
              prediction. Anyone with a public link can copy its contents;
              revocation cannot erase downloaded copies.
            </p>
          </>
        ) : (
          <p role="status">{message}</p>
        )}
      </section>
    </main>
  );
}
function App() {
  const [input, setInput] = useState<ProfileInput | null>(null),
    [saved, setSaved] = useState<SavedProfile[]>([]),
    [notice, setNotice] = useState(""),
    [comparison, setComparison] = useState<ProfileInput | null>(null),
    [cardPath, setCardPath] = useState<0 | 1>(0),
    [comparisonFilter, setComparisonFilter] = useState<
      "all" | "shared" | "contrasting"
    >("all");
  const [experience, setExperience] = useState<ExperienceState>(() =>
      initialExperience(0),
    ),
    [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    try {
      setSaved(readSaved(localStorage.getItem(STORAGE)));
      const raw = localStorage.getItem(EXPERIENCE);
      const parsed = raw ? parseExperience(JSON.parse(raw)) : null;
      setExperience(
        parsed ??
          initialExperience(crypto.getRandomValues(new Uint32Array(1))[0]!),
      );
    } catch {
      setNotice(
        "Browser storage could not be read. Existing data has not been overwritten. You can still calculate privately.",
      );
    }
    const on = () => setOffline(false),
      off = () => setOffline(true);
    addEventListener("online", on);
    addEventListener("offline", off);
    return () => {
      removeEventListener("online", on);
      removeEventListener("offline", off);
    };
  }, []);
  function persist(next: SavedProfile[]) {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
      setSaved(next);
      setNotice("Saved profiles updated on this device.");
    } catch {
      setNotice(
        "Storage is unavailable or full. Export your profile before leaving.",
      );
    }
  }
  function adapt(next: ExperienceState) {
    setExperience(next);
    try {
      localStorage.setItem(EXPERIENCE, JSON.stringify(next));
    } catch {
      setNotice("Your choices work for this visit, but could not be saved.");
    }
  }
  function reveal(v: ProfileInput) {
    setInput(v);
    setComparison(null);
    setTimeout(() => document.getElementById("results")?.focus(), 0);
  }
  const profile = useMemo(
    () => (input?.system === "pythagorean" ? buildProfile(input) : null),
    [input],
  );
  const chaldean = useMemo(
    () => (input?.system === "chaldean" ? buildChaldean(input) : null),
    [input],
  );
  const encounter = selectEncounter(experience, profile?.lifePath.value);
  const compared =
    profile && comparison?.system === "pythagorean"
      ? comparePythagoreanProfiles(
          profile,
          buildProfile(comparison),
          "friendship",
        )
      : null;
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <a className="wordmark" href="/">
          PRIME <span>NUMERA</span>
          <small>THE ART OF YOUR NUMBERS</small>
        </a>
        <nav aria-label="Main navigation">
          <a href="#begin">Discover</a>
          <a href="#atlas">Atlas</a>
          <a href="#saved">My collection</a>
        </nav>
      </header>
      <main id="main">
        {offline && (
          <p role="status" className="note">
            You are offline. Calculations and local saves work in this open
            page. Share creation and shared links need a connection.
          </p>
        )}
        <section className="hero">
          <div>
            <p className="eyebrow">A little mathematics. A little mystery.</p>
            <h1>
              Your numbers.
              <br />
              <em>A story to explore.</em>
            </h1>
            <p className="intro">
              Meet the patterns behind your name. Follow a numerical
              constellation. Find a question worth keeping.
            </p>
            <a className="primary" href="#begin">
              Find your first number <span aria-hidden="true">↗</span>
            </a>
            <p className="micro">
              No account needed · Calculated privately · Under a minute
            </p>
          </div>
          <figure className="hero-art">
            <img
              src="/art/architect.webp"
              alt="An original illustrated Architect archetype in an ornate symbolic frame"
              width="1024"
              height="1536"
            />
            <figcaption>
              <span>IV</span> THE ARCHITECT{" "}
              <small>Original modern archetype</small>
            </figcaption>
          </figure>
        </section>
        <div className="section-line">
          <span>01 / DISCOVER</span>
          <span>Mathematics you can trace. Meaning you decide.</span>
        </div>
        <section id="begin" className="two-column">
          <div>
            <p className="eyebrow">Start with yourself</p>
            <h2>
              There is a pattern
              <br />
              in every beginning.
            </h2>
            <p>
              Enter a name and date to see the arithmetic, then explore the
              interpretations at your own pace.
            </p>
            <p className="note">
              Names and dates stay in your browser. Nothing is saved unless you
              choose to save. Numerology is a reflective tradition, not science.
            </p>
          </div>
          <div className="panel">
            <Form onSubmit={reveal} />
          </div>
        </section>
        <p role="status" className="status">
          {notice}
        </p>
        {input && (
          <section id="results" tabIndex={-1} className="results">
            <div className="section-line">
              <span>02 / YOUR REVEAL</span>
              <span>{SYSTEMS[input.system].name}</span>
            </div>
            <h2>
              {input.system === "pythagorean"
                ? "Your numerical portrait"
                : "Your Chaldean name number"}
            </h2>
            <p className="micro">Private result for {input.name}</p>
            <nav className="explore-nav" aria-label="Explore this profile">
              <a href="#arcana">Archetypes</a>
              {profile && (
                <>
                  <a href="#dna">Number DNA</a>
                  <a href="#timeline">Life cycles</a>
                  <a href="#compatibility">Compatibility</a>
                </>
              )}
              <a href="#name-lab">Name lab</a>
              <a href="#atlas">Atlas</a>
              <a href="#share">Share</a>
            </nav>
            <div className={profile ? "portrait" : "values"}>
              {profile ? (
                <NumberExplorer profile={profile} />
              ) : (
                <article>
                  <p>Name number</p>
                  <strong>{chaldean!.value}</strong>
                  <p>Compound sum: {chaldean!.sum}</p>
                  <p>
                    {chaldean!.mappings
                      .map((m) => `${m.character}=${m.value}`)
                      .join(" + ")}{" "}
                    = {chaldean!.sum}
                  </p>
                  <Interpretation value={chaldean!.value} system="chaldean" />
                </article>
              )}
            </div>
            {profile && (
              <details>
                <summary>See the exact calculation trace</summary>
                <p>
                  These private details are excluded from the sharing service.
                </p>
                <pre>
                  {JSON.stringify(
                    {
                      lifePath: profile.lifePath,
                      expression: profile.expression,
                      soulUrge: profile.soulUrge,
                      personality: profile.personality,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            )}
            <div className="actions">
              <button
                onClick={() => {
                  if (saved.length >= 20) {
                    setNotice(
                      "You can keep 20 profiles on this device. Delete one to make room.",
                    );
                    return;
                  }
                  persist([...saved, { id: crypto.randomUUID(), input }]);
                }}
              >
                Save on this device
              </button>
              <button
                onClick={() =>
                  download(
                    JSON.stringify({ schemaVersion: 1, input }, null, 2),
                    "application/json",
                    "numera-private-profile.json",
                  )
                }
              >
                Export private profile
              </button>
              <a href="#methodology">Understand the method</a>
              {profile && <a href="#share">Share selected numbers</a>}
            </div>
            <p className="micro">
              Private exports contain your name and birth date. Keep them
              somewhere you trust.
            </p>
            <section id="arcana" className="encounter panel">
              <div className="encounter-art">
                {encounter.card.id === "wayfinder" ? (
                  <div
                    className="wayfinder"
                    role="img"
                    aria-label="Original Wayfinder compass composition"
                  >
                    ✧<span>V</span>✧
                  </div>
                ) : (
                  <img
                    loading="lazy"
                    src={`/art/${encounter.card.id === "phoenix" ? "phoenix-v2" : encounter.card.id}.webp`}
                    alt={`Original ${encounter.card.title} illustration`}
                  />
                )}
              </div>
              <div>
                <p className="eyebrow">
                  Your living arcana · modern creative reflection
                </p>
                <h2>{encounter.card.title}</h2>
                <p>{encounter.card.story}</p>
                <label>
                  What brings you here?
                  <select
                    value={experience.intent}
                    onChange={(e) =>
                      adapt({ ...experience, intent: e.target.value as Intent })
                    }
                  >
                    <option value="reflect">Reflect</option>
                    <option value="create">Create</option>
                    <option value="explore">Explore</option>
                  </select>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={experience.adaptive}
                    onChange={(e) =>
                      adapt({ ...experience, adaptive: e.target.checked })
                    }
                  />
                  Adapt to my explicit choices
                </label>
                <details>
                  <summary>Why this card?</summary>
                  <ul>
                    {encounter.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <p>
                    Only your stated interest, saved cards, feedback and recent
                    draws influence the order. No sensitive traits are inferred.
                    Your arithmetic never changes.
                  </p>
                </details>
                <div className="chips" aria-label="Choose a reflection path">
                  {encounter.card.paths.map((path, i) => (
                    <button
                      key={path}
                      aria-pressed={cardPath === i}
                      onClick={() => setCardPath(i as 0 | 1)}
                    >
                      {path}
                    </button>
                  ))}
                </div>
                <p className="reflection-prompt" aria-live="polite">
                  {encounter.card.tasks[cardPath][encounter.chapter]}
                </p>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={experience.completed.includes(
                      `${encounter.card.id}-${cardPath}-${encounter.chapter}`,
                    )}
                    onChange={(e) => {
                      const task = `${encounter.card.id}-${cardPath}-${encounter.chapter}`;
                      adapt({
                        ...experience,
                        completed: e.target.checked
                          ? [...new Set([...experience.completed, task])]
                          : experience.completed.filter((t) => t !== task),
                      });
                    }}
                  />
                  Mark this reflection explored
                </label>
                <p className="micro">
                  {experience.completed.length} of 18 reflection prompts
                  explored. Your own pace; no streaks or deadlines.
                </p>
                <div className="chips" aria-label="Card preference">
                  <button
                    aria-pressed={experience.feedback[encounter.card.id] === 1}
                    onClick={() =>
                      adapt({
                        ...experience,
                        feedback: {
                          ...experience.feedback,
                          [encounter.card.id]: 1,
                        },
                      })
                    }
                  >
                    More like this
                  </button>
                  <button
                    aria-pressed={experience.feedback[encounter.card.id] === -1}
                    onClick={() =>
                      adapt({
                        ...experience,
                        feedback: {
                          ...experience.feedback,
                          [encounter.card.id]: -1,
                        },
                      })
                    }
                  >
                    Less like this
                  </button>
                </div>
                <div className="actions">
                  <button
                    onClick={() =>
                      adapt({
                        ...experience,
                        draw: (experience.draw + 1) % 1000000,
                        history: [
                          ...experience.history,
                          encounter.card.id,
                        ].slice(-12),
                      })
                    }
                  >
                    Explore another card
                  </button>
                  <button
                    onClick={() =>
                      adapt({
                        ...experience,
                        saved: [
                          ...new Set([...experience.saved, encounter.card.id]),
                        ],
                      })
                    }
                  >
                    Keep this archetype
                  </button>
                  <button
                    onClick={() => adapt(initialExperience(experience.seed))}
                  >
                    Reset personalization
                  </button>
                </div>
              </div>
            </section>
            <NameLab
              key={`${input.name}:${input.date}:${input.system}`}
              input={input}
            />
            {profile && (
              <>
                <Dna profile={profile} />
                <Timeline key={input.date} profile={profile} />
                <section id="compatibility" className="panel">
                  <p className="eyebrow">Two perspectives, side by side</p>
                  <h2>Compatibility</h2>
                  <p>
                    Compare Pythagorean values openly. Equal values are shared
                    numerical patterns; differences are contrasts, not measures
                    of relationship success. Use only information you have
                    permission to use.
                  </p>
                  {saved.filter((s) => s.input.system === "pythagorean")
                    .length > 0 && (
                    <label>
                      Compare a saved profile
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const s = saved.find((s) => s.id === e.target.value);
                          if (s) setComparison(s.input);
                        }}
                      >
                        <option value="" disabled>
                          Choose a profile
                        </option>
                        {saved
                          .filter((s) => s.input.system === "pythagorean")
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.input.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  <Form label="Compare profiles" onSubmit={setComparison} />
                  {comparison?.system === "chaldean" && (
                    <p role="alert">
                      Choose Pythagorean for both profiles. Cross-method
                      comparisons would mix different rules.
                    </p>
                  )}
                  {compared && (
                    <div className="comparison">
                      <h3>Your shared and contrasting patterns</h3>
                      <div className="chips" aria-label="Comparison patterns">
                        {(["all", "shared", "contrasting"] as const).map(
                          (f) => (
                            <button
                              key={f}
                              aria-pressed={comparisonFilter === f}
                              onClick={() => setComparisonFilter(f)}
                            >
                              {f === "all"
                                ? "All patterns"
                                : f === "shared"
                                  ? "Shared patterns"
                                  : "Contrasting patterns"}
                            </button>
                          ),
                        )}
                      </div>
                      <p role="status">
                        {
                          compared.coreDimensions.filter(
                            (d) =>
                              comparisonFilter === "all" ||
                              (comparisonFilter === "shared"
                                ? d.shared
                                : !d.shared),
                          ).length
                        }{" "}
                        dimensions shown
                      </p>
                      <div className="table-scroll">
                        <table>
                          <caption>
                            Transparent comparison: absolute difference = |first
                            − second|
                          </caption>
                          <thead>
                            <tr>
                              <th>Dimension</th>
                              <th>You</th>
                              <th>Other</th>
                              <th>Difference</th>
                              <th>Pattern</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compared.coreDimensions
                              .filter(
                                (d) =>
                                  comparisonFilter === "all" ||
                                  (comparisonFilter === "shared"
                                    ? d.shared
                                    : !d.shared),
                              )
                              .map((d) => (
                                <tr key={d.calculation}>
                                  <td>{d.calculation}</td>
                                  <td>{d.firstValue}</td>
                                  <td>{d.secondValue}</td>
                                  <td>{d.absoluteDifference}</td>
                                  <td>{d.shared ? "Shared" : "Contrasting"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <h4>Explore a conversation</h4>
                      {compared.coreDimensions
                        .filter(
                          (d) =>
                            comparisonFilter === "all" ||
                            (comparisonFilter === "shared"
                              ? d.shared
                              : !d.shared),
                        )
                        .map((d) => (
                          <details key={d.calculation}>
                            <summary>
                              {d.calculation.replaceAll("-", " ")} ·{" "}
                              {d.firstValue} & {d.secondValue}
                            </summary>
                            <div className="form-row">
                              <div>
                                <h4>
                                  Your reflection ·{" "}
                                  {reflection(d.firstValue).title}
                                </h4>
                                <p>{reflection(d.firstValue).prompt}</p>
                              </div>
                              <div>
                                <h4>
                                  Their reflection ·{" "}
                                  {reflection(d.secondValue).title}
                                </h4>
                                <p>{reflection(d.secondValue).prompt}</p>
                              </div>
                            </div>
                            <p>
                              {d.shared
                                ? "The numbers match. Ask each other where the same theme takes a different form in your lives."
                                : "The numbers differ. Each person can choose what resonates, then discuss how to make space for both perspectives."}
                            </p>
                            <small>
                              Original discussion prompts derived from the
                              displayed values; not an assessment of either
                              person.
                            </small>
                          </details>
                        ))}
                      <h4>Communication and growth</h4>
                      <p>
                        For shared themes, discuss how each of you expresses the
                        same idea differently. For contrasting themes, ask what
                        each person needs and where those preferences can
                        complement or conflict. These are original discussion
                        prompts, not conclusions about either person.
                      </p>
                      <button
                        onClick={() =>
                          download(
                            JSON.stringify(
                              {
                                system: compared.system,
                                dimensions: compared.coreDimensions,
                              },
                              null,
                              2,
                            ),
                            "application/json",
                            "numera-anonymous-comparison.json",
                          )
                        }
                      >
                        Export anonymous comparison
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </section>
        )}
        <section id="saved" className="panel">
          <p className="eyebrow">Your private collection</p>
          <h2>Saved on this device</h2>
          <p>
            Saved profiles remain until you delete them or clear browser
            storage. They are not encrypted at rest; anyone using this browser
            can open them. There is no cross-device profile sync.
          </p>
          {saved.length === 0 ? (
            <p>
              No saved profiles yet. Reveal a profile and choose “Save on this
              device.”
            </p>
          ) : (
            <ul className="saved-list">
              {saved.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.input.name}</strong>
                    <small>{SYSTEMS[s.input.system].name}</small>
                  </div>
                  <button onClick={() => reveal(s.input)}>Open profile</button>
                  <button
                    onClick={() => persist(saved.filter((p) => p.id !== s.id))}
                  >
                    Delete profile
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label>
            Restore a private profile export
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 8192)
                    throw new Error("Profile file is too large.");
                  const data: unknown = JSON.parse(await file.text());
                  if (
                    !data ||
                    typeof data !== "object" ||
                    !("schemaVersion" in data) ||
                    data.schemaVersion !== 1 ||
                    !("input" in data) ||
                    Object.keys(data).length !== 2
                  )
                    throw new Error("Invalid profile export.");
                  reveal(parseProfile(data.input));
                  setNotice(
                    "Profile restored for this visit. Choose Save to keep it on this device.",
                  );
                } catch (error) {
                  setNotice(
                    error instanceof Error
                      ? error.message
                      : "Could not import that file.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
        </section>
        {experience.saved.length > 0 && (
          <section className="panel">
            <h2>Kept archetypes</h2>
            <div className="values">
              {experience.saved.map((id) => (
                <article key={id}>
                  <h3>{cardById(id).title}</h3>
                  <p>{cardById(id).subtitle}</p>
                  <button
                    onClick={() =>
                      adapt({
                        ...experience,
                        saved: experience.saved.filter((x) => x !== id),
                      })
                    }
                  >
                    Release {cardById(id).title}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        <ShareTools profile={profile} />
        <Methodology input={input} />
        <Atlas />
        <section id="privacy" className="panel">
          <h2>Privacy, without the fine-print maze</h2>
          <p>
            Calculations run in your browser. Optional local saves contain names
            and birth dates. Personalization stores explicit choices locally.
            This release sends no analytics events and loads no third-party
            fonts or trackers.
          </p>
          <p>
            The share service stores anonymous derived numbers, an opaque owner
            identifier and an expiration date. A strictly necessary HttpOnly
            cookie enables revocation for 90 days. Shares expire after 30 days;
            expired records are purged every minute while the service runs.
            Revocation removes the active record immediately. Hosting providers
            may retain transport logs under their own policy; production
            operators must disable URL/body logging for private and share
            endpoints.
          </p>
          <p>
            Deleting a local profile does not revoke its existing anonymous
            shares. Use each share’s Revoke button. Downloaded cards and other
            recipients’ copies cannot be recalled. Backups require the
            documented deletion replay procedure.
          </p>
        </section>
      </main>
      <footer>
        <span className="wordmark">PRIME NUMERA</span>
        <p>
          Know the arithmetic. Explore the symbolism. Keep your own meaning.
        </p>
        <a href="#privacy">Privacy</a>
        <a href="#methodology">Methodology</a>
        <p>Original interpretations for reflection and entertainment.</p>
      </footer>
    </>
  );
}
const shared = /^\/s\/(sh_[a-f0-9]{48})$/.exec(location.pathname);
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Boundary>{shared ? <SharedPage id={shared[1]!} /> : <App />}</Boundary>
  </React.StrictMode>,
);
