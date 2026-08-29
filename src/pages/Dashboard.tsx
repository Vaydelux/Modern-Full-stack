import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Circle,
  Gauge,
  GitBranch,
  Layers,
  ListChecks,
  Map,
  RefreshCw,
} from "lucide-react";
import { Crumbs } from "../components/chrome";
import { ProgressRing, slugify } from "../components/widgets";
import { RecommendedNextStep } from "../components/RecommendedNextStep";
import { CompletionDashboard } from "../components/CompletionDashboard";
import { Reveal, SectionHeading, StatusBadge } from "../components/ui";
import { ALL_LESSONS, IMPLEMENTED_LESSONS, lessonById } from "../data/curriculum";
import { BATCH_QUEUE, GAP_TABLE, STATUS_LOG } from "../data/reference";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";

const NEXT_COPY: Record<string, string> = {
  "p00-l1": "The map lesson: three jobs (show, decide, remember), who owns what, and why the browser is never trusted.",
  "p00-l2": "Terminal reflexes, Node + pnpm, semver, .env discipline, and your first GitHub push.",
  "p00-l3": "Raw HTTP with zero dependencies — the skeleton every framework in this course dresses.",
  "p00-l4": "Console, Network, Sources — and the nine-step debugging loop that turns 'it broke' into root causes.",
  "p00-l5": "The .env pouch, fail-fast config validation, and the secrets discipline that keeps keys out of Git.",
  "p01-l1": "Landmarks, headings, links vs buttons, labeled forms — structure that keyboards and screen readers can read.",
};
const DEFAULT_COPY =
  "Authored to the full quality contract: objectives, runnable code, challenge with hidden solution, quiz, and flashcards.";

const QUICK_LINKS = [
  { to: "roadmap", icon: <Map size={17} />, title: "Roadmap", desc: "All 45 phases across 7 mastery stages, honestly labeled." },
  { to: "glossary", icon: <BookOpen size={17} />, title: "Glossary", desc: "Every term defined before it is used — searchable." },
  { to: "troubleshooting", icon: <Bug size={17} />, title: "Fix It", desc: "Symptom-first troubleshooting across the whole stack." },
  { to: "versions", icon: <GitBranch size={17} />, title: "Version Matrix", desc: "What is pinned, what is verified, where to check." },
  { to: "readiness", icon: <Gauge size={17} />, title: "Production Readiness", desc: "The scorecard capstones must pass. Interactive checklist." },
  { to: "manifest", icon: <Layers size={17} />, title: "Course Manifest", desc: "The curriculum inventory: IDs, statuses, files." },
];

export default function Dashboard() {
  const { completed, quiz, flash, isComplete, resetAll } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const nextLesson = IMPLEMENTED_LESSONS.find((l) => !isComplete(l.id));
  const nextMeta = nextLesson ? lessonById(nextLesson.id) : undefined;
  const completion = IMPLEMENTED_LESSONS.length > 0 ? completed.length / IMPLEMENTED_LESSONS.length : 0;

  const quizScores = Object.values(quiz);
  const quizAvg =
    quizScores.length > 0
      ? quizScores.reduce((sum, q) => sum + q.correct / q.total, 0) / quizScores.length
      : 0;

  const knownCards = Object.values(flash).reduce((sum, arr) => sum + arr.length, 0);
  const totalImplementedMinutes = IMPLEMENTED_LESSONS.reduce((s, l) => s + l.minutes, 0);

  const pass = STATUS_LOG[0];

  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Dashboard" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4 mt-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Course Dashboard</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            Your progress lives on this device. The curriculum's progress lives in the manifest.
          </p>
        </div>
        {confirmReset ? (
          <span className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--rose-ink)" }}>Erase all progress?</span>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: "var(--rose)", color: "#fff" }}
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
              Keep it
            </button>
          </span>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}>
            <RefreshCw size={13} /> Reset progress
          </button>
        )}
      </div>

      {/* Completion Dashboard Widget */}
      <Reveal>
        <CompletionDashboard />
      </Reveal>

      {/* Recommended Next Step Component */}
      <Reveal>
        <RecommendedNextStep />
      </Reveal>

      {/* Progress & Metrics Summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Reveal className="lg:col-span-2">
          <div className="panel p-6 h-full flex flex-col justify-between">
            <div>
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em]" style={{ color: "var(--brand-ink)" }}>
                Mastery Progression
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl mt-2 leading-tight">
                {completed.length > 0
                  ? `${completed.length} of ${ALL_LESSONS.length} Modules Mastered (${Math.round((completed.length / ALL_LESSONS.length) * 100)}%)`
                  : "Start Your Full Stack Mastery Journey"}
              </h2>
              <p className="text-[0.92rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                All progress is persisted securely in your browser's LocalStorage. You can track completed modules,
                re-attempt knowledge check quizzes, practice interactive labs, and unlock capstone readiness milestones.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="roadmap" className="btn btn-soft text-[0.84rem]">
                <Map size={15} /> Open Mastery Roadmap
              </Link>
              <Link to="readiness" className="btn btn-ghost text-[0.84rem]">
                <Gauge size={15} /> Production Scorecard
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel p-6 h-full flex items-center justify-around gap-4 flex-wrap">
            <ProgressRing value={completion} label="mastered" />
            <div className="flex flex-col gap-3">
              <div>
                <div className="font-display font-bold text-xl">{quizScores.length > 0 ? `${Math.round(quizAvg * 100)}%` : "—"}</div>
                <div className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>avg quiz best</div>
              </div>
              <div>
                <div className="font-display font-bold text-xl">{knownCards}</div>
                <div className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>flashcards known</div>
              </div>
              <div>
                <div className="font-display font-bold text-xl">{totalImplementedMinutes}m</div>
                <div className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>curriculum time</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* phase 0 checklist + pass status */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Reveal>
          <div className="panel p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">Authored lessons</h2>
              <span className="chip">{IMPLEMENTED_LESSONS.length} of {ALL_LESSONS.length}</span>
            </div>
            <ul className="flex flex-col gap-1">
              {IMPLEMENTED_LESSONS.map((l) => {
                const done = isComplete(l.id);
                const best = quiz[l.id];
                return (
                  <li key={l.id}>
                    <Link
                      to={`lesson/${l.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-sm)] no-underline transition-colors hover:bg-[var(--surface-2)]"
                    >
                      {done ? (
                        <CheckCircle2 size={17} style={{ color: "var(--brand)", flexShrink: 0 }} />
                      ) : (
                        <Circle size={17} style={{ color: "var(--muted)", flexShrink: 0 }} />
                      )}
                      <span className="text-[0.9rem] flex-1" style={{ color: done ? "var(--ink-2)" : "var(--ink)" }}>
                        {l.title}
                      </span>
                      {best && (
                        <span className="chip" style={{ textTransform: "none" }}>
                          quiz {best.correct}/{best.total}
                        </span>
                      )}
                      <span className="font-mono text-[0.68rem]" style={{ color: "var(--muted)" }}>
                        {l.minutes}m
                      </span>
                    </Link>
                  </li>
                );
              })}
              {ALL_LESSONS.filter((l) => l.status === "draft").map((l) => (
                <li key={l.id}>
                  <Link
                    to={`lesson/${l.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-sm)] no-underline transition-colors hover:bg-[var(--surface-2)]"
                    style={{ opacity: 0.85 }}
                  >
                    <Circle size={17} style={{ color: "var(--amber)", flexShrink: 0 }} />
                    <span className="text-[0.9rem] flex-1" style={{ color: "var(--muted)" }}>
                      {l.title}
                    </span>
                    <StatusBadge status="draft" />
                  </Link>
                </li>
              ))}
              {ALL_LESSONS.filter((l) => l.status === "draft").length === 0 && (
                <li className="px-3 py-2 text-[0.8rem] font-mono" style={{ color: "var(--muted)" }}>
                  No drafts on the bench — the next batch is scheduled in the course status.
                </li>
              )}
            </ul>
            <p className="text-[0.78rem] mt-4 font-mono" style={{ color: "var(--muted)" }}>
              Draft lessons show honest status pages — never fake bodies.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">{pass.pass} · {pass.title}</h2>
              <span className="chip">{pass.date}</span>
            </div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--muted)" }}>
              Scope delivered
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {pass.scope.slice(0, 4).map((s) => (
                <li key={slugify(s)} className="flex gap-2 text-[0.85rem] items-start" style={{ color: "var(--ink-2)" }}>
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                  {s}
                </li>
              ))}
            </ul>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--amber-ink)" }}>
              Next batch
            </div>
            <p className="text-[0.85rem] leading-relaxed flex-1" style={{ color: "var(--ink-2)" }}>{pass.next}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="status" className="btn btn-ghost btn-sm">Full status & gap log</Link>
              <Link to="manifest" className="btn btn-soft btn-sm">Manifest</Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* gaps snapshot */}
      <Reveal>
        <div className="panel p-6 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-semibold text-lg">Gap discovery — live snapshot</h2>
            <span className="chip"><ListChecks size={11} /> {GAP_TABLE.length} tracked</span>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Gap</th>
                  <th>Classification</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {GAP_TABLE.slice(0, 5).map((g) => (
                  <tr key={g.gap}>
                    <td style={{ color: "var(--ink)" }}>{g.gap}</td>
                    <td><span className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>{g.classification}</span></td>
                    <td>{g.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="status" className="btn btn-ghost btn-sm mt-4">All gaps & remediation plan</Link>
        </div>
      </Reveal>

      {/* generation queue */}
      <Reveal>
        <div className="panel p-6 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-semibold text-lg">Generation queue — queued for a future batch</h2>
            <Link to="status" className="btn btn-ghost btn-sm">Full queue & rationale</Link>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
            {BATCH_QUEUE.map((q, i) => (
              <div
                key={q.pass}
                className="rounded-[var(--r)] border p-4 relative"
                style={{ borderColor: i === 0 ? "var(--brand)" : "var(--line)", background: "var(--surface-2)" }}
              >
                {i === 0 && (
                  <span
                    className="absolute -top-2.5 right-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                    style={{ background: "var(--brand)", color: "var(--brand-contrast)" }}
                  >
                    up next
                  </span>
                )}
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em]" style={{ color: i === 0 ? "var(--brand-ink)" : "var(--muted)" }}>
                  {q.pass}
                </div>
                <div className="font-display font-semibold text-[0.9rem] mt-1 leading-snug">{q.batch}</div>
                <ul className="mt-2.5 flex flex-col gap-1">
                  {q.items.slice(0, 3).map((it) => (
                    <li key={it} className="text-[0.76rem] leading-snug" style={{ color: "var(--muted)" }}>
                      · {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[0.74rem] font-mono mt-3" style={{ color: "var(--muted)" }}>
            Queued, not promised — each pass re-inspects the repo and may reorder based on gaps found while teaching.
          </p>
        </div>
      </Reveal>

      {/* quick links */}
      <section className="mt-12">
        <SectionHeading kicker="Everything has a place" title="Reference shelves" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map((q, i) => (
            <Reveal key={q.to} delay={i * 50}>
              <Link to={q.to} className="panel panel-hover p-5 block h-full no-underline">
                <span className="flex items-center gap-2.5">
                  <span style={{ color: "var(--brand-ink)" }}>{q.icon}</span>
                  <span className="font-display font-semibold">{q.title}</span>
                  <ArrowRight size={14} className="ml-auto transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted)" }} />
                </span>
                <p className="text-[0.85rem] mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>{q.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
