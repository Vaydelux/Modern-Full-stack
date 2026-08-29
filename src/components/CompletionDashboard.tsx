import { useMemo, useState } from "react";
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  CloudOff,
  Download,
  Flame,
  Gauge,
  HardDrive,
  HelpCircle,
  Layers,
  LogIn,
  LogOut,
  PartyPopper,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";
import { ALL_LESSONS, PHASES, STAGES } from "../data/curriculum";
import { Link } from "../lib/router";
import { type MasteryPace, useMasterySync, useProgress } from "../lib/store";
import { fireGrandConfetti } from "./CelebrationOverlay";

export function RadialProgressBar({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = "var(--brand)",
  trailColor = "var(--surface-3)",
  children,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trailColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trailColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>}
    </div>
  );
}

export function CloudSyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, syncStatus, lastSyncedAt, loginWithEmail, logoutUser, syncToCloud, pullFromCloud } = useMasterySync();
  const { isLocalStorageWorking, exportProgress, importProgress } = useProgress();
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [nameInput, setNameInput] = useState(user?.fullName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [showImportArea, setShowImportArea] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubmitting(true);
    await loginWithEmail(emailInput, nameInput);
    setIsSubmitting(false);
    setSyncNotice("Logged in! Device progress synchronized with Supabase PostgreSQL.");
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSubmitting(true);
    await syncToCloud();
    setIsSubmitting(false);
    setSyncNotice("Cloud database refreshed with current device state.");
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleExport = () => {
    const dataStr = exportProgress();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `z2m-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSyncNotice("Mastery progress backup exported successfully!");
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = importProgress(importJsonText.trim());
    if (ok) {
      setSyncNotice("Progress restored and synced to localStorage successfully!");
      setShowImportArea(false);
      setImportJsonText("");
    } else {
      setSyncNotice("Failed to import JSON: invalid format.");
    }
    setTimeout(() => setSyncNotice(null), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="panel p-6 max-w-md w-full border relative overflow-hidden fade-in max-h-[90vh] overflow-y-auto" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[0.72rem] font-bold"
              style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
            >
              <Cloud size={15} />
            </span>
            <h3 className="font-display font-bold text-lg">Mastery Sync & Storage</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.84rem] text-[var(--muted)] hover:text-[var(--ink)] font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Local Storage Status Indicator */}
        <div
          className="mb-4 p-2.5 rounded-[var(--r-sm)] border text-[0.76rem] flex items-center justify-between"
          style={{ background: "var(--surface-2)", borderColor: "var(--line-2)" }}
        >
          <div className="flex items-center gap-2">
            <HardDrive size={14} style={{ color: isLocalStorageWorking ? "var(--brand)" : "var(--rose)" }} />
            <span>Browser localStorage:</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[0.66rem] font-bold uppercase tracking-wider"
            style={{
              background: isLocalStorageWorking ? "var(--brand-soft)" : "var(--rose-soft)",
              color: isLocalStorageWorking ? "var(--brand-ink)" : "var(--rose-ink)",
            }}
          >
            {isLocalStorageWorking ? "Active & Persisting" : "Unavailable"}
          </span>
        </div>

        {syncNotice && (
          <div
            className="mb-4 p-2.5 rounded-[var(--r-sm)] text-[0.78rem] flex items-center gap-2"
            style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
          >
            <CheckCircle2 size={14} />
            <span>{syncNotice}</span>
          </div>
        )}

        {user ? (
          <div>
            <div className="p-3 rounded-[var(--r-sm)] border mb-4" style={{ background: "var(--surface-2)", borderColor: "var(--line-2)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{user.fullName}</div>
                  <div className="text-[0.76rem] font-mono" style={{ color: "var(--muted)" }}>{user.email}</div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-[0.66rem] uppercase tracking-wider"
                  style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                >
                  Supabase Active
                </span>
              </div>
              <div className="mt-2 text-[0.72rem] flex items-center justify-between" style={{ color: "var(--muted)" }}>
                <span>Status: {syncStatus}</span>
                {lastSyncedAt && <span>Synced: {new Date(lastSyncedAt).toLocaleTimeString()}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSubmitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                <span>{isSubmitting ? "Syncing..." : "Push / Refresh Cloud Data"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  onClose();
                }}
                className="btn btn-ghost w-full flex items-center justify-center gap-2 text-[var(--rose-ink)] cursor-pointer"
              >
                <LogOut size={14} /> Switch to Guest Mode (Local only)
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              Your progress automatically persists locally in your browser across page refreshes.
              Optionally sign in with email to synchronize across all your devices via Supabase PostgreSQL.
            </p>

            <div>
              <label className="block font-mono text-[0.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3 py-2 rounded-[var(--r-sm)] border bg-[var(--surface-2)] text-sm outline-none"
                style={{ borderColor: "var(--line)" }}
              />
            </div>

            <div>
              <label className="block font-mono text-[0.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="dev@example.com"
                className="w-full px-3 py-2 rounded-[var(--r-sm)] border bg-[var(--surface-2)] text-sm outline-none"
                style={{ borderColor: "var(--line)" }}
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !emailInput}
                className="btn btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={14} />
                <span>{isSubmitting ? "Connecting..." : "Log In & Sync Progress"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost w-full text-[0.82rem] cursor-pointer"
              >
                Continue with Local Persistence
              </button>
            </div>
          </form>
        )}

        {/* Manual Backup / Restore Section */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[0.66rem] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              Data Backup & Portability
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-soft btn-sm flex items-center justify-center gap-1.5 text-[0.74rem] cursor-pointer"
              title="Download your progress JSON file"
            >
              <Download size={13} /> Export JSON
            </button>
            <button
              type="button"
              onClick={() => setShowImportArea((v) => !v)}
              className="btn btn-soft btn-sm flex items-center justify-center gap-1.5 text-[0.74rem] cursor-pointer"
              title="Restore progress from a backup JSON"
            >
              <Upload size={13} /> Import JSON
            </button>
          </div>

          {showImportArea && (
            <div className="mt-3 p-3 rounded-[var(--r-sm)] border" style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
              <label className="block font-mono text-[0.64rem] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                Paste Progress JSON:
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"completed": ["p00-l1", "p00-l2"], ...}'
                rows={3}
                className="w-full p-2 text-xs font-mono rounded-[var(--r-sm)] border bg-[var(--surface)] text-[var(--ink)] outline-none"
                style={{ borderColor: "var(--line-2)" }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportArea(false);
                    setImportJsonText("");
                  }}
                  className="btn btn-ghost btn-sm text-[0.72rem]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={!importJsonText.trim()}
                  className="btn btn-primary btn-sm text-[0.72rem]"
                >
                  Restore Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CompletionDashboard() {
  const { completed, velocityPace, customHoursPerWeek, setMasteryPace, isComplete } = useProgress();
  const { user, syncStatus, lastSyncedAt, isCloudConnected } = useMasterySync();
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Total metrics
  const totalLessons = ALL_LESSONS.length;
  const completedCount = completed.length;
  const completionPct = Math.round((completedCount / totalLessons) * 100);

  const totalMinutes = useMemo(() => ALL_LESSONS.reduce((acc, l) => acc + l.minutes, 0), []);
  const completedMinutes = useMemo(() => {
    return ALL_LESSONS.filter((l) => isComplete(l.id)).reduce((acc, l) => acc + l.minutes, 0);
  }, [isComplete, completed]);

  const remainingMinutes = Math.max(0, totalMinutes - completedMinutes);
  const remainingHours = (remainingMinutes / 60).toFixed(1);

  // Velocity study hours per week
  const hoursPerWeek = useMemo(() => {
    switch (velocityPace) {
      case "casual":
        return 3;
      case "steady":
        return 7;
      case "intensive":
        return 15;
      case "custom":
        return customHoursPerWeek || 7;
    }
  }, [velocityPace, customHoursPerWeek]);

  // Projected weeks & finish date
  const estimatedWeeksRemaining = useMemo(() => {
    const hoursLeft = remainingMinutes / 60;
    return Math.max(0.2, hoursLeft / hoursPerWeek);
  }, [remainingMinutes, hoursPerWeek]);

  const projectedFinishDate = useMemo(() => {
    if (completedCount === totalLessons) return "Completed!";
    const now = new Date();
    const days = Math.round(estimatedWeeksRemaining * 7);
    const finish = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return finish.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [estimatedWeeksRemaining, completedCount, totalLessons]);

  return (
    <section
      aria-label="Completion & Velocity Dashboard"
      className="panel p-6 border relative overflow-hidden"
      style={{
        borderColor: "var(--line)",
        background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)",
      }}
    >
      <CloudSyncModal open={showSyncModal} onClose={() => setShowSyncModal(false)} />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[0.76rem] font-bold"
            style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
          >
            <Gauge size={17} />
          </span>
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--brand-ink)" }}>
              <TrendingUp size={11} />
              <span>Velocity Engine & Completion Analytics</span>
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl leading-tight">Mastery Completion Dashboard</h2>
          </div>
        </div>

        {/* Sync Status Pill Button */}
        <button
          type="button"
          onClick={() => setShowSyncModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-sm)] border text-[0.74rem] font-mono transition-all hover:scale-[1.02]"
          style={{
            background: isCloudConnected ? "var(--brand-soft)" : "var(--surface-3)",
            borderColor: isCloudConnected ? "var(--brand)" : "var(--line-2)",
            color: isCloudConnected ? "var(--brand-ink)" : "var(--ink-2)",
          }}
          title="Manage Supabase Cloud Synchronization"
        >
          {isCloudConnected ? (
            <>
              <Cloud size={13} style={{ color: "var(--brand)" }} />
              <span>Supabase Sync: {user?.email}</span>
            </>
          ) : (
            <>
              <CloudOff size={13} style={{ color: "var(--amber-ink)" }} />
              <span>Guest (Local Only) · Connect Cloud</span>
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-center">
        {/* Radial Progress Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-[var(--r)] border" style={{ background: "var(--surface)", borderColor: "var(--line-2)" }}>
          <RadialProgressBar percentage={completionPct} size={170} strokeWidth={14}>
            <div className="font-display font-bold text-3xl tracking-tight leading-none" style={{ color: "var(--ink)" }}>
              {completionPct}%
            </div>
            <div className="font-mono text-[0.64rem] uppercase tracking-wider mt-1" style={{ color: "var(--muted)" }}>
              {completedCount} of {totalLessons} Modules
            </div>
            <div className="text-[0.68rem] font-semibold mt-1" style={{ color: "var(--brand-ink)" }}>
              {completedCount === totalLessons ? "Mastery Achieved!" : "Mastery Progress"}
            </div>
          </RadialProgressBar>

          <div className="w-full mt-4 pt-3 border-t flex items-center justify-around text-center font-mono text-[0.7rem]" style={{ borderColor: "var(--line)" }}>
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m</div>
              <div style={{ color: "var(--muted)" }}>Logged</div>
            </div>
            <div className="w-[1px] h-6 bg-[var(--line)]" />
            <div>
              <div className="font-bold text-sm" style={{ color: "var(--brand-ink)" }}>{remainingHours}h</div>
              <div style={{ color: "var(--muted)" }}>Remaining</div>
            </div>
          </div>

          {completedCount === totalLessons && (
            <button
              type="button"
              onClick={fireGrandConfetti}
              className="mt-3 w-full py-1.5 px-3 rounded-[var(--r-sm)] border font-mono text-[0.72rem] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.02]"
              style={{
                background: "var(--brand-soft)",
                borderColor: "var(--brand)",
                color: "var(--brand-ink)",
              }}
            >
              <PartyPopper size={13} />
              <span>Celebrate 100% Completion 🎉</span>
            </button>
          )}
        </div>

        {/* Velocity & Target Forecast Engine */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full gap-4">
          {/* Velocity Pace Selectors */}
          <div className="p-4 rounded-[var(--r)] border" style={{ background: "var(--surface)", borderColor: "var(--line-2)" }}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-mono text-[0.66rem] uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                <Timer size={13} style={{ color: "var(--brand)" }} /> Study Velocity Pace:
              </span>
              <span className="font-mono text-[0.72rem]" style={{ color: "var(--brand-ink)" }}>
                Target: {hoursPerWeek} hrs/week (~{(hoursPerWeek / 2).toFixed(1)} modules/wk)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "casual" as MasteryPace, label: "Casual", hrs: "3h / wk", desc: "1-2 modules" },
                { id: "steady" as MasteryPace, label: "Steady", hrs: "7h / wk", desc: "3-4 modules" },
                { id: "intensive" as MasteryPace, label: "Intensive", hrs: "15h / wk", desc: "Full immersion" },
              ].map((p) => {
                const active = velocityPace === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setMasteryPace(p.id)}
                    className="p-2.5 rounded-[var(--r-sm)] border text-left transition-all hover:border-[var(--brand)]"
                    style={{
                      background: active ? "var(--brand-soft)" : "var(--surface-2)",
                      borderColor: active ? "var(--brand)" : "var(--line)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs" style={{ color: active ? "var(--brand-ink)" : "var(--ink)" }}>
                        {p.label}
                      </span>
                      <span className="font-mono text-[0.6rem]" style={{ color: "var(--muted)" }}>{p.hrs}</span>
                    </div>
                    <div className="text-[0.68rem] mt-0.5" style={{ color: "var(--muted)" }}>{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Remaining & Milestones Cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-[var(--r-sm)] border flex items-center gap-3" style={{ background: "var(--surface)", borderColor: "var(--line-2)" }}>
              <div className="w-10 h-10 rounded-[var(--r-sm)] flex items-center justify-center shrink-0" style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}>
                <Clock size={20} />
              </div>
              <div>
                <div className="font-mono text-[0.62rem] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Estimated Time Left</div>
                <div className="font-display font-bold text-base mt-0.5" style={{ color: "var(--ink)" }}>
                  {remainingHours} Hours
                </div>
                <div className="text-[0.72rem]" style={{ color: "var(--muted)" }}>
                  ~{Math.ceil(estimatedWeeksRemaining)} weeks at {hoursPerWeek}h/wk
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--r-sm)] border flex items-center gap-3" style={{ background: "var(--surface)", borderColor: "var(--line-2)" }}>
              <div className="w-10 h-10 rounded-[var(--r-sm)] flex items-center justify-center shrink-0" style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="font-mono text-[0.62rem] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Projected Completion</div>
                <div className="font-display font-bold text-base mt-0.5" style={{ color: "var(--brand-ink)" }}>
                  {projectedFinishDate}
                </div>
                <div className="text-[0.72rem]" style={{ color: "var(--muted)" }}>
                  Based on continuous mastery pace
                </div>
              </div>
            </div>
          </div>

          {/* Quick link action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[0.76rem]" style={{ color: "var(--muted)" }}>
              Progress saved in local storage and synced automatically to PostgreSQL when logged in.
            </span>
            <Link to="roadmap" className="btn btn-soft btn-sm flex items-center gap-1 text-[0.78rem]">
              View All Phases <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
