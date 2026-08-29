import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  HardDrive,
  KeyRound,
  Lock,
  Monitor,
  Radio,
  RefreshCw,
  Server,
  Shuffle,
  Target,
  UploadCloud,
  Braces,
  Lightbulb,
  Eye,
} from "lucide-react";
import type { BossBattle, Flashcard, LessonSection, QuizQuestion } from "../data/types";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";
import { StatusBadge } from "./ui";

/* ---------------- architecture pipeline ---------------- */

const NODES = [
  {
    id: "browser",
    name: "Browser",
    tech: "React 19",
    icon: <Monitor size={17} />,
    owns: "Presentation only. Renders the UI, collects input, validates for friendliness. Everything here is user-controlled, so it is never trusted with a decision.",
  },
  {
    id: "next",
    name: "Next.js",
    tech: "App Router",
    icon: <Braces size={17} />,
    owns: "The professional presentation layer: routing, Server/Client Components, metadata/SEO, streaming. It calls the API — it does not replace it.",
  },
  {
    id: "nest",
    name: "NestJS",
    tech: "on Fastify 5",
    icon: <Server size={17} />,
    owns: "The authority. Verifies Supabase-issued tokens, enforces permissions and business rules, runs transactions, writes audit logs. If a rule matters, it lives here.",
  },
  {
    id: "prisma",
    name: "Prisma",
    tech: "pinned 7.9.15",
    icon: <Database size={17} />,
    owns: "The translator. Typed calls become SQL; rows become typed objects. Backend and workers only — a Prisma client never ships to a browser bundle.",
  },
  {
    id: "pg",
    name: "PostgreSQL",
    tech: "Supabase",
    icon: <HardDrive size={17} />,
    owns: "The memory and the final guard. Tables, constraints, indexes, transactions. It outlives any single server and rejects bad data even if the code forgets.",
  },
];

export function ArchDiagram() {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % NODES.length), 2300);
    return () => window.clearInterval(id);
  }, [paused, reduced]);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const pick = (i: number) => {
    setActive(i);
    if (!reduced) {
      setPaused(true);
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => setPaused(false), 9000);
    }
  };

  const node = NODES[active];

  return (
    <div>
      {/* desktop pipeline */}
      <div className="relative hidden md:block">
        <div className="absolute left-[9%] right-[9%] top-[30px] h-[2px] flow-html" aria-hidden="true" />
        {!reduced && <div className="packet top-[25px]" aria-hidden="true" />}
        <div className="relative grid grid-cols-5 gap-2.5">
          {NODES.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className={`arch-node ${i === active ? "active" : ""}`}
              onClick={() => pick(i)}
              aria-pressed={i === active}
            >
              <span className="flex items-center gap-1.5 mb-1" style={{ color: i === active ? "var(--brand-ink)" : "var(--muted)" }}>
                {n.icon}
              </span>
              <span className="font-display font-semibold text-[0.92rem] block leading-tight" style={{ color: "var(--ink)" }}>
                {n.name}
              </span>
              <span className="font-mono text-[0.62rem]" style={{ color: "var(--muted)" }}>
                {n.tech}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* mobile pipeline */}
      <div className="md:hidden relative pl-4">
        <span className="absolute left-[7px] top-2 bottom-2 w-[2px]" style={{ background: "var(--line-2)" }} aria-hidden="true" />
        <div className="flex flex-col gap-2">
          {NODES.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className={`arch-node relative ${i === active ? "active" : ""}`}
              onClick={() => pick(i)}
              aria-pressed={i === active}
            >
              <span
                className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
                style={{ background: "var(--bg)", borderColor: i === active ? "var(--brand)" : "var(--line-2)" }}
                aria-hidden="true"
              />
              <span className="flex items-center gap-2">
                <span style={{ color: "var(--brand-ink)" }}>{n.icon}</span>
                <span className="font-display font-semibold" style={{ color: "var(--ink)" }}>
                  {n.name}
                </span>
                <span className="font-mono text-[0.62rem] ml-auto" style={{ color: "var(--muted)" }}>
                  {n.tech}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        key={node.id}
        className="fade-in mt-4 p-4 rounded-[var(--r)] border flex gap-3 items-start"
        style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
        role="status"
      >
        <span style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0">{node.icon}</span>
        <div>
          <div className="font-display font-semibold text-[0.95rem]">
            {node.name} <span className="font-mono text-[0.65rem] font-normal" style={{ color: "var(--muted)" }}>{node.tech}</span>
          </div>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {node.owns}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="chip"><KeyRound size={11} style={{ color: "var(--amber)" }} /> Supabase Auth — identity</span>
        <span className="chip"><UploadCloud size={11} style={{ color: "var(--sky)" }} /> Storage — private files</span>
        <span className="chip"><Radio size={11} style={{ color: "var(--rose)" }} /> Realtime — optional signal</span>
      </div>
    </div>
  );
}

/* ---------------- quiz ---------------- */

export function Quiz({ lessonId, questions }: { lessonId: string; questions: QuizQuestion[] }) {
  const { recordQuiz } = useProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const allAnswered = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  useEffect(() => {
    if (allAnswered) recordQuiz(lessonId, score, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);

  const pick = (qi: number, oi: number) =>
    setAnswers((prev) => {
      if (prev[qi] !== null) return prev;
      const next = [...prev];
      next[qi] = oi;
      return next;
    });

  return (
    <div>
      <ol className="flex flex-col gap-6">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={qi} className="panel p-5">
              <div className="font-display font-semibold leading-snug mb-3">
                <span className="font-mono text-[0.7rem] mr-2" style={{ color: "var(--brand-ink)" }}>
                  Q{qi + 1}
                </span>
                {q.q ?? q.question}
              </div>
              <div className="flex flex-col gap-2" role="group" aria-label={`Question ${qi + 1} options`}>
                {q.options.map((opt, oi) => {
                  const answered = chosen !== null;
                  const isCorrect = oi === q.answer;
                  const isChosen = oi === chosen;
                  let border = "var(--line)";
                  let bg = "var(--surface)";
                  let color = "var(--ink-2)";
                  if (answered && isCorrect) {
                    border = "var(--brand)";
                    bg = "var(--brand-soft)";
                    color = "var(--brand-ink)";
                  } else if (answered && isChosen && !isCorrect) {
                    border = "var(--rose)";
                    bg = "var(--rose-soft)";
                    color = "var(--rose-ink)";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => pick(qi, oi)}
                      className="text-left rounded-[var(--r-sm)] border px-3.5 py-2.5 text-[0.9rem] transition-all"
                      style={{ borderColor: border, background: bg, color, cursor: answered ? "default" : "pointer" }}
                    >
                      <span className="font-mono text-[0.68rem] mr-2 opacity-70">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {chosen !== null && (
                <div className="fade-in mt-3 text-sm leading-relaxed flex gap-2 items-start">
                  <Lightbulb size={15} className="shrink-0 mt-0.5" style={{ color: chosen === q.answer ? "var(--brand)" : "var(--amber)" }} />
                  <span style={{ color: "var(--ink-2)" }}>
                    <strong style={{ color: chosen === q.answer ? "var(--brand-ink)" : "var(--amber-ink)" }}>
                      {chosen === q.answer ? "Correct. " : "Not quite. "}
                    </strong>
                    {q.explain ?? q.explanation}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="panel p-5 mt-5 flex flex-wrap items-center gap-4" aria-live="polite">
        {allAnswered ? (
          <>
            <div
              className="font-display text-2xl font-bold"
              style={{ color: score === questions.length ? "var(--brand-ink)" : "var(--amber-ink)" }}
            >
              {score}/{questions.length}
            </div>
            <div className="text-sm flex-1" style={{ color: "var(--ink-2)" }}>
              {score === questions.length
                ? "Perfect — best score saved to your progress."
                : score >= questions.length * 0.7
                  ? "Solid. Best score saved — retake any time to improve it."
                  : "Worth a re-read of the sections above, then a retake. Best score is saved."}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAnswers(questions.map(() => null))}>
              <RefreshCw size={13} /> Retake
            </button>
          </>
        ) : (
          <div className="text-sm flex-1" style={{ color: "var(--muted)" }}>
            Answer every question to record a score. Best score is kept on this device.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- flashcards ---------------- */

export function Flashcards({ lessonId, cards }: { lessonId: string; cards: Flashcard[] }) {
  const { isCardKnown, toggleCardKnown, knownCount } = useProgress();
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[order[idx]];
  const known = knownCount(lessonId);

  const go = (dir: 1 | -1) => {
    setIdx((i) => (i + dir + order.length) % order.length);
    setFlipped(false);
  };

  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setIdx(0);
    setFlipped(false);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Card back — press to flip" : "Card front — press to flip"}
        className="panel p-6 min-h-[180px] flex flex-col justify-center cursor-pointer select-none transition-transform hover:-translate-y-0.5"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          } else if (e.key === "ArrowRight") go(1);
          else if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <div className="font-mono text-[0.66rem] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--muted)" }}>
          {flipped ? "Answer" : "Question"} · card {idx + 1}/{cards.length}
        </div>
        <div key={`${order[idx]}-${flipped}`} className="fade-in font-display text-lg font-medium leading-snug" style={{ color: "var(--ink)" }}>
          {flipped ? card.back : card.front}
        </div>
        <div className="mt-4 text-[0.72rem] font-mono" style={{ color: "var(--muted)" }}>
          click / space to flip · ← → to move
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button type="button" className="btn btn-soft btn-sm" onClick={() => go(-1)} aria-label="Previous card">
          <ArrowLeft size={13} />
        </button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setFlipped((f) => !f)}>
          Flip
        </button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => go(1)} aria-label="Next card">
          <ArrowRight size={13} />
        </button>
        <button type="button" className="btn btn-soft btn-sm" onClick={shuffle}>
          <Shuffle size={13} /> Shuffle
        </button>
        <button
          type="button"
          className={`btn btn-sm ${isCardKnown(lessonId, card.front) ? "btn-primary" : "btn-ghost"}`}
          onClick={() => toggleCardKnown(lessonId, card.front)}
        >
          <Check size={13} /> {isCardKnown(lessonId, card.front) ? "Known" : "Mark known"}
        </button>
        <span className="chip ml-auto">
          {known}/{cards.length} known
        </span>
      </div>
    </div>
  );
}

/* ---------------- progress ring ---------------- */

export function ProgressRing({
  value,
  size = 110,
  stroke = 9,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.9s var(--ease)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-xl leading-none">{Math.round(pct * 100)}%</span>
        <span className="font-mono text-[0.58rem] uppercase tracking-widest mt-1" style={{ color: "var(--muted)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/* ---------------- checkpoint ---------------- */

export function Checkpoint({ lessonId }: { lessonId: string }) {
  const { isComplete, toggleComplete } = useProgress();
  const done = isComplete(lessonId);
  return (
    <div className="panel p-5 flex flex-wrap items-center gap-4" style={{ borderColor: done ? "var(--brand)" : "var(--line)" }}>
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-pop"
        style={{
          background: done ? "var(--brand)" : "var(--surface-3)",
          color: done ? "var(--brand-contrast)" : "var(--muted)",
        }}
      >
        <CheckCircle2 size={20} />
      </span>
      <div className="flex-1 min-w-[200px]">
        <div className="font-display font-semibold">Checkpoint</div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {done ? "Lesson marked complete — progress is saved on this device." : "Finished the quiz and flashcards? Seal it."}
        </div>
      </div>
      <button type="button" className={`btn ${done ? "btn-ghost" : "btn-primary"}`} onClick={() => toggleComplete(lessonId)}>
        {done ? "Undo completion" : "Mark lesson complete"}
      </button>
    </div>
  );
}

/* ---------------- challenge with hidden solution ---------------- */

export function ChallengeBlock({
  prompt,
  hints,
  solution,
}: {
  prompt: string;
  hints: string[];
  solution: string;
}) {
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="panel p-5">
      <p className="text-[0.95rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        {prompt}
      </p>
      <div className="flex flex-col gap-2 mt-4">
        {hints.map((h, i) => (
          <div key={i}>
            <button
              type="button"
              className="btn btn-soft btn-sm"
              aria-expanded={openHints.has(i)}
              onClick={() =>
                setOpenHints((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
            >
              <Lightbulb size={13} style={{ color: "var(--amber)" }} />
              Hint {i + 1} {openHints.has(i) ? "· hide" : ""}
            </button>
            {openHints.has(i) && (
              <p className="fade-in text-sm mt-2 pl-3 border-l" style={{ color: "var(--ink-2)", borderColor: "var(--amber)" }}>
                {h}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        {!revealed ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRevealed(true)}>
            <Eye size={13} /> Attempt it first — then reveal the solution
          </button>
        ) : (
          <div className="fade-in">
            <div className="font-mono text-[0.66rem] uppercase tracking-[0.18em] mb-2" style={{ color: "var(--brand-ink)" }}>
              Reference solution
            </div>
            <pre
              className="text-[0.82rem] leading-relaxed whitespace-pre-wrap font-mono rounded-[var(--r)] p-4 border overflow-x-auto"
              style={{ background: "var(--code-bg)", color: "var(--code-ink)", borderColor: "var(--line)" }}
            >
              {solution}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- boss battle card ---------------- */

export function BossCard({ bb }: { bb: BossBattle }) {
  const isImplemented = bb.status === "implemented";
  return (
    <div
      className="panel panel-hover p-5 relative overflow-hidden"
      style={isImplemented ? { borderColor: "var(--brand)" } : undefined}
    >
      <span
        className="absolute top-4 right-4"
        style={{ color: isImplemented ? "var(--brand)" : "var(--muted)" }}
        aria-hidden="true"
      >
        {isImplemented ? <CheckCircle2 size={16} /> : <Lock size={15} />}
      </span>
      <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--amber-ink)" }}>
        Unlocks after {bb.afterPhase.toUpperCase()}
      </div>
      <h3 className="font-display font-semibold text-lg leading-tight">{bb.name}</h3>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>
        {bb.desc}
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {bb.criteria.map((c) => (
          <li key={c} className="flex items-start gap-2 text-[0.83rem]" style={{ color: "var(--ink-2)" }}>
            <Target size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2">
        <StatusBadge status={bb.status} />
        {isImplemented && bb.lessonId ? (
          <Link to={`lesson/${bb.lessonId}`} className="btn btn-soft btn-sm">
            Enter the gauntlet <ArrowRight size={13} />
          </Link>
        ) : (
          <span className="text-[0.72rem] font-mono ml-1" style={{ color: "var(--muted)" }}>
            authored in a future pass
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------- section renderer helpers ---------------- */

export function SectionAnchor({ s }: { s: LessonSection }) {
  return <span id={slugify(s.heading)} />;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
