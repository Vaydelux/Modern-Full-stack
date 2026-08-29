import type { LessonContent } from "./types";

export const LESSON_CONTENT_P38B: Record<string, LessonContent> = {
  "p38-l4": {
    id: "p38-l4",
    phaseId: "p38",
    title: "Auth Callbacks, Pooler URLs & Secret Rotation",
    level: "Mastery",
    minutes: 35,
    summary:
      "Configure OAuth redirect URI whitelists, Supabase/Neon connection poolers (PgBouncer vs Direct migration URLs), and zero-downtime secret rotation procedures.",
    prerequisites: ["p16-l1 Supabase Core", "p17-l1 Supabase Auth", "p14-l1 Prisma Core"],
    objectives: [
      "Distinguish Transaction Pooler URLs (Port 6543) for runtime apps from Session/Direct URLs (Port 5432) for migrations.",
      "Configure production OAuth provider callback redirect URIs across staging, preview, and production domains.",
      "Execute safe zero-downtime API secret and database password rotation.",
    ],
    simple:
      "When connecting serverless or container apps to PostgreSQL, 500 instances opening direct connections will instantly crash Postgres. A Connection Pooler (PgBouncer on Port 6543) multiplexes 5,000 application requests over 20 pooled database connections. However, schema migrations (`prisma migrate`) require Direct connections (Port 5432) because poolers do not support advisory schema locks.",
    why:
      "Using pooler URLs for schema migrations causes silent migration failures, while using direct URLs for serverless apps crashes database connections.",
    mentalModel: {
      title: "The Airport Shuttle Bus",
      body:
        "Instead of 100 passengers driving 100 individual cars onto the airport runway (Direct DB connections), passengers board 3 large shuttle buses (Connection Pooler) that transport everyone efficiently.",
    },
    sections: [
      {
        heading: "1. Prisma Multi-URL Configuration",
        body: [
          "- `DATABASE_URL`: Transaction pooler URL (e.g. Supabase port 6543 with `?pgbouncer=true`).",
          "- `DIRECT_URL`: Direct PostgreSQL connection URL (port 5432) for running migrations.",
        ],
        code: [
          {
            file: "prisma/schema.prisma",
            lang: "prisma",
            code: [
              "datasource db {",
              "  provider  = \"postgresql\"",
              "  url       = env(\"DATABASE_URL\") // Pooled runtime URL (Port 6543)",
              "  directUrl = env(\"DIRECT_URL\")   // Direct migration URL (Port 5432)",
              "}",
            ].join("\n"),
            caption: "Prisma schema dual URL configuration for connection pooling.",
          },
        ],
      },
    ],
    mistake: {
      title: "Forgetting to Whitelist Production Domain in OAuth Provider Consoles (Google / GitHub)",
      wrong: [
        "// ❌ Leaving OAuth redirect URI set only to `http://localhost:3000/api/auth/callback`:",
        "// Production users clicking 'Login with Google' will receive an immediate 'redirect_uri_mismatch' error!",
      ].join("\n"),
      right: [
        "// ✅ Add `https://taskforge.com/api/auth/callback` to Google and GitHub OAuth client consoles before launch.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Configure Dual Database URLs in Prisma",
      description:
        "Set up `DATABASE_URL` (pooler) and `DIRECT_URL` (direct) in `.env`, run `prisma migrate deploy`, and verify Prisma uses the direct connection for migrations.",
      tasks: [
        "Update `prisma/schema.prisma` with `directUrl`.",
        "Run `npx prisma migrate deploy`.",
        "Verify successful schema synchronization.",
      ],
    },
    quiz: [
      {
        question: "Why must Prisma schema migrations use a 'directUrl' rather than a PgBouncer connection pooler URL?",
        options: [
          "Connection poolers in transaction mode do not support PostgreSQL advisory locks and prepared statements required by Prisma to guarantee atomic migration execution.",
          "Because PgBouncer only supports MySQL.",
          "To speed up CSS builds.",
          "Because direct URLs are cheaper.",
        ],
        answer: 0,
        explanation:
          "PgBouncer transaction pooling cleans connection session state between queries, breaking Prisma migration advisory locks.",
      },
    ],
  },

  "p38-l5": {
    id: "p38-l5",
    phaseId: "p38",
    title: "Smoke Tests, Previews/Staging & Forward-Fix",
    level: "Mastery",
    minutes: 35,
    summary:
      "Execute automated post-deployment synthetic Smoke Tests. Verify live production database read/writes, authentication flows, and payment endpoints within 30 seconds of deploy.",
    prerequisites: ["p31-l1 Testing Fundamentals", "p38-l1 Next.js Deployment"],
    objectives: [
      "Author synthetic smoke test scripts running against live staging and production domains.",
      "Validate end-to-end user journeys (Sign up -> Create Project -> Export) post-deploy.",
      "Execute fast 'Forward-Fix' deployments when minor regressions are detected in production.",
    ],
    simple:
      "A deploy isn't finished when the CI pipeline turns green. A deployment is only finished when a synthetic robot user executes an automated 'Smoke Test' on the live production URL: logging in, creating a test record, and deleting it. If the smoke test fails, alerting triggers immediately.",
    why:
      "Automated smoke tests catch production environment mismatches (e.g. a missing production environment variable) before real customers hit the bug.",
    mentalModel: {
      title: "The Fire Alarm Bell Test",
      body:
        "After electricians install a new fire alarm system in a skyscraper, they don't wait for a real fire to test it. They pull the test switch, verify the alarms ring on all 50 floors, and reset it.",
    },
    sections: [
      {
        heading: "1. Synthetic Production Smoke Test Script",
        body: [
          "- Runs in <10 seconds via lightweight fetch calls.",
          "- Validates health endpoints, database reads, and auth token generation.",
        ],
        code: [
          {
            file: "scripts/smoke-test.mjs",
            lang: "javascript",
            code: [
              "const PROD_URL = process.env.TARGET_URL || 'https://api.taskforge.com';",
              "",
              "async function runSmokeTests() {",
              "  console.log(`Running smoke tests against: ${PROD_URL}`);",
              "",
              "  // 1. Health Probe",
              "  const healthRes = await fetch(`${PROD_URL}/healthz/readiness`);",
              "  if (!healthRes.ok) throw new Error(`Health check failed with status: ${healthRes.status}`);",
              "  console.log('✓ Health check passed');",
              "",
              "  // 2. Public API Probe",
              "  const configRes = await fetch(`${PROD_URL}/api/v1/public/config`);",
              "  if (!configRes.ok) throw new Error(`Public config endpoint failed: ${configRes.status}`);",
              "  console.log('✓ Public API reachable');",
              "",
              "  console.log('🎉 All production smoke tests passed successfully!');",
              "}",
              "runSmokeTests().catch((err) => {",
              "  console.error('❌ SMOKE TEST FAILED:', err.message);",
              "  process.exit(1);",
              "});",
            ].join("\n"),
            caption: "Lightweight synthetic production smoke test script.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Synthetic Write Smoke Tests that Pollute Production Analytics and Real User Data",
      wrong: [
        "// ❌ Smoke test creating 500 permanent fake users named 'test_user_99' in production database:",
        "// Corrupts monthly active user (MAU) metrics and bloats customer databases!",
      ].join("\n"),
      right: [
        "// ✅ Use dedicated test organization tenants or clean up test records in a `finally {}` block.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Integrate Post-Deploy Smoke Tests in GitHub Actions",
      description:
        "Add a `smoke-test` job to your CD workflow that runs immediately after production deployment and fails the release if live endpoints error.",
      tasks: [
        "Create `scripts/smoke-test.mjs`.",
        "Add post-deploy step in `.github/workflows/deploy.yml`.",
        "Verify CI runner validates live site health.",
      ],
    },
    quiz: [
      {
        question: "What is the primary function of a post-deployment 'Smoke Test'?",
        options: [
          "To quickly verify that critical production systems (database connections, routing, public endpoints) are functioning correctly in the live environment immediately following a release.",
          "To test smoke detectors in the office.",
          "To format the hard drive.",
          "To minify JavaScript code.",
        ],
        answer: 0,
        explanation:
          "Smoke tests provide rapid validation that core services are operational in the target live environment.",
      },
    ],
  },

  "p38-l6": {
    id: "p38-l6",
    phaseId: "p38",
    title: "Never Just Click Deploy: The Operations Checklist",
    level: "Mastery",
    minutes: 30,
    summary:
      "Execute the definitive 12-point Production Launch Checklist. Audit environment secrets, database backup schedules, alerting channels, rate limits, and rollback runbooks before public launch.",
    prerequisites: ["p38-l1 Next.js Deployment", "p38-l2 NestJS Deployment", "p33-l1 Structured Logs"],
    objectives: [
      "Execute the comprehensive 12-point Production Pre-Flight Checklist.",
      "Draft concise, actionable Incident Runbooks for on-call engineers.",
      "Verify backup restoration procedures before declaring general availability (GA).",
    ],
    simple:
      "Launching a software product to real paying customers is a serious milestone. Senior engineers never 'just hit deploy and go to sleep'. They follow a rigorous pre-flight checklist: confirming database automated backups are running, error alerting is connected to Slack/PagerDuty, rate limits protect against bots, and DNS SSL certificates are valid.",
    why:
      "Following a standardized launch checklist prevents 95% of launch-day outages and customer data loss incidents.",
    mentalModel: {
      title: "The Space Shuttle Launch Countdown",
      body:
        "Every flight controller must say 'GO for Launch' across 12 distinct consoles (Propulsion, Guidance, Electrical, Communications). A single 'NO-GO' halts the launch until resolved.",
    },
    sections: [
      {
        heading: "1. The 12-Point Production Go-Live Checklist",
        body: [
          "1. **Environment Variables**: All production keys configured; zero `localhost` references.",
          "2. **Database Backups**: Automated daily snapshots and point-in-time recovery (PITR) enabled.",
          "3. **Connection Pooling**: PgBouncer / pooler URL active on runtime servers.",
          "4. **CORS & Domain Whitelisting**: Strict origin rules configured; wildcards removed.",
          "5. **Error Monitoring**: Sentry / Datadog initialized with release version tags.",
          "6. **Rate Limiting**: Throttler active on auth and sensitive endpoints.",
          "7. **Security Headers**: Helmet enabled (CSP, HSTS, X-Frame-Options).",
          "8. **Logging & Redaction**: JSON logging active; passwords and tokens redacted.",
          "9. **OAuth Callbacks**: Production domain registered with Google/GitHub consoles.",
          "10. **Custom Domain & SSL**: DNS propagated; TLS certificate verified.",
          "11. **Health Checks**: `/healthz/liveness` and `/healthz/readiness` operational.",
          "12. **On-Call Runbook**: Documented restart and forward-fix procedures for team.",
        ],
      },
    ],
    mistake: {
      title: "Assuming Database Backups Are Working Without Testing a Restoration",
      wrong: [
        "// ❌ Trusting that backups exist without ever testing a restore:",
        "// Many companies discover their backups were corrupted or empty only after an outage occurs!",
      ].join("\n"),
      right: [
        "// ✅ Perform a monthly drill: restore a production backup snapshot to a staging database and verify data integrity.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Complete and Sign the Production Launch Checklist",
      description:
        "Audit a live application against all 12 points of the Go-Live Checklist, document remediation for any failing items, and create the Incident Runbook.",
      tasks: [
        "Audit environment variables and CORS headers.",
        "Verify automated database backup schedules in cloud console.",
        "Produce signed `LAUNCH_READINESS_REPORT.md`.",
      ],
    },
    quiz: [
      {
        question: "Why is practicing a database backup restoration drill critical before public product launch?",
        options: [
          "Because unverified backups frequently fail during real disaster recovery due to corrupted dumps, missing encryption keys, or incompatible database versions.",
          "To test internet bandwidth.",
          "To generate new passwords.",
          "Because SQL requires a monthly reboot.",
        ],
        answer: 0,
        explanation:
          "An untested backup is not a valid backup; regular restore drills ensure data recovery procedures work under pressure.",
      },
    ],
  },
};
