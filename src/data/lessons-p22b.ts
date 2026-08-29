import type { LessonContent } from "./types";

/**
 * Phase 22 Production Data Access, Search & Pagination (L4–L6).
 */
export const LESSONS_P22B: LessonContent[] = [
  {
    id: "p22-l4",
    phaseId: "p22",
    title: "Streaming Large Datasets & CSV Export",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Export 100,000+ records to CSV without running out of server RAM. Master Node.js Readable streams, Fastify chunked HTTP responses, cursor-based database streaming batches, and memory backpressure.",
    prerequisites: [
      "p22-l1 — Cursor vs Offset Pagination at Scale",
      "p09-l1 — Node.js Architecture: V8, Libuv & Event Loop",
    ],
    objectives: [
      "Diagnose why `findMany()` on 100,000 records exhausts V8 heap memory (OOM Crash).",
      "Construct a Node.js `Readable` stream that yields CSV rows incrementally in memory-bounded batches.",
      "Pipe data streams directly to Fastify `reply.raw` with chunked transfer encoding.",
      "Handle client disconnection and abort signals cleanly to prevent zombie database queries.",
    ],
    simple:
      "If you try to export 100,000 tasks by fetching them all into a giant JavaScript array and converting it to a string, Node.js runs out of RAM and crashes with 'JavaScript heap out of memory'. With streaming, we fetch 500 rows at a time, convert them into CSV text, send them over the wire to the browser immediately, and discard them from memory. Memory usage stays at a constant 15MB regardless of whether the file has 100 rows or 10,000,000 rows.",
    why:
      "Memory crashes during file exports are a classic production incident. Streaming ensures rock-solid memory stability for large background exports.",
    mentalModel: {
      title: "The Fire Bucket Brigade vs The Giant Water Tank",
      body: "Buffering the entire export in memory is trying to lift a 10,000-gallon swimming pool with your bare hands. Streaming is a bucket brigade: you fill a small 2-gallon bucket from the reservoir (database batch), pass it to the fire hose (HTTP response stream), and reuse the empty bucket for the next scoop.",
    },
    sections: [
      {
        heading: "1. The Streaming CSV Generator Service",
        body: [
          "Building a generator that queries records in batches and yields formatted CSV lines.",
        ],
        code: [
          {
            file: "src/tasks/tasks-export.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { Readable } from 'stream';",
              "",
              "@Injectable()",
              "export class TasksExportService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  createCsvStream(workspaceId: string): Readable {",
              "    const prisma = this.prisma;",
              "    const BATCH_SIZE = 500;",
              "",
              "    async function* generateCsvRows() {",
              "      // 1. Output CSV Header Row",
              "      yield 'ID,Title,Status,Priority,Due Date,Created At\\n';",
              "",
              "      let cursor: string | undefined = undefined;",
              "      let hasMore = true;",
              "",
              "      // 2. Iterate in constant-memory cursor batches",
              "      while (hasMore) {",
              "        const tasks = await prisma.task.findMany({",
              "          where: { workspaceId, deletedAt: null },",
              "          take: BATCH_SIZE,",
              "          skip: cursor ? 1 : 0,",
              "          cursor: cursor ? { id: cursor } : undefined,",
              "          orderBy: { id: 'asc' },",
              "        });",
              "",
              "        if (tasks.length === 0) break;",
              "",
              "        for (const task of tasks) {",
              "          const safeTitle = `\"${task.title.replace(/\"/g, '\"\"')}\"`;",
              "          const dueDate = task.dueDate ? task.dueDate.toISOString() : '';",
              "          yield `${task.id},${safeTitle},${task.status},${task.priority},${dueDate},${task.createdAt.toISOString()}\\n`;",
              "        }",
              "",
              "        if (tasks.length < BATCH_SIZE) {",
              "          hasMore = false;",
              "        } else {",
              "          cursor = tasks[tasks.length - 1].id;",
              "        }",
              "      }",
              "    }",
              "",
              "    return Readable.from(generateCsvRows());",
              "  }",
              "}",
            ].join("\n"),
            caption: "Async generator yielding CSV lines from cursor batches into a Node.js Readable stream.",
          },
        ],
      },
      {
        heading: "2. Fastify Streaming Route Handler",
        body: [
          "Streaming the response directly with appropriate HTTP download headers.",
        ],
        code: [
          {
            file: "src/tasks/tasks.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';",
              "import { FastifyReply } from 'fastify';",
              "import { TasksExportService } from './tasks-export.service';",
              "import { AuthGuard } from '../auth/guards/auth.guard';",
              "import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';",
              "",
              "@Controller('workspaces/:workspaceId/tasks')",
              "@UseGuards(AuthGuard, WorkspaceGuard)",
              "export class TasksController {",
              "  constructor(private readonly exportService: TasksExportService) {}",
              "",
              "  @Get('export/csv')",
              "  async exportCsv(@Param('workspaceId') workspaceId: string, @Res() reply: FastifyReply) {",
              "    const stream = this.exportService.createCsvStream(workspaceId);",
              "",
              "    reply.raw.setHeader('Content-Type', 'text/csv; charset=utf-8');",
              "    reply.raw.setHeader('Content-Disposition', `attachment; filename=\"tasks-${workspaceId}.csv\"`);",
              "    reply.raw.setHeader('Transfer-Encoding', 'chunked');",
              "",
              "    stream.pipe(reply.raw);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Streaming chunked CSV response using Fastify raw HTTP socket pipe.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Building a massive string in memory with += in a loop and calling reply.send(largeString), triggering V8 heap exhaustion on high-traffic servers.",
      right: "Streaming row chunks incrementally using `Readable.from(asyncGenerator)` and `stream.pipe(reply.raw)`.",
      explanation:
        "Large string concatenation allocates continuous heap memory buffers that easily exceed the 1.5GB default Node.js limit.",
    },
    tryItYourself: {
      title: "Stream a 10,000-Row CSV Export",
      instructions: [
        "1. Open your browser or curl: `curl -OJ http://localhost:3000/api/v1/workspaces/ws_1/tasks/export/csv`.",
        "2. Observe how the download begins streaming immediately within 10ms without a long pre-calculation pause.",
      ],
      expected: "The CSV file downloads with steady memory footprint.",
    },
    challenge: {
      title: "Handle Aborted Downloads on Stream",
      description:
        "Listen to `req.raw.on('close', ...)` and destroy the readable stream if the user cancels or closes their browser tab mid-download to stop wasted database queries.",
      hints: [
        "Call `stream.destroy()` inside the socket close listener.",
      ],
      solution: `reply.raw.on('close', () => { if (!reply.raw.writableEnded) stream.destroy(); });`,
    },
    quiz: [
      {
        question: "Why does stream piping prevent Node.js Out-Of-Memory (OOM) crashes during large file exports?",
        options: [
          "It processes and transmits data in small continuous chunks, keeping active memory usage constant",
          "It compresses data using gzip automatically",
          "It bypasses the Node.js runtime",
          "It converts JavaScript into C++",
        ],
        answer: 0,
        explanation: "Streaming transfers data in small buffers, preventing memory accumulation.",
      },
      {
        question: "What HTTP header specifies that a file should be downloaded as an attachment with a specific filename?",
        options: ["Content-Disposition: attachment; filename=...", "Accept-Encoding: gzip", "X-Download-Mode: true", "Cache-Control: download"],
        answer: 0,
        explanation: "Content-Disposition instructs the browser to trigger a file save dialog.",
      },
    ],
    flashcards: [
      {
        front: "What is Backpressure in Node.js streams?",
        back: "A mechanism that pauses reading data from the source when the destination (e.g. slow client network) cannot write fast enough.",
      },
      {
        front: "What is `Transfer-Encoding: chunked`?",
        back: "An HTTP/1.1 header indicating data is sent in a series of chunks without knowing total content length in advance.",
      },
    ],
    recap: [
      "Use async generators to stream database records in constant-memory batches.",
      "Pipe streams directly to HTTP response sockets with chunked encoding.",
      "Clean up database cursors on client disconnect.",
    ],
    references: [
      { label: "Node.js Streams API", url: "https://nodejs.org/api/stream.html" },
    ],
    nextBridge: "Now let's examine bulk operations, transactional batching, and safe soft-delete cascades.",
  },

  {
    id: "p22-l5",
    phaseId: "p22",
    title: "Bulk Operations & Soft-Delete Cascades",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Execute high-speed batch operations in Prisma. Master `createMany`, `updateMany`, transactional batching, and implement reliable soft-delete cascades across child entities (subtasks, comments, attachments) without violating foreign key constraints.",
    prerequisites: [
      "p21-l3 — Prisma Transactions, Optimistic Concurrency & Soft Deletes",
      "p15-l2 — Prisma Client CRUD Operations & Query Options",
    ],
    objectives: [
      "Execute bulk insertions using `prisma.task.createMany({ data: items })`.",
      "Implement multi-record bulk status updates with tenant verification.",
      "Design safe soft-delete cascading logic that stamps child records (`comments`, `subtasks`) in a single transaction.",
      "Restore soft-deleted parent entities and their associated child trees atomically.",
    ],
    simple:
      "When a user selects 50 tasks and clicks 'Mark as Done' or deletes a workspace containing 1,000 tasks, you cannot run 1,000 separate SQL queries in a loop—that would lock the database and take 10 seconds. In this lesson, we use Prisma's `createMany` and `updateMany` to execute batch operations in a single fast SQL statement, and we build soft-delete cascading logic that cleanly marks parent and child records simultaneously.",
    why:
      "Running database mutations in individual loops causes N+1 query explosion. Batch operations execute in a single SQL statement.",
    mentalModel: {
      title: "The Industrial Pallet Forklift vs 500 Individual Mail Deliveries",
      body: "Running 50 individual `prisma.task.update()` calls is like a mail carrier walking up to a house 50 times with one letter in hand. Bulk operations (`updateMany`) load all 50 letters onto a single pallet forklift and deliver them in one single trip.",
    },
    sections: [
      {
        heading: "1. Bulk Status Updates with Tenant Scoping",
        body: [
          "Executing atomic bulk updates on multiple task IDs within a single workspace.",
        ],
        code: [
          {
            file: "src/tasks/tasks-bulk.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { TaskStatus } from '@prisma/client';",
              "",
              "@Injectable()",
              "export class TasksBulkService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  async bulkUpdateStatus(workspaceId: string, taskIds: string[], status: TaskStatus) {",
              "    // Update multiple records in a single SQL UPDATE statement",
              "    const result = await this.prisma.task.updateMany({",
              "      where: {",
              "        id: { in: taskIds },",
              "        workspaceId, // Ensure tenant isolation",
              "        deletedAt: null,",
              "      },",
              "      data: { status, updatedAt: new Date() },",
              "    });",
              "",
              "    return { updatedCount: result.count };",
              "  }",
              "}",
            ].join("\n"),
            caption: "High-performance bulk status update using updateMany with tenant scoping.",
          },
        ],
      },
      {
        heading: "2. Soft-Delete Cascades in Interactive Transactions",
        body: [
          "Cascading soft-deletion to child entities (subtasks, comments) atomically.",
        ],
        code: [
          {
            file: "src/tasks/tasks-cascade.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, NotFoundException } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "",
              "@Injectable()",
              "export class TasksCascadeService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  async softDeleteTaskCascade(workspaceId: string, taskId: string) {",
              "    const now = new Date();",
              "",
              "    return this.prisma.$transaction(async (tx) => {",
              "      // 1. Soft-delete parent task",
              "      const task = await tx.task.updateMany({",
              "        where: { id: taskId, workspaceId, deletedAt: null },",
              "        data: { deletedAt: now },",
              "      });",
              "",
              "      if (task.count === 0) throw new NotFoundException('Task not found');",
              "",
              "      // 2. Soft-delete all child subtasks and comments in the same transaction",
              "      await Promise.all([",
              "        tx.subtask.updateMany({ where: { taskId, deletedAt: null }, data: { deletedAt: now } }),",
              "        tx.taskComment.updateMany({ where: { taskId, deletedAt: null }, data: { deletedAt: now } }),",
              "      ]);",
              "",
              "      return { success: true, deletedAt: now };",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "Atomic soft-delete cascade stamping parent and child records in a single transaction.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Iterating through an array with `for (const id of ids) { await prisma.task.update(...) }`, issuing 50 network queries to the database.",
      right: "Using `prisma.task.updateMany({ where: { id: { in: ids } } })` to execute in a single SQL statement.",
      explanation:
        "A single `updateMany` executes 1 SQL query rather than N roundtrips.",
    },
    tryItYourself: {
      title: "Execute Bulk Update on 20 Tasks",
      instructions: [
        "1. Select 20 tasks in your UI or API client.",
        "2. Call `POST /workspaces/:ws/tasks/bulk-status` with `{ taskIds: [...], status: 'DONE' }`.",
        "3. Verify that the response returns `{ updatedCount: 20 }` in under 10ms.",
      ],
      expected: "All 20 tasks update instantly in a single database roundtrip.",
    },
    challenge: {
      title: "Implement Atomic Task Restoration",
      description:
        "Write a `restoreTaskCascade(workspaceId, taskId)` method that restores a soft-deleted task and only those child subtasks that were deleted in the same deletion batch timestamp.",
      hints: [
        "Find the task's `deletedAt` timestamp and restore child items whose `deletedAt` matches that timestamp.",
      ],
      solution: `const task = await tx.task.findFirst({ where: { id, workspaceId } });\nif (!task?.deletedAt) return;\nawait tx.subtask.updateMany({ where: { taskId: id, deletedAt: task.deletedAt }, data: { deletedAt: null } });\nawait tx.task.update({ where: { id }, data: { deletedAt: null } });`,
    },
    quiz: [
      {
        question: "Why is `prisma.task.updateMany()` faster than looping over `prisma.task.update()`?",
        options: [
          "updateMany compiles into a single SQL `UPDATE tasks SET ... WHERE id IN (...)` statement",
          "updateMany runs in the browser",
          "updateMany disables PostgreSQL logging",
          "updateMany encrypts data",
        ],
        answer: 0,
        explanation: "updateMany sends 1 SQL command rather than N separate network roundtrips.",
      },
      {
        question: "Why are soft-delete cascades executed inside an interactive transaction (`prisma.$transaction`)?",
        options: [
          "To guarantee that if updating child comments fails, the parent task is not left in a half-deleted state",
          "To generate HTML reports",
          "To format dates",
          "To bypass authentication",
        ],
        answer: 0,
        explanation: "Transactions provide atomicity: all entities update together or rollback completely.",
      },
    ],
    flashcards: [
      {
        front: "What is `prisma.model.createMany()`?",
        back: "A high-speed Prisma method that inserts hundreds of records in a single SQL `INSERT INTO ... VALUES (...), (...)` query.",
      },
      {
        front: "What is the limitation of `updateMany` in Prisma?",
        back: "It cannot execute nested relation updates or return updated relation fields in its return object.",
      },
    ],
    recap: [
      "Use `updateMany` and `createMany` for batch operations.",
      "Execute soft-delete cascades inside `prisma.$transaction`.",
      "Always include `workspaceId` in bulk queries to prevent cross-tenant data corruption.",
    ],
    references: [
      { label: "Prisma Bulk Operations", url: "https://www.prisma.io/docs/concepts/components/prisma-client/crud#bulk-operations" },
    ],
    nextBridge: "Now let's complete Phase 22 with Database Connection Health, Pool Tuning, and Supabase PgBouncer configuration.",
  },

  {
    id: "p22-l6",
    phaseId: "p22",
    title: "Database Connection Health & Pool Tuning",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Configure resilient database connection pooling for Supabase and PostgreSQL. Master PgBouncer transaction-mode connection pooling, fine-tune Prisma pool sizes, configure keepalives, and handle transient connection timeouts gracefully.",
    prerequisites: [
      "p17-l3 — Supabase Local Dev & Cloud Parity",
      "p15-l1 — Prisma Schema 7.9.15: Models, Enums & Relations",
    ],
    objectives: [
      "Understand the difference between Direct Session connections (port 5432) and PgBouncer Transaction Pooling (port 6543).",
      "Configure `DATABASE_URL` and `DIRECT_URL` in Prisma for Supabase connection pooling.",
      "Tune Prisma connection pool parameters (`connection_limit`, `pool_timeout`).",
      "Implement connection retry strategies and healthcheck probes in NestJS.",
    ],
    simple:
      "Every PostgreSQL connection consumes roughly 10MB of RAM on the database server. If 500 serverless or containerized backend instances spin up, the database crashes from running out of connections. PgBouncer is a high-speed connection multiplexer: it holds 20 open connections to PostgreSQL and shares them among 5,000 backend requests in microsecond shifts.",
    why:
      "Misconfigured connection pools cause 'too many clients already' and connection timeout crashes under production traffic surges.",
    mentalModel: {
      title: "The 20-Table Restaurant & The Waiting Host",
      body: "Direct connections are like reserving a restaurant table permanently for a customer who only eats one bite every 2 hours. PgBouncer is the smart restaurant host: 20 tables are kept 100% occupied; the moment Customer A finishes their 10ms transaction, the table is instantly cleared for Customer B.",
    },
    sections: [
      {
        heading: "1. Prisma Connection URLs for Supabase PgBouncer",
        body: [
          "Configuring pooled `DATABASE_URL` (for runtime queries) and direct `DIRECT_URL` (for migrations).",
        ],
        code: [
          {
            file: "prisma/schema.prisma",
            lang: "prisma",
            code: [
              "datasource db {",
              "  provider  = \"postgresql\"",
              "  url       = env(\"DATABASE_URL\") // Port 6543 (PgBouncer Pooled Connection)",
              "  directUrl = env(\"DIRECT_URL\")   // Port 5432 (Direct Connection for Migrations)",
              "}",
              "",
              "generator client {",
              "  provider = \"prisma-client-js\"",
              "}",
            ].join("\n"),
            caption: "Prisma schema configured with dual pooled and direct database URLs.",
          },
        ],
      },
      {
        heading: "2. Connection String Parameters & Pool Tuning",
        body: [
          "Fine-tuning connection limits and pool timeouts inside `.env`.",
        ],
        code: [
          {
            file: ".env",
            lang: "bash",
            code: [
              "# Runtime Pooled Connection (PgBouncer transaction mode + pgbouncer=true flag)",
              "DATABASE_URL=\"postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=15\"",
              "",
              "# Direct Connection for Prisma Migrations (Session mode, no PgBouncer)",
              "DIRECT_URL=\"postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres\"",
            ].join("\n"),
            caption: "Production database connection strings with pool tuning flags.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Running `prisma migrate dev` or `prisma db push` through PgBouncer on port 6543 without `directUrl`, resulting in 'prepared statement already exists' migration crashes.",
      right: "Configuring `directUrl = env('DIRECT_URL')` targeting port 5432 specifically for schema migrations.",
      explanation:
        "Prisma migrations require session-level locks and prepared statements that PgBouncer transaction mode does not support.",
    },
    tryItYourself: {
      title: "Inspect Database Connection Pool Health",
      instructions: [
        "1. Open your Supabase Dashboard and navigate to Database -> Connection Pooling.",
        "2. Observe the active pool client count and pool mode setting (Transaction).",
        "3. Verify that your backend connects on port 6543 with `?pgbouncer=true`.",
      ],
      expected: "The connection pool multiplexes incoming queries smoothly.",
    },
    challenge: {
      title: "Implement a Terminus Database Health Indicator",
      description:
        "Create a NestJS healthcheck controller using `@nestjs/terminus` and `PrismaHealthIndicator` that reports database latency and ping health at `GET /health/db`.",
      hints: [
        "Use `this.prismaHealth.pingCheck('database', this.prisma)`.",
      ],
      solution: `@Get('db')\n@HealthCheck()\ncheckDb() {\n  return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma)]);\n}`,
    },
    quiz: [
      {
        question: "Why must `?pgbouncer=true` be appended to the DATABASE_URL when using PgBouncer with Prisma?",
        options: [
          "It instructs Prisma to disable prepared statements that are incompatible with PgBouncer transaction mode",
          "It encrypts the database",
          "It increases query speeds by 10x",
          "It creates an automatic backup",
        ],
        answer: 0,
        explanation: "pgbouncer=true disables prepared statements so queries can execute across arbitrary pooled connections.",
      },
      {
        question: "Why is `directUrl` required for Prisma migrations in Supabase?",
        options: [
          "Migrations need direct session connections to obtain database-level locks and manage migration tables",
          "PgBouncer is read-only",
          "Direct connections are free",
          "Supabase requires direct URLs on Mondays",
        ],
        answer: 0,
        explanation: "Schema migrations require transactional session features that connection poolers cannot provide.",
      },
    ],
    flashcards: [
      {
        front: "What is Transaction Pooling in PgBouncer?",
        back: "A connection is assigned to a client only for the duration of a single database transaction, then immediately returned to the pool.",
      },
      {
        front: "What does `connection_limit=10` control in Prisma?",
        back: "The maximum number of simultaneous database socket connections a single Node.js process will open.",
      },
    ],
    recap: [
      "Use PgBouncer transaction pooling (port 6543) for runtime queries with `?pgbouncer=true`.",
      "Use `directUrl` (port 5432) for Prisma migrations.",
      "Tune `connection_limit` and monitor pool health metrics.",
    ],
    references: [
      { label: "Supabase Connection Pooling", url: "https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler" },
      { label: "Prisma with PgBouncer Guide", url: "https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/configure-pg-bouncer" },
    ],
    nextBridge: "Phase 22 is complete! Now let's enter Phase 23: File Uploads & Supabase Storage — covering presigned URLs, MIME validation, thumbnail processing, and CDN caching.",
  },
];

export const LESSON_CONTENT_P22B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P22B.map((l) => [l.id, l])
);
