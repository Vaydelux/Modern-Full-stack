import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  Download,
  Keyboard,
  Menu,
  Moon,
  RotateCw,
  Search,
  Sparkles,
  Sun,
  Trophy,
  WifiOff,
  X,
} from "lucide-react";
import { ALL_LESSONS, IMPLEMENTED_LESSONS, PHASES, STAGES, lessonById } from "../data/curriculum";
import { useProgress, useTheme } from "../lib/store";
import { Link, splitRoute } from "../lib/router";
import { usePwa } from "../lib/pwa";
import { fireGrandConfetti } from "./CelebrationOverlay";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--surface-2)" stroke="var(--line-2)" />
      <rect x="7" y="8" width="18" height="3.4" rx="1.7" fill="var(--brand)" />
      <rect x="7" y="14.3" width="13" height="3.4" rx="1.7" fill="var(--amber)" />
      <rect x="7" y="20.6" width="18" height="3.4" rx="1.7" fill="var(--sky)" />
      <circle cx="25" cy="22.3" r="2.6" fill="var(--brand)" />
    </svg>
  );
}

export function UpdateToast() {
  const { hasUpdate, applyUpdate } = usePwa();
  if (!hasUpdate) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 fadeup panel p-3.5 flex items-center gap-3 shadow-2xl border"
      style={{
        borderColor: "color-mix(in srgb, var(--brand) 40%, var(--line))",
        background: "var(--surface-2)",
      }}
      role="alert"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="pulsedot absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: "var(--brand)" }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ background: "var(--brand)" }}
        />
      </span>
      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
        a new edition is deployed →
      </span>
      <button
        type="button"
        onClick={applyUpdate}
        className="btn btn-primary btn-sm flex items-center gap-1.5"
      >
        <RotateCw size={13} />
        <span>reload</span>
      </button>
    </div>
  );
}

export function TopBar({
  route,
  onMenu,
  onSearch,
  onOpenShortcuts,
}: {
  route: string;
  onMenu: () => void;
  onSearch: () => void;
  onOpenShortcuts?: () => void;
}) {
  const isMac = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);
  const { theme, toggleTheme } = useTheme();
  const { completed } = useProgress();
  const { isOnline, canInstall, promptInstall } = usePwa();
  const { name } = splitRoute(route);

  const nav = [
    { to: "dashboard", label: "Dashboard" },
    { to: "roadmap", label: "Roadmap" },
    { to: "glossary", label: "Glossary" },
    { to: "troubleshooting", label: "Fix It" },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md w-full max-w-full"
      style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)" }}
    >
      <div className="max-w-site flex items-center gap-3 h-[62px] w-full">
        <button
          type="button"
          className="btn btn-soft btn-sm lg:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>

        <Link to="" className="flex items-center gap-2.5 no-underline group" aria-label="Zero to Mastery — home">
          <Logo />
          <span className="leading-tight">
            <span className="font-display block text-[1.02rem] font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
              Zero<span style={{ color: "var(--brand)" }}>→</span>Mastery
            </span>
            <span className="hidden sm:block font-mono text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
              Modern Full-Stack
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6" aria-label="Primary">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`nav-link ${name === n.to ? "active" : ""}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isOnline && (
            <span
              className="chip fadeup"
              style={{
                color: "var(--amber-ink)",
                borderColor: "color-mix(in srgb, var(--amber) 45%, transparent)",
                background: "var(--amber-soft)",
              }}
              title="You are currently offline. Lessons are served from your cached copy."
            >
              <WifiOff size={12} style={{ color: "var(--amber)" }} />
              <span className="hidden md:inline">offline — reading from your cached copy</span>
              <span className="md:hidden">offline</span>
            </span>
          )}

          {canInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="chip fadeup cursor-pointer hover:border-[var(--brand)] transition-colors"
              style={{
                color: "var(--brand-ink)",
                borderColor: "color-mix(in srgb, var(--brand) 45%, transparent)",
                background: "var(--brand-soft)",
              }}
              title="Install Zero→Mastery as a standalone Progressive Web App"
            >
              <Download size={12} style={{ color: "var(--brand)" }} />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={onSearch}
            aria-label="Search the course"
            title={`Search (${isMac ? "⌘K" : "Ctrl K"})`}
          >
            <Search size={14} />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>

          {onOpenShortcuts && (
            <button
              type="button"
              className="btn btn-soft btn-sm px-2.5"
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={14} />
              <kbd className="hidden xl:inline text-[0.7rem] font-mono">?</kbd>
            </button>
          )}

          <span
            className="chip hidden sm:inline-flex"
            title="Modules you have mastered in the curriculum"
          >
            <CheckCircle2 size={12} style={{ color: "var(--brand)" }} />
            {completed.length}/{ALL_LESSONS.length} mastered
          </span>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title="Toggle theme (T)"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- sidebar ---------------- */

const REF_LINKS = [
  { to: "glossary", label: "Glossary" },
  { to: "troubleshooting", label: "Troubleshooting" },
  { to: "versions", label: "Version Matrix" },
  { to: "mastery", label: "Mastery Levels" },
  { to: "readiness", label: "Production Readiness" },
  { to: "tokens", label: "Design Tokens" },
  { to: "manifest", label: "Course Manifest" },
  { to: "status", label: "Course Status" },
];

function LessonIcon({ status, isDone }: { status: string; isDone?: boolean }) {
  if (isDone) {
    return (
      <span
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--brand)",
          color: "#09090b",
        }}
        title="Finished · Marked as Read"
      >
        <Check size={9} strokeWidth={3.5} />
      </span>
    );
  }
  if (status === "implemented") return <Circle size={14} style={{ color: "var(--brand)", opacity: 0.6, flexShrink: 0 }} />;
  if (status === "draft") return <CircleDashed size={14} style={{ color: "var(--amber)", flexShrink: 0 }} />;
  return <Circle size={14} style={{ color: "var(--muted)", opacity: 0.45, flexShrink: 0 }} />;
}

export function SidebarBody({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  const { name, param } = splitRoute(route);
  const currentPhase = name === "lesson" ? lessonById(param)?.phase.id : undefined;

  const [open, setOpen] = useState<Set<string>>(() => new Set([currentPhase ?? "p00"]));
  const { completed, isComplete } = useProgress();

  const totalLessons = ALL_LESSONS.length;
  const completedCount = completed.length;
  const globalCompletionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isAllCourseMastered = completedCount === totalLessons && totalLessons > 0;

  useEffect(() => {
    if (currentPhase) {
      setOpen((prev) => {
        if (prev.has(currentPhase)) return prev;
        const next = new Set(prev);
        next.add(currentPhase);
        return next;
      });
    }
  }, [currentPhase]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <Link to="" className={`side-link ${route === "" ? "active" : ""}`} onClick={onNavigate}>
          <span className="font-mono text-[0.68rem] shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>⌂</span>
          <span className="leading-snug">Home</span>
        </Link>
        <Link to="dashboard" className={`side-link ${name === "dashboard" ? "active" : ""}`} onClick={onNavigate}>
          <span className="font-mono text-[0.68rem] shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>▦</span>
          <span className="leading-snug">Dashboard</span>
        </Link>
        <Link to="roadmap" className={`side-link ${name === "roadmap" ? "active" : ""}`} onClick={onNavigate}>
          <span className="font-mono text-[0.68rem] shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>⋯</span>
          <span className="leading-snug">Roadmap</span>
        </Link>
      </div>

      {/* Global Course Completion Meter */}
      <div
        className="panel p-3 rounded-[var(--r-md)] border w-full box-border"
        style={{
          background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-1) 100%)",
          borderColor: isAllCourseMastered ? "var(--brand)" : "var(--line-2)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="font-mono text-[0.64rem] uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 font-semibold">
            <Trophy size={12} style={{ color: "var(--brand)" }} /> Course Completion
          </span>
          <button
            type="button"
            onClick={isAllCourseMastered ? fireGrandConfetti : undefined}
            className={`font-mono text-[0.72rem] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 transition-transform ${
              isAllCourseMastered ? "cursor-pointer hover:scale-105" : ""
            }`}
            style={{
              background: globalCompletionPct > 0 ? "var(--brand-soft)" : "var(--surface-3)",
              color: globalCompletionPct > 0 ? "var(--brand-ink)" : "var(--muted)",
            }}
            title={isAllCourseMastered ? "Click to celebrate completion with confetti! 🎉" : `${globalCompletionPct}% completed`}
          >
            {isAllCourseMastered && <Sparkles size={10} />}
            {globalCompletionPct}%
          </button>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden p-[0.5px]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(globalCompletionPct > 0 ? 3 : 0, globalCompletionPct)}%`,
              background: "linear-gradient(90deg, var(--brand) 0%, var(--sky) 100%)",
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[0.66rem] font-mono text-[var(--muted)] mt-2">
          <span>{completedCount}/{totalLessons} Mastered</span>
          <Link
            to="roadmap"
            className="text-[var(--brand-ink)] font-semibold hover:underline"
            onClick={onNavigate}
          >
            Roadmap →
          </Link>
        </div>
      </div>

      <div>
        <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] px-2 mb-2" style={{ color: "var(--muted)" }}>
          Phases · P00–P44
        </div>
        {STAGES.map((stage) => (
          <div key={stage.id} className="mb-2">
            <div
              className="font-mono text-[0.6rem] uppercase tracking-[0.16em] px-2 py-1"
              style={{ color: "var(--brand-ink)", opacity: 0.85 }}
            >
              {stage.title}
            </div>
            {PHASES.filter((p) => p.stage === stage.id).map((phase) => {
              const isOpen = open.has(phase.id);
              const phaseDoneCount = phase.lessons.filter((l) => isComplete(l.id)).length;
              const phaseTotal = phase.lessons.length;
              const phasePct = phaseTotal > 0 ? Math.round((phaseDoneCount / phaseTotal) * 100) : 0;
              const phaseAllDone = phaseTotal > 0 && phaseDoneCount === phaseTotal;

              return (
                <div key={phase.id} className="mb-0.5">
                  <button
                    type="button"
                    className="w-full flex items-start gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer group"
                    style={{ background: isOpen ? "var(--surface-2)" : "transparent" }}
                    onClick={() => toggle(phase.id)}
                    aria-expanded={isOpen}
                    title={phase.title}
                  >
                    <span className="font-mono text-[0.66rem] w-7 shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>
                      P{String(phase.n).padStart(2, "0")}
                    </span>
                    <span className="text-[0.82rem] flex-1 font-medium leading-snug line-clamp-2" style={{ color: isOpen ? "var(--ink)" : "var(--ink-2)" }}>
                      {phase.title}
                    </span>

                    {/* Progress percentage label next to each phase */}
                    <span
                      className="font-mono text-[0.62rem] px-1.5 py-0.2 rounded-full border shrink-0 transition-colors mt-0.5"
                      style={{
                        background: phaseAllDone
                          ? "var(--brand-soft)"
                          : phaseDoneCount > 0
                            ? "var(--surface-3)"
                            : "transparent",
                        color: phaseAllDone
                          ? "var(--brand-ink)"
                          : phaseDoneCount > 0
                            ? "var(--ink-2)"
                            : "var(--muted)",
                        borderColor: phaseAllDone
                          ? "var(--brand)"
                          : phaseDoneCount > 0
                            ? "var(--line-2)"
                            : "transparent",
                        opacity: phaseDoneCount > 0 ? 1 : 0.6,
                        fontWeight: phaseAllDone ? 700 : 500,
                      }}
                      title={`${phaseDoneCount}/${phaseTotal} lessons mastered (${phasePct}%)`}
                    >
                      {phasePct}%
                    </span>

                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      aria-hidden="true"
                      style={{
                        background:
                          phase.status === "implemented"
                            ? "var(--brand)"
                            : phase.status === "partial"
                              ? "var(--amber)"
                              : "var(--line-2)",
                      }}
                    />
                    <ChevronDown
                      size={13}
                      className="shrink-0 mt-1"
                      style={{
                        color: "var(--muted)",
                        transition: "transform var(--t-fast)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-3 pl-2.5 border-l fade-in flex flex-col gap-0.5 mt-0.5" style={{ borderColor: "var(--line)" }}>
                      {phase.lessons.map((l) => {
                        const isLessonDone = isComplete(l.id);
                        const isCurrentActive = name === "lesson" && param === l.id;

                        return (
                          <Link
                            key={l.id}
                            to={`lesson/${l.id}`}
                            className={`side-link ${isCurrentActive ? "active" : ""}`}
                            onClick={onNavigate}
                            title={`${l.title}${isLessonDone ? " (Finished · Read)" : ""}`}
                            style={{
                              opacity: isLessonDone && !isCurrentActive ? 0.9 : 1,
                            }}
                          >
                            <span className="shrink-0 mt-0.5">
                              <LessonIcon status={l.status} isDone={isLessonDone} />
                            </span>
                            <span
                              className={`leading-snug line-clamp-2 text-left flex-1 min-w-0 ${
                                isLessonDone && !isCurrentActive
                                  ? "text-[var(--ink-2)]"
                                  : ""
                              }`}
                            >
                              {l.title}
                            </span>
                            {isLessonDone && (
                              <span
                                className="font-mono text-[0.56rem] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0 transition-colors"
                                style={{
                                  background: "var(--brand-soft)",
                                  color: "var(--brand-ink)",
                                  borderColor: "color-mix(in srgb, var(--brand) 30%, transparent)",
                                  borderWidth: "1px",
                                }}
                                title="Finished & Marked as Read"
                              >
                                Read
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] px-2 mb-2" style={{ color: "var(--muted)" }}>
          Reference
        </div>
        {REF_LINKS.map((r) => (
          <Link key={r.to} to={r.to} className={`side-link ${name === r.to ? "active" : ""}`} onClick={onNavigate}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--line-2)" }} aria-hidden="true" />
            <span className="leading-snug">{r.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MobileDrawer({ route, open, onClose }: { route: string; open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 cursor-default"
        style={{ background: "color-mix(in srgb, #000 55%, transparent)" }}
        onClick={onClose}
      />
      <div
        className="absolute left-0 top-0 h-full w-[310px] max-w-[88vw] overflow-y-auto border-r transition-transform duration-300 flex flex-col shadow-2xl"
        style={{
          background: "var(--bg-2)",
          borderColor: "var(--line)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
        role="dialog"
        aria-label="Course navigation"
      >
        <div className="flex items-center justify-between px-4 h-[62px] border-b sticky top-0 bg-[var(--bg-2)] z-10 shrink-0" style={{ borderColor: "var(--line)" }}>
          <span className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-display font-semibold">Zero→Mastery</span>
          </span>
          <button type="button" className="btn btn-soft btn-sm cursor-pointer" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        <div className="px-3 pb-24 overflow-y-auto flex-1 custom-scrollbar">
          <SidebarBody route={route} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ route }: { route: string }) {
  return (
    <aside
      className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 border-r sticky top-[62px] h-[calc(100vh-62px)] overflow-y-auto custom-scrollbar"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-2) 65%, transparent)" }}
      aria-label="Course sidebar"
    >
      <div className="max-w-none px-3 pb-24">
        <SidebarBody route={route} />
      </div>
    </aside>
  );
}

/* ---------------- breadcrumbs & prev/next ---------------- */

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-mono text-[0.72rem]" style={{ color: "var(--muted)" }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} aria-hidden="true" />}
          {item.to ? (
            <Link to={item.to} className="hover:underline" style={{ color: "var(--ink-2)" }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--ink)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PrevNext({
  prev,
  next,
}: {
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
}) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2 mt-10" aria-label="Lesson pagination">
      {prev ? (
        <Link to={`lesson/${prev.id}`} className="panel panel-hover p-4 no-underline group">
          <span className="flex items-center gap-1 font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" /> Previous
          </span>
          <span className="font-display font-semibold mt-1.5 block leading-snug" style={{ color: "var(--ink)" }}>
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link to={`lesson/${next.id}`} className="panel panel-hover p-4 no-underline group sm:text-right">
          <span className="flex items-center gap-1 justify-end font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
            Next <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="font-display font-semibold mt-1.5 block leading-snug" style={{ color: "var(--ink)" }}>
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

/* ---------------- footer ---------------- */

export function Footer() {
  const year = useMemo(() => (typeof Date !== "undefined" ? new Date().getFullYear() : 2026), []);
  return (
    <footer className="border-t mt-20 w-full max-w-full" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-site grid gap-10 md:grid-cols-3 py-12 w-full">
        <div>
          <span className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display font-semibold text-lg">
              Zero<span style={{ color: "var(--brand)" }}>→</span>Mastery
            </span>
          </span>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--muted)", maxWidth: "34ch" }}>
            A living, project-first full-stack curriculum: React · Next.js · NestJS · Fastify ·
            Prisma 7.9.15 · Supabase PostgreSQL. Authored in bounded passes, tracked in the manifest.
          </p>
          <span className="chip mt-4">Pass 001 · scaffold complete</span>
        </div>
        <div>
          <div className="font-mono text-[0.66rem] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--muted)" }}>
            Explore
          </div>
          <div className="flex flex-col gap-1.5 text-sm">
            <Link to="dashboard" className="nav-link w-fit">Dashboard</Link>
            <Link to="roadmap" className="nav-link w-fit">Roadmap & Mastery Ladder</Link>
            <Link to="glossary" className="nav-link w-fit">Glossary</Link>
            <Link to="troubleshooting" className="nav-link w-fit">Troubleshooting</Link>
            <Link to="versions" className="nav-link w-fit">Version Matrix</Link>
          </div>
        </div>
        <div>
          <div className="font-mono text-[0.66rem] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--muted)" }}>
            Governance
          </div>
          <div className="flex flex-col gap-1.5 text-sm">
            <Link to="manifest" className="nav-link w-fit">Course Manifest</Link>
            <Link to="status" className="nav-link w-fit">Course Status & Gap Log</Link>
            <Link to="mastery" className="nav-link w-fit">Mastery Levels</Link>
            <Link to="readiness" className="nav-link w-fit">Production Readiness Scorecard</Link>
            <Link to="tokens" className="nav-link w-fit">Design Tokens</Link>
          </div>
        </div>
      </div>
      <div className="border-t w-full" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-site flex flex-wrap items-center justify-between gap-2 py-4 font-mono text-[0.7rem] w-full" style={{ color: "var(--muted)" }}>
          <span>© {year} Zero→Mastery · Browser → Next.js → NestJS → Prisma → Postgres</span>
          <span>
            prisma <span style={{ color: "var(--sky-ink)" }}>7.9.15</span> pinned · localhost success is never mastery
          </span>
        </div>
      </div>
    </footer>
  );
}
