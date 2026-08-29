import type { LessonRef, Phase } from "../types";

/**
 * Phase 4: NestJS Architecture & Modular Systems Curriculum Module.
 * Dedicated phase definition covering Dependency Injection, Lifecycle Hooks,
 * Modular Monorepos, and Interceptors with structured objectives, mental models,
 * and code patterns.
 */

export interface NestArchitectureModule {
  id: string;
  slug: string;
  title: string;
  badge: string;
  category: "ioc" | "lifecycle" | "monorepo" | "interceptors" | "monolith";
  minutes: number;
  status: "implemented" | "draft" | "planned";
  summary: string;
  objectives: string[];
  keyTopics: string[];
  codeHighlight: {
    filename: string;
    lang: string;
    snippet: string;
  };
  pitfall: {
    antiPattern: string;
    solution: string;
    explanation: string;
  };
  quizCount: number;
}

export const NEST_ARCHITECTURE_PHASE_ID = "p12";

export const NEST_ARCHITECTURE_MODULES: NestArchitectureModule[] = [
  {
    id: "p12-l8",
    slug: "dependency-injection",
    title: "Dependency Injection: Custom Providers & Dynamic Modules",
    badge: "IoC Engine",
    category: "ioc",
    minutes: 45,
    status: "implemented",
    summary:
      "Enterprise backend systems require flexible, swappable architectures. NestJS's Inversion of Control (IoC) container goes far beyond simple class injection. Master custom provider strategies (useClass, useValue, useFactory, useExisting), token-based injection using Symbols and Strings, constructing Dynamic Modules with configurable asynchronous options (ConfigurableModuleBuilder, forRootAsync), and controlling provider instantiation scopes (DEFAULT, REQUEST, TRANSIENT).",
    objectives: [
      "Implement custom providers using useValue (mocking/constants), useClass (strategy pattern), and useFactory (async initialization).",
      "Define type-safe string and symbol injection tokens with @Inject().",
      "Build dynamic configurable modules supporting both synchronous .forRoot() and asynchronous .forRootAsync() patterns.",
      "Leverage ConfigurableModuleBuilder from @nestjs/common to generate boilerplate-free dynamic modules.",
      "Analyze the performance implications and memory costs of Scope.REQUEST vs Scope.DEFAULT (Singleton).",
    ],
    keyTopics: [
      "Custom Provider Recipes: useClass, useValue, useFactory, useExisting",
      "Symbol & String Injection Tokens with @Inject()",
      "Dynamic Modules with ConfigurableModuleBuilder",
      "Asynchronous Provider Resolution with forRootAsync()",
      "Provider Scope Performance Matrix: Scope.DEFAULT vs Scope.REQUEST vs Scope.TRANSIENT",
    ],
    codeHighlight: {
      filename: "src/storage/storage.module.ts",
      lang: "ts",
      snippet: `export const STORAGE_SERVICE_TOKEN = Symbol('STORAGE_SERVICE_TOKEN');

export const storageProvider: FactoryProvider<StorageService> = {
  provide: STORAGE_SERVICE_TOKEN,
  useFactory: (config: ConfigService): StorageService => {
    const driver = config.get<string>('STORAGE_DRIVER', 'local');
    return driver === 's3'
      ? new S3StorageService(config.getOrThrow('AWS_BUCKET'))
      : new LocalStorageService(config.get<string>('UPLOAD_DIR', './uploads'));
  },
  inject: [ConfigService],
};`,
    },
    pitfall: {
      antiPattern: "@Injectable({ scope: Scope.REQUEST })\nexport class UserService { ... }",
      solution: "@Injectable()\nexport class UserService {\n  // Access ambient requestId via AsyncLocalStorage in a singleton\n}",
      explanation:
        "Scope.REQUEST causes the IoC container to create new DI sub-trees on every HTTP request, inflating garbage collection and degrading RPS by up to 60%.",
    },
    quizCount: 3,
  },
  {
    id: "p12-l7",
    slug: "lifecycle-hooks",
    title: "Lifecycle Hooks & Graceful Shutdown",
    badge: "Core Lifecycle",
    category: "lifecycle",
    minutes: 40,
    status: "implemented",
    summary:
      "Production microservices in Kubernetes or Cloud Run must handle container shutdowns smoothly without terminating in-flight HTTP requests or leaving database transactions half-committed. Master the full NestJS application lifecycle: initialization hooks (OnModuleInit, OnApplicationBootstrap), termination hooks (OnModuleDestroy, beforeApplicationShutdown, onApplicationShutdown), enabling OS signal listeners (SIGTERM, SIGINT), and executing zero-downtime connection drain procedures for Fastify, Prisma, and Redis worker pools.",
    objectives: [
      "Distinguish the precise execution order between OnModuleInit and OnApplicationBootstrap.",
      "Enable NestJS system signal interception (app.enableShutdownHooks()) for graceful container termination.",
      "Implement beforeApplicationShutdown to signal health check endpoints (readiness probes) to fail before closing listeners.",
      "Drain in-flight Fastify HTTP connections without abruptly dropping ongoing requests.",
      "Cleanly disconnect database pools (Prisma/PostgreSQL) and Redis pub/sub sockets on onApplicationShutdown.",
    ],
    keyTopics: [
      "Module-level vs Graph-level Initialization: OnModuleInit vs OnApplicationBootstrap",
      "OS Signal Trapping (SIGTERM / SIGINT) via app.enableShutdownHooks()",
      "Readiness Probe Diversion in beforeApplicationShutdown",
      "Fastify In-Flight Connection Drain Procedures",
      "Teardown of Persistent Pools in onApplicationShutdown",
    ],
    codeHighlight: {
      filename: "src/common/services/shutdown.service.ts",
      lang: "ts",
      snippet: `@Injectable()
export class ShutdownService implements BeforeApplicationShutdown, OnApplicationShutdown {
  constructor(
    private readonly prisma: PrismaService,
    private readonly health: HealthIndicatorService,
  ) {}

  async beforeApplicationShutdown(signal?: string): Promise<void> {
    // 1. Mark readiness probe false so Load Balancers divert new traffic
    this.health.setTerminating(true);
    // 2. Allow routing tables to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    // 3. Disconnect database pool once in-flight requests finish
    await this.prisma.$disconnect();
  }
}`,
    },
    pitfall: {
      antiPattern: "const app = await NestFactory.create(AppModule);\nawait app.listen(3000);",
      solution: "const app = await NestFactory.create(AppModule);\napp.enableShutdownHooks(); // Required for SIGTERM listeners\nawait app.listen(3000);",
      explanation:
        "Omitting app.enableShutdownHooks() causes Node to terminate immediately upon receiving SIGTERM, dropping active requests with 502 Bad Gateway errors.",
    },
    quizCount: 3,
  },
  {
    id: "p12-l9",
    slug: "modular-monorepo",
    title: "Modular Monorepo Structure with Turborepo & pnpm",
    badge: "Enterprise Monorepo",
    category: "monorepo",
    minutes: 45,
    status: "implemented",
    summary:
      "In modern full-stack development, managing separate Git repositories for your NestJS backend, Next.js frontend, Prisma database schema, and shared TypeScript DTOs causes severe version drift and broken API contracts. Master enterprise modular monorepo architecture using pnpm workspaces and Turborepo. Structure isolated apps (apps/api, apps/web) and internal shared packages (packages/database, packages/contracts, packages/tsconfig), configure strict dependency boundaries, and configure Turborepo caching for lightning-fast builds and pruned Docker deployments.",
    objectives: [
      "Structure a production monorepo layout separating apps/ from reusable packages/.",
      "Configure pnpm-workspace.yaml and internal workspace:* dependency protocols.",
      "Create a shared @repo/contracts package housing shared Zod schemas and TypeScript request/response DTOs.",
      "Centralize Prisma models in @repo/database to serve both NestJS services and migration scripts.",
      "Configure turbo.json with pipeline task caching, environment variable hashes, and topological build ordering.",
    ],
    keyTopics: [
      "Monorepo Directory Layout: apps/ (api, web) vs packages/ (contracts, database, tsconfig)",
      "pnpm Workspaces & workspace:* Protocol Linking",
      "Shared Validation Contracts with Zod & TypeScript Interfaces",
      "Turborepo Pipeline Configuration & Topological Task Graph (^build)",
      "Remote Caching & Docker Build Pruning (turbo prune)",
    ],
    codeHighlight: {
      filename: "packages/contracts/src/tasks.contract.ts",
      lang: "ts",
      snippet: `import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export interface TaskResponseDto {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isCompleted: boolean;
  createdAt: string;
}`,
    },
    pitfall: {
      antiPattern: "// packages/contracts/src/index.ts\nimport { PrismaClient } from '@repo/database'; // Circular / upward dependency",
      solution: "// Shared packages must remain pure contracts without importing sibling database engines or apps",
      explanation:
        "Violating dependency inversion causes circular dependency loops and breaks Turborepo caching pipelines.",
    },
    quizCount: 3,
  },
  {
    id: "p12-l3",
    slug: "interceptors",
    title: "Interceptors, RxJS Streams & Response Transformation",
    badge: "RxJS Pipeline",
    category: "interceptors",
    minutes: 40,
    status: "implemented",
    summary:
      "NestJS interceptors leverage RxJS Observables to wrap the execution stream around route handlers. Master the creation of global and controller-scoped interceptors to implement standardized response envelopes ({ data, success, timestamp }), performance duration profiling, request timeout circuit-breakers using RxJS operators (tap, map, catchError, timeout), and cache-aside interceptors.",
    objectives: [
      "Explain the interceptor aspect-oriented execution lifecycle (pre-controller, handler, post-controller RxJS stream).",
      "Transform outbound HTTP payloads into consistent enterprise response envelopes with CallHandler.handle().pipe(map(...)).",
      "Profile request latencies and emit structured performance metrics using RxJS tap().",
      "Implement request timeout safeguards with timeout() and catchError(TimeoutError) to prevent hung connections.",
      "Apply interceptors globally (APP_INTERCEPTOR) or selectively with @UseInterceptors().",
    ],
    keyTopics: [
      "Aspect-Oriented Programming (AOP) in NestJS",
      "ExecutionContext & CallHandler.handle() Stream",
      "Standard Response Envelope: { success: true, data: T, meta: { timestamp, durationMs } }",
      "RxJS Operators: tap, map, catchError, timeout, throwError",
      "Global Registration via APP_INTERCEPTOR Multi-Provider Token",
    ],
    codeHighlight: {
      filename: "src/common/interceptors/transform-response.interceptor.ts",
      lang: "ts",
      snippet: `@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const start = Date.now();
    return next.handle().pipe(
      timeout(10000), // Enforce 10s request ceiling
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - start,
        },
      })),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Operation timed out'));
        }
        return throwError(() => err);
      }),
    );
  }
}`,
    },
    pitfall: {
      antiPattern: "intercept(context, next) {\n  return next.handle(); // Mutating data directly without RxJS map()\n}",
      solution: "intercept(context, next) {\n  return next.handle().pipe(map(data => ({ success: true, data })));\n}",
      explanation:
        "Interceptors wrap asynchronous RxJS streams; response transformations must use the map() operator to shape outbound values safely.",
    },
    quizCount: 3,
  },
];

/**
 * Standard LessonRef representations for the Phase 4 curriculum tree.
 */
export const NEST_ARCHITECTURE_LESSON_REFS: LessonRef[] = [
  {
    id: "p12-l1",
    title: "Feature Modules & Thin Controllers",
    status: "implemented",
    minutes: 40,
    outline: [
      "Bounded modules per feature domain",
      "Controllers delegate, services decide",
      "Lab: split a god module into isolated domains",
    ],
  },
  {
    id: "p12-l2",
    title: "Pipes, Guards & Custom Decorators",
    status: "implemented",
    minutes: 45,
    outline: [
      "ValidationPipe: transform & whitelist",
      "Global vs scoped guards",
      "@CurrentUser-style decorators",
      "Lab: auth guard + roles guard",
    ],
  },
  {
    id: "p12-l3",
    title: "Interceptors, Exception Filters & Structured Errors",
    status: "implemented",
    minutes: 40,
    outline: [
      "Response shaping & timing with RxJS",
      "One error contract for the API (RFC 7807)",
      "Lab: the ApiException envelope",
    ],
  },
  {
    id: "p12-l4",
    title: "Logging, Correlation IDs & Request Context",
    status: "implemented",
    minutes: 35,
    outline: [
      "Structured JSON logs with Pino",
      "x-request-id propagation & ALS",
      "Lab: follow one id through the logs",
    ],
  },
  {
    id: "p12-l5",
    title: "Swagger/OpenAPI & API Versioning Judgment",
    status: "implemented",
    minutes: 30,
    outline: [
      "Docs generated from code, staying true",
      "When versioning is premature",
      "Lab: /docs live from decorators",
    ],
  },
  {
    id: "p12-l6",
    title: "Modular Monolith & the God-Service Anti-Pattern",
    status: "implemented",
    minutes: 40,
    outline: [
      "Module boundaries as design",
      "Circular dependencies, detected with madge",
      "Lab: the refactor, reviewed",
    ],
  },
  {
    id: "p12-l7",
    title: "NestJS Lifecycle Hooks & Graceful Shutdown",
    status: "implemented",
    minutes: 40,
    outline: [
      "OnModuleInit vs OnApplicationBootstrap",
      "Shutdown hooks & OS signal listeners (SIGTERM/SIGINT)",
      "Draining Fastify in-flight HTTP connections",
      "Closing Prisma & Redis connection pools cleanly",
    ],
  },
  {
    id: "p12-l8",
    title: "Advanced Dependency Injection: Custom Providers & Dynamic Modules",
    status: "implemented",
    minutes: 45,
    outline: [
      "Custom providers: useClass, useValue, useFactory, useExisting",
      "Symbol and string injection tokens with @Inject()",
      "Dynamic modules & ConfigurableModuleBuilder (forRootAsync)",
      "Provider Scopes: DEFAULT vs REQUEST vs TRANSIENT tradeoffs",
    ],
  },
  {
    id: "p12-l9",
    title: "Modular Monorepo Architecture with Turborepo & pnpm",
    status: "implemented",
    minutes: 45,
    outline: [
      "Enterprise structure: apps/api, apps/web, packages/*",
      "pnpm workspaces & internal workspace:* dependencies",
      "Shared @repo/contracts Zod schemas & typed DTOs",
      "Turborepo pipeline caching (^build) & pruned Docker builds",
    ],
  },
];

/**
 * Phase 4: NestJS Architecture Phase Definition.
 */
export const NEST_ARCHITECTURE_PHASE: Phase = {
  id: "p12",
  n: 12,
  stage: "backend-dev",
  title: "Phase 4: NestJS Architecture",
  focus:
    "Modular architecture, custom dependency injection providers, dynamic modules, application lifecycle hooks with zero-downtime shutdown, RxJS interceptors, exception envelopes, and Turborepo monorepo structuring.",
  status: "implemented",
  lessons: NEST_ARCHITECTURE_LESSON_REFS,
};
