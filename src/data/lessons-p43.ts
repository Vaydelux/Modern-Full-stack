import type { LessonContent } from "./types";

export const LESSON_CONTENT_P43: Record<string, LessonContent> = {
  "p43-m1": {
    id: "p43-m1",
    phaseId: "p43",
    title: "Milestone: Requirements & Architecture Proposal",
    level: "Mastery",
    minutes: 90,
    summary:
      "Choose and scope your independent domain (e.g. Real-Time Healthcare Clinic Dispatch, B2B Procurement, LMS, or Booking Engine). Author a rigorous Technical Architecture Proposal.",
    prerequisites: ["p40-l1 Pragmatic Modularity", "p41-m1", "p42-m1"],
    objectives: [
      "Select a non-trivial domain with multi-user workflows, transactional invariants, and background jobs.",
      "Draft a structured Technical Architecture Proposal (Scope, User Personas, Core Invariants, Non-Functional Requirements).",
      "Defend architecture tradeoffs (database selection, state machine transitions, caching boundaries).",
    ],
    simple:
      "In Capstone 3, you are the Lead Architect. You select a real-world business domain of your choice and write a formal Technical Architecture Proposal. You define user roles, core business rules, transactional boundaries, and SLA availability targets before writing a single line of application code.",
    why:
      "Planning architecture before coding prevents 80% of project restarts and design dead-ends.",
    mentalModel: {
      title: "The Blueprint Before the Skyscraper",
      body:
        "Structural civil engineers never pour concrete foundations or weld steel girders without stamped architectural blueprints, soil test surveys, and load distribution calculations.",
    },
    sections: [
      {
        heading: "1. Technical Architecture Proposal Outline",
        body: [
          "1. **Executive Summary & Domain Problem**: What high-value problem does this solve?",
          "2. **User Personas & Role Matrix**: Customer, Admin, Dispatcher, Operator.",
          "3. **Core Business Invariants**: Non-negotiable rules (e.g. double-booking impossible).",
          "4. **Technology Stack Selection**: Next.js, NestJS, PostgreSQL, Prisma, BullMQ, Redis, Supabase.",
          "5. **Infrastructure & Deployment Topology**: Compute, database pooler, object storage, CDN.",
        ],
      },
    ],
    mistake: {
      title: "Choosing a Trivial 'To-Do List' or 'Blog' for Your Independent Capstone",
      wrong: [
        "// ❌ Building another generic CRUD blog with 2 tables.",
      ].join("\n"),
      right: [
        "// ✅ Choose a rich domain with complex transactions, state transitions, background jobs, and multi-tenancy (e.g. Fleet Logistics, Medical Scheduling, Hotel Booking).",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author and Submit Technical Architecture Proposal",
      description:
        "Draft `docs/PROPOSAL.md` defining your chosen domain, user journeys, core invariants, and system architecture for peer review.",
      tasks: [
        "Select independent domain.",
        "Author `PROPOSAL.md` with 5 core sections.",
        "Review and defend against scope constraints.",
      ],
    },
    quiz: [
      {
        question: "What is the primary objective of authoring a Technical Architecture Proposal before starting implementation?",
        options: [
          "To clarify requirements, establish business invariants, identify technical risks early, and align the team on architecture boundaries before investing coding effort.",
          "To satisfy bureaucratic managers.",
          "To automatically generate CSS files.",
          "To format code.",
        ],
        answer: 0,
        explanation:
          "Architecture proposals clarify requirements and mitigate system risks before costly implementation begins.",
      },
    ],
  },

  "p43-m2": {
    id: "p43-m2",
    phaseId: "p43",
    title: "Milestone: ERD, Contracts & Permissions Design",
    level: "Mastery",
    minutes: 90,
    summary:
      "Design the complete Entity-Relationship Diagram (ERD), TypeScript API contracts, and fine-grained Role-Based Access Control (RBAC) permission matrices for your capstone domain.",
    prerequisites: ["p43-m1 Architecture Proposal"],
    objectives: [
      "Author normalized PostgreSQL schema in Prisma with indexes, foreign keys, and cascade rules.",
      "Design shared type-safe API contract packages (`packages/contracts`) using Zod schemas.",
      "Construct a comprehensive RBAC permission matrix for all domain resources and actions.",
    ],
    simple:
      "Now we turn the architectural blueprint into concrete schemas and contracts. We define the database tables with proper indexes and foreign keys, write the Zod validation schemas shared between frontend and backend, and map out every user role's permissions across every API route.",
    why:
      "Type-safe shared contracts eliminate API drift and client-server type mismatches completely.",
    mentalModel: {
      title: "The Industrial Metric Screw Thread Standard",
      body:
        "Because M6 screw threads have an exact standardized diameter and pitch, any M6 nut manufactured anywhere in the world fits onto any M6 bolt perfectly on the first try.",
    },
    sections: [
      {
        heading: "1. The Contract-First Domain Design Flow",
        body: [
          "1. Author `schema.prisma` with relational constraints.",
          "2. Define Zod input schemas and response DTOs in `packages/contracts`.",
          "3. Author Permission Matrix table mapping `Role x Resource x Action`.",
        ],
      },
    ],
    mistake: {
      title: "Writing Frontend Forms and Backend Controllers with Different Ad-Hoc Validation Rules",
      wrong: [
        "// ❌ Frontend validates max length 50; Backend validates max length 30: results in confusing user errors!",
      ].join("\n"),
      right: [
        "// ✅ Share the exact same Zod validation schema from `packages/contracts` across both frontend and backend.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author ERD and Shared Contracts Package",
      description:
        "Draft `schema.prisma` for your independent capstone, export Zod schemas in `packages/contracts`, and generate an automated ERD visual diagram.",
      tasks: [
        "Write complete Prisma schema with 6+ relational models.",
        "Define Zod validation schemas in shared contracts.",
        "Author RBAC permission matrix markdown table.",
      ],
    },
    quiz: [
      {
        question: "Why is sharing Zod validation schemas between frontend and backend in a monorepo contracts package advantageous?",
        options: [
          "It provides a single source of truth for validation rules, eliminating schema drift and ensuring identical error feedback on both client and server.",
          "It makes databases unnecessary.",
          "It converts TypeScript to Python.",
          "It reduces network bandwidth by 99%.",
        ],
        answer: 0,
        explanation:
          "Shared schemas eliminate duplication and guarantee that client-side forms and server-side validation never get out of sync.",
      },
    ],
  },

  "p43-m3": {
    id: "p43-m3",
    phaseId: "p43",
    title: "Milestone: Implementation Sprints",
    level: "Mastery",
    minutes: 240,
    summary:
      "Execute the complete full-stack implementation sprints: build the Next.js frontend, NestJS backend, background worker queues, transactional services, and automated test harnesses.",
    prerequisites: ["p43-m2 ERD & Contracts"],
    objectives: [
      "Implement core business domain services with ACID transactions and state machines.",
      "Build high-polish Next.js App Router UI with responsive design, optimistic updates, and keyboard navigation.",
      "Orchestrate background jobs (emails, exports, cron digests) with BullMQ.",
    ],
    simple:
      "The main construction sprint: building the application end-to-end. You implement the database repositories, backend NestJS controllers, frontend Next.js pages with Server Components and TanStack Query, background queue workers, and automated test suites.",
    why:
      "Translating architectural designs into clean, production-grade code is the core skill of a Senior Full-Stack Engineer.",
    mentalModel: {
      title: "Building the Custom Home",
      body:
        "Framing the walls (Database & APIs), plumbing and electrical (Workers & Queues), drywall and paint (React UI), and final interior fixtures (Animations & Polish).",
    },
    sections: [
      {
        heading: "1. Vertical Slice Sprint Methodology",
        body: [
          "- **Sprint 1**: Auth, Layout, Tenancy & Profile settings.",
          "- **Sprint 2**: Primary Domain CRUD, State Transitions & Pessimistic Locks.",
          "- **Sprint 3**: Search, Filter, Cursor Pagination & Dashboard Analytics.",
          "- **Sprint 4**: Background Workers, File Uploads, Notifications & Exports.",
        ],
      },
    ],
    mistake: {
      title: "Building 100% of Backend Before Writing Any Frontend (Horizontal Waterfall Trap)",
      wrong: [
        "// ❌ Spending 3 weeks writing 50 backend endpoints without ever testing them against a real UI:",
        "// You discover major API ergonomics flaws only at the very end when refactoring is expensive!",
      ].join("\n"),
      right: [
        "// ✅ Build Vertical Slices: deliver one complete feature (DB -> API -> UI) end-to-end before starting the next.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Complete Full-Stack Implementation Sprints",
      description:
        "Execute Sprints 1 through 4, implementing all primary user journeys, background queues, and responsive UI views.",
      tasks: [
        "Implement backend services and controllers.",
        "Build frontend views with optimistic mutations.",
        "Verify background worker processes jobs successfully.",
      ],
    },
    quiz: [
      {
        question: "Why is 'Vertical Slice' development superior to 'Horizontal Layer' development for software teams?",
        options: [
          "It delivers functional, testable user value early and validates database-to-UI contract ergonomics with immediate real feedback.",
          "It deletes unused CSS.",
          "It allows skipping unit tests.",
          "It runs without a web server.",
        ],
        answer: 0,
        explanation:
          "Vertical slices validate end-to-end integration and provide working user features early in the development lifecycle.",
      },
    ],
  },

  "p43-m4": {
    id: "p43-m4",
    phaseId: "p43",
    title: "Milestone: Review, Hints & Reference Architecture",
    level: "Mastery",
    minutes: 60,
    summary:
      "Perform comprehensive Security & Performance audits on your independent capstone, deploy to live production, and benchmark against the Enterprise Reference Architecture.",
    prerequisites: ["p43-m3 Implementation Sprints", "p41-m6 Scorecard"],
    objectives: [
      "Execute automated security audits (IDOR, SQL injection, CSP, rate limits, secret leaks).",
      "Deploy full stack to production cloud with monitoring, automated backups, and custom domains.",
      "Compare your implementation against the official Enterprise Reference Architecture.",
    ],
    simple:
      "The final milestone of your independent capstone: auditing your code for security and performance, configuring production deployment pipelines, verifying synthetic smoke tests on the live production URL, and comparing your implementation with industry-standard reference architectures.",
    why:
      "Completing and defending an independent, production-deployed full-stack application marks your transformation into an elite Full-Stack Engineer.",
    mentalModel: {
      title: "The Professional Flight Simulator Certification",
      body:
        "After flying guided simulation routes with an instructor, the pilot flies a complete cross-country solo flight through severe weather and lands safely at the destination.",
    },
    sections: [
      {
        heading: "1. Reference Architecture Comparison Matrix",
        body: [
          "- **Tenancy**: Did you enforce composite `where: { id, workspaceId }` on all queries?",
          "- **Transactions**: Are financial or inventory state changes wrapped in `$transaction`?",
          "- **Resilience**: Are background workers equipped with exponential retries and dead-letter queues?",
          "- **Observability**: Are JSON logs tagged with Correlation IDs and Sentry release versions?",
        ],
      },
    ],
    mistake: {
      title: "Skipping Final Security Penetration Testing Before Declaring Project Complete",
      wrong: [
        "// ❌ Assuming your app is secure without attempting real IDOR attacks.",
      ].join("\n"),
      right: [
        "// ✅ Run automated penetration test scripts against all endpoints using unprivileged authorization tokens.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Final Independent Capstone Defense and Graduation",
      description:
        "Audit the deployed independent capstone against all 100 points of the Production Readiness Scorecard and author the comprehensive Graduation Portfolio Memo.",
      tasks: [
        "Complete security and performance audit.",
        "Verify production deployment and smoke tests pass.",
        "Produce signed `INDEPENDENT_CAPSTONE_DEFENSE.md`.",
      ],
    },
    quiz: [
      {
        question: "What is the ultimate measure of a production-ready full-stack software application?",
        options: [
          "It delivers genuine user value reliably, securely, performantly, and maintainably under real-world conditions with automated testing, monitoring, and operational discipline.",
          "It has 1,000 npm packages installed.",
          "It has the longest codebase.",
          "It uses dark mode exclusively.",
        ],
        answer: 0,
        explanation:
          "True software craftsmanship is measured by reliability, security, maintainability, and real-world user value.",
      },
    ],
  },
};
