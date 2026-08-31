import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  FastForward,
  Filter,
  Flame,
  GitBranch,
  History,
  Layers,
  LayoutGrid,
  RotateCcw,
  Search,
  Server,
  Sparkles,
  TerminalSquare,
  Wrench,
  Zap,
} from "lucide-react";
import { ALL_LESSONS, PHASES, STAGES, stageById } from "../data/curriculum";
import { LESSON_CONTENT } from "../data/lessons";
import { GLOSSARY, TROUBLESHOOTING } from "../data/reference";
import { useProgress } from "../lib/store";

interface SearchItem {
  kind: "lesson" | "phase" | "term" | "fix" | "page";
  title: string;
  snippet: string;
  to: string;
  score: number;
  phaseNumber?: number;
  stageTitle?: string;
  contextBadge?: string;
  contextType?: "next" | "skipped" | "active" | "upcoming" | "completed";
  category?: "core" | "nestjs" | "prisma" | "architecture" | "production";
}

interface PredictiveSuggestion {
  text: string;
  kind: "lesson" | "phase" | "term" | "fix" | "topic";
  targetRoute?: string;
  detail?: string;
  isProactive?: boolean;
  proactiveType?: "next" | "skipped" | "phase" | "topic";
}

interface ProgressContext {
  completedSet: Set<string>;
  nextLessonId?: string;
  skippedLessonIds: Set<string>;
  activePhaseId?: number;
  activeStageId?: string;
  upcomingLessonIds: string[];
}

type FilterCategory = "all" | "next_skipped" | "nestjs_fastify" | "prisma_db" | "architecture" | "production";

const PAGES = [
  { title: "Course Dashboard", to: "dashboard", desc: "Your progress, velocity metrics, next lesson, and status" },
  { title: "Roadmap & Mastery Tracker", to: "roadmap", desc: "All 45 phases across the 7 mastery stages with sync" },
  { title: "Mastery Levels & Boss Battles", to: "mastery", desc: "Stage exit criteria and cumulative gates" },
  { title: "Design Tokens", to: "tokens", desc: "The platform's visual language: palette, type, motion" },
  { title: "Production Readiness Scorecard", to: "readiness", desc: "The checklist capstones must pass" },
  { title: "Version Matrix", to: "versions", desc: "Pinned and verified versions — Prisma at 7.9.15" },
  { title: "Course Manifest", to: "manifest", desc: "Curriculum inventory: IDs, statuses, files" },
  { title: "Course Status & Generation Queue", to: "status", desc: "Pass history, gaps, and what ships next" },
  { title: "Glossary", to: "glossary", desc: "Every term defined before it is used" },
  { title: "Troubleshooting — Fix It", to: "troubleshooting", desc: "Symptom-first diagnosis across the stack" },
];

const POPULAR_TOPICS = [
  "NestJS Lifecycle & Graceful Shutdown",
  "NestJS Dynamic Modules & DI",
  "Turborepo & pnpm Monorepo",
  "Fastify Radix Router",
  "NestJS Guards & DTOs",
  "Prisma 7.9.15 Transactions",
  "PostgreSQL Indexes & EXPLAIN",
  "Redis Cache-Aside",
  "BullMQ Background Workers",
  "React 19 Hooks",
  "Next.js App Router",
  "IDOR Security Labs",
  "Connection Pooling & PgBouncer",
];

const KIND_META: Record<SearchItem["kind"] | "topic", { label: string; icon: React.ReactNode }> = {
  lesson: { label: "Lesson", icon: <BookOpen size={12} /> },
  phase: { label: "Phase", icon: <GitBranch size={12} /> },
  term: { label: "Glossary", icon: <TerminalSquare size={12} /> },
  fix: { label: "Fix It", icon: <Wrench size={12} /> },
  page: { label: "Page", icon: <LayoutGrid size={12} /> },
  topic: { label: "Topic", icon: <Zap size={12} /> },
};

/** Pre-indexed vocabulary dictionary from all curriculum metadata */
const PREDICTIVE_INDEX: PredictiveSuggestion[] = (() => {
  const list: PredictiveSuggestion[] = [];
  const seen = new Set<string>();

  const add = (text: string, kind: PredictiveSuggestion["kind"], targetRoute?: string, detail?: string) => {
    const clean = text.trim();
    const key = clean.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    list.push({ text: clean, kind, targetRoute, detail });
  };

  // Add popular topics first
  POPULAR_TOPICS.forEach((t) => add(t, "topic", `search:${t}`));

  // Add all lesson titles
  for (const l of ALL_LESSONS) {
    add(l.title, "lesson", `lesson/${l.id}`, `Phase module · ~${l.minutes}m`);
    if (l.outline) {
      for (const o of l.outline) {
        if (o.length <= 45) add(o, "topic", `lesson/${l.id}`);
      }
    }
  }

  // Add phase titles
  for (const p of PHASES) {
    add(`Phase ${p.n}: ${p.title}`, "phase", "roadmap", p.focus);
    add(p.title, "phase", "roadmap", p.focus);
  }

  // Add glossary terms
  for (const g of GLOSSARY) {
    add(g.term, "term", "glossary", g.def.slice(0, 60) + "…");
  }

  // Add troubleshooting symptoms
  for (const t of TROUBLESHOOTING) {
    add(t.symptom, "fix", "troubleshooting", `Layer: ${t.layer}`);
  }

  // Core technical concepts
  const TECH_CONCEPTS = [
    "NestFastifyApplication",
    "Radix Tree Routing",
    "ValidationPipe & Whitelist",
    "Prisma 7.9.15 Driver Adapters",
    "Interactive Transactions $transaction",
    "B-Tree Indexes & EXPLAIN ANALYZE",
    "Redis Cache-Aside & Stampede",
    "BullMQ Producer & Worker Jobs",
    "IDOR Authorization Security",
    "Connection Pooling & PgBouncer",
    "TypeScript Strict Mode",
    "Zod Validation Pipelines",
    "TanStack Query Invalidation",
    "JWT Verification vs Decoding",
    "HTTP Cookies & SameSite",
    "CORS Preflight Headers",
    "Playwright E2E Testing",
    "Prometheus & Sentry Telemetry",
    "Docker Multi-Stage Builds",
    "Cursor-Based Keyset Pagination",
  ];
  TECH_CONCEPTS.forEach((tc) => add(tc, "topic"));

  return list;
})();

function snippetFrom(haystack: string, query: string, span = 70): string {
  const idx = haystack.toLowerCase().indexOf(query);
  if (idx < 0) return haystack.slice(0, span * 2);
  const start = Math.max(0, idx - span);
  const end = Math.min(haystack.length, idx + query.length + span);
  return `${start > 0 ? "…" : ""}${haystack.slice(start, end)}${end < haystack.length ? "…" : ""}`;
}

function buildResults(query: string, context: ProgressContext, filterCategory: FilterCategory): SearchItem[] {
  const q = query.trim().toLowerCase();
  const out: SearchItem[] = [];

  for (const l of ALL_LESSONS) {
    const content = LESSON_CONTENT[l.id];
    let score = 0;
    let snippet = l.outline?.[0] ?? (content ? content.summary : "Inventoried — body authored in a later pass.");
    const isDone = context.completedSet.has(l.id);
    const isNext = l.id === context.nextLessonId;
    const isSkipped = context.skippedLessonIds.has(l.id);
    const isUpcoming = context.upcomingLessonIds.includes(l.id);

    // Extract Phase & Stage metadata
    const phaseMatch = l.id.match(/^p(\d+)/);
    const phaseNum = phaseMatch ? parseInt(phaseMatch[1], 10) : undefined;
    const phaseObj = phaseNum !== undefined ? PHASES.find((p) => p.n === phaseNum) : undefined;
    const stageObj = phaseObj ? stageById(phaseObj.stage) : undefined;

    // Categorization
    let category: SearchItem["category"] = "core";
    const lowerTitle = l.title.toLowerCase();
    const lowerSummary = (content?.summary ?? "").toLowerCase();

    if (lowerTitle.includes("fastify") || lowerTitle.includes("nest") || phaseNum === 10 || phaseNum === 11 || phaseNum === 12) {
      category = "nestjs";
    } else if (lowerTitle.includes("prisma") || lowerTitle.includes("postgres") || lowerTitle.includes("sql") || phaseNum === 13 || phaseNum === 14 || phaseNum === 15) {
      category = "prisma";
    } else if (lowerTitle.includes("architecture") || lowerTitle.includes("module") || lowerTitle.includes("clean") || phaseNum === 40) {
      category = "architecture";
    } else if (lowerTitle.includes("redis") || lowerTitle.includes("bullmq") || lowerTitle.includes("cache") || lowerTitle.includes("rate") || lowerTitle.includes("performance") || lowerTitle.includes("docker") || (phaseNum && phaseNum >= 25 && phaseNum <= 39)) {
      category = "production";
    }

    // Category Filter Filtering
    if (filterCategory === "next_skipped" && !isNext && !isSkipped) continue;
    if (filterCategory === "nestjs_fastify" && category !== "nestjs") continue;
    if (filterCategory === "prisma_db" && category !== "prisma") continue;
    if (filterCategory === "architecture" && category !== "architecture") continue;
    if (filterCategory === "production" && category !== "production") continue;

    if (q.length >= 2) {
      // Exact title start
      if (lowerTitle.startsWith(q)) {
        score += 25;
      } else if (lowerTitle.includes(q)) {
        score += 15;
      }

      if (content) {
        if (lowerSummary.includes(q)) score += 8;
        for (const s of content.sections) {
          if (s.heading.toLowerCase().includes(q)) {
            score += 6;
            snippet = snippetFrom(s.heading + " — " + s.body.join(" "), q);
            break;
          }
        }
        if (score === 0) {
          const full = content.sections.map((s) => s.body.join(" ")).join(" ");
          if (full.toLowerCase().includes(q)) {
            score += 4;
            snippet = snippetFrom(full, q);
          }
        }
        if (content.objectives.some((o) => o.toLowerCase().includes(q))) score += 4;
      } else if (l.outline?.some((o) => o.toLowerCase().includes(q))) {
        score += 5;
      }
    } else if (q.length === 0 && (filterCategory !== "all" || isNext || isSkipped)) {
      // Empty query with active filter or proactive context
      score = isNext ? 100 : isSkipped ? 80 : isUpcoming ? 40 : 10;
    }

    if (score > 0) {
      let contextBadge: string | undefined;
      let contextType: SearchItem["contextType"] | undefined;

      // Proactive Context Ranking Boosts
      if (isNext) {
        score += 90; // Highest priority for immediate next module
        contextBadge = "⚡ Next Recommended";
        contextType = "next";
      } else if (isSkipped) {
        score += 75; // Critical priority for missed prerequisites
        contextBadge = "↩ Skipped · Prerequisite";
        contextType = "skipped";
      } else if (isUpcoming) {
        score += 45; // Upcoming sequential learning path
        contextBadge = "▶ Upcoming on Path";
        contextType = "upcoming";
      } else if (context.activePhaseId !== undefined && phaseNum === context.activePhaseId) {
        score += 30; // Active phase priority
        contextBadge = `📍 Phase ${phaseNum}`;
        contextType = "active";
      } else if (isDone) {
        score -= 5;
        contextBadge = "✓ Mastered";
        contextType = "completed";
      }

      out.push({
        kind: "lesson",
        title: l.title,
        snippet,
        to: `lesson/${l.id}`,
        score,
        phaseNumber: phaseNum,
        stageTitle: stageObj?.title,
        contextBadge,
        contextType,
        category,
      });
    }
  }

  if (q.length >= 2 && filterCategory === "all") {
    for (const p of PHASES) {
      let score = 0;
      if (p.title.toLowerCase().includes(q) || p.focus.toLowerCase().includes(q)) {
        score += 10;
        if (p.n === context.activePhaseId) {
          score += 35;
        }
        out.push({
          kind: "phase",
          title: `Phase ${p.n}: ${p.title}`,
          snippet: p.focus,
          to: "roadmap",
          score,
          phaseNumber: p.n,
          contextBadge: p.n === context.activePhaseId ? "📍 Active Phase" : undefined,
        });
      }
    }

    for (const t of GLOSSARY) {
      if (t.term.toLowerCase().includes(q)) {
        out.push({ kind: "term", title: t.term, snippet: t.def, to: "glossary", score: 8 });
      } else if (t.def.toLowerCase().includes(q)) {
        out.push({ kind: "term", title: t.term, snippet: snippetFrom(t.def, q), to: "glossary", score: 3 });
      }
    }

    for (const t of TROUBLESHOOTING) {
      if (t.symptom.toLowerCase().includes(q)) {
        out.push({ kind: "fix", title: t.symptom, snippet: `Layer: ${t.layer} — ${t.fix}`, to: "troubleshooting", score: 8 });
      } else if (t.fix.toLowerCase().includes(q) || t.causes.some((c) => c.toLowerCase().includes(q))) {
        out.push({ kind: "fix", title: t.symptom, snippet: snippetFrom(t.fix, q), to: "troubleshooting", score: 3 });
      }
    }

    for (const p of PAGES) {
      if (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        out.push({ kind: "page", title: p.title, snippet: p.desc, to: p.to, score: 5 });
      }
    }
  }

  return out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 16);
}

/** Compute predictive suggestions with proactive context guidance */
function getPredictiveSuggestions(
  query: string,
  context: ProgressContext
): {
  suggestions: PredictiveSuggestion[];
  topGhostSuffix: string;
  topSuggestionText: string;
} {
  const q = query.trim().toLowerCase();

  // If query is empty, generate Proactive Context Guidance items first
  if (!q) {
    const proactiveList: PredictiveSuggestion[] = [];

    // Next recommended lesson
    if (context.nextLessonId) {
      const nextL = ALL_LESSONS.find((l) => l.id === context.nextLessonId);
      if (nextL) {
        proactiveList.push({
          text: `⚡ Next: ${nextL.title}`,
          kind: "lesson",
          targetRoute: `lesson/${nextL.id}`,
          detail: "Current recommended step on your curriculum path",
          isProactive: true,
          proactiveType: "next",
        });
      }
    }

    // Recently skipped lessons (up to 2)
    if (context.skippedLessonIds.size > 0) {
      const skippedArr = Array.from(context.skippedLessonIds);
      skippedArr.slice(0, 2).forEach((id) => {
        const skippedL = ALL_LESSONS.find((l) => l.id === id);
        if (skippedL) {
          proactiveList.push({
            text: `↩ Revisit: ${skippedL.title}`,
            kind: "lesson",
            targetRoute: `lesson/${skippedL.id}`,
            detail: "Previously skipped module — recommended review",
            isProactive: true,
            proactiveType: "skipped",
          });
        }
      });
    }

    // Active Phase
    if (typeof context.activePhaseId === "number") {
      const activeP = PHASES.find((p) => p.n === context.activePhaseId);
      if (activeP) {
        proactiveList.push({
          text: `📍 Phase ${activeP.n}: ${activeP.title}`,
          kind: "phase",
          targetRoute: "roadmap",
          detail: activeP.focus,
          isProactive: true,
          proactiveType: "phase",
        });
      }
    }

    // Fast-track topics
    POPULAR_TOPICS.slice(0, 3).forEach((t) =>
      proactiveList.push({ text: t, kind: "topic", targetRoute: `search:${t}` })
    );

    return {
      suggestions: proactiveList,
      topGhostSuffix: "",
      topSuggestionText: "",
    };
  }

  const matches: { item: PredictiveSuggestion; score: number }[] = [];

  for (const item of PREDICTIVE_INDEX) {
    const itemLower = item.text.toLowerCase();
    if (itemLower === q) continue; // exact match already typed

    let score = 0;
    if (itemLower.startsWith(q)) {
      // Prefix match on entire string
      score = 100 - (itemLower.length - q.length);
    } else {
      // Check word boundary prefix
      const words = itemLower.split(/[\s·,–—/:-]+/);
      const wordMatchIdx = words.findIndex((w) => w.startsWith(q));
      if (wordMatchIdx >= 0) {
        score = 70 - wordMatchIdx * 5;
      } else if (itemLower.includes(q)) {
        score = 40;
      }
    }

    if (score > 0) {
      matches.push({ item, score });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.item.text.localeCompare(b.item.text));
  const topList = matches.slice(0, 6).map((m) => m.item);

  // Compute ghost autocomplete suffix if top match starts with query
  let topGhostSuffix = "";
  let topSuggestionText = "";
  if (matches.length > 0) {
    const best = matches[0].item.text;
    if (best.toLowerCase().startsWith(query.toLowerCase())) {
      topGhostSuffix = best.slice(query.length);
      topSuggestionText = best;
    }
  }

  return {
    suggestions: topList,
    topGhostSuffix,
    topSuggestionText,
  };
}

export function SearchOverlay({
  open,
  onClose,
  onOpenShortcuts,
}: {
  open: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { completed } = useProgress();

  // Compute Learning Progress Context
  const progressContext = useMemo<ProgressContext>(() => {
    const completedSet = new Set(completed);

    // Find highest completed index
    let highestCompletedIdx = -1;
    ALL_LESSONS.forEach((l, idx) => {
      if (completedSet.has(l.id)) {
        highestCompletedIdx = Math.max(highestCompletedIdx, idx);
      }
    });

    // Identify skipped lessons (uncompleted lessons that come before highest completed)
    const skippedLessonIds = new Set<string>();
    if (highestCompletedIdx > 0) {
      for (let i = 0; i < highestCompletedIdx; i++) {
        if (!completedSet.has(ALL_LESSONS[i].id)) {
          skippedLessonIds.add(ALL_LESSONS[i].id);
        }
      }
    }

    // Identify immediate next lesson
    const nextL = ALL_LESSONS.find((l) => !completedSet.has(l.id));
    const nextLessonId = nextL?.id;

    // Identify next 3 sequential uncompleted lessons
    const upcomingLessonIds: string[] = [];
    if (nextL) {
      const nextIdx = ALL_LESSONS.findIndex((l) => l.id === nextL.id);
      if (nextIdx >= 0) {
        for (let i = nextIdx + 1; i < Math.min(ALL_LESSONS.length, nextIdx + 4); i++) {
          if (!completedSet.has(ALL_LESSONS[i].id)) {
            upcomingLessonIds.push(ALL_LESSONS[i].id);
          }
        }
      }
    }

    // Identify active phase and stage
    const activeP = PHASES.find((p) => p.lessons.some((l) => !completedSet.has(l.id)));
    const activePhaseId = activeP?.n;
    const activeStageId = activeP?.stage;

    return {
      completedSet,
      nextLessonId,
      skippedLessonIds,
      activePhaseId,
      activeStageId,
      upcomingLessonIds,
    };
  }, [completed]);

  const results = useMemo(
    () => buildResults(query, progressContext, filterCategory),
    [query, progressContext, filterCategory]
  );

  const { suggestions, topGhostSuffix, topSuggestionText } = useMemo(
    () => getPredictiveSuggestions(query, progressContext),
    [query, progressContext]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setFilterCategory("all");
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setActive(0), [query, filterCategory]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (to: string) => {
    if (to.startsWith("search:")) {
      setQuery(to.slice(7));
      return;
    }
    window.location.hash = `#/${to}`;
    onClose();
  };

  const applySuggestion = (s: PredictiveSuggestion) => {
    if (s.targetRoute && !s.targetRoute.startsWith("search:")) {
      go(s.targetRoute);
    } else {
      setQuery(s.text);
      inputRef.current?.focus();
    }
  };

  const acceptAutocomplete = () => {
    if (topSuggestionText) {
      setQuery(topSuggestionText);
    }
  };

  if (!open) return null;

  const isMac =
    typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);

  const nextLessonObj = progressContext.nextLessonId
    ? ALL_LESSONS.find((l) => l.id === progressContext.nextLessonId)
    : undefined;

  const skippedLessonsList = Array.from(progressContext.skippedLessonIds)
    .map((id) => ALL_LESSONS.find((l) => l.id === id))
    .filter(Boolean);

  const activePhaseObj =
    progressContext.activePhaseId !== undefined
      ? PHASES.find((p) => p.n === progressContext.activePhaseId)
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search the course"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 search-backdrop"
        aria-hidden="true"
        onMouseDown={onClose}
      />
      <div
        className="search-panel relative w-full max-w-3xl panel overflow-hidden fade-in"
        style={{ boxShadow: "var(--shadow-2)" }}
      >
        {/* Search input with predictive ghost text */}
        <div className="relative flex items-center gap-3 px-4 border-b" style={{ borderColor: "var(--line)" }}>
          <Search size={18} style={{ color: "var(--brand)" }} aria-hidden="true" />

          <div className="relative flex-1 py-3.5">
            {/* Ghost text for predictive completion */}
            {topGhostSuffix && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center pointer-events-none text-[0.95rem] whitespace-pre select-none"
              >
                <span className="opacity-0">{query}</span>
                <span style={{ color: "var(--muted)", opacity: 0.55 }}>{topGhostSuffix}</span>
              </div>
            )}

            <input
              ref={inputRef}
              className="w-full bg-transparent outline-none text-[0.95rem] relative z-10"
              style={{ color: "var(--ink)" }}
              placeholder="Search lessons, terms, Fastify, Prisma, architecture, fixes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onClose();
                } else if (e.key === "Tab" && topGhostSuffix) {
                  e.preventDefault();
                  acceptAutocomplete();
                } else if (e.key === "ArrowRight" && topGhostSuffix && e.currentTarget.selectionStart === query.length) {
                  e.preventDefault();
                  acceptAutocomplete();
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter" && results[active]) {
                  go(results[active].to);
                }
              }}
              aria-label="Search query"
              aria-controls="search-results"
            />
          </div>

          {topGhostSuffix ? (
            <button
              type="button"
              onClick={acceptAutocomplete}
              className="flex items-center gap-1 font-mono text-[0.68rem] px-2 py-0.5 rounded-[var(--r-sm)] border transition-colors hover:border-[var(--brand)]"
              style={{ background: "var(--surface-2)", color: "var(--brand-ink)", borderColor: "var(--line-2)" }}
              title="Press Tab to complete"
            >
              <span>Tab</span>
              <span>⇥</span>
            </button>
          ) : (
            <kbd>{isMac ? "esc" : "Esc"}</kbd>
          )}
        </div>

        {/* Category Filter Chips */}
        <div
          className="px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-[0.72rem]"
          style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
        >
          <span className="font-mono text-[0.64rem] uppercase tracking-wider text-[var(--muted)] mr-1 shrink-0 flex items-center gap-1">
            <Filter size={10} /> Focus:
          </span>
          {[
            { id: "all", label: "All Items" },
            {
              id: "next_skipped",
              label: `⚡ Next & Skipped (${(progressContext.nextLessonId ? 1 : 0) + progressContext.skippedLessonIds.size})`,
            },
            { id: "nestjs_fastify", label: "NestJS & Fastify" },
            { id: "prisma_db", label: "Prisma & Postgres" },
            { id: "architecture", label: "Architecture" },
            { id: "production", label: "Production & Redis" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id as FilterCategory)}
              className="px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer"
              style={{
                background: filterCategory === cat.id ? "var(--brand-soft)" : "var(--surface-3)",
                color: filterCategory === cat.id ? "var(--brand-ink)" : "var(--ink-2)",
                borderColor: filterCategory === cat.id ? "var(--brand)" : "var(--line-2)",
                fontWeight: filterCategory === cat.id ? 600 : 400,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Predictive & Proactive Suggestions Tray */}
        <div
          className="px-4 py-2.5 border-b flex flex-wrap items-center gap-1.5 text-[0.76rem]"
          style={{ background: "var(--surface-1)", borderColor: "var(--line)" }}
        >
          <span className="flex items-center gap-1 font-mono text-[0.66rem] uppercase tracking-wider mr-1" style={{ color: "var(--muted)" }}>
            <Sparkles size={11} style={{ color: "var(--brand)" }} />
            {query.trim().length > 0 ? "Suggestions:" : "Proactive Guidance:"}
          </span>
          {suggestions.map((s) => {
            const isProactive = s.isProactive;
            const isSkipped = s.proactiveType === "skipped";
            const isNext = s.proactiveType === "next";

            return (
              <button
                key={`${s.kind}-${s.text}`}
                type="button"
                onClick={() => applySuggestion(s)}
                className="px-2.5 py-1 rounded-full text-[0.76rem] flex items-center gap-1.5 transition-all hover:scale-[1.02] border"
                style={{
                  background: isNext
                    ? "var(--brand-soft)"
                    : isSkipped
                    ? "var(--amber-soft, #fef3c7)"
                    : "var(--surface-3)",
                  color: isNext
                    ? "var(--brand-ink)"
                    : isSkipped
                    ? "var(--amber-ink, #92400e)"
                    : "var(--ink-2)",
                  borderColor: isNext
                    ? "var(--brand)"
                    : isSkipped
                    ? "var(--amber, #f59e0b)"
                    : "var(--line-2)",
                }}
                title={s.detail ?? `Search "${s.text}"`}
              >
                <span className="opacity-75">{KIND_META[s.kind].icon}</span>
                <span className="font-medium">{s.text}</span>
              </button>
            );
          })}
        </div>

        {/* Empty Query Proactive Learning Path View */}
        {query.trim().length === 0 && filterCategory === "all" && (
          <div className="p-4 bg-[var(--surface-2)]/50 border-b flex flex-col gap-3" style={{ borderColor: "var(--line)" }}>
            {/* Immediate Next Step Card */}
            {nextLessonObj && (
              <div
                className="panel p-3 rounded-[var(--r-md)] border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ background: "var(--surface-1)", borderColor: "var(--brand)" }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="p-2 rounded-full shrink-0 mt-0.5"
                    style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                  >
                    <FastForward size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[var(--brand-soft)] text-[var(--brand-ink)] border-[var(--brand)]">
                        ⚡ Recommended Next Step
                      </span>
                      {activePhaseObj && (
                        <span className="text-[0.7rem] font-mono text-[var(--muted)]">
                          Phase {activePhaseObj.n}
                        </span>
                      )}
                    </div>
                    <h4 className="text-[0.92rem] font-semibold mt-1 text-[var(--ink)]">
                      {nextLessonObj.title}
                    </h4>
                    <p className="text-[0.76rem] text-[var(--muted)] line-clamp-1 mt-0.5">
                      {nextLessonObj.outline?.[0] ?? "Continue your structured path to backend & full-stack mastery."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => go(`lesson/${nextLessonObj.id}`)}
                  className="btn btn-primary text-[0.8rem] py-1.5 px-3 shrink-0 flex items-center gap-1.5"
                >
                  <span>Resume Module</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* Skipped Modules Review Panel */}
            {skippedLessonsList.length > 0 && (
              <div
                className="panel p-3 rounded-[var(--r-md)] border"
                style={{ background: "var(--surface-1)", borderColor: "var(--amber, #f59e0b)" }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} style={{ color: "var(--amber, #f59e0b)" }} />
                    <span className="text-[0.82rem] font-semibold text-[var(--ink)]">
                      Missed Prerequisites ({skippedLessonsList.length})
                    </span>
                  </div>
                  <span className="text-[0.7rem] font-mono text-[var(--muted)]">
                    Revisiting reinforces foundational knowledge
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {skippedLessonsList.slice(0, 4).map((sl) => (
                    sl && (
                      <button
                        key={sl.id}
                        type="button"
                        onClick={() => go(`lesson/${sl.id}`)}
                        className="text-left px-2.5 py-1.5 rounded-[var(--r-sm)] border text-[0.78rem] flex items-center justify-between gap-2 hover:bg-[var(--surface-2)] transition-colors"
                        style={{ borderColor: "var(--line-2)", background: "var(--surface-2)" }}
                      >
                        <span className="truncate text-[var(--ink)]">↩ {sl.title}</span>
                        <ChevronRight size={12} className="shrink-0 text-[var(--muted)]" />
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results List with Progress Context Ranking */}
        <ul
          ref={listRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[48vh] overflow-y-auto p-2 flex flex-col gap-1"
        >
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-[0.88rem]" style={{ color: "var(--muted)" }} role="option" aria-selected={false}>
              {query.trim().length < 2
                ? "No matching items for this focus filter. Try typing a concept or selecting another filter above."
                : <>Nothing matches "{query}". Try picking a suggestion above or search by concept.</>}
            </li>
          )}
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.to}-${r.title}`} role="option" aria-selected={i === active} data-idx={i}>
              <button
                type="button"
                className="w-full text-left rounded-[var(--r-sm)] px-3 py-2.5 flex items-start gap-3 transition-colors"
                style={{
                  background: i === active ? "var(--brand-soft)" : "transparent",
                  borderColor: "transparent",
                }}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.to)}
              >
                <span
                  className="badge mt-0.5 shrink-0"
                  style={{
                    color: i === active ? "var(--brand-ink)" : "var(--muted)",
                    borderColor: "var(--line-2)",
                    background: "var(--surface-2)",
                  }}
                >
                  {KIND_META[r.kind].icon} {KIND_META[r.kind].label}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.9rem] font-medium leading-snug" style={{ color: "var(--ink)" }}>
                      {r.title}
                    </span>

                    {/* Stage / Phase Sub-tag */}
                    {r.phaseNumber !== undefined && (
                      <span className="font-mono text-[0.62rem] text-[var(--muted)]">
                        P{String(r.phaseNumber).padStart(2, "0")}
                      </span>
                    )}

                    {/* Proactive Context Badges */}
                    {r.contextBadge && (
                      <span
                        className="font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 font-medium"
                        style={{
                          background:
                            r.contextType === "next"
                              ? "var(--brand-soft)"
                              : r.contextType === "skipped"
                              ? "var(--amber-soft, #fef3c7)"
                              : r.contextType === "upcoming"
                              ? "var(--surface-3)"
                              : r.contextType === "completed"
                              ? "var(--surface-3)"
                              : "var(--surface-2)",
                          color:
                            r.contextType === "next"
                              ? "var(--brand-ink)"
                              : r.contextType === "skipped"
                              ? "var(--amber-ink, #92400e)"
                              : r.contextType === "upcoming"
                              ? "var(--ink-2)"
                              : r.contextType === "completed"
                              ? "var(--muted)"
                              : "var(--brand-ink)",
                          borderColor:
                            r.contextType === "next"
                              ? "var(--brand)"
                              : r.contextType === "skipped"
                              ? "var(--amber, #f59e0b)"
                              : "var(--line-2)",
                        }}
                      >
                        {r.contextBadge}
                      </span>
                    )}
                  </span>

                  <span className="block text-[0.76rem] mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--muted)" }}>
                    {r.snippet}
                  </span>
                </span>

                <ArrowRight
                  size={13}
                  className="mt-1 shrink-0"
                  style={{ color: i === active ? "var(--brand-ink)" : "var(--line-2)" }}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Footer Navigation Hints */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t text-[0.7rem] font-mono"
          style={{ borderColor: "var(--line)", color: "var(--muted)", background: "var(--surface-2)" }}
        >
          <div className="flex items-center gap-3">
            <span><kbd>Tab</kbd> complete</span>
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShortcuts();
                }}
                className="inline-flex items-center gap-1 hover:text-[var(--brand-ink)] transition-colors"
              >
                <kbd>?</kbd>
                <span>all shortcuts</span>
              </button>
            )}
          </div>
          <span>{results.length} result{results.length === 1 ? "" : "s"} · Ranked by learning context</span>
        </div>
      </div>
    </div>
  );
}

/** Hotkey hook — mount once at the app root. */
export function useSearchHotkey(open: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
}
