import type { LessonContent } from "./types";

/**
 * Pass 021 bounded content batch: Phase 7 conclusion (L5–L6).
 * Phase 7: HTTP, REST & API Mental Models is now 100% complete!
 * Every lesson fulfills the full quality contract. No placeholders.
 */
export const LESSONS_P7C: LessonContent[] = [
  {
    id: "p07-l5",
    phaseId: "p07",
    title: "REST Conventions, Pagination & Structured Errors",
    level: "Frontend Developer",
    minutes: 40,
    summary:
      "REST is not a protocol and not a standard — it is a disciplined set of conventions for modeling business resources onto HTTP's noun/verb grammar. This lesson teaches clean URL resource hierarchy, pluralized collections, query filtering grammar, offset-limit vs cursor-based keyset pagination, RFC 7807 problem details error contracts, and idempotency keys for safe network retries.",
    prerequisites: [
      "p07-l2 — methods, status codes & headers",
      "p07-l1 — URL grammar and the request/response envelope",
      "p03-l2 — unions and narrowing for typed response shapes",
    ],
    objectives: [
      "Model entities into clean REST resource paths: `/resources`, `/resources/:id`, and sub-resources.",
      "Distinguish resource CRUD from business actions and model verbs cleanly (e.g. `/orders/:id/cancel` vs `/orders/:id`).",
      "Design query parameters for sorting, filtering, and field selection without breaking caching.",
      "Contrast offset pagination (`?page=2&limit=20`) with cursor/keyset pagination (`?cursor=xyz&limit=20`) and state when drift causes duplicate reads.",
      "Write and consume RFC 7807 `application/problem+json` error bodies with typed invalid parameter arrays.",
      "Implement `Idempotency-Key` headers on mutating requests to guarantee safe client retries without double-charging or duplicate creation.",
    ],
    simple:
      "If HTTP methods are verbs (GET, POST, PUT, PATCH, DELETE), REST URLs are nouns (the books, the users, the orders in the library). Good REST means you never put verbs in the URL path (`/getBooks` or `/deleteUser` is bad grammar; `GET /books` and `DELETE /users/42` is proper grammar). When there are 10,000 books, you don't dump the whole warehouse on the floor: you page through them. But if someone slips a new book onto page 1 while you're reading page 2, simple page numbers will show you a duplicate! That's why high-scale databases use a bookmark (a cursor) rather than a page number.",
    why:
      "Every frontend API client you will build from Phase 8 to Phase 24 depends on predictable REST semantics. In NestJS (Phase 10-12) and Fastify, you will author controllers matching these exact contracts; in Prisma (Phase 14-15), your database queries will mirror your cursor pagination strategy. Furthermore, frontend forms fail gracefully only when the backend returns standardized machine-readable errors (RFC 7807) rather than generic string error messages.",
    mentalModel: {
      title: "The Filing Cabinet and the Keyset Bookmark",
      body: "Think of an API as a filing cabinet organized into labeled drawers (collections like `/tasks`). Each folder inside has an ID badge (`/tasks/101`). When searching through millions of folders, asking a clerk to 'skip 50,000 folders and hand me the next 20' (Offset Pagination) forces the clerk to count 50,000 folders from the start every single time. Giving the clerk a bookmark: 'give me 20 folders after badge #10192' (Cursor Keyset Pagination) lets them jump straight to the index in one step, unaffected by folders added or removed elsewhere.",
    },
    sections: [
      {
        heading: "Resource modeling — nouns, collections, and relations",
        body: [
          "In REST, URIs represent resources (nouns), while HTTP methods express actions (verbs). Resource names should always be plural nouns in lowercase kebab-case (e.g., `/api/v1/workspaces`, `/api/v1/workspaces/:workspaceId/projects`).",
          "Never nest deeper than two levels (e.g., avoid `/orgs/1/teams/2/projects/3/tasks/4/comments`). If a child resource has an unambiguous globally unique ID, promote it to a top-level route (e.g., `/api/v1/tasks/4/comments` or `/api/v1/comments/42`).",
          "For business operations that don't map cleanly to CRUD (like publishing an article, recalculating totals, or locking an account), use a sub-resource verb endpoint (e.g., `POST /articles/42/publish`) or a dedicated controller action with an Idempotency-Key.",
        ],
        code: [
          {
            file: "rest-routes.ts — clean resource mapping",
            lang: "ts",
            code: [
              "// GOOD RESTFUL RESOURCE HIERARCHY:",
              "// GET    /api/v1/tasks             -> List tasks (filterable)",
              "// POST   /api/v1/tasks             -> Create a new task",
              "// GET    /api/v1/tasks/:id         -> Get specific task by ID",
              "// PATCH  /api/v1/tasks/:id         -> Partial update of task attributes",
              "// DELETE /api/v1/tasks/:id         -> Remove task",
              "// POST   /api/v1/tasks/:id/archive -> Business action: archive task",
              "",
              "// BAD / ANTI-PATTERNS:",
              "// POST   /api/v1/getTasksList      (Method is already GET, no verbs in path)",
              "// GET    /api/v1/deleteTask?id=12  (GET must never mutate state!)",
              "// POST   /api/v1/task/update/12    (Redundant path noise)",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Offset pagination vs Keyset (Cursor) pagination",
        body: [
          "Offset pagination (`?page=3&limit=20`) computes `OFFSET = (page - 1) * limit`. It is simple to implement and allows jumping directly to 'Page 5', but suffers from two fatal production flaws: 1) Performance degrades to O(N) as offset grows because Postgres must scan and discard thousands of rows; 2) Concurrent insertion or deletion causes 'drift', where items shift pages, causing the user to see duplicates or miss rows entirely.",
          "Cursor (Keyset) pagination (`?cursor=eyJpZCI6MTQyfQ&limit=20`) uses the indexed unique sorting key of the last seen item (`WHERE (created_at, id) < (cursor_date, cursor_id)`). It executes in O(log N) indexed seek time, never produces duplicates during concurrent inserts, and is the industry standard for feeds, infinite scrolls, and modern APIs.",
        ],
        code: [
          {
            file: "pagination-contracts.ts — offset vs cursor types",
            lang: "ts",
            code: [
              "// 1. Offset Pagination Response Shape",
              "export interface OffsetPaginated<T> {",
              "  data: T[];",
              "  meta: {",
              "    totalItems: number;",
              "    itemCount: number;",
              "    itemsPerPage: number;",
              "    totalPages: number;",
              "    currentPage: number;",
              "  };",
              "}",
              "",
              "// 2. Cursor (Keyset) Pagination Response Shape (Stable & Scalable)",
              "export interface CursorPaginated<T> {",
              "  data: T[];",
              "  meta: {",
              "    nextCursor: string | null; // opaque base64 encoded token",
              "    hasNextPage: boolean;",
              "    limit: number;",
              "  };",
              "}",
            ].join("\n"),
          },
        ],
        demo: "rest-pagination",
      },
      {
        heading: "RFC 7807 Problem Details — standardizing error contracts",
        body: [
          "APIs should not return inconsistent error shapes (e.g. `{ error: 'Not found' }` on one endpoint and `{ message: 'Bad request', code: 400 }` on another). The Internet Engineering Task Force (IETF) standardized RFC 7807 (`application/problem+json`) to unify HTTP error payloads across modern services.",
          "An RFC 7807 payload includes 5 canonical fields: `type` (URI identifier for the error category), `title` (short human-readable summary), `status` (HTTP status code matching response), `detail` (specific explanation of this occurrence), and `instance` (URI of the request). Custom fields like `invalidParams` provide granular field-level form validation errors.",
        ],
        code: [
          {
            file: "problem-details.json — RFC 7807 compliance",
            lang: "json",
            code: [
              "{",
              "  \"type\": \"https://api.myapp.com/errors/validation-failed\",",
              "  \"title\": \"Validation Failed\",",
              "  \"status\": 422,",
              "  \"detail\": \"One or more input fields failed validation constraints.\",",
              "  \"instance\": \"/api/v1/tasks\",",
              "  \"invalidParams\": [",
              "    { \"name\": \"title\", \"reason\": \"Must be between 3 and 100 characters.\" },",
              "    { \"name\": \"priority\", \"reason\": \"Must be one of: 'low', 'medium', 'high', 'critical'.\" }",
              "  ]",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Idempotency keys & safe network retries",
        body: [
          "Network requests can fail on the return leg: the server creates a $500 order or sends an email, but the connection drops before the client receives the `201 Created` response. If the client retries blindly with standard `POST`, the customer is charged twice.",
          "The solution is the `Idempotency-Key: <uuid-v4>` header. When the backend receives a request with an Idempotency-Key, it checks Redis or the database. If the key was already processed, it returns the cached original response without re-executing the operation. If currently processing, it returns `409 Conflict` or waits for completion.",
        ],
        code: [
          {
            file: "idempotent-client.ts — client-side retry with uuid key",
            lang: "ts",
            code: [
              "export async function createPaymentWithRetry(orderId: string, amountCents: number) {",
              "  // Generate ONE unique key per business intent:",
              "  const idempotencyKey = crypto.randomUUID();",
              "",
              "  for (let attempt = 1; attempt <= 3; attempt++) {",
              "    try {",
              "      const res = await fetch(\"/api/v1/payments\", {",
              "        method: \"POST\",",
              "        headers: {",
              "          \"Content-Type\": \"application/json\",",
              "          \"Idempotency-Key\": idempotencyKey, // Re-sent unchanged on retry!",
              "        },",
              "        body: JSON.stringify({ orderId, amountCents }),",
              "      });",
              "",
              "      if (res.ok) return await res.json();",
              "      if (res.status >= 400 && res.status < 500) throw new Error(`Client error: ${res.status}`);",
              "    } catch (err) {",
              "      if (attempt === 3) throw err;",
              "      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt))); // Exponential backoff",
              "    }",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Using GET with query params for state mutations",
      wrong: "fetch(`/api/v1/users/${id}/delete?confirmed=true`)",
      right: "fetch(`/api/v1/users/${id}`, { method: 'DELETE' })",
      explain:
        "GET requests must be safe and idempotent according to HTTP specs. Web crawlers, link pre-fetchers (like Next.js Link or browser pre-rendering), and browser caches will execute GET requests automatically without user intent, which will cause catastrophic data loss if GET performs mutations.",
    },
    tryIt: [
      "Open the interactive REST Pagination lab above and switch between 'Offset' and 'Cursor' mode.",
      "Click 'Insert Row At Top' while sitting on Page 2 in Offset mode — observe how row items drift down and duplicate.",
      "Switch to Cursor Keyset mode and insert rows — verify that pagination remains completely stable with zero duplicates.",
      "Toggle the 'RFC 7807 Problem JSON' preview and inspect the structured `invalidParams` validation feedback.",
    ],
    challenge: {
      prompt:
        "Design a typed TypeScript interface and encoder/decoder functions for a Base64-encoded cursor token that supports composite ordering on `(createdAt DESC, id DESC)`.",
      hints: [
        "The cursor payload must contain both `createdAt: string` and `id: number` to break timestamp ties.",
        "Use `btoa(JSON.stringify(payload))` for encoding and `JSON.parse(atob(cursor))` with runtime validation for decoding.",
        "Handle malformed base64 strings by throwing a typed invalid cursor error.",
      ],
      solution: [
        "interface KeysetCursor {",
        "  createdAt: string;",
        "  id: number;",
        "}",
        "",
        "export function encodeCursor(cursor: KeysetCursor): string {",
        "  return btoa(JSON.stringify(cursor));",
        "}",
        "",
        "export function decodeCursor(token: string): KeysetCursor {",
        "  try {",
        "    const parsed = JSON.parse(atob(token));",
        "    if (typeof parsed.createdAt !== 'string' || typeof parsed.id !== 'number') {",
        "      throw new Error('Invalid cursor payload structure');",
        "    }",
        "    return parsed;",
        "  } catch {",
        "    throw new Error('Malformed or corrupted cursor token');",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary architectural flaw of Offset Pagination (`OFFSET 100000 LIMIT 20`) on high-traffic databases?",
        options: [
          "Postgres stores offsets in memory and runs out of RAM",
          "The database must scan and discard 100,000 rows sequentially before returning 20, degrading to O(N) latency",
          "Offset queries cannot be cached in HTTP reverse proxies",
          "Offset queries require raw SQL and cannot be executed with Prisma",
        ],
        answer: 1,
        explain:
          "With `OFFSET 100000`, the database engine must traverse 100,000 index entries or rows, discarding each one, which wastes significant I/O and CPU.",
      },
      {
        q: "Which HTTP header is standardized by RFC 7807 for structured error responses?",
        options: [
          "Content-Type: application/problem+json",
          "Content-Type: application/error+json",
          "X-Error-Format: rfc-7807",
          "Accept-Errors: application/json",
        ],
        answer: 0,
        explain:
          "RFC 7807 specifies the MIME media type `application/problem+json` (and `application/problem+xml`) for standard machine-readable problem details.",
      },
      {
        q: "Why is `Idempotency-Key` sent with mutating POST requests when implementing network retries?",
        options: [
          "To bypass CORS preflight verification in the browser",
          "To encrypt the request body with AES-GCM",
          "To allow the server to identify duplicate retry attempts and avoid double-processing side effects",
          "To compress the JSON body before transmission",
        ],
        answer: 2,
        explain:
          "An Idempotency-Key uniquely identifies a single business intent. If a retry with the same key arrives, the server recognizes it has already processed it and returns the cached result without repeating the operation.",
      },
      {
        q: "Which URL represents correct RESTful conventions for archiving task #42?",
        options: [
          "GET /api/v1/tasks/archive?id=42",
          "POST /api/v1/tasks/42/archive",
          "POST /api/v1/archiveTask42",
          "DELETE /api/v1/tasks/42?action=archive",
        ],
        answer: 1,
        explain:
          "`POST /api/v1/tasks/42/archive` correctly maintains the plural resource collection noun `/tasks/:id` and appends the sub-resource business action verb via POST.",
      },
      {
        q: "What phenomenon occurs in offset pagination when a new record is inserted at the beginning while a user navigates between pages?",
        options: [
          "Data drift (the user sees duplicate items on subsequent pages)",
          "TCP connection reset (RST packet)",
          "504 Gateway Timeout from the reverse proxy",
          "CORS preflight rejection",
        ],
        answer: 0,
        explain:
          "Inserting a new item pushes all existing items down by one index position. The item that was previously at index 10 (page 1) moves to index 11 (page 2), so the user sees it twice.",
      },
      {
        q: "In an RFC 7807 error payload, what is the role of the `instance` field?",
        options: [
          "The Docker container ID that processed the request",
          "A URI reference that identifies the specific occurrence of the problem (usually the request path)",
          "The Prisma database connection pool instance name",
          "The JavaScript Error class name",
        ],
        answer: 1,
        explain:
          "According to RFC 7807, `instance` is a URI reference that identifies the specific occurrence of the problem, allowing developers to correlate the error with request logs.",
      },
    ],
    flashcards: [
      {
        front: "What is the difference between an HTTP resource and an RPC procedure?",
        back: "REST resources are nouns manipulated through standard uniform HTTP verbs (GET, POST, PATCH, DELETE), whereas RPC calls invoke arbitrary remote functions with custom procedure names (/getUser, /doCheckout).",
      },
      {
        front: "Why does Keyset (Cursor) pagination avoid duplicate records during concurrent inserts?",
        back: "Because keyset queries filter on an immutable record attribute (e.g. `WHERE id < :cursor_id`), newly inserted items with higher IDs never shift the items already filtered behind the bookmark.",
      },
      {
        front: "What are the 5 core properties of an RFC 7807 Problem Details object?",
        back: "1. `type` (URI identifier), 2. `title` (short summary), 3. `status` (HTTP status code), 4. `detail` (human-readable explanation), 5. `instance` (request URI).",
      },
      {
        front: "When should you use PATCH instead of PUT in REST API design?",
        back: "Use PUT when replacing the ENTIRE resource document; use PATCH when applying a partial update to specific fields without overwriting unchanged fields.",
      },
      {
        front: "What is the purpose of the `Idempotency-Key` HTTP header?",
        back: "It lets the server recognize network-retried requests as the same operation, ensuring payment charges or resource creations are executed exactly once.",
      },
      {
        front: "What is the time complexity of Cursor pagination compared to Offset pagination?",
        back: "Offset is O(N) because the database must scan and discard all preceding offset rows; Cursor is O(log N) indexed B-tree seek time regardless of dataset size.",
      },
      {
        front: "Why should REST sub-resources never be nested deeper than 2 levels?",
        back: "Deep nesting creates brittle, overly complex URLs and tight coupling. Globally unique IDs should be promoted to top-level routes (e.g., `/comments/:id` rather than `/orgs/1/teams/2/tasks/3/comments/:id`).",
      },
      {
        front: "How should a REST API handle client-side sorting and filtering?",
        back: "Via query parameters (e.g. `?sort=-createdAt&status=active&priority=high`), keeping the path clean and allowing HTTP caches to key on the query string.",
      },
    ],
    recap: [
      "REST uses plural nouns for collections and HTTP verbs for operations.",
      "Offset pagination (`OFFSET n`) degrades at scale and suffers from concurrent insertion drift; Cursor pagination (`WHERE id < cursor`) provides O(log N) indexed performance and absolute stability.",
      "RFC 7807 `application/problem+json` provides a standardized, machine-readable format for API error reporting with field-level `invalidParams`.",
      "Idempotency keys prevent duplicate operations during automatic client network retries.",
    ],
    references: [
      { label: "RFC 7807 — Problem Details for HTTP APIs (IETF)", url: "https://datatracker.ietf.org/doc/html/rfc7807" },
      { label: "IETF Draft — The Idempotency-Key HTTP Header Field", url: "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header" },
      { label: "PostgreSQL Documentation — Query Evaluation & Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" },
    ],
    nextBridge:
      "Now that you understand REST contracts and API design, you will put your diagnostic skills to the test in P07-L6's full-stack incident diagnostic lab.",
  },
  {
    id: "p07-l6",
    phaseId: "p07",
    title: "Lab: Diagnose Which Layer Failed",
    level: "Frontend Developer",
    minutes: 45,
    summary:
      "When a feature breaks in production, inexperienced developers randomly guess at code until something changes. Professional engineers apply the strict 9-step debugging loop: inspecting DNS, reverse proxies, HTTP status codes, CORS headers, DTO validation pipes, and Prisma database exceptions with forensic precision. This capstone lab places you in an interactive incident triage room to diagnose six real-world stack failures.",
    prerequisites: [
      "p00-l4 — the nine-step debugging loop",
      "p07-l1 — request/response anatomy & timing waterfalls",
      "p07-l2 — HTTP status codes & headers",
      "p07-l3 — cookies, tokens & JWT verification",
      "p07-l4 — CORS preflight mechanics",
      "p07-l5 — REST conventions & RFC 7807 error structures",
    ],
    objectives: [
      "Apply the 9-step debugging method under realistic incident conditions without guessing.",
      "Differentiate client DNS/network socket failures from upstream reverse proxy 502/504 errors.",
      "Diagnose auth failures: differentiate between 401 Unauthorized (unauthenticated/expired token) and 403 Forbidden (authenticated but lacking role permissions).",
      "Trace 400 validation rejections directly to NestJS class-validator DTO constraints.",
      "Identify Prisma database unique constraint violations (P2002) masked behind generic 500 errors.",
      "Resolve CORS preflight failures by inspecting `Access-Control-Allow-Headers` mismatches.",
    ],
    simple:
      "Imagine an airplane with a dashboard warning light that simply says 'Engine Issue'. A bad mechanic starts replacing random bolts. A professional pilot and aircraft engineer opens the flight data recorder, checks the sensor telemetry, isolates the specific hydraulic line that lost pressure, verifies the root cause, and applies the targeted repair. In web development, your DevTools Network tab, response headers, and backend logs are that flight data recorder.",
    why:
      "Full-stack web applications span at least six distinct architectural boundaries: Browser JS → DNS → Reverse Proxy (nginx/Cloudflare) → Fastify HTTP Server → NestJS Application Logic (Guards, Pipes, Controllers) → Prisma ORM → PostgreSQL Database. When an API call fails, knowing which boundary rejected the request cuts your debugging time from hours to seconds.",
    mentalModel: {
      title: "The Six-Door Security Checkpoint",
      body: "A request is a traveler attempting to pass through six sequential security checkpoints: Door 1 (DNS Address Check), Door 2 (Proxy Gateway), Door 3 (CORS Policy Clearance), Door 4 (Auth Token Verification), Door 5 (Input DTO Validation), and Door 6 (Database Storage). Each door has a distinct signature when it slams shut: Door 1 returns `ERR_NAME_NOT_RESOLVED`; Door 2 returns `502 Bad Gateway`; Door 3 triggers a browser CORS block; Door 4 returns `401 Unauthorized`; Door 5 returns `400 Bad Request`; and Door 6 returns a Prisma exception (`P2002`).",
    },
    sections: [
      {
        heading: "The 9-Step Debugging Loop under incident pressure",
        body: [
          "In Phase 0 (P00-L4), we introduced the 9-Step Debugging Loop: 1. Read the Error, 2. Identify the Layer, 3. Reproduce, 4. Gather Evidence, 5. Hypothesize, 6. Change One Thing, 7. Verify, 8. Explain Root Cause, 9. Prevent Regression.",
          "When triaging network and API failures, Step 2 (Identify the Layer) and Step 4 (Gather Evidence) are decisive. Never modify code before you have inspected: a) The HTTP Status Code, b) The Timing Waterfall (TTFB vs DNS vs Transfer), c) The Request/Response Headers, and d) The Server/Container Logs.",
        ],
        code: [
          {
            file: "layer-matrix.txt — boundary error signatures",
            lang: "text",
            code: [
              "+---------------------+-------------------------+----------------------------------+",
              "| Architectural Layer | Typical Status / Error  | Primary Diagnostic Evidence      |",
              "+---------------------+-------------------------+----------------------------------+",
              "| 1. DNS / Network    | ERR_NAME_NOT_RESOLVED   | DNS timing > 3000ms, no socket   |",
              "| 2. Reverse Proxy    | 502 / 504 Bad Gateway   | HTML response from nginx/caddy   |",
              "| 3. CORS Engine      | Browser Console Blocked | OPTIONS preflight headers absent |",
              "| 4. Auth Guard       | 401 Unauthorized        | Expired JWT claim in Nest Guard  |",
              "| 5. DTO Validator    | 400 / 422 Bad Request   | RFC 7807 invalidParams array     |",
              "| 6. Prisma / DB      | 500 Internal Error      | Prisma error code P2002 in logs  |",
              "+---------------------+-------------------------+----------------------------------+",
            ].join("\n"),
          },
        ],
        demo: "layer-diagnostic",
      },
      {
        heading: "Distinguishing proxy 502s from backend crashes",
        body: [
          "When you see a `502 Bad Gateway` or `504 Gateway Timeout`, the error did NOT come from your NestJS code directly — it was generated by the upstream reverse proxy (like nginx, Traefik, or Google Cloud Run load balancer) because it could not establish a connection to your Node process, or your Node process took longer to respond than the proxy's timeout limit.",
          "If the response `Content-Type` is `text/html` with an nginx default error page, your Node process is either dead, restarting in a crash loop, or blocked by a long-running synchronous CPU task. Inspect `pm2 status`, `docker logs`, or container health check endpoints.",
        ],
        code: [
          {
            file: "proxy-vs-app-response.http",
            lang: "text",
            code: [
              "// REVERSE PROXY GENERATED 502 (Node process unreachable):",
              "HTTP/1.1 502 Bad Gateway",
              "Server: nginx/1.25.4",
              "Content-Type: text/html",
              "",
              "<html><center><h1>502 Bad Gateway</h1></center></html>",
              "",
              "// APPLICATION GENERATED 500 (NestJS exception filter caught runtime error):",
              "HTTP/1.1 500 Internal Server Error",
              "Server: fastify",
              "Content-Type: application/problem+json",
              "",
              "{\"type\": \"https://api.example.com/errors/internal\", \"title\": \"Internal Server Error\", \"status\": 500}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "401 vs 403 — Identity vs Permission",
        body: [
          "A frequent source of security bugs is confusing `401 Unauthorized` and `403 Forbidden`. In HTTP specs:",
          "`401 Unauthorized` strictly means 'Unauthenticated' (You have not provided valid proof of who you are, or your token is expired). The browser or client should attempt to log in or refresh the session token.",
          "`403 Forbidden` means 'Authenticated but Unauthorized' (We know who you are — user #142 — but you do not have permission to access Workspace #9). The client should NOT attempt to refresh the token, but instead display a permission denied notice.",
        ],
        code: [
          {
            file: "auth-guard-distinction.ts — NestJS guard semantics",
            lang: "ts",
            code: [
              "// NestJS AuthGuard -> 401 Unauthorized (Who are you?)",
              "if (!token || isExpired(token)) {",
              "  throw new UnauthorizedException(\"Missing or expired authentication token.\");",
              "}",
              "",
              "// NestJS RolesGuard / PolicyGuard -> 403 Forbidden (You cannot enter here)",
              "if (user.role !== Role.ADMIN && user.id !== resource.ownerId) {",
              "  throw new ForbiddenException(\"You do not possess the required RBAC permissions to modify this project.\");",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Unmasking Prisma database exceptions (P2002, P2025)",
        body: [
          "By default, unhandled Prisma ORM exceptions bubble up to NestJS's default exception handler and produce an unhelpful `500 Internal Server Error` with `{\"message\": \"Internal server error\"}`.",
          "In production NestJS applications, you will install a custom `PrismaClientExceptionFilter` that maps known Prisma error codes to appropriate HTTP statuses:",
          "• `P2002` (Unique constraint failed, e.g. duplicate email) → `409 Conflict`",
          "• `P2025` (Record not found on delete/update) → `404 Not Found`",
          "• `P2003` (Foreign key constraint violation) → `422 Unprocessable Entity`",
        ],
        code: [
          {
            file: "prisma-exception.filter.ts — mapping Prisma errors to HTTP",
            lang: "ts",
            code: [
              "import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';",
              "import { Prisma } from '@prisma/client';",
              "import { FastifyReply } from 'fastify';",
              "",
              "@Catch(Prisma.PrismaClientKnownRequestError)",
              "export class PrismaClientExceptionFilter implements ExceptionFilter {",
              "  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {",
              "    const reply = host.switchToHttp().getResponse<FastifyReply>();",
              "",
              "    switch (exception.code) {",
              "      case 'P2002': {",
              "        const target = (exception.meta?.target as string[])?.join(', ') || 'field';",
              "        reply.status(HttpStatus.CONFLICT).send({",
              "          type: 'https://api.example.com/errors/conflict',",
              "          title: 'Unique Constraint Violation',",
              "          status: 409,",
              "          detail: `A record with this ${target} already exists.`,",
              "        });",
              "        break;",
              "      }",
              "      case 'P2025': {",
              "        reply.status(HttpStatus.NOT_FOUND).send({",
              "          type: 'https://api.example.com/errors/not-found',",
              "          title: 'Resource Not Found',",
              "          status: 404,",
              "          detail: 'The requested record does not exist or has already been removed.',",
              "        });",
              "        break;",
              "      }",
              "      default:",
              "        reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ status: 500, title: 'Database Error' });",
              "    }",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Guessing and altering code before inspecting network evidence",
      wrong: "Receives an API error in the browser -> immediately refactors component state and changes TypeScript types randomly.",
      right: "Receives an API error -> opens DevTools Network tab, checks the exact HTTP status code, inspects the response payload and timing waterfall, then checks server container logs.",
      explain:
        "Modifying frontend code to fix a network failure without inspecting headers and status codes frequently introduces new bugs and masks the real backend or infrastructure root cause.",
    },
    tryIt: [
      "Open the interactive 9-Step Stack Failure Diagnostic Lab above.",
      "Work through all 6 incident scenarios (DNS, Reverse Proxy, Auth Guard, DTO Validator, Prisma Collision, CORS).",
      "For each incident, formulate your hypothesis in the input box and click 'Verify Diagnosis' to check the failing layer, root cause, and definitive fix.",
      "Observe the distinct differences in response headers and timing waterfalls between proxy errors and application DTO rejections.",
    ],
    challenge: {
      prompt:
        "Write a frontend fetch error wrapper function `safeApiCall<T>` that parses RFC 7807 responses, checks for 401s to trigger automatic session refresh, and formats validation errors into a user-friendly error record.",
      hints: [
        "Check `response.ok`. If false, check `response.headers.get('content-type')` for `application/problem+json`.",
        "If status is 401, emit an auth event or call `refreshAuthToken()`.",
        "Return a Discriminated Union `{ success: true; data: T } | { success: false; error: ProblemDetails }`.",
      ],
      solution: [
        "export interface ProblemDetails {",
        "  type: string;",
        "  title: string;",
        "  status: number;",
        "  detail?: string;",
        "  invalidParams?: Array<{ name: string; reason: string }>;",
        "}",
        "",
        "export type ApiResult<T> =",
        "  | { success: true; data: T }",
        "  | { success: false; error: ProblemDetails };",
        "",
        "export async function safeApiCall<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResult<T>> {",
        "  try {",
        "    const res = await fetch(input, init);",
        "",
        "    if (res.ok) {",
        "      const data = (await res.json()) as T;",
        "      return { success: true, data };",
        "    }",
        "",
        "    const contentType = res.headers.get('content-type') || '';",
        "    let problem: ProblemDetails;",
        "",
        "    if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {",
        "      problem = await res.json();",
        "    } else {",
        "      problem = {",
        "        type: 'about:blank',",
        "        title: res.statusText || 'HTTP Error',",
        "        status: res.status,",
        "        detail: await res.text(),",
        "      };",
        "    }",
        "",
        "    if (res.status === 401) {",
        "      window.dispatchEvent(new CustomEvent('auth:expired'));",
        "    }",
        "",
        "    return { success: false, error: problem };",
        "  } catch (networkErr: any) {",
        "    return {",
        "      success: false,",
        "      error: {",
        "        type: 'https://api.example.com/errors/network-failure',",
        "        title: 'Network Socket Error',",
        "        status: 0,",
        "        detail: networkErr.message || 'Failed to connect to remote server.',",
        "      },",
        "    };",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What layer generated a response containing `502 Bad Gateway` in HTML format from `Server: nginx/1.25`?",
        options: [
          "The React component's ErrorBoundary",
          "The NestJS Controller ValidationPipe",
          "The upstream reverse proxy / web server because the backend Node process was unreachable or timed out",
          "The PostgreSQL database query planner",
        ],
        answer: 2,
        explain:
          "An HTML 502 Bad Gateway response from nginx indicates that nginx is functioning but could not communicate with the upstream application process (e.g. NestJS on port 3000).",
      },
      {
        q: "What is the key difference between HTTP 401 Unauthorized and HTTP 403 Forbidden?",
        options: [
          "401 means unauthenticated (identity missing or invalid); 403 means authenticated but lacking necessary permissions",
          "401 is used for GET requests; 403 is used for POST requests",
          "401 is an error from the database; 403 is an error from the browser",
          "401 causes a page refresh; 403 redirects to Google",
        ],
        answer: 0,
        explain:
          "401 indicates authentication failure (the request lacked valid credentials); 403 indicates authorization failure (the user is recognized but lacks permission for that resource).",
      },
      {
        q: "In a Prisma + Postgres stack, what does error code `P2002` indicate in server logs?",
        options: [
          "The database connection string is missing",
          "A unique constraint failed on a database table column (e.g. duplicate email)",
          "A foreign key record was deleted while referenced",
          "The table migration is pending",
        ],
        answer: 1,
        explain:
          "Prisma error code P2002 represents a Unique Constraint Violation in Postgres.",
      },
      {
        q: "If a browser DevTools console reports `ERR_NAME_NOT_RESOLVED` and network timing shows 3000ms in DNS, where is the failure?",
        options: [
          "The NestJS JWT verification guard",
          "The DNS resolution layer (the domain name cannot be mapped to an IP address)",
          "The CSS Flexbox layout engine",
          "The Prisma client schema file",
        ],
        answer: 1,
        explain:
          "ERR_NAME_NOT_RESOLVED means the browser's DNS lookup could not resolve the hostname to an IP address before establishing a TCP socket.",
      },
      {
        q: "Why should backend NestJS applications use custom Prisma Exception Filters?",
        options: [
          "To translate raw database error codes (like P2002, P2025) into standard HTTP responses (409 Conflict, 404 Not Found)",
          "To disable TypeScript type checking",
          "To run SQL migrations automatically during every HTTP request",
          "To allow unauthorized users to bypass password authentication",
        ],
        answer: 0,
        explain:
          "Without exception filters, Prisma runtime errors bubble up as raw 500 Internal Server Errors, masking business conflicts like duplicate registrations.",
      },
      {
        q: "What is the first step of the 9-Step Debugging Loop?",
        options: [
          "Change one line of code in the database schema",
          "Read the exact error message and full stack trace without skipping lines",
          "Restart the computer and clear npm cache",
          "Post a question on StackOverflow",
        ],
        answer: 1,
        explain:
          "Step 1 is always reading the exact error message, status code, and stack trace before forming any hypothesis.",
      },
    ],
    flashcards: [
      {
        front: "What are the 9 steps of the standard engineering debugging loop?",
        back: "1. Read Error, 2. Identify Layer, 3. Reproduce, 4. Gather Evidence, 5. Hypothesize, 6. Change One Thing, 7. Verify, 8. Explain Root Cause, 9. Prevent Regression.",
      },
      {
        front: "What causes an `ERR_NAME_NOT_RESOLVED` network error?",
        back: "DNS failure: the client operating system and resolver could not map the requested hostname to an IP address.",
      },
      {
        front: "How do you distinguish a reverse proxy 502 from an application 500?",
        back: "A 502 comes from the proxy (e.g. nginx HTML page) when the upstream app is dead; a 500 comes from the application server executing an unhandled exception.",
      },
      {
        front: "What is the semantic difference between 401 and 403?",
        back: "401 means Unauthenticated (who are you? token missing/expired); 403 means Forbidden (we know you, but your role cannot access this).",
      },
      {
        front: "What HTTP status code should a server return when a Prisma P2002 unique constraint fails?",
        back: "HTTP 409 Conflict (e.g., 'An account with this email address already exists').",
      },
      {
        front: "What HTTP status code should a server return when class-validator DTO constraints fail?",
        back: "HTTP 400 Bad Request or HTTP 422 Unprocessable Entity with RFC 7807 problem details.",
      },
      {
        front: "Why is high TTFB (Time to First Byte) indicative of server-side latency?",
        back: "TTFB measures the duration between sending the HTTP request and receiving the first byte of response, which reflects server compute, DB query time, and queue delay.",
      },
      {
        front: "What evidence confirms a CORS error in browser DevTools?",
        back: "A console message stating the preflight OPTIONS request was blocked, or the response lacked `Access-Control-Allow-Origin`.",
      },
    ],
    recap: [
      "Network and API errors span 6 architectural layers: DNS, Proxy, CORS, Auth, DTO validation, and Database.",
      "Always inspect HTTP status codes, timing waterfalls, and response bodies before modifying code.",
      "401 indicates identity/token expiration; 403 indicates permission/RBAC rejection.",
      "Prisma database errors (P2002, P2025) should be mapped via Exception Filters into standard HTTP 409 and 404 responses.",
    ],
    references: [
      { label: "MDN Web Docs — HTTP Response Status Codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
      { label: "NestJS Documentation — Exception Filters", url: "https://docs.nestjs.com/exception-filters" },
      { label: "Prisma Documentation — Error Message Reference", url: "https://www.prisma.io/docs/reference/api-reference/error-reference" },
    ],
    nextBridge:
      "Phase 7 is complete! You have mastered the web network wire and API mental models. Now you advance to Phase 8: Next.js Foundations — modern App Router, React Server Components, and production full-stack frontend architecture.",
  },
];

export const LESSON_CONTENT_P7C: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P7C.map((l) => [l.id, l]),
);

