import type { LessonContent } from "./types";

export const LESSON_CONTENT_P32B: Record<string, LessonContent> = {
  "p32-l4": {
    id: "p32-l4",
    phaseId: "p32",
    title: "Fastify Serialization & API Latency",
    level: "Advanced",
    minutes: 35,
    summary:
      "Optimize backend throughput and cut p95 response latencies using Fastify response schema compilation and `fast-json-stringify`.",
    prerequisites: ["p11-l1 Fastify Core", "p32-l1 Performance Baselines"],
    objectives: [
      "Compile JSON response schemas using Fastify schema compiler.",
      "Achieve 2-4x higher JSON throughput compared to uncompiled Express `res.json()`.",
      "Audit event loop delays during high-throughput serialization.",
    ],
    simple:
      "When your API returns a list of 500 items, `JSON.stringify()` has to inspect every single JavaScript object property at runtime. By defining a response schema ahead of time, Fastify compiles a specialized C-style serializer that writes the JSON string directly, doubling your server's requests-per-second capacity.",
    why:
      "In high-traffic microservices, JSON serialization accounts for up to 30% of total CPU time.",
    mentalModel: {
      title: "The Stencil vs Freehand Painting",
      body:
        "Standard JSON.stringify is like painting every letter freehand. A compiled schema is a pre-cut laser stencil: you spray paint once and the entire text appears instantly.",
    },
    sections: [
      {
        heading: "1. Fastify Compiled Response Schemas",
        body: [
          "- Defining JSON schemas on routes allows Fastify to compile serializers using `fast-json-stringify`.",
          "- Automatically filters out unlisted internal model properties for added security.",
        ],
        code: [
          {
            file: "fastify-schema.ts",
            lang: "ts",
            code: [
              "import Fastify from 'fastify';",
              "const fastify = Fastify();",
              "",
              "fastify.get('/api/v1/projects', {",
              "  schema: {",
              "    response: {",
              "      200: {",
              "        type: 'array',",
              "        items: {",
              "          type: 'object',",
              "          properties: {",
              "            id: { type: 'string' },",
              "            name: { type: 'string' },",
              "            status: { type: 'string' },",
              "          },",
              "          required: ['id', 'name', 'status'],",
              "        },",
              "      },",
              "    },",
              "  },",
              "  handler: async () => {",
              "    return await fetchProjectsFromDatabase();",
              "  },",
              "});",
            ].join("\n"),
            caption: "Fastify route with compiled JSON response schema.",
          },
        ],
      },
    ],
    mistake: {
      title: "Serializing Massive 20MB Payloads in a Single HTTP Request",
      wrong: [
        "// ❌ Returning 50,000 items in one JSON payload:",
        "res.json(allHistoricalEvents); // Blocks Node event loop for 400ms while allocating 100MB RAM!",
      ].join("\n"),
      right: [
        "// ✅ Use keyset pagination or stream JSON via NDJSON / Server-Sent Events.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Benchmark Express vs Fastify Serialization",
      description:
        "Run an `autocannon` benchmark comparing an Express JSON endpoint vs a Fastify schema-compiled endpoint, observing request rate and latency differences.",
      tasks: [
        "Run `autocannon -c 100 -d 5 http://localhost:3000/express-test`.",
        "Run `autocannon -c 100 -d 5 http://localhost:3000/fastify-test`.",
        "Record requests/sec and latency improvement.",
      ],
    },
    quiz: [
      {
        question: "How does Fastify response schema compilation improve both speed and security?",
        options: [
          "It pre-compiles high-speed serialization code while automatically stripping out any private database fields (like passwordHash) not explicitly listed in the schema.",
          "It converts all routes to GraphQL.",
          "It disables CORS.",
          "It runs on the GPU.",
        ],
        answer: 0,
        explanation:
          "Fastify's schema-based serialization generates optimized string writers and filters out unlisted model properties before wire transmission.",
      },
    ],
  },

  "p32-l5": {
    id: "p32-l5",
    phaseId: "p32",
    title: "Prisma Query Counts & Postgres Indexes",
    level: "Advanced",
    minutes: 40,
    summary:
      "Audit database query counts, detect hidden N+1 queries using Prisma query event logging, and create composite B-Tree indexes.",
    prerequisites: ["p14-l1 Prisma Core", "p13-l1 Postgres Fundamentals"],
    objectives: [
      "Enable Prisma `$on('query')` event logging to count queries executed per HTTP request.",
      "Eliminate N+1 relation loops using `include` or Dataloader.",
      "Verify query plan improvements using `EXPLAIN (ANALYZE, BUFFERS)`.",
    ],
    simple:
      "An N+1 problem occurs when your backend makes 1 query to get 50 projects, and then loops over each project making 50 individual queries to get their tasks (51 queries total). With proper batching or `include: { tasks: true }`, all data is fetched in 1 single fast SQL query.",
    why:
      "N+1 queries turn a 10ms API route into a 2-second bottleneck as database connections get saturated.",
    mentalModel: {
      title: "The Grocery Run",
      body:
        "If you need 10 items from the supermarket, you don't drive to the store, buy 1 apple, drive home, drive back to buy 1 carton of milk, and drive home 10 times. You take a list and buy all 10 items in 1 trip.",
    },
    sections: [
      {
        heading: "1. Detecting N+1 Queries with Prisma Event Logging",
        body: [
          "Enable Prisma query event listeners during development and integration tests to assert that query counts remain constant (O(1)) regardless of item count.",
        ],
        code: [
          {
            file: "prisma-query-logger.ts",
            lang: "ts",
            code: [
              "import { PrismaClient } from '@prisma/client';",
              "",
              "export const prisma = new PrismaClient({",
              "  log: [",
              "    { emit: 'event', level: 'query' },",
              "    { emit: 'stdout', level: 'error' },",
              "  ],",
              "});",
              "",
              "let queryCount = 0;",
              "prisma.$on('query' as any, (e: any) => {",
              "  queryCount++;",
              "  if (e.duration > 50) {",
              "    console.warn(`[SLOW QUERY ${e.duration}ms]: ${e.query}`);",
              "  }",
              "});",
            ].join("\n"),
            caption: "Prisma query counter and slow-query alerting listener.",
          },
        ],
      },
    ],
    mistake: {
      title: "Awaiting Database Queries Inside an Array forEach / map Loop",
      wrong: [
        "// ❌ N+1 query loop:",
        "const projects = await prisma.project.findMany();",
        "for (const p of projects) {",
        "  p.taskCount = await prisma.task.count({ where: { projectId: p.id } });",
        "}",
      ].join("\n"),
      right: [
        "// ✅ Single grouped query:",
        "const projects = await prisma.project.findMany({",
        "  include: { _count: { select: { tasks: true } } },",
        "});",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Fix N+1 in a Project Task Dashboard",
      description:
        "Refactor an N+1 query loop into a single batched query and verify with Prisma query logs that query count drops from 26 to 1.",
      tasks: [
        "Instrument test endpoint with query counter.",
        "Identify the loop triggering 25 sub-queries.",
        "Replace with `include: { tasks: true }` and assert `queryCount === 1`.",
      ],
    },
    quiz: [
      {
        question: "How do you detect N+1 database queries in development?",
        options: [
          "By listening to Prisma query events or using an APM tool to inspect query counts per HTTP request.",
          "By checking CSS files.",
          "By measuring WiFi signal strength.",
          "By inspecting git commits.",
        ],
        answer: 0,
        explanation:
          "Logging query events per request reveals when an endpoint executes proportional numbers of queries as list lengths grow.",
      },
    ],
  },

  "p32-l6": {
    id: "p32-l6",
    phaseId: "p32",
    title: "Load-Testing Basics & Bottleneck Diagnosis",
    level: "Advanced",
    minutes: 40,
    summary:
      "Write realistic load test scenarios using Grafana k6. Model user ramp-ups, test breaking thresholds, and validate p95 latency SLOs under extreme concurrency.",
    prerequisites: ["p32-l1 Performance Baselines", "p07-l1 HTTP Fundamentals"],
    objectives: [
      "Author declarative JavaScript load test scenarios in k6 (Virtual Users, Stages, Thresholds).",
      "Stress test endpoints to identify concurrency breaking points and connection pool exhaustion.",
      "Automate performance regression gates in CI pipelines.",
    ],
    simple:
      "A feature might work perfectly when 1 developer clicks it on localhost. But what happens when 5,000 users visit your site simultaneously on Black Friday? k6 is a high-performance load testing tool written in Go that simulates thousands of simultaneous virtual users clicking buttons and sending requests to prove your server can handle the traffic.",
    why:
      "Discovering your server crashes at 200 users during a live product launch destroys company reputation and revenue.",
    mentalModel: {
      title: "The Bridge Stress Test",
      body:
        "Civil engineers don't open a suspension bridge to public traffic and hope for the best. They drive 50 loaded gravel trucks onto the bridge and measure structural deflection before cutting the ribbon.",
    },
    sections: [
      {
        heading: "1. Authoring k6 Load Test Scenarios",
        body: [
          "- **Virtual Users (VUs)**: Simulated concurrent HTTP clients.",
          "- **Stages**: Ramp up from 0 to 500 VUs over 1 minute, hold for 3 minutes, ramp down.",
          "- **Thresholds (SLOs)**: If `http_req_duration: ['p(95)<150']` fails, k6 exits with code 1 to fail the build.",
        ],
        code: [
          {
            file: "load-test.js",
            lang: "javascript",
            code: [
              "import http from 'k6/http';",
              "import { check, sleep } from 'k6';",
              "",
              "export const options = {",
              "  stages: [",
              "    { duration: '30s', target: 50 },",
              "    { duration: '1m', target: 200 },",
              "    { duration: '30s', target: 0 },",
              "  ],",
              "  thresholds: {",
              "    http_req_duration: ['p(95)<200', 'p(99)<400'],",
              "    http_req_failed: ['rate<0.01'],",
              "  },",
              "};",
              "",
              "export default function () {",
              "  const res = http.get('http://localhost:3000/api/v1/projects');",
              "  check(res, {",
              "    'status is 200': (r) => r.status === 200,",
              "    'response time < 200ms': (r) => r.timings.duration < 200,",
              "  });",
              "  sleep(1);",
              "}",
            ].join("\n"),
            caption: "k6 load test script with strict p95 latency thresholds.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Load Tests on the Same Machine Hosting the Server",
      wrong: [
        "// ❌ Running k6 with 1,000 VUs on your laptop against localhost:",
        "// The k6 load generator consumes 100% of your CPU, starving the server and giving completely inaccurate latency numbers!",
      ].join("\n"),
      right: [
        "// ✅ Run load test generators from a separate machine/container on the same network or use cloud load runners.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Run a Ramp-Up Load Test with k6",
      description:
        "Execute a 2-minute k6 load test against your local production build, analyze the p95 and p99 output summary, and verify all threshold assertions pass.",
      tasks: [
        "Install k6 and execute `k6 run load-test.js`.",
        "Observe the terminal summary metrics (req/s, p90, p95, p99).",
        "Introduce an artificial delay in the endpoint and confirm k6 fails threshold checks.",
      ],
    },
    quiz: [
      {
        question: "Why are p95 and p99 thresholds in k6 superior to average response time assertions?",
        options: [
          "They are easier to calculate.",
          "Average hides long tail latency spikes and timeouts experienced by unlucky users under heavy load.",
          "k6 does not support average calculations.",
          "Averages only work on GET requests.",
        ],
        answer: 1,
        explanation:
          "Tail latency percentiles (p95/p99) capture the real degradation experienced by users during database locks or thread pool saturation.",
      },
    ],
  },

  "p32-l7": {
    id: "p32-l7",
    phaseId: "p32",
    title: "End-to-End Latency: Browser → Postgres Trace",
    level: "Advanced",
    minutes: 35,
    summary:
      "Trace the full lifecycle of an HTTP request across every network and processing hop: DNS, TLS handshake, CDN edge, reverse proxy, Fastify middleware, ORM serialization, Postgres query, and DOM render.",
    prerequisites: ["p32-l1 Performance Baselines", "p07-l1 HTTP Fundamentals"],
    objectives: [
      "Break down end-to-end request latency into distinct budget categories.",
      "Identify latency overhead at each hop (Edge, SSL, Middleware, DB, Serialization, Network).",
      "Produce a holistic End-to-End Latency Trace Report.",
    ],
    simple:
      "When a user in London clicks a button and waits 400ms for data from a server in New York, where did those 400ms go? 80ms went to the speed-of-light transatlantic fiber cable, 30ms to TLS handshakes, 5ms to Nginx, 12ms to NestJS, 8ms to PostgreSQL, and 45ms to browser DOM rendering. Tracing every hop tells you exactly which lever to pull to make it faster.",
    why:
      "Without full-hop tracing, teams blame the database when the actual latency problem is an un-cached CDN or distant geographical region.",
    mentalModel: {
      title: "The Package Delivery Tracking Timeline",
      body:
        "When an online order is delayed, your tracking number shows: 'Picked up (Day 1) -> Regional Sorting (Day 2) -> Customs Clearance (Day 5) -> Out for Delivery (Day 6)'. Distributed tracing provides the exact same milestone timestamp breakdown for every single HTTP request.",
    },
    sections: [
      {
        heading: "1. The Full Request Hop Latency Budget Breakdown",
        body: [
          "1. **DNS Lookup & TCP/TLS Handshake** (20-60ms on cold connection).",
          "2. **Edge CDN Routing** (Cloudflare / CloudFront) (5-15ms).",
          "3. **Reverse Proxy & Ingress** (Nginx / Envoy) (<2ms).",
          "4. **Node.js / Fastify Middleware & Auth Guard** (3-8ms).",
          "5. **PostgreSQL Query Execution & Network Roundtrip** (2-15ms).",
          "6. **JSON Serialization & Response Compression** (2-6ms).",
          "7. **Browser DOM Paint & React State Reconciliation** (16-50ms).",
        ],
        code: [
          {
            file: "server-timing.ts",
            lang: "ts",
            code: [
              "import { FastifyReply, FastifyRequest } from 'fastify';",
              "",
              "// Inject Server-Timing headers so Chrome DevTools Network Tab shows exact backend breakdown",
              "export function addServerTimingHeaders(",
              "  reply: FastifyReply,",
              "  timings: { db: number; auth: number; render: number },",
              ") {",
              "  const headerValue = [",
              "    `auth;dur=${timings.auth};desc=\"Auth Guard\"`,",
              "    `db;dur=${timings.db};desc=\"PostgreSQL Query\"`,",
              "    `render;dur=${timings.render};desc=\"Serialization\"`,",
              "  ].join(', ');",
              "",
              "  reply.header('Server-Timing', headerValue);",
              "}",
            ].join("\n"),
            caption: "Using Server-Timing headers for full-trace browser observability.",
          },
        ],
      },
    ],
    mistake: {
      title: "Optimizing Microsecond JS Math While Ignoring 200ms Network Roundtrips",
      wrong: [
        "// ❌ Spending 3 days optimizing a for-loop from 0.05ms to 0.01ms while hosting the database in London and backend in Tokyo (250ms roundtrip)!",
      ].join("\n"),
      right: [
        "// ✅ Colocate backend compute and database in the same cloud region to eliminate cross-datacenter latency hops.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Inspect Server-Timing in Chrome DevTools",
      description:
        "Inject `Server-Timing` headers into your NestJS API and inspect the granular timing waterfall inside the Chrome DevTools Network tab.",
      tasks: [
        "Add timing interceptor to NestJS.",
        "Open DevTools -> Network -> Select API Request -> Timing Tab.",
        "View Server-Timing breakdown directly inside browser UI.",
      ],
    },
    quiz: [
      {
        question: "What is the purpose of the HTTP 'Server-Timing' response header?",
        options: [
          "It syncs the browser clock with the server.",
          "It communicates server-side performance metrics (e.g. database time, cache time) directly to the browser's Developer Tools Network panel and performance.getEntriesByType('navigation') API.",
          "It sets cookie expiration.",
          "It enables HTTP 3.0.",
        ],
        answer: 1,
        explanation:
          "The Server-Timing header allows backend servers to pass execution timing metrics to the browser developer tools for unified frontend/backend performance analysis.",
      },
    ],
  },
};
