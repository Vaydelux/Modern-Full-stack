import type { LessonContent } from "./types";

export const LESSON_CONTENT_P25: Record<string, LessonContent> = {
  "p25-l1": {
    id: "p25-l1",
    phaseId: "p25",
    title: "The Queue Mental Model & Redis's Role",
    level: "Advanced",
    minutes: 35,
    summary:
      "Understand why slow, flaky, or unbounded work (PDF generation, email sending, AI ingestion, audio transcoding) cannot run inside the synchronous HTTP request-response cycle. Learn the role of Redis as an in-memory data store providing atomic primitives (LPUSH/RPOPLPUSH or Redis Streams) that power BullMQ.",
    prerequisites: ["p21-l2 Fastify Architecture", "p22-l6 Bulk Operations"],
    objectives: [
      "Distinguish between synchronous request-time guarantees and asynchronous eventual consistency.",
      "Understand how Redis provides atomic operations that prevent race conditions in distributed queues.",
      "Identify the 4 telltale symptoms of operations that belong in a background worker.",
    ],
    simple:
      "When a user clicks 'Export 50,000 Invoices to PDF', your web server cannot hold an open HTTP connection for 3 minutes while consuming 100% CPU. Instead, the web server immediately returns '202 Accepted' with a job ID, drops an item into a Redis queue, and a dedicated worker process finishes the heavy lifting in the background.",
    why:
      "Keeping heavy tasks in the HTTP thread pool starves incoming web requests, exhausts connection limits, triggers gateway timeouts (HTTP 504 from Nginx or Cloudflare), and loses user work if the web container restarts during processing.",
    mentalModel: {
      title: "The Fast-Food Counter vs The Kitchen Ticket Line",
      body:
        "The web controller is the cashier taking your order. It takes 5 seconds to take your payment, hands you receipt #482 (Job ID), and prints a physical ticket onto the chef's wheel (Redis Queue). The background worker is the line cook in the kitchen. Even if the kitchen has a 10-minute backlog, the cashier can continue taking 20 customer orders every minute without stalling.",
    },
    sections: [
      {
        heading: "1. The Boundary Between Request-Time and Background Work",
        body: [
          "Every web server has finite concurrency. A Node.js Fastify process handles thousands of concurrent I/O operations, but CPU-bound tasks (compression, PDF generation, cryptographic hashing) block the single-threaded event loop.",
          "Furthermore, third-party network dependencies (like Stripe webhooks, SendGrid emails, or OpenAI API calls) have unpredictable latency and high failure rates. Running them synchronously blocks the user's browser and exposes the user to third-party timeout crashes.",
        ],
        code: [
          {
            file: "decision-matrix.ts",
            lang: "ts",
            code: [
              "// Synchronous (In-Request):",
              "// 1. Password verification (bcrypt ~100ms)",
              "// 2. Fetching user profile from PostgreSQL (2ms - 15ms)",
              "// 3. Creating a single database record and returning its ID (<10ms)",
              "",
              "// Asynchronous (Background Queue via Redis + BullMQ):",
              "// 1. Sending verification or password reset emails (SendGrid / Postmark)",
              "// 2. Generating PDFs, CSV exports, or ZIP archives",
              "// 3. Webhook delivery to external customer URLs with retry backoff",
              "// 4. Processing uploaded videos, image thumbnail generation",
              "// 5. Data synchronization with third-party CRM or payment gateways",
            ].join("\n"),
            caption: "Clear architectural criteria for synchronous vs asynchronous boundaries.",
          },
        ],
      },
      {
        heading: "2. Why Redis? Atomicity and Distributed Locking",
        body: [
          "Why not just store jobs in a PostgreSQL table with a `status = 'pending'` column? While possible, polling PostgreSQL (`SELECT * FROM jobs WHERE status = 'pending' FOR UPDATE SKIP LOCKED`) creates constant read amplification and database lock contention under high throughput.",
          "Redis operates in-memory with sub-millisecond latency. BullMQ utilizes Redis Lua scripts to execute multi-step operations (pop job, move to active set, record heartbeat timestamp, update delayed timers) in a single atomic step without distributed race conditions.",
        ],
        code: [
          {
            file: "redis-queue-primitives.ts",
            lang: "ts",
            code: [
              "// BullMQ uses Redis data structures behind the scenes:",
              "// 1. Hashes: Store job data payload, options, and progress (bull:my-queue:123)",
              "// 2. Streams / Lists: Job wait queues and prioritized queues",
              "// 3. Sorted Sets (ZSET): Delayed and scheduled recurring jobs sorted by execute-at UNIX timestamp",
              "// 4. Lua scripts: Atomic transition from 'waiting' -> 'active' without double-claiming",
            ].join("\n"),
            caption: "Redis internal data structures leveraged by BullMQ.",
          },
        ],
      },
    ],
    mistake: {
      title: "Executing Asynchronous Tasks with Fire-and-Forget Promises in Express/NestJS",
      wrong: [
        "@Post('reports')",
        "async generateReport(@Body() dto: ReportDto) {",
        "  // ❌ DANGEROUS: Unhandled promise floating in memory",
        "  this.reportService.generatePdfAndEmail(dto); // No await, no queue",
        "  return { status: 'generating' };",
        "}",
      ].join("\n"),
      right: [
        "@Post('reports')",
        "async generateReport(@Body() dto: ReportDto) {",
        "  // ✅ DURABLE: Job is written to Redis before responding to HTTP client",
        "  const job = await this.reportQueue.add('generate-pdf', dto, {",
        "    attempts: 3,",
        "    backoff: { type: 'exponential', delay: 2000 },",
        "  });",
        "  return { jobId: job.id, status: 'queued' };",
        "}",
      ].join("\n"),
      explain:
        "If the container is deployed, crashes, or scales down 500ms after the HTTP response is sent, floating background promises are instantly terminated by the OS with zero retry mechanism and no record of the failure.",
    },
    tryIt: [
      "Inspect your local Redis connection using `redis-cli ping` (should return `PONG`).",
      "List any existing keys with `redis-cli keys 'bull:*'`.",
      "Check memory usage of Redis with `redis-cli info memory`.",
    ],
    challenge: {
      prompt: "Design the HTTP response contract for an endpoint that accepts a batch import of 10,000 records. What status code and payload structure should be returned?",
      hints: [
        "Use HTTP 202 Accepted instead of 200 OK.",
        "Return a jobId and a polling/webhook URL where the client can query progress.",
      ],
      solution: [
        "// Controller returning HTTP 202 Accepted with polling location",
        "@Post('imports')",
        "@HttpCode(HttpStatus.ACCEPTED)",
        "async createImport(@Body() dto: ImportDto, @Res() res: FastifyReply) {",
        "  const job = await this.importQueue.add('process-csv', dto);",
        "  return res",
        "    .header('Location', `/api/v1/imports/${job.id}/status`)",
        "    .send({",
        "      jobId: job.id,",
        "      status: 'queued',",
        "      checkStatusUrl: `/api/v1/imports/${job.id}/status`,",
        "    });",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why is 'fire-and-forget' (unawaited promises) dangerous in containerized cloud environments?",
        options: [
          "JavaScript does not support asynchronous execution without await.",
          "When containers restart, scale down, or redeploy, unawaited in-memory promises are killed abruptly without retries or persistence.",
          "Node.js will crash immediately upon encountering an unawaited function.",
          "PostgreSQL rejects connections that do not await promises.",
        ],
        answer: 1,
        explanation:
          "In-memory promises exist only in Node.js heap memory. If the process dies or is terminated by orchestrators (Kubernetes/Cloud Run), the task is permanently lost.",
      },
      {
        question: "What is the primary benefit of Redis Lua scripts in BullMQ?",
        options: [
          "They compile JavaScript into C++ binary code.",
          "They allow multi-step state transitions (e.g. popping a job and updating its active timestamp) to execute atomically with zero race conditions.",
          "They compress image files inside Redis memory.",
          "They replace PostgreSQL for relational querying.",
        ],
        answer: 1,
        explanation:
          "Redis Lua scripts execute atomically, guaranteeing that multiple workers running on different servers never claim the same job simultaneously.",
      },
    ],
    flashcards: [
      {
        front: "What is the standard HTTP status code for an accepted asynchronous job?",
        back: "HTTP 202 Accepted.",
      },
      {
        front: "Why is Redis preferred over polling relational database tables for queues?",
        back: "Redis operates in-memory with atomic data structures (Lists, ZSETs, Lua scripts) that avoid the lock contention and I/O amplification of relational SQL table polling.",
      },
    ],
    recap: [
      "Synchronous HTTP requests should only perform fast (<100ms) reliable operations.",
      "Heavy CPU tasks, external API integrations, and retriable workloads must be offloaded to queues.",
      "Redis provides fast, atomic in-memory queue primitives that survive application restarts when paired with BullMQ.",
    ],
    references: [
      { label: "BullMQ Official Documentation", url: "https://docs.bullmq.io" },
      { label: "Redis Queue Patterns & Best Practices", url: "https://redis.io/topics/data-types-intro" },
    ],
    nextBridge: "Now that you understand the queue mental model, let's wire BullMQ producers and workers directly into NestJS.",
  },

  "p25-l2": {
    id: "p25-l2",
    phaseId: "p25",
    title: "BullMQ Producers & Workers in NestJS",
    level: "Advanced",
    minutes: 40,
    summary:
      "Learn how to integrate `@nestjs/bullmq` and `bullmq` cleanly. Separate producer controllers from consumer worker processors, inject typed queues, configure connection options, and manage worker process concurrency.",
    prerequisites: ["p25-l1 Queue Mental Model", "p15-l1 NestJS Modules"],
    objectives: [
      "Configure `BullModule.forRoot()` and `BullModule.registerQueue()` in NestJS.",
      "Implement typed `@Processor()` and `@Process()` worker handlers with error capture.",
      "Separate worker processes (`apps/worker`) from user-facing API servers (`apps/api`).",
    ],
    simple:
      "A Producer is the NestJS service or controller that pushes a new job to the queue (`queue.add('name', data)`). A Worker is a dedicated NestJS class decorated with `@Processor()` that listens for incoming jobs and processes them one by one.",
    why:
      "Co-locating heavy worker execution inside the API server process will freeze HTTP request parsing when CPU load spikes. Structuring workers with clean NestJS dependency injection allows running API and Worker as separate scalable instances.",
    mentalModel: {
      title: "The Dispatcher and the Delivery Fleet",
      body:
        "The Producer is the dispatcher taking telephone calls in the office. The Queue in Redis is the delivery clipboard. The Worker is the delivery van out on the road. You can spin up 10 delivery vans (workers) during peak hours without altering the dispatcher office.",
    },
    sections: [
      {
        heading: "1. Registering BullModule in NestJS",
        body: [
          "In NestJS, configure `BullModule.forRootAsync` with connection parameters from your `ConfigService`. Then register named queues using `BullModule.registerQueue({ name: 'reports' })`.",
        ],
        code: [
          {
            file: "src/jobs/jobs.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { BullModule } from '@nestjs/bullmq';",
              "import { ConfigService } from '@nestjs/config';",
              "import { ReportProducerService } from './report-producer.service';",
              "import { ReportWorkerProcessor } from './report-worker.processor';",
              "",
              "@Module({",
              "  imports: [",
              "    BullModule.forRootAsync({",
              "      inject: [ConfigService],",
              "      useFactory: (config: ConfigService) => ({",
              "        connection: {",
              "          host: config.get<string>('REDIS_HOST', 'localhost'),",
              "          port: config.get<number>('REDIS_PORT', 6379),",
              "          password: config.get<string>('REDIS_PASSWORD'),",
              "        },",
              "      }),",
              "    }),",
              "    BullModule.registerQueue({",
              "      name: 'reports',",
              "    }),",
              "  ],",
              "  providers: [ReportProducerService, ReportWorkerProcessor],",
              "  exports: [ReportProducerService],",
              "})",
              "export class JobsModule {}",
            ].join("\n"),
            caption: "Configuring BullMQ queues and processors in a NestJS module.",
          },
        ],
      },
      {
        heading: "2. The Producer: Adding Typed Jobs",
        body: [
          "Producers inject the queue using `@InjectQueue('reports') private readonly queue: Queue`. Use typed payload interfaces to enforce schema safety across producers and consumers.",
        ],
        code: [
          {
            file: "src/jobs/report-producer.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { InjectQueue } from '@nestjs/bullmq';",
              "import { Queue } from 'bullmq';",
              "",
              "export interface GenerateReportJobData {",
              "  reportId: string;",
              "  workspaceId: string;",
              "  format: 'PDF' | 'CSV';",
              "  filters: Record<string, unknown>;",
              "}",
              "",
              "@Injectable()",
              "export class ReportProducerService {",
              "  constructor(@InjectQueue('reports') private readonly reportsQueue: Queue<GenerateReportJobData>) {}",
              "",
              "  async queueReportGeneration(data: GenerateReportJobData): Promise<string> {",
              "    const job = await this.reportsQueue.add('generate', data, {",
              "      jobId: `report-${data.reportId}`, // Deterministic deduplication key",
              "      attempts: 3,",
              "      backoff: {",
              "        type: 'exponential',",
              "        delay: 3000,",
              "      },",
              "      removeOnComplete: { count: 100 }, // Keep last 100 completed",
              "      removeOnFail: { count: 500 },     // Keep last 500 failed for audits",
              "    });",
              "    return job.id!;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Typed producer with exponential backoff and retention policies.",
          },
        ],
      },
      {
        heading: "3. The Worker Processor: Executing the Job",
        body: [
          "Worker processors extend `WorkerHost` and implement the `process(job: Job)` method. The worker interacts with database repositories, storage buckets, and notification services.",
        ],
        code: [
          {
            file: "src/jobs/report-worker.processor.ts",
            lang: "ts",
            code: [
              "import { Processor, WorkerHost } from '@nestjs/bullmq';",
              "import { Job } from 'bullmq';",
              "import { Logger } from '@nestjs/common';",
              "import { GenerateReportJobData } from './report-producer.service';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "",
              "@Processor('reports', { concurrency: 5 })",
              "export class ReportWorkerProcessor extends WorkerHost {",
              "  private readonly logger = new Logger(ReportWorkerProcessor.name);",
              "",
              "  constructor(private readonly prisma: PrismaService) {",
              "    super();",
              "  }",
              "",
              "  async process(job: Job<GenerateReportJobData, void, string>): Promise<void> {",
              "    this.logger.log(`Processing job ${job.id} (Attempt ${job.attemptsMade + 1}/${job.opts.attempts})`);",
              "    ",
              "    const { reportId, format } = job.data;",
              "    ",
              "    // Update database status to PROCESSING",
              "    await this.prisma.report.update({",
              "      where: { id: reportId },",
              "      data: { status: 'PROCESSING' },",
              "    });",
              "",
              "    // Heavy generation logic...",
              "    await job.updateProgress(50);",
              "    ",
              "    // Update database status to COMPLETED",
              "    await this.prisma.report.update({",
              "      where: { id: reportId },",
              "      data: { status: 'COMPLETED', completedAt: new Date() },",
              "    });",
              "    ",
              "    this.logger.log(`Job ${job.id} finished successfully.`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "BullMQ worker processor updating progress and database status.",
          },
        ],
      },
    ],
    mistake: {
      title: "Hardcoding Worker Concurrency to 100 on a 1-Core CPU",
      wrong: "@Processor('reports', { concurrency: 100 }) // Overloads CPU and exhausts DB connection pool",
      right: "@Processor('reports', { concurrency: 5 }) // Sized according to available CPU cores and Prisma pool limits",
      explain:
        "High concurrency does not speed up CPU-bound tasks. It causes thrashing, context-switching overhead, and quickly exhausts your PostgreSQL connection pool (causing Prisma P2024 connection timeout errors).",
    },
    tryIt: [
      "Add `@nestjs/bullmq` and `bullmq` to your NestJS project dependencies.",
      "Register a test queue named `email-queue` in your `AppModule`.",
      "Trigger a test job from a controller and verify the `@Processor()` logs the receipt.",
    ],
    challenge: {
      prompt: "Implement a worker lifecycle hook in your processor that logs when a job fails permanently after exhausting all retry attempts.",
      hints: [
        "Use the `@OnWorkerEvent('failed')` decorator or override `onFailed(job, error)` in `WorkerHost`.",
      ],
      solution: [
        "import { OnWorkerEvent } from '@nestjs/bullmq';",
        "",
        "@OnWorkerEvent('failed')",
        "onJobFailed(job: Job, error: Error) {",
        "  this.logger.error(`Job ${job.id} failed after attempt ${job.attemptsMade}: ${error.message}`, error.stack);",
        "  // Alert Sentry or OpsGenie if job.attemptsMade === job.opts.attempts",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What class must a NestJS BullMQ processor extend?",
        options: [
          "EventEmitter",
          "WorkerHost",
          "Controller",
          "PrismaClient",
        ],
        answer: 1,
        explanation:
          "In `@nestjs/bullmq`, worker processors extend `WorkerHost` and implement the `process(job: Job)` lifecycle method.",
      },
      {
        question: "What does the `removeOnComplete` option accomplish when adding a job to BullMQ?",
        options: [
          "It deletes the job from Redis once finished, preventing Redis memory exhaustion over time.",
          "It deletes the database record in PostgreSQL.",
          "It cancels running jobs after 10 seconds.",
          "It shuts down the worker process.",
        ],
        answer: 0,
        explanation:
          "Without `removeOnComplete` or a count limit (e.g. `{ count: 100 }`), completed jobs remain stored in Redis indefinitely, eventually consuming all available RAM.",
      },
    ],
    flashcards: [
      {
        front: "What is the role of `WorkerHost` in NestJS BullMQ?",
        back: "It is the base class for worker processors that receives jobs from Redis and runs the `process(job)` method.",
      },
      {
        front: "Why should `removeOnComplete` and `removeOnFail` always be configured?",
        back: "To prevent Redis from running out of memory (OOM) by retaining millions of old job payloads in Redis hashes.",
      },
    ],
    recap: [
      "NestJS uses `@nestjs/bullmq` with `BullModule.forRoot()` and `BullModule.registerQueue()`.",
      "Producers add jobs with typed payloads, backoff configurations, and retention policies.",
      "Workers extend `WorkerHost` and process jobs with controlled concurrency.",
    ],
    references: [
      { label: "NestJS BullMQ Integration Guide", url: "https://docs.nestjs.com/techniques/queues" },
      { label: "BullMQ Job Options Specification", url: "https://docs.bullmq.io/guide/jobs/job-options" },
    ],
    nextBridge: "Now that jobs are running, let's explore robust retry strategies, exponential backoff, and delayed recurring jobs.",
  },

  "p25-l3": {
    id: "p25-l3",
    phaseId: "p25",
    title: "Retries, Backoff, Delays & Recurrence",
    level: "Advanced",
    minutes: 40,
    summary:
      "Master failure tolerance in distributed background tasks. Configure fixed and exponential backoff, jitter to prevent thundering herds, delayed execution timers, and cron-scheduled recurring jobs.",
    prerequisites: ["p25-l2 BullMQ in NestJS"],
    objectives: [
      "Configure exponential backoff strategies to handle transient network and rate-limit errors.",
      "Schedule delayed jobs (e.g. 'send onboarding email in 24 hours').",
      "Set up recurring cron jobs (e.g. 'nightly invoice aggregation at 02:00 UTC') with BullMQ repeatable jobs.",
    ],
    simple:
      "Transient failures (e.g., SendGrid returning HTTP 503, or database connection blips) shouldn't cause permanent failure. BullMQ can automatically wait 2s, then 4s, then 8s before retrying. You can also schedule jobs to run 3 days in the future or on a repeating cron schedule.",
    why:
      "Immediate retries (`delay: 0`) hammer downstream services when they are already struggling with outages or rate limits. Exponential backoff gives third-party systems time to recover.",
    mentalModel: {
      title: "The Politeness Protocol",
      body:
        "If you knock on a door and nobody answers, knocking 50 times in 1 second will not help. If you wait 2 minutes, then 5 minutes, then 15 minutes, you give the occupant time to return home. Exponential backoff is the politeness protocol for distributed systems.",
    },
    sections: [
      {
        heading: "1. Exponential Backoff and Jitter",
        body: [
          "BullMQ supports built-in backoff algorithms: `fixed` (waits the exact same delay every time) and `exponential` (delay doubles on each successive failure: $delay \\times 2^{attempt-1}$).",
        ],
        code: [
          {
            file: "src/jobs/backoff-config.ts",
            lang: "ts",
            code: [
              "await queue.add('sync-stripe-customer', { customerId: 'cus_123' }, {",
              "  attempts: 5,",
              "  backoff: {",
              "    type: 'exponential',",
              "    delay: 2000, // 2s -> 4s -> 8s -> 16s -> 32s",
              "  },",
              "});",
            ].join("\n"),
            caption: "Configuring 5 exponential retry attempts.",
          },
        ],
      },
      {
        heading: "2. Delayed Jobs (Future Timers)",
        body: [
          "To trigger an action in the future (e.g., 'send check-in email 3 days after signup'), pass the `delay` option in milliseconds. BullMQ stores the job in a Redis Sorted Set (ZSET) indexed by execute-at UNIX timestamp.",
        ],
        code: [
          {
            file: "src/jobs/delayed-onboarding.ts",
            lang: "ts",
            code: [
              "const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;",
              "",
              "await onboardingQueue.add(",
              "  'send-check-in-email',",
              "  { userId: user.id },",
              "  {",
              "    delay: THREE_DAYS_MS,",
              "    jobId: `onboarding-checkin-${user.id}`, // Unique ID allows easy cancellation if user deletes account",
              "  },",
              ");",
            ].join("\n"),
            caption: "Scheduling a delayed job 72 hours into the future.",
          },
        ],
      },
      {
        heading: "3. Repeatable (Cron) Jobs",
        body: [
          "Repeatable jobs run on a recurring schedule without requiring an external operating system cron daemon. BullMQ automatically schedules the next occurrence in Redis whenever a run completes.",
        ],
        code: [
          {
            file: "src/jobs/nightly-cleanup.ts",
            lang: "ts",
            code: [
              "// Scheduled nightly at 03:00 UTC",
              "await maintenanceQueue.add(",
              "  'purge-expired-sessions',",
              "  {},",
              "  {",
              "    repeat: {",
              "      pattern: '0 3 * * *', // Cron format: Minute Hour Day Month DayOfWeek",
              "      tz: 'UTC',",
              "    },",
              "    jobId: 'daily-session-purge',",
              "  },",
              ");",
            ].join("\n"),
            caption: "BullMQ repeatable job running daily on a UTC cron expression.",
          },
        ],
      },
    ],
    mistake: {
      title: "Creating Duplicate Repeatable Jobs on Every Application Boot",
      wrong: [
        "async onModuleInit() {",
        "  // ❌ Adding repeatable job on every container start creates duplicate schedules if jobId is missing!",
        "  await this.queue.add('cleanup', {}, { repeat: { pattern: '0 0 * * *' } });",
        "}",
      ].join("\n"),
      right: [
        "async onModuleInit() {",
        "  // ✅ Use explicit jobId or clean up existing repeatable jobs before adding",
        "  await this.queue.add('cleanup', {}, {",
        "    jobId: 'nightly-cleanup-job',",
        "    repeat: { pattern: '0 0 * * *', key: 'nightly-cleanup' },",
        "  });",
        "}",
      ].join("\n"),
      explain:
        "Without an explicit deduplication key, every time your auto-scaling containers restart or deploy, a new repeatable job entry is registered in Redis, resulting in tasks running 10x or 50x per day.",
    },
    tryIt: [
      "Add a job with a 5000ms delay and watch the worker pick it up exactly 5 seconds later.",
      "Simulate a transient failure in your worker by throwing an Error on `job.attemptsMade === 0` to observe the exponential backoff delay.",
    ],
    challenge: {
      prompt: "How can you safely cancel a scheduled delayed onboarding email if the user deletes their account before the 3-day timer expires?",
      hints: [
        "Use `queue.getJob(deterministicJobId)`.",
        "Call `job.remove()` if the job exists and is still in the 'delayed' state.",
      ],
      solution: [
        "async cancelOnboarding(userId: string) {",
        "  const jobId = `onboarding-checkin-${userId}`;",
        "  const job = await this.onboardingQueue.getJob(jobId);",
        "  if (job) {",
        "    const state = await job.getState();",
        "    if (state === 'delayed') {",
        "      await job.remove();",
        "    }",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "With exponential backoff `delay: 1000`, what will be the wait time before the 4th attempt?",
        options: [
          "1,000ms (1s)",
          "4,000ms (4s)",
          "8,000ms (8s)",
          "16,000ms (16s)",
        ],
        answer: 2,
        explanation:
          "Exponential backoff calculates $delay \\times 2^{attemptsMade}$. For the 4th attempt (after 3 failed attempts), it is $1000 \\times 2^3 = 8,000$ms.",
      },
      {
        question: "Where does BullMQ store delayed jobs in Redis?",
        options: [
          "In an external JSON file on the disk.",
          "In a Redis Sorted Set (ZSET) where the score is the target execution timestamp in milliseconds.",
          "In the PostgreSQL `pg_cron` extension.",
          "In a temporary cookie.",
        ],
        answer: 1,
        explanation:
          "BullMQ uses Redis ZSETs (Sorted Sets) with UNIX timestamps as scores to efficiently query jobs whose target execution time has arrived.",
      },
    ],
    flashcards: [
      {
        front: "What is exponential backoff in job queues?",
        back: "A retry strategy where the waiting duration doubles after each failure to prevent overwhelming downstream services.",
      },
      {
        front: "How are repeatable cron jobs deduplicated in BullMQ?",
        back: "By specifying explicit job IDs and unique repeat keys so multiple server boots do not schedule duplicate cron entries.",
      },
    ],
    recap: [
      "Exponential backoff protects external APIs and databases from retry storms during outages.",
      "Delayed jobs allow triggering timed events (hours or days in the future) without persistent Node.js `setTimeout` memory leaks.",
      "Repeatable cron jobs execute recurring maintenance tasks natively inside Redis.",
    ],
    references: [
      { label: "BullMQ Retries and Backoff Guide", url: "https://docs.bullmq.io/guide/retries" },
      { label: "Cron Expression Syntax Reference", url: "https://crontab.guru" },
    ],
    nextBridge: "Retries mean jobs can run more than once. In the next lesson, we master Idempotency to prevent duplicate charges and double emails.",
  },
};
