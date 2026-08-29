import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  GraduationCap,
  Layers,
  PartyPopper,
  RotateCcw,
  Share2,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { ALL_LESSONS, PHASES, STAGES } from "../data/curriculum";
import { useProgress } from "../lib/store";
import { Link } from "../lib/router";

/**
 * Fires multi-stage celebratory confetti bursts across the screen
 */
export function fireGrandConfetti() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 70, zIndex: 99999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Initial explosive center cannon
  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.5, y: 0.6 },
    colors: ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"],
  });

  // Dual side cannons loop
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount: Math.floor(particleCount),
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6"],
    });

    // Right cannon
    confetti({
      ...defaults,
      particleCount: Math.floor(particleCount),
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#10b981", "#f59e0b", "#06b6d4", "#ec4899"],
    });
  }, 250);
}

/**
 * Fires quick localized star burst
 */
export function fireStarBurst() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    shapes: ["star", "circle"],
    colors: ["#f59e0b", "#fbbf24", "#6366f1", "#ec4899"],
    zIndex: 99999,
  });
}

export function CelebrationOverlay() {
  const { completed, isComplete } = useProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevCompletedCountRef = useRef<number>(completed.length);
  const hasTriggeredInitialRef = useRef<boolean>(false);

  const totalLessons = ALL_LESSONS.length;
  const completedCount = completed.length;
  const is100Percent = totalLessons > 0 && completedCount === totalLessons;

  const totalMinutes = ALL_LESSONS.reduce((acc, l) => acc + l.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(0);

  // Detect when user hits 100% course completion
  useEffect(() => {
    const prevCount = prevCompletedCountRef.current;
    prevCompletedCountRef.current = completedCount;

    if (is100Percent && prevCount < totalLessons && !hasTriggeredInitialRef.current) {
      hasTriggeredInitialRef.current = true;
      setIsOpen(true);
      // Small timeout to allow modal mount animation before fireworks
      const timer = setTimeout(() => {
        fireGrandConfetti();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [completedCount, totalLessons, is100Percent]);

  const handleManualOpen = () => {
    setIsOpen(true);
    fireGrandConfetti();
  };

  const handleCopySummary = async () => {
    const summaryText = `🎓 100% Full-Stack Mastery Milestone Reached!
🏆 Curriculum: Zero to Mastery — Modern Full-Stack Web Development
📚 Total Modules Mastered: ${completedCount}/${totalLessons}
⏱️ Total Study Hours: ~${totalHours} hours
🚀 Stages Conquered: All ${STAGES.length} Stages (P00 through P44)
⭐ Architect Status: Production Ready`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Floating Replay Celebration Pill when 100% is reached and modal is closed */}
      {is100Percent && !isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          type="button"
          onClick={handleManualOpen}
          className="fixed bottom-5 right-5 z-40 px-3.5 py-2 rounded-full border shadow-lg flex items-center gap-2 cursor-pointer font-mono text-[0.76rem] font-bold transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--brand) 0%, #8b5cf6 100%)",
            color: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
          }}
          title="Re-open Course Completion Celebration"
        >
          <Trophy size={15} className="animate-bounce" />
          <span>100% Mastered 🎉</span>
        </motion.button>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: "rgba(0, 0, 0, 0.72)", backdropFilter: "blur(6px)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-title"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="panel max-w-2xl w-full border relative overflow-hidden rounded-[var(--r-lg)] p-6 sm:p-8 my-auto"
              style={{
                borderColor: "var(--brand)",
                background: "linear-gradient(145deg, var(--surface) 0%, var(--surface-2) 65%, var(--brand-soft) 100%)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--brand)",
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full border text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                style={{ borderColor: "var(--line-2)" }}
                aria-label="Close celebration modal"
              >
                <X size={16} />
              </button>

              {/* Celebration Hero Badge */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Glowing background ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 rounded-full opacity-60 blur-md"
                    style={{
                      background: "conic-gradient(from 0deg, var(--brand), #8b5cf6, #ec4899, #10b981, var(--brand))",
                    }}
                  />
                  <div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 shadow-inner"
                    style={{
                      background: "linear-gradient(135deg, var(--brand) 0%, #8b5cf6 100%)",
                      color: "#ffffff",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <Trophy size={40} className="sm:scale-110 drop-shadow-md" />
                  </div>
                </div>

                <div className="font-mono text-[0.72rem] uppercase tracking-[0.25em] px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 mb-2"
                  style={{
                    background: "var(--brand-soft)",
                    color: "var(--brand-ink)",
                    borderColor: "var(--brand)",
                  }}
                >
                  <Sparkles size={12} />
                  100% Course Completion Milestone
                </div>

                <h2 id="celebration-title" className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--ink)] tracking-tight">
                  Full-Stack Mastery Achieved!
                </h2>

                <p className="text-sm sm:text-base mt-2 max-w-[55ch] text-[var(--ink-2)] leading-relaxed">
                  Congratulations! You have completed every single module, laboratory exercise, and architectural track in the entire Zero to Mastery curriculum.
                </p>
              </div>

              {/* 4-Stat Metric Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div
                  className="p-3 rounded-[var(--r-md)] border text-center"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--muted)] flex items-center justify-center gap-1">
                    <CheckCircle2 size={11} style={{ color: "var(--brand)" }} /> Modules
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl mt-1 text-[var(--ink)]">
                    {completedCount}/{totalLessons}
                  </div>
                  <div className="font-mono text-[0.66rem] text-[var(--brand-ink)] font-semibold">100% Completed</div>
                </div>

                <div
                  className="p-3 rounded-[var(--r-md)] border text-center"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--muted)] flex items-center justify-center gap-1">
                    <Clock size={11} style={{ color: "var(--brand)" }} /> Study Hours
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl mt-1 text-[var(--ink)]">
                    ~{totalHours}h
                  </div>
                  <div className="font-mono text-[0.66rem] text-[var(--brand-ink)] font-semibold">Dedicated</div>
                </div>

                <div
                  className="p-3 rounded-[var(--r-md)] border text-center"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--muted)] flex items-center justify-center gap-1">
                    <Layers size={11} style={{ color: "var(--brand)" }} /> Stages
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl mt-1 text-[var(--ink)]">
                    {STAGES.length}/{STAGES.length}
                  </div>
                  <div className="font-mono text-[0.66rem] text-[var(--brand-ink)] font-semibold">P00 to P44</div>
                </div>

                <div
                  className="p-3 rounded-[var(--r-md)] border text-center"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--muted)] flex items-center justify-center gap-1">
                    <GraduationCap size={11} style={{ color: "var(--brand)" }} /> Rank
                  </div>
                  <div className="font-display font-bold text-xl sm:text-2xl mt-1 text-[var(--brand-ink)]">
                    Senior
                  </div>
                  <div className="font-mono text-[0.66rem] text-[var(--muted)]">Full-Stack Architect</div>
                </div>
              </div>

              {/* Stage Progress Pills */}
              <div className="panel p-3.5 rounded-[var(--r-md)] border mb-6" style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}>
                <div className="text-[0.7rem] font-mono uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center justify-between">
                  <span>Conquered Curricular Stages</span>
                  <span className="text-[var(--brand-ink)] font-bold">All 8 Cleared</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-full text-[0.68rem] font-mono font-medium border flex items-center gap-1"
                      style={{
                        background: "var(--brand-soft)",
                        color: "var(--brand-ink)",
                        borderColor: "var(--brand)",
                      }}
                    >
                      <Check size={10} />
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
                {/* Confetti launcher button */}
                <button
                  type="button"
                  onClick={fireGrandConfetti}
                  className="btn btn-soft btn-sm font-mono text-[0.76rem] flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                >
                  <PartyPopper size={14} style={{ color: "var(--brand)" }} />
                  <span>Launch Confetti 🎉</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Copy graduation summary */}
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="btn btn-ghost btn-sm font-mono text-[0.76rem] flex items-center gap-1.5 cursor-pointer"
                    title="Copy diploma summary to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check size={13} style={{ color: "var(--brand)" }} />
                        <span style={{ color: "var(--brand-ink)" }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  {/* Dismiss / Close */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-primary btn-sm font-mono text-[0.76rem] px-4 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
