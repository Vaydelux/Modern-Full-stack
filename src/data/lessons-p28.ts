import type { LessonContent } from "./types";

export const LESSON_CONTENT_P28: Record<string, LessonContent> = {
  "p28-l1": {
    id: "p28-l1",
    phaseId: "p28",
    title: "Windows & Buckets: Limiting Algorithms",
    level: "Advanced",
    minutes: 35,
    summary:
      "Understand the mathematical models behind rate limiting: Fixed Window, Sliding Window Log, Sliding Window Counter, and Token Bucket. Learn the trade-offs between memory consumption, accuracy, and burst tolerance.",
    prerequisites: ["p27-l1 Caching Layers Map", "p25-l1 Redis Primitives"],
    objectives: [
      "Compare Fixed Window vs Sliding Window vs Token Bucket algorithms.",
      "Understand the 'boundary burst' flaw of fixed window limiters.",
      "Select the right rate limiting algorithm for different API workloads.",
    ],
    simple:
      "Rate limiting restricts how many requests a user or IP address can make in a given timeframe (e.g., 100 requests per minute). If a bot tries to send 5,000 requests in 3 seconds to crack passwords, the rate limiter blocks them with HTTP 429 Too Many Requests.",
    why:
      "Without rate limiting, a single rogue script or distributed denial of service (DDoS) attempt can exhaust database connections, spike cloud infrastructure bills, or scrape your entire database.",
    mentalModel: {
      title: "The Nightclub Bouncer with a Counter Clicker",
      body:
        "The bouncer allows 10 people in per minute. If a crowd of 50 arrives at once, the bouncer lets 10 enter, holds the other 40 in line behind the velvet rope (Queue/Rate Limit), and tells them to wait for the next time slot (Retry-After).",
    },
    sections: [
      {
        heading: "1. The 4 Rate Limiting Algorithms",
        body: [
          "1. **Fixed Window**: Counts requests in discrete time blocks (e.g., 12:00:00 - 12:00:59). Simple, but vulnerable to 2x burst traffic at the boundary window (e.g. 100 requests at 12:00:59 + 100 requests at 12:01:00).",
          "2. **Sliding Window Log**: Stores a timestamp for every request in a Redis Sorted Set (ZSET). 100% accurate, but high memory usage ($O(N)$ memory per user).",
          "3. **Sliding Window Counter**: Hybrid approach that weights the previous window count with the current window percentage: $\\text{Count} = \\text{prevCount} \\times (1 - \\text{percentElapsed}) + \\text{currCount}$. Low memory ($O(1)$) with $\\sim 99.9\\%$ accuracy. Industry standard.",
          "4. **Token Bucket**: A bucket with capacity $C$ continuously fills with tokens at rate $R$ per second. Allows smooth burst traffic up to capacity $C$. Standard for public developer APIs (Stripe, GitHub, OpenAI).",
        ],
        code: [
          {
            file: "algorithm-comparison.ts",
            lang: "ts",
            code: [
              "// Algorithm Selection Guide:",
              "// -------------------------------------------------------------------------",
              "// Algorithm              | Memory Cost | Burst Protection | Best Use Case",
              "// -------------------------------------------------------------------------",
              "// Fixed Window           | Very Low    | Poor (2x burst)  | Simple internal tools",
              "// Sliding Window Counter | Very Low    | Excellent        | General Web API Protection",
              "// Sliding Window Log     | High (RAM)  | Perfect          | Strict Compliance / Payments",
              "// Token Bucket           | Low         | Smooth bursts    | Public Developer APIs",
            ].join("\n"),
            caption: "Algorithmic comparison and trade-offs.",
          },
        ],
      },
    ],
    mistake: {
      title: "Relying on Fixed Window Limiting for Expensive AI or Compute Endpoints",
      wrong: [
        "// ❌ Fixed window: Limit = 10 requests / minute",
        "// Attacker sends 10 requests at 00:59s and 10 requests at 01:01s",
        "// Result: 20 heavy requests processed within a 2-second span!",
      ].join("\n"),
      right: [
        "// ✅ Use Sliding Window Counter or Token Bucket to enforce a smooth rolling limit across all 60-second intervals",
      ].join("\n"),
      explain:
        "Fixed windows allow boundary bursts where double the allowed quota can hit your server in a 2-second window across minute transitions.",
    },
    tryIt: [
      "Calculate the sliding window weighted count: If previous minute had 80 requests, current minute has 10 requests, and we are 30 seconds into the current minute (50% elapsed).",
      "Formula: $80 \\times (1 - 0.5) + 10 = 50$ requests.",
    ],
    challenge: {
      prompt: "How does the Token Bucket algorithm allow bursts while still protecting long-term throughput?",
      hints: [
        "The bucket has a maximum capacity that accommodates short bursts, but the long-term consumption is limited by the refill rate.",
      ],
      solution: [
        "// Token bucket with capacity 20 and refill rate 2 tokens/sec:",
        "// If idle, the bucket fills up to 20 tokens.",
        "// A user can burst 20 requests instantly (e.g. initial page load with multiple API fetches).",
        "// After the burst, they can only make 2 requests per second sustainably.",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Which rate limiting algorithm combines low Redis memory footprint ($O(1)$) with high sliding accuracy?",
        options: [
          "Sliding Window Counter",
          "Sliding Window Log",
          "Single Window Log",
          "Thread Sleep Pool",
        ],
        answer: 0,
        explanation:
          "Sliding Window Counter approximates the rolling window using weighted counters from current and previous windows with minimal memory.",
      },
    ],
    flashcards: [
      {
        front: "What is the primary flaw of Fixed Window rate limiting?",
        back: "Boundary bursts: clients can send 100% of their quota at the very end of window A and 100% at the start of window B, resulting in a 2x traffic spike.",
      },
    ],
    recap: [
      "Fixed window is simple but susceptible to boundary bursts.",
      "Sliding Window Counter is the production standard for general web APIs.",
      "Token Bucket is ideal for developer APIs requiring burst tolerance.",
    ],
    references: [
      { label: "Cloudflare: Rate Limiting Algorithms", url: "https://www.cloudflare.com/learning/bots/what-is-rate-limiting/" },
    ],
    nextBridge: "Now let's configure `@nestjs/throttler` on NestJS and Fastify.",
  },

  "p28-l2": {
    id: "p28-l2",
    phaseId: "p28",
    title: "NestJS + Fastify Integration Options",
    level: "Advanced",
    minutes: 35,
    summary:
      "Integrate `@nestjs/throttler` with NestJS and Fastify. Configure global guards, named throttling tiers (short, medium, long), per-route overrides (`@Throttle()`), and custom IP extraction logic.",
    prerequisites: ["p28-l1 Limiting Algorithms", "p21-l2 Fastify Architecture"],
    objectives: [
      "Configure `ThrottlerModule` with multiple named rate limit tiers.",
      "Apply global `ThrottlerGuard` across all controllers.",
      "Override or bypass rate limits on specific routes using `@Throttle()` and `@SkipThrottle()`.",
    ],
    simple:
      "In NestJS, you can set a global policy: 'No client can exceed 100 requests per minute.' You can then customize specific routes: 'The password reset endpoint is limited to 5 requests per 15 minutes, while health check endpoints skip throttling entirely.'",
    why:
      "A one-size-fits-all rate limit is either too loose for sensitive endpoints (allowing brute-force attacks on login) or too strict for normal UI browsing (blocking users when loading image-rich dashboards).",
    mentalModel: {
      title: "The Speed Limits on Different Roads",
      body:
        "A school zone has a strict 15 MPH speed limit (Login/Auth endpoint). A city avenue has a 35 MPH limit (General API routes). A private expressway has no limit for emergency ambulances (`@SkipThrottle()` on internal microservice calls).",
    },
    sections: [
      {
        heading: "1. Configuring ThrottlerModule with Named Tiers",
        body: [
          "NestJS Throttler v5+ allows defining multiple named limiters (e.g. `short` for burst protection and `medium` for sustained hourly protection).",
        ],
        code: [
          {
            file: "src/app.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';",
              "import { APP_GUARD } from '@nestjs/core';",
              "",
              "@Module({",
              "  imports: [",
              "    ThrottlerModule.forRoot([",
              "      {",
              "        name: 'short',",
              "        ttl: 1000, // 1 second window",
              "        limit: 10,  // Max 10 requests / sec (burst protection)",
              "      },",
              "      {",
              "        name: 'medium',",
              "        ttl: 60000, // 1 minute window",
              "        limit: 100,  // Max 100 requests / min (sustained)",
              "      },",
              "    ]),",
              "  ],",
              "  providers: [",
              "    {",
              "      provide: APP_GUARD,",
              "      useClass: ThrottlerGuard,",
              "    },",
              "  ],",
              "})",
              "export class AppModule {}",
            ].join("\n"),
            caption: "Configuring multi-tier global ThrottlerGuard in NestJS.",
          },
        ],
      },
      {
        heading: "2. Customizing Routes with @Throttle and @SkipThrottle",
        body: [
          "Apply fine-grained annotations to sensitive endpoints or high-frequency polling routes.",
        ],
        code: [
          {
            file: "src/auth/auth.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Post, Get, Body } from '@nestjs/common';",
              "import { Throttle, SkipThrottle } from '@nestjs/throttler';",
              "",
              "@Controller('auth')",
              "export class AuthController {",
              "  // Tight rate limit on login: Max 5 attempts per 60 seconds",
              "  @Throttle({ medium: { limit: 5, ttl: 60000 } })",
              "  @Post('login')",
              "  async login(@Body() dto: LoginDto) {",
              "    return this.authService.login(dto);",
              "  }",
              "",
              "  // Skip throttling on health checks",
              "  @SkipThrottle()",
              "  @Get('health')",
              "  async health() {",
              "    return { status: 'ok' };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Per-route rate limit customization.",
          },
        ],
      },
    ],
    mistake: {
      title: "Forgetting to Register the Global APP_GUARD for Throttler",
      wrong: [
        "// ❌ Imported ThrottlerModule.forRoot() but forgot APP_GUARD provider",
        "// Result: No routes are rate limited!",
      ].join("\n"),
      right: [
        "providers: [",
        "  { provide: APP_GUARD, useClass: ThrottlerGuard }, // ✅ Enforces guard across all controllers",
        "]",
      ].join("\n"),
      explain:
        "Importing `ThrottlerModule` registers the options, but without `APP_GUARD` or manual `@UseGuards(ThrottlerGuard)`, requests bypass throttling entirely.",
    },
    tryIt: [
      "Send 12 rapid curl requests in a bash loop: `for i in {1..12}; do curl -i http://localhost:3000/api/v1/projects; done`.",
      "Verify that requests 11 and 12 return `HTTP/1.1 429 Too Many Requests`.",
    ],
    challenge: {
      prompt: "How can you rate limit by authenticated `userId` instead of IP address for logged-in users?",
      hints: [
        "Extend `ThrottlerGuard` and override the `getTracker(req)` method to return `req.user?.id || req.ip`.",
      ],
      solution: [
        "import { ThrottlerGuard } from '@nestjs/throttler';",
        "import { Injectable, ExecutionContext } from '@nestjs/common';",
        "",
        "@Injectable()",
        "export class UserAwareThrottlerGuard extends ThrottlerGuard {",
        "  protected async getTracker(req: Record<string, any>): Promise<string> {",
        "    return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "How do you completely exempt an endpoint from rate limiting in NestJS?",
        options: [
          "@NoLimit()",
          "@SkipThrottle()",
          "@BypassGuard()",
          "@Public()",
        ],
        answer: 1,
        explanation:
          "The `@SkipThrottle()` decorator marks a controller or specific route handler to be bypassed by `ThrottlerGuard`.",
      },
    ],
    flashcards: [
      {
        front: "How do you customize rate limits for a specific route in NestJS?",
        back: "Use the `@Throttle({ tierName: { limit, ttl } })` decorator directly above the route handler method.",
      },
    ],
    recap: [
      "Configure `ThrottlerModule` with burst (short) and sustained (medium) tiers.",
      "Register `ThrottlerGuard` via `APP_GUARD` for universal coverage.",
      "Use `@Throttle()` on sensitive endpoints and `@SkipThrottle()` on health checks.",
    ],
    references: [
      { label: "NestJS Throttler Documentation", url: "https://docs.nestjs.com/security/rate-limiting" },
    ],
    nextBridge: "Now let's explore specialized protections for Login, File Uploads, and Expensive Search endpoints.",
  },

  "p28-l3": {
    id: "p28-l3",
    phaseId: "p28",
    title: "Protecting Login, Uploads & Expensive Endpoints",
    level: "Mastery",
    minutes: 35,
    summary:
      "Implement multi-layered abuse protection for high-risk vectors: credential stuffing / brute-force on login, multi-part file upload flood attacks, and CPU-intensive full-text search / export endpoints.",
    prerequisites: ["p28-l2 NestJS Throttler", "p17-l2 Password Security"],
    objectives: [
      "Calculate brute-force entropy math and set appropriate login threshold limits.",
      "Implement IP + Account composite keys (preventing distributed credential stuffing against a single target account).",
      "Apply cost-based / weighted rate limiting to heavy search and export queries.",
    ],
    simple:
      "An attacker with 1,000 bot IP addresses can try 1 password per IP against the CEO's account without triggering simple IP rate limits. To stop this, you must rate-limit by the TARGET email address as well as the source IP address.",
    why:
      "Credential stuffing, automated account takeover, and disk exhaustion via file uploads are top OWASP API security threats.",
    mentalModel: {
      title: "The ATM Pin Code Lockout",
      body:
        "If you enter the wrong PIN 3 times on a debit card, the card is locked regardless of which ATM machine or city you are standing in. The security lock is tied to the Account Number, not just the physical location.",
    },
    sections: [
      {
        heading: "1. Dual-Key Brute-Force Protection (IP + Email)",
        body: [
          "Track login failure counts against two independent Redis keys:",
          "1. `login:fail:ip:{ip}` (Blocks noisy attackers hitting random accounts).",
          "2. `login:fail:account:{email}` (Blocks distributed botnets attacking a single specific user).",
        ],
        code: [
          {
            file: "src/auth/login-abuse.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, HttpException, HttpStatus } from '@nestjs/common';",
              "import { Redis } from 'ioredis';",
              "",
              "@Injectable()",
              "export class LoginAbuseService {",
              "  private readonly redis: Redis;",
              "",
              "  constructor() {",
              "    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');",
              "  }",
              "",
              "  async checkAndIncrement(ip: string, email: string) {",
              "    const ipKey = `abuse:login:ip:${ip}`;",
              "    const accountKey = `abuse:login:account:${email.toLowerCase()}`;",
              "",
              "    const [ipFails, accountFails] = await Promise.all([",
              "      this.redis.get(ipKey),",
              "      this.redis.get(accountKey),",
              "    ]);",
              "",
              "    if ((ipFails && parseInt(ipFails) >= 10) || (accountFails && parseInt(accountFails) >= 5)) {",
              "      throw new HttpException(",
              "        'Too many failed login attempts. Please try again in 15 minutes.',",
              "        HttpStatus.TOO_MANY_REQUESTS,",
              "      );",
              "    }",
              "  }",
              "",
              "  async recordFailedAttempt(ip: string, email: string) {",
              "    const ipKey = `abuse:login:ip:${ip}`;",
              "    const accountKey = `abuse:login:account:${email.toLowerCase()}`;",
              "    const FIFTEEN_MINUTES = 900;",
              "",
              "    await Promise.all([",
              "      this.redis.multi().incr(ipKey).expire(ipKey, FIFTEEN_MINUTES).exec(),",
              "      this.redis.multi().incr(accountKey).expire(accountKey, FIFTEEN_MINUTES).exec(),",
              "    ]);",
              "  }",
              "",
              "  async clearAttempts(ip: string, email: string) {",
              "    await this.redis.del(`abuse:login:account:${email.toLowerCase()}`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Dual-key IP and Account lockout service.",
          },
        ],
      },
    ],
    mistake: {
      title: "Only Rate Limiting Login Endpoints by Source IP Address",
      wrong: [
        "// ❌ If an attacker uses a residential proxy network with 10,000 IPs,",
        "// each IP only sends 1 request, completely bypassing IP rate limits and cracking the password!",
      ].join("\n"),
      right: [
        "// ✅ Rate limit both by IP AND by targeted account identifier (email/username)",
      ].join("\n"),
      explain:
        "Modern credential stuffing botnets rotate IPs on every HTTP request. Account-based lockout is required to prevent distributed dictionary attacks.",
    },
    tryIt: [
      "Simulate 5 failed logins against the same test email and confirm that the 6th attempt throws HTTP 429.",
      "Verify that logging in successfully clears the failure counter.",
    ],
    challenge: {
      prompt: "How can you prevent attackers from using login error messages (e.g. 'User does not exist' vs 'Invalid password') to enumerate valid email addresses?",
      hints: [
        "Always return a generic response: 'Invalid email or password' with identical cryptographic timing.",
      ],
      solution: [
        "// Timing-safe generic error response:",
        "if (!user || !(await bcrypt.compare(password, user.passwordHash))) {",
        "  await this.abuseService.recordFailedAttempt(ip, email);",
        "  throw new UnauthorizedException('Invalid email or password.');",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why is tracking failed attempts by both IP and Account email necessary?",
        options: [
          "To use more Redis memory.",
          "Because distributed botnets rotate through thousands of IPs to attack a single high-profile account without exceeding single-IP rate limits.",
          "PostgreSQL requires email indexing for auth.",
          "Fastify only supports email headers.",
        ],
        answer: 1,
        explanation:
          "Account-level rate limiting stops distributed credential stuffing where each bot IP only sends a single request.",
      },
    ],
    flashcards: [
      {
        front: "What is Dual-Key Rate Limiting on authentication?",
        back: "Enforcing independent rate limit counters on both the incoming IP address and the targeted account email/username.",
      },
    ],
    recap: [
      "Protect login with dual IP and Account failure counters.",
      "Use timed 15-minute lockouts for failed credentials.",
      "Apply tight limits and payload size guards to file upload and heavy search routes.",
    ],
    references: [
      { label: "OWASP Credential Stuffing Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html" },
    ],
    nextBridge: "Now let's look at standards-compliant 429 responses, Retry-After headers, and Trusted Proxy configuration.",
  },

  "p28-l4": {
    id: "p28-l4",
    phaseId: "p28",
    title: "429, Retry-After & Trusted Proxies",
    level: "Advanced",
    minutes: 30,
    summary:
      "Deliver standards-compliant HTTP 429 responses with `Retry-After`, `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers. Configure trusted reverse proxies (Cloudflare, AWS ALB, Nginx) so `req.ip` is never spoofed.",
    prerequisites: ["p28-l2 NestJS Throttler", "p21-l2 Fastify Architecture"],
    objectives: [
      "Emit standardized IETF RateLimit headers and `Retry-After` seconds.",
      "Configure `trustProxy: true` in Fastify to safely read `X-Forwarded-For` from upstream load balancers.",
      "Prevent IP spoofing vulnerabilities by validating upstream CIDR ranges.",
    ],
    simple:
      "When your API tells a client 'Stop! You're going too fast', you must politely tell them *how long* to wait before retrying (`Retry-After: 30`). Additionally, behind Cloudflare or AWS, your app must read the real client IP, not the load balancer's IP address.",
    why:
      "If you misconfigure proxy trust, every visitor appears to have the exact same IP address (the load balancer's internal IP), causing 1 single heavy user to accidentally block all other users across the entire internet.",
    mentalModel: {
      title: "The Caller ID Behind a Switchboard",
      body:
        "If a receptionist takes calls through an office switchboard without Caller ID pass-through, every caller looks like 'Switchboard Ext 100'. Trusting the proxy properly passes the original caller's phone number straight through to the agent's screen.",
    },
    sections: [
      {
        heading: "1. Standardized RateLimit and Retry-After Headers",
        body: [
          "Production APIs should return standard HTTP response headers so SDK clients (like Axios/Fetch interceptors) know when to retry automatically:",
          "- `RateLimit-Limit`: Maximum quota for the window.",
          "- `RateLimit-Remaining`: Number of requests remaining.",
          "- `RateLimit-Reset`: Seconds remaining until quota reset.",
          "- `Retry-After`: (On HTTP 429) Exact seconds client must wait.",
        ],
        code: [
          {
            file: "http-429-response.http",
            lang: "text",
            code: [
              "HTTP/1.1 429 Too Many Requests",
              "Content-Type: application/json; charset=utf-8",
              "Retry-After: 42",
              "RateLimit-Limit: 100",
              "RateLimit-Remaining: 0",
              "RateLimit-Reset: 42",
              "",
              "{",
              "  \"statusCode\": 429,",
              "  \"error\": \"Too Many Requests\",",
              "  \"message\": \"Throttler limit exceeded. Try again in 42 seconds.\",",
              "  \"retryAfter\": 42",
              "}",
            ].join("\n"),
            caption: "Standardized HTTP 429 response structure.",
          },
        ],
      },
      {
        heading: "2. Configuring Fastify `trustProxy` for Cloudflare/Load Balancers",
        body: [
          "In Fastify, enable `trustProxy: true` (or specify trusted IP CIDRs) so `request.ip` extracts the real client IP from `CF-Connecting-IP` or `X-Forwarded-For`.",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
              "import { AppModule } from './app.module';",
              "",
              "async function bootstrap() {",
              "  // Enable trustProxy in Fastify adapter",
              "  const adapter = new FastifyAdapter({",
              "    trustProxy: true, // Trusts upstream reverse proxy headers (Cloudflare / ALB / Render)",
              "  });",
              "",
              "  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);",
              "  await app.listen(3000, '0.0.0.0');",
              "}",
              "bootstrap();",
            ].join("\n"),
            caption: "Configuring Fastify trustProxy for accurate client IP resolution.",
          },
        ],
      },
    ],
    mistake: {
      title: "Trusting `X-Forwarded-For` Directly Without a Trusted Proxy Configuration",
      wrong: [
        "// ❌ Reading header directly allows clients to forge fake IPs and bypass all limits!",
        "const clientIp = req.headers['x-forwarded-for']; // Spoofable by attacker: '1.1.1.1'",
      ].join("\n"),
      right: [
        "// ✅ Let Fastify's validated trustProxy parse the authoritative client IP",
        "const clientIp = req.ip;",
      ].join("\n"),
      explain:
        "Clients can send arbitrary `X-Forwarded-For: 8.8.8.8` headers. Only the vetted edge reverse proxy can securely append and validate client IP addresses.",
    },
    tryIt: [
      "Inspect `request.ip` in a controller behind your local development proxy.",
      "Verify that `Retry-After` headers are present when an endpoint returns HTTP 429.",
    ],
    challenge: {
      prompt: "How can client-side Fetch or Axios interceptors use the `Retry-After` header to automatically retry throttled requests?",
      hints: [
        "Catch 429 status codes, read `error.response.headers['retry-after']`, wait that number of seconds, and retry the request.",
      ],
      solution: [
        "axiosInstance.interceptors.response.use(null, async (error) => {",
        "  if (error.response?.status === 429) {",
        "    const retryAfterSec = parseInt(error.response.headers['retry-after'] || '1', 10);",
        "    await new Promise((res) => setTimeout(res, retryAfterSec * 1000));",
        "    return axiosInstance(error.config); // Retry original request",
        "  }",
        "  return Promise.reject(error);",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What header informs the client how many seconds to wait before attempting another request after a 429?",
        options: [
          "X-Wait-Time",
          "Retry-After",
          "Cooldown-Seconds",
          "RateLimit-Delay",
        ],
        answer: 1,
        explanation:
          "`Retry-After` is the official standard HTTP header indicating the backoff duration in seconds or an HTTP date.",
      },
    ],
    flashcards: [
      {
        front: "Why is `trustProxy: true` required when hosting behind Cloudflare or ALB?",
        back: "So the application reads the real end-user IP from proxy headers instead of treating the reverse proxy's internal IP as the client address.",
      },
    ],
    recap: [
      "Return standardized `RateLimit-*` and `Retry-After` headers on throttled responses.",
      "Enable `trustProxy: true` in Fastify when deployed behind reverse proxies.",
      "Never read `X-Forwarded-For` manually to prevent IP spoofing attacks.",
    ],
    references: [
      { label: "IETF Draft: RateLimit Header Fields", url: "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers" },
    ],
    nextBridge: "In the final lesson of Phase 28, we implement Redis-backed Distributed Counters for multi-instance scaling and verify limits with load testing.",
  },

  "p28-l5": {
    id: "p28-l5",
    phaseId: "p28",
    title: "Distributed Counters in Redis & Load Testing Limits",
    level: "Mastery",
    minutes: 35,
    summary:
      "Scale rate limiting across multiple container instances using Redis storage adapters (`@nest-lab/throttler-storage-redis` / `ioredis`). Verify rate limiter enforcement and measure throughput degradation using k6 / autocannon load tests.",
    prerequisites: ["p28-l2 NestJS Throttler", "p25-l1 Redis Primitives"],
    objectives: [
      "Understand why default in-memory rate limiting fails in multi-container cloud deployments.",
      "Configure `ThrottlerStorageRedisService` for atomic, centralized rate limit state.",
      "Execute load tests with `autocannon` / `k6` to verify rate limit thresholds and 429 error rates.",
    ],
    simple:
      "If you run 5 containers of your API server behind a load balancer, an in-memory rate limit of '100 requests/min' actually allows the user to send 500 requests/min (100 to each container). A Redis-backed storage adapter stores the counter in a central location so the limit remains exactly 100 requests across all containers.",
    why:
      "In modern auto-scaling container environments (Kubernetes, Cloud Run, ECS), in-memory rate limiting is ineffective because traffic is distributed round-robin across dynamic instances.",
    mentalModel: {
      title: "The Central Parking Garage Counter",
      body:
        "A parking garage with 4 separate entry gates needs a single digital sign counting remaining spaces. If each gate kept its own private tally on paper without talking to the other gates, 400 cars would enter a 100-car garage.",
    },
    sections: [
      {
        heading: "1. Connecting Redis Storage to NestJS Throttler",
        body: [
          "Plug `ThrottlerStorageRedisService` into your `ThrottlerModule.forRootAsync` configuration.",
        ],
        code: [
          {
            file: "src/app.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { ThrottlerModule } from '@nestjs/throttler';",
              "import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';",
              "import { ConfigService } from '@nestjs/config';",
              "import { Redis } from 'ioredis';",
              "",
              "@Module({",
              "  imports: [",
              "    ThrottlerModule.forRootAsync({",
              "      inject: [ConfigService],",
              "      useFactory: (config: ConfigService) => {",
              "        const redisClient = new Redis(config.get<string>('REDIS_URL', 'redis://localhost:6379'));",
              "        return {",
              "          throttlers: [",
              "            { name: 'default', ttl: 60000, limit: 100 },",
              "          ],",
              "          storage: new ThrottlerStorageRedisService(redisClient),",
              "        };",
              "      },",
              "    }),",
              "  ],",
              "})",
              "export class AppModule {}",
            ].join("\n"),
            caption: "Centralized Redis-backed throttler storage across all container replicas.",
          },
        ],
      },
      {
        heading: "2. Load Testing Rate Limits with Autocannon",
        body: [
          "Use `autocannon` to blast your API with concurrent requests and verify that rate limit thresholds are strictly respected.",
        ],
        code: [
          {
            file: "load-test-limits.sh",
            lang: "bash",
            code: [
              "# Run 50 concurrent connections for 10 seconds against target endpoint",
              "npx autocannon -c 50 -d 10 http://localhost:3000/api/v1/projects",
              "",
              "# Expected output:",
              "# 100 requests return 200 OK",
              "# Remainder of requests return 429 Too Many Requests with 0ms server overhead",
            ].join("\n"),
            caption: "Load testing rate limits using autocannon.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using In-Memory Throttler Storage in Multi-Instance Deployments",
      wrong: [
        "// ❌ Default in-memory storage: Each container replica keeps isolated memory state",
        "ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])",
        "// With 10 containers, a user can make 100 requests before being throttled!",
      ].join("\n"),
      right: [
        "// ✅ Redis storage: All 10 containers share one atomic counter in Redis",
        "storage: new ThrottlerStorageRedisService(redisClient)",
      ].join("\n"),
      explain:
        "In-memory counters multiply allowed traffic limits by the number of running server replicas.",
    },
    tryIt: [
      "Start 2 separate instances of your NestJS server on ports 3000 and 3001 pointing to the same Redis instance.",
      "Send requests alternately to both ports and verify the 10-request limit is shared across both instances.",
    ],
    challenge: {
      prompt: "How does Redis Lua scripting guarantee that checking a counter and incrementing it occurs atomically without race conditions under 10,000 requests per second?",
      hints: [
        "Redis runs Lua scripts as a single atomic transaction without interleaving other operations.",
      ],
      solution: [
        "// Redis executes the check-and-increment Lua script atomically on a single thread:",
        "// local current = redis.call('incr', KEYS[1])",
        "// if current == 1 then redis.call('expire', KEYS[1], ARGV[1]) end",
        "// return current",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why does default in-memory rate limiting fail when scaling to multiple container replicas?",
        options: [
          "Memory in Node.js is limited to 512MB.",
          "Each container only counts requests that hit its own process, multiplying the effective limit by the number of replicas.",
          "In-memory throttling crashes the operating system.",
          "Load balancers block in-memory variables.",
        ],
        answer: 1,
        explanation:
          "Without a shared store like Redis, every instance tracks an independent counter, effectively allowing $Limit \\times Replicas$ requests.",
      },
    ],
    flashcards: [
      {
        front: "Why must distributed APIs use Redis for throttler storage?",
        back: "To synchronize rate limit counters across all running server replicas and prevent container-count limit multiplication.",
      },
    ],
    recap: [
      "In-memory rate limiting fails in multi-replica cloud environments.",
      "Use `ThrottlerStorageRedisService` to maintain atomic distributed counters.",
      "Validate rate limiting behavior under load using `autocannon` or `k6`.",
    ],
    references: [
      { label: "NestJS Throttler Redis Storage", url: "https://github.com/jmcdo29/nest-lab" },
      { label: "Autocannon HTTP Benchmarking Tool", url: "https://github.com/mcollina/autocannon" },
    ],
    nextBridge: "Phase 28 is complete! You now possess full mastery of rate limiting algorithms, multi-tier guards, abuse prevention, and distributed Redis counters.",
  },
};
