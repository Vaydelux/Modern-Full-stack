import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  CheckCircle2,
  Heart,
  MessageSquare,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { useLessonFeedback, type LessonFeedbackRecord } from "../lib/store";

interface LessonFeedbackProps {
  lessonId: string;
  lessonTitle?: string;
}

interface ToastState {
  id: number;
  message: string;
  type: "yes" | "no" | "tag" | "reset" | "note";
}

interface FeedbackAnalyticsProps {
  feedback: LessonFeedbackRecord;
  totalVotes: number;
  helpfulRate: number;
}

/**
 * FeedbackAnalytics Component:
 * Visualizes satisfaction breakdown and tag distribution with smooth spring transition animations
 * that smoothly update whenever a user loads or submits feedback.
 */
export function FeedbackAnalytics({ feedback, totalVotes, helpfulRate }: FeedbackAnalyticsProps) {
  const yesPct = totalVotes > 0 ? (feedback.yesCount / totalVotes) * 100 : 0;
  const noPct = totalVotes > 0 ? (feedback.noCount / totalVotes) * 100 : 0;

  return (
    <div
      className="mt-3 pt-3 border-t flex flex-col gap-2.5"
      style={{ borderColor: "var(--line-2)" }}
    >
      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-mono">
        <div className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--brand-ink)" }}>
          <TrendingUp size={12} className="text-[var(--brand)]" />
          <span>Helpfulness Score: {helpfulRate}%</span>
          <span className="text-[var(--muted)] font-normal">({totalVotes} total {totalVotes === 1 ? "response" : "responses"})</span>
        </div>

        {feedback.updatedAt && (
          <span className="text-[0.68rem] text-[var(--muted)]">
            Updated {new Date(feedback.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Animated Proportional Bar Chart */}
      <div
        className="w-full h-2.5 rounded-full overflow-hidden flex bg-[var(--surface-3)] relative p-0.5 border"
        style={{ borderColor: "var(--line)" }}
        role="progressbar"
        aria-valuenow={helpfulRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Lesson helpfulness rating: ${helpfulRate}% positive`}
      >
        <motion.div
          key="yes-bar"
          initial={{ width: 0 }}
          animate={{ width: `${yesPct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="h-full rounded-l-full relative overflow-hidden"
          style={{ background: "var(--brand)" }}
        />
        <motion.div
          key="no-bar"
          initial={{ width: 0 }}
          animate={{ width: `${noPct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="h-full rounded-r-full relative overflow-hidden"
          style={{ background: "var(--amber)" }}
        />
      </div>

      {/* Bar breakdown labels */}
      <div className="flex items-center justify-between text-[0.68rem] font-mono text-[var(--muted)] px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--brand)" }} />
          <span>Helpful ({feedback.yesCount} · {Math.round(yesPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--amber)" }} />
          <span>Needs Improvement ({feedback.noCount} · {Math.round(noPct)}%)</span>
        </div>
      </div>
    </div>
  );
}

const POSITIVE_TAGS = [
  "Clear explanations",
  "Helpful diagrams",
  "Realistic code samples",
  "Great mental models",
  "Actionable takeaways",
];

const CONSTRUCTIVE_TAGS = [
  "Needs more code examples",
  "Pacing was too dense",
  "Needs visual diagrams",
  "Terminology was unclear",
  "Prerequisites missing",
];

export function LessonFeedback({ lessonId, lessonTitle }: LessonFeedbackProps) {
  const {
    feedback,
    vote,
    toggleVote,
    clearVote,
    updateDetails,
    totalVotes,
    helpfulRate,
    hasVoted,
  } = useLessonFeedback(lessonId);

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentInput, setCommentInput] = useState(feedback.comment || "");
  const [commentSaved, setCommentSaved] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isThankYouVisible, setIsThankYouVisible] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thankYouTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: ToastState["type"]) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (thankYouTimerRef.current) {
        clearTimeout(thankYouTimerRef.current);
      }
    };
  }, []);

  const handleVote = (selectedVote: "yes" | "no") => {
    vote(selectedVote);
    setCommentSaved(false);
    setIsThankYouVisible(true);

    if (thankYouTimerRef.current) {
      clearTimeout(thankYouTimerRef.current);
    }
    thankYouTimerRef.current = setTimeout(() => {
      setIsThankYouVisible(false);
    }, 4200);

    if (selectedVote === "yes") {
      showToast("Choice saved: Marked as helpful!", "yes");
    } else {
      showToast("Choice saved: Marked as needs improvement", "no");
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = feedback.tags || [];
    const isRemoving = currentTags.includes(tag);
    const nextTags = isRemoving
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateDetails(nextTags, feedback.comment);
    showToast(isRemoving ? "Tag removed" : "Feedback tag saved", "tag");
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails(feedback.tags || [], commentInput.trim());
    setCommentSaved(true);
    showToast("Note saved to local storage", "note");
    setTimeout(() => setCommentSaved(false), 3000);
  };

  const handleResetVote = () => {
    if (thankYouTimerRef.current) {
      clearTimeout(thankYouTimerRef.current);
    }
    setIsThankYouVisible(false);
    clearVote();
    showToast("Vote reset", "reset");
  };

  return (
    <div
      id={`feedback-${lessonId}`}
      className="panel p-5 sm:p-6 mt-10 mb-6 border rounded-[var(--r-md)] transition-all"
      style={{
        background: "linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2) 100%)",
        borderColor: hasVoted
          ? feedback.vote === "yes"
            ? "color-mix(in srgb, var(--brand) 40%, var(--line))"
            : "color-mix(in srgb, var(--amber) 40%, var(--line))"
          : "var(--line)",
      }}
      role="region"
      aria-label="Lesson feedback"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"
            style={{ color: "var(--muted)" }}
          >
            <Sparkles size={12} style={{ color: "var(--brand)" }} />
            <span>Course Quality</span>
          </div>
          <h3 className="font-display font-semibold text-base sm:text-lg" style={{ color: "var(--ink)" }}>
            Was this lesson helpful?
          </h3>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Your feedback is stored locally to track lesson utility and guide curriculum improvements.
          </p>
        </div>

        {/* Voting Buttons Container with Animated Tooltip Toast & Thank You Replacement */}
        <div className="relative flex items-center gap-2.5 shrink-0">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: -4, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="absolute -top-11 right-0 sm:right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg z-30 pointer-events-none border whitespace-nowrap"
                style={{
                  background:
                    toast.type === "yes"
                      ? "var(--brand)"
                      : toast.type === "no"
                      ? "var(--amber)"
                      : "var(--surface)",
                  color:
                    toast.type === "yes" || toast.type === "no"
                      ? "#09090b"
                      : "var(--ink)",
                  borderColor:
                    toast.type === "yes" || toast.type === "no"
                      ? "transparent"
                      : "var(--line)",
                  boxShadow:
                    toast.type === "yes"
                      ? "0 4px 16px color-mix(in srgb, var(--brand) 40%, transparent)"
                      : toast.type === "no"
                      ? "0 4px 16px color-mix(in srgb, var(--amber) 40%, transparent)"
                      : "0 4px 16px rgba(0,0,0,0.18)",
                }}
                role="status"
                aria-live="polite"
              >
                {toast.type === "yes" ? (
                  <ThumbsUp size={12} className="shrink-0 fill-current" />
                ) : toast.type === "no" ? (
                  <ThumbsDown size={12} className="shrink-0 fill-current" />
                ) : (
                  <Check size={12} className="shrink-0 text-[var(--brand)]" />
                )}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isThankYouVisible ? (
              <motion.div
                key="thank-you-pill"
                initial={{ opacity: 0, scale: 0.92, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -3 }}
                transition={{ type: "spring", stiffness: 450, damping: 26 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-medium select-none"
                style={{
                  background:
                    feedback.vote === "yes"
                      ? "var(--brand-soft)"
                      : "var(--amber-soft)",
                  color:
                    feedback.vote === "yes"
                      ? "var(--brand-ink)"
                      : "var(--amber-ink)",
                  borderColor:
                    feedback.vote === "yes"
                      ? "var(--brand)"
                      : "var(--amber)",
                  boxShadow:
                    feedback.vote === "yes"
                      ? "0 2px 10px color-mix(in srgb, var(--brand) 20%, transparent)"
                      : "0 2px 10px color-mix(in srgb, var(--amber) 20%, transparent)",
                }}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {feedback.vote === "yes" ? (
                    <CheckCircle2 size={15} className="text-[var(--brand)] shrink-0" />
                  ) : (
                    <MessageSquare size={15} className="text-[var(--amber)] shrink-0" />
                  )}
                  <span>
                    {feedback.vote === "yes"
                      ? "Thank you for your feedback!"
                      : "Thanks for helping us improve!"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsThankYouVisible(false)}
                  className="ml-1 text-[0.72rem] font-mono underline opacity-75 hover:opacity-100 cursor-pointer"
                  style={{ color: "inherit" }}
                  title="Show options to change your vote"
                >
                  Edit
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="action-buttons"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2.5"
              >
                <motion.button
                  type="button"
                  onClick={() => handleVote("yes")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: feedback.vote === "yes" ? 1.06 : feedback.vote === "no" ? 0.95 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="btn btn-sm px-3.5 py-2 flex items-center gap-2 font-medium transition-colors duration-300 cursor-pointer rounded-lg border"
                  style={{
                    background:
                      feedback.vote === "yes"
                        ? "var(--brand-soft)"
                        : "var(--surface)",
                    color:
                      feedback.vote === "yes"
                        ? "var(--brand-ink)"
                        : "var(--ink)",
                    borderColor:
                      feedback.vote === "yes"
                        ? "var(--brand)"
                        : "var(--line)",
                    boxShadow:
                      feedback.vote === "yes"
                        ? "0 3px 12px color-mix(in srgb, var(--brand) 30%, transparent)"
                        : "none",
                  }}
                  aria-pressed={feedback.vote === "yes"}
                  aria-label="Vote Yes, this lesson was helpful"
                >
                  <motion.div
                    animate={{
                      scale: feedback.vote === "yes" ? [1, 1.3, 1] : 1,
                      rotate: feedback.vote === "yes" ? [0, -12, 0] : 0,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-center"
                  >
                    <ThumbsUp
                      size={15}
                      className={feedback.vote === "yes" ? "text-[var(--brand)] fill-[var(--brand)]" : ""}
                      style={{ color: feedback.vote === "yes" ? "var(--brand)" : "var(--muted)" }}
                    />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold">Yes</span>
                  {feedback.yesCount > 0 && (
                    <span
                      className="font-mono text-[0.68rem] px-1.5 py-0.5 rounded-full border transition-colors duration-300"
                      style={{
                        background:
                          feedback.vote === "yes"
                            ? "var(--brand)"
                            : "var(--surface-2)",
                        color: feedback.vote === "yes" ? "#09090b" : "var(--muted)",
                        borderColor:
                          feedback.vote === "yes" ? "var(--brand)" : "var(--line)",
                      }}
                    >
                      {feedback.yesCount}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleVote("no")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: feedback.vote === "no" ? 1.06 : feedback.vote === "yes" ? 0.95 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="btn btn-sm px-3.5 py-2 flex items-center gap-2 font-medium transition-colors duration-300 cursor-pointer rounded-lg border"
                  style={{
                    background:
                      feedback.vote === "no"
                        ? "var(--amber-soft)"
                        : "var(--surface)",
                    color:
                      feedback.vote === "no"
                        ? "var(--amber-ink)"
                        : "var(--ink)",
                    borderColor:
                      feedback.vote === "no"
                        ? "var(--amber)"
                        : "var(--line)",
                    boxShadow:
                      feedback.vote === "no"
                        ? "0 3px 12px color-mix(in srgb, var(--amber) 30%, transparent)"
                        : "none",
                  }}
                  aria-pressed={feedback.vote === "no"}
                  aria-label="Vote No, this lesson needs improvement"
                >
                  <motion.div
                    animate={{
                      scale: feedback.vote === "no" ? [1, 1.3, 1] : 1,
                      rotate: feedback.vote === "no" ? [0, 12, 0] : 0,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-center"
                  >
                    <ThumbsDown
                      size={15}
                      className={feedback.vote === "no" ? "text-[var(--amber)] fill-[var(--amber)]" : ""}
                      style={{ color: feedback.vote === "no" ? "var(--amber)" : "var(--muted)" }}
                    />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold">No</span>
                  {feedback.noCount > 0 && (
                    <span
                      className="font-mono text-[0.68rem] px-1.5 py-0.5 rounded-full border transition-colors duration-300"
                      style={{
                        background:
                          feedback.vote === "no"
                            ? "var(--amber)"
                            : "var(--surface-2)",
                        color: feedback.vote === "no" ? "#09090b" : "var(--muted)",
                        borderColor:
                          feedback.vote === "no" ? "var(--amber)" : "var(--line)",
                      }}
                    >
                      {feedback.noCount}
                    </span>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post-Vote Details Section */}
      {hasVoted && (
        <div className="mt-4 pt-4 border-t fade-in" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              {feedback.vote === "yes" ? (
                <>
                  <CheckCircle2 size={15} className="text-[var(--brand)] shrink-0" />
                  <span style={{ color: "var(--brand-ink)" }}>
                    Thanks for the feedback! What worked best?
                  </span>
                </>
              ) : (
                <>
                  <MessageSquare size={15} className="text-[var(--amber)] shrink-0" />
                  <span style={{ color: "var(--amber-ink)" }}>
                    Thanks for letting us know! What could be improved?
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetVote}
              className="text-[0.72rem] font-mono flex items-center gap-1 hover:underline cursor-pointer opacity-75 hover:opacity-100"
              style={{ color: "var(--muted)" }}
              title="Reset your vote for this lesson"
            >
              <RotateCcw size={11} />
              <span>Reset vote</span>
            </button>
          </div>

          {/* Tag selection pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(feedback.vote === "yes" ? POSITIVE_TAGS : CONSTRUCTIVE_TAGS).map((tag) => {
              const isSelected = (feedback.tags || []).includes(tag);
              return (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors duration-200 cursor-pointer flex items-center gap-1 font-medium"
                  style={{
                    background: isSelected
                      ? feedback.vote === "yes"
                        ? "var(--brand-soft)"
                        : "var(--amber-soft)"
                      : "var(--surface)",
                    color: isSelected
                      ? feedback.vote === "yes"
                        ? "var(--brand-ink)"
                        : "var(--amber-ink)"
                      : "var(--ink-2)",
                    borderColor: isSelected
                      ? feedback.vote === "yes"
                        ? "var(--brand)"
                        : "var(--amber)"
                      : "var(--line)",
                  }}
                >
                  {isSelected && <Check size={11} className="shrink-0" />}
                  <span>{tag}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Optional Note / Comment Form */}
          {!isAddingComment && !feedback.comment && (
            <button
              type="button"
              onClick={() => setIsAddingComment(true)}
              className="text-[0.78rem] flex items-center gap-1.5 hover:underline cursor-pointer"
              style={{ color: "var(--muted)" }}
            >
              <MessageSquare size={13} />
              <span>Add an optional specific note or suggestion...</span>
            </button>
          )}

          {(isAddingComment || feedback.comment) && (
            <form onSubmit={handleSaveComment} className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Optional note: What was especially clear or what felt missing?"
                  className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--line)",
                    color: "var(--ink)",
                  }}
                  maxLength={250}
                />
                <button
                  type="submit"
                  className="btn btn-soft btn-sm px-3 py-1 text-xs cursor-pointer shrink-0"
                >
                  Save note
                </button>
              </div>
              {commentSaved && (
                <div className="text-[0.72rem] flex items-center gap-1 text-[var(--brand-ink)]">
                  <Check size={12} className="text-[var(--brand)]" />
                  <span>Note saved to local storage</span>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Local storage interaction stats & animated analytics chart footer */}
      {totalVotes > 0 && (
        <FeedbackAnalytics
          feedback={feedback}
          totalVotes={totalVotes}
          helpfulRate={helpfulRate}
        />
      )}
    </div>
  );
}
