import type { LessonContent } from "./types";

export const LESSON_CONTENT_P31: Record<string, LessonContent> = {
  "p31-l1": {
    id: "p31-l1",
    phaseId: "p31",
    title: "The Testing Strategy Map",
    level: "Advanced",
    minutes: 35,
    summary:
      "Design an authentic, pragmatic testing pyramid for full-stack engineering. Balance Unit, Integration, API, and E2E tests to maximize confidence per dollar and development minute.",
    prerequisites: ["p10-l1 NestJS Core", "p04-l1 React Fundamentals"],
    objectives: [
      "Deconstruct the real-world Testing Trophy vs Testing Pyramid debate.",
      "Understand what belongs in Unit tests vs Integration tests vs End-to-End tests.",
      "Calculate test execution speed vs isolation vs confidence metrics.",
    ],
    simple:
      "Testing ensures that when you refactor a function or add a new feature, you don't accidentally break five existing parts of your application. Instead of writing slow E2E tests for every tiny button or brittle unit tests that mock everything, high-leverage teams focus on Integration Tests that verify real database transactions and API endpoints.",
    why:
      "Over-mocked unit tests give false confidence (100% test pass while the app crashes in production), while flaky E2E tests waste hours of CI pipeline time.",
    mentalModel: {
      title: "The Automobile Safety Testing Regimen",
      body:
        "You test individual spark plugs on a bench (Unit), you test the engine and transmission bolted together on a dyno (Integration), and you crash-test the complete assembled car on a test track (E2E). You don't crash 500 cars to test a turn signal lightbulb.",
    },
    sections: [
      {
        heading: "1. The 4 Testing Tiers & ROI Comparison",
        body: [
          "1. **Unit Tests (Vitest / Jest)**: Test pure business math, parsing, date formatting, and state machines. Fast (<1ms), zero external I/O, no DB or network.",
          "2. **Integration & API Tests (Supertest + Testcontainers)**: Test real NestJS controllers, services, and Postgres queries together. Catches 80% of real production bugs.",
          "3. **Component Tests (React Testing Library)**: Test user interactions, keyboard accessibility, and state transitions without a real browser engine.",
          "4. **End-to-End Tests (Playwright)**: Test critical user journeys (Sign Up -> Checkout -> Receipt) in real Chromium/WebKit browsers.",
        ],
        code: [
          {
            file: "testing-tiers-matrix.ts",
            lang: "ts",
            code: [
              "// Pragmatic Testing Portfolio Distribution:",
              "// -------------------------------------------------------------------------------------",
              "// Tier           | Speed       | Confidence | Flakiness | Target Ratio",
              "// -------------------------------------------------------------------------------------",
              "// Unit           | < 1ms       | Low-Med    | Zero      | Pure utilities & algorithms",
              "// Component      | ~ 20ms      | Med-High   | Very Low  | Design system & complex forms",
              "// API / DB Int   | ~ 150ms     | Very High  | Low       | Core business workflows (Bulk)",
              "// Playwright E2E | 2s - 10s    | Absolute   | Medium    | 5-10 Critical user journeys",
            ].join("\n"),
            caption: "Testing portfolio matrix for modern web engineering.",
          },
        ],
      },
    ],
    mistake: {
      title: "Mocking the Database in Integration Tests",
      wrong: [
        "// ❌ Mocking Prisma query client completely:",
        "jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: '1', role: 'ADMIN' });",
        "// This tests your mock, NOT your SQL schema, foreign keys, or database constraints!",
      ].join("\n"),
      right: [
        "// ✅ Run tests against a real isolated PostgreSQL database (e.g. Testcontainers or Neon branch):",
        "const user = await prisma.user.create({ data: { email: 'alice@test.com' } });",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Create a Strategy Doc for an E-Commerce Checkout",
      description:
        "Map out test cases across all 4 tiers for a multi-step checkout workflow with promo codes and credit card billing.",
      tasks: [
        "Write 1 Unit test for promo discount calculation math.",
        "Write 1 Integration test for database inventory deduction and order creation.",
        "Write 1 Playwright E2E test verifying full user card submission.",
      ],
    },
    quiz: [
      {
        question: "Why do integration tests with a real database provide higher confidence than unit tests with mocked database queries?",
        options: [
          "They are faster to write.",
          "They verify real SQL syntax, unique index constraints, foreign key cascades, and database triggers that mocks ignore.",
          "They do not require TypeScript.",
          "They run in the browser.",
        ],
        answer: 1,
        explanation:
          "Mocking the ORM masks schema mismatches, missing foreign keys, null constraint violations, and invalid SQL queries.",
      },
    ],
  },

  "p31-l2": {
    id: "p31-l2",
    phaseId: "p31",
    title: "React Testing Library, Properly",
    level: "Advanced",
    minutes: 40,
    summary:
      "Write durable React component tests that survive refactors. Master accessible ARIA role queries (`getByRole`), `user-event` async simulations, and avoiding testing implementation details.",
    prerequisites: ["p04-l1 React Fundamentals", "p31-l1 Testing Map"],
    objectives: [
      "Query DOM elements the way real users and screen readers see them (`getByRole`, `getByLabelText`).",
      "Simulate user actions using `@testing-library/user-event` instead of `fireEvent`.",
      "Avoid checking component state, instance methods, or internal CSS classes.",
    ],
    simple:
      "React Testing Library enforces one core principle: 'The more your tests resemble the way your software is used, the more confidence they can give you.' Instead of checking if `component.state.isOpen === true`, your test clicks the button with the label 'Open Menu' and asserts that the text 'Settings' appears on the screen.",
    why:
      "Tests tied to implementation details break every time you rename an internal variable or switch from useState to useReducer, even when the UI still works perfectly.",
    mentalModel: {
      title: "The Mystery Shopper",
      body:
        "A mystery shopper doesn't inspect the restaurant kitchen's internal plumbing. They sit at the table, order the soup, and verify that hot soup arrives with a spoon. React Testing Library is your automated mystery shopper.",
    },
    sections: [
      {
        heading: "1. Accessible Queries Priority Order",
        body: [
          "Always select elements using this strict priority hierarchy:",
          "1. `getByRole('button', { name: /submit order/i })` (Best: tests accessibility and visible intent).",
          "2. `getByLabelText(/email address/i)` (For form inputs with associated `<label>`).",
          "3. `getByPlaceholderText()` / `getByText()` (For static content).",
          "4. `getByTestId()` (Last resort only when elements lack semantic roles).",
          "**Never query by CSS class name** (`container.querySelector('.btn-primary')`).",
        ],
        code: [
          {
            file: "LoginForm.test.tsx",
            lang: "tsx",
            code: [
              "import { render, screen } from '@testing-library/react';",
              "import userEvent from '@testing-library/user-event';",
              "import { describe, it, expect, vi } from 'vitest';",
              "import { LoginForm } from './LoginForm';",
              "",
              "describe('LoginForm', () => {",
              "  it('submits credentials when valid and handles loading state', async () => {",
              "    const user = userEvent.setup();",
              "    const handleLogin = vi.fn();",
              "    render(<LoginForm onSubmit={handleLogin} />);",
              "",
              "    // Find inputs by accessible labels",
              "    const emailInput = screen.getByLabelText(/email address/i);",
              "    const passwordInput = screen.getByLabelText(/password/i);",
              "    const submitButton = screen.getByRole('button', { name: /sign in/i });",
              "",
              "    // Simulate realistic typing and clicking",
              "    await user.type(emailInput, 'alex@company.com');",
              "    await user.type(passwordInput, 'SuperSecret123!');",
              "    await user.click(submitButton);",
              "",
              "    // Assert submitted payload",
              "    expect(handleLogin).toHaveBeenCalledWith({",
              "      email: 'alex@company.com',",
              "      password: 'SuperSecret123!',",
              "    });",
              "  });",
              "});",
            ].join("\n"),
            caption: "Semantic user-centric component test.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using fireEvent Instead of @testing-library/user-event",
      wrong: [
        "// ❌ fireEvent dispatches synthetic DOM events without firing focus, keydown, keyup, change:",
        "fireEvent.change(input, { target: { value: 'hello' } });",
      ].join("\n"),
      right: [
        "// ✅ userEvent simulates real browser lifecycle (focus -> keypress -> input -> blur):",
        "const user = userEvent.setup();",
        "await user.type(input, 'hello');",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test an Accessible Accordion Component",
      description:
        "Render a multi-section FAQ accordion component, click to expand a section, and assert that `aria-expanded` updates to `'true'` and the panel content is visible.",
      tasks: [
        "Render `<Accordion items={sampleFaqs} />`.",
        "Click the accordion trigger button.",
        "Verify `expect(screen.getByRole('region')).toBeVisible()`.",
      ],
    },
    quiz: [
      {
        question: "Why is screen.getByRole() preferred over screen.getByTestId() in React Testing Library?",
        options: [
          "Because getByRole is faster.",
          "Because getByRole tests that your component is properly structured with accessible HTML semantics and ARIA attributes for screen readers.",
          "Because test IDs are forbidden in React 18.",
          "Because getByRole works on server components.",
        ],
        answer: 1,
        explanation:
          "getByRole ensures your components remain accessible to assistive technologies like screen readers while testing functionality.",
      },
    ],
  },

  "p31-l3": {
    id: "p31-l3",
    phaseId: "p31",
    title: "Nest Services & Controllers Under Test",
    level: "Advanced",
    minutes: 40,
    summary:
      "Harness the NestJS Testbed (`Test.createTestingModule`) for rapid unit and HTTP integration testing. Override dependency injection providers and execute end-to-end HTTP tests with Supertest.",
    prerequisites: ["p10-l1 NestJS Core", "p31-l1 Testing Map"],
    objectives: [
      "Use `Test.createTestingModule` to instantiate isolated NestJS modules.",
      "Override specific providers (`overrideProvider()`) to stub external email or payment gateways.",
      "Execute HTTP integration assertions using `supertest(app.getHttpServer())`.",
    ],
    simple:
      "NestJS has built-in Dependency Injection (DI) specifically designed for testing. In your test suite, you can spin up the real NestJS application, replace just the Stripe payment provider with a fake in-memory test double, and send real HTTP POST requests via Supertest to verify routes, validation pipes, guards, and status codes.",
    why:
      "Testing NestJS at the HTTP layer catches routing bugs, broken DTO pipes, unhandled exception filters, and auth guard misconfigurations.",
    mentalModel: {
      title: "The Lego Brick Swapper",
      body:
        "Because every NestJS service is injected via an interface token, your test can pop out the live 'ResendEmailService' Lego brick and snap in a 'FakeEmailSpy' Lego brick without changing a single line of your controller code.",
    },
    sections: [
      {
        heading: "1. NestJS Testing Module & Supertest Integration",
        body: [
          "1. Build a `TestingModule` importing your controller and services.",
          "2. Use `app.init()` to bootstrap the full HTTP lifecycle (pipes, guards, interceptors).",
          "3. Use `supertest` to make HTTP requests against `app.getHttpServer()`.",
        ],
        code: [
          {
            file: "projects.e2e-spec.ts",
            lang: "ts",
            code: [
              "import { Test, TestingModule } from '@nestjs/testing';",
              "import { INestApplication, ValidationPipe } from '@nestjs/common';",
              "import request from 'supertest';",
              "import { AppModule } from '../src/app.module';",
              "import { PrismaService } from '../src/prisma/prisma.service';",
              "",
              "describe('ProjectsController (E2E)', () => {",
              "  let app: INestApplication;",
              "  let prisma: PrismaService;",
              "",
              "  beforeAll(async () => {",
              "    const moduleFixture: TestingModule = await Test.createTestingModule({",
              "      imports: [AppModule],",
              "    }).compile();",
              "",
              "    app = moduleFixture.createNestApplication();",
              "    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));",
              "    await app.init();",
              "",
              "    prisma = app.get(PrismaService);",
              "  });",
              "",
              "  afterAll(async () => {",
              "    await app.close();",
              "  });",
              "",
              "  it('POST /api/v1/projects creates project and returns 201 Created', async () => {",
              "    const response = await request(app.getHttpServer())",
              "      .post('/api/v1/projects')",
              "      .set('Authorization', 'Bearer mock-valid-jwt')",
              "      .send({ name: 'Alpha Launch', slug: 'alpha-launch' })",
              "      .expect(201);",
              "",
              "    expect(response.body).toHaveProperty('id');",
              "    expect(response.body.slug).toBe('alpha-launch');",
              "  });",
              "});",
            ].join("\n"),
            caption: "NestJS HTTP integration test with Supertest.",
          },
        ],
      },
    ],
    mistake: {
      title: "Forgetting to Attach Global ValidationPipes to the Test Nest Application",
      wrong: [
        "// ❌ Missing app.useGlobalPipes() in beforeAll:",
        "// Result: DTO validation is ignored in tests, allowing invalid test payloads that would fail in production!",
      ].join("\n"),
      right: [
        "// ✅ Apply the exact same global pipes and filters in test setup:",
        "app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test an Auth Guard Rejection",
      description:
        "Write an integration test that calls a protected NestJS endpoint without an Authorization header and asserts `401 Unauthorized`.",
      tasks: [
        "Send GET `/api/v1/projects` with no auth header.",
        "Assert `expect(401)`.",
        "Send GET `/api/v1/projects` with an expired token -> assert 401.",
      ],
    },
    quiz: [
      {
        question: "What does app.getHttpServer() provide to Supertest in a NestJS test?",
        options: [
          "The underlying Node.js http.Server instance to route simulated HTTP requests through the full NestJS middleware/guard pipeline.",
          "A live internet URL.",
          "The database connection pool.",
          "The Redis client.",
        ],
        answer: 0,
        explanation:
          "Supertest hooks into the local http.Server instance to execute real HTTP request/response cycles entirely in memory without requiring open TCP network ports.",
      },
    ],
  },

  "p31-l4": {
    id: "p31-l4",
    phaseId: "p31",
    title: "Prisma Test Databases & Constraint Tests",
    level: "Advanced",
    minutes: 40,
    summary:
      "Set up isolated PostgreSQL test environments using Docker Testcontainers or ephemeral schema branching. Write rigorous tests for unique constraints, cascade deletes, and transaction rollbacks.",
    prerequisites: ["p14-l1 Prisma Core", "p13-l1 Postgres Fundamentals"],
    objectives: [
      "Spin up isolated PostgreSQL containers for test runs using `@testcontainers/postgresql`.",
      "Execute database reset and migration scripts before running test suites.",
      "Write dedicated constraint tests verifying that database indexes prevent duplicate records.",
    ],
    simple:
      "When tests run against a shared database, Test A creating a user named 'admin' can make Test B fail because 'admin' already exists. By spinning up a dedicated Docker Postgres container for each test run (or creating a unique Postgres schema per worker thread), tests run in total isolation at high speed with 0 false failures.",
    why:
      "Testing against SQLite when production uses PostgreSQL masks Postgres-specific JSONB queries, enum types, and concurrency locking behavior.",
    mentalModel: {
      title: "The Sandbox Playground",
      body:
        "Every test run gets its own brand-new box of clean sand. You can build sandcastles, smash them, and throw rocks without messing up the playground for the next kid. When the test ends, the sandbox is incinerated.",
    },
    sections: [
      {
        heading: "1. Testcontainers for True PostgreSQL Parity",
        body: [
          "Never use SQLite in-memory to test a PostgreSQL production app!",
          "Use `testcontainers` to launch a real Docker PostgreSQL container programmatically during the test lifecycle:",
          "1. Start container on ephemeral random port.",
          "2. Run `npx prisma migrate deploy`.",
          "3. Point `DATABASE_URL` to the test container.",
          "4. Run test suite -> terminate container on exit.",
        ],
        code: [
          {
            file: "test-db-setup.ts",
            lang: "ts",
            code: [
              "import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';",
              "import { execSync } from 'child_process';",
              "import { PrismaClient } from '@prisma/client';",
              "",
              "export class TestDatabaseManager {",
              "  private container!: StartedPostgreSqlContainer;",
              "  public prisma!: PrismaClient;",
              "",
              "  async start() {",
              "    // 1. Launch real PostgreSQL 16 Alpine container in Docker",
              "    this.container = await new PostgreSqlContainer('postgres:16-alpine').start();",
              "    const databaseUrl = this.container.getConnectionUri();",
              "    process.env.DATABASE_URL = databaseUrl;",
              "",
              "    // 2. Run Prisma migrations against the clean test container",
              "    execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: databaseUrl } });",
              "",
              "    this.prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });",
              "    await this.prisma.$connect();",
              "  }",
              "",
              "  async stop() {",
              "    await this.prisma.$disconnect();",
              "    await this.container.stop();",
              "  }",
              "}",
            ].join("\n"),
            caption: "Automated Testcontainers PostgreSQL harness.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using SQLite In-Memory for Tests When Production Runs PostgreSQL",
      wrong: [
        "// ❌ schema.prisma with SQLite for testing:",
        "// SQLite does not support: JSONB operators (@>), Enums, ILIKE, Concurrency Row Locks (FOR UPDATE), or CTEs!",
      ].join("\n"),
      right: [
        "// ✅ Always test against the exact same database engine (Postgres) used in production.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Unique Constraint and Foreign Key Cascades",
      description:
        "Write a test that inserts an organization, adds 3 users, deletes the organization, and asserts that all 3 users are cascade deleted from PostgreSQL.",
      tasks: [
        "Create an Org and 3 Users in Prisma.",
        "Execute `prisma.organization.delete({ where: { id: org.id } })`.",
        "Assert `prisma.user.findMany({ where: { orgId: org.id } })` returns `[]`.",
      ],
    },
    quiz: [
      {
        question: "What is the primary benefit of Testcontainers over a locally installed Postgres daemon?",
        options: [
          "It eliminates 'works on my machine' bugs and ensures identical, ephemeral, fully migrated database instances in both local dev and CI/CD runners.",
          "It makes queries 100x faster.",
          "It does not require Docker.",
          "It converts SQL to JSON automatically.",
        ],
        answer: 0,
        explanation:
          "Testcontainers spins up an identical Docker container anywhere Docker runs, providing predictable, isolated test databases in CI/CD without shared state.",
      },
    ],
  },
};
