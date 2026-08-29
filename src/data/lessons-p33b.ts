import type { LessonContent } from "./types";

export const LESSON_CONTENT_P33B: Record<string, LessonContent> = {
  "p33-l4": {
    id: "p33-l4",
    phaseId: "p33",
    title: "Metrics, Traces & Dashboards",
    level: "Advanced",
    minutes: 40,
    summary:
      "Master the Three Pillars of Observability: Logs, Metrics, and Traces. Expose Prometheus metrics with `prom-client` and construct actionable Grafana operational dashboards.",
    prerequisites: ["p33-l1 Structured Logs", "p32-l1 Performance Baselines"],
    objectives: [
      "Distinguish the specific roles of Logs (What happened), Metrics (Aggregated numbers over time), and Traces (Journey of a request).",
      "Instrument custom Prometheus Counter and Histogram metrics using `prom-client`.",
      "Build Grafana dashboards focused on the 4 Golden Signals (Latency, Traffic, Errors, Saturation).",
    ],
    simple:
      "Logs tell you the exact story of 1 request ('User 42 bought shoes'). Metrics tell you the big-picture trend ('We processed 450 requests/sec with a 99.8% success rate'). Traces show you a visual timeline of where time was spent across all your microservices. Together, they give you complete x-ray vision into your cloud systems.",
    why:
      "Looking at raw logs during a massive outage is like searching for a needle in a haystack; high-level metrics dashboards show the exact subsystem on fire in 3 seconds.",
    mentalModel: {
      title: "The Airplane Cockpit Instruments",
      body:
        "The pilot doesn't read the engineer's diary while flying. They glance at 4 dials: Altimeter, Airspeed, Fuel Gauge, and Engine Temp (Metrics). If a warning light turns red, they check the flight computer error code (Logs) and inspect the sensor wiring (Trace).",
    },
    sections: [
      {
        heading: "1. The 4 Golden Signals of Observability (Google SRE)",
        body: [
          "1. **Latency**: How long requests take (p50, p95, p99 histograms).",
          "2. **Traffic**: Demand on your system (HTTP requests per second).",
          "3. **Errors**: Rate of failed requests (HTTP 5xx rate vs total requests).",
          "4. **Saturation**: How full your resources are (Node.js event loop delay, DB connection pool usage, CPU/Memory %).",
        ],
        code: [
          {
            file: "metrics.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import client from 'prom-client';",
              "",
              "// Initialize default system metrics (CPU, RAM, Event Loop Delay)",
              "client.collectDefaultMetrics();",
              "",
              "export const httpRequestDurationHistogram = new client.Histogram({",
              "  name: 'http_request_duration_seconds',",
              "  help: 'Duration of HTTP requests in seconds',",
              "  labelNames: ['method', 'route', 'status_code'],",
              "  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5],",
              "});",
              "",
              "export const activeWebsocketGauge = new client.Gauge({",
              "  name: 'websocket_active_connections_total',",
              "  help: 'Current active WebSocket client connections',",
              "});",
            ].join("\n"),
            caption: "Prometheus Prometheus metric collectors in TypeScript.",
          },
        ],
      },
    ],
    mistake: {
      title: "Creating High-Cardinality Prometheus Labels (e.g. Using User IDs as Labels)",
      wrong: [
        "// ❌ Labeling metrics with unique userId or email:",
        "httpRequestDurationHistogram.labels({ user_id: req.user.id }).observe(duration);",
        "// Generates millions of distinct time-series in memory, crashing Prometheus!",
      ].join("\n"),
      right: [
        "// ✅ Use bounded, low-cardinality labels only (method, route, statusCode):",
        "httpRequestDurationHistogram.labels({ method: req.method, route: '/api/v1/projects', status_code: '200' }).observe(duration);",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Expose a /metrics Endpoint for Prometheus Scrapers",
      description:
        "Build a `GET /metrics` route in NestJS returning standard Prometheus exposition format and verify metrics increment upon API requests.",
      tasks: [
        "Create `MetricsController` with `GET /metrics` returning `client.register.metrics()`.",
        "Hit API routes with 50 requests.",
        "Curl `/metrics` and confirm `http_request_duration_seconds_count 50` is present.",
      ],
    },
    quiz: [
      {
        question: "Why is putting high-cardinality values (like email or UUID) into Prometheus metric labels dangerous?",
        options: [
          "It causes Prometheus to allocate a new time-series for every single user, rapidly exhausting memory and crashing the monitoring server.",
          "It makes TypeScript fail to compile.",
          "It breaches HTTPS encryption.",
          "It disables JSON formatting.",
        ],
        answer: 0,
        explanation:
          "High cardinality exponentially multiplies time-series storage, causing memory exhaustion in Prometheus.",
      },
    ],
  },

  "p33-l5": {
    id: "p33-l5",
    phaseId: "p33",
    title: "Health, Readiness & Uptime Checks",
    level: "Advanced",
    minutes: 30,
    summary:
      "Implement industry-standard Kubernetes / Cloud Run health probes. Distinguish `/healthz` (Liveness) from `/readyz` (Readiness) with Terminus.",
    prerequisites: ["p10-l1 NestJS Core", "p13-l1 Postgres Fundamentals"],
    objectives: [
      "Understand the difference between Liveness Probes (is the process alive?) and Readiness Probes (can the process accept traffic?).",
      "Implement `@nestjs/terminus` health checks validating PostgreSQL, Redis, and disk memory.",
      "Configure external uptime monitoring (BetterStack / Pingdom) with synthetic status checks.",
    ],
    simple:
      "When your server starts up or runs a heavy database migration, it might take 10 seconds before it's ready to handle user requests. A Readiness check (`/readyz`) tells load balancers: 'Don't send traffic to this server yet!' A Liveness check (`/healthz`) detects if Node.js has frozen in a deadlock and instructs the orchestrator to automatically kill and restart the container.",
    why:
      "Conflating liveness and readiness causes Kubernetes to restart containers continuously during minor database hiccups, worsening outages.",
    mentalModel: {
      title: "The Restaurant Hostess and the Kitchen",
      body:
        "Liveness check: 'Is the chef breathing?' (Yes -> keep the kitchen open; No -> call an ambulance). Readiness check: 'Is the grill preheated and ingredients prepped?' (Yes -> seat customers; No -> ask customers to wait at the bar).",
    },
    sections: [
      {
        heading: "1. Terminus Health Check Module Implementation",
        body: [
          "- `/healthz/liveness`: Returns `200 OK` if Node.js event loop is responsive. Never checks external databases.",
          "- `/healthz/readiness`: Verifies PostgreSQL connection, Redis ping, and BullMQ queue availability.",
        ],
        code: [
          {
            file: "health.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Get } from '@nestjs/common';",
              "import { HealthCheck, HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "",
              "@Controller('healthz')",
              "export class HealthController {",
              "  constructor(",
              "    private health: HealthCheckService,",
              "    private prismaIndicator: PrismaHealthIndicator,",
              "    private memory: MemoryHealthIndicator,",
              "    private prisma: PrismaService,",
              "  ) {}",
              "",
              "  @Get('liveness')",
              "  @HealthCheck()",
              "  checkLiveness() {",
              "    // Process is alive and heap is under 300MB",
              "    return this.health.check([",
              "      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),",
              "    ]);",
              "  }",
              "",
              "  @Get('readiness')",
              "  @HealthCheck()",
              "  checkReadiness() {",
              "    // Ready to serve traffic only if PostgreSQL is responsive",
              "    return this.health.check([",
              "      () => this.prismaIndicator.pingCheck('database', this.prisma),",
              "    ]);",
              "  }",
              "}",
            ].join("\n"),
            caption: "NestJS Terminus Liveness & Readiness health probe controller.",
          },
        ],
      },
    ],
    mistake: {
      title: "Checking PostgreSQL in the Liveness Probe",
      wrong: [
        "// ❌ Checking database in /healthz (Liveness):",
        "// If PostgreSQL has a brief 5-second restart, Kubernetes will kill and restart ALL 50 application pods simultaneously, creating a catastrophic restart loop!",
      ].join("\n"),
      right: [
        "// ✅ Check database only in /readyz (Readiness) so traffic is paused without killing healthy application processes.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Load Balancer Traffic Shifting on Readiness Failure",
      description:
        "Simulate a database disconnection and verify that `/healthz/readiness` returns 503 while `/healthz/liveness` returns 200.",
      tasks: [
        "Call `/healthz/liveness` -> expect 200 OK.",
        "Disconnect database client.",
        "Call `/healthz/readiness` -> expect 503 Service Unavailable.",
      ],
    },
    quiz: [
      {
        question: "What action does a container orchestrator (Kubernetes/Cloud Run) take when a Liveness probe fails vs a Readiness probe fails?",
        options: [
          "Liveness failure kills and restarts the container; Readiness failure stops sending incoming HTTP traffic to the container without killing it.",
          "Both actions delete the container.",
          "Readiness formats the hard drive.",
          "Liveness sends an email to the user.",
        ],
        answer: 0,
        explanation:
          "Liveness probes determine if a process needs a hard reboot, while Readiness probes control traffic ingress routing.",
      },
    ],
  },

  "p33-l6": {
    id: "p33-l6",
    phaseId: "p33",
    title: "Follow One Request Across Every Boundary",
    level: "Advanced",
    minutes: 45,
    summary:
      "Execute an end-to-end incident debugging drill. Trace a single production transaction from React client, across API gateway, through NestJS guards, down to PostgreSQL queries, into BullMQ background workers, and out to Stripe webhooks.",
    prerequisites: ["p33-l1 Structured Logs", "p33-l4 Metrics & Traces", "p29-l6 Payment Workflows"],
    objectives: [
      "Correlate OpenTelemetry distributed spans across multiple async boundaries.",
      "Conduct a realistic 3:00 AM incident postmortem walkthrough using logs, metrics, and traces.",
      "Author an actionable Incident Retrospective document with Root Cause Analysis (RCA).",
    ],
    simple:
      "In modern full-stack architectures, a single user click initiates a complex journey: React sends an HTTP POST -> Cloudflare -> API Gateway -> NestJS Guard -> PostgreSQL Insert -> BullMQ Job Enqueued -> Redis -> Worker Process -> Stripe API -> Webhook Callback. Following this single request across every hop with a distributed trace ID is the master skill of senior engineers.",
    why:
      "When critical payment transactions fail intermittently, distributed tracing is the only way to pinpoint the exact failure point in seconds.",
    mentalModel: {
      title: "The Relay Race Baton Camera",
      body:
        "Imagine a tiny Go-Pro camera attached to the baton in a 4x100m Olympic relay race. You can watch the handoff from Runner 1 to Runner 2 to Runner 3 in a continuous video. OpenTelemetry distributed tracing is the baton camera for your data packets.",
    },
    sections: [
      {
        heading: "1. The 7-Hop Transaction Journey",
        body: [
          "1. **Browser**: User clicks 'Confirm Purchase' -> Generates `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`.",
          "2. **Edge Proxy**: Cloudflare / Nginx forwards trace header.",
          "3. **NestJS API**: Parses trace, executes auth guard, starts span `create-order`.",
          "4. **PostgreSQL**: Prisma executes transaction inside child span `db.query`.",
          "5. **BullMQ**: Pushes job to Redis containing `{ traceparent }` in payload.",
          "6. **Background Worker**: Worker picks up job, continues root trace span `process-fulfillment`.",
          "7. **External Provider**: Worker calls Stripe with correlation ID.",
        ],
        code: [
          {
            file: "opentelemetry-tracer.ts",
            lang: "ts",
            code: [
              "import { trace, context } from '@opentelemetry/api';",
              "",
              "const tracer = trace.getTracer('taskforge-order-service');",
              "",
              "export async function processOrderWithTrace(orderData: any) {",
              "  // Wrap business logic in an OpenTelemetry Distributed Span",
              "  return await tracer.startActiveSpan('processOrderWorkflow', async (span) => {",
              "    try {",
              "      span.setAttribute('order.amount', orderData.amount);",
              "      span.setAttribute('customer.id', orderData.customerId);",
              "",
              "      // Step 1: Database mutation",
              "      const order = await saveOrderToDatabase(orderData);",
              "",
              "      // Step 2: Queue background payment job",
              "      await enqueuePaymentJob(order.id, span.spanContext().traceId);",
              "",
              "      span.setStatus({ code: 1 }); // OK",
              "      return order;",
              "    } catch (err: any) {",
              "      span.recordException(err);",
              "      span.setStatus({ code: 2, message: err.message }); // ERROR",
              "      throw err;",
              "    } finally {",
              "      span.end();",
              "    }",
              "  });",
              "}",
            ].join("\n"),
            caption: "OpenTelemetry manual span instrumentation for multi-hop tracing.",
          },
        ],
      },
    ],
    mistake: {
      title: "Dropping Trace Context When Pushing Jobs to Background Queues",
      wrong: [
        "// ❌ Enqueueing job without traceparent:",
        "await queue.add('charge-card', { orderId });",
        "// Breaks the distributed trace! The worker log is now completely disconnected from the original user request.",
      ].join("\n"),
      right: [
        "// ✅ Pass trace headers in queue payload and re-attach context in worker:",
        "await queue.add('charge-card', { orderId, traceId: currentSpan.traceId });",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Conduct a 3:00 AM Incident Postmortem Drill",
      description:
        "Simulate an asynchronous payment webhook failure, locate the failing hop using trace IDs across server and worker logs, and write a 1-page Root Cause Analysis (RCA).",
      tasks: [
        "Follow a failed trace ID through API -> DB -> Worker.",
        "Identify the root cause (e.g. expired webhook secret).",
        "Draft an RCA with Timeline, Root Cause, and Preventive Action Items.",
      ],
    },
    quiz: [
      {
        question: "What is the primary value of W3C Trace Context (traceparent header) in distributed microservices?",
        options: [
          "It provides a standardized HTTP header format allowing different services, databases, and background queues to correlate and stitch spans into a single unified waterfall timeline.",
          "It encrypts database rows.",
          "It compresses JSON responses.",
          "It manages CSS transitions.",
        ],
        answer: 0,
        explanation:
          "The W3C Trace Context standard defines traceparent and tracestate headers so distributed APMs can assemble complete multi-service call trees.",
      },
    ],
  },
};
