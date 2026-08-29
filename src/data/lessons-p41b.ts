import type { LessonContent } from "./types";

export const LESSON_CONTENT_P41B: Record<string, LessonContent> = {
  "p41-m4": {
    id: "p41-m4",
    phaseId: "p41",
    title: "Milestone: Files, Notifications & Jobs",
    level: "Mastery",
    minutes: 120,
    summary:
      "Integrate BullMQ background queues for asynchronous email notifications (@mentions, task assignments), scheduled overdue task digests, and file attachment virus scanning.",
    prerequisites: ["p29-l1 BullMQ", "p41-m2 Tasks Domain"],
    objectives: [
      "Process async notification jobs with BullMQ and Redis.",
      "Send transactional emails via Resend adapter with HTML templates.",
      "Broadcast real-time task updates via Supabase Realtime channel subscriptions.",
    ],
    simple:
      "When a user assigns a task to 5 teammates or uploads a 20MB attachment, the API response returns in 15ms. In the background, BullMQ workers handle generating avatar thumbnails, checking for @mentions, and sending personalized email alerts. If the email provider experiences a momentary glitch, BullMQ automatically retries with exponential backoff.",
    why:
      "Background worker orchestration keeps user-facing web interactions instantaneous.",
    mentalModel: {
      title: "The Office Mail Courier",
      body:
        "When an executive finishes writing a memo, they drop it in the Outbox tray and continue working on the next project. The mail courier picks up the tray, stamps the envelopes, and delivers them across the building.",
    },
    sections: [
      {
        heading: "1. BullMQ Email Notification Worker",
        body: [
          "- Job payload contains recipient, template type, and template variables.",
          "- Automatically retries up to 3 times with exponential backoff.",
        ],
        code: [
          {
            file: "src/notifications/notification.processor.ts",
            lang: "ts",
            code: [
              "import { Processor, WorkerHost } from '@nestjs/bullmq';",
              "import { Job } from 'bullmq';",
              "import { Injectable } from '@nestjs/common';",
              "import { ResendEmailAdapter } from './resend-email.adapter';",
              "",
              "@Processor('notifications')",
              "@Injectable()",
              "export class NotificationProcessor extends WorkerHost {",
              "  constructor(private emailService: ResendEmailAdapter) {",
              "    super();",
              "  }",
              "",
              "  async process(job: Job<{ to: string; taskTitle: string; assignerName: string }>): Promise<any> {",
              "    const { to, taskTitle, assignerName } = job.data;",
              "    await this.emailService.sendEmail({",
              "      to,",
              "      subject: `${assignerName} assigned you a task: ${taskTitle}`,",
              "      html: `<p>You have been assigned to <strong>${taskTitle}</strong> by ${assignerName}.</p>`,",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "BullMQ worker processing async notification dispatches.",
          },
        ],
      },
    ],
    mistake: {
      title: "Calling Synchronous Email APIs Directly Inside the HTTP Request Handler",
      wrong: [
        "// ❌ Synchronous email send in controller:\nawait resend.emails.send(...);\n// Adds 800ms of latency to the user's task creation button click!",
      ].join("\n"),
      right: [
        "// ✅ Enqueue a background job in Redis (taking 1ms): `await notificationQueue.add('send-email', payload);`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build the Overdue Task Daily Cron Worker",
      description:
        "Configure a repeatable BullMQ cron job that runs daily at 8:00 AM, finds all overdue tasks in PostgreSQL, and queues individual digest notifications.",
      tasks: [
        "Create repeatable job `cron: '0 8 * * *'`.",
        "Query overdue tasks with Prisma.",
        "Enqueue batch notification jobs into Redis queue.",
      ],
    },
    quiz: [
      {
        question: "What is the advantage of using a dedicated job queue (BullMQ) for sending emails rather than executing them in the HTTP handler?",
        options: [
          "It prevents slow third-party email API response latencies from delaying the user's HTTP request, and provides automatic retries if the email provider fails.",
          "It makes emails encrypted with SSL.",
          "It compresses images automatically.",
          "It deletes the user's account.",
        ],
        answer: 0,
        explanation:
          "Queues decouple user-facing response times from third-party network latencies and guarantee retry resilience.",
      },
    ],
  },

  "p41-m5": {
    id: "p41-m5",
    phaseId: "p41",
    title: "Milestone: Tests, CI/CD & Monitoring",
    level: "Mastery",
    minutes: 90,
    summary:
      "Author the complete automated testing suite for TaskForge (Unit, E2E, Tenancy Security), configure GitHub Actions CI pipelines, and connect Sentry error monitoring.",
    prerequisites: ["p31-l1 Testing Fundamentals", "p37-l1 GitHub Actions Basics"],
    objectives: [
      "Write Playwright E2E tests simulating multi-user Kanban workflows.",
      "Execute automated security tests verifying cross-tenant IDOR isolation.",
      "Configure Sentry SDK with distributed trace headers linking React frontend to NestJS backend.",
    ],
    simple:
      "In this milestone, we wrap TaskForge in a steel cage of automated tests. We write Unit tests for business calculations, Integration tests for Prisma transactions, and Playwright browser tests that log in two different users in separate browser contexts to verify real-time collaboration. All tests run on every Pull Request via GitHub Actions.",
    why:
      "Comprehensive test coverage gives you the confidence to refactor and deploy continuously.",
    mentalModel: {
      title: "The Automotive Crash Test Facility",
      body:
        "Car manufacturers crash 50 test vehicles with crash dummies and sensors into concrete walls at 60 MPH before shipping the model to consumer dealerships.",
    },
    sections: [
      {
        heading: "1. Multi-User Playwright Real-Time Test",
        body: [
          "- Spawns two independent browser incognito contexts: User A (Project Manager) and User B (Developer).",
          "- User A creates a task; User B verifies the task appears in real-time on their screen.",
        ],
        code: [
          {
            file: "e2e/collaboration.spec.ts",
            lang: "ts",
            code: [
              "import { test, expect } from '@playwright/test';",
              "",
              "test('real-time task creation across two browser sessions', async ({ browser }) => {",
              "  const contextA = await browser.newContext();",
              "  const contextB = await browser.newContext();",
              "  const pageA = await contextA.newPage();",
              "  const pageB = await contextB.newPage();",
              "",
              "  // Both users open the same project board",
              "  await pageA.goto('http://localhost:3000/workspaces/ws-1/projects/p-1');",
              "  await pageB.goto('http://localhost:3000/workspaces/ws-1/projects/p-1');",
              "",
              "  // User A creates a new task",
              "  await pageA.click('[data-testid=\"add-task-btn\"]');",
              "  await pageA.fill('[data-testid=\"task-title-input\"]', 'Fix Production CORS Bug');",
              "  await pageA.press('[data-testid=\"task-title-input\"]', 'Enter');",
              "",
              "  // User B sees the new card appear via real-time WebSocket subscription",
              "  await expect(pageB.locator('text=Fix Production CORS Bug')).toBeVisible({ timeout: 5000 });",
              "});",
            ].join("\n"),
            caption: "Playwright multi-user real-time collaboration test.",
          },
        ],
      },
    ],
    mistake: {
      title: "Testing Permissions Only in UI Components While Leaving Backend APIs Unprotected",
      wrong: [
        "// ❌ Hiding delete button in React: `{user.isAdmin && <button>Delete</button>}`",
        "// But forgetting to check `user.isAdmin` on the `DELETE /api/projects/:id` NestJS endpoint!",
      ].join("\n"),
      right: [
        "// ✅ Author direct API integration tests attacking protected endpoints with unprivileged user tokens.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author Automated IDOR Penetration Test Suite",
      description:
        "Write Supertest integration tests creating User A and User B, and assert that User B receives `403 Forbidden` on every CRUD action targeting User A's workspace.",
      tasks: [
        "Create Supertest test file `test/tenancy.e2e-spec.ts`.",
        "Seed two distinct tenant accounts.",
        "Execute 10 IDOR attack requests and assert 403 status on each.",
      ],
    },
    quiz: [
      {
        question: "Why are multi-context Playwright tests critical for testing real-time collaborative applications?",
        options: [
          "They allow simulating two independent human users simultaneously in isolated browser sessions to verify WebSocket event broadcasts and state synchronization.",
          "They compile CSS faster.",
          "They reduce server CPU.",
          "They bypass authentication.",
        ],
        answer: 0,
        explanation:
          "Multi-context browser testing validates that events published by User A correctly synchronize to User B's interface in real time.",
      },
    ],
  },

  "p41-m6": {
    id: "p41-m6",
    phaseId: "p41",
    title: "Milestone: Deploy + Production Readiness Scorecard",
    level: "Mastery",
    minutes: 90,
    summary:
      "Deploy TaskForge to production (Next.js on edge + NestJS on Railway + Supabase Postgres + Redis). Audit against the Production Readiness Scorecard for graduation.",
    prerequisites: ["p38-l1 Next.js Deployment", "p38-l6 Operations Checklist", "p41-m5 Testing"],
    objectives: [
      "Deploy live Next.js web application and containerized NestJS API with custom domain and SSL.",
      "Execute the 100-Point Production Readiness Scorecard.",
      "Produce comprehensive system architecture diagrams, ERDs, and on-call Incident Runbooks.",
    ],
    simple:
      "The culmination of TaskForge: the live SaaS is deployed, fully connected to production databases, running background workers, equipped with structured JSON logging, Sentry error telemetry, and passing 100% of automated CI checks. You defend your architecture against the Production Readiness Scorecard.",
    why:
      "Deploying a production-grade full-stack SaaS from scratch proves end-to-end full-stack mastery.",
    mentalModel: {
      title: "The Master Craftsman Final Guild Piece",
      body:
        "In medieval guilds, an apprentice carpenter had to build a complete, flawless clock or cabinet using all the tools of the trade before being officially declared a Master Craftsman.",
    },
    sections: [
      {
        heading: "1. The 100-Point Production Readiness Scorecard",
        body: [
          "- **Security (25 pts)**: Zero IDOR vulnerabilities, strict CSP headers, JWT expiration & refresh rotation, secret redaction in logs.",
          "- **Data & Scaling (25 pts)**: Connection pooling active, PITR backups configured, full-text GIN search, cursor pagination.",
          "- **Reliability (25 pts)**: BullMQ exponential retries, Liveness/Readiness probes, Graceful SIGTERM shutdown, synthetic smoke tests.",
          "- **Operations (25 pts)**: Zero-warning CI pipeline, Sentry release tracking, structured JSON logs with correlation IDs, written Incident Runbook.",
        ],
      },
    ],
    mistake: {
      title: "Launching to Production Without an Incident Runbook for Database Reconnection Failures",
      wrong: [
        "// ❌ Scrambling in panic during a midnight outage trying to remember server passwords and restart commands.",
      ].join("\n"),
      right: [
        "// ✅ Document exact step-by-step remediation procedures in `docs/runbooks/incident-response.md`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Final Production Readiness Audit & Defense",
      description:
        "Audit the deployed TaskForge application against all 4 categories of the Production Readiness Scorecard, verify live smoke tests pass, and generate the final graduation report.",
      tasks: [
        "Run live production smoke test script.",
        "Verify Sentry captures test error with correct release tag.",
        "Produce signed `TASKFORGE_PRODUCTION_READINESS_SCORECARD.md`.",
      ],
    },
    quiz: [
      {
        question: "Which four categories constitute the comprehensive Production Readiness Scorecard for modern SaaS applications?",
        options: [
          "Security, Data & Scaling, Reliability, and Operations / Observability.",
          "Color palette, Logo size, Font choice, and CSS framework.",
          "Keyboard shortcuts, Screen resolution, Browser tabs, and Memory size.",
          "Twitter followers, GitHub stars, Discord members, and YouTube views.",
        ],
        answer: 0,
        explanation:
          "A production-ready SaaS is measured by rigorous standards across Security, Data Architecture, System Reliability, and Operational Observability.",
      },
    ],
  },
};
