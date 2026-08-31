import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type CloudProgressRecord,
  type MockAuthUser,
} from "./supabase";

/* ---------- persisted progress ---------- */

export interface QuizResult {
  correct: number;
  total: number;
}

export type MasteryPace = "casual" | "steady" | "intensive" | "custom";

export interface ProgressState {
  completed: string[];
  quiz: Record<string, QuizResult>;
  flash: Record<string, string[]>;
  checks: Record<string, string[]>;
  timestamps: Record<string, string>; // lessonId -> ISO date when completed
  velocityPace: MasteryPace;
  customHoursPerWeek: number;
}

export interface SyncState {
  user: MockAuthUser | null;
  syncStatus: "synced" | "syncing" | "offline" | "error" | "guest";
  lastSyncedAt: string | null;
  isCloudConnected: boolean;
  cloudSyncError: string | null;
  isLocalStorageWorking: boolean;
}

const EMPTY: ProgressState = {
  completed: [],
  quiz: {},
  flash: {},
  checks: {},
  timestamps: {},
  velocityPace: "steady",
  customHoursPerWeek: 7,
};

export const STORAGE_KEY = "z2m:v1:progress";
export const LEGACY_STORAGE_KEYS = ["z2m:progress", "mastery:progress", "zero2mastery:progress"];
export const AUTH_KEY = "z2m:v1:auth_user";
export const THEME_KEY = "z2m:theme";
export const FEEDBACK_STORAGE_KEY = "z2m:v1:lesson_feedback";

export interface LessonFeedbackRecord {
  vote: "yes" | "no" | null;
  yesCount: number;
  noCount: number;
  tags?: string[];
  comment?: string;
  updatedAt?: string;
}

export type FeedbackState = Record<string, LessonFeedbackRecord>;

/** Check if localStorage is available and writable */
export function checkLocalStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const testKey = "__z2m_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Sanitize and normalize any progress state object */
export function normalizeProgressState(parsed: any): ProgressState {
  if (!parsed || typeof parsed !== "object") return EMPTY;

  const rawCompleted = Array.isArray(parsed.completed) ? parsed.completed : [];
  const validIds: string[] = rawCompleted.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0);
  const completed: string[] = Array.from(new Set(validIds));

  const rawQuiz = parsed.quiz && typeof parsed.quiz === "object" ? parsed.quiz : {};
  const quiz: Record<string, QuizResult> = {};
  for (const [k, v] of Object.entries(rawQuiz)) {
    if (v && typeof v === "object" && typeof (v as any).correct === "number" && typeof (v as any).total === "number") {
      quiz[k] = { correct: (v as any).correct, total: (v as any).total };
    }
  }

  const rawFlash = parsed.flash && typeof parsed.flash === "object" ? parsed.flash : {};
  const flash: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(rawFlash)) {
    if (Array.isArray(v)) {
      flash[k] = v.filter((item): item is string => typeof item === "string");
    }
  }

  const rawChecks = parsed.checks && typeof parsed.checks === "object" ? parsed.checks : {};
  const checks: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(rawChecks)) {
    if (Array.isArray(v)) {
      checks[k] = v.filter((item): item is string => typeof item === "string");
    }
  }

  const rawTimestamps = parsed.timestamps && typeof parsed.timestamps === "object" ? parsed.timestamps : {};
  const timestamps: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawTimestamps)) {
    if (typeof v === "string") {
      timestamps[k] = v;
    }
  }

  // Ensure every completed lesson has a timestamp
  const now = new Date().toISOString();
  for (const id of completed) {
    if (!timestamps[id]) {
      timestamps[id] = now;
    }
  }

  const validPaces: MasteryPace[] = ["casual", "steady", "intensive", "custom"];
  const velocityPace: MasteryPace = validPaces.includes(parsed.velocityPace) ? parsed.velocityPace : "steady";
  const customHoursPerWeek =
    typeof parsed.customHoursPerWeek === "number" && parsed.customHoursPerWeek > 0
      ? parsed.customHoursPerWeek
      : 7;

  return {
    completed,
    quiz,
    flash,
    checks,
    timestamps,
    velocityPace,
    customHoursPerWeek,
  };
}

/** Safely write progress state to localStorage */
export function writeProgressToLocalStorage(state: ProgressState): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn("Failed to write Mastery Progress to localStorage:", err);
    return false;
  }
}

/** Safely read feedback map from localStorage */
export function readFeedbackFromStorage(): FeedbackState {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Safely write feedback map to localStorage and broadcast update */
export function writeFeedbackToStorage(feedback: FeedbackState): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
    if (typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("z2m:feedback:update", { detail: feedback }));
    }
    return true;
  } catch (err) {
    console.warn("Failed to write feedback to localStorage:", err);
    return false;
  }
}

/** Retrieve feedback for a specific lesson */
export function getLessonFeedback(lessonId: string): LessonFeedbackRecord {
  const state = readFeedbackFromStorage();
  const item = state[lessonId];
  if (!item) {
    return { vote: null, yesCount: 0, noCount: 0 };
  }
  return {
    vote: item.vote === "yes" || item.vote === "no" ? item.vote : null,
    yesCount: typeof item.yesCount === "number" ? Math.max(0, item.yesCount) : 0,
    noCount: typeof item.noCount === "number" ? Math.max(0, item.noCount) : 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
    comment: typeof item.comment === "string" ? item.comment : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

/** Record or toggle a vote and feedback details for a lesson */
export function recordLessonVote(
  lessonId: string,
  newVote: "yes" | "no" | null,
  tags?: string[],
  comment?: string
): LessonFeedbackRecord {
  const state = readFeedbackFromStorage();
  const current = getLessonFeedback(lessonId);
  const oldVote = current.vote;

  let yesCount = current.yesCount;
  let noCount = current.noCount;

  // If vote changed, update respective counts
  if (oldVote !== newVote) {
    if (oldVote === "yes") yesCount = Math.max(0, yesCount - 1);
    if (oldVote === "no") noCount = Math.max(0, noCount - 1);

    if (newVote === "yes") yesCount += 1;
    if (newVote === "no") noCount += 1;
  }

  const updated: LessonFeedbackRecord = {
    vote: newVote,
    yesCount,
    noCount,
    tags: tags !== undefined ? tags : current.tags ?? [],
    comment: comment !== undefined ? comment : current.comment,
    updatedAt: new Date().toISOString(),
  };

  const nextState: FeedbackState = {
    ...state,
    [lessonId]: updated,
  };

  writeFeedbackToStorage(nextState);
  return updated;
}

/** Safely read progress state from primary or legacy keys */
const safeRead = (): ProgressState => {
  if (typeof window === "undefined" || !window.localStorage) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeProgressState(parsed);
    }

    // Check legacy storage keys for automatic migration
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        const normalized = normalizeProgressState(legacyParsed);
        // Migrate to new primary storage key
        writeProgressToLocalStorage(normalized);
        return normalized;
      }
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
};

const safeReadAuth = (): MockAuthUser | null => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

interface ProgressApi extends ProgressState, SyncState {
  isComplete: (lessonId: string) => boolean;
  toggleComplete: (lessonId: string) => void;
  setMultipleComplete: (lessonIds: string[], complete: boolean) => void;
  recordQuiz: (lessonId: string, correct: number, total: number) => void;
  quizBest: (lessonId: string) => QuizResult | undefined;
  isCardKnown: (lessonId: string, front: string) => boolean;
  toggleCardKnown: (lessonId: string, front: string) => void;
  knownCount: (lessonId: string) => number;
  isChecked: (group: string, item: string) => boolean;
  toggleCheck: (group: string, item: string) => void;
  setMasteryPace: (pace: MasteryPace, customHours?: number) => void;
  resetAll: () => void;
  exportProgress: () => string;
  importProgress: (jsonString: string) => boolean;
  // Supabase PostgreSQL Sync API
  loginWithEmail: (email: string, fullName?: string) => Promise<boolean>;
  logoutUser: () => void;
  syncToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
}

const ProgressContext = createContext<ProgressApi | null>(null);

/* ---------- theme ---------- */

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

const initialTheme = (): Theme => {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
  }
  return "dark";
};

export function AppProviders({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(safeRead);
  const [user, setUser] = useState<MockAuthUser | null>(safeReadAuth);
  const [syncStatus, setSyncStatus] = useState<SyncState["syncStatus"]>(() => (safeReadAuth() ? "synced" : "guest"));
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => (safeReadAuth() ? new Date().toISOString() : null));
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [isLocalStorageWorking, setIsLocalStorageWorking] = useState<boolean>(checkLocalStorageAvailable);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const isSyncingRef = useRef(false);

  // Sync state changes to localStorage
  useEffect(() => {
    const success = writeProgressToLocalStorage(state);
    setIsLocalStorageWorking(success);
  }, [state]);

  // Multi-tab / multi-window synchronization via StorageEvent
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageEvent = (e: StorageEvent) => {
      // Sync progress across tabs
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          setState(EMPTY);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            const normalized = normalizeProgressState(parsed);
            setState(normalized);
          } catch {
            /* ignore malformed cross-tab payloads */
          }
        }
      }

      // Sync auth user across tabs
      if (e.key === AUTH_KEY) {
        if (!e.newValue) {
          setUser(null);
          setSyncStatus("guest");
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed);
            setSyncStatus("synced");
          } catch {
            /* ignore */
          }
        }
      }

      // Sync theme across tabs
      if (e.key === THEME_KEY && e.newValue) {
        const nextTheme: Theme = e.newValue === "light" ? "light" : "dark";
        setTheme(nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.documentElement.style.colorScheme = nextTheme;
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  // Persist auth user whenever it changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      if (user) {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* ignore */
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  // Sync to Supabase PostgreSQL when user is logged in
  const syncToCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSyncStatus("guest");
      return false;
    }
    if (isSyncingRef.current) return true;
    isSyncingRef.current = true;
    setSyncStatus("syncing");
    setCloudSyncError(null);

    try {
      if (isSupabaseConfigured) {
        const client = getSupabaseClient();
        const payload: CloudProgressRecord = {
          user_id: user.id,
          completed_lessons: state.completed,
          quiz_results: state.quiz,
          flash_known: state.flash,
          checks: state.checks,
          learning_velocity: state.velocityPace,
          updated_at: new Date().toISOString(),
        };

        const { error } = await client
          .from("user_mastery_progress")
          .upsert(payload, { onConflict: "user_id" });

        if (error) {
          console.warn("Supabase upsert warning, fallback local state preserved:", error.message);
        }
      }

      // Simulated latency for smooth UX
      await new Promise((r) => setTimeout(r, 450));
      const now = new Date().toISOString();
      setLastSyncedAt(now);
      setSyncStatus("synced");
      return true;
    } catch (err: any) {
      console.error("Cloud sync exception:", err);
      setSyncStatus("error");
      setCloudSyncError(err?.message || "Sync failed");
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [user, state]);

  // Pull latest progress from Supabase
  const pullFromCloud = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setSyncStatus("syncing");
    try {
      if (isSupabaseConfigured) {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from("user_mastery_progress")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setState((prev) => {
            const merged: ProgressState = {
              ...prev,
              completed: Array.from(new Set([...prev.completed, ...(data.completed_lessons || [])])),
              quiz: { ...prev.quiz, ...(data.quiz_results || {}) },
              flash: { ...prev.flash, ...(data.flash_known || {}) },
              checks: { ...prev.checks, ...(data.checks || {}) },
              velocityPace: (data.learning_velocity as MasteryPace) || prev.velocityPace,
            };
            writeProgressToLocalStorage(merged);
            return merged;
          });
        }
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus("synced");
      return true;
    } catch (err: any) {
      setSyncStatus("error");
      setCloudSyncError(err?.message || "Pull failed");
      return false;
    }
  }, [user]);

  // Debounced auto-sync trigger when logged in and state changes
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      syncToCloud();
    }, 1200);
    return () => clearTimeout(timer);
  }, [state.completed, state.quiz, state.flash, state.checks, state.velocityPace, user, syncToCloud]);

  const loginWithEmail = useCallback(async (email: string, fullName?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) return false;

    setSyncStatus("syncing");
    const name = fullName?.trim() || cleanEmail.split("@")[0];
    const generatedId = `usr_${Math.abs(
      cleanEmail.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(16)}`;

    const mockUser: MockAuthUser = {
      id: generatedId,
      email: cleanEmail,
      fullName: name.charAt(0).toUpperCase() + name.slice(1),
      isGuest: false,
      provider: isSupabaseConfigured ? "supabase" : "guest",
    };

    setUser(mockUser);
    setSyncStatus("synced");
    setLastSyncedAt(new Date().toISOString());

    // Trigger initial cloud merge
    setTimeout(() => {
      syncToCloud();
    }, 200);

    return true;
  }, [syncToCloud]);

  const logoutUser = useCallback(() => {
    setUser(null);
    setSyncStatus("guest");
    setLastSyncedAt(null);
  }, []);

  const setMasteryPace = useCallback((pace: MasteryPace, customHours?: number) => {
    setState((s) => {
      const next: ProgressState = {
        ...s,
        velocityPace: pace,
        customHoursPerWeek: typeof customHours === "number" && customHours > 0 ? customHours : s.customHoursPerWeek,
      };
      writeProgressToLocalStorage(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
        for (const legacy of LEGACY_STORAGE_KEYS) {
          window.localStorage.removeItem(legacy);
        }
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new CustomEvent("z2m:feedback:update", { detail: {} }));
        }
      } catch {
        /* ignore */
      }
    }
    setState(EMPTY);
  }, []);

  const exportProgress = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importProgress = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const normalized = normalizeProgressState(parsed);
      writeProgressToLocalStorage(normalized);
      setState(normalized);
      return true;
    } catch (err) {
      console.error("Failed to import progress JSON:", err);
      return false;
    }
  }, []);

  const api = useMemo<ProgressApi>(() => {
    return {
      ...state,
      user,
      syncStatus,
      lastSyncedAt,
      isCloudConnected: Boolean(user),
      cloudSyncError,
      isLocalStorageWorking,
      isComplete: (id) => state.completed.includes(id),
      toggleComplete: (id) =>
        setState((s) => {
          const isDone = s.completed.includes(id);
          const nextCompleted = isDone
            ? s.completed.filter((c) => c !== id)
            : [...s.completed, id];
          const nextTimestamps = { ...s.timestamps };
          if (!isDone) {
            nextTimestamps[id] = new Date().toISOString();
          } else {
            delete nextTimestamps[id];
          }
          const next: ProgressState = {
            ...s,
            completed: nextCompleted,
            timestamps: nextTimestamps,
          };
          writeProgressToLocalStorage(next);
          return next;
        }),
      setMultipleComplete: (ids, complete) =>
        setState((s) => {
          const set = new Set(s.completed);
          const nextTimestamps = { ...s.timestamps };
          const now = new Date().toISOString();
          if (complete) {
            ids.forEach((id) => {
              set.add(id);
              if (!nextTimestamps[id]) nextTimestamps[id] = now;
            });
          } else {
            ids.forEach((id) => {
              set.delete(id);
              delete nextTimestamps[id];
            });
          }
          const next: ProgressState = { ...s, completed: Array.from(set), timestamps: nextTimestamps };
          writeProgressToLocalStorage(next);
          return next;
        }),
      recordQuiz: (id, correct, total) =>
        setState((s) => {
          const prev = s.quiz[id];
          if (prev && prev.correct >= correct) return s;
          const next: ProgressState = { ...s, quiz: { ...s.quiz, [id]: { correct, total } } };
          writeProgressToLocalStorage(next);
          return next;
        }),
      quizBest: (id) => state.quiz[id],
      isCardKnown: (id, front) => (state.flash[id] ?? []).includes(front),
      toggleCardKnown: (id, front) =>
        setState((s) => {
          const known = s.flash[id] ?? [];
          const next = known.includes(front) ? known.filter((k) => k !== front) : [...known, front];
          const nextState: ProgressState = { ...s, flash: { ...s.flash, [id]: next } };
          writeProgressToLocalStorage(nextState);
          return nextState;
        }),
      knownCount: (id) => (state.flash[id] ?? []).length,
      isChecked: (group, item) => (state.checks[group] ?? []).includes(item),
      toggleCheck: (group, item) =>
        setState((s) => {
          const current = s.checks[group] ?? [];
          const next = current.includes(item)
            ? current.filter((c) => c !== item)
            : [...current, item];
          const nextState: ProgressState = { ...s, checks: { ...s.checks, [group]: next } };
          writeProgressToLocalStorage(nextState);
          return nextState;
        }),
      setMasteryPace,
      resetAll,
      exportProgress,
      importProgress,
      loginWithEmail,
      logoutUser,
      syncToCloud,
      pullFromCloud,
    };
  }, [
    state,
    user,
    syncStatus,
    lastSyncedAt,
    cloudSyncError,
    isLocalStorageWorking,
    setMasteryPace,
    resetAll,
    exportProgress,
    importProgress,
    loginWithEmail,
    logoutUser,
    syncToCloud,
    pullFromCloud,
  ]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside AppProviders");
  return ctx;
}

/** Custom React hook that synchronizes progress with Supabase PostgreSQL if logged in, falling back to localStorage */
export function useMasterySync() {
  const progress = useProgress();
  return {
    user: progress.user,
    syncStatus: progress.syncStatus,
    lastSyncedAt: progress.lastSyncedAt,
    isCloudConnected: progress.isCloudConnected,
    cloudSyncError: progress.cloudSyncError,
    loginWithEmail: progress.loginWithEmail,
    logoutUser: progress.logoutUser,
    syncToCloud: progress.syncToCloud,
    pullFromCloud: progress.pullFromCloud,
    isGuest: !progress.user,
  };
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside AppProviders");
  return ctx;
}

/** Custom hook for managing lesson helpfulness feedback and local interaction counts */
export function useLessonFeedback(lessonId: string) {
  const [feedback, setFeedback] = useState<LessonFeedbackRecord>(() => getLessonFeedback(lessonId));

  useEffect(() => {
    setFeedback(getLessonFeedback(lessonId));

    const handleCustomUpdate = () => {
      setFeedback(getLessonFeedback(lessonId));
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === FEEDBACK_STORAGE_KEY) {
        setFeedback(getLessonFeedback(lessonId));
      }
    };

    window.addEventListener("z2m:feedback:update", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("z2m:feedback:update", handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [lessonId]);

  const vote = useCallback(
    (newVote: "yes" | "no", tags?: string[], comment?: string) => {
      const res = recordLessonVote(lessonId, newVote, tags, comment);
      setFeedback(res);
    },
    [lessonId]
  );

  const toggleVote = useCallback(
    (targetVote: "yes" | "no") => {
      const current = getLessonFeedback(lessonId);
      const nextVote = current.vote === targetVote ? null : targetVote;
      const res = recordLessonVote(lessonId, nextVote);
      setFeedback(res);
    },
    [lessonId]
  );

  const clearVote = useCallback(() => {
    const res = recordLessonVote(lessonId, null);
    setFeedback(res);
  }, [lessonId]);

  const updateDetails = useCallback(
    (tags: string[], comment?: string) => {
      const current = getLessonFeedback(lessonId);
      const res = recordLessonVote(lessonId, current.vote, tags, comment);
      setFeedback(res);
    },
    [lessonId]
  );

  const totalVotes = feedback.yesCount + feedback.noCount;
  const helpfulRate = totalVotes > 0 ? Math.round((feedback.yesCount / totalVotes) * 100) : 0;

  return {
    feedback,
    vote,
    toggleVote,
    clearVote,
    updateDetails,
    totalVotes,
    helpfulRate,
    hasVoted: feedback.vote !== null,
  };
}
