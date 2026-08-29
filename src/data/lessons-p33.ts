import type { LessonContent } from "./types";

export const LESSON_CONTENT_P33: Record<string, LessonContent> = {
  "p33-l1": {
    id: "p33-l1",
    phaseId: "p33",
    title: "Structured Logs & Correlation IDs",
    level: "Advanced",
    minutes: 35,
    summary:
      "Transform chaotic string console logs into machine-searchable JSON. Propagate `x-request-id` correlation headers across microservices to trace individual user transactions effortlessly.",
    prerequisites: ["p07-l1 HTTP Fundamentals", "p10-l1 NestJS Core"],
    objectives: [
      "Format all production logs as single-line structured JSON (Pino / Winston).",
      "Inject and propagate `x-request-id` correlation IDs across incoming and outgoing HTTP hops using AsyncLocalStorage.",
      "Redact PII (passwords, credit cards, auth tokens) automatically at the logging layer.",
    ],
    simple:
      "When 1,000 users use your app simultaneously, text logs like `console.log('User logged in')` become a scrambled mess where you can't tell which log belongs to which user. Structured JSON logging attaches a unique `requestId: 'req_8f3a9'` and `userId: 'usr_42'` to every line. Searching `requestId: 'req_8f3a9'` in Datadog instantly shows the exact chronological timeline of that single user's request.",
    why:
      "Without correlation IDs, debugging intermittent multi-service errors requires hours of manual guessing across unlinked log files.",
    mentalModel: {
      title: "The Hospital Patient Barcode Wristband",
      body:
        "When a patient enters the hospital, they receive a barcode wristband. Every blood sample, X-ray, and medication administered is scanned with that barcode. Correlation IDs are the digital wristbands for HTTP requests.",
    },
    sections: [
      {
        heading: "1. Node.js AsyncLocalStorage for Trace Context",
        body: [
          "- `AsyncLocalStorage` allows storing the `requestId` throughout the asynchronous execution tree without manually passing `req` to every service function.",
          "- `pino-http` automatically binds child loggers with the active request context.",
        ],
        code: [
          {
            file: "request-context.ts",
            lang: "ts",
            code: [
              "import { AsyncLocalStorage } from 'async_hooks';",
              "import { Injectable, NestMiddleware } from '@nestjs/common';",
              "import { v4 as uuidv4 } from 'uuid';",
              "import pino from 'pino';",
              "",
              "export const requestStorage = new AsyncLocalStorage<{ requestId: string; userId?: string }>();",
              "",
              "export const logger = pino({",
              "  level: process.env.LOG_LEVEL || 'info',",
              "  formatters: {",
              "    log(obj) {",
              "      const store = requestStorage.getStore();",
              "      return store ? { ...obj, requestId: store.requestId, userId: store.userId } : obj;",
              "    },",
              "  },",
              "  redact: ['req.headers.authorization', 'body.password', 'body.creditCard'],",
              "});",
              "",
              "@Injectable()",
              "export class CorrelationIdMiddleware implements NestMiddleware {",
              "  use(req: any, res: any, next: () => void) {",
              "    const requestId = (req.headers['x-request-id'] as string) || `req_${uuidv4()}`;",
              "    res.setHeader('x-request-id', requestId);",
              "",
              "    requestStorage.run({ requestId }, () => {",
              "      next();",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "AsyncLocalStorage correlation ID tracking and PII redaction.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using console.log in Production Backend Code",
      wrong: [
        "// ❌ Unstructured console.log:",
        "console.log('Payment processed for ' + user.email + ' amount: ' + amount);",
        "// Cannot be indexed by Datadog/Elasticsearch, lacks timestamps, and leaks PII!",
      ].join("\n"),
      right: [
        "// ✅ Structured logger with metadata payload:",
        "logger.info({ event: 'PAYMENT_PROCESSED', amountCents: amount }, 'Payment completed');",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Trace a Multi-Step API Request with Correlation ID",
      description:
        "Send an HTTP request with `x-request-id: test-uuid-123`, trigger a database query and background worker, and verify that every generated JSON log line contains `requestId: test-uuid-123`.",
      tasks: [
        "Mount CorrelationIdMiddleware in NestJS.",
        "Make a request with custom `x-request-id` header.",
        "Inspect terminal output and verify all child log entries include the trace ID.",
      ],
    },
    quiz: [
      {
        question: "Why is Node.js AsyncLocalStorage critical for backend logging in microservices?",
        options: [
          "It stores data in the browser localStorage.",
          "It preserves request-scoped contextual metadata (like requestId and userId) across asynchronous promise chains without needing to pass parameters through every function signature.",
          "It compiles JavaScript to Rust.",
          "It connects directly to Redis.",
        ],
        answer: 1,
        explanation:
          "AsyncLocalStorage provides thread-local style context propagation across asynchronous callbacks and Promises in Node.js.",
      },
    ],
  },

  "p33-l2": {
    id: "p33-l2",
    phaseId: "p33",
    title: "Nest/Fastify Request Logging, Done Right",
    level: "Advanced",
    minutes: 35,
    summary:
      "Configure zero-overhead high-throughput HTTP access logging with Pino. Standardize HTTP status codes, latency histograms, and automated body redaction.",
    prerequisites: ["p11-l1 Fastify Core", "p33-l1 Structured Logs"],
    objectives: [
      "Integrate `nestjs-pino` / `fastify.log` for sub-millisecond asynchronous logging.",
      "Categorize log severity levels realistically (Debug, Info, Warn, Error, Fatal).",
      "Redact authorization tokens, cookies, and sensitive payload fields automatically.",
    ],
    simple:
      "A logging system should never slow down your API. Pino is the fastest JSON logger for Node.js because it writes logs asynchronously to stdout without blocking the event loop. By configuring automatic redaction, you ensure that even if a junior developer logs `req.headers`, API keys and session tokens are replaced with `\"[REDACTED]\"` before touching disk.",
    why:
      "Slow synchronous loggers can reduce your server throughput by 60%, while unredacted logs can cause severe GDPR compliance violations.",
    mentalModel: {
      title: "The Air Traffic Flight Recorder",
      body:
        "The black box on a plane records altitude, speed, and rudder positions constantly with zero drag on the airplane's engines. Fastify + Pino acts as the lightweight black box flight recorder for your API.",
    },
    sections: [
      {
        heading: "1. NestJS Pino Configuration & Redaction Paths",
        body: [
          "- Set log levels via environment variables (`LOG_LEVEL=info` in prod, `debug` in dev).",
          "- Redact deep nested keys: `['*.password', '*.secret', 'req.headers.cookie']`.",
        ],
        code: [
          {
            file: "logger.module.ts",
            lang: "ts",
            code: [
              "import { LoggerModule } from 'nestjs-pino';",
              "",
              "export const AppLoggerModule = LoggerModule.forRoot({",
              "  pinoHttp: {",
              "    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',",
              "    redact: {",
              "      paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password'],",
              "      censor: '[REDACTED]',",
              "    },",
              "    serializers: {",
              "      req: (req) => ({",
              "        id: req.id,",
              "        method: req.method,",
              "        url: req.url,",
              "      }),",
              "      res: (res) => ({",
              "        statusCode: res.statusCode,",
              "      }),",
              "    },",
              "  },",
              "});",
            ].join("\n"),
            caption: "Production nestjs-pino module with strict serialization filters.",
          },
        ],
      },
    ],
    mistake: {
      title: "Logging Entire Raw Request Bodies on Large File Upload Endpoints",
      wrong: [
        "// ❌ Logging full req.body on multipart file uploads:",
        "logger.info({ body: req.body }); // Dumps 10MB of binary buffer hex into your log storage!",
      ].join("\n"),
      right: [
        "// ✅ Log only high-level metadata: `{ filename: file.name, sizeBytes: file.size }`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Verify PII Redaction in Access Logs",
      description:
        "Send a POST `/api/v1/auth/login` request with `{ email, password }` and inspect the server log output to verify the password field is masked as `[REDACTED]`.",
      tasks: [
        "Configure nestjs-pino redaction.",
        "Submit curl with sensitive body parameters.",
        "Assert stdout shows `password: '[REDACTED]'`.",
      ],
    },
    quiz: [
      {
        question: "Why should production log levels be set to 'info' rather than 'debug'?",
        options: [
          "Debug mode disables TypeScript.",
          "Debug logging generates massive I/O volume and disk space consumption, overwhelming log aggregators and incurring significant SaaS costs.",
          "Debug logs are illegal under HIPAA.",
          "Debug logs crash the V8 engine.",
        ],
        answer: 1,
        explanation:
          "High-volume debug logs in production generate gigabytes of noise per minute, increasing server latency and logging infrastructure bills.",
      },
    ],
  },

  "p33-l3": {
    id: "p33-l3",
    phaseId: "p33",
    title: "Error Monitoring & Categorization",
    level: "Advanced",
    minutes: 35,
    summary:
      "Set up enterprise-grade error tracking with Sentry. Categorize expected domain errors (404, 400) vs unhandled system crashes (500) with full stack traces and user breadcrumbs.",
    prerequisites: ["p10-l1 NestJS Core", "p33-l1 Structured Logs"],
    objectives: [
      "Distinguish Operational Domain Errors (e.g. InvalidCredentials) from Programmer Bug Exceptions (e.g. TypeError).",
      "Attach user identity, environment release tags, and breadcrumb trails to Sentry issues.",
      "Configure global NestJS Exception Filters that capture 500 crashes while returning clean user-facing error messages.",
    ],
    simple:
      "When a user gets an error, a good engineer doesn't wait for the customer to send an angry tweet. An error monitoring tool like Sentry automatically captures the crash, records the user's browser, the exact line of code that failed, and the last 10 actions the user took (Breadcrumbs), alerting your on-call engineer in Slack within 5 seconds.",
    why:
      "Unhandled crashes silently lose customers; instant alerting allows you to ship a hotfix before 99% of your users notice.",
    mentalModel: {
      title: "The Smart Smoke Alarm with Room Locator",
      body:
        "A regular smoke alarm just beeps. A smart alarm tells you: 'Smoke detected in upstairs master bedroom, battery at 94%, toaster oven heating element tripped.' Sentry gives you the full environmental context of a crash.",
    },
    sections: [
      {
        heading: "1. Global NestJS Exception Filter with Sentry",
        body: [
          "- **Expected Errors (4xx)**: Handle gracefully with NestJS `HttpException`. Do NOT alert on-call engineers.",
          "- **Unexpected Errors (5xx)**: Capture with `Sentry.captureException(error)`. Generate an incident ticket.",
        ],
        code: [
          {
            file: "sentry-filter.ts",
            lang: "ts",
            code: [
              "import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';",
              "import * as Sentry from '@sentry/node';",
              "",
              "@Catch()",
              "export class GlobalSentryExceptionFilter implements ExceptionFilter {",
              "  catch(exception: unknown, host: ArgumentsHost) {",
              "    const ctx = host.switchToHttp();",
              "    const response = ctx.getResponse();",
              "",
              "    const isHttp = exception instanceof HttpException;",
              "    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;",
              "",
              "    // Only capture unexpected 500 crashes to Sentry",
              "    if (status >= 500) {",
              "      Sentry.captureException(exception);",
              "    }",
              "",
              "    response.status(status).json({",
              "      statusCode: status,",
              "      message: isHttp ? exception.message : 'An unexpected internal server error occurred.',",
              "      timestamp: new Date().toISOString(),",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "Global exception filter routing 500 crashes to Sentry.",
          },
        ],
      },
    ],
    mistake: {
      title: "Alerting the On-Call Engineer for 404 Not Found and 401 Unauthorized Errors",
      wrong: [
        "// ❌ Capturing every 404 to Sentry:",
        "// Web crawlers and bots scanning for /wp-admin will trigger 50,000 Sentry alerts per night, causing alert fatigue!",
      ].join("\n"),
      right: [
        "// ✅ Filter out expected 4xx client errors; only notify for 5xx unhandled exceptions.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Trigger an Unhandled Crash and Verify Sentry Capture",
      description:
        "Create a deliberate test route `GET /debug-sentry` that throws a `new Error('Simulated Database Panic')`, and verify Sentry captures the stack trace and environment tags.",
      tasks: [
        "Initialize Sentry with DSN.",
        "Trigger the crash route.",
        "Inspect the event in Sentry dashboard with breadcrumbs.",
      ],
    },
    quiz: [
      {
        question: "What are Sentry 'Breadcrumbs'?",
        options: [
          "Temporary cookies.",
          "A chronological trail of events (HTTP requests, console logs, UI clicks) recorded immediately leading up to the moment an error occurred.",
          "CSS layout guides.",
          "Database backup files.",
        ],
        answer: 1,
        explanation:
          "Breadcrumbs record the user's prior actions leading into a crash, making it easy to reproduce intermittent bugs.",
      },
    ],
  },
};
