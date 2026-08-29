import type { LessonContent } from "./types";

/**
 * Phase 13 PostgreSQL Zero to Mastery (L4–L6).
 * Every lesson fulfills the full quality contract.
 */
export const LESSONS_P13B: LessonContent[] = [
  {
    id: "p13-l4",
    phaseId: "p13",
    title: "Transactions, Isolation & Locks",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "Data consistency in concurrent backends depends on understanding database transactions and isolation guarantees. Under concurrent user traffic, naive code causes race conditions, double-spend bugs, lost updates, and phantom reads. This lesson breaks down ACID guarantees, PostgreSQL's MVCC (Multi-Version Concurrency Control), the four ANSI isolation levels, and explicit row-level locking strategies using `SELECT ... FOR UPDATE` and `SKIP LOCKED`.",
    prerequisites: [
      "p13-l2 — CRUD, Sorting, Filtering & Pagination in SQL",
      "p13-l3 — Joins, Subqueries, CTEs & Aggregates",
    ],
    objectives: [
      "Master ACID guarantees: Atomicity, Consistency, Isolation, and Durability.",
      "Understand PostgreSQL Multi-Version Concurrency Control (MVCC) and snapshot isolation.",
      "Identify concurrency anomalies: Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Lost Updates.",
      "Select the right transaction isolation level: Read Committed vs Repeatable Read vs Serializable.",
      "Prevent race conditions using pessimistic locking (`SELECT ... FOR UPDATE`) and build job queues with `SKIP LOCKED`.",
    ],
    simple:
      "A database transaction is like sending money between bank accounts: withdrawing $100 from Alice and depositing $100 into Bob must happen together as one indivisible step. If the server loses power midway, the database rolls back so Alice doesn't lose her money. Row locking is like putting a physical padlock on a ticket while a customer enters their credit card so two people cannot buy the same concert seat simultaneously.",
    why:
      "In high-concurrency Node.js microservices, multiple requests hit the database at the exact same millisecond. If you check balance with a regular SELECT and then UPDATE in a second step, concurrent requests will double-spend or double-book resources. Understanding locks and isolation levels prevents devastating financial and inventory bugs.",
    mentalModel: {
      title: "The Multi-Version Time Capsule & The Exclusive Baton",
      body: "PostgreSQL uses MVCC: readers never block writers, and writers never block readers. Every query sees a consistent 'time-capsule snapshot' of the database at the moment the statement began. However, when multiple writers attempt to mutate the same row, they must take turns passing an exclusive row-level lock baton (`FOR UPDATE`).",
    },
    sections: [
      {
        heading: "ACID Fundamentals & Transaction Blocks",
        body: [
          "A transaction bundles multiple SQL statements into an all-or-nothing execution block using `BEGIN`, `COMMIT`, and `ROLLBACK`:",
        ],
        code: [
          {
            file: "transactions-basic.sql",
            lang: "sql",
            code: [
              "-- Financial Transfer Transaction",
              "BEGIN;",
              "",
              "-- 1. Debit Alice's account",
              "UPDATE accounts",
              "SET balance_cents = balance_cents - 5000",
              "WHERE id = 'acc-alice' AND balance_cents >= 5000;",
              "",
              "-- Verify that 1 row was updated (if 0 rows updated, throw error and ROLLBACK in application code)",
              "",
              "-- 2. Credit Bob's account",
              "UPDATE accounts",
              "SET balance_cents = balance_cents + 5000",
              "WHERE id = 'acc-bob';",
              "",
              "-- 3. Record Audit Ledger Entry",
              "INSERT INTO transfers (from_account, to_account, amount_cents, status)",
              "VALUES ('acc-alice', 'acc-bob', 5000, 'COMPLETED');",
              "",
              "-- 4. Atomically commit all mutations to disk",
              "COMMIT;",
            ].join("\n"),
            caption: "Classic multi-step ACID transaction ensuring balance preservation.",
          },
        ],
      },
      {
        heading: "Concurrency Anomalies & Isolation Levels",
        body: [
          "PostgreSQL supports three effective ANSI isolation levels. Knowing when each is necessary is critical for high-stakes business logic:",
          "• Read Committed (Default): Queries see only committed data. Each statement takes a new snapshot. Vulnerable to non-repeatable reads and lost updates.",
          "• Repeatable Read: The transaction takes ONE snapshot at the start. Cannot see changes committed by concurrent transactions. Prevents non-repeatable & phantom reads. Throws serialization failure on concurrent row updates.",
          "• Serializable: Strictest level. Simulates serial sequential execution using SSI (Serializable Snapshot Isolation). Guarantees zero anomalies but requires retry loops on serialization conflict (`SQLSTATE 40001`).",
        ],
        code: [
          {
            file: "isolation-levels.sql",
            lang: "sql",
            code: [
              "-- Setting isolation level for a sensitive financial transaction",
              "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;",
              "",
              "-- All SELECT queries within this block see the exact same snapshot of the database,",
              "-- even if another transaction commits 1,000 new rows while this query runs.",
              "SELECT SUM(balance_cents) FROM accounts WHERE organization_id = 'org-1';",
              "SELECT COUNT(*) FROM transactions WHERE organization_id = 'org-1';",
              "",
              "COMMIT;",
            ].join("\n"),
            caption: "Enforcing Repeatable Read for consistent multi-query financial reporting.",
          },
        ],
      },
      {
        heading: "Pessimistic Row-Level Locking (`FOR UPDATE` & `SKIP LOCKED`)",
        body: [
          "To prevent race conditions on shared inventory or balance calculations, lock rows explicitly during the read:",
        ],
        code: [
          {
            file: "locking-patterns.sql",
            lang: "sql",
            code: [
              "-- 1. Preventing Double-Booking on Inventory / Seats",
              "BEGIN;",
              "",
              "-- Lock the row exclusively; any concurrent transaction trying to read this seat FOR UPDATE will wait",
              "SELECT id, seat_number, is_reserved",
              "FROM concert_seats",
              "WHERE id = 'seat-104' AND is_reserved = false",
              "FOR UPDATE; -- Acquires RowExclusiveLock",
              "",
              "-- Perform application validation...",
              "UPDATE concert_seats",
              "SET is_reserved = true, reserved_by = 'usr-911'",
              "WHERE id = 'seat-104';",
              "",
              "COMMIT; -- Releases lock immediately",
              "",
              "-- 2. High-Throughput Job Queue Pattern (PostgreSQL as RabbitMQ/Redis)",
              "-- Worker grabs 1 pending job without blocking other parallel workers!",
              "BEGIN;",
              "",
              "SELECT id, payload, retry_count",
              "FROM background_jobs",
              "WHERE status = 'PENDING'",
              "ORDER BY scheduled_at ASC",
              "LIMIT 1",
              "FOR UPDATE SKIP LOCKED; -- Skips rows currently locked by other concurrent workers",
              "",
              "UPDATE background_jobs",
              "SET status = 'PROCESSING', started_at = NOW()",
              "WHERE id = $selected_job_id;",
              "",
              "COMMIT;",
            ].join("\n"),
            caption: "Using FOR UPDATE for inventory locks and FOR UPDATE SKIP LOCKED for parallel job workers.",
          },
        ],
      },
    ],
    mistake: {
      title: "Separating SELECT validation from UPDATE in concurrent endpoints (TOCTOU race)",
      wrong:
        "const item = await db.query('SELECT stock FROM items WHERE id = $1', [itemId]);\nif (item.stock > 0) {\n  // 5 concurrent requests all see stock = 1 and oversell!\n  await db.query('UPDATE items SET stock = stock - 1 WHERE id = $1', [itemId]);\n}",
      right:
        "const result = await db.query(\n  'UPDATE items SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock',\n  [itemId]\n);\nif (result.rowCount === 0) throw new Error('Out of stock');",
      explain:
        "Separating the SELECT check from the UPDATE creates a Time-of-Check to Time-of-Use (TOCTOU) race condition. Either execute an atomic conditional UPDATE with RETURNING, or wrap in a transaction with SELECT ... FOR UPDATE.",
    },
    tryIt: [
      "Wrap a multi-table mutation in a `BEGIN; ... COMMIT;` transaction block.",
      "Use `SELECT ... FOR UPDATE` to lock a specific resource before executing an inventory balance check.",
      "Implement a queue worker polling loop utilizing `FOR UPDATE SKIP LOCKED`.",
      "Test concurrency by firing 10 parallel HTTP requests against a limited stock item.",
    ],
    challenge: {
      prompt:
        "Write a robust SQL transaction that reserves a concert seat for a user. It must lock the seat row, verify that `is_reserved = false`, mark it as reserved, record an entry in `seat_reservations`, and handle concurrency safely without deadlock.",
      hints: [
        "Use `SELECT id, price_cents FROM seats WHERE event_id = $1 AND seat_code = $2 FOR UPDATE`.",
        "Update the seat status only if the lock confirms it is unreserved.",
        "Insert the reservation with user ID and ticket price.",
      ],
      solution: [
        "BEGIN;",
        "",
        "-- 1. Acquire exclusive lock on the requested seat",
        "SELECT id, is_reserved, price_cents",
        "FROM event_seats",
        "WHERE event_id = $1 AND seat_number = $2",
        "FOR UPDATE;",
        "",
        "-- 2. If row was found and is_reserved is false, execute update:",
        "UPDATE event_seats",
        "SET is_reserved = true,",
        "    reserved_by = $3,",
        "    reserved_at = NOW()",
        "WHERE event_id = $1 AND seat_number = $2 AND is_reserved = false;",
        "",
        "-- 3. Insert reservation audit record",
        "INSERT INTO ticket_reservations (seat_id, user_id, amount_cents, status)",
        "SELECT id, $3, price_cents, 'CONFIRMED'",
        "FROM event_seats",
        "WHERE event_id = $1 AND seat_number = $2 AND reserved_by = $3;",
        "",
        "COMMIT;",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What does `SELECT ... FOR UPDATE SKIP LOCKED` do in PostgreSQL?",
        options: [
          "It forces all other transactions to immediately abort.",
          "It locks matching rows, but if a row is already locked by another transaction, it skips past it instead of waiting in a blocking queue.",
          "It ignores all table constraints.",
          "It unlocks all rows currently held by the user.",
        ],
        answer: 1,
        explain:
          "`SKIP LOCKED` is the gold standard for concurrency queues: multiple workers can poll the same table simultaneously without waiting or blocking each other, each locking a distinct available row.",
      },
      {
        q: "Why does PostgreSQL's MVCC (Multi-Version Concurrency Control) ensure that readers do not block writers?",
        options: [
          "PostgreSQL disables transactions for read queries.",
          "When a writer updates a row, PostgreSQL creates a new row version (tuple); readers continue reading the previous committed version snapshot.",
          "PostgreSQL duplicates the entire database for every connected client.",
          "PostgreSQL converts all tables to memory-only temporary tables.",
        ],
        answer: 1,
        explain:
          "Under MVCC, mutations create new tuple versions rather than overwriting in-place. Readers read older committed versions corresponding to their transaction snapshot without acquiring read locks.",
      },
      {
        q: "What is a 'Lost Update' concurrency anomaly?",
        options: [
          "When a database server crashes before data is written to disk.",
          "When two concurrent transactions read the same initial value and both write back new values, with the second transaction overwriting the first transaction's changes without seeing them.",
          "When a column is dropped during an active query.",
          "When a foreign key pointer refers to a deleted row.",
        ],
        answer: 1,
        explain:
          "A Lost Update occurs when Transaction A and B both read a value (e.g. counter = 10) and both increment it to 11 and save. The final count is 11 instead of 12 because B overwrote A's update.",
      },
      {
        q: "What must your application do when operating at the `SERIALIZABLE` isolation level if PostgreSQL throws error code `40001` (`could not serialize access`)?",
        options: [
          "Drop and recreate the table.",
          "Catch the serialization error in application code and retry the entire transaction from the beginning.",
          "Switch the server to single-threaded mode.",
          "Ignore the error and assume the write succeeded.",
        ],
        answer: 1,
        explain:
          "Serializable isolation detects overlapping dependency cycles and intentionally aborts one of the conflicting transactions with error `40001`. Applications using serializable isolation must implement exponential backoff retry loops.",
      },
      {
        q: "What is the key difference between `FOR UPDATE` and `FOR SHARE` locks in SQL?",
        options: [
          "`FOR UPDATE` locks the table schema; `FOR SHARE` locks user passwords.",
          "`FOR UPDATE` acquires an exclusive lock preventing other transactions from updating or locking the row; `FOR SHARE` acquires a shared lock that allows other transactions to also read/lock with `FOR SHARE` but prevents updates.",
          "`FOR SHARE` permits all transactions to delete the row.",
          "`FOR UPDATE` automatically commits the transaction.",
        ],
        answer: 1,
        explain:
          "`FOR UPDATE` is an exclusive write lock. `FOR SHARE` is a shared read lock: multiple readers can hold `FOR SHARE` simultaneously, but no writer can acquire `FOR UPDATE` until all share locks are released.",
      },
      {
        q: "What does the 'Durability' property of ACID guarantee?",
        options: [
          "Queries will never take longer than 100 milliseconds.",
          "Once a transaction commits, its changes are permanently recorded in non-volatile storage (via the Write-Ahead Log / WAL) and will survive server crashes or power failures.",
          "Tables can store an infinite number of rows.",
          "Foreign keys can never be modified.",
        ],
        answer: 1,
        explain:
          "Durability ensures that once `COMMIT` returns success, data has been safely flushed to the Write-Ahead Log (WAL) on disk, guaranteeing survivability through sudden hardware or power failure.",
      },
    ],
    flashcards: [
      {
        front: "What are the four ACID properties of relational databases?",
        back: "Atomicity (all-or-nothing), Consistency (rules/constraints enforced), Isolation (concurrency control), Durability (survives crashes via WAL).",
      },
      {
        front: "What is MVCC (Multi-Version Concurrency Control)?",
        back: "A database architecture where updates create new versions of rows, allowing readers and writers to operate concurrently without blocking one another.",
      },
      {
        front: "What does `SELECT ... FOR UPDATE` do?",
        back: "Acquires an exclusive row-level lock on matching rows until the transaction ends, preventing concurrent transactions from modifying or locking them.",
      },
      {
        front: "Why is `FOR UPDATE SKIP LOCKED` used for task/job queues?",
        back: "It allows multiple concurrent worker processes to pick and lock unassigned jobs instantly without waiting behind each other.",
      },
      {
        front: "What is a Dirty Read?",
        back: "When a transaction reads uncommitted changes made by another concurrently running transaction that might later be rolled back.",
      },
      {
        front: "What is a Non-Repeatable Read?",
        back: "When a transaction reads the same row twice and gets different column values because another transaction committed an update in between.",
      },
      {
        front: "What is PostgreSQL's default transaction isolation level?",
        back: "`Read Committed` — each SQL statement sees only data committed before that statement began.",
      },
      {
        front: "What error code indicates a serialization failure in PostgreSQL?",
        back: "`40001` (`serialization_failure`) — signaling that the application should retry the transaction.",
      },
    ],
    recap: [
      "Transactions guarantee all-or-nothing atomicity and crash-resilient durability via the Write-Ahead Log.",
      "PostgreSQL MVCC ensures readers never block writers and writers never block readers.",
      "Prevent race conditions and double-spending by utilizing atomic SQL statements or `SELECT ... FOR UPDATE`.",
      "`FOR UPDATE SKIP LOCKED` enables production-grade high-throughput background job processing directly in PostgreSQL.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 13. Concurrency Control & MVCC", url: "https://www.postgresql.org/docs/current/mvcc.html" },
      { label: "PostgreSQL Documentation: Explicit Locking & SKIP LOCKED", url: "https://www.postgresql.org/docs/current/explicit-locking.html" },
      { label: "PostgreSQL Documentation: Transaction Isolation Levels", url: "https://www.postgresql.org/docs/current/transaction-iso.html" },
    ],
    nextBridge:
      "Proceed to P13-L5 to master PostgreSQL Indexes (B-Tree, Composite, Partial) and become literate in reading `EXPLAIN (ANALYZE, BUFFERS)` execution plans.",
  },
  {
    id: "p13-l5",
    phaseId: "p13",
    title: "Indexes & Reading EXPLAIN",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Database performance is defined by index strategy and query plan comprehension. Blindly adding indexes bloats write latency and disk space, while missing indexes forces costly sequential table scans across millions of rows. In this lesson, you will master B-Tree mechanics, composite index ordering (the Leading Column Rule), partial indexes, expression indexes, and become fully literate in reading `EXPLAIN (ANALYZE, BUFFERS)` trees.",
    prerequisites: [
      "p13-l2 — CRUD, Sorting, Filtering & Pagination in SQL",
      "p13-l3 — Joins, Subqueries, CTEs & Aggregates",
    ],
    objectives: [
      "Understand B-Tree index anatomy and O(log N) lookup mechanics.",
      "Apply the Leading Column Rule for composite indexes `(a, b, c)`.",
      "Create high-efficiency Partial Indexes (`WHERE is_archived = false`) and Functional Indexes (`LOWER(email)`).",
      "Interpret `EXPLAIN (ANALYZE, BUFFERS)` execution plans: Seq Scan, Index Scan, and Bitmap Heap Scan.",
      "Diagnose buffer cache misses, cost estimations, and filter overhead.",
    ],
    simple:
      "A database table without an index is like a 1,000-page book with no table of contents or index in the back: to find a recipe for 'Lasagna', you must read every single page from page 1 to 1,000 (Sequential Scan). A B-Tree index is the alphabetical index at the back: you jump directly to letter 'L', find 'Lasagna: page 412', and flip straight to that exact page (Index Scan) in 0.2 milliseconds.",
    why:
      "When a startup grows from 1,000 users to 1,000,000 users, unindexed queries that used to take 2ms suddenly take 1,500ms, maxing out CPU cores and exhausting connection pools. Reading EXPLAIN plans allows you to pinpoint the exact bottleneck in seconds.",
    mentalModel: {
      title: "The B-Tree Directory & The Heap Tuple Pointer",
      body: "An index is a sorted B-Tree structure stored separately from the table heap. The leaf nodes of the B-Tree store the indexed values along with a 6-byte Tuple ID pointer `(block_number, offset)` pointing to the exact physical disk location of the row in the table heap.",
    },
    sections: [
      {
        heading: "B-Tree Anatomy & The Leading Column Rule",
        body: [
          "B-Trees store keys in sorted order. For composite indexes with multiple columns `(colA, colB, colC)`, the index is sorted by `colA` first, then `colB`, then `colC`:",
        ],
        code: [
          {
            file: "composite-indexes.sql",
            lang: "sql",
            code: [
              "-- Create composite index on project_id and status",
              "CREATE INDEX idx_tasks_project_status ON tasks(project_id, status, created_at DESC);",
              "",
              "-- 1. FAST (Index Scan): Uses leading column `project_id` and second column `status`",
              "SELECT id, title FROM tasks",
              "WHERE project_id = 'p-100' AND status = 'IN_PROGRESS'",
              "ORDER BY created_at DESC;",
              "",
              "-- 2. FAST (Index Scan): Uses leading column `project_id` alone",
              "SELECT id, title FROM tasks",
              "WHERE project_id = 'p-100';",
              "",
              "-- 3. SLOW (Sequential Scan): Skips the leading column `project_id`!",
              "-- The database CANNOT use this index efficiently for a query filtering only on `status`!",
              "SELECT id, title FROM tasks",
              "WHERE status = 'IN_PROGRESS'; -- Forces Seq Scan across whole table",
            ].join("\n"),
            caption: "The Leading Column Rule: Queries MUST filter on the leftmost indexed column to use the B-Tree.",
          },
        ],
      },
      {
        heading: "Partial & Expression (Functional) Indexes",
        body: [
          "Why index millions of archived or historical rows when queries only search active items? Partial indexes save 90% of index RAM and disk space:",
        ],
        code: [
          {
            file: "specialized-indexes.sql",
            lang: "sql",
            code: [
              "-- 1. Partial Index: Index ONLY active (non-archived) tasks",
              "-- Table: 10,000,000 total rows. Active rows: 100,000 (1%).",
              "-- Index size: 4MB instead of 400MB! Writes to archived tasks don't touch this index.",
              "CREATE INDEX idx_tasks_active_priority",
              "ON tasks(priority, created_at DESC)",
              "WHERE is_archived = false AND status != 'DONE';",
              "",
              "-- 2. Expression / Functional Index: Case-insensitive email lookups",
              "-- Query: WHERE LOWER(email) = 'alex@example.com'",
              "CREATE UNIQUE INDEX idx_users_lower_email",
              "ON users(LOWER(email));",
              "",
              "-- 3. Covering Index (INCLUDE clause - PostgreSQL 11+)",
              "-- Adds payload columns to the leaf nodes to enable Index-Only Scans (zero heap reads!)",
              "CREATE INDEX idx_tasks_covering",
              "ON tasks(project_id, status)",
              "INCLUDE (title, assignee_id);",
            ].join("\n"),
            caption: "Partial, Expression, and Covering Indexes for maximum throughput.",
          },
        ],
      },
      {
        heading: "Mastering `EXPLAIN (ANALYZE, BUFFERS)`",
        demo: "sql-explain-lab",
        body: [
          "Running `EXPLAIN` without `ANALYZE` only shows the planner's mathematical guesses. `EXPLAIN (ANALYZE, BUFFERS)` actually runs the query and outputs real execution times and disk/RAM buffer hits:",
        ],
        code: [
          {
            file: "explain-breakdown.sql",
            lang: "sql",
            code: [
              "-- Diagnostic Command:",
              "EXPLAIN (ANALYZE, BUFFERS, TIMING, COSTS)",
              "SELECT id, title, created_at",
              "FROM tasks",
              "WHERE project_id = 'proj-419b' AND status = 'IN_PROGRESS'",
              "ORDER BY created_at DESC",
              "LIMIT 20;",
              "",
              "-- Reading the Output Anatomy:",
              "-- 1. `Seq Scan` vs `Index Scan` vs `Bitmap Heap Scan`:",
              "--    - Seq Scan: Read entire table from disk. Costly on large tables.",
              "--    - Index Scan: Traversed B-Tree to find rows directly.",
              "--    - Index Only Scan: Found all required columns directly in the index leaf pages without touching the heap table at all!",
              "-- 2. `cost=0.42..8.44`: Estimated startup cost (0.42) and total cost (8.44) in arbitrary disk page fetch units.",
              "-- 3. `actual time=0.04..0.38 rows=20 loops=1`: Real runtime (0.38ms).",
              "-- 4. `Buffers: shared hit=4`: Read 4 pages (32KB) directly from PostgreSQL RAM buffer cache. Zero disk I/O!",
            ].join("\n"),
            caption: "Key metrics inside EXPLAIN (ANALYZE, BUFFERS) execution output.",
          },
        ],
      },
    ],
    mistake: {
      title: "Wrapping indexed columns in functions during WHERE filtering",
      wrong:
        "-- Query: SELECT * FROM users WHERE LOWER(email) = 'user@example.com';\nCREATE INDEX idx_users_email ON users(email);\n-- The regular index on `email` is COMPLETELY IGNORED because `LOWER()` wraps the column!",
      right:
        "CREATE UNIQUE INDEX idx_users_lower_email ON users(LOWER(email));\n-- Now `WHERE LOWER(email) = ...` uses a lightning-fast Index Scan.",
      explain:
        "Wrapping an indexed column in a function (LOWER, DATE, COALESCE) prevents standard B-Tree indexes from matching. You must either query with exact casing or create an Expression Index on LOWER(email).",
    },
    tryIt: [
      "Run `EXPLAIN (ANALYZE, BUFFERS)` on a slow SELECT query in your local database.",
      "Check whether the scan type is a `Seq Scan`, `Bitmap Heap Scan`, or `Index Scan`.",
      "Create a covering index using `INCLUDE (col1, col2)` to convert an Index Scan into an Index Only Scan.",
      "Add a partial index with `WHERE is_archived = false` to index only active hot records.",
    ],
    challenge: {
      prompt:
        "A critical analytics dashboard query on a 3-million row `audit_logs` table is timing out: `SELECT id, action, created_at FROM audit_logs WHERE tenant_id = $1 AND level = 'ERROR' AND created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 50;`. Design the exact composite or partial index that turns this query into an Index Only Scan.",
      hints: [
        "Check all equality filters first: `tenant_id` and `level`.",
        "Check range filters and sort orders: `created_at DESC`.",
        "Use `INCLUDE (id, action)` to satisfy all SELECT columns directly from the index leaves.",
      ],
      solution: [
        "-- Optimal Covering Composite Index:",
        "CREATE INDEX idx_audit_logs_tenant_err_time",
        "ON audit_logs (tenant_id, level, created_at DESC)",
        "INCLUDE (id, action);",
        "",
        "-- Alternative (If 99% of logs are 'INFO' and only 'ERROR' is queried):",
        "CREATE INDEX idx_audit_logs_errors_only",
        "ON audit_logs (tenant_id, created_at DESC)",
        "INCLUDE (id, action)",
        "WHERE level = 'ERROR';",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Given a composite index on `(organization_id, status, created_at DESC)`, which query CANNOT use this index efficiently?",
        options: [
          "`WHERE organization_id = 'org-1' AND status = 'ACTIVE'`",
          "`WHERE organization_id = 'org-1' ORDER BY created_at DESC`",
          "`WHERE status = 'ACTIVE' AND created_at >= '2026-01-01'`",
          "`WHERE organization_id = 'org-1' AND status = 'ACTIVE' AND created_at >= '2026-01-01'`",
        ],
        answer: 2,
        explain:
          "The Leading Column Rule dictates that the query MUST filter on the first column of the index (`organization_id`). A query filtering only on `status` cannot traverse the B-Tree root.",
      },
      {
        q: "What is an `Index Only Scan` in PostgreSQL?",
        options: [
          "A scan that deletes the table heap.",
          "An execution plan where all requested SELECT and WHERE columns exist directly inside the index leaf nodes, allowing PostgreSQL to skip reading the main table heap completely.",
          "A query that only returns index metadata.",
          "A scan that runs only on primary key columns.",
        ],
        answer: 1,
        explain:
          "When all query columns exist in the index (via key columns or `INCLUDE`), PostgreSQL reads only the compact index pages, yielding the fastest possible query execution.",
      },
      {
        q: "What is the primary benefit of a Partial Index in PostgreSQL (`CREATE INDEX ... WHERE is_active = true`)?",
        options: [
          "It automatically encrypts active records.",
          "It indexes only the subset of rows matching the WHERE predicate, drastically reducing index disk space, memory consumption, and write overhead on unindexed rows.",
          "It disables ACID transactions on inactive records.",
          "It converts strings into integers.",
        ],
        answer: 1,
        explain:
          "Partial indexes only store pointers for matching rows (e.g. 5% of active records instead of 100% of the table), keeping the index small enough to stay permanently pinned in RAM.",
      },
      {
        q: "Why should you use `EXPLAIN (ANALYZE, BUFFERS)` instead of plain `EXPLAIN` when diagnosing queries?",
        options: [
          "`EXPLAIN` without `ANALYZE` only shows estimated mathematical models; `ANALYZE` actually executes the query and reports true millisecond timings and RAM/disk buffer cache hits.",
          "`EXPLAIN` is deprecated in PostgreSQL 16.",
          "`EXPLAIN (ANALYZE)` automatically creates missing indexes for you.",
          "`EXPLAIN` only works on SELECT 1 queries.",
        ],
        answer: 0,
        explain:
          "Plain `EXPLAIN` shows the cost estimations calculated by the query planner. Adding `(ANALYZE, BUFFERS)` runs the query and reveals real elapsed execution times, row count deviations, and disk/buffer stats.",
      },
      {
        q: "What does `Buffers: shared hit=42 read=0` in an EXPLAIN ANALYZE output mean?",
        options: [
          "42 errors occurred during execution.",
          "All 42 required 8KB memory pages were found in the PostgreSQL shared RAM buffer pool (cache hits); 0 pages had to be read from slow physical disk storage.",
          "42 rows were deleted from the table.",
          "The query was executed 42 times in a loop.",
        ],
        answer: 1,
        explain:
          "`shared hit` indicates memory buffer cache hits. `read=0` confirms zero physical disk I/O was required.",
      },
      {
        q: "Why does `WHERE DATE(created_at) = '2026-08-28'` cause a Sequential Scan on an indexed `created_at` column?",
        options: [
          "Because `DATE()` is not an SQL function.",
          "Applying a function to an indexed column prevents the B-Tree from performing a range lookup. You should use `WHERE created_at >= '2026-08-28' AND created_at < '2026-08-29'` instead.",
          "PostgreSQL does not support dates in B-Trees.",
          "Because `created_at` must always be a string.",
        ],
        answer: 1,
        explain:
          "Function calls on columns obscure the raw indexed value. Rewriting to an sargable range query (`>= '2026-08-28' AND < '2026-08-29'`) allows direct B-Tree index traversal.",
      },
    ],
    flashcards: [
      {
        front: "What is the Leading Column Rule for composite indexes?",
        back: "A composite index `(A, B, C)` can only be used by queries that filter on column `A` (or `A` and `B`, or `A`, `B`, and `C`). It cannot be used if `A` is omitted.",
      },
      {
        front: "What is an Index Only Scan?",
        back: "A query execution where all requested columns are satisfied directly from the index leaf pages without fetching rows from the table heap.",
      },
      {
        front: "What is a Partial Index in PostgreSQL?",
        back: "An index with a `WHERE` clause (e.g. `WHERE status = 'ACTIVE'`) that only indexes rows matching the condition, saving space and RAM.",
      },
      {
        front: "What is the difference between `EXPLAIN` and `EXPLAIN ANALYZE`?",
        back: "`EXPLAIN` shows planner estimations without running the query; `EXPLAIN ANALYZE` actually executes the query and shows exact runtimes and buffer stats.",
      },
      {
        front: "What does `shared hit` mean in `EXPLAIN (BUFFERS)`?",
        back: "The number of 8KB database pages retrieved directly from PostgreSQL RAM buffer memory (cache hits).",
      },
      {
        front: "What is a Covering Index?",
        back: "An index that uses `INCLUDE (col1, col2)` to store non-search payload columns in index leaf nodes to enable Index Only Scans.",
      },
      {
        front: "Why does `WHERE LOWER(username) = 'john'` miss an index on `username`?",
        back: "Wrapping the column in a function `LOWER()` hides the raw indexed value. You must create an expression index: `CREATE INDEX ON users(LOWER(username))`.",
      },
      {
        front: "What is a Bitmap Heap Scan in PostgreSQL?",
        back: "A two-phase scan: first builds a bitmap in RAM of all matching page locations from the index, then fetches those heap pages in physical disk order.",
      },
    ],
    recap: [
      "B-Tree indexes provide O(log N) search performance but require queries to respect the Leading Column Rule.",
      "Partial and expression indexes drastically reduce RAM usage while accelerating specific filtered and case-insensitive queries.",
      "Covering indexes (`INCLUDE`) allow Index Only Scans that eliminate disk heap access completely.",
      "`EXPLAIN (ANALYZE, BUFFERS)` reveals true execution bottlenecks, buffer cache hit rates, and scan strategies.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 11. Indexes & Index Types", url: "https://www.postgresql.org/docs/current/indexes-types.html" },
      { label: "Use The Index, Luke! A Guide to Database Performance", url: "https://use-the-index-luke.com/" },
      { label: "PostgreSQL Documentation: Using EXPLAIN & Interpreting Plans", url: "https://www.postgresql.org/docs/current/using-explain.html" },
    ],
    nextBridge:
      "Proceed to P13-L6 to master data types that prevent catastrophic bugs: `TIMESTAMPTZ` timezone handling, `NUMERIC` for monetary accuracy, `JSONB` semi-structured documents, and Full-Text Search with `tsvector`.",
  },
  {
    id: "p13-l6",
    phaseId: "p13",
    title: "Dates, Decimal, JSONB & Full-Text Search",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "PostgreSQL excels beyond traditional relational tables by offering enterprise data types and built-in search engines. In this lesson, you will master timezone discipline with `TIMESTAMPTZ`, exact financial arithmetic with `NUMERIC`, semi-structured document storage and GIN indexing with `JSONB`, and built-in linguistic Full-Text Search using `tsvector` and `tsquery`.",
    prerequisites: [
      "p13-l1 — Relational Modeling & ERDs",
      "p13-l5 — Indexes & Reading EXPLAIN",
    ],
    objectives: [
      "Enforce timezone-safe timestamp handling using `TIMESTAMPTZ` and `AT TIME ZONE`.",
      "Eliminate floating-point rounding errors in billing and currencies with `NUMERIC(12, 2)`.",
      "Store and query semi-structured metadata using `JSONB` operators (`->`, `->>`, `@>`).",
      "Index JSONB documents with Generalized Inverted Indexes (`GIN`) using `jsonb_path_ops`.",
      "Implement multi-column Full-Text Search with `to_tsvector()`, `plainto_tsquery()`, and ranking with `ts_rank()`.",
    ],
    simple:
      "Using `FLOAT` for money is like counting cash with a blurry magnifying glass: $0.10 + $0.20 becomes $0.30000000000000004, causing financial audits to fail. `NUMERIC` counts every single cent with mathematical precision. `JSONB` gives you the flexibility of MongoDB inside PostgreSQL, and `tsvector` gives you search-engine matching (stemming 'running' to 'run') without needing Elasticsearch.",
    why:
      "Storing timestamps without timezones leads to silent daylight-saving time and UTC offset corruption across global users. Storing financial amounts in float causes rounding drift. Knowing how to leverage PostgreSQL's native JSONB and Full-Text Search enables you to build rich features without managing separate Redis, Mongo, or Elasticsearch infrastructure.",
    mentalModel: {
      title: "The UTC Universal Clock & The Inverted Lexicon",
      body: "All `TIMESTAMPTZ` values are normalized and stored as UTC integers internally, then rendered in the client's local session timezone on retrieval. A Full-Text Search GIN index is like an encyclopedia glossary: it stems words into lexemes (e.g., 'debugging' -> 'debug') and maps each lexeme directly to the list of matching document IDs.",
    },
    sections: [
      {
        heading: "Timezone Discipline: TIMESTAMPTZ vs TIMESTAMP",
        body: [
          "Never use `TIMESTAMP WITHOUT TIME ZONE` for application events. Always use `TIMESTAMPTZ` (`TIMESTAMP WITH TIME ZONE`):",
        ],
        code: [
          {
            file: "timestamps-and-timezones.sql",
            lang: "sql",
            code: [
              "-- 1. DDL with proper UTC timestamp discipline",
              "CREATE TABLE scheduled_events (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    title VARCHAR(128) NOT NULL,",
              "    start_time TIMESTAMPTZ NOT NULL, -- Stored internally as UTC microseconds",
              "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
              ");",
              "",
              "-- 2. Inserting with explicit timezone offsets",
              "INSERT INTO scheduled_events (title, start_time)",
              "VALUES ('Sprint Planning', '2026-08-28T14:00:00+02:00'); -- Automatically converted to UTC (12:00:00Z)",
              "",
              "-- 3. Querying and rendering in a specific user timezone (e.g. Asia/Tokyo or America/New_York)",
              "SELECT",
              "    title,",
              "    start_time AS utc_time,",
              "    start_time AT TIME ZONE 'America/New_York' AS ny_local_time,",
              "    start_time AT TIME ZONE 'Asia/Tokyo' AS tokyo_local_time",
              "FROM scheduled_events;",
              "",
              "-- 4. Truncating by date in user's local timezone",
              "SELECT date_trunc('day', start_time AT TIME ZONE 'America/New_York') AS event_day, COUNT(*)",
              "FROM scheduled_events",
              "GROUP BY event_day;",
            ].join("\n"),
            caption: "TIMESTAMPTZ storage and AT TIME ZONE projections for global apps.",
          },
        ],
      },
      {
        heading: "Exact Monetary Precision: NUMERIC vs Float",
        body: [
          "Binary floating-point types (`FLOAT`, `REAL`, `DOUBLE PRECISION`) cannot accurately represent decimal fractions like 0.1 or 0.7. Always use `NUMERIC(precision, scale)` or integer cents:",
        ],
        code: [
          {
            file: "monetary-precision.sql",
            lang: "sql",
            code: [
              "-- ANTI-PATTERN: Float rounding corruption",
              "SELECT (0.1::float + 0.2::float) = 0.3::float AS float_equality;",
              "-- Output: FALSE! (Evaluates to 0.30000000000000004)",
              "",
              "-- PRODUCTION STANDARDS FOR MONEY:",
              "-- Approach A: Integer Cents (Fastest, zero rounding issues)",
              "CREATE TABLE invoices_cents (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    amount_cents BIGINT NOT NULL, -- $199.99 is stored as 19999",
              "    currency VARCHAR(3) NOT NULL DEFAULT 'USD'",
              ");",
              "",
              "-- Approach B: NUMERIC (Arbitrary precision decimal)",
              "CREATE TABLE invoices_decimal (",
              "    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
              "    subtotal NUMERIC(12, 2) NOT NULL, -- Up to 9,999,999,999.99",
              "    tax_rate NUMERIC(5, 4) NOT NULL,  -- e.g. 0.0825 (8.25%)",
              "    total NUMERIC(12, 2) GENERATED ALWAYS AS (ROUND(subtotal * (1 + tax_rate), 2)) STORED",
              ");",
            ].join("\n"),
            caption: "Preserving financial accuracy with BIGINT cents and NUMERIC(12, 2).",
          },
        ],
      },
      {
        heading: "JSONB Documents & GIN Indexing",
        body: [
          "PostgreSQL `JSONB` stores decomposed binary JSON, allowing fast lookups, nested filtering, and indexing:",
        ],
        code: [
          {
            file: "jsonb-and-gin.sql",
            lang: "sql",
            code: [
              "CREATE TABLE user_settings (",
              "    user_id UUID PRIMARY KEY REFERENCES users(id),",
              "    preferences JSONB NOT NULL DEFAULT '{}'::jsonb",
              ");",
              "",
              "-- Insert rich nested JSON document",
              "INSERT INTO user_settings (user_id, preferences)",
              "VALUES ('u-100', '{",
              "  \"theme\": \"dark\",",
              "  \"notifications\": { \"email\": true, \"slack\": false },",
              "  \"tags\": [\"developer\", \"admin\"],",
              "  \"metadata\": { \"login_count\": 42 }",
              "}');",
              "",
              "-- 1. Extracting text values with `->>` operator",
              "SELECT preferences->'notifications'->>'email' AS email_notifs",
              "FROM user_settings",
              "WHERE preferences->>'theme' = 'dark';",
              "",
              "-- 2. JSONB Containment operator `@>` (Checks if document contains subset)",
              "SELECT user_id FROM user_settings",
              "WHERE preferences @> '{\"notifications\": {\"email\": true}}';",
              "",
              "-- 3. GIN Index with jsonb_path_ops for lightning-fast containment queries",
              "CREATE INDEX idx_user_settings_prefs_gin",
              "ON user_settings USING GIN (preferences jsonb_path_ops);",
            ].join("\n"),
            caption: "Querying and GIN-indexing semi-structured JSONB payloads.",
          },
        ],
      },
      {
        heading: "Native Full-Text Search: `tsvector` & `tsquery`",
        body: [
          "PostgreSQL includes a complete search engine with linguistic stemming, stop-word removal, and relevance ranking:",
        ],
        code: [
          {
            file: "full-text-search.sql",
            lang: "sql",
            code: [
              "-- 1. Generated tsvector search column combining title and description",
              "ALTER TABLE tasks ADD COLUMN search_vector tsvector",
              "GENERATED ALWAYS AS (",
              "  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||",
              "  setweight(to_tsvector('english', coalesce(description, '')), 'B')",
              ") STORED;",
              "",
              "-- 2. GIN Index on the search vector",
              "CREATE INDEX idx_tasks_search_gin ON tasks USING GIN(search_vector);",
              "",
              "-- 3. Performing Ranked Search (Matches 'optimize', 'optimizing', 'optimizer')",
              "SELECT",
              "    id,",
              "    title,",
              "    ts_rank(search_vector, query) AS rank_score",
              "FROM tasks, plainto_tsquery('english', 'database optimization') query",
              "WHERE search_vector @@ query",
              "ORDER BY rank_score DESC",
              "LIMIT 10;",
            ].join("\n"),
            caption: "Implementing ranked Full-Text Search with tsvector, tsquery, and GIN indexes.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using single arrow `->` instead of double arrow `->>` for JSON string comparisons",
      wrong:
        "SELECT * FROM user_settings WHERE preferences->'theme' = 'dark';\n-- FAILS or returns 0 rows! `->` returns a JSON element `\"dark\"` (with quotes), not text `'dark'`.",
      right:
        "SELECT * FROM user_settings WHERE preferences->>'theme' = 'dark';\n-- `->>` extracts the value as raw PostgreSQL `text`.",
      explain:
        "`->` extracts a JSON sub-object or JSON string (including enclosing quotes). `->>` extracts the field as clean SQL text suitable for string comparisons.",
    },
    tryIt: [
      "Create a table with `TIMESTAMPTZ` and query it using `AT TIME ZONE` to observe timezone conversions.",
      "Store currency amounts as integer cents or `NUMERIC(12, 2)` to eliminate floating-point drift.",
      "Store a nested JSON object in a `JSONB` column and query it using the `@>` containment operator.",
      "Build a GIN index on a `tsvector` column and execute a ranked full-text query with `plainto_tsquery()`.",
    ],
    challenge: {
      prompt:
        "Design a search query that searches tasks by a user's search phrase (e.g. `'urgent postgres bug'`). It must stem words linguistically, weight title matches higher than description matches, calculate relevance score with `ts_rank()`, filter by `project_id = $1`, and return the top 15 results ordered by relevance.",
      hints: [
        "Use `to_tsvector('english', ...)` with `setweight(..., 'A')` for title and `setweight(..., 'B')` for description.",
        "Use `plainto_tsquery('english', $2)` to safely parse raw user search input without syntax errors.",
        "Join and order by `ts_rank(search_vector, query) DESC`.",
      ],
      solution: [
        "-- 1. Schema definition with weighted search vector:",
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS search_vector tsvector",
        "GENERATED ALWAYS AS (",
        "  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||",
        "  setweight(to_tsvector('english', COALESCE(description, '')), 'B')",
        ") STORED;",
        "",
        "CREATE INDEX IF NOT EXISTS idx_tasks_search_vector_gin",
        "ON tasks USING GIN (search_vector);",
        "",
        "-- 2. Search Query Execution:",
        "SELECT",
        "    t.id,",
        "    t.title,",
        "    t.status,",
        "    t.priority,",
        "    ts_rank(t.search_vector, q.query) AS search_rank",
        "FROM tasks t,",
        "     plainto_tsquery('english', $2) q.query",
        "WHERE t.project_id = $1",
        "  AND t.search_vector @@ q.query",
        "ORDER BY search_rank DESC, t.created_at DESC",
        "LIMIT 15;",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Why should backend applications always use `TIMESTAMPTZ` instead of `TIMESTAMP WITHOUT TIME ZONE` in PostgreSQL?",
        options: [
          "`TIMESTAMPTZ` automatically converts incoming timestamps to UTC for consistent storage, whereas `TIMESTAMP` ignores timezone offsets and corrupts cross-timezone math.",
          "`TIMESTAMP` cannot store dates past the year 2038.",
          "`TIMESTAMPTZ` uses 2 bytes of disk space while `TIMESTAMP` uses 64 bytes.",
          "`TIMESTAMP` prevents tables from having primary keys.",
        ],
        answer: 0,
        explain:
          "`TIMESTAMPTZ` converts all inputs to UTC on insertion and formats them correctly based on client connection timezone, preventing timezone drift bugs.",
      },
      {
        q: "What is the difference between the `->` and `->>` operators when querying JSONB columns?",
        options: [
          "`->` is for integer keys; `->>` is for string keys.",
          "`->` returns a `jsonb` value (preserving JSON quotes); `->>` returns the extracted field as pure PostgreSQL `text`.",
          "`->>` deletes the field from the JSON document.",
          "`->` only works on array elements.",
        ],
        answer: 1,
        explain:
          "`->` keeps the result as JSON (`\"dark\"`), while `->>` converts it to unquoted plain SQL text (`dark`), necessary for text equality comparisons.",
      },
      {
        q: "Why is `NUMERIC(12, 2)` required for storing monetary values instead of `FLOAT8` / `DOUBLE PRECISION`?",
        options: [
          "Floating-point numbers use base-2 binary representation which cannot represent exact base-10 decimals, resulting in rounding errors like `0.1 + 0.2 = 0.30000000000000004`.",
          "`FLOAT` cannot store numbers larger than 1,000.",
          "`NUMERIC` automatically connects to credit card payment processors.",
          "PostgreSQL does not support math operations on floats.",
        ],
        answer: 0,
        explain:
          "Binary floats suffer from IEEE-754 precision loss. `NUMERIC` performs exact decimal arithmetic, ensuring financial ledgers balance down to the exact cent.",
      },
      {
        q: "What index type should you use to accelerate JSONB containment queries (`WHERE data @> '{\"tag\": \"vip\"}'`)?",
        options: [
          "B-Tree index",
          "Hash index",
          "GIN (Generalized Inverted Index) with `jsonb_path_ops`",
          "BRIN index",
        ],
        answer: 2,
        explain:
          "GIN indexes break composite structures and JSON documents into individual key-value pairs, making `@>` containment lookups execute in sub-millisecond time.",
      },
      {
        q: "What is the primary role of `plainto_tsquery('english', user_input)` in Full-Text Search?",
        options: [
          "It translates search text into Spanish.",
          "It safely transforms unformatted raw user strings into valid `tsquery` search syntax by removing boolean syntax errors and applying English stemming.",
          "It encrypts the search query.",
          "It deletes special characters from the database table.",
        ],
        answer: 1,
        explain:
          "`plainto_tsquery` prevents syntax crashes by safely converting plain user text (e.g. `'web & dev!'`) into sanitized stemmed search tokens (`'web' & 'dev'`).",
      },
      {
        q: "What does `setweight(to_tsvector('english', title), 'A')` do in PostgreSQL search vectors?",
        options: [
          "It limits the title to 10 characters.",
          "It assigns a high relevance weight ('A') to matches found in the title when calculating ranking with `ts_rank()`.",
          "It converts the title to uppercase.",
          "It indexes the title in alphabetical order.",
        ],
        answer: 1,
        explain:
          "PostgreSQL supports four weight tiers (A, B, C, D). Assigning 'A' to titles and 'B' to descriptions ensures title matches rank higher in search results.",
      },
    ],
    flashcards: [
      {
        front: "What is the difference between `TIMESTAMP` and `TIMESTAMPTZ`?",
        back: "`TIMESTAMPTZ` converts input to UTC on storage and handles timezone offsets consistently; `TIMESTAMP` ignores timezone offsets completely.",
      },
      {
        front: "How do you project a UTC timestamp into a user's local timezone in SQL?",
        back: "Using `created_at AT TIME ZONE 'America/New_York'` (or any valid IANA timezone string).",
      },
      {
        front: "Why should you never store financial currency in `FLOAT`?",
        back: "Binary floating-point arithmetic introduces precision inaccuracies (e.g. 0.1 + 0.2 != 0.3). Use `NUMERIC(12, 2)` or integer cents.",
      },
      {
        front: "What does the JSONB `@>` operator do?",
        back: "The containment operator: tests if the left JSONB document contains the right JSONB structure (`doc @> '{\"role\": \"admin\"}'`).",
      },
      {
        front: "What is the difference between JSON and JSONB in PostgreSQL?",
        back: "`JSON` stores exact text (slower to query); `JSONB` parses and stores decomposed binary format (fast to query and indexable with GIN).",
      },
      {
        front: "What is `tsvector` in PostgreSQL?",
        back: "A sorted list of distinct, stemmed lexemes (words) optimized for fast text search matching.",
      },
      {
        front: "What is `ts_rank(search_vector, query)`?",
        back: "A function that calculates a numerical relevance score based on how frequently and prominently query lexemes appear in the document.",
      },
      {
        front: "What is a GIN index and when is it used?",
        back: "Generalized Inverted Index — used for multi-value types like `JSONB`, `tsvector`, and arrays to index individual elements for sub-millisecond lookup.",
      },
    ],
    recap: [
      "Always store timestamps as `TIMESTAMPTZ` in UTC and project to local timezones using `AT TIME ZONE`.",
      "Store money as integer cents or `NUMERIC(12, 2)` to eliminate floating-point rounding errors.",
      "`JSONB` enables schema-flexible document storage with GIN indexing for fast containment (`@>`) searches.",
      "PostgreSQL Full-Text Search (`tsvector`, `tsquery`, GIN) provides search-engine quality indexing directly in the database.",
    ],
    references: [
      { label: "PostgreSQL Documentation: Chapter 8. Data Types (Date/Time, Numeric, JSON)", url: "https://www.postgresql.org/docs/current/datatype.html" },
      { label: "PostgreSQL Documentation: Chapter 12. Full Text Search", url: "https://www.postgresql.org/docs/current/textsearch.html" },
      { label: "PostgreSQL Documentation: JSON Functions and Operators", url: "https://www.postgresql.org/docs/current/functions-json.html" },
    ],
    nextBridge:
      "Congratulations on completing Phase 13! You now have a complete, mastery-level understanding of PostgreSQL schema design, indexing, transactions, and specialized types.",
  },
];

export const LESSON_CONTENT_P13B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P13B.map((l) => [l.id, l])
);
