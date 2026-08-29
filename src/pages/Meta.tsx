import type { ReactNode } from "react";
import { Activity, BookOpen, CheckCircle2, Database, FileCode2, Gauge, Layers, ListOrdered, Lock, Rocket, Shield, Target } from "lucide-react";
import { Crumbs } from "../components/chrome";
import { BossCard, ProgressRing } from "../components/widgets";
import { Callout, CodeBlock, Meter, Reveal, SectionHeading, StatusBadge } from "../components/ui";
import { ALL_LESSONS, PHASES, STAGES } from "../data/curriculum";
import { BATCH_QUEUE, BOSS_BATTLES, GAP_TABLE, READINESS_GROUPS, STATUS_LOG } from "../data/reference";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";

/* ---------------- Design Tokens ---------------- */

const COLOR_TOKENS = [
  { name: "--brand", role: "Primary action, success, progress" },
  { name: "--amber", role: "Draft status, warnings, caution" },
  { name: "--sky", role: "Info, pinned versions, links" },
  { name: "--rose", role: "Danger, errors, security callouts" },
  { name: "--bg / --bg-2", role: "Page background layers" },
  { name: "--surface / --surface-2 / --surface-3", role: "Cards, panels, raised fields" },
  { name: "--ink / --ink-2 / --muted", role: "Text hierarchy" },
  { name: "--line / --line-2", role: "Borders and separators" },
  { name: "--code-bg / --code-ink", role: "Code surfaces (always dark)" },
];

export function TokensPage() {
  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Design Tokens" }]} />
      <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-4">Design Tokens</h1>
      <p className="text-sm mt-2 max-w-[70ch]" style={{ color: "var(--muted)" }}>
        The single source of truth for the platform's visual language, defined in <code>src/index.css</code>. Every
        component consumes these semantic variables — no repeated arbitrary values. Toggle the theme (top bar) to see
        the light/dark mappings live.
      </p>

      <section className="mt-10">
        <SectionHeading kicker="Semantic color" title="Palette roles" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLOR_TOKENS.map((t) => (
            <div key={t.name} className="panel p-4 flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-[var(--r-sm)] border shrink-0"
                style={{ background: `var(${t.name.split(" ")[0]})`, borderColor: "var(--line-2)" }}
                aria-hidden="true"
              />
              <div>
                <div className="font-mono text-[0.78rem]" style={{ color: "var(--ink)" }}>{t.name}</div>
                <div className="text-[0.78rem] mt-0.5" style={{ color: "var(--muted)" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading kicker="Type system" title="Two voices, one mono" />
        <div className="panel p-6">
          <div className="font-display font-bold text-3xl">Space Grotesk — display & headings</div>
          <div className="text-base mt-2" style={{ color: "var(--ink-2)" }}>
            IBM Plex Sans — body copy. Readable at length, pairs without competing.
          </div>
          <div className="font-mono text-sm mt-2" style={{ color: "var(--brand-ink)" }}>
            JetBrains Mono — code, chips, labels, everything a terminal would say.
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading kicker="Components" title="Consuming the tokens" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="panel p-6">
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>Buttons & badges</div>
            <div className="flex flex-wrap gap-2.5 items-center">
              <button type="button" className="btn btn-primary">Primary</button>
              <button type="button" className="btn btn-ghost">Ghost</button>
              <button type="button" className="btn btn-soft">Soft</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <StatusBadge status="implemented" />
              <StatusBadge status="draft" />
              <StatusBadge status="planned" />
            </div>
            <div className="mt-5">
              <Meter value={0.62} />
            </div>
          </div>
          <div className="panel p-6">
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-4" style={{ color: "var(--muted)" }}>Radii, motion, focus</div>
            <ul className="flex flex-col gap-2 text-[0.86rem]" style={{ color: "var(--ink-2)" }}>
              <li><code>--r-sm 6px</code> · <code>--r 10px</code> · <code>--r-lg 14px</code> — restrained, no blanket rounding</li>
              <li><code>--ease cubic-bezier(0.22, 1, 0.36, 1)</code> — one easing family, three durations</li>
              <li>Focus: 2px brand outline, 2px offset, always visible</li>
              <li><code>prefers-reduced-motion</code> collapses all animation to instant</li>
              <li>Surfaces lift 2px on hover with a soft green-tinted shadow</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <CodeBlock
            file="how components consume tokens"
            lang="css"
            code={[
              ".panel {",
              "  background: var(--surface);",
              "  border: 1px solid var(--line);",
              "  border-radius: var(--r-lg);",
              "  box-shadow: var(--shadow-1);",
              "}",
              ".panel-hover:hover {",
              "  transform: translateY(-2px);",
              "  box-shadow: var(--shadow-2);",
              "}",
            ].join("\n")}
            caption="No hex codes in components — themes flip by remapping variables on :root[data-theme]."
          />
        </div>
      </section>
    </div>
  );
}

/* ---------------- Manifest ---------------- */

export function ManifestPage() {
  const implemented = ALL_LESSONS.filter((l) => l.status === "implemented");
  const drafts = ALL_LESSONS.filter((l) => l.status === "draft");

  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Manifest" }]} />
      <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-4">Course Manifest</h1>
      <p className="text-sm mt-2 max-w-[72ch]" style={{ color: "var(--muted)" }}>
        The curriculum inventory — what exists and in what state. Sidebar presence never equals completion. Mirrored in{" "}
        <code>COURSE_MANIFEST.md</code> at the repository root.
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        <StatusBadge status="implemented" />
        <span className="text-[0.8rem] self-center" style={{ color: "var(--muted)" }}>full quality contract, teachable now</span>
        <StatusBadge status="draft" />
        <span className="text-[0.8rem] self-center" style={{ color: "var(--muted)" }}>outline committed, body pending</span>
        <StatusBadge status="planned" />
        <span className="text-[0.8rem] self-center" style={{ color: "var(--muted)" }}>scoped and sequenced</span>
      </div>

      <section className="mt-10">
        <SectionHeading kicker={`${PHASES.length} phases · ${ALL_LESSONS.length} lessons mapped`} title="Inventory" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stage</th>
                <th>Phase</th>
                <th>Lessons</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((p) => {
                const impl = p.lessons.filter((l) => l.status === "implemented").length;
                const draft = p.lessons.filter((l) => l.status === "draft").length;
                const planned = p.lessons.filter((l) => l.status === "planned").length;
                return (
                  <tr key={p.id}>
                    <td className="font-mono text-[0.78rem]">P{String(p.n).padStart(2, "0")}</td>
                    <td>{p.stage.replace("-", " ")}</td>
                    <td style={{ color: "var(--ink)" }}>{p.title}</td>
                    <td className="font-mono text-[0.78rem]">{impl} / {draft} / {planned}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[0.74rem] font-mono mt-2" style={{ color: "var(--muted)" }}>Lessons column: implemented / draft / planned.</p>
      </section>

      <section className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="panel p-6">
          <h2 className="font-display font-semibold text-lg mb-3">Implemented lessons ({implemented.length})</h2>
          <ul className="flex flex-col gap-2">
            {implemented.map((l) => (
              <li key={l.id} className="flex items-center gap-2 text-[0.88rem]">
                <CheckCircle2 size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                <Link to={`lesson/${l.id}`} className="hover:underline" style={{ color: "var(--ink-2)" }}>{l.title}</Link>
              </li>
            ))}
          </ul>
          <p className="text-[0.76rem] font-mono mt-3" style={{ color: "var(--muted)" }}>source: src/data/lessons-p0.ts</p>
        </div>
        <div className="panel p-6">
          <h2 className="font-display font-semibold text-lg mb-3">Drafts & governance ({drafts.length} drafts)</h2>
          <ul className="flex flex-col gap-2">
            {drafts.map((l) => (
              <li key={l.id} className="flex items-center gap-2 text-[0.88rem]">
                <FileCode2 size={14} style={{ color: "var(--amber)", flexShrink: 0 }} />
                <Link to={`lesson/${l.id}`} className="hover:underline" style={{ color: "var(--ink-2)" }}>{l.title}</Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5 mt-4 text-[0.84rem]" style={{ color: "var(--muted)" }}>
            <span><code>COURSE_MANIFEST.md</code> — this inventory</span>
            <span><code>COURSE_STATUS.md</code> — pass history, decisions, gaps</span>
            <span><code>COURSE_VERSION_MATRIX.md</code> — pinned & verified versions</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Status ---------------- */

export function StatusPage() {
  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Status" }]} />
      <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-4">Course Status & Gap Log</h1>
      <p className="text-sm mt-2 max-w-[70ch]" style={{ color: "var(--muted)" }}>
        One pass = one bounded batch: inspect → generate → review → update status → stop. This page is the public
        ledger of that discipline (mirrored in <code>COURSE_STATUS.md</code>).
      </p>

      <section className="mt-8" aria-labelledby="queue-heading">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 id="queue-heading" className="font-display font-bold text-xl flex items-center gap-2.5">
            <ListOrdered size={19} style={{ color: "var(--brand)" }} />
            Generation queue — what ships next
          </h2>
          <span className="chip ml-auto">rewritten by every pass</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {BATCH_QUEUE.map((item, i) => (
            <Reveal key={item.pass} delay={Math.min(i * 60, 240)}>
              <div
                className="panel panel-hover p-5 h-full relative overflow-hidden"
                style={{ borderColor: i === 0 ? "var(--brand)" : "var(--line)" }}
              >
                {i === 0 && (
                  <span
                    className="absolute top-0 right-0 font-mono text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1"
                    style={{ background: "var(--brand)", color: "var(--brand-contrast)", borderBottomLeftRadius: "var(--r-sm)" }}
                  >
                    up next
                  </span>
                )}
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em]" style={{ color: i === 0 ? "var(--brand-ink)" : "var(--muted)" }}>
                  {item.pass}
                </div>
                <h3 className="font-display font-semibold text-[1.02rem] mt-1 leading-snug">{item.batch}</h3>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {item.items.map((li) => (
                    <li key={li} className="flex gap-2 items-start text-[0.86rem]" style={{ color: "var(--ink-2)" }}>
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }} />
                      {li}
                    </li>
                  ))}
                </ul>
                <p className="text-[0.8rem] mt-3 pt-3 border-t leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] mr-2" style={{ color: "var(--amber-ink)" }}>why</span>
                  {item.why}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-[0.78rem] font-mono mt-3" style={{ color: "var(--muted)" }}>
          Queued, not promised: each pass re-inspects the repo and may reorder based on gaps found while teaching.
        </p>
      </section>

      <h2 className="font-display font-bold text-xl mt-12 mb-1">Pass log</h2>
      {STATUS_LOG.map((entry) => (
        <Reveal key={entry.pass}>
          <div className="panel p-6 mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display font-bold text-xl">{entry.pass} — {entry.title}</h2>
              <span className="chip ml-auto">{entry.date}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-5">
              <div>
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand-ink)" }}>Scope delivered</div>
                <ul className="flex flex-col gap-2">
                  {entry.scope.map((s) => (
                    <li key={s} className="flex gap-2 items-start text-[0.88rem]" style={{ color: "var(--ink-2)" }}>
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--sky-ink)" }}>Decisions recorded</div>
                <ul className="flex flex-col gap-2">
                  {entry.decisions.map((d) => (
                    <li key={d} className="flex gap-2 items-start text-[0.88rem]" style={{ color: "var(--ink-2)" }}>
                      <Target size={14} className="mt-0.5 shrink-0" style={{ color: "var(--sky)" }} /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Callout variant="success" title="Next batch (Pass 002)">{entry.next}</Callout>
          </div>
        </Reveal>
      ))}

      <section className="mt-12">
        <SectionHeading kicker="Gap discovery" title="Known gaps, classified and scheduled" />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Gap</th>
                <th>Classification</th>
                <th>Remediation plan</th>
              </tr>
            </thead>
            <tbody>
              {GAP_TABLE.map((g) => (
                <tr key={g.gap}>
                  <td style={{ color: "var(--ink)" }}>{g.gap}</td>
                  <td><span className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>{g.classification}</span></td>
                  <td>{g.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Mastery ---------------- */

export function MasteryPage() {
  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Mastery Levels" }]} />
      <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-4">Mastery Levels</h1>
      <p className="text-sm mt-2 max-w-[70ch]" style={{ color: "var(--muted)" }}>
        Measurable stages with exit criteria — and Boss Battles as cumulative gates. A stage is passed by evidence
        (code, tests, defended decisions), never by video minutes watched.
      </p>

      <div className="relative mt-10">
        <span className="absolute left-[15px] top-4 bottom-4 w-[2px] hidden sm:block" style={{ background: "var(--line-2)" }} aria-hidden="true" />
        <div className="flex flex-col gap-5">
          {STAGES.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i * 60, 240)}>
              <div className="sm:pl-12 relative">
                <span
                  className="absolute left-0 top-5 w-8 h-8 rounded-full border-2 hidden sm:flex items-center justify-center font-mono text-[0.7rem] font-semibold"
                  style={{
                    background: "var(--bg)",
                    borderColor: i === 0 ? "var(--brand)" : "var(--line-2)",
                    color: i === 0 ? "var(--brand-ink)" : "var(--muted)",
                  }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="panel p-5" style={{ borderColor: i === 0 ? "var(--brand)" : "var(--line)" }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display font-bold text-lg">{s.title}</h2>
                    <span className="font-mono text-[0.66rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                      {PHASES.filter((p) => p.stage === s.id).map((p) => `P${String(p.n).padStart(2, "0")}`).join(" · ")}
                    </span>
                    {i === 0 ? <StatusBadge status="draft" /> : <StatusBadge status="planned" />}
                  </div>
                  <p className="text-[0.9rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>{s.blurb}</p>
                  <p className="text-[0.84rem] mt-2 font-mono" style={{ color: "var(--brand-ink)" }}>
                    Exit criteria — {s.exitCriteria}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <section className="mt-14">
        <SectionHeading kicker="Cumulative gates" title="Boss Battles" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BOSS_BATTLES.map((bb) => (
            <BossCard key={bb.id} bb={bb} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Production Readiness ---------------- */

const GROUP_ICONS: Record<string, ReactNode> = {
  check: <CheckCircle2 size={16} />,
  database: <Database size={16} />,
  shield: <Shield size={16} />,
  refresh: <Activity size={16} />,
  activity: <Activity size={16} />,
  gauge: <Gauge size={16} />,
  rocket: <Rocket size={16} />,
  book: <BookOpen size={16} />,
};

export function ReadinessPage() {
  const { isChecked, toggleCheck, checks } = useProgress();
  const totalItems = READINESS_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const doneItems = READINESS_GROUPS.reduce((s, g) => s + g.items.filter((i) => isChecked(g.id, i)).length, 0);
  const overall = totalItems > 0 ? doneItems / totalItems : 0;

  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Production Readiness" }]} />
      <div className="flex flex-wrap items-end justify-between gap-6 mt-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Production Readiness Scorecard</h1>
          <p className="text-sm mt-2 max-w-[66ch]" style={{ color: "var(--muted)" }}>
            The checklist both capstones must pass before they count as complete. Tick items as you verify them in your
            own projects — checks persist on this device. Localhost success is never mastery; this is the receipt.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <ProgressRing value={overall} label="verified" />
          <div className="font-mono text-[0.72rem]" style={{ color: "var(--muted)" }}>{doneItems}/{totalItems} checks</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {READINESS_GROUPS.map((g, gi) => {
          const done = g.items.filter((i) => isChecked(g.id, i)).length;
          return (
            <Reveal key={g.id} delay={Math.min(gi * 50, 250)}>
              <div className="panel p-5 h-full">
                <div className="flex items-center gap-2.5 mb-1">
                  <span style={{ color: "var(--brand-ink)" }}>{GROUP_ICONS[g.icon] ?? <Layers size={16} />}</span>
                  <h2 className="font-display font-semibold text-[1.02rem]">{g.title}</h2>
                  <span className="chip ml-auto">{done}/{g.items.length}</span>
                </div>
                <Meter value={g.items.length > 0 ? done / g.items.length : 0} className="my-3" />
                <ul className="flex flex-col gap-1">
                  {g.items.map((item) => {
                    const checked = isChecked(g.id, item);
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          className="w-full flex items-start gap-2.5 text-left px-2 py-1.5 rounded-[var(--r-sm)] transition-colors hover:bg-[var(--surface-2)]"
                          onClick={() => toggleCheck(g.id, item)}
                          aria-pressed={checked}
                        >
                          <span
                            className="w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                            style={{
                              borderColor: checked ? "var(--brand)" : "var(--line-2)",
                              background: checked ? "var(--brand)" : "transparent",
                              color: "var(--brand-contrast)",
                            }}
                          >
                            {checked && <CheckCircle2 size={12} />}
                          </span>
                          <span
                            className="text-[0.87rem] leading-snug"
                            style={{ color: checked ? "var(--muted)" : "var(--ink-2)", textDecoration: checked ? "line-through" : "none" }}
                          >
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Callout variant="warn" title="How capstones use this">
        Phase 41 and 42 are complete only when every group above has been verified against the deployed system —
        including rehearsed restore, IDOR tests, queue idempotency, and a working rollback path. The scorecard result
        is part of the final Architecture Board Review (BB-5).
      </Callout>

      <div className="flex flex-wrap gap-2 mt-6">
        <Link to="roadmap" className="btn btn-ghost btn-sm"><Lock size={13} /> Capstone phases on the roadmap</Link>
        <Link to="status" className="btn btn-soft btn-sm">Build status</Link>
      </div>
      <div className="sr-only">{Object.keys(checks).length} groups interacted with</div>
    </div>
  );
}
