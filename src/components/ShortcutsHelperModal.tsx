import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Command,
  Compass,
  Cpu,
  Eye,
  GitBranch,
  HelpCircle,
  Keyboard,
  Layers,
  LayoutGrid,
  Moon,
  Search,
  Sparkles,
  Sun,
  TerminalSquare,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { ALL_LESSONS, IMPLEMENTED_LESSONS } from "../data/curriculum";
import { navigate, splitRoute, useHashRoute } from "../lib/router";
import { useProgress, useTheme } from "../lib/store";

export interface ShortcutItem {
  id: string;
  category: "Omni-Search" | "Navigation" | "Curriculum & Study" | "System";
  keys: string[];
  actionName: string;
  description: string;
  badge?: string;
  onExecute?: () => void;
}

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export function ShortcutsHelperModal({ open, onClose, onOpenSearch }: ShortcutsModalProps) {
  const isMac = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent);
  const route = useHashRoute();
  const { name, param } = splitRoute(route);
  const { completed, toggleComplete, isComplete } = useProgress();
  const { theme, toggleTheme } = useTheme();
  const [filter, setFilter] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [pressedKeyFeedback, setPressedKeyFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setFilter("");
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Compute next recommended lesson
  const nextLesson = useMemo(() => {
    const completedSet = new Set(completed);
    return (
      IMPLEMENTED_LESSONS.find((l) => !completedSet.has(l.id)) ||
      ALL_LESSONS.find((l) => !completedSet.has(l.id)) ||
      ALL_LESSONS[0]
    );
  }, [completed]);

  // Current lesson navigation if on a lesson view
  const currentLessonIndex = useMemo(() => {
    if (name !== "lesson") return -1;
    return ALL_LESSONS.findIndex((l) => l.id === param);
  }, [name, param]);

  const prevLesson = currentLessonIndex > 0 ? ALL_LESSONS[currentLessonIndex - 1] : null;
  const nextLessonInOrder =
    currentLessonIndex >= 0 && currentLessonIndex < ALL_LESSONS.length - 1
      ? ALL_LESSONS[currentLessonIndex + 1]
      : null;

  const shortcuts: ShortcutItem[] = useMemo(() => {
    const modKey = isMac ? "⌘" : "Ctrl";

    return [
      // Omni-Search & Global
      {
        id: "open-search",
        category: "Omni-Search",
        keys: [modKey, "K"],
        actionName: "Open Omni-Search",
        description: "Search lessons, phases, glossary terms, code fixes, and jump anywhere",
        badge: "Global",
        onExecute: () => {
          onClose();
          onOpenSearch?.();
        },
      },
      {
        id: "search-tab",
        category: "Omni-Search",
        keys: ["Tab"],
        actionName: "Auto-Complete Query",
        description: "Fill top predictive concept or cycle focus categories in Omni-Search",
      },
      {
        id: "search-arrows",
        category: "Omni-Search",
        keys: ["↑", "↓"],
        actionName: "Navigate Results",
        description: "Move selection highlight up or down in command palette",
      },
      {
        id: "search-enter",
        category: "Omni-Search",
        keys: ["Enter ↵"],
        actionName: "Select Item",
        description: "Open highlighted lesson, diagnostic guide, or route",
      },
      {
        id: "open-shortcuts",
        category: "Omni-Search",
        keys: ["?"],
        actionName: "Keyboard Shortcuts Helper",
        description: "Toggle this interactive shortcuts cheat sheet modal",
        badge: "Help",
      },
      {
        id: "close-overlay",
        category: "Omni-Search",
        keys: ["Esc"],
        actionName: "Dismiss / Close",
        description: "Close active modal, search palette, or navigation drawer",
        onExecute: () => onClose(),
      },

      // Fast Navigation (G chords)
      {
        id: "goto-dashboard",
        category: "Navigation",
        keys: ["G", "D"],
        actionName: "Go to Dashboard",
        description: "Overview of your progress, velocity, metrics, and syllabus summary",
        onExecute: () => {
          onClose();
          navigate("dashboard");
        },
      },
      {
        id: "goto-roadmap",
        category: "Navigation",
        keys: ["G", "R"],
        actionName: "Go to Roadmap",
        description: "All 45 phases across 7 stages with live progress synchronization",
        onExecute: () => {
          onClose();
          navigate("roadmap");
        },
      },
      {
        id: "goto-next",
        category: "Navigation",
        keys: ["G", "N"],
        actionName: "Jump to Next Lesson",
        description: `Directly resume learning: ${nextLesson ? nextLesson.title : "Next lesson"}`,
        badge: "Smart",
        onExecute: () => {
          onClose();
          if (nextLesson) navigate(`lesson/${nextLesson.id}`);
        },
      },
      {
        id: "goto-glossary",
        category: "Navigation",
        keys: ["G", "G"],
        actionName: "Go to Glossary",
        description: "Comprehensive dictionary of full-stack engineering terms & concepts",
        onExecute: () => {
          onClose();
          navigate("glossary");
        },
      },
      {
        id: "goto-troubleshooting",
        category: "Navigation",
        keys: ["G", "T"],
        actionName: "Go to Troubleshooting (Fix It)",
        description: "Symptom-first diagnostics for Fastify, NestJS, Prisma, and Docker",
        onExecute: () => {
          onClose();
          navigate("troubleshooting");
        },
      },
      {
        id: "goto-mastery",
        category: "Navigation",
        keys: ["G", "M"],
        actionName: "Go to Mastery Ladder",
        description: "Stage exit gates, capstone projects, and cumulative assessments",
        onExecute: () => {
          onClose();
          navigate("mastery");
        },
      },
      {
        id: "goto-versions",
        category: "Navigation",
        keys: ["G", "V"],
        actionName: "Go to Version Matrix",
        description: "Pinned enterprise package versions (Prisma 7.9.15, React 19, NestJS)",
        onExecute: () => {
          onClose();
          navigate("versions");
        },
      },
      {
        id: "goto-tokens",
        category: "Navigation",
        keys: ["G", "K"],
        actionName: "Go to Design Tokens",
        description: "Inspect color roles, typography, spacing, and geometric scale",
        onExecute: () => {
          onClose();
          navigate("tokens");
        },
      },
      {
        id: "goto-status",
        category: "Navigation",
        keys: ["G", "S"],
        actionName: "Go to Course Status",
        description: "Curriculum implementation queue, pass history, and shipping status",
        onExecute: () => {
          onClose();
          navigate("status");
        },
      },
      {
        id: "goto-home",
        category: "Navigation",
        keys: ["G", "H"],
        actionName: "Go to Home / Syllabus",
        description: "Return to the main landing overview page",
        onExecute: () => {
          onClose();
          navigate("");
        },
      },

      // Curriculum & Study Flow
      {
        id: "study-prev",
        category: "Curriculum & Study",
        keys: ["[", "or", "J"],
        actionName: "Previous Lesson",
        description: prevLesson ? `Step back to: ${prevLesson.title}` : "Navigate to previous module in sequence",
        onExecute: () => {
          if (prevLesson) {
            onClose();
            navigate(`lesson/${prevLesson.id}`);
          }
        },
      },
      {
        id: "study-next",
        category: "Curriculum & Study",
        keys: ["]", "or", "K"],
        actionName: "Next Lesson",
        description: nextLessonInOrder ? `Advance to: ${nextLessonInOrder.title}` : "Advance to next module in sequence",
        onExecute: () => {
          if (nextLessonInOrder) {
            onClose();
            navigate(`lesson/${nextLessonInOrder.id}`);
          }
        },
      },
      {
        id: "toggle-outline",
        category: "Curriculum & Study",
        keys: ["O"],
        actionName: "Table of Contents / Outline",
        description: "Open floating heading navigator for quick jumping across the active lesson",
        badge: "TOC",
      },
      {
        id: "toggle-mastered",
        category: "Curriculum & Study",
        keys: ["M"],
        actionName: "Mark Lesson as Read (Toggle)",
        description: name === "lesson" && param ? `Mark "${param}" as ${isComplete(param) ? "Unread" : "Finished / Read"}` : "Toggle read completion on the currently viewed lesson",
        badge: name === "lesson" ? (isComplete(param) ? "Read" : "Unread") : undefined,
        onExecute: () => {
          if (name === "lesson" && param) {
            toggleComplete(param);
            onClose();
          }
        },
      },

      // System Controls
      {
        id: "toggle-theme",
        category: "System",
        keys: ["T"],
        actionName: "Toggle Theme",
        description: `Switch between dark and light palette (currently: ${theme})`,
        badge: theme === "dark" ? "Dark" : "Light",
        onExecute: () => {
          toggleTheme();
        },
      },
    ];
  }, [isMac, name, param, nextLesson, prevLesson, nextLessonInOrder, isComplete, toggleComplete, theme, toggleTheme, onClose, onOpenSearch]);

  const categories = ["all", "Omni-Search", "Navigation", "Curriculum & Study", "System"];

  const filteredShortcuts = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return shortcuts.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.actionName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keys.some((k) => k.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [shortcuts, filter, activeCategory]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md transition-all"
      style={{ background: "rgba(0, 0, 0, 0.68)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl panel overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--line-2)",
          borderRadius: "var(--r-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[var(--r-sm)] border flex items-center justify-center shrink-0"
              style={{
                background: "var(--brand-soft)",
                borderColor: "var(--brand)",
                color: "var(--brand-ink)",
              }}
            >
              <Keyboard size={18} />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="font-display font-semibold text-[1.1rem] leading-tight flex items-center gap-2"
                style={{ color: "var(--ink)" }}
              >
                Omni-Search &amp; Navigation Shortcuts
                <span
                  className="font-mono text-[0.65rem] px-2 py-0.5 rounded-full border"
                  style={{
                    background: "var(--surface-3)",
                    borderColor: "var(--line-2)",
                    color: "var(--muted)",
                  }}
                >
                  Quick Guide
                </span>
              </h2>
              <p className="text-[0.78rem] mt-0.5" style={{ color: "var(--muted)" }}>
                Accelerate your workflow with instant keyboard navigation across the curriculum
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm p-1.5 rounded-[var(--r-sm)]"
            aria-label="Close shortcuts helper"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          className="p-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              ref={inputRef}
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter shortcuts by key or action (e.g. next, theme, g d)..."
              className="w-full bg-[var(--surface-2)] border rounded-[var(--r-sm)] pl-9 pr-3 py-1.5 text-[0.84rem] focus:outline-none transition-colors"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.75rem] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-[var(--r-xs)] text-[0.72rem] font-mono whitespace-nowrap transition-colors border ${
                  activeCategory === cat
                    ? "font-semibold border-[var(--brand)] text-[var(--brand-ink)] bg-[var(--brand-soft)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {cat === "all" ? "All (16)" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y" style={{ borderColor: "var(--line)" }}>
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-10 px-4">
              <HelpCircle size={28} className="mx-auto mb-2 opacity-40 text-[var(--muted)]" />
              <p className="text-[0.88rem] font-medium" style={{ color: "var(--ink)" }}>
                No shortcuts matching "{filter}"
              </p>
              <p className="text-[0.76rem] mt-1 text-[var(--muted)]">
                Try searching for another action, chord, or clear the filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredShortcuts.map((item) => {
                const isClickable = Boolean(item.onExecute);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.onExecute) {
                        item.onExecute();
                      }
                    }}
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        item.onExecute?.();
                      }
                    }}
                    className={`group p-2.5 sm:p-3 rounded-[var(--r-sm)] border flex items-center justify-between gap-3 transition-all ${
                      isClickable
                        ? "cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--brand)] hover:shadow-sm"
                        : "bg-[var(--surface-2)]"
                    }`}
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--line)",
                    }}
                  >
                    {/* Left: Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-medium text-[0.88rem] leading-snug group-hover:text-[var(--brand-ink)] transition-colors"
                          style={{ color: "var(--ink)" }}
                        >
                          {item.actionName}
                        </span>

                        <span
                          className="font-mono text-[0.62rem] px-1.5 py-0.5 rounded-[var(--r-xs)] border"
                          style={{
                            background: "var(--surface-3)",
                            borderColor: "var(--line-2)",
                            color: "var(--muted)",
                          }}
                        >
                          {item.category}
                        </span>

                        {item.badge && (
                          <span
                            className="font-mono text-[0.62rem] px-1.5 py-0.5 rounded-[var(--r-xs)] border font-semibold"
                            style={{
                              background: "var(--brand-soft)",
                              borderColor: "var(--brand)",
                              color: "var(--brand-ink)",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p
                        className="text-[0.76rem] mt-0.5 leading-snug line-clamp-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Right: Key Badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, idx) => (
                        <kbd
                          key={idx}
                          className={`font-mono text-[0.75rem] sm:text-[0.8rem] font-semibold px-2 py-1 rounded-[var(--r-xs)] border shadow-sm ${
                            k === "or"
                              ? "border-transparent bg-transparent text-[var(--muted)] font-normal text-[0.7rem] px-1 shadow-none"
                              : "bg-[var(--surface-3)] border-[var(--line-2)] text-[var(--ink)]"
                          }`}
                        >
                          {k}
                        </kbd>
                      ))}

                      {isClickable && (
                        <ArrowRight
                          size={14}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand)] hidden sm:block"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 sm:px-4 sm:py-3 border-t flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-mono shrink-0"
          style={{
            borderColor: "var(--line)",
            background: "var(--surface-2)",
            color: "var(--muted)",
          }}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--line-2)] text-[var(--ink)]">
                ?
              </kbd>
              <span>Toggle Cheatsheet</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--line-2)] text-[var(--ink)]">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
              <span>Omni-Search</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-[var(--line-2)] text-[var(--ink)]">
                G + Key
              </kbd>
              <span>Fast Jump</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--brand)] font-medium">Click any row to execute action</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global hotkey listener hook supporting:
 * - `?` or `Shift + /` or `Cmd/Ctrl + /`: Toggle shortcuts modal
 * - `g` chord sequences (`g d`, `g r`, `g n`, `g g`, `g t`, `g m`, `g v`, `g s`, `g k`, `g h`)
 * - `j` / `[`: Previous lesson
 * - `k` / `]`: Next lesson
 * - `m`: Toggle completion for active lesson
 * - `t`: Toggle light/dark theme
 */
export function useOmniGlobalShortcuts({
  onToggleShortcuts,
  onOpenSearch,
}: {
  onToggleShortcuts: () => void;
  onOpenSearch: () => void;
}) {
  const route = useHashRoute();
  const { name, param } = splitRoute(route);
  const { completed, toggleComplete } = useProgress();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    let chordPrefixTimeout: ReturnType<typeof setTimeout> | null = null;
    let isWaitingForChord = false;

    const isEditableElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable ||
        el.getAttribute("role") === "textbox"
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const insideInput = isEditableElement(activeEl);

      // 1. Omni-Search: Cmd/Ctrl + K (always works even inside input)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch();
        return;
      }

      // 2. Shortcut Helper Modal: `?` (Shift + /) or Cmd/Ctrl + /
      if ((e.key === "?" && !insideInput) || ((e.metaKey || e.ctrlKey) && e.key === "/")) {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      // If user is currently typing in an input field, do not hijack single letter hotkeys or chords
      if (insideInput) return;

      // Avoid capturing modifier combinations like Alt+Tab, Ctrl+C, etc.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // 3. Two-key "G" navigation chords
      if (isWaitingForChord) {
        isWaitingForChord = false;
        if (chordPrefixTimeout) clearTimeout(chordPrefixTimeout);

        switch (key) {
          case "d":
            e.preventDefault();
            navigate("dashboard");
            return;
          case "r":
            e.preventDefault();
            navigate("roadmap");
            return;
          case "g":
            e.preventDefault();
            navigate("glossary");
            return;
          case "t":
            e.preventDefault();
            navigate("troubleshooting");
            return;
          case "m":
            e.preventDefault();
            navigate("mastery");
            return;
          case "v":
            e.preventDefault();
            navigate("versions");
            return;
          case "s":
            e.preventDefault();
            navigate("status");
            return;
          case "k":
            e.preventDefault();
            navigate("tokens");
            return;
          case "h":
            e.preventDefault();
            navigate("");
            return;
          case "n": {
            e.preventDefault();
            const completedSet = new Set(completed);
            const next =
              IMPLEMENTED_LESSONS.find((l) => !completedSet.has(l.id)) ||
              ALL_LESSONS.find((l) => !completedSet.has(l.id)) ||
              ALL_LESSONS[0];
            if (next) navigate(`lesson/${next.id}`);
            return;
          }
        }
      }

      if (key === "g") {
        isWaitingForChord = true;
        chordPrefixTimeout = setTimeout(() => {
          isWaitingForChord = false;
        }, 1200);
        return;
      }

      // 4. Quick single-key study & reader controls
      if (key === "t") {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (key === "m" && name === "lesson" && param) {
        e.preventDefault();
        toggleComplete(param);
        return;
      }

      if (key === "[" || key === "j") {
        if (name === "lesson" && param) {
          const idx = ALL_LESSONS.findIndex((l) => l.id === param);
          if (idx > 0) {
            e.preventDefault();
            navigate(`lesson/${ALL_LESSONS[idx - 1].id}`);
          }
        }
        return;
      }

      if (key === "]" || key === "k") {
        if (name === "lesson" && param) {
          const idx = ALL_LESSONS.findIndex((l) => l.id === param);
          if (idx >= 0 && idx < ALL_LESSONS.length - 1) {
            e.preventDefault();
            navigate(`lesson/${ALL_LESSONS[idx + 1].id}`);
          }
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (chordPrefixTimeout) clearTimeout(chordPrefixTimeout);
    };
  }, [name, param, completed, toggleComplete, toggleTheme, onOpenSearch, onToggleShortcuts]);
}
