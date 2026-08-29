import type { LessonContent } from "./types";

/**
 * Phase 11 Fastify with NestJS (L4–L5).
 * Completes Phase 11 with interactive Fastify Trap Inspector Lab.
 */
export const LESSONS_P11B: LessonContent[] = [
  {
    id: "p11-l4",
    phaseId: "p11",
    title: "Logging, Trust Proxy & Performance Profile",
    level: "Backend Developer",
    minutes: 30,
    summary:
      "Fastify includes built-in, asynchronous JSON structured logging powered by Pino — the fastest logger in the Node.js ecosystem. In this lesson, you will master configuring Pino logs, binding correlation IDs (`x-request-id`) to track requests through the pipeline, setting up `trustProxy` for cloud container platforms (Cloud Run, Kubernetes, Nginx), and understanding the exact architectural reasons why Fastify achieves industry-leading throughput.",
    prerequisites: [
      "p00-l5 — Environments, secrets & config hygiene",
      "p07-l1 — Anatomy of a request: URL → DNS → Response",
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
    ],
    objectives: [
      "Configure Fastify's native Pino structured logger for production and local pretty-printing.",
      "Propagate and log request correlation IDs (`x-request-id`) across the entire request lifecycle.",
      "Understand why `trustProxy` is mandatory behind reverse proxies and load balancers.",
      "Analyze Fastify's performance profile (Radix tree router, fast-json-stringify, zero-cost abstractions).",
      "Format JSON logs for ingestion into cloud monitoring systems (Google Cloud Logging, Datadog).",
    ],
    simple:
      "Traditional console logging is like a waiter shouting every order across a crowded restaurant. Fastify's Pino logger is like an automated order ticketing system: every order gets a unique barcode (correlation ID) and is silently stamped into a high-speed digital stream with zero human stutter or delay.",
    why:
      "In high-traffic systems, synchronous `console.log` blocks the Node.js event loop. Pino writes structured JSON asynchronously in batches, reducing logging CPU overhead by over 80% while enabling instant querying in Datadog and GCP Cloud Logging by `x-request-id`.",
    mentalModel: {
      title: "The Barcode Scanner & Reverse Proxy Relay",
      body: "• **Correlation Barcode (`x-request-id`)**: Every incoming HTTP request is assigned a UUID. When logging errors, database queries, or downstream RPCs, this ID is attached so you can trace a single customer click across 5 microservices.\n• **The Reverse Proxy Relay (`trustProxy`)**: When your app runs in Cloud Run or behind Cloudflare, the incoming TCP connection comes from the proxy IP (e.g. `10.0.0.1`). `trustProxy: true` tells Fastify to read the real client IP from the `X-Forwarded-For` header.",
    },
    sections: [
      {
        heading: "Configuring Pino Logger & Correlation IDs",
        body: [
          "Fastify integrates Pino natively. You configure it directly in the `FastifyAdapter` constructor options:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
              "import { AppModule } from './app.module';",
              "",
              "async function bootstrap() {",
              "  const isDev = process.env.NODE_ENV !== 'production';",
              "",
              "  const adapter = new FastifyAdapter({",
              "    // Fastify built-in Pino logger configuration",
              "    logger: isDev",
              "      ? {",
              "          transport: {",
              "            target: 'pino-pretty',",
              "            options: {",
              "              colorize: true,",
              "              translateTime: 'HH:MM:ss Z',",
              "              ignore: 'pid,hostname',",
              "            },",
              "          },",
              "        }",
              "      : {",
              "          level: 'info', // JSON output in production for Datadog / GCP",
              "          serializers: {",
              "            req: (req) => ({",
              "              method: req.method,",
              "              url: req.url,",
              "              ip: req.ip,",
              "              requestId: req.headers['x-request-id'],",
              "            }),",
              "          },",
              "        },",
              "    trustProxy: true, // Crucial for reading true client IP behind Cloud Run / Nginx",
              "    genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),",
              "  });",
              "",
              "  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);",
              "  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Fastify Performance Profile: Why It's 2x Faster",
        body: [
          "Fastify's speed advantages stem from three architectural design decisions:",
          "1. **Radix Tree Routing (`find-my-way`)**: Instead of linear regex scanning across all routes (Express), Fastify uses a Radix prefix tree. Route lookup is O(k) where k is path depth, staying instant even with 1,000 routes.",
          "2. **Schema-Compiled JSON Serialization (`fast-json-stringify`)**: Replaces slow `JSON.stringify()` with pre-compiled string builders.",
          "3. **Zero-Overhead Asynchronous Lifecycle Hooks**: Avoids heavy middleware closures and callback nesting.",
        ],
        code: [
          {
            file: "benchmark-comparison.txt",
            lang: "text",
            code: [
              "Benchmark Results (100 concurrent connections, 50,000 requests):",
              "----------------------------------------------------------------",
              "Express (Default):   ~16,200 req/sec | Latency: 6.2ms | CPU: 98%",
              "Fastify (Adapter):   ~38,500 req/sec | Latency: 2.6ms | CPU: 65%",
              "Throughput Increase: +137% higher throughput with 33% less CPU usage",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Setting trustProxy: false (or omitting it) behind Cloud Run / Nginx",
      wrong: "const adapter = new FastifyAdapter(); // Omits trustProxy: true",
      right: "const adapter = new FastifyAdapter({ trustProxy: true });",
      explain:
        "Without `trustProxy: true`, `req.ip` returns the internal private IP of your load balancer (e.g. `10.0.0.1` or `127.0.0.1`), corrupting rate limiting, audit logs, and fraud detection.",
    },
    tryIt: [
      "Configure `FastifyAdapter` with `genReqId` and `trustProxy: true` in `main.ts`.",
      "Send a request with a custom correlation ID: `curl -H 'x-request-id: req-abc-123' http://localhost:3001/api/v1/health`.",
      "Check the server logs and verify `req-abc-123` appears in the log output.",
      "Test in development mode with `pino-pretty` and observe colorized, readable log lines.",
    ],
    challenge: {
      prompt:
        "Write a NestJS Interceptor that attaches the request's correlation ID (`x-request-id`) to the outgoing response headers so clients can quote the ID during support inquiries.",
      hints: [
        "Create an interceptor implementing `NestInterceptor`.",
        "Extract `request.headers['x-request-id']`.",
        "Set `response.header('x-request-id', id)` on the FastifyReply.",
      ],
      solution: [
        "import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';",
        "import { Observable } from 'rxjs';",
        "import type { FastifyRequest, FastifyReply } from 'fastify';",
        "",
        "@Injectable()",
        "export class CorrelationIdInterceptor implements NestInterceptor {",
        "  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {",
        "    const http = context.switchToHttp();",
        "    const req = http.getRequest<FastifyRequest>();",
        "    const reply = http.getResponse<FastifyReply>();",
        "",
        "    const correlationId = (req.headers['x-request-id'] as string) || req.id || crypto.randomUUID();",
        "    reply.header('x-request-id', correlationId);",
        "",
        "    return next.handle();",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What logging library is built directly into Fastify?",
        options: ["Pino", "Winston", "Bunyan", "Log4js"],
        answer: 0,
        explain:
          "Fastify natively embeds Pino, the highest-performance structured JSON logger for Node.js.",
      },
      {
        q: "Why is synchronous `console.log()` discouraged in high-throughput production backends?",
        options: [
          "It blocks the single-threaded Node.js event loop while writing to stdout, causing latency spikes",
          "It is deprecated in TypeScript",
          "It only works on Windows",
          "It shuts down the server after 100 logs",
        ],
        answer: 0,
        explain:
          "Writing synchronously to stdout blocks the event loop. Pino formats and streams logs asynchronously.",
      },
      {
        q: "What is the purpose of `genReqId` in FastifyAdapter options?",
        options: [
          "Generates or reuses a unique correlation ID (`x-request-id`) for each incoming request",
          "Generates user passwords",
          "Creates database IDs",
          "Renames routes automatically",
        ],
        answer: 0,
        explain:
          "`genReqId` assigns a correlation ID to every request for end-to-end distributed tracing.",
      },
      {
        q: "What router algorithm does Fastify use to achieve O(k) path matching?",
        options: ["Radix prefix tree (`find-my-way`)", "Linear Array Search", "Binary Search Tree", "Regular Expression Array"],
        answer: 0,
        explain:
          "Fastify uses `find-my-way`, a Radix tree router that matches URLs in O(k) time where k is path segment depth.",
      },
      {
        q: "Why is `trustProxy: true` necessary when deploying to Google Cloud Run or AWS ECS?",
        options: [
          "It instructs Fastify to parse the true client IP from `X-Forwarded-For` rather than recording the load balancer's private IP",
          "It allows anyone to bypass authentication",
          "It creates a public proxy server",
          "It encrypts all incoming packets",
        ],
        answer: 0,
        explain:
          "Reverse proxies put their own IP on incoming TCP connections. `trustProxy: true` reads the real client IP from forwarding headers.",
      },
      {
        q: "How should production logs be formatted for ingestion into Datadog or Google Cloud Logging?",
        options: [
          "Structured, single-line JSON objects with standard fields (`level`, `time`, `req`, `msg`)",
          "CSV tables",
          "Rich HTML documents",
          "Raw binary strings",
        ],
        answer: 0,
        explain:
          "Cloud log collectors expect single-line structured JSON for automatic indexing and filtering.",
      },
    ],
    flashcards: [
      {
        front: "What is Pino?",
        back: "The ultra-fast, structured JSON logger natively bundled with Fastify.",
      },
      {
        front: "What is a correlation ID (`x-request-id`)?",
        back: "A unique UUID passed across microservices to trace a single request's end-to-end lifecycle in logs.",
      },
      {
        front: "What happens if `trustProxy: false` is used behind a load balancer?",
        back: "`req.ip` will report the load balancer's internal IP instead of the actual client's IP.",
      },
      {
        front: "What router does Fastify use?",
        back: "`find-my-way` — a Radix prefix tree router with O(k) URL lookup speed.",
      },
      {
        front: "How do you configure pretty logging in dev with Fastify?",
        back: "Pass `{ logger: { transport: { target: 'pino-pretty' } } }` to `FastifyAdapter`.",
      },
      {
        front: "How do you define custom request ID generation in Fastify?",
        back: "Use `genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID()` in adapter options.",
      },
      {
        front: "Why does Fastify use less CPU than Express?",
        back: "Radix tree routing, compiled JSON serialization, and zero-allocation asynchronous hooks.",
      },
      {
        front: "How do you log in a NestJS service when using Fastify?",
        back: "Use NestJS's standard `Logger` service (`private readonly logger = new Logger(MyService.name)`).",
      },
    ],
    recap: [
      "Leverage Fastify's native Pino logger for zero-overhead, structured asynchronous logging.",
      "Assign and propagate correlation IDs (`x-request-id`) to trace requests across distributed systems.",
      "Always set `trustProxy: true` in container environments to accurately resolve client IPs.",
      "Understand Fastify's three pillars of performance: Radix routing, compiled schemas, and lightweight hooks.",
      "Format production logs as raw single-line JSON and development logs with `pino-pretty`.",
    ],
    references: [
      { label: "Fastify Documentation — Logging with Pino", url: "https://fastify.dev/docs/latest/Reference/Logging/" },
      { label: "Pino Logger Official Documentation", url: "https://getpino.io/" },
    ],
    nextBridge:
      "In the final lesson of Phase 11, P11-L5, you will enter the Fastify Debugging Lab to inspect and fix the 5 most common Express tutorial traps that break when running on Fastify.",
  },
  {
    id: "p11-l5",
    phaseId: "p11",
    title: "Debugging Lab: Why the Express Tutorial Fails Here",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "90% of online NestJS and Node.js tutorials assume Express under the hood. When copy-pasted into a high-performance Fastify codebase, they fail with cryptic errors: `res.json is not a function`, hanging connections, broken `*` wildcard routes, or container port connection errors. In this hands-on diagnostic lab, you will analyze each failure pattern, understand the underlying architectural mismatch, and master the canonical Fastify-flavored fixes.",
    prerequisites: [
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
      "p11-l2 — Plugins, CORS & Serialization",
      "p11-l3 — Multipart Uploads & Body Limits",
      "p11-l4 — Logging, Trust Proxy & Performance Profile",
    ],
    objectives: [
      "Identify the top 5 failure modes when migrating Express code snippets to Fastify.",
      "Fix response handling mistakes (`res.json()`, `res.status().send()`, manual response hangs).",
      "Correct container network binding issues (`0.0.0.0` vs `localhost` in Docker/Cloud Run).",
      "Convert Express connect middleware to native Fastify plugins or `@fastify/middie`.",
      "Fix catch-all route syntax from Express `*` to Fastify Radix-compatible `*path`.",
    ],
    simple:
      "Imagine learning to drive a standard car, and then trying to shift gears in an electric Tesla. There is no clutch pedal, so your left foot stomping on the floor does nothing (or slams the emergency brake). Fastify doesn't have Express's `res.json` pedal — understanding its direct electric drive lets you cruise smoothly without stalling.",
    why:
      "Senior backend engineers save days of debugging by immediately recognizing engine-specific assumptions in open-source libraries and tutorials, preventing production outages caused by silent request hangs or unrouted wildcard paths.",
    mentalModel: {
      title: "The Engine Adapter Translation Grid",
      body: "• **Express World**: Mutable `(req, res, next)` pipeline. Relies on ad-hoc monkey-patching of `res` object (`res.json`, `res.send`, `res.cookie`).\n• **Fastify World**: Immutable lifecycle hook pipeline with Radix tree router. `FastifyReply` is lean and strict. NestJS sits above both, translating declarative decorators (`@Get()`, `@Body()`) into the appropriate underlying engine calls.",
    },
    sections: [
      {
        heading: "The 5 Classic Express Traps on Fastify",
        body: [
          "Review the key differences that cause tutorials to break when applied to Fastify:",
          "1. **`res.json()` vs `reply.send()`**: `res.json` does not exist on `FastifyReply`.",
          "2. **Omitting `'0.0.0.0'` in `app.listen()`**: Fastify listens on `127.0.0.1` by default, making containers unreachable.",
          "3. **Multer FileInterceptor**: Express `multer` cannot parse Fastify multipart streams.",
          "4. **Express Middleware `app.use(fn)`**: Fastify does not use `(req, res, next)` without `@fastify/middie`.",
          "5. **Wildcard Route Syntax**: Fastify requires parameter naming (e.g. `@Get('*path')` instead of `@Get('*')`).",
        ],
      },
      {
        heading: "Interactive Fastify Trap Inspector Lab",
        body: [
          "Use the interactive inspector below to diagnose broken Express snippets, view the exact runtime errors, and see the corrected Fastify architecture.",
        ],
        demo: "fastify-trap-lab",
      },
      {
        heading: "The Adapter-Aware Migration Checklist",
        body: [
          "Whenever you adopt an external tutorial or third-party NestJS package, run through this checklist:",
          "• Does the code import from `'express'` or type `Request` / `Response` from Express? Switch to `FastifyRequest` / `FastifyReply`.",
          "• Does it use `@Res()`? Remove `@Res()` and let NestJS return the value, or add `{ passthrough: true }`.",
          "• Does it use `multer` or `FileInterceptor`? Use `@fastify/multipart` streaming instead.",
          "• Does it register Express middleware? Check if an official `@fastify/*` plugin exists.",
          "• Does `main.ts` bind to `0.0.0.0`? Ensure port and host are specified explicitly.",
        ],
      },
    ],
    mistake: {
      title: "Importing Express types in Fastify controllers",
      wrong: "import { Request, Response } from 'express'; // Binds codebase to Express engine!",
      right: "import type { FastifyRequest, FastifyReply } from 'fastify'; // Or prefer NestJS decorators",
      explain:
        "Importing Express types in a Fastify app causes TypeScript type mismatches and misleads developers into calling methods like `res.json()` that don't exist at runtime.",
    },
    tryIt: [
      "Open the Fastify Trap Inspector above and test all 5 failure categories.",
      "Review the runtime error output for each failure mode.",
      "Check your own `main.ts` to confirm `0.0.0.0` is passed to `app.listen()`.",
      "Verify that no controllers in your application import types from `'express'`.",
    ],
    challenge: {
      prompt:
        "Refactor an Express-style controller method that manually sets cookies and returns a JSON payload into a clean, platform-neutral Fastify NestJS method.",
      hints: [
        "Use `@Res({ passthrough: true }) reply: FastifyReply`.",
        "Set cookie using `reply.setCookie` (from `@fastify/cookie`) or custom headers.",
        "Return the object directly instead of calling `res.json()`.",
      ],
      solution: [
        "import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';",
        "import type { FastifyReply } from 'fastify';",
        "",
        "@Controller('auth')",
        "export class AuthController {",
        "  @Post('session')",
        "  @HttpCode(HttpStatus.OK)",
        "  async createSession(",
        "    @Body() dto: { token: string },",
        "    @Res({ passthrough: true }) reply: FastifyReply",
        "  ) {",
        "    // Clean Fastify/NestJS pattern: set header/cookie, return object",
        "    reply.header('Set-Cookie', `session=${dto.token}; HttpOnly; Path=/; Secure; SameSite=Lax`);",
        "    return { success: true, message: 'Session initialized' };",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What error occurs if you call `res.json({ ok: true })` inside a Fastify NestJS controller?",
        options: [
          "`TypeError: res.json is not a function`",
          "`SyntaxError: Unexpected token`",
          "`ReferenceError: json is not defined`",
          "`HTTP 404 Not Found`",
        ],
        answer: 0,
        explain:
          "`res.json` does not exist on Fastify's `FastifyReply` object.",
      },
      {
        q: "Why will a Fastify app running in Docker fail healthchecks if `app.listen(3001)` is called without host?",
        options: [
          "Fastify defaults host to `127.0.0.1` (localhost only), rejecting external container traffic",
          "Port 3001 is reserved by Linux",
          "Docker requires port 80",
          "Fastify cannot run in Docker",
        ],
        answer: 0,
        explain:
          "Fastify only listens on `127.0.0.1` unless `'0.0.0.0'` is explicitly provided.",
      },
      {
        q: "How should a catch-all route be declared in Fastify NestJS?",
        options: [
          "`@Get('*path')` or `@Get('/*')`",
          "`@Get('*')`",
          "`@Get('...')`",
          "`@Get('all')`",
        ],
        answer: 0,
        explain:
          "Fastify's Radix router requires a named parameter or slash in wildcard route declarations (e.g. `*path`).",
      },
      {
        q: "What is the recommended replacement for Express `cors` and `helmet` packages?",
        options: [
          "`app.enableCors()` and `@fastify/helmet`",
          "Writing custom TCP sockets",
          "Disabling CORS altogether",
          "Installing jQuery",
        ],
        answer: 0,
        explain:
          "NestJS's built-in `app.enableCors()` and official `@fastify/helmet` plugin provide native Fastify integration.",
      },
      {
        q: "What happens if you use `@Res()` without `{ passthrough: true }` and do not call `reply.send()`?",
        options: [
          "The client HTTP request hangs until it hits connection timeout",
          "NestJS throws a compile-time error",
          "The database disconnects",
          "The server restarts",
        ],
        answer: 0,
        explain:
          "Without `{ passthrough: true }`, NestJS leaves response handling to manual code. If `reply.send()` is omitted, the socket never closes.",
      },
      {
        q: "How can Express connect middleware be used in Fastify if a native plugin is unavailable?",
        options: [
          "By registering the `@fastify/middie` plugin on the Fastify instance",
          "It is mathematically impossible",
          "By running Express in a child process",
          "By converting TypeScript to C#",
        ],
        answer: 0,
        explain:
          "`@fastify/middie` adds support for classic `(req, res, next)` Express/Connect middleware to Fastify.",
      },
    ],
    flashcards: [
      {
        front: "What is the Fastify equivalent of `res.json(data)`?",
        back: "`reply.send(data)` (or simply returning `data` from the controller).",
      },
      {
        front: "Why must you pass `'0.0.0.0'` to `app.listen()` in Fastify?",
        back: "Fastify defaults to `127.0.0.1`; `0.0.0.0` is required for Docker / Cloud Run container ingress.",
      },
      {
        front: "How do you declare wildcard routes in Fastify?",
        back: "Use `@Get('*path')` or `@Get('/*')` instead of Express's plain `@Get('*')`.",
      },
      {
        front: "What plugin allows Express `(req, res, next)` middleware in Fastify?",
        back: "`@fastify/middie`.",
      },
      {
        front: "Why does NestJS `FileInterceptor` fail on Fastify?",
        back: "It relies on Express `multer`; Fastify requires `@fastify/multipart` streaming.",
      },
      {
        front: "What is the safest, most portable way to return data in NestJS?",
        back: "Return plain objects/promises directly without using `@Res()`.",
      },
      {
        front: "What does `@Res({ passthrough: true })` do in Fastify?",
        back: "Allows setting headers/cookies via `reply.header()` while letting NestJS serialize the return payload.",
      },
      {
        front: "How do you avoid Express tutorial traps?",
        back: "Never import from `'express'`, check for `@Res()` leaks, and use `@fastify/*` plugins.",
      },
    ],
    recap: [
      "Never call `res.json()` on FastifyReply — use `reply.send()` or return the object directly.",
      "Always bind Fastify to `0.0.0.0` in containerized environments.",
      "Use `@fastify/multipart` for file uploads rather than Express `multer`.",
      "Declare wildcard routes with parameter names like `*path`.",
      "Leverage `@fastify/*` ecosystem plugins for security and performance.",
    ],
    references: [
      { label: "Fastify Documentation — Differences with Express", url: "https://fastify.dev/docs/latest/Guides/Migration/" },
      { label: "NestJS Documentation — Fastify Adapter", url: "https://docs.nestjs.com/techniques/performance" },
    ],
    nextBridge:
      "Congratulations on completing Phase 11! With high-performance Fastify under your belt, in Phase 12 you will dive into professional NestJS architecture: Pipes, Guards, Interceptors, Exception Filters, and Modular Monolith boundaries.",
  },
];

export const LESSON_CONTENT_P11B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P11B.map((l) => [l.id, l])
);
