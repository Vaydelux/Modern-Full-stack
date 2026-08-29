import type { LessonContent } from "./types";

export const LESSON_CONTENT_P31B: Record<string, LessonContent> = {
  "p31-l5": {
    id: "p31-l5",
    phaseId: "p31",
    title: "Authorization, Worker & Webhook Tests",
    level: "Advanced",
    minutes: 40,
    summary:
      "Construct dedicated security and asynchronous regression test suites. Automate Insecure Direct Object Reference (IDOR) tests, BullMQ worker job processing verification, and webhook replay simulations.",
    prerequisites: ["p18-l1 RBAC", "p23-l1 BullMQ", "p29-l5 Webhooks"],
    objectives: [
      "Write automated IDOR test matrices ensuring User A cannot read or mutate User B's resources.",
      "Test BullMQ worker processor functions in isolation with mock job payloads.",
      "Simulate webhook duplicate delivery and assert idempotent processing.",
    ],
    simple:
      "Most security vulnerabilities are not complex cryptography breaks — they are simple authorization bugs where User A changes the URL parameter from `/invoices/1` to `/invoices/2` and sees another company's billing data (IDOR). A dedicated authorization test matrix sends requests from different user roles and tenants to prove your access guards never leak data.",
    why:
      "IDOR vulnerabilities represent over 50% of all bounty payouts in web security; automated multi-tenant test suites prevent them from ever reaching production.",
    mentalModel: {
      title: "The Keycard Interlock Audit",
      body:
        "An auditor tests the building by walking up to every single locked door with a Guest keycard, a Contractor keycard, and an Executive keycard. If the Guest keycard opens the Executive Server Room door, the alarm triggers and the audit fails immediately.",
    },
    sections: [
      {
        heading: "1. The IDOR Matrix Testing Pattern",
        body: [
          "Create a reusable test runner that executes the same API action under 3 identities:",
          "1. **Owner (User A)**: Should succeed (`200 OK` or `204 No Content`).",
          "2. **Attacker (User B in Tenant B)**: Must fail (`403 Forbidden` or `404 Not Found`).",
          "3. **Unauthenticated (Anonymous)**: Must fail (`401 Unauthorized`).",
        ],
        code: [
          {
            file: "idor.spec.ts",
            lang: "ts",
            code: [
              "import request from 'supertest';",
              "import { INestApplication } from '@nestjs/common';",
              "",
              "export async function assertTenantIsolation(",
              "  app: INestApplication,",
              "  endpoint: (resourceId: string) => string,",
              "  method: 'get' | 'delete' | 'patch',",
              ") {",
              "  // Seed Tenant A and Tenant B with separate resources",
              "  const tenantAResource = 'doc_orgA_123';",
              "  const tenantBToken = 'Bearer jwt-user-orgB';",
              "",
              "  // Attempt to access Tenant A resource using Tenant B user credentials",
              "  const response = await request(app.getHttpServer())[method](endpoint(tenantAResource))",
              "    .set('Authorization', tenantBToken)",
              "    .send();",
              "",
              "  // Must be strictly 403 Forbidden or 404 Not Found",
              "  expect([403, 404]).toContain(response.status);",
              "}",
            ].join("\n"),
            caption: "Reusable IDOR tenant isolation assertion helper.",
          },
        ],
      },
      {
        heading: "2. Testing BullMQ Asynchronous Job Processors",
        body: [
          "- Test the worker processor function directly as a pure unit with a mock `Job<T>` object.",
          "- Assert that if an error occurs, the job throws an exception so BullMQ triggers retry backoff.",
          "- Assert that running the job twice with the same payload is idempotent.",
        ],
      },
    ],
    mistake: {
      title: "Testing Only the Happy Path in Auth Guards",
      wrong: [
        "// ❌ Only testing that an admin can delete a project:",
        "expect(await deleteProject(adminUser, projId)).toBe(true);",
        "// Forgot to test that a standard user CANNOT delete the project!",
      ].join("\n"),
      right: [
        "// ✅ Always test both positive and negative authorization branches:",
        "await expect(deleteProject(viewerUser, projId)).rejects.toThrow(ForbiddenException);",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build an Automated IDOR Security Suite",
      description:
        "Write a suite of 5 test cases testing `GET`, `PATCH`, and `DELETE` on `/api/v1/invoices/:id` verifying that a cross-tenant token receives 403 Forbidden on all mutations.",
      tasks: [
        "Create User 1 (Org 1) and User 2 (Org 2).",
        "Issue an invoice under Org 1.",
        "Attempt to update the invoice using User 2's bearer token and assert 403.",
      ],
    },
    quiz: [
      {
        question: "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
        options: [
          "When a database query runs too slowly.",
          "When an application exposes a reference to an internal object (like /api/invoices/42) and fails to verify that the requesting user owns that object.",
          "When an API key is committed to GitHub.",
          "When a CSS style breaks on mobile.",
        ],
        answer: 1,
        explanation:
          "IDOR happens when authorization checks are missing on direct database IDs, allowing unauthorized users to access or modify records simply by guessing their identifiers.",
      },
    ],
  },

  "p31-l6": {
    id: "p31-l6",
    phaseId: "p31",
    title: "Playwright E2E & Accessibility Smoke Tests",
    level: "Advanced",
    minutes: 45,
    summary:
      "Author reliable, resilient End-to-End browser test flows using Playwright. Integrate `@axe-core/playwright` to catch WCAG accessibility violations automatically in CI.",
    prerequisites: ["p04-l1 React Fundamentals", "p31-l1 Testing Map"],
    objectives: [
      "Write multi-page user flows in Playwright with automatic waiting and locators.",
      "Integrate Axe Core to enforce WCAG 2.1 AA accessibility compliance on every page route.",
      "Record video, trace viewer artifacts, and screenshots on test failure.",
    ],
    simple:
      "Playwright drives real headless Chromium, Firefox, and Safari browsers. It loads your full frontend application, clicks buttons, types in forms, and asserts that network requests and UI updates occur. Axe Core scans the rendered HTML tree to catch contrast errors, missing ARIA tags, and broken keyboard navigation.",
    why:
      "E2E tests catch integration bugs where the frontend and backend misunderstand each other, while accessibility tests prevent lawsuits and ensure your app is usable by everyone.",
    mentalModel: {
      title: "The Pilot Pre-Flight Checklist",
      body:
        "Before takeoff, the pilot walks around the plane, tests the rudder pedals, checks the altimeter, and verifies the radio. Playwright is the automated pre-flight checklist that runs through your core user paths before deploying to production.",
    },
    sections: [
      {
        heading: "1. Modern Playwright Locators & Auto-Waiting",
        body: [
          "- **Auto-waiting**: Playwright automatically waits for elements to be actionable (visible, enabled, not animating) before clicking.",
          "- **Role Locators**: Use `page.getByRole('button', { name: 'Submit' })` instead of brittle CSS selectors.",
          "- **Web-First Assertions**: `await expect(page.getByText('Welcome')).toBeVisible()` will poll until the element appears or timeouts.",
        ],
        code: [
          {
            file: "checkout.e2e.ts",
            lang: "ts",
            code: [
              "import { test, expect } from '@playwright/test';",
              "import AxeBuilder from '@axe-core/playwright';",
              "",
              "test.describe('E-Commerce Critical Checkout Journey', () => {",
              "  test('user can add item to cart, checkout, and pass accessibility audit', async ({ page }) => {",
              "    // 1. Navigate to product page",
              "    await page.goto('/products/mechanical-keyboard');",
              "",
              "    // 2. Automated WCAG Accessibility Scan",
              "    const accessibilityScanResults = await new AxeBuilder({ page })",
              "      .withTags(['wcag2a', 'wcag2aa'])",
              "      .analyze();",
              "    expect(accessibilityScanResults.violations).toEqual([]);",
              "",
              "    // 3. User interaction with auto-waiting locators",
              "    await page.getByRole('button', { name: /add to cart/i }).click();",
              "    await page.getByRole('link', { name: /view cart/i }).click();",
              "",
              "    await expect(page.getByText(/total: \\$129.00/i)).toBeVisible();",
              "    await page.getByRole('button', { name: /proceed to checkout/i }).click();",
              "",
              "    // Assert navigation to checkout step",
              "    await expect(page).toHaveURL(/.*checkout/);",
              "  });",
              "});",
            ].join("\n"),
            caption: "Playwright E2E test with automated Axe accessibility audit.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using page.waitForTimeout(5000) (Arbitrary Sleep) in E2E Tests",
      wrong: [
        "// ❌ Hardcoded sleep slows down CI and creates flaky tests:",
        "await page.click('#submit-btn');",
        "await page.waitForTimeout(3000);",
      ].join("\n"),
      right: [
        "// ✅ Use web-first assertions that poll and resolve instantly when ready:",
        "await expect(page.getByRole('alert')).toHaveText('Saved successfully');",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Write a Playwright Sign-Up Flow with Trace Viewer",
      description:
        "Write a test that registers a new random user account, verifies the dashboard loads, and captures a Playwright Trace on failure.",
      tasks: [
        "Configure `trace: 'on-first-retry'` in `playwright.config.ts`.",
        "Complete the registration form with `user_${Date.now()}@example.com`.",
        "Assert `expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()`.",
      ],
    },
    quiz: [
      {
        question: "What makes Playwright locators superior to legacy Selenium XPath / CSS selectors?",
        options: [
          "Playwright locators incorporate built-in auto-waiting, visibility checks, and semantic role accessibility targeting.",
          "They only run on Internet Explorer.",
          "They require no JavaScript.",
          "They bypass authentication.",
        ],
        answer: 0,
        explanation:
          "Playwright auto-waits for elements to be attached, visible, and stable before performing actions, virtually eliminating timing flakiness.",
      },
    ],
  },

  "p31-l7": {
    id: "p31-l7",
    phaseId: "p31",
    title: "CI Wiring & Coverage as Signal",
    level: "Advanced",
    minutes: 30,
    summary:
      "Construct high-speed GitHub Actions CI/CD pipelines with parallel matrix jobs, test caching, and pull request coverage diff gates.",
    prerequisites: ["p31-l1 Testing Strategy Map"],
    objectives: [
      "Structure a GitHub Actions workflow with lint, typecheck, unit, integration, and E2E matrix stages.",
      "Understand Code Coverage as a discovery signal for missing edge cases rather than a dogmatic 100% vanity metric.",
      "Cache `node_modules` and Playwright browser binaries to keep CI runs under 4 minutes.",
    ],
    simple:
      "Continuous Integration (CI) is an automated robot on GitHub that runs your linter, TypeScript compiler, and full test suite every time someone opens a Pull Request. If any test fails, the PR is blocked from merging to `main`, ensuring broken code never gets deployed to users.",
    why:
      "Automated CI pipelines eliminate the human error of 'I forgot to run the tests locally before pushing'.",
    mentalModel: {
      title: "The Assembly Line Quality Gate",
      body:
        "At every stage of the automotive factory line, a robotic scanner inspects the welds. If a bolt is missing, the conveyor belt stops and alerts the mechanic before the car moves to the paint shop.",
    },
    sections: [
      {
        heading: "1. GitHub Actions Multi-Job Pipeline Configuration",
        body: [
          "Run fast checks first (Fail-Fast):",
          "1. `lint-and-typecheck` (30s): `tsc --noEmit` and ESLint.",
          "2. `unit-tests` (45s): Vitest in parallel.",
          "3. `integration-tests` (2m): NestJS + Supertest against Postgres service container.",
          "4. `e2e-playwright` (3m): Playwright matrix across Chromium, Firefox, WebKit.",
        ],
        code: [
          {
            file: "ci.yml",
            lang: "yaml",
            code: [
              "name: Continuous Integration",
              "on:",
              "  push:",
              "    branches: [main]",
              "  pull_request:",
              "    branches: [main]",
              "",
              "jobs:",
              "  quality-gates:",
              "    runs-on: ubuntu-latest",
              "    steps:",
              "      - uses: actions/checkout@v4",
              "      - uses: actions/setup-node@v4",
              "        with:",
              "          node-version: 20",
              "          cache: 'npm'",
              "      - run: npm ci",
              "      - run: npm run lint",
              "      - run: npm run typecheck",
              "      - run: npm run test:unit -- --coverage",
            ].join("\n"),
            caption: "High-speed GitHub Actions CI configuration.",
          },
        ],
      },
      {
        heading: "2. The Truth About Code Coverage (Signal vs Vanity)",
        body: [
          "- **100% Coverage is a False Idol**: A test can execute 100% of lines without making a single valid assertion.",
          "- **Coverage as a Flashlight**: Use coverage reports to find untouched catch blocks, unhandled error branches, and forgotten authorization guards.",
          "- **Recommended Target**: 75–85% branch coverage on core domain services and APIs.",
        ],
      },
    ],
    mistake: {
      title: "Setting a Strict 100% Coverage Mandate in CI",
      wrong: [
        "// ❌ Requiring 100% coverage causes developers to write useless tests that test getters/setters and framework internals just to appease CI.",
      ].join("\n"),
      right: [
        "// ✅ Focus coverage thresholds (80%+) on high-risk domain logic, payment services, and authorization guards.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Configure a Multi-Stage CI Workflow",
      description:
        "Write a complete GitHub Actions YAML workflow that runs linting, Prisma schema validation, and integration tests in parallel.",
      tasks: [
        "Add caching for `~/.npm` and `~/.cache/ms-playwright`.",
        "Add a Postgres service container to the integration test job.",
        "Configure PR status check requirements in GitHub settings.",
      ],
    },
    quiz: [
      {
        question: "What is the primary benefit of running linting and typechecking before running full integration/E2E test suites in CI?",
        options: [
          "It saves money on cloud servers.",
          "It fails fast in 15 seconds on syntax or typing mistakes, saving developers from waiting 10 minutes for slow browser tests to run.",
          "It compiles TypeScript to C++.",
          "It automatically fixes git merge conflicts.",
        ],
        answer: 1,
        explanation:
          "Fail-fast pipelines return rapid feedback to developers on simple syntax and type errors without wasting compute time on heavier test suites.",
      },
    ],
  },
};
