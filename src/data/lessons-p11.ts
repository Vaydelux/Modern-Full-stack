import type { LessonContent } from "./types";

/**
 * Phase 11 Fastify with NestJS (L1–L3).
 * Every lesson fulfills the full quality contract.
 */
export const LESSONS_P11: LessonContent[] = [
  {
    id: "p11-l1",
    phaseId: "p11",
    title: "FastifyAdapter & NestFastifyApplication",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "NestJS is platform-agnostic, allowing seamless swapping of the underlying HTTP engine. While Express is the default, enterprise backends choose Fastify for its high-performance Radix-tree routing, minimal memory footprint, and low-latency JSON serialization. This lesson covers configuring `NestFastifyApplication`, handling `FastifyRequest` and `FastifyReply`, response code ergonomics, and understanding how NestJS bridges the two HTTP paradigms.",
    prerequisites: [
      "p07-l1 — Request lifecycle & latency waterfalls",
      "p10-l1 — Bootstrap: main.ts & Fastify adapter",
      "p10-l2 — Modules, controllers & providers",
    ],
    objectives: [
      "Instantiate and configure `NestFastifyApplication` using `FastifyAdapter` in `main.ts`.",
      "Understand the key API differences between Express's `res` and Fastify's `reply`.",
      "Master response sending patterns: NestJS automatic return values vs explicit `reply.send()`.",
      "Avoid cross-platform pollution by leveraging NestJS platform-neutral decorators.",
      "Diagnose status code headers, custom content types, and redirects using Fastify reply methods.",
    ],
    simple:
      "Express is like a comfortable passenger bus: reliable, ubiquitous, but heavy and slow to accelerate. Fastify is a high-speed bullet train on a dedicated magnetic track (Radix tree router). NestJS is the conductor who sits at the controls, translating your driving commands so your business logic works seamlessly on both.",
    why:
      "When traffic spikes to 20,000 requests/sec, the V8 CPU cycles spent parsing routes and serializing JSON in Express become the bottleneck. Fastify reduces CPU overhead by up to 50%, cutting cloud hosting costs in half while providing predictable sub-millisecond latencies.",
    mentalModel: {
      title: "The Universal Controller & Engine Swapping",
      body: "NestJS uses an `AbstractHttpAdapter` interface. In your controllers, when you return a plain JavaScript object (`return { status: 'ok' }`), the adapter handles the underlying serialization. If you use Fastify, the FastifyAdapter delegates to Fastify's compiled C++ JSON serializers. You get peak speed without coupling your controllers to proprietary engine syntax.",
    },
    sections: [
      {
        heading: "Configuring NestFastifyApplication",
        body: [
          "To leverage full Fastify type safety and platform methods, type the application instance as `NestFastifyApplication`:",
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
              "  const adapter = new FastifyAdapter({",
              "    logger: process.env.NODE_ENV !== 'production',",
              "    trustProxy: true,",
              "    connectionTimeout: 10_000, // 10s connection timeout",
              "    keepAliveTimeout: 30_000,   // 30s keep-alive for upstream load balancers",
              "  });",
              "",
              "  const app = await NestFactory.create<NestFastifyApplication>(",
              "    AppModule,",
              "    adapter",
              "  );",
              "",
              "  // Access underlying Fastify instance for raw hooks if needed",
              "  const fastifyInstance = app.getHttpAdapter().getInstance();",
              "  fastifyInstance.addHook('onRequest', async (req, reply) => {",
              "    req.headers['x-received-at'] = String(Date.now());",
              "  });",
              "",
              "  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Handling Requests & Replies without Breaking Portability",
        body: [
          "In NestJS, the cleanest approach is returning values directly. When you must access the response object directly (e.g. for setting custom headers or streaming binary files), use `@Res({ passthrough: true })` or type `FastifyReply`:",
        ],
        code: [
          {
            file: "src/users/users.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Get, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';",
              "import type { FastifyReply } from 'fastify';",
              "import { UsersService } from './users.service';",
              "",
              "@Controller('users')",
              "export class UsersController {",
              "  constructor(private readonly usersService: UsersService) {}",
              "",
              "  // ✅ Recommended: Return data directly; NestJS handles serialization",
              "  @Get()",
              "  async findAll() {",
              "    return this.usersService.findAll();",
              "  }",
              "",
              "  // ✅ Passthrough pattern: Sets headers/cookies without taking over serialization",
              "  @Get('download-csv')",
              "  async exportCsv(@Res({ passthrough: true }) reply: FastifyReply) {",
              "    reply.header('Content-Type', 'text/csv');",
              "    reply.header('Content-Disposition', 'attachment; filename=\"users.csv\"');",
              "    return this.usersService.generateCsvStream();",
              "  }",
              "",
              "  // ⚠️ Manual reply: When you need full manual control over Fastify reply",
              "  @Get('custom-redirect')",
              "  redirect(@Res() reply: FastifyReply) {",
              "    reply.status(HttpStatus.MOVED_PERMANENTLY).redirect('/api/v1/users');",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Using @Res() without { passthrough: true } and forgetting to call reply.send()",
      wrong: "@Get() findAll(@Res() reply: FastifyReply) { const data = this.service.getAll(); return data; // Request HANGS forever! }",
      right: "@Get() findAll(@Res({ passthrough: true }) reply: FastifyReply) { reply.header('X-Custom', '1'); return this.service.getAll(); }",
      explain:
        "Injecting `@Res()` without `{ passthrough: true }` puts NestJS into manual response mode. If you don't explicitly call `reply.send()`, the HTTP connection stays open indefinitely until client timeout.",
    },
    tryIt: [
      "Inspect `main.ts` and verify `FastifyAdapter` is passed into `NestFactory.create`.",
      "Add `connectionTimeout: 10000` to the `FastifyAdapter` constructor options.",
      "Create a controller method using `@Res({ passthrough: true })` and set a custom response header `X-Fastify-Powered: 1`.",
      "Verify with `curl -i http://localhost:3001/api/v1/users` that the custom header is present in the response.",
    ],
    challenge: {
      prompt:
        "Write a NestJS controller method that returns an SVG badge with `Content-Type: image/svg+xml` and `Cache-Control: public, max-age=3600` using `@Res({ passthrough: true })` and Fastify.",
      hints: [
        "Use `@Res({ passthrough: true }) reply: FastifyReply`.",
        "Set headers using `reply.header(key, value)`.",
        "Return the raw SVG string.",
      ],
      solution: [
        "import { Controller, Get, Res } from '@nestjs/common';",
        "import type { FastifyReply } from 'fastify';",
        "",
        "@Controller('badges')",
        "export class BadgesController {",
        "  @Get('status')",
        "  getStatusBadge(@Res({ passthrough: true }) reply: FastifyReply): string {",
        "    reply.header('Content-Type', 'image/svg+xml');",
        "    reply.header('Cache-Control', 'public, max-age=3600');",
        "    return '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"20\"><rect width=\"100\" height=\"20\" fill=\"#4c1\"/><text x=\"10\" y=\"14\" fill=\"#fff\" font-family=\"sans-serif\" font-size=\"11\">STATUS: ACTIVE</text></svg>';",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary architectural benefit of Fastify over Express in NestJS?",
        options: [
          "It uses Radix-tree routing and optimized schema serialization for up to 2x higher throughput and lower CPU overhead",
          "It compiles JavaScript into native C++ binaries",
          "It requires no TypeScript configuration",
          "It replaces PostgreSQL databases automatically",
        ],
        answer: 0,
        explain:
          "Fastify's Radix tree router and optimized buffer/JSON handling dramatically reduce latency and CPU usage under high load.",
      },
      {
        q: "What happens if you inject `@Res() reply: FastifyReply` without `{ passthrough: true }` and simply return an object?",
        options: [
          "NestJS automatically serializes it",
          "The HTTP request hangs indefinitely until client timeout because NestJS expects manual `reply.send()` invocation",
          "The server crashes immediately",
          "It returns HTTP 500 error",
        ],
        answer: 1,
        explain:
          "Injecting `@Res()` switches NestJS to manual response mode. Without `{ passthrough: true }`, you must explicitly call `reply.send()`.",
      },
      {
        q: "Which method is used on `FastifyReply` to send a JSON payload manually?",
        options: ["`reply.json()`", "`reply.send()`", "`reply.endJson()`", "`reply.render()`"],
        answer: 1,
        explain:
          "Fastify uses `reply.send(data)` (unlike Express's `res.json(data)`).",
      },
      {
        q: "How do you access the underlying Fastify instance from a NestJS application?",
        options: [
          "`app.getHttpAdapter().getInstance()`",
          "`global.fastify`",
          "`process.fastifyInstance`",
          "`app.getNativeEngine()`",
        ],
        answer: 0,
        explain:
          "`app.getHttpAdapter().getInstance()` retrieves the underlying Fastify server instance.",
      },
      {
        q: "Why is `trustProxy: true` passed to FastifyAdapter in production?",
        options: [
          "It disables all authentication",
          "It instructs Fastify to trust reverse proxy headers (`X-Forwarded-For`, `X-Forwarded-Proto`) from load balancers (Nginx, Cloud Run)",
          "It encrypts all database passwords",
          "It allows anyone to access private admin routes",
        ],
        answer: 1,
        explain:
          "`trustProxy: true` ensures `req.ip` and `req.protocol` accurately reflect client values behind load balancers.",
      },
      {
        q: "What is the recommended NestJS convention for returning controller responses?",
        options: [
          "Always call `res.json()`",
          "Return plain JavaScript objects/promises and let NestJS handle status codes and serialization automatically",
          "Write responses directly to disk",
          "Send raw TCP socket packets",
        ],
        answer: 1,
        explain:
          "Returning objects directly preserves platform independence and lets NestJS handle HTTP serialization cleanly.",
      },
    ],
    flashcards: [
      {
        front: "What is `NestFastifyApplication`?",
        back: "The TypeScript interface typing a NestJS application bootstrapped with `FastifyAdapter`.",
      },
      {
        front: "How do you send a manual response in Fastify?",
        back: "Using `reply.send(payload)` (Express uses `res.json()`).",
      },
      {
        front: "What does `@Res({ passthrough: true })` do?",
        back: "Allows setting custom headers/cookies on the reply while letting NestJS handle payload serialization.",
      },
      {
        front: "Why does omitting `0.0.0.0` break Fastify in Docker?",
        back: "Fastify defaults to `127.0.0.1` (localhost only); `0.0.0.0` binds to all network interfaces for container routing.",
      },
      {
        front: "How do you set a response header in Fastify?",
        back: "`reply.header('Header-Name', 'Value')`.",
      },
      {
        front: "How do you set an HTTP status code in Fastify?",
        back: "`reply.status(201)` or use the `@HttpCode(HttpStatus.CREATED)` decorator.",
      },
      {
        front: "How do you access the raw Fastify server instance in NestJS?",
        back: "`app.getHttpAdapter().getInstance()`.",
      },
      {
        front: "What routing algorithm does Fastify use?",
        back: "Radix tree algorithm (`find-my-way`) for O(k) URL matching performance.",
      },
    ],
    recap: [
      "Bootstrap high-performance backends using `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`.",
      "Prefer returning plain objects from controllers over manual response manipulation.",
      "Use `@Res({ passthrough: true })` when setting headers or cookies.",
      "Always configure `trustProxy: true` and bind to `0.0.0.0` in containerized deployments.",
      "Remember that Fastify uses `reply.send()` instead of Express's `res.json()`.",
    ],
    references: [
      { label: "NestJS Documentation — Fastify Performance", url: "https://docs.nestjs.com/techniques/performance" },
      { label: "Fastify Official Documentation", url: "https://fastify.dev/docs/latest/" },
    ],
    nextBridge:
      "Now that you understand the Fastify adapter foundation, in P11-L2 you will learn how to register Fastify plugins, configure `@fastify/cors`, and harness schema-based serialization.",
  },
  {
    id: "p11-l2",
    phaseId: "p11",
    title: "Plugins, CORS & Serialization",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "Fastify's plugin architecture and schema serialization are its most potent superpowers. This lesson covers registering Fastify plugins in NestJS using `app.register()`, configuring enterprise CORS with `@fastify/cors`, setting security headers with `@fastify/helmet`, and understanding how `fast-json-stringify` provides lightning-fast JSON serialization.",
    prerequisites: [
      "p07-l4 — CORS & preflight requests",
      "p10-l1 — Bootstrap & Fastify adapter",
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
    ],
    objectives: [
      "Register Fastify plugins cleanly in NestJS using `await app.register()`.",
      "Configure `@fastify/cors` with explicit origin whitelists, credentials, and allowed headers.",
      "Apply security hardening headers with `@fastify/helmet` and customize Content Security Policies (CSP).",
      "Explain how `fast-json-stringify` pre-compiles JSON serialization schemas for 2-3x faster JSON responses.",
      "Encapsulate Fastify plugins within dedicated NestJS configuration modules.",
    ],
    simple:
      "Standard JSON serialization (`JSON.stringify`) is like reading an entire book word by word every time you want to summarize it. Fastify's schema serialization is like having an index and summary pre-printed on page one: it knows the exact shape of your data in advance, so it writes out the JSON bytes in a single blisteringly fast pass.",
    why:
      "In high-throughput APIs serving large arrays of records (e.g. 500 items per page), JSON stringification consumes significant CPU time. Fastify's compiled schema serialization eliminates redundant type checks, delivering up to 3x higher JSON throughput.",
    mentalModel: {
      title: "The Pre-Compiled Stamp & The Plugin Pipeline",
      body: "Fastify treats everything as an encapsulated plugin tree. When you call `app.register(plugin)`, Fastify binds middleware hooks and routes into its lifecycle. When serializing responses, it compiles a C++-optimized formatting function from your response schema, stamping out JSON strings in microseconds.",
    },
    sections: [
      {
        heading: "Registering Fastify Plugins in NestJS",
        body: [
          "Fastify plugins must be registered asynchronously before calling `app.listen()`:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
              "import { AppModule } from './app.module';",
              "import helmet from '@fastify/helmet';",
              "import fastifyCompress from '@fastify/compress';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create<NestFastifyApplication>(",
              "    AppModule,",
              "    new FastifyAdapter()",
              "  );",
              "",
              "  // 1. Security Headers with @fastify/helmet",
              "  await app.register(helmet, {",
              "    contentSecurityPolicy: process.env.NODE_ENV === 'production',",
              "    crossOriginEmbedderPolicy: false,",
              "  });",
              "",
              "  // 2. Response Compression (Gzip / Brotli)",
              "  await app.register(fastifyCompress, {",
              "    encodings: ['gzip', 'deflate'],",
              "    threshold: 1024, // Compress responses over 1KB",
              "  });",
              "",
              "  // 3. CORS Configuration via NestJS",
              "  app.enableCors({",
              "    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],",
              "    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],",
              "    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],",
              "    credentials: true,",
              "    maxAge: 86400, // Cache preflight for 24 hours",
              "  });",
              "",
              "  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Fastify Schema-Based Serialization Mechanics",
        body: [
          "Fastify achieves extreme serialization performance by compiling JSON schemas into optimized string-building functions using `fast-json-stringify`:",
          "• **Traditional `JSON.stringify`**: Recursively inspects every property type at runtime, incurring heavy V8 deoptimization.",
          "• **Fastify Schema Serialization**: Compiles a dedicated string concatenation function on startup based on the known output schema. Properties are emitted directly into the output buffer.",
        ],
        code: [
          {
            file: "fast-serialization-concept.ts",
            lang: "ts",
            code: [
              "// Concept of how fast-json-stringify compiles schemas under the hood:",
              "// Input Schema: { id: 'string', name: 'string', age: 'integer' }",
              "",
              "// Compiled serializer function (pseudo-code):",
              "function compiledSerializer(obj: { id: string; name: string; age: number }) {",
              "  return `{\"id\":\"${obj.id}\",\"name\":\"${obj.name}\",\"age\":${obj.age}}`;",
              "}",
              "",
              "// In NestJS, DTOs with Swagger/Class-Transformer integrate with Fastify schemas",
              "// to provide automatic, ultra-fast JSON output serialization.",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Registering Fastify plugins after app.init() or without await",
      wrong: "app.register(helmet); // Not awaited! Plugin might not be loaded before incoming traffic arrives",
      right: "await app.register(helmet); // Awaited during bootstrap sequence",
      explain:
        "Fastify plugins are asynchronous. Failing to `await app.register()` can result in requests arriving before security headers or compression middleware are mounted.",
    },
    tryIt: [
      "Install `@fastify/helmet` and `@fastify/compress` in your NestJS Fastify project.",
      "Register both plugins in `main.ts` using `await app.register()`.",
      "Send a request using `curl -i http://localhost:3001/api/v1/health` and verify security headers (`X-Content-Type-Options`, `X-Frame-Options`) are present.",
      "Request a large JSON payload with `Accept-Encoding: gzip` and verify the `Content-Encoding: gzip` response header.",
    ],
    challenge: {
      prompt:
        "Write a `main.ts` snippet that configures `@fastify/rate-limit` to allow a maximum of 100 requests per minute per IP address, with custom error messages.",
      hints: [
        "Import `rateLimit from '@fastify/rate-limit'`.",
        "Use `await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })`.",
      ],
      solution: [
        "import rateLimit from '@fastify/rate-limit';",
        "import { NestFastifyApplication } from '@nestjs/platform-fastify';",
        "",
        "export async function configureRateLimiting(app: NestFastifyApplication) {",
        "  await app.register(rateLimit, {",
        "    max: 100,",
        "    timeWindow: '1 minute',",
        "    errorResponseBuilder: (req, context) => ({",
        "      statusCode: 429,",
        "      error: 'Too Many Requests',",
        "      message: `Rate limit exceeded. Try again in ${context.after}`,",
        "      retryAfter: context.after,",
        "    }),",
        "  });",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "How are Fastify plugins registered on a `NestFastifyApplication`?",
        options: [
          "`app.use(plugin)`",
          "`await app.register(plugin, options)`",
          "`app.injectPlugin(plugin)`",
          "`Fastify.plugin(app)`",
        ],
        answer: 1,
        explain:
          "Fastify plugins are registered asynchronously using `await app.register(plugin, options)`.",
      },
      {
        q: "What library powers Fastify's high-speed schema JSON serialization?",
        options: ["`fast-json-stringify`", "`json-fast-pro`", "`protobuf`", "`msgpack`"],
        answer: 0,
        explain:
          "`fast-json-stringify` compiles JSON schemas into optimized string formatting functions on startup.",
      },
      {
        q: "What does `@fastify/helmet` do?",
        options: [
          "Compiles TypeScript files",
          "Sets important HTTP response security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options) to protect against common web vulnerabilities",
          "Speeds up network routing",
          "Encrypts SQLite databases",
        ],
        answer: 1,
        explain:
          "`@fastify/helmet` automatically injects recommended security headers into all HTTP responses.",
      },
      {
        q: "Why is `threshold: 1024` commonly set in `@fastify/compress`?",
        options: [
          "To limit maximum users to 1024",
          "To skip compression for payloads smaller than 1KB, where compression overhead exceeds bandwidth savings",
          "To limit memory usage to 1024MB",
          "To restrict upload file size",
        ],
        answer: 1,
        explain:
          "Compressing tiny payloads (<1KB) wastes CPU cycles and can actually increase payload size.",
      },
      {
        q: "What is the role of `maxAge: 86400` in CORS configuration?",
        options: [
          "It expires user passwords in 24 hours",
          "It instructs browsers to cache the CORS preflight (`OPTIONS`) response for 24 hours (86,400 seconds), avoiding redundant preflight roundtrips",
          "It restarts the server every 24 hours",
          "It deletes logs after 24 hours",
        ],
        answer: 1,
        explain:
          "`maxAge` caches CORS preflight responses in the client browser, cutting down latency on subsequent requests.",
      },
      {
        q: "Why must `await` be used when calling `app.register()`?",
        options: [
          "Fastify plugins perform asynchronous initialization (binding hooks, setting up caches); without `await`, requests may arrive before the plugin is active",
          "TypeScript requires it on all functions",
          "It prevents memory leaks",
          "It binds to port 3000",
        ],
        answer: 0,
        explain:
          "Plugins load asynchronously; awaiting them ensures the server only accepts traffic once all security and utility layers are mounted.",
      },
    ],
    flashcards: [
      {
        front: "How do you register a Fastify plugin in NestJS?",
        back: "`await app.register(plugin, options)` on the `NestFastifyApplication` instance.",
      },
      {
        front: "What is `@fastify/helmet`?",
        back: "Fastify plugin that injects essential HTTP security headers (CSP, X-Frame-Options, HSTS).",
      },
      {
        front: "What is `fast-json-stringify`?",
        back: "The compiled JSON serializer used by Fastify for 2-3x faster string serialization.",
      },
      {
        front: "How do you enable CORS for Next.js frontend origin in Fastify?",
        back: "`app.enableCors({ origin: 'http://localhost:3000', credentials: true })`.",
      },
      {
        front: "What does `@fastify/compress` do?",
        back: "Compresses response bodies with Gzip or Brotli based on client `Accept-Encoding` headers.",
      },
      {
        front: "Why set compression `threshold: 1024`?",
        back: "Avoids compressing tiny responses (<1KB) where compression overhead outweighs bandwidth savings.",
      },
      {
        front: "What does CORS `maxAge` control?",
        back: "The duration in seconds that browsers cache the `OPTIONS` preflight response.",
      },
      {
        front: "Why must Fastify plugin registration be awaited?",
        back: "To ensure plugins are fully initialized and mounted before the server begins accepting requests.",
      },
    ],
    recap: [
      "Register Fastify plugins using `await app.register(plugin, options)` during bootstrap.",
      "Harden HTTP responses with `@fastify/helmet` for production security.",
      "Compress responses over 1KB with `@fastify/compress` (Gzip/Brotli).",
      "Configure CORS with explicit origin whitelists, allowed methods, and preflight `maxAge`.",
      "Leverage Fastify's `fast-json-stringify` for high-throughput JSON serialization.",
    ],
    references: [
      { label: "Fastify Documentation — Plugins Guide", url: "https://fastify.dev/docs/latest/Guides/Plugins-Guide/" },
      { label: "NestJS Documentation — Security Headers (Helmet)", url: "https://docs.nestjs.com/security/helmet" },
    ],
    nextBridge:
      "Now that plugins and security headers are configured, in P11-L3 you will master streaming multipart file uploads and body size limit guardrails.",
  },
  {
    id: "p11-l3",
    phaseId: "p11",
    title: "Multipart Uploads & Body Limits",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "File uploads and large payloads are a major attack surface for Denial of Service (DoS) and out-of-memory crashes. Express developers frequently rely on `multer`, which is incompatible with Fastify. This lesson teaches how to handle multipart file uploads efficiently using `@fastify/multipart`, enforce strict body size and file limits, stream files directly to cloud storage (or disk), and protect against memory exhaustion.",
    prerequisites: [
      "p07-l2 — HTTP methods, status codes & headers",
      "p10-l1 — Bootstrap & Fastify adapter",
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
    ],
    objectives: [
      "Understand why Express `multer` fails on Fastify and master `@fastify/multipart`.",
      "Configure global and per-route payload size limits (`bodyLimit`, `fileSize`).",
      "Stream incoming multipart files directly without buffering large blobs into Node.js heap memory.",
      "Validate file extensions, MIME types, and file magic bytes safely.",
      "Prevent Denial of Service (DoS) attacks caused by uncontrolled payload sizes.",
    ],
    simple:
      "Buffering a 50MB file into Node.js memory before saving it is like trying to hold 50 gallons of water in your mouth before spitting it into a bucket: you choke and run out of breath. Streaming with `@fastify/multipart` is like using a garden hose: the water flows straight from the source to the bucket in a continuous, controlled trickle without straining your body.",
    why:
      "If 20 concurrent users upload 50MB video files and your server buffers them in memory with Multer, your Node.js process consumes 1GB+ of RAM and crashes with `JavaScript heap out of memory`. Fastify's stream-first multipart architecture processes large files in small 64KB chunks with zero memory bloat.",
    mentalModel: {
      title: "The Garden Hose vs The Giant Bucket",
      body: "• **Buffering (Multer/MemoryStorage)**: Reads the entire incoming network stream into a massive in-memory `Buffer`. Consumes huge RAM, triggers heavy garbage collection, and risks process crashes.\n• **Streaming (Fastify Multipart)**: Hands you a readable stream (`data.file`). You pipe the stream directly into Supabase Storage or an S3 bucket. Peak RAM usage is just a few kilobytes regardless of file size.",
    },
    sections: [
      {
        heading: "Configuring @fastify/multipart in NestJS",
        body: [
          "Register `@fastify/multipart` with global file size limits during bootstrap:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
              "import { AppModule } from './app.module';",
              "import fastifyMultipart from '@fastify/multipart';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create<NestFastifyApplication>(",
              "    AppModule,",
              "    new FastifyAdapter({",
              "      bodyLimit: 1_048_576, // 1MB limit for standard JSON bodies",
              "    })",
              "  );",
              "",
              "  // Register Fastify Multipart plugin with guardrails",
              "  await app.register(fastifyMultipart, {",
              "    limits: {",
              "      fieldNameSize: 100,        // Max field name size in bytes",
              "      fieldSize: 1024 * 1024,    // 1MB max field value size",
              "      fields: 10,                // Max non-file fields",
              "      fileSize: 10 * 1024 * 1024,// 10MB max file size",
              "      files: 1,                  // Max 1 file per request",
              "    },",
              "  });",
              "",
              "  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Streaming File Upload Controller",
        body: [
          "Handle file uploads by consuming the stream directly from `FastifyRequest`:",
        ],
        code: [
          {
            file: "src/uploads/uploads.controller.ts",
            lang: "ts",
            code: [
              "import {",
              "  Controller,",
              "  Post,",
              "  Req,",
              "  BadRequestException,",
              "  PayloadTooLargeException,",
              "  HttpCode,",
              "  HttpStatus,",
              "} from '@nestjs/common';",
              "import type { FastifyRequest } from 'fastify';",
              "import { pipeline } from 'stream/promises';",
              "import * as fs from 'fs';",
              "import * as path from 'path';",
              "",
              "@Controller('uploads')",
              "export class UploadsController {",
              "  private readonly allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];",
              "",
              "  @Post('avatar')",
              "  @HttpCode(HttpStatus.CREATED)",
              "  async uploadAvatar(@Req() req: FastifyRequest) {",
              "    // 1. Verify request is multipart",
              "    if (!req.isMultipart()) {",
              "      throw new BadRequestException('Request must be multipart/form-data');",
              "    }",
              "",
              "    // 2. Extract file stream",
              "    const fileData = await req.file();",
              "    if (!fileData) {",
              "      throw new BadRequestException('No file uploaded');",
              "    }",
              "",
              "    // 3. MIME type validation",
              "    if (!this.allowedMimes.includes(fileData.mimetype)) {",
              "      throw new BadRequestException(`Unsupported file type '${fileData.mimetype}'`);",
              "    }",
              "",
              "    // 4. Stream directly to destination (or cloud storage pipeline)",
              "    const safeFilename = `${crypto.randomUUID()}-${path.basename(fileData.filename)}`;",
              "    const targetPath = path.join(process.cwd(), 'tmp', safeFilename);",
              "",
              "    try {",
              "      await pipeline(fileData.file, fs.createWriteStream(targetPath));",
              "    } catch (err: any) {",
              "      if (fileData.file.truncated) {",
              "        // File exceeded configured limits",
              "        throw new PayloadTooLargeException('File exceeds 10MB size limit');",
              "      }",
              "      throw err;",
              "    }",
              "",
              "    return {",
              "      filename: safeFilename,",
              "      mimetype: fileData.mimetype,",
              "      status: 'uploaded',",
              "    };",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Attempting to use NestJS FileInterceptor (Multer) with FastifyAdapter",
      wrong: "@UseInterceptors(FileInterceptor('file')) // Throws runtime error: Multer is Express-only!",
      right: "await req.file(); // Use @fastify/multipart stream API",
      explain:
        "NestJS's built-in `FileInterceptor` relies on Express `multer`. Under Fastify, you must use `@fastify/multipart` to access file streams safely.",
    },
    tryIt: [
      "Register `@fastify/multipart` in `main.ts` with `fileSize: 10 * 1024 * 1024`.",
      "Send a multipart POST request with an image using `curl -F 'file=@photo.jpg' http://localhost:3001/api/v1/uploads/avatar`.",
      "Attempt uploading a `.exe` or disallowed MIME type and observe HTTP 400 rejection.",
      "Attempt uploading a file larger than 10MB and verify it triggers `PayloadTooLargeException` (HTTP 413).",
    ],
    challenge: {
      prompt:
        "Write a service method `streamToBuffer` that converts a Fastify multipart file stream into a Node.js `Buffer` in memory only for small thumbnail generation (< 2MB).",
      hints: [
        "Use `await fileData.toBuffer()` provided by `@fastify/multipart`.",
      ],
      solution: [
        "import type { MultipartFile } from '@fastify/multipart';",
        "import { BadRequestException } from '@nestjs/common';",
        "",
        "export async function processThumbnail(fileData: MultipartFile): Promise<Buffer> {",
        "  if (fileData.mimetype !== 'image/png' && fileData.mimetype !== 'image/jpeg') {",
        "    throw new BadRequestException('Thumbnail must be JPEG or PNG');",
        "  }",
        "  // Fastify multipart helper to convert small file streams to Buffer",
        "  const buffer = await fileData.toBuffer();",
        "  return buffer;",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Why does NestJS's standard `FileInterceptor` fail when using `FastifyAdapter`?",
        options: [
          "`FileInterceptor` is tied to Express's `multer` engine and does not support Fastify's streaming architecture",
          "Fastify does not support files",
          "TypeScript prohibits file uploads",
          "It only works on Linux",
        ],
        answer: 0,
        explain:
          "`FileInterceptor` depends on Express `multer`. Fastify uses `@fastify/multipart` for high-efficiency stream-based uploads.",
      },
      {
        q: "What is the primary performance benefit of streaming file uploads?",
        options: [
          "It keeps memory usage constant and minimal regardless of file size, avoiding out-of-memory heap crashes",
          "It compresses files by 90%",
          "It bypasses the network firewall",
          "It eliminates the need for HTTP status codes",
        ],
        answer: 0,
        explain:
          "Streaming processes chunks sequentially rather than buffering the entire file into Node.js heap memory.",
      },
      {
        q: "What property indicates that a file upload was truncated because it exceeded size limits in `@fastify/multipart`?",
        options: ["`fileData.file.truncated`", "`fileData.isOver`", "`fileData.exceeded`", "`fileData.overflow`"],
        answer: 0,
        explain:
          "The `truncated` boolean property on `fileData.file` is set to `true` if the stream hit configured size limits.",
      },
      {
        q: "What HTTP status code represents `PayloadTooLargeException`?",
        options: ["400 Bad Request", "413 Payload Too Large", "422 Unprocessable Entity", "500 Internal Server Error"],
        answer: 1,
        explain:
          "HTTP 413 Payload Too Large is the standard status code when a request exceeds permitted size limits.",
      },
      {
        q: "How do you set a global limit on standard JSON request bodies in Fastify?",
        options: [
          "Passing `bodyLimit: 1048576` (1MB) to the `FastifyAdapter` constructor options",
          "Using a CSS stylesheet",
          "In `tsconfig.json`",
          "In the database schema",
        ],
        answer: 0,
        explain:
          "`bodyLimit` in FastifyAdapter configuration enforces maximum byte sizes for incoming request bodies.",
      },
      {
        q: "Why should uploaded filenames always be sanitized or replaced with UUIDs before writing to storage?",
        options: [
          "To prevent path traversal attacks (e.g. `../../etc/passwd`) and name collision overwrites",
          "Because Node.js only supports numbers in filenames",
          "To reduce disk space by 50%",
          "It is required by the HTTP/1.1 specification",
        ],
        answer: 0,
        explain:
          "Client-provided filenames can contain path traversal characters (`../`) or collide with existing user uploads.",
      },
    ],
    flashcards: [
      {
        front: "Which plugin handles multipart uploads in Fastify?",
        back: "`@fastify/multipart`.",
      },
      {
        front: "Why does Multer crash on Fastify?",
        back: "Multer is built on Express middleware architecture; Fastify uses a stream-based plugin model.",
      },
      {
        front: "How do you check if a request is multipart in Fastify?",
        back: "`req.isMultipart()`.",
      },
      {
        front: "How do you extract a single file stream in Fastify?",
        back: "`const fileData = await req.file();`.",
      },
      {
        front: "How do you detect if a file was cut off due to size limits?",
        back: "Check `fileData.file.truncated === true`.",
      },
      {
        front: "What is HTTP status 413?",
        back: "Payload Too Large (`PayloadTooLargeException`).",
      },
      {
        front: "How do you set standard JSON body limits in FastifyAdapter?",
        back: "Pass `{ bodyLimit: 1_048_576 }` (1MB) to `new FastifyAdapter()`.",
      },
      {
        front: "Why is streaming safer than buffering files in memory?",
        back: "Streaming maintains low, constant RAM usage, preventing heap exhaustion under concurrent uploads.",
      },
    ],
    recap: [
      "Use `@fastify/multipart` for file uploads instead of Express `multer`.",
      "Enforce global body limits with `bodyLimit` in `FastifyAdapter` constructor.",
      "Configure strict multipart limits (`fileSize`, `files`, `fieldSize`) during plugin registration.",
      "Stream files directly using `pipeline(fileData.file, destinationStream)` to prevent memory exhaustion.",
      "Always sanitize filenames with UUIDs and validate MIME types against an allowlist.",
    ],
    references: [
      { label: "Fastify Documentation — @fastify/multipart", url: "https://github.com/fastify/fastify-multipart" },
      { label: "OWASP File Upload Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html" },
    ],
    nextBridge:
      "Now that uploads and body limits are locked down, in P11-L4 you will explore logging, trust proxy configuration, and Fastify's performance benchmarking profile.",
  },
];

export const LESSON_CONTENT_P11: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P11.map((l) => [l.id, l])
);
