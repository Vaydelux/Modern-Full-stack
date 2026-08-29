import type { LessonContent } from "./types";

export const LESSON_CONTENT_P29: Record<string, LessonContent> = {
  "p29-l1": {
    id: "p29-l1",
    phaseId: "p29",
    title: "Contracts: Resources, Actions & Status Codes",
    level: "Advanced",
    minutes: 35,
    summary:
      "Design pragmatic, production-grade REST APIs. Master the architectural distinction between CRUD resources and stateful business actions, strict HTTP status code semantics, and standardized error schemas (RFC 7807 Problem Details).",
    prerequisites: ["p07-l1 HTTP Fundamentals", "p10-l1 NestJS Controllers"],
    objectives: [
      "Distinguish between pure resource nouns and business action endpoints.",
      "Apply strict status-code semantics (200, 201, 202, 204, 400, 401, 403, 404, 409, 422).",
      "Structure RFC 7807 compliant error payloads for consistent client error handling.",
    ],
    simple:
      "A clean REST API treats database records as nouns (/organizations/123/members) and verbs as HTTP methods (POST, GET, PATCH, DELETE). When an operation is a state transition rather than simple property editing (like publishing an article or refunding an invoice), design specialized sub-resource actions (/invoices/123/refund) with explicit status codes.",
    why:
      "Ambiguous endpoints (e.g. POST /doEverything or returning 200 OK with { error: 'Unauthorized' } inside) break frontend client generation, make caching impossible, and confuse external developers integrating with your platform.",
    mentalModel: {
      title: "The Universal Foreign Embassy Protocol",
      body:
        "HTTP status codes are universal diplomatic handshakes. 200 means 'Here is your document', 201 means 'We created your record', 202 means 'We received your application and are processing it in the back office', 409 means 'Conflict: someone already registered this passport number', and 422 means 'Syntactically valid JSON, but the birthdate is in the future'.",
    },
    sections: [
      {
        heading: "1. Resources vs Stateful Business Actions",
        body: [
          "Pure REST models everything as CRUD on resources (`GET /articles/1`, `PATCH /articles/1`, `DELETE /articles/1`).",
          "However, real-world business workflows have complex state machines with side effects (e.g. sending approval emails, billing credit cards, locking balances). Forcing state transitions into a generic `PATCH` request (`PATCH /invoices/1` with `{ status: 'PAID' }`) bypasses validation rules and authorization gates.",
          "**Best Practice**: Use sub-resource verb nouns for state transitions: `POST /api/v1/invoices/:id/refund` or `POST /api/v1/deployments/:id/rollback`.",
        ],
        code: [
          {
            file: "rest-design-patterns.ts",
            lang: "ts",
            code: [
              "// Anti-Pattern: Overloaded generic PATCH bypassing domain logic",
              "// PATCH /api/v1/orders/ord_982 { status: 'CANCELLED' }",
              "",
              "// Best Practice: Explicit Business Action Endpoint with Audit Log",
              "@Controller('api/v1/orders')",
              "export class OrdersController {",
              "  @Post(':id/cancel')",
              "  @HttpCode(HttpStatus.OK)",
              "  async cancelOrder(",
              "    @Param('id') id: string,",
              "    @Body() dto: CancelOrderDto,",
              "    @CurrentUser() user: AuthUser,",
              "  ): Promise<OrderResponseDto> {",
              "    // 1. Validates order status machine (cannot cancel if already SHIPPED)",
              "    // 2. Triggers refund via Stripe gateway",
              "    // 3. Restores stock inventory items in Postgres",
              "    // 4. Emits OrderCancelledEvent to BullMQ queue",
              "    return this.ordersService.cancel(id, dto.reason, user.id);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Explicit sub-resource business action controller.",
          },
        ],
      },
      {
        heading: "2. Status Code Matrix & RFC 7807 Problem Details",
        body: [
          "Standardize HTTP response codes across every service in your cluster:",
          "- `201 Created`: Returns `Location: /api/v1/items/456` header + newly created entity.",
          "- `202 Accepted`: Long-running async task queued in BullMQ.",
          "- `204 No Content`: Successful deletion or mutation with no response body.",
          "- `409 Conflict`: Unique constraint violation or state machine conflict.",
          "- `422 Unprocessable Entity`: Semantic validation failure (e.g., checkout total mismatch).",
          "- RFC 7807 defines a standardized JSON structure (`application/problem+json`) with `type`, `title`, `status`, `detail`, and `instance` properties.",
        ],
        code: [
          {
            file: "rfc7807-error.json",
            lang: "json",
            code: [
              "{",
              '  "type": "https://api.taskforge.dev/errors/invoice-already-refunded",',
              '  "title": "Conflict in State Machine",',
              '  "status": 409,',
              '  "detail": "Invoice inv_8912 was already refunded on 2026-08-20T14:32:00Z.",',
              '  "instance": "/api/v1/invoices/inv_8912/refund",',
              '  "code": "INVOICE_ALREADY_REFUNDED",',
              '  "timestamp": "2026-08-28T22:25:00Z"',
              "}",
            ].join("\n"),
            caption: "RFC 7807 Standard Problem Details payload.",
          },
        ],
      },
    ],
    mistake: {
      title: "Returning 200 OK for Business Failures ('HTTP 200 with Error Flag')",
      wrong: [
        "// ❌ Anti-pattern from legacy SOAP/RPC services:",
        "res.status(200).json({",
        "  success: false,",
        "  error: 'Invalid API Key provided',",
        "});",
        "// Browser fetch() thinks this succeeded (response.ok is true!)",
        "// CDN Edge nodes cache the error response as valid data!",
      ].join("\n"),
      right: [
        "// ✅ Real HTTP error status code:",
        "res.status(401).json({",
        "  statusCode: 401,",
        "  error: 'Unauthorized',",
        "  message: 'Invalid API Key provided',",
        "});",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Standardizing an API Contract",
      description:
        "Refactor a legacy `/api/updateUserBilling` RPC endpoint into a compliant RESTful resource endpoint with RFC 7807 error responses and appropriate status codes.",
      tasks: [
        "Change the endpoint to `PATCH /api/v1/customers/:id/payment-methods` or `POST /api/v1/customers/:id/charge`.",
        "Return `201 Created` with a `Location` header when saving a new card.",
        "Return `422 Unprocessable Entity` when credit card expiry is expired.",
        "Return `409 Conflict` if the customer account is locked for fraud investigation.",
      ],
    },
    quiz: [
      {
        question: "When should you use HTTP 202 Accepted instead of HTTP 200/201?",
        options: [
          "When the client request has validation errors.",
          "When the server has accepted the job into a background worker queue, but final processing has not yet finished.",
          "When the user is not authenticated.",
          "When a DELETE request completes immediately with no response body.",
        ],
        answer: 1,
        explanation:
          "202 Accepted informs the caller that their request was valid and received into a queue (like BullMQ), but asynchronous processing is ongoing.",
      },
    ],
  },

  "p29-l2": {
    id: "p29-l2",
    phaseId: "p29",
    title: "OpenAPI Generation & Versioning Judgment",
    level: "Advanced",
    minutes: 30,
    summary:
      "Generate authoritative OpenAPI 3.1 specifications directly from TypeScript DTOs and decorators using `@nestjs/swagger`. Evaluate URI path vs header versioning strategies and breaking-change policies.",
    prerequisites: ["p29-l1 REST Contracts", "p10-l2 NestJS DTOs"],
    objectives: [
      "Decorate NestJS controllers and DTOs with `@ApiProperty()`, `@ApiOperation()`, and `@ApiResponse()`.",
      "Automate client SDK generation using OpenAPI TypeScript tools (`openapi-typescript`).",
      "Choose the right API versioning strategy (URI Path vs Custom Header vs Accept Header).",
    ],
    simple:
      "Instead of manually writing Markdown API docs that get outdated the moment someone renames a field, write your types and validation decorators in TypeScript. NestJS generates a live `openapi.json` spec and interactive Swagger UI automatically.",
    why:
      "Code-first OpenAPI generation guarantees that your documentation, runtime validation, and generated frontend TypeScript types are always 100% in sync without human drift.",
    mentalModel: {
      title: "The Architectural Blueprint as a Single Source of Truth",
      body:
        "Your TypeScript DTOs are the master blueprint. NestJS compiles them into the OpenAPI schema. Frontend apps run an automated codegen step during CI/CD to generate end-to-end type-safe client SDKs with zero hand-coded fetch wrappers.",
    },
    sections: [
      {
        heading: "1. Automated Swagger / OpenAPI Setup in NestJS",
        body: [
          "Install `@nestjs/swagger` and configure SwaggerModule in your `main.ts` entrypoint.",
          "NestJS automatically inspects class-validator decorators (`@IsString()`, `@IsOptional()`) and generates type annotations.",
          "Export the raw JSON specification at `/api/docs-json` so CI pipelines can auto-generate frontend SDKs.",
        ],
        code: [
          {
            file: "swagger-config.ts",
            lang: "ts",
            code: [
              "import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';",
              "import { INestApplication } from '@nestjs/common';",
              "",
              "export function setupOpenApi(app: INestApplication) {",
              "  const config = new DocumentBuilder()",
              "    .setTitle('TaskForge Enterprise API')",
              "    .setDescription('Production REST API with OAuth2 & API Key authentication')",
              "    .setVersion('1.0.0')",
              "    .addBearerAuth()",
              "    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')",
              "    .build();",
              "",
              "  const document = SwaggerModule.createDocument(app, config);",
              "  SwaggerModule.setup('api/docs', app, document);",
              "}",
            ].join("\n"),
            caption: "OpenAPI DocumentBuilder bootstrap in NestJS.",
          },
        ],
      },
      {
        heading: "2. When and How to Version Your API",
        body: [
          "**Breaking Changes**: Removing a field, renaming a property, changing an HTTP status code, or altering query parameter semantics.",
          "**Non-Breaking Changes**: Adding an optional field, adding a new endpoint, or adding optional query filters.",
          "**Versioning Strategies**:",
          "1. **URI Path (`/v1/users`, `/v2/users`)**: Highest visibility, easily routed at API Gateway / Nginx layer, best for public APIs (Stripe, GitHub).",
          "2. **Header (`X-API-Version: 2026-08-01`)**: Keeps URLs clean, supports point-in-time date-based versioning.",
        ],
        code: [
          {
            file: "versioning.ts",
            lang: "ts",
            code: [
              "// main.ts - Enable URI Versioning in NestJS",
              "app.enableVersioning({",
              "  type: VersioningType.URI,",
              "  defaultVersion: '1',",
              "});",
              "",
              "// users-v2.controller.ts",
              "@Controller({ path: 'users', version: '2' })",
              "export class UsersV2Controller {",
              "  @Get()",
              "  findAllV2() {",
              "    // Returns split firstName and lastName instead of v1 fullName",
              "    return this.usersService.findAllV2();",
              "  }",
              "}",
            ].join("\n"),
            caption: "NestJS URI-based versioning controllers.",
          },
        ],
      },
    ],
    mistake: {
      title: "Bumping API Major Version for Additive Non-Breaking Fields",
      wrong: [
        "// ❌ Created /v2/invoices just because you added a 'notes' field:",
        "// This forces every mobile client and webhook consumer to migrate!",
      ].join("\n"),
      right: [
        "// ✅ Additive changes stay in v1:",
        "export class InvoiceResponseDto {",
        "  id: string;",
        "  amount: number;",
        "  notes?: string; // Non-breaking additive field",
        "}",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Generating TypeScript Frontend Types from OpenAPI",
      description:
        "Configure `openapi-typescript` in a frontend package script to pull `/api/docs-json` from the backend and generate strict TypeScript interfaces.",
      tasks: [
        "Add `@nestjs/swagger` decorators to a `CreateProjectDto` class.",
        "Set up an npm script: `npx openapi-typescript http://localhost:3000/api/docs-json -o src/types/api-schema.ts`.",
        "Use the generated type in a client fetch call.",
      ],
    },
    quiz: [
      {
        question: "Which of the following is considered a breaking API change?",
        options: [
          "Adding a new optional query parameter ?sort=asc.",
          "Adding a new endpoint GET /api/v1/analytics.",
          "Renaming a response JSON field from 'user_id' to 'userId'.",
          "Adding a new field 'created_at' to the response body.",
        ],
        answer: 2,
        explanation:
          "Renaming a field in a JSON response breaks existing client code that expects the old property key.",
      },
    ],
  },

  "p29-l3": {
    id: "p29-l3",
    phaseId: "p29",
    title: "Idempotency Keys for Critical Operations",
    level: "Advanced",
    minutes: 35,
    summary:
      "Guarantee exactly-once execution semantics for financial payments, order checkouts, and external mutations. Implement distributed Redis locking with atomic cached response replays.",
    prerequisites: ["p25-l1 Redis Basics", "p29-l1 REST Contracts"],
    objectives: [
      "Understand why network timeouts cause double-charge bugs without idempotency.",
      "Design an `Idempotency-Key` HTTP header protocol matching Stripe specifications.",
      "Implement a NestJS Interceptor with Redis distributed locking and response caching.",
    ],
    simple:
      "When a user clicks 'Pay $50', their mobile network might disconnect right after your server charges their card but before the phone gets the 200 OK. If the phone retries the request, an idempotency key guarantees the server recognizes the duplicate and returns the original receipt without charging the card a second time.",
    why:
      "Network failures are inevitable in distributed systems. Without idempotency keys, automatic client retries turn transient hiccups into double billing, duplicated orders, and regulatory compliance nightmares.",
    mentalModel: {
      title: "The Numbered Airline Boarding Ticket",
      body:
        "Your Idempotency-Key is a unique boarding pass number (e.g. UUIDv4). If you present the boarding pass at Gate 4, the agent scans it and lets you on. If you drop your bag and return to the gate 2 minutes later with the same ticket, the agent doesn't sell you a second seat — they look up your scanned seat and say 'You are in Seat 14B, welcome back'.",
    },
    sections: [
      {
        heading: "1. The Idempotency Key Lifecycle & State Machine",
        body: [
          "1. Client generates a unique UUIDv4 before sending the request: `Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`.",
          "2. **Atomic Lock**: Server attempts `SET idempotency:key { status: 'PENDING' } NX EX 120` in Redis.",
          "3. If key exists with `PENDING`: another identical request is already running. Return `409 Conflict` or wait.",
          "4. If key exists with `RESOLVED`: retrieve the cached HTTP status code and JSON body, returning it immediately with `X-Cache-Lookup: HIT`.",
          "5. If key is new: execute business transaction, store final response in Redis with a 24-hour TTL, and return `201 Created`.",
        ],
        code: [
          {
            file: "idempotency.interceptor.ts",
            lang: "ts",
            code: [
              "import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';",
              "import { Observable, of } from 'rxjs';",
              "import { tap } from 'rxjs/operators';",
              "import { RedisService } from '../redis/redis.service';",
              "",
              "@Injectable()",
              "export class IdempotencyInterceptor implements NestInterceptor {",
              "  constructor(private readonly redis: RedisService) {}",
              "",
              "  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {",
              "    const req = context.switchToHttp().getRequest();",
              "    const res = context.switchToHttp().getResponse();",
              "    const key = req.headers['idempotency-key'];",
              "    if (!key) return next.handle(); // Optional on non-mutating routes",
              "",
              "    const redisKey = `idempotency:${req.user?.id || 'anon'}:${key}`;",
              "    const cached = await this.redis.get(redisKey);",
              "",
              "    if (cached) {",
              "      const parsed = JSON.parse(cached);",
              "      if (parsed.status === 'PENDING') {",
              "        throw new ConflictException('Concurrent request with this Idempotency-Key is currently in progress.');",
              "      }",
              "      res.status(parsed.statusCode).setHeader('X-Idempotency-Replay', 'true');",
              "      return of(parsed.body);",
              "    }",
              "",
              "    // Acquire atomic processing lock (2 min TTL to avoid deadlocks)",
              "    await this.redis.set(redisKey, JSON.stringify({ status: 'PENDING' }), 'EX', 120);",
              "",
              "    return next.handle().pipe(",
              "      tap(async (responseBody) => {",
              "        // Cache completed response for 24 hours",
              "        await this.redis.set(",
              "          redisKey,",
              "          JSON.stringify({ status: 'RESOLVED', statusCode: res.statusCode || 200, body: responseBody }),",
              "          'EX',",
              "          86400,",
              "        );",
              "      }),",
              "    );",
              "  }",
              "}",
            ].join("\n"),
            caption: "Production NestJS Idempotency Interceptor with Redis.",
          },
        ],
      },
    ],
    mistake: {
      title: "Scoping Idempotency Keys Globally Without User / Tenant Namespacing",
      wrong: [
        "// ❌ Key stored only by UUID:",
        "const redisKey = `idempotency:${key}`;",
        "// Vulnerability: User A can guess or reuse User B's UUID and inspect cached response data!",
      ].join("\n"),
      right: [
        "// ✅ Scoped to authenticated user / organization:",
        "const redisKey = `idempotency:${user.tenantId}:${user.id}:${key}`;",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Double-Submit Prevention Drill",
      description:
        "Simulate an unstable cellular connection by sending two identical POST requests with the same Idempotency-Key concurrently.",
      tasks: [
        "Send 2 concurrent requests with `Idempotency-Key: demo-uuid-001` to `/api/v1/charges`.",
        "Verify that only 1 charge is recorded in the database.",
        "Verify that the second request returns `X-Idempotency-Replay: true` and the exact same charge JSON.",
      ],
    },
    quiz: [
      {
        question: "What should the server do if a request arrives with an Idempotency-Key that is currently in 'PENDING' status?",
        options: [
          "Execute the charge a second time immediately.",
          "Delete the lock and throw 500 Internal Server Error.",
          "Return 409 Conflict indicating that the operation is already being processed.",
          "Return 200 OK with an empty response.",
        ],
        answer: 2,
        explanation:
          "If a lock is still PENDING, another thread or worker is currently executing the request; returning 409 Conflict prevents duplicate concurrent execution.",
      },
    ],
  },
};
