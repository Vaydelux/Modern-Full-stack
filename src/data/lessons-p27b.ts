import type { LessonContent } from "./types";

export const LESSON_CONTENT_P27B: Record<string, LessonContent> = {
  "p27-l4": {
    id: "p27-l4",
    phaseId: "p27",
    title: "Stale-While-Revalidate & Stampede Concepts",
    level: "Mastery",
    minutes: 35,
    summary:
      "Prevent catastrophic Cache Stampedes (Thundering Herd problem). Learn how hundreds of concurrent requests hitting an expired cache key simultaneously can crash your database, and implement distributed locks and Stale-While-Revalidate (SWR) background refreshes.",
    prerequisites: ["p27-l3 Redis Cache-Aside", "p25-l1 Redis Role"],
    objectives: [
      "Understand the mechanics of a Cache Stampede / Thundering Herd failure.",
      "Implement single-flight promise coalescence / distributed mutex locking in Redis.",
      "Configure SWR semantics to serve near-instant stale responses while a single background worker refreshes the cache.",
    ],
    simple:
      "Imagine an expensive home page metric that takes 4 seconds to calculate. If 1,000 visitors arrive at the exact second the cache expires, all 1,000 requests miss the cache and simultaneously run the heavy 4-second SQL query on PostgreSQL, crashing the database. A distributed lock ensures only 1 request recalculates while the other 999 either wait or receive stale data.",
    why:
      "Cache stampedes are the #1 cause of database outages after high-traffic marketing campaigns or cache invalidations. Mitigating stampedes is required for high-availability systems.",
    mentalModel: {
      title: "The Coffee Pot at the Morning Meeting",
      body:
        "When the coffee pot runs empty (Cache Miss), you don't send all 40 meeting attendees into the small kitchen to brew 40 pots of coffee at once. One designated person goes to brew a fresh pot, while the rest wait in the conference room.",
    },
    sections: [
      {
        heading: "1. The Anatomy of a Thundering Herd",
        body: [
          "Under high concurrent traffic, key expiration creates an instant surge of duplicate database queries that consumes connection pools and spikes CPU to 100%.",
        ],
        code: [
          {
            file: "stampede-flow.ts",
            lang: "ts",
            code: [
              "// Without Stampede Protection:",
              "// Time T0: Key 'leaderboard' expires.",
              "// Time T0.01: 500 requests arrive concurrently.",
              "// All 500 see cache MISS -> All 500 run: SELECT * FROM heavy_aggregates()",
              "// Result: Postgres connection pool exhausted, 504 Gateway Timeout on all 500 requests.",
              "",
              "// With Distributed Lock Protection (Single-Flight):",
              "// Request 1 acquires Redis lock: SET lock:leaderboard 'locked' NX PX 5000",
              "// Request 1 computes query and updates Redis key.",
              "// Requests 2-500 see the lock and either wait 100ms or receive last-known stale data.",
            ].join("\n"),
            caption: "The Thundering Herd problem vs Distributed Mutex protection.",
          },
        ],
      },
      {
        heading: "2. Implementing Mutex Lock for Cache Regeneration",
        body: [
          "Use Redis `SET key val NX PX <ms>` to ensure only one process calculates the expensive query.",
        ],
        code: [
          {
            file: "src/cache/stampede-protected.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { Redis } from 'ioredis';",
              "",
              "@Injectable()",
              "export class ResilientCacheService {",
              "  private readonly redis: Redis;",
              "",
              "  constructor() {",
              "    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');",
              "  }",
              "",
              "  async getOrComputeWithLock<T>(",
              "    key: string,",
              "    ttlSeconds: number,",
              "    computeFn: () => Promise<T>,",
              "  ): Promise<T> {",
              "    const cached = await this.redis.get(key);",
              "    if (cached) return JSON.parse(cached);",
              "",
              "    const lockKey = `lock:${key}`;",
              "    // Try to acquire distributed lock for 10 seconds (NX = only if not exists)",
              "    const acquired = await this.redis.set(lockKey, '1', 'PX', 10000, 'NX');",
              "",
              "    if (acquired === 'OK') {",
              "      try {",
              "        const fresh = await computeFn();",
              "        await this.redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);",
              "        return fresh;",
              "      } finally {",
              "        await this.redis.del(lockKey);",
              "      }",
              "    } else {",
              "      // Another worker is already computing! Wait 200ms and retry reading cache",
              "      await new Promise((res) => setTimeout(res, 200));",
              "      return this.getOrComputeWithLock(key, ttlSeconds, computeFn);",
              "    }",
              "  }",
              "}",
            ].join("\n"),
            caption: "Stampede-proof Redis cache helper using atomic mutex locks.",
          },
        ],
      },
    ],
    mistake: {
      title: "Setting Mutex Locks Without Expiration TTLs",
      wrong: [
        "// ❌ If the Node process crashes mid-calculation, the lock is held forever and all future requests hang!",
        "await redis.set(`lock:${key}`, '1', 'NX');",
      ].join("\n"),
      right: [
        "// ✅ Always provide 'PX' (millisecond TTL) so locks auto-expire if the worker dies",
        "await redis.set(`lock:${key}`, '1', 'PX', 5000, 'NX');",
      ].join("\n"),
      explain:
        "Deadlocks occur when distributed locks fail to specify timeouts and the holding worker crashes before reaching the `finally` block.",
    },
    tryIt: [
      "Simulate 50 concurrent requests using `Promise.all()` calling an uncached endpoint.",
      "Verify in your PostgreSQL logs that the heavy query only executes exactly ONCE.",
    ],
    challenge: {
      prompt: "What is Probabilistic Early Expiration (the XFetch algorithm) and how does it prevent stampedes without locks?",
      hints: [
        "It uses a formula based on remaining TTL and computation time to asynchronously refresh the cache *before* it actually hits 0 seconds.",
      ],
      solution: [
        "// XFetch algorithm concept:",
        "// delta = time taken to compute (e.g. 500ms)",
        "// beta = aggressiveness factor (> 0)",
        "// If: currentTime - delta * beta * ln(random()) > expirationTime",
        "// Then: Trigger background recomputation while serving current cached value!",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What is the Thundering Herd (Cache Stampede) problem?",
        options: [
          "When too many Redis servers are connected in a cluster.",
          "When a hot cache key expires and thousands of concurrent requests simultaneously hit the database to recompute it.",
          "When an email queue sends 10,000 emails in 1 second.",
          "When a hard drive runs out of disk space.",
        ],
        answer: 1,
        explanation:
          "Cache stampedes occur when simultaneous requests arrive during a cache miss window on a heavy computation, overwhelming the database.",
      },
    ],
    flashcards: [
      {
        front: "How does Redis `SET lockKey '1' PX 5000 NX` prevent cache stampedes?",
        back: "It atomically grants compute permission to exactly one process while ensuring the lock auto-expires in 5s if the process crashes.",
      },
    ],
    recap: [
      "Hot cache key expiration causes thundering herd database crashes.",
      "Use distributed locks (`NX PX`) or single-flight coalescence to ensure only 1 process computes fresh data.",
      "Combine locking with SWR semantics to keep user response times under 5ms.",
    ],
    references: [
      { label: "Optimal Probabilistic Cache Invalidation (XFetch)", url: "https://en.wikipedia.org/wiki/Cache_stampede" },
    ],
    nextBridge: "Now let's examine private data leak risks and mutation-driven invalidation strategies.",
  },

  "p27-l5": {
    id: "p27-l5",
    phaseId: "p27",
    title: "Private Data Risks & Mutation-Driven Invalidation",
    level: "Mastery",
    minutes: 35,
    summary:
      "Avoid catastrophic multi-tenant data leaks caused by incorrect cache key scopes. Implement mutation-driven cache invalidation patterns (direct keys, version tags, and Redis key prefixes) that guarantee immediate consistency for users.",
    prerequisites: ["p27-l3 Redis Cache-Aside", "p17-l3 Multi-Tenant RBAC"],
    objectives: [
      "Guarantee strict tenant and user scoping in all cache keys (`tenant:{id}:user:{id}:key`).",
      "Prevent multi-tenant data bleed vulnerabilities in shared cache layers.",
      "Execute mutation-driven invalidations across related parent and child entities.",
    ],
    simple:
      "If you cache an invoice report under the generic key `cache:latest-invoice` instead of `cache:org-123:user-456:latest-invoice`, Customer A will see Customer B's confidential billing information and credit card details. Cache keys MUST always include explicit tenant and user identifiers.",
    why:
      "Cache leakage is a severe security vulnerability. Storing user-specific or organization-specific data under unscoped keys violates GDPR/SOC2 compliance and leaks sensitive records.",
    mentalModel: {
      title: "The Post Office Safety Deposit Boxes",
      body:
        "Every safety deposit box must have a unique box number matching the customer's key. If the post office put all packages into a single unlabelled box on the counter, the next visitor would walk away with someone else's passport and tax returns.",
    },
    sections: [
      {
        heading: "1. Semantic Namespace Hierarchy",
        body: [
          "Adopt a standardized namespace convention across your entire engineering team: `env:service:tenant:entity:id:scope`.",
        ],
        code: [
          {
            file: "src/cache/key-builder.ts",
            lang: "ts",
            code: [
              "export class CacheKeyBuilder {",
              "  private static prefix = process.env.NODE_ENV || 'development';",
              "",
              "  static workspaceKey(workspaceId: string, resource: string): string {",
              "    return `${this.prefix}:ws:${workspaceId}:${resource}`;",
              "  }",
              "",
              "  static userProfileKey(userId: string): string {",
              "    return `${this.prefix}:user:${userId}:profile`;",
              "  }",
              "",
              "  static taskDetailKey(workspaceId: string, taskId: string): string {",
              "    return `${this.prefix}:ws:${workspaceId}:task:${taskId}`;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Collision-proof namespaced key builder.",
          },
        ],
      },
      {
        heading: "2. Multi-Entity Mutation Invalidation",
        body: [
          "Updating a child entity (e.g. adding a task to a project) requires invalidating both the individual task key AND the parent project task list cache key.",
        ],
        code: [
          {
            file: "src/tasks/tasks-cache.service.ts",
            lang: "ts",
            code: [
              "async updateTaskStatus(workspaceId: string, taskId: string, projectId: string, status: string) {",
              "  const updated = await this.prisma.task.update({",
              "    where: { id: taskId },",
              "    data: { status },",
              "  });",
              "",
              "  // Invalidate both the task item AND the parent project task list cache",
              "  await Promise.all([",
              "    this.cache.del(CacheKeyBuilder.taskDetailKey(workspaceId, taskId)),",
              "    this.cache.del(CacheKeyBuilder.workspaceKey(workspaceId, `project:${projectId}:tasks`)),",
              "    this.cache.del(CacheKeyBuilder.workspaceKey(workspaceId, 'dashboard-metrics')),",
              "  ]);",
              "",
              "  return updated;",
              "}",
            ].join("\n"),
            caption: "Invalidating parent and aggregate caches on child mutation.",
          },
        ],
      },
    ],
    mistake: {
      title: "Omitting Tenant ID from Cache Keys in Multi-Tenant Applications",
      wrong: [
        "// ❌ Bug: Key does not include organizationId. Org B will see Org A's invoices!",
        "const key = `invoices:recent`;",
        "await cache.getOrSet(key, 300, () => getInvoices());",
      ].join("\n"),
      right: [
        "// ✅ Scoped strictly to the requesting organization",
        "const key = `org:${orgId}:invoices:recent`;",
        "await cache.getOrSet(key, 300, () => getInvoices(orgId));",
      ].join("\n"),
      explain:
        "Global unscoped cache keys in multi-tenant architectures result in cross-tenant data exposure.",
    },
    tryIt: [
      "Review your existing Redis keys using `redis-cli keys '*'`.",
      "Verify that all application keys contain environment prefixes and tenant/user identifiers.",
    ],
    challenge: {
      prompt: "How can you test for cache isolation in an automated integration test?",
      hints: [
        "Write a test where User A reads an endpoint, User B updates their own data, and verify User A's subsequent read returns User A's data without contamination.",
      ],
      solution: [
        "it('should not leak cached workspace settings across different tenants', async () => {",
        "  await request(app).get('/api/ws/1/settings').set('Authorization', 'Bearer tokenA');",
        "  const resB = await request(app).get('/api/ws/2/settings').set('Authorization', 'Bearer tokenB');",
        "  expect(resB.body.workspaceId).toBe('2');",
        "  expect(resB.body.name).not.toBe('Workspace A');",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why must every cache key in a multi-tenant SaaS application include the tenant ID?",
        options: [
          "Redis requires keys to be at least 20 characters long.",
          "To guarantee strict isolation and prevent Customer A from seeing Customer B's confidential data.",
          "PostgreSQL cannot query without a tenant ID.",
          "To speed up DNS resolution.",
        ],
        answer: 1,
        explanation:
          "Tenant scoping in cache keys guarantees cryptographic and logical isolation across distinct organizations.",
      },
    ],
    flashcards: [
      {
        front: "What is the Golden Rule of multi-tenant caching?",
        back: "Never create a cache key for user-authored or private business records without including the tenant and/or user ID in the key name.",
      },
    ],
    recap: [
      "Scope every cache key with environment and tenant identifiers.",
      "Invalidate parent aggregate caches whenever child entities are mutated.",
      "Enforce cache isolation in automated integration test suites.",
    ],
    references: [
      { label: "OWASP Multi-Tenancy Security Guidance", url: "https://cheatsheetseries.owasp.org" },
    ],
    nextBridge: "In the final lesson of Phase 27, we explore debugging stale data and the critical checklist for When NOT to Cache.",
  },

  "p27-l6": {
    id: "p27-l6",
    phaseId: "p27",
    title: "Lab: Debugging Stale Data & When NOT to Cache",
    level: "Mastery",
    minutes: 40,
    summary:
      "Explore 5 real-world stale data failure scenarios and develop a diagnostic methodology. Master the definitive 'When NOT to Cache' engineering checklist (inventory balances, auth tokens, financial ledgers, low-frequency queries).",
    prerequisites: ["p27-l1 to p27-l5"],
    objectives: [
      "Diagnose multi-layer stale data bugs (Browser vs CDN vs Redis vs TanStack Query).",
      "Apply the 'When NOT to Cache' checklist before introducing caching complexity.",
      "Understand the operational cost of cache maintenance and invalidation bugs.",
    ],
    simple:
      "There are only two hard things in Computer Science: cache invalidation and naming things. Before adding a cache, ask: 'Can we just add an index to PostgreSQL instead?' Adding an index makes queries 100x faster with ZERO invalidation bugs and 100% real-time accuracy.",
    why:
      "Premature caching introduces distributed state synchronization bugs, stale UI flickers, and silent business logic failures. Knowing when NOT to cache is a hallmark of senior engineering.",
    mentalModel: {
      title: "The Stock Exchange Ticker vs The Phone Directory",
      body:
        "A phone directory changes once a year; print it and cache it everywhere. A stock exchange price or live bank balance changes every 10 milliseconds and financial decisions depend on accuracy; NEVER cache it.",
    },
    sections: [
      {
        heading: "1. The 'When NOT to Cache' Decision Checklist",
        body: [
          "Do NOT cache if any of the following are true:",
          "1. **Financial & Ledger Balances**: Bank accounts, inventory stock levels, checkout cart totals (requires strict serializability).",
          "2. **Authentication & Permissions**: Revoked sessions, banned user status, MFA codes.",
          "3. **Fast Queries ($<5\\text{ms}$)**: If an indexed PostgreSQL query takes 2ms, caching in Redis saves 1ms but introduces 50 lines of invalidation risk.",
          "4. **Low Read-to-Write Ratio**: If an entity is updated every time it is read (1:1 read/write), cache hit rate will be 0%.",
          "5. **High Cardinality Search Filters**: Caching user search queries with 10 random filter combinations yields almost zero cache reuse.",
        ],
        code: [
          {
            file: "cache-decision-matrix.ts",
            lang: "ts",
            code: [
              "// Step 1: Is the query slow? (>50ms)",
              "//   NO  -> Stop. Do NOT cache. Rely on Postgres index.",
              "//   YES -> Can we optimize with an index or query rewrite?",
              "//     YES -> Add the index. Avoid cache.",
              "//     NO  -> Proceed to Step 2.",
              "",
              "// Step 2: Is the data read far more often than it is written? (Read:Write > 20:1)",
              "//   NO  -> Stop. Cache hit rate will be too low.",
              "//   YES -> Proceed to Step 3.",
              "",
              "// Step 3: Can the user tolerate 1-60 seconds of staleness?",
              "//   NO  -> Stop. Requires real-time ACID reads.",
              "//   YES -> ✅ Safe to apply Redis Cache-Aside with TTL + Invalidation.",
            ].join("\n"),
            caption: "The senior engineer's 3-step caching decision flowchart.",
          },
        ],
      },
      {
        heading: "2. The Stale Data Troubleshooting Triage",
        body: [
          "When a user reports 'I changed my name but it still shows the old name', trace the 4 caching tiers:",
          "1. **Browser Cache**: Did the browser cache the GET response? (Check Network Tab `Cache-Control` header).",
          "2. **Client State**: Did TanStack Query invalidate its query key (`queryClient.invalidateQueries({ queryKey: ['profile'] })`)?",
          "3. **Edge CDN**: Did Cloudflare cache the response with `public` header?",
          "4. **Redis Cache**: Did the backend update mutation call `redis.del(key)`?",
        ],
        code: [
          {
            file: "debugging-stale-cache.sh",
            lang: "bash",
            code: [
              "# 1. Bypass CDN and browser to test origin server directly:",
              "curl -H 'Cache-Control: no-cache' -H 'Authorization: Bearer $TOKEN' https://api.taskforge.dev/api/v1/profile",
              "",
              "# 2. Check Redis directly:",
              "redis-cli get 'production:user:123:profile'",
              "",
              "# 3. Check PostgreSQL ground truth:",
              "psql $DATABASE_URL -c \"SELECT name, updated_at FROM users WHERE id = '123';\"",
            ].join("\n"),
            caption: "Triaging stale data across server tiers.",
          },
        ],
      },
    ],
    mistake: {
      title: "Adding Redis to Fix a Slow Query Caused by a Missing Database Index",
      wrong: [
        "// ❌ Query took 3000ms because of missing index on workspaceId -> developer added Redis cache",
        "// Result: First user still waits 3000ms; every update requires complex invalidation",
      ].join("\n"),
      right: [
        "// ✅ Added index in Prisma: @@index([workspaceId, status])",
        "// Result: Query runs in 3ms for EVERY user with ZERO cache invalidation overhead",
      ].join("\n"),
      explain:
        "Caching is not a substitute for proper database indexing and schema design. Always optimize the database first.",
    },
    tryIt: [
      "Run an `EXPLAIN ANALYZE` on a slow query before deciding to cache it.",
      "Confirm that an index improves execution time to $<5\\text{ms}$ before reaching for Redis.",
    ],
    challenge: {
      prompt: "A developer wants to cache inventory stock levels for an e-commerce flash sale in Redis. What critical concurrency issue will occur?",
      hints: [
        "Think about overselling and race conditions when multiple buyers purchase the last 3 items simultaneously.",
      ],
      solution: [
        "// If stock is cached in Redis without atomic transactional decrements (DECRBY or Postgres row locks),",
        "// multiple concurrent checkout requests will read the same cached stock balance and oversell inventory.",
        "// Solution: Use Postgres SELECT ... FOR UPDATE or Redis atomic DECRBY with stock checks.",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What is the first step before introducing a Redis cache to speed up a slow query?",
        options: [
          "Upgrade the Redis server to 64GB RAM.",
          "Check if a database index or query optimization can resolve the latency directly in PostgreSQL.",
          "Add Cloudflare CDN in front of the API.",
          "Rewrite the backend in Go.",
        ],
        answer: 1,
        explanation:
          "Database query optimization and proper indexing provide sub-millisecond responses without the synchronization and invalidation liabilities of external caching.",
      },
    ],
    flashcards: [
      {
        front: "What is the 'When NOT to Cache' checklist?",
        back: "Do not cache: financial balances, inventory counts, auth permissions, fast indexed queries (<5ms), or write-heavy low-reuse queries.",
      },
    ],
    recap: [
      "Always optimize database indexes before introducing a cache.",
      "Never cache financial balances or permission tokens.",
      "Follow systematic triage across browser, CDN, client state, and Redis when debugging stale data.",
    ],
    references: [
      { label: "Things Every Programmer Should Know About SEO and Caching", url: "https://martinfowler.com/bliki/TwoHardThings.html" },
    ],
    nextBridge: "Phase 27 is complete! Next up is Phase 28: Rate Limiting & Abuse Prevention to protect your APIs from traffic surges and brute-force attacks.",
  },
};
