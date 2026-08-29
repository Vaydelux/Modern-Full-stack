import { ArrowRight, BookOpen, Bug, CheckCircle2, Database, Globe2, KeyRound, Layers, Map, Shield, Target } from "lucide-react";
import { ArchDiagram, BossCard } from "../components/widgets";
import { Reveal, SectionHeading, StatusBadge, useScramble } from "../components/ui";
import { IMPLEMENTED_LESSONS, PHASES, STAGES } from "../data/curriculum";
import { BOSS_BATTLES } from "../data/reference";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";

const OWNERSHIP = [
  {
    icon: <KeyRound size={16} />,
    concern: "Identity — who are you?",
    owner: "Supabase Auth",
    note: "Issues and refreshes signed tokens. The server verifies them; the browser only carries them.",
  },
  {
    icon: <Shield size={16} />,
    concern: "Authorization & business rules",
    owner: "NestJS on Fastify",
    note: "The authority: permissions, workflows, transactions, audit. If a rule matters, it lives here.",
  },
  {
    icon: <Layers size={16} />,
    concern: "Data access & translation",
    owner: "Prisma 7.9.15 (server-only)",
    note: "Typed calls become SQL. Never in a browser bundle — secrets and power stay server-side.",
  },
  {
    icon: <Database size={16} />,
    concern: "Final integrity",
    owner: "PostgreSQL constraints",
    note: "Unique emails, non-negative quantities, foreign keys. The guard that outlives any deploy.",
  },
  {
    icon: <Globe2 size={16} />,
    concern: "Presentation & UX validation",
    owner: "React + Next.js",
    note: "Renders, collects input, validates for friendliness. Politely — never as protection.",
  },
  {
    icon: <Bug size={16} />,
    concern: "Input validation authority",
    owner: "Backend DTOs",
    note: "Frontend Zod schemas are a separate trust-boundary concern; DTOs are the law.",
  },
];

const LESSON_FLOW = [
  "Simple Explanation",
  "Why It Matters",
  "Mental Model",
  "Technical Detail",
  "Worked Examples",
  "Guided Practice",
  "Intentional Failure",
  "Quiz",
  "Project Use",
  "Production Notes",
];

export default function Landing() {
  const headline = useScramble("Zero → Mastery.");
  const { isComplete } = useProgress();
  const firstLesson = IMPLEMENTED_LESSONS.find((l) => !isComplete(l.id)) ?? IMPLEMENTED_LESSONS[0];
  const totalLessons = PHASES.reduce((sum, p) => sum + p.lessons.length, 0);

  return (
    <div className="max-w-site">
      {/* ---------- opening: the request pipeline ---------- */}
      <section className="grid lg:grid-cols-12 gap-10 pt-10 md:pt-16 pb-14 items-start">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="chip" style={{ color: "var(--brand-ink)", borderColor: "color-mix(in srgb, var(--brand) 40%, transparent)", background: "var(--brand-soft)" }}>
                <span className="w-1.5 h-1.5 rounded-full pulse-soft" style={{ background: "var(--brand)" }} aria-hidden="true" />
                Living curriculum · Pass 001
              </span>
              <span className="chip">Prisma 7.9.15 pinned</span>
            </div>
            <h1 className="font-display font-bold text-[clamp(2.5rem,6vw,4.1rem)] leading-[1.02] tracking-tight">
              {headline}
              <span className="block text-[clamp(1.15rem,2.4vw,1.55rem)] font-medium mt-3 leading-snug" style={{ color: "var(--ink-2)" }}>
                Modern Full-Stack Web Development — from first request to monitored production.
              </span>
            </h1>
            <p className="mt-5 text-[1.02rem] leading-relaxed max-w-[52ch]" style={{ color: "var(--ink-2)" }}>
              A project-first path through <strong style={{ color: "var(--ink)" }}>React + Next.js</strong> on the front,{" "}
              <strong style={{ color: "var(--ink)" }}>NestJS on Fastify</strong> as the authority,{" "}
              <strong style={{ color: "var(--ink)" }}>Prisma 7.9.15</strong> translating, and{" "}
              <strong style={{ color: "var(--ink)" }}>Supabase PostgreSQL</strong> remembering. Every rule has an owner.
              Every button calls a real endpoint. Localhost success is never mastery.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to={`lesson/${firstLesson.id}`} className="btn btn-primary">
                <BookOpen size={16} /> Start Phase 0{isComplete(firstLesson.id) ? " again" : ""}
              </Link>
              <Link to="roadmap" className="btn btn-ghost">
                <Map size={16} /> Explore the roadmap
              </Link>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-9">
              {[
                { k: "Phases", v: String(PHASES.length) },
                { k: "Lessons mapped", v: String(totalLessons) },
                { k: "Mastery stages", v: String(STAGES.length) },
                { k: "Boss battles", v: String(BOSS_BATTLES.length) },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                    {s.k}
                  </dt>
                  <dd className="font-display font-bold text-2xl mt-0.5" style={{ color: "var(--ink)" }}>
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={120}>
            <div className="panel p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em]" style={{ color: "var(--brand-ink)" }}>
                    The architecture · click a node
                  </div>
                  <h2 className="font-display font-semibold text-lg mt-1">One request, five owners</h2>
                </div>
                <StatusBadge status="implemented" />
              </div>
              <ArchDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- ownership ledger ---------- */}
      <section className="py-12">
        <Reveal>
          <SectionHeading kicker="The rule you will quote forever" title="Who owns what — and why it ends security arguments" />
        </Reveal>
        <div className="panel overflow-hidden">
          {OWNERSHIP.map((row, i) => (
            <Reveal key={row.concern} delay={i * 40}>
              <div
                className="grid md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center transition-colors"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="md:col-span-4 flex items-center gap-3">
                  <span style={{ color: "var(--brand-ink)" }}>{row.icon}</span>
                  <span className="font-display font-semibold text-[0.95rem]">{row.concern}</span>
                </div>
                <div className="md:col-span-3">
                  <span className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>{row.owner}</span>
                </div>
                <div className="md:col-span-5 text-[0.88rem] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {row.note}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- lesson contract ---------- */}
      <section className="py-12">
        <Reveal>
          <SectionHeading kicker="Learn → practice → test → apply" title="How every major lesson works" />
        </Reveal>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max" role="list" aria-label="Lesson quality contract steps">
            {LESSON_FLOW.map((step, i) => (
              <Reveal key={step} delay={i * 50}>
                <div
                  role="listitem"
                  className="flex items-center gap-2.5 px-4 py-3 rounded-[var(--r)] border"
                  style={{ background: "var(--surface)", borderColor: "var(--line)" }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[0.68rem] font-semibold shrink-0"
                    style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[0.85rem] font-medium whitespace-nowrap">{step}</span>
                  {i < LESSON_FLOW.length - 1 && <ArrowRight size={13} className="ml-1" style={{ color: "var(--muted)" }} aria-hidden="true" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal>
          <p className="text-sm mt-4 max-w-[70ch]" style={{ color: "var(--muted)" }}>
            Not every small page carries every element — but major lessons complete the whole loop, including an
            intentional failure you debug with the nine-step method, and a challenge you attempt before the hidden
            solution exists for you.
          </p>
        </Reveal>
      </section>

      {/* ---------- mastery ladder ---------- */}
      <section className="py-12">
        <Reveal>
          <SectionHeading kicker="Measurable, not vibes" title="The mastery ladder" />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {STAGES.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <Link
                to="mastery"
                className="panel panel-hover p-4 block h-full no-underline"
                style={{ borderColor: i === 0 ? "var(--brand)" : "var(--line)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.66rem]" style={{ color: "var(--muted)" }}>
                    0{i + 1}
                  </span>
                  {i === 0 ? <StatusBadge status="draft" /> : <StatusBadge status="planned" />}
                </div>
                <div className="font-display font-semibold mt-2 leading-tight text-[0.95rem]" style={{ color: "var(--ink)" }}>
                  {s.title}
                </div>
                <div className="text-[0.74rem] mt-1.5 leading-relaxed line-clamp-3" style={{ color: "var(--muted)" }}>
                  {s.exitCriteria}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- phase strip ---------- */}
      <section className="py-12">
        <Reveal>
          <SectionHeading kicker="45 phases · one direction" title="The full route, honestly labeled" />
        </Reveal>
        <Reveal>
          <div className="panel p-5">
            {STAGES.map((stage) => (
              <div key={stage.id} className="mb-4 last:mb-0">
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand-ink)" }}>
                  {stage.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {PHASES.filter((p) => p.stage === stage.id).map((p) => (
                    <Link
                      key={p.id}
                      to="roadmap"
                      className="chip hover:border-[var(--brand)] transition-colors"
                      style={{ textTransform: "none", letterSpacing: 0 }}
                      title={p.focus}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            p.status === "implemented"
                              ? "var(--brand)"
                              : p.status === "partial"
                                ? "var(--amber)"
                                : "var(--line-2)",
                        }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[0.64rem] opacity-70">P{String(p.n).padStart(2, "0")}</span>
                      {p.title.length > 34 ? `${p.title.slice(0, 34)}…` : p.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- boss battles ---------- */}
      <section className="py-12">
        <Reveal>
          <SectionHeading kicker="Cumulative gauntlets" title="Boss Battles — pass criteria, not participation trophies" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {BOSS_BATTLES.slice(0, 3).map((bb, i) => (
            <Reveal key={bb.id} delay={i * 80}>
              <BossCard bb={bb} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- closing band ---------- */}
      <section className="py-14">
        <Reveal>
          <div className="panel p-7 md:p-10 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(40rem 16rem at 15% 0%, var(--glow-a), transparent 65%)" }}
              aria-hidden="true"
            />
            <div className="relative flex flex-wrap items-center gap-6 justify-between">
              <div className="max-w-[52ch]">
                <h2 className="font-display font-bold text-2xl md:text-3xl leading-tight">
                  {IMPLEMENTED_LESSONS.length} lessons live. {PHASES.length} phases mapped. One batch at a time.
                </h2>
                <p className="text-[0.95rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  This course is authored in bounded passes with a public manifest — what exists is real, what is
                  planned says so. Your progress, quiz bests, and flashcards persist on this device.
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                <Link to={`lesson/${firstLesson.id}`} className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  {isComplete(firstLesson.id) ? "Continue the course" : "Begin Lesson 1 — free"}
                  <ArrowRight size={15} />
                </Link>
                <Link to="status" className="btn btn-ghost justify-center">
                  <Target size={15} /> Read the build status
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
