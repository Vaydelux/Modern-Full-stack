import type { LessonContent } from "./types";

/**
 * Phase 12 NestJS Professional Architecture (L7–L9).
 * Covers Lifecycle Hooks, Advanced DI / Dynamic Modules, and Monorepo Architecture.
 */
export const LESSONS_P12C: LessonContent[] = [
  {
    id: "p12-l7",
    phaseId: "p12",
    title: "NestJS Lifecycle Hooks & Graceful Shutdown",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Production microservices in Kubernetes or Cloud Run must handle container shutdowns smoothly without terminating in-flight HTTP requests or leaving database transactions half-committed. In this lesson, you will master the full NestJS application lifecycle: initialization hooks (OnModuleInit, OnApplicationBootstrap), termination hooks (OnModuleDestroy, beforeApplicationShutdown, onApplicationShutdown), enabling OS signal listeners (SIGTERM, SIGINT), and executing zero-downtime connection drain procedures for Fastify, Prisma, and Redis worker pools.",
    prerequisites: [
      "p10-l1 — Bootstrap: main.ts, NestFactory & the Fastify Adapter",
      "p10-l5 — Request Lifecycle & Health Endpoints",
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
    ],
    objectives: [
      "Distinguish the precise execution order between OnModuleInit and OnApplicationBootstrap.",
      "Enable NestJS system signal interception (app.enableShutdownHooks()) for graceful container termination.",
      "Implement beforeApplicationShutdown to signal health check endpoints (readiness probes) to fail before closing listeners.",
      "Drain in-flight Fastify HTTP connections without abruptly dropping ongoing requests.",
      "Cleanly disconnect database pools (Prisma/PostgreSQL) and Redis pub/sub sockets on onApplicationShutdown.",
    ],
    simple:
      "Imagine a busy restaurant closing for the evening. If the manager suddenly flips the main power breaker (ungraceful shutdown / kill -9), dinners are ruined in mid-bite, ovens are left on, and dishes remain unwashed. Graceful shutdown means: 1) Lock the front door so no new guests enter (readiness probe fails), 2) Let current diners finish their meals (drain active HTTP connections), 3) Turn off the ovens and close the ledger cleanly (close Prisma/Redis connections), and 4) Lock up and leave.",
    why:
      "In cloud environments like AWS ECS, Google Cloud Run, and Kubernetes, nodes are constantly scaled down or redeployed during rolling updates. Without graceful shutdown hooks, containers killed mid-request cause intermittent 502 Bad Gateway errors for end users and corrupted database transactions.",
    mentalModel: {
      title: "The NestJS Lifecycle Pipeline: Bootstrap to Termination",
      body: "NestJS operates in two mirror-image phases: Initialization (Module Init → App Bootstrap → Fastify Listen) and Shutdown (Signal Caught → Readiness Probe Flipped → beforeApplicationShutdown → Fastify Stop Listening → onApplicationShutdown → Module Destroy).",
    },
    sections: [
      {
        heading: "Initialization Phase: OnModuleInit vs OnApplicationBootstrap",
        body: [
          "NestJS provides two distinct initialization hooks that execute before the HTTP server starts accepting external traffic:",
          "1. OnModuleInit: Called immediately after the host module's dependencies are resolved. Use this for lightweight internal setup (e.g., verifying config values or instantiating clients).",
          "2. OnApplicationBootstrap: Called once all modules across the entire application graph have completed OnModuleInit. Use this when initialization requires cross-module communication or external network checks (e.g., verifying database migration state or warm-up caches).",
        ],
        code: [
          {
            file: "src/database/prisma.service.ts",
            lang: "ts",
            code: `import { Injectable, OnModuleInit, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Prisma engine client...');
    // Connect to PostgreSQL database engine
    await this.$connect();
    this.logger.log('Database connected successfully.');
  }

  async onApplicationBootstrap(): Promise<void> {
    // Verify schema migration state or execute read-only health ping
    const ping = await this.$queryRaw\`SELECT 1 as healthy\`;
    this.logger.log(\`Application bootstrap database check: \${JSON.stringify(ping)}\`);
  }
}`,
          },
        ],
      },
      {
        heading: "Enabling OS Signal Trapping & Graceful Shutdown Hooks",
        body: [
          "By default, Node.js terminates instantly when receiving SIGTERM or SIGINT unless shutdown hooks are explicitly registered in main.ts via app.enableShutdownHooks().",
          "When enabled, NestJS traps the termination signal, stops accepting new incoming HTTP connections on the Fastify adapter, and invokes the destruction lifecycle in reverse dependency order.",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: `import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  // CRITICAL: Enables SIGTERM/SIGINT signal listeners for graceful cloud termination
  app.enableShutdownHooks();

  await app.listen(3000, '0.0.0.0');
  logger.log('Server listening gracefully on port 3000');
}
bootstrap();`,
          },
        ],
      },
      {
        heading: "Teardown Phase: beforeApplicationShutdown & onApplicationShutdown",
        body: [
          "beforeApplicationShutdown(signal?: string): Called before Fastify closes its HTTP listener socket. This is the optimal window to mark your application as unhealthy in readiness probes so Kubernetes load balancers immediately stop routing new traffic to this pod.",
          "onApplicationShutdown(signal?: string): Called after all active in-flight HTTP connections have finished processing or timed out. Use this to close database pools, Redis sockets, and BullMQ worker queues.",
        ],
        code: [
          {
            file: "src/common/services/shutdown.service.ts",
            lang: "ts",
            code: `import { Injectable, BeforeApplicationShutdown, OnApplicationShutdown, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HealthIndicatorService } from './health-indicator.service';

@Injectable()
export class ShutdownService implements BeforeApplicationShutdown, OnApplicationShutdown {
  private readonly logger = new Logger(ShutdownService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly health: HealthIndicatorService,
  ) {}

  async beforeApplicationShutdown(signal?: string): Promise<void> {
    this.logger.warn(\`Received OS Signal \${signal}. Entering graceful drain phase...\`);
    // Step 1: Mark readiness probe false so Load Balancers divert new traffic
    this.health.setTerminating(true);

    // Step 2: Brief pause to allow Kubernetes routing tables to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log('All HTTP connections drained. Closing persistent data connections...');
    // Step 3: Disconnect database pool
    await this.prisma.$disconnect();
    this.logger.log('Prisma disconnected cleanly. Process exit safe.');
  }
}`,
          },
        ],
      },
    ],
    commonMistake: {
      title: "Omitting app.enableShutdownHooks() in Containerized Deployments",
      wrong: "// main.ts\nconst app = await NestFactory.create(AppModule);\nawait app.listen(3000);",
      right: "// main.ts\nconst app = await NestFactory.create(AppModule);\napp.enableShutdownHooks(); // Required for SIGTERM/SIGINT listeners\nawait app.listen(3000);",
      explanation: "Without enableShutdownHooks(), Node terminates abruptly on SIGTERM, dropping in-flight requests and leaving unclosed DB sockets.",
    },
    quiz: [
      {
        q: "What is the primary difference between OnModuleInit and OnApplicationBootstrap?",
        options: [
          "OnModuleInit executes per-module after its dependencies are ready; OnApplicationBootstrap executes once after ALL application modules have initialized",
          "OnModuleInit only runs in development mode",
          "OnApplicationBootstrap runs in the browser, while OnModuleInit runs on the server",
          "There is no difference; they are aliases",
        ],
        answer: 0,
        explain:
          "OnModuleInit happens module by module during DI graph compilation. OnApplicationBootstrap fires once the full application graph is assembled and ready.",
      },
      {
        q: "Which method MUST be called in main.ts so NestJS handles SIGTERM and SIGINT signals?",
        options: [
          "app.enableShutdownHooks()",
          "process.on('exit')",
          "app.useGraceful()",
          "app.listenHooks()",
        ],
        answer: 0,
        explain:
          "app.enableShutdownHooks() registers process event listeners to invoke the lifecycle shutdown pipeline before exiting.",
      },
      {
        q: "What should you do inside beforeApplicationShutdown?",
        options: [
          "Flip readiness status to false so load balancers stop sending new traffic while in-flight requests finish draining",
          "Immediately terminate the Node process with process.exit(1)",
          "Drop all database tables",
          "Clear browser cookies",
        ],
        answer: 0,
        explain:
          "beforeApplicationShutdown runs before connection sockets close, allowing readiness probes to fail and load balancers to route new traffic elsewhere.",
      },
    ],
    flashcards: [
      {
        front: "What is the execution order of NestJS startup hooks?",
        back: "Constructor → onModuleInit() → onApplicationBootstrap() → HTTP server starts listening.",
      },
      {
        front: "What is the execution order of NestJS shutdown hooks?",
        back: "beforeApplicationShutdown() → HTTP listener stops → onModuleDestroy() → onApplicationShutdown().",
      },
      {
        front: "Why is graceful shutdown critical in containerized environments (K8s/Cloud Run)?",
        back: "Prevents in-flight requests from returning 502 errors and avoids dangling uncommitted database transactions.",
      },
      {
        front: "How do you ensure Prisma disconnects cleanly during app termination?",
        back: "Implement OnApplicationShutdown in PrismaService and call await this.$disconnect().",
      },
    ],
    recap: [
      "Use OnModuleInit for internal provider setup and OnApplicationBootstrap for cross-module or network initialization.",
      "Always invoke app.enableShutdownHooks() in main.ts for containerized microservices.",
      "Leverage beforeApplicationShutdown for readiness probe diversion and onApplicationShutdown for resource teardown.",
    ],
  },
  {
    id: "p12-l8",
    phaseId: "p12",
    title: "Advanced Dependency Injection: Custom Providers & Dynamic Modules",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "Enterprise backend systems require flexible, swappable architectures. NestJS's Inversion of Control (IoC) container goes far beyond simple class injection. In this lesson, you will master custom provider definitions (useClass, useValue, useFactory, useExisting), token-based injection using Symbols and Strings, constructing Dynamic Modules with configurable asynchronous options (ConfigurableModuleBuilder, forRootAsync), and controlling provider instantiation scopes (DEFAULT, REQUEST, TRANSIENT).",
    prerequisites: [
      "p10-l2 — Modules, Controllers & Providers",
      "p10-l3 — Dependency Injection & Decorators, Explained",
      "p12-l1 — Feature Modules & Thin Controllers",
    ],
    objectives: [
      "Implement custom providers using useValue (mocking/constants), useClass (strategy pattern), and useFactory (async initialization).",
      "Define type-safe string and symbol injection tokens with @Inject().",
      "Build dynamic configurable modules supporting both synchronous .forRoot() and asynchronous .forRootAsync() patterns.",
      "Leverage ConfigurableModuleBuilder from @nestjs/common to generate boilerplate-free dynamic modules.",
      "Analyze the performance implications and memory costs of Scope.REQUEST vs Scope.DEFAULT (Singleton).",
    ],
    simple:
      "Standard dependency injection is like buying a computer where every component is soldered onto the motherboard. Custom providers and dynamic modules turn your application into a modular desktop PC: you have standardized PCI slots (injection tokens) where you can plug in a real graphics card in production (useClass: RealPaymentGateway), a software simulator during unit tests (useValue: MockPaymentGateway), or a dynamically configured card that reads its power settings from a config file (useFactory).",
    why:
      "Hardcoding service instantiations ties your application to concrete implementations. Using custom provider tokens and dynamic modules allows you to swap cloud storage providers (S3 vs GCS vs Local Disk) or payment processors (Stripe vs PayPal) via environment flags without modifying a single line of business logic.",
    mentalModel: {
      title: "The IoC Container Registry: Tokens & Factories",
      body: "The NestJS IoC container is a key-value dictionary where the Key is an InjectionToken (Type, String, or Symbol) and the Value is a recipe to resolve it (useClass, useValue, or useFactory). When a constructor declares @Inject(STORAGE_TOKEN), Nest consults the registry and provides the resolved instance.",
    },
    sections: [
      {
        heading: "The 4 Custom Provider Strategies",
        body: [
          "NestJS supports four distinct provider definition strategies:",
          "1. useValue: Injects a constant value, configuration object, or mock test instance.",
          "2. useClass: Maps an injection token (interface or abstract class) to a concrete implementation class.",
          "3. useFactory: Executes a factory function with injected dependencies to dynamically create and return the provider (can be asynchronous).",
          "4. useExisting: Aliases an existing provider token without creating a new instance.",
        ],
        code: [
          {
            file: "src/storage/storage.module.ts",
            lang: "ts",
            code: `import { Module, FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';
import { LocalStorageService } from './local-storage.service';

export const STORAGE_SERVICE_TOKEN = Symbol('STORAGE_SERVICE_TOKEN');
export interface StorageService {
  upload(key: string, buffer: Buffer): Promise<string>;
}

const storageProvider: FactoryProvider<StorageService> = {
  provide: STORAGE_SERVICE_TOKEN,
  useFactory: (config: ConfigService): StorageService => {
    const driver = config.get<string>('STORAGE_DRIVER', 'local');
    if (driver === 's3') {
      return new S3StorageService(config.getOrThrow('AWS_BUCKET'));
    }
    return new LocalStorageService(config.get<string>('UPLOAD_DIR', './uploads'));
  },
  inject: [ConfigService],
};

@Module({
  providers: [storageProvider],
  exports: [STORAGE_SERVICE_TOKEN],
})
export class StorageModule {}`,
          },
        ],
      },
      {
        heading: "Dynamic Modules with ConfigurableModuleBuilder",
        body: [
          "Dynamic modules allow importing modules with custom runtime configuration. NestJS provides ConfigurableModuleBuilder to automatically create the standard forRoot, forRootAsync, OPTIONS_TYPE, and ASYNC_OPTIONS_TYPE boilerplate with full type safety.",
        ],
        code: [
          {
            file: "src/mailer/mailer.module-definition.ts",
            lang: "ts",
            code: `import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface MailerModuleOptions {
  apiKey: string;
  fromAddress: string;
  sandboxMode?: boolean;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<MailerModuleOptions>()
    .setClassPrefix('Mailer')
    .build();`,
          },
          {
            file: "src/mailer/mailer.module.ts",
            lang: "ts",
            code: `import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './mailer.module-definition';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule extends ConfigurableModuleClass {}`,
          },
        ],
      },
      {
        heading: "Provider Scopes: DEFAULT vs REQUEST vs TRANSIENT",
        body: [
          "By default, every NestJS provider is a Singleton (Scope.DEFAULT), instantiated once at application startup and shared across all incoming requests. This maximizes performance and memory efficiency.",
          "- Scope.REQUEST: A new instance is created for every incoming HTTP request. Caution: Request-scoped providers bubble up the dependency graph, making any controller or service that injects them request-scoped as well, degrading throughput.",
          "- Scope.TRANSIENT: A dedicated instance is created for each provider that injects it, but remains alive with the consumer's lifetime.",
        ],
        code: [
          {
            file: "src/audit/audit-logger.service.ts",
            lang: "ts",
            code: `import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

// REQUEST scope: instantiated per incoming HTTP request
@Injectable({ scope: Scope.REQUEST })
export class AuditLoggerService {
  constructor(@Inject(REQUEST) private readonly request: FastifyRequest) {}

  logAction(action: string): void {
    const ip = this.request.ip;
    const path = this.request.url;
    console.log(\`[AUDIT] Action: \${action} | IP: \${ip} | Path: \${path}\`);
  }
}`,
          },
        ],
      },
    ],
    commonMistake: {
      title: "Overusing Scope.REQUEST for Ambient Metadata",
      wrong: "@Injectable({ scope: Scope.REQUEST })\nexport class UserService { ... } // Recreated on every HTTP request",
      right: "@Injectable()\nexport class UserService {\n  // Access requestId/userId via AsyncLocalStorage inside a singleton service\n}",
      explanation: "Scope.REQUEST forces NestJS to create new DI sub-trees on every request, increasing garbage collection and reducing throughput.",
    },
    quiz: [
      {
        q: "What is the primary risk of using Scope.REQUEST on a NestJS provider?",
        options: [
          "It bubbles up the dependency tree, forcing all dependent services and controllers to be re-instantiated on every HTTP request, impacting performance",
          "It crashes the Fastify adapter",
          "It prevents TypeScript compilation",
          "It exposes private variables to the browser",
        ],
        answer: 0,
        explain:
          "Scope.REQUEST forces NestJS to create new DI sub-trees on every request, increasing garbage collection and reducing request throughput.",
      },
      {
        q: "Which helper utility in @nestjs/common eliminates boilerplate when authoring dynamic modules?",
        options: [
          "ConfigurableModuleBuilder",
          "DynamicModuleGenerator",
          "NestModuleFactory",
          "IoCBuilder",
        ],
        answer: 0,
        explain:
          "ConfigurableModuleBuilder automatically generates type-safe .forRoot() and .forRootAsync() methods and options injection tokens.",
      },
      {
        q: "When would you use useFactory over useClass?",
        options: [
          "When provider creation requires dynamic configuration, asynchronous initialization (e.g. database connect), or conditional logic based on other services",
          "When you want to write React JSX components",
          "When you do not want to use TypeScript",
          "When working with CSS files",
        ],
        answer: 0,
        explain:
          "useFactory executes a function that can inject other services, read runtime flags, and return a resolved promise.",
      },
    ],
    flashcards: [
      {
        front: "What are the 4 custom provider properties in NestJS?",
        back: "useClass, useValue, useFactory, and useExisting.",
      },
      {
        front: "Why should you prefer Symbol or const for injection tokens?",
        back: "Guarantees token uniqueness, avoids string typo collisions, and enables IDE refactoring.",
      },
      {
        front: "What is the default provider scope in NestJS?",
        back: "Scope.DEFAULT (Singleton) — instantiated once at startup and shared across all requests.",
      },
      {
        front: "How do you provide asynchronous configuration to a dynamic module?",
        back: "Use the forRootAsync({ useFactory: ..., inject: [...] }) pattern.",
      },
    ],
    recap: [
      "Master useValue, useClass, and useFactory for swappable provider architectures.",
      "Use ConfigurableModuleBuilder to author clean, type-safe dynamic modules.",
      "Preserve Scope.DEFAULT singletons for performance, using AsyncLocalStorage for ambient request context.",
    ],
  },
  {
    id: "p12-l9",
    phaseId: "p12",
    title: "Modular Monorepo Architecture with Turborepo & pnpm",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "In modern full-stack development, managing separate Git repositories for your NestJS backend, Next.js frontend, Prisma database schema, and shared TypeScript DTOs causes severe version drift and broken API contracts. In this lesson, you will master enterprise modular monorepo architecture using pnpm workspaces and Turborepo. You will structure isolated apps (apps/api, apps/web) and internal shared packages (packages/database, packages/contracts, packages/tsconfig), configure strict dependency boundaries, and configure Turborepo caching for lightning-fast builds and pruned Docker deployments.",
    prerequisites: [
      "p00-l2 — The Developer's Toolkit: Terminal, Node, pnpm, Git",
      "p03-l5 — Strict tsconfig & Compiler Diagnostics",
      "p09-l2 — Typed API Clients & Server/Client Composition",
      "p12-l1 — Feature Modules & Thin Controllers",
    ],
    objectives: [
      "Structure a production monorepo layout separating apps/ from reusable packages/.",
      "Configure pnpm-workspace.yaml and internal workspace:* dependency protocols.",
      "Create a shared @repo/contracts package housing shared Zod schemas and TypeScript request/response DTOs.",
      "Centralize Prisma models in @repo/database to serve both NestJS services and migration scripts.",
      "Configure turbo.json with pipeline task caching, environment variable hashes, and topological build ordering.",
    ],
    simple:
      "A polyrepo (multiple repositories) is like running a restaurant where the kitchen is in New York, the dining room is in Chicago, and the menu printer is in London. Every time the chef changes a recipe, they must mail letters to all three locations and pray the menus match. A monorepo puts the kitchen, dining room, and printer under one roof: when the chef edits the recipe in packages/contracts, both the kitchen (apps/api) and the waiters (apps/web) instantly see the updated dish.",
    why:
      "Monorepos ensure complete type safety across the full stack. When you rename a database column or DTO property in packages/contracts, TypeScript instantly highlights compiler errors across both your NestJS backend and Next.js frontend before any code is merged.",
    mentalModel: {
      title: "The Monorepo Dependency Inversion Pyramid",
      body: "Applications (apps/api, apps/web) sit at the top of the pyramid and import downwards from shared libraries (packages/contracts, packages/database, packages/ui). Shared packages NEVER import from applications or create lateral circular dependencies.",
    },
    sections: [
      {
        heading: "Standard Enterprise Monorepo Directory Layout",
        body: [
          "An enterprise monorepo clearly segregates runnable deployable artifacts (apps/) from reusable shared libraries (packages/):",
        ],
        code: [
          {
            file: "monorepo-structure.txt",
            lang: "text",
            code: `my-enterprise-monorepo/
├── apps/
│   ├── api/                 # NestJS + Fastify Backend (Port 3000)
│   │   ├── src/
│   │   ├── package.json     # deps: @repo/contracts, @repo/database
│   │   └── tsconfig.json
│   └── web/                 # Next.js 15 App Router (Port 3001)
│       ├── src/
│       ├── package.json     # deps: @repo/contracts
│       └── tsconfig.json
├── packages/
│   ├── contracts/           # Shared Zod Schemas & Request/Response DTOs
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── database/            # Prisma 7.9.15 Client & Schema Migrations
│   │   ├── prisma/schema.prisma
│   │   ├── src/index.ts
│   │   └── package.json
│   └── tsconfig/            # Shared base tsconfig presets
│       ├── base.json
│       └── nestjs.json
├── pnpm-workspace.yaml      # Workspace packages definition
├── turbo.json               # Turborepo task pipeline & caching
└── package.json             # Root monorepo scripts`,
          },
        ],
      },
      {
        heading: "pnpm Workspaces & The Shared Contracts Package",
        body: [
          "Configure pnpm-workspace.yaml at the root, and define the shared contracts package consumed by both frontend and backend:",
        ],
        code: [
          {
            file: "pnpm-workspace.yaml",
            lang: "yaml",
            code: `packages:
  - 'apps/*'
  - 'packages/*'`,
          },
          {
            file: "packages/contracts/src/tasks.contract.ts",
            lang: "ts",
            code: `import { z } from 'zod';

// Single source of truth for validation on both Fastify backend & React frontend
export const CreateTaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export interface TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}`,
          },
        ],
      },
      {
        heading: "Turborepo Pipeline Configuration & Cache Invalidation",
        body: [
          "Turborepo uses turbo.json to schedule parallel builds, linting, and tests while caching unchanged task outputs across local machines and CI runners:",
        ],
        code: [
          {
            file: "turbo.json",
            lang: "json",
            code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV", "DATABASE_URL", "NEXT_PUBLIC_API_URL"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    }
  }
}`,
          },
        ],
      },
    ],
    commonMistake: {
      title: "Creating Circular Lateral Dependencies in Shared Packages",
      wrong: "// packages/contracts/src/index.ts\nimport { PrismaClient } from '@repo/database'; // Circular dependency",
      right: "// Shared packages remain pure contracts without importing sibling database engines or apps",
      explanation: "Applications import shared packages. Shared packages should never import upwards or create circular dependencies.",
    },
    quiz: [
      {
        q: "What is the primary benefit of putting @repo/contracts in a monorepo shared package?",
        options: [
          "End-to-end type safety: backend DTOs and frontend API clients share the exact same types and Zod schemas with zero manual synchronization",
          "It makes the git repo smaller",
          "It allows Node.js to run without installing dependencies",
          "It automatically compiles TypeScript to WebAssembly",
        ],
        answer: 0,
        explain:
          "Sharing contracts guarantees that when backend endpoints change, frontend type-checkers instantly alert developers to contract discrepancies.",
      },
      {
        q: "What does dependsOn: ['^build'] mean in Turborepo configuration?",
        options: [
          "A package's build task will only run AFTER all of its internal dependency packages have completed their build tasks",
          "The build task only runs on the main branch",
          "It instructs Docker to restart",
          "It runs the build command in reverse order",
        ],
        answer: 0,
        explain:
          "The ^ topological operator ensures dependencies (e.g. packages/contracts) finish compiling before dependents (e.g. apps/api) begin building.",
      },
      {
        q: "How should dependency packages be declared in package.json under pnpm workspaces?",
        options: [
          "\"@repo/contracts\": \"workspace:*\"",
          "\"@repo/contracts\": \"latest\"",
          "\"@repo/contracts\": \"file:../../contracts\"",
          "\"@repo/contracts\": \"git+ssh://...\"",
        ],
        answer: 0,
        explain:
          "workspace:* instructs pnpm to link directly to local workspace packages and replace the protocol with matching semver ranges during publishing.",
      },
    ],
    flashcards: [
      {
        front: "What is the role of pnpm-workspace.yaml?",
        back: "Defines the root directories where workspace packages and applications reside (e.g., apps/*, packages/*).",
      },
      {
        front: "What is the Golden Rule of monorepo package imports?",
        back: "Applications import shared packages; shared packages never import applications or create circular references.",
      },
      {
        front: "How does Turborepo speed up CI/CD pipelines?",
        back: "Caches build, test, and lint artifacts by hashing source files, environment variables, and dependency trees.",
      },
      {
        front: "What is the purpose of @repo/contracts?",
        back: "Houses shared Zod validation schemas, API contracts, and TypeScript interfaces shared between frontend and backend.",
      },
    ],
    recap: [
      "Organize repositories cleanly into apps/ and reusable packages/.",
      "Maintain shared Zod schemas and TypeScript DTOs in @repo/contracts for seamless end-to-end type safety.",
      "Use Turborepo with topological dependency ordering (^build) for fast, cached builds and deployments.",
    ],
  },
];

export const LESSON_CONTENT_P12C: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P12C.map((l) => [l.id, l])
);
