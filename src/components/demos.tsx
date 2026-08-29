import {
  Component,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Check,
  CheckCircle2,
  Code,
  Database,
  FlaskConical,
  Globe,
  KeyRound,
  Layers,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Sliders,
  Terminal,
  Zap,
} from "lucide-react";
import type { DemoKind } from "../data/types";

const label = "font-mono text-[0.62rem] uppercase tracking-[0.2em]";

/* ================= Constraint Validation Lab ================= */

interface FieldSnapshot {
  name: string;
  value: string;
  valid: boolean;
  flags: string[];
  message: string;
}

export function ValidationLab() {
  const formRef = useRef<HTMLFormElement>(null);
  const [noValidate, setNoValidate] = useState(false);
  const [snapshots, setSnapshots] = useState<FieldSnapshot[]>([]);
  const [jsResult, setJsResult] = useState<string[] | null>(null);

  const capture = () => {
    const form = formRef.current;
    if (!form) return;
    const fields = Array.from(form.querySelectorAll<HTMLInputElement>("input"));
    setSnapshots(
      fields.map((f) => {
        const v = f.validity;
        const flags = [
          v.valueMissing && "valueMissing",
          v.typeMismatch && "typeMismatch",
          v.patternMismatch && "patternMismatch",
          v.rangeUnderflow && "rangeUnderflow",
          v.rangeOverflow && "rangeOverflow",
          v.tooShort && "tooShort",
        ].filter(Boolean) as string[];
        return { name: f.name, value: f.value, valid: v.valid, flags, message: f.validationMessage };
      }),
    );
  };

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.noValidate = noValidate;
    capture();
    form.addEventListener("input", capture);
    return () => form.removeEventListener("input", capture);
  }, [noValidate]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (noValidate) {
      setJsResult(["novalidate is ON — the browser skipped its check.", "Calling form.checkValidity() ourselves instead…"]);
    }
  };

  const runJsCheck = () => {
    const form = formRef.current;
    if (!form) return;
    const ok = form.checkValidity();
    const fields = Array.from(form.querySelectorAll<HTMLInputElement>("input"));
    const lines = fields
      .filter((f) => !f.validity.valid)
      .map((f) => `• ${f.name}: ${f.validationMessage}`);
    setJsResult(
      ok
        ? ["form.checkValidity() → true. Every field passes its constraints."]
        : [`form.checkValidity() → false. The browser knows exactly why:`, ...lines],
    );
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the browser's validation engine</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <form ref={formRef} className="demo-form flex flex-col gap-4" onSubmit={onSubmit} aria-label="Validation demo form">
          <div>
            <label htmlFor="demo-email">Email</label>
            <input id="demo-email" name="email" type="email" required autoComplete="off" placeholder="ada@example.com" />
          </div>
          <div>
            <label htmlFor="demo-user">Username <span className="hint">3–16 letters/digits/underscores</span></label>
            <input
              id="demo-user"
              name="username"
              required
              pattern="[A-Za-z0-9_]{3,16}"
              title="3 to 16 characters: letters, digits, underscores"
              minLength={3}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="demo-age">Age</label>
            <input id="demo-age" name="age" type="number" min={13} max={120} required />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary btn-sm">
              <Play size={13} /> Submit (native)
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={runJsCheck}>
              <Zap size={13} /> form.checkValidity()
            </button>
            <label className="flex items-center gap-2 text-[0.82rem] cursor-pointer select-none" style={{ color: "var(--ink-2)" }}>
              <input
                type="checkbox"
                checked={noValidate}
                onChange={(e) => setNoValidate(e.target.checked)}
                style={{ accentColor: "var(--brand)" }}
              />
              <code>novalidate</code> on
            </label>
          </div>
        </form>

        <div className="flex flex-col gap-3 min-w-0">
          <div className={label} style={{ color: "var(--muted)" }}>
            validity flags — live as you type
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>field</th>
                  <th>state</th>
                  <th>flags</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.name}>
                    <td className="font-mono text-[0.78rem]">{s.name}</td>
                    <td>
                      <span style={{ color: s.valid ? "var(--brand-ink)" : "var(--rose-ink)" }} className="font-mono text-[0.78rem]">
                        {s.valid ? "valid" : "invalid"}
                      </span>
                    </td>
                    <td className="font-mono text-[0.72rem]">{s.flags.length > 0 ? s.flags.join(", ") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {jsResult && (
            <div
              className="fade-in rounded-[var(--r-sm)] border p-3 text-[0.82rem] font-mono leading-relaxed"
              style={{ background: "var(--code-bg)", color: "var(--code-ink)", borderColor: "var(--line)" }}
              role="status"
            >
              {jsResult.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          )}
          <p className="text-[0.78rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            Watch the red ring: that is <code>:user-invalid</code> — the browser only marks a field after you interact
            with it. Toggle <code>novalidate</code> and resubmit: no bubble, no blocking — then ask the API yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= Specificity Battle ================= */

interface Spec {
  a: number;
  b: number;
  c: number;
}

const PRESETS: { name: string; selectors: string[] }[] = [
  { name: "The classic nav fight", selectors: ["#nav a", ".nav a", "nav a"] },
  { name: "Utility vs component", selectors: ["button.primary", ".toolbar button", "main button.btn"] },
  { name: ":where() zeroes out", selectors: ["#root .card .title", ".card .title", ":where(.card) .title"] },
];

function specificity(sel: string): Spec {
  let s = sel.trim();
  // :where(...) contributes nothing — strip it (and its contents) first
  while (/:where\([^()]*\)/.test(s)) s = s.replace(/:where\([^()]*\)/g, "");
  // :not(...) and :is(...) contribute their insides — keep contents, drop wrappers
  while (/:not\(([^()]*)\)/.test(s)) s = s.replace(/:not\(([^()]*)\)/g, " $1 ");
  while (/:is\(([^()]*)\)/.test(s)) s = s.replace(/:is\(([^()]*)\)/g, " $1 ");

  const a = (s.match(/#[A-Za-z_][\w-]*/g) ?? []).length;
  s = s.replace(/#[A-Za-z_][\w-]*/g, " ");

  const attrs = (s.match(/\[[^\]]*\]/g) ?? []).length;
  s = s.replace(/\[[^\]]*\]/g, " ");

  const pseudoEls = (s.match(/::[a-z-]+/g) ?? []).length;
  s = s.replace(/::[a-z-]+/g, " ");

  const pseudoCls = (s.match(/:[a-z-]+(\([^()]*\))?/g) ?? []).length;
  s = s.replace(/:[a-z-]+(\([^()]*\))?/g, " ");

  const b = attrs + pseudoCls + (s.match(/\.[A-Za-z_][\w-]*/g) ?? []).length;
  s = s.replace(/\.[A-Za-z_][\w-]*/g, " ");

  const c = pseudoEls + (s.match(/[A-Za-z][\w-]*/g) ?? []).length;
  return { a, b, c };
}

const rank = (s: Spec) => s.a * 10000 + s.b * 100 + s.c;

export function SpecificityBattle() {
  const [selectors, setSelectors] = useState<string[]>(PRESETS[0].selectors);
  const [draft, setDraft] = useState("");
  const [customNote, setCustomNote] = useState(false);

  const ranked = useMemo(() => {
    return selectors
      .map((sel, idx) => ({ sel, idx, spec: specificity(sel) }))
      .sort((x, y) => rank(y.spec) - rank(x.spec) || y.idx - x.idx);
  }, [selectors]);

  const winner = ranked[0];
  const tie = ranked.length > 1 && rank(ranked[0].spec) === rank(ranked[1].spec);

  const apply = (preset: (typeof PRESETS)[number]) => {
    setSelectors(preset.selectors);
    setCustomNote(false);
    setDraft("");
  };

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    setSelectors((prev) => [...prev, value]);
    setCustomNote(true);
    setDraft("");
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — specificity battle</span>
        <span className={`${label} ml-auto`} style={{ color: "var(--muted)" }}>specificity = (id · class · element)</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            className="chip"
            style={{ cursor: "pointer", borderColor: p.selectors === selectors ? "var(--brand)" : undefined }}
            onClick={() => apply(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2" role="list" aria-label="Selectors ranked by specificity">
        {ranked.map((r, pos) => {
          const isWin = r.idx === winner.idx;
          return (
            <div
              key={`${r.sel}-${r.idx}`}
              role="listitem"
              className="flex flex-wrap items-center gap-3 rounded-[var(--r-sm)] border px-3.5 py-2.5 transition-all"
              style={{
                borderColor: isWin ? "var(--brand)" : "var(--line)",
                background: isWin ? "var(--brand-soft)" : "var(--surface-2)",
              }}
            >
              <span className="font-mono text-[0.68rem] w-8" style={{ color: isWin ? "var(--brand-ink)" : "var(--muted)" }}>
                #{pos + 1}
              </span>
              <code className="font-mono text-[0.85rem]" style={{ background: "transparent", border: "none", padding: 0, color: "var(--ink)" }}>
                {r.sel}
              </code>
              <span
                className="font-mono text-[0.72rem] px-2 py-0.5 rounded-full border ml-auto"
                style={{
                  borderColor: "var(--line-2)",
                  color: isWin ? "var(--brand-ink)" : "var(--muted)",
                  background: "var(--surface)",
                }}
              >
                {r.spec.a} · {r.spec.b} · {r.spec.c}
              </span>
              {isWin && (
                <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: "var(--brand-ink)" }}>
                  wins
                </span>
              )}
              {selectors.length > 2 && (
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  style={{ padding: "0.2rem 0.55rem", fontSize: "0.72rem" }}
                  onClick={() => setSelectors((prev) => prev.filter((_, i) => i !== r.idx))}
                  aria-label={`Remove selector ${r.sel}`}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[0.82rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }} role="status">
        {tie ? (
          <>
            <strong style={{ color: "var(--amber-ink)" }}>Tie.</strong> Specificity is identical — so{" "}
            <em>source order</em> decides: the rule written later in the stylesheet wins.
          </>
        ) : (
          <>
            <strong style={{ color: "var(--brand-ink)" }}>{winner.sel}</strong> wins: compare the triplets left to
            right — {winner.spec.a} id{winner.spec.a === 1 ? "" : "s"} beats any number of classes, and classes beat
            any number of elements. <code>:where()</code> always scores zero — your escape hatch.
          </>
        )}
        {customNote && " (Educational parser — handles common selectors, incl. :not/:is contents and :where().)"}
      </p>

      <div className="flex gap-2 mt-4">
        <input
          className="input"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
          placeholder="Add a challenger… e.g. main nav ul li.active a"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          aria-label="New selector to add"
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
          Add
        </button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => apply(PRESETS[0])} aria-label="Reset battle">
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================= Box Model Lab ================= */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function BoxModelLab() {
  const [content, setContent] = useState(180);
  const [padding, setPadding] = useState(16);
  const [border, setBorder] = useState(4);
  const [margin, setMargin] = useState(20);
  const [borderBox, setBorderBox] = useState(true);

  const widthProp = borderBox ? clamp(content + 2 * (padding + border), 0, 400) : content;
  const innerContent = borderBox ? Math.max(0, widthProp - 2 * (padding + border)) : content;
  const onScreen = innerContent + 2 * padding + 2 * border;

  const slider = (
    name: string,
    value: number,
    set: (n: number) => void,
    max: number,
    color: string,
  ) => (
    <label className="flex items-center gap-3 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
      <span className="w-16 font-mono text-[0.72rem]" style={{ color }}>{name}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ accentColor: color, flex: 1 }}
        aria-label={`${name} in pixels`}
      />
      <span className="w-12 text-right font-mono text-[0.72rem]">{value}px</span>
    </label>
  );

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the box model</span>
        <div className="ml-auto flex items-center gap-1.5" role="group" aria-label="Box sizing mode">
          {(["border-box", "content-box"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className="chip"
              style={{
                cursor: "pointer",
                borderColor: (mode === "border-box") === borderBox ? "var(--brand)" : undefined,
                color: (mode === "border-box") === borderBox ? "var(--brand-ink)" : undefined,
              }}
              aria-pressed={(mode === "border-box") === borderBox}
              onClick={() => setBorderBox(mode === "border-box")}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col gap-3">
          {slider("margin", margin, setMargin, 48, "var(--muted)")}
          {slider("border", border, setBorder, 24, "var(--amber)")}
          {slider("padding", padding, setPadding, 48, "var(--sky)")}
          {slider("content", content, setContent, 260, "var(--brand)")}
          <div
            className="rounded-[var(--r-sm)] border p-3 font-mono text-[0.75rem] leading-relaxed"
            style={{ background: "var(--surface-2)", borderColor: "var(--line)", color: "var(--ink-2)" }}
            role="status"
          >
            <div>width: <span style={{ color: "var(--brand-ink)" }}>{widthProp}px</span> ({borderBox ? "box includes padding+border" : "content only"})</div>
            <div>on screen: {innerContent} + 2×{padding} + 2×{border} = <span style={{ color: "var(--amber-ink)" }}>{onScreen}px</span></div>
            <div>footprint incl. margin: <span style={{ color: "var(--ink)" }}>{onScreen + 2 * margin}px</span></div>
            {!borderBox && (
              <div style={{ color: "var(--rose-ink)" }}>← content-box: padding and border GROW the box beyond `width`</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center py-4">
          <div
            className="relative transition-all"
            style={{ background: "color-mix(in srgb, var(--muted) 14%, transparent)", outline: "1px dashed var(--line-2)", outlineOffset: 0, padding: margin }}
            aria-hidden="true"
          >
            <span className="absolute top-0.5 left-1 font-mono text-[0.58rem]" style={{ color: "var(--muted)" }}>margin</span>
            <div
              className="relative transition-all"
              style={{ background: "color-mix(in srgb, var(--amber) 22%, transparent)", border: `${border}px solid var(--amber)`, padding: border > 0 ? 2 : 0 }}
            >
              <span className="absolute top-0.5 left-1 font-mono text-[0.58rem]" style={{ color: "var(--amber-ink)" }}>border</span>
              <div className="relative transition-all" style={{ background: "color-mix(in srgb, var(--sky) 18%, transparent)", padding }}>
                <span className="absolute top-0.5 left-1 font-mono text-[0.58rem]" style={{ color: "var(--sky-ink)" }}>padding</span>
                <div
                  className="flex items-center justify-center font-mono text-[0.7rem] transition-all"
                  style={{
                    width: innerContent,
                    height: 64,
                    background: "color-mix(in srgb, var(--brand) 26%, transparent)",
                    border: "1px solid var(--brand)",
                    color: "var(--brand-ink)",
                  }}
                >
                  {Math.round(innerContent)}px
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Drag the sliders, then flip to <code>content-box</code>: same <code>width</code>, fatter box — the classic
        layout surprise. <code>border-box</code> (set it globally on every project) keeps <code>width</code> honest.
      </p>
    </div>
  );
}

/* ================= Flexbox / Grid playground ================= */

type GridPreset = "cards" | "holy" | "sidebar" | "even";

const FLEX_JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around"];
const FLEX_ALIGN = ["stretch", "flex-start", "center", "flex-end", "baseline"];

export function FlexGridLab() {
  const [mode, setMode] = useState<"flex" | "grid">("flex");
  const [direction, setDirection] = useState("row");
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("center");
  const [wrap, setWrap] = useState(true);
  const [items, setItems] = useState(5);
  const [preset, setPreset] = useState<GridPreset>("cards");
  const [gap, setGap] = useState(12);
  const [minCard, setMinCard] = useState(180);

  const flexCss = [
    ".container {",
    "  display: flex;",
    `  flex-direction: ${direction};`,
    `  justify-content: ${justify};`,
    `  align-items: ${align};`,
    `  flex-wrap: ${wrap ? "wrap" : "nowrap"};`,
    `  gap: ${gap}px;`,
    "}",
  ].join("\n");

  const gridCss =
    preset === "cards"
      ? [
          ".grid {",
          "  display: grid;",
          `  grid-template-columns: repeat(auto-fill, minmax(${minCard}px, 1fr));`,
          `  gap: ${gap}px;`,
          "}",
          "",
          "/* auto-fill keeps laying tracks even when empty —",
          "   cards keep a stable minimum and share leftover space. */",
        ].join("\n")
      : preset === "holy"
        ? [
            ".layout {",
            "  display: grid;",
            `  gap: ${gap}px;`,
            "  grid-template-columns: 200px 1fr;",
            '  grid-template-areas:',
            '    "header header"',
            '    "nav    main"',
            '    "footer footer";',
            "}",
            ".header { grid-area: header; }",
            ".nav    { grid-area: nav; }",
            ".main   { grid-area: main; }",
            ".footer { grid-area: footer; }",
          ].join("\n")
        : preset === "sidebar"
          ? [
              ".layout {",
              "  display: grid;",
              `  gap: ${gap}px;`,
              "  grid-template-columns: minmax(180px, 240px) 1fr;",
              "}",
              "",
              "/* minmax() bounds the sidebar; 1fr gives the",
              "   content column every leftover pixel. */",
            ].join("\n")
          : [
              ".grid {",
              "  display: grid;",
              "  grid-template-columns: repeat(4, 1fr);",
              `  gap: ${gap}px;`,
              "}",
              "",
              "/* fr = one share of leftover space — four equal",
              "   columns that stay equal at any width. */",
            ].join("\n");

  const cell = (i: number, extra?: React.CSSProperties) => (
    <div
      key={i}
      className="flex items-center justify-center font-mono text-[0.72rem] rounded-[var(--r-sm)] border transition-all"
      style={{
        background: "color-mix(in srgb, var(--brand) 16%, transparent)",
        borderColor: "color-mix(in srgb, var(--brand) 45%, transparent)",
        color: "var(--brand-ink)",
        minHeight: 46,
        ...extra,
      }}
    >
      {i + 1}
    </div>
  );

  const select = (value: string, set: (v: string) => void, options: string[], aria: string) => (
    <select className="input" style={{ width: "auto", fontSize: "0.8rem", padding: "0.35rem 0.6rem" }} value={value} onChange={(e) => set(e.target.value)} aria-label={aria}>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — layout playground</span>
        <div className="ml-auto flex items-center gap-1.5" role="group" aria-label="Layout mode">
          {(["flex", "grid"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="chip"
              style={{ cursor: "pointer", borderColor: mode === m ? "var(--brand)" : undefined, color: mode === m ? "var(--brand-ink)" : undefined }}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "flex" ? "flexbox" : "grid"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* controls */}
        <div className="flex flex-col gap-3">
          {mode === "flex" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className={label} style={{ color: "var(--muted)", width: 92 }}>direction</span>
                {select(direction, setDirection, ["row", "row-reverse", "column", "column-reverse"], "flex-direction")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={label} style={{ color: "var(--muted)", width: 92 }}>justify</span>
                {select(justify, setJustify, FLEX_JUSTIFY, "justify-content")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={label} style={{ color: "var(--muted)", width: 92 }}>align</span>
                {select(align, setAlign, FLEX_ALIGN, "align-items")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={label} style={{ color: "var(--muted)", width: 92 }}>wrap</span>
                <button type="button" className="chip" style={{ cursor: "pointer", borderColor: wrap ? "var(--brand)" : undefined }} aria-pressed={wrap} onClick={() => setWrap((w) => !w)}>
                  {wrap ? "wrap" : "nowrap"}
                </button>
                <span className={label} style={{ color: "var(--muted)", width: 60 }}>items</span>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => setItems((n) => Math.max(2, n - 1))} aria-label="Fewer items">−</button>
                <span className="font-mono text-[0.8rem] w-4 text-center">{items}</span>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => setItems((n) => Math.min(9, n + 1))} aria-label="More items">+</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className={label} style={{ color: "var(--muted)", width: 92 }}>preset</span>
                {select(
                  preset,
                  (v) => setPreset(v as GridPreset),
                  ["cards", "holy", "sidebar", "even"],
                  "grid preset",
                )}
              </div>
              {preset === "cards" && (
                <div className="flex items-center gap-3">
                  <span className={label} style={{ color: "var(--muted)", width: 92 }}>min track</span>
                  <input type="range" min={120} max={300} step={10} value={minCard} onChange={(e) => setMinCard(Number(e.target.value))} style={{ accentColor: "var(--brand)", flex: 1 }} aria-label="Minimum card width in pixels" />
                  <span className="w-14 text-right font-mono text-[0.72rem]">{minCard}px</span>
                </div>
              )}
              <p className="text-[0.76rem] leading-relaxed" style={{ color: "var(--muted)" }}>
                Resize your browser window while watching the <strong style={{ color: "var(--ink-2)" }}>cards</strong> preset —
                tracks appear and disappear with no media query. That one line is 80% of responsive layout.
              </p>
            </>
          )}
          <div className="flex items-center gap-3">
            <span className={label} style={{ color: "var(--muted)", width: 92 }}>gap</span>
            <input type="range" min={0} max={32} value={gap} onChange={(e) => setGap(Number(e.target.value))} style={{ accentColor: "var(--brand)", flex: 1 }} aria-label="Gap in pixels" />
            <span className="w-12 text-right font-mono text-[0.72rem]">{gap}px</span>
          </div>
          <div
            className="rounded-[var(--r-sm)] border p-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre overflow-x-auto"
            style={{ background: "var(--code-bg)", color: "var(--code-ink)", borderColor: "var(--line)" }}
          >
            {mode === "flex" ? flexCss : gridCss}
          </div>
        </div>

        {/* stage */}
        <div
          className="rounded-[var(--r)] border p-3 min-h-[280px] transition-all"
          style={{ background: "var(--surface-2)", borderColor: "var(--line-2)" }}
          aria-label="Layout preview"
        >
          {mode === "flex" ? (
            <div
              className="h-full"
              style={{ display: "flex", flexDirection: direction as React.CSSProperties["flexDirection"], justifyContent: justify as React.CSSProperties["justifyContent"], alignItems: align as React.CSSProperties["alignItems"], flexWrap: wrap ? "wrap" : "nowrap", gap, minHeight: 256 }}
            >
              {Array.from({ length: items }, (_, i) => cell(i, { minWidth: 64, flex: "0 1 auto", padding: "0.9rem 1.1rem" }))}
            </div>
          ) : preset === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minCard}px, 1fr))`, gap }}>
              {Array.from({ length: 7 }, (_, i) => cell(i, { minHeight: 72 }))}
            </div>
          ) : preset === "holy" ? (
            <div style={{ display: "grid", gap, gridTemplateColumns: "170px 1fr", gridTemplateAreas: '"header header" "nav main" "footer footer"', minHeight: 256 }}>
              {[
                ["header", "header"],
                ["nav", "nav"],
                ["main", "main · 1fr"],
                ["footer", "footer"],
              ].map(([area, txt]) => (
                <div
                  key={area}
                  className="flex items-center justify-center font-mono text-[0.7rem] rounded-[var(--r-sm)] border"
                  style={{ gridArea: area, background: area === "main" ? "color-mix(in srgb, var(--brand) 20%, transparent)" : "color-mix(in srgb, var(--sky) 14%, transparent)", borderColor: area === "main" ? "var(--brand)" : "var(--line-2)", color: "var(--ink-2)", minHeight: area === "main" ? 140 : 40 }}
                >
                  {txt}
                </div>
              ))}
            </div>
          ) : preset === "sidebar" ? (
            <div style={{ display: "grid", gap, gridTemplateColumns: "minmax(150px, 200px) 1fr", minHeight: 256 }}>
              {cell(0, { minHeight: 220 })}
              {cell(1, { minHeight: 220 })}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap }}>
              {Array.from({ length: 8 }, (_, i) => cell(i, { minHeight: 64 }))}
            </div>
          )}
        </div>
      </div>
      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        The code panel is the exact CSS driving the preview — copy it. Notice what is missing: not a single
        media query. <code>gap</code>, <code>fr</code>, and <code>auto-fill</code> do the responsive work.
      </p>
    </div>
  );
}

/* ================= Token Lab ================= */

function relLuminance(hex: string): number {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex: string, against: 0 | 1): number {
  const l1 = relLuminance(hex);
  const [hi, lo] = against === 1 ? [Math.max(l1, 1), Math.min(l1, 1)] : [Math.max(l1, 0), Math.min(l1, 0)];
  return (hi + 0.05) / (lo + 0.05);
}

export function TokenLab() {
  const [brand, setBrand] = useState("#3ddc97");
  const [radius, setRadius] = useState(10);
  const [density, setDensity] = useState<"compact" | "regular">("regular");

  const vsWhite = contrastRatio(brand, 1);
  const vsBlack = contrastRatio(brand, 0);
  const ink = vsBlack >= vsWhite ? "#0b1310" : "#f4faf6";
  const ratio = Math.max(vsBlack, vsWhite);
  const ratioLabel = ratio.toFixed(1);
  const pad = density === "compact" ? "0.45rem 0.85rem" : "0.65rem 1.15rem";

  const scope = {
    "--brand": brand,
    "--brand-ink": brand,
    "--brand-soft": `color-mix(in srgb, ${brand} 14%, transparent)`,
    "--brand-contrast": ink,
    "--r": `${radius}px`,
    "--r-sm": `${Math.max(3, radius - 4)}px`,
    "--pad": pad,
  } as React.CSSProperties;

  const generated = [
    "/* one remap re-skins every consumer */",
    ":root {",
    `  --brand: ${brand};`,
    `  --brand-contrast: ${ink};  /* auto-picked for ${ratioLabel}:1 contrast */`,
    `  --r: ${radius}px;`,
    `  --pad: ${pad};`,
    "}",
  ].join("\n");

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — token remapping</span>
        <span className={`${label} ml-auto`} style={{ color: "var(--muted)" }}>
          contrast {ratioLabel}:1 {ratio >= 4.5 ? "✓ AA" : ratio >= 3 ? "AA-large only" : "✗ too low"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-[0.85rem]" style={{ color: "var(--ink-2)" }}>
            <span className="w-20 font-mono text-[0.72rem]" style={{ color: "var(--brand-ink)" }}>--brand</span>
            <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand color" style={{ width: 52, height: 32, border: "1px solid var(--line-2)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
            <code>{brand}</code>
          </label>
          <label className="flex items-center gap-3 text-[0.85rem]" style={{ color: "var(--ink-2)" }}>
            <span className="w-20 font-mono text-[0.72rem]" style={{ color: "var(--brand-ink)" }}>--r</span>
            <input type="range" min={0} max={20} value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ accentColor: "var(--brand)", flex: 1 }} aria-label="Corner radius in pixels" />
            <span className="w-12 text-right font-mono text-[0.72rem]">{radius}px</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="w-20 font-mono text-[0.72rem]" style={{ color: "var(--brand-ink)" }}>density</span>
            {(["compact", "regular"] as const).map((d) => (
              <button key={d} type="button" className="chip" style={{ cursor: "pointer", borderColor: density === d ? "var(--brand)" : undefined }} aria-pressed={density === d} onClick={() => setDensity(d)}>
                {d}
              </button>
            ))}
          </div>
          <div
            className="rounded-[var(--r-sm)] border p-3 font-mono text-[0.74rem] leading-relaxed whitespace-pre overflow-x-auto"
            style={{ background: "var(--code-bg)", color: "var(--code-ink)", borderColor: "var(--line)" }}
          >
            {generated}
          </div>
          <p className="text-[0.78rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            The preview overrides <em>only</em> these variables on a wrapper — every component inside inherits the new
            values through the cascade. That is the entire mechanism behind this site's dark/light toggle: same
            components, different mapping.
          </p>
        </div>

        {/* scoped preview — custom properties inherit, so overrides apply */}
        <div className="rounded-[var(--r)] border p-4 flex flex-col gap-3" style={{ background: "var(--surface-2)", borderColor: "var(--line-2)", ...scope }} aria-label="Themed preview">
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" style={{ padding: "var(--pad)" }}>Primary action</button>
            <button type="button" className="btn btn-ghost" style={{ padding: "var(--pad)" }}>Ghost</button>
          </div>
          <div className="panel p-4" style={{ borderRadius: "var(--r)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-semibold text-[0.92rem]">Deployment #214</span>
              <span className="chip" style={{ color: "var(--brand-ink)", borderColor: "var(--brand)" }}>live</span>
            </div>
            <div className="meter"><span style={{ width: "72%" }} /></div>
            <p className="text-[0.78rem] mt-2" style={{ color: "var(--muted)" }}>18 of 25 checks passing</p>
          </div>
          <div className="callout callout-success" style={{ borderRadius: "var(--r)" }}>
            <span className="co-icon"><Check size={15} style={{ color: "var(--brand)" }} /></span>
            <div>
              <div className="callout-title">Migration applied</div>
              <p className="text-[0.8rem]" style={{ color: "var(--ink-2)" }}>Prisma 7.9.15 · 3 tables · 0 drift</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Closure lab ================= */

export function ClosureLab() {
  const [counters, setCounters] = useState<{ id: number; count: number }[]>([
    { id: 1, count: 0 },
    { id: 2, count: 0 },
  ]);
  const [query, setQuery] = useState("");
  const [ms, setMs] = useState(400);
  const [rawEvents, setRawEvents] = useState(0);
  const [fired, setFired] = useState<{ id: number; text: string }[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(3);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spawn = () =>
    setCounters((prev) => {
      if (prev.length >= 4) return prev;
      const id = nextId.current;
      nextId.current += 1;
      return [...prev, { id, count: 0 }];
    });

  const bump = (id: number) =>
    setCounters((prev) => prev.map((c) => (c.id === id ? { ...c, count: c.count + 1 } : c)));

  const remove = (id: number) => setCounters((prev) => prev.filter((c) => c.id !== id));

  const onType = (value: string) => {
    setQuery(value);
    setRawEvents((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setFired((prev) => [...prev, { id: Date.now(), text: value || "(empty)" }].slice(-4));
    }, ms);
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — backpacks & debounce</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* counter factory */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className={label} style={{ color: "var(--muted)" }}>makeCounter() — one backpack each</span>
            <button type="button" className="btn btn-soft btn-sm" onClick={spawn}>
              <Play size={12} /> Spawn counter
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {counters.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-[var(--r-sm)] border px-3.5 py-2.5 transition-colors"
                style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
              >
                <span className="font-mono text-[0.66rem]" style={{ color: "var(--muted)" }}>
                  counter #{c.id}
                </span>
                <span className="font-display font-bold text-xl tabular-nums" style={{ color: "var(--brand-ink)" }}>
                  {c.count}
                </span>
                <div className="ml-auto flex gap-1.5">
                  <button type="button" className="btn btn-primary btn-sm" style={{ padding: "0.25rem 0.7rem" }} onClick={() => bump(c.id)}>
                    +1
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft btn-sm"
                    style={{ padding: "0.25rem 0.55rem" }}
                    onClick={() => remove(c.id)}
                    aria-label={`Remove counter ${c.id}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {counters.length === 0 && (
              <p className="text-[0.8rem] font-mono px-1" style={{ color: "var(--muted)" }}>
                all backpacks unpacked — spawn a new counter
              </p>
            )}
          </div>
          <p className="text-[0.78rem] mt-2.5 leading-relaxed" style={{ color: "var(--muted)" }}>
            Increment one counter — its siblings never change. Each factory run packed a separate <code>n</code> into a
            separate backpack; there is no shared global anywhere.
          </p>
        </div>

        {/* debounce tester */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className={label} style={{ color: "var(--muted)" }}>debounce(search, {ms}ms)</span>
            <span className="font-mono text-[0.7rem]" style={{ color: "var(--ink-2)" }}>
              <span style={{ color: "var(--amber-ink)" }}>{rawEvents}</span> events →{" "}
              <span style={{ color: "var(--brand-ink)" }}>{fired.length}</span> fired
            </span>
          </div>
          <input
            className="input"
            placeholder="Type fast, then stop…"
            value={query}
            onChange={(e) => onType(e.target.value)}
            aria-label="Debounce demo input"
          />
          <label className="flex items-center gap-3 mt-3 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
            <span className="w-14 font-mono text-[0.7rem]" style={{ color: "var(--muted)" }}>delay</span>
            <input
              type="range"
              min={100}
              max={1200}
              step={50}
              value={ms}
              onChange={(e) => setMs(Number(e.target.value))}
              style={{ accentColor: "var(--brand)", flex: 1 }}
              aria-label="Debounce delay in milliseconds"
            />
            <span className="w-16 text-right font-mono text-[0.72rem]">{ms}ms</span>
          </label>
          <div
            className="mt-3 rounded-[var(--r-sm)] border p-3 font-mono text-[0.74rem] leading-relaxed min-h-[92px]"
            style={{ background: "var(--code-bg)", color: "var(--code-ink)", borderColor: "var(--line)" }}
            role="log"
            aria-label="Debounced calls log"
          >
            {fired.length === 0 ? (
              <span style={{ color: "var(--syn-com)" }}>// calls land here after {ms}ms of silence…</span>
            ) : (
              fired.map((f) => (
                <div key={f.id} className="fade-in">
                  <span style={{ color: "var(--syn-kw)" }}>search:</span> "{f.text}"
                </div>
              ))
            )}
          </div>
          <p className="text-[0.78rem] mt-2.5 leading-relaxed" style={{ color: "var(--muted)" }}>
            Every keystroke is an event, but the closure's <code>clearTimeout</code> kills the pending call — only a
            full pause fires. That gap between {rawEvents} and {fired.length} is saved server load.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= Immutability Lab ================= */

type Todo = { id: number; title: string; done: boolean };

const STARTER: Todo[] = [
  { id: 1, title: "Read the lesson", done: true },
  { id: 2, title: "Run the lab", done: false },
  { id: 3, title: "Pass the quiz", done: false },
];

export function ImmutabilityLab() {
  // `list` plays the role of "the array in state"; the snapshot ref plays
  // "the previous render's reference" — exactly what React compares.
  const [list, setList] = useState<Todo[]>(STARTER);
  const snapshotRef = useRef<Todo[]>(STARTER);
  const [verdict, setVerdict] = useState<{ kind: "mutate" | "immutable" | "reset"; text: string }>({
    kind: "reset",
    text: "Run one action from each column and watch the snapshot panel — that is change detection.",
  });
  const [flash, setFlash] = useState(0);

  const announce = (kind: "mutate" | "immutable", text: string) => {
    setVerdict({ kind, text });
    setFlash((f) => f + 1);
  };

  const mutatedHere = snapshotRef.current !== list || JSON.stringify(snapshotRef.current) !== JSON.stringify(STARTER);

  /* ---- the mutating side (operates on the SAME array + objects) ---- */
  const mutatePush = () => {
    const same = [...list]; // keep the demo controllable: mutate the live copy
    same.push({ id: same.length + 1, title: "Pushed in place", done: false });
    setList(same);
    // simulate the classic bug: the 'snapshot' alias saw it too
    snapshotRef.current = same;
    announce(
      "mutate",
      "push() grew the SAME array — every name pointing at it (the snapshot included) sees the change. React's === comparison sees nothing new to render.",
    );
  };

  const mutateToggle = () => {
    const next = list.map((t) => t); // copies the array…
    const target = next.find((t) => t.id === 2);
    if (target) target.done = !target.done; // …but flips the SAME inner object
    setList(next);
    snapshotRef.current = next;
    announce(
      "mutate",
      "The array is new, but the item objects are shared — flipping item 2 in place still rewrites the 'old' data. Shallow copies hide this; nested mutation leaks.",
    );
  };

  /* ---- the immutable side (new array, new objects where touched) ---- */
  const immutableAdd = () => {
    setList((prev) => {
      const next = [...prev, { id: prev.length + 1, title: "Appended as a copy", done: false }];
      snapshotRef.current = prev; // previous reference preserved, untouched
      return next;
    });
    announce(
      "immutable",
      "A NEW array was born: the previous reference stays byte-identical, and list === snapshot is false — the exact signal React, TanStack Query, and memoization rely on.",
    );
  };

  const immutableToggle = () => {
    setList((prev) => {
      const next = prev.map((t) => (t.id === 2 ? { ...t, done: !t.done } : t));
      snapshotRef.current = prev;
      return next;
    });
    announce(
      "immutable",
      "map rebuilt the array and spread rebuilt ONLY item 2 — untouched items keep their identities. That's structural sharing: cheap, and precisely diffable.",
    );
  };

  const reset = () => {
    setList(STARTER);
    snapshotRef.current = STARTER;
    setVerdict({ kind: "reset", text: "Reset. Run one action from each column and watch the snapshot panel." });
  };

  const actionBtn = (labelStr: string, onClick: () => void, danger: boolean) => (
    <button
      type="button"
      className="btn btn-sm w-full justify-center"
      style={{
        background: danger ? "var(--rose-soft)" : "var(--brand-soft)",
        color: danger ? "var(--rose-ink)" : "var(--brand-ink)",
        borderColor: danger ? "color-mix(in srgb, var(--rose) 40%, transparent)" : "color-mix(in srgb, var(--brand) 40%, transparent)",
        border: "1px solid",
      }}
      onClick={onClick}
    >
      {labelStr}
    </button>
  );

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — mutate vs copy</span>
        <button type="button" className="btn btn-soft btn-sm ml-auto" onClick={reset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* mutating column */}
        <div className="rounded-[var(--r)] border p-3 flex flex-col gap-2" style={{ borderColor: "color-mix(in srgb, var(--rose) 35%, var(--line))", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--rose-ink)" }}>the mutating way</div>
          {actionBtn("todos.push(…)", mutatePush, true)}
          {actionBtn("todos[1].done = !done", mutateToggle, true)}
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            Writes through the existing reference. Every alias shares the fate — and change detection sees "same thing".
          </p>
        </div>

        {/* list display */}
        <div className="rounded-[var(--r)] border p-3" style={{ borderColor: "var(--line-2)", background: "var(--surface)" }}>
          <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>the list (live)</div>
          <ul className="flex flex-col gap-1.5">
            {list.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 text-[0.82rem] font-mono rounded-[var(--r-sm)] border px-2.5 py-1.5 transition-all"
                style={{
                  borderColor: "var(--line)",
                  background: t.done ? "color-mix(in srgb, var(--brand) 10%, transparent)" : "var(--surface-2)",
                  color: t.done ? "var(--brand-ink)" : "var(--ink-2)",
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                <span aria-hidden="true">{t.done ? "✓" : "○"}</span> {t.title}
              </li>
            ))}
          </ul>
        </div>

        {/* immutable column */}
        <div className="rounded-[var(--r)] border p-3 flex flex-col gap-2" style={{ borderColor: "color-mix(in srgb, var(--brand) 45%, var(--line))", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--brand-ink)" }}>the immutable way</div>
          {actionBtn("[...todos, item]", immutableAdd, false)}
          {actionBtn("todos.map(…spread)", immutableToggle, false)}
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            New array, new objects only where touched. The old reference survives intact for comparison.
          </p>
        </div>
      </div>

      {/* snapshot + verdict */}
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div className="rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--code-bg)" }}>
          <div className={`${label} mb-1.5`} style={{ color: "var(--muted)" }}>snapshot (previous reference)</div>
          <div className="font-mono text-[0.74rem] leading-relaxed" style={{ color: "var(--code-ink)" }}>
            {JSON.stringify(snapshotRef.current)}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="font-mono text-[0.64rem] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: mutatedHere ? "color-mix(in srgb, var(--rose) 50%, transparent)" : "var(--line-2)",
                color: mutatedHere ? "var(--rose-ink)" : "var(--muted)",
              }}
            >
              {mutatedHere ? "snapshot contents changed" : "snapshot contents pristine"}
            </span>
            <span
              className="font-mono text-[0.64rem] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: snapshotRef.current === list ? "color-mix(in srgb, var(--rose) 50%, transparent)" : "color-mix(in srgb, var(--brand) 50%, transparent)",
                color: snapshotRef.current === list ? "var(--rose-ink)" : "var(--brand-ink)",
              }}
            >
              list === snapshot : {String(snapshotRef.current === list)}
            </span>
          </div>
        </div>
        <div
          key={flash}
          className="fade-in rounded-[var(--r-sm)] border p-3 flex items-start gap-2.5"
          style={{
            borderColor: verdict.kind === "mutate" ? "color-mix(in srgb, var(--rose) 45%, var(--line))" : "color-mix(in srgb, var(--brand) 45%, var(--line))",
            background: verdict.kind === "mutate" ? "var(--rose-soft)" : "var(--brand-soft)",
          }}
          role="status"
        >
          <Zap size={15} className="mt-0.5 shrink-0" style={{ color: verdict.kind === "mutate" ? "var(--rose)" : "var(--brand)" }} />
          <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>{verdict.text}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= Event Loop Lab ================= */

type LoopKind = "sync" | "micro" | "macro";
type LoopItem = { id: number; kind: LoopKind; label: string; long?: boolean };

const LOOP_LABELS: Record<LoopKind, string> = {
  sync: "console.log('sync')",
  micro: "queueMicrotask(…)",
  macro: "setTimeout(…, 0)",
};

const KIND_META: Record<LoopKind, { name: string; lane: string; color: string }> = {
  sync: { name: "sync", lane: "Call stack", color: "var(--brand)" },
  micro: { name: "microtask", lane: "Microtask queue", color: "var(--sky)" },
  macro: { name: "macrotask", lane: "Macrotask queue", color: "var(--amber)" },
};

export function EventLoopLab() {
  const [items, setItems] = useState<LoopItem[]>([
    { id: 1, kind: "sync", label: "console.log('A')   // sync code" },
    { id: 2, kind: "micro", label: "Promise.resolve().then(B)" },
    { id: 3, kind: "macro", label: "setTimeout(C, 0)" },
  ]);
  const [running, setRunning] = useState(false);
  const [doneIds, setDoneIds] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [output, setOutput] = useState<LoopItem[]>([]);
  const nextId = useRef(4);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // the rule, made data: sync first → all microtasks → macrotasks one by one
  const order = useMemo(() => {
    const syncs = items.filter((i) => i.kind === "sync");
    const micros = items.filter((i) => i.kind === "micro");
    const macros = items.filter((i) => i.kind === "macro");
    return [...syncs, ...micros, ...macros];
  }, [items]);

  const add = (kind: LoopKind, long = false) =>
    setItems((prev) => {
      if (prev.length >= 8) return prev;
      const id = nextId.current;
      nextId.current += 1;
      return [
        ...prev,
        { id, kind, long, label: long ? "runHeavySync()   // blocks ~2s" : LOOP_LABELS[kind] },
      ];
    });

  const reset = () => {
    window.clearTimeout(timer.current);
    setRunning(false);
    setDoneIds([]);
    setCurrentId(null);
    setOutput([]);
  };

  const run = () => {
    if (running || order.length === 0) return;
    window.clearTimeout(timer.current);
    setDoneIds([]);
    setCurrentId(null);
    setOutput([]);
    setRunning(true);
    let i = 0;
    const step = () => {
      if (i >= order.length) {
        setRunning(false);
        setCurrentId(null);
        return;
      }
      const item = order[i];
      i += 1;
      setCurrentId(item.id);
      setOutput((o) => [...o, item]);
      setDoneIds((d) => [...d, item.id]);
      timer.current = window.setTimeout(step, item.long ? 2000 : 640);
    };
    timer.current = window.setTimeout(step, 380);
  };

  const blocking = order.some((i) => i.id === currentId && i.long);

  const chip = (item: LoopItem) => {
    const meta = KIND_META[item.kind];
    const isCurrent = item.id === currentId;
    const isDone = doneIds.includes(item.id) && !isCurrent;
    return (
      <div
        key={item.id}
        className={`font-mono text-[0.7rem] px-2.5 py-1.5 rounded-[var(--r-sm)] border transition-all ${isCurrent ? "pulse-soft" : ""}`}
        style={{
          borderColor: isCurrent ? meta.color : "var(--line)",
          background: isDone ? "var(--surface-2)" : "var(--surface)",
          color: isDone ? "var(--muted)" : "var(--ink-2)",
          opacity: isDone ? 0.6 : 1,
          boxShadow: isCurrent ? `0 0 0 1px ${meta.color}` : "none",
        }}
      >
        {isDone ? "✓ " : ""}{item.label}
      </div>
    );
  };

  const lane = (kind: LoopKind) => (
    <div className="rounded-[var(--r)] border p-3 flex flex-col gap-1.5" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
      <div className={label} style={{ color: KIND_META[kind].color }}>{KIND_META[kind].lane}</div>
      {items.filter((i) => i.kind === kind).map(chip)}
      {items.filter((i) => i.kind === kind).length === 0 && (
        <div className="text-[0.7rem] font-mono" style={{ color: "var(--muted)" }}>— empty —</div>
      )}
    </div>
  );

  const addBtn = (text: string, onClick: () => void) => (
    <button
      type="button"
      className="btn btn-soft btn-sm"
      disabled={running || items.length >= 8}
      onClick={onClick}
      style={{ opacity: running ? 0.5 : 1 }}
    >
      + {text}
    </button>
  );

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the event loop</span>
        <span className="chip ml-auto hidden sm:inline-flex">sync → microtasks → macrotasks</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {addBtn("sync log", () => add("sync"))}
        {addBtn("microtask (promise)", () => add("micro"))}
        {addBtn("timer (setTimeout 0)", () => add("macro"))}
        {addBtn("heavy sync (~2s)", () => add("sync", true))}
        <button type="button" className="btn btn-primary btn-sm" disabled={running || items.length === 0} onClick={run} style={{ opacity: running ? 0.6 : 1 }}>
          <Play size={13} /> {running ? "Running…" : "Run the loop"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {lane("sync")}
        {lane("micro")}
        {lane("macro")}
      </div>

      {blocking && (
        <div className="fade-in mt-3 rounded-[var(--r-sm)] border px-3 py-2 flex items-center gap-2 text-[0.8rem]" style={{ borderColor: "color-mix(in srgb, var(--rose) 50%, transparent)", background: "var(--rose-soft)", color: "var(--rose-ink)" }} role="status">
          <Zap size={14} /> Main thread blocked — inputs, timers and paint are ALL waiting. Microtasks still go before timers afterwards.
        </div>
      )}

      <div className="mt-4 rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--code-bg)" }} aria-live="polite">
        <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>console — actual execution order</div>
        {output.length === 0 && !running && (
          <div className="font-mono text-[0.74rem]" style={{ color: "var(--syn-com)" }}>// press "Run the loop" — then try adding a heavy sync task and run again</div>
        )}
        {output.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="fade-in font-mono text-[0.74rem] flex items-center gap-2 py-0.5" style={{ color: "var(--code-ink)" }}>
            <span style={{ color: "var(--muted)" }}>{String(idx + 1).padStart(2, "0")}</span>
            <span
              className="text-[0.6rem] uppercase tracking-widest px-1.5 py-px rounded-full border"
              style={{ borderColor: KIND_META[item.kind].color, color: KIND_META[item.kind].color }}
            >
              {KIND_META[item.kind].name}
            </span>
            <span style={{ opacity: item.id === currentId ? 1 : 0.75 }}>{item.label}</span>
            {item.long && <span style={{ color: "var(--rose-ink)" }}>· blocked the thread</span>}
          </div>
        ))}
      </div>

      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        The loop's law: run a stack task → drain <strong style={{ color: "var(--sky-ink)" }}>every</strong> microtask →
        take <strong style={{ color: "var(--amber-ink)" }}>one</strong> macrotask → the browser may paint → repeat.
        <code> setTimeout(…, 0)</code> is a floor (≥ ~4ms, after microtasks), never a promise of "immediately".
      </p>
    </div>
  );
}

/* ================= Error Boundary Lab ================= */

type LogTag = "CAUGHT" | "UNCAUGHT" | "SUSPENSE" | "OK";
type LogEntry = { id: number; tag: LogTag; msg: string; at: string };

const TAG_COLOR: Record<LogTag, string> = {
  CAUGHT: "var(--rose)",
  UNCAUGHT: "var(--amber)",
  SUSPENSE: "var(--sky)",
  OK: "var(--brand)",
};

class LabBoundary extends Component<
  { children: ReactNode; onCatch: (message: string) => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onCatch(error.message);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="fade-in rounded-[var(--r-sm)] border p-3"
          style={{ borderColor: "var(--rose)", background: "var(--rose-soft)" }}
          role="alert"
        >
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: "var(--rose-ink)" }}>
            ⚠ fallback rendered — fire sealed
          </div>
          <p className="text-[0.78rem] mt-1 leading-snug" style={{ color: "var(--ink-2)" }}>
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function BombApp({ armed, onEventBoom }: { armed: boolean; onEventBoom: () => void }) {
  const [count, setCount] = useState(0);
  if (armed) throw new Error("render bomb detonated mid-render");
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[0.74rem]" style={{ color: "var(--ink-2)" }}>
        inner counter: <strong style={{ color: "var(--brand-ink)" }}>{count}</strong>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setCount((c) => c + 1)}>
          tick (render-safe)
        </button>
        <button
          type="button"
          className="btn btn-sm"
          style={{ background: "var(--amber-soft)", color: "var(--amber-ink)", border: "1px solid color-mix(in srgb, var(--amber) 40%, transparent)" }}
          onClick={() => {
            onEventBoom();
            throw new Error("event handler exploded (check the console)");
          }}
        >
          throw in onClick
        </button>
      </div>
    </div>
  );
}

function createDeferred(ms: number) {
  let done = false;
  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      done = true;
      resolve();
    }, ms);
  });
  return {
    promise,
    read(): void {
      if (!done) throw promise; // the raw Suspense protocol: throw the cached promise
    },
  };
}

type Deferred = ReturnType<typeof createDeferred>;

function LazyChart({ deferred }: { deferred: Deferred }) {
  deferred.read(); // suspends until the promise settles
  return (
    <div className="flex items-end gap-1 h-[52px]">
      {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-[3px]"
          style={{ height: `${h}%`, background: "color-mix(in srgb, var(--brand) 55%, transparent)" }}
        />
      ))}
    </div>
  );
}

export function ErrorLab() {
  const [armed, setArmed] = useState(false);
  const [bombKey, setBombKey] = useState(0);
  const [deferred, setDeferred] = useState<Deferred | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  const sealed = armed; // bomb armed ⇒ boundary has caught it

  const push = (tag: LogTag, msg: string) => {
    logId.current += 1;
    const entry: LogEntry = {
      id: logId.current,
      tag,
      msg,
      at: new Date().toLocaleTimeString([], { hour12: false }),
    };
    setLog((prev) => [...prev.slice(-5), entry]);
  };

  const reset = () => {
    setBombKey((k) => k + 1);
    setArmed(false);
    push("OK", "boundary reset — subtree remounted fresh (state wiped)");
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — bulkheads & curtains</span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.18em]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${sealed ? "pulse-soft" : ""}`}
            style={{ background: sealed ? "var(--rose)" : "var(--brand)", boxShadow: `0 0 8px ${sealed ? "var(--rose)" : "var(--brand)"}` }}
            aria-hidden="true"
          />
          <span style={{ color: sealed ? "var(--rose-ink)" : "var(--brand-ink)" }}>
            {sealed ? "sealed" : "healthy"}
          </span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* station 1 + 2 share ONE boundary — the contrast is the lesson */}
        <div className="md:col-span-2 rounded-[var(--r)] border p-3.5 flex flex-col gap-3" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
          <div className="flex items-center justify-between">
            <div className={label} style={{ color: "var(--muted)" }}>one boundary, two kinds of fire</div>
            <button type="button" className="btn btn-soft btn-sm" onClick={reset}>
              <RotateCcw size={12} /> reset
            </button>
          </div>
          <LabBoundary key={bombKey} onCatch={(m) => push("CAUGHT", `render-phase error sealed → ${m}`)}>
            <BombApp
              armed={armed}
              onEventBoom={() => push("UNCAUGHT", "onClick threw — boundary silent; app keeps running (console)")}
            />
            <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2" style={{ borderColor: "var(--line)" }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--rose-soft)", color: "var(--rose-ink)", border: "1px solid color-mix(in srgb, var(--rose) 40%, transparent)" }}
                onClick={() => {
                  setArmed(true);
                }}
              >
                <Zap size={12} /> arm render bomb
              </button>
              <span className="text-[0.72rem]" style={{ color: "var(--muted)" }}>
                the next render throws → watch the boundary seal it
              </span>
            </div>
          </LabBoundary>
        </div>

        {/* station 3: the suspense curtain */}
        <div className="rounded-[var(--r)] border p-3.5 flex flex-col gap-3" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--muted)" }}>the suspense curtain (1.5s)</div>
          {deferred ? (
            <Suspense
              fallback={
                <div className="flex flex-col gap-1.5" aria-label="Loading chart skeleton">
                  <div className="skel h-[52px]" />
                  <div className="skel h-[10px] w-2/3" />
                </div>
              }
            >
              <LazyChart deferred={deferred} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-[52px] rounded-[var(--r-sm)] border border-dashed text-[0.72rem] font-mono" style={{ borderColor: "var(--line-2)", color: "var(--muted)" }}>
              chart not loaded
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const d = createDeferred(1500);
                setDeferred(d);
                push("SUSPENSE", "curtain up — cached promise thrown; skeleton paints");
                void d.promise.then(() => push("SUSPENSE", "promise settled — real content replaces the curtain"));
              }}
            >
              <Play size={12} /> load chart
            </button>
            {deferred && (
              <button
                type="button"
                className="btn btn-soft btn-sm"
                onClick={() => {
                  setDeferred(null);
                  push("OK", "curtain removed — back to idle");
                }}
              >
                unload
              </button>
            )}
          </div>
        </div>
      </div>

      {/* incident log */}
      <div className="mt-4 rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--code-bg)" }}>
        <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>incident log — your stand-in for Sentry</div>
        {log.length === 0 ? (
          <div className="font-mono text-[0.72rem]" style={{ color: "var(--syn-com)" }}>
            // break things above — every event lands here
          </div>
        ) : (
          <div className="flex flex-col gap-1" aria-live="polite">
            {log.map((e) => (
              <div key={e.id} className="fade-in font-mono text-[0.72rem] flex items-baseline gap-2" style={{ color: "var(--code-ink)" }}>
                <span style={{ color: "var(--syn-com)" }}>{e.at}</span>
                <span
                  className="text-[0.58rem] uppercase tracking-widest px-1.5 py-px rounded-full border shrink-0"
                  style={{ borderColor: TAG_COLOR[e.tag], color: TAG_COLOR[e.tag] }}
                >
                  {e.tag}
                </span>
                <span style={{ opacity: 0.85 }}>{e.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Same boundary, two fires: the render bomb gets <strong style={{ color: "var(--rose-ink)" }}>sealed</strong> (fallback + reset);
        the onClick explosion gets <strong style={{ color: "var(--amber-ink)" }}>ignored</strong> — event handlers run outside the render
        phase, so they need try/catch, not bulkheads. And the chart shows the raw protocol: a cached promise thrown mid-render,
        caught by <code>&lt;Suspense&gt;</code>, retried when it settles.
      </p>
    </div>
  );
}

/* ================= Optimistic Lab ================= */

type OptTask = { id: number; title: string; done: boolean };
type OptStatus = "idle" | "saving" | "committed" | "reverted";

const STATUS_META: Record<OptStatus, { label: string; color: string }> = {
  idle: { label: "idle", color: "var(--muted)" },
  saving: { label: "saving…", color: "var(--sky)" },
  committed: { label: "committed", color: "var(--brand)" },
  reverted: { label: "reverted", color: "var(--rose)" },
};

export function OptimisticLab() {
  const [tasks, setTasks] = useState<OptTask[]>([
    { id: 1, title: "Ship the milestone", done: true },
    { id: 2, title: "Write the retro", done: false },
    { id: 3, title: "Book the demo slot", done: false },
  ]);
  const [statuses, setStatuses] = useState<Record<number, OptStatus>>({ 1: "idle", 2: "idle", 3: "idle" });
  const [latency, setLatency] = useState(700);
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);
  const [log, setLog] = useState<string[]>([]);

  const push = (msg: string) => setLog((prev) => [...prev.slice(-4), msg]);

  const toggle = async (id: number) => {
    const before = tasks.find((t) => t.id === id)?.done ?? false; // last committed truth
    // 1) intent → overlay paints instantly
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    setStatuses((s) => ({ ...s, [id]: "saving" }));
    push(`→ intent #${id}: overlay painted before the network moved`);
    const willFail = armedRef.current;
    if (willFail) {
      armedRef.current = false;
      setArmed(false);
    }
    // 2) the network gets its say
    await new Promise((r) => setTimeout(r, latency));
    if (willFail) {
      // 3b) rollback: back to committed truth, error surfaced
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: before } : t)));
      setStatuses((s) => ({ ...s, [id]: "reverted" }));
      push(`✗ server rejected #${id} — overlay reverted, toast shown`);
    } else {
      setStatuses((s) => ({ ...s, [id]: "committed" }));
      push(`✓ server confirmed #${id} — the overlay became the truth`);
    }
  };

  const arm = () => {
    armedRef.current = !armedRef.current;
    setArmed(armedRef.current);
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the optimistic round trip</span>
        <span className={`${label} ml-auto hidden sm:inline`} style={{ color: "var(--muted)" }}>
          intent → overlay → commit / rollback
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_260px] gap-4">
        <div className="flex flex-col gap-2">
          {tasks.map((t) => {
            const st = statuses[t.id] ?? "idle";
            const meta = STATUS_META[st];
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-[var(--r-sm)] border px-3.5 py-2.5 transition-all"
                style={{
                  borderColor: st === "reverted" ? "color-mix(in srgb, var(--rose) 45%, var(--line))" : "var(--line)",
                  background: "var(--surface-2)",
                  opacity: st === "saving" ? 0.85 : 1,
                }}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={t.done}
                  aria-label={`Toggle ${t.title}`}
                  onClick={() => toggle(t.id)}
                  className="relative shrink-0 w-10 h-[22px] rounded-full transition-colors"
                  style={{ background: t.done ? "var(--brand)" : "var(--surface-3)", border: "1px solid var(--line-2)" }}
                >
                  <span
                    className="absolute top-[2px] w-4 h-4 rounded-full transition-all"
                    style={{
                      left: t.done ? "calc(100% - 18px)" : "2px",
                      background: t.done ? "var(--brand-contrast)" : "var(--muted)",
                    }}
                  />
                </button>
                <span
                  className="flex-1 text-[0.86rem]"
                  style={{ color: t.done ? "var(--ink)" : "var(--ink-2)", textDecoration: t.done ? "none" : "none" }}
                >
                  {t.title}
                </span>
                <span
                  className={`font-mono text-[0.62rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border ${st === "saving" ? "pulse-soft" : ""}`}
                  style={{ borderColor: meta.color, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
            );
          })}
          <p className="text-[0.74rem] mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
            Toggle fast during <em>saving</em> and watch statuses overlap — real systems add request ids and idempotency
            keys for exactly this (Phase 29).
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
            <span className="w-16 font-mono text-[0.7rem]" style={{ color: "var(--sky-ink)" }}>latency</span>
            <input
              type="range"
              min={100}
              max={1600}
              step={50}
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              style={{ accentColor: "var(--sky)", flex: 1 }}
              aria-label="Simulated network latency in milliseconds"
            />
            <span className="w-14 text-right font-mono text-[0.7rem]">{latency}ms</span>
          </label>
          <button
            type="button"
            className="btn btn-sm"
            onClick={arm}
            aria-pressed={armed}
            style={{
              background: armed ? "var(--rose-soft)" : "var(--surface-2)",
              color: armed ? "var(--rose-ink)" : "var(--ink-2)",
              border: `1px solid ${armed ? "color-mix(in srgb, var(--rose) 50%, transparent)" : "var(--line-2)"}`,
            }}
          >
            <Zap size={13} /> {armed ? "Failure armed — next request will fail" : "Arm failure for next request"}
          </button>
          <div className="rounded-[var(--r-sm)] border p-3 flex-1" style={{ borderColor: "var(--line)", background: "var(--code-bg)" }}>
            <div className={`${label} mb-1.5`} style={{ color: "var(--muted)" }}>round-trip log</div>
            {log.length === 0 ? (
              <div className="font-mono text-[0.7rem]" style={{ color: "var(--syn-com)" }}>// flip a switch — then arm a failure</div>
            ) : (
              <div className="flex flex-col gap-1" aria-live="polite">
                {log.map((l, i) => (
                  <div key={`${i}-${l}`} className="fade-in font-mono text-[0.7rem] leading-snug" style={{ color: "var(--code-ink)", opacity: 0.9 }}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Perf Lab ================= */

const PERF_ROWS = 24000;

// Defined at MODULE level on purpose: a component defined inside the lab's
// render would get a fresh identity every render and memo() could never skip it.
function HeavyList({ seed, onSelect }: { seed: string; onSelect: (i: number) => void }) {
  const renders = useRef(0);
  renders.current += 1;
  const t0 = performance.now();
  let acc = 0;
  for (let i = 0; i < PERF_ROWS; i++) acc += Math.sqrt(i + seed.length); // simulated layout-ish work
  const cost = performance.now() - t0;
  return (
    <div className="rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.72rem]" style={{ color: "var(--ink-2)" }}>
          heavy list · <strong style={{ color: "var(--brand-ink)" }}>render #{renders.current}</strong>
        </span>
        <span className="font-mono text-[0.68rem] px-2 py-0.5 rounded-full border ml-auto" style={{ borderColor: "var(--line-2)", color: "var(--amber-ink)" }}>
          {cost.toFixed(2)}ms of work
        </span>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-1" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="h-2 rounded-full"
            style={{ background: `color-mix(in srgb, var(--brand) ${18 + ((i * 7 + acc) % 40)}%, transparent)` }}
          />
        ))}
      </div>
      <button type="button" className="btn btn-soft btn-sm mt-2.5" onClick={() => onSelect(1)}>
        select a row
      </button>
    </div>
  );
}

const MemoHeavyList = memo(HeavyList);

function LocalSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [local, setLocal] = useState("");
  return (
    <input
      className="input"
      placeholder="Search (state lives HERE — parent never re-renders)"
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        onSearch(e.target.value);
      }}
      aria-label="Search with locally-held state"
    />
  );
}

export function PerfLab() {
  const [query, setQuery] = useState("");
  const [wrapMemo, setWrapMemo] = useState(false);
  const [stableCb, setStableCb] = useState(false);
  const [splitState, setSplitState] = useState(false);
  const parentRenders = useRef(0);
  parentRenders.current += 1;

  const stableSelect = useCallback((_i: number) => {}, []);
  const inlineSelect = (_i: number) => {};
  const select = stableCb ? stableSelect : inlineSelect;
  const Child = wrapMemo ? MemoHeavyList : HeavyList;

  const chip = (on: boolean, text: string, set: (v: boolean) => void) => (
    <button
      type="button"
      className="chip"
      style={{
        cursor: "pointer",
        borderColor: on ? "var(--brand)" : undefined,
        color: on ? "var(--brand-ink)" : undefined,
        background: on ? "var(--brand-soft)" : undefined,
      }}
      aria-pressed={on}
      onClick={() => set(!on)}
    >
      {on ? "✓ " : ""}
      {text}
    </button>
  );

  const verdict = splitState
    ? "Cause treated: the input's state moved down, so typing never re-renders the parent — the heavy list doesn't even get the chance."
    : wrapMemo && stableCb
      ? "Child skipped: memo compares stable props (stable callback identity) and bails out. Render count stays flat while you type."
      : wrapMemo
        ? "memo is WASTED here: the onSelect prop is a fresh function every render, so the prop comparison always fails. Add the stable callback."
        : "Every keystroke re-renders the heavy list. Type in the box and watch render # and the ms climb.";

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — measure, then memoize</span>
        <span className={`${label} ml-auto hidden sm:inline`} style={{ color: "var(--muted)" }}>
          parent renders: {parentRenders.current}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {chip(wrapMemo, "wrap child in memo()", setWrapMemo)}
        {chip(stableCb, "useCallback the handler", setStableCb)}
        {chip(splitState, "split state (treat the cause)", setSplitState)}
      </div>

      <div className="flex flex-col gap-3">
        {splitState ? (
          <LocalSearch onSearch={() => {}} />
        ) : (
          <input
            className="input"
            placeholder="Type here — every keystroke re-renders the parent…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search that re-renders the parent"
          />
        )}
        <Child seed="static-seed" onSelect={select} />
      </div>

      <p
        key={verdict}
        className="fade-in text-[0.8rem] mt-3 leading-relaxed rounded-[var(--r-sm)] border px-3 py-2"
        style={{ borderColor: "var(--line)", background: "var(--surface-2)", color: "var(--ink-2)" }}
        role="status"
      >
        {verdict}
      </p>
      <p className="text-[0.72rem] mt-2 font-mono" style={{ color: "var(--muted)" }}>
        Strict Mode doubles render counts in dev — compare relative movement, not absolutes.
      </p>
    </div>
  );
}

/* ================= Design System playground ================= */

type DsVariant = "primary" | "ghost" | "danger";

const VARIANT_CLASS: Record<DsVariant, string> = {
  primary: "btn btn-primary",
  ghost: "btn btn-ghost",
  danger: "btn btn-ghost",
};

function MiniModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement;
    const el = dialogRef.current;
    el?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const nodes = el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)", zIndex: 70 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="panel fade-in w-full max-w-md p-6"
        style={{ boxShadow: "var(--shadow-2)" }}
      >
        <h3 id={titleId} className="font-display font-semibold text-lg">{title}</h3>
        <div className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm" data-autofocus onClick={onClose}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function DesignSystemLab() {
  const [variant, setVariant] = useState<DsVariant>("primary");
  const [size, setSize] = useState<"sm" | "md">("md");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const fieldBase = useId();
  const [hintOn, setHintOn] = useState(true);
  const [errorOn, setErrorOn] = useState(false);
  const [fieldVal, setFieldVal] = useState("");
  const inputId = `${fieldBase}-input`;
  const hintId = hintOn && !errorOn ? `${fieldBase}-hint` : undefined;
  const errorId = errorOn ? `${fieldBase}-error` : undefined;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState("");

  const chip = (active: boolean) => ({
    cursor: "pointer",
    borderColor: active ? "var(--brand)" : undefined,
    color: active ? "var(--brand-ink)" : undefined,
  });

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the mini design system</span>
        <span className="chip ml-auto hidden sm:inline-flex">tokens only · zero hex codes</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Button */}
        <div className="rounded-[var(--r)] border p-4 flex flex-col gap-3" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--muted)" }}>Button — typed variants</div>
          <div className="flex flex-wrap gap-1.5">
            {(["primary", "ghost", "danger"] as const).map((v) => (
              <button key={v} type="button" className="chip" style={chip(variant === v)} onClick={() => setVariant(v)} aria-pressed={variant === v}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["sm", "md"] as const).map((s) => (
              <button key={s} type="button" className="chip" style={chip(size === s)} onClick={() => setSize(s)} aria-pressed={size === s}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-[0.78rem]" style={{ color: "var(--ink-2)" }}>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
              disabled
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={loading} onChange={(e) => setLoading(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
              loading
            </label>
          </div>
          <div className="mt-1">
            <button
              type="button"
              className={`${VARIANT_CLASS[variant]} ${size === "sm" ? "btn-sm" : ""}`}
              style={variant === "danger" ? { background: "var(--rose)", color: "#fff" } : undefined}
              disabled={disabled}
              aria-busy={loading || undefined}
            >
              {loading && <span className="pulse-soft" aria-hidden="true">◌ </span>}
              Delete project
            </button>
          </div>
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            <code>variant</code> is a discriminated union — a typo is a compile error. Loading sets{" "}
            <code>aria-busy</code> and keeps the label for screen readers.
          </p>
        </div>

        {/* Field */}
        <div className="rounded-[var(--r)] border p-4 flex flex-col gap-3" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--muted)" }}>Field — useId wiring</div>
          <div className="flex flex-wrap gap-3 text-[0.78rem]" style={{ color: "var(--ink-2)" }}>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={hintOn} onChange={(e) => setHintOn(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
              hint
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={errorOn} onChange={(e) => setErrorOn(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
              error
            </label>
          </div>
          <div>
            <label htmlFor={inputId} style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
              Display name
            </label>
            <input
              id={inputId}
              className="input"
              value={fieldVal}
              onChange={(e) => setFieldVal(e.target.value)}
              aria-invalid={errorOn || undefined}
              aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            />
            {hintId && <p id={hintId} className="text-[0.72rem] mt-1.5" style={{ color: "var(--muted)" }}>Shown on your public profile.</p>}
            {errorId && (
              <p id={errorId} role="alert" className="text-[0.72rem] mt-1.5 fade-in" style={{ color: "var(--rose-ink)" }}>
                ⚠ At least 2 characters.
              </p>
            )}
          </div>
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            <code>useId</code> makes the label/describedby ids collision-proof. Inspect the input:{" "}
            <code>aria-describedby</code> composes hint and error ids in order.
          </p>
        </div>

        {/* Modal */}
        <div className="rounded-[var(--r)] border p-4 flex flex-col gap-3" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
          <div className={label} style={{ color: "var(--muted)" }}>Modal — five obligations</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setModalOpen(true); setModalNote(""); }}>
            Open dialog
          </button>
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "var(--muted)" }}>
            Audit it keyboard-only: focus moves <em>in</em>, Tab wraps at the edges, Escape closes, and focus
            returns to this button.
          </p>
          {modalNote && (
            <p className="text-[0.72rem] fade-in font-mono" style={{ color: "var(--brand-ink)" }} role="status">{modalNote}</p>
          )}
        </div>
      </div>

      <MiniModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalNote("closed — focus returned to the opener ✓"); }}
        title="Confirm the action"
      >
        This dialog is <code>role="dialog"</code> + <code>aria-modal="true"</code>, labelled by its title. Try Tab,
        Shift+Tab, and Escape — then check where focus lands.
      </MiniModal>
    </div>
  );
}

/* ================= Request Trace Lab ================= */

type TracePhaseId = "queue" | "dns" | "connect" | "tls" | "send" | "ttfb" | "download";

interface TracePhase {
  id: TracePhaseId;
  name: string;
  ms: number;
  color: string;
  owner: string;
  detail: string;
  fix: string;
}

const TRACE_SCENARIOS: Record<string, { label: string; phases: TracePhase[] }> = {
  warm: {
    label: "Warm tunnel, healthy API",
    phases: [
      { id: "queue", name: "Queueing", ms: 2, color: "var(--muted)", owner: "browser", detail: "Waiting for a free connection slot. Near-zero when HTTP/2 multiplexes one tunnel.", fix: "Reduce concurrent requests per origin; usually a non-issue." },
      { id: "dns", name: "DNS Lookup", ms: 0, color: "var(--sky)", owner: "infrastructure", detail: "Hostname → IP, served from cache. 0ms on a warm lookup.", fix: "preconnect hints, a faster resolver." },
      { id: "connect", name: "TCP Connect", ms: 0, color: "var(--amber)", owner: "infrastructure", detail: "Three-way handshake. Skipped — the tunnel is reused.", fix: "Keep HTTP/2 keep-alive; fewer distinct origins." },
      { id: "tls", name: "TLS Negotiation", ms: 0, color: "var(--amber)", owner: "infrastructure", detail: "Certificate check + key agreement. Skipped on a resumed session.", fix: "Session resumption, preconnect." },
      { id: "send", name: "Request Sent", ms: 1, color: "var(--muted)", owner: "browser", detail: "Bytes on the wire: request line + headers (+body). Usually microseconds.", fix: "Smaller request bodies/headers." },
      { id: "ttfb", name: "Waiting (TTFB)", ms: 145, color: "var(--brand)", owner: "backend", detail: "Server think time: compute, queries, upstream calls, distance. The backend's leg.", fix: "Index queries, cache reads, profile handlers." },
      { id: "download", name: "Content Download", ms: 18, color: "var(--rose)", owner: "payload", detail: "Body bytes ÷ bandwidth. Small JSON downloads fast.", fix: "Paginate, request fewer fields, compress." },
    ],
  },
  dns: {
    label: "Cold DNS (new network / VPN)",
    phases: [
      { id: "queue", name: "Queueing", ms: 3, color: "var(--muted)", owner: "browser", detail: "Negligible connection-slot wait.", fix: "Usually a non-issue." },
      { id: "dns", name: "DNS Lookup", ms: 480, color: "var(--sky)", owner: "infrastructure", detail: "Cold resolver chain: browser → OS → upstream. This is the suspect.", fix: "preconnect during page load; fix resolver/VPN; longer TTLs." },
      { id: "connect", name: "TCP Connect", ms: 62, color: "var(--amber)", owner: "infrastructure", detail: "One round trip to the resolved IP.", fix: "Reuse tunnels; reduce origins." },
      { id: "tls", name: "TLS Negotiation", ms: 88, color: "var(--amber)", owner: "infrastructure", detail: "Full handshake — no resumed session yet.", fix: "TLS session resumption; preconnect warms it." },
      { id: "send", name: "Request Sent", ms: 1, color: "var(--muted)", owner: "browser", detail: "The request itself — tiny.", fix: "Smaller bodies." },
      { id: "ttfb", name: "Waiting (TTFB)", ms: 150, color: "var(--brand)", owner: "backend", detail: "Server think time — healthy here.", fix: "Index queries, cache reads." },
      { id: "download", name: "Content Download", ms: 20, color: "var(--rose)", owner: "payload", detail: "Small body, quick download.", fix: "Paginate/compress if it grows." },
    ],
  },
  slowserver: {
    label: "Cold server (slow TTFB)",
    phases: [
      { id: "queue", name: "Queueing", ms: 4, color: "var(--muted)", owner: "browser", detail: "Negligible.", fix: "Usually a non-issue." },
      { id: "dns", name: "DNS Lookup", ms: 12, color: "var(--sky)", owner: "infrastructure", detail: "Warm-ish lookup.", fix: "preconnect if it drifts." },
      { id: "connect", name: "TCP Connect", ms: 45, color: "var(--amber)", owner: "infrastructure", detail: "Normal handshake.", fix: "Reuse tunnels." },
      { id: "tls", name: "TLS Negotiation", ms: 70, color: "var(--amber)", owner: "infrastructure", detail: "Normal handshake.", fix: "Session resumption." },
      { id: "send", name: "Request Sent", ms: 2, color: "var(--muted)", owner: "browser", detail: "Tiny.", fix: "Smaller bodies." },
      { id: "ttfb", name: "Waiting (TTFB)", ms: 1850, color: "var(--brand)", owner: "backend", detail: "THE suspect: an unindexed query and an uncached upstream call.", fix: "Profile the handler; add the index; cache the read." },
      { id: "download", name: "Content Download", ms: 30, color: "var(--rose)", owner: "payload", detail: "Body itself is fine.", fix: "Paginate if lists grow." },
    ],
  },
  fat: {
    label: "Fat payload (2MB list)",
    phases: [
      { id: "queue", name: "Queueing", ms: 2, color: "var(--muted)", owner: "browser", detail: "Negligible.", fix: "Usually a non-issue." },
      { id: "dns", name: "DNS Lookup", ms: 6, color: "var(--sky)", owner: "infrastructure", detail: "Cached.", fix: "—" },
      { id: "connect", name: "TCP Connect", ms: 0, color: "var(--amber)", owner: "infrastructure", detail: "Tunnel reused.", fix: "—" },
      { id: "tls", name: "TLS Negotiation", ms: 0, color: "var(--amber)", owner: "infrastructure", detail: "Session resumed.", fix: "—" },
      { id: "send", name: "Request Sent", ms: 1, color: "var(--muted)", owner: "browser", detail: "Tiny request.", fix: "—" },
      { id: "ttfb", name: "Waiting (TTFB)", ms: 210, color: "var(--brand)", owner: "backend", detail: "Server serializes fast — the cost is elsewhere…", fix: "—" },
      { id: "download", name: "Content Download", ms: 1400, color: "var(--rose)", owner: "payload", detail: "THE suspect: 2.1MB of JSON over a modest connection.", fix: "Server pagination, field selection, compression." },
    ],
  },
};

export function RequestTraceLab() {
  const [scenario, setScenario] = useState<keyof typeof TRACE_SCENARIOS>("warm");
  const [active, setActive] = useState<TracePhaseId>("ttfb");
  const [runKey, setRunKey] = useState(0);

  const phases = TRACE_SCENARIOS[scenario].phases;
  const total = phases.reduce((s, p) => s + p.ms, 0);
  const suspect = phases.reduce((max, p) => (p.ms > max.ms ? p : max), phases[0]);
  const current = phases.find((p) => p.id === active) ?? phases[0];

  const pick = (s: keyof typeof TRACE_SCENARIOS) => {
    setScenario(s);
    const sc = TRACE_SCENARIOS[s].phases;
    setActive(sc.reduce((max, p) => (p.ms > max.ms ? p : max), sc[0]).id);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — the timing waterfall</span>
        <span className="ml-auto font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
          total {total}ms
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TRACE_SCENARIOS).map(([key, s]) => (
          <button
            key={key}
            type="button"
            className="chip"
            style={{ cursor: "pointer", borderColor: scenario === key ? "var(--brand)" : undefined, color: scenario === key ? "var(--brand-ink)" : undefined }}
            aria-pressed={scenario === key}
            onClick={() => pick(key as keyof typeof TRACE_SCENARIOS)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* waterfall */}
      <div key={runKey} className="rounded-[var(--r)] border p-4" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
        <div className="relative h-9 rounded-[var(--r-sm)] overflow-hidden flex" style={{ background: "var(--surface)" }} aria-label="Timing waterfall">
          {phases.map((p, i) => {
            const width = total > 0 ? (p.ms / total) * 100 : 0;
            return (
              <button
                key={p.id}
                type="button"
                title={`${p.name}: ${p.ms}ms`}
                onClick={() => setActive(p.id)}
                className="h-full transition-all"
                style={{
                  width: `${Math.max(width, p.ms > 0 ? 1.2 : 0.3)}%`,
                  background: p.ms > 0 ? `color-mix(in srgb, ${p.color} ${active === p.id ? 85 : 45}%, transparent)` : "transparent",
                  borderLeft: i > 0 && p.ms > 0 ? "1px solid var(--bg)" : "none",
                  animation: `tracegrow 0.5s var(--ease) both`,
                  animationDelay: `${i * 90}ms`,
                  cursor: "pointer",
                  padding: 0,
                }}
                aria-label={`${p.name}, ${p.ms} milliseconds`}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-1 mt-3">
          {phases.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className="flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1 text-left transition-colors"
              style={{ background: active === p.id ? "var(--surface-3)" : "transparent" }}
              aria-pressed={active === p.id}
            >
              <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: p.color, opacity: p.ms > 0 ? 1 : 0.25 }} aria-hidden="true" />
              <span className="text-[0.78rem] w-32 shrink-0" style={{ color: active === p.id ? "var(--ink)" : "var(--muted)" }}>{p.name}</span>
              <span className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "var(--surface)" }} aria-hidden="true">
                <span className="block h-full rounded-full" style={{ width: `${total > 0 ? (p.ms / total) * 100 : 0}%`, background: p.color, transition: "width 0.6s var(--ease)" }} />
              </span>
              <span className="font-mono text-[0.7rem] w-16 text-right shrink-0" style={{ color: p.id === suspect.id ? "var(--rose-ink)" : "var(--muted)" }}>
                {p.ms}ms{p.id === suspect.id ? " ◀" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* detail card */}
      <div key={`${scenario}-${active}`} className="fade-in mt-3 rounded-[var(--r-sm)] border p-3.5" style={{ borderColor: "var(--line)", background: "var(--surface)" }} role="status">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display font-semibold text-[0.92rem]" style={{ color: current.color }}>{current.name}</span>
          <span className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>owner: {current.owner}</span>
          {current.id === suspect.id && current.ms > 0 && (
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: "var(--rose-ink)" }}>longest bar — the suspect</span>
          )}
        </div>
        <p className="text-[0.82rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>{current.detail}</p>
        <p className="text-[0.76rem] mt-1.5 font-mono" style={{ color: "var(--muted)" }}>shorten it: {current.fix}</p>
      </div>

      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        The rule the lab drills: <strong style={{ color: "var(--ink-2)" }}>longest bar first, and each bar has an owner.</strong> Same
        endpoint, three different stories — DNS, server think time, and payload — each fixed by a different team.
      </p>
    </div>
  );
}

/* ================= Status Match Lab ================= */

interface MatchScenario {
  id: string;
  prompt: string;
  method: string;
  status: number;
  explain: string;
}

const MATCH_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const MATCH_STATUSES = [200, 201, 204, 304, 401, 403, 404, 409, 422, 429, 500];

const MATCH_SCENARIOS: MatchScenario[] = [
  { id: "s1", prompt: "A form submits a brand-new task to the server.", method: "POST", status: 201, explain: "POST creates (no promises — guard double-submits). 201 Created, with a Location header pointing at the newborn resource." },
  { id: "s2", prompt: "The client fetches the current user's profile to display it.", method: "GET", status: 200, explain: "GET is safe + idempotent — cacheable, repeatable. 200 OK with the body." },
  { id: "s3", prompt: "Deleting task #7 — but it was already deleted by another tab.", method: "DELETE", status: 404, explain: "DELETE is idempotent: the second call finds nothing and answers 404 — the state (deleted) is unchanged, so clients treat it as success." },
  { id: "s4", prompt: "A request arrives with an expired access token.", method: "GET", status: 401, explain: "401 = 'who are you?' — an identity problem. The client refreshes the token and retries once." },
  { id: "s5", prompt: "A signed-in member tries to open the admin billing page.", method: "GET", status: 403, explain: "403 = 'I know who you are, and the answer is no' — authorization. Show a permission screen; never refresh-loop." },
  { id: "s6", prompt: "Two users edit the same note; the second save hits a stale version.", method: "PUT", status: 409, explain: "409 Conflict — the resource changed underneath you. Refetch, merge or ask the user; the optimistic update must reconcile." },
  { id: "s7", prompt: "Signup submits a well-formed request, but the email field is invalid.", method: "POST", status: 422, explain: "422 = syntactically valid, semantically wrong. The body carries per-field errors to map onto the form." },
  { id: "s8", prompt: "A client hammers the search endpoint; the server needs it to slow down.", method: "GET", status: 429, explain: "429 Too Many Requests, with Retry-After. Polite clients back off; rude ones get banned." },
  { id: "s9", prompt: "A full update replaces an existing task with the complete new shape.", method: "PUT", status: 200, explain: "PUT replaces the whole resource and is idempotent (repeating converges). 200 OK returns the updated resource." },
  { id: "s10", prompt: "The API's database connection pool is exhausted mid-request.", method: "GET", status: 500, explain: "5xx = their fault. 500 means the server failed internally; idempotent requests may be retried with backoff." },
];

export function StatusMatchLab() {
  const [order] = useState<number[]>(() => MATCH_SCENARIOS.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [pickedMethod, setPickedMethod] = useState<string | null>(null);
  const [pickedStatus, setPickedStatus] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(0);

  const scenario = MATCH_SCENARIOS[order[idx]];
  const answered = pickedMethod !== null && pickedStatus !== null;
  const correct = answered && pickedMethod === scenario.method && pickedStatus === scenario.status;

  const next = () => {
    if (idx < order.length - 1) {
      setIdx((i) => i + 1);
      setPickedMethod(null);
      setPickedStatus(null);
    } else {
      setIdx(0);
      setPickedMethod(null);
      setPickedStatus(null);
      setScore(0);
      setDone(0);
    }
  };

  const choose = (kind: "method" | "status", value: string | number) => {
    if (answered) return;
    if (kind === "method") {
      const m = value as string;
      setPickedMethod(m);
      if (pickedStatus !== null) setDone((d) => d + 1);
      if (m === scenario.method && pickedStatus === scenario.status) setScore((s) => s + 1);
    } else {
      const s = value as number;
      setPickedStatus(s);
      if (pickedMethod !== null) setDone((d) => d + 1);
      if (pickedMethod === scenario.method && s === scenario.status) setScore((s2) => s2 + 1);
    }
  };

  const chipBtn = (labelStr: string, state: "idle" | "picked" | "right" | "wrong", onClick: () => void, key: string) => {
    const styles =
      state === "right"
        ? { borderColor: "var(--brand)", color: "var(--brand-ink)", background: "var(--brand-soft)" }
        : state === "wrong"
          ? { borderColor: "var(--rose)", color: "var(--rose-ink)", background: "var(--rose-soft)" }
          : state === "picked"
            ? { borderColor: "var(--amber)", color: "var(--amber-ink)", background: "var(--amber-soft)" }
            : { borderColor: "var(--line)", color: "var(--ink-2)", background: "var(--surface)" };
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        disabled={answered}
        className="font-mono text-[0.72rem] px-2.5 py-1.5 rounded-[var(--r-sm)] border transition-all"
        style={{ ...styles, cursor: answered ? "default" : "pointer", opacity: answered && state === "idle" ? 0.5 : 1 }}
      >
        {labelStr}
      </button>
    );
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — speak the wire</span>
        <span className="ml-auto font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
          {score}/{done} correct · card {idx + 1}/{order.length}
        </span>
      </div>

      <div key={scenario.id} className="fade-in rounded-[var(--r)] border p-4 mb-4" style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}>
        <div className={`${label} mb-1.5`} style={{ color: "var(--muted)" }}>scenario</div>
        <p className="text-[0.95rem] leading-snug" style={{ color: "var(--ink)" }}>{scenario.prompt}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>pick the method</div>
          <div className="flex flex-wrap gap-1.5">
            {MATCH_METHODS.map((m) => {
              const state = answered
                ? m === scenario.method
                  ? "right"
                  : m === pickedMethod
                    ? "wrong"
                    : "idle"
                : m === pickedMethod
                  ? "picked"
                  : "idle";
              return chipBtn(m, state, () => choose("method", m), `m-${m}`);
            })}
          </div>
        </div>
        <div>
          <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>pick the status</div>
          <div className="flex flex-wrap gap-1.5">
            {MATCH_STATUSES.map((s) => {
              const state = answered
                ? s === scenario.status
                  ? "right"
                  : s === pickedStatus
                    ? "wrong"
                    : "idle"
                : s === pickedStatus
                  ? "picked"
                  : "idle";
              return chipBtn(String(s), state, () => choose("status", s), `s-${s}`);
            })}
          </div>
        </div>
      </div>

      {answered && (
        <div
          className="fade-in mt-4 rounded-[var(--r-sm)] border p-3.5"
          style={{
            borderColor: correct ? "color-mix(in srgb, var(--brand) 45%, var(--line))" : "color-mix(in srgb, var(--rose) 45%, var(--line))",
            background: correct ? "var(--brand-soft)" : "var(--rose-soft)",
          }}
          role="status"
        >
          <div className="font-display font-semibold text-[0.9rem]" style={{ color: correct ? "var(--brand-ink)" : "var(--rose-ink)" }}>
            {correct ? `Correct — ${scenario.method} → ${scenario.status}` : `The wire says ${scenario.method} → ${scenario.status}`}
          </div>
          <p className="text-[0.8rem] mt-1.5 leading-relaxed" style={{ color: "var(--ink-2)" }}>{scenario.explain}</p>
          <button type="button" className="btn btn-soft btn-sm mt-3" onClick={next}>
            {idx < order.length - 1 ? "Next scenario" : "Run it back"} <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      <p className="text-[0.78rem] mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Fluency is the choreography, not the dictionary: each verdict tells the client what to <em>do</em> — refresh,
        surface, refetch, back off. Miss one here; Phase 19's typed client will ask you again.
      </p>
    </div>
  );
}

/* ================= JWT Token Inspector ================= */

function b64urlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

const SAMPLE_HEADER = { alg: "HS256", typ: "JWT" };

function makeToken(payload: Record<string, unknown>): string {
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${enc(SAMPLE_HEADER)}.${enc(payload)}.${btoa("demo-signature-not-real").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

const SAMPLE_FRESH = makeToken({
  sub: "7",
  role: "member",
  iss: "https://xyzcompany.supabase.co/auth/v1",
  iat: Math.floor(Date.now() / 1000) - 60,
  exp: Math.floor(Date.now() / 1000) + 3600,
});
const SAMPLE_EXPIRED = makeToken({
  sub: "7",
  role: "member",
  iss: "https://xyzcompany.supabase.co/auth/v1",
  iat: Math.floor(Date.now() / 1000) - 7200,
  exp: Math.floor(Date.now() / 1000) - 3600,
});
const SAMPLE_ADMIN = makeToken({
  sub: "7",
  role: "admin",
  iss: "https://xyzcompany.supabase.co/auth/v1",
  iat: Math.floor(Date.now() / 1000) - 60,
  exp: Math.floor(Date.now() / 1000) + 3600,
});

export function TokenInspectorLab() {
  const [raw, setRaw] = useState(SAMPLE_FRESH);
  const [inspected, setInspected] = useState<string | null>(null);

  const decode = (token: string) => {
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) return { error: "expected three dot-separated segments" };
      const header = JSON.parse(b64urlDecode(parts[0])) as Record<string, unknown>;
      const payload = JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>;
      return { header, payload, sig: parts[2] };
    } catch {
      return { error: "segments are not valid base64url JSON" };
    }
  };

  const result = inspected ? decode(inspected) : null;
  const payload = result && !("error" in result) ? (result.payload as Record<string, unknown>) : null;
  const now = Math.floor(Date.now() / 1000);
  const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
  const expired = exp !== null && exp < now;

  const tamper = () => {
    const d = decode(raw);
    if ("error" in d) return;
    const forged = { ...(d.payload as Record<string, unknown>), role: "admin" };
    const forgedToken = makeToken(forged);
    setRaw(forgedToken);
    setInspected(forgedToken);
  };

  const claim = (key: string, val: unknown) => (
    <div key={key} className="flex items-baseline gap-2 text-[0.76rem]">
      <span className="font-mono shrink-0" style={{ color: "var(--sky-ink)" }}>{key}</span>
      <span className="font-mono break-all" style={{ color: "var(--ink-2)" }}>
        {String(val)}
        {key === "exp" && typeof val === "number" && (
          <span style={{ color: expired ? "var(--rose-ink)" : "var(--brand-ink)" }}>
            {" "}({new Date(val * 1000).toLocaleTimeString()} — {expired ? "EXPIRED" : "valid"})
          </span>
        )}
      </span>
    </div>
  );

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <KeyRound size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — JWT inspector</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em]" style={{ color: "var(--amber-ink)" }}>
          <ShieldAlert size={12} /> decoded — not verified
        </span>
      </div>

      <textarea
        className="input font-mono text-[0.74rem] leading-relaxed"
        style={{ minHeight: 74, resize: "vertical" }}
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setInspected(null); }}
        aria-label="Paste a JWT to decode"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        <button type="button" className="btn btn-soft btn-sm" onClick={() => { setRaw(SAMPLE_FRESH); setInspected(SAMPLE_FRESH); }}>fresh token</button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => { setRaw(SAMPLE_EXPIRED); setInspected(SAMPLE_EXPIRED); }}>expired token</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setInspected(raw)} disabled={!raw.trim()}>decode</button>
        <button type="button" className="btn btn-sm" style={{ background: "var(--rose-soft)", color: "var(--rose-ink)", border: "1px solid color-mix(in srgb, var(--rose) 40%, transparent)" }} onClick={tamper} disabled={!inspected} title="Flip the role claim to admin and re-encode">
          forge role → admin
        </button>
      </div>

      {result && "error" in result && (
        <p className="mt-3 text-[0.8rem]" style={{ color: "var(--rose-ink)" }}>✗ {result.error}</p>
      )}

      {result && !("error" in result) && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
            <div className={label} style={{ color: "var(--muted)" }}>header (algorithm + type)</div>
            <pre className="font-mono text-[0.74rem] mt-1.5 overflow-x-auto" style={{ color: "var(--code-ink)" }}>{JSON.stringify(result.header, null, 2)}</pre>
          </div>
          <div className="rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
            <div className={label} style={{ color: "var(--muted)" }}>payload (claims)</div>
            <div className="flex flex-col gap-1 mt-1.5">
              {Object.entries(result.payload as Record<string, unknown>).map(([k, v]) => claim(k, v))}
            </div>
          </div>
          <div className="sm:col-span-2 rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
            <div className={label} style={{ color: "var(--muted)" }}>signature (truncated) — the only part that matters, and the one you can't check here</div>
            <p className="font-mono text-[0.74rem] mt-1.5 break-all" style={{ color: "var(--code-ink)" }}>{(result.sig as string).slice(0, 32)}…</p>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-[var(--r-sm)] border p-3" style={{ borderColor: "color-mix(in srgb, var(--amber) 45%, var(--line))", background: "var(--amber-soft)" }}>
        <p className="text-[0.8rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {expired
            ? <>This token <strong style={{ color: "var(--rose-ink)" }}>decodes perfectly</strong> and is <strong style={{ color: "var(--rose-ink)" }}>expired</strong> — it authorizes nothing. Expiry is a promise only a verifier enforces.</>
            : <>Notice: you just read (and could forge) every claim with no key. Decoding proves <strong>nothing</strong> — only a server holding the signing key can verify the signature. That's why the server re-checks on every request.</>}
        </p>
      </div>
    </div>
  );
}

/* ================= CORS Preflight Simulator ================= */

const ORIGIN_APP = "https://app.example.com";
const ORIGIN_EVIL = "https://evil.example";

type CorsResult = {
  preflighted: boolean;
  preflightLines: string[];
  allowHeaders: string[];
  blocked: boolean;
  reason: string;
  requestFires: boolean;
};

export function CorsSimLab() {
  const [method, setMethod] = useState("PATCH");
  const [contentType, setContentType] = useState("application/json");
  const [withAuth, setWithAuth] = useState(true);
  const [serverOrigin, setServerOrigin] = useState<"match" | "wildcard" | "none">("match");
  const [allowCreds, setAllowCreds] = useState(false);
  const [sendCreds, setSendCreds] = useState(false);

  const simpleBody = contentType === "application/x-www-form-urlencoded" || contentType === "multipart/form-data" || contentType === "text/plain";
  const simpleMethod = method === "GET" || method === "HEAD" || method === "POST";
  const preflighted = !(simpleMethod && simpleBody && !withAuth);

  const allowOrigin = serverOrigin === "match" ? ORIGIN_APP : serverOrigin === "wildcard" ? "*" : null;
  const needsCredRule = sendCreds || allowCreds;

  let blocked = false;
  let reason = "Preflight approved; real request fires and the response is readable.";
  let requestFires = true;

  if (allowOrigin === null) {
    blocked = true;
    requestFires = !preflighted;
    reason = preflighted
      ? "Preflight got no Access-Control-Allow-Origin — the real request never launches."
      : "Real request fires and the server answers, but with no Allow-Origin the browser withholds the response from your script.";
  } else if (serverOrigin === "wildcard" && needsCredRule) {
    blocked = true;
    requestFires = !preflighted;
    reason = "With credentials involved, a wildcard origin is rejected — the spec demands the exact calling origin.";
  } else if (preflighted && serverOrigin === "match") {
    // fine
  }

  const preflightLines = preflighted
    ? [
        `OPTIONS /todos/7`,
        `Origin: ${ORIGIN_APP}`,
        `Access-Control-Request-Method: ${method}`,
        `Access-Control-Request-Headers: ${[withAuth ? "authorization" : null, !simpleBody ? "content-type" : null].filter(Boolean).join(", ") || "(none)"}`,
        "",
        `← 204`,
        ...(allowOrigin ? [`Access-Control-Allow-Origin: ${allowOrigin}`, `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE`, `Access-Control-Allow-Headers: content-type, authorization`] : ["(no Access-Control-Allow-Origin)"]),
      ]
    : [];

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FlaskConical size={15} style={{ color: "var(--brand)" }} />
        <span className="font-display font-semibold text-[0.95rem]">Live lab — CORS & preflight</span>
        <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.16em]" style={{ color: "var(--muted)" }}>origin: {ORIGIN_APP}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <div className={label} style={{ color: "var(--muted)" }}>the request you write</div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="input" style={{ width: "auto", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }} value={method} onChange={(e) => setMethod(e.target.value)} aria-label="HTTP method">
              {["GET", "POST", "PATCH", "PUT", "DELETE"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="input" style={{ width: "auto", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }} value={contentType} onChange={(e) => setContentType(e.target.value)} aria-label="Content-Type">
              {["application/json", "text/plain", "application/x-www-form-urlencoded"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
            <input type="checkbox" checked={withAuth} onChange={(e) => setWithAuth(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
            <code>Authorization: Bearer …</code> header
          </label>
          <label className="flex items-center gap-2 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
            <input type="checkbox" checked={sendCreds} onChange={(e) => setSendCreds(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
            <code>credentials: "include"</code> (cookies)
          </label>
          <p className="text-[0.74rem]" style={{ color: "var(--muted)" }}>
            {preflighted
              ? "→ preflighted: something here (method, JSON, or auth header) isn't on the simple-request safelist."
              : "→ simple request: no preflight, the real request goes straight out."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className={label} style={{ color: "var(--muted)" }}>the server's allowlist</div>
          <div className="flex flex-wrap gap-2">
            {([["match", ORIGIN_APP], ["wildcard", "*"], ["none", "(none)"]] as const).map(([val, txt]) => (
              <button key={val} type="button" className="chip" style={{ cursor: "pointer", borderColor: serverOrigin === val ? "var(--brand)" : undefined, color: serverOrigin === val ? "var(--brand-ink)" : undefined }} onClick={() => setServerOrigin(val)} aria-pressed={serverOrigin === val}>
                Allow-Origin: {txt}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[0.82rem]" style={{ color: "var(--ink-2)" }}>
            <input type="checkbox" checked={allowCreds} onChange={(e) => setAllowCreds(e.target.checked)} style={{ accentColor: "var(--brand)" }} />
            <code>Access-Control-Allow-Credentials: true</code>
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--r-sm)] border p-3" style={{ borderColor: "var(--line)", background: "var(--code-bg)" }}>
        <div className={`${label} mb-2`} style={{ color: "var(--muted)" }}>the wire</div>
        {preflightLines.map((l, i) => (
          <div key={i} className="font-mono text-[0.72rem] leading-relaxed" style={{ color: l.startsWith("←") ? "var(--syn-kw)" : l.startsWith("(") ? "var(--rose-ink)" : "var(--code-ink)" }}>{l || " "}</div>
        ))}
        <div className="font-mono text-[0.72rem] leading-relaxed" style={{ color: "var(--syn-str)" }}>
          {requestFires ? `${method} /todos/7  →  (fires)` : `${method} /todos/7  →  (never launched)`}
        </div>
      </div>

      <div
        className="mt-3 rounded-[var(--r-sm)] border p-3 flex items-start gap-2.5"
        style={{
          borderColor: blocked ? "color-mix(in srgb, var(--rose) 50%, var(--line))" : "color-mix(in srgb, var(--brand) 50%, var(--line))",
          background: blocked ? "var(--rose-soft)" : "var(--brand-soft)",
        }}
        role="status"
      >
        {blocked ? <ShieldAlert size={16} className="mt-0.5 shrink-0" style={{ color: "var(--rose)" }} /> : <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />}
        <p className="text-[0.8rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>{reason}</p>
      </div>
    </div>
  );
}

/* ================= REST Pagination & Keyset vs Offset Lab ================= */

export function RestPaginationLab() {
  const [strategy, setStrategy] = useState<"offset" | "cursor">("offset");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [cursor, setCursor] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [insertedCount, setInsertedCount] = useState(0);
  const [showProblemJson, setShowProblemJson] = useState(false);

  // Initial mock tasks
  const baseTasks = useMemo(() => [
    { id: 101, title: "Configure fastify adapter for NestJS", status: "completed", priority: "high", createdAt: "2026-08-28T08:00:00Z" },
    { id: 102, title: "Pin Prisma ORM to version 7.9.15", status: "completed", priority: "critical", createdAt: "2026-08-28T08:15:00Z" },
    { id: 103, title: "Implement Supabase Auth JWT verify guard", status: "in_progress", priority: "high", createdAt: "2026-08-28T08:30:00Z" },
    { id: 104, title: "Design RFC 7807 error exception filter", status: "in_progress", priority: "medium", createdAt: "2026-08-28T09:00:00Z" },
    { id: 105, title: "Build cursor pagination keyset encoder", status: "todo", priority: "medium", createdAt: "2026-08-28T09:30:00Z" },
    { id: 106, title: "Wire TanStack Query infinite scroll", status: "todo", priority: "high", createdAt: "2026-08-28T10:00:00Z" },
    { id: 107, title: "Add idempotency key header to checkout", status: "todo", priority: "critical", createdAt: "2026-08-28T10:30:00Z" },
    { id: 108, title: "Run 9-step network failure diagnostic", status: "todo", priority: "low", createdAt: "2026-08-28T11:00:00Z" },
    { id: 109, title: "Benchmark Postgres B-Tree index scan", status: "todo", priority: "medium", createdAt: "2026-08-28T11:30:00Z" },
    { id: 110, title: "Configure Redis token bucket rate limiter", status: "todo", priority: "high", createdAt: "2026-08-28T12:00:00Z" },
    { id: 111, title: "Validate zod schema on Next.js Server Action", status: "todo", priority: "medium", createdAt: "2026-08-28T12:30:00Z" },
    { id: 112, title: "Write E2E test for User-A User-B isolation", status: "todo", priority: "critical", createdAt: "2026-08-28T13:00:00Z" },
  ], []);

  // Inserted items simulate real-time insertions while browsing
  const allTasks = useMemo(() => {
    const fresh = [];
    for (let i = 1; i <= insertedCount; i++) {
      fresh.push({
        id: 200 + i,
        title: `🚨 Urgent incoming task #${i} (inserted just now)`,
        status: "todo",
        priority: "critical",
        createdAt: new Date(Date.now() - (insertedCount - i) * 60000).toISOString(),
      });
    }
    return [...fresh, ...baseTasks];
  }, [baseTasks, insertedCount]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return allTasks;
    return allTasks.filter((t) => t.status === statusFilter);
  }, [allTasks, statusFilter]);

  // Strategy calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Offset slice
  const offsetIndex = (page - 1) * limit;
  const offsetItems = filtered.slice(offsetIndex, offsetIndex + limit);

  // Cursor slice
  const cursorStartIndex = cursor ? filtered.findIndex((t) => t.id === cursor) + 1 : 0;
  const cursorItems = filtered.slice(cursorStartIndex, cursorStartIndex + limit);
  const nextCursor = cursorItems.length === limit ? cursorItems[cursorItems.length - 1]?.id : null;

  const currentItems = strategy === "offset" ? offsetItems : cursorItems;

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("limit", String(limit));
    if (strategy === "offset") {
      params.set("page", String(page));
    } else if (cursor) {
      // base64 mock
      params.set("cursor", btoa(JSON.stringify({ id: cursor })));
    }
    return `/api/v1/tasks?${params.toString()}`;
  }, [strategy, page, limit, cursor, statusFilter]);

  const sqlQuery = useMemo(() => {
    const whereClause = statusFilter !== "all" ? `WHERE status = '${statusFilter}'` : "";
    if (strategy === "offset") {
      return `SELECT * FROM "Task" ${whereClause} ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offsetIndex};`;
    }
    const cursorClause = cursor ? (whereClause ? `AND "id" < ${cursor}` : `WHERE "id" < ${cursor}`) : "";
    return `SELECT * FROM "Task" ${whereClause} ${cursorClause} ORDER BY "id" DESC LIMIT ${limit};`;
  }, [strategy, limit, offsetIndex, cursor, statusFilter]);

  const handleInsertRow = () => {
    setInsertedCount((c) => c + 1);
  };

  const resetAll = () => {
    setPage(1);
    setCursor(null);
    setInsertedCount(0);
    setStatusFilter("all");
  };

  return (
    <div className="panel p-4 my-4" style={{ background: "var(--panel)" }}>
      <div className="flex items-center justify-between gap-2 border-b pb-3 mb-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <Database size={17} style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-sm">REST Pagination & Contract Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="chip flex items-center gap-1 text-[0.72rem]"
            onClick={resetAll}
            title="Reset to default page 1"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* Control row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
            Pagination Strategy
          </label>
          <div className="flex rounded-[var(--r-sm)] border overflow-hidden" style={{ borderColor: "var(--line)" }}>
            <button
              type="button"
              className="flex-1 py-1.5 px-2 text-xs font-mono transition-colors"
              style={{
                background: strategy === "offset" ? "var(--brand)" : "transparent",
                color: strategy === "offset" ? "var(--brand-ink)" : "var(--ink-2)",
              }}
              onClick={() => {
                setStrategy("offset");
                setPage(1);
              }}
            >
              Offset (?page={page})
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 px-2 text-xs font-mono transition-colors"
              style={{
                background: strategy === "cursor" ? "var(--brand)" : "transparent",
                color: strategy === "cursor" ? "var(--brand-ink)" : "var(--ink-2)",
              }}
              onClick={() => {
                setStrategy("cursor");
                setCursor(null);
              }}
            >
              Cursor Keyset
            </button>
          </div>
        </div>

        <div>
          <label className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
            Filter (Query Param)
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setCursor(null);
            }}
            className="w-full text-xs py-1.5 px-2 rounded-[var(--r-sm)] border bg-transparent"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            <option value="all">All statuses (?status=all)</option>
            <option value="todo">todo (?status=todo)</option>
            <option value="in_progress">in_progress (?status=in_progress)</option>
            <option value="completed">completed (?status=completed)</option>
          </select>
        </div>

        <div>
          <label className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
            Page Size (limit)
          </label>
          <div className="flex gap-1.5">
            {[3, 5, 8].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLimit(l);
                  setPage(1);
                  setCursor(null);
                }}
                className="chip text-xs flex-1 text-center"
                style={{
                  borderColor: limit === l ? "var(--brand)" : undefined,
                  color: limit === l ? "var(--brand-ink)" : undefined,
                }}
              >
                limit={l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Concurrent drift test */}
      <div
        className="p-3 rounded-[var(--r-sm)] border mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}
      >
        <div className="text-xs">
          <span className="font-semibold">Simulate Realtime Drift:</span> Insert new items at head while reading page {page}.
          {insertedCount > 0 && (
            <span className="ml-2 font-mono text-[0.72rem]" style={{ color: "var(--brand-ink)" }}>
              ({insertedCount} inserted)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleInsertRow}
          className="btn btn-sm text-xs flex items-center gap-1.5 shrink-0"
          style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
        >
          <Zap size={12} /> Insert Row At Top
        </button>
      </div>

      {/* Live wire & SQL display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="rounded-[var(--r-sm)] border p-3" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-1 flex items-center justify-between`} style={{ color: "var(--muted)" }}>
            <span>HTTP Request Line</span>
            <span className="text-[0.62rem] uppercase font-sans">GET 200 OK</span>
          </div>
          <div className="font-mono text-xs overflow-x-auto text-emerald-400 py-1">{requestUrl}</div>
        </div>

        <div className="rounded-[var(--r-sm)] border p-3" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-1 flex items-center justify-between`} style={{ color: "var(--muted)" }}>
            <span>Generated PostgreSQL Query</span>
            <span className="text-[0.62rem] uppercase font-sans">
              {strategy === "offset" ? `Cost: O(OFFSET + N)` : `Cost: O(log N) Index Scan`}
            </span>
          </div>
          <div className="font-mono text-xs overflow-x-auto text-amber-300 py-1">{sqlQuery}</div>
        </div>
      </div>

      {/* Result list */}
      <div className="border rounded-[var(--r-sm)] overflow-hidden mb-4" style={{ borderColor: "var(--line)" }}>
        <div className="p-2.5 bg-black/5 dark:bg-white/5 border-b text-xs font-semibold flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
          <span>Returned Payload ({currentItems.length} records)</span>
          <span className="text-[0.7rem] font-normal" style={{ color: "var(--muted)" }}>
            Total filtered matching: {totalItems}
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--line)" }}>
          {currentItems.map((item) => (
            <div key={item.id} className="p-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[0.75rem]" style={{ color: "var(--brand-ink)" }}>
                  #{item.id}
                </span>
                <span className="font-medium text-[0.82rem]">{item.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[0.7rem]">
                <span
                  className="px-1.5 py-0.5 rounded text-[0.68rem]"
                  style={{
                    background:
                      item.priority === "critical"
                        ? "var(--rose-soft)"
                        : item.priority === "high"
                        ? "rgba(234,179,8,0.15)"
                        : "var(--panel-sub)",
                    color:
                      item.priority === "critical"
                        ? "var(--rose)"
                        : item.priority === "high"
                        ? "#eab308"
                        : "var(--muted)",
                  }}
                >
                  {item.priority}
                </span>
                <span className="chip text-[0.68rem]">{item.status}</span>
              </div>
            </div>
          ))}
          {currentItems.length === 0 && (
            <div className="p-6 text-center text-xs" style={{ color: "var(--muted)" }}>
              No items matching this page window.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
        {strategy === "offset" ? (
          <>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Page <span className="font-semibold text-ink">{page}</span> of {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-sm text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-sm text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Cursor: <code className="font-mono text-[0.72rem]">{cursor ? `#${cursor}` : "null (head)"}</code>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!cursor}
                onClick={() => setCursor(null)}
                className="btn btn-sm text-xs disabled:opacity-40"
              >
                Jump to Head
              </button>
              <button
                type="button"
                disabled={!nextCursor}
                onClick={() => setCursor(nextCursor)}
                className="btn btn-sm text-xs disabled:opacity-40"
              >
                Fetch Next Batch →
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowProblemJson((v) => !v)}
          className="chip text-[0.72rem] ml-auto"
        >
          {showProblemJson ? "Hide RFC 7807 Error" : "Preview RFC 7807 Problem JSON"}
        </button>
      </div>

      {/* RFC 7807 problem json display */}
      {showProblemJson && (
        <div className="mt-3 p-3 rounded-[var(--r-sm)] border" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--rose-ink)" }}>
            HTTP 422 Unprocessable Entity (Content-Type: application/problem+json)
          </div>
          <pre className="font-mono text-[0.72rem] leading-relaxed overflow-x-auto text-rose-300">
{`{
  "type": "https://api.example.com/errors/invalid-cursor",
  "title": "Invalid Keyset Cursor",
  "status": 422,
  "detail": "The cursor 'eyJpZCI6OTk5OTl9' references a nonexistent or corrupted item token.",
  "instance": "/api/v1/tasks?cursor=eyJpZCI6OTk5OTl9&limit=5",
  "invalidParams": [
    { "name": "cursor", "reason": "Decoded id must be an existing integer record identifier" }
  ]
}`}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ================= 9-Step Layer Failure Diagnostic Lab ================= */

interface FailureScenario {
  id: string;
  name: string;
  symptom: string;
  rawRequest: string;
  rawResponse: string;
  networkTimings: { dns: number; connect: number; tls: number; ttfb: number; transfer: number };
  browserConsole: string;
  serverLogs: string;
  correctLayer: string;
  rootCause: string;
  fix: string;
}

export function LayerDiagnosticLab() {
  const scenarios: FailureScenario[] = useMemo(
    () => [
      {
        id: "dns",
        name: "1. The Missing Microservice",
        symptom: "User clicks 'Checkout', UI shows spinning spinner forever, then fails with ERR_NAME_NOT_RESOLVED",
        rawRequest: "POST /v1/checkout HTTP/1.1\nHost: payments.internal.api.local\nAuthorization: Bearer eyJhbGci...",
        rawResponse: "(No response received — network socket never opened)",
        networkTimings: { dns: 3000, connect: 0, tls: 0, ttfb: 0, transfer: 0 },
        browserConsole: "TypeError: Failed to fetch\n  at handleCheckout (checkout.tsx:42:15)\n  net::ERR_NAME_NOT_RESOLVED",
        serverLogs: "(No log entries — request never touched NestJS server or reverse proxy)",
        correctLayer: "DNS Resolution (Infrastructure / Network)",
        rootCause: "The client attempted to fetch a private internal host ('payments.internal.api.local') that is not resolvable in public DNS.",
        fix: "Configure the frontend to proxy checkout requests through the public API gateway or public domain with valid DNS records.",
      },
      {
        id: "proxy",
        name: "2. The 502 Upstream Hang",
        symptom: "Calling GET /api/v1/analytics responds after 30 seconds with 502 Bad Gateway HTML page from nginx",
        rawRequest: "GET /api/v1/analytics HTTP/1.1\nHost: api.myapp.com\nAccept: application/json",
        rawResponse: "HTTP/1.1 502 Bad Gateway\nServer: nginx/1.25.4\nContent-Type: text/html\nContent-Length: 157\n\n<html><center><h1>502 Bad Gateway</h1></center></html>",
        networkTimings: { dns: 12, connect: 18, tls: 22, ttfb: 30050, transfer: 2 },
        browserConsole: "Fetch error: Unexpected token '<', \"<html><cen\"... is not valid JSON",
        serverLogs: "[nginx error] 1234#0: *5678 upstream timed out (110: Connection timed out) while connecting to upstream, client: 192.168.1.1, server: api.myapp.com, request: \"GET /api/v1/analytics HTTP/1.1\", upstream: \"http://127.0.0.1:3000/api/v1/analytics\"",
        correctLayer: "Reverse Proxy / Downstream NestJS Process",
        rootCause: "The NestJS Node process on port 3000 crashed or is blocked on a synchronous computation, causing nginx reverse proxy to time out.",
        fix: "Check pm2 / container health, restart the NestJS worker, and offload CPU-heavy analytics aggregation to a background BullMQ worker (Phase 25).",
      },
      {
        id: "auth",
        name: "3. The 401 Silent Token Expiration",
        symptom: "User was editing a form, clicked 'Save', and received 401 Unauthorized with token expired error",
        rawRequest: "PATCH /api/v1/projects/42 HTTP/1.1\nHost: api.myapp.com\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwMDAwMDB9...\nContent-Type: application/json\n\n{\"name\":\"Updated Q4 Roadmap\"}",
        rawResponse: "HTTP/1.1 401 Unauthorized\nContent-Type: application/problem+json\n\n{\n  \"type\": \"https://api.myapp.com/errors/token-expired\",\n  \"title\": \"Token Expired\",\n  \"status\": 401,\n  \"detail\": \"JWT expired at 2026-08-28T12:00:00Z. Please refresh using /auth/refresh.\"\n}",
        networkTimings: { dns: 0, connect: 0, tls: 0, ttfb: 45, transfer: 3 },
        browserConsole: "[API] Request failed with status 401 Unauthorized: token expired",
        serverLogs: "[NestJS] [AuthGuard] [WARN] Supabase JWT verification failed: jwt expired (exp claim: 1700000000, now: 1700003600). Rejecting request with 401.",
        correctLayer: "NestJS Auth Guard / Supabase Token Lifetime",
        rootCause: "The Supabase Auth access token expired after 60 minutes and the frontend API client did not trigger an automatic silent refresh.",
        fix: "Implement an HTTP interceptor or TanStack Query retry hook that catches 401s, calls `supabase.auth.refreshSession()`, and replays the queued request.",
      },
      {
        id: "dto",
        name: "4. The 400 Class-Validator Rejection",
        symptom: "Creating a user task returns 400 Bad Request with validation constraint messages",
        rawRequest: "POST /api/v1/tasks HTTP/1.1\nHost: api.myapp.com\nContent-Type: application/json\n\n{\"title\":\"   \",\"priority\":\"SUPER_URGENT\",\"dueDate\":\"yesterday\"}",
        rawResponse: "HTTP/1.1 400 Bad Request\nContent-Type: application/problem+json\n\n{\n  \"type\": \"https://api.myapp.com/errors/validation-failed\",\n  \"title\": \"Validation Failed\",\n  \"status\": 400,\n  \"invalidParams\": [\n    {\"name\": \"title\", \"reason\": \"title must not be empty and must have at least 3 characters\"},\n    {\"name\": \"priority\", \"reason\": \"priority must be one of: low, medium, high, critical\"},\n    {\"name\": \"dueDate\", \"reason\": \"dueDate must be an ISO 8601 date string in the future\"}\n  ]\n}",
        networkTimings: { dns: 0, connect: 0, tls: 0, ttfb: 38, transfer: 2 },
        browserConsole: "[API Error] 400 Validation Failed: 3 invalid parameters",
        serverLogs: "[NestJS] [ValidationPipe] [WARN] Request body failed DTO constraints: [title: minLength, isNotEmpty], [priority: isEnum], [dueDate: isIso8601, isFutureDate]. Returning 400.",
        correctLayer: "NestJS Controller / ValidationPipe (DTO Schema)",
        rootCause: "The client form submitted invalid enum strings and non-ISO dates that violate the CreateTaskDto class-validator decorators.",
        fix: "Share TypeScript contracts or use Zod / React Hook Form validation on the client to give instant feedback before submitting valid payloads to NestJS.",
      },
      {
        id: "prisma",
        name: "5. The 500 Prisma Unique Key Collision",
        symptom: "Registering an account with an existing email returns 500 Internal Server Error without friendly message",
        rawRequest: "POST /api/v1/auth/register HTTP/1.1\nHost: api.myapp.com\nContent-Type: application/json\n\n{\"email\":\"alex@example.com\",\"password\":\"SecurePass123!\"}",
        rawResponse: "HTTP/1.1 500 Internal Server Error\nContent-Type: application/json\n\n{\"statusCode\":500,\"message\":\"Internal server error\"}",
        networkTimings: { dns: 0, connect: 0, tls: 0, ttfb: 62, transfer: 2 },
        browserConsole: "[Auth] Failed to register: 500 Internal Server Error",
        serverLogs: "[NestJS] [ExceptionsHandler] PrismaClientKnownRequestError: \nInvalid `prisma.user.create()` invocation:\nUnique constraint failed on the fields: (`email`)\n  at PrismaClient._request (prisma-client.js:124)\n  code: 'P2002', target: ['email']",
        correctLayer: "Database / Prisma Exception Filter Layer",
        rootCause: "Prisma threw a P2002 unique constraint violation in Postgres because the email is already registered, but NestJS lacked a PrismaExceptionFilter to map P2002 to HTTP 409 Conflict.",
        fix: "Create a global PrismaClientExceptionFilter in NestJS that catches code 'P2002' and returns a structured 409 Conflict with 'Email already registered'.",
      },
      {
        id: "cors",
        name: "6. The CORS Preflight Disconnect",
        symptom: "Browser refuses to send PUT request with custom 'X-Workspace-Id' header, network tab shows preflight (CORS error)",
        rawRequest: "OPTIONS /api/v1/workspaces/9 HTTP/1.1\nHost: api.myapp.com\nOrigin: https://app.myapp.com\nAccess-Control-Request-Method: PUT\nAccess-Control-Request-Headers: authorization,content-type,x-workspace-id",
        rawResponse: "HTTP/1.1 204 No Content\nAccess-Control-Allow-Origin: https://app.myapp.com\nAccess-Control-Allow-Methods: GET,POST,PUT,DELETE\nAccess-Control-Allow-Headers: Authorization,Content-Type",
        networkTimings: { dns: 0, connect: 0, tls: 0, ttfb: 25, transfer: 1 },
        browserConsole: "Access to fetch at 'https://api.myapp.com/api/v1/workspaces/9' from origin 'https://app.myapp.com' has been blocked by CORS policy: Request header field x-workspace-id is not allowed by Access-Control-Allow-Headers in preflight response.",
        serverLogs: "[Fastify/CORS] Preflight OPTIONS request received. Responded with allowed headers: Authorization, Content-Type.",
        correctLayer: "Browser Security Engine / Fastify CORS Configuration",
        rootCause: "The server's CORS configuration did not include 'x-workspace-id' in its allowedHeaders list, so the browser blocked the actual PUT request.",
        fix: "Add 'X-Workspace-Id' to Fastify's CORS allowedHeaders list in `main.ts`.",
      },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState<string>("dns");
  const [userHypothesis, setUserHypothesis] = useState<string>("");
  const [revealed, setRevealed] = useState(false);

  const current = scenarios.find((s) => s.id === selectedId) || scenarios[0];

  const handleSelectScenario = (id: string) => {
    setSelectedId(id);
    setUserHypothesis("");
    setRevealed(false);
  };

  return (
    <div className="panel p-4 my-4" style={{ background: "var(--panel)" }}>
      <div className="flex items-center justify-between gap-2 border-b pb-3 mb-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <Terminal size={17} style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-sm">9-Step Stack Failure Diagnostic Lab</span>
        </div>
        <span className="font-mono text-[0.7rem] px-2 py-0.5 rounded" style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}>
          Incident Triage
        </span>
      </div>

      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => handleSelectScenario(sc.id)}
            className="chip text-xs transition-all"
            style={{
              borderColor: sc.id === selectedId ? "var(--brand)" : undefined,
              background: sc.id === selectedId ? "var(--brand-soft)" : undefined,
              color: sc.id === selectedId ? "var(--brand-ink)" : undefined,
              fontWeight: sc.id === selectedId ? 600 : 400,
            }}
          >
            {sc.name}
          </button>
        ))}
      </div>

      {/* Symptom Card */}
      <div
        className="p-3 rounded-[var(--r-sm)] border mb-4 flex items-start gap-2.5"
        style={{ background: "var(--rose-soft)", borderColor: "color-mix(in srgb, var(--rose) 40%, var(--line))" }}
      >
        <AlertOctagon size={16} className="mt-0.5 shrink-0" style={{ color: "var(--rose)" }} />
        <div>
          <div className={`${label} mb-0.5`} style={{ color: "var(--rose)" }}>
            Incident Report
          </div>
          <div className="text-xs font-medium leading-relaxed" style={{ color: "var(--ink)" }}>
            {current.symptom}
          </div>
        </div>
      </div>

      {/* Evidence Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Network Waterfall & Raw Request */}
        <div className="rounded-[var(--r-sm)] border p-3" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-2 flex items-center justify-between`} style={{ color: "var(--muted)" }}>
            <span>Evidence A: Network Waterfall</span>
            <span className="text-[0.62rem] font-sans">
              Total: {Object.values(current.networkTimings).reduce((a, b) => a + b, 0)}ms
            </span>
          </div>
          <div className="space-y-1 font-mono text-[0.7rem] mb-3">
            <div className="flex items-center justify-between text-muted">
              <span>DNS Lookup:</span>
              <span className={current.networkTimings.dns > 1000 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {current.networkTimings.dns}ms
              </span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>TCP + TLS Connect:</span>
              <span className="text-emerald-400">{current.networkTimings.connect + current.networkTimings.tls}ms</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Waiting (TTFB):</span>
              <span className={current.networkTimings.ttfb > 5000 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {current.networkTimings.ttfb}ms
              </span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>Content Transfer:</span>
              <span className="text-emerald-400">{current.networkTimings.transfer}ms</span>
            </div>
          </div>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            Raw HTTP Wire
          </div>
          <pre className="font-mono text-[0.68rem] leading-relaxed text-blue-300 overflow-x-auto p-1 bg-black/20 rounded">
            {current.rawRequest}
          </pre>
          <pre className="font-mono text-[0.68rem] leading-relaxed text-amber-200 overflow-x-auto p-1 bg-black/20 rounded mt-1">
            {current.rawResponse}
          </pre>
        </div>

        {/* Console & Server Logs */}
        <div className="rounded-[var(--r-sm)] border p-3" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            Evidence B: Browser Console
          </div>
          <pre className="font-mono text-[0.68rem] leading-relaxed text-rose-300 overflow-x-auto p-1 bg-black/20 rounded mb-3">
            {current.browserConsole}
          </pre>

          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            Evidence C: Server / Backend Logs
          </div>
          <pre className="font-mono text-[0.68rem] leading-relaxed text-emerald-300 overflow-x-auto p-1 bg-black/20 rounded">
            {current.serverLogs}
          </pre>
        </div>
      </div>

      {/* 9-Step Diagnostic Action */}
      <div className="p-3 rounded-[var(--r-sm)] border" style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}>
        <div className={`${label} mb-2`} style={{ color: "var(--brand-ink)" }}>
          Step 5 & 8: Formulate Hypothesis & Root Cause
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            placeholder="Which layer failed? (e.g. DNS, Proxy, Auth Guard, DTO Validator, Prisma, CORS)"
            value={userHypothesis}
            onChange={(e) => setUserHypothesis(e.target.value)}
            className="flex-1 text-xs py-1.5 px-3 rounded-[var(--r-sm)] border bg-transparent"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          />
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="btn btn-sm text-xs flex items-center justify-center gap-1 shrink-0"
            style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
          >
            <CheckCircle2 size={13} /> Verify Diagnosis
          </button>
        </div>

        {revealed && (
          <div className="space-y-2 pt-2 border-t text-xs animate-in fade-in duration-200" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted">Failing Layer:</span>
              <span className="font-mono font-bold" style={{ color: "var(--brand-ink)" }}>
                {current.correctLayer}
              </span>
            </div>
            <div>
              <span className="font-semibold text-muted">Root Cause: </span>
              <span style={{ color: "var(--ink)" }}>{current.rootCause}</span>
            </div>
            <div>
              <span className="font-semibold text-muted">Definitive Fix: </span>
              <span className="font-mono text-emerald-500">{current.fix}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= RSC Wire & Flight Payload Inspector ================= */

export function RscWireLab() {
  const [tab, setTab] = useState<"visual" | "flight" | "bundles">("visual");
  const [clientCount, setClientCount] = useState(0);

  return (
    <div className="panel p-4 my-4" style={{ background: "var(--panel)" }}>
      <div className="flex items-center justify-between gap-2 border-b pb-3 mb-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <Layers size={17} style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-sm">React Server Components (RSC) Wire Inspector</span>
        </div>
        <div className="flex gap-1">
          {(["visual", "flight", "bundles"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className="chip text-xs capitalize"
              style={{
                borderColor: tab === t ? "var(--brand)" : undefined,
                color: tab === t ? "var(--brand-ink)" : undefined,
              }}
              onClick={() => setTab(t)}
            >
              {t === "visual" ? "Tree View" : t === "flight" ? "Flight Stream" : "Bundle Savings"}
            </button>
          ))}
        </div>
      </div>

      {tab === "visual" && (
        <div className="space-y-3">
          <div className="p-3 border rounded-[var(--r-sm)]" style={{ borderColor: "var(--line)", background: "var(--panel-sub)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--brand-ink)" }}>
                <Server size={14} /> Server Component Boundary: <code>app/dashboard/page.tsx</code>
              </span>
              <span className="chip text-[0.65rem]">0 KB client JS sent</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              Executes only on the Node server. Can read Prisma database, secret env vars, and large markdown libraries without shipping them to the browser.
            </p>

            {/* Nested children */}
            <div className="p-3 border rounded-[var(--r-sm)] bg-black/5 dark:bg-white/5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Server-Rendered Metric Card</span>
                <span className="font-mono text-[0.7rem] text-muted">Rendered via Prisma query</span>
              </div>
              <div className="text-xs p-2 rounded bg-white/40 dark:bg-black/40 font-mono">
                Total Revenue: $48,250.00 · Active Subscriptions: 142
              </div>

              {/* Client Component Leaf */}
              <div
                className="p-3 border rounded-[var(--r-sm)] mt-2"
                style={{ borderColor: "var(--brand)", background: "var(--brand-soft)" }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--brand-ink)" }}>
                    <Globe size={14} /> Client Component: <code>LikeCounter.tsx ('use client')</code>
                  </span>
                  <span className="chip text-[0.65rem]">Hydrated in browser</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setClientCount((c) => c + 1)}
                    className="btn btn-sm text-xs flex items-center gap-1"
                    style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
                  >
                    <Zap size={12} /> Interactive Click: {clientCount}
                  </button>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    State & event handlers stay isolated to this small client island.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "flight" && (
        <div className="rounded-[var(--r-sm)] border p-3" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <div className={`${label} mb-2 flex items-center justify-between`} style={{ color: "var(--muted)" }}>
            <span>RSC Flight Stream Payload (Content-Type: text/x-component)</span>
            <span className="text-[0.65rem] font-sans">Streamed over HTTP</span>
          </div>
          <pre className="font-mono text-[0.72rem] leading-relaxed text-emerald-300 overflow-x-auto p-2 bg-black/30 rounded">
{`1:I{"id":"./src/components/LikeCounter.tsx","chunks":["client-counter.js"],"name":""}
2:{"title":"Dashboard Overview","revenue":48250,"subs":142}
0:["$","div",null,{"className":"p-6","children":[
  ["$","h1",null,{"children":"Dashboard Overview"}],
  ["$","div",null,{"children":["Total Revenue: $",48250]}],
  ["$","$L1",null,{"initialCount":0}]
]}]`}
          </pre>
          <p className="text-[0.75rem] mt-2 text-muted">
            Notice: The flight stream sends the serialized virtual DOM tree (`0:`) plus client component module references (`1:I`), passing data directly into the client component without a second JSON fetch!
          </p>
        </div>
      )}

      {tab === "bundles" && (
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded border flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="font-semibold">Prisma ORM & PostgreSQL Client</div>
              <div className="text-muted text-[0.7rem]">Used in Server Components for DB queries</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-500 font-bold">0 KB</span> in browser bundle (was ~280 KB in SPAs)
            </div>
          </div>
          <div className="p-3 rounded border flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="font-semibold">marked / shiki (Syntax Highlighting & Markdown)</div>
              <div className="text-muted text-[0.7rem]">Processed purely on server into HTML tokens</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-500 font-bold">0 KB</span> in browser bundle (was ~450 KB in SPAs)
            </div>
          </div>
          <div className="p-3 rounded border flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="font-semibold">LikeCounter Client Island</div>
              <div className="text-muted text-[0.7rem]">useState + onClick interactive bundle</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-amber-500 font-bold">~1.2 KB</span> client JS
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Next.js 4-Tier Cache Matrix Simulator ================= */

export function NextCacheMatrixLab() {
  const [requestMemo, setRequestMemo] = useState<"HIT" | "MISS">("MISS");
  const [dataCache, setDataCache] = useState<"HIT" | "MISS" | "STALE">("MISS");
  const [fullRouteCache, setFullRouteCache] = useState<"HIT" | "MISS">("MISS");
  const [routerCache, setRouterCache] = useState<"HIT" | "MISS">("MISS");
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["Initialized empty cache states."]);

  const addLog = (msg: string) => {
    setLog((prev) => [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 5) ]);
  };

  const handleFetch = (action: "initial" | "memoized" | "tag-revalidate" | "hard-refresh") => {
    if (action === "initial") {
      setRequestMemo("MISS");
      setDataCache("MISS");
      setFullRouteCache("MISS");
      setRouterCache("MISS");
      addLog("Cold request: Database queried, response cached across all 4 tiers.");
      setTimeout(() => {
        setDataCache("HIT");
        setFullRouteCache("HIT");
        setRouterCache("HIT");
      }, 300);
    } else if (action === "memoized") {
      setRequestMemo("HIT");
      addLog("Same render cycle: fetch() deduplicated by Request Memoization.");
    } else if (action === "tag-revalidate") {
      setDataCache("MISS");
      setFullRouteCache("MISS");
      setLastRevalidated(new Date().toLocaleTimeString());
      addLog("revalidateTag('products') triggered! Data Cache and Full Route Cache purged.");
    } else if (action === "hard-refresh") {
      setRequestMemo("MISS");
      setRouterCache("MISS");
      addLog("Browser hard refresh: Client Router Cache bypassed.");
    }
  };

  return (
    <div className="panel p-4 my-4" style={{ background: "var(--panel)" }}>
      <div className="flex items-center justify-between gap-2 border-b pb-3 mb-4" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <Activity size={17} style={{ color: "var(--brand)" }} />
          <span className="font-semibold text-sm">Next.js 4-Tier Caching & Revalidation Lab</span>
        </div>
        {lastRevalidated && (
          <span className="text-[0.7rem] font-mono text-emerald-500">
            Last revalidated: {lastRevalidated}
          </span>
        )}
      </div>

      {/* Interactive Trigger Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleFetch("initial")}
          className="btn btn-sm text-xs flex items-center justify-center gap-1"
        >
          <Play size={11} /> 1. Cold Request
        </button>
        <button
          type="button"
          onClick={() => handleFetch("memoized")}
          className="btn btn-sm text-xs flex items-center justify-center gap-1"
        >
          <Zap size={11} /> 2. Repeat fetch()
        </button>
        <button
          type="button"
          onClick={() => handleFetch("tag-revalidate")}
          className="btn btn-sm text-xs flex items-center justify-center gap-1"
          style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
        >
          <RefreshCw size={11} /> 3. revalidateTag()
        </button>
        <button
          type="button"
          onClick={() => handleFetch("hard-refresh")}
          className="btn btn-sm text-xs flex items-center justify-center gap-1"
        >
          <RotateCcw size={11} /> 4. Hard Refresh
        </button>
      </div>

      {/* 4 Cache Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Tier 1 */}
        <div className="p-3 rounded border text-xs" style={{ borderColor: "var(--line)", background: "var(--panel-sub)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            1. Request Memoization
          </div>
          <div className="font-semibold mb-1">Per-Request Function Dedup</div>
          <div className="text-[0.7rem] text-muted mb-2">Lifetime: Single React render cycle</div>
          <span
            className="px-2 py-0.5 rounded font-mono text-[0.7rem] font-bold"
            style={{
              background: requestMemo === "HIT" ? "var(--brand-soft)" : "var(--rose-soft)",
              color: requestMemo === "HIT" ? "var(--brand-ink)" : "var(--rose)",
            }}
          >
            STATUS: {requestMemo}
          </span>
        </div>

        {/* Tier 2 */}
        <div className="p-3 rounded border text-xs" style={{ borderColor: "var(--line)", background: "var(--panel-sub)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            2. Data Cache
          </div>
          <div className="font-semibold mb-1">Persistent fetch() Store</div>
          <div className="text-[0.7rem] text-muted mb-2">Lifetime: Persistent across deploys / tags</div>
          <span
            className="px-2 py-0.5 rounded font-mono text-[0.7rem] font-bold"
            style={{
              background: dataCache === "HIT" ? "var(--brand-soft)" : "var(--rose-soft)",
              color: dataCache === "HIT" ? "var(--brand-ink)" : "var(--rose)",
            }}
          >
            STATUS: {dataCache}
          </span>
        </div>

        {/* Tier 3 */}
        <div className="p-3 rounded border text-xs" style={{ borderColor: "var(--line)", background: "var(--panel-sub)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            3. Full Route Cache
          </div>
          <div className="font-semibold mb-1">Server HTML + RSC Payload</div>
          <div className="text-[0.7rem] text-muted mb-2">Lifetime: Persistent until revalidated</div>
          <span
            className="px-2 py-0.5 rounded font-mono text-[0.7rem] font-bold"
            style={{
              background: fullRouteCache === "HIT" ? "var(--brand-soft)" : "var(--rose-soft)",
              color: fullRouteCache === "HIT" ? "var(--brand-ink)" : "var(--rose)",
            }}
          >
            STATUS: {fullRouteCache}
          </span>
        </div>

        {/* Tier 4 */}
        <div className="p-3 rounded border text-xs" style={{ borderColor: "var(--line)", background: "var(--panel-sub)" }}>
          <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
            4. Router Cache
          </div>
          <div className="font-semibold mb-1">Client In-Memory Prefetch</div>
          <div className="text-[0.7rem] text-muted mb-2">Lifetime: Browser session / 30s-5min</div>
          <span
            className="px-2 py-0.5 rounded font-mono text-[0.7rem] font-bold"
            style={{
              background: routerCache === "HIT" ? "var(--brand-soft)" : "var(--rose-soft)",
              color: routerCache === "HIT" ? "var(--brand-ink)" : "var(--rose)",
            }}
          >
            STATUS: {routerCache}
          </span>
        </div>
      </div>

      {/* Activity Log */}
      <div className="p-2.5 rounded border text-[0.72rem] font-mono" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
        <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
          Cache Event Stream
        </div>
        {log.map((entry, idx) => (
          <div key={idx} className="leading-relaxed" style={{ color: idx === 0 ? "var(--brand-ink)" : "var(--muted)" }}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= URL State & Query Sync Lab ================= */

export function UrlStateLab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"created" | "title" | "priority">("created");
  const [page, setPage] = useState(1);
  const [navMode, setNavMode] = useState<"push" | "replace">("replace");
  const [historyStack, setHistoryStack] = useState<string[]>(["/tasks"]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (category !== "all") params.set("cat", category);
    if (sortBy !== "created") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));
    const str = params.toString();
    return str ? `?${str}` : "";
  }, [search, category, sortBy, page]);

  const currentUrl = `/tasks${queryString}`;

  const handleApply = (newUrl: string) => {
    if (navMode === "push") {
      setHistoryStack((prev) => [...prev.slice(-4), newUrl]);
    } else {
      setHistoryStack((prev) => [...prev.slice(0, -1), newUrl]);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded border text-xs" style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}>
        <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
          Simulated Browser Address Bar
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.8rem] px-2.5 py-1.5 rounded bg-black/20 border border-white/10">
          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-muted">https://app.domain.com</span>
          <span className="font-semibold text-brand-ink">{currentUrl}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Search Query (debounced in production)</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter tasks by name..."
              className="w-full pl-8 pr-3 py-1.5 rounded border text-xs bg-transparent"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Category Filter</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-2.5 py-1.5 rounded border text-xs bg-transparent"
            style={{ borderColor: "var(--line)" }}
          >
            <option value="all">All Categories</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Sort Field</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded border text-xs bg-transparent"
            style={{ borderColor: "var(--line)" }}
          >
            <option value="created">Created Date (Default)</option>
            <option value="title">Alphabetical (Title)</option>
            <option value="priority">Priority Level</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Pagination Segment</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border text-xs font-semibold disabled:opacity-40"
              style={{ borderColor: "var(--line)" }}
            >
              Prev
            </button>
            <span className="text-xs font-mono font-bold px-2">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded border text-xs font-semibold"
              style={{ borderColor: "var(--line)" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 rounded border space-y-2" style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between">
          <span className={`${label}`} style={{ color: "var(--muted)" }}>
            History Strategy: <span className="font-bold text-foreground">{navMode.toUpperCase()}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNavMode("replace")}
              className={`px-2 py-0.5 rounded text-[0.7rem] font-mono border ${navMode === "replace" ? "bg-brand-ink text-white" : "text-muted"}`}
              style={{ borderColor: "var(--line)" }}
            >
              router.replace()
            </button>
            <button
              onClick={() => setNavMode("push")}
              className={`px-2 py-0.5 rounded text-[0.7rem] font-mono border ${navMode === "push" ? "bg-brand-ink text-white" : "text-muted"}`}
              style={{ borderColor: "var(--line)" }}
            >
              router.push()
            </button>
            <button
              onClick={() => handleApply(currentUrl)}
              className="px-2.5 py-0.5 rounded text-[0.7rem] font-bold bg-blue-600 text-white"
            >
              Commit to Stack
            </button>
          </div>
        </div>
        <div className="text-[0.72rem] text-muted">
          {navMode === "replace"
            ? "Rule: Use `replace()` for keystroke filtering so Back button doesn't trap users across 20 intermediate typing states."
            : "Rule: Use `push()` only for distinct user drill-downs where users explicitly expect Back button to return to the previous view."}
        </div>
      </div>

      {/* History Stack */}
      <div className="p-2.5 rounded border text-[0.72rem] font-mono" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
        <div className={`${label} mb-1`} style={{ color: "var(--muted)" }}>
          Simulated Browser Session History (Recent Entries)
        </div>
        {historyStack.map((entry, idx) => (
          <div key={idx} className="leading-relaxed flex items-center gap-1.5">
            <span className="text-muted">[{idx + 1}]</span>
            <span className={idx === historyStack.length - 1 ? "text-emerald-400 font-bold" : "text-foreground"}>
              {entry} {idx === historyStack.length - 1 && "← Current active state"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Architecture Boundary Decision Matrix ================= */

export function ArchBoundaryLab() {
  const [selectedPattern, setSelectedPattern] = useState<"server-action" | "route-handler" | "nestjs-api">("nestjs-api");

  const patterns = {
    "nestjs-api": {
      title: "Dedicated NestJS Backend Service",
      runtime: "Node.js Long-Running Process (Fastify Engine)",
      dbModel: "Direct Connection Pool (Prisma / PgPool) — Persistent & Reused",
      authModel: "Standard Authorization Bearer Header with JWT Validation & RBAC Guards",
      securityAudit: "Complete separation of concerns. Thin controllers, DTO validation pipes, centralized exception filters, independent scale.",
      bestFor: "Enterprise CRUD, multi-tenant RBAC, financial mutations, webhooks, background queues, multi-client support (Mobile + Web).",
    },
    "server-action": {
      title: "Next.js Server Action (React 19 RPC)",
      runtime: "Serverless / Ephemeral Edge or Node execution triggered by POST",
      dbModel: "Requires serverless pooler (Supabase Pooler / Neon / Prisma Accelerate)",
      authModel: "Cookie-based session extraction inside action body (`cookies()`)",
      securityAudit: "Convenient for fast form revalidations. CAUTION: Actions are publicly exposed HTTP endpoints — must manually verify authentication and authorization in every action.",
      bestFor: "Frontend-exclusive form mutations that directly trigger `revalidatePath()` or `revalidateTag()` without third-party consumers.",
    },
    "route-handler": {
      title: "Next.js Route Handler (`app/api/*/route.ts`)",
      runtime: "Web Request/Response API Handler in Next.js Server",
      dbModel: "BFF Layer or Proxy — Should delegate core transactions to NestJS",
      authModel: "Extracts cookie or header, parses webhook signature (e.g. Stripe, GitHub)",
      securityAudit: "Ideal as a Backend-For-Frontend (BFF) proxy or external webhook receiver. Avoid writing complex business logic or raw SQL queries here.",
      bestFor: "Stripe/Resend Webhooks, Next.js Auth session callbacks, proxying requests with hidden server environment keys.",
    },
  };

  const current = patterns[selectedPattern];

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPattern("nestjs-api")}
          className={`px-3 py-1.5 rounded text-xs font-semibold border ${selectedPattern === "nestjs-api" ? "bg-brand-ink text-white" : "text-muted"}`}
          style={{ borderColor: "var(--line)" }}
        >
          1. NestJS Enterprise API
        </button>
        <button
          onClick={() => setSelectedPattern("server-action")}
          className={`px-3 py-1.5 rounded text-xs font-semibold border ${selectedPattern === "server-action" ? "bg-brand-ink text-white" : "text-muted"}`}
          style={{ borderColor: "var(--line)" }}
        >
          2. Next.js Server Action
        </button>
        <button
          onClick={() => setSelectedPattern("route-handler")}
          className={`px-3 py-1.5 rounded text-xs font-semibold border ${selectedPattern === "route-handler" ? "bg-brand-ink text-white" : "text-muted"}`}
          style={{ borderColor: "var(--line)" }}
        >
          3. Next.js Route Handler
        </button>
      </div>

      <div className="p-4 rounded border space-y-3" style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground">{current.title}</h4>
          <span className="px-2 py-0.5 rounded text-[0.68rem] font-mono uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Selected Tier
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded border" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
            <span className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
              Execution Runtime
            </span>
            <span className="font-medium text-foreground">{current.runtime}</span>
          </div>

          <div className="p-2.5 rounded border" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
            <span className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
              Database Connection Model
            </span>
            <span className="font-medium text-foreground">{current.dbModel}</span>
          </div>

          <div className="p-2.5 rounded border" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
            <span className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
              Auth & Identity Transport
            </span>
            <span className="font-medium text-foreground">{current.authModel}</span>
          </div>

          <div className="p-2.5 rounded border" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
            <span className={`${label} block mb-1`} style={{ color: "var(--muted)" }}>
              Ideal Target Workload
            </span>
            <span className="font-medium text-foreground">{current.bestFor}</span>
          </div>
        </div>

        <div className="p-2.5 rounded border text-xs" style={{ background: "var(--code-bg)", borderColor: "var(--line)" }}>
          <span className={`${label} block mb-1`} style={{ color: "var(--rose)" }}>
            Architectural Guardrail & Verification
          </span>
          <p className="text-muted leading-relaxed">{current.securityAudit}</p>
        </div>
      </div>
    </div>
  );
}

/* ================= NestJS Request Pipeline Trace Lab ================= */

export function NestPipelineLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [withError, setWithError] = useState<"none" | "unauthorized" | "validation" | "server">("none");

  const steps = [
    {
      name: "1. Global Middleware",
      role: "Logger / Correlation ID",
      desc: "Attaches `x-request-id`, starts high-precision performance timer, logs incoming method and path.",
      failAt: null,
    },
    {
      name: "2. Guards",
      role: "AuthGuard & RolesGuard",
      desc: "Extracts Bearer token from header, validates JWT signature against secret, checks `@Roles('admin')` metadata.",
      failAt: "unauthorized",
      failMessage: "401 Unauthorized: Bearer token is missing or signature verification failed.",
    },
    {
      name: "3. Interceptors (Pre-Controller)",
      role: "Logging / Timeout / Transform",
      desc: "Runs pre-controller side-effects, starts rxjs observable lifecycle, binds timeout cancellations.",
      failAt: null,
    },
    {
      name: "4. Pipes",
      role: "ValidationPipe (class-validator)",
      desc: "Transforms plain JSON payload into DTO class instance, strips unwhitelisted properties, validates decorators.",
      failAt: "validation",
      failMessage: "422 Unprocessable Entity: `email` must be an email; `password` must be longer than 8 chars.",
    },
    {
      name: "5. Controller & Domain Service",
      role: "Business Execution & Database Query",
      desc: "Controller passes sanitized DTO to domain service; service executes Prisma query inside transactional boundary.",
      failAt: "server",
      failMessage: "500 Internal Server Error: Database transaction timeout or unhandled domain constraint.",
    },
    {
      name: "6. Interceptors (Post-Controller)",
      role: "Response Transformer",
      desc: "Maps service return value into standard envelope `{ data, meta, timestamp }` and logs total latency.",
      failAt: null,
    },
    {
      name: "7. Exception Filters",
      role: "HttpExceptionFilter (RFC 7807)",
      desc: "Catches any uncaught exceptions across the entire pipeline, formats standard `application/problem+json` error response.",
      failAt: null,
    },
  ];

  const hasFailed =
    (withError === "unauthorized" && currentStep >= 1) ||
    (withError === "validation" && currentStep >= 3) ||
    (withError === "server" && currentStep >= 4);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded border" style={{ background: "var(--panel-sub)", borderColor: "var(--line)" }}>
        <div className="space-y-1">
          <div className={`${label}`} style={{ color: "var(--muted)" }}>
            Simulate Pipeline Failure Scenario
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setWithError("none");
                setCurrentStep(0);
              }}
              className={`px-2 py-1 rounded text-xs font-semibold border ${withError === "none" ? "bg-emerald-600 text-white" : "text-muted"}`}
              style={{ borderColor: "var(--line)" }}
            >
              Happy Path (200 OK)
            </button>
            <button
              onClick={() => {
                setWithError("unauthorized");
                setCurrentStep(0);
              }}
              className={`px-2 py-1 rounded text-xs font-semibold border ${withError === "unauthorized" ? "bg-rose-600 text-white" : "text-muted"}`}
              style={{ borderColor: "var(--line)" }}
            >
              Guard Failure (401)
            </button>
            <button
              onClick={() => {
                setWithError("validation");
                setCurrentStep(0);
              }}
              className={`px-2 py-1 rounded text-xs font-semibold border ${withError === "validation" ? "bg-amber-600 text-white" : "text-muted"}`}
              style={{ borderColor: "var(--line)" }}
            >
              Pipe Failure (422)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-2.5 py-1 rounded border text-xs font-semibold disabled:opacity-40"
            style={{ borderColor: "var(--line)" }}
          >
            Step Back
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1 || (hasFailed && currentStep === steps.length - 1)}
            className="px-3 py-1 rounded bg-brand-ink text-white text-xs font-bold"
          >
            Step Forward
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="space-y-2">
        {steps.map((s, idx) => {
          const isActive = currentStep === idx;
          const isPassed = currentStep > idx;
          const isErrorStep =
            (withError === "unauthorized" && idx === 1) ||
            (withError === "validation" && idx === 3) ||
            (withError === "server" && idx === 4);

          return (
            <div
              key={idx}
              className={`p-2.5 rounded border transition-all ${
                isActive
                  ? isErrorStep
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-blue-500 bg-blue-500/10"
                  : isPassed
                  ? "opacity-60 border-line bg-panel-sub"
                  : "opacity-40 border-line bg-panel"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">{s.name}</span>
                  <span className="text-[0.7rem] px-1.5 py-0.5 rounded bg-black/20 text-muted font-mono">{s.role}</span>
                </div>
                {isActive && (
                  <span
                    className={`text-[0.68rem] font-mono font-bold px-2 py-0.5 rounded ${
                      isErrorStep ? "bg-rose-500 text-white" : "bg-blue-600 text-white"
                    }`}
                  >
                    {isErrorStep ? "TRIPPED EXCEPTION" : "CURRENTLY EXECUTING"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
              {isActive && isErrorStep && s.failMessage && (
                <div className="mt-2 p-2 rounded bg-rose-950/50 border border-rose-500/40 text-rose-300 font-mono text-[0.72rem]">
                  🚨 {s.failMessage} — Request short-circuits straight to Exception Filter!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= Fastify Trap Inspector Lab ================= */

interface FastifyTrap {
  id: string;
  title: string;
  category: "Routing" | "Response" | "Middleware" | "Upload" | "Deployment";
  expressSnippet: string;
  fastifySnippet: string;
  runtimeError: string;
  why: string;
  rule: string;
}

const FASTIFY_TRAPS: FastifyTrap[] = [
  {
    id: "res-json",
    title: "Calling res.json() directly",
    category: "Response",
    expressSnippet: `// ❌ Express pattern in Controller
@Get('user')
getUser(@Res() res: any) {
  return res.json({ id: 1, name: 'Alice' });
}`,
    fastifySnippet: `// ✅ Fastify / NestJS pattern
@Get('user')
getUser(@Res() reply: FastifyReply) {
  // Option A: Use Fastify's .send()
  return reply.send({ id: 1, name: 'Alice' });
  
  // Option B (Preferred): Let NestJS serialize return value
  // return { id: 1, name: 'Alice' };
}`,
    runtimeError: "TypeError: res.json is not a function\n    at UserController.getUser (/src/user.controller.ts:14:15)",
    why: "Fastify's response object is `FastifyReply`, which uses `reply.send()` instead of Express's `res.json()`. In standard NestJS, avoiding `@Res()` altogether and returning plain objects is the cleanest, portable approach.",
    rule: "Never call `.json()`. Use `reply.send()` or simply return the plain JavaScript object from the controller method.",
  },
  {
    id: "listen-host",
    title: "Omitting '0.0.0.0' in app.listen()",
    category: "Deployment",
    expressSnippet: `// ❌ Express default assumption
const port = process.env.PORT || 3001;
await app.listen(port);
// Express binds to 0.0.0.0 by default`,
    fastifySnippet: `// ✅ Fastify requires explicit 0.0.0.0
const port = Number(process.env.PORT) || 3001;
await app.listen(port, '0.0.0.0');
// Binds to all network interfaces for container ingress`,
    runtimeError: "Container Healthcheck Failed: Connection refused at 10.0.4.12:3001 (Fastify listening only on 127.0.0.1)",
    why: "Fastify defaults its listen address to `127.0.0.1` (localhost only) for security. Inside Docker containers and Cloud Run, traffic is routed to the container IP, which is rejected unless bound to `0.0.0.0`.",
    rule: "Always pass `'0.0.0.0'` as the second argument to `app.listen(port, '0.0.0.0')` when using FastifyAdapter.",
  },
  {
    id: "multer-upload",
    title: "Using Multer (FileInterceptor) on Fastify",
    category: "Upload",
    expressSnippet: `// ❌ Multer (Express FileInterceptor)
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { size: file.size };
}`,
    fastifySnippet: `// ✅ Fastify Multipart (@fastify/multipart)
// In main.ts: app.register(fastifyMultipart, { limits: { fileSize: 10_000_000 } });

@Post('upload')
async uploadFile(@Req() req: FastifyRequest) {
  const data = await req.file();
  const buffer = await data.toBuffer();
  return { filename: data.filename, size: buffer.length };
}`,
    runtimeError: "Error: Nest can not find a matching FileInterceptor implementation for FastifyAdapter.",
    why: "Multer is built strictly around Express middleware architecture. Fastify processes multipart requests via streaming plugins (`@fastify/multipart`), which consumes streams with much lower memory overhead.",
    rule: "Use `@fastify/multipart` with stream consumption or `@nest-lab/fastify-multer` rather than vanilla Express `FileInterceptor`.",
  },
  {
    id: "express-middleware",
    title: "app.use(cors()) / Express Middleware",
    category: "Middleware",
    expressSnippet: `// ❌ Express middleware import
import cors from 'cors';
import helmet from 'helmet';

app.use(cors());
app.use(helmet());`,
    fastifySnippet: `// ✅ Fastify native plugins & NestJS CORS
// Native NestJS CORS config:
app.enableCors({ origin: 'http://localhost:3000', credentials: true });

// Or Fastify plugin:
import helmet from '@fastify/helmet';
await app.register(helmet, { contentSecurityPolicy: false });`,
    runtimeError: "TypeError: app.use is not a function or incoming request hung indefinitely waiting for next()",
    why: "Fastify uses a lifecycle hook system (`onRequest`, `preHandler`) rather than Express's `(req, res, next)` middleware chain. Express middleware needs `@fastify/middie` or should be replaced with native `@fastify/*` plugins.",
    rule: "Prefer NestJS native features (`app.enableCors()`) or official `@fastify/*` plugins via `app.register()`.",
  },
  {
    id: "wildcard-routes",
    title: "Wildcard route pattern app.get('*')",
    category: "Routing",
    expressSnippet: `// ❌ Express wildcard route syntax
@Get('*')
catchAll() {
  return { message: 'Not found or fallback' };
}`,
    fastifySnippet: `// ✅ Fastify wildcard route syntax
@Get('*path') // Or @Get('/*')
catchAll(@Param('path') path: string) {
  return { message: 'Fallback for ' + path };
}`,
    runtimeError: "FastifyError [FST_ERR_BAD_URL]: Catch-all wildcard routes in Fastify must specify a parameter name or slash pattern",
    why: "Fastify's Radix tree router (`find-my-way`) is mathematically structured for peak performance and requires explicit parameter names for wildcard segments.",
    rule: "Use `@Get('*path')` or `@Get('/*')` instead of plain `*` for catch-all routes.",
  },
];

export function FastifyTrapLab() {
  const [selectedId, setSelectedId] = useState<string>("res-json");
  const trap = FASTIFY_TRAPS.find((t) => t.id === selectedId) || FASTIFY_TRAPS[0];

  return (
    <div className="my-6 rounded-xl border border-line bg-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Express → Fastify Trap Inspector</h4>
            <p className="text-xs text-muted">Examine why common Express tutorials crash when running the FastifyAdapter in NestJS</p>
          </div>
        </div>
        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
          DIAGNOSTIC LAB
        </span>
      </div>

      {/* Trap selector tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {FASTIFY_TRAPS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`px-2.5 py-2 rounded-lg text-left text-xs font-mono transition-all flex flex-col gap-1 border ${
              selectedId === t.id
                ? "bg-blue-600/15 border-blue-500/60 text-blue-300 shadow-sm"
                : "bg-panel-sub border-line text-muted hover:text-foreground hover:bg-black/20"
            }`}
          >
            <span className="text-[0.65rem] opacity-60 uppercase">{t.category}</span>
            <span className="font-semibold text-[0.72rem] truncate">{t.title}</span>
          </button>
        ))}
      </div>

      {/* Code comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Express trap */}
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Express Tutorial Trap (Fails on Fastify)
            </span>
          </div>
          <pre className="p-2.5 rounded bg-black/40 text-rose-200 font-mono text-[0.72rem] overflow-x-auto leading-relaxed whitespace-pre">
            {trap.expressSnippet}
          </pre>
          <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono text-[0.7rem] leading-normal">
            <span className="font-bold block mb-1">💥 Runtime Error / Failure:</span>
            {trap.runtimeError}
          </div>
        </div>

        {/* Fastify solution */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Fastify / NestJS Canonical Fix
            </span>
          </div>
          <pre className="p-2.5 rounded bg-black/40 text-emerald-200 font-mono text-[0.72rem] overflow-x-auto leading-relaxed whitespace-pre">
            {trap.fastifySnippet}
          </pre>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[0.7rem] leading-normal">
            <span className="font-bold block mb-1">💡 Architectural Reason:</span>
            {trap.why}
          </div>
        </div>
      </div>

      {/* Bottom Rule Banner */}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-200">
        <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-blue-300 font-mono">GOLDEN RULE: </span>
          <span>{trap.rule}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= NestJS RBAC Guard & Reflector Lab ================= */

type UserRole = "GUEST" | "MEMBER" | "MANAGER" | "ADMIN";

interface GuardRoute {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  requiredRole?: UserRole[];
  requiredScope?: string;
  isPublic?: boolean;
  codeSnippet: string;
}

const GUARD_ROUTES: GuardRoute[] = [
  {
    id: "public-health",
    method: "GET",
    path: "/api/v1/health",
    isPublic: true,
    codeSnippet: `@Get('health')
@Public() // reflector metadata: isPublic = true
getHealth() {
  return { status: 'healthy', uptime: 42000 };
}`,
  },
  {
    id: "member-tasks",
    method: "GET",
    path: "/api/v1/tasks",
    requiredRole: ["MEMBER", "MANAGER", "ADMIN"],
    codeSnippet: `@Get('tasks')
@UseGuards(AuthGuard) // Checks Authorization: Bearer JWT
getTasks(@CurrentUser() user: UserEntity) {
  return this.tasksService.findByUser(user.id);
}`,
  },
  {
    id: "manager-create",
    method: "POST",
    path: "/api/v1/projects",
    requiredRole: ["MANAGER", "ADMIN"],
    requiredScope: "projects:write",
    codeSnippet: `@Post('projects')
@UseGuards(AuthGuard, RolesGuard)
@Roles('MANAGER', 'ADMIN')
@RequireScope('projects:write')
createProject(@Body() dto: CreateProjectDto) {
  return this.projectService.create(dto);
}`,
  },
  {
    id: "admin-delete",
    method: "DELETE",
    path: "/api/v1/organizations/:id",
    requiredRole: ["ADMIN"],
    requiredScope: "org:admin",
    codeSnippet: `@Delete('organizations/:id')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@RequireScope('org:admin')
deleteOrg(@Param('id') id: string) {
  return this.orgService.destroy(id);
}`,
  },
];

export function NestGuardLab() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("manager-create");
  const [userRole, setUserRole] = useState<UserRole>("MEMBER");
  const [hasToken, setHasToken] = useState<boolean>(true);
  const [userScopes, setUserScopes] = useState<string[]>(["projects:read", "tasks:write"]);

  const route = GUARD_ROUTES.find((r) => r.id === selectedRouteId) || GUARD_ROUTES[0];

  // Evaluation logic
  const isAuthPassed = route.isPublic || hasToken;
  const isRolePassed =
    route.isPublic ||
    !route.requiredRole ||
    (isAuthPassed && userRole !== "GUEST" && route.requiredRole.includes(userRole));
  const isScopePassed =
    route.isPublic ||
    !route.requiredScope ||
    (isAuthPassed && isRolePassed && userScopes.includes(route.requiredScope));

  const isOverallPassed = isAuthPassed && isRolePassed && isScopePassed;

  let failureReason = "";
  let statusCode = 200;
  if (!isAuthPassed) {
    statusCode = 401;
    failureReason = "AuthGuard failed: Missing or expired Bearer token in Authorization header.";
  } else if (!isRolePassed) {
    statusCode = 403;
    failureReason = `RolesGuard failed: User role '${userRole}' does not satisfy required roles [${route.requiredRole?.join(", ")}].`;
  } else if (!isScopePassed) {
    statusCode = 403;
    failureReason = `ScopeGuard failed: User token missing required scope '${route.requiredScope}'.`;
  }

  const toggleScope = (scope: string) => {
    setUserScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="my-6 rounded-xl border border-line bg-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">NestJS RBAC Guard & Reflector Simulator</h4>
            <p className="text-xs text-muted">Test how ExecutionContext, Reflector metadata, and Guard chains authorize incoming requests</p>
          </div>
        </div>
        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
          SECURITY LAB
        </span>
      </div>

      {/* Grid: Request Configurator & Route Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Client / User Context */}
        <div className="p-3.5 rounded-lg bg-panel-sub border border-line space-y-3">
          <span className="text-xs font-mono font-bold text-muted uppercase">1. Client Request Context</span>

          {/* Token toggle */}
          <div className="flex items-center justify-between p-2 rounded bg-black/20 border border-line">
            <span className="text-xs font-mono text-foreground">Authorization Header (JWT)</span>
            <button
              onClick={() => setHasToken(!hasToken)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                hasToken ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {hasToken ? "Bearer valid_jwt" : "None (Anonymous)"}
            </button>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-mono text-muted">User Assigned Role (JWT Claim):</label>
            <div className="grid grid-cols-4 gap-1">
              {(["GUEST", "MEMBER", "MANAGER", "ADMIN"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  disabled={!hasToken && r !== "GUEST"}
                  onClick={() => setUserRole(r)}
                  className={`px-2 py-1 rounded text-xs font-mono transition-all border ${
                    userRole === r
                      ? "bg-blue-600/30 border-blue-500 text-blue-300 font-bold"
                      : "bg-black/20 border-line text-muted hover:text-foreground disabled:opacity-30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Scopes selector */}
          <div className="space-y-1.5">
            <label className="text-[0.7rem] font-mono text-muted">OAuth / API Scopes:</label>
            <div className="flex flex-wrap gap-1.5">
              {["tasks:read", "tasks:write", "projects:write", "org:admin"].map((scope) => (
                <button
                  key={scope}
                  disabled={!hasToken}
                  onClick={() => toggleScope(scope)}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-mono transition-all border ${
                    userScopes.includes(scope) && hasToken
                      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                      : "bg-black/20 border-line text-muted hover:text-foreground disabled:opacity-30"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Target Route */}
        <div className="p-3.5 rounded-lg bg-panel-sub border border-line space-y-3">
          <span className="text-xs font-mono font-bold text-muted uppercase">2. Target Controller Endpoint</span>
          <div className="space-y-1.5">
            {GUARD_ROUTES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`w-full p-2 rounded text-left font-mono text-xs flex items-center justify-between border transition-all ${
                  selectedRouteId === r.id
                    ? "bg-blue-600/15 border-blue-500 text-blue-300 shadow-sm"
                    : "bg-black/20 border-line text-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold ${
                    r.method === "GET" ? "bg-emerald-500/20 text-emerald-400" :
                    r.method === "POST" ? "bg-blue-500/20 text-blue-400" :
                    r.method === "DELETE" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {r.method}
                  </span>
                  <span>{r.path}</span>
                </div>
                {r.isPublic ? (
                  <span className="text-[0.65rem] text-emerald-400 font-bold">@Public</span>
                ) : (
                  <span className="text-[0.65rem] text-amber-400">
                    {r.requiredRole ? r.requiredRole.join("/") : "Auth"}
                  </span>
                )}
              </button>
            ))}
          </div>

          <pre className="p-2 rounded bg-black/40 text-[0.7rem] font-mono text-blue-200 overflow-x-auto whitespace-pre leading-relaxed">
            {route.codeSnippet}
          </pre>
        </div>
      </div>

      {/* Execution Pipeline Walkthrough */}
      <div className="p-3.5 rounded-lg bg-black/30 border border-line space-y-3">
        <span className="text-xs font-mono font-bold text-muted uppercase flex items-center justify-between">
          <span>3. NestJS ExecutionContext Guard Pipeline</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
            isOverallPassed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
          }`}>
            HTTP {statusCode} {isOverallPassed ? "ALLOWED" : "REJECTED"}
          </span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Step 1: Reflector Metadata */}
          <div className="p-2.5 rounded border border-line bg-panel space-y-1">
            <span className="text-[0.65rem] font-mono text-muted uppercase block">Step 1: Reflector</span>
            <div className="text-xs font-mono text-foreground">
              {route.isPublic ? "isPublic: true" : `Roles: [${route.requiredRole?.join(", ")}]`}
            </div>
            <span className="text-[0.65rem] text-muted block">Extracts metadata via context.getHandler()</span>
          </div>

          {/* Step 2: AuthGuard */}
          <div className={`p-2.5 rounded border space-y-1 ${
            isAuthPassed ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300" : "border-rose-500/40 bg-rose-950/20 text-rose-300"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-mono uppercase font-bold">Step 2: AuthGuard</span>
              <span>{isAuthPassed ? "✅ PASS" : "❌ FAIL"}</span>
            </div>
            <span className="text-[0.7rem] block">
              {route.isPublic ? "Bypassed (@Public)" : hasToken ? "JWT Validated -> req.user" : "No Bearer Token"}
            </span>
          </div>

          {/* Step 3: RolesGuard / ScopeGuard */}
          <div className={`p-2.5 rounded border space-y-1 ${
            !isAuthPassed ? "border-line bg-panel text-muted opacity-50" :
            isRolePassed && isScopePassed ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300" : "border-rose-500/40 bg-rose-950/20 text-rose-300"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-mono uppercase font-bold">Step 3: RolesGuard</span>
              <span>{!isAuthPassed ? "—" : isRolePassed && isScopePassed ? "✅ PASS" : "❌ FAIL"}</span>
            </div>
            <span className="text-[0.7rem] block">
              {route.isPublic ? "Public endpoint" : !isAuthPassed ? "Skipped" : isRolePassed && isScopePassed ? "Role & Scope verified" : failureReason}
            </span>
          </div>
        </div>

        {/* Response / Exception Envelope */}
        <div className="p-2.5 rounded bg-black/50 border border-line text-xs font-mono space-y-1">
          <span className="text-[0.65rem] text-muted uppercase block">Generated HTTP Response:</span>
          {isOverallPassed ? (
            <pre className="text-emerald-400 text-[0.72rem]">
              {`HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "data": { "success": true, "route": "${route.path}" },\n  "statusCode": 200,\n  "timestamp": "${new Date().toISOString()}"\n}`}
            </pre>
          ) : (
            <pre className="text-rose-400 text-[0.72rem]">
              {`HTTP/1.1 ${statusCode} ${statusCode === 401 ? "Unauthorized" : "Forbidden"}\nContent-Type: application/json\n\n{\n  "statusCode": ${statusCode},\n  "error": "${statusCode === 401 ? "Unauthorized" : "Forbidden"}",\n  "message": "${failureReason}",\n  "timestamp": "${new Date().toISOString()}"\n}`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= PostgreSQL EXPLAIN ANALYZE Lab ================= */

interface ExplainScenario {
  id: string;
  title: string;
  query: string;
  availableIndexes: string[];
  totalRows: number;
  unindexedPlan: {
    scanType: string;
    cost: string;
    actualTime: string;
    rowsReturned: number;
    rowsFiltered: number;
    buffers: string;
    explanation: string;
  };
  indexedPlan: {
    scanType: string;
    cost: string;
    actualTime: string;
    rowsReturned: number;
    rowsFiltered: number;
    buffers: string;
    explanation: string;
  };
}

const EXPLAIN_SCENARIOS: ExplainScenario[] = [
  {
    id: "filter-project-status",
    title: "1. Filter by Project & Status",
    query: `SELECT id, title, priority, created_at
FROM tasks
WHERE project_id = 'proj-419b' AND status = 'IN_PROGRESS'
ORDER BY created_at DESC
LIMIT 20;`,
    availableIndexes: ["CREATE INDEX idx_tasks_proj_status ON tasks(project_id, status, created_at DESC);"],
    totalRows: 1_250_000,
    unindexedPlan: {
      scanType: "Seq Scan on tasks",
      cost: "0.00..31450.00",
      actualTime: "184.62 ms",
      rowsReturned: 20,
      rowsFiltered: 1_249_800,
      buffers: "shared hit=1240 read=14520",
      explanation:
        "Sequential scan loaded all 1.25M heap tuples from disk, evaluated WHERE filter row-by-row, collected 20 matches, and sorted in memory.",
    },
    indexedPlan: {
      scanType: "Index Scan using idx_tasks_proj_status",
      cost: "0.42..8.44",
      actualTime: "0.38 ms",
      rowsReturned: 20,
      rowsFiltered: 0,
      buffers: "shared hit=4",
      explanation:
        "B-Tree index traversed directly to 'proj-419b' + 'IN_PROGRESS' branch in O(log N) operations. The pre-sorted B-Tree avoided an explicit Sort node completely.",
    },
  },
  {
    id: "partial-active-tasks",
    title: "2. Querying Active (Non-Archived) Tasks",
    query: `SELECT id, title, assignee_id
FROM tasks
WHERE is_archived = false AND priority = 'CRITICAL';`,
    availableIndexes: ["CREATE INDEX idx_active_critical ON tasks(priority) WHERE is_archived = false;"],
    totalRows: 2_000_000,
    unindexedPlan: {
      scanType: "Seq Scan on tasks",
      cost: "0.00..48920.00",
      actualTime: "242.10 ms",
      rowsReturned: 142,
      rowsFiltered: 1_999_858,
      buffers: "shared hit=800 read=24200",
      explanation:
        "Scanned all 2,000,000 tasks including 1.8M archived historical tasks from past years to find just 142 active critical items.",
    },
    indexedPlan: {
      scanType: "Bitmap Index Scan using idx_active_critical",
      cost: "4.12..142.30",
      actualTime: "0.84 ms",
      rowsReturned: 142,
      rowsFiltered: 0,
      buffers: "shared hit=6",
      explanation:
        "Partial Index contains only non-archived rows (~10% of total table). Index size is only 4MB instead of 45MB, keeping it warm in RAM cache forever.",
    },
  },
  {
    id: "email-lookup",
    title: "3. User Email Exact Match",
    query: `SELECT id, email, password_hash, role
FROM users
WHERE email = 'alex.dev@taskforge.io';`,
    availableIndexes: ["CREATE UNIQUE INDEX idx_users_email ON users(email);"],
    totalRows: 500_000,
    unindexedPlan: {
      scanType: "Seq Scan on users",
      cost: "0.00..12400.00",
      actualTime: "48.20 ms",
      rowsReturned: 1,
      rowsFiltered: 499_999,
      buffers: "shared read=5400",
      explanation:
        "Scanned all 500,000 user records and compared string equality on every single row.",
    },
    indexedPlan: {
      scanType: "Index Scan using idx_users_email",
      cost: "0.42..8.44",
      actualTime: "0.09 ms",
      rowsReturned: 1,
      rowsFiltered: 0,
      buffers: "shared hit=3",
      explanation:
        "Unique B-Tree index lookup directly retrieved the exact tuple pointer in 3 page reads. Total query execution time: 90 microseconds.",
    },
  },
];

export function SqlExplainLab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("filter-project-status");
  const [isIndexEnabled, setIsIndexEnabled] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const scenario =
    EXPLAIN_SCENARIOS.find((s) => s.id === selectedScenarioId) || EXPLAIN_SCENARIOS[0];

  const plan = isIndexEnabled ? scenario.indexedPlan : scenario.unindexedPlan;

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 200);
  };

  const speedupFactor = (
    parseFloat(scenario.unindexedPlan.actualTime) / parseFloat(scenario.indexedPlan.actualTime)
  ).toFixed(0);

  return (
    <div className="my-6 rounded-xl border border-line bg-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">PostgreSQL EXPLAIN ANALYZE Diagnostic Lab</h4>
            <p className="text-xs text-muted">Inspect query planner costs, buffer page reads, and Sequential vs Index scan mechanics</p>
          </div>
        </div>
        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
          QUERY OPTIMIZER
        </span>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {EXPLAIN_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedScenarioId(s.id)}
            className={`p-2.5 rounded-lg text-left border transition-all ${
              selectedScenarioId === s.id
                ? "bg-emerald-600/15 border-emerald-500 text-emerald-300 shadow-sm"
                : "bg-panel-sub border-line text-muted hover:text-foreground"
            }`}
          >
            <div className="font-mono text-xs font-semibold">{s.title}</div>
            <div className="text-[0.68rem] text-muted mt-0.5 font-mono">
              Table size: {(s.totalRows / 1_000_000).toFixed(1)}M rows
            </div>
          </button>
        ))}
      </div>

      {/* Query & Index Toggle Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: SQL Query */}
        <div className="p-3.5 rounded-lg bg-panel-sub border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-muted uppercase">SQL Query Target</span>
            <button
              onClick={handleRunQuery}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold transition-all"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? "animate-spin" : ""}`} />
              Run EXPLAIN
            </button>
          </div>
          <pre className="p-3 rounded bg-black/50 text-[0.72rem] font-mono text-blue-200 overflow-x-auto whitespace-pre leading-relaxed">
            {scenario.query}
          </pre>
        </div>

        {/* Right: Index Switchboard */}
        <div className="p-3.5 rounded-lg bg-panel-sub border border-line space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-muted uppercase">Index Configuration</span>
            <button
              onClick={() => setIsIndexEnabled(!isIndexEnabled)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border ${
                isIndexEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  : "bg-rose-500/20 text-rose-400 border-rose-500/50"
              }`}
            >
              {isIndexEnabled ? "INDEX ACTIVE (ON)" : "NO INDEX (OFF)"}
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[0.7rem] font-mono text-muted">Available Index DDL:</span>
            <pre className="p-2 rounded bg-black/40 text-[0.7rem] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
              {scenario.availableIndexes[0]}
            </pre>
          </div>

          <div className="p-2.5 rounded bg-black/30 border border-line text-xs font-mono text-muted flex items-center justify-between">
            <span>Index Speedup Multiplier:</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">~{speedupFactor}× FASTER</span>
          </div>
        </div>
      </div>

      {/* Plan Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-lg bg-panel-sub border border-line">
          <span className="text-[0.65rem] font-mono text-muted uppercase block">Scan Strategy</span>
          <span className={`text-xs font-mono font-bold block mt-1 ${isIndexEnabled ? "text-emerald-400" : "text-rose-400"}`}>
            {plan.scanType.split(" ")[0]} {plan.scanType.split(" ")[1]}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-panel-sub border border-line">
          <span className="text-[0.65rem] font-mono text-muted uppercase block">Execution Time</span>
          <span className={`text-xs font-mono font-bold block mt-1 ${isIndexEnabled ? "text-emerald-400" : "text-rose-400"}`}>
            {plan.actualTime}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-panel-sub border border-line">
          <span className="text-[0.65rem] font-mono text-muted uppercase block">Estimated Cost</span>
          <span className="text-xs font-mono font-bold text-foreground block mt-1">
            {plan.cost}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-panel-sub border border-line">
          <span className="text-[0.65rem] font-mono text-muted uppercase block">Buffer Cache / Disk</span>
          <span className="text-xs font-mono font-bold text-foreground block mt-1">
            {plan.buffers}
          </span>
        </div>
      </div>

      {/* Raw EXPLAIN Output Box */}
      <div className="p-3.5 rounded-lg bg-black/60 border border-line space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-muted uppercase">EXPLAIN (ANALYZE, BUFFERS) Execution Plan</span>
          <span className={`text-[0.68rem] font-mono px-2 py-0.5 rounded ${isIndexEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
            {isIndexEnabled ? "OPTIMAL PLAN" : "EXPENSIVE SEQ SCAN"}
          </span>
        </div>

        <pre className="p-3 rounded bg-black/80 text-[0.72rem] font-mono text-emerald-200 overflow-x-auto whitespace-pre leading-relaxed border border-white/5">
{`QUERY PLAN:
->  ${plan.scanType}  (cost=${plan.cost} rows=${plan.rowsReturned} width=128) (actual time=0.04..${plan.actualTime} rows=${plan.rowsReturned} loops=1)
      ${isIndexEnabled ? `Index Cond: (project_id = 'proj-419b'::text AND status = 'IN_PROGRESS'::text)` : `Filter: ((project_id = 'proj-419b'::text) AND (status = 'IN_PROGRESS'::text))\n      Rows Removed by Filter: ${plan.rowsFiltered}`}
      Buffers: ${plan.buffers}
Planning Time: 0.12 ms
Execution Time: ${plan.actualTime}`}
        </pre>

        <p className="text-xs text-muted leading-relaxed font-sans pt-1">
          <strong className="text-foreground">Why this happens:</strong> {plan.explanation}
        </p>
      </div>
    </div>
  );
}

/* ================= Prisma Query Lab ================= */

interface PrismaQueryScenario {
  id: string;
  name: string;
  category: "select vs include" | "nested writes" | "relational filters" | "transactions";
  prismaCode: string;
  sqlGenerated: string[];
  inferredType: string;
  overfetchWarning?: string;
  sqlRoundtrips: number;
}

const PRISMA_SCENARIOS: PrismaQueryScenario[] = [
  {
    id: "include-overfetch",
    name: "findMany with include: { tasks: true }",
    category: "select vs include",
    prismaCode: `const projects = await prisma.project.findMany({
  where: { ownerId: "usr_100" },
  include: {
    tasks: true, // Includes all task columns (description, logs, metadata)
  },
});`,
    sqlGenerated: [
      `SELECT "id", "name", "slug", "ownerId", "createdAt" FROM "Project" WHERE "ownerId" = $1;`,
      `SELECT "id", "projectId", "title", "description", "status", "priority", "createdAt", "updatedAt" FROM "Task" WHERE "projectId" IN ($1, $2, $3);`,
    ],
    inferredType: `(Project & { tasks: Task[] })[]`,
    overfetchWarning: "⚠️ Overfetching Risk: `include: true` loads all Task columns including heavy text fields `description` and full timestamps.",
    sqlRoundtrips: 2,
  },
  {
    id: "select-lean",
    name: "findMany with fine-grained select",
    category: "select vs include",
    prismaCode: `const projects = await prisma.project.findMany({
  where: { ownerId: "usr_100" },
  select: {
    id: true,
    name: true,
    tasks: {
      where: { status: "IN_PROGRESS" },
      select: { id: true, title: true, priority: true },
    },
  },
});`,
    sqlGenerated: [
      `SELECT "id", "name" FROM "Project" WHERE "ownerId" = $1;`,
      `SELECT "id", "projectId", "title", "priority" FROM "Task" WHERE "projectId" IN ($1, $2) AND "status" = $3;`,
    ],
    inferredType: `{ id: string; name: string; tasks: { id: string; title: string; priority: TaskPriority }[] }[]`,
    sqlRoundtrips: 2,
  },
  {
    id: "relational-filter-some",
    name: "Relational Filter: projects with urgent open tasks",
    category: "relational filters",
    prismaCode: `const urgentProjects = await prisma.project.findMany({
  where: {
    tasks: {
      some: {
        priority: "URGENT",
        status: { not: "DONE" },
      },
    },
  },
});`,
    sqlGenerated: [
      `SELECT "p"."id", "p"."name", "p"."slug", "p"."ownerId"
FROM "Project" AS "p"
WHERE EXISTS (
  SELECT 1 FROM "Task" AS "t"
  WHERE "t"."projectId" = "p"."id"
    AND "t"."priority" = 'URGENT'
    AND "t"."status" != 'DONE'
);`,
    ],
    inferredType: `Project[]`,
    sqlRoundtrips: 1,
  },
  {
    id: "nested-create",
    name: "Nested Atomic Create (Project + Initial Tasks)",
    category: "nested writes",
    prismaCode: `const newProject = await prisma.project.create({
  data: {
    name: "Q4 Infrastructure Migration",
    slug: "q4-infra",
    owner: { connect: { id: "usr_1" } },
    tasks: {
      create: [
        { title: "Benchmark Postgres connection pool", status: "TODO" },
        { title: "Audit Prisma 7.9.15 config", status: "TODO" },
      ],
    },
  },
  include: { tasks: true },
});`,
    sqlGenerated: [
      `BEGIN;`,
      `INSERT INTO "Project" ("id", "name", "slug", "ownerId", "createdAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING "id";`,
      `INSERT INTO "Task" ("id", "projectId", "title", "status") VALUES ($1, $2, $3, $4), ($5, $6, $7, $8);`,
      `COMMIT;`,
    ],
    inferredType: `Project & { tasks: Task[] }`,
    sqlRoundtrips: 1,
  },
];

export function PrismaQueryLab() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("include-overfetch");
  const scenario = PRISMA_SCENARIOS.find((s) => s.id === activeScenarioId) || PRISMA_SCENARIOS[0];

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Prisma 7.9.15 Query Inspector
          </span>
          <h4 className="text-sm font-semibold mt-1">Prisma Client vs Generated SQL Engine</h4>
        </div>
        <div className="text-xs text-muted">
          Database Roundtrips: <span className="font-mono text-emerald-400 font-bold">{scenario.sqlRoundtrips}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-3">
        {PRISMA_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenarioId(s.id)}
            className={`px-2.5 py-1.5 text-xs text-left rounded font-medium border transition-colors ${
              activeScenarioId === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="flex flex-col space-y-1.5">
          <div className="text-[0.7rem] uppercase font-mono tracking-wide text-muted flex items-center justify-between">
            <span>TypeScript Prisma Query</span>
            <span className="text-[0.65rem] text-indigo-400">Client-Side</span>
          </div>
          <pre className="p-3 rounded bg-black/80 text-[0.72rem] font-mono text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed border border-white/5 flex-1 min-h-[160px]">
            {scenario.prismaCode}
          </pre>
        </div>

        <div className="flex flex-col space-y-1.5">
          <div className="text-[0.7rem] uppercase font-mono tracking-wide text-muted flex items-center justify-between">
            <span>PostgreSQL Wire Execution</span>
            <span className="text-[0.65rem] text-emerald-400">Database Engine</span>
          </div>
          <div className="p-3 rounded bg-black/80 text-[0.72rem] font-mono text-emerald-200 overflow-x-auto whitespace-pre leading-relaxed border border-white/5 flex-1 min-h-[160px] flex flex-col justify-between">
            <div className="space-y-2">
              {scenario.sqlGenerated.map((sql, i) => (
                <div key={i} className="border-l-2 border-emerald-500/50 pl-2">
                  <div className="text-[0.62rem] text-muted font-sans">Query #{i + 1}</div>
                  <div className="text-emerald-300">{sql}</div>
                </div>
              ))}
            </div>
            {scenario.overfetchWarning && (
              <div className="mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-800/40 text-[0.68rem] text-amber-300 font-sans">
                {scenario.overfetchWarning}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[0.72rem] text-muted">
        <div>
          <span className="font-semibold text-foreground">Inferred Return Type: </span>
          <code className="text-violet-300 font-mono">{scenario.inferredType}</code>
        </div>
      </div>
    </div>
  );
}

/* ================= N+1 Query & Batching Lab ================= */

export function NPlusOneLab() {
  const [recordCount, setRecordCount] = useState<number>(25);
  const [strategy, setStrategy] = useState<"naive" | "include" | "dataloader">("naive");
  const [networkLatencyMs, setNetworkLatencyMs] = useState<number>(1.5);

  const queryCount = strategy === "naive" ? 1 + recordCount : 2;
  const totalDbTimeMs = strategy === "naive" 
    ? (recordCount * (1.2 + networkLatencyMs)).toFixed(1)
    : (2.4 + networkLatencyMs * 2).toFixed(1);
  const dbRoundtrips = strategy === "naive" ? recordCount + 1 : 2;

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
            N+1 Diagnostics & Batching Lab
          </span>
          <h4 className="text-sm font-semibold mt-1">101 Queries vs 2: The Waterfall Elimination</h4>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-muted">
            Roundtrips: <span className={`font-mono font-bold ${strategy === "naive" ? "text-rose-400" : "text-emerald-400"}`}>{dbRoundtrips}</span>
          </div>
          <div className="text-muted">
            Total Latency: <span className={`font-mono font-bold ${strategy === "naive" ? "text-rose-400" : "text-emerald-400"}`}>{totalDbTimeMs}ms</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div>
          <label className="text-[0.7rem] uppercase font-mono text-muted block mb-1">
            Parent Records: <span className="text-foreground font-bold">{recordCount}</span>
          </label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={recordCount}
            onChange={(e) => setRecordCount(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div>
          <label className="text-[0.7rem] uppercase font-mono text-muted block mb-1">
            Network Latency: <span className="text-foreground font-bold">{networkLatencyMs}ms / trip</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={networkLatencyMs}
            onChange={(e) => setNetworkLatencyMs(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div>
          <label className="text-[0.7rem] uppercase font-mono text-muted block mb-1">Loading Strategy</label>
          <div className="flex rounded border border-border overflow-hidden">
            <button
              onClick={() => setStrategy("naive")}
              className={`flex-1 py-1 text-[0.72rem] font-medium transition-colors ${
                strategy === "naive" ? "bg-rose-600 text-white font-bold" : "bg-muted/40 hover:bg-muted text-muted-foreground"
              }`}
            >
              Loops (N+1)
            </button>
            <button
              onClick={() => setStrategy("include")}
              className={`flex-1 py-1 text-[0.72rem] font-medium transition-colors ${
                strategy === "include" ? "bg-emerald-600 text-white font-bold" : "bg-muted/40 hover:bg-muted text-muted-foreground"
              }`}
            >
              Prisma Select
            </button>
            <button
              onClick={() => setStrategy("dataloader")}
              className={`flex-1 py-1 text-[0.72rem] font-medium transition-colors ${
                strategy === "dataloader" ? "bg-indigo-600 text-white font-bold" : "bg-muted/40 hover:bg-muted text-muted-foreground"
              }`}
            >
              DataLoader
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col space-y-1.5">
          <div className="text-[0.7rem] uppercase font-mono tracking-wide text-muted flex items-center justify-between">
            <span>Code Pattern</span>
            <span className="text-[0.65rem] font-mono text-indigo-300">{strategy}</span>
          </div>
          <pre className="p-3 rounded bg-black/80 text-[0.7rem] font-mono text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed border border-white/5 flex-1 min-h-[170px]">
            {strategy === "naive" && `// ❌ THE N+1 ANTI-PATTERN
const projects = await prisma.project.findMany({ take: ${recordCount} });

// Executes 1 query for projects + ${recordCount} queries in loop!
const result = await Promise.all(
  projects.map(async (p) => {
    const tasks = await prisma.task.findMany({
      where: { projectId: p.id },
    });
    return { ...p, tasks };
  })
);`}
            {strategy === "include" && `// ✅ PRISMA RELATION BATCHING
// Executes exactly 2 SQL queries via WHERE "projectId" IN ($1, $2, ...)
const result = await prisma.project.findMany({
  take: ${recordCount},
  select: {
    id: true,
    name: true,
    tasks: {
      select: { id: true, title: true, status: true },
    },
  },
});`}
            {strategy === "dataloader" && `// ✅ GRAPHQL / NESTJS DATALOADER BATCHING
// Coalesces individual service calls in the same tick into a single IN (...) query
const taskLoader = new DataLoader(async (projectIds: readonly string[]) => {
  const tasks = await prisma.task.findMany({
    where: { projectId: { in: [...projectIds] } },
  });
  return projectIds.map(id => tasks.filter(t => t.projectId === id));
});

const tasks = await taskLoader.load(project.id);`}
          </pre>
        </div>

        <div className="flex flex-col space-y-1.5">
          <div className="text-[0.7rem] uppercase font-mono tracking-wide text-muted flex items-center justify-between">
            <span>Database Wire Timeline & Waterfall</span>
            <span className={`text-[0.65rem] font-mono font-bold ${strategy === "naive" ? "text-rose-400" : "text-emerald-400"}`}>
              {queryCount} Queries Total
            </span>
          </div>
          <div className="p-3 rounded bg-black/80 text-[0.7rem] font-mono border border-white/5 flex-1 min-h-[170px] overflow-y-auto max-h-[220px] space-y-1">
            {strategy === "naive" ? (
              <>
                <div className="flex items-center gap-2 text-rose-300 border-l-2 border-rose-500 pl-2 py-0.5">
                  <span className="text-[0.6rem] text-muted">Q1</span>
                  <span className="truncate">SELECT * FROM projects LIMIT {recordCount};</span>
                </div>
                {Array.from({ length: Math.min(recordCount, 5) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 text-rose-400/90 border-l-2 border-rose-700/60 pl-2 py-0.5 text-[0.68rem]">
                    <span className="text-[0.6rem] text-muted">Q{i + 2}</span>
                    <span className="truncate">SELECT * FROM tasks WHERE project_id = 'proj_{i + 1}';</span>
                  </div>
                ))}
                {recordCount > 5 && (
                  <div className="text-[0.65rem] text-rose-400/60 pl-4 italic">
                    ... + {recordCount - 5} more sequential roundtrips ...
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-emerald-300 border-l-2 border-emerald-500 pl-2 py-0.5">
                  <span className="text-[0.6rem] text-muted">Q1</span>
                  <span className="truncate">SELECT id, name FROM projects LIMIT {recordCount};</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 border-l-2 border-emerald-500 pl-2 py-0.5">
                  <span className="text-[0.6rem] text-muted">Q2</span>
                  <span className="truncate">SELECT id, project_id, title, status FROM tasks WHERE project_id IN ($1, $2, ... $${recordCount});</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupabaseConnectionLab() {
  const [operation, setOperation] = useState<"runtime" | "migration" | "studio" | "advisory_lock">("runtime");
  const [connectionType, setConnectionType] = useState<"direct" | "pooler_transaction" | "pooler_session">("pooler_transaction");
  const [sslEnabled, setSslEnabled] = useState<boolean>(true);
  const [ipv6Supported, setIpv6Supported] = useState<boolean>(true);
  const [hasDirectUrl, setHasDirectUrl] = useState<boolean>(true);

  // Evaluate connection health
  let status: "ok" | "error" | "warning" = "ok";
  let errorCode = "";
  let message = "";
  let fix = "";

  if (!sslEnabled) {
    status = "error";
    errorCode = "FATAL: no pg_hba.conf entry for host ... SSL off";
    message = "Supabase strictly rejects all unencrypted database connections.";
    fix = "Append `?sslmode=require` or `?sslaccept=strict` to your database connection string.";
  } else if (!ipv6Supported && connectionType === "direct") {
    status = "error";
    errorCode = "P1001: Can't reach database server at `db.[project-ref].supabase.co:5432`";
    message = "Direct database domain names resolve to IPv6 by default. Your environment lacks IPv6 egress routing.";
    fix = "Use the Supabase Pooler hostname (`aws-0-*.pooler.supabase.com`) which provides IPv4 addresses, or purchase the Supabase IPv4 Add-on.";
  } else if (operation === "migration" && connectionType === "pooler_transaction" && !hasDirectUrl) {
    status = "error";
    errorCode = "P3005 / ERROR: 42P01: relation '_prisma_migrations' does not exist or advisory lock failed";
    message = "Prisma Migrate uses PostgreSQL advisory locks (`pg_advisory_lock`), which are NOT supported in Transaction Pooling mode (port 6543).";
    fix = "Configure `DIRECT_URL` pointing to Direct Port 5432 (or Session Pooler Port 5432) in `prisma.config.ts` specifically for migrations.";
  } else if (operation === "advisory_lock" && connectionType === "pooler_transaction") {
    status = "error";
    errorCode = "ERROR: advisory locks are not supported in transaction pooling mode";
    message = "Transaction poolers (PgBouncer/Supavisor on 6543) multiplex client queries across backend connections. Session-level state is forbidden.";
    fix = "Switch to Direct (5432) or Session Pooler (5432) for features requiring session-bound state.";
  } else if (operation === "runtime" && connectionType === "direct") {
    status = "warning";
    errorCode = "WARN: Connection Pool Saturation Risk";
    message = "Direct connections allocate 1 dedicated PostgreSQL backend process per client. Under auto-scaling NestJS traffic, you will quickly hit `max_connections` (e.g. 60–100 limits).";
    fix = "Point runtime `DATABASE_URL` to Supavisor Transaction Pooler (`aws-0-*.pooler.supabase.com:6543?pgbouncer=true`).";
  } else {
    status = "ok";
    errorCode = "200 OK / CONNECTED";
    message =
      operation === "migration"
        ? "Migration executed cleanly using direct/session connection with advisory lock support."
        : "Runtime queries efficiently multiplexed through Supavisor Transaction Pooler. Zero connection leaks.";
    fix = "Optimal production configuration!";
  }

  const generatedUrl =
    connectionType === "direct"
      ? `postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres${sslEnabled ? "?sslmode=require" : ""}`
      : connectionType === "pooler_transaction"
      ? `postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true${sslEnabled ? "&sslmode=require" : ""}`
      : `postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres${sslEnabled ? "?sslmode=require" : ""}`;

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-black/40 space-y-4 my-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Supabase Connection & Pooler Diagnostic Matrix
          </span>
        </div>
        <span className="text-[0.7rem] text-muted font-mono">Prisma 7.9.15 + NestJS Wire</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[0.7rem] uppercase font-mono text-muted mb-1">
              Client Operation
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "runtime", label: "NestJS API Runtime" },
                { id: "migration", label: "Prisma Migrate (CLI)" },
                { id: "studio", label: "Prisma Studio" },
                { id: "advisory_lock", label: "Advisory Locking" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOperation(item.id as any)}
                  className={`px-2.5 py-1.5 rounded text-left font-mono text-[0.7rem] border transition ${
                    operation === item.id
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                      : "bg-white/5 border-white/10 text-muted hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase font-mono text-muted mb-1">
              Target Connection String
            </label>
            <div className="space-y-1.5">
              {[
                { id: "pooler_transaction", label: "Transaction Pooler (Port 6543, Supavisor)" },
                { id: "pooler_session", label: "Session Pooler (Port 5432, Supavisor)" },
                { id: "direct", label: "Direct DB Connection (Port 5432, db.xxx.supabase.co)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConnectionType(item.id as any)}
                  className={`w-full px-2.5 py-1.5 rounded text-left font-mono text-[0.7rem] border transition ${
                    connectionType === item.id
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-200"
                      : "bg-white/5 border-white/10 text-muted hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[0.7rem]">
            <label className="flex items-center gap-2 cursor-pointer text-muted">
              <input
                type="checkbox"
                checked={sslEnabled}
                onChange={(e) => setSslEnabled(e.target.checked)}
                className="rounded bg-black border-white/20 text-emerald-500 focus:ring-0"
              />
              <span>SSL Mode Enabled</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-muted">
              <input
                type="checkbox"
                checked={ipv6Supported}
                onChange={(e) => setIpv6Supported(e.target.checked)}
                className="rounded bg-black border-white/20 text-emerald-500 focus:ring-0"
              />
              <span>IPv6 Container Egress</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-muted col-span-2">
              <input
                type="checkbox"
                checked={hasDirectUrl}
                onChange={(e) => setHasDirectUrl(e.target.checked)}
                className="rounded bg-black border-white/20 text-emerald-500 focus:ring-0"
              />
              <span>DIRECT_URL Configured in prisma.config.ts</span>
            </label>
          </div>
        </div>

        {/* Diagnostics Output */}
        <div className="flex flex-col space-y-2">
          <div className="text-[0.7rem] uppercase font-mono tracking-wide text-muted flex items-center justify-between">
            <span>Connection Diagnostic Result</span>
            <span
              className={`px-2 py-0.5 rounded text-[0.65rem] font-mono font-bold ${
                status === "ok"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                  : status === "warning"
                  ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                  : "bg-rose-950 text-rose-300 border border-rose-500/40"
              }`}
            >
              {status === "ok" ? "HEALTHY" : status === "warning" ? "WARNING" : "FATAL ERROR"}
            </span>
          </div>

          <div className="p-3 rounded bg-black/80 text-[0.7rem] font-mono border border-white/5 flex-1 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div
                className={`font-bold ${
                  status === "ok"
                    ? "text-emerald-400"
                    : status === "warning"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {errorCode}
              </div>
              <p className="text-muted leading-relaxed">{message}</p>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="text-[0.65rem] text-cyan-400 font-bold uppercase">Prescription / Resolution:</div>
              <p className="text-[0.68rem] text-slate-300">{fix}</p>
            </div>
          </div>

          {/* URL preview */}
          <div className="p-2 rounded bg-black/50 border border-white/10 text-[0.62rem] font-mono text-muted break-all">
            <span className="text-cyan-400 font-bold">URI: </span>
            {generatedUrl}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Supabase Auth Verify Lab ================= */

export function SupabaseAuthVerifyLab() {
  type Scenario = "valid" | "forged" | "expired" | "wrong_iss" | "public_route";
  const [scenario, setScenario] = useState<Scenario>("valid");
  const [routeType, setRouteType] = useState<"guarded" | "public">("guarded");

  const scenarios: Record<
    Scenario,
    {
      label: string;
      description: string;
      rawToken: string;
      header: object;
      payload: object;
      jwksStatus: "valid" | "invalid_sig" | "expired" | "bad_claim";
      httpStatus: number;
      statusText: string;
      nestOutcome: string;
      userAttached: boolean;
    }
  > = {
    valid: {
      label: "Valid GoTrue User JWT",
      description: "Authentic JWT issued by Supabase Auth, signed with project JWKS (RS256/HS256), exp in the future.",
      rawToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6InByb2otMTIzIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjk0OGFiZi1lYjAwLTQ4MWMtOTcyNC1iZTIwZGMxMjM0NTYiLCJlbWFpbCI6ImRldkBleGFtcGxlLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImlzcyI6Imh0dHBzOi8veHl6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJleHAiOjE3NTk4NDAwMDAsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIn0sInVzZXJfbWV0YWRhdGEiOnsiZnVsbF9uYW1lIjoiQWxpY2UgVGVzdGVyIn19.signature_verified_ok",
      header: { alg: "RS256", kid: "proj-123", typ: "JWT" },
      payload: {
        sub: "12948abf-eb00-481c-9724-be20dc123456",
        email: "dev@example.com",
        aud: "authenticated",
        role: "authenticated",
        iss: "https://xyz.supabase.co/auth/v1",
        exp: 1759840000,
        app_metadata: { provider: "email" },
        user_metadata: { full_name: "Alice Tester" },
      },
      jwksStatus: "valid",
      httpStatus: 200,
      statusText: "200 OK",
      nestOutcome: "SupabaseAuthGuard verified signature against JWKS endpoint. Attached payload to req.user.",
      userAttached: true,
    },
    forged: {
      label: "Forged Payload / Tampered Signature",
      description: "Attacker changed 'sub' to an admin UUID and altered role to 'service_role' without valid secret.",
      rawToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6InByb2otMTIzIiwidHlwIjoiSldUIn0.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQHByb2QuY29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6Imh0dHBzOi8veHl6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJleHAiOjE3NTk4NDAwMDB9.INVALID_CRYPTO_SIGNATURE_TAMPERED",
      header: { alg: "RS256", kid: "proj-123", typ: "JWT" },
      payload: {
        sub: "00000000-0000-0000-0000-000000000001",
        email: "admin@prod.com",
        role: "service_role",
        iss: "https://xyz.supabase.co/auth/v1",
        exp: 1759840000,
      },
      jwksStatus: "invalid_sig",
      httpStatus: 401,
      statusText: "401 Unauthorized",
      nestOutcome: "JsonWebTokenError: invalid signature. SupabaseAuthGuard threw UnauthorizedException.",
      userAttached: false,
    },
    expired: {
      label: "Expired Access Token (exp < now)",
      description: "Supabase access tokens expire after 1 hour (3600s). Client must refresh via refresh_token.",
      rawToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6InByb2otMTIzIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjk0OGFiZi1lYjAwLTQ4MWMtOTcyNC1iZTIwZGMxMjM0NTYiLCJlbWFpbCI6ImRldkBleGFtcGxlLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJpc3MiOiJodHRwczovL3h5ei5zdXBhYmFzZS5jby9hdXRoL3YxIiwiZXhwIjoxNzA0MDY3MjAwfQ.valid_signature_past_timestamp",
      header: { alg: "RS256", kid: "proj-123", typ: "JWT" },
      payload: {
        sub: "12948abf-eb00-481c-9724-be20dc123456",
        email: "dev@example.com",
        iss: "https://xyz.supabase.co/auth/v1",
        exp: 1704067200, // Jan 1, 2024
      },
      jwksStatus: "expired",
      httpStatus: 401,
      statusText: "401 Unauthorized",
      nestOutcome: "TokenExpiredError: jwt expired at 2024-01-01T00:00:00Z. Frontend interceptor must trigger token refresh.",
      userAttached: false,
    },
    wrong_iss: {
      label: "Mismatched Issuer / Project URL",
      description: "JWT was issued by a different Supabase project or staging environment.",
      rawToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6InN0YWdpbmctMSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjk0OGFiZiIsImlzcyI6Imh0dHBzOi8vc3RhZ2luZy1wcm9qLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJleHAiOjE3NTk4NDAwMDB9.signature_from_staging",
      header: { alg: "RS256", kid: "staging-1", typ: "JWT" },
      payload: {
        sub: "12948abf",
        iss: "https://staging-proj.supabase.co/auth/v1",
        exp: 1759840000,
      },
      jwksStatus: "bad_claim",
      httpStatus: 401,
      statusText: "401 Unauthorized",
      nestOutcome: "JsonWebTokenError: jwt issuer invalid. Expected https://xyz.supabase.co/auth/v1.",
      userAttached: false,
    },
    public_route: {
      label: "Public Route with @Public() Decorator",
      description: "Endpoint marked with IS_PUBLIC_KEY metadata. Guard skips token requirement entirely.",
      rawToken: "(No Authorization Header Provided)",
      header: {},
      payload: {},
      jwksStatus: "valid",
      httpStatus: 200,
      statusText: "200 OK",
      nestOutcome: "@Public() reflector check succeeded (isPublic = true). Guard returns true immediately.",
      userAttached: false,
    },
  };

  const cur = scenarios[scenario];
  const effectiveHttpStatus = routeType === "public" ? 200 : cur.httpStatus;

  return (
    <div className="my-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 sm:p-5 text-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white tracking-wide">
            Supabase Auth & NestJS Token Verification Lab
          </span>
        </div>
        <span className="text-[0.7rem] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
          JWKS & Guard Inspector
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Test how NestJS verifies Supabase GoTrue access tokens at runtime using cryptographic public keys (JWKS), validates claims (<code className="text-emerald-300">iss</code>, <code className="text-emerald-300">aud</code>, <code className="text-emerald-300">exp</code>), and attaches typed user identities to <code className="text-cyan-300">@CurrentUser()</code>.
      </p>

      {/* Scenario selector */}
      <div className="space-y-2">
        <label className="text-[0.7rem] font-mono text-muted uppercase tracking-wider block">
          Select Incoming Token Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(Object.keys(scenarios) as Scenario[]).map((key) => {
            const sc = scenarios[key];
            const active = scenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setScenario(key)}
                className={`text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between space-y-1 ${
                  active
                    ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm"
                    : "bg-surface border-white/10 text-muted hover:text-slate-200 hover:border-white/20"
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{sc.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[0.68rem] text-slate-400 leading-snug line-clamp-2">
                  {sc.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Type Toggle */}
      <div className="flex items-center gap-4 bg-surface p-2.5 rounded border border-white/10 text-xs">
        <span className="text-muted font-mono text-[0.7rem] uppercase">Target Endpoint:</span>
        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
          <input
            type="radio"
            name="routeType"
            checked={routeType === "guarded"}
            onChange={() => setRouteType("guarded")}
            className="accent-emerald-500"
          />
          <code className="text-amber-300 font-mono">GET /api/v1/workspaces (Guarded)</code>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
          <input
            type="radio"
            name="routeType"
            checked={routeType === "public"}
            onChange={() => setRouteType("public")}
            className="accent-emerald-500"
          />
          <code className="text-cyan-300 font-mono">GET /api/v1/health (@Public())</code>
        </label>
      </div>

      {/* Verification Pipeline Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Inspect */}
        <div className="space-y-2 bg-surface p-3 rounded border border-white/10">
          <div className="text-[0.7rem] font-mono uppercase text-emerald-400 font-bold flex items-center justify-between">
            <span>Incoming Authorization Header</span>
            <span className="text-[0.65rem] text-muted">Bearer &lt;JWT&gt;</span>
          </div>
          <div className="p-2 rounded bg-black/60 font-mono text-[0.68rem] text-slate-300 break-all border border-white/5">
            {cur.rawToken}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="text-[0.68rem] font-mono text-cyan-300 font-semibold">Decoded Payload Claims:</div>
            <pre className="p-2 rounded bg-black/70 font-mono text-[0.65rem] text-emerald-300/90 overflow-x-auto border border-white/5 max-h-36">
              {JSON.stringify(cur.payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Verification Result */}
        <div className="space-y-3 bg-surface p-3 rounded border border-white/10 flex flex-col justify-between">
          <div>
            <div className="text-[0.7rem] font-mono uppercase text-muted font-bold flex items-center justify-between mb-2">
              <span>NestJS Guard Evaluation</span>
              <span
                className={`px-2 py-0.5 rounded text-[0.68rem] font-mono font-bold ${
                  effectiveHttpStatus === 200
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                    : "bg-rose-950 text-rose-300 border border-rose-600"
                }`}
              >
                HTTP {effectiveHttpStatus} {effectiveHttpStatus === 200 ? "OK" : "UNAUTHORIZED"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-white/5">
                <span className="font-mono text-[0.68rem] text-cyan-400 shrink-0">1. Reflector:</span>
                <span className="text-slate-300 text-[0.72rem]">
                  {routeType === "public"
                    ? "Found @Public() metadata on handler. Bypassed JWT verification."
                    : "No @Public() tag. Proceeding to Authorization header extraction."}
                </span>
              </div>

              {routeType === "guarded" && (
                <>
                  <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-white/5">
                    <span className="font-mono text-[0.68rem] text-cyan-400 shrink-0">2. JWKS Check:</span>
                    <span className="text-slate-300 text-[0.72rem]">
                      {cur.jwksStatus === "invalid_sig"
                        ? "Signature does NOT match public key from Supabase JWKS cache."
                        : "Public key fetched from https://xyz.supabase.co/auth/v1/.well-known/jwks.json."}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-white/5">
                    <span className="font-mono text-[0.68rem] text-cyan-400 shrink-0">3. Claims Verify:</span>
                    <span className="text-slate-300 text-[0.72rem] leading-tight">
                      {cur.nestOutcome}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded bg-black/60 border border-white/10 text-[0.7rem] font-mono">
            <div className="text-muted text-[0.62rem] uppercase mb-1">Execution Context (req.user):</div>
            {cur.userAttached && routeType === "guarded" ? (
              <span className="text-emerald-400 font-semibold">
                User attached! id: "12948abf...", email: "dev@example.com"
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                {routeType === "public" ? "req.user = undefined (Public route)" : "Request aborted before Controller handler."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= IDOR & RBAC Security Lab ================= */

export function IdorRbacLab() {
  type Actor = "alice_admin" | "bob_member" | "eve_attacker";
  type Action = "view_settings" | "update_task_101" | "delete_task_101";
  type DefenseMode = "vulnerable" | "guard_only" | "multi_layer";

  const [actor, setActor] = useState<Actor>("eve_attacker");
  const [action, setAction] = useState<Action>("update_task_101");
  const [defense, setDefense] = useState<DefenseMode>("multi_layer");

  // Actor definitions
  const actors: Record<
    Actor,
    { name: string; role: string; workspaceId: string; workspaceName: string; tokenSub: string }
  > = {
    alice_admin: {
      name: "Alice (Admin)",
      role: "WORKSPACE_ADMIN",
      workspaceId: "ws_alpha_100",
      workspaceName: "Acme Corp (Alpha)",
      tokenSub: "usr_alice_1",
    },
    bob_member: {
      name: "Bob (Member)",
      role: "WORKSPACE_MEMBER",
      workspaceId: "ws_alpha_100",
      workspaceName: "Acme Corp (Alpha)",
      tokenSub: "usr_bob_2",
    },
    eve_attacker: {
      name: "Eve (Attacker / Competitor)",
      role: "WORKSPACE_MEMBER",
      workspaceId: "ws_beta_999",
      workspaceName: "Evil Corp (Beta)",
      tokenSub: "usr_eve_666",
    },
  };

  // Target task #101 belongs to Workspace Alpha (owner: Bob)
  const targetResource = {
    id: 101,
    title: "Confidential Q4 M&A Financial Roadmap",
    workspaceId: "ws_alpha_100",
    authorId: "usr_bob_2",
  };

  // Evaluate execution
  const currentActor = actors[actor];
  const isSameWorkspace = currentActor.workspaceId === targetResource.workspaceId;
  const isAuthor = currentActor.tokenSub === targetResource.authorId;
  const isAdmin = currentActor.role === "WORKSPACE_ADMIN";

  let allowed = false;
  let vulnerabilityExploited = false;
  let httpStatus = 200;
  let explanation = "";
  let executedSql = "";

  if (defense === "vulnerable") {
    // Naive endpoint: findUnique({ where: { id: 101 } }) without checking workspaceId
    allowed = true;
    httpStatus = 200;
    if (!isSameWorkspace) {
      vulnerabilityExploited = true;
      explanation = "CRITICAL IDOR BREACH! Eve from Evil Corp accessed/updated Acme Corp's private task #101 because the backend queried solely by resource ID!";
    } else {
      explanation = "Operation succeeded, but backend lacks workspace-isolation query scoping.";
    }
    executedSql = `SELECT * FROM "Task" WHERE "id" = 101 LIMIT 1;`;
  } else if (defense === "guard_only") {
    // Guard checks if role === 'WORKSPACE_MEMBER' or 'WORKSPACE_ADMIN', but DOES NOT verify tenant ownership
    if (action === "view_settings" && !isAdmin) {
      allowed = false;
      httpStatus = 403;
      explanation = "403 Forbidden: @RequirePermissions('workspace:manage') rejected non-admin role.";
    } else {
      allowed = true;
      httpStatus = 200;
      if (!isSameWorkspace) {
        vulnerabilityExploited = true;
        explanation = "IDOR TENANT BYPASS! The Role Guard verified Eve has 'WORKSPACE_MEMBER' role in her own tenant, but the query lacked `where: { workspaceId }` scoping!";
      } else {
        explanation = "Request passed role guard and executed.";
      }
      executedSql = `SELECT * FROM "Task" WHERE "id" = 101; -- Missing tenant filter!`;
    }
  } else {
    // Multi-Layer Defense: Nest Guard + Prisma Scoped Query (where: { id: 101, workspaceId: user.workspaceId })
    if (action === "view_settings" && !isAdmin) {
      allowed = false;
      httpStatus = 403;
      explanation = "403 Forbidden: Role Guard rejected action (Requires WORKSPACE_ADMIN).";
    } else if (action === "delete_task_101" && !isAdmin && !isAuthor) {
      allowed = false;
      httpStatus = 403;
      explanation = "403 Forbidden: PolicyService rejected delete. Only resource author or workspace admin may delete.";
    } else if (!isSameWorkspace) {
      allowed = false;
      httpStatus = 404; // Standard practice: 404 Not Found so attackers cannot enumerate foreign IDs
      explanation = "404 Not Found: Scoped Prisma query `where: { id: 101, workspaceId: '${currentActor.workspaceId}' }` returned null. Cross-tenant access impossible.";
    } else {
      allowed = true;
      httpStatus = 200;
      explanation = "200 OK: Passed Guard and scoped Prisma query strictly isolated to actor's workspace.";
    }
    executedSql = `SELECT * FROM "Task" WHERE "id" = 101 AND "workspaceId" = '${currentActor.workspaceId}' LIMIT 1;`;
  }

  return (
    <div className="my-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 sm:p-5 text-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white tracking-wide">
            RBAC & Insecure Direct Object Reference (IDOR) Defense Lab
          </span>
        </div>
        <span className="text-[0.7rem] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
          Multi-Tenant Isolation
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Simulate an attacker attempting to read or modify resources belonging to another organization. Compare vulnerable endpoints against role-only guards and defense-in-depth Prisma tenant scoping.
      </p>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Actor */}
        <div className="space-y-1.5">
          <label className="text-[0.68rem] font-mono text-muted uppercase">1. Authenticated Actor</label>
          <div className="space-y-1">
            {(Object.keys(actors) as Actor[]).map((key) => {
              const a = actors[key];
              const active = actor === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActor(key)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                    active
                      ? "bg-cyan-950/70 border-cyan-500 text-white font-medium"
                      : "bg-surface border-white/10 text-muted hover:text-slate-200"
                  }`}
                >
                  <span className="truncate">{a.name}</span>
                  <span className="text-[0.62rem] font-mono opacity-75">{a.role.replace("WORKSPACE_", "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Target Action */}
        <div className="space-y-1.5">
          <label className="text-[0.68rem] font-mono text-muted uppercase">2. Target Resource / Action</label>
          <div className="space-y-1">
            {[
              { id: "update_task_101", label: "PATCH /tasks/101 (Alpha Task)" },
              { id: "delete_task_101", label: "DELETE /tasks/101 (Alpha Task)" },
              { id: "view_settings", label: "GET /workspace/settings" },
            ].map((act) => {
              const active = action === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setAction(act.id as Action)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs border transition-all ${
                    active
                      ? "bg-cyan-950/70 border-cyan-500 text-white font-medium"
                      : "bg-surface border-white/10 text-muted hover:text-slate-200"
                  }`}
                >
                  <code className="text-[0.7rem] font-mono">{act.label}</code>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Defense Architecture */}
        <div className="space-y-1.5">
          <label className="text-[0.68rem] font-mono text-muted uppercase">3. Defense Layer</label>
          <div className="space-y-1">
            {[
              { id: "vulnerable", label: "Vulnerable (No Tenant Filter)", color: "text-rose-400" },
              { id: "guard_only", label: "RBAC Guard Only (No Scoping)", color: "text-amber-400" },
              { id: "multi_layer", label: "Multi-Layer Guard + Scoped Prisma", color: "text-emerald-400" },
            ].map((def) => {
              const active = defense === def.id;
              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => setDefense(def.id as DefenseMode)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs border transition-all ${
                    active
                      ? "bg-cyan-950/70 border-cyan-500 text-white font-medium"
                      : "bg-surface border-white/10 text-muted hover:text-slate-200"
                  }`}
                >
                  <span className={`text-[0.72rem] ${active ? def.color : ""}`}>{def.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Resource Summary */}
      <div className="p-2.5 rounded bg-black/50 border border-white/10 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted text-[0.68rem] font-mono uppercase">Target Resource:</span>
          <span className="text-white font-mono font-semibold">Task #101 ("{targetResource.title}")</span>
        </div>
        <div className="flex items-center gap-3 text-[0.68rem] font-mono text-slate-300">
          <span>Owner Tenant: <strong className="text-emerald-400">ws_alpha_100</strong></span>
          <span>Actor Tenant: <strong className={isSameWorkspace ? "text-emerald-400" : "text-rose-400"}>{currentActor.workspaceId}</strong></span>
        </div>
      </div>

      {/* Security Evaluation Output */}
      <div className="space-y-3 bg-surface p-3.5 rounded border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase text-muted font-bold">Execution Result:</span>
            <span
              className={`px-2.5 py-0.5 rounded text-[0.7rem] font-mono font-bold ${
                vulnerabilityExploited
                  ? "bg-rose-950 text-rose-300 border border-rose-600 animate-pulse"
                  : httpStatus === 200
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                  : "bg-amber-950 text-amber-300 border border-amber-600"
              }`}
            >
              HTTP {httpStatus} {httpStatus === 200 ? "OK" : httpStatus === 403 ? "FORBIDDEN" : "NOT FOUND"}
            </span>
          </div>

          {vulnerabilityExploited && (
            <span className="text-[0.68rem] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500">
              🚨 VULNERABILITY EXPLOITED: IDOR DATA LEAK
            </span>
          )}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium">{explanation}</p>

        <div className="space-y-1">
          <div className="text-[0.65rem] font-mono uppercase text-muted">Backend Database Query:</div>
          <div className="p-2 rounded bg-black/70 font-mono text-[0.72rem] text-cyan-300 border border-white/5">
            {executedSql}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= dispatcher ================= */

export function SectionDemo({ kind }: { kind: DemoKind }) {
  if (kind === "form-validation") return <ValidationLab />;
  if (kind === "specificity") return <SpecificityBattle />;
  if (kind === "flex-grid") return <FlexGridLab />;
  if (kind === "token-lab") return <TokenLab />;
  if (kind === "closure-lab") return <ClosureLab />;
  if (kind === "immutable-lab") return <ImmutabilityLab />;
  if (kind === "event-loop") return <EventLoopLab />;
  if (kind === "error-lab") return <ErrorLab />;
  if (kind === "optimistic-lab") return <OptimisticLab />;
  if (kind === "perf-lab") return <PerfLab />;
  if (kind === "design-system") return <DesignSystemLab />;
  if (kind === "request-trace") return <RequestTraceLab />;
  if (kind === "status-match") return <StatusMatchLab />;
  if (kind === "token-inspector") return <TokenInspectorLab />;
  if (kind === "cors-sim") return <CorsSimLab />;
  if (kind === "rest-pagination") return <RestPaginationLab />;
  if (kind === "layer-diagnostic") return <LayerDiagnosticLab />;
  if (kind === "rsc-wire") return <RscWireLab />;
  if (kind === "next-cache-matrix") return <NextCacheMatrixLab />;
  if (kind === "url-state-lab") return <UrlStateLab />;
  if (kind === "arch-boundary-lab") return <ArchBoundaryLab />;
  if (kind === "nest-pipeline-lab") return <NestPipelineLab />;
  if (kind === "fastify-trap-lab") return <FastifyTrapLab />;
  if (kind === "nest-guard-lab") return <NestGuardLab />;
  if (kind === "sql-explain-lab") return <SqlExplainLab />;
  if (kind === "prisma-query-lab") return <PrismaQueryLab />;
  if (kind === "n-plus-one-lab") return <NPlusOneLab />;
  if (kind === "supabase-connection-lab") return <SupabaseConnectionLab />;
  if (kind === "supabase-auth-verify-lab") return <SupabaseAuthVerifyLab />;
  if (kind === "idor-rbac-lab") return <IdorRbacLab />;
  return <BoxModelLab />;
}

