import type { LessonContent } from "./types";

/**
 * Phase 18 Authorization, RBAC & Resource Security (L4–L6).
 */
export const LESSONS_P18B: LessonContent[] = [
  {
    id: "p18-l4",
    phaseId: "p18",
    title: "RLS Compared: Defense-in-Depth, Not Authority",
    level: "Backend Developer",
    minutes: 35,
    summary:
      "Understand the precise role of PostgreSQL Row-Level Security (RLS) in a full-stack architecture. Learn why NestJS application logic remains authoritative while RLS provides a secondary defensive moat.",
    prerequisites: [
      "p18-l2 — Nest Guards & the Policy Service",
      "p16-l1 — Supabase Platform Tour & Key Categories",
    ],
    objectives: [
      "Define the Defense-in-Depth security model combining application-layer guards and database-layer RLS.",
      "Understand why backend ORMs connecting with privileged `postgres` or `service_role` credentials bypass RLS by default.",
      "Write PostgreSQL RLS policies in raw SQL migrations to protect direct client queries and storage buckets.",
      "Evaluate performance tradeoffs between database RLS policies and application-level query scoping.",
    ],
    simple:
      "Row-Level Security (RLS) is a PostgreSQL feature that automatically appends WHERE clauses to every query inside the database engine itself based on the requesting user's JWT claims. In a direct client-to-Supabase setup, RLS is your only security wall. In a NestJS architecture, NestJS is the primary authority (validating business rules, tenant memberships, and logging audits), while RLS serves as a secondary safety net.",
    why:
      "Relying solely on database RLS for complex enterprise workflows creates unwieldy SQL triggers and makes it impossible to integrate third-party payment gates, audit trails, or complex external policy engines. Combining authoritative NestJS guards with RLS gives the best of both worlds.",
    mentalModel: {
      title: "The Castle Gatehouse & The Strongroom Guard",
      body: "NestJS is the Castle Gatehouse: it checks passports, enforces visiting hours, runs background checks, and logs every visitor in the registry. PostgreSQL RLS is the Armed Guard inside the royal strongroom: if an intruder somehow bypasses the gatehouse, the strongroom guard still refuses to unlock any drawer not stamped with their name.",
    },
    sections: [
      {
        heading: "1. The Two-Layer Security Hierarchy",
        body: [
          "Understanding how application authorization and database RLS complement each other.",
        ],
        code: [
          {
            file: "DEFENSE_IN_DEPTH.md",
            lang: "text",
            code: [
              "┌────────────────────────────────────────────────────────────────────────┐",
              "│ LAYER 1: NESTJS BACKEND API (PRIMARY AUTHORITATIVE GATE)                │",
              "│  - Verifies JWT signatures and user identity via JWKS                 │",
              "│  - Enforces workspace memberships, role hierarchies & granular permissions │",
              "│  - Evaluates cross-resource business rules and input DTOs             │",
              "│  - Records immutable security audit logs                               │",
              "├────────────────────────────────────────────────────────────────────────┤",
              "│ LAYER 2: POSTGRESQL ROW-LEVEL SECURITY (SECONDARY DEFENSE-IN-DEPTH)     │",
              "│  - Guards against direct PostgREST / Supabase JS client queries       │",
              "│  - Protects database if a developer writes an unscoped query by mistake │",
              "│  - Enforces tenant isolation directly in the PostgreSQL engine         │",
              "└────────────────────────────────────────────────────────────────────────┘",
            ].join("\n"),
            caption: "The Defense-in-Depth architectural model.",
          },
        ],
      },
      {
        heading: "2. Defining RLS Policies in PostgreSQL Migrations",
        body: [
          "RLS policies can be authored directly in Prisma SQL migrations.",
        ],
        code: [
          {
            file: "prisma/migrations/20260828_enable_rls/migration.sql",
            lang: "sql",
            code: [
              "-- 1. Enable RLS on the tasks table",
              "ALTER TABLE \"tasks\" ENABLE ROW LEVEL SECURITY;",
              "",
              "-- 2. Policy: Users can only read tasks belonging to workspaces they are members of",
              "CREATE POLICY \"users_read_workspace_tasks\" ON \"tasks\"",
              "  FOR SELECT",
              "  USING (",
              "    EXISTS (",
              "      SELECT 1 FROM \"workspace_members\"",
              "      WHERE \"workspace_members\".\"workspace_id\" = \"tasks\".\"workspace_id\"",
              "        AND \"workspace_members\".\"user_id\" = auth.uid()::text",
              "    )",
              "  );",
              "",
              "-- 3. Policy: Only workspace members with active memberships can insert tasks",
              "CREATE POLICY \"users_insert_workspace_tasks\" ON \"tasks\"",
              "  FOR INSERT",
              "  WITH CHECK (",
              "    EXISTS (",
              "      SELECT 1 FROM \"workspace_members\"",
              "      WHERE \"workspace_members\".\"workspace_id\" = \"tasks\".\"workspace_id\"",
              "        AND \"workspace_members\".\"user_id\" = auth.uid()::text",
              "    )",
              "  );",
            ].join("\n"),
            caption: "PostgreSQL Row-Level Security policies in native migration scripts.",
          },
        ],
      },
    ],
    mistake: {
      title: "Assuming Prisma Client Automatically Adopts Supabase auth.uid() Without Setting Claims",
      wrong: "Assuming Prisma with direct connection automatically passes client JWTs to Postgres RLS.",
      right: "Prisma connects as the database superuser/owner, bypassing RLS unless running in client-impersonation mode (`SET LOCAL request.jwt.claim.sub`).",
      explain:
        "Standard backend connections connect with the master database user, which bypasses RLS policies by default in PostgreSQL. That is why NestJS query scoping (`where: { workspaceId }`) remains strictly authoritative.",
    },
    tryIt: [
      "Inspect enabled RLS tables in the Supabase Dashboard Authentication > Policies tab.",
      "Author an RLS migration script enabling RLS on sensitive tables.",
      "Verify that direct PostgREST queries fail if RLS is enabled without matching policies.",
    ],
    challenge: {
      prompt: "Explain how to set PostgreSQL session configuration variables in an interactive Prisma transaction so that RLS policies can read `auth.uid()`.",
      hints: [
        "Use `prisma.$executeRawUnsafe` to execute `SET LOCAL request.jwt.claims = ...` before queries.",
      ],
      solution: [
        "await prisma.$transaction(async (tx) => {",
        "  await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${userId}, true);`;",
        "  return tx.task.findMany();",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why do standard backend ORM connections (like Prisma or TypeORM) bypass PostgreSQL RLS by default?",
        options: [
          "PostgreSQL does not support ORMs.",
          "Backend connection strings connect as the database owner or superuser (e.g. `postgres`), which inherently possesses the `BYPASSRLS` attribute in Postgres.",
          "Prisma rewrites the PostgreSQL binary.",
          "RLS only applies to MySQL.",
        ],
        answer: 1,
        explanation:
          "Database owners and superusers bypass RLS by design in PostgreSQL. Therefore, backend queries must always include explicit WHERE tenant filters.",
      },
      {
        question: "What is the primary benefit of Defense-in-Depth in web application security?",
        options: [
          "It reduces database memory usage.",
          "It ensures that if one defensive layer fails or is bypassed due to a developer oversight, secondary security layers prevent a catastrophic data breach.",
          "It eliminates the need for automated tests.",
          "It speeds up network latency.",
        ],
        answer: 1,
        explanation:
          "Multiple overlapping security layers (NestJS guards + Prisma tenant filters + Postgres RLS) ensure resilience against single-point failures.",
      },
    ],
    flashcards: [
      {
        front: "What is the BYPASSRLS attribute in PostgreSQL?",
        back: "A role privilege granted to table owners and superusers allowing queries to ignore RLS policy filters.",
      },
      {
        front: "Why must NestJS backend queries explicitly filter by `workspaceId`?",
        back: "Because backend database connections bypass RLS, making application-layer query scoping the authoritative defense against IDOR.",
      },
    ],
    recap: [
      "NestJS remains the primary authority for business rules, authorization, and audit logs.",
      "PostgreSQL RLS acts as a secondary defense-in-depth safeguard.",
      "Always include explicit tenant filters in backend Prisma queries.",
    ],
    references: [
      { label: "PostgreSQL Row Security Policies", url: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html" },
      { label: "Supabase RLS Deep Dive", url: "https://supabase.com/docs/guides/database/postgres/row-level-security" },
    ],
    nextBridge: "Let's put this into practice with a hands-on IDOR attack simulation lab: reproduce an insecure query and fix it permanently.",
  },
  {
    id: "p18-l5",
    phaseId: "p18",
    title: "Lab: User A Attacks User B (IDOR) — Reproduce & Fix",
    level: "Backend Developer",
    minutes: 45,
    summary:
      "Hands-on Insecure Direct Object Reference (IDOR) lab. Exploit an unscoped resource lookup with curl, analyze the cross-tenant data leak, and implement multi-layer tenant query scoping and regression tests.",
    prerequisites: [
      "p18-l1 — Roles, Permissions & Ownership Models",
      "p18-l2 — Nest Guards & the Policy Service",
    ],
    objectives: [
      "Reproduce an Insecure Direct Object Reference (IDOR) vulnerability where User A modifies User B's resource.",
      "Analyze the root cause: querying resources solely by primary key (`where: { id }`) without tenant or author scoping.",
      "Implement the fix: compound Prisma lookups (`where: { id, workspaceId }`) and policy service checks.",
      "Write automated Jest integration tests verifying that foreign IDs return 404 Not Found.",
    ],
    simple:
      "IDOR (Insecure Direct Object Reference) is one of the most common and devastating vulnerabilities in web development. An IDOR occurs when an API accepts an ID (e.g. `PATCH /tasks/101`) and modifies the record without verifying that the authenticated user owns or belongs to the workspace containing task 101. An attacker simply iterates through numbers (`/tasks/102`, `/tasks/103`) to read or delete every customer's data.",
    why:
      "IDOR vulnerabilities routinely result in multi-million dollar data breaches and severe regulatory fines. Mastering compound query scoping eliminates this risk completely.",
    mentalModel: {
      title: "The Dry Cleaner Ticket",
      body: "IDOR is like a dry cleaner that hands you a suit simply because you brought in ticket #101, without checking if your name matches the ticket. Anyone can claim #102 or #103 and walk away with someone else's expensive suit. The fix is requiring both the ticket number AND photo ID proof that you belong to that family account.",
    },
    sections: [
      {
        heading: "1. The Vulnerability: Unscoped Resource Lookups",
        body: [
          "Examine how naive controller and service implementations create IDOR vulnerabilities.",
        ],
        code: [
          {
            file: "src/tasks/tasks.service.vulnerable.ts",
            lang: "ts",
            code: [
              "// 🔴 VULNERABLE IMPLEMENTATION (IDOR):",
              "async updateTask(taskId: string, dto: UpdateTaskDto) {",
              "  // The query looks up ONLY by taskId.",
              "  // If an attacker from Workspace B passes a taskId belonging to Workspace A,",
              "  // Prisma will happily update Workspace A's private task!",
              "  return this.prisma.task.update({",
              "    where: { id: taskId },",
              "    data: dto,",
              "  });",
              "}",
            ].join("\n"),
            caption: "Vulnerable service method with no tenant or ownership boundary.",
          },
          {
            file: "src/tasks/tasks.service.secure.ts",
            lang: "ts",
            code: [
              "// 🟢 SECURE MULTI-LAYER IMPLEMENTATION:",
              "async updateTask(workspaceId: string, taskId: string, dto: UpdateTaskDto) {",
              "  // Query using compound where clause: MUST match BOTH taskId AND workspaceId",
              "  const task = await this.prisma.task.findFirst({",
              "    where: {",
              "      id: taskId,",
              "      workspaceId, // Tenant isolation boundary!",
              "    },",
              "  });",
              "",
              "  if (!task) {",
              "    // Return 404 Not Found so attackers cannot enumerate whether foreign IDs exist",
              "    throw new NotFoundException(`Task ${taskId} not found in this workspace`);",
              "  }",
              "",
              "  return this.prisma.task.update({",
              "    where: { id: taskId },",
              "    data: dto,",
              "  });",
              "}",
            ].join("\n"),
            caption: "Secure service method enforcing compound tenant query isolation.",
          },
        ],
      },
      {
        heading: "2. Interactive IDOR & RBAC Security Lab",
        body: [
          "Simulate an attacker attempting to modify resources across workspace boundaries.",
        ],
        demo: "idor-rbac-lab",
      },
    ],
    mistake: {
      title: "Returning 403 Forbidden on Foreign IDs Instead of 404 Not Found",
      wrong: "if (task.workspaceId !== currentWorkspaceId) throw new ForbiddenException();",
      right: "throw new NotFoundException('Resource not found');",
      explain:
        "Returning 403 tells the attacker: 'Task 101 exists in the system, but you do not have permission to view it'. Returning 404 prevents ID enumeration attacks entirely by making foreign records completely invisible.",
    },
    tryIt: [
      "Open the IDOR & RBAC Defense Lab above.",
      "Switch actor to 'Eve (Attacker / Competitor)' with target 'PATCH /tasks/101 (Alpha Task)'.",
      "Toggle between 'Vulnerable', 'RBAC Guard Only', and 'Multi-Layer Guard + Scoped Prisma' to observe how compound scoping prevents the breach.",
    ],
    challenge: {
      prompt: "Write a Jest integration test demonstrating that an attacker from Workspace B receives a 404 when attempting to update a task in Workspace A.",
      hints: [
        "Authenticate as User B.",
        "Send a PATCH request with Workspace B's header and Workspace A's task ID.",
        "Assert `expect(response.status).toBe(404)`.",
      ],
      solution: [
        "it('should return 404 when attempting cross-tenant IDOR update', async () => {",
        "  const response = await request(app.getHttpServer())",
        "    .patch('/workspaces/ws_beta_999/tasks/task_alpha_101')",
        "    .set('Authorization', `Bearer ${eveToken}`)",
        "    .send({ title: 'Hacked Title' });",
        "",
        "  expect(response.status).toBe(404);",
        "});",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What is an Insecure Direct Object Reference (IDOR)?",
        options: [
          "A broken CSS layout.",
          "An access control flaw where an application exposes a reference to an internal object (e.g. database ID) and fails to verify user authorization before performing operations on that object.",
          "A memory leak in JavaScript.",
          "An unencrypted SSL certificate.",
        ],
        answer: 1,
        explanation:
          "IDOR allows malicious users to tamper with object identifiers in API requests to access or modify unauthorized records.",
      },
      {
        question: "Why should API endpoints return 404 Not Found rather than 403 Forbidden when a user requests an ID belonging to another tenant?",
        options: [
          "404 uses fewer HTTP headers.",
          "404 prevents resource enumeration attacks by keeping the existence of foreign IDs completely opaque to attackers.",
          "Because 403 is illegal in REST.",
          "PostgreSQL forces 404.",
        ],
        answer: 1,
        explanation:
          "Returning 404 ensures that attackers cannot determine whether a secret record ID exists in another customer's database.",
      },
    ],
    flashcards: [
      {
        front: "What is the primary code fix for IDOR?",
        back: "Compound query scoping: always filter queries by both the target resource ID AND the user's validated tenant/ownership scope (`where: { id, workspaceId }`).",
      },
      {
        front: "Why return 404 instead of 403 on foreign tenant lookups?",
        back: "To prevent ID enumeration and blind probing of whether confidential resources exist in other customer accounts.",
      },
    ],
    recap: [
      "Never query or update resources by primary key alone (`where: { id }`).",
      "Always enforce compound tenant scoping (`where: { id, workspaceId }`).",
      "Return 404 Not Found for foreign tenant resources to thwart enumeration.",
    ],
    references: [
      { label: "OWASP Top 10: Broken Access Control", url: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/" },
      { label: "PortSwigger Web Security: IDOR", url: "https://portswigger.net/web-security/access-control/idor" },
    ],
    nextBridge: "Now that our backend is impenetrable, let's learn how to design permission-aware frontend user interfaces without relying on fake security.",
  },
  {
    id: "p18-l6",
    phaseId: "p18",
    title: "Permission-Aware UI Without Fake Security",
    level: "Backend Developer",
    minutes: 30,
    summary:
      "Design accessible, responsive permission-aware user interfaces. Understand why hiding buttons is UI polish rather than security, and implement clean React permission hooks.",
    prerequisites: [
      "p18-l1 — Roles, Permissions & Ownership Models",
      "p18-l2 — Nest Guards & the Policy Service",
    ],
    objectives: [
      "Understand the Golden Rule of Frontend Security: UI hiding is cosmetic polish, never authorization.",
      "Build a reusable React `usePermissions()` hook to dynamically hide or disable controls.",
      "Design accessible disabled states with explanatory tooltips (e.g. 'Only Workspace Admins can delete tasks').",
      "Handle asynchronous 403 Forbidden responses gracefully in frontend mutations.",
    ],
    simple:
      "Hiding a 'Delete Workspace' button in React is great user experience because it prevents users from clicking things they can't do. However, hiding a button provides ZERO security: an attacker can easily open DevTools or execute a `curl` command to send the DELETE request directly. Real security exists solely on the backend; the frontend's job is simply to provide a delightful, honest user experience.",
    why:
      "Developers often make the critical mistake of thinking client-side checks protect their app. Understanding the strict boundary between UI hints and backend enforcement prevents dangerous security assumptions.",
    mentalModel: {
      title: "The Locked Door & The 'Staff Only' Sign",
      body: "A 'Staff Only' sign painted on a door is frontend UI: it guides polite people and tells them what to expect. The heavy steel deadbolt with the electronic card reader is backend authorization: even if someone ignores the sign and tries to turn the knob, the steel deadbolt refuses to budge.",
    },
    sections: [
      {
        heading: "1. The Reusable usePermissions() React Hook",
        body: [
          "We build a clean hook that evaluates the current user's role against permissions.",
        ],
        code: [
          {
            file: "src/hooks/usePermissions.ts",
            lang: "ts",
            code: [
              "import { useMemo } from 'react';",
              "import { useAuth } from '../context/AuthContext';",
              "import { type Permission, hasPermission } from '../data/permissions';",
              "",
              "export function usePermissions() {",
              "  const { currentMember } = useAuth();",
              "",
              "  const can = useMemo(() => {",
              "    return (permission: Permission) => {",
              "      if (!currentMember) return false;",
              "      return hasPermission(currentMember.role, permission);",
              "    };",
              "  }, [currentMember]);",
              "",
              "  return {",
              "    can,",
              "    role: currentMember?.role ?? 'VIEWER',",
              "    isAdmin: currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER',",
              "  };",
              "}",
            ].join("\n"),
            caption: "Custom usePermissions React hook for declarative UI state.",
          },
        ],
      },
      {
        heading: "2. Accessible Permission-Aware Controls: Hide vs Disable",
        body: [
          "When should you hide a button versus disabling it with a descriptive tooltip?",
        ],
        code: [
          {
            file: "src/components/DeleteTaskButton.tsx",
            lang: "tsx",
            code: [
              "import { usePermissions } from '../hooks/usePermissions';",
              "import { Trash2 } from 'lucide-react';",
              "",
              "export function DeleteTaskButton({ onDelete }: { onDelete: () => void }) {",
              "  const { can } = usePermissions();",
              "  const allowed = can('task:delete');",
              "",
              "  if (!allowed) {",
              "    // Option A: Render disabled with explanatory tooltip",
              "    return (",
              "      <button",
              "        disabled",
              "        aria-disabled=\"true\"",
              "        title=\"Only Workspace Admins can delete tasks\"",
              "        className=\"opacity-40 cursor-not-allowed px-3 py-1.5 rounded text-xs border border-white/10 text-muted flex items-center gap-1.5\"",
              "      >",
              "        <Trash2 className=\"w-3.5 h-3.5\" />",
              "        <span>Delete</span>",
              "      </button>",
              "    );",
              "  }",
              "",
              "  return (",
              "    <button",
              "      onClick={onDelete}",
              "      className=\"px-3 py-1.5 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1.5 transition-colors\"",
              "    >",
              "      <Trash2 className=\"w-3.5 h-3.5\" />",
              "      <span>Delete</span>",
              "    </button>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Accessible permission-aware UI component with descriptive disabled tooltip.",
          },
        ],
      },
    ],
    mistake: {
      title: "Relying on Frontend Route Guards as Security",
      wrong: "Assuming hiding a route in Next.js page router prevents unauthorized data access.",
      right: "Always protect the underlying API routes in NestJS with Guards regardless of frontend UI state.",
      explain:
        "Client-side JavaScript can be paused, inspected, and modified in any browser. Security exists exclusively on the server.",
    },
    tryIt: [
      "Implement the `usePermissions` hook in your Next.js/React project.",
      "Use `can('member:invite')` to conditionally show the Invite Member modal trigger.",
      "Verify that an unprivileged user cannot trigger actions even if they re-enable the button in DevTools.",
    ],
    challenge: {
      prompt: "Create a `<PermissionGate permission='task:delete' fallback={null}>` wrapper component in React.",
      hints: [
        "Consume `usePermissions()` inside the component.",
        "If `can(permission)` is true, render `children`; otherwise render `fallback`.",
      ],
      solution: [
        "export function PermissionGate({",
        "  permission,",
        "  children,",
        "  fallback = null,",
        "}: {",
        "  permission: Permission;",
        "  children: React.ReactNode;",
        "  fallback?: React.ReactNode;",
        "}) {",
        "  const { can } = usePermissions();",
        "  return can(permission) ? <>{children}</> : <>{fallback}</>;",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Why is hiding buttons in the frontend considered UI polish rather than security?",
        options: [
          "Because CSS is too slow.",
          "Because any user can inspect network traffic and send arbitrary HTTP requests directly to the API using curl or Postman without using the UI.",
          "Because React does not support booleans.",
          "Because browsers delete hidden elements automatically.",
        ],
        answer: 1,
        explanation:
          "The client browser is an untrusted environment. True authorization enforcement must take place on the backend server.",
      },
      {
        question: "What is best practice for rendering actions a user lacks permissions to perform?",
        options: [
          "Show an alert popup on page load.",
          "Either hide the control cleanly to reduce noise, or render it disabled with an explanatory tooltip explaining which role is required.",
          "Crash the React render tree.",
          "Send an automated email to the CEO.",
        ],
        answer: 1,
        explanation:
          "Clear visual cues with helpful tooltips improve user experience without creating confusion.",
      },
    ],
    flashcards: [
      {
        front: "What is the Golden Rule of Frontend Security?",
        back: "UI visibility is cosmetic polish, never security; all authorization must be strictly enforced on the server.",
      },
      {
        front: "How do you create an accessible disabled button in React?",
        back: "Use `disabled`, `aria-disabled='true'`, descriptive `title` / tooltip, and dimmed styling.",
      },
    ],
    recap: [
      "Client UI is an untrusted presentation layer.",
      "Use `usePermissions()` for clean, reactive control state.",
      "Provide accessible tooltips explaining required roles on disabled controls.",
    ],
    references: [
      { label: "W3C WAI-ARIA Disabled State Best Practices", url: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls" },
      { label: "OWASP Client-Side Security Considerations", url: "https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html" },
    ],
    nextBridge: "Congratulations on mastering Auth and RBAC! In Phase 19, we will construct our Frontend API Client with TanStack Query and Optimistic Updates.",
  },
];

export const LESSON_CONTENT_P18B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P18B.map((l) => [l.id, l])
);

