import type { LessonContent } from "./types";

export const LESSON_CONTENT_P38: Record<string, LessonContent> = {
  "p38-l1": {
    id: "p38-l1",
    phaseId: "p38",
    title: "Deploying Next.js (Vercel-Class Platform)",
    level: "Mastery",
    minutes: 35,
    summary:
      "Deploy production Next.js App Router applications to edge infrastructure (Vercel / Cloudflare). Master serverless function timeouts, ISR cache invalidation, and environment variable configuration.",
    prerequisites: ["p08-l1 Next.js App Router", "p37-l1 GitHub Actions Basics"],
    objectives: [
      "Configure production build settings (`standalone` output for containers vs serverless edge adapters).",
      "Manage ISR (Incremental Static Regeneration) on-demand revalidation (`revalidateTag`, `revalidatePath`).",
      "Configure edge middleware runtime limits and geographically distributed CDN caching headers.",
    ],
    simple:
      "Deploying a modern Next.js app is different from traditional servers. Static pages and images are distributed instantly to 300+ CDN edge datacenters worldwide, while dynamic Server Components run as fast serverless functions close to the user. Loading a page takes 50ms whether the user is in Tokyo, London, or San Francisco.",
    why:
      "Deploying Next.js properly gives your users instant page loads with zero server maintenance overhead.",
    mentalModel: {
      title: "The Global Vending Machine Network",
      body:
        "Instead of shipping every soda bottle directly from a single warehouse in Atlanta, vending machines are placed on every street corner (CDN Edge). When a soda flavor sells out, a satellite signal restocks only that specific machine (On-demand ISR).",
    },
    sections: [
      {
        heading: "1. Next.js Production Output Configuration",
        body: [
          "- `output: 'standalone'`: Traces all dependencies and generates a self-contained 30MB production server runnable anywhere in Docker.",
          "- `images`: Configure remote image domain whitelisting and WebP/AVIF optimization formats.",
        ],
        code: [
          {
            file: "next.config.mjs",
            lang: "javascript",
            code: [
              "/** @type {import('next').NextConfig} */",
              "const nextConfig = {",
              "  output: 'standalone',",
              "  images: {",
              "    formats: ['image/avif', 'image/webp'],",
              "    remotePatterns: [",
              "      {",
              "        protocol: 'https',",
              "        hostname: 'images.unsplash.com',",
              "      },",
              "    ],",
              "  },",
              "  poweredByHeader: false,",
              "  reactStrictMode: true,",
              "};",
              "",
              "export default nextConfig;",
            ].join("\n"),
            caption: "Optimized standalone Next.js production configuration.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using Long-Running setInterval or Global State in Serverless Next.js Routes",
      wrong: [
        "// ❌ Relying on persistent in-memory arrays or background timers inside Route Handlers:",
        "let userSessionCache = {}; // Wiped out when serverless container freezes/shuts down!",
      ].join("\n"),
      right: [
        "// ✅ Use Redis (Upstash) or PostgreSQL for all shared state in serverless architectures.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Deploy a Next.js App with Standalone Output",
      description:
        "Build a Next.js app with `output: 'standalone'`, inspect the slim `.next/standalone` bundle, and verify it boots with `node server.js`.",
      tasks: [
        "Set `output: 'standalone'` in `next.config.mjs`.",
        "Run `npm run build`.",
        "Execute `node .next/standalone/server.js` and test route.",
      ],
    },
    quiz: [
      {
        question: "What does 'output: standalone' in next.config.js achieve?",
        options: [
          "It uses node-file-trace to generate a self-contained bundle with only the exact node_modules needed to run the server in production, drastically reducing container size.",
          "It disables TypeScript.",
          "It deletes all CSS files.",
          "It connects to WordPress.",
        ],
        answer: 0,
        explanation:
          "Standalone mode creates a minimal production output directory containing only required dependencies, ideal for slim Docker containers.",
      },
    ],
  },

  "p38-l2": {
    id: "p38-l2",
    phaseId: "p38",
    title: "Deploying NestJS + Workers (Railway/Render-Class)",
    level: "Mastery",
    minutes: 40,
    summary:
      "Deploy long-running backend APIs and BullMQ worker processes on container cloud platforms (Railway, Render, Fly.io, Cloud Run). Manage process isolation, vertical memory scaling, and zero-downtime rolling deploys.",
    prerequisites: ["p10-l1 NestJS Core", "p34-l1 Dockerfile Basics"],
    objectives: [
      "Separate HTTP API servers from BullMQ background queue workers into dedicated compute instances.",
      "Configure CPU/Memory resource allocations and automatic process restart policies.",
      "Implement Graceful Shutdown handlers (`SIGTERM` / `SIGINT`) that finish in-flight jobs before container exit.",
    ],
    simple:
      "Your API server must never process heavy video encoding or send 10,000 emails directly in the HTTP request thread — doing so freezes the server and causes timeouts for other users. By deploying a separate 'Worker' process that reads jobs from Redis, your API stays blazing fast (<20ms) while workers crunch heavy background tasks in the background.",
    why:
      "Separating web traffic from background compute ensures high API availability and prevents CPU starvation.",
    mentalModel: {
      title: "The Restaurant Counter and the Kitchen",
      body:
        "The cashier at the counter (API Server) takes your order in 5 seconds and gives you a receipt number. They don't cook the burger. The line cooks in the kitchen (Background Workers) prepare the food so the cashier can keep helping new customers.",
    },
    sections: [
      {
        heading: "1. NestJS Graceful Shutdown on SIGTERM",
        body: [
          "- Cloud platforms send `SIGTERM` when restarting or scaling containers.",
          "- The server must stop accepting new HTTP requests, wait for active requests to finish, close database connections, and exit cleanly with code 0.",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { AppModule } from './app.module';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create(AppModule);",
              "",
              "  // Enable graceful shutdown lifecycle hooks",
              "  app.enableShutdownHooks();",
              "",
              "  const port = process.env.PORT || 3000;",
              "  await app.listen(port, '0.0.0.0');",
              "  console.log(`Server listening on port ${port}`);",
              "}",
              "bootstrap();",
            ].join("\n"),
            caption: "NestJS shutdown hooks enabling zero-downtime container termination.",
          },
        ],
      },
    ],
    mistake: {
      title: "Running Web API and Background Workers in the Same Node.js Process in Production",
      wrong: [
        "// ❌ Starting BullMQ worker inside the HTTP API main.ts:",
        "// A heavy background CPU task blocks the Node event loop, causing HTTP requests to time out!",
      ].join("\n"),
      right: [
        "// ✅ Deploy separate container services: `web: node dist/main.js` and `worker: node dist/worker.js`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Deploy Multi-Process Web and Worker Services",
      description:
        "Define a `Procfile` or container specification running distinct web and worker commands, trigger background jobs via HTTP API, and verify the worker executes them independently.",
      tasks: [
        "Create `src/worker.ts` entry point.",
        "Configure `Procfile` with `web` and `worker` services.",
        "Test graceful shutdown with `kill -SIGTERM`.",
      ],
    },
    quiz: [
      {
        question: "Why should background queue workers be deployed as separate compute instances from public HTTP API servers?",
        options: [
          "To prevent CPU-intensive background tasks from starving the Node.js event loop and degrading HTTP response latencies.",
          "Because Redis does not support HTTP.",
          "To save git commits.",
          "Because TypeScript requires separate files.",
        ],
        answer: 0,
        explanation:
          "Isolating workers ensures high-load background processing never impairs the availability or responsiveness of user-facing web requests.",
      },
    ],
  },

  "p38-l3": {
    id: "p38-l3",
    phaseId: "p38",
    title: "Domains, DNS, HTTPS & CORS in Production",
    level: "Mastery",
    minutes: 35,
    summary:
      "Demystify DNS records (A, CNAME, ALIAS), TLS certificate automation, and production CORS configuration across multi-subdomain architectures (e.g. `app.taskforge.com` -> `api.taskforge.com`).",
    prerequisites: ["p07-l1 HTTP Fundamentals"],
    objectives: [
      "Configure DNS routing with root apex ALIAS / CNAME records and Cloudflare proxying.",
      "Enforce strict production CORS policies allowing specific origins with credentials.",
      "Understand TLS SNI (Server Name Indication) and automated Let's Encrypt renewal.",
    ],
    simple:
      "When a user types `https://taskforge.com`, DNS translates that name into an IP address. HTTPS encrypts the traffic so nobody can spy on passwords. When the React app on `app.taskforge.com` calls `api.taskforge.com`, CORS (Cross-Origin Resource Sharing) tells the browser: 'Yes, this backend allows requests from our trusted frontend domain.'",
    why:
      "Misconfigured DNS or CORS is the #1 reason for broken production deployments and mysterious browser network errors.",
    mentalModel: {
      title: "The International Passport and Visa",
      body:
        "DNS is looking up a country's address on a globe. HTTPS is traveling in an armored private jet. CORS is the customs visa officer at the border confirming that visitors from Country A are officially permitted to enter Country B.",
    },
    sections: [
      {
        heading: "1. Production CORS Whitelisting in NestJS",
        body: [
          "- Never use `origin: '*'` when cookies or Authorization headers are transmitted.",
          "- Whitelist preview pull-request domain regex patterns safely.",
        ],
        code: [
          {
            file: "src/cors.config.ts",
            lang: "ts",
            code: [
              "import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';",
              "",
              "const allowedOrigins = [",
              "  'https://taskforge.com',",
              "  'https://app.taskforge.com',",
              "  /^https:\\/\\/taskforge-.*\\.vercel\\.app$/, // Vercel preview deploys",
              "];",
              "",
              "export const corsOptions: CorsOptions = {",
              "  origin: (origin, callback) => {",
              "    // Allow server-to-server or mobile app requests with no browser origin",
              "    if (!origin) return callback(null, true);",
              "",
              "    const isAllowed = allowedOrigins.some((allowed) =>",
              "      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)",
              "    );",
              "",
              "    if (isAllowed) {",
              "      callback(null, true);",
              "    } else {",
              "      callback(new Error(`CORS blocked origin: ${origin}`));",
              "    }",
              "  },",
              "  credentials: true,",
              "  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],",
              "  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],",
              "};",
            ].join("\n"),
            caption: "Production CORS configuration with origin regex verification.",
          },
        ],
      },
    ],
    mistake: {
      title: "Setting 'Access-Control-Allow-Origin: *' with 'credentials: true'",
      wrong: [
        "// ❌ Invalid CORS combination:",
        "app.enableCors({ origin: '*', credentials: true });",
        "// Browsers strictly reject this combination for security reasons!",
      ].join("\n"),
      right: [
        "// ✅ Explicitly specify authorized domain origins when passing credentials.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Cross-Domain CORS Preflight with cURL",
      description:
        "Execute an `OPTIONS` HTTP preflight request using cURL with `Origin: https://app.taskforge.com`, and verify proper `Access-Control-Allow-Origin` response headers.",
      tasks: [
        "Run `curl -I -X OPTIONS http://localhost:3000/api/projects -H 'Origin: https://app.taskforge.com' -H 'Access-Control-Request-Method: POST'`.",
        "Verify `204 No Content` or `200 OK`.",
        "Confirm header `Access-Control-Allow-Credentials: true` is returned.",
      ],
    },
    quiz: [
      {
        question: "Why will modern web browsers reject an API response if 'Access-Control-Allow-Origin' is set to wildcard '*' while 'Access-Control-Allow-Credentials' is 'true'?",
        options: [
          "To prevent malicious websites from making authenticated requests with the victim's session cookies and reading the private response data.",
          "Because HTTP headers cannot exceed 20 characters.",
          "Because DNS servers do not support wildcards.",
          "To enforce dark mode styling.",
        ],
        answer: 0,
        explanation:
          "Security specifications mandate that credentialed requests (cookies, auth headers) can only be shared with explicitly named origins to prevent Cross-Origin Data Leakage.",
      },
    ],
  },
};
