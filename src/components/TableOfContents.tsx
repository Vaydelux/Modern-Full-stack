import { useEffect, useState, useRef, useMemo } from "react";
import { AlignLeft, ArrowUp, Bookmark, ChevronRight, Hash, Layers, ListOrdered } from "lucide-react";
import { slugify } from "./widgets";
import type { LessonContent } from "../data/types";
import { scrollToId } from "../lib/router";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content?: LessonContent;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Calculates estimated word count and reading time (based on ~200 WPM for technical tutorials)
 */
export function calculateLessonReadingStats(content: LessonContent): {
  wordCount: number;
  readingTimeMinutes: number;
  formattedTime: string;
} {
  let allText = "";
  allText += ` ${content.title || ""} ${content.summary || ""} ${content.simple || ""} ${content.why || ""}`;
  
  if (content.mentalModel) {
    allText += ` ${content.mentalModel.title || ""} ${content.mentalModel.body || ""}`;
  }
  if (content.prerequisites) {
    allText += ` ${content.prerequisites.join(" ")}`;
  }
  if (content.objectives) {
    allText += ` ${content.objectives.join(" ")}`;
  }
  if (content.sections) {
    for (const s of content.sections) {
      allText += ` ${s.heading || ""}`;
      if (s.body) allText += ` ${s.body.join(" ")}`;
      if (s.code) {
        for (const c of s.code) {
          allText += ` ${c.caption || ""} ${c.code || ""}`;
        }
      }
    }
  }
  if (content.mistake) {
    allText += ` ${content.mistake.title || ""} ${content.mistake.wrong || ""} ${content.mistake.right || ""} ${content.mistake.explain || content.mistake.explanation || ""}`;
  }
  if (content.commonMistake) {
    allText += ` ${content.commonMistake.title || ""} ${content.commonMistake.wrong || ""} ${content.commonMistake.right || ""} ${content.commonMistake.explanation || content.commonMistake.explain || ""}`;
  }
  if (content.tryIt) allText += ` ${content.tryIt.join(" ")}`;
  if (content.tryItYourself) {
    allText += ` ${content.tryItYourself.title || ""} ${(content.tryItYourself.instructions || []).join(" ")} ${content.tryItYourself.expected || ""}`;
  }
  if (content.exercise) {
    allText += ` ${content.exercise.title || ""} ${content.exercise.description || ""} ${(content.exercise.tasks || []).join(" ")}`;
  }
  if (content.challenge) {
    allText += ` ${content.challenge.title || ""} ${content.challenge.prompt || content.challenge.description || ""} ${(content.challenge.hints || []).join(" ")} ${content.challenge.solution || ""}`;
  }
  if (content.quiz) {
    for (const q of content.quiz) {
      allText += ` ${q.q || q.question || ""} ${(q.options || []).join(" ")} ${q.explain || q.explanation || ""}`;
    }
  }
  if (content.flashcards) {
    for (const f of content.flashcards) {
      allText += ` ${f.front || ""} ${f.back || ""}`;
    }
  }
  if (content.recap) allText += ` ${content.recap.join(" ")}`;
  if (content.nextBridge) allText += ` ${content.nextBridge}`;
  if (content.references) {
    for (const r of content.references) {
      allText += ` ${r.label || ""}`;
    }
  }

  const words = allText.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  // ~200 words per minute for technical programming content
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    wordCount,
    readingTimeMinutes,
    formattedTime: `${readingTimeMinutes} min read`,
  };
}

/**
 * Hook to automatically detect <h2> and <h3> headings in the lesson and track active scroll state.
 */
export function useTocData({ content, containerRef }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);

  // 1. Initial fallback extraction from structured content
  const fallbackHeadings = useMemo<TocHeading[]>(() => {
    if (!content) return [];
    const list: TocHeading[] = [];

    // Core Sections
    for (const s of content.sections) {
      list.push({
        id: slugify(s.heading),
        text: s.heading,
        level: 2,
      });
    }

    // Common Mistake
    if (content.mistake || content.commonMistake) {
      list.push({
        id: "common-mistake",
        text: "Common Mistake",
        level: 2,
      });
      const subTitle = content.mistake?.title || content.commonMistake?.title;
      if (subTitle) {
        list.push({
          id: "common-mistake-sub",
          text: subTitle,
          level: 3,
        });
      }
    }

    // Try It Yourself
    if (content.tryIt || content.tryItYourself) {
      list.push({
        id: "try-it",
        text: content.tryItYourself?.title || "Try It Yourself",
        level: 2,
      });
    }

    // Exercise
    if (content.exercise) {
      list.push({
        id: "exercise",
        text: content.exercise.title || "Hands-on Lab",
        level: 2,
      });
    }

    // Challenge
    if (content.challenge) {
      list.push({
        id: "challenge",
        text: content.challenge.title ? `Challenge: ${content.challenge.title}` : "Challenge",
        level: 2,
      });
    }

    // Quiz
    if (content.quiz && content.quiz.length > 0) {
      list.push({
        id: "quiz",
        text: "Quiz & Verification",
        level: 2,
      });
    }

    // Flashcards
    if (content.flashcards && content.flashcards.length > 0) {
      list.push({
        id: "flashcards",
        text: "Key Flashcards",
        level: 2,
      });
    }

    // Recap
    if (content.recap && content.recap.length > 0) {
      list.push({
        id: "recap",
        text: "Recap & Bridge",
        level: 2,
      });
    }

    // References
    if (content.references && content.references.length > 0) {
      list.push({
        id: "references",
        text: "Official References",
        level: 2,
      });
    }

    return list;
  }, [content]);

  // 2. DOM scanning for actual rendered <h2> and <h3> elements in current lesson
  useEffect(() => {
    // Give DOM a microtask to settle after mount
    const timer = setTimeout(() => {
      const container = containerRef?.current || document.querySelector(".lesson");
      if (!container) {
        setHeadings(fallbackHeadings);
        return;
      }

      const elements = container.querySelectorAll("h2, h3");
      if (elements.length === 0) {
        setHeadings(fallbackHeadings);
        return;
      }

      const scanned: TocHeading[] = [];
      const seenIds = new Set<string>();

      elements.forEach((el, index) => {
        const tag = el.tagName.toLowerCase();
        const level: 2 | 3 = tag === "h2" ? 2 : 3;
        
        // Clean text (strip child icons or copy buttons)
        const text = (el.textContent || "").trim().replace(/\s+/g, " ");
        if (!text) return;

        // Skip non-navigational headings if any
        if (text === "✗ The trap" || text === "✓ The fix") return;

        // Find existing id or section parent id or generate slug
        let id = el.id;
        if (!id) {
          const sectionParent = el.closest("section");
          if (sectionParent && sectionParent.id) {
            id = sectionParent.id;
          } else {
            id = slugify(text) || `heading-${index}`;
          }
          el.id = id;
        }

        // Avoid exact duplicate IDs in list
        let uniqueId = id;
        let counter = 1;
        while (seenIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        seenIds.add(uniqueId);
        if (el.id !== uniqueId) {
          el.id = uniqueId;
        }

        scanned.push({
          id: uniqueId,
          text,
          level,
        });
      });

      if (scanned.length > 0) {
        setHeadings(scanned);
      } else {
        setHeadings(fallbackHeadings);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [content, containerRef, fallbackHeadings]);

  // 3. Scroll position and active heading detection via IntersectionObserver and scroll listener
  useEffect(() => {
    if (headings.length === 0) return;

    // Intersection observer for heading visibility
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by bounding top
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -65% 0px",
        threshold: [0, 0.5, 1],
      }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    // Scroll progress tracker
    const handleScroll = () => {
      const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;
      setScrollY(currentScrollY);

      const container = containerRef?.current || document.querySelector(".lesson");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = container.scrollHeight || rect.height;
      const windowHeight = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = Math.max(1, totalHeight - windowHeight);
      const progress = Math.min(100, Math.max(0, Math.round((scrolled / maxScroll) * 100)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, containerRef]);

  const activeHeading = useMemo(() => {
    return headings.find((h) => h.id === activeId) || headings[0];
  }, [headings, activeId]);

  return {
    headings,
    activeId,
    setActiveId,
    scrollProgress,
    scrollY,
    activeHeading,
  };
}

/**
 * Automatically detects <h2> and <h3> headings in the lesson and provides active-state scroll spy navigation.
 */
export function TableOfContents({ content, containerRef }: TableOfContentsProps) {
  const { headings, activeId, setActiveId, scrollProgress } = useTocData({ content, containerRef });

  const handleHeadingClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveId(id);
    scrollToId(id);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of Contents"
      className="sticky top-[86px] text-[0.82rem] panel p-4 rounded-[var(--r-md)] border max-h-[calc(100vh-110px)] flex flex-col"
      style={{
        borderColor: "var(--line-2)",
        background: "var(--surface-1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--brand-ink)" }}>
          <AlignLeft size={13} style={{ color: "var(--brand)" }} />
          <span>Table of Contents</span>
        </div>
        <span
          className="font-mono text-[0.62rem] px-1.5 py-0.5 rounded font-medium"
          style={{ background: "var(--surface-3)", color: "var(--muted)" }}
        >
          {headings.length} sections
        </span>
      </div>

      {/* Reading Progress Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[0.68rem] font-mono text-[var(--muted)] mb-1">
          <span>Lesson Progress</span>
          <span className="font-semibold text-[var(--brand-ink)]">{scrollProgress}%</span>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${scrollProgress}%`,
              background: "linear-gradient(90deg, var(--brand) 0%, #8b5cf6 100%)",
            }}
          />
        </div>
      </div>

      {/* Headings List */}
      <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-0.5 custom-scrollbar">
        <ul className="flex flex-col gap-0.5 border-l" style={{ borderColor: "var(--line)" }}>
          {headings.map((item) => {
            const isActive = activeId === item.id;
            const isH3 = item.level === 3;

            return (
              <li key={item.id} className="relative">
                <button
                  type="button"
                  onClick={(e) => handleHeadingClick(item.id, e)}
                  className={`w-full text-left -ml-px border-l-2 transition-all group flex items-start gap-1.5 cursor-pointer py-1 ${
                    isH3 ? "pl-5 text-[0.78rem]" : "pl-3 text-[0.82rem] font-medium"
                  }`}
                  style={{
                    borderColor: isActive ? "var(--brand)" : "transparent",
                    color: isActive ? "var(--brand-ink)" : isH3 ? "var(--muted)" : "var(--ink-2)",
                    background: isActive ? "var(--brand-soft)" : "transparent",
                    borderRadius: "0 var(--r-sm) var(--r-sm) 0",
                  }}
                  title={item.text}
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
                      size={12}
                      className="mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{
                        color: isActive ? "var(--brand)" : "var(--muted)",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    />
                  )}
                  <span className="line-clamp-2 leading-tight flex-1">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Back to Top */}
      <div className="pt-3 mt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
        <button
          type="button"
          onClick={handleScrollTop}
          className="flex items-center gap-1 font-mono text-[0.70rem] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <ArrowUp size={11} />
          <span>Back to top</span>
        </button>
        <span className="text-[0.65rem] font-mono text-[var(--muted)]">h2/h3 tree</span>
      </div>
    </nav>
  );
}
