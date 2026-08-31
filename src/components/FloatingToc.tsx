import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AlignLeft,
  ArrowUp,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  FileQuestion,
  GraduationCap,
  Hash,
  HelpCircle,
  Layers,
  ListOrdered,
  Maximize2,
  Minimize2,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { scrollToId } from "../lib/router";
import type { LessonContent } from "../data/types";
import { useTocData, type TocHeading } from "./TableOfContents";

interface FloatingTocProps {
  content?: LessonContent;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function FloatingToc({ content, containerRef }: FloatingTocProps) {
  const { headings, activeId, setActiveId, scrollProgress, scrollY, activeHeading } =
    useTocData({ content, containerRef });

  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Show floating capsule when user has scrolled down past the intro (> 280px)
  const isScrolledPastHeader = scrollY > 280;
  const hasHeadings = headings && headings.length > 0;
  const isVisible = isScrolledPastHeader && hasHeadings;

  // Keyboard shortcut listener: 'O' to toggle Outline / Table of Contents
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput =
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key.toLowerCase() === "o" && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (hasHeadings) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasHeadings]);

  // Focus filter input when opened
  useEffect(() => {
    if (isOpen) {
      setFilterQuery("");
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredHeadings = useMemo(() => {
    if (!filterQuery.trim()) return headings;
    const q = filterQuery.toLowerCase().trim();
    return headings.filter((h) => h.text.toLowerCase().includes(q));
  }, [headings, filterQuery]);

  const handleSelectHeading = (id: string) => {
    setActiveId(id);
    scrollToId(id);
    setIsOpen(false);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  // Quick anchor presets
  const quickAnchors = useMemo(() => {
    const anchors: { id: string; label: string; icon: typeof Code2 }[] = [];
    if (headings.some((h) => h.id.includes("mistake"))) {
      anchors.push({ id: "common-mistake", label: "Trap", icon: AlertTriangle });
    }
    if (headings.some((h) => h.id.includes("try-it") || h.id.includes("exercise"))) {
      anchors.push({ id: "exercise", label: "Lab", icon: Terminal });
    }
    if (headings.some((h) => h.id.includes("quiz"))) {
      anchors.push({ id: "quiz", label: "Quiz", icon: FileQuestion });
    }
    if (headings.some((h) => h.id.includes("challenge"))) {
      anchors.push({ id: "challenge", label: "Challenge", icon: Award });
    }
    if (headings.some((h) => h.id.includes("recap"))) {
      anchors.push({ id: "recap", label: "Recap", icon: BookOpen });
    }
    return anchors;
  }, [headings]);

  if (!hasHeadings) return null;

  return (
    <div className="relative z-40">
      {/* Floating Capsule Bar (Appears smoothly when scrolling down) */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-[72px] right-4 sm:right-6 md:right-8 z-40 max-w-[90vw] select-none"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="group panel px-3 py-2 rounded-[var(--r-full)] border shadow-xl flex items-center gap-2.5 backdrop-blur-md transition-all hover:border-[var(--brand)] hover:shadow-2xl cursor-pointer"
              style={{
                background: "color-mix(in srgb, var(--surface) 92%, transparent)",
                borderColor: "var(--line-2)",
                boxShadow: "var(--shadow-2), 0 8px 24px rgba(0, 0, 0, 0.28)",
              }}
              aria-label="Open Table of Contents (Press O)"
              title="Table of Contents — Press O"
            >
              {/* Progress Ring / Dot */}
              <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-[var(--surface-3)]"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-[var(--brand)] transition-all duration-300"
                    strokeWidth="2.5"
                    strokeDasharray={56.5}
                    strokeDashoffset={56.5 - (56.5 * scrollProgress) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute font-mono text-[0.55rem] font-bold text-[var(--brand-ink)]">
                  {scrollProgress}%
                </span>
              </div>

              {/* Active Section Label */}
              <div className="flex items-center gap-1.5 text-[0.80rem] max-w-[200px] sm:max-w-[260px] md:max-w-[320px] truncate">
                <AlignLeft size={14} className="text-[var(--brand)] shrink-0" />
                <span className="font-medium text-[var(--ink)] truncate group-hover:text-[var(--brand-ink)] transition-colors">
                  {activeHeading ? activeHeading.text : "Table of Contents"}
                </span>
              </div>

              {/* Outline / Shortcut Pill */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <kbd
                  className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded border shadow-xs"
                  style={{
                    background: "var(--surface-3)",
                    borderColor: "var(--line-2)",
                    color: "var(--muted)",
                  }}
                >
                  O
                </kbd>
                <ChevronRight
                  size={14}
                  className="text-[var(--muted)] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Expanded Interactive Navigator */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed bottom-[72px] right-3 sm:right-6 md:right-8 z-50 w-[calc(100vw-24px)] sm:w-[380px] md:w-[420px] max-h-[75vh] panel rounded-[var(--r-lg)] border shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
              style={{
                background: "color-mix(in srgb, var(--surface) 96%, transparent)",
                borderColor: "var(--brand)",
                boxShadow: "var(--shadow-brand), 0 20px 50px rgba(0, 0, 0, 0.45)",
              }}
              role="dialog"
              aria-label="Lesson Outline & Navigation"
            >
              {/* Header */}
              <div
                className="p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 shrink-0"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--line)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-[var(--r-sm)] border flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--brand-soft)",
                      borderColor: "var(--brand)",
                      color: "var(--brand-ink)",
                    }}
                  >
                    <ListOrdered size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-display font-semibold text-[0.95rem] leading-snug flex items-center gap-2"
                      style={{ color: "var(--ink)" }}
                    >
                      <span>Lesson Outline</span>
                      <span
                        className="font-mono text-[0.62rem] px-1.5 py-0.5 rounded border"
                        style={{
                          background: "var(--surface-3)",
                          borderColor: "var(--line-2)",
                          color: "var(--muted)",
                        }}
                      >
                        {headings.length} sections
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-[0.72rem] font-mono text-[var(--muted)] mt-0.5">
                      <span>Progress: <strong className="text-[var(--brand-ink)]">{scrollProgress}%</strong></span>
                      <span>·</span>
                      <span>Press <kbd className="px-1 py-0.2 rounded bg-[var(--surface-3)] border text-[var(--ink)]">Esc</kbd> to close</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-sm p-1.5 rounded-[var(--r-sm)] text-[var(--muted)] hover:text-[var(--ink)]"
                  aria-label="Close Outline"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Filter / Search Bar */}
              <div
                className="p-2.5 border-b shrink-0 flex items-center gap-2"
                style={{ background: "var(--surface)", borderColor: "var(--line)" }}
              >
                <div className="relative flex-1">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter sections (e.g. schema, mistake, lab)..."
                    className="w-full bg-[var(--surface-2)] border rounded-[var(--r-sm)] pl-8 pr-3 py-1.5 text-[0.80rem] focus:outline-none focus:border-[var(--brand)] transition-colors"
                    style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => setFilterQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.70rem] text-[var(--muted)] hover:text-[var(--ink)] font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Jump Anchors */}
              {quickAnchors.length > 0 && !filterQuery && (
                <div
                  className="px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0"
                  style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
                >
                  <span className="font-mono text-[0.62rem] text-[var(--muted)] uppercase tracking-wider shrink-0 mr-1">
                    Jump:
                  </span>
                  {quickAnchors.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectHeading(item.id)}
                        className="btn btn-soft btn-sm text-[0.72rem] py-1 px-2 font-mono flex items-center gap-1 shrink-0 rounded-[var(--r-xs)] hover:border-[var(--brand)]"
                      >
                        <Icon size={11} className="text-[var(--brand)]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Headings List */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 custom-scrollbar flex flex-col gap-1">
                {filteredHeadings.length === 0 ? (
                  <div className="text-center py-8 px-4 text-[var(--muted)]">
                    <HelpCircle size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[0.82rem] font-medium text-[var(--ink)]">
                      No section matching "{filterQuery}"
                    </p>
                    <p className="text-[0.72rem] mt-1">Try another keyword or clear search.</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {filteredHeadings.map((item) => {
                      const isActive = activeId === item.id;
                      const isH3 = item.level === 3;

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectHeading(item.id)}
                            className={`w-full text-left p-2 rounded-[var(--r-sm)] border transition-all flex items-start gap-2 cursor-pointer group ${
                              isH3 ? "pl-5 text-[0.78rem]" : "text-[0.82rem] font-medium"
                            } ${
                              isActive
                                ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-xs"
                                : "border-transparent hover:bg-[var(--surface-2)] hover:border-[var(--line-2)]"
                            }`}
                            style={{
                              color: isActive
                                ? "var(--brand-ink)"
                                : isH3
                                ? "var(--muted)"
                                : "var(--ink-2)",
                            }}
                          >
                            {isH3 ? (
                              <span
                                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                                style={{
                                  background: isActive ? "var(--brand)" : "var(--muted)",
                                  opacity: isActive ? 1 : 0.4,
                                }}
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronRight
                                size={13}
                                className="mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                                style={{
                                  color: isActive ? "var(--brand)" : "var(--muted)",
                                  opacity: isActive ? 1 : 0.5,
                                }}
                              />
                            )}

                            <span className="flex-1 leading-snug line-clamp-2">{item.text}</span>

                            {isActive && (
                              <span
                                className="font-mono text-[0.60rem] px-1.5 py-0.2 rounded border font-semibold shrink-0"
                                style={{
                                  background: "var(--surface-3)",
                                  borderColor: "var(--brand)",
                                  color: "var(--brand-ink)",
                                }}
                              >
                                Active
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div
                className="p-2.5 sm:px-3 sm:py-2.5 border-t flex items-center justify-between gap-2 text-[0.72rem] font-mono shrink-0"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--line)",
                  color: "var(--muted)",
                }}
              >
                <button
                  type="button"
                  onClick={handleScrollTop}
                  className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  <ArrowUp size={12} className="text-[var(--brand)]" />
                  <span>Back to top</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[var(--brand)] font-medium">Click heading to jump</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
