import type { LessonContent } from "./types";

/**
 * Phase 12 NestJS Professional Architecture (L1–L3).
 * Every lesson fulfills the full quality contract.
 */
export const LESSONS_P12: LessonContent[] = [
  {
    id: "p12-l1",
    phaseId: "p12",
    title: "Feature Modules & Thin Controllers",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "In enterprise NestJS codebases, application structure determines maintainability. Large monolithic services and fat controllers quickly degrade into untestable spaghetti. This lesson teaches you how to construct bounded feature modules, design razor-thin HTTP controllers that delegate strictly to application services, enforce separation of concerns, and structure module imports/exports for clean dependency trees without circular references.",
    prerequisites: [
      "p10-l2 — Modules, controllers & providers",
      "p10-l3 — Dependency Injection & Decorators",
      "p11-l1 — FastifyAdapter & NestFastifyApplication",
    ],
    objectives: [
      "Decompose a monolithic application into isolated, domain-bounded feature modules.",
      "Implement the 'Thin Controller, Fat Service' architectural principle.",
      "Encapsulate internal providers while selectively exporting public service contracts.",
      "Structure directory conventions (`dto/`, `entities/`, `services/`, `controllers/`).",
      "Prevent circular module dependencies using forward references or event-driven boundaries.",
    ],
    simple:
      "A fat controller is like an airport check-in desk clerk trying to fly the airplane, refuel the engine, and cook the in-flight meals right at the gate. A thin controller is the proper clerk: they verify your passport and ticket (DTO validation), stamp your boarding pass (route mapping), and hand your baggage to the dedicated ground operations team (Service Layer).",
    why:
      "Controllers tied to HTTP transport logic cannot be unit-tested without mocking HTTP requests. Keeping controllers thin (under 50 lines) ensures all business rules live inside pure TypeScript services that can be tested in isolation or reused across WebSockets, GraphQL, and CLI runners.",
    mentalModel: {
      title: "The Bounded Feature Island & The Export Boundary",
      body: "Think of each NestJS module as an island. Everything inside (`PrivateService`, `InternalRepository`) is invisible to other islands unless placed on the export dock (`exports: [PublicService]`). When Island A imports Island B, it only gets access to the explicitly exported services, preventing uncontrolled spaghetti coupling.",
    },
    sections: [
      {
        heading: "Decomposing into Bounded Feature Modules",
        body: [
          "Every cohesive domain capability (e.g., `Users`, `Billing`, `Projects`, `Notifications`) should live in its own feature module with an explicit public API boundary:",
        ],
        code: [
          {
            file: "src/projects/projects.module.ts",
            lang: "ts",
            code: [
              "import { Module } from '@nestjs/common';",
              "import { ProjectsController } from './projects.controller';",
              "import { ProjectsService } from './projects.service';",
              "import { ProjectsRepository } from './projects.repository';",
              "import { UsersModule } from '../users/users.module';",
              "",
              "@Module({",
              "  imports: [",
              "    UsersModule, // Import UsersModule to gain access to exported UsersService",
              "  ],",
              "  controllers: [ProjectsController],",
              "  providers: [",
              "    ProjectsService,",
              "    ProjectsRepository, // Kept internal; not exported",
              "  ],",
              "  exports: [",
              "    ProjectsService, // Exported so other modules (e.g. TasksModule) can consume it",
              "  ],",
              "})",
              "export class ProjectsModule {}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "The Thin Controller Pattern",
        body: [
          "Controllers should ONLY perform 3 tasks: receive the request, delegate to the domain service, and return the response. No SQL queries, no business rules, no formatting algorithms.",
        ],
        code: [
          {
            file: "src/projects/projects.controller.ts",
            lang: "ts",
            code: [
              "import {",
              "  Controller,",
              "  Get,",
              "  Post,",
              "  Body,",
              "  Param,",
              "  ParseUUIDPipe,",
              "  HttpCode,",
              "  HttpStatus,",
              "} from '@nestjs/common';",
              "import { ProjectsService } from './projects.service';",
              "import { CreateProjectDto } from './dto/create-project.dto';",
              "",
              "@Controller('projects')",
              "export class ProjectsController {",
              "  constructor(private readonly projectsService: ProjectsService) {}",
              "",
              "  @Post()",
              "  @HttpCode(HttpStatus.CREATED)",
              "  async create(@Body() dto: CreateProjectDto) {",
              "    return this.projectsService.createProject(dto);",
              "  }",
              "",
              "  @Get(':id')",
              "  async findOne(@Param('id', ParseUUIDPipe) id: string) {",
              "    return this.projectsService.getProjectById(id);",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Executing database queries and business logic inside the controller",
      wrong: "@Post() async create(@Body() body: any) { const exists = await db.query('SELECT...'); if(exists) throw... return db.query('INSERT...'); }",
      right: "@Post() async create(@Body() dto: CreateProjectDto) { return this.projectsService.create(dto); }",
      explain:
        "Writing business logic and database queries in controllers makes testing nearly impossible without standing up an entire HTTP server, violating Single Responsibility.",
    },
    tryIt: [
      "Review your module layout and group related files into a feature folder (`src/tasks/`).",
      "Ensure all internal database repositories remain private to the module and are NOT listed in `exports`.",
      "Check that your controllers have zero direct database client calls and only call methods on injected services.",
      "Verify that `main.ts` or `app.module.ts` cleanly imports the top-level feature modules.",
    ],
    challenge: {
      prompt:
        "Design a `BillingModule` that provides a private `StripeClientService` and exports a public `BillingService` with a `chargeCustomer` method.",
      hints: [
        "Create `StripeClientService` and list it only in `providers`.",
        "Inject `StripeClientService` into `BillingService`.",
        "List `BillingService` in both `providers` and `exports`.",
      ],
      solution: [
        "import { Module } from '@nestjs/common';",
        "import { BillingService } from './billing.service';",
        "import { StripeClientService } from './stripe-client.service';",
        "import { BillingController } from './billing.controller';",
        "",
        "@Module({",
        "  controllers: [BillingController],",
        "  providers: [BillingService, StripeClientService],",
        "  exports: [BillingService], // Only BillingService is public to other modules",
        "})",
        "export class BillingModule {}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What is the primary role of a controller in a well-architected NestJS app?",
        options: [
          "To handle HTTP routing, validate DTOs via pipes, and delegate execution immediately to domain services",
          "To execute raw SQL queries and coordinate database connection pools",
          "To render React server components",
          "To manage background cron threads",
        ],
        answer: 0,
        explain:
          "Controllers are thin routing adapters that translate HTTP requests into domain service calls.",
      },
      {
        q: "How do you make a provider in `UsersModule` available to `ProjectsModule`?",
        options: [
          "Export the provider in `UsersModule.exports`, and import `UsersModule` in `ProjectsModule.imports`",
          "Mark the provider as `global: true`",
          "Import the service file directly with a relative path in `ProjectsService`",
          "Copy and paste the class into `ProjectsModule`",
        ],
        answer: 0,
        explain:
          "NestJS encapsulates module providers by default. You must explicitly export the provider and import the provider's module.",
      },
      {
        q: "What is the recommended maximum line count for a professional thin controller method?",
        options: ["1–5 lines", "100–200 lines", "500 lines", "Unlimited"],
        answer: 0,
        explain:
          "Thin controller methods should ideally be 1–5 lines: extract parameters, call the service method, and return the promise.",
      },
      {
        q: "Why should database repositories generally NOT be exported in `module.exports`?",
        options: [
          "To prevent other modules from bypassing domain invariants and running ad-hoc queries against raw data tables",
          "Because TypeScript cannot export classes",
          "It causes runtime out-of-memory errors",
          "Fastify prohibits repository exports",
        ],
        answer: 0,
        explain:
          "Encapsulating repositories ensures other modules interact only through the domain service's verified business methods.",
      },
      {
        q: "What happens when two modules import each other directly without forward references?",
        options: [
          "NestJS throws a Circular Dependency error (`Nest cannot create the module instance...`) at startup",
          "The application compiles fine but deletes the database",
          "Node.js runs in an infinite loop consuming 100% CPU",
          "Nothing, NestJS resolves circular imports automatically",
        ],
        answer: 0,
        explain:
          "Circular module imports create undefined dependency references at bootstrap time unless resolved via `forwardRef()` or refactored into a shared module.",
      },
      {
        q: "What directory structure represents standard enterprise NestJS feature layout?",
        options: [
          "`src/feature-name/{dto, entities, feature.controller.ts, feature.service.ts, feature.module.ts}`",
          "Putting all 100 controllers in a single `src/controllers/` folder",
          "Putting all TypeScript code in `main.ts`",
          "Putting all database queries in `.env`",
        ],
        answer: 0,
        explain:
          "Co-locating feature controllers, services, DTOs, and modules within bounded directories maximizes cohesion and readability.",
      },
    ],
    flashcards: [
      {
        front: "What is the 'Thin Controller' principle?",
        back: "Controllers only handle HTTP transport, parameter extraction, and service delegation without business logic.",
      },
      {
        front: "What determines provider visibility across modules?",
        back: "The `exports: [...]` array in the providing module and `imports: [...]` in the consuming module.",
      },
      {
        front: "Why should controllers avoid direct database access?",
        back: "Direct DB calls couple controllers to storage engines and prevent unit testing without database mocks.",
      },
      {
        front: "How do you share a service between two modules?",
        back: "Add it to the provider module's `exports`, and import that module in the consumer's `imports`.",
      },
      {
        front: "What is a Bounded Feature Module?",
        back: "A cohesive module containing controllers, services, DTOs, and entities for a single domain concept.",
      },
      {
        front: "What causes NestJS circular dependency errors?",
        back: "Module A importing Module B while Module B simultaneously imports Module A.",
      },
      {
        front: "How should cross-module communication be structured?",
        back: "Through public service methods or domain events, never direct repository manipulation.",
      },
      {
        front: "Where should input validation live?",
        back: "In DTO classes with `class-validator` decorators, executed by NestJS `ValidationPipe`.",
      },
    ],
    recap: [
      "Organize code into self-contained feature modules per domain concept.",
      "Keep controllers razor-thin: extract parameters, delegate to services, and return results.",
      "Encapsulate internal repositories and helpers; only export public service contracts.",
      "Avoid circular dependencies by modeling unidirectional data flow or event boundaries.",
      "Co-locate feature DTOs, interfaces, and services inside the feature folder.",
    ],
    references: [
      { label: "NestJS Documentation — Modules", url: "https://docs.nestjs.com/modules" },
      { label: "NestJS Documentation — Controllers", url: "https://docs.nestjs.com/controllers" },
    ],
    nextBridge:
      "Now that your feature boundaries and controllers are structured cleanly, in P12-L2 you will master Pipes, Guards, and Custom Param Decorators to enforce validation and role-based access control.",
  },
  {
    id: "p12-l2",
    phaseId: "p12",
    title: "Pipes, Guards & Custom Decorators",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "Security and input validation form the frontline defense of any enterprise backend. This lesson covers configuring `ValidationPipe` with `transform`, `whitelist`, and `forbidNonWhitelisted` to block malicious payload injections, building custom authentication and Role-Based Access Control (RBAC) `CanActivate` Guards, extracting route metadata with `Reflector`, and authoring clean custom parameter decorators like `@CurrentUser()` and `@Public()`.",
    prerequisites: [
      "p07-l3 — Authentication tokens & JWT headers",
      "p10-l4 — DTOs, Config & Environment Validation",
      "p12-l1 — Feature Modules & Thin Controllers",
    ],
    objectives: [
      "Configure global `ValidationPipe` with strict stripping and type transformation options.",
      "Implement `CanActivate` guards for JWT authentication and multi-role RBAC authorization.",
      "Attach and extract custom route metadata using `SetMetadata` and `Reflector`.",
      "Author ergonomic custom parameter decorators like `@CurrentUser()` to clean up controller signatures.",
      "Simulate and inspect guard execution order in the interactive RBAC Guard lab.",
    ],
    simple:
      "A Pipe is like a customs border scanner: it checks every bag, throws away contraband items you didn't declare (`whitelist: true`), and converts currency for you (`transform: true`). A Guard is the armed security checkpoint: it checks your passport and badge level (Role), deciding whether the door opens or slams shut with a 403 Forbidden.",
    why:
      "Without strict parameter stripping, attackers can inject fields like `isAdmin: true` into registration payloads (mass-assignment vulnerability). Global `ValidationPipe` and RBAC Guards eliminate this entire class of security vulnerabilities automatically at the framework boundary.",
    mentalModel: {
      title: "The Execution Chain: Guard Checkpoint → Pipe Transformer",
      body: "When an HTTP request arrives, NestJS executes Guards FIRST. If any Guard returns `false` or throws an `UnauthorizedException`, the request aborts instantly before consuming CPU on validation. If all Guards pass, Pipes parse and validate the payload before passing the clean DTO to your controller method.",
    },
    sections: [
      {
        heading: "Configuring ValidationPipe with Guardrails",
        body: [
          "Set up global validation with strict security settings in `main.ts`:",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { ValidationPipe } from '@nestjs/common';",
              "import { NestFactory } from '@nestjs/core';",
              "import { AppModule } from './app.module';",
              "",
              "async function bootstrap() {",
              "  const app = await NestFactory.create(AppModule);",
              "",
              "  app.useGlobalPipes(",
              "    new ValidationPipe({",
              "      whitelist: true,            // Strips away unknown properties not in DTO",
              "      forbidNonWhitelisted: true, // Throws 400 Bad Request if unknown properties are sent",
              "      transform: true,            // Automatically transforms payloads to DTO class instances",
              "      transformOptions: {",
              "        enableImplicitConversion: false, // Prevents unsafe automatic type coercion",
              "      },",
              "    })",
              "  );",
              "",
              "  await app.listen(3000);",
              "}",
              "bootstrap();",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Building Custom Guards & Extracting Reflector Metadata",
        body: [
          "Guards implement the `CanActivate` interface. Combine them with custom decorators and `Reflector` for declarative RBAC:",
        ],
        code: [
          {
            file: "src/auth/guards/roles.guard.ts",
            lang: "ts",
            code: [
              "import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';",
              "import { Reflector } from '@nestjs/core';",
              "import { ROLES_KEY } from '../decorators/roles.decorator';",
              "import { UserRole } from '../../users/enums/user-role.enum';",
              "",
              "@Injectable()",
              "export class RolesGuard implements CanActivate {",
              "  constructor(private readonly reflector: Reflector) {}",
              "",
              "  canActivate(context: ExecutionContext): boolean {",
              "    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [",
              "      context.getHandler(),",
              "      context.getClass(),",
              "    ]);",
              "",
              "    // If no roles specified, route is accessible to all authenticated users",
              "    if (!requiredRoles || requiredRoles.length === 0) {",
              "      return true;",
              "    }",
              "",
              "    const { user } = context.switchToHttp().getRequest();",
              "    if (!user || !requiredRoles.includes(user.role)) {",
              "      throw new ForbiddenException(`User role '${user?.role}' lacks required permissions`);",
              "    }",
              "",
              "    return true;",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Custom Parameter Decorators (@CurrentUser)",
        body: [
          "Extract user data cleanly without typing `req.user` in controller methods:",
        ],
        code: [
          {
            file: "src/auth/decorators/current-user.decorator.ts",
            lang: "ts",
            code: [
              "import { createParamDecorator, ExecutionContext } from '@nestjs/common';",
              "",
              "export const CurrentUser = createParamDecorator(",
              "  (data: string | undefined, ctx: ExecutionContext) => {",
              "    const request = ctx.switchToHttp().getRequest();",
              "    const user = request.user;",
              "",
              "    return data ? user?.[data] : user;",
              "  }",
              ");",
              "",
              "// Usage in Controller:",
              "// @Get('me')",
              "// getProfile(@CurrentUser() user: UserEntity, @CurrentUser('id') userId: string) { ... }",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Interactive RBAC Guard & Reflector Lab",
        body: [
          "Simulate incoming user roles, JWT tokens, and route metadata to see the exact execution context pipeline in action.",
        ],
        demo: "nest-guard-lab",
      },
    ],
    mistake: {
      title: "Omitting whitelist: true in ValidationPipe, leaving app open to Mass Assignment",
      wrong: "app.useGlobalPipes(new ValidationPipe()); // Accepts undeclared malicious fields like { role: 'ADMIN' }",
      right: "app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));",
      explain:
        "Without `whitelist: true`, extra JSON fields submitted by attackers are passed into DTOs and potentially saved to the database.",
    },
    tryIt: [
      "Open the RBAC Guard Simulator above and test a MEMBER attempting to delete an organization.",
      "Verify that missing JWT tokens trigger 401 Unauthorized before RolesGuard is ever invoked.",
      "Add `forbidNonWhitelisted: true` to your `ValidationPipe` configuration.",
      "Create a custom `@CurrentUser()` decorator and use it inside a controller endpoint.",
    ],
    challenge: {
      prompt:
        "Write an `@RequireTier('PRO' | 'ENTERPRISE')` metadata decorator and a matching `TierGuard` that checks `user.subscriptionTier`.",
      hints: [
        "Use `SetMetadata('tier', requiredTier)` in the decorator.",
        "In `TierGuard`, use `this.reflector.get<string>('tier', context.getHandler())`.",
        "Compare against `request.user.subscriptionTier`.",
      ],
      solution: [
        "import { SetMetadata, Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';",
        "import { Reflector } from '@nestjs/core';",
        "",
        "export const RequireTier = (tier: 'PRO' | 'ENTERPRISE') => SetMetadata('required_tier', tier);",
        "",
        "@Injectable()",
        "export class TierGuard implements CanActivate {",
        "  constructor(private readonly reflector: Reflector) {}",
        "  canActivate(context: ExecutionContext): boolean {",
        "    const requiredTier = this.reflector.get<string>('required_tier', context.getHandler());",
        "    if (!requiredTier) return true;",
        "    const { user } = context.switchToHttp().getRequest();",
        "    if (!user || user.subscriptionTier !== requiredTier) {",
        "      throw new ForbiddenException(`Endpoint requires ${requiredTier} tier subscription`);",
        "    }",
        "    return true;",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What does `whitelist: true` do in NestJS `ValidationPipe`?",
        options: [
          "Automatically strips away any properties in incoming JSON that do not have decorators in the DTO class",
          "Allows all IP addresses through the firewall",
          "Encrypts all passwords",
          "Converts strings to uppercase",
        ],
        answer: 0,
        explain:
          "`whitelist: true` strips all un-annotated properties from the incoming body to prevent mass-assignment attacks.",
      },
      {
        q: "In what order do NestJS lifecycle components execute for an incoming request?",
        options: [
          "Middleware → Guards → Interceptors (Pre) → Pipes → Controller Handler → Interceptors (Post) → Exception Filters",
          "Controller → Pipes → Guards → Middleware",
          "Pipes → Guards → Interceptors → Controller",
          "Guards → Middleware → Controller → Pipes",
        ],
        answer: 0,
        explain:
          "Middleware runs first, followed by Guards, Interceptors (pre), Pipes (transforming data), then the Controller handler.",
      },
      {
        q: "What interface must all NestJS Guards implement?",
        options: ["`CanActivate`", "`PipeTransform`", "`NestInterceptor`", "`ExceptionFilter`"],
        answer: 0,
        explain:
          "Guards must implement `CanActivate` with a `canActivate(context: ExecutionContext): boolean | Promise<boolean>` method.",
      },
      {
        q: "How does a Guard extract route metadata set by a custom decorator?",
        options: [
          "Using the injected `Reflector` utility (`reflector.get(...)` or `reflector.getAllAndOverride(...)`)",
          "Reading from `process.env`",
          "Inspecting `req.headers['x-metadata']`",
          "Querying the database",
        ],
        answer: 0,
        explain:
          "`Reflector` accesses metadata attached to class declarations or route handler functions.",
      },
      {
        q: "What function is used to create custom parameter decorators in NestJS?",
        options: ["`createParamDecorator`", "`new ParamDecorator()`", "`defineDecorator`", "`makeCustomParam`"],
        answer: 0,
        explain:
          "`createParamDecorator((data, ctx: ExecutionContext) => ...)` creates custom parameter decorators like `@CurrentUser()`.",
      },
      {
        q: "What HTTP status code is thrown when a Guard returns `false` without throwing a custom error?",
        options: ["403 Forbidden", "401 Unauthorized", "400 Bad Request", "500 Internal Server Error"],
        answer: 0,
        explain:
          "When a Guard returns `false`, NestJS automatically throws a `ForbiddenException` (HTTP 403 Forbidden).",
      },
    ],
    flashcards: [
      {
        front: "What is `CanActivate`?",
        back: "The interface implemented by NestJS Guards to control route access authorization.",
      },
      {
        front: "What does `forbidNonWhitelisted: true` do?",
        back: "Causes ValidationPipe to throw a 400 Bad Request error if unapproved properties are sent in the payload.",
      },
      {
        front: "What is `Reflector`?",
        back: "NestJS helper class used in Guards/Interceptors to retrieve metadata attached by custom decorators.",
      },
      {
        front: "When do Guards execute relative to Pipes?",
        back: "Guards execute BEFORE Pipes; unauthenticated requests are rejected before parsing payloads.",
      },
      {
        front: "What is `@CurrentUser()`?",
        back: "A custom parameter decorator created with `createParamDecorator` to extract `request.user` cleanly.",
      },
      {
        front: "What is the mass-assignment vulnerability?",
        back: "When attackers inject unauthorized fields (e.g. `role: 'admin'`) into request bodies.",
      },
      {
        front: "What does `transform: true` do in ValidationPipe?",
        back: "Converts plain JavaScript JSON payloads into validated instances of the target DTO class.",
      },
      {
        front: "How do you apply a guard globally?",
        back: "Using `app.useGlobalGuards(new MyGuard())` in `main.ts` or `{ provide: APP_GUARD, useClass: MyGuard }` in `AppModule`.",
      },
    ],
    recap: [
      "Enable global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.",
      "Implement `CanActivate` on Guards to evaluate authentication and role permissions.",
      "Use `Reflector` to retrieve decorator metadata across method and controller class scopes.",
      "Author `@CurrentUser()` custom parameter decorators to eliminate boilerplate in controllers.",
      "Remember that Guards run before Pipes, saving CPU cycles on invalid requests.",
    ],
    references: [
      { label: "NestJS Documentation — Guards", url: "https://docs.nestjs.com/guards" },
      { label: "NestJS Documentation — Validation", url: "https://docs.nestjs.com/techniques/validation" },
    ],
    nextBridge:
      "Now that your incoming requests are strictly validated and guarded, in P12-L3 you will master Interceptors, Exception Filters, and standardizing structured API error envelopes.",
  },
  {
    id: "p12-l3",
    phaseId: "p12",
    title: "Interceptors, Exception Filters & Structured Errors",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Professional APIs require consistent response envelopes, execution timing, and unified error formats. If an unhandled database exception returns a raw stack trace while validation returns an array, frontend developers suffer. This lesson teaches how to use NestJS `NestInterceptor` and RxJS operators (`map`, `tap`, `timeout`) for response transformation, and how to build a global `AllExceptionsFilter` that captures all errors and serializes them into a deterministic `ApiErrorEnvelope`.",
    prerequisites: [
      "p07-l2 — HTTP methods, status codes & headers",
      "p10-l5 — Request Lifecycle & Health Endpoints",
      "p12-l2 — Pipes, Guards & Custom Decorators",
    ],
    objectives: [
      "Implement `NestInterceptor` using RxJS operators (`map`, `tap`, `catchError`) to transform response streams.",
      "Build a response wrapper interceptor that wraps payloads into a standardized `{ data, meta, timestamp }` envelope.",
      "Capture, format, and redact unhandled exceptions using an `AllExceptionsFilter` implementing `ExceptionFilter`.",
      "Measure and log controller execution durations for APM performance monitoring.",
      "Ensure sensitive database error messages and stack traces never leak into production client responses.",
    ],
    simple:
      "An Interceptor is like a gift-wrapping station: whatever gift the controller makes, the interceptor wraps in a uniform branded box with a barcode and delivery stamp (`{ data, timestamp }`). An Exception Filter is the emergency clean-up crew: if a package drops and shatters (error), they catch the shards, file an incident report, and hand the customer a clean, polite apology card instead of shattered glass.",
    why:
      "Without global exception filters, database constraint violations or third-party API timeouts leak internal schema details, table names, and server paths to the public internet, creating security vulnerabilities and degrading frontend error handling.",
    mentalModel: {
      title: "The RxJS Stream Wrapper & The Safety Net",
      body: "• **Interceptor (RxJS Stream)**: Interceptors wrap the execution of the route handler. In the pre-handler phase, you can start a high-resolution timer. In the post-handler phase (`next.handle().pipe(map(...))`), you reshape the returned value.\n• **Exception Filter (Safety Net)**: Placed around the entire NestJS request pipeline. If any Guard, Pipe, or Service throws an exception, the Filter intercepts it before HTTP headers are committed and formats a clean JSON error response.",
    },
    sections: [
      {
        heading: "Standardizing Responses with a Transform Interceptor",
        body: [
          "Wrap all successful responses in a consistent API envelope using RxJS `map`:",
        ],
        code: [
          {
            file: "src/common/interceptors/transform.interceptor.ts",
            lang: "ts",
            code: [
              "import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';",
              "import { Observable } from 'rxjs';",
              "import { map } from 'rxjs/operators';",
              "",
              "export interface ApiResponse<T> {",
              "  data: T;",
              "  statusCode: number;",
              "  timestamp: string;",
              "}",
              "",
              "@Injectable()",
              "export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {",
              "  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {",
              "    const response = context.switchToHttp().getResponse();",
              "    const statusCode = response.statusCode || 200;",
              "",
              "    return next.handle().pipe(",
              "      map((data) => ({",
              "        data,",
              "        statusCode,",
              "        timestamp: new Date().toISOString(),",
              "      }))",
              "    );",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Global Exception Filter & Error Sanitization",
        body: [
          "Create a unified error envelope that redacts internal system details in production:",
        ],
        code: [
          {
            file: "src/common/filters/all-exceptions.filter.ts",
            lang: "ts",
            code: [
              "import {",
              "  ExceptionFilter,",
              "  Catch,",
              "  ArgumentsHost,",
              "  HttpException,",
              "  HttpStatus,",
              "  Logger,",
              "} from '@nestjs/common';",
              "",
              "@Catch()",
              "export class AllExceptionsFilter implements ExceptionFilter {",
              "  private readonly logger = new Logger(AllExceptionsFilter.name);",
              "",
              "  catch(exception: unknown, host: ArgumentsHost) {",
              "    const ctx = host.switchToHttp();",
              "    const response = ctx.getResponse();",
              "    const request = ctx.getRequest();",
              "",
              "    const status =",
              "      exception instanceof HttpException",
              "        ? exception.getStatus()",
              "        : HttpStatus.INTERNAL_SERVER_ERROR;",
              "",
              "    const exceptionResponse =",
              "      exception instanceof HttpException ? exception.getResponse() : null;",
              "",
              "    const message =",
              "      typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse",
              "        ? (exceptionResponse as any).message",
              "        : exception instanceof Error",
              "        ? exception.message",
              "        : 'Internal server error';",
              "",
              "    // Log full error internally for debugging",
              "    this.logger.error(`HTTP ${status} on ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : exception);",
              "",
              "    // Send sanitized envelope to client",
              "    response.status(status).send({",
              "      statusCode: status,",
              "      error: HttpStatus[status] || 'Error',",
              "      message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,",
              "      path: request.url,",
              "      timestamp: new Date().toISOString(),",
              "    });",
              "  }",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Leaking raw database error stacks to clients in production",
      wrong: "catch (err) { res.status(500).json({ error: err.stack, query: err.sql }); }",
      right: "throw new InternalServerErrorException('An unexpected error occurred'); // Caught by AllExceptionsFilter",
      explain:
        "Returning SQL queries or stack traces reveals database schema names, column types, and file system layouts to potential attackers.",
    },
    tryIt: [
      "Register `TransformInterceptor` globally in `main.ts` using `app.useGlobalInterceptors()`.",
      "Register `AllExceptionsFilter` globally using `app.useGlobalFilters()`.",
      "Trigger a 404 and a 400 validation error; verify both conform to the exact same JSON envelope format.",
      "Throw an unhandled `new Error('DB connection lost')` and verify client receives a clean 500 JSON envelope.",
    ],
    challenge: {
      prompt:
        "Write a `LoggingTimingInterceptor` that calculates request execution time in milliseconds and logs `[HTTP] GET /api/v1/users completed in 14.2ms`.",
      hints: [
        "Record `const start = performance.now()` before calling `next.handle()`.",
        "Use `.pipe(tap(() => { const elapsed = performance.now() - start; ... }))`.",
      ],
      solution: [
        "import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';",
        "import { Observable } from 'rxjs';",
        "import { tap } from 'rxjs/operators';",
        "",
        "@Injectable()",
        "export class LoggingTimingInterceptor implements NestInterceptor {",
        "  private readonly logger = new Logger('HTTP');",
        "",
        "  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {",
        "    const req = context.switchToHttp().getRequest();",
        "    const { method, url } = req;",
        "    const start = performance.now();",
        "",
        "    return next.handle().pipe(",
        "      tap(() => {",
        "        const elapsed = (performance.now() - start).toFixed(2);",
        "        this.logger.log(`${method} ${url} completed in ${elapsed}ms`);",
        "      })",
        "    );",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What reactive programming library powers NestJS Interceptors?",
        options: ["RxJS", "Redux", "Lodash", "Axios"],
        answer: 0,
        explain:
          "NestJS Interceptors utilize RxJS Observables and operators (`map`, `tap`, `catchError`, `timeout`).",
      },
      {
        q: "What interface must custom Exception Filters implement?",
        options: ["`ExceptionFilter`", "`NestInterceptor`", "`CanActivate`", "`PipeTransform`"],
        answer: 0,
        explain:
          "Exception Filters must implement the `ExceptionFilter` interface with a `catch(exception, host)` method.",
      },
      {
        q: "What does the `@Catch()` decorator with no arguments signify on an Exception Filter?",
        options: [
          "It catches ALL unhandled exceptions across the entire application (both HttpExceptions and unexpected runtime errors)",
          "It only catches HTTP 404 errors",
          "It disables error handling",
          "It reboots the server on error",
        ],
        answer: 0,
        explain:
          "An empty `@Catch()` decorator catches all exceptions regardless of type.",
      },
      {
        q: "Why should internal error messages be masked with generic text for HTTP 500 errors in production?",
        options: [
          "To avoid leaking internal implementation details, database credentials, SQL syntax, or file paths",
          "Because browsers cannot display more than 20 characters",
          "To speed up network throughput",
          "It is required by TypeScript compiler",
        ],
        answer: 0,
        explain:
          "Masking 500 errors prevents information disclosure vulnerabilities while full details are preserved in internal server logs.",
      },
      {
        q: "Which RxJS operator is used in an interceptor to execute side effects (like logging) without modifying the payload?",
        options: ["`tap()`", "`map()`", "`filter()`", "`reduce()`"],
        answer: 0,
        explain:
          "`tap()` performs side-effects (e.g. metrics, logging, timer calculations) without modifying the stream value.",
      },
      {
        q: "How do you apply an Interceptor globally across all routes?",
        options: [
          "`app.useGlobalInterceptors(new TransformInterceptor())` in `main.ts`",
          "Adding it to `tsconfig.json`",
          "Importing it in `index.html`",
          "Calling `process.intercept()`",
        ],
        answer: 0,
        explain:
          "`app.useGlobalInterceptors()` registers interceptors globally for all incoming HTTP requests.",
      },
    ],
    flashcards: [
      {
        front: "What is a NestJS Interceptor?",
        back: "A class implementing `NestInterceptor` that can bind extra logic before/after route execution and transform response streams.",
      },
      {
        front: "What is an Exception Filter?",
        back: "A class implementing `ExceptionFilter` that catches and customizes error responses thrown anywhere in the application.",
      },
      {
        front: "What is the role of RxJS in Interceptors?",
        back: "RxJS Observables allow streaming transformations (`map`), timing (`tap`), and timeouts (`timeout`) on controller return values.",
      },
      {
        front: "What does `@Catch(HttpException)` do?",
        back: "Binds the exception filter specifically to errors inheriting from NestJS `HttpException`.",
      },
      {
        front: "Why use a unified API response envelope?",
        back: "Provides frontend clients with predictable shape (`data`, `statusCode`, `timestamp`) across all endpoints.",
      },
      {
        front: "What happens if an unhandled error is thrown without a custom filter?",
        back: "NestJS's built-in global exception filter catches it and returns a default 500 Internal Server Error JSON.",
      },
      {
        front: "How do you measure endpoint latency with an Interceptor?",
        back: "Record timestamp before `next.handle()`, and calculate elapsed time inside RxJS `tap()`.",
      },
      {
        front: "What is the difference between Interceptors and Middleware?",
        back: "Interceptors have access to the `ExecutionContext` (class/handler metadata) and can wrap post-execution response streams.",
      },
    ],
    recap: [
      "Use `NestInterceptor` and RxJS `map` to standardize API response envelopes (`{ data, timestamp }`).",
      "Implement a global `AllExceptionsFilter` to catch and format all application errors consistently.",
      "Redact sensitive internal error messages for HTTP 500 errors in production.",
      "Leverage `tap()` in interceptors for high-resolution request timing and APM metrics.",
      "Register interceptors and filters globally in `main.ts` or via `APP_INTERCEPTOR` / `APP_FILTER` tokens.",
    ],
    references: [
      { label: "NestJS Documentation — Interceptors", url: "https://docs.nestjs.com/interceptors" },
      { label: "NestJS Documentation — Exception Filters", url: "https://docs.nestjs.com/exception-filters" },
    ],
    nextBridge:
      "Now that your response and error envelopes are hardened, in P12-L4 you will explore structured JSON logging, AsyncLocalStorage, and request correlation IDs.",
  },
];

export const LESSON_CONTENT_P12: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P12.map((l) => [l.id, l])
);
