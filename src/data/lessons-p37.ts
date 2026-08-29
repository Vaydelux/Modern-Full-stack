import type { LessonContent } from "./types";

export const LESSON_CONTENT_P37: Record<string, LessonContent> = {
  "p37-l1": {
    id: "p37-l1",
    phaseId: "p37",
    title: "Workflows, Events, Jobs & Runners",
    level: "Advanced",
    minutes: 35,
    summary:
      "Deconstruct GitHub Actions architecture. Master YAML workflow syntax, trigger matrixes (`push`, `pull_request`, `workflow_dispatch`), and parallel Linux runner orchestration.",
    prerequisites: ["p36-l1 Git Concepts"],
    objectives: [
      "Explain the hierarchy of Workflows -> Jobs -> Steps -> Actions.",
      "Configure conditional triggers based on branches, tags, and PR lifecycle events.",
      "Execute matrix strategy builds across multiple Node.js versions.",
    ],
    simple:
      "Continuous Integration (CI) is a robot assistant in the cloud. Every time you push code or open a Pull Request, GitHub boots a fresh virtual machine (Runner), clones your repository, installs packages, runs linter checks, and executes your test suite. If any test fails, it marks the PR red and blocks merging.",
    why:
      "Automated CI pipelines eliminate the human error of deploying broken code to production.",
    mentalModel: {
      title: "The Automated Factory Inspection Line",
      body:
        "Every car chassis that moves down the factory assembly line automatically passes through 5 optical scanner stations. If a single bolt is missing, the scanner triggers an alarm and halts the conveyor belt.",
    },
    sections: [
      {
        heading: "1. GitHub Actions YAML Anatomy",
        body: [
          "- **`on`**: Event triggers (e.g. `pull_request: branches: [main]`).",
          "- **`jobs`**: Runs in parallel on separate Ubuntu runners by default.",
          "- **`needs`**: Enforces sequential dependencies (e.g. Deploy only after Test succeeds).",
        ],
        code: [
          {
            file: ".github/workflows/ci.yml",
            lang: "yaml",
            code: [
              "name: Continuous Integration",
              "",
              "on:",
              "  push:",
              "    branches: [main]",
              "  pull_request:",
              "    branches: [main]",
              "",
              "jobs:",
              "  validate:",
              "    runs-on: ubuntu-latest",
              "    steps:",
              "      - name: Checkout Code",
              "        uses: actions/checkout@v4",
              "",
              "      - name: Setup Node.js 20",
              "        uses: actions/setup-node@v4",
              "        with:",
              "          node-version: 20",
              "          cache: 'npm'",
              "",
              "      - name: Install Dependencies",
              "        run: npm ci",
              "",
              "      - name: Typecheck",
              "        run: npm run typecheck",
              "",
              "      - name: Run Tests",
              "        run: npm test",
            ].join("\n"),
            caption: "Standard GitHub Actions CI workflow manifest.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using 'npm install' Instead of 'npm ci' in CI Pipelines",
      wrong: [
        "// ❌ Running `npm install` inside CI runners:",
        "// npm install modifies package-lock.json at runtime and can pull non-deterministic dependency versions!",
      ].join("\n"),
      right: [
        "// ✅ Always use `npm ci` or `pnpm install --frozen-lockfile` for strictly deterministic, clean CI installs.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author a Multi-Job CI Workflow",
      description:
        "Write a GitHub Actions workflow with two parallel jobs (`lint-and-typecheck` and `unit-tests`), and a third dependent job (`build`) that runs only after both pass.",
      tasks: [
        "Define workflow with `jobs.lint` and `jobs.test`.",
        "Add `jobs.build` with `needs: [lint, test]`.",
        "Simulate workflow execution with `act` or GitHub.",
      ],
    },
    quiz: [
      {
        question: "Why is 'npm ci' preferred over 'npm install' in automated CI/CD runners?",
        options: [
          "It is strictly deterministic, requires an exact package-lock.json, deletes existing node_modules for clean builds, and never modifies the lockfile.",
          "It uses WebAssembly to install packages.",
          "It bypasses npm token authorization.",
          "It runs without Node.js.",
        ],
        answer: 0,
        explanation:
          "npm ci installs dependencies directly from package-lock.json without modifying it, guaranteeing identical builds across all environments.",
      },
    ],
  },

  "p37-l2": {
    id: "p37-l2",
    phaseId: "p37",
    title: "pnpm Caching & the Quality Gate Pipeline",
    level: "Advanced",
    minutes: 40,
    summary:
      "Accelerate GitHub Actions execution with `pnpm/action-setup` content-addressable store caching. Build a complete 4-tier Quality Gate (Lint, Typecheck, Unit Test, Build).",
    prerequisites: ["p37-l1 GitHub Actions Basics", "p35-l1 pnpm Workspaces"],
    objectives: [
      "Configure `pnpm` store caching in GitHub Actions to cut runner setup times from 2 minutes to 10 seconds.",
      "Construct a strict 4-step Quality Gate pipeline enforcing zero-warning standards.",
      "Export JUnit XML test reports and lcov code coverage summaries directly into PR comments.",
    ],
    simple:
      "Running `pnpm install` from scratch on every commit downloads 500MB of packages over the internet every time. By caching the pnpm virtual store on GitHub's high-speed internal cache server, packages are restored in 4 seconds. The 4 quality gates ensure zero TypeScript errors or broken tests can ever merge into `main`.",
    why:
      "Fast CI pipelines (under 2 minutes) prevent developer context switching and keep team velocity high.",
    mentalModel: {
      title: "The Pre-Flight Checklist",
      body:
        "Commercial pilots go through a rigid 4-point check before takeoff: Flight Controls, Fuel Quantity, Navigation Instruments, Engine Thrust. If any check fails, the plane does not leave the gate.",
    },
    sections: [
      {
        heading: "1. Optimized pnpm Caching Action Pattern",
        body: [
          "- Uses `actions/cache` keyed by hash of `pnpm-lock.yaml`.",
          "- Runs all four quality checks in optimal order.",
        ],
        code: [
          {
            file: ".github/workflows/quality-gate.yml",
            lang: "yaml",
            code: [
              "name: Quality Gate",
              "on: [push, pull_request]",
              "",
              "jobs:",
              "  quality-gate:",
              "    runs-on: ubuntu-latest",
              "    steps:",
              "      - uses: actions/checkout@v4",
              "",
              "      - uses: pnpm/action-setup@v3",
              "        with:",
              "          version: 9",
              "",
              "      - uses: actions/setup-node@v4",
              "        with:",
              "          node-version: 20",
              "          cache: 'pnpm'",
              "",
              "      - name: Install Dependencies",
              "        run: pnpm install --frozen-lockfile",
              "",
              "      - name: 1. ESLint Check",
              "        run: pnpm run lint",
              "",
              "      - name: 2. TypeScript Compilation Check",
              "        run: pnpm run typecheck",
              "",
              "      - name: 3. Unit & Integration Tests",
              "        run: pnpm test -- --coverage",
              "",
              "      - name: 4. Production Build",
              "        run: pnpm run build",
            ].join("\n"),
            caption: "High-speed 4-step quality gate with pnpm caching.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Heavy End-to-End Tests on Every Single Micro-Commit",
      wrong: [
        "// ❌ Running 45-minute Playwright suite on every single commit push:",
        "// Burns CI runner minutes and slows developer feedback loops!",
      ].join("\n"),
      right: [
        "// ✅ Run fast unit/type tests on every commit; trigger heavy Playwright E2E suites on PR merge readiness or nightly cron.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build a High-Speed Monorepo Quality Gate",
      description:
        "Author a GitHub Actions workflow integrating pnpm store caching, configure parallel test and lint matrices, and verify cache hit on subsequent runs.",
      tasks: [
        "Create `.github/workflows/ci.yml`.",
        "Add pnpm cache key hashing.",
        "Verify runner execution log shows `Cache restored successfully`.",
      ],
    },
    quiz: [
      {
        question: "What cache key strategy ensures the pnpm store is re-downloaded only when dependencies actually change?",
        options: [
          "Keying the cache on the runner OS and the SHA-256 hash of pnpm-lock.yaml: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}",
          "Keying by current timestamp.",
          "Keying by git author name.",
          "Keying by commit message.",
        ],
        answer: 0,
        explanation:
          "Hashing the lockfile ensures cache hits occur on unchanged dependencies and automatically invalidates the cache when packages are updated.",
      },
    ],
  },

  "p37-l3": {
    id: "p37-l3",
    phaseId: "p37",
    title: "Separate Pipelines: web / api / worker",
    level: "Advanced",
    minutes: 35,
    summary:
      "Implement path-filtered CI/CD workflows using `dorny/paths-filter`. Trigger independent build and deployment pipelines only for modified applications within a monorepo.",
    prerequisites: ["p37-l1 GitHub Actions Basics", "p35-l1 pnpm Workspaces"],
    objectives: [
      "Configure GitHub Actions path filtering for monorepo efficiency.",
      "Trigger `deploy-web` only when `apps/web/**` or shared contracts change.",
      "Trigger `deploy-api` only when `apps/api/**`, database schemas, or contracts change.",
    ],
    simple:
      "If you fix a typo in the documentation or change the color of a button in `apps/web`, there is zero reason to rebuild and redeploy the backend `apps/api` and `apps/worker`. Path filters inspect the Git diff and only trigger workflows for the specific applications that were actually modified.",
    why:
      "Path filtering prevents redundant deployments, reduces production deployment risks, and cuts CI execution costs by 60%.",
    mentalModel: {
      title: "The Targeted Dispatcher",
      body:
        "If a customer orders a pizza, the restaurant doesn't send out 3 delivery drivers with a pizza, a burger, and a taco. The dispatcher sends only the pizza driver to the delivery address.",
    },
    sections: [
      {
        heading: "1. Monorepo Path Filtering Workflow",
        body: [
          "- Detects changes across `apps/web`, `apps/api`, `apps/worker`, and `packages/*`.",
          "- Conditionally runs downstream jobs using `if: needs.filter.outputs.api == 'true'`.",
        ],
        code: [
          {
            file: ".github/workflows/monorepo-filter.yml",
            lang: "yaml",
            code: [
              "name: Monorepo Change Dispatcher",
              "on: [push, pull_request]",
              "",
              "jobs:",
              "  filter:",
              "    runs-on: ubuntu-latest",
              "    outputs:",
              "      web: ${{ steps.changes.outputs.web }}",
              "      api: ${{ steps.changes.outputs.api }}",
              "    steps:",
              "      - uses: actions/checkout@v4",
              "      - uses: dorny/paths-filter@v3",
              "        id: changes",
              "        with:",
              "          filters: |",
              "            web:",
              "              - 'apps/web/**'",
              "              - 'packages/contracts/**'",
              "              - 'packages/ui/**'",
              "            api:",
              "              - 'apps/api/**'",
              "              - 'packages/contracts/**'",
              "              - 'packages/database/**'",
              "",
              "  test-api:",
              "    needs: filter",
              "    if: needs.filter.outputs.api == 'true'",
              "    runs-on: ubuntu-latest",
              "    steps:",
              "      - run: echo 'Testing API changes...'",
            ].join("\n"),
            caption: "Path filtering change detection matrix for monorepos.",
          },
        ],
      },
    ],
    mistake: {
      title: "Forgetting to Include Shared Packages in Child Path Filters",
      wrong: [
        "// ❌ Filtering web only on 'apps/web/**':",
        "// If you update `packages/contracts`, the web app will NOT trigger CI and broken contract types will slip through!",
      ].join("\n"),
      right: [
        "// ✅ Include shared upstream dependencies in the filter paths: `apps/web/**` AND `packages/contracts/**`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Monorepo Path Change Filtering",
      description:
        "Commit a change to `apps/web/README.md`, push to branch, and verify that only the `web` job executes while `api` and `worker` jobs are skipped.",
      tasks: [
        "Configure `dorny/paths-filter`.",
        "Make commit affecting web only.",
        "Observe GitHub Actions job skip execution behavior.",
      ],
    },
    quiz: [
      {
        question: "Why must changes in 'packages/contracts' trigger both frontend and backend CI workflows in a monorepo?",
        options: [
          "Because contracts define the shared API interface; any change to types or schemas could break either the client or the server.",
          "Because contracts is the largest file in the repo.",
          "Because GitHub requires it.",
          "To format the code with Prettier.",
        ],
        answer: 0,
        explanation:
          "Since both web and API consume shared contracts, contract modifications must trigger validation on both consuming applications.",
      },
    ],
  },
};
