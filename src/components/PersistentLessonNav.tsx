import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ALL_LESSONS, lessonById } from "../data/curriculum";
import { Link, navigate } from "../lib/router";
import { useProgress } from "../lib/store";

interface PersistentLessonNavProps {
  currentId: string;
}

export function PersistentLessonNav({ currentId }: PersistentLessonNavProps) {
  const { completed, isComplete, toggleComplete } = useProgress();

  const totalLessons = ALL_LESSONS.length;
  const currentIndex = ALL_LESSONS.findIndex((l) => l.id === currentId);

  const prevLesson = currentIndex > 0 ? ALL_LESSONS[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < totalLessons - 1
      ? ALL_LESSONS[currentIndex + 1]
      : null;

  const currentLessonData = useMemo(
    () => (currentId ? lessonById(currentId) : null),
    [currentId]
  );
  const prevLessonData = useMemo(
    () => (prevLesson ? lessonById(prevLesson.id) : null),
    [prevLesson]
  );
  const nextLessonData = useMemo(
    () => (nextLesson ? lessonById(nextLesson.id) : null),
    [nextLesson]
  );

  const isCurrentComplete = isComplete(currentId);
  const completedCount = completed.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Keyboard shortcut listener (Alt + Left / Alt + Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.altKey && e.key === "ArrowLeft" && prevLesson) {
        e.preventDefault();
        navigate(`lesson/${prevLesson.id}`);
      } else if (e.altKey && e.key === "ArrowRight" && nextLesson) {
        e.preventDefault();
        navigate(`lesson/${nextLesson.id}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevLesson, nextLesson]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:left-[300px] xl:left-[320px] z-40 border-t backdrop-blur-md transition-all duration-200"
      style={{
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        borderColor: "var(--line)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
      }}
      role="region"
      aria-label="Persistent Lesson Navigation"
    >
      {/* Top micro progress line */}
      <div className="w-full h-0.5 bg-[var(--line)] overflow-hidden">
        <div
          className="h-full bg-[var(--brand)] transition-all duration-300"
          style={{ width: `${Math.max(2, (currentIndex + 1) / totalLessons * 100)}%` }}
        />
      </div>

      <div className="max-w-site mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-4 min-h-[58px]">
        {/* PREVIOUS LESSON BUTTON */}
        <div className="flex-1 max-w-[340px] flex items-center justify-start min-w-0">
          {prevLesson && prevLessonData ? (
            <Link
              to={`lesson/${prevLesson.id}`}
              className="group flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border text-left transition-all hover:bg-[var(--surface-2)] no-underline min-w-0 max-w-full"
              style={{
                borderColor: "var(--line)",
                color: "var(--ink)",
              }}
              title={`Previous (Alt + ←): ${prevLesson.title}`}
              aria-label={`Go to previous lesson: ${prevLesson.title}`}
            >
              <ArrowLeft
                size={16}
                className="shrink-0 transition-transform group-hover:-translate-x-1"
                style={{ color: "var(--muted)" }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="font-mono text-[0.62rem] sm:text-[0.66rem] uppercase tracking-wider flex items-center gap-1"
                  style={{ color: "var(--muted)" }}
                >
                  <span>Prev</span>
                  <span className="opacity-40 hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    P{String(prevLessonData.phase.n).padStart(2, "0")}
                  </span>
                  {isComplete(prevLesson.id) && (
                    <CheckCircle2
                      size={11}
                      className="text-[var(--brand)] inline ml-0.5"
                    />
                  )}
                </span>
                <span className="text-[0.78rem] sm:text-[0.84rem] font-medium truncate max-w-[120px] sm:max-w-[200px] leading-tight">
                  {prevLesson.title}
                </span>
              </div>
            </Link>
          ) : (
            <div
              className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border text-left opacity-35 cursor-not-allowed select-none min-w-0"
              style={{
                borderColor: "var(--line)",
                color: "var(--muted)",
              }}
            >
              <ArrowLeft size={16} className="shrink-0" />
              <div className="flex flex-col">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider">
                  Prev
                </span>
                <span className="text-[0.78rem] font-medium hidden sm:inline">
                  Course Start
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CENTER STATUS & QUICK COMPLETE */}
        <div className="hidden md:flex flex-col items-center justify-center gap-1 px-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleComplete(currentId)}
              className="btn btn-sm px-2.5 py-1 flex items-center gap-1.5 text-[0.75rem] font-medium transition-all cursor-pointer"
              style={{
                background: isCurrentComplete
                  ? "var(--brand-soft)"
                  : "var(--surface-2)",
                color: isCurrentComplete ? "var(--brand-ink)" : "var(--ink)",
                borderColor: isCurrentComplete
                  ? "var(--brand)"
                  : "var(--line)",
              }}
              title={
                isCurrentComplete
                  ? "Marked as mastered. Click to toggle."
                  : "Click to mark this lesson as mastered"
              }
            >
              {isCurrentComplete ? (
                <>
                  <CheckCircle2 size={13} className="text-[var(--brand)]" />
                  <span>Read · Finished</span>
                </>
              ) : (
                <>
                  <Circle size={13} style={{ color: "var(--muted)" }} />
                  <span>Mark as Read</span>
                </>
              )}
            </button>
          </div>

          <div
            className="font-mono text-[0.65rem] flex items-center gap-1.5"
            style={{ color: "var(--muted)" }}
          >
            <span>
              Lesson {currentIndex >= 0 ? currentIndex + 1 : "?"} of{" "}
              {totalLessons}
            </span>
            <span className="opacity-40">·</span>
            <span>{progressPercent}% curriculum</span>
          </div>
        </div>

        {/* NEXT LESSON BUTTON */}
        <div className="flex-1 max-w-[340px] flex items-center justify-end min-w-0">
          {nextLesson && nextLessonData ? (
            <Link
              to={`lesson/${nextLesson.id}`}
              className="group flex items-center justify-end gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-right transition-all no-underline min-w-0 max-w-full font-medium"
              style={{
                background: isCurrentComplete
                  ? "var(--brand)"
                  : "var(--surface-2)",
                color: isCurrentComplete ? "#09090b" : "var(--ink)",
                border: "1px solid",
                borderColor: isCurrentComplete
                  ? "var(--brand)"
                  : "var(--line)",
                boxShadow: isCurrentComplete
                  ? "0 2px 10px color-mix(in srgb, var(--brand) 35%, transparent)"
                  : "none",
              }}
              title={`Next (Alt + →): ${nextLesson.title}`}
              aria-label={`Go to next lesson: ${nextLesson.title}`}
            >
              <div className="flex flex-col items-end min-w-0 text-right">
                <span
                  className="font-mono text-[0.62rem] sm:text-[0.66rem] uppercase tracking-wider flex items-center gap-1"
                  style={{
                    color: isCurrentComplete
                      ? "rgba(0, 0, 0, 0.7)"
                      : "var(--muted)",
                  }}
                >
                  <span>Next Lesson</span>
                  <span className="opacity-40 hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    P{String(nextLessonData.phase.n).padStart(2, "0")}
                  </span>
                  {isComplete(nextLesson.id) && (
                    <CheckCircle2
                      size={11}
                      className={
                        isCurrentComplete
                          ? "text-black inline ml-0.5"
                          : "text-[var(--brand)] inline ml-0.5"
                      }
                    />
                  )}
                </span>
                <span className="text-[0.78rem] sm:text-[0.84rem] truncate max-w-[130px] sm:max-w-[200px] leading-tight">
                  {nextLesson.title}
                </span>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 transition-transform group-hover:translate-x-1"
                style={{
                  color: isCurrentComplete ? "#09090b" : "var(--ink)",
                }}
              />
            </Link>
          ) : (
            <Link
              to="dashboard"
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-right transition-all no-underline font-medium"
              style={{
                background: "var(--brand)",
                color: "#09090b",
                border: "1px solid var(--brand)",
              }}
              title="Curriculum Complete! Open Dashboard"
            >
              <div className="flex flex-col items-end">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Complete
                </span>
                <span className="text-[0.78rem] sm:text-[0.84rem] font-bold">
                  All 45 Phases Done
                </span>
              </div>
              <Trophy size={16} className="shrink-0" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
