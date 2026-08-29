import type { LessonContent } from "./types";

export const LESSON_CONTENT_P25B: Record<string, LessonContent> = {
  "p25-l4": {
    id: "p25-l4",
    phaseId: "p25",
    title: "Idempotency & At-Least-Once Reality",
    level: "Mastery",
    minutes: 40,
    summary:
      "All distributed message queues guarantee 'at-least-once' delivery, never 'exactly-once'. Learn how network timeouts, worker crashes, and redeliveries result in duplicate job execution — and implement idempotent processing with database transactions and idempotency keys.",
    prerequisites: ["p25-l3 Retries & Backoff", "p21-l3 Transactional Updates"],
    objectives: [
      "Understand why network partitions make exactly-once distributed delivery theoretically impossible.",
      "Implement idempotent worker execution using PostgreSQL unique constraints and idempotency tables.",
      "Design safe external side-effects (e.g. charging credit cards, sending emails) with deterministic idempotency keys.",
    ],
    simple:
      "If your worker successfully charges a credit card, but the network connection to Redis drops right before it reports 'job completed', Redis assumes the worker died and hands the job to another worker. If your job isn't idempotent, the customer gets charged twice. Idempotency ensures that running the job 10 times produces the exact same outcome as running it once.",
    why:
      "Assuming a job will only ever run once is one of the most common and expensive architectural flaws in full-stack engineering. Idempotency is non-negotiable for billing, emailing, and inventory updates.",
    mentalModel: {
      title: "The Elevator Call Button",
      body:
        "Pressing the elevator call button once turns on the light and summons the elevator. Pressing the button 10 more times does not summon 10 elevators or make it arrive 10 times faster. The operation is idempotent.",
    },
    sections: [
      {
        heading: "1. The At-Least-Once Delivery Reality",
        body: [
          "Distributed queues cannot guarantee exactly-once execution. If worker A processes a job for 29 seconds, but its heartbeat lock expires after 30 seconds due to heavy garbage collection, worker B will pick up the same job while worker A is still finishing.",
          "Every background job processor must assume it will be called multiple times with the exact same payload.",
        ],
        code: [
          {
            file: "idempotent-worker-pattern.ts",
            lang: "ts",
            code: [
              "// The 3-Step Idempotent Worker Recipe:",
              "// 1. Check: Has this unique operation already been recorded as processed?",
              "// 2. Lock / Insert: Atomically insert an 'in-progress' record with a UNIQUE constraint.",
              "// 3. Execute & Finalize: Perform external action with deterministic key, then mark COMPLETE.",
            ].join("\n"),
            caption: "The standard 3-step idempotent execution model.",
          },
        ],
      },
      {
        heading: "2. Implementing Idempotency in PostgreSQL and Prisma",
        body: [
          "Use a dedicated `ProcessedJob` table or an `idempotencyKey` column with a `@unique` constraint in Prisma. Wrap the execution in an interactive transaction.",
        ],
        code: [
          {
            file: "src/jobs/payment-worker.processor.ts",
            lang: "ts",
            code: [
              "import { Processor, WorkerHost } from '@nestjs/bullmq';",
              "import { Job } from 'bullmq';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { StripeService } from '../billing/stripe.service';",
              "",
              "interface ChargeJobData {",
              "  invoiceId: string;",
              "  amountCents: number;",
              "  customerId: string;",
              "  idempotencyKey: string;",
              "}",
              "",
              "@Processor('billing')",
              "export class BillingWorkerProcessor extends WorkerHost {",
              "  constructor(",
              "    private readonly prisma: PrismaService,",
              "    private readonly stripe: StripeService,",
              "  ) {",
              "    super();",
              "  }",
              "",
              "  async process(job: Job<ChargeJobData>): Promise<void> {",
              "    const { invoiceId, amountCents, customerId, idempotencyKey } = job.data;",
              "",
              "    // Step 1: Check existing invoice status",
              "    const invoice = await this.prisma.invoice.findUnique({",
              "      where: { id: invoiceId },",
              "    });",
              "",
              "    if (!invoice || invoice.status === 'PAID') {",
              "      // Already processed in a prior attempt — exit cleanly with zero side-effects!",
              "      return;",
              "    }",
              "",
              "    // Step 2: Pass the EXACT SAME idempotencyKey to Stripe API",
              "    // Stripe will return the existing charge if already executed on their end",
              "    const charge = await this.stripe.charges.create({",
              "      amount: amountCents,",
              "      currency: 'usd',",
              "      customer: customerId,",
              "    }, {",
              "      idempotencyKey: `inv-charge-${idempotencyKey}`,",
              "    });",
              "",
              "    // Step 3: Record payment in local database inside a transaction",
              "    await this.prisma.$transaction([",
              "      this.prisma.payment.create({",
              "        data: {",
              "          invoiceId,",
              "          stripeChargeId: charge.id,",
              "          amountCents,",
              "        },",
              "      }),",
              "      this.prisma.invoice.update({",
              "        where: { id: invoiceId },",
              "        data: { status: 'PAID', paidAt: new Date() },",
              "      }),",
              "    ]);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Idempotent payment processing with Stripe and Prisma transactions.",
          },
        ],
      },
    ],
    mistake: {
      title: "Generating Random UUIDs for Idempotency Keys Inside the Worker",
      wrong: [
        "async process(job: Job) {",
        "  // ❌ WRONG: Generating a new UUID on every attempt defeats the entire purpose of idempotency!",
        "  const idempotencyKey = crypto.randomUUID();",
        "  await stripe.charges.create({ ... }, { idempotencyKey });",
        "}",
      ].join("\n"),
      right: [
        "async process(job: Job) {",
        "  // ✅ RIGHT: Use deterministic key derived from the job data or entity ID",
        "  const idempotencyKey = `charge-invoice-${job.data.invoiceId}`;",
        "  await stripe.charges.create({ ... }, { idempotencyKey });",
        "}",
      ].join("\n"),
      explain:
        "If a new random UUID is generated inside the worker process, every retry generates a brand new key, leading Stripe to treat each retry as a separate distinct purchase and double-billing the user.",
    },
    tryIt: [
      "Simulate a duplicate job execution by manually dispatching 2 jobs with identical `idempotencyKey` values.",
      "Verify that your database table only creates 1 payment row and exits the second execution gracefully.",
    ],
    challenge: {
      prompt: "How can you implement an atomic check-and-set idempotency lock in Redis for jobs that touch external systems without database transactions?",
      hints: [
        "Use `redis.set('lock:job:ID', 'locked', 'PX', ttlMs, 'NX')`.",
        "The `NX` flag guarantees that the key is ONLY set if it does not already exist.",
      ],
      solution: [
        "async function acquireIdempotencyLock(redis: Redis, key: string, ttlMs = 60000): Promise<boolean> {",
        "  const result = await redis.set(`idemp:${key}`, 'locked', 'PX', ttlMs, 'NX');",
        "  return result === 'OK'; // Returns true if lock was acquired, false if already running or completed",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why can distributed queues NOT guarantee 'exactly-once' execution?",
        options: [
          "Redis does not support memory persistence.",
          "Network timeouts and worker crashes make it impossible for the queue coordinator to know whether a job failed before, during, or immediately after execution.",
          "PostgreSQL only allows 1 worker per table.",
          "JavaScript is single-threaded.",
        ],
        answer: 1,
        explanation:
          "The Two Generals' Problem in distributed computing proves that over an unreliable network, you cannot achieve consensus on state without either potential duplicates (at-least-once) or potential data loss (at-most-once).",
      },
      {
        question: "Where should an idempotency key be generated?",
        options: [
          "At the origin / producer when the intent is created (e.g. invoice ID or checkout session ID).",
          "Inside the worker using `Math.random()`.",
          "In the PostgreSQL post-commit hook.",
          "Inside the Docker container entrypoint.",
        ],
        answer: 0,
        explanation:
          "Idempotency keys must be deterministic and established at the producer origin before dispatching to the queue.",
      },
    ],
    flashcards: [
      {
        front: "What is 'at-least-once' delivery in queues?",
        back: "A guarantee that every job will be delivered and executed at least one time, with the possibility of redelivery if network timeouts or crashes occur.",
      },
      {
        front: "How do you make an external API charge idempotent?",
        back: "Pass a deterministic idempotency key derived from the domain entity (e.g. `invoice_123`) in the API request header so the vendor deduplicates replays.",
      },
    ],
    recap: [
      "Always design background processors for at-least-once delivery.",
      "Use deterministic idempotency keys derived from domain entity IDs, never random UUIDs generated inside the worker.",
      "Combine database unique constraints with external API idempotency headers for end-to-end safety.",
    ],
    references: [
      { label: "Stripe Idempotent Requests Documentation", url: "https://stripe.com/docs/api/idempotent_requests" },
      { label: "You Cannot Have Exactly-Once Delivery (Distributed Systems)", url: "https://bravenewgeek.com/you-cannot-have-exactly-once-delivery/" },
    ],
    nextBridge: "Now let's explore progress tracking, job failure lifecycles, and Dead-Letter Queues (DLQ) for forensic debugging.",
  },

  "p25-l5": {
    id: "p25-l5",
    phaseId: "p25",
    title: "Progress, Failures, Dead-Letter & Cancellation Limits",
    level: "Mastery",
    minutes: 35,
    summary:
      "Learn how to stream job percentage progress back to the user, handle fatal non-retriable errors (UnrecoverableError), route permanently failed jobs to Dead-Letter Queues for human review, and understand the limits of job cancellation.",
    prerequisites: ["p25-l4 Idempotency & Queues"],
    objectives: [
      "Emit step-by-step progress events (`job.updateProgress()`) for long-running imports.",
      "Distinguish between retriable transient errors and fatal `UnrecoverableError` exceptions.",
      "Set up Dead-Letter Queue (DLQ) inspection dashboards and replay workflows.",
    ],
    simple:
      "When importing 10,000 spreadsheet rows, you want to show the user a 0% to 100% progress bar. If row 1 has a syntax error that will never succeed no matter how many times it retries, fail fast with `UnrecoverableError`. When a job exhausts all retries, move it to the Dead-Letter Queue so engineering can inspect why it failed without losing user data.",
    why:
      "Blindly retrying permanent bugs (like invalid JSON formatting or 400 Bad Request responses) wastes compute resources and floods logs. Dead-Letter Queues ensure that failed jobs are preserved for inspection and manual re-run.",
    mentalModel: {
      title: "The Hospital Triage and the Quarantine Ward",
      body:
        "A patient with a treatable condition gets retried with medication (exponential backoff). A patient with a dangerous unidentifiable condition is moved to the Quarantine Ward (Dead-Letter Queue) where specialist doctors (engineers) can inspect them without disrupting the general waiting room.",
    },
    sections: [
      {
        heading: "1. Progress Updates and UI Polling",
        body: [
          "BullMQ allows workers to call `await job.updateProgress(percentageOrObject)`. Clients can query `GET /api/v1/jobs/:id` or subscribe via SSE to render a live progress bar.",
        ],
        code: [
          {
            file: "src/jobs/import-progress.processor.ts",
            lang: "ts",
            code: [
              "for (let i = 0; i < totalRows; i += batchSize) {",
              "  await this.processBatch(rows.slice(i, i + batchSize));",
              "  const percent = Math.round(((i + batchSize) / totalRows) * 100);",
              "  await job.updateProgress(percent);",
              "}",
            ].join("\n"),
            caption: "Updating batch progress in a BullMQ worker.",
          },
        ],
      },
      {
        heading: "2. Fast-Failing with UnrecoverableError",
        body: [
          "If a job encounters an error that can never succeed on retry (e.g. invalid file format, deleted parent organization), throw `UnrecoverableError` from `bullmq`. BullMQ will immediately mark the job as FAILED without exhausting remaining retry attempts.",
        ],
        code: [
          {
            file: "src/jobs/unrecoverable-error.ts",
            lang: "ts",
            code: [
              "import { UnrecoverableError } from 'bullmq';",
              "",
              "async process(job: Job) {",
              "  const user = await this.prisma.user.findUnique({ where: { id: job.data.userId } });",
              "  if (!user) {",
              "    // Retrying 5 times will not recreate the deleted user!",
              "    throw new UnrecoverableError(`User ${job.data.userId} does not exist in database.`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Bypassing retries for deterministic domain errors.",
          },
        ],
      },
      {
        heading: "3. Dead-Letter Queues and Forensics",
        body: [
          "When a job fails after all retry attempts (e.g. 5/5 failed), BullMQ retains the job payload, stack trace, and timestamps in the `failed` set. You can mount `BullBoard` (a lightweight admin UI) to view, inspect, and replay dead-letter jobs with a single click.",
        ],
        code: [
          {
            file: "src/jobs/bull-board.setup.ts",
            lang: "ts",
            code: [
              "import { createBullBoard } from '@bull-board/api';",
              "import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';",
              "import { FastifyAdapter } from '@bull-board/fastify';",
              "",
              "// Mount admin dashboard for dead-letter review (protected by Admin Auth Guard)",
              "export function setupBullBoard(serverAdapter: FastifyAdapter, queues: Queue[]) {",
              "  createBullBoard({",
              "    queues: queues.map((q) => new BullMQAdapter(q)),",
              "    serverAdapter,",
              "  });",
              "}",
            ].join("\n"),
            caption: "Mounting BullBoard admin dashboard for failed job triage.",
          },
        ],
      },
    ],
    mistake: {
      title: "Allowing Fatal Validation Errors to Retry 5 Times",
      wrong: [
        "async process(job: Job) {",
        "  if (!isValidEmail(job.data.email)) {",
        "    throw new Error('Invalid email'); // ❌ Will retry 5 times with backoff over 10 minutes!",
        "  }",
        "}",
      ].join("\n"),
      right: [
        "async process(job: Job) {",
        "  if (!isValidEmail(job.data.email)) {",
        "    throw new UnrecoverableError('Invalid email'); // ✅ Fails immediately without wasting retries",
        "  }",
        "}",
      ].join("\n"),
      explain:
        "Throwing standard Errors for permanent validation failures wastes worker CPU, pollutes retry telemetry, and delays error notification to users.",
    },
    tryIt: [
      "Throw an `UnrecoverableError` in your test processor and confirm BullMQ moves the job directly to the failed state without retrying.",
      "Inspect the failed job error stack trace in Redis using `queue.getFailed()`.",
    ],
    challenge: {
      prompt: "Implement an endpoint that allows an administrator to retry all failed dead-letter jobs in a queue.",
      hints: [
        "Query failed jobs using `queue.getFailed(0, 100)`.",
        "Call `job.retry()` on each failed job instance.",
      ],
      solution: [
        "@Post('admin/queues/:name/retry-all-failed')",
        "@Roles('SUPER_ADMIN')",
        "async retryAllFailed(@Param('name') name: string) {",
        "  const queue = this.getQueueByName(name);",
        "  const failedJobs = await queue.getFailed(0, 100);",
        "  for (const job of failedJobs) {",
        "    await job.retry();",
        "  }",
        "  return { retriedCount: failedJobs.length };",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What exception type should you throw in BullMQ when a job failure is permanent and should NEVER be retried?",
        options: [
          "HttpException",
          "UnrecoverableError",
          "SyntaxError",
          "FatalCrashException",
        ],
        answer: 1,
        explanation:
          "Throwing `UnrecoverableError` (imported from `bullmq`) signals to the worker that remaining retry attempts should be aborted immediately.",
      },
      {
        question: "Can a running Node.js job be immediately halted mid-instruction when a user clicks 'Cancel' in the UI?",
        options: [
          "Yes, Node.js automatically terminates threads.",
          "No; cooperative cancellation is required. The worker loop must periodically check if the job state has changed or if an abort signal is flagged.",
          "Yes, Redis sends a SIGKILL to the worker.",
          "No, cancellation is illegal in web development.",
        ],
        answer: 1,
        explanation:
          "Node.js runs single-threaded asynchronous loops. You cannot externally kill a function mid-execution without cooperative polling of a cancellation flag.",
      },
    ],
    flashcards: [
      {
        front: "What is a Dead-Letter Queue (DLQ)?",
        back: "A holding area where jobs that have exhausted all retry attempts are preserved for manual inspection, debugging, and replay.",
      },
      {
        front: "What does `job.updateProgress(percent)` do?",
        back: "Saves the current numeric or object progress state to Redis so client applications can poll or stream real-time progress bars.",
      },
    ],
    recap: [
      "Use `job.updateProgress()` to provide visibility into long-running tasks.",
      "Throw `UnrecoverableError` for permanent deterministic domain errors.",
      "Retain failed jobs for dead-letter forensic inspection and replay via admin tooling like BullBoard.",
    ],
    references: [
      { label: "BullMQ Error Handling & UnrecoverableError", url: "https://docs.bullmq.io/guide/retries/unrecoverable" },
      { label: "Bull-Board UI Dashboard", url: "https://github.com/felixmosh/bull-board" },
    ],
    nextBridge: "In the final lesson of Phase 25, we look at Graceful Shutdown to ensure no jobs are corrupted when deploying new container versions.",
  },

  "p25-l6": {
    id: "p25-l6",
    phaseId: "p25",
    title: "Graceful Shutdown & Worker Health",
    level: "Mastery",
    minutes: 30,
    summary:
      "When deploying new versions in Kubernetes, Cloud Run, or Render, orchestrators send a SIGTERM signal giving containers a grace period (typically 30 seconds). Learn how to handle SIGTERM, pause BullMQ workers from accepting new jobs, let active jobs finish cleanly, and expose worker health endpoints.",
    prerequisites: ["p25-l2 BullMQ in NestJS", "p25-l5 Progress & Failures"],
    objectives: [
      "Intercept `SIGTERM` and `SIGINT` lifecycle signals in NestJS.",
      "Call `worker.close()` to stop accepting new jobs while waiting for active jobs to complete.",
      "Expose worker health and queue lag metrics for container orchestration readiness checks.",
    ],
    simple:
      "Imagine you are in the middle of writing a 500MB PDF file to disk, and the deployment system suddenly pulls the power plug. The PDF file is corrupted. Graceful shutdown means when the deploy starts, the worker stops picking up new jobs, finishes the 5 active jobs currently running, and only then exits cleanly.",
    why:
      "Without graceful shutdown, every production deployment or auto-scaling down-event forcibly aborts in-flight jobs, triggering false alarms, partial database updates, and corrupted file exports.",
    mentalModel: {
      title: "Closing Time at the Restaurant",
      body:
        "At 10:00 PM, the restaurant flips the front door sign from 'Open' to 'Closed' (stops taking new orders). The chefs do not throw current meals in the trash; they finish cooking the orders currently on the grill, serve them to the seated guests, and then turn off the kitchen lights.",
    },
    sections: [
      {
        heading: "1. The Termination Signal Sequence (SIGTERM -> SIGKILL)",
        body: [
          "When Kubernetes or Cloud Run terminates a container, it follows a strict sequence:",
          "1. **SIGTERM** sent to PID 1: 'Please shut down cleanly within 30 seconds.'",
          "2. Application stops accepting new HTTP/queue traffic and finishes active requests.",
          "3. Application exits with status code 0.",
          "4. If still running after the grace period (e.g. 30s), **SIGKILL** is sent, forcibly killing the process.",
        ],
        code: [
          {
            file: "src/main-worker.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { WorkerModule } from './worker.module';",
              "import { Logger } from '@nestjs/common';",
              "",
              "async function bootstrap() {",
              "  const logger = new Logger('WorkerBootstrap');",
              "  const app = await NestFactory.create(WorkerModule);",
              "",
              "  // Enable NestJS shutdown hooks for OnModuleDestroy / beforeApplicationShutdown",
              "  app.enableShutdownHooks();",
              "",
              "  await app.init();",
              "  logger.log('🚀 Worker process initialized and listening for queue events.');",
              "}",
              "bootstrap();",
            ].join("\n"),
            caption: "Enabling NestJS shutdown hooks in worker entrypoint.",
          },
        ],
      },
      {
        heading: "2. WorkerHost Cleanup with beforeApplicationShutdown",
        body: [
          "In your processor, implement `BeforeApplicationShutdown` to gracefully close the BullMQ worker instance.",
        ],
        code: [
          {
            file: "src/jobs/graceful-worker.processor.ts",
            lang: "ts",
            code: [
              "import { Processor, WorkerHost } from '@nestjs/bullmq';",
              "import { BeforeApplicationShutdown, Logger } from '@nestjs/common';",
              "",
              "@Processor('reports')",
              "export class ReportsProcessor extends WorkerHost implements BeforeApplicationShutdown {",
              "  private readonly logger = new Logger(ReportsProcessor.name);",
              "",
              "  async beforeApplicationShutdown(signal?: string) {",
              "    this.logger.warn(`Received ${signal}. Gracefully closing worker (waiting for in-flight jobs)...`);",
              "    // worker.close() stops fetching new jobs and waits for active jobs to finish",
              "    await this.worker.close();",
              "    this.logger.log('Worker closed successfully. Safe to terminate container.');",
              "  }",
              "",
              "  async process(job: Job) {",
              "    // Processing...",
              "  }",
              "}",
            ].join("\n"),
            caption: "Graceful shutdown with `worker.close()` in NestJS.",
          },
        ],
      },
      {
        heading: "3. Health Checks & Queue Lag Monitoring",
        body: [
          "Container orchestrators need to know if your worker is healthy or if the queue is backing up (queue lag). Expose health metrics using NestJS Terminus or a lightweight Fastify health endpoint.",
        ],
        code: [
          {
            file: "src/health/worker-health.controller.ts",
            lang: "ts",
            code: [
              "@Controller('health')",
              "export class WorkerHealthController {",
              "  constructor(@InjectQueue('reports') private readonly queue: Queue) {}",
              "",
              "  @Get('ready')",
              "  async checkReadiness() {",
              "    const isPaused = await this.queue.isPaused();",
              "    const counts = await this.queue.getJobCounts('waiting', 'active', 'failed');",
              "    ",
              "    return {",
              "      status: isPaused ? 'paused' : 'ok',",
              "      queue: 'reports',",
              "      waiting: counts.waiting,",
              "      active: counts.active,",
              "      failed: counts.failed,",
              "    };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Queue readiness and health diagnostic endpoint.",
          },
        ],
      },
    ],
    mistake: {
      title: "Ignoring `enableShutdownHooks()` in NestJS Worker Entrypoint",
      wrong: [
        "async function bootstrap() {",
        "  const app = await NestFactory.create(WorkerModule);",
        "  // ❌ Missing app.enableShutdownHooks() — SIGTERM will kill the app instantly without calling onModuleDestroy!",
        "  await app.init();",
        "}",
      ].join("\n"),
      right: [
        "async function bootstrap() {",
        "  const app = await NestFactory.create(WorkerModule);",
        "  app.enableShutdownHooks(); // ✅ Listens for SIGTERM / SIGINT and runs cleanup routines",
        "  await app.init();",
        "}",
      ].join("\n"),
      explain:
        "By default, NestJS does not intercept OS process signals unless `app.enableShutdownHooks()` is explicitly called during bootstrap.",
    },
    tryIt: [
      "Run your worker process and send a SIGTERM using `kill -SIGTERM <PID>`.",
      "Observe the logger waiting for the current job to finish before exiting cleanly with code 0.",
    ],
    challenge: {
      prompt: "What should you configure in your Dockerfile or Docker Compose to ensure Node.js runs as PID 1 or properly receives SIGTERM signals?",
      hints: [
        "Do not run `npm start` as the CMD because `npm` does not forward OS signals to child Node processes.",
        "Use `node dist/main.js` or `tini` / `dumb-init` as the container init entrypoint.",
      ],
      solution: [
        "# Dockerfile Best Practice for Signal Forwarding",
        "CMD [\"node\", \"dist/main-worker.js\"]",
        "# OR using tini init system:",
        "# ENTRYPOINT [\"/sbin/tini\", \"--\"]",
        "# CMD [\"node\", \"dist/main-worker.js\"]",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What does calling `worker.close()` on a BullMQ worker do during shutdown?",
        options: [
          "It deletes the Redis database.",
          "It stops fetching new jobs from Redis and waits for all currently active jobs to finish executing before resolving.",
          "It kills all running child processes immediately.",
          "It sends a push notification to the administrator.",
        ],
        answer: 1,
        explanation:
          "`worker.close()` provides a clean graceful shutdown by pausing ingestion of new jobs while allowing active jobs to reach natural completion.",
      },
      {
        question: "Why is `CMD [\"npm\", \"start\"]` discouraged in production container Dockerfiles?",
        options: [
          "npm uses too much disk space.",
          "npm does not forward OS signals (like SIGTERM) to the underlying Node.js child process, causing containers to be forcefully SIGKILLed after timeout.",
          "npm cannot run on Linux.",
          "npm breaks TypeScript compilation.",
        ],
        answer: 1,
        explanation:
          "`npm` spawns the `node` process as a child and swallows `SIGTERM` signals instead of forwarding them, preventing graceful shutdown.",
      },
    ],
    flashcards: [
      {
        front: "What is the purpose of `app.enableShutdownHooks()` in NestJS?",
        back: "It tells NestJS to listen for OS termination signals (SIGTERM, SIGINT) and invoke lifecycle cleanup methods before the process exits.",
      },
      {
        front: "What is the standard timeout before Kubernetes escalates from SIGTERM to SIGKILL?",
        back: "30 seconds (configurable via `terminationGracePeriodSeconds`).",
      },
    ],
    recap: [
      "Always call `app.enableShutdownHooks()` in NestJS applications.",
      "Implement `BeforeApplicationShutdown` to await `worker.close()` cleanly.",
      "Use `CMD [\"node\", \"dist/main.js\"]` so Node.js receives termination signals directly without wrapper interference.",
    ],
    references: [
      { label: "NestJS Lifecycle Events & Shutdown Hooks", url: "https://docs.nestjs.com/fundamentals/lifecycle-events" },
      { label: "Kubernetes Container Lifecycle Hooks", url: "https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/" },
    ],
    nextBridge: "Phase 25 is complete! You now possess full mastery of background queues, Redis primitives, idempotency, retries, and graceful worker orchestration.",
  },
};
