import type { LessonContent } from "./types";

export const LESSON_CONTENT_P41: Record<string, LessonContent> = {
  "p41-m1": {
    id: "p41-m1",
    phaseId: "p41",
    title: "Milestone: Auth, Profiles & Workspaces",
    level: "Mastery",
    minutes: 120,
    summary:
      "Build the foundational multi-tenant identity architecture for TaskForge. Integrate Supabase Auth JWT verification in NestJS, manage workspace invitations, and enforce strict IDOR-proof tenancy.",
    prerequisites: ["p17-l1 Supabase Auth", "p18-l1 RBAC & Tenancy"],
    objectives: [
      "Verify Supabase JWT tokens in NestJS Passport strategy and extract user IDs.",
      "Implement multi-tenant workspace membership models (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).",
      "Author integration tests validating that User A cannot read or modify User B's workspace (IDOR prevention).",
    ],
    simple:
      "TaskForge is a production multi-tenant SaaS. In this milestone, we build user signup/login, user profile synchronization, workspace creation, and email invitations with secure HMAC token verification. Every database query is scoped strictly to the authenticated user's active workspace ID.",
    why:
      "Tenancy and auth are the foundation of any B2B SaaS application.",
    mentalModel: {
      title: "The Secure Office Building Keys",
      body:
        "Every company has its own floor in an office building. The elevator badge (JWT + Workspace Guard) only allows employees to press their company's floor button and never permits entry to other tenants' offices.",
    },
    sections: [
      {
        heading: "1. Multi-Tenant Workspace Guard in NestJS",
        body: [
          "- Extracts `x-workspace-id` header or URL parameter.",
          "- Queries `WorkspaceMember` table to verify membership and role permission before letting the request reach controller logic.",
        ],
        code: [
          {
            file: "src/workspaces/guards/workspace-membership.guard.ts",
            lang: "ts",
            code: [
              "import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';",
              "import { PrismaService } from '../../prisma.service';",
              "",
              "@Injectable()",
              "export class WorkspaceMembershipGuard implements CanActivate {",
              "  constructor(private prisma: PrismaService) {}",
              "",
              "  async canActivate(context: ExecutionContext): Promise<boolean> {",
              "    const request = context.switchToHttp().getRequest();",
              "    const userId = request.user?.id;",
              "    const workspaceId = request.params.workspaceId || request.headers['x-workspace-id'];",
              "",
              "    if (!userId || !workspaceId) throw new ForbiddenException('Missing auth or workspace scope');",
              "",
              "    const membership = await this.prisma.workspaceMember.findUnique({",
              "      where: { userId_workspaceId: { userId, workspaceId } },",
              "    });",
              "",
              "    if (!membership) throw new ForbiddenException('Access denied to this workspace');",
              "    request.workspaceMember = membership;",
              "    return true;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Workspace membership tenancy enforcement guard.",
          },
        ],
      },
    ],
    mistake: {
      title: "Querying Database Entities by ID Alone Without Scoping by Workspace ID (IDOR Vulnerability)",
      wrong: [
        "// ❌ IDOR flaw:\nconst project = await prisma.project.findUnique({ where: { id: req.params.projectId } });",
        "// Any logged-in user can guess an ID and read other companies' projects!",
      ].join("\n"),
      right: [
        "// ✅ Always scope by workspace: `where: { id: projectId, workspaceId: currentWorkspaceId }`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build and Test Workspace Invitation Flow",
      description:
        "Implement the endpoint `POST /workspaces/:id/invites`, generate a secure cryptographic token, write the email notification job, and test acceptance.",
      tasks: [
        "Create `WorkspaceInvite` model in Prisma.",
        "Implement invite dispatch and acceptance endpoints.",
        "Write Jest test suite validating expired token rejection.",
      ],
    },
    quiz: [
      {
        question: "How does scoping every database query by 'workspaceId' prevent Insecure Direct Object Reference (IDOR) attacks?",
        options: [
          "It guarantees that even if an attacker guesses or enumerates an internal entity UUID, PostgreSQL will refuse to return or modify the record if it does not belong to the attacker's active workspace.",
          "It encrypts the database with AES-256.",
          "It compiles NestJS to WebAssembly.",
          "It forces users to change passwords.",
        ],
        answer: 0,
        explanation:
          "Enforcing composite where clauses (`where: { id, workspaceId }`) prevents cross-tenant data access by design.",
      },
    ],
  },

  "p41-m2": {
    id: "p41-m2",
    phaseId: "p41",
    title: "Milestone: Projects, Tasks & Comments",
    level: "Mastery",
    minutes: 120,
    summary:
      "Implement the core project management domain: Kanban columns, tasks, rich markdown descriptions, nested comment threads, and file attachment storage integration.",
    prerequisites: ["p41-m1 Auth & Workspaces"],
    objectives: [
      "Design relational schemas with cascade behaviors for Projects -> Columns -> Tasks -> Comments.",
      "Implement drag-and-drop task reordering using fractional indexing (LexoRank).",
      "Handle S3 / Supabase Storage signed URLs for task attachments.",
    ],
    simple:
      "This milestone implements the meat of TaskForge: users can create projects, organize tasks into Kanban columns ('To Do', 'In Progress', 'Done'), assign teammates, set due dates, add comments with @mentions, and upload screenshots. We use Fractional Indexing so dragging a card to a new position updates only 1 database row instead of 500.",
    why:
      "Core domain modeling with fractional indexing provides high UI responsiveness and minimal database write amplification.",
    mentalModel: {
      title: "The Number Line Between 1 and 2",
      body:
        "Instead of renumbering items 1, 2, 3, 4, 5 every time you insert a card between 1 and 2, you simply assign the card rank 1.5. If you insert another between 1 and 1.5, it becomes 1.25.",
    },
    sections: [
      {
        heading: "1. Fractional LexoRank Reordering Algorithm",
        body: [
          "- Position calculation: `newPosition = (prevTask.position + nextTask.position) / 2`.",
          "- Updates exactly one row in PostgreSQL with `O(1)` query complexity.",
        ],
        code: [
          {
            file: "src/tasks/tasks.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma.service';",
              "",
              "@Injectable()",
              "export class TasksService {",
              "  constructor(private prisma: PrismaService) {}",
              "",
              "  async moveTask(taskId: string, targetColumnId: string, prevPosition: number | null, nextPosition: number | null) {",
              "    let newPosition: number;",
              "    if (prevPosition !== null && nextPosition !== null) {",
              "      newPosition = (prevPosition + nextPosition) / 2;",
              "    } else if (prevPosition !== null) {",
              "      newPosition = prevPosition + 1000;",
              "    } else if (nextPosition !== null) {",
              "      newPosition = nextPosition / 2;",
              "    } else {",
              "      newPosition = 1000; // First item in column",
              "    }",
              "",
              "    return this.prisma.task.update({",
              "      where: { id: taskId },",
              "      data: { columnId: targetColumnId, position: newPosition },",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "Fractional indexing task repositioning handler.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using Integer Order Indexing and Updating 500 Rows on Every Single Drag and Drop",
      wrong: [
        "// ❌ Renumbering entire column on every move:\nawait prisma.$executeRaw`UPDATE tasks SET position = position + 1 WHERE column_id = ...`;",
        "// Causes massive database locking and slow UI re-renders!",
      ].join("\n"),
      right: [
        "// ✅ Use fractional float positions or LexoRank string ordering to update a single record in O(1) time.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build Kanban Column and Task Mutation Suite",
      description:
        "Implement task creation, status transition state machine, and fractional position updates with automated concurrency race tests.",
      tasks: [
        "Create task CRUD API endpoints.",
        "Implement fractional positioning logic.",
        "Test task movement between columns in React frontend.",
      ],
    },
    quiz: [
      {
        question: "Why is fractional indexing (floating-point ranks or LexoRank) preferred for drag-and-drop Kanban lists?",
        options: [
          "It allows inserting or reordering an item between two existing items by updating only the moved item's position in a single O(1) SQL update.",
          "It forces integers to be even.",
          "It translates numbers to Roman numerals.",
          "It eliminates the need for a database.",
        ],
        answer: 0,
        explanation:
          "Fractional ranking calculates midpoints between adjacent items, avoiding expensive multi-row renumbering updates.",
      },
    ],
  },

  "p41-m3": {
    id: "p41-m3",
    phaseId: "p41",
    title: "Milestone: Search, Filters & Pagination",
    level: "Mastery",
    minutes: 90,
    summary:
      "Implement high-performance PostgreSQL Full-Text Search (`tsvector`, `tsquery`, GIN indexes) and keyset/cursor pagination for task filtering.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p41-m2 Tasks Domain"],
    objectives: [
      "Create generated `tsvector` columns with GIN indexes on task titles and descriptions.",
      "Implement multi-attribute filtering (assignee, tag, due date, status, priority) via query builders.",
      "Replace slow offset pagination (`OFFSET 10000`) with deterministic Keyset/Cursor pagination.",
    ],
    simple:
      "When a project has 50,000 tasks, standard `LIKE '%keyword%'` queries scan every single row on disk and take 3 seconds. By compiling task titles into PostgreSQL `tsvector` lexemes indexed by a Generalized Inverted Index (GIN), full-text search executes in under 2ms with typo matching and relevance ranking.",
    why:
      "Fast search and instant filtering provide a crisp, responsive user experience.",
    mentalModel: {
      title: "The Book Index at the Back of the Library",
      body:
        "Searching every page of an encyclopedia from page 1 to 1,000 takes hours (Table Scan). Flipping to the alphabetical Index at the back of the book finds the word 'Photosynthesis' and its exact page numbers in 2 seconds (GIN Index).",
    },
    sections: [
      {
        heading: "1. PostgreSQL Full-Text Search in Prisma Raw Query",
        body: [
          "- Generates `to_tsquery('english', searchPhrase)`.",
          "- Uses `ts_rank()` to sort results by semantic relevance.",
        ],
        code: [
          {
            file: "src/tasks/search.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma.service';",
              "",
              "@Injectable()",
              "export class TaskSearchService {",
              "  constructor(private prisma: PrismaService) {}",
              "",
              "  async searchTasks(workspaceId: string, query: string, cursor?: string, limit = 20) {",
              "    const formattedQuery = query.trim().split(/\\s+/).map((word) => `${word}:*`).join(' & ');",
              "",
              "    return this.prisma.$queryRaw`",
              "      SELECT id, title, description, status, priority, position,",
              "             ts_rank(search_vector, to_tsquery('english', ${formattedQuery})) AS rank",
              "      FROM tasks",
              "      WHERE workspace_id = ${workspaceId}::uuid",
              "        AND search_vector @@ to_tsquery('english', ${formattedQuery})",
              "      ORDER BY rank DESC, id DESC",
              "      LIMIT ${limit};",
              "    `;",
              "  }",
              "}",
            ].join("\n"),
            caption: "PostgreSQL Full-Text Search with ranking query.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using 'OFFSET 50000 LIMIT 20' on Large Tables",
      wrong: [
        "// ❌ Offset pagination on 100k rows:\nSELECT * FROM tasks ORDER BY created_at LIMIT 20 OFFSET 50000;",
        "// PostgreSQL must read and discard 50,000 rows in memory before returning 20!",
      ].join("\n"),
      right: [
        "// ✅ Use Keyset/Cursor pagination: `WHERE (created_at, id) < (cursor_created_at, cursor_id) ORDER BY created_at DESC LIMIT 20`.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Create Full-Text GIN Index Migration and Benchmark",
      description:
        "Add a `search_vector` generated column with a GIN index in PostgreSQL migration SQL, seed 10,000 tasks, and benchmark search response times under 5ms.",
      tasks: [
        "Author Prisma raw SQL migration adding `search_vector` and GIN index.",
        "Implement cursor pagination filter service.",
        "Benchmark search latency with EXPLAIN ANALYZE.",
      ],
    },
    quiz: [
      {
        question: "Why does Keyset/Cursor pagination scale with O(1) performance while Offset pagination degrades with O(N) cost?",
        options: [
          "Keyset pagination uses indexed B-Tree comparisons (e.g. `WHERE id < cursor`) to jump directly to the target record location on disk without scanning preceding rows.",
          "Keyset pagination disables SQL sorting.",
          "Offset pagination requires Redis.",
          "Keyset pagination uses browser cache.",
        ],
        answer: 0,
        explanation:
          "Keyset pagination leverages indexes to jump directly to the cursor boundary rather than reading and discarding N offset rows.",
      },
    ],
  },
};
