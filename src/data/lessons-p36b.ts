import type { LessonContent } from "./types";

export const LESSON_CONTENT_P36B: Record<string, LessonContent> = {
  "p36-l4": {
    id: "p36-l4",
    phaseId: "p36",
    title: "Conventional Commits, Tags & Changelogs",
    level: "Advanced",
    minutes: 30,
    summary:
      "Automate semantic versioning (SemVer) and changelog generation using Conventional Commits (`feat:`, `fix:`, `perf:`, `BREAKING CHANGE:`) and tools like Changesets or Release-It.",
    prerequisites: ["p36-l1 Git Concepts"],
    objectives: [
      "Master Conventional Commits 1.0.0 specification grammar.",
      "Automate SemVer version bumps (MAJOR.MINOR.PATCH) based on commit history.",
      "Generate automated `CHANGELOG.md` files and Git Release Tags in CI.",
    ],
    simple:
      "Instead of writing random commit messages like 'fixed stuff' or 'made button blue', Conventional Commits enforces a structured prefix: `fix: resolve auth token refresh bug` or `feat: add Google OAuth login`. Because the format is machine-readable, release tools automatically know to bump the version number from `1.2.0` to `1.3.0` and write your public changelog for you.",
    why:
      "Standardized commits turn release management from a tedious 4-hour manual chore into a 10-second automated GitHub Action.",
    mentalModel: {
      title: "The Standardized Postal Stamp",
      body:
        "If you write 'Deliver quickly please' in cursive, the sorting machine ignores it. If you apply a standard 'First Class Priority' barcode stamp, the machine routes your package instantly into the express plane.",
    },
    sections: [
      {
        heading: "1. Conventional Commit Types and SemVer Mapping",
        body: [
          "- **`feat:`**: New user-facing feature -> Triggers **MINOR** bump (`1.2.0` -> `1.3.0`).",
          "- **`fix:`**: Bug fix -> Triggers **PATCH** bump (`1.2.0` -> `1.2.1`).",
          "- **`perf:`**: Performance optimization -> Triggers **PATCH** bump.",
          "- **`BREAKING CHANGE:`**: Incompatible API change -> Triggers **MAJOR** bump (`1.2.0` -> `2.0.0`).",
          "- **`docs:` / `chore:` / `refactor:`**: Internal changes -> No release bump.",
        ],
      },
    ],
    mistake: {
      title: "Marking Non-Breaking Internal Refactors as BREAKING CHANGE",
      wrong: [
        "// ❌ BREAKING CHANGE footer on internal refactor:",
        "refactor(button): cleanup internal style variables\n\nBREAKING CHANGE: changed private css variable",
        "// Bumps major version to 2.0.0 unnecessarily!",
      ].join("\n"),
      right: [
        "// ✅ Reserve BREAKING CHANGE exclusively for breaking changes to public APIs or interfaces.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Automate Release Notes with Changesets",
      description:
        "Configure `@changesets/cli`, create a changeset entry for a new feature, run `changeset version`, and inspect the generated `CHANGELOG.md`.",
      tasks: [
        "Install `@changesets/cli`.",
        "Run `npx changeset` and select minor bump for `packages/ui`.",
        "Execute `npx changeset version` and review updated package.json and CHANGELOG.md.",
      ],
    },
    quiz: [
      {
        question: "Under Semantic Versioning (SemVer), which version segment increments when introducing backwards-compatible new functionality?",
        options: [
          "MAJOR (X.0.0)",
          "MINOR (0.X.0)",
          "PATCH (0.0.X)",
          "BUILD (0.0.0-beta)",
        ],
        answer: 1,
        explanation:
          "MINOR version bumps indicate the addition of backwards-compatible new features.",
      },
    ],
  },

  "p36-l5": {
    id: "p36-l5",
    phaseId: "p36",
    title: "Branch Protection & Migrations in Teams",
    level: "Advanced",
    minutes: 35,
    summary:
      "Configure GitHub branch protection rules, require status checks, enforce code owner approvals, and orchestrate zero-downtime database migrations in multi-developer teams.",
    prerequisites: ["p36-l1 Git Concepts", "p14-l1 Prisma Core"],
    objectives: [
      "Configure GitHub Branch Protection Rules (Require PR review, Require green CI, Dismiss stale approvals).",
      "Set up `CODEOWNERS` for automated security and database reviewer assignments.",
      "Implement the Expand-and-Contract database migration strategy across multi-team branches.",
    ],
    simple:
      "In a professional software team, nobody pushes directly to `main` — not even the CTO. Every change must pass automated lint/type/test checks in CI and receive approval from a designated code owner. When modifying database tables, teams use the 'Expand-Contract' pattern so older deployed versions of the API keep working seamlessly while new migrations roll out.",
    why:
      "Branch protection rules and non-destructive migrations guarantee that `main` is always in a deployable, healthy state.",
    mentalModel: {
      title: "The Double-Key Vault",
      body:
        "A high-security bank vault cannot be opened by 1 person. It requires two keys turned simultaneously: the Bank Manager (Code Reviewer) and the Security Guard (Automated CI Green Check).",
    },
    sections: [
      {
        heading: "1. The Expand-and-Contract Database Migration Pattern",
        body: [
          "1. **Phase 1 (Expand)**: Add the new column `fullName` nullable alongside `name`. Deploy API version that writes to BOTH fields.",
          "2. **Phase 2 (Backfill)**: Run a background worker script to copy old `name` values into `fullName`.",
          "3. **Phase 3 (Contract)**: Update frontend and API to read exclusively from `fullName`. Drop the legacy `name` column in a subsequent release.",
        ],
        code: [
          {
            file: ".github/CODEOWNERS",
            lang: "text",
            code: [
              "# Global fallback reviewers",
              "* @taskforge/core-team",
              "",
              "# Database schema and migrations require database architect review",
              "packages/database/ @taskforge/db-admins",
              "prisma/ @taskforge/db-admins",
              "",
              "# Security and auth configurations require security lead approval",
              "**/auth/** @taskforge/security-team",
            ].join("\n"),
            caption: "GitHub CODEOWNERS file for automated review assignment.",
          },
        ],
      },
    ],
    mistake: {
      title: "Renaming a Database Column Directly in One Synchronous Migration",
      wrong: [
        "// ❌ Renaming `name` to `fullName` in a single migration step:",
        "ALTER TABLE users RENAME COLUMN name TO fullName;",
        "// Instantly crashes all running v1 instances of your API that are still querying `SELECT name FROM users`!",
      ].join("\n"),
      right: [
        "// ✅ Use Expand-and-Contract: add column, dual-write, backfill, deprecate old column.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Create a GitHub CODEOWNERS File and Branch Rule",
      description:
        "Draft a `.github/CODEOWNERS` mapping critical paths to specialized teams, and document branch protection settings for `main`.",
      tasks: [
        "Create `.github/CODEOWNERS` with security and database paths.",
        "Define required status check names in documentation.",
        "Walk through a simulated 3-step Expand-and-Contract migration plan.",
      ],
    },
    quiz: [
      {
        question: "Why is the Expand-and-Contract pattern required when modifying database schemas in live production systems?",
        options: [
          "It allows old and new versions of backend API servers to run concurrently without downtime or missing column query exceptions during rolling deployments.",
          "It compresses PostgreSQL table storage.",
          "It disables SQL foreign keys.",
          "It converts SQL tables to MongoDB collections.",
        ],
        answer: 0,
        explanation:
          "During rolling updates, servers running older versions of code coexist with newer versions; Expand-and-Contract guarantees database backwards compatibility.",
      },
    ],
  },
};
