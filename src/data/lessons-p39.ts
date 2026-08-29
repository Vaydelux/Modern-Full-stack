import type { LessonContent } from "./types";

export const LESSON_CONTENT_P39: Record<string, LessonContent> = {
  "p39-l1": {
    id: "p39-l1",
    phaseId: "p39",
    title: "Vertical vs Horizontal & the Stateless API",
    level: "Mastery",
    minutes: 35,
    summary:
      "Scale web applications horizontally across N containers. Enforce strict 12-Factor statelessness by banishing local disk writes, in-memory sessions, and sticky IP routing.",
    prerequisites: ["p10-l1 NestJS Core", "p38-l2 NestJS Deployment"],
    objectives: [
      "Distinguish Vertical Scaling (bigger CPU/RAM) from Horizontal Scaling (more container replicas).",
      "Eliminate server statefulness (sessions, file uploads, in-memory caches) from backend nodes.",
      "Configure round-robin load balancers with dynamic auto-scaling rules (CPU > 70%).",
    ],
    simple:
      "If one worker carrying boxes gets tired, you have two choices: give that worker steroids (Vertical Scaling) or hire 5 more workers (Horizontal Scaling). Vertical scaling hits a hard ceiling when the biggest server in AWS costs $5,000/month. Horizontal scaling lets you spin up 50 cheap, identical $10 containers when traffic spikes on Black Friday, and delete them when traffic subsides.",
    why:
      "Horizontal auto-scaling is the foundation of high-availability cloud systems.",
    mentalModel: {
      title: "The Supermarket Cash Registers",
      body:
        "When 100 shoppers arrive at the supermarket, the store manager doesn't replace the cashier with a world-champion scanner robot. They simply turn on registers 2, 3, 4, and 5.",
    },
    sections: [
      {
        heading: "1. The 3 Rules of Stateless API Services",
        body: [
          "1. **Zero Local Disk Writes**: Files must be streamed directly to S3 / Cloudflare R2 / Supabase Storage.",
          "2. **Zero In-Memory Sessions**: JWTs or centralized Redis session stores only.",
          "3. **Zero Local Timers/Cron**: Use BullMQ scheduled jobs or cloud cron triggers.",
        ],
        code: [
          {
            file: "src/file-upload.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';",
              "",
              "@Injectable()",
              "export class FileUploadService {",
              "  private s3 = new S3Client({ region: process.env.AWS_REGION });",
              "",
              "  // ✅ Stateless: Streams file directly to object store rather than saving to local /tmp",
              "  async uploadAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string> {",
              "    const key = `avatars/${userId}-${Date.now()}.png`;",
              "    await this.s3.send(new PutObjectCommand({",
              "      Bucket: process.env.S3_BUCKET_NAME,",
              "      Key: key,",
              "      Body: buffer,",
              "      ContentType: mimeType,",
              "    }));",
              "    return `https://${process.env.CDN_DOMAIN}/${key}`;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Stateless file uploading directly to cloud object storage.",
          },
        ],
      },
    ],
    mistake: {
      title: "Storing Session Data in Node.js Local Process Memory ('req.session')",
      wrong: [
        "// ❌ In-memory session store on server 1:",
        "// When the user's next request hits server 2 behind the load balancer, their session is missing and they get logged out!",
      ].join("\n"),
      right: [
        "// ✅ Store all session state in a centralized Redis cluster or self-contained signed JWTs.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Audit an API for 12-Factor Statelessness",
      description:
        "Scan a codebase for local filesystem writes (`fs.writeFileSync`), in-memory caches (`new Map()`), and local intervals, replacing them with Redis and S3.",
      tasks: [
        "Audit server for local disk usage.",
        "Refactor avatar upload to stream to S3 mock.",
        "Verify 2 separate server instances share identical session state.",
      ],
    },
    quiz: [
      {
        question: "Why is saving user uploaded files to the local container disk ('/tmp') an architectural failure in horizontal scaling?",
        options: [
          "Because subsequent requests to read or download the file may hit a different container replica that does not have that local file on its disk.",
          "Because Linux does not have a /tmp folder.",
          "Because Node.js cannot write files.",
          "To reduce CPU clock speeds.",
        ],
        answer: 0,
        explanation:
          "In a multi-replica cluster, local container filesystems are ephemeral and completely isolated; files must reside in centralized shared object storage.",
      },
    ],
  },

  "p39-l2": {
    id: "p39-l2",
    phaseId: "p39",
    title: "Pool Sizing & the Postgres Bottleneck",
    level: "Mastery",
    minutes: 35,
    summary:
      "Calculate PostgreSQL connection pool sizing limits. Master Little's Law, prevent `max_connections` exhaustion, and configure PgBouncer / Supabase Supavisor connection pools.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p14-l1 Prisma Core"],
    objectives: [
      "Apply the PostgreSQL connection formula: `max_connections = (CPU cores * 2) + disk_spindle_count`.",
      "Diagnose 'FATAL: remaining connection slots are reserved' database crashes under load.",
      "Configure Transaction-Mode connection pooling to handle 10,000 concurrent HTTP requests.",
    ],
    simple:
      "A common rookie mistake is setting `connection_limit = 100` on 10 API servers, opening 1,000 connections to PostgreSQL. Each PostgreSQL connection consumes 10MB of server RAM and forces CPU context switching. PostgreSQL actually runs *faster* with 20 pooled connections than with 1,000 direct connections because the CPU spends 100% of its time executing queries rather than swapping threads.",
    why:
      "Database connection exhaustion is the #1 reason web applications crash during sudden traffic spikes.",
    mentalModel: {
      title: "The Bank Teller Windows",
      body:
        "If a bank has 4 teller windows (4 CPU cores), having 500 customers all cram into the counter simultaneously causes chaos and fights. Having customers wait in a single orderly queue and step up to the 4 windows one-by-one processes the entire line in record time.",
    },
    sections: [
      {
        heading: "1. The Pool Sizing Mathematics",
        body: [
          "- **Formula**: `Pool Size = (Core Count * 2) + Effective Spindle/Disk Count`.",
          "- For an 8-core DB server, optimal pool size is approximately 16 to 20 connections.",
          "- Use PgBouncer in **Transaction Mode** so a connection is only held for the exact duration of a single SQL query (1-5ms) and immediately returned.",
        ],
      },
    ],
    mistake: {
      title: "Configuring Each Serverless Lambda / Edge Worker with Its Own Direct Connection Pool",
      wrong: [
        "// ❌ 2,000 serverless functions booting up and each opening 5 direct Postgres connections:",
        "// 10,000 connections instantly overwhelm PostgreSQL and crash the entire database cluster!",
      ].join("\n"),
      right: [
        "// ✅ Place PgBouncer / Neon Proxy / Supabase Supavisor between serverless compute and Postgres.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Measure Throughput Under Connection Saturation",
      description:
        "Benchmark query throughput with Autocannon: compare 500 direct client connections vs 20 pooled connections through PgBouncer.",
      tasks: [
        "Configure Prisma with `connection_limit=5` per node.",
        "Run load test with 500 concurrent connections.",
        "Observe latency reduction and memory stabilization with pooling.",
      ],
    },
    quiz: [
      {
        question: "Why does PostgreSQL performance often degrade when increasing 'max_connections' from 50 to 2,000?",
        options: [
          "Because the database server CPU wastes massive amounts of time on thread context-switching and memory allocation rather than executing SQL queries.",
          "Because PostgreSQL only allows 1 connection.",
          "Because RAM speeds drop.",
          "Because TCP sockets cannot exceed 100.",
        ],
        answer: 0,
        explanation:
          "Excessive active connections cause severe CPU cache thrashing and context switching overhead; connection pooling maintains optimal concurrency.",
      },
    ],
  },

  "p39-l3": {
    id: "p39-l3",
    phaseId: "p39",
    title: "Caches, Queues, CDN & Backpressure",
    level: "Mastery",
    minutes: 40,
    summary:
      "Design multi-tier caching topologies (Browser -> CDN -> Redis -> Database). Implement BullMQ backpressure control and Circuit Breakers with Cockatiel.",
    prerequisites: ["p20-l1 Redis Caching", "p29-l1 BullMQ"],
    objectives: [
      "Construct a 4-tier caching strategy with TTLs and Cache-Control headers (`stale-while-revalidate`).",
      "Implement the Circuit Breaker pattern to protect failing downstream third-party APIs.",
      "Apply queue backpressure to throttle incoming job bursts and avoid worker memory exhaustion.",
    ],
    simple:
      "When a burst of 100,000 users hits your site, 90% of requests should be absorbed by the CDN edge in 5ms. The remaining 8% should hit Redis memory cache in 2ms. Only 2% should ever touch the PostgreSQL database. If an external payment provider starts timing out, a Circuit Breaker trips to stop sending requests and returns a clean fallback instantly instead of freezing your servers.",
    why:
      "Multi-tier caching and circuit breakers ensure your app survives 100x traffic surges without crashing.",
    mentalModel: {
      title: "The Flood Control Dam System",
      body:
        "During a hurricane, rainwater first hits the mountain reservoir (CDN), then the canal channels (Redis), and only a controlled trickle flows into the downtown riverbank (Database). The flood gates prevent the city from drowning.",
    },
    sections: [
      {
        heading: "1. Circuit Breaker Implementation with Cockatiel",
        body: [
          "- **Closed State**: Normal operations; requests pass through.",
          "- **Open State**: After 5 consecutive failures, immediately fail fast without calling the external service for 30 seconds.",
          "- **Half-Open State**: Test 1 trial request to see if the downstream service recovered.",
        ],
        code: [
          {
            file: "src/resilience.service.ts",
            lang: "ts",
            code: [
              "import { circuitBreaker, ConsecutiveBreaker, handleAll } from 'cockatiel';",
              "",
              "// Create circuit breaker that trips after 5 consecutive failures and waits 30s",
              "const breaker = circuitBreaker(handleAll, {",
              "  halfOpenAfter: 30_000,",
              "  breaker: new ConsecutiveBreaker(5),",
              "});",
              "",
              "export async function callPaymentGateway(payload: any) {",
              "  return breaker.execute(async () => {",
              "    const res = await fetch('https://api.stripe.com/v1/charges', {",
              "      method: 'POST',",
              "      body: JSON.stringify(payload),",
              "    });",
              "    if (!res.ok) throw new Error(`Stripe returned ${res.status}`);",
              "    return res.json();",
              "  });",
              "}",
            ].join("\n"),
            caption: "Resilient circuit breaker wrapping external payment calls.",
          },
        ],
      },
    ],
    mistake: {
      title: "Retrying Failing Third-Party API Calls in an Infinite Synchronous Loop Without Jitter",
      wrong: [
        "// ❌ While loop retrying 50 times with 0ms delay:",
        "// Creates a 'Thundering Herd' retry storm that completely destroys the recovering third-party API!",
      ].join("\n"),
      right: [
        "// ✅ Use Exponential Backoff with randomized full jitter: `delay = min(maxDelay, base * 2^attempt + random(0, 1000))`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build a Circuit-Breaker Protected HTTP Client",
      description:
        "Wrap an unstable mock API in Cockatiel's circuit breaker, simulate 5 failures, verify the breaker trips to 'open', and verify fast-fail responses.",
      tasks: [
        "Install `cockatiel`.",
        "Implement circuit breaker around unstable endpoint.",
        "Verify immediate rejection when circuit is open without executing HTTP calls.",
      ],
    },
    quiz: [
      {
        question: "What is the purpose of the 'Half-Open' state in a Circuit Breaker pattern?",
        options: [
          "It allows a limited number of trial requests through to check if the failing downstream service has recovered before fully resetting to the Closed state.",
          "It cuts server memory usage in half.",
          "It opens the firewall for SSH.",
          "It formats logs.",
        ],
        answer: 0,
        explanation:
          "The Half-Open state safely probes downstream service health with trial requests without overwhelming it with full traffic.",
      },
    ],
  },
};
