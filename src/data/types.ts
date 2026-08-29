export type LessonStatus = "implemented" | "draft" | "planned";
export type PhaseStatus = "implemented" | "partial" | "planned";

export type StageId =
  | "foundation"
  | "react-dev"
  | "frontend-dev"
  | "backend-dev"
  | "fullstack-dev"
  | "production-dev"
  | "mastery";

export interface LessonRef {
  id: string;
  title: string;
  status: LessonStatus;
  minutes: number;
  /** Honest outline for draft/planned lessons — never a fake body. */
  outline?: string[];
}

export interface Phase {
  id: string;
  n: number;
  stage: StageId;
  title: string;
  focus: string;
  status: PhaseStatus;
  lessons: LessonRef[];
}

export interface StageMeta {
  id: StageId;
  title: string;
  blurb: string;
  exitCriteria: string;
}

export interface QuizQuestion {
  q?: string;
  question?: string;
  options: string[];
  answer: number;
  explain?: string;
  explanation?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export type DemoKind =
  | "form-validation"
  | "specificity"
  | "box-model"
  | "flex-grid"
  | "token-lab"
  | "closure-lab"
  | "immutable-lab"
  | "event-loop"
  | "error-lab"
  | "optimistic-lab"
  | "perf-lab"
  | "design-system"
  | "request-trace"
  | "status-match"
  | "token-inspector"
  | "cors-sim"
  | "rest-pagination"
  | "layer-diagnostic"
  | "rsc-wire"
  | "next-cache-matrix"
  | "url-state-lab"
  | "arch-boundary-lab"
  | "nest-pipeline-lab"
  | "fastify-trap-lab"
  | "nest-guard-lab"
  | "sql-explain-lab"
  | "prisma-query-lab"
  | "n-plus-one-lab"
  | "supabase-connection-lab"
  | "supabase-auth-verify-lab"
  | "idor-rbac-lab";

export interface CodeSample {
  file: string;
  lang: "ts" | "tsx" | "js" | "bash" | "json" | "html" | "sql" | "css" | "text" | "prisma" | "markdown" | "nginx" | "yaml" | "javascript" | "dockerfile";
  code: string;
  caption?: string;
}

export interface LessonSection {
  heading: string;
  body: string[];
  code?: CodeSample[];
  /** Optional live interactive demo rendered inside the section. */
  demo?: DemoKind;
}

export interface LessonContent {
  id: string;
  phaseId: string;
  title: string;
  level: string;
  minutes: number;
  summary: string;
  prerequisites: string[];
  objectives: string[];
  simple: string;
  why: string;
  mentalModel: { title: string; body: string };
  sections: LessonSection[];
  mistake?: { title?: string; wrong: string; right: string; explain?: string; explanation?: string };
  commonMistake?: { title?: string; wrong: string; right: string; explanation?: string; explain?: string };
  tryIt?: string[];
  tryItYourself?: { title: string; instructions: string[]; expected?: string };
  exercise?: { title: string; description: string; tasks: string[] };
  challenge?: { prompt?: string; title?: string; description?: string; hints: string[]; solution: string };
  quiz: QuizQuestion[];
  flashcards?: Flashcard[];
  recap?: string[];
  references?: { label: string; url: string }[];
  nextBridge?: string;
}

export interface GlossaryTerm {
  term: string;
  def: string;
}

export interface TroubleEntry {
  id: string;
  symptom: string;
  layer: string;
  causes: string[];
  diagnose: string[];
  fix: string;
  prevent: string;
  related: string;
}

export interface VersionRow {
  tool: string;
  baseline: string;
  latest: string;
  source: string;
  notes: string;
  pinned?: boolean;
}

export interface BossBattle {
  id: string;
  afterPhase: string;
  name: string;
  desc: string;
  criteria: string[];
  status: "planned" | "implemented";
  /** Lesson id when the battle has been authored. */
  lessonId?: string;
}

export interface ReadinessGroup {
  id: string;
  title: string;
  icon: string;
  items: string[];
}

export interface StatusEntry {
  pass: string;
  date: string;
  title: string;
  scope: string[];
  decisions: string[];
  next: string;
}
