import type { LessonContent } from "./types";

export const LESSON_CONTENT_P40: Record<string, LessonContent> = {
  "p40-l1": {
    id: "p40-l1",
    phaseId: "p40",
    title: "Cohesion, Coupling & SOLID — Pragmatically",
    level: "Mastery",
    minutes: 40,
    summary:
      "Master software modularity without academic over-engineering. Balance High Cohesion and Loose Coupling, and apply pragmatic TypeScript SOLID principles.",
    prerequisites: ["p03-l1 TypeScript Core", "p10-l1 NestJS Core"],
    objectives: [
      "Define High Cohesion (things that change together stay together) and Low Coupling (modules know as little about each other as possible).",
      "Apply the Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP) in TypeScript.",
      "Recognize and avoid 'Architecture Astronaut' over-abstraction traps.",
    ],
    simple:
      "Good software architecture is not about having 50 abstract factory interfaces and design patterns everywhere. Good architecture simply means: if the business changes how billing works, you only have to edit the `billing` folder, and you are 100% confident you didn't accidentally break the user avatar upload system.",
    why:
      "Pragmatic modularity keeps codebases pleasant and productive to work in as team size and codebase volume grow 10x.",
    mentalModel: {
      title: "The Lego Brick Interface",
      body:
        "Every Lego brick has standard cylindrical studs on top and hollow tubes on bottom. You can build a spaceship or a castle without modifying how individual plastic bricks click together.",
    },
    sections: [
      {
        heading: "1. Pragmatic Dependency Inversion in TypeScript",
        body: [
          "- High-level business logic (`OrderService`) should depend on abstractions (interfaces), not direct third-party SDKs (`StripeSDK`).",
          "- Enables instant mocking in unit tests and easy vendor swaps.",
        ],
        code: [
          {
            file: "src/payment.contract.ts",
            lang: "ts",
            code: [
              "// Clean abstraction interface",
              "export interface IPaymentProcessor {",
              "  charge(amountCents: number, currency: string, sourceToken: string): Promise<{ transactionId: string }>;",
              "}",
              "",
              "// High-level service depends on the interface",
              "export class CheckoutService {",
              "  constructor(private readonly paymentProcessor: IPaymentProcessor) {}",
              "",
              "  async completePurchase(cartTotalCents: number, token: string) {",
              "    const { transactionId } = await this.paymentProcessor.charge(cartTotalCents, 'usd', token);",
              "    return { success: true, transactionId };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Dependency Inversion in TypeScript checkout domain.",
          },
        ],
      },
    ],
    mistake: {
      title: "Creating 5 Layers of Abstract Interfaces for a Helper Function Used in Exactly 1 Place",
      wrong: [
        "// ❌ `IStringFormatterFactoryProviderSingletonImpl` for a 2-line slugify function:",
        "// Enterprise over-abstraction creates massive cognitive overhead without any real benefit!",
      ].join("\n"),
      right: [
        "// ✅ Rule of Three: Write direct concrete code first; introduce an abstract interface only when you have 2+ real implementations.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Refactor a God Object into Cohesive Modules",
      description:
        "Split a 1,000-line monolithic `UserManager.ts` handling auth, email, PDF generation, and Stripe into 4 cohesive, loosely coupled domain services.",
      tasks: [
        "Extract `AuthService` and `BillingService`.",
        "Define `IEmailNotifier` interface.",
        "Verify all unit tests pass with mocked dependencies.",
      ],
    },
    quiz: [
      {
        question: "What is the defining characteristic of a system with 'High Cohesion' and 'Low Coupling'?",
        options: [
          "Related functions and data live together in focused modules, and modules interact through minimal, well-defined public interfaces without depending on internal implementation details.",
          "All code is placed in a single 10,000-line file.",
          "Every function requires 10 parameters.",
          "Classes inherit from at least 8 parent classes.",
        ],
        answer: 0,
        explanation:
          "High cohesion ensures modules have single, clear responsibilities; low coupling minimizes interdependencies between distinct modules.",
      },
    ],
  },

  "p40-l2": {
    id: "p40-l2",
    phaseId: "p40",
    title: "Layers, Boundaries & DTO/Mapper Discipline",
    level: "Mastery",
    minutes: 40,
    summary:
      "Construct clean 3-tier architectures (Presentation -> Domain/Service -> Data Access). Prevent database model leakage to clients using strict Data Transfer Objects (DTOs) and Mappers.",
    prerequisites: ["p10-l1 NestJS Core", "p14-l1 Prisma Core"],
    objectives: [
      "Establish strict unidirectional layer boundaries.",
      "Prevent leaky abstractions by mapping Prisma database entities to public DTOs.",
      "Safely strip sensitive fields (password hashes, internal flags) before serializing responses.",
    ],
    simple:
      "Never return raw database rows (`SELECT * FROM users`) directly to the frontend. If a developer later adds a `passwordHash` or `stripeCustomerId` column to the database table, returning the raw entity accidentally leaks secret data to every web browser. A DTO (Data Transfer Object) and Mapper explicitly define the exact shape sent over the wire.",
    why:
      "DTO and Mapper discipline protects against security data leaks (OWASP API3: Broken Object Property Level Authorization).",
    mentalModel: {
      title: "The Restaurant Waiter Menu",
      body:
        "The customer is given a printed menu (DTO) with delicious meal descriptions and prices. The customer is never handed the chef's private handwritten supplier invoice with wholesale ingredient costs and kitchen inventory numbers (Raw DB Entity).",
    },
    sections: [
      {
        heading: "1. Clean Entity to DTO Mapping Pattern",
        body: [
          "- **Database Entity**: Contains internal database IDs, foreign keys, and audit timestamps.",
          "- **Response DTO**: Explicit public contract with formatted fields and zero private data.",
        ],
        code: [
          {
            file: "src/users/user.mapper.ts",
            lang: "ts",
            code: [
              "import type { User as PrismaUser } from '@prisma/client';",
              "",
              "export interface UserResponseDto {",
              "  id: string;",
              "  email: string;",
              "  displayName: string;",
              "  avatarUrl: string | null;",
              "  createdAt: string;",
              "}",
              "",
              "export class UserMapper {",
              "  static toDto(entity: PrismaUser): UserResponseDto {",
              "    return {",
              "      id: entity.id,",
              "      email: entity.email,",
              "      displayName: entity.fullName || entity.email.split('@')[0],",
              "      avatarUrl: entity.avatarUrl,",
              "      createdAt: entity.createdAt.toISOString(),",
              "      // Notice: passwordHash, failedLoginAttempts, stripeId are NEVER exposed here!",
              "    };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Explicit domain-to-DTO mapping function.",
          },
        ],
      },
    ],
    mistake: {
      title: "Returning Raw Prisma / TypeORM Entities Directly in Controller Route Handlers",
      wrong: [
        "// ❌ Returning raw database entity directly:",
        "@Get(':id')\ngetUser(@Param('id') id: string) { return this.prisma.user.findUnique({ where: { id } }); }",
        "// Can accidentally leak passwordHash or internal security tokens!",
      ].join("\n"),
      right: [
        "// ✅ Always pipe database records through a dedicated Mapper: `return UserMapper.toDto(user);`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Implement a Secure DTO Mapper Layer",
      description:
        "Create DTO interfaces and mapper classes for a `Project` and `Member` domain, ensuring sensitive audit columns and soft-delete flags are omitted from responses.",
      tasks: [
        "Define `ProjectResponseDto` contract.",
        "Implement `ProjectMapper.toDto()` and `ProjectMapper.toDtoList()`.",
        "Write unit tests verifying no internal database columns leak into response JSON.",
      ],
    },
    quiz: [
      {
        question: "Why should backend APIs use dedicated DTOs and Mappers rather than returning ORM database models directly?",
        options: [
          "To enforce an explicit contract boundary that prevents leaking sensitive database fields (e.g. password hashes, internal IDs) and decouples API versions from database schema migrations.",
          "Because ORM models cannot be converted to JSON.",
          "To speed up CSS rendering.",
          "To enable Docker builds.",
        ],
        answer: 0,
        explanation:
          "DTO mappers isolate the public API interface from internal database schema evolution and prevent accidental data leakage.",
      },
    ],
  },

  "p40-l3": {
    id: "p40-l3",
    phaseId: "p40",
    title: "Consistency: Transactions vs Events vs Queues",
    level: "Mastery",
    minutes: 40,
    summary:
      "Navigate data consistency tradeoffs in distributed systems. Compare ACID database transactions, Transactional Outbox patterns, and Eventual Consistency in message queues.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p29-l1 BullMQ"],
    objectives: [
      "Differentiate Strong Consistency (ACID Transactions) from Eventual Consistency (Async Queues).",
      "Implement the Transactional Outbox Pattern to solve Dual-Write problems.",
      "Design idempotent event consumers with idempotency keys.",
    ],
    simple:
      "When a user buys a product: deducting inventory and charging money must happen in a single, 100% atomic SQL transaction (if the card fails, inventory is not deducted). But sending the confirmation email or generating analytics reports does NOT need to happen in that same transaction — those can be pushed to an async queue and processed 2 seconds later (Eventual Consistency).",
    why:
      "Trying to make everything strongly consistent slows your database to a crawl; making critical billing eventually consistent causes double-charging bugs.",
    mentalModel: {
      title: "The Bank Teller and the Monthly Statement Mailer",
      body:
        "When you deposit $100 cash, the teller updates your account balance instantly in front of your eyes (Strong Consistency). The bank does not print and mail your monthly paper statement at that exact second — they batch and mail it at midnight (Eventual Consistency).",
    },
    sections: [
      {
        heading: "1. The Dual-Write Problem and the Outbox Solution",
        body: [
          "- **The Bug**: If you save to DB and then call `redisQueue.add()`, your server might crash right between the two calls, leaving your DB updated but the email job lost forever.",
          "- **The Outbox Fix**: Write the event to an `outbox` table in the *same* database transaction as your business data. A background poller reads the outbox and delivers to Redis with zero data loss guarantee.",
        ],
        code: [
          {
            file: "src/orders/outbox.service.ts",
            lang: "ts",
            code: [
              "import { PrismaClient } from '@prisma/client';",
              "",
              "export async function createOrderWithOutbox(prisma: PrismaClient, orderData: any) {",
              "  return prisma.$transaction(async (tx) => {",
              "    // 1. Create order record",
              "    const order = await tx.order.create({ data: orderData });",
              "",
              "    // 2. Insert event into Outbox table atomically in the SAME transaction",
              "    await tx.outboxEvent.create({",
              "      data: {",
              "        aggregateType: 'Order',",
              "        aggregateId: order.id,",
              "        eventType: 'OrderCreated',",
              "        payload: JSON.stringify(order),",
              "      },",
              "    });",
              "",
              "    return order;",
              "  });",
              "}",
            ].join("\n"),
            caption: "Transactional Outbox pattern ensuring zero lost events.",
          },
        ],
      },
    ],
    mistake: {
      title: "Putting Long External HTTP API Calls Inside an Open PostgreSQL Database Transaction",
      wrong: [
        "// ❌ Calling Stripe inside a Prisma $transaction:",
        "await prisma.$transaction(async (tx) => {\n  await tx.order.create(...);\n  await stripe.charges.create(...); // If Stripe takes 8s, DB connection is locked for 8s!\n});",
      ].join("\n"),
      right: [
        "// ✅ Keep database transactions ultra-fast (<5ms); call third-party APIs outside transactions or via background queues.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build an Atomic Outbox Processor",
      description:
        "Implement a Prisma transaction that saves an entity and an outbox event, and a background cron worker that polls and publishes pending events to BullMQ.",
      tasks: [
        "Create `OutboxEvent` schema in Prisma.",
        "Wrap order creation and outbox write in `$transaction`.",
        "Implement worker that marks processed outbox events.",
      ],
    },
    quiz: [
      {
        question: "Why should third-party HTTP network calls (e.g. Stripe, SendGrid) never be executed inside an active database transaction?",
        options: [
          "Because network latency or timeouts in external APIs will hold database connection locks open, exhausting the database connection pool and blocking other queries.",
          "Because PostgreSQL does not support internet access.",
          "Because Stripe blocks SQL queries.",
          "To avoid paying cloud fees.",
        ],
        answer: 0,
        explanation:
          "Database transactions must remain as short as possible (milliseconds) to prevent connection pool exhaustion and database row locking contention.",
      },
    ],
  },
};
