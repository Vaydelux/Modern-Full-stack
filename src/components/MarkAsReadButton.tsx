import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, BookCheck, RotateCcw, Sparkles } from "lucide-react";
import { useProgress } from "../lib/store";
import { fireMiniConfetti } from "./CelebrationOverlay";

interface MarkAsReadButtonProps {
  lessonId: string;
  lessonTitle: string;
  className?: string;
  variant?: "header" | "footer" | "banner";
  showToast?: boolean;
}

export function MarkAsReadButton({
  lessonId,
  lessonTitle,
  className = "",
  variant = "header",
  showToast = true,
}: MarkAsReadButtonProps) {
  const { isComplete, toggleComplete } = useProgress();
  const isDone = isComplete(lessonId);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeDone = !isDone;
    toggleComplete(lessonId);

    if (willBeDone) {
      fireMiniConfetti();
      if (showToast) {
        setToastMessage("Marked as read — progress saved!");
      }
    } else {
      if (showToast) {
        setToastMessage("Marked as unread.");
      }
    }

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  if (variant === "footer") {
    return (
      <>
        <button
          type="button"
          onClick={handleToggle}
          className={`btn ${isDone ? "btn-soft border-[var(--brand)] text-[var(--brand-ink)]" : "btn-primary"} px-4 py-2 flex items-center gap-2 font-medium transition-all shadow-sm ${className}`}
          aria-label={isDone ? "Mark as unread" : "Mark lesson as read"}
          title={isDone ? "Click to mark as unread" : "Mark as read and finish lesson"}
        >
          {isDone ? (
            <>
              <Check size={16} className="text-[var(--brand)] shrink-0" strokeWidth={2.5} />
              <span>Finished · Mark as Unread</span>
            </>
          ) : (
            <>
              <BookCheck size={16} className="shrink-0" />
              <span>Mark Lesson as Read</span>
            </>
          )}
        </button>

        {/* Toast confirmation */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="fixed bottom-6 left-6 z-50 pointer-events-none max-w-sm"
              role="status"
              aria-live="polite"
            >
              <div
                className="panel px-4 py-2.5 shadow-2xl border flex items-center gap-2.5 backdrop-blur-md"
                style={{
                  background: "var(--surface)",
                  borderColor: isDone ? "var(--brand)" : "var(--line-2)",
                  boxShadow: "var(--shadow-brand), 0 12px 32px rgba(0, 0, 0, 0.4)",
                  borderRadius: "var(--r-md)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
                  style={{
                    background: isDone ? "var(--brand-soft)" : "var(--surface-3)",
                    borderColor: isDone ? "var(--brand)" : "var(--line)",
                    color: isDone ? "var(--brand-ink)" : "var(--muted)",
                  }}
                >
                  {isDone ? <Check size={14} className="text-[var(--brand)]" /> : <RotateCcw size={13} />}
                </div>
                <div className="min-w-0 pr-1">
                  <div className="text-[0.82rem] font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <span>{toastMessage}</span>
                    {isDone && <Sparkles size={12} className="text-[var(--brand)]" />}
                  </div>
                  <p className="text-[0.72rem] text-[var(--muted)] truncate">
                    Saved in sidebar & roadmap: "{lessonTitle}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default "header" capsule button
  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={`group btn btn-sm inline-flex items-center gap-1.5 transition-all text-[0.78rem] font-mono select-none cursor-pointer ${
          isDone
            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)] shadow-xs font-semibold"
            : "btn-soft hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
        } ${className}`}
        aria-label={isDone ? "Lesson completed. Click to mark as unread" : "Mark as read"}
        title={isDone ? "Marked as read. Click to toggle unread." : "Mark this lesson as read (Saves progress in sidebar)"}
      >
        {isDone ? (
          <>
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 bg-[var(--brand)] text-[#09090b]"
            >
              <Check size={10} strokeWidth={3.5} className="animate-in zoom-in-50 duration-150" />
            </span>
            <span>Read</span>
            <span className="opacity-40 group-hover:opacity-100 transition-opacity text-[0.70rem]">
              (Undo)
            </span>
          </>
        ) : (
          <>
            <BookCheck size={13} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--brand-ink)] transition-colors" />
            <span>Mark as Read</span>
          </>
        )}
      </button>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed bottom-6 left-6 z-50 pointer-events-none max-w-sm"
            role="status"
            aria-live="polite"
          >
            <div
              className="panel px-4 py-2.5 shadow-2xl border flex items-center gap-2.5 backdrop-blur-md"
              style={{
                background: "var(--surface)",
                borderColor: isDone ? "var(--brand)" : "var(--line-2)",
                boxShadow: "var(--shadow-brand), 0 12px 32px rgba(0, 0, 0, 0.4)",
                borderRadius: "var(--r-md)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
                style={{
                  background: isDone ? "var(--brand-soft)" : "var(--surface-3)",
                  borderColor: isDone ? "var(--brand)" : "var(--line)",
                  color: isDone ? "var(--brand-ink)" : "var(--muted)",
                }}
              >
                {isDone ? <Check size={14} className="text-[var(--brand)]" /> : <RotateCcw size={13} />}
              </div>
              <div className="min-w-0 pr-1">
                <div className="text-[0.82rem] font-semibold text-[var(--ink)] flex items-center gap-1.5">
                  <span>{toastMessage}</span>
                  {isDone && <Sparkles size={12} className="text-[var(--brand)]" />}
                </div>
                <p className="text-[0.72rem] text-[var(--muted)] truncate">
                  Updated in sidebar & local storage: "{lessonTitle}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
