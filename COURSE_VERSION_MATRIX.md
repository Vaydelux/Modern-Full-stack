# COURSE_VERSION_MATRIX.md

> Installed / baseline / latest-verified versions with official sources.
> Policy: prefer stable/LTS, never preview builds as baseline. **Prisma is pinned to exactly `prisma@7.9.15` + `@prisma/client@7.9.15`.** Newer Prisma majors may appear only in optional migration-awareness material (P15) unless explicitly approved. Do not silently upgrade a working repository.

Last verified: **2026-02** (Pass 002 content batch). Re-verify when scaffolding or updating any version-sensitive lesson.

| Tool | Course baseline | Latest verified stable | Official source | Compatibility & migration notes |
|------|-----------------|------------------------|-----------------|---------------------------------|
| Node.js | 22.x LTS | 24.x LTS (LTS since 2025-10; Node 20 EOL 2026-04-30) | nodejs.org | Teach on 22 LTS; note 24 LTS for new installs. `--env-file` (native since 20.6) is the baseline env loader taught in P00-L5; dotenv remains the ecosystem classic. |
| Chrome DevTools | current stable channel | current stable | developer.chrome.com | Console/Network/Sources/accessibility pane taught in P00-L4 and reused by every debugging lab; Performance/memory depth lands in P32. |
| Modern CSS baseline | `:has()` (Baseline 2023-12) · `:user-invalid` (Baseline 2025) | `@layer` / `@container` Baseline 2023 | web.dev/baseline | Teach `:has`/`:user-invalid` as safe today (P01-L2/L3); layers/containers stay conceptual until a phase needs them. |
| pnpm | 10.x | 10.x | pnpm.io | Workspace protocol for monorepo phase (P35). |
| TypeScript | 5.9.x | 5.9.x | typescriptlang.org | Strict `tsconfig` taught in P03; `verbatimModuleSyntax` on. |
| React | 19.x stable | 19.x stable | react.dev | Actions/form hooks (`useActionState`, `useFormStatus`, `useOptimistic`, `use`) taught in P05 against current stable. |
| Next.js | 16.x (App Router) | 16.x | nextjs.org | App Router only. Teach current caching/revalidation semantics; include "Outdated vs Current" reading exercises (P09). |
| NestJS | 11.x | 11.x | nestjs.com | With Fastify adapter; `@nestjs/platform-fastify` matching major. |
| Fastify | 5.x | 5.x | fastify.dev | `FastifyAdapter`, plugin ecosystem, multipart + trust-proxy caveats (P11). |
| Prisma (CLI) | **pinned 7.9.15** | pinned — do not drift | prisma.io | Teaches this version's `prisma.config.ts`, ESM/driver-adapter behavior, migrations, generation, deployment. |
| @prisma/client | **pinned 7.9.15** | pinned — do not drift | prisma.io | Backend/worker-only. Never in browser bundles. |
| Prisma PG adapter / pg driver | verify pinned-version docs at P14 authoring time | — | prisma.io (driver adapters) | Confirm adapter package + version compatibility with 7.9.15 before writing P14/P16. |
| PostgreSQL (Supabase) | 17.x | 18.x GA available | postgresql.org / supabase.com | Supabase projects: check project's PG version; teach 17 features safely. |
| supabase-js | 2.x | 2.x (≥2.110 dropped Node 20) | supabase.com/docs / GitHub supabase-js | Browser client for Auth/Storage/Realtime only; data authority stays in NestJS. |
| TanStack Query | 5.x | 5.x | tanstack.com/query | React adapter; DevTools in P19. |
| React Hook Form | 7.x | 7.x | react-hook-form.com | P20. |
| Zod | 3.x (decide 3 vs 4 at P20 scaffold) | 4.x available | zod.dev | Record decision here before authoring P20. |
| BullMQ | 5.x | 5.x | docs.bullmq.io | With managed Redis (Upstash-class) in P25. |
| Redis | 7.x-class managed | — | redis.io / upstash.com | Connection string handling + TLS in P25/P38. |
| Playwright | 1.x | 1.x | playwright.dev | E2E in P31/P37. |
| Docker / Compose | latest stable | latest stable | docker.com | P34; multi-stage builds. |
| GitHub Actions | `ubuntu-24.04` runners, pnpm via `pnpm/action-setup` | — | docs.github.com/actions | P37. |

## Platform note

The course *site* itself (this artifact) is a custom Vite 6 + React + Tailwind v4 docs engine that implements the required learning-platform contract (sidebar/TOC/breadcrumbs/prev-next, dark/light, quizzes, flashcards, progress, Boss Battle scaffolding, design tokens page). Version rows above describe the **taught stack**, not the site runtime.
