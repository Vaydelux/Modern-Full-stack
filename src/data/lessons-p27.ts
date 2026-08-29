import type { LessonContent } from "./types";

export const LESSON_CONTENT_P27: Record<string, LessonContent> = {
  "p27-l1": {
    id: "p27-l1",
    phaseId: "p27",
    title: "The Caching Layers Map",
    level: "Advanced",
    minutes: 35,
    summary:
      "Understand the entire web caching spectrum from the user's browser to the database disk: Browser Cache, CDN/Edge, TanStack Query client cache, Next.js Data Cache, Redis Cache-Aside, and PostgreSQL Shared Buffers. Learn what each layer caches, its latency profile, and who controls invalidation.",
    prerequisites: ["p20-l3 TanStack Query & Server State", "p25-l1 Queue & Redis"],
    objectives: [
      "Map the 6 distinct caching layers traversed by a typical web request.",
      "Understand the latency differential ($0.1\\text{ms}$ browser memory vs $50\\text{ms}$ cross-region SQL round-trip).",
      "Identify the invalidation authority for each caching tier.",
    ],
    simple:
      "Caching is storing the answer to an expensive calculation in a fast-access location so you don't have to repeat the work. A request travels through multiple caches: the browser disk, the Cloudflare edge CDN, the React state cache, the backend Redis cache, and the database RAM before touching a physical hard drive.",
    why:
      "Engineers often apply caching blindly without understanding *which* layer is serving the response. This leads to horrific bugs where user A sees user B's cached private dashboard, or updates take 10 minutes to appear on screen.",
    mentalModel: {
      title: "The Chef's Mise en Place vs The Central Cold Storage",
      body:
        "The browser cache is the glass of water already on the customer's table ($0\\text{ms}$). The CDN is the waiter with a fresh pitcher at the station ($10\\text{ms}$). Redis is the pre-chopped ingredients on the chef's counter ($1\\text{ms}$). PostgreSQL is the walk-in refrigerator in the basement ($20\\text{ms}$). Disk storage is driving to the wholesale supermarket ($200\\text{ms}$).",
    },
    sections: [
      {
        heading: "1. The 6-Layer Caching Map",
        body: [
          "Every modern full-stack web application is a hierarchy of distributed memory caches:",
          "1. **Browser Cache**: Static assets (JS/CSS/images) and HTTP responses stored on user's device (0ms).",
          "2. **Client State Cache (TanStack Query / SWR)**: In-memory JavaScript heap store for API responses.",
          "3. **CDN / Edge Cache (Cloudflare, Vercel Edge)**: Geographically distributed servers caching public content close to users (10–30ms).",
          "4. **Full-Page / Framework Cache (Next.js Data Cache)**: Pre-rendered HTML fragments or memoized server functions.",
          "5. **Application Cache-Aside (Redis / Memcached)**: Key-value in-memory storage for database query results and aggregated metrics (0.5–2ms).",
          "6. **Database Cache (PostgreSQL Shared Buffers)**: In-RAM database table pages and index trees.",
        ],
        code: [
          {
            file: "caching-latency-table.ts",
            lang: "ts",
            code: [
              "// Caching Tier Comparison Matrix:",
              "// -------------------------------------------------------------",
              "// Layer             | Latency    | Storage Type | Shared Among Users?",
              "// -------------------------------------------------------------",
              "// Browser Memory   | < 1ms      | RAM (Device) | No (Single Tab)",
              "// TanStack Query   | < 1ms      | RAM (Heap)   | No (Single Session)",
              "// Edge / CDN       | 15ms - 40ms| Edge Server  | YES (Public assets only)",
              "// Redis Key-Value  | 1ms - 3ms  | RAM (Cloud)  | Configurable (Public or Per-User)",
              "// Postgres Buffers | 2ms - 10ms | RAM (DB Host)| Shared by all DB queries",
              "// Postgres Disk NVMe| 20ms - 150ms| Disk I/O    | Ground truth storage",
            ].join("\n"),
            caption: "Latency and isolation properties of web caching tiers.",
          },
        ],
      },
    ],
    mistake: {
      title: "Treating All Caches as Identical and Caching Authenticated User Data on Shared CDNs",
      wrong: [
        "// ❌ Dangerous: Sending public Cache-Control headers on an authenticated user profile API",
        "res.header('Cache-Control', 'public, max-age=3600');",
        "res.send(userPrivateProfile);",
      ].join("\n"),
      right: [
        "// ✅ Safe: Mark private data as 'private, no-cache' or use Redis scoped by userId",
        "res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');",
        "res.send(userPrivateProfile);",
      ].join("\n"),
      explain:
        "Setting `public` on authenticated routes causes Cloudflare and shared proxy caches to store User A's profile and serve it to User B.",
    },
    tryIt: [
      "Open Chrome DevTools Network Tab and inspect the 'Size' column (look for `(memory cache)` or `(disk cache)`).",
      "Inspect the response headers for `cf-cache-status` (HIT, MISS, BYPASS).",
    ],
    challenge: {
      prompt: "Which caching layer should be used to store a calculated dashboard summary of 500,000 workspace tasks that takes 3.5 seconds to compute in SQL?",
      hints: [
        "The calculation is user-specific or workspace-specific, expensive to calculate, but can tolerate 60 seconds of staleness.",
      ],
      solution: [
        "// Application Cache-Aside via Redis with a 60-second TTL and workspace-scoped key:",
        "const cacheKey = `workspace:${workspaceId}:dashboard-stats`;",
        "const cached = await redis.get(cacheKey);",
        "if (cached) return JSON.parse(cached);",
        "// Compute in PostgreSQL, then save to Redis:",
        "const stats = await computeHeavyAggregates(workspaceId);",
        "await redis.set(cacheKey, JSON.stringify(stats), 'EX', 60);",
        "return stats;",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why should authenticated API responses NEVER have `Cache-Control: public`?",
        options: [
          "It slows down the browser.",
          "Shared edge CDNs and proxies may store the private user data and serve it to other users worldwide.",
          "It invalidates the SSL certificate.",
          "PostgreSQL will reject future writes.",
        ],
        answer: 1,
        explanation:
          "Public cache headers instruct intermediate shared proxy caches (CDNs) that the response contains no private data and can be shared among all clients.",
      },
    ],
    flashcards: [
      {
        front: "What is the primary difference between Private and Public HTTP caching?",
        back: "Public caches (CDNs/proxies) store responses shared among multiple users. Private caches store responses strictly on the single user's browser.",
      },
    ],
    recap: [
      "Modern web architecture spans 6 distinct caching layers from browser to database RAM.",
      "Always understand whether a cache is private (single client) or shared (all clients).",
      "Choose caching tiers based on calculation cost and staleness tolerance.",
    ],
    references: [
      { label: "MDN Web Caching Overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching" },
    ],
    nextBridge: "Now let's master HTTP Cache Headers, ETags, and Next.js caching mechanics.",
  },

  "p27-l2": {
    id: "p27-l2",
    phaseId: "p27",
    title: "HTTP Cache Headers & Next Caching Semantics",
    level: "Advanced",
    minutes: 40,
    summary:
      "Master HTTP caching directives: `Cache-Control`, `max-age`, `s-maxage`, `stale-while-revalidate`, `must-revalidate`, and conditional requests using `ETag` and `If-None-Match` (HTTP 304 Not Modified).",
    prerequisites: ["p27-l1 The Caching Layers Map", "p16-l1 Next.js App Router"],
    objectives: [
      "Construct precise `Cache-Control` header combinations for immutable static assets vs dynamic APIs.",
      "Implement ETag validation in Fastify / NestJS returning lightweight `304 Not Modified` responses.",
      "Understand Next.js `revalidatePath` and `revalidateTag` mechanics.",
    ],
    simple:
      "When your browser asks the server 'Has this 5MB image changed since yesterday?', the server sends back an `ETag` (a short hash). Next time, the browser sends `If-None-Match: \"hash\"`. If unchanged, the server responds with a 0-byte `304 Not Modified` header in 5ms without transferring the 5MB file.",
    why:
      "Improper HTTP caching headers waste gigabytes of user mobile data, increase cloud bandwidth bills, and cause browsers to display outdated CSS/JS bundles after new deployments.",
    mentalModel: {
      title: "The Book ISBN Fingerprint",
      body:
        "Instead of reading an entire 800-page encyclopedia to see if anything changed, you check the edition number (ETag). If the edition number matches your copy, you know you already have the latest version.",
    },
    sections: [
      {
        heading: "1. The Cache-Control Header Directives",
        body: [
          "**`max-age=N`**: Number of seconds a browser may use the cached response.",
          "**`s-maxage=N`**: Overrides `max-age` specifically for shared caches (CDNs).",
          "**`stale-while-revalidate=N`**: Serve stale data instantly while fetching fresh data in the background.",
          "**`no-cache`**: Browser must revalidate with the server (`ETag`) before using cached copy.",
          "**`no-store`**: Do not write this response to disk or memory anywhere.",
          "**`immutable`**: File will NEVER change (used with hashed bundle filenames like `app-a8f3d.js`).",
        ],
        code: [
          {
            file: "cache-control-recipes.ts",
            lang: "ts",
            code: [
              "// 1. Immutable Static Bundles (Vite/Next JS & CSS with content hashes in filename):",
              "// 'Cache forever; if code changes, filename hash changes'",
              "res.header('Cache-Control', 'public, max-age=31536000, immutable');",
              "",
              "// 2. Public Marketing Pages or Documentation:",
              "// 'Browser caches for 10 min, CDN caches for 1 hour, serve stale up to 1 day while updating'",
              "res.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');",
              "",
              "// 3. Authenticated User Dashboard API:",
              "// 'Revalidate every single time, never share on CDN'",
              "res.header('Cache-Control', 'private, no-cache');",
              "",
              "// 4. Highly Sensitive Auth / Billing / Token Endpoints:",
              "// 'Never write to any disk or memory'",
              "res.header('Cache-Control', 'no-store, no-cache, must-revalidate');",
            ].join("\n"),
            caption: "The 4 essential Cache-Control recipes for production web applications.",
          },
        ],
      },
      {
        heading: "2. ETags and Conditional 304 Responses in Fastify",
        body: [
          "Fastify includes built-in `@fastify/etag` support. When a request includes `If-None-Match: <hash>`, Fastify automatically halts payload transfer and sends an empty HTTP 304 status code.",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import fastifyEtag from '@fastify/etag';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create<NestFastifyApplication>(",
              "    AppModule,",
              "    new FastifyAdapter(),",
              "  );",
              "",
              "  // Enable automatic ETag generation for all GET responses",
              "  await app.register(fastifyEtag);",
              "",
              "  await app.listen(3000, '0.0.0.0');",
              "}",
            ].join("\n"),
            caption: "Registering Fastify ETag middleware in NestJS.",
          },
        ],
      },
    ],
    mistake: {
      title: "Setting `immutable` on `index.html`",
      wrong: [
        "// ❌ If index.html is cached with immutable, users will NEVER receive new app deployments!",
        "app.use(express.static('dist', { maxAge: '1y', immutable: true }));",
      ].join("\n"),
      right: [
        "// ✅ HTML files must use `no-cache` so browsers check for updated JS bundle script tags on every visit",
        "// Static assets in /assets/* (which have content hashes) use max-age=1y, immutable",
      ].join("\n"),
      explain:
        "If `index.html` is cached immutably, user browsers will never request the new HTML that points to newly deployed JavaScript hashes.",
    },
    tryIt: [
      "Make a GET request to an API endpoint using curl: `curl -i http://localhost:3000/api/v1/projects` to copy the `ETag` header.",
      "Re-run with `curl -i -H 'If-None-Match: \"<ETAG_VALUE>\"' http://localhost:3000/api/v1/projects` and observe the `304 Not Modified` status code.",
    ],
    challenge: {
      prompt: "What headers should you attach to a public product catalog API that updates roughly once every 5 minutes and can be cached on Cloudflare CDN?",
      hints: [
        "Use `public`, `max-age=60`, `s-maxage=300`, and `stale-while-revalidate=600`.",
      ],
      solution: [
        "@Get('catalog')",
        "@Header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')",
        "async getCatalog() {",
        "  return this.catalogService.findAll();",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What HTTP status code is returned when a client's `If-None-Match` header matches the server's current ETag?",
        options: [
          "200 OK",
          "204 No Content",
          "304 Not Modified",
          "412 Precondition Failed",
        ],
        answer: 2,
        explanation:
          "HTTP 304 Not Modified informs the client that its cached representation is still fresh and avoids transferring the response body.",
      },
    ],
    flashcards: [
      {
        front: "What does the `immutable` directive in `Cache-Control` mean?",
        back: "It indicates that the file content will never change during its lifetime, allowing browsers to skip revalidation even on page reload.",
      },
    ],
    recap: [
      "Use `immutable` only for content-hashed assets (JS, CSS, images).",
      "Always serve `index.html` with `no-cache` to enable instantaneous deployments.",
      "Leverage ETags for automatic HTTP 304 bandwidth savings on dynamic APIs.",
    ],
    references: [
      { label: "MDN Cache-Control Directives", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control" },
    ],
    nextBridge: "Now let's build a server-side Redis Cache-Aside layer with TTLs and structured key naming.",
  },

  "p27-l3": {
    id: "p27-l3",
    phaseId: "p27",
    title: "Redis Cache-Aside: Keys, TTL, Invalidation",
    level: "Advanced",
    minutes: 40,
    summary:
      "Implement the classic Cache-Aside (Lazy Loading) pattern with Redis and NestJS. Structure collision-proof hierarchical keys, configure Time-To-Live (TTL) expiration policies, and execute targeted cache invalidation on database mutations.",
    prerequisites: ["p27-l1 Caching Layers Map", "p25-l1 Redis Role"],
    objectives: [
      "Implement the standard Cache-Aside workflow: Read Cache -> (On Miss) Query DB -> Populate Cache with TTL.",
      "Design semantic cache key namespaces (e.g. `org:{orgId}:project:{id}`).",
      "Execute surgical invalidations during database writes to prevent stale reads.",
    ],
    simple:
      "In Cache-Aside, your application talks directly to both Redis and PostgreSQL. When someone requests project #42, the backend first checks Redis. If found (Cache HIT), it returns instantly. If not found (Cache MISS), it queries PostgreSQL, writes the result to Redis for 10 minutes, and returns.",
    why:
      "Querying PostgreSQL for identical data on every page view wastes database CPU. Redis in-memory lookups take 1ms and handle 50,000 requests per second with negligible CPU usage.",
    mentalModel: {
      title: "The Reference Sticky Note on the Computer Monitor",
      body:
        "When customers frequently ask for the Wi-Fi password, the receptionist writes it on a sticky note attached to the screen (Redis Cache). If the note falls off (TTL expired), the receptionist looks up the official contract in the file cabinet (Postgres DB) and writes a new sticky note.",
    },
    sections: [
      {
        heading: "1. Implementing the Cache-Aside Pattern",
        body: [
          "Encapsulate cache-aside logic in a reusable NestJS service or decorator.",
        ],
        code: [
          {
            file: "src/cache/cache-aside.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "import { Redis } from 'ioredis';",
              "",
              "@Injectable()",
              "export class CacheService {",
              "  private readonly logger = new Logger(CacheService.name);",
              "  private readonly redis: Redis;",
              "",
              "  constructor() {",
              "    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');",
              "  }",
              "",
              "  async getOrSet<T>(",
              "    key: string,",
              "    ttlSeconds: number,",
              "    fetchFn: () => Promise<T>,",
              "  ): Promise<T> {",
              "    try {",
              "      const cached = await this.redis.get(key);",
              "      if (cached) {",
              "        return JSON.parse(cached) as T; // Cache HIT",
              "      }",
              "    } catch (err) {",
              "      this.logger.warn(`Redis GET failed for key ${key}: ${(err as Error).message}`);",
              "      // Fallback to DB gracefully if Redis is temporarily unreachable",
              "    }",
              "",
              "    // Cache MISS: Execute DB query",
              "    const freshData = await fetchFn();",
              "",
              "    try {",
              "      if (freshData !== null && freshData !== undefined) {",
              "        await this.redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);",
              "      }",
              "    } catch (err) {",
              "      this.logger.warn(`Redis SET failed for key ${key}: ${(err as Error).message}`);",
              "    }",
              "",
              "    return freshData;",
              "  }",
              "",
              "  async del(key: string): Promise<void> {",
              "    await this.redis.del(key);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Generic, resilient Cache-Aside helper with graceful error degradation.",
          },
        ],
      },
      {
        heading: "2. Key Design and Write-Through Invalidation",
        body: [
          "Keys must be namespaced logically to avoid collision across entities: `entity:id` or `workspace:id:collection`. When updating or deleting an entity in PostgreSQL, invalidate the corresponding cache key immediately.",
        ],
        code: [
          {
            file: "src/projects/projects.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { CacheService } from '../cache/cache-aside.service';",
              "",
              "@Injectable()",
              "export class ProjectsService {",
              "  constructor(",
              "    private readonly prisma: PrismaService,",
              "    private readonly cache: CacheService,",
              "  ) {}",
              "",
              "  async findById(id: string) {",
              "    const cacheKey = `project:${id}`;",
              "    return this.cache.getOrSet(cacheKey, 600, () =>",
              "      this.prisma.project.findUnique({ where: { id } })",
              "    );",
              "  }",
              "",
              "  async update(id: string, dto: UpdateProjectDto) {",
              "    const updated = await this.prisma.project.update({",
              "      where: { id },",
              "      data: dto,",
              "    });",
              "",
              "    // Surgical cache invalidation on write",
              "    await this.cache.del(`project:${id}`);",
              "    return updated;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Read cached project with instant invalidation on mutation.",
          },
        ],
      },
    ],
    mistake: {
      title: "Setting Cache Keys Without an Expiration TTL ('Infinite Cache')",
      wrong: [
        "// ❌ Key stored forever; if an external update happens, key remains stale indefinitely",
        "await redis.set(`user:${id}`, JSON.stringify(user));",
      ].join("\n"),
      right: [
        "// ✅ Always specify 'EX' with an expiration in seconds (e.g. 1 hour = 3600)",
        "await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);",
      ].join("\n"),
      explain:
        "Setting keys without TTL causes Redis memory leaks over time and guarantees permanent stale data if an invalidation bug occurs.",
    },
    tryIt: [
      "Query a project endpoint twice and note the execution time drops from 35ms to 1ms on the second call.",
      "Run `redis-cli ttl project:<id>` to inspect the remaining seconds before expiration.",
    ],
    challenge: {
      prompt: "How can you invalidate all cached lists and individual records for an entire workspace when a workspace is archived?",
      hints: [
        "Use Redis key scanning or maintain a version tag in Redis (e.g., `ws:${id}:v`).",
      ],
      solution: [
        "// Versioned Cache Key Pattern (avoiding expensive redis.keys('*')):",
        "async function getWorkspaceVersion(workspaceId: string): Promise<number> {",
        "  return (await redis.incr(`ws:${workspaceId}:version`)); // Incrementing bumps version",
        "}",
        "// Read key becomes: `ws:${workspaceId}:v${version}:projects`",
        "// Bumping the version instantly invalidates all associated sub-keys without deleting them one-by-one!",
      ].join("\n"),
    },
    quiz: [
      {
        question: "In the Cache-Aside pattern, what happens when a Cache Miss occurs?",
        options: [
          "The server throws a 404 Not Found error.",
          "The application queries the database, writes the result to Redis with a TTL, and returns the data.",
          "Redis queries PostgreSQL automatically without application intervention.",
          "The request is placed into a background BullMQ queue.",
        ],
        answer: 1,
        explanation:
          "In Cache-Aside, the application is responsible for querying the primary database on cache misses and repopulating Redis.",
      },
    ],
    flashcards: [
      {
        front: "What is Cache-Aside (Lazy Loading)?",
        back: "A caching pattern where the application reads from cache first, queries the database on misses, writes the fetched data into the cache, and invalidates on writes.",
      },
    ],
    recap: [
      "Cache-Aside reduces database read pressure by storing frequent queries in Redis.",
      "Always set an explicit TTL (`'EX', seconds`) on all Redis cache keys.",
      "Invalidate cached keys immediately during database update/delete mutations.",
    ],
    references: [
      { label: "Redis Caching Best Practices", url: "https://redis.io/docs/manual/client-side-caching/" },
    ],
    nextBridge: "Next, let's explore Stale-While-Revalidate and Cache Stampede (Thundering Herd) protections.",
  },
};
