import type { LessonContent } from "./types";

export const LESSON_CONTENT_P44: Record<string, LessonContent> = {
  "p44-l1": {
    id: "p44-l1",
    phaseId: "p44",
    title: "Reading Unfamiliar Repositories",
    level: "Mastery",
    minutes: 35,
    summary:
      "Deconstruct large, unfamiliar enterprise codebases in under 30 minutes. Master the Entry-Point Strategy, trace dependency graphs, and build mental maps from `package.json` to core business models.",
    prerequisites: ["p00-l1 Development Setup"],
    objectives: [
      "Navigate unknown 100,000-line codebases systematically without feeling overwhelmed.",
      "Execute the 4-Step Cold Exploration Protocol (`package.json` -> Entry Points -> Database Schema -> Core Domain Router).",
      "Trace a user-facing feature backwards from the frontend button click down to the SQL table update.",
    ],
    simple:
      "When joining a new company, you won't be writing greenfield apps from scratch — you will be handed a massive 5-year-old codebase with 200,000 lines of code written by 30 different developers. Junior developers try to read every file alphabetically and get lost. Senior engineers execute the 'Entry-Point Strategy': inspect `package.json` scripts, examine `schema.prisma` to understand the domain nouns, locate `main.ts` or `app/layout.tsx`, and trace single features end-to-end.",
    why:
      "The ability to rapidly orient yourself in unfamiliar codebases is the #1 skill separating senior engineers from juniors.",
    mentalModel: {
      title: "Arriving in a New Foreign City",
      body:
        "You don't walk down every alleyway on day one. You look at the subway map (Architecture), find the central train station (Entry Point), locate the river and main highway (Data Flow), and navigate to your hotel (Feature Trace).",
    },
    sections: [
      {
        heading: "1. The 4-Step Cold Repository Exploration Protocol",
        body: [
          "1. **Step 1: Manifest Scan (`package.json`)**: Check dependencies (Next.js? NestJS? Prisma? Redis?) and read scripts (`dev`, `build`, `test`, `migrate`).",
          "2. **Step 2: Domain Schema (`schema.prisma` / `schema.sql`)**: Read the database models. If you understand the nouns (`User`, `Workspace`, `Order`, `Invoice`), you understand the business.",
          "3. **Step 3: Root Entry Points**: Trace `src/main.ts` (API middleware & global guards) and `app/layout.tsx` (Root React providers).",
          "4. **Step 4: The Golden Feature Trace**: Pick one simple endpoint (`POST /api/projects`) and follow it down through Controller -> Guard -> Service -> Repository -> Database.",
        ],
      },
    ],
    mistake: {
      title: "Trying to Read a Large Codebase Alphabetically from the Top Folder Down",
      wrong: [
        "// ❌ Opening folder 'a/' -> file 1 -> file 2 -> cognitive overload in 15 minutes!",
      ].join("\n"),
      right: [
        "// ✅ Follow the runtime execution path: start from routes and database schemas.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: 20-Minute Cold Repository Teardown",
      description:
        "Clone an unfamiliar open-source full-stack repo (e.g. Cal.com or Infisical), execute the 4-Step Protocol, and produce a 1-page Architecture Briefing.",
      tasks: [
        "Audit `package.json` dependencies and monorepo structure.",
        "List core domain models from database schema.",
        "Trace the user authentication flow end-to-end.",
      ],
    },
    quiz: [
      {
        question: "Why is inspecting the database schema (e.g. schema.prisma) one of the fastest ways to understand an unfamiliar codebase?",
        options: [
          "Because the database schema reveals the core business domain entities, their relationships, and the fundamental data model of the company.",
          "Because database files are always alphabetized.",
          "Because schemas contain the frontend CSS styles.",
          "To test database speeds.",
        ],
        answer: 0,
        explanation:
          "Database schemas define the core nouns and relationships of the business, providing an instant high-level domain map.",
      },
    ],
  },

  "p44-l2": {
    id: "p44-l2",
    phaseId: "p44",
    title: "Tracing Bugs Across Layers & Code Review",
    level: "Mastery",
    minutes: 40,
    summary:
      "Triage complex, multi-layer production incidents with scientific methodology. Construct cross-stack evidence chains (Browser Network -> Reverse Proxy -> API Guard -> SQL Query) and author senior code reviews.",
    prerequisites: ["p33-l1 Structured Logs", "p36-l2 Code Review Etiquette"],
    objectives: [
      "Apply the Scientific Method to debugging (Hypothesize -> Isolate -> Reproduce -> Fix -> Test).",
      "Trace a distributed bug across browser network headers, reverse proxy logs, NestJS interceptors, and PostgreSQL query logs.",
      "Conduct senior-level code reviews focusing on architecture boundaries, security, and edge-case invariants.",
    ],
    simple:
      "When a user reports 'The export button randomly fails with 500 error on Thursdays', junior engineers guess randomly and change arbitrary lines of code. Senior engineers form hypotheses and follow the Evidence Chain: find the `x-request-id` in the browser console, search the central JSON logs for that trace ID, inspect the exact SQL error, and reproduce the bug with a single deterministic unit test before writing the 1-line fix.",
    why:
      "Disciplined cross-layer debugging solves complex production issues in minutes rather than days.",
    mentalModel: {
      title: "The Crime Scene Detective",
      body:
        "A detective doesn't arrest a random passerby on the street. They collect fingerprints (Request IDs), examine camera footage (Structured Logs), analyze DNA evidence (Stack Traces), and prove the case with airtight logic.",
    },
    sections: [
      {
        heading: "1. The Cross-Stack Evidence Chain Protocol",
        body: [
          "1. **Client**: Capture HTTP status code, request payload, and `x-request-id` response header.",
          "2. **Gateway**: Check Nginx / Cloudflare edge logs for 502/504 gateway timeouts.",
          "3. **Application**: Query Datadog/Sentry for error logs matching `traceId`.",
          "4. **Database**: Check PostgreSQL slow query logs for deadlocks or lock contention.",
          "5. **Isolation**: Write a failing unit test reproducing the exact input conditions.",
        ],
      },
    ],
    mistake: {
      title: "Changing Code in Production and Deploying to 'See If It Fixes the Bug'",
      wrong: [
        "// ❌ 'Shotgun Debugging': randomly changing variables and redeploying without reproducing the root cause locally.",
      ].join("\n"),
      right: [
        "// ✅ Always write a failing reproduction test locally first; verify the test turns green with your fix.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Triage a Distributed Multi-Layer Incident",
      description:
        "Given a scenario with simulated browser error, Nginx timeout, and PostgreSQL lock log, trace the root cause, write a reproduction test, and implement the fix.",
      tasks: [
        "Correlate request ID across simulated log files.",
        "Identify database deadlock root cause.",
        "Write unit test preventing future regression.",
      ],
    },
    quiz: [
      {
        question: "What is the very first step a senior engineer takes when investigating a non-obvious production error report?",
        options: [
          "Gather objective evidence (Request IDs, input payloads, exact error stack traces, and environment logs) to reliably reproduce the failure in an isolated test.",
          "Immediately rewrite the entire backend service in Rust.",
          "Delete the database and restore from backup.",
          "Blame the customer.",
        ],
        answer: 0,
        explanation:
          "Systematic debugging requires gathering evidence and establishing reliable reproduction before making code changes.",
      },
    ],
  },

  "p44-l3": {
    id: "p44-l3",
    phaseId: "p44",
    title: "Architecture, SQL & Security Reviews",
    level: "Mastery",
    minutes: 40,
    summary:
      "Perform professional technical audits. Conduct rigorous Architecture Audits, SQL Query Plan reviews (`EXPLAIN ANALYZE`), and OWASP Top 10 Security Penetration assessments.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p18-l1 RBAC", "p40-l1 Architecture"],
    objectives: [
      "Audit relational schemas for missing foreign key indexes, bloated columns, and N+1 query patterns.",
      "Execute comprehensive OWASP Top 10 security audits (IDOR, Injection, Broken Auth, SSRF, Rate Limiting).",
      "Produce formal Technical Audit Reports with prioritized remediation matrices (P0 Critical to P3 Polish).",
    ],
    simple:
      "A Senior / Staff Engineer is frequently asked to review other teams' designs before launch. In this lesson, we practice conducting formal 360-degree technical audits: inspecting SQL query plans for missing indexes, auditing API controllers for IDOR security bypasses, and checking system architecture for single points of failure.",
    why:
      "Conducting rigorous technical audits ensures organizational engineering quality and prevents catastrophic security breaches.",
    mentalModel: {
      title: "The Building Safety Inspector",
      body:
        "The city building inspector walks through the newly constructed building with a clipboard: checking fire sprinklers, testing electrical grounding, measuring emergency exits, and testing elevator emergency brakes.",
    },
    sections: [
      {
        heading: "1. The 3-Pillar Technical Audit Checklist",
        body: [
          "- **Security Audit**: IDOR scoping on all queries, CSRF/CORS origins, input validation (Zod), secret exposure in client bundles, rate limits on public endpoints.",
          "- **SQL & Data Audit**: Foreign keys indexed, connection pooling configured, pagination cursor-based, zero N+1 queries in loops, atomic transactions on mutations.",
          "- **Architecture Audit**: Monorepo dependency boundaries respected, zero circular dependencies, provider abstractions for third-party vendors, structured logging with correlation IDs.",
        ],
      },
    ],
    mistake: {
      title: "Focusing Code Reviews Entirely on Formatting and Nitpicks While Missing Critical Security/Performance Flaws",
      wrong: [
        "// ❌ Writing 15 comments about spacing and single quotes while missing a massive SQL injection or missing workspace tenancy check!",
      ].join("\n"),
      right: [
        "// ✅ Let Prettier/ESLint handle formatting automatically; focus human review on architecture, security invariants, and performance bottlenecks.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Conduct a 360-Degree Technical Audit on a Vulnerable Codebase",
      description:
        "Audit a provided sample repository containing 5 intentional flaws (1 IDOR vulnerability, 1 N+1 query, 1 missing index, 1 race condition, 1 unhandled promise), and write the Audit Report.",
      tasks: [
        "Identify all 5 architectural/security defects.",
        "Assign severity rankings (P0 to P2).",
        "Author `TECHNICAL_AUDIT_REPORT.md` with code remediations.",
      ],
    },
    quiz: [
      {
        question: "Why should automated tools (ESLint, Prettier, TypeScript) handle syntax and formatting so human reviewers can focus on architecture and security?",
        options: [
          "Because human attention is high-value and should be dedicated to verifying business logic invariants, security boundaries, concurrency safety, and query performance rather than policing style rules.",
          "Because computers cannot read SQL.",
          "To eliminate code review entirely.",
          "Because linters do not work in Node.js.",
        ],
        answer: 0,
        explanation:
          "Automating mechanical style checks frees human reviewers to focus on critical architectural, security, and performance risks.",
      },
    ],
  },
};
