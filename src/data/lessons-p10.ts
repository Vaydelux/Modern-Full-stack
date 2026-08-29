import type { LessonContent } from "./types";

/**
 * Phase 10 NestJS from Zero (L1–L3).
 * Every lesson fulfills the full quality contract.
 */
export const LESSONS_P10: LessonContent[] = [
  {
    id: "p10-l1",
    phaseId: "p10",
    title: "Bootstrap: main.ts, NestFactory & the Fastify Adapter",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "NestJS is a progressive Node.js framework for building efficient, reliable, and scalable enterprise server applications. By default, NestJS uses Express under the hood, but in high-throughput enterprise systems, the Fastify adapter provides up to 2x higher throughput and lower memory consumption. This lesson teaches the complete bootstrap lifecycle, `main.ts`, `NestFactory`, configuring `FastifyAdapter`, and the `0.0.0.0` host binding rule.",
    prerequisites: [
      "p02-l6 — The event loop, microtasks & macrotasks",
      "p07-l1 — HTTP anatomy & request lifecycle",
      "p07-l4 — CORS & preflight requests",
    ],
    objectives: [
      "Understand the role of `main.ts` as the application entry point and IoC container root.",
      "Bootstrap a NestJS application using `NestFactory.create()` with the `FastifyAdapter`.",
      "Configure essential Fastify plugins (CORS, Helmet, Rate Limiting) within the NestJS ecosystem.",
      "Enforce the `0.0.0.0` host binding requirement for containerized environments (Docker, Cloud Run).",
      "Explain the architectural performance differences between Express and Fastify adapters.",
    ],
    simple:
      "If raw Node.js HTTP is like an engine and a steering wheel on a chassis, NestJS is a luxury sports car with structured engineering, airbags, climate control, and GPS built-in. By swapping the default engine (Express) for the Fastify adapter, you double your top speed and fuel efficiency without changing how you drive the car.",
    why:
      "In enterprise backends handling tens of thousands of requests per second, HTTP framework overhead matters. Fastify achieves extreme performance through schema-based serialization and optimized routing trees. Knowing how to configure NestJS on Fastify from day one guarantees maximum scalability.",
    mentalModel: {
      title: "The Chassis & The Turbo Engine",
      body: "Think of NestJS as the master car chassis and dashboard. The HTTP adapter is the engine underneath. NestJS abstracts the engine so your controllers, services, and modules don't care whether Express or Fastify is turning the wheels. Calling `NestFactory.create(AppModule, new FastifyAdapter())` drops a twin-turbo V8 (Fastify) into the bay.",
    },
    sections: [
      {
        heading: "The main.ts Bootstrap File & FastifyAdapter",
        body: [
          "In NestJS, `main.ts` is the single executable entry point where the IoC container initializes and binds to the network:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { NestFactory } from '@nestjs/core';",
              "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
              "import { AppModule } from './app.module';",
              "import { Logger, ValidationPipe } from '@nestjs/common';",
              "",
              "async function bootstrap() {",
              "  const logger = new Logger('Bootstrap');",
              "",
              "  // Initialize NestJS with the high-performance Fastify adapter",
              "  const app = await NestFactory.create<NestFastifyApplication>(",
              "    AppModule,",
              "    new FastifyAdapter({",
              "      logger: process.env.NODE_ENV !== 'production',",
              "      trustProxy: true,",
              "    })",
              "  );",
              "",
              "  // Global API Prefix",
              "  app.setGlobalPrefix('api/v1');",
              "",
              "  // Global Validation Pipe with strict whitelisting",
              "  app.useGlobalPipes(",
              "    new ValidationPipe({",
              "      whitelist: true,",
              "      forbidNonWhitelisted: true,",
              "      transform: true,",
              "      transformOptions: { enableImplicitConversion: true },",
              "    })",
              "  );",
              "",
              "  // Global CORS policy",
              "  app.enableCors({",
              "    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',",
              "    credentials: true,",
              "    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],",
              "  });",
              "",
              "  // CRITICAL: Bind to 0.0.0.0 for Docker / Cloud Run ingress",
              "  const port = Number(process.env.PORT) || 3001;",
              "  await app.listen(port, '0.0.0.0');",
              "",
              "  logger.log(`🚀 NestJS Fastify server listening on http://0.0.0.0:${port}/api/v1`);",
              "}",
              "",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Express vs Fastify Adapter in NestJS",
        body: [
          "Understanding the differences ensures you select the correct adapter and handle platform-specific APIs properly:",
          "• **Express Adapter (Default)**: Ubiquitous ecosystem, vast middleware catalog, but slower throughput and higher JSON serialization overhead.",
          "• **Fastify Adapter**: Extremely fast routing using Radix trees, schema-based JSON compilation via `fast-json-stringify`, highly efficient buffer handling.",
          "• **Adapter abstraction**: When using Fastify, avoid importing `express.Request` or `express.Response`. Always use NestJS generic decorators (`@Req()`, `@Res()`) or Fastify types (`FastifyRequest`, `FastifyReply`).",
        ],
        code: [
          {
            file: "adapter-comparison.ts",
            lang: "ts",
            code: [
              "// ❌ WRONG: Importing Express types when running Fastify",
              "// import { Request, Response } from 'express';",
              "",
              "// ✅ RIGHT: Using platform-agnostic NestJS decorators or Fastify types",
              "import { Controller, Get, Req, Res } from '@nestjs/common';",
              "import type { FastifyRequest, FastifyReply } from 'fastify';",
              "",
              "@Controller('system')",
              "export class SystemController {",
              "  @Get('ping')",
              "  ping(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {",
              "    // Send response via Fastify reply object",
              "    return reply.status(200).send({ status: 'pong', ip: req.ip });",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Omitting '0.0.0.0' when calling app.listen() in Fastify",
      wrong: "await app.listen(3001); // Defaults to '127.0.0.1' (localhost only), invisible inside Docker!",
      right: "await app.listen(port, '0.0.0.0'); // Binds to all network interfaces for container routing",
      explain:
        "Fastify defaults `app.listen()` host binding to `127.0.0.1` (unlike Express which binds to `0.0.0.0`). In Docker or Cloud Run containers, requests from outside the container will fail unless explicitly bound to `0.0.0.0`.",
    },
    tryIt: [
      "Inspect `src/main.ts` and verify `FastifyAdapter` is imported from `@nestjs/platform-fastify`.",
      "Check that `app.listen(port, '0.0.0.0')` includes the host string as the second parameter.",
      "Verify that `app.setGlobalPrefix('api/v1')` prefixes all controller routes automatically.",
      "Test requesting an endpoint with an unknown body property to verify `forbidNonWhitelisted: true` returns HTTP 400.",
    ],
    challenge: {
      prompt:
        "Write a `main.ts` bootstrap script for a NestJS application using `FastifyAdapter` that enables graceful shutdown hooks and sets a global shutdown timeout.",
      hints: [
        "Use `app.enableShutdownHooks()`.",
        "Pass `new FastifyAdapter()` to `NestFactory.create()`.",
      ],
      solution: [
        "import { NestFactory } from '@nestjs/core';",
        "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
        "import { AppModule } from './app.module';",
        "",
        "async function bootstrap() {",
        "  const app = await NestFactory.create<NestFastifyApplication>(",
        "    AppModule,",
        "    new FastifyAdapter()",
        "  );",
        "",
        "  // Enable OS signal listeners (SIGTERM, SIGINT) for zero-downtime deploys",
        "  app.enableShutdownHooks();",
        "",
        "  await app.listen(Number(process.env.PORT) || 3001, '0.0.0.0');",
        "}",
        "bootstrap();",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Why is specifying `'0.0.0.0'` in `app.listen(port, '0.0.0.0')` critical when using Fastify in Docker?",
        options: [
          "It enables TypeScript debugging",
          "Fastify binds to `127.0.0.1` by default; without `'0.0.0.0'`, the server refuses traffic routed into the container from reverse proxies (Nginx, Cloud Run)",
          "It enables SSL encryption automatically",
          "It speeds up CPU performance by 50%",
        ],
        answer: 1,
        explain:
          "Fastify defaults to localhost `127.0.0.1`. Inside containers, binding to `0.0.0.0` is required for external port forwarding to work.",
      },
      {
        q: "What is the role of `NestFactory.create()`?",
        options: [
          "It compiles CSS files",
          "It initializes the NestJS Inversion of Control (IoC) container, instantiates all providers, and boots the HTTP server",
          "It connects to the PostgreSQL database directly",
          "It generates HTML templates",
        ],
        answer: 1,
        explain:
          "`NestFactory` builds the dependency graph, instantiates singleton providers, and mounts controllers to the HTTP server.",
      },
      {
        q: "What performance advantages does Fastify have over Express?",
        options: [
          "Fastify has no routing system",
          "Fastify uses highly optimized Radix trees for route matching and pre-compiled JSON serialization schemas",
          "Fastify only runs on Linux",
          "Fastify replaces the V8 JavaScript engine",
        ],
        answer: 1,
        explain:
          "Fastify's Radix tree router and `fast-json-stringify` serializer dramatically reduce CPU overhead per request.",
      },
      {
        q: "What does `app.setGlobalPrefix('api/v1')` do?",
        options: [
          "Prefixes all route paths across every controller with `/api/v1`",
          "Changes the database table names",
          "Encrypts all API responses",
          "Generates a Swagger document only",
        ],
        answer: 0,
        explain:
          "`setGlobalPrefix` establishes a consistent base URL path for all endpoints in the application.",
      },
      {
        q: "Which package provides the Fastify adapter for NestJS?",
        options: [
          "`@nestjs/platform-express`",
          "`@nestjs/platform-fastify`",
          "`@nestjs/core`",
          "`fastify-cli`",
        ],
        answer: 1,
        explain:
          "`@nestjs/platform-fastify` wraps the Fastify engine into NestJS's `AbstractHttpAdapter`.",
      },
      {
        q: "What does `app.enableShutdownHooks()` ensure during container termination?",
        options: [
          "It deletes the log files",
          "It allows NestJS lifecycle hooks (`onModuleDestroy`, `beforeApplicationShutdown`) to close database connections and finish active requests gracefully on SIGTERM",
          "It restarts the computer",
          "It rolls back all git commits",
        ],
        answer: 1,
        explain:
          "Shutdown hooks let services clean up database connection pools and finish in-flight requests before the container shuts down.",
      },
    ],
    flashcards: [
      {
        front: "What is `main.ts` in NestJS?",
        back: "The application entry point where `NestFactory` initializes the IoC container and binds the HTTP server.",
      },
      {
        front: "Why use `FastifyAdapter` over Express in NestJS?",
        back: "Up to 2x higher throughput, lower memory consumption, and schema-compiled JSON serialization.",
      },
      {
        front: "What is the host binding rule for Fastify in containers?",
        back: "Must explicitly pass `'0.0.0.0'` in `app.listen(port, '0.0.0.0')` so container proxies can reach the server.",
      },
      {
        front: "What does `app.useGlobalPipes(new ValidationPipe())` do?",
        back: "Applies automatic class-validator DTO validation and type transformation across all incoming controller requests.",
      },
      {
        front: "What does `whitelist: true` do in `ValidationPipe`?",
        back: "Strips any properties from incoming request bodies that do not have decorators defined on the DTO class.",
      },
      {
        front: "What does `forbidNonWhitelisted: true` do?",
        back: "Throws an HTTP 400 Bad Request error if a client sends unknown properties not declared on the DTO.",
      },
      {
        front: "How do you enable graceful shutdown in NestJS?",
        back: "By calling `app.enableShutdownHooks()` in `main.ts`.",
      },
      {
        front: "Which types should you use when accessing request/reply objects in Fastify NestJS?",
        back: "`FastifyRequest` and `FastifyReply` from the `fastify` package (never `express.Request`).",
      },
    ],
    recap: [
      "Bootstrap NestJS in `main.ts` using `NestFactory.create()` with `FastifyAdapter`.",
      "Always bind to `'0.0.0.0'` in containerized environments.",
      "Configure global prefixes, validation pipes, and CORS policies during bootstrap.",
      "Use `app.enableShutdownHooks()` for graceful container zero-downtime deployments.",
      "Avoid importing Express types when running the Fastify engine.",
    ],
    references: [
      { label: "NestJS Documentation — First Steps & Bootstrap", url: "https://docs.nestjs.com/first-steps" },
      { label: "NestJS Documentation — Fastify Adapter", url: "https://docs.nestjs.com/techniques/performance" },
    ],
    nextBridge:
      "With the bootstrap engine running, in P10-L2 you will master the core building blocks of NestJS: Modules, Controllers, and Providers.",
  },
  {
    id: "p10-l2",
    phaseId: "p10",
    title: "Modules, Controllers & Providers",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "NestJS structures code into three fundamental building blocks: Modules (architectural boundary declarations), Controllers (HTTP routing and payload handling), and Providers (business logic services injected via Dependency Injection). This lesson teaches how to design domain modules (`TasksModule`), map REST routes with decorators (`@Get`, `@Post`, `@Body`, `@Param`), and encapsulate domain logic cleanly in injectable services.",
    prerequisites: [
      "p07-l2 — HTTP methods, status codes & headers",
      "p07-l5 — REST conventions & pagination",
      "p10-l1 — Bootstrap: main.ts & Fastify adapter",
    ],
    objectives: [
      "Understand the role of `@Module()` in configuring providers, controllers, imports, and exports.",
      "Build RESTful `@Controller()` classes mapping HTTP methods (`@Get`, `@Post`, `@Patch`, `@Delete`).",
      "Extract request data safely using parameter decorators (`@Param`, `@Query`, `@Body`, `@Headers`).",
      "Encapsulate domain rules and database calls inside `@Injectable()` service providers.",
      "Export providers across module boundaries and import them into feature modules cleanly.",
    ],
    simple:
      "Think of a restaurant: the **Controller** is the waiter who takes your order from the table (HTTP request) and returns your plate (HTTP response). The **Service (Provider)** is the chef in the kitchen who prepares the food (business logic and database queries). The **Module** is the restaurant building itself, organizing which chefs work in which kitchens.",
    why:
      "In unorganized Node.js apps, database queries, route handling, authentication, and validation are all dumped into huge 2,000-line route files. NestJS enforces separation of concerns: controllers only handle HTTP; services only handle domain logic; modules define encapsulation boundaries.",
    mentalModel: {
      title: "The Waiter, The Chef, and The Department",
      body: "• **Controller (The Waiter)**: Sits at the entrance, takes orders (`@Body()`), verifies table numbers (`@Param('id')`), passes tickets to the kitchen, and delivers food with status codes (`@HttpCode(201)`).\n• **Service (The Chef)**: Never speaks to customers; focuses solely on cooking recipes (calculating totals, saving to database).\n• **Module (The Department)**: Manages kitchen inventory, hiring, and exports dishes to other departments.",
    },
    sections: [
      {
        heading: "Domain Module Declaration (@Module)",
        body: [
          "A module encapsulates a closely related set of capabilities. The root `AppModule` imports domain feature modules:",
        ],
        code: [
          {
            file: "src/tasks/tasks.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { TasksController } from './tasks.controller';",
              "import { TasksService } from './tasks.service';",
              "",
              "@Module({",
              "  controllers: [TasksController],",
              "  providers: [TasksService],",
              "  exports: [TasksService], // Exported so other modules (e.g. ProjectsModule) can inject it",
              "})",
              "export class TasksModule {}",
            ].join("\n"),
          },
          {
            file: "src/app.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { TasksModule } from './tasks/tasks.module';",
              "import { UsersModule } from './users/users.module';",
              "",
              "@Module({",
              "  imports: [TasksModule, UsersModule],",
              "})",
              "export class AppModule {}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "REST Controller with Parameter Decorators",
        body: [
          "Controllers handle routing, status codes, and delegate execution to the injected service:",
        ],
        code: [
          {
            file: "src/tasks/tasks.controller.ts",
            lang: "ts",
            code: [
              "import {",
              "  Controller,",
              "  Get,",
              "  Post,",
              "  Patch,",
              "  Delete,",
              "  Body,",
              "  Param,",
              "  Query,",
              "  HttpCode,",
              "  HttpStatus,",
              "  ParseUUIDPipe,",
              "} from '@nestjs/common';",
              "import { TasksService } from './tasks.service';",
              "import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';",
              "",
              "@Controller('tasks')",
              "export class TasksController {",
              "  // Dependency Injection: NestJS automatically injects the TasksService instance",
              "  constructor(private readonly tasksService: TasksService) {}",
              "",
              "  @Get()",
              "  async findAll(@Query() query: TaskQueryDto) {",
              "    return this.tasksService.findAll(query);",
              "  }",
              "",
              "  @Get(':id')",
              "  async findOne(@Param('id', ParseUUIDPipe) id: string) {",
              "    return this.tasksService.findOne(id);",
              "  }",
              "",
              "  @Post()",
              "  @HttpCode(HttpStatus.CREATED)",
              "  async create(@Body() createTaskDto: CreateTaskDto) {",
              "    return this.tasksService.create(createTaskDto);",
              "  }",
              "",
              "  @Patch(':id')",
              "  async update(",
              "    @Param('id', ParseUUIDPipe) id: string,",
              "    @Body() updateTaskDto: UpdateTaskDto",
              "  )",
              "  {",
              "    return this.tasksService.update(id, updateTaskDto);",
              "  }",
              "",
              "  @Delete(':id')",
              "  @HttpCode(HttpStatus.NO_CONTENT)",
              "  async remove(@Param('id', ParseUUIDPipe) id: string) {",
              "    await this.tasksService.remove(id);",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Domain Service Provider (@Injectable)",
        body: [
          "Services contain business logic and database interactions. They throw standard NestJS HttpExceptions on failure:",
        ],
        code: [
          {
            file: "src/tasks/tasks.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, NotFoundException } from '@nestjs/common';",
              "import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';",
              "",
              "export interface TaskEntity {",
              "  id: string;",
              "  title: string;",
              "  description?: string;",
              "  status: 'TODO' | 'IN_PROGRESS' | 'DONE';",
              "  createdAt: Date;",
              "}",
              "",
              "@Injectable()",
              "export class TasksService {",
              "  // In-memory collection for demonstration (replaced with Prisma in Phase 14)",
              "  private tasks: TaskEntity[] = [];",
              "",
              "  async findAll(query: TaskQueryDto): Promise<TaskEntity[]> {",
              "    let result = [...this.tasks];",
              "    if (query.status) {",
              "      result = result.filter((t) => t.status === query.status);",
              "    }",
              "    return result;",
              "  }",
              "",
              "  async findOne(id: string): Promise<TaskEntity> {",
              "    const task = this.tasks.find((t) => t.id === id);",
              "    if (!task) {",
              "      throw new NotFoundException(`Task with ID '${id}' not found`);",
              "    }",
              "    return task;",
              "  }",
              "",
              "  async create(dto: CreateTaskDto): Promise<TaskEntity> {",
              "    const newTask: TaskEntity = {",
              "      id: crypto.randomUUID(),",
              "      title: dto.title,",
              "      description: dto.description,",
              "      status: dto.status || 'TODO',",
              "      createdAt: new Date(),",
              "    };",
              "    this.tasks.push(newTask);",
              "    return newTask;",
              "  }",
              "",
              "  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {",
              "    const task = await this.findOne(id);",
              "    Object.assign(task, dto);",
              "    return task;",
              "  }",
              "",
              "  async remove(id: string): Promise<void> {",
              "    const index = this.tasks.findIndex((t) => t.id === id);",
              "    if (index === -1) {",
              "      throw new NotFoundException(`Task with ID '${id}' not found`);",
              "    }",
              "    this.tasks.splice(index, 1);",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Executing direct database queries inside Controller methods",
      wrong: "@Get(':id') async getTask(@Param('id') id: string) { return this.prisma.task.findUnique({ where: { id } }); }",
      right: "@Get(':id') async getTask(@Param('id') id: string) { return this.tasksService.findOne(id); }",
      explain:
        "Controllers must remain razor-thin HTTP coordinators. Putting database queries inside controllers violates separation of concerns, prevents code reuse in CLI scripts or queues, and makes unit testing painful.",
    },
    tryIt: [
      "Create a feature module `src/tasks/tasks.module.ts` registering `TasksController` and `TasksService`.",
      "Verify that `AppModule` imports `TasksModule`.",
      "Send a GET request to `/api/v1/tasks` and check the JSON response.",
      "Pass an invalid UUID string to `/api/v1/tasks/123-abc` and observe `ParseUUIDPipe` automatically return HTTP 400 Bad Request.",
    ],
    challenge: {
      prompt:
        "Write a `ProjectsService` that depends on `TasksService` via constructor dependency injection to delete all associated tasks before deleting a project.",
      hints: [
        "Import `TasksModule` in `ProjectsModule`.",
        "Ensure `TasksModule` exports `TasksService`.",
      ],
      solution: [
        "import { Injectable, NotFoundException } from '@nestjs/common';",
        "import { TasksService } from '../tasks/tasks.service';",
        "",
        "@Injectable()",
        "export class ProjectsService {",
        "  constructor(private readonly tasksService: TasksService) {}",
        "",
        "  async deleteProject(projectId: string): Promise<void> {",
        "    // Clean up all child tasks before deleting project",
        "    await this.tasksService.removeAllForProject(projectId);",
        "    // Delete project logic here...",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary responsibility of a Controller in NestJS?",
        options: [
          "To manage database connection pooling",
          "To receive incoming HTTP requests, unpack route params/headers/body, delegate to service providers, and return HTTP responses",
          "To compile TypeScript into bytecode",
          "To run background cron jobs",
        ],
        answer: 1,
        explain:
          "Controllers are dedicated to routing and HTTP protocol mediation; business logic belongs in services.",
      },
      {
        q: "How does a Controller access an instance of a Service provider?",
        options: [
          "By calling `new TasksService()` manually inside each route handler",
          "Via Constructor Dependency Injection (`constructor(private readonly tasksService: TasksService) {}`)",
          "From a global variable on `globalThis`",
          "By reading from a JSON configuration file",
        ],
        answer: 1,
        explain:
          "NestJS's IoC container automatically resolves and injects singleton provider instances declared in constructor parameters.",
      },
      {
        q: "What decorator marks a class as eligible for NestJS Dependency Injection?",
        options: ["`@Injectable()`", "`@Component()`", "`@Service()`", "`@Provider()`"],
        answer: 0,
        explain:
          "`@Injectable()` attaches metadata to the class, allowing the NestJS IoC container to manage its instantiation and injection.",
      },
      {
        q: "If Module A needs to use a Service declared in Module B, what two things must happen?",
        options: [
          "Module B must put the Service in its `exports` array, and Module A must include Module B in its `imports` array",
          "Both modules must delete their controller classes",
          "The service must be copied into both directories",
          "The service must be marked `@Global()` only",
        ],
        answer: 0,
        explain:
          "Encapsulation requires Module B to export the provider, and Module A to import Module B.",
      },
      {
        q: "What does the `ParseUUIDPipe` do when applied to `@Param('id', ParseUUIDPipe)`?",
        options: [
          "Generates a new UUID automatically",
          "Validates that the incoming route parameter is a valid UUID format; if not, automatically throws an HTTP 400 Bad Request error",
          "Converts UUIDs to numbers",
          "Hashes the UUID with SHA-256",
        ],
        answer: 1,
        explain:
          "`ParseUUIDPipe` validates the UUID format before the controller method executes, rejecting invalid strings instantly.",
      },
      {
        q: "What HTTP status code is returned by `@HttpCode(HttpStatus.NO_CONTENT)`?",
        options: ["200", "201", "204", "404"],
        answer: 2,
        explain:
          "HTTP 204 No Content indicates successful execution with an empty response body (standard for DELETE endpoints).",
      },
    ],
    flashcards: [
      {
        front: "What is a NestJS Module?",
        back: "A class decorated with `@Module()` that organizes controllers, providers, imports, and exports into an encapsulated domain boundary.",
      },
      {
        front: "What is a NestJS Controller?",
        back: "A class decorated with `@Controller()` that handles incoming HTTP requests and routes them to service methods.",
      },
      {
        front: "What is a NestJS Provider?",
        back: "A class decorated with `@Injectable()` that encapsulates business logic and can be injected via constructor DI.",
      },
      {
        front: "How do you extract the JSON body in a controller method?",
        back: "Using the `@Body()` parameter decorator (e.g. `@Body() dto: CreateTaskDto`).",
      },
      {
        front: "How do you extract a URL route parameter (e.g. `/tasks/:id`)?",
        back: "Using the `@Param('id')` parameter decorator.",
      },
      {
        front: "How do you extract URL query string values (e.g. `?status=DONE`)?",
        back: "Using the `@Query('status')` or `@Query()` parameter decorator.",
      },
      {
        front: "How do you share a provider with another module?",
        back: "Add it to the `exports` array of the declaring module, then import that module into the consumer module's `imports` array.",
      },
      {
        front: "Why should controllers never call database queries directly?",
        back: "To maintain separation of concerns, enable unit testing, and allow reuse in CLI commands and queues.",
      },
    ],
    recap: [
      "Organize NestJS applications into modular domain boundaries using `@Module()`.",
      "Keep Controllers razor-thin; delegate all domain logic and data fetching to `@Injectable()` services.",
      "Use parameter decorators (`@Param`, `@Query`, `@Body`) with built-in pipes (`ParseUUIDPipe`).",
      "Export providers explicitly to share them across module boundaries.",
      "Throw standard NestJS `HttpException` classes (`NotFoundException`, `BadRequestException`) for clean error responses.",
    ],
    references: [
      { label: "NestJS Documentation — Modules", url: "https://docs.nestjs.com/modules" },
      { label: "NestJS Documentation — Controllers", url: "https://docs.nestjs.com/controllers" },
      { label: "NestJS Documentation — Providers", url: "https://docs.nestjs.com/providers" },
    ],
    nextBridge:
      "Now that you understand the basic building blocks, in P10-L3 you will dive deep into the mechanics of Dependency Injection, Decorators, and IoC scopes.",
  },
  {
    id: "p10-l3",
    phaseId: "p10",
    title: "Dependency Injection & Decorators, Explained",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Dependency Injection (DI) and TypeScript Decorators are the architectural backbone of NestJS. This lesson explains how the NestJS Inversion of Control (IoC) container works under the hood: metadata reflection (`reflect-metadata`), constructor parameter resolution, custom providers (`useClass`, `useValue`, `useFactory`), injection tokens (`@Inject('TOKEN')`), and provider scopes (DEFAULT singleton, REQUEST, TRANSIENT).",
    prerequisites: [
      "p03-l1 — Classes, interfaces & structural typing",
      "p03-l3 — Generics & type constraints",
      "p10-l2 — Modules, controllers & providers",
    ],
    objectives: [
      "Explain the Inversion of Control (IoC) pattern and why manual instantiation with `new` leads to tight coupling.",
      "Understand how TypeScript decorators and `reflect-metadata` emit design-time type information.",
      "Configure custom providers using `useValue` (mocking/config), `useClass` (strategy swapping), and `useFactory` (async initialization).",
      "Use custom injection tokens with `@Inject('TOKEN_NAME')` for interfaces and external SDKs.",
      "Analyze the performance implications of Provider Scopes: Singleton (Default) vs Request-Scoped.",
    ],
    simple:
      "Imagine building a house: instead of every electrical socket manufacturing its own power generator (`new Generator()`), the house has a central electrical panel (the IoC container) that plugs standard power cords (Dependency Injection) into whatever appliances need electricity. This allows you to unplug a real generator and plug in a test battery during a safety inspection without rewiring the house.",
    why:
      "Hardcoding dependencies with `new Service()` creates tightly coupled code that is impossible to unit test without mocking global modules. Dependency Injection inverts control so you can inject mock databases in test suites and real database connections in production seamlessly.",
    mentalModel: {
      title: "The Electrical Grid & The Standard Socket",
      body: "• **Without DI (Tight Coupling)**: A lamp that is hardwired directly into a coal power plant. You cannot move the lamp, and you cannot test it with a battery.\n• **With DI (Inversion of Control)**: A lamp with a standard two-prong plug (`interface PaymentGateway`). The house wiring (NestJS IoC Container) plugs the lamp into the city grid in production (`StripeGateway`) or into a portable generator in testing (`MockPaymentGateway`).",
    },
    sections: [
      {
        heading: "How NestJS IoC Resolves Constructor Types",
        body: [
          "When you write TypeScript with `experimentalDecorators` and `emitDecoratorMetadata: true`, the compiler records parameter types as metadata at compile time:",
        ],
        code: [
          {
            file: "ioc-metadata-mechanics.ts",
            lang: "ts",
            code: [
              "// TypeScript emits type metadata automatically for constructor arguments",
              "import { Injectable } from '@nestjs/common';",
              "",
              "@Injectable()",
              "export class EmailService {",
              "  async sendWelcome(email: string) { /* ... */ }",
              "}",
              "",
              "@Injectable()",
              "export class UsersService {",
              "  // NestJS reads metadata: param 0 is of type EmailService",
              "  // The IoC container looks up the singleton EmailService instance and injects it",
              "  constructor(private readonly emailService: EmailService) {}",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Custom Providers: useValue, useClass & useFactory",
        body: [
          "NestJS supports four provider registration strategies for maximum flexibility:",
          "1. **Standard Provider (`useClass` shorthand)**: `{ provide: TasksService, useClass: TasksService }`",
          "2. **Value Provider (`useValue`)**: Injects a static object, configuration constant, or mock implementation for unit testing.",
          "3. **Factory Provider (`useFactory`)**: Dynamically creates a provider instance asynchronously (e.g. connecting to Redis or Stripe with async secrets).",
        ],
        code: [
          {
            file: "src/config/database.provider.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "",
              "// Injection Token Symbol",
              "export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');",
              "",
              "export interface DatabaseClient {",
              "  query(sql: string, params?: any[]): Promise<any>;",
              "}",
              "",
              "@Module({",
              "  providers: [",
              "    {",
              "      provide: DATABASE_CONNECTION,",
              "      useFactory: async (): Promise<DatabaseClient> => {",
              "        // Async factory: Initialize client, establish connection pool",
              "        const client = {",
              "          query: async (sql: string) => ({ rows: [] }),",
              "        };",
              "        return client;",
              "      },",
              "    },",
              "  ],",
              "  exports: [DATABASE_CONNECTION],",
              "})",
              "export class DatabaseModule {}",
            ].join("\n"),
          },
          {
            file: "src/tasks/tasks-db.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, Inject } from '@nestjs/common';",
              "import { DATABASE_CONNECTION, DatabaseClient } from '../config/database.provider';",
              "",
              "@Injectable()",
              "export class TasksDbService {",
              "  constructor(",
              "    // Inject non-class tokens using @Inject()",
              "    @Inject(DATABASE_CONNECTION) private readonly db: DatabaseClient",
              "  ) {}",
              "",
              "  async getTasks() {",
              "    return this.db.query('SELECT * FROM tasks');",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Provider Scopes & Memory Implications",
        body: [
          "Providers in NestJS have three lifecycle scopes:",
          "• **DEFAULT (Singleton — Strongly Recommended)**: Exactly ONE instance is created on startup and shared across the entire application. Maximum performance and zero memory garbage collection overhead.",
          "• **REQUEST (Scope.REQUEST)**: A NEW instance is created for every incoming HTTP request and garbage collected when the response completes. ⚠️ WARNING: Request-scoped providers cascade up the dependency tree, degrading throughput by up to 50%. Use ONLY when request-specific context (like multitenant DB connections) cannot be passed as method arguments.",
          "• **TRANSIENT (Scope.TRANSIENT)**: A dedicated instance is created for each injecting consumer.",
        ],
        code: [
          {
            file: "scopes-example.ts",
            lang: "ts",
            code: [
              "import { Injectable, Scope } from '@nestjs/common';",
              "",
              "// Default: Singleton (Shared across all requests)",
              "@Injectable({ scope: Scope.DEFAULT })",
              "export class StandardSingletonService {}",
              "",
              "// Request Scoped: Created on EVERY request (Use with caution!)",
              "@Injectable({ scope: Scope.REQUEST })",
              "export class TenantContextService {",
              "  public tenantId: string = '';",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Making core services Scope.REQUEST unnecessarily",
      wrong: "@Injectable({ scope: Scope.REQUEST }) export class TasksService { ... }",
      right: "@Injectable() export class TasksService { ... } // Singleton (Default)",
      explain:
        "Setting Scope.REQUEST forces NestJS to re-instantiate the service, its dependencies, and its controller on every single HTTP request. This increases latency and memory allocation dramatically. Pass user/tenant context as method parameters instead.",
    },
    tryIt: [
      "Create a custom value provider with token `APP_CONFIG` and inject it using `@Inject('APP_CONFIG')`.",
      "Verify that standard `@Injectable()` services are singletons by logging their constructor and observing it runs only once on startup.",
      "Write a unit test that overrides a provider using `.overrideProvider().useValue({ mockImplementation })`.",
      "Inspect the compiler output with `emitDecoratorMetadata` to see how TypeScript preserves parameter types.",
    ],
    challenge: {
      prompt:
        "Create an async factory provider for a `RedisClient` with token `'REDIS_CLIENT'` that reads connection strings from `ConfigService` and exports the provider.",
      hints: [
        "Use `{ provide: 'REDIS_CLIENT', useFactory: async (config: ConfigService) => { ... }, inject: [ConfigService] }`.",
      ],
      solution: [
        "import { Module } from '@nestjs/common';",
        "import { ConfigModule, ConfigService } from '@nestjs/config';",
        "",
        "@Module({",
        "  imports: [ConfigModule],",
        "  providers: [",
        "    {",
        "      provide: 'REDIS_CLIENT',",
        "      useFactory: async (configService: ConfigService) => {",
        "        const url = configService.get<string>('REDIS_URL', 'redis://localhost:6379');",
        "        // Initialize and connect redis client here",
        "        return { status: 'connected', url };",
        "      },",
        "      inject: [ConfigService],",
        "    },",
        "  ],",
        "  exports: ['REDIS_CLIENT'],",
        "})",
        "export class RedisModule {}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary benefit of Inversion of Control (IoC) and Dependency Injection?",
        options: [
          "It makes code run faster than C++",
          "It decouples object creation from business logic, allowing easy mocking in unit tests and flexible implementation swapping",
          "It eliminates the need for TypeScript",
          "It automatically creates database tables",
        ],
        answer: 1,
        explain:
          "DI decouples classes from concrete implementations, making systems testable, modular, and maintainable.",
      },
      {
        q: "What is the default lifecycle scope of a NestJS provider?",
        options: ["`Scope.REQUEST`", "`Scope.DEFAULT` (Singleton)", "`Scope.TRANSIENT`", "`Scope.GLOBAL`"],
        answer: 1,
        explain:
          "Providers are Singletons (`Scope.DEFAULT`) by default. One instance is instantiated during startup and shared application-wide.",
      },
      {
        q: "When must you use the `@Inject('TOKEN')` decorator explicitly?",
        options: [
          "Never",
          "When injecting non-class tokens (interfaces, string tokens, symbols, or custom factory providers) where TypeScript type metadata is erased at runtime",
          "On every single constructor parameter",
          "Only in controllers",
        ],
        answer: 1,
        explain:
          "TypeScript interfaces are erased at compile time; string or symbol tokens require `@Inject(TOKEN)` for runtime identification.",
      },
      {
        q: "Why is `Scope.REQUEST` considered dangerous for high-throughput backends?",
        options: [
          "It causes compile errors",
          "It forces NestJS to create and garbage-collect new instances of the provider and all upstream dependencies on every HTTP request, reducing throughput",
          "It disables JSON formatting",
          "It only works on Windows",
        ],
        answer: 1,
        explain:
          "Request-scoped providers incur heavy object instantiation and GC overhead on every single request.",
      },
      {
        q: "Which custom provider strategy is ideal for injecting mock objects in unit tests?",
        options: ["`useValue`", "`useClass`", "`useFactory`", "`useStream`"],
        answer: 0,
        explain:
          "`useValue` binds a literal JavaScript object directly to a provider token, perfect for mock test doubles.",
      },
      {
        q: "How does `useFactory` declare dependencies that need to be injected into the factory function?",
        options: [
          "Using the `inject: [...]` array property",
          "By importing them globally",
          "Via environment variables",
          "Using CSS selectors",
        ],
        answer: 0,
        explain:
          "The `inject` array lists provider tokens that NestJS resolves and passes as arguments to the `useFactory` function.",
      },
    ],
    flashcards: [
      {
        front: "What is Dependency Injection?",
        back: "A design pattern where an object receives its dependencies from an external assembler (IoC container) rather than creating them with `new`.",
      },
      {
        front: "What is `useValue` used for?",
        back: "Binding a static value, constant config object, or mock test double to an injection token.",
      },
      {
        front: "What is `useFactory` used for?",
        back: "Dynamically and asynchronously creating a provider instance with runtime dependencies resolved via the `inject` array.",
      },
      {
        front: "What happens when you inject an interface directly without `@Inject()`?",
        back: "NestJS cannot resolve it because TypeScript interfaces are erased during JavaScript compilation.",
      },
      {
        front: "What are the 3 provider scopes in NestJS?",
        back: "1. DEFAULT (Singleton, shared app-wide), 2. REQUEST (created per HTTP request), 3. TRANSIENT (created per consumer).",
      },
      {
        front: "Why should Singleton scope be preferred?",
        back: "Instances are created once at startup, eliminating per-request memory allocation and garbage collection overhead.",
      },
      {
        front: "What TypeScript compiler options are required for NestJS DI?",
        back: "`experimentalDecorators: true` and `emitDecoratorMetadata: true` in `tsconfig.json`.",
      },
      {
        front: "How do you mock a service in NestJS testing module?",
        back: "`Test.createTestingModule({...}).overrideProvider(Service).useValue(mockService).compile()`.",
      },
    ],
    recap: [
      "NestJS IoC resolves constructor dependencies automatically using TypeScript decorator metadata.",
      "Prefer Singleton (`Scope.DEFAULT`) providers for maximum performance and low GC overhead.",
      "Use `useValue` for static mocks and `useFactory` for asynchronous runtime integrations.",
      "Use `@Inject('TOKEN')` when injecting interfaces or symbol-based tokens.",
      "Avoid request-scoped providers unless strictly required for multitenancy.",
    ],
    references: [
      { label: "NestJS Documentation — Custom Providers", url: "https://docs.nestjs.com/fundamentals/custom-providers" },
      { label: "NestJS Documentation — Injection Scopes", url: "https://docs.nestjs.com/fundamentals/injection-scopes" },
    ],
    nextBridge:
      "Now that DI and architecture are solid, in P10-L4 you will build bulletproof input validation with DTOs, class-validator, and Zod environment schemas.",
  },
];

export const LESSON_CONTENT_P10: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P10.map((l) => [l.id, l])
);
