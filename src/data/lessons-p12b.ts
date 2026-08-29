import type { LessonContent } from "./types";

/**
 * Phase 12 NestJS Professional Architecture (L4–L6).
 * Completes Phase 12.
 */
export const LESSONS_P12B: LessonContent[] = [
  {
    id: "p12-l4",
    phaseId: "p12",
    title: "Logging, Correlation IDs & Request Context",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "In distributed microservices and multi-tenant SaaS applications, troubleshooting a single user failure without a correlation ID is nearly impossible. This lesson teaches you how to implement request-scoped correlation IDs (`x-request-id`), use Node.js `AsyncLocalStorage` to maintain ambient request context across asynchronous service boundaries without prop-drilling, and emit structured JSON logs suitable for Google Cloud Logging, Datadog, or Grafana Loki.",
    prerequisites: [
      "p07-l1 — Request lifecycle & latency waterfalls",
      "p11-l4 — Logging, Trust Proxy & Performance Profile",
      "p12-l3 — Interceptors, Exception Filters & Structured Errors",
    ],
    objectives: [
      "Trace a single user transaction across controllers, services, repositories, and outbound HTTP calls using `x-request-id`.",
      "Leverage Node.js `AsyncLocalStorage` to store ambient request metadata without polluting method signatures.",
      "Construct a structured JSON logger with standard metadata fields (`level`, `requestId`, `userId`, `context`, `timestamp`).",
      "Avoid memory leaks and performance bottlenecks in asynchronous context propagation.",
      "Format log outputs differently for local human-readable development versus production cloud collectors.",
    ],
    simple:
      "Imagine a hospital patient undergoing blood tests, X-rays, surgery, and medication from 10 different doctors. Rather than having each doctor memorize the patient's name and address, the patient wears a wristband with a unique medical record number (correlation ID). Every test tube and doctor note is stamped with that barcode, so anyone can pull up the complete history in one search.",
    why:
      "When a payment webhook fails silently in production under 5,000 requests per minute, searching unstructured console logs for 'Payment failed' returns thousands of unrelated records. Searching `requestId: req-88f1-419b` isolates the exact database query, HTTP payload, and stack trace in 2 seconds.",
    mentalModel: {
      title: "AsyncLocalStorage: The Ambient Thread-Local Store",
      body: "In Node.js, asynchronous tasks jump between event loop turns. `AsyncLocalStorage` acts like a backpack that stays strapped to the asynchronous execution chain. When a middleware enters `als.run({ requestId, userId }, next)`, any deeply nested service can call `als.getStore()` to retrieve the current request's ID without receiving it as an argument.",
    },
    sections: [
      {
        heading: "Implementing Ambient Context with AsyncLocalStorage",
        body: [
          "Create a dedicated `RequestContextService` utilizing Node's built-in `AsyncLocalStorage`:",
        ],
        code: [
          {
            file: "src/common/context/request-context.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { AsyncLocalStorage } from 'async_hooks';",
              "",
              "export interface RequestContextStore {",
              "  requestId: string;",
              "  userId?: string;",
              "  tenantId?: string;",
              "}",
              "",
              "@Injectable()",
              "export class RequestContextService {",
              "  private readonly als = new AsyncLocalStorage<RequestContextStore>();",
              "",
              "  run<T>(store: RequestContextStore, callback: () => T): T {",
              "    return this.als.run(store, callback);",
              "  }",
              "",
              "  getStore(): RequestContextStore | undefined {",
              "    return this.als.getStore();",
              "  }",
              "",
              "  getRequestId(): string {",
              "    return this.als.getStore()?.requestId || 'system-context';",
              "  }",
              "",
              "  getUserId(): string | undefined {",
              "    return this.als.getStore()?.userId;",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Context Middleware & Context-Aware Logger",
        body: [
          "Initialize the store in an Express/Fastify middleware and inject the context automatically into log entries:",
        ],
        code: [
          {
            file: "src/common/middleware/correlation.middleware.ts",
            lang: "ts",
            code: [
              "import { Injectable, NestMiddleware } from '@nestjs/common';",
              "import { RequestContextService } from '../context/request-context.service';",
              "import * as crypto from 'crypto';",
              "",
              "@Injectable()",
              "export class CorrelationMiddleware implements NestMiddleware {",
              "  constructor(private readonly contextService: RequestContextService) {}",
              "",
              "  use(req: any, res: any, next: () => void) {",
              "    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();",
              "    res.setHeader('x-request-id', requestId);",
              "",
              "    this.contextService.run({ requestId }, () => {",
              "      next();",
              "    });",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Passing requestId manually as an argument to every single service and repository method",
      wrong: "async findUser(id: string, requestId: string, tenantId: string) { ... } // Signature explosion!",
      right: "async findUser(id: string) { const reqId = this.context.getRequestId(); } // Clean & decoupled",
      explain:
        "Prop-drilling tracking parameters through every service method clutters clean domain contracts with infrastructure telemetry concerns.",
    },
    tryIt: [
      "Create a `RequestContextService` using `AsyncLocalStorage` in your project.",
      "Mount `CorrelationMiddleware` on all routes using `consumer.apply(CorrelationMiddleware).forRoutes('*')`.",
      "Send a request with `curl -H 'x-request-id: trace-xyz' http://localhost:3000/api/v1/projects`.",
      "Verify the response contains the `x-request-id: trace-xyz` header.",
    ],
    challenge: {
      prompt:
        "Write an `AppLogger` service that prefixes every log line with `[requestId]` and the calling class name automatically from `RequestContextService`.",
      hints: [
        "Inject `RequestContextService` into `AppLogger`.",
        "Format output: `[ISO_DATE] [LEVEL] [reqId] [Context] Message`.",
      ],
      solution: [
        "import { Injectable, LoggerService } from '@nestjs/common';",
        "import { RequestContextService } from './request-context.service';",
        "",
        "@Injectable()",
        "export class AppLogger implements LoggerService {",
        "  constructor(private readonly contextService: RequestContextService) {}",
        "",
        "  log(message: string, context?: string) {",
        "    const reqId = this.contextService.getRequestId();",
        "    console.log(JSON.stringify({",
        "      level: 'INFO',",
        "      time: new Date().toISOString(),",
        "      requestId: reqId,",
        "      context: context || 'App',",
        "      message,",
        "    }));",
        "  }",
        "",
        "  error(message: string, trace?: string, context?: string) {",
        "    const reqId = this.contextService.getRequestId();",
        "    console.error(JSON.stringify({",
        "      level: 'ERROR',",
        "      time: new Date().toISOString(),",
        "      requestId: reqId,",
        "      context: context || 'App',",
        "      message,",
        "      trace,",
        "    }));",
        "  }",
        "  warn(message: string, context?: string) { this.log(message, context); }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What Node.js standard API enables ambient context storage across asynchronous operations?",
        options: ["`AsyncLocalStorage`", "`ThreadContext`", "`globalScope`", "`EventEmitter`"],
        answer: 0,
        explain:
          "`AsyncLocalStorage` (from `async_hooks`) stores execution context across asynchronous callbacks and promises.",
      },
      {
        q: "What is the primary benefit of correlation IDs (`x-request-id`)?",
        options: [
          "They allow tracing a specific user transaction across all microservices, database calls, and logs",
          "They speed up SQL queries by 50%",
          "They encrypt the user's password",
          "They replace SSL certificates",
        ],
        answer: 0,
        explain:
          "Correlation IDs stitch together distributed log entries belonging to a single client request.",
      },
      {
        q: "Why is prop-drilling `requestId` through every service method considered an anti-pattern?",
        options: [
          "It pollutes business logic interfaces with infrastructure telemetry concerns",
          "TypeScript prohibits more than 2 function parameters",
          "It causes memory leaks in PostgreSQL",
          "It triggers CORS errors",
        ],
        answer: 0,
        explain:
          "Infrastructure details like correlation IDs belong in ambient execution context, keeping domain service signatures clean.",
      },
      {
        q: "How should production backend logs be formatted?",
        options: [
          "Single-line structured JSON objects for ingestion into cloud log query engines (Datadog, CloudWatch, GCP)",
          "Multi-line ASCII art diagrams",
          "Raw binary strings",
          "HTML tables",
        ],
        answer: 0,
        explain:
          "Structured JSON logs allow automated indexing, filtering by `requestId`, and alerting on error rates.",
      },
      {
        q: "Where in the request lifecycle should the `x-request-id` be generated and attached to response headers?",
        options: [
          "In the very first middleware before routing",
          "Inside the database trigger",
          "In the React client component",
          "Inside the CSS bundle",
        ],
        answer: 0,
        explain:
          "Initializing the correlation ID in the earliest middleware ensures the entire downstream request lifecycle is tagged.",
      },
      {
        q: "What happens if a client passes an `x-request-id` header in the incoming request?",
        options: [
          "The server should adopt and preserve the incoming ID to maintain end-to-end frontend-to-backend distributed tracing",
          "The server must reject the request with HTTP 400",
          "The server ignores it and restarts",
          "It is automatically deleted by Node.js",
        ],
        answer: 0,
        explain:
          "Preserving client-provided request IDs allows frontend error boundaries (e.g. Sentry) and backend logs to share the same trace ID.",
      },
    ],
    flashcards: [
      {
        front: "What is `AsyncLocalStorage`?",
        back: "Node.js standard API that maintains state across asynchronous call chains without parameter passing.",
      },
      {
        front: "What is an `x-request-id`?",
        back: "A unique UUID header identifying a specific HTTP transaction across the entire system.",
      },
      {
        front: "Why use structured JSON logging?",
        back: "Enables log aggregators (Datadog, GCP Logging) to index, filter, and alert on structured fields like `requestId`.",
      },
      {
        front: "What is ambient context?",
        back: "Data accessible globally within the current asynchronous execution flow without explicit prop-drilling.",
      },
      {
        front: "How do you echo `x-request-id` back to the client?",
        back: "Set `res.setHeader('x-request-id', requestId)` in the correlation middleware or interceptor.",
      },
      {
        front: "What is the risk of logging unstructured strings?",
        back: "Impossible to query by specific user, endpoint, or error type when log volume exceeds thousands per second.",
      },
      {
        front: "When should AsyncLocalStorage store be initialized?",
        back: "In an early NestJS middleware or Fastify `onRequest` hook using `als.run(store, next)`.",
      },
      {
        front: "How does frontend benefit from `x-request-id`?",
        back: "Users can provide the Request ID to customer support, allowing engineers to find the exact backend trace.",
      },
    ],
    recap: [
      "Stitch distributed logs together using `x-request-id` correlation IDs.",
      "Use `AsyncLocalStorage` to store ambient request data without polluting domain signatures.",
      "Initialize request context inside early middleware and attach IDs to outgoing response headers.",
      "Emit structured JSON logs with standard fields (`level`, `requestId`, `timestamp`, `context`).",
      "Preserve client-supplied correlation IDs for end-to-end observability from browser to database.",
    ],
    references: [
      { label: "Node.js Documentation — AsyncLocalStorage", url: "https://nodejs.org/api/async_context.html#class-asynclocalstorage" },
      { label: "OpenTelemetry — Trace Context Specification", url: "https://www.w3.org/TR/trace-context/" },
    ],
    nextBridge:
      "Now that your backend is observable and correlated, in P12-L5 you will learn how to generate live OpenAPI/Swagger documentation directly from code and exercise pragmatic API versioning judgment.",
  },
  {
    id: "p12-l5",
    phaseId: "p12",
    title: "Swagger/OpenAPI & API Versioning Judgment",
    level: "Backend Developer",
    minutes: 30,
    summary:
      "Documentation that is maintained by hand quickly goes out of date and drifts from reality. NestJS provides automated OpenAPI (Swagger) schema generation directly from TypeScript types and decorators. This lesson covers setting up `@nestjs/swagger`, decorating DTOs and controllers with `@ApiProperty()`, `@ApiOperation()`, and `@ApiResponse()`, and evaluating API versioning strategies (URI prefix vs headers) with senior engineering pragmatism.",
    prerequisites: [
      "p07-l5 — REST maturity & pagination patterns",
      "p10-l4 — DTOs, Config & Environment Validation",
      "p12-l1 — Feature Modules & Thin Controllers",
    ],
    objectives: [
      "Bootstrap `@nestjs/swagger` in `main.ts` and host interactive documentation at `/api/docs`.",
      "Decorate DTOs with `@ApiProperty()` and `@ApiPropertyOptional()` to generate accurate schema models.",
      "Document route metadata, status codes, and JWT security schemes using OpenAPI decorators.",
      "Evaluate API versioning trade-offs: URI path (`/v1/`), header versioning, and media-type versioning.",
      "Recognize when API versioning is premature ceremony vs when breaking changes demand a new major version.",
    ],
    simple:
      "Manual API documentation is like drawing a map of a city by hand: the moment a new road is built, the map is wrong. Swagger is like a live GPS satellite: it reads your real TypeScript code as the single source of truth, automatically reflecting every new endpoint and validation rule the moment you write it.",
    why:
      "Frontend teams and external API consumers need clear contracts and auto-generated TypeScript SDKs (via openapi-generator). Keeping OpenAPI definitions synchronized with code eliminates contract drift and prevents integration bugs.",
    mentalModel: {
      title: "Code-as-Contract & The Versioning Balance",
      body: "• **Code-as-Contract**: The TypeScript DTO with validation decorators IS the specification. Swagger reads the reflection metadata to build the `openapi.json` spec.\n• **Versioning Pragmatism**: Don't create `/v2/` for adding an optional field or fixing a typo. Only bump versions when an existing field is renamed, deleted, or changes type in a breaking way.",
    },
    sections: [
      {
        heading: "Configuring Swagger in main.ts",
        body: [
          "Initialize Swagger documentation with JWT Bearer authentication support:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';",
              "import { AppModule } from './app.module';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create(AppModule);",
              "",
              "  // API Versioning Configuration",
              "  app.setGlobalPrefix('api/v1');",
              "",
              "  // OpenAPI / Swagger Configuration",
              "  const config = new DocumentBuilder()",
              "    .setTitle('TaskForge Enterprise API')",
              "    .setDescription('Production REST API for TaskForge project management platform')",
              "    .setVersion('1.0.0')",
              "    .addBearerAuth({",
              "      type: 'http',",
              "      scheme: 'bearer',",
              "      bearerFormat: 'JWT',",
              "      description: 'Enter your JWT access token',",
              "    })",
              "    .addTag('Projects', 'Project lifecycle and member management')",
              "    .addTag('Tasks', 'Task assignment, status, and estimation')",
              "    .build();",
              "",
              "  const document = SwaggerModule.createDocument(app, config);",
              "  SwaggerModule.setup('api/docs', app, document, {",
              "    swaggerOptions: {",
              "      persistAuthorization: true,",
              "    },",
              "  });",
              "",
              "  await app.listen(3000);",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Decorating DTOs and Controller Endpoints",
        body: [
          "Enrich DTOs and controllers with OpenAPI annotations to produce self-describing documentation:",
        ],
        code: [
          {
            file: "src/projects/dto/create-project.dto.ts",
            lang: "ts",
            code: [
              "import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';",
              "import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';",
              "",
              "export enum ProjectPriority {",
              "  LOW = 'LOW',",
              "  MEDIUM = 'MEDIUM',",
              "  HIGH = 'HIGH',",
              "}",
              "",
              "export class CreateProjectDto {",
              "  @ApiProperty({",
              "    example: 'Q3 Mobile App Redesign',",
              "    description: 'The title of the project',",
              "    maxLength: 100,",
              "  })",
              "  @IsString()",
              "  @IsNotEmpty()",
              "  @MaxLength(100)",
              "  title!: string;",
              "",
              "  @ApiPropertyOptional({",
              "    example: 'Complete overhaul of iOS and Android checkout flows',",
              "    description: 'Detailed description of project deliverables',",
              "  })",
              "  @IsString()",
              "  @IsOptional()",
              "  description?: string;",
              "",
              "  @ApiProperty({",
              "    enum: ProjectPriority,",
              "    example: ProjectPriority.HIGH,",
              "    description: 'Initial priority level',",
              "  })",
              "  @IsEnum(ProjectPriority)",
              "  priority!: ProjectPriority;",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Creating a /v2/ API version for backward-compatible non-breaking additions",
      wrong: "app.setGlobalPrefix('api/v2'); // Because we added one optional 'tags' array to response!",
      right: "Add optional fields in /v1/; only create /v2/ when existing contracts break destructively",
      explain:
        "Branching API versions introduces massive operational overhead (maintaining dual database migrations, documentation, and routing). Adding additive, optional fields is fully backward-compatible in REST.",
    },
    tryIt: [
      "Install `@nestjs/swagger` in your NestJS project.",
      "Configure Swagger in `main.ts` and navigate to `http://localhost:3000/api/docs` in your browser.",
      "Add `@ApiProperty()` decorators with examples to your feature DTOs.",
      "Execute an authenticated request directly from the Swagger UI interactive 'Try it out' console.",
    ],
    challenge: {
      prompt:
        "Decorate a controller method `deleteProject` with `@ApiOperation`, `@ApiResponse` (204 No Content and 404 Not Found), and `@ApiBearerAuth`.",
      hints: [
        "Use `@ApiBearerAuth()` at class or method level.",
        "Use `@ApiOperation({ summary: 'Delete a project by UUID' })`.",
        "Use `@ApiResponse({ status: 204, description: 'Project successfully deleted' })`.",
      ],
      solution: [
        "import { Controller, Delete, Param, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';",
        "import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';",
        "import { ProjectsService } from './projects.service';",
        "",
        "@ApiTags('Projects')",
        "@ApiBearerAuth()",
        "@Controller('projects')",
        "export class ProjectsController {",
        "  constructor(private readonly service: ProjectsService) {}",
        "",
        "  @Delete(':id')",
        "  @HttpCode(HttpStatus.NO_CONTENT)",
        "  @ApiOperation({ summary: 'Delete a project', description: 'Permanently removes a project and associated tasks' })",
        "  @ApiParam({ name: 'id', description: 'Project UUID', format: 'uuid' })",
        "  @ApiResponse({ status: 204, description: 'Project deleted successfully' })",
        "  @ApiResponse({ status: 404, description: 'Project not found' })",
        "  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {",
        "    return this.service.deleteProject(id);",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary package used for generating OpenAPI specifications in NestJS?",
        options: ["`@nestjs/swagger`", "`swagger-ui-express-nest`", "`@nestjs/openapi-cli`", "`nest-docs`"],
        answer: 0,
        explain:
          "`@nestjs/swagger` is the official NestJS module for OpenAPI / Swagger documentation.",
      },
      {
        q: "Which decorator is used to describe optional fields in DTOs for Swagger documentation?",
        options: ["`@ApiPropertyOptional()`", "`@ApiOptional()`", "`@SwaggerOptional()`", "`@DocOptional()`"],
        answer: 0,
        explain:
          "`@ApiPropertyOptional()` marks properties as optional in the generated OpenAPI schema.",
      },
      {
        q: "What does `SwaggerModule.createDocument(app, config)` return?",
        options: [
          "A complete OpenAPI (v3.0) compliant JSON object describing all routes and DTO schemas",
          "An HTML string",
          "A PostgreSQL database connection",
          "A Docker container image",
        ],
        answer: 0,
        explain:
          "`createDocument` compiles the OpenAPI object tree from reflected metadata.",
      },
      {
        q: "When is bumping an API to a new major version (e.g. `/v2/`) legitimately required?",
        options: [
          "When a breaking contract change occurs (e.g. removing a required field, changing data types, altering URL structure)",
          "Whenever a new database column is created",
          "Every 6 months",
          "When adding an optional query parameter",
        ],
        answer: 0,
        explain:
          "API versioning should only be bumped for breaking changes that would crash existing client applications.",
      },
      {
        q: "How do you enable interactive JWT token authorization in the Swagger UI?",
        options: [
          "Calling `.addBearerAuth()` on `DocumentBuilder` and adding `@ApiBearerAuth()` to controllers",
          "Typing passwords directly into URL query parameters",
          "Disabling authentication completely",
          "In `package.json`",
        ],
        answer: 0,
        explain:
          "`DocumentBuilder.addBearerAuth()` configures HTTP Bearer authentication in Swagger UI.",
      },
      {
        q: "What is the main benefit of code-first OpenAPI generation over manual YAML editing?",
        options: [
          "Documentation never suffers from contract drift because it is generated directly from source code and DTO validations",
          "It eliminates the need for unit tests",
          "It reduces JavaScript bundle size",
          "It automatically fixes database bugs",
        ],
        answer: 0,
        explain:
          "Deriving documentation directly from TypeScript types and validation decorators guarantees 100% accuracy with zero drift.",
      },
    ],
    flashcards: [
      {
        front: "What is `@nestjs/swagger`?",
        back: "Official NestJS module for generating OpenAPI documentation and interactive Swagger UI from code.",
      },
      {
        front: "What is `@ApiProperty()`?",
        back: "Decorator used on DTO properties to define type, description, example values, and constraints in OpenAPI.",
      },
      {
        front: "What is `@ApiBearerAuth()`?",
        back: "Controller or method decorator indicating that an endpoint requires a JWT Bearer token.",
      },
      {
        front: "What is contract drift?",
        back: "When documentation does not match the actual behavior of the running backend API.",
      },
      {
        front: "What is URI versioning in NestJS?",
        back: "Prefixing routes with version numbers (e.g. `app.setGlobalPrefix('api/v1')`).",
      },
      {
        front: "When should an API version be bumped?",
        back: "Only when introducing breaking, non-backward-compatible contract changes.",
      },
      {
        front: "How do you specify enum values in Swagger DTOs?",
        back: "Pass `{ enum: MyEnum, example: MyEnum.VALUE }` to `@ApiProperty()`.",
      },
      {
        front: "What does `persistAuthorization: true` do in Swagger UI?",
        back: "Keeps JWT Bearer tokens saved in browser local storage across page refreshes.",
      },
    ],
    recap: [
      "Generate live OpenAPI documentation using `@nestjs/swagger` and `DocumentBuilder`.",
      "Decorate DTOs with `@ApiProperty()` and `@ApiPropertyOptional()` to establish clear contracts.",
      "Enable JWT testing in Swagger UI with `.addBearerAuth()` and `@ApiBearerAuth()`.",
      "Avoid contract drift by treating TypeScript code as the single source of truth.",
      "Exercise versioning discipline: only bump major API versions for breaking contract modifications.",
    ],
    references: [
      { label: "NestJS Documentation — OpenAPI (Swagger)", url: "https://docs.nestjs.com/openapi/introduction" },
      { label: "OpenAPI Specification Official Website", url: "https://www.openapis.org/" },
    ],
    nextBridge:
      "In the final lesson of Phase 12, P12-L6, you will master Modular Monolith architecture, circular dependency detection, and refactoring away the dreaded God-Service anti-pattern.",
  },
  {
    id: "p12-l6",
    phaseId: "p12",
    title: "Modular Monolith & the God-Service Anti-Pattern",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "As systems grow, well-intentioned codebases often degenerate into a tangled web of circular dependencies and thousand-line 'God Services' (e.g. `AppService` or `CommonService`) that handle everything from user creation to invoice PDF generation. This lesson teaches you how to construct a clean Modular Monolith, eliminate circular dependencies using domain events and shared contract modules, apply the Single Responsibility Principle, and refactor monolithic services into cohesive, testable domain units.",
    prerequisites: [
      "p10-l2 — Modules, controllers & providers",
      "p12-l1 — Feature Modules & Thin Controllers",
      "p12-l4 — Logging, Correlation IDs & Request Context",
    ],
    objectives: [
      "Identify the warning signs of the 'God Service' anti-pattern and understand its maintenance hazards.",
      "Decompose oversized services into single-responsibility domain handlers.",
      "Diagnose and eliminate circular module dependencies (`forwardRef` smells).",
      "Decouple cross-module side effects using NestJS EventEmitter (`@nestjs/event-emitter`).",
      "Maintain a scalable Modular Monolith architecture that can evolve smoothly into microservices if needed.",
    ],
    simple:
      "A God Service is like a kitchen multi-tool that tries to be a knife, blender, microwave, dishwasher, and refrigerator all in one: it is massive, heavy, impossible to clean, and if one gear breaks, the entire kitchen stops working. Modular Monolith architecture gives you dedicated, sharp chef's knives, a separate blender, and clean workstations.",
    why:
      "God Services create high cognitive load, cause merge conflicts on every git commit, make unit testing a nightmare of 50 mocked dependencies, and trigger circular dependencies that crash server startup.",
    mentalModel: {
      title: "The Event-Driven Decoupling Bridge",
      body: "When Module A (e.g. `Users`) needs to trigger actions in Module B (e.g. `Billing`) and Module C (e.g. `Emails`), instead of importing all modules and creating circular dependency webs, Module A emits a domain event (`user.created`). Billing and Email modules subscribe independently (`@OnEvent('user.created')`). Module A has zero knowledge of B or C.",
    },
    sections: [
      {
        heading: "Decomposing the God Service Anti-Pattern",
        body: [
          "Compare a tangled God Service with dedicated domain handlers:",
        ],
        code: [
          {
            file: "god-service-refactor.ts",
            lang: "ts",
            code: [
              "// ❌ ANTI-PATTERN: The God Service (Over 1,200 lines, 15 injected dependencies)",
              "// @Injectable()",
              "// export class AppService {",
              "//   constructor(private users, private billing, private emails, private pdfs, private audit, private slack, private s3) {}",
              "//   async handleUserSignup() { ...500 lines of mixed database, Stripe, PDF, and Slack calls... }",
              "// }",
              "",
              "// ✅ CLEAN ARCHITECTURE: Single-responsibility domain services + Event emitter",
              "import { Injectable } from '@nestjs/common';",
              "import { EventEmitter2 } from '@nestjs/event-emitter';",
              "import { UsersRepository } from './users.repository';",
              "import { CreateUserDto } from './dto/create-user.dto';",
              "import { UserCreatedEvent } from './events/user-created.event';",
              "",
              "@Injectable()",
              "export class UserRegistrationService {",
              "  constructor(",
              "    private readonly usersRepo: UsersRepository,",
              "    private readonly eventEmitter: EventEmitter2,",
              "  ) {}",
              "",
              "  async registerUser(dto: CreateUserDto) {",
              "    // 1. Core domain invariant only",
              "    const user = await this.usersRepo.create(dto);",
              "",
              "    // 2. Emit domain event for asynchronous side effects (emails, billing, audit)",
              "    this.eventEmitter.emit(",
              "      'user.created',",
              "      new UserCreatedEvent(user.id, user.email, user.role)",
              "    );",
              "",
              "    return user;",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Subscribing to Domain Events Across Modules",
        body: [
          "Side-effect modules subscribe to domain events without creating direct module import dependencies:",
        ],
        code: [
          {
            file: "src/notifications/notifications.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "import { OnEvent } from '@nestjs/event-emitter';",
              "import { UserCreatedEvent } from '../users/events/user-created.event';",
              "",
              "@Injectable()",
              "export class NotificationsService {",
              "  private readonly logger = new Logger(NotificationsService.name);",
              "",
              "  @OnEvent('user.created', { async: true })",
              "  async handleUserCreated(event: UserCreatedEvent) {",
              "    this.logger.log(`Sending welcome email sequence to ${event.email}`);",
              "    // Send welcome email via Resend / SendGrid without blocking HTTP response",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Overusing forwardRef() instead of breaking circular architecture",
      wrong: "@Module({ imports: [forwardRef(() => BillingModule)] }) // Masking architectural coupling",
      right: "Extract shared interfaces or decouple via EventEmitter2",
      explain:
        "`forwardRef()` is a temporary escape hatch. Overusing it creates brittle startup order bugs and masks deep architectural coupling.",
    },
    tryIt: [
      "Install `@nestjs/event-emitter` and add `EventEmitterModule.forRoot()` to `AppModule`.",
      "Identify any service with more than 5 constructor dependencies and plan its domain decomposition.",
      "Replace a cross-module direct service call with a typed domain event (`eventEmitter.emit(...)`).",
      "Verify with `npm run build` that no circular dependency warnings appear.",
    ],
    challenge: {
      prompt:
        "Refactor an order placement workflow: `OrderPlacementService` creates the order record, then emits `order.placed`. Write `InventoryListener` that reserves stock upon hearing the event.",
      hints: [
        "Create `OrderPlacedEvent` class containing `orderId` and `items`.",
        "In `InventoryService`, add `@OnEvent('order.placed')` method.",
      ],
      solution: [
        "import { Injectable, Logger } from '@nestjs/common';",
        "import { OnEvent } from '@nestjs/event-emitter';",
        "",
        "export class OrderPlacedEvent {",
        "  constructor(public readonly orderId: string, public readonly items: { sku: string; qty: number }[]) {}",
        "}",
        "",
        "@Injectable()",
        "export class InventoryService {",
        "  private readonly logger = new Logger(InventoryService.name);",
        "",
        "  @OnEvent('order.placed', { async: true })",
        "  async handleOrderPlaced(event: OrderPlacedEvent) {",
        "    this.logger.log(`Reserving inventory for order ${event.orderId}`);",
        "    for (const item of event.items) {",
        "      // Decrement stock in database",
        "    }",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What defines a 'God Service' anti-pattern?",
        options: [
          "A service class that accumulates dozens of unrelated responsibilities and dependencies (e.g. auth, billing, email, reporting, database) violating Single Responsibility",
          "A service that handles database transactions",
          "A service that uses TypeScript generics",
          "A service with unit tests",
        ],
        answer: 0,
        explain:
          "God Services centralize too much unrelated logic, becoming unmaintainable bottlenecks.",
      },
      {
        q: "How does an event-driven architecture (`@nestjs/event-emitter`) decouple modules?",
        options: [
          "The publisher emits an event without knowing or importing the subscriber modules, eliminating bidirectional module dependencies",
          "It converts all code to WebSockets",
          "It eliminates the database",
          "It runs all tasks in the browser",
        ],
        answer: 0,
        explain:
          "Events invert dependencies: publishers emit events without importing consumers, creating unidirectional, loosely coupled designs.",
      },
      {
        q: "What is a Modular Monolith?",
        options: [
          "A single deployable backend application structured into strictly bounded, encapsulated domain modules with clean public interfaces",
          "A monolithic database with no tables",
          "A system with 50 separate microservice repositories",
          "A server that runs on a single CPU core",
        ],
        answer: 0,
        explain:
          "Modular Monoliths provide the deployment simplicity of a monolith with the strict domain boundaries and cleanliness of microservices.",
      },
      {
        q: "Why should `forwardRef()` be treated as a warning sign rather than a permanent solution?",
        options: [
          "It indicates a circular dependency architectural flaw that should usually be solved by event decoupling or extracting a shared module",
          "It is deprecated in TypeScript",
          "It causes compile errors in Fastify",
          "It deletes database indexes",
        ],
        answer: 0,
        explain:
          "`forwardRef()` masks circular coupling; senior engineers refactor the shared dependency instead.",
      },
      {
        q: "What option on `@OnEvent('event.name', { async: true })` ensures event handlers run without blocking the HTTP request?",
        options: ["`{ async: true }`", "`{ block: false }`", "`{ detached: true }`", "`{ background: true }`"],
        answer: 0,
        explain:
          "`{ async: true }` executes event listeners asynchronously, allowing HTTP responses to return immediately.",
      },
      {
        q: "What is the recommended rule of thumb for constructor dependencies in a NestJS service?",
        options: [
          "Ideally 3–5 focused dependencies; more than 7 often indicates the service should be decomposed",
          "At least 20 dependencies",
          "Zero dependencies only",
          "Dependencies are forbidden in NestJS",
        ],
        answer: 0,
        explain:
          "Services with more than 5–7 injected dependencies are usually violating the Single Responsibility Principle.",
      },
    ],
    flashcards: [
      {
        front: "What is a Modular Monolith?",
        back: "A single codebase partitioned into strict domain modules with explicit public interfaces and no circular coupling.",
      },
      {
        front: "What is the God Service anti-pattern?",
        back: "A massive, catch-all service class with excessive dependencies and mixed domain responsibilities.",
      },
      {
        front: "How do domain events eliminate circular dependencies?",
        back: "Publishing modules emit events without importing subscribers; subscribers listen independently via `@OnEvent()`.",
      },
      {
        front: "What does `EventEmitter2.emit()` do?",
        back: "Dispatches an in-memory typed domain event to all registered `@OnEvent()` listener handlers.",
      },
      {
        front: "What is the danger of `forwardRef()`?",
        back: "Masks circular dependency design flaws and can lead to runtime startup initialization race conditions.",
      },
      {
        front: "How do you handle asynchronous side effects in NestJS?",
        back: "Use `@OnEvent('name', { async: true })` to execute background tasks without blocking the HTTP response.",
      },
      {
        front: "What is the Single Responsibility Principle (SRP) in NestJS?",
        back: "Each service should have one reason to change, handling a single bounded domain capability.",
      },
      {
        front: "Why is a Modular Monolith preferred over premature microservices?",
        back: "Offers simple single-process deployment, fast debugging, and zero network serialization overhead while maintaining clean boundaries.",
      },
    ],
    recap: [
      "Decompose God Services into single-responsibility domain handlers.",
      "Decouple cross-module workflows using `@nestjs/event-emitter` domain events.",
      "Treat `forwardRef()` as an architectural smell to refactor, not a standard design pattern.",
      "Execute non-critical side effects (emails, metrics) asynchronously with `{ async: true }`.",
      "Embrace Modular Monolith architecture for clean, scalable enterprise development.",
    ],
    references: [
      { label: "NestJS Documentation — Event Emitter", url: "https://docs.nestjs.com/techniques/events" },
      { label: "Martin Fowler — Modular Monolith Architecture", url: "https://martinfowler.com/bliki/MonolithFirst.html" },
    ],
    nextBridge:
      "Congratulations on completing Phase 12! You now possess enterprise-grade NestJS architectural mastery. In Phase 13, you will dive deep into PostgreSQL: Relational modeling, ERDs, advanced SQL, ACID transactions, and indexing strategies.",
  },
];

export const LESSON_CONTENT_P12B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P12B.map((l) => [l.id, l])
);
