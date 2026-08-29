# COURSE_MANIFEST.md

> Curriculum inventory for **Modern Full-Stack Web Development — Zero to Mastery**.
> The manifest is the source of truth for *what exists and in what state*.
> Sidebar presence never equals completion. Statuses: `planned` · `draft` · `implemented` · `review-needed` · `verified` · `deprecated` · `superseded`.

**Authoritative architecture:** Browser → React/Next.js (presentation) → NestJS REST API on Fastify (authority) → Prisma ORM `7.9.15` → Supabase PostgreSQL. Supabase Auth owns identity; NestJS verifies tokens and owns authorization, business rules, transactions, and audit. Prisma is backend/worker-only and never enters browser bundles.

---

## Phases (P00–P44)

| ID | Stage | Phase | Lessons (impl/draft/planned) | Status |
|----|-------|-------|------------------------------|--------|
| P00 | Foundation | Orientation, Web Foundations & Tooling | 5 / 0 / 0 | **implemented** |
| P01 | Foundation | HTML, CSS, Accessibility & Design | 5 / 0 / 0 | **implemented** |
| P02 | Foundation | Modern JavaScript — Zero to Solid | 6 / 0 / 0 | **implemented** |
| P03 | Foundation | TypeScript for the Full Stack | 6 / 0 / 0 | **implemented** |
| P04 | React Developer | React Foundations | 7 / 0 / 0 | **implemented** |
| P05 | React Developer | React Hooks Mastery | 8 / 0 / 0 (incl. Hooks Boss Battle) | **implemented** |
| P06 | React Developer | Advanced React Engineering | 6 / 0 / 0 | **implemented** |
| P07 | Frontend Developer | HTTP, REST & API Mental Models | 6 / 0 / 0 | **implemented** |
| P08 | Frontend Developer | Next.js Foundations | 6 / 0 / 0 | **implemented** |
| P09 | Frontend Developer | Next.js Professional Frontend Architecture | 6 / 0 / 0 | **implemented** |
| P10 | Backend Developer | NestJS from Zero | 5 / 0 / 0 | **implemented** |
| P11 | Backend Developer | Fastify with NestJS | 5 / 0 / 0 | **implemented** |
| P12 | Backend Developer | NestJS Professional Architecture | 6 / 0 / 0 | **implemented** |
| P13 | Backend Developer | PostgreSQL Zero to Mastery | 6 / 0 / 0 | **implemented** |
| P14 | Backend Developer | Prisma ORM 7.9.15 Foundations | 6 / 0 / 0 | **implemented** |
| P15 | Backend Developer | Prisma 7.9.15 Professional Engineering | 0 / 0 / 7 | planned |
| P16 | Backend Developer | Supabase Platform + Database Integration | 0 / 0 / 6 | planned |
| P17 | Backend Developer | Supabase Auth + Next.js + NestJS | 0 / 0 / 6 | planned |
| P18 | Backend Developer | Authorization, RBAC & Resource Security | 0 / 0 / 6 | planned |
| P19 | Full-Stack Developer | Frontend API Client & TanStack Query | 0 / 0 / 6 | planned |
| P20 | Full-Stack Developer | Forms & End-to-End Validation | 0 / 0 / 6 | planned |
| P21 | Full-Stack Developer | Complete CRUD Vertical Slice | 0 / 0 / 6 | planned |
| P22 | Full-Stack Developer | Production Data Access, Search & Pagination | 0 / 0 / 6 | planned |
| P23 | Full-Stack Developer | File Uploads & Supabase Storage | 0 / 0 / 6 | planned |
| P24 | Full-Stack Developer | Realtime (Where It Earns Its Place) | 0 / 0 / 5 | planned |
| P25 | Production Developer | Background Jobs, Redis & BullMQ | 0 / 0 / 6 | planned |
| P26 | Production Developer | Email & Notifications | 0 / 0 / 6 | planned |
| P27 | Production Developer | Caching Mastery | 0 / 0 / 6 | planned |
| P28 | Production Developer | Rate Limiting & Abuse Prevention | 0 / 0 / 5 | planned |
| P29 | Production Developer | API Design, OpenAPI, Webhooks & Integrations | 0 / 0 / 6 | planned |
| P30 | Production Developer | Security Engineering | 0 / 0 / 6 | planned |
| P31 | Production Developer | Testing — Zero to Professional | 0 / 0 / 7 | planned |
| P32 | Production Developer | Performance Engineering | 0 / 0 / 7 | planned |
| P33 | Production Developer | Logging, Monitoring & Observability | 0 / 0 / 6 | planned |
| P34 | Production Developer | Docker & Local Infrastructure | 0 / 0 / 5 | planned |
| P35 | Production Developer | Monorepo & Workspace Architecture | 0 / 0 / 6 | planned |
| P36 | Production Developer | Git & Professional Team Workflow | 0 / 0 / 6 | planned |
| P37 | Production Developer | CI/CD with GitHub Actions | 0 / 0 / 6 | planned |
| P38 | Mastery | Development to Production | 0 / 0 / 6 | planned |
| P39 | Mastery | Scaling, Reliability & Availability | 0 / 0 / 6 | planned |
| P40 | Mastery | Software Architecture Mastery | 0 / 0 / 7 | planned |
| P41 | Mastery | Capstone 1 — TaskForge | 0 / 0 / 6 milestones | planned |
| P42 | Mastery | Capstone 2 — Inventory & Order Management | 0 / 0 / 5 milestones | planned |
| P43 | Mastery | Independent Capstone | 0 / 0 / 4 milestones | planned |
| P44 | Mastery | Career & Mastery | 0 / 0 / 6 | planned |

## Implemented lessons (full quality contract)

| Lesson ID | Title | Minutes | Quiz | Flashcards | Challenge | Files |
|-----------|-------|---------|------|------------|-----------|-------|
| P00-L1 | The Full-Stack Map: Browser → Server → Database | 25 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p0.ts` |
| P00-L2 | The Developer's Toolkit: Terminal, Node, pnpm, Git | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p0.ts` |
| P00-L3 | HTTP & JSON, First Contact: A Tiny Node Server | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p0.ts` |
| P00-L4 | DevTools & the Debugging Mindset | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p0b.ts` |
| P00-L5 | Environments, Secrets & Config Hygiene | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p0b.ts` |
| P01-L1 | Semantic HTML & Landmarks | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p1.ts` |
| P01-L2 | Forms, Labels & Native Validation | 40 | 6 q | 8 cards | ✔ hidden solution + live Validation lab | `src/data/lessons-p1.ts` |
| P01-L3 | Cascade, Specificity & the Box Model | 40 | 6 q | 8 cards | ✔ hidden solution + Specificity Battle & Box Model labs | `src/data/lessons-p1.ts` |
| P01-L4 | Flexbox, Grid & Responsive Layout | 45 | 6 q | 8 cards | ✔ hidden solution + Flexbox/Grid playground lab | `src/data/lessons-p1.ts` |
| P01-L5 | Design Tokens, Custom Properties & Dark Mode | 35 | 6 q | 8 cards | ✔ hidden solution + Token Lab (live contrast ratios) | `src/data/lessons-p1.ts` |
| P02-L1 | Values, Types & Control Flow | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p2.ts` |
| P02-L2 | Functions, Scope & Closures | 45 | 6 q | 8 cards | ✔ hidden solution + live Closure lab | `src/data/lessons-p2.ts` |
| P02-L3 | Arrays, Objects & Immutability | 40 | 6 q | 8 cards | ✔ hidden solution + live Immutability lab | `src/data/lessons-p2.ts` |
| P02-L4 | The DOM, Events & Forms | 45 | 6 q | 8 cards | ✔ hidden solution (vanilla Todo milestone) | `src/data/lessons-p2.ts` |
| P02-L5 | fetch, Promises & async/await | 45 | 6 q | 8 cards | ✔ hidden solution (Todo → HTTP api module) | `src/data/lessons-p2c.ts` |
| P02-L6 | Event Loop, Tasks & Debugging Labs | 40 | 6 q | 8 cards | ✔ hidden solution + live Event Loop lab | `src/data/lessons-p2c.ts` |
| P03-L1 | Inference, Annotations & Objects | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3.ts` |
| P03-L2 | Unions, Narrowing & Literal Types | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3.ts` |
| P03-L3 | Generics & Utility Types | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3b.ts` |
| P03-L5 | Strict tsconfig & Compiler Diagnostics | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3b.ts` |
| P03-L6 | Lab: Migrate the Todo App to TypeScript | 45 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3b.ts` |
| P03-L4 | keyof, typeof, unknown & Assertions | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p3c.ts` |
| P04-L1 | Declarative UI & JSX | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4.ts` |
| P04-L2 | Components, Props & Composition | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4.ts` |
| P04-L3 | State, Events & Immutable Updates | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4b.ts` |
| P04-L4 | Conditional Rendering, Lists & Keys | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4b.ts` |
| P04-L5 | Forms & Controlled Inputs | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4b.ts` |
| P04-L6 | Lifting State & Derived State | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4c.ts` |
| P04-L7 | Reconciliation, Identity & Strict Mode | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p4c.ts` |
| P05-L1 | useState Deep Dive: Queues & Functional Updates | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5.ts` |
| P05-L2 | useEffect: Synchronization, Deps & Cleanup | 45 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5.ts` |
| P05-L3 | useRef, useContext & useReducer | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5b.ts` |
| P05-L4 | useMemo, useCallback & useId | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5b.ts` |
| P05-L5 | useTransition, useDeferredValue & use | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5c.ts` |
| P05-L6 | Action Hooks: useActionState, useFormStatus, useOptimistic | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5c.ts` |
| P05-L7 | Custom Hooks & the Hook Decision Matrix | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p5c.ts` |
| P05-L8 | Boss Battle: Hooks Gauntlet (BB-1) | 90 | 5-scenario gauntlet | 8 cards | ✔ hidden solution | `src/data/lessons-p5c.ts` |
| P06-L1 | Component APIs & State Ownership | 40 | 6 q | 8 cards | ✔ hidden solution (compound Tabs) | `src/data/lessons-p6.ts` |
| P06-L2 | Error Boundaries, Suspense & Transitions | 40 | 6 q | 8 cards | ✔ hidden solution + live Boundary/Suspense lab | `src/data/lessons-p6.ts` |
| P06-L3 | Optimistic UI & the State Classification Map | 40 | 6 q | 8 cards | ✔ hidden solution + live Optimistic Lab (failure injection) | `src/data/lessons-p6b.ts` |
| P06-L4 | Performance Profiling & Memoization Judgment | 40 | 6 q | 8 cards | ✔ hidden solution + live Perf Lab (render counts & ms) | `src/data/lessons-p6b.ts` |
| P06-L5 | Then-vs-Now: Outdated React vs Current Stable | 35 | 6 q | 8 cards | ✔ hidden solution (modernize a 2018 component) | `src/data/lessons-p6c.ts` |
| P06-L6 | Design-System Components & Feature Folders | 35 | 6 q | 8 cards | ✔ hidden solution + live Design System playground | `src/data/lessons-p6c.ts` |
| P07-L1 | Anatomy of a Request: URL → DNS → Response | 40 | 6 q | 8 cards | ✔ hidden solution + live Request Trace lab | `src/data/lessons-p7.ts` |
| P07-L2 | Methods, Status Codes & Headers | 40 | 6 q | 8 cards | ✔ hidden solution + live Status Match lab | `src/data/lessons-p7.ts` |
| P07-L3 | Cookies, Sessions & Bearer Tokens | 40 | 6 q | 8 cards | ✔ hidden solution + live JWT Inspector lab | `src/data/lessons-p7b.ts` |
| P07-L4 | CORS & Preflight, Demystified | 35 | 6 q | 8 cards | ✔ hidden solution + live CORS Simulator lab | `src/data/lessons-p7b.ts` |
| P07-L5 | REST Conventions, Pagination, Filtering & Errors | 40 | 6 q | 8 cards | ✔ hidden solution + live Pagination/Error lab | `src/data/lessons-p7c.ts` |
| P07-L6 | Lab: Diagnose Which Layer Failed | 45 | 6 q | 8 cards | ✔ hidden solution + live Failure Isolation lab | `src/data/lessons-p7c.ts` |
| P08-L1 | App Router Project & File Conventions | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p8.ts` |
| P08-L2 | Layouts, Navigation & Route Groups | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p8.ts` |
| P08-L3 | loading, error, not-found & Metadata | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p8.ts` |
| P08-L4 | Server Components vs Client Components | 45 | 6 q | 8 cards | ✔ hidden solution + live RSC Boundary lab | `src/data/lessons-p8b.ts` |
| P08-L5 | Data Fetching, Caching & Revalidation (Current) | 45 | 6 q | 8 cards | ✔ hidden solution + live Cache Waterfall lab | `src/data/lessons-p8b.ts` |
| P08-L6 | Production Build & Deploy Against a Mock API | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p8b.ts` |
| P09-L1 | Feature-First Project Layout & Component Stratification | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p9.ts` |
| P09-L2 | Typed API Clients & Server/Client Composition | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p9.ts` |
| P09-L3 | URL State, Forms & the Loading/Error/Empty Matrix | 40 | 6 q | 8 cards | ✔ hidden solution + live URL State lab | `src/data/lessons-p9.ts` |
| P09-L4 | SEO: Metadata, Open Graph, Sitemap, Structured Data | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p9b.ts` |
| P09-L5 | Route Handlers & Server Actions vs the NestJS Boundary | 40 | 6 q | 8 cards | ✔ hidden solution + live Arch Boundary lab | `src/data/lessons-p9b.ts` |
| P09-L6 | Outdated Next.js vs Current Stable: Migration Reading | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p9b.ts` |
| P10-L1 | Bootstrap: main.ts, NestFactory & the Fastify Adapter | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p10.ts` |
| P10-L2 | Modules, Controllers & Providers | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p10.ts` |
| P10-L3 | Dependency Injection & Decorators, Explained | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p10.ts` |
| P10-L4 | DTOs, Config & Environment Validation | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p10b.ts` |
| P10-L5 | Request Lifecycle & Health Endpoints | 35 | 6 q | 8 cards | ✔ hidden solution + live Nest Pipeline lab | `src/data/lessons-p10b.ts` |
| P11-L1 | FastifyAdapter & NestFastifyApplication | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p11.ts` |
| P11-L2 | Plugins, CORS & Serialization | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p11.ts` |
| P11-L3 | Multipart Uploads & Body Limits | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p11.ts` |
| P11-L4 | Logging, Trust Proxy & Performance Profile | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p11b.ts` |
| P11-L5 | Debugging Lab: Why the Express Tutorial Fails Here | 45 | 6 q | 8 cards | ✔ hidden solution + live Fastify Trap Inspector lab | `src/data/lessons-p11b.ts` |
| P12-L1 | Feature Modules & Thin Controllers | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p12.ts` |
| P12-L2 | Pipes, Guards & Custom Decorators | 45 | 6 q | 8 cards | ✔ hidden solution + live RBAC Guard lab | `src/data/lessons-p12.ts` |
| P12-L3 | Interceptors, Exception Filters & Structured Errors | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p12.ts` |
| P12-L4 | Logging, Correlation IDs & Request Context | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p12b.ts` |
| P12-L5 | Swagger/OpenAPI & API Versioning Judgment | 30 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p12b.ts` |
| P12-L6 | Modular Monolith & the God-Service Anti-Pattern | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p12b.ts` |
| P13-L1 | Relational Modeling & ERDs | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p13.ts` |
| P13-L2 | CRUD, Sorting, Filtering & Pagination in SQL | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p13.ts` |
| P13-L3 | Joins, Subqueries, CTEs & Aggregates | 45 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p13.ts` |
| P13-L4 | Transactions, Isolation & Locks | 45 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p13b.ts` |
| P13-L5 | Indexes & Reading EXPLAIN | 40 | 6 q | 8 cards | ✔ hidden solution + live SQL EXPLAIN lab | `src/data/lessons-p13b.ts` |
| P13-L6 | Dates, Decimal, JSONB & Full-Text Search | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p13b.ts` |
| P14-L1 | Install Exactly 7.9.15: Schema, Models & Relations | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p14.ts` |
| P14-L2 | prisma.config.ts, ESM & Driver Adapters | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p14.ts` |
| P14-L3 | Migrate, Generate, Seed & Studio | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p14.ts` |
| P14-L4 | CRUD, Filters & Relation Queries | 40 | 6 q | 8 cards | ✔ hidden solution + live Prisma Query lab | `src/data/lessons-p14b.ts` |
| P14-L5 | Nested Writes & Transactions | 40 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p14b.ts` |
| P14-L6 | PrismaModule & PrismaService in NestJS | 35 | 6 q | 8 cards | ✔ hidden solution | `src/data/lessons-p14b.ts` |

Each implemented lesson carries: objectives · prerequisites · simple explanation · why · mental model · technical sections with runnable code · common mistake (wrong/right) · Try-It-Yourself · guided challenge with hints + hidden solution · quiz · flashcards · recap · official references · next-step bridge. Mechanics lessons additionally embed **live interactive labs** (`demo` sections). Content is registered in `src/data/lessons.ts` (merged index) and is immediately searchable via the platform's course-wide search (⌘K / Ctrl K).

## Draft lessons (outline only — NOT complete)

*None on the bench.* The previous drafts (P00-L4, P01-L1) were authored in Pass 002. Future passes re-introduce draft entries here before bodies exist.

## Assessments & Boss Battles

| ID | After | Name | Status |
|----|-------|------|--------|
| BB-1 | P05 | Hooks Gauntlet | **implemented** → [`src/data/lessons-p5c.ts`](src/data/lessons-p5c.ts) (p05-l8) |
| BB-2 | P12 | Backend Architecture Defense | planned |
| BB-3 | P15 | Prisma 7.9.15 Data Gauntlet | planned |
| BB-4 | P21 | The Vertical Slice Audit | planned |
| BB-5 | P40 | Architecture Board Review (final) | planned |

## Cross-cutting method installed

The **nine-step debugging loop** (Read Error → Identify Layer → Reproduce → Gather Evidence → Hypothesize → Change One Thing → Verify → Explain Root Cause → Prevent Regression) is taught in P00-L4 and is the required method for every Debugging Lab in later phases.

## Platform capabilities (Pass 003)

- **Course-wide search** (⌘K / Ctrl K): lessons, glossary, troubleshooting, phases, pages — index derived from curriculum data at runtime.
- **Generation Queue** (Status page): ordered upcoming passes with rationale, rewritten each pass.
- **Live lesson labs**: Constraint Validation playground (P01-L2), Specificity Battle (P01-L3), Box Model simulator (P01-L3), Flexbox/Grid playground (P01-L4), Token Lab with live contrast ratios (P01-L5), Closure Lab with debounce tester (P02-L2), Immutability Lab with snapshot/change-detection panel (P02-L3), Event Loop scheduler lab (P02-L6), Error Boundary & Suspense lab (P06-L2), Optimistic Lab with failure injection (P06-L3), Perf Lab with render counts (P06-L4), Design System playground (P06-L6), Request Trace timing waterfall (P07-L1), Status Match game (P07-L2), JWT Token Inspector (P07-L3), CORS & Preflight Simulator (P07-L4).
- **Scope commitment (Pass 005)**: every planned lesson across all 45 phases carries a committed outline in `curriculum.ts`, rendered as expandable "scope" rows in the roadmap. Planned lessons are specified, not empty — but remain unauthored until their pass ships.

## Reference & support pages

Roadmap · Mastery Levels · Design Tokens · Glossary (204 terms) · Troubleshooting (57 entries) · Version Matrix · Production Readiness Scorecard · Course Status & Generation Queue — all wired in the site shell and populated from `src/data/*`.

---
*Manifest updated by every generation pass. See `COURSE_STATUS.md` for history and `COURSE_VERSION_MATRIX.md` for pinned versions (Prisma is pinned to exactly `7.9.15`).*
