import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  Clock,
  Cloud,
  CloudOff,
  Copy,
  Database,
  Filter,
  Flame,
  Layers,
  PartyPopper,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import type { LessonStatus } from "../data/types";
import { BossCard } from "../components/widgets";
import { Reveal, SectionHeading, StatusBadge } from "../components/ui";
import { ALL_LESSONS, IMPLEMENTED_LESSONS, PHASES, STAGES } from "../data/curriculum";
import { BOSS_BATTLES } from "../data/reference";
import { Crumbs } from "../components/chrome";
import { Link } from "../lib/router";
import { useMasterySync, useProgress } from "../lib/store";
import { CloudSyncModal, RadialProgressBar } from "../components/CompletionDashboard";
import { NestJSArchitectureSection } from "../components/NestJSArchitectureSection";
import { fireGrandConfetti } from "../components/CelebrationOverlay";

function LessonRow({
  id,
  title,
  status,
  minutes,
  outline,
}: {
  id: string;
  title: string;
  status: LessonStatus;
  minutes: number;
  outline?: string[];
}) {
  const { isComplete, toggleComplete } = useProgress();
  const [open, setOpen] = useState(false);
  const done = isComplete(id);
  const hasOutline = !!outline && outline.length > 0;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
      className={`rounded-[var(--r-sm)] transition-colors ${
        done ? "bg-[var(--brand-soft)]/25" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 pr-1.5 rounded-[var(--r-sm)] transition-colors hover:bg-[var(--surface-2)] group">
        {/* Interactive Mastery Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleComplete(id);
          }}
          className="pl-3 pr-1 py-2 shrink-0 cursor-pointer focus:outline-none transition-transform active:scale-90"
          aria-label={`Mark "${title}" as ${done ? "incomplete" : "mastered"}`}
          title={done ? "Mastered — click to mark unmastered" : "Click to mark mastered"}
          role="checkbox"
          aria-checked={done}
        >
          {done ? (
            <motion.div
              initial={{ scale: 0.6, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <CheckCircle2
                size={17}
                className="transition-colors"
                style={{ color: "var(--brand)" }}
              />
            </motion.div>
          ) : status === "draft" ? (
            <CircleDashed
              size={17}
              className="transition-colors hover:opacity-100 opacity-60"
              style={{ color: "var(--amber)" }}
            />
          ) : (
            <Circle
              size={17}
              className="transition-colors hover:opacity-100 opacity-40 group-hover:opacity-75"
              style={{ color: "var(--line-2)" }}
            />
          )}
        </button>

        <Link
          to={`lesson/${id}`}
          className="flex-1 py-2 text-[0.86rem] leading-snug no-underline flex items-center gap-2"
          style={{
            color: done ? "var(--ink)" : status === "planned" ? "var(--muted)" : "var(--ink-2)",
            textDecoration: done ? "none" : undefined,
          }}
        >
          <span className={done ? "font-medium" : ""}>{title}</span>
          <AnimatePresence>
            {done && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -4 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -4 }}
                className="font-mono text-[0.58rem] uppercase tracking-wider px-1.5 py-0.2 rounded-full shrink-0"
                style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
              >
                Mastered
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <span className="font-mono text-[0.64rem] flex items-center gap-1 shrink-0" style={{ color: "var(--muted)" }}>
          <Clock size={10} /> {minutes}m
        </span>

        {hasOutline ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} committed scope for ${title}`}
            title="Committed scope"
            className="shrink-0 p-1 rounded-[var(--r-sm)] transition-colors hover:bg-[var(--surface-3)]"
            style={{ color: open ? "var(--amber-ink)" : "var(--muted)" }}
          >
            <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--t-fast)" }} />
          </button>
        ) : (
          <span className="w-[21px] shrink-0" aria-hidden="true" />
        )}

        <Link
          to={`lesson/${id}`}
          className="shrink-0 py-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Open ${title}`}
        >
          <ChevronRight size={13} style={{ color: "var(--brand)" }} />
        </Link>
      </div>

      {/* Smooth height-expanding animation for scope outline */}
      <AnimatePresence initial={false}>
        {open && hasOutline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mb-2.5 mr-4 ml-10 flex flex-col gap-1 pt-1" aria-label={`Scope for ${title}`}>
              {outline!.map((o) => (
                <li key={o} className="text-[0.76rem] leading-snug" style={{ color: "var(--muted)" }}>
                  · {o}
                </li>
              ))}
              <li className="text-[0.68rem] font-mono pt-0.5" style={{ color: "var(--amber-ink)" }}>
                scope committed — authored in a future pass
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Roadmap() {
  const [filter, setFilter] = useState("");
  const [masteryFilter, setMasteryFilter] = useState<"all" | "completed" | "uncompleted" | "authored">("all");
  const [copied, setCopied] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const { completed, isComplete, setMultipleComplete, velocityPace, setMasteryPace } = useProgress();
  const { user, syncStatus, isCloudConnected } = useMasterySync();

  const implementedCount = IMPLEMENTED_LESSONS.length;
  const masteredCount = completed.length;
  const overallMasteryPct = Math.round((masteredCount / ALL_LESSONS.length) * 100);

  // Time calculations
  const totalMinutes = useMemo(() => ALL_LESSONS.reduce((acc, l) => acc + l.minutes, 0), []);
  const masteredMinutes = useMemo(() => {
    return ALL_LESSONS.filter((l) => isComplete(l.id)).reduce((acc, l) => acc + l.minutes, 0);
  }, [isComplete, completed]);

  const masteredHours = Math.floor(masteredMinutes / 60);
  const masteredRemainingMins = masteredMinutes % 60;
  const totalHours = Math.round(totalMinutes / 60);
  const remainingHours = ((totalMinutes - masteredMinutes) / 60).toFixed(1);

  // Stage-by-stage mastery metrics
  const stageStats = useMemo(() => {
    return STAGES.map((s) => {
      const stagePhases = PHASES.filter((p) => p.stage === s.id);
      const stageLessons = stagePhases.flatMap((p) => p.lessons);
      const stageCompleted = stageLessons.filter((l) => isComplete(l.id)).length;
      const stageTotal = stageLessons.length;
      const pct = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;
      return {
        id: s.id,
        title: s.title,
        completed: stageCompleted,
        total: stageTotal,
        pct,
      };
    });
  }, [isComplete, completed]);

  // Filtered phases
  const visiblePhases = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return PHASES.filter((p) => {
      // Check keyword search
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.focus.toLowerCase().includes(q) ||
        p.lessons.some(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            (l.outline ?? []).some((o) => o.toLowerCase().includes(q)),
        ) ||
        `p${String(p.n).padStart(2, "0")}`.includes(q);

      if (!matchesSearch) return false;

      // Check mastery status filter
      if (masteryFilter === "completed") {
        return p.lessons.some((l) => isComplete(l.id));
      } else if (masteryFilter === "uncompleted") {
        return p.lessons.some((l) => !isComplete(l.id));
      } else if (masteryFilter === "authored") {
        return p.lessons.some((l) => l.status === "implemented");
      }
      return true;
    });
  }, [filter, masteryFilter, isComplete, completed]);

  const exportBackup = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      user: user?.email ?? "guest",
      masteredCount: completed.length,
      masteredLessons: completed,
    };
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-site py-8">
      <CloudSyncModal open={showSyncModal} onClose={() => setShowSyncModal(false)} />
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Roadmap" }]} />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.2em]" style={{ color: "var(--brand-ink)" }}>
            <Trophy size={13} />
            <span>Interactive Learning Curriculum</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-1">
            Roadmap & Mastery Tracker
          </h1>
          <p className="text-sm mt-2 max-w-[66ch]" style={{ color: "var(--muted)" }}>
            Seven progressive stages from Foundation to Production Mastery. Mark lessons complete as you study
            — seamlessly synchronized with Supabase PostgreSQL or local storage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="btn btn-soft btn-sm flex items-center gap-1.5 font-mono text-[0.72rem]"
            title="Manage Cloud Sync (Supabase)"
          >
            {isCloudConnected ? (
              <>
                <Cloud size={13} style={{ color: "var(--brand)" }} /> Cloud Synced
              </>
            ) : (
              <>
                <CloudOff size={13} style={{ color: "var(--amber-ink)" }} /> Connect Cloud
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportBackup}
            className="btn btn-ghost btn-sm flex items-center gap-1.5 font-mono text-[0.72rem]"
            title="Copy progress backup to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} style={{ color: "var(--brand)" }} /> Copied JSON!
              </>
            ) : (
              <>
                <Copy size={13} /> Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---------------- MASTERY TRACKER DASHBOARD ---------------- */}
      <Reveal>
        <section
          aria-label="Mastery Tracker"
          className="panel p-6 mt-6 border relative overflow-hidden"
          style={{
            borderColor: "var(--line)",
            background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b pb-4" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[0.76rem] font-bold"
                style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
              >
                <Award size={18} />
              </span>
              <div>
                <h2 className="font-display font-bold text-lg leading-tight">Mastery Progress Tracker</h2>
                <div className="flex items-center gap-2 text-[0.74rem]" style={{ color: "var(--muted)" }}>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isCloudConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>
                    {isCloudConnected
                      ? `Synchronized with Supabase (${user?.email})`
                      : "Persisted in LocalStorage (Guest Mode)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-[0.74rem]">
              <div className="px-3 py-1.5 rounded-[var(--r-sm)] border" style={{ background: "var(--surface-3)", borderColor: "var(--line-2)" }}>
                <span style={{ color: "var(--muted)" }}>Mastered: </span>
                <motion.span
                  key={masteredCount}
                  initial={{ scale: 1.2, color: "var(--brand)" }}
                  animate={{ scale: 1, color: "var(--brand-ink)" }}
                  className="font-bold inline-block"
                >
                  {masteredCount} / {ALL_LESSONS.length}
                </motion.span>
                <span style={{ color: "var(--muted)" }}> ({overallMasteryPct}%)</span>
              </div>
              <div className="px-3 py-1.5 rounded-[var(--r-sm)] border" style={{ background: "var(--surface-3)", borderColor: "var(--line-2)" }}>
                <span style={{ color: "var(--muted)" }}>Time Remaining: </span>
                <span className="font-bold" style={{ color: "var(--brand-ink)" }}>
                  {remainingHours}h
                </span>
                <span style={{ color: "var(--muted)" }}> left of ~{totalHours}h</span>
              </div>

              {masteredCount === ALL_LESSONS.length && (
                <button
                  type="button"
                  onClick={fireGrandConfetti}
                  className="px-3 py-1.5 rounded-[var(--r-sm)] border font-mono text-[0.74rem] font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
                  style={{
                    background: "var(--brand-soft)",
                    borderColor: "var(--brand)",
                    color: "var(--brand-ink)",
                  }}
                  title="Celebrate 100% Mastery with Confetti!"
                >
                  <PartyPopper size={13} />
                  <span>Celebrate 100% 🎉</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Progress Meter with Framer Motion visual shift */}
          <div className="mb-6">
            <div className="flex justify-between font-mono text-[0.66rem] uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
              <span>Total Curriculum Mastery</span>
              <motion.span
                key={overallMasteryPct}
                initial={{ opacity: 0.5, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold"
                style={{ color: "var(--brand-ink)" }}
              >
                {overallMasteryPct}% Completed
              </motion.span>
            </div>

            <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden p-[1px]">
              <motion.div
                initial={false}
                animate={{ width: `${Math.max(2, overallMasteryPct)}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, var(--brand) 0%, var(--sky) 100%)",
                }}
              />
            </div>
          </div>

          {/* Stage-by-Stage Mastery Breakdown */}
          <div className="font-mono text-[0.64rem] uppercase tracking-wider mb-2.5" style={{ color: "var(--muted)" }}>
            Stage Completion Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {stageStats.map((st, idx) => (
              <motion.div
                key={st.id}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="p-2.5 rounded-[var(--r-sm)] border flex flex-col justify-between"
                style={{
                  background: st.pct === 100 ? "var(--brand-soft)" : "var(--surface-2)",
                  borderColor: st.pct === 100 ? "var(--brand)" : "var(--line-2)",
                }}
              >
                <div className="font-mono text-[0.6rem] uppercase tracking-wider truncate mb-1" style={{ color: "var(--muted)" }}>
                  S{idx + 1} · {st.title.split(" ")[0]}
                </div>
                <div className="flex items-baseline justify-between mt-auto">
                  <span className="font-display font-bold text-sm" style={{ color: st.pct === 100 ? "var(--brand-ink)" : "var(--ink)" }}>
                    {st.pct}%
                  </span>
                  <span className="font-mono text-[0.62rem]" style={{ color: "var(--muted)" }}>
                    {st.completed}/{st.total}
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-3)] h-1 rounded-full overflow-hidden mt-1.5">
                  <motion.div
                    initial={false}
                    animate={{ width: `${st.pct}%` }}
                    transition={{ type: "spring", stiffness: 220, damping: 25 }}
                    className="h-full rounded-full"
                    style={{
                      background: st.pct === 100 ? "var(--brand)" : "var(--brand-ink)",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ---------------- FILTER & SEARCH BAR ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 mb-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-md w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} aria-hidden="true" />
          <input
            className="input pl-9"
            placeholder="Filter phases & lessons — try 'docker', 'prisma', 'p21'…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter phases and lessons"
          />
        </div>

        {/* Mastery Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-[0.8rem]">
          <span className="flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-wider mr-1" style={{ color: "var(--muted)" }}>
            <Filter size={12} />
            Show:
          </span>
          <button
            type="button"
            onClick={() => setMasteryFilter("all")}
            className="px-2.5 py-1 rounded-[var(--r-sm)] border font-medium transition-colors"
            style={{
              background: masteryFilter === "all" ? "var(--brand-soft)" : "var(--surface)",
              color: masteryFilter === "all" ? "var(--brand-ink)" : "var(--ink-2)",
              borderColor: masteryFilter === "all" ? "var(--brand)" : "var(--line)",
            }}
          >
            All ({ALL_LESSONS.length})
          </button>
          <button
            type="button"
            onClick={() => setMasteryFilter("completed")}
            className="px-2.5 py-1 rounded-[var(--r-sm)] border font-medium transition-colors"
            style={{
              background: masteryFilter === "completed" ? "var(--brand-soft)" : "var(--surface)",
              color: masteryFilter === "completed" ? "var(--brand-ink)" : "var(--ink-2)",
              borderColor: masteryFilter === "completed" ? "var(--brand)" : "var(--line)",
            }}
          >
            Mastered ({masteredCount})
          </button>
          <button
            type="button"
            onClick={() => setMasteryFilter("uncompleted")}
            className="px-2.5 py-1 rounded-[var(--r-sm)] border font-medium transition-colors"
            style={{
              background: masteryFilter === "uncompleted" ? "var(--brand-soft)" : "var(--surface)",
              color: masteryFilter === "uncompleted" ? "var(--brand-ink)" : "var(--ink-2)",
              borderColor: masteryFilter === "uncompleted" ? "var(--brand)" : "var(--line)",
            }}
          >
            To Master ({ALL_LESSONS.length - masteredCount})
          </button>
          <button
            type="button"
            onClick={() => setMasteryFilter("authored")}
            className="px-2.5 py-1 rounded-[var(--r-sm)] border font-medium transition-colors"
            style={{
              background: masteryFilter === "authored" ? "var(--brand-soft)" : "var(--surface)",
              color: masteryFilter === "authored" ? "var(--brand-ink)" : "var(--ink-2)",
              borderColor: masteryFilter === "authored" ? "var(--brand)" : "var(--line)",
            }}
          >
            Live Authored ({implementedCount})
          </button>
        </div>
      </div>

      {/* ---------------- ROADMAP STAGES & PHASES ---------------- */}
      {STAGES.map((stage) => {
        const phases = visiblePhases.filter((p) => p.stage === stage.id);
        if (phases.length === 0) return null;

        const stageLessons = phases.flatMap((p) => p.lessons);
        const stageDone = stageLessons.filter((l) => isComplete(l.id)).length;

                const stagePct = stageLessons.length > 0 ? Math.round((stageDone / stageLessons.length) * 100) : 0;

                return (
                  <section key={stage.id} className="mt-12">
                    <Reveal>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                        <div className="flex items-baseline gap-3">
                          <h2 className="font-display font-bold text-2xl">{stage.title}</h2>
                          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                            P{String(phases[0].n).padStart(2, "0")}–P{String(phases[phases.length - 1].n).padStart(2, "0")}
                          </span>
                        </div>
                        <div
                          className="font-mono text-[0.74rem] font-bold px-2 py-0.5 rounded-full border"
                          style={{
                            background: stageDone === stageLessons.length ? "var(--brand-soft)" : "var(--surface-2)",
                            color: stageDone === stageLessons.length ? "var(--brand-ink)" : "var(--muted)",
                            borderColor: stageDone === stageLessons.length ? "var(--brand)" : "var(--line-2)",
                          }}
                        >
                          {stageDone}/{stageLessons.length} Mastered ({stagePct}%)
                        </div>
                      </div>
                      <p className="text-sm max-w-[80ch] mb-2" style={{ color: "var(--ink-2)" }}>{stage.blurb}</p>
                      <p className="text-[0.8rem] font-mono mb-5" style={{ color: "var(--brand-ink)" }}>
                        Exit criteria — {stage.exitCriteria}
                      </p>
                    </Reveal>

                    {stage.id === "backend-dev" && (
                      <Reveal delay={40}>
                        <NestJSArchitectureSection />
                      </Reveal>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      {phases.map((phase, i) => {
                        const phaseLessonIds = phase.lessons.map((l) => l.id);
                        const phaseDoneCount = phase.lessons.filter((l) => isComplete(l.id)).length;
                        const phaseAllDone = phaseDoneCount === phase.lessons.length && phase.lessons.length > 0;
                        const phasePct = phase.lessons.length > 0 ? Math.round((phaseDoneCount / phase.lessons.length) * 100) : 0;

                        return (
                          <Reveal key={phase.id} delay={Math.min(i * 60, 240)}>
                            <motion.article
                              layout
                              transition={{ type: "spring", stiffness: 350, damping: 32 }}
                              className={`panel panel-hover p-5 h-full flex flex-col transition-all ${
                                phaseAllDone ? "border-[var(--brand)] shadow-sm" : ""
                              }`}
                            >
                              {/* Phase Card Header */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className="font-mono text-[0.7rem] font-semibold px-2 py-0.5 rounded-[var(--r-sm)]"
                                  style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
                                >
                                  P{String(phase.n).padStart(2, "0")}
                                </span>
                                <StatusBadge status={phase.status} />

                                {/* Phase Mastery Indicator with animated width & status */}
                                <motion.span
                                  layout
                                  className="ml-auto font-mono text-[0.68rem] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                                  style={{
                                    background: phaseAllDone ? "var(--brand-soft)" : "var(--surface-2)",
                                    color: phaseAllDone ? "var(--brand-ink)" : phaseDoneCount > 0 ? "var(--ink)" : "var(--muted)",
                                    borderColor: phaseAllDone ? "var(--brand)" : "var(--line-2)",
                                  }}
                                >
                                  {phaseAllDone && <Sparkles size={11} />}
                                  <motion.span
                                    key={phaseDoneCount}
                                    initial={{ scale: 1.15 }}
                                    animate={{ scale: 1 }}
                                  >
                                    {phaseDoneCount}/{phase.lessons.length} ({phasePct}%)
                                  </motion.span>
                                </motion.span>

                                {/* Batch Toggle Phase Button */}
                                <button
                                  type="button"
                                  onClick={() => setMultipleComplete(phaseLessonIds, !phaseAllDone)}
                                  className="p-1 px-2 rounded-[var(--r-sm)] border font-mono text-[0.62rem] transition-colors hover:border-[var(--brand)] cursor-pointer"
                                  style={{
                                    background: "var(--surface-3)",
                                    color: phaseAllDone ? "var(--rose-ink)" : "var(--brand-ink)",
                                    borderColor: "var(--line-2)",
                                  }}
                                  title={phaseAllDone ? "Reset phase mastery" : "Mark all lessons in phase as mastered"}
                                >
                                  {phaseAllDone ? "Reset" : "Complete all"}
                                </button>
                              </div>

                              {/* Mini Phase Progress Bar */}
                              <div className="w-full bg-[var(--surface-3)] h-1.5 rounded-full overflow-hidden mb-2.5">
                                <motion.div
                                  initial={false}
                                  animate={{ width: `${phasePct}%` }}
                                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: phaseAllDone
                                      ? "var(--brand)"
                                      : phasePct > 0
                                        ? "linear-gradient(90deg, var(--brand) 0%, var(--sky) 100%)"
                                        : "transparent",
                                  }}
                                />
                              </div>

                              <h3 className="font-display font-semibold text-lg leading-tight">{phase.title}</h3>
                              <p className="text-[0.84rem] mt-1 leading-relaxed mb-3" style={{ color: "var(--muted)" }}>
                                {phase.focus}
                              </p>

                      {/* Interactive Lesson List with Framer Motion layout animations */}
                      <motion.div
                        layout
                        className="mt-auto border-t pt-2 -mx-2 flex flex-col gap-0.5"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {phase.lessons.map((l) => (
                          <LessonRow
                            key={l.id}
                            id={l.id}
                            title={l.title}
                            status={l.status}
                            minutes={l.minutes}
                            outline={l.outline}
                          />
                        ))}
                      </motion.div>
                    </motion.article>
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}

      {filter && visiblePhases.length === 0 && (
        <div className="panel p-8 text-center mt-10" style={{ color: "var(--muted)" }}>
          No phases match "{filter}". Try a technology name, concept keyword, or phase number.
        </div>
      )}

      {/* Boss Battles Section */}
      <section className="mt-16">
        <SectionHeading kicker="Cumulative assessment" title="Boss Battles" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BOSS_BATTLES.map((bb, i) => (
            <Reveal key={bb.id} delay={Math.min(i * 60, 240)}>
              <BossCard bb={bb} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
