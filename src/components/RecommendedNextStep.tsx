import { useMemo } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Flame,
  HelpCircle,
  Map,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ALL_LESSONS, IMPLEMENTED_LESSONS, PHASES, STAGES, lessonById } from "../data/curriculum";
import { BOSS_BATTLES } from "../data/reference";
import { Link } from "../lib/router";
import { useProgress } from "../lib/store";

const LESSON_CONTEXT_MAP: Record<string, string> = {
  "p00-l1": "Learn the 3 fundamental jobs (show, decide, remember) and why the client is never trusted.",
  "p00-l2": "Master terminal reflexes, package managers, semver rules, and secrets hygiene.",
  "p00-l3": "Build raw HTTP servers from scratch to understand requests, headers, and status codes.",
  "p00-l4": "Internalize DevTools Network/Console tabs and the 9-step root-cause debugging loop.",
  "p00-l5": "Prevent secret leaks, validate environment variables on boot, and enforce config safety.",
  "p01-l1": "Semantic HTML landmarks, accessible forms, keyboard navigation, and ARIA labels.",
  "p01-l2": "Modern CSS layouts with Flexbox and Grid, avoiding specificity wars and brittle floats.",
  "p02-l1": "JavaScript execution model, call stack, microtask queue, and closure memory mechanics.",
  "p03-l1": "TypeScript type system foundations, generics, unions, and strict compiler configurations.",
  "p04-l1": "Node.js runtime internals, EventEmitter, Streams, and Fastify server architectures.",
  "p05-l1": "React 19 component lifecycle, state synchronization, and unidirectional data flow.",
  "p06-l1": "Next.js App Router, Server Components vs Client Components, streaming, and metadata.",
  "p07-l1": "PostgreSQL relational modeling, foreign keys, normalization, and ACID guarantees.",
  "p08-l1": "Prisma ORM schema migrations, typed relations, query optimization, and connection pools.",
  "p09-l1": "NestJS dependency injection, controllers, guards, interceptors, and modular backend design.",
  "p10-l1": "REST API contract design, idempotency keys, error handling standards, and versioning.",
  "p11-l1": "Authentication architecture: JWTs, secure HTTP-only cookies, refresh token rotation, and sessions.",
  "p12-l1": "Docker containerization, multi-stage builds, non-root users, and minimal Alpine images.",
  "p13-l1": "Redis caching patterns: cache-aside, write-through, TTL expiration, and cache stamps.",
  "p14-l1": "Background queues with BullMQ, delayed jobs, worker concurrency, and failure retries.",
  "p15-l1": "Web security hardening: CORS preflight, CSP policies, XSS, CSRF, and IDOR prevention.",
};

export function RecommendedNextStep() {
  const { completed, quiz, isComplete, toggleComplete } = useProgress();

  // Find the primary recommended lesson
  const recommendation = useMemo(() => {
    // 1. Check if user is currently inside a partially completed phase
    for (const phase of PHASES) {
      const phaseLessons = phase.lessons;
      const completedInPhase = phaseLessons.filter((l) => isComplete(l.id));
      if (completedInPhase.length > 0 && completedInPhase.length < phaseLessons.length) {
        const nextInPhase = phaseLessons.find((l) => !isComplete(l.id));
        if (nextInPhase) {
          const meta = lessonById(nextInPhase.id);
          const stage = STAGES.find((s) => s.id === phase.stage);
          return {
            lesson: nextInPhase,
            phase,
            stage,
            meta,
            reason: `Continue your active Phase ${String(phase.n).padStart(2, "0")}: ${phase.title} (${completedInPhase.length}/${phaseLessons.length} completed)`,
            badge: "In Progress Phase",
          };
        }
      }
    }

    // 2. Otherwise find the first uncompleted lesson sequentially
    for (const phase of PHASES) {
      for (const l of phase.lessons) {
        if (!isComplete(l.id)) {
          const meta = lessonById(l.id);
          const stage = STAGES.find((s) => s.id === phase.stage);
          return {
            lesson: l,
            phase,
            stage,
            meta,
            reason: `Next up on your roadmap: Phase ${String(phase.n).padStart(2, "0")} · ${phase.title}`,
            badge: "Sequential Next",
          };
        }
      }
    }

    // 3. If all lessons are completed!
    return null;
  }, [isComplete, completed]);

  // Find secondary recommendations (e.g. low quiz scores to review, or next boss battle)
  const reviewRecommendation = useMemo(() => {
    const lowQuiz = Object.entries(quiz).find(([_, res]) => res.correct / res.total < 0.8);
    if (lowQuiz) {
      const lesson = ALL_LESSONS.find((l) => l.id === lowQuiz[0]);
      if (lesson) {
        return {
          lesson,
          score: Math.round((lowQuiz[1].correct / lowQuiz[1].total) * 100),
          reason: `Score was ${lowQuiz[1].correct}/${lowQuiz[1].total}. Re-test to reinforce retention.`,
        };
      }
    }
    return null;
  }, [quiz]);

  const nextBossBattle = useMemo(() => {
    return BOSS_BATTLES.find((b) => b.status === "implemented") ?? BOSS_BATTLES[0];
  }, []);

  const totalLessons = ALL_LESSONS.length;
  const masteredCount = completed.length;
  const masteryPercentage = Math.round((masteredCount / totalLessons) * 100);

  return (
    <div className="panel p-6 mb-8 border relative overflow-hidden" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      {/* Top Banner with Mastery Tracker status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[0.72rem] font-bold shrink-0"
            style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
          >
            <Compass size={15} />
          </span>
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--brand-ink)" }}>
              Personalized Learning Path
            </div>
            <h2 className="font-display font-bold text-lg leading-tight">Recommended Next Step</h2>
          </div>
        </div>

        {/* Live Mastery Meter Badge */}
        <div className="flex items-center gap-2 font-mono text-[0.72rem]">
          <Link
            to="roadmap"
            className="px-3 py-1 rounded-[var(--r-sm)] border flex items-center gap-1.5 no-underline transition-colors hover:border-[var(--brand)]"
            style={{ background: "var(--surface-2)", color: "var(--ink-2)", borderColor: "var(--line-2)" }}
            title="Open interactive Mastery Tracker on the Roadmap"
          >
            <Trophy size={13} style={{ color: "var(--brand)" }} />
            <span>
              Mastered <strong style={{ color: "var(--brand-ink)" }}>{masteredCount}</strong> / {totalLessons} ({masteryPercentage}%)
            </span>
          </Link>
        </div>
      </div>

      {recommendation ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Recommendation Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="font-mono text-[0.66rem] uppercase tracking-wider px-2 py-0.5 rounded-[var(--r-sm)] font-semibold"
                  style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                >
                  {recommendation.badge}
                </span>
                <span className="font-mono text-[0.68rem]" style={{ color: "var(--muted)" }}>
                  P{String(recommendation.phase.n).padStart(2, "0")} · {recommendation.stage?.title.split(" ")[0]} · ~{recommendation.lesson.minutes} min
                </span>
              </div>

              <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight leading-snug">
                {recommendation.lesson.title}
              </h3>

              <p className="text-[0.88rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                {LESSON_CONTEXT_MAP[recommendation.lesson.id] ??
                  recommendation.phase.focus ??
                  "Dive into hands-on code examples, architectural diagrams, common pitfalls, and the knowledge quiz."}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[0.78rem]" style={{ color: "var(--muted)" }}>
                <Sparkles size={13} style={{ color: "var(--brand)" }} />
                <span>{recommendation.reason}</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--line)" }}>
              <Link to={`lesson/${recommendation.lesson.id}`} className="btn btn-primary">
                <BookOpen size={15} /> Start Lesson <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                onClick={() => toggleComplete(recommendation.lesson.id)}
                className="btn btn-soft flex items-center gap-1.5 text-[0.82rem]"
                title="Mark this lesson as completed in your Mastery Tracker"
              >
                <CheckCircle2 size={15} style={{ color: isComplete(recommendation.lesson.id) ? "var(--brand)" : "var(--muted)" }} />
                <span>{isComplete(recommendation.lesson.id) ? "Mastered" : "Mark Mastered"}</span>
              </button>

              <Link
                to="roadmap"
                className="btn btn-ghost flex items-center gap-1 text-[0.82rem]"
                title="View in full roadmap"
              >
                <Map size={14} /> Roadmap
              </Link>
            </div>
          </div>

          {/* Secondary Side Insights & Drill */}
          <div className="flex flex-col justify-between p-4 rounded-[var(--r)] border gap-3" style={{ background: "var(--surface-2)", borderColor: "var(--line-2)" }}>
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--muted)" }}>
                Adaptive Next Drills
              </div>

              {reviewRecommendation ? (
                <div className="mb-3 p-3 rounded-[var(--r-sm)] border" style={{ background: "var(--surface-3)", borderColor: "var(--line-2)" }}>
                  <div className="flex items-center gap-1.5 font-mono text-[0.66rem] uppercase" style={{ color: "var(--amber-ink)" }}>
                    <RotateCcw size={12} />
                    <span>Review Recommended</span>
                  </div>
                  <div className="font-semibold text-[0.84rem] mt-1 line-clamp-1">{reviewRecommendation.lesson.title}</div>
                  <div className="text-[0.74rem] mt-0.5" style={{ color: "var(--muted)" }}>{reviewRecommendation.reason}</div>
                  <Link
                    to={`lesson/${reviewRecommendation.lesson.id}#checkpoint-sec`}
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[0.72rem] no-underline hover:underline"
                    style={{ color: "var(--brand-ink)" }}
                  >
                    Retake Quiz <ArrowRight size={11} />
                  </Link>
                </div>
              ) : (
                <div className="mb-3 p-3 rounded-[var(--r-sm)] border" style={{ background: "var(--surface-3)", borderColor: "var(--line-2)" }}>
                  <div className="flex items-center gap-1.5 font-mono text-[0.66rem] uppercase" style={{ color: "var(--brand-ink)" }}>
                    <Target size={12} />
                    <span>Target Boss Battle</span>
                  </div>
                  <div className="font-semibold text-[0.84rem] mt-1 line-clamp-1">{nextBossBattle.name}</div>
                  <div className="text-[0.74rem] mt-0.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                    {nextBossBattle.desc}
                  </div>
                  <Link
                    to="roadmap"
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[0.72rem] no-underline hover:underline"
                    style={{ color: "var(--brand-ink)" }}
                  >
                    View Milestone <ArrowRight size={11} />
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-2 border-t font-mono text-[0.68rem] flex items-center justify-between" style={{ borderColor: "var(--line-2)", color: "var(--muted)" }}>
              <span>Saved locally in browser</span>
              <span className="flex items-center gap-1" style={{ color: "var(--brand)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Celebratory State when 100% completed */
        <div className="text-center py-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
          >
            <Trophy size={24} />
          </div>
          <h3 className="font-display font-bold text-2xl">Curriculum Completed — Full Stack Mastery!</h3>
          <p className="text-[0.92rem] mt-2 max-w-[60ch] mx-auto" style={{ color: "var(--muted)" }}>
            You have marked all {totalLessons} curriculum modules as mastered. Review the production readiness scorecard or build the capstones to prove production readiness.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="readiness" className="btn btn-primary">
              <Award size={15} /> Production Scorecard
            </Link>
            <Link to="roadmap" className="btn btn-ghost">
              <Map size={15} /> Review Roadmap
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
