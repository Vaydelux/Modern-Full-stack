import type { LessonContent } from "./types";

/**
 * Phase 13 PostgreSQL Zero to Mastery (L1–L3).
 * Every lesson fulfills the full quality contract.
 */
export const LESSONS_P13: LessonContent[] = [
  {
    id: "p13-l1",
    phaseId: "p13",
    title: "Relational Modeling & ERDs",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Modern backend engineering begins with bulletproof relational data modeling. Flawed schemas lead to data duplication, update anomalies, cascading performance degradation, and impossible migrations. In this lesson, you will master entity-relationship modeling, primary key strategies (UUIDv7 vs BIGSERIAL), relational cardinality (1:1, 1:N, N:M junction tables), pragmatic Third Normal Form (3NF) normalization, and concrete schema design for multi-tenant applications.",
    prerequisites: [
      "p07-l1 — HTTP request/response & JSON data structures",
      "p10-l1 — TypeScript backend fundamentals",
    ],
    objectives: [
      "Design normalized relational data models and Entity-Relationship Diagrams (ERDs).",
      "Choose the right Primary Key strategy: BIGINT Identity vs UUIDv4 vs time-ordered UUIDv7.",
      "Model 1:1, 1:N, and N:M relationships with proper foreign key cascades and junction tables.",
      "Apply 1NF, 2NF, and 3NF normalization rules without over-engineering or premature denormalization.",
      "Implement multi-tenant organizational isolation (Tenant ID vs Workspace scoping).",
    ],
    simple:
      "A database schema is the blueprint of a skyscraper. If the concrete foundation has columns in the wrong place, every room built on top (your APIs, frontend, search queries, and reports) will tilt, leak, or collapse under load. Getting the relational entities right on day one saves hundreds of hours of painful data migrations later.",
    why:
      "Application code can be refactored in minutes with tests, but live relational schemas holding terabytes of production data are extremely risky and expensive to restructure. Knowing how to normalize data and enforce referential integrity at the database layer guarantees consistent state regardless of bugs in application code.",
    mentalModel: {
      title: "The Single Source of Truth & Foreign Pointer Network",
      body: "In a relational database, every distinct fact lives in exactly ONE place. If a user changes their name, you update one row in the `users` table. Every task, comment, and invoice referencing that user does not store a duplicate name; they hold a foreign key pointer (`user_id`). The database engine ensures pointers never dangle or point to non-existent rows.",
    },
    sections: [
      {
        heading: "Primary Keys: BIGINT vs UUIDv4 vs UUIDv7",
        body: [
          "Every relational table must have a primary key (`PRIMARY KEY`) that uniquely identifies each row. In modern systems, developers choose between sequential integers and globally unique identifiers:",
        ],
        code: [
          {
            file: "schema-primary-keys.sql",
            lang: "sql",
            code: [
              "-- Strategy 1: BIGINT Identity (64-bit auto-incrementing integer)",
              "-- Pros: Extremely compact (8 bytes), sequential B-Tree writes, fastest joins.",
              "-- Cons: Predictable/enumerable (exposes business volume / ID guessing attacks), requires DB coordination for distributed inserts.",
              "CREATE TABLE orders_sequential (",
              "    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,",
              "    total_cents INTEGER NOT NULL",
              ");",
              "",
              "-- Strategy 2: UUIDv4 (Random 128-bit)",
              "-- Pros: Can be generated client-side/offline, completely unguessable.",
              "-- Cons: 16 bytes, completely random insertion order causes heavy B-Tree index fragmentation & random disk I/O.",
              "CREATE TABLE orders_uuid4 (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    total_cents INTEGER NOT NULL",
              ");",
              "",
              "-- Strategy 3 (Modern Standard): UUIDv7 (Time-ordered 128-bit)",
              "-- Pros: Unguessable, client-generable, AND monotonically increasing (sequential index insertion, zero B-Tree page splits).",
              "-- PostgreSQL 17+ native or generated via uuid-ossp / application layer.",
              "CREATE TABLE orders_uuid7 (",
              "    id UUID PRIMARY KEY, -- timestamp (48 bits) + random entropy (74 bits)",
              "    total_cents INTEGER NOT NULL",
              ");",
            ].join("\n"),
            caption: "Primary key architecture comparison for production PostgreSQL tables.",
          },
        ],
      },
      {
        heading: "Cardinality & Junction Tables (1:1, 1:N, N:M)",
        body: [
          "Understanding relationship cardinality determines where foreign key columns and constraint indexes must live:",
          "1. One-to-One (1:1): A user has exactly one profile. The foreign key on `user_profiles` has a `UNIQUE` constraint.",
          "2. One-to-Many (1:N): A project has many tasks. The `tasks` table stores `project_id REFERENCES projects(id)`.",
          "3. Many-to-Many (N:M): A task can have multiple tags, and a tag belongs to multiple tasks. Requires an explicit Junction Table (`task_tags`).",
        ],
        code: [
          {
            file: "relationships-schema.sql",
            lang: "sql",
            code: [
              "-- 1. One-to-One: user_profiles -> users",
              "CREATE TABLE user_profiles (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,",
              "    bio TEXT,",
              "    avatar_url TEXT",
              ");",
              "",
              "-- 2. One-to-Many: tasks -> projects",
              "CREATE TABLE tasks (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,",
              "    title VARCHAR(255) NOT NULL,",
              "    status VARCHAR(32) NOT NULL DEFAULT 'TODO'",
              ");",
              "",
              "-- 3. Many-to-Many: tasks <-> tags via junction table",
              "CREATE TABLE tags (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    name VARCHAR(64) NOT NULL UNIQUE,",
              "    color VARCHAR(7) NOT NULL DEFAULT '#6366f1'",
              ");",
              "",
              "CREATE TABLE task_tags (",
              "    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,",
              "    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,",
              "    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),",
              "    PRIMARY KEY (task_id, tag_id) -- Composite Primary Key prevents duplicate tag assignments",
              ");",
            ].join("\n"),
            caption: "DDL implementing 1:1, 1:N, and N:M relational patterns.",
          },
        ],
      },
      {
        heading: "Pragmatic Normalization (1NF, 2NF, 3NF)",
        body: [
          "Normalization eliminates redundancy and prevents update/delete anomalies:",
          "• 1NF (Atomic Values): No comma-separated strings or JSON arrays storing relational values (`'bug,urgent,backend'` is a violation).",
          "• 2NF (Full Functional Dependency): All non-key columns must depend on the whole primary key (crucial for composite keys).",
          "• 3NF (No Transitive Dependencies): Non-key columns must not depend on other non-key columns (e.g. do not store `country_name` in an address table if `country_id` is present).",
        ],
        code: [
          {
            file: "normalization-rules.sql",
            lang: "sql",
            code: [
              "-- VIOLATION of 1NF & 3NF:",
              "-- 1. 'tags' violates 1NF (comma-separated list prevents indexing & referential integrity)",
              "-- 2. 'author_name' violates 3NF (transitive dependency: author_id -> author_name)",
              "CREATE TABLE bad_posts (",
              "    id UUID PRIMARY KEY,",
              "    author_id UUID NOT NULL,",
              "    author_name VARCHAR(100), -- If author changes name, old posts show stale name!",
              "    tags VARCHAR(255)          -- e.g. 'postgres,sql,indexes' -> impossible to query efficiently",
              ");",
              "",
              "-- PROPER 3NF DESIGN:",
              "CREATE TABLE authors (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    full_name VARCHAR(100) NOT NULL,",
              "    email VARCHAR(255) NOT NULL UNIQUE",
              ");",
              "",
              "CREATE TABLE posts (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,",
              "    title VARCHAR(255) NOT NULL,",
              "    content TEXT NOT NULL",
              ");",
            ].join("\n"),
            caption: "Transitioning from denormalized anti-patterns to clean 3NF schemas.",
          },
        ],
      },
    ],
    mistake: {
      title: "Missing composite primary keys on junction tables",
      wrong:
        "CREATE TABLE task_assignees (\n  id SERIAL PRIMARY KEY,\n  task_id INT REFERENCES tasks(id),\n  user_id INT REFERENCES users(id)\n  -- No UNIQUE constraint or composite PK!\n);",
      right:
        "CREATE TABLE task_assignees (\n  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,\n  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n  PRIMARY KEY (task_id, user_id)\n);",
      explain:
        "Without a composite primary key or unique index on (task_id, user_id), accidental duplicate INSERT calls will assign the same user to the same task multiple times, creating phantom bugs and bloated join calculations.",
    },
    tryIt: [
      "Draft the PostgreSQL schema for an organization workspace hierarchy: an organizations table, a workspaces table, and a workspace_members junction table.",
      "Ensure all tables use UUIDv7 or BIGINT Identity primary keys and enforce NOT NULL on required fields.",
      "Attach ON DELETE CASCADE where child records belong entirely to the parent container.",
      "Verify that foreign key columns are indexed to optimize relational join lookups.",
    ],
    challenge: {
      prompt:
        "Write the production-ready PostgreSQL DDL script creating `users`, `projects`, `tasks`, and `task_comments`. Ensure all foreign keys enforce strict referential actions, tasks support an ENUM or CHECK constraint for status ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'), and timestamps use TIMESTAMPTZ.",
      hints: [
        "Use `CREATE TYPE task_status AS ENUM (...)` or `CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'))`.",
        "Add `ON DELETE CASCADE` to project tasks and task comments so deleting a project cleans up child records cleanly.",
        "Include `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.",
      ],
      solution: [
        "CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');",
        "CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');",
        "",
        "CREATE TABLE users (",
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "    email VARCHAR(255) NOT NULL UNIQUE,",
        "    full_name VARCHAR(128) NOT NULL,",
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        ");",
        "",
        "CREATE TABLE projects (",
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,",
        "    name VARCHAR(128) NOT NULL,",
        "    slug VARCHAR(64) NOT NULL UNIQUE,",
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        ");",
        "",
        "CREATE TABLE tasks (",
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,",
        "    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,",
        "    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,",
        "    title VARCHAR(255) NOT NULL,",
        "    description TEXT,",
        "    status task_status NOT NULL DEFAULT 'TODO',",
        "    priority task_priority NOT NULL DEFAULT 'MEDIUM',",
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),",
        "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        ");",
        "",
        "CREATE TABLE task_comments (",
        "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
        "    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,",
        "    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,",
        "    body TEXT NOT NULL,",
        "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        ");",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Why are time-ordered UUIDv7 identifiers preferred over random UUIDv4 for high-throughput primary keys?",
        options: [
          "UUIDv7 identifiers use half as many bytes on disk as UUIDv4.",
          "UUIDv7 identifiers sort chronologically, preventing severe B-Tree index fragmentation and random disk page writes.",
          "PostgreSQL does not allow indexes on UUIDv4 columns.",
          "UUIDv7 automatically encrypts table data at rest.",
        ],
        answer: 1,
        explain:
          "Because UUIDv4 is completely random, each INSERT writes to a random B-Tree index page, forcing frequent disk page splits and thrashing RAM buffer pools. UUIDv7 is monotonically increasing, appending sequentially to the rightmost leaf page.",
      },
      {
        q: "What is the primary architectural purpose of a Junction Table in relational modeling?",
        options: [
          "To speed up full-text search indexing.",
          "To resolve Many-to-Many (N:M) relationships into two One-to-Many relationships with a composite primary key.",
          "To store temporary query cache results.",
          "To allow tables to bypass foreign key constraint validation.",
        ],
        answer: 1,
        explain:
          "Relational databases cannot natively represent many-to-many relationships without a junction table that contains foreign keys pointing to both entities.",
      },
      {
        q: "What happens when a foreign key is declared with `ON DELETE SET NULL`?",
        options: [
          "The parent row cannot be deleted as long as child rows reference it.",
          "Deleting the parent row automatically deletes all referencing child rows.",
          "Deleting the parent row updates the child row's foreign key column to NULL.",
          "The database deletes the entire child table.",
        ],
        answer: 2,
        explain:
          "`ON DELETE SET NULL` keeps the child row intact (e.g. a Task) but resets the referenced pointer (e.g. `assignee_id`) to NULL when the assigned user is deleted.",
      },
      {
        q: "Which database design violates Third Normal Form (3NF)?",
        options: [
          "A `users` table storing `first_name`, `last_name`, and `email`.",
          "An `orders` table storing `customer_id`, `customer_email`, and `customer_city` alongside `total_amount`.",
          "A `tasks` table with a foreign key pointing to `projects(id)`.",
          "A `task_tags` junction table with a composite primary key `(task_id, tag_id)`.",
        ],
        answer: 1,
        explain:
          "Storing `customer_email` and `customer_city` directly on `orders` introduces transitive dependencies. If the customer updates their email, old order rows become stale or inconsistent.",
      },
      {
        q: "Why should you avoid storing comma-separated values in a single VARCHAR column (e.g. `tags = 'frontend,react,css'`)?",
        options: [
          "It violates First Normal Form (1NF), prevents foreign key integrity, and makes filtering by a single tag slow and unindexable.",
          "PostgreSQL throws a syntax error if a string contains more than one comma.",
          "Strings with commas cannot be returned via JSON API endpoints.",
          "Varchar columns cannot exceed 10 characters in length.",
        ],
        answer: 0,
        explain:
          "1NF requires atomic column values. Comma-separated strings make search queries like `WHERE tags LIKE '%react%'` perform slow sequential scans and prevent referential integrity checks.",
      },
      {
        q: "What is the difference between `ON DELETE RESTRICT` and `ON DELETE NO ACTION` in PostgreSQL?",
        options: [
          "They are completely identical in every scenario.",
          "Both prevent parent deletion if children exist, but `NO ACTION` allows deferred constraint checking inside a transaction while `RESTRICT` enforces immediately.",
          "`RESTRICT` deletes child rows while `NO ACTION` throws a warning.",
          "`NO ACTION` converts foreign keys to strings.",
        ],
        answer: 1,
        explain:
          "While both prevent deleting a referenced parent, `NO ACTION` permits `DEFERRABLE INITIALLY DEFERRED` constraint checking at transaction commit time, whereas `RESTRICT` evaluates immediately at the statement boundary.",
      },
    ],
    flashcards: [
      {
        front: "What is 1NF (First Normal Form)?",
        back: "Each column must hold atomic (indivisible) values, each record must be unique, and there are no repeating groups or comma-separated lists.",
      },
      {
        front: "What is 2NF (Second Normal Form)?",
        back: "The table must satisfy 1NF, and all non-key columns must depend on the FULL primary key (not just part of a composite key).",
      },
      {
        front: "What is 3NF (Third Normal Form)?",
        back: "The table must satisfy 2NF, and no non-key column may depend on another non-key column (no transitive functional dependencies).",
      },
      {
        front: "Why is UUIDv7 superior to UUIDv4 for database primary keys?",
        back: "UUIDv7 embeds a millisecond timestamp prefix, making keys chronologically ordered. This maintains sequential B-Tree index inserts and prevents index fragmentation.",
      },
      {
        front: "What does `ON DELETE CASCADE` do?",
        back: "When a parent row is deleted, PostgreSQL automatically deletes all child rows referencing that parent via the foreign key.",
      },
      {
        front: "What is a Composite Primary Key?",
        back: "A primary key composed of two or more columns (e.g. `PRIMARY KEY (task_id, tag_id)`), guaranteeing uniqueness across the combination.",
      },
      {
        front: "When should you use `ON DELETE RESTRICT`?",
        back: "When child records represent legal or critical business history (e.g. Invoices, Payments) that must never be deleted accidentally when a User is removed.",
      },
      {
        front: "Why use `TIMESTAMPTZ` instead of `TIMESTAMP` in PostgreSQL?",
        back: "`TIMESTAMPTZ` converts input to UTC on storage and handles timezone offsets consistently, whereas `TIMESTAMP` strips timezone context completely.",
      },
    ],
    recap: [
      "Relational modeling organizes domain entities into clean, normalized tables with atomic columns and single sources of truth.",
      "UUIDv7 provides the best combination of client-side unguessable generation and sequential B-Tree index write efficiency.",
      "1:1 relationships use unique foreign keys; 1:N use standard foreign keys; N:M use junction tables with composite primary keys.",
      "Foreign key referential actions (`CASCADE`, `RESTRICT`, `SET NULL`) guard system integrity against orphaned data.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 5. Data Definition & Constraints", url: "https://www.postgresql.org/docs/current/ddl-constraints.html" },
      { label: "RFC 9562: Universally Unique IDentifiers (UUIDv7 Specification)", url: "https://datatracker.ietf.org/doc/html/rfc9562" },
      { label: "PostgreSQL Documentation: Table Partitioning & Keys", url: "https://www.postgresql.org/docs/current/ddl-partitioning.html" },
    ],
    nextBridge:
      "Now that your relational tables and keys are designed, proceed to P13-L2 to master the core SQL DML operations: CRUD, sorting, deterministic pagination, and UPSERT semantics.",
  },
  {
    id: "p13-l2",
    phaseId: "p13",
    title: "CRUD, Sorting, Filtering & Pagination in SQL",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Writing raw SQL with precision is an indispensable engineering skill. Beyond basic SELECT and INSERT statements, production backends require idempotent UPSERTs, atomic state mutations with RETURNING clauses, deterministic sorting, and high-performance cursor pagination that scales to millions of records without the performance cliff of OFFSET.",
    prerequisites: [
      "p13-l1 — Relational Modeling & ERDs",
      "p07-l5 — Pagination, Filtering & Search standards",
    ],
    objectives: [
      "Write atomic CRUD operations utilizing PostgreSQL `RETURNING` clauses.",
      "Implement idempotent UPSERTs using `INSERT ... ON CONFLICT DO UPDATE`.",
      "Ensure deterministic sorting using secondary unique tie-breaker columns and `NULLS LAST`.",
      "Diagnose the severe performance cliff of `LIMIT / OFFSET` on large tables.",
      "Implement high-performance Keyset (Cursor-based) Pagination in raw SQL.",
    ],
    simple:
      "Fetching page 5,000 using `OFFSET 50000` is like flipping through a 10,000-page book by counting every single page from page 1 to 5,000 every time you open it. Keyset (cursor) pagination is bookmarking your spot: you say 'give me the next 10 tasks whose ID comes after task #4892'. It jumps straight to the page instantly.",
    why:
      "`OFFSET 100000` forces the database engine to read, sort, and discard 100,000 rows from disk before returning the 10 requested rows. At scale, this crashes database memory pools and spikes CPU latency. Understanding keyset pagination and idempotent mutations guarantees fast, resilient APIs.",
    mentalModel: {
      title: "The Bookmarked Index vs The Full Page Count",
      body: "Think of SQL execution as an assembly line. An OFFSET query produces the entire dataset, counts off the skipped rows, and throws them in the trash. A Keyset query applies an indexed `WHERE id > cursor` filter, allowing the index to skip the trash entirely before rows are ever read from disk.",
    },
    sections: [
      {
        heading: "Atomic Mutations with the RETURNING Clause",
        body: [
          "In PostgreSQL, `INSERT`, `UPDATE`, and `DELETE` queries can return modified rows immediately, eliminating unnecessary follow-up `SELECT` queries:",
        ],
        code: [
          {
            file: "crud-returning.sql",
            lang: "sql",
            code: [
              "-- 1. Atomic INSERT returning generated UUID and default timestamp",
              "INSERT INTO tasks (project_id, creator_id, title, status)",
              "VALUES ('e4b3c2a1-0000-0000-0000-000000000001', 'u1', 'Migrate Auth to JWT', 'IN_PROGRESS')",
              "RETURNING id, title, status, created_at;",
              "",
              "-- 2. Atomic UPDATE with conditional timestamp update",
              "UPDATE tasks",
              "SET status = 'DONE',",
              "    updated_at = NOW()",
              "WHERE id = 't-9921' AND status != 'DONE'",
              "RETURNING id, status, updated_at;",
              "",
              "-- 3. Atomic DELETE returning deleted record snapshot for audit logging",
              "DELETE FROM task_comments",
              "WHERE id = 'c-1044'",
              "RETURNING id, task_id, body, author_id;",
            ].join("\n"),
            caption: "Using RETURNING clauses to guarantee single-roundtrip atomic mutations.",
          },
        ],
      },
      {
        heading: "Idempotent UPSERTs (ON CONFLICT)",
        body: [
          "When inserting data that might already exist (e.g. syncing user profiles or workspace member roles), use `ON CONFLICT` to perform atomic updates without race conditions:",
        ],
        code: [
          {
            file: "upsert-semantics.sql",
            lang: "sql",
            code: [
              "-- Idempotent User Setting Sync",
              "INSERT INTO user_preferences (user_id, theme, email_notifications, updated_at)",
              "VALUES ('u-42', 'DARK', true, NOW())",
              "ON CONFLICT (user_id) -- Targets the UNIQUE constraint or PK",
              "DO UPDATE SET",
              "    theme = EXCLUDED.theme,",
              "    email_notifications = EXCLUDED.email_notifications,",
              "    updated_at = NOW()",
              "RETURNING user_id, theme, email_notifications;",
              "",
              "-- Idempotent Tag Creation (DO NOTHING if already exists)",
              "INSERT INTO tags (name, color)",
              "VALUES ('backend', '#3b82f6')",
              "ON CONFLICT (name) DO NOTHING",
              "RETURNING id, name;",
            ].join("\n"),
            caption: "Using EXCLUDED pseudo-table to merge conflicting records atomically.",
          },
        ],
      },
      {
        heading: "Sorting Stability & Keyset (Cursor) Pagination",
        body: [
          "Sorting columns with duplicate values (e.g. `ORDER BY created_at DESC`) is non-deterministic unless a unique tie-breaker (such as `id`) is added. Furthermore, `LIMIT/OFFSET` degrades linearly, whereas Keyset pagination remains constant-time O(log N):",
        ],
        code: [
          {
            file: "pagination-comparison.sql",
            lang: "sql",
            code: [
              "-- ANTI-PATTERN: Deep OFFSET (Reads 1,000,020 rows, discards 1,000,000)",
              "-- Latency: 350ms - 2,500ms on 5M rows",
              "SELECT id, title, created_at",
              "FROM tasks",
              "ORDER BY created_at DESC, id DESC",
              "LIMIT 20 OFFSET 1000000;",
              "",
              "-- PRODUCTION STANDARD: Keyset / Cursor Pagination",
              "-- Query for first page:",
              "SELECT id, title, created_at",
              "FROM tasks",
              "WHERE project_id = 'proj-1'",
              "ORDER BY created_at DESC, id DESC",
              "LIMIT 20;",
              "",
              "-- Query for NEXT page (using last item's created_at = '2026-08-20T10:00:00Z' and id = 't-500'):",
              "-- Uses composite index on (project_id, created_at DESC, id DESC) -> Latency: 0.4ms!",
              "SELECT id, title, created_at",
              "FROM tasks",
              "WHERE project_id = 'proj-1'",
              "  AND (created_at, id) < ('2026-08-20T10:00:00Z'::timestamptz, 't-500')",
              "ORDER BY created_at DESC, id DESC",
              "LIMIT 20;",
            ].join("\n"),
            caption: "Row-value comparison `(created_at, id) < ($cursor_time, $cursor_id)` for high-speed cursor pagination.",
          },
        ],
      },
    ],
    mistake: {
      title: "Non-deterministic sorting and default NULL ordering in DESC queries",
      wrong:
        "SELECT * FROM tasks\nORDER BY priority DESC\nLIMIT 20 OFFSET 40;\n-- Problem 1: No tie-breaker. Rows with equal priority swap unpredictably between pages.\n-- Problem 2: NULL priorities sort first by default in DESC, corrupting the list.",
      right:
        "SELECT id, title, priority, created_at FROM tasks\nORDER BY priority DESC NULLS LAST, created_at DESC, id DESC\nLIMIT 20 OFFSET 40;",
      explain:
        "In PostgreSQL, `ORDER BY column DESC` places NULL values at the very top (`NULLS FIRST`) by default. Always specify `NULLS LAST` and include a unique secondary column (`id`) to ensure deterministic page rendering.",
    },
    tryIt: [
      "Write an `INSERT INTO ... ON CONFLICT DO UPDATE` query to synchronize user account stats atomically.",
      "Add a unique secondary tie-breaker (`id`) to every `ORDER BY` clause to guarantee deterministic pagination.",
      "Replace an existing `OFFSET 5000` query with keyset tuple comparison `(created_at, id) < ($last_time, $last_id)`.",
      "Utilize `RETURNING id, updated_at` in an UPDATE statement to save a redundant database SELECT call.",
    ],
    challenge: {
      prompt:
        "Write a complete SQL query that filters tasks by `project_id = $1` and optional `status = $2`, supports cursor pagination via decoded cursor tuple `($cursor_created_at, $cursor_id)`, orders by `created_at DESC, id DESC`, and handles the first page gracefully when cursor parameters are NULL.",
      hints: [
        "Use `($3::timestamptz IS NULL OR (created_at, id) < ($3::timestamptz, $4::uuid))`.",
        "Add `WHERE project_id = $1 AND ($2::task_status IS NULL OR status = $2)`.",
        "Set `LIMIT $5` (requesting limit + 1) so the application can detect if a `hasNextPage` exists without executing a `COUNT(*)` query.",
      ],
      solution: [
        "SELECT id, project_id, title, status, priority, created_at",
        "FROM tasks",
        "WHERE project_id = $1",
        "  AND ($2::text IS NULL OR status = $2::task_status)",
        "  AND (",
        "    $3::timestamptz IS NULL",
        "    OR (created_at, id) < ($3::timestamptz, $4::uuid)",
        "  )",
        "ORDER BY created_at DESC, id DESC",
        "LIMIT $5; -- Fetch limit + 1 (e.g. 21) to check hasNextPage",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary performance drawback of `LIMIT 20 OFFSET 500000` in SQL?",
        options: [
          "PostgreSQL refuses to execute any query with an OFFSET greater than 1000.",
          "The database engine must scan and sort all 500,020 rows into memory and discard 500,000 of them before returning 20.",
          "OFFSET queries automatically lock the entire table with an EXCLUSIVE lock.",
          "The database converts the table into a CSV file in temp storage.",
        ],
        answer: 1,
        explain:
          "OFFSET does not skip disk reads; it reads all rows up to OFFSET + LIMIT and drops the offset rows, causing linear degradation O(N) as page numbers increase.",
      },
      {
        q: "What does the `EXCLUDED` pseudo-table represent in an `INSERT ... ON CONFLICT DO UPDATE` clause?",
        options: [
          "Rows that were permanently deleted from the table.",
          "The proposed values that were submitted in the INSERT statement that caused the conflict.",
          "Columns that were ignored by PostgreSQL validation rules.",
          "Rows rejected by foreign key constraints.",
        ],
        answer: 1,
        explain:
          "`EXCLUDED` contains the exact column values from the `VALUES(...)` clause of the INSERT statement that encountered the UNIQUE/PK conflict.",
      },
      {
        q: "In PostgreSQL, where do NULL values appear by default in an `ORDER BY rating DESC` query?",
        options: [
          "At the very bottom (NULLS LAST).",
          "At the very top (NULLS FIRST).",
          "They are automatically filtered out of the result set.",
          "They trigger a runtime query error.",
        ],
        answer: 1,
        explain:
          "In PostgreSQL, `ASC` defaults to `NULLS LAST`, while `DESC` defaults to `NULLS FIRST`. You must explicitly specify `ORDER BY rating DESC NULLS LAST` if you want NULLs at the end.",
      },
      {
        q: "Why should you fetch `LIMIT N + 1` rows when implementing API pagination?",
        options: [
          "To account for database rounding errors.",
          "To know if a next page exists without running an expensive separate `COUNT(*)` query.",
          "Because PostgreSQL always drops the first row in a result set.",
          "To satisfy HTTP/2 header requirements.",
        ],
        answer: 1,
        explain:
          "If you request 21 rows when the page size is 20, receiving 21 rows proves `hasNextPage = true`. You then return the first 20 rows and generate the cursor from item #20.",
      },
      {
        q: "What is the result of using `RETURNING *` on a `DELETE FROM tasks WHERE project_id = $1` statement?",
        options: [
          "It undoes the deletion and rolls back the transaction.",
          "It returns all rows that were just deleted in the same database round-trip.",
          "It returns only the count of deleted rows as an integer.",
          "It creates a backup table containing deleted rows.",
        ],
        answer: 1,
        explain:
          "`RETURNING *` outputs the exact rows deleted by the DELETE statement, ideal for archiving, audit trails, and cache invalidation.",
      },
      {
        q: "How does row-value comparison `(created_at, id) < ($cursor_time, $cursor_id)` work?",
        options: [
          "It concatenates the timestamp and UUID into a single string.",
          "It compares `created_at < $cursor_time`, or if they are equal, breaks the tie by evaluating `id < $cursor_id`.",
          "It calculates the average of the two fields.",
          "It requires a full table scan.",
        ],
        answer: 1,
        explain:
          "SQL row-value constructors evaluate tuples lexicographically. When backed by a composite index on `(created_at DESC, id DESC)`, the query executes in O(log N) time.",
      },
    ],
    flashcards: [
      {
        front: "What is the purpose of the `RETURNING` clause in PostgreSQL?",
        back: "It returns columns from inserted, updated, or deleted rows directly to the client in the same round-trip, eliminating follow-up SELECT queries.",
      },
      {
        front: "How do you make an `INSERT` statement idempotent in PostgreSQL?",
        back: "Using `INSERT ... ON CONFLICT (unique_column) DO UPDATE SET ...` (or `DO NOTHING`).",
      },
      {
        front: "Why is `ORDER BY created_at DESC` non-deterministic?",
        back: "Multiple rows can share the exact same timestamp. Without a unique secondary tie-breaker like `id`, rows swap positions randomly between queries.",
      },
      {
        front: "What is the performance complexity of Keyset Pagination vs OFFSET Pagination?",
        back: "Keyset pagination is O(log N) constant time using an index; OFFSET pagination is O(N) linear time scanning all discarded rows.",
      },
      {
        front: "How do you control NULL ordering in PostgreSQL SQL?",
        back: "By appending `NULLS FIRST` or `NULLS LAST` to the `ORDER BY` clause (e.g. `ORDER BY score DESC NULLS LAST`).",
      },
      {
        front: "What is the N+1 page detection trick?",
        back: "Requesting `LIMIT limit + 1` from the database. If `results.length > limit`, `hasNextPage` is true, avoiding a costly `COUNT(*)`.",
      },
      {
        front: "What does `COALESCE(val1, val2, ...)` do in SQL?",
        back: "Returns the first non-NULL argument from the provided list.",
      },
      {
        front: "What happens when `EXCLUDED` is used in an ON CONFLICT clause?",
        back: "It references the new column values that were attempted in the INSERT statement that triggered the conflict.",
      },
    ],
    recap: [
      "`RETURNING` clauses eliminate secondary SELECT calls and provide atomic confirmation of database mutations.",
      "`ON CONFLICT DO UPDATE` (UPSERT) guarantees safe idempotent operations without race conditions.",
      "Always enforce deterministic sorting with unique tie-breaker columns and explicit `NULLS LAST` clauses.",
      "Keyset (cursor) pagination maintains fast sub-millisecond query performance regardless of dataset depth.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 7. Queries & Sorting", url: "https://www.postgresql.org/docs/current/queries-order.html" },
      { label: "Use The Index, Luke: Paging Through Huge Result Sets", url: "https://use-the-index-luke.com/sql/partial-results/fetch-next-page" },
      { label: "PostgreSQL Documentation: INSERT ... ON CONFLICT Clause", url: "https://www.postgresql.org/docs/current/sql-insert.html" },
    ],
    nextBridge:
      "Advance to P13-L3 to learn how to join tables across relationships, aggregate metrics with GROUP BY and HAVING, and structure complex multi-step queries with Common Table Expressions (CTEs).",
  },
  {
    id: "p13-l3",
    phaseId: "p13",
    title: "Joins, Subqueries, CTEs & Aggregates",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "Real-world applications rarely query a single isolated table. To build analytics dashboards, project overviews, and relationship-rich feeds, backend engineers must master JOIN mechanics (INNER, LEFT, RIGHT, FULL), aggregation with GROUP BY and FILTER clauses, subqueries, Common Table Expressions (CTEs), and window functions like `ROW_NUMBER()` and `DENSE_RANK()`.",
    prerequisites: [
      "p13-l1 — Relational Modeling & ERDs",
      "p13-l2 — CRUD, Sorting, Filtering & Pagination in SQL",
    ],
    objectives: [
      "Master INNER JOIN, LEFT JOIN, FULL OUTER JOIN, and CROSS JOIN mechanics.",
      "Aggregate project data using `COUNT()`, `SUM()`, `AVG()`, `GROUP BY`, and `HAVING`.",
      "Utilize PostgreSQL `FILTER (WHERE ...)` clauses inside aggregate functions.",
      "Structure multi-stage queries using readable Common Table Expressions (`WITH ... AS`).",
      "Apply Window Functions (`ROW_NUMBER()`, `RANK()`, `PARTITION BY`) for ranking and analytics.",
    ],
    simple:
      "A JOIN is like taking two separate spreadsheets (one with Customers, one with Orders) and lining them up side-by-side using the Customer ID. A CTE (`WITH project_stats AS (...)`) is like creating a neat temporary named whiteboard calculation that you can reference in your final report.",
    why:
      "Executing 5 separate queries in Node.js loops to compute project statistics causes severe N+1 latency spikes over network connections. Doing the aggregation directly in PostgreSQL with a single CTE or GROUP BY query executes in 2ms in C-optimized database memory.",
    mentalModel: {
      title: "The Venn Diagram & The Pipeline Stages",
      body: "Think of JOINs as set operations matching keys across tables. INNER JOIN keeps only matching rows; LEFT JOIN keeps all left rows and fills unmatched right fields with NULL. CTEs are linear pipeline stages: Stage 1 filters and aggregates; Stage 2 formats and joins the clean intermediate result.",
    },
    sections: [
      {
        heading: "Visualizing JOIN Types in PostgreSQL",
        body: [
          "Understanding the exact set semantics of each join type prevents data loss or accidental row duplication:",
        ],
        code: [
          {
            file: "joins-masterclass.sql",
            lang: "sql",
            code: [
              "-- 1. INNER JOIN: Returns only projects that have assigned tasks",
              "SELECT p.id, p.name, t.title AS task_title",
              "FROM projects p",
              "INNER JOIN tasks t ON t.project_id = p.id;",
              "",
              "-- 2. LEFT JOIN: Returns ALL projects, even those with 0 tasks (t.id will be NULL)",
              "SELECT p.id, p.name, t.title AS task_title",
              "FROM projects p",
              "LEFT JOIN tasks t ON t.project_id = p.id;",
              "",
              "-- 3. Find projects with ZERO tasks (Anti-Join pattern)",
              "SELECT p.id, p.name",
              "FROM projects p",
              "LEFT JOIN tasks t ON t.project_id = p.id",
              "WHERE t.id IS NULL;",
              "",
              "-- 4. Many-to-Many Multi-Join: Task with all assigned Tag names",
              "SELECT t.id, t.title, STRING_AGG(tg.name, ', ') AS tag_list",
              "FROM tasks t",
              "LEFT JOIN task_tags tt ON tt.task_id = t.id",
              "LEFT JOIN tags tg ON tg.id = tt.tag_id",
              "GROUP BY t.id, t.title;",
            ].join("\n"),
            caption: "Core JOIN patterns: Inner, Left, Anti-Join, and Many-to-Many traversal.",
          },
        ],
      },
      {
        heading: "Aggregates, GROUP BY & The Modern FILTER Clause",
        body: [
          "Traditional SQL requires cumbersome `CASE WHEN` statements inside aggregates. PostgreSQL offers the clean, optimized `FILTER (WHERE ...)` syntax:",
        ],
        code: [
          {
            file: "aggregates-and-filters.sql",
            lang: "sql",
            code: [
              "-- Project Performance Dashboard in ONE Query",
              "SELECT",
              "    p.id AS project_id,",
              "    p.name AS project_name,",
              "    COUNT(t.id) AS total_tasks,",
              "    -- Modern PostgreSQL FILTER clause:",
              "    COUNT(t.id) FILTER (WHERE t.status = 'DONE') AS completed_tasks,",
              "    COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') AS in_progress_tasks,",
              "    COUNT(t.id) FILTER (WHERE t.priority = 'URGENT' AND t.status != 'DONE') AS open_urgent_tasks,",
              "    ROUND(",
              "      (COUNT(t.id) FILTER (WHERE t.status = 'DONE')::numeric / NULLIF(COUNT(t.id), 0)) * 100,",
              "      1",
              "    ) AS completion_percentage",
              "FROM projects p",
              "LEFT JOIN tasks t ON t.project_id = p.id",
              "GROUP BY p.id, p.name",
              "HAVING COUNT(t.id) > 0 -- Only show active projects with at least 1 task",
              "ORDER BY open_urgent_tasks DESC, total_tasks DESC;",
            ].join("\n"),
            caption: "Single-query aggregation using GROUP BY, FILTER (WHERE ...), and NULLIF.",
          },
        ],
      },
      {
        heading: "Common Table Expressions (CTEs) & Window Functions",
        body: [
          "CTEs (`WITH ...`) break complex nesting into readable pipeline steps. Window functions compute running totals and rankings without collapsing rows:",
        ],
        code: [
          {
            file: "ctes-and-window-functions.sql",
            lang: "sql",
            code: [
              "-- Objective: Find the top 3 most recent tasks per project",
              "WITH ranked_tasks AS (",
              "    SELECT",
              "        t.id,",
              "        t.project_id,",
              "        t.title,",
              "        t.created_at,",
              "        -- Assign a rank 1, 2, 3... within each project partition",
              "        ROW_NUMBER() OVER (",
              "            PARTITION BY t.project_id",
              "            ORDER BY t.created_at DESC",
              "        ) as task_rank",
              "    FROM tasks t",
              "    WHERE t.status != 'DONE'",
              ")",
              "SELECT",
              "    p.name AS project_name,",
              "    rt.title AS task_title,",
              "    rt.created_at,",
              "    rt.task_rank",
              "FROM ranked_tasks rt",
              "JOIN projects p ON p.id = rt.project_id",
              "WHERE rt.task_rank <= 3",
              "ORDER BY p.name ASC, rt.task_rank ASC;",
            ].join("\n"),
            caption: "Using CTEs and ROW_NUMBER() OVER (PARTITION BY) for top-N ranking queries.",
          },
        ],
      },
    ],
    mistake: {
      title: "Accidental conversion of LEFT JOIN into INNER JOIN via WHERE clause",
      wrong:
        "SELECT p.name, COUNT(t.id) as task_count\nFROM projects p\nLEFT JOIN tasks t ON t.project_id = p.id\nWHERE t.status = 'DONE' -- Filters out projects with 0 done tasks before LEFT JOIN completes!\nGROUP BY p.name;",
      right:
        "SELECT p.name, COUNT(t.id) FILTER (WHERE t.status = 'DONE') as done_task_count\nFROM projects p\nLEFT JOIN tasks t ON t.project_id = p.id\nGROUP BY p.name;",
      explain:
        "Placing a WHERE clause on a LEFT JOINed table turns the query into an accidental INNER JOIN because `WHERE t.status = 'DONE'` drops rows where `t.status` is NULL. Use `FILTER (WHERE ...)` on the aggregate or move the predicate into the `ON` clause.",
    },
    tryIt: [
      "Write a query combining `COUNT(*)`, `SUM()`, and `FILTER (WHERE ...)` to compute a project overview.",
      "Implement an Anti-Join using `LEFT JOIN` and `WHERE right_table.id IS NULL` to find inactive records.",
      "Structure a multi-step data transformation using a Common Table Expression (`WITH cte AS (...)`).",
      "Use `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` to select the latest 5 records per department.",
    ],
    challenge: {
      prompt:
        "Construct a CTE-based SQL query that analyzes user productivity. The query must calculate for each user: total assigned tasks, tasks completed this month (`updated_at >= date_trunc('month', NOW())`), overdue tasks (`due_date < NOW() AND status != 'DONE'`), and their productivity rank across the company using `DENSE_RANK()`.",
      hints: [
        "Use `date_trunc('month', NOW())` to get the start of the current month.",
        "Compute user metrics in a CTE named `user_metrics`.",
        "Apply `DENSE_RANK() OVER (ORDER BY completed_this_month DESC)` in the outer query.",
      ],
      solution: [
        "WITH user_metrics AS (",
        "    SELECT",
        "        u.id AS user_id,",
        "        u.full_name,",
        "        u.email,",
        "        COUNT(t.id) AS total_assigned,",
        "        COUNT(t.id) FILTER (",
        "            WHERE t.status = 'DONE'",
        "              AND t.updated_at >= date_trunc('month', NOW())",
        "        ) AS completed_this_month,",
        "        COUNT(t.id) FILTER (",
        "            WHERE t.due_date < NOW()",
        "              AND t.status != 'DONE'",
        "        ) AS overdue_tasks",
        "    FROM users u",
        "    LEFT JOIN tasks t ON t.assignee_id = u.id",
        "    GROUP BY u.id, u.full_name, u.email",
        ")",
        "SELECT",
        "    user_id,",
        "    full_name,",
        "    email,",
        "    total_assigned,",
        "    completed_this_month,",
        "    overdue_tasks,",
        "    DENSE_RANK() OVER (ORDER BY completed_this_month DESC) AS company_rank",
        "FROM user_metrics",
        "ORDER BY company_rank ASC, total_assigned DESC;",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What happens when you put a `WHERE right_table.column = 'val'` condition on a query that uses a `LEFT JOIN`?",
        options: [
          "The query executes twice as fast.",
          "It implicitly converts the LEFT JOIN into an INNER JOIN, eliminating rows from the left table where the right table was NULL.",
          "PostgreSQL throws an ambiguous column exception.",
          "The right table returns empty strings instead of NULL.",
        ],
        answer: 1,
        explain:
          "Because the WHERE filter evaluates after the join, any row where right_table is NULL fails `column = 'val'`, turning the LEFT JOIN into an INNER JOIN.",
      },
      {
        q: "What is the key advantage of PostgreSQL's `COUNT(t.id) FILTER (WHERE t.status = 'DONE')` syntax?",
        options: [
          "It allows conditional aggregation in a single pass without verbose `CASE WHEN` constructs.",
          "It indexes the result in temporary disk space.",
          "It bypasses the need for a GROUP BY clause.",
          "It converts the result into an array.",
        ],
        answer: 0,
        explain:
          "The `FILTER (WHERE ...)` clause is clean, standard SQL that applies conditional logic directly to the aggregate function during the grouping scan.",
      },
      {
        q: "What is the difference between `ROW_NUMBER()` and `DENSE_RANK()` in window functions?",
        options: [
          "`ROW_NUMBER()` only works on integer primary keys.",
          "`ROW_NUMBER()` assigns sequential unique integers (1, 2, 3, 4) even for ties, while `DENSE_RANK()` assigns the same rank to identical values without skipping numbers (1, 2, 2, 3).",
          "`DENSE_RANK()` sorts in ascending order while `ROW_NUMBER()` sorts in descending order.",
          "`ROW_NUMBER()` groups rows into partitions, while `DENSE_RANK()` cannot.",
        ],
        answer: 1,
        explain:
          "`ROW_NUMBER()` guarantees distinct ordinal numbers, whereas `DENSE_RANK()` gives tied records the same rank and numbers the next distinct value immediately sequentially.",
      },
      {
        q: "What does `NULLIF(COUNT(t.id), 0)` do when calculating percentages in SQL?",
        options: [
          "It throws an error if count is 0.",
          "It returns NULL if the count is 0, preventing runtime division-by-zero errors (`division by zero`).",
          "It replaces NULL values with the number 0.",
          "It casts the integer to a floating point number.",
        ],
        answer: 1,
        explain:
          "`NULLIF(a, b)` returns NULL if `a == b`. When dividing by `NULLIF(count, 0)`, dividing by NULL yields NULL instead of a catastrophic SQL `division by zero` error.",
      },
      {
        q: "What is a Common Table Expression (CTE) defined with `WITH`?",
        options: [
          "A permanent physical view stored in the database catalog.",
          "A named temporary result set scoped strictly to the execution of a single query.",
          "A stored procedure that compiles to WebAssembly.",
          "A database user permission grant.",
        ],
        answer: 1,
        explain:
          "A CTE exists only during query execution, making complex multi-step joins, aggregations, and recursive queries readable and modular.",
      },
      {
        q: "How do you find all users who have NEVER created a project using a JOIN?",
        options: [
          "SELECT u.* FROM users u INNER JOIN projects p ON p.owner_id = u.id WHERE p.id IS NULL;",
          "SELECT u.* FROM users u LEFT JOIN projects p ON p.owner_id = u.id WHERE p.id IS NULL;",
          "SELECT u.* FROM users u CROSS JOIN projects p WHERE u.id != p.owner_id;",
          "SELECT u.* FROM users u RIGHT JOIN projects p ON p.owner_id = u.id;",
        ],
        answer: 1,
        explain:
          "This is the Anti-Join pattern: A LEFT JOIN pairs all users with their projects. Where no project exists, `p.id` is NULL. Filtering `WHERE p.id IS NULL` selects only users with zero projects.",
      },
    ],
    flashcards: [
      {
        front: "What is an Anti-Join in SQL?",
        back: "A `LEFT JOIN` combined with `WHERE right_table.id IS NULL`, returning rows from the left table that have NO matches in the right table.",
      },
      {
        front: "What is the difference between `WHERE` and `HAVING`?",
        back: "`WHERE` filters individual rows BEFORE aggregation; `HAVING` filters aggregated group results AFTER `GROUP BY`.",
      },
      {
        front: "How does the `FILTER (WHERE ...)` clause work in PostgreSQL aggregates?",
        back: "It evaluates the aggregate function ONLY on rows satisfying the filter condition (e.g. `COUNT(*) FILTER (WHERE status = 'DONE')`).",
      },
      {
        front: "What does `PARTITION BY` do inside an `OVER (...)` window clause?",
        back: "It divides query result rows into groups/partitions over which the window function operates independently.",
      },
      {
        front: "How do you prevent a `division by zero` error in SQL calculations?",
        back: "Wrap the denominator with `NULLIF(denominator, 0)`. Any division by NULL safely evaluates to NULL.",
      },
      {
        front: "What is a Common Table Expression (CTE)?",
        back: "A temporary named result set defined using `WITH name AS (...)` that modularizes complex SQL logic within a single query.",
      },
      {
        front: "What does `STRING_AGG(expression, delimiter)` do?",
        back: "An aggregate function that concatenates non-null string values from grouped rows into a single delimited string.",
      },
      {
        front: "What is the difference between `RANK()` and `DENSE_RANK()`?",
        back: "`RANK()` skips rank numbers after a tie (e.g. 1, 2, 2, 4); `DENSE_RANK()` does not skip numbers (e.g. 1, 2, 2, 3).",
      },
    ],
    recap: [
      "INNER JOIN filters for matching pairs; LEFT JOIN preserves all left-table records; Anti-Joins find records with zero associations.",
      "`FILTER (WHERE ...)` enables elegant multi-metric aggregations in a single database pass.",
      "CTEs (`WITH`) transform complex nested subqueries into clean, readable linear pipelines.",
      "Window functions (`ROW_NUMBER`, `DENSE_RANK`) allow powerful per-partition ranking without collapsing row granularity.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 7. Queries — Table Expressions & CTEs", url: "https://www.postgresql.org/docs/current/queries-table-expressions.html" },
      { label: "Modern SQL: Window Functions in Depth", url: "https://modern-sql.com/feature/over" },
      { label: "PostgreSQL Documentation: Chapter 9. Aggregate Functions & FILTER Clause", url: "https://www.postgresql.org/docs/current/functions-aggregate.html" },
    ],
    nextBridge:
      "Proceed to P13-L4 to master Transactions, Isolation Levels (Read Committed, Serializable), and row-level concurrency locking (`SELECT ... FOR UPDATE`).",
  },
];

export const LESSON_CONTENT_P13: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P13.map((l) => [l.id, l])
);
