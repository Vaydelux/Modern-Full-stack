import type { LessonContent } from "./types";

export const LESSON_CONTENT_P35: Record<string, LessonContent> = {
  "p35-l1": {
    id: "p35-l1",
    phaseId: "p35",
    title: "pnpm Workspaces & the Professional Layout",
    level: "Advanced",
    minutes: 35,
    summary:
      "Structure multi-app enterprise codebases using `pnpm` workspaces and Turborepo. Unify `apps/web`, `apps/api`, and `apps/worker` with isolated `packages/*` and symlinked internal dependencies.",
    prerequisites: ["p08-l1 Next.js App Router", "p10-l1 NestJS Core"],
    objectives: [
      "Configure root `pnpm-workspace.yaml` and unified lockfiles.",
      "Share TypeScript configs (`tsconfig.base.json`) and ESLint rules across all workspace packages.",
      "Execute targeted package commands using `pnpm --filter`.",
    ],
    simple:
      "Instead of managing 4 separate Git repositories (one for React, one for NestJS, one for the Worker, and one for Types) that require painful multi-repo PRs, a monorepo puts all related applications into a single repository. `pnpm` uses fast hard links on disk so your dependencies share disk space without duplicating `node_modules`.",
    why:
      "Monorepos allow atomic full-stack commits: you can rename a database field and update the backend, worker, and frontend in one single pull request.",
    mentalModel: {
      title: "The Multi-Room Workshop",
      body:
        "Instead of 4 separate workshops across town, you have 1 large warehouse with designated rooms: Woodworking (Web), Metalworking (API), and Shipping (Worker). The shared tool rack (Packages) sits in the center where everyone can grab tools instantly.",
    },
    sections: [
      {
        heading: "1. The Standard Production Monorepo Directory Structure",
        body: [
          "```",
          "├── apps/",
          "│   ├── web/           # Next.js 14 / Vite React client",
          "│   ├── api/           # NestJS / Fastify backend",
          "│   └── worker/        # BullMQ background processor",
          "├── packages/",
          "│   ├── contracts/     # Zod schemas, OpenAPI specs, shared DTOs",
          "│   ├── database/      # Prisma schema & database migrations",
          "│   ├── tsconfig/      # Shared tsconfig.json bases",
          "│   └── ui/            # Tailwind React design system components",
          "├── pnpm-workspace.yaml",
          "├── package.json",
          "└── turbo.json",
          "```",
        ],
        code: [
          {
            file: "pnpm-workspace.yaml",
            lang: "yaml",
            code: [
              "packages:",
              "  - 'apps/*'",
              "  - 'packages/*'",
            ].join("\n"),
            caption: "Root pnpm-workspace.yaml configuration.",
          },
        ],
      },
    ],
    mistake: {
      title: "Installing Different TypeScript or React Minor Versions in Child Packages",
      wrong: [
        "// ❌ apps/web using React 18.2.0 while packages/ui uses React 19.0.0:",
        "// Causes duplicate React runtime instances and mysterious 'Invalid Hook Call' crashes!",
      ].join("\n"),
      right: [
        "// ✅ Use pnpm catalog or root peerDependencies to enforce singleton versions of React across the monorepo.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Initialize a pnpm Workspace with Turborepo",
      description:
        "Create root `pnpm-workspace.yaml`, add `apps/web` and `packages/contracts`, link them via `\"@taskforge/contracts\": \"workspace:*\"`, and verify types resolve across packages.",
      tasks: [
        "Create root workspace manifest.",
        "Link `@taskforge/contracts` to `apps/web`.",
        "Run `pnpm --filter web build`.",
      ],
    },
    quiz: [
      {
        question: "What does 'workspace:*' mean in a package.json dependency declaration inside a pnpm monorepo?",
        options: [
          "It downloads the package from npm registry public registry.",
          "It instructs pnpm to link directly to the local package within the workspace without publishing to an external registry.",
          "It runs all tests in the workspace.",
          "It deletes the node_modules folder.",
        ],
        answer: 1,
        explanation:
          "The 'workspace:*' protocol creates local symlinks between monorepo packages, enabling instant cross-package compilation.",
      },
    ],
  },

  "p35-l2": {
    id: "p35-l2",
    phaseId: "p35",
    title: "packages/contracts & What May Be Shared",
    level: "Advanced",
    minutes: 35,
    summary:
      "Architect clean shared contracts packages. Export Zod schemas, TypeScript types, and API route definitions safely consumed by both browser and server.",
    prerequisites: ["p35-l1 pnpm Workspaces", "p29-l1 OpenAPI & Zod"],
    objectives: [
      "Design zero-dependency `@acme/contracts` packages containing pure TypeScript types and Zod schemas.",
      "Enforce bidirectional type safety between React query hooks and NestJS controllers.",
      "Understand why frontend packages must never import server-side runtime code.",
    ],
    simple:
      "A contracts package is the 'handshake agreement' between frontend and backend. It contains only schemas and types — no database drivers, no passwords, no heavy Node.js libraries. When the backend changes a user field from `name` to `fullName`, TypeScript immediately flags errors in the React app before you even run the code.",
    why:
      "Sharing contracts eliminates drift between backend response payloads and frontend client expectations.",
    mentalModel: {
      title: "The Architectural Blueprint",
      body:
        "The architect doesn't ship 50 bags of cement to the client meeting. They bring a paper blueprint (Contracts). Both the bricklayers (Backend) and the interior decorators (Frontend) build according to the exact same blueprint.",
    },
    sections: [
      {
        heading: "1. Designing the Shared Contracts Package",
        body: [
          "- Contains only universal dependencies (`zod`).",
          "- Never imports `express`, `@nestjs/core`, `@prisma/client`, or Node built-in modules (`fs`, `path`).",
        ],
        code: [
          {
            file: "packages/contracts/src/project.ts",
            lang: "ts",
            code: [
              "import { z } from 'zod';",
              "",
              "export const ProjectSchema = z.object({",
              "  id: z.string().uuid(),",
              "  title: z.string().min(3).max(100),",
              "  status: z.enum(['ACTIVE', 'ARCHIVED', 'DRAFT']),",
              "  createdAt: z.string().datetime(),",
              "});",
              "",
              "export const CreateProjectSchema = ProjectSchema.omit({ id: true, createdAt: true });",
              "",
              "export type Project = z.infer<typeof ProjectSchema>;",
              "export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;",
            ].join("\n"),
            caption: "Pure shared schema and type contract.",
          },
        ],
      },
    ],
    mistake: {
      title: "Exporting Server Classes or Database Models in Shared Contracts",
      wrong: [
        "// ❌ In packages/contracts/src/index.ts:",
        "export * from '@prisma/client'; // Leaks server database dependencies into the browser bundle!",
      ].join("\n"),
      right: [
        "// ✅ Export pure TypeScript interfaces and Zod schemas only.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build an End-to-End Type-Safe Form",
      description:
        "Use a shared Zod schema from `packages/contracts` to validate both client-side React Hook Form input and backend NestJS request payload.",
      tasks: [
        "Export `CreateTaskSchema` in contracts package.",
        "Import in React form with `zodResolver`.",
        "Import in NestJS controller with Zod validation pipe.",
      ],
    },
    quiz: [
      {
        question: "Why should packages/contracts have minimal runtime dependencies?",
        options: [
          "To avoid bundle bloat and ensure the package can execute seamlessly in any JavaScript runtime (Browser, Node.js, Cloudflare Workers, React Native).",
          "Because Zod requires TypeScript 2.0.",
          "To avoid paying npm fees.",
          "Because HTML does not support imports.",
        ],
        answer: 0,
        explanation:
          "Contracts packages are consumed across diverse runtimes (browsers, edge workers, servers); keeping them lightweight ensures universal compatibility and zero bundle bloat.",
      },
    ],
  },

  "p35-l3": {
    id: "p35-l3",
    phaseId: "p35",
    title: "Dependency Direction & Secret Boundaries",
    level: "Advanced",
    minutes: 30,
    summary:
      "Enforce strict unidirectional dependency graphs. Prevent catastrophic architectural leaks (e.g. database credentials or server SDKs leaking into client bundles) using ESLint import boundaries.",
    prerequisites: ["p35-l1 pnpm Workspaces"],
    objectives: [
      "Audit dependency graphs with `eslint-plugin-import` boundary rules.",
      "Guarantee that `apps/web` never has access to `@prisma/client`, `ioredis`, or server secret keys.",
      "Understand the Dependency Inversion Principle within monorepo packages.",
    ],
    simple:
      "In a monorepo, it's dangerously easy for a developer in `apps/web` to auto-import `import { prisma } from '@taskforge/database'`. If this happens, your database connection string and raw SQL engine get bundled into the public JavaScript downloaded by everyone on the internet. Strict boundary rules block these illegal imports automatically in CI.",
    why:
      "A single leaked backend package import into a frontend bundle can expose private API secrets and inflate client bundles by megabytes.",
    mentalModel: {
      title: "The One-Way Security Checkpoint",
      body:
        "Airport security lets passengers move from Check-in -> Security -> Boarding Gate. You can never walk backwards from the Boarding Gate into the baggage handling basement. Dependency direction is a one-way security checkpoint.",
    },
    sections: [
      {
        heading: "1. The Monorepo Dependency Direction Hierarchy",
        body: [
          "- `apps/*` may import `packages/*`.",
          "- `packages/*` may **NEVER** import `apps/*`.",
          "- `apps/web` may **NEVER** import `@taskforge/database` or server-only packages.",
          "- `packages/contracts` may **NEVER** import anything except utility primitives.",
        ],
        code: [
          {
            file: ".eslintrc.js",
            lang: "javascript",
            code: [
              "module.exports = {",
              "  rules: {",
              "    'no-restricted-imports': [",
              "      'error',",
              "      {",
              "        paths: [",
              "          {",
              "            name: '@taskforge/database',",
              "            message: 'SECURITY VIOLATION: Database package cannot be imported into frontend code.',",
              "          },",
              "        ],",
              "      },",
              "    ],",
              "  },",
              "};",
            ].join("\n"),
            caption: "ESLint restriction rule blocking server leaks into frontend.",
          },
        ],
      },
    ],
    mistake: {
      title: "Circular Dependencies Between Workspace Packages",
      wrong: [
        "// ❌ Package A imports Package B, while Package B imports Package A:",
        "// Breaks build compilation order and causes undefined runtime exports!",
      ].join("\n"),
      right: [
        "// ✅ Extract common types into a neutral third package (e.g. `packages/contracts`).",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Run a Monorepo Dependency Lint Audit",
      description:
        "Add a prohibited import into `apps/web`, run `pnpm lint`, and verify ESLint fails the build with an informative architectural boundary error.",
      tasks: [
        "Configure ESLint `no-restricted-imports`.",
        "Add bad import to `apps/web/src/page.tsx`.",
        "Execute `pnpm lint` -> confirm build error.",
      ],
    },
    quiz: [
      {
        question: "Which of the following dependency import paths is an architectural violation in a professional monorepo?",
        options: [
          "apps/web importing packages/contracts",
          "apps/web importing @taskforge/database (Prisma ORM)",
          "apps/api importing packages/contracts",
          "apps/worker importing @taskforge/database",
        ],
        answer: 1,
        explanation:
          "Frontend clients must communicate with databases strictly over HTTP/WebSocket APIs; importing database drivers directly into browser apps is a severe security and architectural flaw.",
      },
    ],
  },
};
