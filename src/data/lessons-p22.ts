import type { LessonContent } from "./types";

/**
 * Phase 22 Production Data Access, Search & Pagination (L1–L3).
 */
export const LESSONS_P22: LessonContent[] = [
  {
    id: "p22-l1",
    phaseId: "p22",
    title: "Cursor vs Offset Pagination at Scale",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Understand the database performance degradation of `OFFSET` pagination on millions of rows. Master Keyset and Cursor-based pagination in Prisma 7.9.15 and build infinite scrolling feeds that execute in O(1) time.",
    prerequisites: [
      "p14-l2 — SQL Deep Dive: JOINs, Aggregations & Indexes",
      "p21-l2 — NestJS Service, Controller & Fastify Route Handlers",
    ],
    objectives: [
      "Demonstrate why `OFFSET 100000` forces PostgreSQL to scan and discard 100,000 index rows.",
      "Implement high-performance Cursor / Keyset pagination with Prisma `cursor` and `take: limit + 1`.",
      "Handle edge cases in infinite feeds (e.g. items inserted while user is scrolling).",
      "Return typed cursor metadata (`nextCursor`, `hasMore`) to frontend TanStack Query hooks.",
    ],
    simple:
      "When you ask a library for 'Page 10,000' using offset pagination (`OFFSET 100000`), the database has to physically flip through all 100,000 prior pages one by one before returning the 10 rows you wanted. This takes seconds and melts the database CPU. With cursor pagination, you tell the database: 'Give me the 10 rows that come after Task ID #84920'. Because of the index, the database jumps directly to that exact spot in 1 millisecond.",
    why:
      "Offset pagination causes database timeouts as tables grow past 100,000 rows. Cursor pagination provides constant O(1) performance regardless of table size.",
    mentalModel: {
      title: "The Book Bookmark vs Counting Every Page",
      body: "Offset pagination is like opening a 1,000-page book and counting page 1, page 2, page 3... all the way to 500 every single time you open the book. Cursor pagination is placing a physical bookmark on page 500: next time you read, you flip directly to the bookmark instantly.",
    },
    sections: [
      {
        heading: "1. The Offset Performance Cliff vs Keyset Pagination",
        body: [
          "Understanding why `OFFSET` scales in O(N) time while Cursor pagination scales in O(1) time.",
        ],
        code: [
          {
            file: "PAGINATION_PERF_COMPARISON.md",
            lang: "text",
            code: [
              "OFFSET PAGINATION (O(N) Complexity):",
              "  SELECT * FROM tasks WHERE workspace_id = 'ws_1' ORDER BY created_at DESC OFFSET 50000 LIMIT 20;",
              "  --> Postgres must read 50,020 rows, sort them, and discard 50,000. Time: ~350ms.",
              "",
              "CURSOR / KEYSET PAGINATION (O(1) Complexity):",
              "  SELECT * FROM tasks WHERE workspace_id = 'ws_1' AND created_at < '2026-03-01T12:00:00Z' ORDER BY created_at DESC LIMIT 20;",
              "  --> Postgres seeks directly to the B-tree index position and reads exactly 20 rows. Time: ~1.2ms.",
            ].join("\n"),
            caption: "Execution time comparison between Offset and Keyset/Cursor database operations.",
          },
        ],
      },
      {
        heading: "2. Implementing Cursor Pagination in Prisma 7.9.15",
        body: [
          "Using Prisma's `cursor` API with the `take: limit + 1` pattern to calculate `nextCursor` without an extra COUNT query.",
        ],
        code: [
          {
            file: "src/tasks/tasks.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "",
              "@Injectable()",
              "export class TasksService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  async listCursor(workspaceId: string, cursor?: string, limit = 20) {",
              "    // Request limit + 1 to determine if another page exists without a separate COUNT query",
              "    const items = await this.prisma.task.findMany({",
              "      where: { workspaceId, deletedAt: null },",
              "      take: limit + 1,",
              "      skip: cursor ? 1 : 0, // Skip the cursor item itself if cursor is provided",
              "      cursor: cursor ? { id: cursor } : undefined,",
              "      orderBy: { createdAt: 'desc' },",
              "    });",
              "",
              "    let nextCursor: string | undefined = undefined;",
              "    if (items.length > limit) {",
              "      const nextItem = items.pop(); // Remove the extra probe item",
              "      nextCursor = items[items.length - 1]?.id;",
              "    }",
              "",
              "    return {",
              "      data: items,",
              "      nextCursor,",
              "      hasMore: Boolean(nextCursor),",
              "    };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Prisma cursor pagination with limit+1 probe pattern for zero-cost hasMore determination.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Running a heavy `prisma.task.count()` query on every infinite scroll request, destroying the performance benefits of cursor pagination.",
      right: "Using the `take: limit + 1` probe technique to detect additional pages without touching `count()`.",
      explanation:
        "`COUNT(*)` on large PostgreSQL tables requires a full index scan. Probing limit+1 avoids counting entirely.",
    },
    tryItYourself: {
      title: "Benchmark Offset vs Cursor on 50,000 Rows",
      instructions: [
        "1. Open pgAdmin or Supabase SQL Editor.",
        "2. Run `EXPLAIN ANALYZE SELECT * FROM tasks OFFSET 45000 LIMIT 10;`.",
        "3. Run `EXPLAIN ANALYZE SELECT * FROM tasks WHERE id > '...' LIMIT 10;`.",
        "4. Compare execution cost and buffer hit counts.",
      ],
      expected: "The cursor query executes >100x faster with fractional I/O cost.",
    },
    challenge: {
      title: "Implement Compound Cursor for Non-Unique Sort Columns",
      description:
        "When sorting by `priority DESC, createdAt DESC`, a single `id` cursor is insufficient. Construct a base64 encoded compound cursor `{ priority, createdAt, id }` and decode it in your query handler.",
      hints: [
        "Encode JSON cursor with `Buffer.from(JSON.stringify({ ... })).toString('base64')`.",
      ],
      solution: `const encodeCursor = (task: Task) => Buffer.from(JSON.stringify({ p: task.priority, c: task.createdAt, id: task.id })).toString('base64');\nconst decodeCursor = (c: string) => JSON.parse(Buffer.from(c, 'base64').toString('utf-8'));`,
    },
    quiz: [
      {
        question: "Why does `OFFSET 100000 LIMIT 10` perform poorly in relational databases?",
        options: [
          "PostgreSQL disables caching on offsets",
          "The database must scan and evaluate 100,010 index entries before discarding 100,000 of them",
          "Offset requires an active WebSocket connection",
          "Prisma cannot compile OFFSET queries",
        ],
        answer: 1,
        explanation: "Relational databases must process all prior offset rows before returning the requested slice.",
      },
      {
        question: "What does the `take: limit + 1` pattern accomplish in cursor pagination?",
        options: [
          "It determines if another page exists without executing a slow COUNT(*) query",
          "It increases database connection pool size",
          "It validates the user password",
          "It forces an automatic schema migration",
        ],
        answer: 0,
        explanation: "Fetching 1 extra row reveals if more records follow while eliminating an expensive table count.",
      },
    ],
    flashcards: [
      {
        front: "What is Keyset Pagination?",
        back: "Pagination that uses the values of the last row's indexed columns in a `WHERE column < lastValue` clause.",
      },
      {
        front: "Why does cursor pagination prevent item skipping when new rows are inserted?",
        back: "Because the window is anchored to a specific record key rather than an arbitrary page number index.",
      },
    ],
    recap: [
      "Use cursor pagination for infinite feeds and large data collections.",
      "Use `take: limit + 1` to check for further pages without `COUNT(*)`.",
      "Anchor cursor queries to indexed columns for O(1) seek performance.",
    ],
    references: [
      { label: "Prisma Cursor Pagination", url: "https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination" },
    ],
    nextBridge: "Now let's build dynamic filtering and sorting query builders in Prisma.",
  },

  {
    id: "p22-l2",
    phaseId: "p22",
    title: "Dynamic Filtering & Sorting in Prisma",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Construct flexible, type-safe query builders in Prisma 7.9.15. Dynamically combine multi-criteria filters (`status`, `assigneeId`, `priority`, date ranges), enforce strict column sort whitelisting, and protect your database from unindexed sort queries.",
    prerequisites: [
      "p22-l1 — Cursor vs Offset Pagination at Scale",
      "p15-l2 — Prisma Client CRUD Operations & Query Options",
    ],
    objectives: [
      "Construct dynamic `Prisma.TaskWhereInput` objects based on optional user filters.",
      "Implement date-range filtering with ISO string validation (`gte`, `lte`).",
      "Enforce strict sort column whitelisting to prevent slow unindexed table scans.",
      "Combine search, status filters, and multi-column sorting into a unified service method.",
    ],
    simple:
      "Users expect to filter tasks by multiple criteria simultaneously: 'Show me Urgent tasks assigned to Sarah created in the last 7 days sorted by due date'. If you write separate queries for every combination, you will have 50 different database functions. In this lesson, we build a single dynamic query builder that conditionally constructs the Prisma `where` and `orderBy` objects safely and efficiently.",
    why:
      "Allowing clients to pass arbitrary sort column strings directly to the database causes slow unindexed sorts that crash database servers.",
    mentalModel: {
      title: "The Bento Box Meal Selector",
      body: "Dynamic filtering is like building a custom Bento Box: you start with an empty box (`where: { workspaceId }`). If the user picks Salmon (status filter), you add the salmon compartment. If they add rice (priority filter), you add rice. If they don't pick a dessert (no date filter), that compartment is omitted completely. The kitchen only cooks what was requested.",
    },
    sections: [
      {
        heading: "1. The Dynamic Filter & Sort Builder",
        body: [
          "Constructing strongly-typed `Prisma.TaskWhereInput` and `Prisma.TaskOrderByWithRelationInput` safely.",
        ],
        code: [
          {
            file: "src/tasks/tasks-query.builder.ts",
            lang: "ts",
            code: [
              "import { Prisma } from '@prisma/client';",
              "import { TaskQueryDto, SortOrder } from './dto/task-query.dto';",
              "",
              "// Whitelist allowable sort columns to prevent slow unindexed sorts",
              "const ALLOWED_SORT_FIELDS = ['createdAt', 'dueDate', 'priority', 'title'] as const;",
              "type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];",
              "",
              "export function buildTaskWhereClause(workspaceId: string, query: TaskQueryDto): Prisma.TaskWhereInput {",
              "  const where: Prisma.TaskWhereInput = {",
              "    workspaceId,",
              "    deletedAt: null,",
              "  };",
              "",
              "  if (query.status) {",
              "    where.status = query.status;",
              "  }",
              "",
              "  if (query.priority) {",
              "    where.priority = query.priority;",
              "  }",
              "",
              "  if (query.assigneeId) {",
              "    where.assigneeId = query.assigneeId;",
              "  }",
              "",
              "  // Date Range Filtering (e.g. created between startDate and endDate)",
              "  if (query.createdFrom || query.createdTo) {",
              "    where.createdAt = {",
              "      ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),",
              "      ...(query.createdTo ? { lte: new Date(query.createdTo) } : {}),",
              "    };",
              "  }",
              "",
              "  return where;",
              "}",
              "",
              "export function buildTaskOrderByClause(query: TaskQueryDto): Prisma.TaskOrderByWithRelationInput {",
              "  const sortBy = ALLOWED_SORT_FIELDS.includes(query.sortBy as AllowedSortField)",
              "    ? (query.sortBy as AllowedSortField)",
              "    : 'createdAt';",
              "",
              "  const order = query.sortOrder === SortOrder.ASC ? 'asc' : 'desc';",
              "",
              "  return { [sortBy]: order };",
              "}",
            ].join("\n"),
            caption: "Dynamic query builder with sort field whitelisting and date range operators.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Accepting `sortBy` as any arbitrary string from the client without whitelisting, allowing users to force unindexed sorts on giant text columns.",
      right: "Checking `sortBy` against an explicit `ALLOWED_SORT_FIELDS` array.",
      explanation:
        "Sorting by unindexed columns forces PostgreSQL to perform expensive in-memory or disk-based quicksorts.",
    },
    tryItYourself: {
      title: "Test Multi-Criteria Filter Query",
      instructions: [
        "1. Send a GET request to `/workspaces/:ws/tasks?status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&sortOrder=ASC`.",
        "2. Verify that the query builder applies all three criteria in a single SQL SELECT statement.",
      ],
      expected: "The returned results match all filtered parameters with correct ordering.",
    },
    challenge: {
      title: "Support Multi-Value Array Filtering (e.g. ?status=TODO,IN_PROGRESS)",
      description:
        "Extend the query builder to parse comma-separated status strings into an array and use Prisma's `in` operator (`where.status = { in: ['TODO', 'IN_PROGRESS'] }`).",
      hints: [
        "Split the string with `query.status.split(',')` and map to enum values.",
      ],
      solution: `if (query.status) {\n  const statuses = query.status.split(',') as TaskStatus[];\n  where.status = { in: statuses };\n}`,
    },
    quiz: [
      {
        question: "Why should sort fields always be validated against a whitelist in backend services?",
        options: [
          "To prevent users from sorting by unindexed or sensitive internal columns that cause performance bottlenecks",
          "Because SQL does not support the ORDER BY keyword",
          "To format dates as European timestamps",
          "To enable CSS animations",
        ],
        answer: 0,
        explanation: "Whitelisting guarantees that only indexed and authorized columns can be sorted.",
      },
      {
        question: "Which Prisma operator filters records between two dates?",
        options: ["between", "{ gte: startDate, lte: endDate }", "inRange", "during"],
        answer: 1,
        explanation: "Prisma combines `gte` (greater than or equal) and `lte` (less than or equal) on date fields.",
      },
    ],
    flashcards: [
      {
        front: "What is `Prisma.TaskWhereInput`?",
        back: "The generated TypeScript interface representing all valid filter options for the Task model in Prisma.",
      },
      {
        front: "What operator handles case-insensitive substring matching in Prisma Postgres?",
        back: "`{ contains: term, mode: 'insensitive' }`.",
      },
    ],
    recap: [
      "Build dynamic `where` objects conditionally from query DTOs.",
      "Whitelist sort fields strictly to protect database performance.",
      "Combine date ranges using `gte` and `lte` filters.",
    ],
    references: [
      { label: "Prisma Filtering and Sorting", url: "https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting" },
    ],
    nextBridge: "Now let's implement PostgreSQL Full-Text Search with tsvector, tsquery, and GIN indexes.",
  },

  {
    id: "p22-l3",
    phaseId: "p22",
    title: "PostgreSQL Full-Text Search with Prisma",
    level: "Full-Stack Developer",
    minutes: 45,
    summary:
      "Harness PostgreSQL's native full-text search engine. Create GIN indexes over `tsvector` columns, execute stemming and ranking queries with `websearch_to_tsquery`, and integrate fuzzy trigram matching (`pg_trgm`) for typo-tolerant searches.",
    prerequisites: [
      "p22-l2 — Dynamic Filtering & Sorting in Prisma",
      "p14-l2 — SQL Deep Dive: JOINs, Aggregations & Indexes",
    ],
    objectives: [
      "Explain why `LIKE '%term%'` causes full table scans and cannot scale.",
      "Create generated `tsvector` columns and Generalized Inverted (GIN) indexes in PostgreSQL.",
      "Execute natural language search queries using `websearch_to_tsquery` and `ts_rank`.",
      "Integrate `pg_trgm` extension for fuzzy typo-tolerant matching.",
    ],
    simple:
      "When you use `WHERE title LIKE '%design%'`, PostgreSQL has to examine every letter of every row in the table, ignoring standard B-Tree indexes. Full-Text Search parses text into linguistic root words (stemming: 'designing', 'designer', 'designs' all become 'design') and builds an alphabetical index of all words (a GIN index). Searching 1,000,000 articles takes under 2 milliseconds.",
    why:
      "`LIKE '%term%'` kills database performance on large datasets. Native PostgreSQL Full-Text Search provides Google-style natural search at zero extra infrastructure cost.",
    mentalModel: {
      title: "The Book Index in the Back of the Textbook",
      body: "Searching with `LIKE '%term%'` is reading the entire 800-page textbook from cover to cover looking for a word. Full-Text Search with a GIN index is flipping directly to the alphabetical Index at the back of the book, finding the word 'Authentication', and jumping straight to pages 42, 118, and 205.",
    },
    sections: [
      {
        heading: "1. PostgreSQL Full-Text Search Migration & GIN Index",
        body: [
          "Adding a generated search vector column and GIN index via custom SQL migration.",
        ],
        code: [
          {
            file: "prisma/migrations/add_fulltext_search.sql",
            lang: "sql",
            code: [
              "-- 1. Enable pg_trgm extension for fuzzy trigram matching",
              "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
              "",
              "-- 2. Add generated tsvector column for fast full-text search",
              "ALTER TABLE tasks ADD COLUMN search_vector tsvector",
              "  GENERATED ALWAYS AS (",
              "    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||",
              "    setweight(to_tsvector('english', coalesce(description, '')), 'B')",
              "  ) STORED;",
              "",
              "-- 3. Create GIN index on search_vector",
              "CREATE INDEX tasks_search_vector_idx ON tasks USING GIN (search_vector);",
              "",
              "-- 4. Create Trigram index on title for typo tolerance",
              "CREATE INDEX tasks_title_trgm_idx ON tasks USING GIN (title gin_trgm_ops);",
            ].join("\n"),
            caption: "PostgreSQL migration creating weighted tsvector search column and GIN indexes.",
          },
        ],
      },
      {
        heading: "2. Executing Ranked Full-Text Queries in Prisma",
        body: [
          "Using `prisma.$queryRaw` with `websearch_to_tsquery` to execute ranked relevance searches safely.",
        ],
        code: [
          {
            file: "src/tasks/tasks-search.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { Prisma } from '@prisma/client';",
              "",
              "@Injectable()",
              "export class TasksSearchService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  async searchTasks(workspaceId: string, query: string, limit = 20) {",
              "    if (!query.trim()) return [];",
              "",
              "    // Safe parameterized raw query using websearch_to_tsquery and ts_rank",
              "    return this.prisma.$queryRaw<any[]>`",
              "      SELECT ",
              "        id,",
              "        title,",
              "        description,",
              "        status,",
              "        priority,",
              "        ts_rank(search_vector, websearch_to_tsquery('english', ${query})) as rank",
              "      FROM tasks",
              "      WHERE workspace_id = ${workspaceId}",
              "        AND deleted_at IS NULL",
              "        AND (",
              "          search_vector @@ websearch_to_tsquery('english', ${query})",
              "          OR title % ${query} -- Trigram fuzzy match fallback for typos",
              "        )",
              "      ORDER BY rank DESC, created_at DESC",
              "      LIMIT ${limit};",
              "    `;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Ranked relevance search combining full-text tsvector and trigram fuzzy matching.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Using string interpolation inside `$queryRawUnsafe` with user search terms, opening SQL injection vulnerabilities.",
      right: "Using tagged template literals with `$queryRaw` so Prisma automatically parameterizes search terms safely.",
      explanation:
        "`$queryRaw` parameterizes variables passed in `${query}`, preventing SQL injection attacks.",
    },
    tryItYourself: {
      title: "Test Stemmed and Quoted Phrase Searches",
      instructions: [
        "1. Create a task with description 'Developing the authentication system'.",
        "2. Search for the root word 'develop'.",
        "3. Verify that the task matches due to PostgreSQL English language stemming.",
      ],
      expected: "The search matches linguistic root stems automatically.",
    },
    challenge: {
      title: "Add Search Term Highlighting with ts_headline",
      description:
        "Enhance the search query to return HTML snippet excerpts with `<b>` tags wrapping the matched search keywords using PostgreSQL `ts_headline()`.",
      hints: [
        "Include `ts_headline('english', description, websearch_to_tsquery('english', ${query})) as excerpt` in your SELECT query.",
      ],
      solution: `SELECT id, title, ts_headline('english', description, websearch_to_tsquery('english', \${query}), 'StartSel=<b>, StopSel=</b>') as excerpt FROM tasks...`,
    },
    quiz: [
      {
        question: "What is a GIN (Generalized Inverted Index) in PostgreSQL?",
        options: [
          "An index mapping individual words/tokens directly to the list of database rows that contain them",
          "A tool for compressing images",
          "A password hashing algorithm",
          "A type of foreign key constraint",
        ],
        answer: 0,
        explanation: "GIN indexes store inverted word-to-row lookup lists, enabling sub-millisecond full-text queries.",
      },
      {
        question: "What does `websearch_to_tsquery` handle automatically?",
        options: [
          "Natural search syntax like quoted phrases (\"exact match\") and minus signs (-excludedWord)",
          "CSS typography",
          "Browser cookies",
          "DNS lookups",
        ],
        answer: 0,
        explanation: "websearch_to_tsquery parses standard Google-style search operators without throwing syntax errors on strange characters.",
      },
    ],
    flashcards: [
      {
        front: "What is Word Stemming in Full-Text Search?",
        back: "Reducing derived words to their base linguistic root (e.g., 'running', 'runs' -> 'run').",
      },
      {
        front: "What is `pg_trgm`?",
        back: "A PostgreSQL extension that splits text into 3-character slices (trigrams) to enable typo-tolerant fuzzy matching.",
      },
    ],
    recap: [
      "Replace slow `LIKE '%term%'` with native PostgreSQL Full-Text Search.",
      "Use generated `tsvector` columns with GIN indexes.",
      "Combine `websearch_to_tsquery` and `ts_rank` for fast, ranked search results.",
    ],
    references: [
      { label: "PostgreSQL Full-Text Search", url: "https://www.postgresql.org/docs/current/textsearch.html" },
    ],
    nextBridge: "Now let's examine streaming large datasets, CSV export pipelines, bulk operations, and connection pool tuning.",
  },
];

export const LESSON_CONTENT_P22: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P22.map((l) => [l.id, l])
);
