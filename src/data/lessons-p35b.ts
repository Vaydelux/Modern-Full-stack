import type { LessonContent } from "./types";

export const LESSON_CONTENT_P35B: Record<string, LessonContent> = {
  "p35-l4": {
    id: "p35-l4",
    phaseId: "p35",
    title: "Build Order, Root Scripts & CI Implications",
    level: "Advanced",
    minutes: 35,
    summary:
      "Accelerate monorepo build pipelines using Turborepo dependency graphs (`turbo.json`), topological execution, remote build caching, and change detection filtering.",
    prerequisites: ["p35-l1 pnpm Workspaces"],
    objectives: [
      "Define task dependency pipelines in `turbo.json` (`^build` topological ordering).",
      "Leverage Turborepo computation caching to skip rebuilding unchanged packages.",
      "Execute affected builds only using `turbo build --filter=...[origin/main]`.",
    ],
    simple:
      "If your monorepo has 10 packages, building them sequentially takes 8 minutes. Turborepo analyzes the dependency graph: it compiles `packages/contracts` first, then builds `apps/web` and `apps/api` simultaneously in parallel. If you only changed 1 line of CSS in `apps/web`, Turborepo restores the API and database builds from cache in 0.2 seconds.",
    why:
      "Turborepo caching reduces CI pipeline execution times by up to 85%, saving thousands in cloud compute costs.",
    mentalModel: {
      title: "The Assembly Line with Caching",
      body:
        "If you're assembling 10 cars and the engine design hasn't changed since yesterday, you don't rebuild the engine from raw steel — you grab the pre-assembled engine off the shelf (Cache Hit) and only paint the new car door.",
    },
    sections: [
      {
        heading: "1. turbo.json Pipeline Configuration",
        body: [
          "- `^build`: Ensures dependency packages are built before the parent application builds.",
          "- `outputs`: Specifies the build output directory to cache (`dist/**`, `.next/**`).",
        ],
        code: [
          {
            file: "turbo.json",
            lang: "json",
            code: [
              "{\n" +
              "  \"$schema\": \"https://turbo.build/schema.json\",\n" +
              "  \"pipeline\": {\n" +
              "    \"build\": {\n" +
              "      \"dependsOn\": [\"^build\"],\n" +
              "      \"outputs\": [\"dist/**\", \".next/**\", \"!.next/cache/**\"]\n" +
              "    },\n" +
              "    \"lint\": {\n" +
              "      \"dependsOn\": [\"^lint\"]\n" +
              "    },\n" +
              "    \"test\": {\n" +
              "      \"dependsOn\": [\"^build\"],\n" +
              "      \"outputs\": [\"coverage/**\"]\n" +
              "    },\n" +
              "    \"dev\": {\n" +
              "      \"cache\": false,\n" +
              "      \"persistent\": true\n" +
              "    }\n" +
              "  }\n" +
              "}"
            ].join("\n"),
            caption: "Production Turborepo task pipeline definition.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Root Scripts Sequentially in Bash Instead of Using Task Orchestrators",
      wrong: [
        "// ❌ Root package.json running sequential build steps:",
        "\"build\": \"cd packages/contracts && npm run build && cd ../../apps/api && npm run build && cd ../web && npm run build\"",
        "// Inefficient, fragile, and lacks caching or parallelization!",
      ].join("\n"),
      right: [
        "// ✅ Delegate task orchestration to Turborepo: `\"build\": \"turbo run build\"`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Turborepo Cache Hit Rate",
      description:
        "Execute `turbo build`, observe execution time, re-run `turbo build` with zero code changes, and verify `>>> FULL TURBO` 0-second cache hit.",
      tasks: [
        "Run `npx turbo run build` -> note compilation time.",
        "Re-run `npx turbo run build` -> confirm cached output.",
        "Modify `apps/web` only and verify API package is retrieved from cache.",
      ],
    },
    quiz: [
      {
        question: "What does the '^build' notation inside turbo.json pipeline represent?",
        options: [
          "Run the build in the cloud.",
          "Execute the 'build' task of all direct upstream dependencies before starting the build of the dependent package.",
          "Ignore build errors.",
          "Run the build on Node.js version 18.",
        ],
        answer: 1,
        explanation:
          "The caret (^) symbol specifies topological dependency: compile child packages first before building parent apps.",
      },
    ],
  },

  "p35-l5": {
    id: "p35-l5",
    phaseId: "p35",
    title: "When a Monorepo Becomes Harmful",
    level: "Advanced",
    minutes: 25,
    summary:
      "Understand the trade-offs, scaling limits, and organizational friction of monorepos. Learn when Polyrepos (Multi-repo) are superior for independent teams.",
    prerequisites: ["p35-l1 pnpm Workspaces"],
    objectives: [
      "Evaluate organizational and technical friction points in massive monorepos.",
      "Understand git repository bloat, large binary artifacts, and merge conflict contention.",
      "Formulate a structured Monorepo vs Polyrepo decision rubric.",
    ],
    simple:
      "Monorepos are fantastic for 1-5 teams working closely on a unified product. But when an enterprise grows to 500 engineers across 30 different divisions with separate release cadences, a single broken commit on `main` can block 500 people from deploying. Knowing when to split repositories is a critical engineering leadership decision.",
    why:
      "Blindly adopting monorepos for completely unrelated business units creates unnecessary toolchain complexity and organizational bottlenecks.",
    mentalModel: {
      title: "The Shared Kitchen vs Private Apartments",
      body:
        "A shared kitchen is great for a family living in one house. But if 100 strangers share one kitchen, people fight over stove burners, dirty dishes block others from cooking, and a kitchen fire leaves everyone without food.",
    },
    sections: [
      {
        heading: "1. The Monorepo Decision Rubric",
        body: [
          "- **Use a Monorepo when**:",
          "  - Apps are tightly coupled (e.g. Next.js Web + NestJS API + Worker for the same SaaS product).",
          "  - Small-to-medium engineering team (1-50 engineers).",
          "  - Frequent cross-stack schema and contract changes.",
          "- **Use a Polyrepo when**:",
          "  - Teams have completely independent release cycles and no shared domain logic.",
          "  - Different programming languages (e.g. Go microservices + Python data science + React Native).",
          "  - Strict regulatory access boundaries (e.g. PCI-DSS compliance requiring isolated repo access).",
        ],
      },
    ],
    mistake: {
      title: "Creating Deeply Nested Internal Package Hierarchies",
      wrong: [
        "// ❌ Monorepo with 40 tiny 5-line packages (`packages/button`, `packages/input`, `packages/card`, `packages/utils`):",
        "// Creates massive package manager overhead and sluggish IDE type-checking!",
      ].join("\n"),
      right: [
        "// ✅ Keep packages coarse-grained: `@taskforge/ui`, `@taskforge/contracts`, `@taskforge/database`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author a Split-Decision Architecture Memo",
      description:
        "Draft a 1-page engineering RFC evaluating whether a new microservice belongs in the existing pnpm monorepo or as an isolated independent repository.",
      tasks: [
        "Evaluate deployment cadence and tech stack.",
        "Analyze security/compliance boundaries.",
        "Make a justified recommendation with pros/cons.",
      ],
    },
    quiz: [
      {
        question: "When is a Polyrepo (multi-repo) architecture generally preferred over a single Monorepo?",
        options: [
          "When disparate teams write in different programming languages with independent deployment lifecycles and strictly isolated security compliance requirements.",
          "When using TypeScript.",
          "When you have less than 3 files.",
          "When deploying to Vercel.",
        ],
        answer: 0,
        explanation:
          "Independent tech stacks, separate deployment cadences, and distinct access controls benefit from repository isolation.",
      },
    ],
  },
};
