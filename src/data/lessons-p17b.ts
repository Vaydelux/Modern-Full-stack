import type { LessonContent } from "./types";

/**
 * Phase 17 Supabase Auth + Next.js + NestJS (L4–L6).
 */
export const LESSONS_P17B: LessonContent[] = [
  {
    id: "p17-l4",
    phaseId: "p17",
    title: "Guards, @Public, @CurrentUser & /auth/me",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Design an enterprise NestJS auth guard architecture. Implement global AuthGuard with Reflector bypass for @Public() routes, create strongly typed @CurrentUser() parameter decorators, and implement the authoritative /auth/me endpoint.",
    prerequisites: [
      "p17-l3 — NestJS Verifies Tokens: JWT/JWKS the Right Way",
      "p10-l3 — Guards, Execution Context & CanActivate",
    ],
    objectives: [
      "Create a global `SupabaseAuthGuard` extending `AuthGuard('supabase')`.",
      "Implement the `@Public()` custom metadata decorator using `SetMetadata` and `Reflector`.",
      "Write a strongly typed `@CurrentUser()` param decorator to extract sanitized user identity.",
      "Implement the `/api/v1/auth/me` controller endpoint returning synchronized user profile data.",
    ],
    simple:
      "Instead of decorating every single controller route with `@UseGuards(AuthGuard)`, secure enterprise systems use the 'Secure by Default' pattern: make the entire API protected globally, and explicitly opt-out public health checks or marketing routes using `@Public()`. When an authenticated request arrives, our custom `@CurrentUser()` decorator cleanly extracts the verified user payload from the request context without messy boilerplate.",
    why:
      "If you rely on developers remembering to add `@UseGuards` to every new endpoint, someone will eventually forget on a critical route, exposing private user data to the unauthenticated public internet. Secure by default prevents human error.",
    mentalModel: {
      title: "The Secure Building Badge Turnstile",
      body: "Think of an enterprise tech headquarters. The front turnstile is locked by default for every single door and hallway in the building (Global Guard). The public coffee shop in the lobby has a special bypass sign (@Public()). Everyone inside has their employee badge scanned and registered at the door; whenever a manager asks 'Who are you?' (@CurrentUser()), your verified employee ID is instantly handed over.",
    },
    sections: [
      {
        heading: "1. The Secure-By-Default Global Guard with Reflector",
        body: [
          "We implement `SupabaseAuthGuard` using NestJS `Reflector` to inspect route metadata for `@Public()` tags.",
        ],
        code: [
          {
            file: "src/auth/guards/supabase-auth.guard.ts",
            lang: "ts",
            code: [
              "import { ExecutionContext, Injectable } from '@nestjs/common';",
              "import { Reflector } from '@nestjs/core';",
              "import { AuthGuard } from '@nestjs/passport';",
              "import { IS_PUBLIC_KEY } from '../decorators/public.decorator';",
              "",
              "@Injectable()",
              "export class SupabaseAuthGuard extends AuthGuard('supabase') {",
              "  constructor(private reflector: Reflector) {",
              "    super();",
              "  }",
              "",
              "  canActivate(context: ExecutionContext) {",
              "    // Check if handler or class has @Public() metadata",
              "    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [",
              "      context.getHandler(),",
              "      context.getClass(),",
              "    ]);",
              "",
              "    if (isPublic) {",
              "      return true;",
              "    }",
              "",
              "    // Otherwise, delegate to passport-jwt strategy verification",
              "    return super.canActivate(context);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Custom SupabaseAuthGuard respecting @Public() metadata.",
          },
          {
            file: "src/auth/decorators/public.decorator.ts",
            lang: "ts",
            code: [
              "import { SetMetadata } from '@nestjs/common';",
              "",
              "export const IS_PUBLIC_KEY = 'isPublic';",
              "export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);",
            ].join("\n"),
            caption: "The @Public() decorator using NestJS SetMetadata.",
          },
        ],
      },
      {
        heading: "2. The Strongly Typed @CurrentUser() Parameter Decorator",
        body: [
          "Extracting the user payload from `request.user` should be clean, type-safe, and capable of property selection.",
        ],
        code: [
          {
            file: "src/auth/decorators/current-user.decorator.ts",
            lang: "ts",
            code: [
              "import { createParamDecorator, ExecutionContext } from '@nestjs/common';",
              "import type { SupabaseJwtPayload } from '../supabase.strategy';",
              "",
              "export interface AuthenticatedUser {",
              "  id: string; // Supabase auth.users UUID",
              "  email?: string;",
              "  role: string;",
              "  appMetadata: Record<string, unknown>;",
              "  userMetadata: Record<string, unknown>;",
              "}",
              "",
              "export const CurrentUser = createParamDecorator(",
              "  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {",
              "    const request = ctx.switchToHttp().getRequest();",
              "    const payload = request.user as SupabaseJwtPayload | undefined;",
              "",
              "    if (!payload) {",
              "      return null;",
              "    }",
              "",
              "    const user: AuthenticatedUser = {",
              "      id: payload.sub,",
              "      email: payload.email,",
              "      role: payload.role,",
              "      appMetadata: payload.app_metadata ?? {},",
              "      userMetadata: payload.user_metadata ?? {},",
              "    };",
              "",
              "    return data ? user[data] : user;",
              "  }",
              ");",
            ].join("\n"),
            caption: "Typed @CurrentUser() parameter decorator with optional property extractor.",
          },
        ],
      },
      {
        heading: "3. The /api/v1/auth/me Controller Endpoint",
        body: [
          "The `/auth/me` route provides the frontend with verified user identity and linked application profile details.",
        ],
        code: [
          {
            file: "src/auth/auth.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Get } from '@nestjs/common';",
              "import { CurrentUser, type AuthenticatedUser } from './decorators/current-user.decorator';",
              "import { Public } from './decorators/public.decorator';",
              "import { UsersService } from '../users/users.service';",
              "",
              "@Controller('auth')",
              "export class AuthController {",
              "  constructor(private usersService: UsersService) {}",
              "",
              "  @Get('me')",
              "  async getProfile(@CurrentUser() user: AuthenticatedUser) {",
              "    // Fetch synchronized application user profile from Prisma/PostgreSQL",
              "    const profile = await this.usersService.findOrCreateFromSupabase(user);",
              "    return {",
              "      user,",
              "      profile,",
              "    };",
              "  }",
              "",
              "  @Public()",
              "  @Get('health')",
              "  getHealth() {",
              "    return { status: 'ok', timestamp: new Date().toISOString() };",
              "  }",
              "}",
            ].join("\n"),
            caption: "AuthController with /auth/me and @Public() health route.",
          },
        ],
      },
    ],
    mistake: {
      title: "Placing AuthGuard Manually on 50 Individual Routes",
      wrong: "@UseGuards(SupabaseAuthGuard) on every single controller method.",
      right: "Register `APP_GUARD` in AppModule providers and use `@Public()` for unauthenticated routes.",
      explain:
        "Global guards ensure zero endpoints are accidentally left unprotected when new junior developers or features add endpoints in the future.",
    },
    tryIt: [
      "Register `SupabaseAuthGuard` globally in `app.module.ts` using `{ provide: APP_GUARD, useClass: SupabaseAuthGuard }`.",
      "Add `@Public()` to `/api/v1/health` and verify it responds with 200 without headers.",
      "Send a GET request to `/api/v1/auth/me` with a valid Bearer token and inspect the `@CurrentUser()` injection.",
    ],
    challenge: {
      prompt: "Configure AppModule to supply the global guard with APP_GUARD so that all controllers are protected by default.",
      hints: [
        "Import `{ APP_GUARD }` from `@nestjs/core`.",
        "Provide `{ provide: APP_GUARD, useClass: SupabaseAuthGuard }` in the `providers` array.",
      ],
      solution: [
        "// In app.module.ts:",
        "@Module({",
        "  imports: [AuthModule, UsersModule],",
        "  providers: [",
        "    {",
        "      provide: APP_GUARD,",
        "      useClass: SupabaseAuthGuard,",
        "    },",
        "  ],",
        "})",
        "export class AppModule {}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "How does NestJS Reflector allow SupabaseAuthGuard to recognize @Public() endpoints?",
        options: [
          "Reflector scans the filesystem for files named public.ts.",
          "Reflector extracts metadata set by `SetMetadata(IS_PUBLIC_KEY, true)` on the execution context handler or controller class.",
          "Reflector connects directly to Postgres.",
          "Reflector decrypts the JWT secret.",
        ],
        answer: 1,
        explanation:
          "`Reflector.getAllAndOverride()` inspects the route handler and controller class metadata to determine if the route has opted out of authentication.",
      },
      {
        question: "What is the primary benefit of custom parameter decorators like `@CurrentUser()`?",
        options: [
          "They replace the database engine.",
          "They eliminate repetitive boilerplate like `req.user as SupabaseJwtPayload` and provide clean, strongly typed parameter injection in controller methods.",
          "They automatically hash incoming passwords.",
          "They compress network packets.",
        ],
        answer: 1,
        explanation:
          "`@CurrentUser()` cleanly decouples controller methods from raw HTTP request objects, ensuring high type safety and simple unit test mocking.",
      },
    ],
    flashcards: [
      {
        front: "What is the 'Secure-By-Default' pattern in NestJS?",
        back: "Applying authentication globally via `APP_GUARD` and using `@Public()` to explicitly opt out public endpoints.",
      },
      {
        front: "How does `@CurrentUser('id')` work?",
        back: "The parameter decorator accepts a key argument, extracts `req.user`, and returns the specific property directly.",
      },
    ],
    recap: [
      "Use `APP_GUARD` with `SupabaseAuthGuard` for secure-by-default API design.",
      "Use `@Public()` to opt-out public routes cleanly with `Reflector`.",
      "Inject typed identities into controllers using the `@CurrentUser()` parameter decorator.",
    ],
    references: [
      { label: "NestJS Custom Route Decorators", url: "https://docs.nestjs.com/custom-decorators" },
      { label: "NestJS Global Guards Documentation", url: "https://docs.nestjs.com/guards#binding-guards" },
    ],
    nextBridge: "Now that we have verified identities in NestJS, how do we link Supabase auth.users UUIDs to our Prisma application User model?",
  },
  {
    id: "p17-l5",
    phaseId: "p17",
    title: "Linking Supabase Identity to Application Users",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "Design robust identity synchronization between Supabase Auth (auth.users) and your Prisma application database (public.User). Master JIT (Just-In-Time) provisioning, webhooks, and idempotent profile creation.",
    prerequisites: [
      "p17-l4 — Guards, @Public, @CurrentUser & /auth/me",
      "p14-l1 — Install Exactly 7.9.15: Schema, Models & Relations",
    ],
    objectives: [
      "Understand the boundary between Supabase's managed `auth.users` schema and your application's `public.User` table.",
      "Design a Prisma schema referencing Supabase UUIDs as unique external identifiers.",
      "Implement Just-In-Time (JIT) idempotent user provisioning on first API interaction.",
      "Handle race conditions with `upsert` and unique database constraints.",
    ],
    simple:
      "Supabase Auth manages its own internal PostgreSQL schema called `auth` with a table named `auth.users`. However, our business logic (tasks, workspaces, billing plans, profile photos) lives in the `public` schema managed by Prisma. We link them by storing the Supabase User UUID as `supabaseId` (or `id`) in our `User` table. When a user logs in for the first time, our backend idempotently ensures their application user profile exists in PostgreSQL.",
    why:
      "Trying to use foreign keys directly from `public.User` to `auth.users` creates schema migration conflicts with Prisma 7.9.15, because Prisma does not manage the internal Supabase `auth` schema. Decoupling with an indexed UUID ensures zero migration breakage.",
    mentalModel: {
      title: "The Badge ID & The Employee File",
      body: "Supabase GoTrue is the building security desk: it issues an electronic badge number (`auth.users.id` UUID). Your Prisma `public.User` table is HR's internal employee file: it holds the employee's title, department, assigned tasks, and payroll records. HR's file references the badge number so security credentials and company operations stay cleanly separated.",
    },
    sections: [
      {
        heading: "1. The Schema Partition: auth.users vs public.User",
        body: [
          "In PostgreSQL, `auth` and `public` are separate schemas.",
          "We define our Prisma User model with a unique index on `supabaseId`.",
        ],
        code: [
          {
            file: "prisma/schema.prisma",
            lang: "sql",
            code: [
              "model User {",
              "  id           String      @id @default(cuid())",
              "  supabaseId   String      @unique @map(\"supabase_id\") // UUID from auth.users",
              "  email        String      @unique",
              "  displayName  String?     @map(\"display_name\")",
              "  avatarUrl    String?     @map(\"avatar_url\")",
              "  role         UserRole    @default(MEMBER)",
              "  createdAt    DateTime    @default(now()) @map(\"created_at\")",
              "  updatedAt    DateTime    @updatedAt @map(\"updated_at\")",
              "",
              "  // Application relations",
              "  memberships  WorkspaceMember[]",
              "  authoredTasks Task[]      @relation(\"TaskAuthor\")",
              "",
              "  @@map(\"users\")",
              "}",
              "",
              "enum UserRole {",
              "  ADMIN",
              "  MEMBER",
              "  VIEWER",
              "}",
            ].join("\n"),
            caption: "Prisma schema cleanly mapping supabaseId to the application User model.",
          },
        ],
      },
      {
        heading: "2. Just-In-Time (JIT) Idempotent Provisioning Service",
        body: [
          "When a verified JWT arrives at `/auth/me` or any guarded endpoint, we call `findOrCreateFromSupabase` using atomic `upsert`.",
        ],
        code: [
          {
            file: "src/users/users.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';",
              "",
              "@Injectable()",
              "export class UsersService {",
              "  private readonly logger = new Logger(UsersService.name);",
              "",
              "  constructor(private prisma: PrismaService) {}",
              "",
              "  /**",
              "   * Idempotently finds or creates the application user profile from a verified Supabase JWT.",
              "   * Uses Prisma atomic upsert to prevent race conditions during concurrent first requests.",
              "   */",
              "  async findOrCreateFromSupabase(authUser: AuthenticatedUser) {",
              "    const email = authUser.email ?? `${authUser.id}@placeholder.supabase.co`;",
              "    const fullName = (authUser.userMetadata.full_name as string) ?? null;",
              "    const avatarUrl = (authUser.userMetadata.avatar_url as string) ?? null;",
              "",
              "    const user = await this.prisma.user.upsert({",
              "      where: { supabaseId: authUser.id },",
              "      update: {",
              "        email,",
              "        displayName: fullName || undefined,",
              "        avatarUrl: avatarUrl || undefined,",
              "      },",
              "      create: {",
              "        supabaseId: authUser.id,",
              "        email,",
              "        displayName: fullName,",
              "        avatarUrl,",
              "      },",
              "    });",
              "",
              "    this.logger.debug(`Synchronized application user ${user.id} for Supabase ${authUser.id}`);",
              "    return user;",
              "  }",
              "",
              "  async findBySupabaseId(supabaseId: string) {",
              "    return this.prisma.user.findUnique({",
              "      where: { supabaseId },",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "Idempotent user provisioning with Prisma upsert.",
          },
        ],
      },
    ],
    mistake: {
      title: "Hard Foreign Key Constraint to auth.users in Prisma Migrations",
      wrong: "Running `prisma migrate dev` with `@relation(fields: [id], references: [id])` pointing to auth.users.",
      right: "Store `supabaseId String @unique` and manage application references within the public schema.",
      explain:
        "Prisma manages the default `public` schema. When Prisma attempts to validate or alter foreign keys against the protected `auth` schema, permission errors or migration diffs will fail in production.",
    },
    tryIt: [
      "Add the `supabaseId` field to your Prisma `User` model in `schema.prisma`.",
      "Run `npx prisma migrate dev --name add_supabase_user_link`.",
      "Implement the `findOrCreateFromSupabase` method in `UsersService`.",
    ],
    challenge: {
      prompt: "Explain how to handle initial default workspace creation when a brand-new user signs up and calls `/auth/me` for the first time.",
      hints: [
        "Inside `findOrCreateFromSupabase`, check if the user was just created (or query their workspace memberships).",
        "If no workspace memberships exist, execute an interactive transaction creating both a Personal Workspace and the WorkspaceMember record with ADMIN role.",
      ],
      solution: [
        "await this.prisma.$transaction(async (tx) => {",
        "  const user = await tx.user.upsert({ ... });",
        "  const existingMember = await tx.workspaceMember.findFirst({ where: { userId: user.id } });",
        "  if (!existingMember) {",
        "    const ws = await tx.workspace.create({",
        "      data: { name: `${user.displayName || 'Personal'} Workspace`, ownerId: user.id },",
        "    });",
        "    await tx.workspaceMember.create({",
        "      data: { workspaceId: ws.id, userId: user.id, role: 'ADMIN' },",
        "    });",
        "  }",
        "  return user;",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why is Prisma `upsert` preferred over `findFirst` followed by `create` for JIT user provisioning?",
        options: [
          "`upsert` uses less RAM on the client.",
          "`upsert` is atomic at the database level, preventing duplicate key violations if concurrent initial requests arrive simultaneously.",
          "`upsert` bypasses foreign keys.",
          "`findFirst` cannot read UUID fields.",
        ],
        answer: 1,
        explanation:
          "If a frontend issues multiple parallel queries on initial page load (e.g. fetching `/auth/me` and `/tasks`), two simultaneous `create` calls would collide. `upsert` prevents unique constraint errors.",
      },
      {
        question: "Where does Supabase store raw user passwords and OAuth provider metadata?",
        options: [
          "In the `public.users` table.",
          "In the managed `auth.users` table inside PostgreSQL.",
          "In client browser cookies.",
          "In Redis memory cache only.",
        ],
        answer: 1,
        explanation:
          "Supabase GoTrue securely stores credential hashes, encrypted tokens, and OAuth provider states in the protected `auth.users` PostgreSQL table.",
      },
    ],
    flashcards: [
      {
        front: "What is JIT (Just-In-Time) user provisioning?",
        back: "Creating or updating the application database profile on-demand upon first verified JWT presentation, rather than relying on brittle synchronous webhooks.",
      },
      {
        front: "How do we link Prisma User to Supabase Auth?",
        back: "By indexing a `supabaseId String @unique` field on the Prisma `User` model matching `auth.users.id`.",
      },
    ],
    recap: [
      "Keep `auth.users` and `public.User` cleanly decoupled using indexed `supabaseId` UUIDs.",
      "Use atomic Prisma `upsert` for idempotent JIT profile synchronization.",
      "Execute transactional workspace onboarding when initial memberships are absent.",
    ],
    references: [
      { label: "Supabase Managing User Data", url: "https://supabase.com/docs/guides/auth/managing-user-data" },
      { label: "Prisma Upsert Documentation", url: "https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#upsert" },
    ],
    nextBridge: "Now that identity is verified and synchronized, let's explore common production auth bugs: token expiry, wrong issuer, and infinite refresh loops.",
  },
  {
    id: "p17-l6",
    phaseId: "p17",
    title: "Debugging Expiry, Issuer, Audience & Refresh Loops",
    level: "Backend Developer",
    minutes: 40,
    summary:
      "Master systematic triage for authentication failures. Debug TokenExpiredError, wrong audience/issuer claims, infinite redirect loops in Next.js Middleware, and CORS preflight credential errors.",
    prerequisites: [
      "p17-l2 — Browser vs Server Clients, Cookies & Refresh",
      "p17-l3 — NestJS Verifies Tokens: JWT/JWKS the Right Way",
    ],
    objectives: [
      "Execute the 5-point Token-Autopsy checklist for any HTTP 401 Unauthorized error.",
      "Diagnose and resolve infinite redirect loops between `/login` and `/dashboard` in Next.js Middleware.",
      "Configure CORS headers in NestJS for credentialed cross-origin requests (`credentials: true`, explicit origins).",
      "Debug clock-skew token expiration discrepancies between edge workers and database servers.",
    ],
    simple:
      "When authentication fails, generic error messages like 'Unauthorized' leave developers guessing. Systematic authentication triage requires checking five specific layers: 1) Authorization header presence, 2) Token base64 structure, 3) Cryptographic signature against JWKS, 4) Standard claims (`exp`, `nbf`, `iss`, `aud`), and 5) Cookie domain/path propagation.",
    why:
      "Authentication bugs in production create severe customer downtime (users locked out of their accounts) or security regressions. Having a battle-tested triage checklist resolves auth outages in minutes rather than hours.",
    mentalModel: {
      title: "The Five-Checkpoint Security Perimeter",
      body: "Treat every failed request like an aircraft investigation. You check the 5 instruments in strict sequence: 1) Did the plane have a ticket? (Header), 2) Was the ticket legible? (Format), 3) Was the seal authentic? (Signature), 4) Was the flight date today? (Exp), 5) Was it flying to this airport? (Aud/Iss). The first failed instrument pinpoint the exact defect.",
    },
    sections: [
      {
        heading: "1. The 5-Point Token-Autopsy Triage Matrix",
        body: [
          "When NestJS rejects an incoming request with 401, follow this diagnosis sequence.",
        ],
        code: [
          {
            file: "AUTH_TRIAGE_RUNBOOK.md",
            lang: "text",
            code: [
              "┌───┬───────────────────────────────┬────────────────────────────────────────────────────────┐",
              "│ # │ Failure Symptom               │ Root Cause & Immediate Fix                             │",
              "├───┼───────────────────────────────┼────────────────────────────────────────────────────────┤",
              "│ 1 │ Missing Authorization header  │ Frontend failed to attach `Bearer <jwt>` in fetch.     │",
              "│ 2 │ TokenExpiredError (jwt exp)   │ Token expired (>3600s); client must call refresh token.│",
              "│ 3 │ JsonWebTokenError: bad sig    │ JWKS secret mismatch or wrong project SUPABASE_URL.    │",
              "│ 4 │ JsonWebTokenError: bad iss    │ Token issued for staging; API expects production iss.  │",
              "│ 5 │ CORS: credentials omitted     │ Backend has `origin: '*'` with credentials enabled.    │",
              "└───┴───────────────────────────────┴────────────────────────────────────────────────────────┘",
            ].join("\n"),
            caption: "The 5-Point Token Autopsy runbook.",
          },
        ],
      },
      {
        heading: "2. Resolving Next.js Middleware Infinite Redirect Loops",
        body: [
          "Infinite redirect loops occur when Middleware protects `/login` itself, or when cookies are not propagated to `NextResponse.next()`.",
        ],
        code: [
          {
            file: "src/middleware-fixes.ts",
            lang: "ts",
            code: [
              "// ❌ BUG: Checking user on /login causes infinite loop!",
              "// if (!user) return NextResponse.redirect('/login');",
              "",
              "// ✅ FIX: Exclude auth pages from protection, or verify pathname first",
              "const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||",
              "                    request.nextUrl.pathname.startsWith('/signup') ||",
              "                    request.nextUrl.pathname.startsWith('/auth');",
              "",
              "if (!user && !isAuthRoute && request.nextUrl.pathname.startsWith('/dashboard')) {",
              "  const url = request.nextUrl.clone();",
              "  url.pathname = '/login';",
              "  return NextResponse.redirect(url);",
              "}",
              "",
              "if (user && isAuthRoute) {",
              "  // Already logged in! Redirect straight to dashboard",
              "  return NextResponse.redirect(new URL('/dashboard', request.url));",
              "}",
            ].join("\n"),
            caption: "Correct routing guards preventing infinite redirect cycles.",
          },
        ],
      },
    ],
    mistake: {
      title: "Wildcard CORS origin: '*' with credentials: true",
      wrong: "app.enableCors({ origin: '*', credentials: true }); // Browser rejects this!",
      right: "app.enableCors({ origin: ['http://localhost:3000', 'https://app.example.com'], credentials: true });",
      explain:
        "The Fetch and CORS specifications explicitly forbid `Access-Control-Allow-Origin: *` when `Access-Control-Allow-Credentials: true` is set. Browsers will silently block all responses with network errors.",
    },
    tryIt: [
      "Inspect incoming JWT headers using jwt.io or an offline debugger.",
      "Check that your NestJS CORS configuration specifies exact origin URLs.",
      "Verify middleware route matchers exclude `_next/static` and static assets.",
    ],
    challenge: {
      prompt: "Explain how to account for slight clock-skew between your Next.js server and Supabase Auth servers during token verification.",
      hints: [
        "Passport and jsonwebtoken allow a `clockTolerance` option specified in seconds.",
        "Set `clockTolerance: 10` (10 seconds) in your Passport JWT strategy options.",
      ],
      solution: [
        "super({",
        "  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),",
        "  issuer: `${supabaseUrl}/auth/v1`,",
        "  audience: 'authenticated',",
        "  clockTolerance: 10, // Allows 10s difference in system clocks",
        "  // ...",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why will a browser reject an HTTP response with CORS error if `origin: '*'` and `credentials: true` are combined?",
        options: [
          "The W3C / WHATWG CORS specification strictly forbids wildcard origins when sending sensitive cookies or authorization headers.",
          "Postgres does not allow wildcards.",
          "The server runs out of TCP sockets.",
          "Vite disables wildcards in production.",
        ],
        answer: 0,
        explanation:
          "Allowing wildcard origins with credentials would allow any malicious third-party website to make credentialed requests to your API and steal user data.",
      },
      {
        question: "What causes an infinite redirect loop in Next.js authentication middleware?",
        options: [
          "The database disk is full.",
          "The middleware redirects unauthenticated users to `/login`, but `/login` itself is not excluded from the unauthenticated check.",
          "The JWT secret is too long.",
          "Prisma 7.9.15 is installed.",
        ],
        answer: 1,
        explanation:
          "If the middleware logic executes on `/login` and tries to redirect unauthenticated requests to `/login`, the browser enters a loop until giving up.",
      },
    ],
    flashcards: [
      {
        front: "What is clock tolerance in JWT verification?",
        back: "A small window (e.g. 5–10s) permitted during timestamp checks to compensate for minor time synchronization differences across cloud servers.",
      },
      {
        front: "What CORS rule is mandatory when passing Authorization cookies?",
        back: "Explicit origin whitelist (`origin: ['https://app.com']`) combined with `credentials: true` (no wildcards allowed).",
      },
    ],
    recap: [
      "Use the 5-point Token Autopsy to triage 401 errors systematically.",
      "Exclude auth routes (`/login`, `/signup`) from middleware redirection logic.",
      "Never use wildcard `*` with `credentials: true` in CORS configurations.",
    ],
    references: [
      { label: "MDN CORS Credentialed Requests", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials" },
      { label: "Supabase Auth Troubleshooting", url: "https://supabase.com/docs/guides/auth/troubleshooting" },
    ],
    nextBridge: "With rock-solid authentication established, let's step into Phase 18: Authorization, RBAC, and Resource-Level Security.",
  },
];

export const LESSON_CONTENT_P17B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P17B.map((l) => [l.id, l])
);

