import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// Safe environment variable lookup with fallback defaults
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://mock-applet-project.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key-dev-environment";

export const isSupabaseConfigured = Boolean(
  typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_SUPABASE_URL &&
    import.meta.env?.VITE_SUPABASE_ANON_KEY
);

// Lazy initialized Supabase client
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export interface CloudProgressRecord {
  user_id: string;
  completed_lessons: string[];
  quiz_results: Record<string, { correct: number; total: number }>;
  flash_known: Record<string, string[]>;
  checks: Record<string, string[]>;
  learning_velocity?: string;
  updated_at: string;
}

export interface MockAuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isGuest: boolean;
  provider: "supabase" | "guest";
}
