import type { LessonContent } from "./types";

export const LESSON_CONTENT_P37B: Record<string, LessonContent> = {
  "p37-l4": {
    id: "p37-l4",
    phaseId: "p37",
    title: "Preview Deployments & Protected Environments",
    level: "Advanced",
    minutes: 35,
    summary:
      "Configure ephemeral Pull Request preview environments (Vercel, Cloudflare Pages, Supabase Branching) and enforce GitHub Environment Protection Rules with required manual sign-offs.",
    prerequisites: ["p37-l1 GitHub Actions Basics"],
    objectives: [
      "Generate ephemeral staging URLs for every active Pull Request automatically.",
      "Configure GitHub Protected Environments (`production`, `staging`) with required manual reviewers.",
      "Inject environment-scoped secrets securely into deployment jobs.",
    ],
    simple:
      "Instead of testing features on localhost and hoping they work in production, Preview Deployments build a live temporary version of your app for every open Pull Request (e.g. `https://pr-42.taskforge.dev`). Product managers, designers, and QA engineers can test real interactive features on their phones before the code is merged.",
    why:
      "Preview environments eliminate visual regressions and let non-technical stakeholders test features before production deployment.",
    mentalModel: {
      title: "The Architectural Model Home",
      body:
        "Home builders build a fully decorated 'Model Home' in the subdivision. Prospective buyers walk through the actual rooms, touch the countertops, and check the closets before construction starts on their real house.",
    },
    sections: [
      {
        heading: "1. GitHub Environment Protection Rules",
        body: [
          "- **`environment: production`**: Halts execution and notifies designated engineering leads in Slack for one-click manual approval.",
          "- **Environment Secrets**: `DATABASE_URL` and `STRIPE_SECRET_KEY` are strictly isolated to the production environment runner.",
        ],
        code: [
          {
            file: ".github/workflows/deploy-production.yml",
            lang: "yaml",
            code: [
              "name: Deploy Production",
              "on:",
              "  push:",
              "    branches: [main]",
              "",
              "jobs:",
              "  deploy:",
              "    name: Deploy to Production Cloud",
              "    runs-on: ubuntu-latest",
              "    environment:",
              "      name: production",
              "      url: https://taskforge.dev",
              "    steps:",
              "      - uses: actions/checkout@v4",
              "      - name: Deploy API",
              "        env:",
              "          PROD_API_KEY: ${{ secrets.PROD_API_KEY }}",
              "        run: |",
              "          echo 'Deploying to live production cluster...'",
            ].join("\n"),
            caption: "Protected production environment deployment workflow.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Production Deployments on Untrusted Fork Pull Requests",
      wrong: [
        "// ❌ Using `pull_request_target` with secret injection on open-source public repos:",
        "// Malicious contributors can submit PRs that echo your production secrets to their server!",
      ].join("\n"),
      right: [
        "// ✅ Never inject production secrets into unverified pull request workflows.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Configure a Protected Environment with Required Reviewers",
      description:
        "Define a `production` environment in GitHub repository settings, require manual approval from `@core-leads`, and trigger a test deployment workflow.",
      tasks: [
        "Configure GitHub environment with review gates.",
        "Trigger workflow via commit to main.",
        "Verify workflow pauses and requests approval in GitHub UI.",
      ],
    },
    quiz: [
      {
        question: "Why should production secrets be stored in GitHub 'Environment Secrets' rather than global 'Repository Secrets'?",
        options: [
          "Environment secrets can be restricted so only workflows running against protected branches or requiring manual approval can access sensitive credentials.",
          "Global secrets are slower to encrypt.",
          "GitHub limits repositories to 2 global secrets.",
          "Environment secrets expire after 1 hour.",
        ],
        answer: 0,
        explanation:
          "Environment secrets allow applying granular branch restrictions and manual reviewer approvals before sensitive credentials can be exposed to runners.",
      },
    ],
  },

  "p37-l5": {
    id: "p37-l5",
    phaseId: "p37",
    title: "Migrations in CI & the Rollback Conversation",
    level: "Advanced",
    minutes: 35,
    summary:
      "Execute automated Prisma database migrations in CI/CD using `prisma migrate deploy`. Adopt the 'Forward-Fix' engineering doctrine over dangerous database rollbacks.",
    prerequisites: ["p14-l1 Prisma Core", "p37-l1 GitHub Actions Basics"],
    objectives: [
      "Automate non-interactive schema migration runs using `npx prisma migrate deploy` in CD pipelines.",
      "Understand why rollbacks in relational databases risk data corruption and why 'Forward-Fixing' is standard industry practice.",
      "Implement automated migration lock acquisition and timeout safeguards.",
    ],
    simple:
      "When deploying a new version of your backend, the database migration must run *before* the new API containers boot up. But if a migration is destructive, you cannot simply 'click rollback' — rolling back a dropped column or deleted table permanently deletes real customer data created in the meantime. We use non-destructive forward fixes instead.",
    why:
      "Automating migrations eliminates human CLI errors during live releases.",
    mentalModel: {
      title: "The Rocket Launch Sequence",
      body:
        "Stage 1 (Fueling - DB Migration) must complete 100% before Stage 2 (Ignition - API Boot). You cannot put the rocket back in the hangar mid-flight; if a minor glitch occurs in orbit, you patch the flight software forward.",
    },
    sections: [
      {
        heading: "1. The Production CD Deployment Pipeline Order",
        body: [
          "1. **Step 1**: Run CI Quality Gates (Typecheck, Lint, Test, Build).",
          "2. **Step 2**: Acquire DB Migration Lock and execute `prisma migrate deploy`.",
          "3. **Step 3**: Deploy new backend containers (Rolling Update / Blue-Green).",
          "4. **Step 4**: Deploy new frontend client assets.",
          "5. **Step 5**: Execute smoke tests against live production endpoints.",
        ],
        code: [
          {
            file: ".github/workflows/deploy-migrations.yml",
            lang: "yaml",
            code: [
              "name: Database Migration & Deploy",
              "on:",
              "  push:",
              "    branches: [main]",
              "",
              "jobs:",
              "  migrate-database:",
              "    runs-on: ubuntu-latest",
              "    steps:",
              "      - uses: actions/checkout@v4",
              "      - uses: actions/setup-node@v4",
              "        with:",
              "          node-version: 20",
              "",
              "      - name: Run Prisma Production Migrations",
              "        env:",
              "          DATABASE_URL: ${{ secrets.PROD_DATABASE_DIRECT_URL }}",
              "        run: npx prisma migrate deploy",
            ].join("\n"),
            caption: "Automated CD database migration execution job.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using 'prisma migrate dev' in Production CD Pipelines",
      wrong: [
        "// ❌ Running `prisma migrate dev` in CI/CD:",
        "// `migrate dev` is interactive, generates new migrations, and will fail or reset the database if drift is detected!",
      ].join("\n"),
      right: [
        "// ✅ Always use `npx prisma migrate deploy` for non-interactive, strictly deterministic production migration runs.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Simulate a CD Migration Pipeline with Direct URL",
      description:
        "Configure a GitHub Action step running `prisma migrate deploy` against a cloud Postgres instance and verify all pending SQL migration files apply cleanly.",
      tasks: [
        "Create migration workflow.",
        "Set `DATABASE_URL` secret with direct migration URL.",
        "Run workflow and inspect migration confirmation logs.",
      ],
    },
    quiz: [
      {
        question: "Why should you use 'npx prisma migrate deploy' rather than 'prisma migrate dev' inside automated CI/CD runners?",
        options: [
          "prisma migrate deploy executes only pre-existing committed migration files without prompting for interactive input or resetting the database.",
          "prisma migrate deploy is faster because it skips PostgreSQL.",
          "prisma migrate dev is for MongoDB.",
          "prisma migrate deploy requires Docker.",
        ],
        answer: 0,
        explanation:
          "migrate deploy is the non-interactive production command designed for automated pipelines.",
      },
    ],
  },

  "p37-l6": {
    id: "p37-l6",
    phaseId: "p37",
    title: "Diagnosing Failed Runs & Release Workflows",
    level: "Advanced",
    minutes: 30,
    summary:
      "Triage broken CI runners with speed. Master GitHub Actions debug logging (`ACTIONS_RUNNER_DEBUG: true`), download artifact traces, and orchestrate scheduled Release Trains.",
    prerequisites: ["p37-l1 GitHub Actions Basics"],
    objectives: [
      "Enable step debug logging and SSH into failed GitHub runners using `mxschmitt/action-tmate`.",
      "Extract and analyze JUnit XML and Playwright failure trace zip artifacts.",
      "Structure weekly or tag-based automated Release Trains with automated rollback triggers.",
    ],
    simple:
      "When a CI pipeline turns red at 11:00 PM, you shouldn't blindly push 10 random 'testing CI' commits. Using runner debug logs or attaching an interactive SSH terminal directly to the cloud runner allows you to inspect the exact failing command and filesystem state in 60 seconds.",
    why:
      "Fast triage of broken CI runners keeps team deployment velocity high.",
    mentalModel: {
      title: "The Pit Stop Diagnostic Computer",
      body:
        "When a race car pulls into the Formula 1 pit stop with an engine light, mechanics don't guess by replacing random tires. They plug in the telemetry cable and read the exact sensor diagnostic code in 2 seconds.",
    },
    sections: [
      {
        heading: "1. Interactive Runner Debugging with tmate",
        body: [
          "- Pauses the runner on failure and prints an SSH connection string in the logs.",
          "- Allows you to run commands and inspect directories directly inside the Ubuntu runner.",
        ],
        code: [
          {
            file: ".github/workflows/debug-runner.yml",
            lang: "yaml",
            code: [
              "- name: Debug on Failure via SSH",
              "  if: failure()",
              "  uses: mxschmitt/action-tmate@v3",
              "  with:",
              "    detached: true",
            ].join("\n"),
            caption: "Debugging failed GitHub Action runners interactively.",
          },
        ],
      },
    ],
    mistake: {
      title: "Spamming the Git Commit History with 20 'fix ci' Commits",
      wrong: [
        "// ❌ git commit -m 'fix ci' -> git push -> fails -> git commit -m 'fix ci again'...",
      ].join("\n"),
      right: [
        "// ✅ Test workflows locally using `act` (https://github.com/nektos/act) or use interactive tmate debugging.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Triage a Broken Playwright CI Run Using Artifact Traces",
      description:
        "Simulate an E2E test failure, configure the workflow to upload `playwright-report` on failure, download the artifact, and inspect the trace in `trace.playwright.dev`.",
      tasks: [
        "Add `actions/upload-artifact@v4` on `if: always()`.",
        "Trigger test failure.",
        "Download artifact zip and view recorded DOM video trace.",
      ],
    },
    quiz: [
      {
        question: "How can you view the visual recording and network timeline of a failed Playwright test executed in a headless GitHub Actions runner?",
        options: [
          "By uploading the trace.zip artifact in CI and opening it in trace.playwright.dev.",
          "By taking a photo of the monitor.",
          "By converting the runner to a GIF.",
          "By asking GitHub support.",
        ],
        answer: 0,
        explanation:
          "Playwright trace files record screenshots, DOM snapshots, console logs, and network waterfalls that can be viewed interactively in Playwright Trace Viewer.",
      },
    ],
  },
};
