import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Copy, Link2, Share2 } from "lucide-react";

interface CopyLessonButtonProps {
  lessonId: string;
  lessonTitle: string;
  className?: string;
  variant?: "default" | "compact" | "icon";
}

export function CopyLessonButton({
  lessonId,
  lessonTitle,
  className = "",
  variant = "default",
}: CopyLessonButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? window.location.href
          : `https://dev-curriculum.local/#/lesson/${encodeURIComponent(lessonId)}`;

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setShowToast(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2400);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={`btn btn-soft btn-sm inline-flex items-center gap-1.5 transition-all text-[0.78rem] font-mono select-none ${
          copied
            ? "text-[var(--brand-ink)] border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm"
            : "hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
        } ${className}`}
        aria-label={`Copy link to lesson: ${lessonTitle}`}
        title="Copy link to this lesson"
      >
        {copied ? (
          <>
            <Check size={13} className="text-[var(--brand)] shrink-0 animate-in zoom-in-50 duration-150" />
            <span className="font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Link2 size={13} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--brand-ink)]" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm"
            role="status"
            aria-live="polite"
          >
            <div
              className="panel px-4 py-3 shadow-2xl border flex items-center gap-3 backdrop-blur-md"
              style={{
                background: "var(--surface)",
                borderColor: "var(--brand)",
                boxShadow: "var(--shadow-brand), 0 12px 32px rgba(0, 0, 0, 0.4)",
                borderRadius: "var(--r-md)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                style={{
                  background: "var(--brand-soft)",
                  borderColor: "var(--brand)",
                  color: "var(--brand-ink)",
                }}
              >
                <CheckCircle2 size={17} className="text-[var(--brand)]" />
              </div>

              <div className="min-w-0 pr-1">
                <div className="text-[0.84rem] font-semibold flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
                  <span>Lesson Link Copied</span>
                  <span
                    className="font-mono text-[0.62rem] px-1.5 py-0.2 rounded border uppercase font-medium"
                    style={{
                      background: "var(--surface-3)",
                      borderColor: "var(--line-2)",
                      color: "var(--muted)",
                    }}
                  >
                    URL
                  </span>
                </div>
                <p className="text-[0.74rem] truncate mt-0.5" style={{ color: "var(--muted)" }}>
                  Ready to share: <span className="text-[var(--ink-2)] font-medium">"{lessonTitle}"</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
