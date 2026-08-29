import type { LessonContent } from "./types";

export const LESSON_CONTENT_P40B: Record<string, LessonContent> = {
  "p40-l4": {
    id: "p40-l4",
    phaseId: "p40",
    title: "Replaceable Infrastructure & Provider Abstractions",
    level: "Mastery",
    minutes: 35,
    summary:
      "Implement the Ports and Adapters (Hexagonal) pattern for infrastructure dependencies (Email: Resend vs Postmark, Storage: S3 vs Supabase vs Local).",
    prerequisites: ["p40-l1 Pragmatic Modularity"],
    objectives: [
      "Define Port interfaces separating business domain logic from third-party vendor SDKs.",
      "Build interchangeable Adapters (e.g. `ResendEmailAdapter`, `LocalConsoleEmailAdapter`).",
      "Pass the 'Swap Test': swap an infrastructure provider with a 1-line configuration change without altering business code.",
    ],
    simple:
      "If your application uses Resend to send emails and suddenly Resend increases prices by 500%, you shouldn't have to rewrite 40 files across your codebase. By wrapping email sending in an interface (`IEmailService`), your business logic calls `emailService.send()`. Swapping from Resend to Postmark takes 5 minutes by simply creating a new adapter class.",
    why:
      "Provider abstractions protect your software from third-party vendor lock-in and enable seamless offline unit testing.",
    mentalModel: {
      title: "The Universal Power Adapter",
      body:
        "Your laptop charger has a standard USB-C port. When you travel to the UK or Japan, you don't buy a brand-new laptop — you just snap a $5 UK wall plug adapter onto the end of your standard charging cord.",
    },
    sections: [
      {
        heading: "1. The Email Port and Adapter Pattern",
        body: [
          "- **Port (Interface)**: `IEmailService` contract.",
          "- **Production Adapter**: `ResendEmailService` utilizing `@resend/node`.",
          "- **Development Adapter**: `ConsoleEmailService` that simply logs emails to terminal without spending API credits.",
        ],
        code: [
          {
            file: "src/notifications/email.adapter.ts",
            lang: "ts",
            code: [
              "export interface SendEmailOptions {",
              "  to: string;",
              "  subject: string;",
              "  html: string;",
              "}",
              "",
              "export interface IEmailService {",
              "  sendEmail(options: SendEmailOptions): Promise<{ messageId: string }>;",
              "}",
              "",
              "// Development Mock Adapter",
              "export class ConsoleEmailAdapter implements IEmailService {",
              "  async sendEmail(opts: SendEmailOptions) {",
              "    console.log(`[DEV EMAIL to ${opts.to}]: ${opts.subject}`);",
              "    return { messageId: `mock-${Date.now()}` };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Interchangeable email provider interface and development mock adapter.",
          },
        ],
      },
    ],
    mistake: {
      title: "Importing Third-Party Vendor SDKs Directly Deep Inside Domain Entities",
      wrong: [
        "// ❌ Importing Resend directly inside User.ts domain class:",
        "import { Resend } from 'resend';\nconst resend = new Resend();\n// Couples business entities directly to external network SDKs!",
      ].join("\n"),
      right: [
        "// ✅ Inject provider interfaces through class constructors or NestJS dependency injection.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Implement the Swap Test for File Storage",
      description:
        "Define an `IStorageService` port with `upload()` and `getUrl()`, implement `LocalStorageAdapter` for local disk and `S3StorageAdapter`, and swap them via environment variable.",
      tasks: [
        "Create `IStorageService` interface.",
        "Implement `LocalStorageAdapter` and `S3StorageAdapter`.",
        "Verify switching `STORAGE_DRIVER=local` to `STORAGE_DRIVER=s3` requires zero business code changes.",
      ],
    },
    quiz: [
      {
        question: "What is the primary benefit of the Ports and Adapters (Hexagonal Architecture) pattern?",
        options: [
          "It isolates core business logic from external infrastructure dependencies, making the system testable without real external services and easy to swap vendors.",
          "It automatically compiles TypeScript to C++.",
          "It reduces database disk storage.",
          "It makes CSS animations run faster.",
        ],
        answer: 0,
        explanation:
          "Ports and adapters decouple business rules from external technology implementations, maximizing testability and vendor flexibility.",
      },
    ],
  },

  "p40-l5": {
    id: "p40-l5",
    phaseId: "p40",
    title: "ADRs & API-First Thinking",
    level: "Mastery",
    minutes: 30,
    summary:
      "Document architectural decisions using Architecture Decision Records (ADRs). Adopt API-First contract design with OpenAPI / TypeSpec before writing implementation code.",
    prerequisites: ["p40-l1 Pragmatic Modularity"],
    objectives: [
      "Author structured Architecture Decision Records (Status, Context, Decision, Consequences).",
      "Store versioned ADRs in Git under `docs/adr/` for team institutional memory.",
      "Design TypeScript API contract interfaces before writing backend database logic.",
    ],
    simple:
      "Six months from now, when someone asks: 'Why did we choose PostgreSQL over MongoDB for this project?', nobody will remember the Slack conversation. An Architecture Decision Record (ADR) is a simple 1-page markdown document explaining the Context, the Decision, and the Tradeoffs. It prevents teams from endlessly debating the same decisions over and over.",
    why:
      "ADRs preserve institutional engineering knowledge and onboard new engineers 10x faster.",
    mentalModel: {
      title: "The Supreme Court Written Opinion",
      body:
        "When the Supreme Court makes a major ruling, they don't just announce the verdict. They publish a detailed written opinion documenting the legal arguments, precedents, and rationale so future judges understand the exact reasoning.",
    },
    sections: [
      {
        heading: "1. The Standard ADR Format (MADR)",
        body: [
          "- **Title**: `0003-use-prisma-over-typeorm.md`",
          "- **Status**: Proposed | Accepted | Deprecated | Superseded",
          "- **Context**: What problem are we solving?",
          "- **Decision**: What did we choose?",
          "- **Consequences**: What are the positive and negative tradeoffs?",
        ],
        code: [
          {
            file: "docs/adr/0004-use-bullmq-for-async-jobs.md",
            lang: "markdown",
            code: [
              "# 4. Use BullMQ with Redis for Background Job Processing",
              "",
              "## Status: Accepted",
              "",
              "## Context",
              "We need to send email notifications and generate PDF reports without blocking HTTP request threads.",
              "",
              "## Decision",
              "We will use BullMQ with an Upstash Redis cluster for background queuing.",
              "",
              "## Consequences",
              "### Positive",
              "- Built-in automatic exponential retries and backoff.",
              "- Queue monitoring UI via Bull-Board.",
              "### Negative",
              "- Requires maintaining a Redis infrastructure instance.",
            ].join("\n"),
            caption: "Standard Architectural Decision Record (ADR) format.",
          },
        ],
      },
    ],
    mistake: {
      title: "Making Major Architectural Changes Based on Casual Slack Conversations Without Documentation",
      wrong: [
        "// ❌ 'Hey should we rewrite the auth in GraphQL?' -> 'Sure sounds cool' -> 3 months later nobody knows why it was done.",
      ].join("\n"),
      right: [
        "// ✅ Propose an ADR PR; discuss trade-offs openly and merge the record into Git.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author 3 Production ADRs for TaskForge",
      description:
        "Draft three ADRs for the TaskForge capstone: 1) Monorepo vs Polyrepo, 2) Prisma vs Raw SQL, 3) Supabase Auth vs Custom JWT.",
      tasks: [
        "Create `docs/adr/` folder.",
        "Write 3 markdown decision records with Context and Consequences.",
        "Peer-review decision tradeoffs.",
      ],
    },
    quiz: [
      {
        question: "What is the primary objective of keeping Architecture Decision Records (ADRs) in the Git repository?",
        options: [
          "To preserve the historical context, reasoning, and accepted tradeoffs behind major technical choices for current and future team members.",
          "To satisfy legal tax audits.",
          "To automatically generate CSS files.",
          "To encrypt source code.",
        ],
        answer: 0,
        explanation:
          "ADRs document why technical decisions were made, preventing repetitive debates and keeping architectural rationale transparent.",
      },
    ],
  },

  "p40-l6": {
    id: "p40-l6",
    phaseId: "p40",
    title: "Monolith vs Microservices: The Honest Math",
    level: "Mastery",
    minutes: 35,
    summary:
      "Evaluate the operational and organizational costs of Microservices vs Modular Monoliths. Understand Conway's Law, distributed tracing overhead, and when microservices are justified.",
    prerequisites: ["p40-l1 Pragmatic Modularity", "p35-l1 Monorepo Architecture"],
    objectives: [
      "Calculate the operational tax of microservices (network latencies, distributed transactions, 10x CI pipelines).",
      "Design a clean 'Modular Monolith' with strict internal domain boundaries.",
      "Identify the 2 valid triggers for microservices: Independent team scaling (>100 engineers) and distinct hardware requirements (e.g. GPU AI inference).",
    ],
    simple:
      "A startup with 5 engineers splitting their app into 25 microservices spends 80% of their time debugging Docker networking, gRPC serialization, distributed tracing, and out-of-sync APIs rather than building product features. A well-structured Modular Monolith gives you 99% of the speed and simplicity with 1/10th the operational headache.",
    why:
      "Premature microservices architecture is one of the most common causes of startup engineering paralysis.",
    mentalModel: {
      title: "The House vs The Suburban Village",
      body:
        "A Modular Monolith is a house with distinct rooms (Kitchen, Bedroom, Office) under one roof. Microservices is 10 tiny sheds scattered across a 50-acre forest, where getting a glass of water requires putting on a coat, walking outside in the snow, and unlocking three security gates.",
    },
    sections: [
      {
        heading: "1. Monolith vs Microservices Tradeoff Matrix",
        body: [
          "- **Deployment**: Monolith deploys in 1 click; Microservices requires Kubernetes, service meshes, and distributed canary orchestrators.",
          "- **Transactions**: Monolith uses atomic SQL `$transaction`; Microservices requires complex Sagas and two-phase commits.",
          "- **Refactoring**: Monolith allows instant IDE renaming across domains; Microservices requires versioned HTTP deprecation cycles.",
        ],
      },
    ],
    mistake: {
      title: "Adopting Microservices to Fix 'Messy Code' in a Monolith",
      wrong: [
        "// ❌ Thinking: 'Our codebase is messy, so let's break it into 15 microservices!':",
        "// You end up with a 'Distributed Spaghetti Monolith' that is 100x harder to fix and debug!",
      ].join("\n"),
      right: [
        "// ✅ Clean up module boundaries inside the monolith first. If code cannot be clean in a single repo, it will be disastrous in 15 repos.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Design a Modular Monolith with Internal Boundaries",
      description:
        "Organize a NestJS application into isolated domain modules (`users`, `billing`, `projects`) communicating strictly via exported public services.",
      tasks: [
        "Enforce zero circular dependencies with `madge`.",
        "Expose public interfaces for inter-module calls.",
        "Document boundaries in architecture diagram.",
      ],
    },
    quiz: [
      {
        question: "When is breaking a monolithic application into separate microservices genuinely justified?",
        options: [
          "When different functional components require radically different hardware (e.g. GPU machine learning vs standard HTTP API) or when large independent teams (>50-100 engineers) need autonomous deployment cycles.",
          "When a codebase reaches 500 lines of code.",
          "To avoid writing SQL queries.",
          "Because microservices are always faster than monoliths.",
        ],
        answer: 0,
        explanation:
          "Microservices solve organizational scaling and specialized hardware constraints at the cost of high distributed systems complexity.",
      },
    ],
  },

  "p40-l7": {
    id: "p40-l7",
    phaseId: "p40",
    title: "Refactoring & Avoiding Speculative Abstraction",
    level: "Mastery",
    minutes: 35,
    summary:
      "Apply the Strangler Fig Pattern for legacy system migration. Embrace YAGNI (You Aren't Gonna Need It) and master safe code refactoring under comprehensive test harnesses.",
    prerequisites: ["p31-l1 Testing Fundamentals", "p40-l1 Pragmatic Modularity"],
    objectives: [
      "Execute the Strangler Fig Pattern to replace legacy code incrementally with zero downtime.",
      "Detect and eliminate Speculative Generality and premature abstractions.",
      "Refactor complex code with confidence using characterization tests (Golden Master testing).",
    ],
    simple:
      "Never attempt a 'Big Bang Rewrite' (stopping all feature work for 6 months to rewrite the app from scratch) — 90% of big bang rewrites fail and get canceled. The Strangler Fig pattern places a proxy in front of the old system and routes traffic one endpoint at a time to the new codebase until the old system can simply be turned off.",
    why:
      "Incremental refactoring delivers continuous value without risking catastrophic rewrite project failures.",
    mentalModel: {
      title: "The Strangler Fig Tree",
      body:
        "In the rainforest, a strangler fig seed germinates in the upper canopy of a host tree. It gradually grows roots down around the trunk, eventually becoming a self-supporting tree while the original host tree peacefully decays inside.",
    },
    sections: [
      {
        heading: "1. The Strangler Fig Routing Pattern",
        body: [
          "- Route `/api/v2/auth/*` -> New NestJS Service.",
          "- Route `/*` (all other routes) -> Legacy Express Backend.",
          "- As new modules are validated in production, update proxy rules until legacy backend reaches 0% traffic.",
        ],
        code: [
          {
            file: "nginx.conf",
            lang: "nginx",
            code: [
              "# Strangler reverse proxy routing",
              "location /api/v2/projects {",
              "    proxy_pass http://new-nest-service:3000;",
              "}",
              "",
              "location / {",
              "    proxy_pass http://legacy-express-backend:8080;",
              "}",
            ].join("\n"),
            caption: "Strangler Fig routing rules in reverse proxy.",
          },
        ],
      },
    ],
    mistake: {
      title: "Building Generic Frameworks for Hypothetical Future Features (Violating YAGNI)",
      wrong: [
        "// ❌ Writing a generic multi-tenant plugin rule engine for a simple 1-tier to-do app:",
        "// Burns weeks of engineering time on code that will never be used!",
      ].join("\n"),
      right: [
        "// ✅ Write the simplest concrete implementation that solves today's verified problem. Refactor when real requirements demand it.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Refactor a Legacy Route Using Strangler Pattern",
      description:
        "Write characterization unit tests capturing legacy endpoint behavior, implement the modern replacement, and proxy traffic conditionally.",
      tasks: [
        "Write snapshot characterization tests.",
        "Implement modern replacement service.",
        "Verify identical output parity across all edge cases.",
      ],
    },
    quiz: [
      {
        question: "What is the primary advantage of the Strangler Fig pattern over a 'Big Bang Rewrite' when modernizing legacy software?",
        options: [
          "It delivers incremental value and reduces business risk by migrating small slices of functionality into production continuously rather than waiting months for a high-risk all-at-once cutover.",
          "It deletes all legacy database data.",
          "It eliminates the need for testing.",
          "It automatically writes TypeScript types.",
        ],
        answer: 0,
        explanation:
          "The Strangler Fig pattern enables gradual, low-risk, continuous replacement of legacy systems without disrupting live operations.",
      },
    ],
  },
};
