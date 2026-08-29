import type { LessonContent } from "./types";

export const LESSON_CONTENT_P42B: Record<string, LessonContent> = {
  "p42-m4": {
    id: "p42-m4",
    phaseId: "p42",
    title: "Milestone: Audit, Reporting & Exports",
    level: "Mastery",
    minutes: 90,
    summary:
      "Generate complex analytical inventory reports using PostgreSQL Common Table Expressions (CTEs), window functions, and stream multi-megabyte CSV exports via BullMQ workers.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p29-l1 BullMQ"],
    objectives: [
      "Author complex analytical SQL queries using CTEs (`WITH`) and Window Functions (`SUM() OVER PARTITION BY`).",
      "Calculate Inventory Turnover Ratio, Stockout Risk Projections, and COGS (Cost of Goods Sold).",
      "Stream 100,000-row CSV exports to S3 via background BullMQ workers without buffering in RAM.",
    ],
    simple:
      "Executives need to know: 'Which warehouse has $500,000 of slow-moving inventory that hasn't sold in 90 days?' Running this calculation over 1,000,000 ledger rows requires advanced SQL window functions. When generating a massive CSV export, we stream the database rows directly to cloud storage in small chunks so the server consumes only 15MB of RAM instead of running out of memory.",
    why:
      "Analytical CTEs and memory-efficient streaming exports provide enterprise business intelligence at scale.",
    mentalModel: {
      title: "The Conveyor Belt vs The Huge Bucket",
      body:
        "If you need to move 1,000 gallons of water, you don't carry a giant 8,000-pound water tank all at once (Buffering in memory). You run a small hose that pumps a continuous stream of water directly to the truck (Streaming).",
    },
    sections: [
      {
        heading: "1. Streaming Large CSV Exports to S3",
        body: [
          "- Uses Node.js `stream.Readable` and `csv-stringify` pipeline.",
          "- Memory usage remains flat at <25MB regardless of whether the export is 1,000 rows or 5,000,000 rows.",
        ],
        code: [
          {
            file: "src/reports/export.worker.ts",
            lang: "ts",
            code: [
              "import { pipeline } from 'stream/promises';",
              "import { stringify } from 'csv-stringify';",
              "import { Upload } from '@aws-sdk/lib-storage';",
              "import { S3Client } from '@aws-sdk/client-s3';",
              "",
              "export async function streamInventoryExportToS3(dbStream: any, s3Client: S3Client, bucket: string, key: string) {",
              "  const csvStream = stringify({ header: true });",
              "",
              "  const parallelUpload = new Upload({",
              "    client: s3Client,",
              "    params: { Bucket: bucket, Key: key, Body: csvStream, ContentType: 'text/csv' },",
              "  });",
              "",
              "  // Pipe database cursor stream directly into CSV formatter and stream to S3",
              "  await Promise.all([",
              "    pipeline(dbStream, csvStream),",
              "    parallelUpload.done(),",
              "  ]);",
              "",
              "  return `https://${bucket}.s3.amazonaws.com/${key}`;",
              "}",
            ].join("\n"),
            caption: "Zero-memory streaming export pipeline to cloud storage.",
          },
        ],
      },
    ],
    mistake: {
      title: "Loading 500,000 Database Rows into a JavaScript Array in Memory Before Stringifying to CSV",
      wrong: [
        "// ❌ `const allRows = await prisma.movement.findMany(); // 500MB JSON array in memory!`",
        "// Instantly crashes the Node.js process with 'FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory'!",
      ].join("\n"),
      right: [
        "// ✅ Use database cursor streams or pagination chunks with Node.js stream pipelines.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author Stock Aging CTE Query and Streaming Export",
      description:
        "Write a SQL CTE calculating days-of-supply per warehouse, create a BullMQ worker that streams the output to a CSV file, and verify memory remains <30MB.",
      tasks: [
        "Write SQL query with `WITH stock_age AS (...)` CTE.",
        "Implement streaming CSV export worker.",
        "Verify export file downloads cleanly and matches ledger totals.",
      ],
    },
    quiz: [
      {
        question: "Why is Node.js stream piping essential when generating multi-megabyte CSV/PDF exports from relational databases?",
        options: [
          "It processes data chunk-by-chunk in a continuous stream, keeping server RAM consumption constant and minimal regardless of file size.",
          "It compresses CSV files into ZIP automatically.",
          "It increases SQL query speed by 100x.",
          "Because CSV requires streams to be valid.",
        ],
        answer: 0,
        explanation:
          "Streaming avoids loading huge result sets into memory, preventing Node.js process Out-of-Memory (OOM) crashes.",
      },
    ],
  },

  "p42-m5": {
    id: "p42-m5",
    phaseId: "p42",
    title: "Milestone: Tests, CI/CD & Production Deploy",
    level: "Mastery",
    minutes: 90,
    summary:
      "Deploy the Inventory & Order Management system to production. Audit transactional guarantees, execute automated load testing, and defend the system against the Enterprise Architecture Scorecard.",
    prerequisites: ["p42-m1", "p42-m2", "p42-m3", "p42-m4"],
    objectives: [
      "Execute high-concurrency Autocannon load testing validating pessimistic lock throughput.",
      "Deploy multi-container backend with automated database backups and read replica configuration.",
      "Defend the completed architecture against the Enterprise Reliability Scorecard.",
    ],
    simple:
      "Capstone 2 is complete! The Inventory and Order Management platform is live in production, equipped with ACID movement ledgers, race-condition-proof pessimistic stock reservation, order lifecycle state machines, and streaming business intelligence reports. You defend your engineering choices against enterprise reliability standards.",
    why:
      "Building an enterprise-grade transactional inventory engine proves mastery of advanced relational database architecture and distributed systems.",
    mentalModel: {
      title: "The Fortress Vault",
      body:
        "Every single gold bar that enters or leaves the fortress is logged by two guards in steel ledger books, under triple-redundant cameras with zero margin for error.",
    },
    sections: [
      {
        heading: "1. Enterprise Reliability Verification Checklist",
        body: [
          "- **ACID Correctness**: Zero negative inventory under 500 concurrent buy requests.",
          "- **Ledger Integrity**: `SUM(movements) === current_balance` invariant holds across all SKUs.",
          "- **State Machines**: Zero illegal order status bypasses possible via API.",
          "- **Performance**: Reports and exports stream with flat memory consumption (<30MB).",
        ],
      },
    ],
    mistake: {
      title: "Deploying Financial/Inventory Systems Without Running Automated Race Condition Load Tests",
      wrong: [
        "// ❌ Testing only with single manual clicks in the UI before launch.",
      ].join("\n"),
      right: [
        "// ✅ Run automated concurrency benchmarks (Autocannon / k6) verifying lock contention and transactional isolation.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Final Enterprise Capstone Defense",
      description:
        "Execute automated load tests against live staging, verify ledger balance integrity equations across 10,000 synthetic transactions, and produce the architecture defense memo.",
      tasks: [
        "Run Autocannon concurrency suite against order checkout.",
        "Verify ledger balance checksum equals physical stock.",
        "Produce signed `IMS_ARCHITECTURE_DEFENSE.md`.",
      ],
    },
    quiz: [
      {
        question: "What mathematical invariant must ALWAYS be true in an immutable inventory ledger architecture?",
        options: [
          "The current on-hand quantity of any SKU in any warehouse must exactly equal the sum of all historical movement quantities for that SKU and warehouse in the ledger table.",
          "Every product must have an even number of items.",
          "Stock must always be greater than 1,000.",
          "Warehouses must have equal square footage.",
        ],
        answer: 0,
        explanation:
          "In an immutable ledger, current state is a deterministic mathematical projection of all historical events: Balance = SUM(Movements).",
      },
    ],
  },
};
