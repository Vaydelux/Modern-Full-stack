import type { LessonContent } from "./types";

/**
 * Phase 21 Complete CRUD Vertical Slice (L4–L6).
 */
export const LESSONS_P21B: LessonContent[] = [
  {
    id: "p21-l4",
    phaseId: "p21",
    title: "React Query Hooks for Tasks",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Assemble the cohesive client-side data layer for Tasks. Construct a complete suite of typed custom hooks (`useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`), manage cache invalidation cascades, and deliver smooth UI transitions.",
    prerequisites: [
      "p19-l2 — TanStack Query: Queries, Keys & Stale Time",
      "p19-l3 — Mutations, Invalidation & Optimistic Rollback",
    ],
    objectives: [
      "Build a cohesive hook library (`useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`).",
      "Maintain hierarchical query key synchronization between list views and single-item detail views.",
      "Populate detail query cache eagerly from list queries to eliminate detail page loading spinners.",
      "Manage cross-component cache invalidation when tasks are created or archived.",
    ],
    simple:
      "Instead of writing `useQuery` or `useMutation` directly inside your visual UI components, we create a clean, dedicated hook library for tasks. When a user clicks a task in the list, the detail view opens instantly because the hook initializes its cache from the data already fetched in the list query.",
    why:
      "Encapsulating cache keys, error toasts, and invalidation rules in reusable hooks keeps UI components pure, testable, and focused on presentation.",
    mentalModel: {
      title: "The Concierge Service Desk",
      body: "Your React components do not manage luggage or call taxicabs themselves. They simply speak to the Task Concierge (`useTaskHooks`). When the UI says 'I want to update Task 10', the concierge takes the request, updates the local display, sends the messenger to the server, and notifies all other screens in the hotel to refresh their displays.",
    },
    sections: [
      {
        heading: "1. The Complete Task Hooks Suite",
        body: [
          "Building the unified hook collection with cache priming and automatic invalidation.",
        ],
        code: [
          {
            file: "src/features/tasks/hooks/useTasks.ts",
            lang: "ts",
            code: [
              "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';",
              "import { tasksApi, TaskDto, CreateTaskDto, TaskQueryParams } from '@/lib/api/tasks';",
              "import { taskKeys } from '@/lib/query/keys';",
              "import { useAuth } from '@/features/auth/hooks/useAuth';",
              "",
              "// 1. List Query Hook",
              "export function useTasks(params: TaskQueryParams) {",
              "  const { token } = useAuth();",
              "  return useQuery({",
              "    queryKey: taskKeys.list(params.workspaceId, params),",
              "    queryFn: () => tasksApi.list(params, token ?? undefined),",
              "    enabled: Boolean(params.workspaceId && token),",
              "    staleTime: 60 * 1000,",
              "  });",
              "}",
              "",
              "// 2. Detail Query Hook with Cache Priming",
              "export function useTask(workspaceId: string, taskId: string) {",
              "  const { token } = useAuth();",
              "  const queryClient = useQueryClient();",
              "",
              "  return useQuery({",
              "    queryKey: taskKeys.detail(taskId),",
              "    queryFn: () => tasksApi.getById(taskId, token ?? undefined),",
              "    enabled: Boolean(taskId && token),",
              "    // Prime initial data from existing list cache if available",
              "    initialData: () => {",
              "      const listData = queryClient.getQueryData<{ data: TaskDto[] }>(",
              "        taskKeys.list(workspaceId),",
              "      );",
              "      return listData?.data.find((t) => t.id === taskId);",
              "    },",
              "    initialDataUpdatedAt: () =>",
              "      queryClient.getQueryState(taskKeys.list(workspaceId))?.dataUpdatedAt,",
              "  });",
              "}",
              "",
              "// 3. Update Mutation Hook",
              "export function useUpdateTask() {",
              "  const queryClient = useQueryClient();",
              "  const { token } = useAuth();",
              "",
              "  return useMutation({",
              "    mutationFn: ({ id, ...dto }: Partial<TaskDto> & { id: string }) =>",
              "      tasksApi.update(id, dto as any, token ?? undefined),",
              "    onSuccess: (updatedTask) => {",
              "      // Update detail cache immediately",
              "      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);",
              "      // Invalidate list queries",
              "      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });",
              "    },",
              "  });",
              "}",
            ].join("\n"),
            caption: "Custom task hooks with initialData cache priming for zero-latency detail views.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Using initialData without `initialDataUpdatedAt`, causing TanStack Query to treat old cache data as brand new and never refetch fresh data.",
      right: "Providing `initialDataUpdatedAt` so TanStack Query knows exactly when the cached data was originally fetched.",
      explanation:
        "Without initialDataUpdatedAt, TanStack Query assumes the primed data was fetched right this millisecond and skips freshness checks.",
    },
    tryItYourself: {
      title: "Test Instant Detail View Rendering",
      instructions: [
        "1. Open your Tasks list page so tasks are populated in cache.",
        "2. Click any task row to open the detail page.",
        "3. Verify that the task detail view renders instantly with 0ms loading skeleton flash.",
      ],
      expected: "The detail view displays immediately using initialData from the list query.",
    },
    challenge: {
      title: "Add Query Filter Cache Cancellation",
      description:
        "When a user switches filters rapidly (e.g. clicking 'All' -> 'Done' -> 'High Priority'), ensure all prior queries are cancelled so slow filtered responses do not arrive out of order.",
      hints: [
        "Ensure `signal` is passed into `tasksApi.list`.",
      ],
      solution: `queryFn: ({ signal }) => tasksApi.list({ ...params, signal }, token ?? undefined)`,
    },
    quiz: [
      {
        question: "What is the benefit of `initialData` in `useTask` hook?",
        options: [
          "It avoids an initial empty loading state by reading data that was already fetched by the parent list query",
          "It stores data in the browser cookie",
          "It encrypts the task payload",
          "It disables TypeScript checking",
        ],
        answer: 0,
        explanation: "initialData hydrates the query cache synchronously from existing cache entries, delivering instant UI display.",
      },
      {
        question: "Why should `queryClient.setQueryData(taskKeys.detail(id), updated)` be called on update success?",
        options: [
          "To avoid an unnecessary second network roundtrip to fetch the detail view",
          "To clear all browser cookies",
          "To delete the task from the database",
          "To trigger a full page reload",
        ],
        answer: 0,
        explanation: "setQueryData synchronously updates the detail cache with the server's update response without needing another GET call.",
      },
    ],
    flashcards: [
      {
        front: "What is the difference between `initialData` and `placeholderData`?",
        back: "`initialData` is persisted in the cache as real data; `placeholderData` is temporary and not stored in cache.",
      },
      {
        front: "How do you invalidate all list views for a specific workspace?",
        back: "`queryClient.invalidateQueries({ queryKey: taskKeys.lists() });`.",
      },
    ],
    recap: [
      "Encapsulate CRUD queries and mutations in dedicated custom hooks.",
      "Use `initialData` to eliminate detail view loading spinners.",
      "Synchronize detail and list caches upon mutation success.",
    ],
    references: [
      { label: "TanStack Query Initial Data", url: "https://tanstack.com/query/latest/docs/framework/react/guides/initial-query-data" },
    ],
    nextBridge: "Now let's build the interactive Task UI with keyboard navigation, modals, and accessible focus traps.",
  },

  {
    id: "p21-l5",
    phaseId: "p21",
    title: "Task UI: List, Detail, Filter, Modal & Keyboard Nav",
    level: "Full-Stack Developer",
    minutes: 45,
    summary:
      "Craft a responsive, accessible Task Management interface. Implement keyboard shortcuts (`j`/`k` list navigation, `Enter` to open, `Esc` to close), focus trapping in accessible modal dialogs, and URL-synchronized filter controls.",
    prerequisites: [
      "p21-l4 — React Query Hooks for Tasks",
      "p01-l4 — Semantic HTML & ARIA Landmarks",
    ],
    objectives: [
      "Construct a keyboard-navigable task table with `j` (next) and `k` (previous) shortcuts.",
      "Implement an accessible modal dialog with focus trapping and `aria-modal='true'`.",
      "Sync filter dropdowns (Status, Priority, Search) with URL search parameters.",
      "Deliver fluid responsive transitions between list, modal, and drawer views.",
    ],
    simple:
      "Power users love productivity apps like Superhuman and Linear because they can navigate entire task lists without ever touching a mouse. In this lesson, we build a keyboard-navigable task dashboard: pressing 'j' moves down, 'k' moves up, 'Enter' opens the task modal, and 'Esc' closes it, while keeping focus trapped safely inside the dialog for screen reader users.",
    why:
      "Keyboard shortcuts and accessible dialog focus management turn a slow point-and-click app into a high-speed productivity tool.",
    mentalModel: {
      title: "The Spotlight & The Focus Fence",
      body: "Keyboard navigation is a theatrical spotlight moving between stage actors (`focusedIndex`). When an actor is spotlighted, pressing Enter brings them to center stage in a private room (modal). The Focus Fence (`focus-trap`) ensures that when you press Tab, your attention bounces off the walls of the room and stays inside until you deliberately open the door (`Esc`).",
    },
    sections: [
      {
        heading: "1. Keyboard-Navigable Task Table with Shortcuts",
        body: [
          "Implementing global and scoped keyboard navigation listeners.",
        ],
        code: [
          {
            file: "src/features/tasks/components/TaskTable.tsx",
            lang: "tsx",
            code: [
              "import { useState, useEffect } from 'react';",
              "import { TaskDto } from '@/lib/api/tasks';",
              "",
              "export function TaskTable({",
              "  tasks,",
              "  onSelectTask,",
              "}: {",
              "  tasks: TaskDto[];",
              "  onSelectTask: (task: TaskDto) => void;",
              "}) {",
              "  const [selectedIndex, setSelectedIndex] = useState<number>(0);",
              "",
              "  useEffect(() => {",
              "    const handleKeyDown = (e: KeyboardEvent) => {",
              "      // Ignore shortcuts if user is typing in an input or textarea",
              "      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;",
              "",
              "      if (e.key === 'j' || e.key === 'ArrowDown') {",
              "        e.preventDefault();",
              "        setSelectedIndex((i) => Math.min(tasks.length - 1, i + 1));",
              "      } else if (e.key === 'k' || e.key === 'ArrowUp') {",
              "        e.preventDefault();",
              "        setSelectedIndex((i) => Math.max(0, i - 1));",
              "      } else if (e.key === 'Enter' && tasks[selectedIndex]) {",
              "        e.preventDefault();",
              "        onSelectTask(tasks[selectedIndex]);",
              "      }",
              "    };",
              "",
              "    window.addEventListener('keydown', handleKeyDown);",
              "    return () => window.removeEventListener('keydown', handleKeyDown);",
              "  }, [tasks, selectedIndex, onSelectTask]);",
              "",
              "  return (",
              "    <div className=\"panel overflow-hidden border border-white/10\" role=\"table\" aria-label=\"Tasks\">",
              "      <div className=\"divide-y divide-white/5\">",
              "        {tasks.map((task, index) => {",
              "          const isSelected = index === selectedIndex;",
              "          return (",
              "            <div",
              "              key={task.id}",
              "              onClick={() => onSelectTask(task)}",
              "              className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${",
              "                isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-surface/60'",
              "              }`}",
              "              role=\"row\"",
              "              aria-selected={isSelected}",
              "            >",
              "              <div className=\"flex items-center gap-3\">",
              "                <span className=\"font-mono text-xs text-muted\">#{index + 1}</span>",
              "                <span className=\"text-sm font-medium text-slate-100\">{task.title}</span>",
              "              </div>",
              "              <span className=\"chip text-[0.65rem]\">{task.status}</span>",
              "            </div>",
              "          );",
              "        })}",
              "      </div>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Task table supporting j/k/Enter keyboard navigation with input focus guards.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Attaching global keydown listeners without checking if the event target is an <input> or <textarea>, causing j/k letters to trigger navigation while the user is typing words.",
      right: "Checking `(e.target as HTMLElement).tagName` and ignoring shortcuts when inside form inputs.",
      explanation:
        "Failing to guard input elements makes typing titles impossible because pressing 'j' or 'k' jumps between table rows.",
    },
    tryItYourself: {
      title: "Navigate Tasks Using Keyboard Alone",
      instructions: [
        "1. Click anywhere on the task list table to establish focus.",
        "2. Press 'j' three times to move down to task #4.",
        "3. Press 'Enter' to open the detail dialog.",
        "4. Press 'Esc' to close the dialog.",
      ],
      expected: "Full navigation completes without using the mouse.",
    },
    challenge: {
      title: "Build an Accessible Focus Trap Hook",
      description:
        "Write a `useFocusTrap(modalRef, isOpen)` hook that cycles Tab / Shift+Tab focus through focusable elements inside the modal and restores focus to the trigger button upon close.",
      hints: [
        "Query all `button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])` inside the modal.",
      ],
      solution: `useEffect(() => {\n  if (!isOpen || !modalRef.current) return;\n  const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea');\n  const first = focusables[0] as HTMLElement;\n  const last = focusables[focusables.length - 1] as HTMLElement;\n  first?.focus();\n  const handleTab = (e: KeyboardEvent) => {\n    if (e.key !== 'Tab') return;\n    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }\n    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }\n  };\n  window.addEventListener('keydown', handleTab);\n  return () => window.removeEventListener('keydown', handleTab);\n}, [isOpen]);`,
    },
    quiz: [
      {
        question: "Why is focus trapping required for accessible modal dialogs?",
        options: [
          "To prevent keyboard and screen reader users from tabbing behind the modal into invisible background elements",
          "To speed up CSS rendering",
          "To disable right-click inspect element",
          "To prevent network requests",
        ],
        answer: 0,
        explanation: "Focus trapping keeps keyboard focus locked within the modal dialog until it is dismissed.",
      },
      {
        question: "What keyboard key should universally dismiss a modal dialog according to W3C WAI-ARIA guidelines?",
        options: ["Backspace", "Escape (Esc)", "Delete", "Spacebar"],
        answer: 1,
        explanation: "The Escape key is the standard accessibility key for dismissing overlays and dialogs.",
      },
    ],
    flashcards: [
      {
        front: "What ARIA attributes should a modal dialog contain?",
        back: "`role='dialog'`, `aria-modal='true'`, and `aria-labelledby='dialog-title-id'`.",
      },
      {
        front: "What is Vim-style navigation in web apps?",
        back: "Using `j` for down/next, `k` for up/previous, and `Enter` for selection.",
      },
    ],
    recap: [
      "Implement keyboard shortcuts (`j`/`k`/`Enter`/`Esc`) with input guards.",
      "Enforce focus trapping and ARIA dialog semantics.",
      "Synchronize view filters with URL search params.",
    ],
    references: [
      { label: "W3C WAI-ARIA Dialog (Modal) Pattern", url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal" },
    ],
    nextBridge: "Now let's verify our vertical slice with comprehensive end-to-end integration testing and edge-case validation.",
  },

  {
    id: "p21-l6",
    phaseId: "p21",
    title: "Integration Test & Edge Cases: From Browser to DB",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Execute complete end-to-end integration tests across the full vertical slice. Trace requests from the React UI through the NestJS Fastify pipeline, Prisma ORM, and Supabase PostgreSQL database, validating security boundaries and concurrency edge cases.",
    prerequisites: [
      "p21-l2 — NestJS Service, Controller & Fastify Route Handlers",
      "p21-l3 — Prisma Transactions, Optimistic Concurrency & Soft Deletes",
      "p21-l5 — Task UI: List, Detail, Filter, Modal & Keyboard Nav",
    ],
    objectives: [
      "Write automated end-to-end integration test suites for the complete Task module.",
      "Verify multi-tenant boundary isolation and prevent IDOR data leaks under test.",
      "Simulate and assert optimistic concurrency conflict recovery (HTTP 409).",
      "Validate HTTP 400 DTO rejection, HTTP 401 unauthenticated, and HTTP 404 missing resource handling.",
    ],
    simple:
      "Unit testing individual functions in isolation is not enough. An end-to-end integration test launches the real backend and makes real HTTP requests to verify that the entire chain works: JSON serialization, ValidationPipe DTO checks, authentication guards, Prisma SQL queries, and database constraints. If any link in the chain breaks, the integration test catches it immediately.",
    why:
      "Real-world bugs occur at the seams between layers (e.g. date format mismatches, missing tenant filters, transaction rollback failures). Integration tests verify the whole system.",
    mentalModel: {
      title: "The Full Electrical Grid Circuit Test",
      body: "Testing a single light bulb with a 9V battery on your workbench is a unit test. Flipping the main master circuit breaker on the building panel and verifying that all 50 rooms, outlets, transformers, and emergency generators light up simultaneously is an end-to-end integration test.",
    },
    sections: [
      {
        heading: "1. The End-to-End Test Suite in NestJS",
        body: [
          "Using `supertest` to execute real HTTP requests against the Fastify NestJS application.",
        ],
        code: [
          {
            file: "test/tasks.e2e-spec.ts",
            lang: "ts",
            code: [
              "import { Test, TestingModule } from '@nestjs/testing';",
              "import { INestApplication, ValidationPipe } from '@nestjs/common';",
              "import * as request from 'supertest';",
              "import { AppModule } from '../src/app.module';",
              "import { PrismaService } from '../src/prisma/prisma.service';",
              "",
              "describe('Tasks Module (e2e)', () => {",
              "  let app: INestApplication;",
              "  let prisma: PrismaService;",
              "  let testWorkspaceId: string;",
              "  let userToken: string;",
              "",
              "  beforeAll(async () => {",
              "    const moduleFixture: TestingModule = await Test.createTestingModule({",
              "      imports: [AppModule],",
              "    }).compile();",
              "",
              "    app = moduleFixture.createNestApplication();",
              "    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));",
              "    await app.init();",
              "",
              "    prisma = app.get(PrismaService);",
              "    // Setup test workspace and user session token...",
              "  });",
              "",
              "  it('POST /workspaces/:ws/tasks -> creates task with 201 Created', async () => {",
              "    const res = await request(app.getHttpServer())",
              "      .post(`/workspaces/${testWorkspaceId}/tasks`)",
              "      .set('Authorization', `Bearer ${userToken}`)",
              "      .send({ title: 'Integration Test Task', priority: 'HIGH' })",
              "      .expect(201);",
              "",
              "    expect(res.body.title).toBe('Integration Test Task');",
              "    expect(res.body.version).toBe(1);",
              "  });",
              "",
              "  it('POST /workspaces/:ws/tasks -> rejects unknown fields with 400 Bad Request', async () => {",
              "    await request(app.getHttpServer())",
              "      .post(`/workspaces/${testWorkspaceId}/tasks`)",
              "      .set('Authorization', `Bearer ${userToken}`)",
              "      .send({ title: 'Valid Title', hackerField: 'malicious' })",
              "      .expect(400);",
              "  });",
              "",
              "  it('GET /workspaces/:otherWs/tasks/:id -> blocks cross-tenant access with 404', async () => {",
              "    const otherWsId = 'other_workspace_123';",
              "    await request(app.getHttpServer())",
              "      .get(`/workspaces/${otherWsId}/tasks/task_1` archaeology)",
              "      .set('Authorization', `Bearer ${userToken}`)",
              "      .expect(404);",
              "  });",
              "});",
            ].join("\n"),
            caption: "End-to-end integration tests verifying creation, DTO rejection, and tenant isolation.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Mocking out PrismaService in an 'integration' test, turning it into a meaningless unit test that misses database foreign key and constraint failures.",
      right: "Running integration tests against a real test database (or Supabase local container) so real SQL queries and constraints are executed.",
      explanation:
        "Mocking the database hides SQL syntax errors, migration discrepancies, and index violations.",
    },
    tryItYourself: {
      title: "Run the E2E Test Suite",
      instructions: [
        "1. Open your terminal in the project directory.",
        "2. Run `npm run test:e2e`.",
        "3. Verify that all CRUD, concurrency, and security tests pass with green checks.",
      ],
      expected: "100% of integration test scenarios pass.",
    },
    challenge: {
      title: "Write an Optimistic Concurrency Conflict Test",
      description:
        "In your e2e test, create a task, issue two concurrent PATCH requests with expectedVersion: 1 simultaneously, and assert that exactly one returns HTTP 200 and the other returns HTTP 409.",
      hints: [
        "Use `Promise.all([patch1, patch2])` and check status codes.",
      ],
      solution: `const [res1, res2] = await Promise.all([\n  request(app).patch('/tasks/1').send({ title: 'A', version: 1 }),\n  request(app).patch('/tasks/1').send({ title: 'B', version: 1 }),\n]);\nconst statuses = [res1.status, res2.status].sort();\nexpect(statuses).toEqual([200, 409]);`,
    },
    quiz: [
      {
        question: "Why are end-to-end integration tests superior for verifying multi-tenant security boundaries?",
        options: [
          "They test the full pipeline (middleware, guards, controller, service, Prisma, and database) without mocked shortcuts",
          "They run faster than unit tests",
          "They do not require Node.js",
          "They replace TypeScript compiler checks",
        ],
        answer: 0,
        explanation: "Integration tests verify that all security guards and database filters work together without leaks.",
      },
      {
        question: "What is the role of supertest in NestJS integration testing?",
        options: [
          "It simulates HTTP client requests against the internal HTTP listener without binding to external network ports",
          "It compresses CSS files",
          "It formats Prisma schemas",
          "It generates SSL certificates",
        ],
        answer: 0,
        explanation: "supertest issues in-memory HTTP requests directly against the Express/Fastify server instance.",
      },
    ],
    flashcards: [
      {
        front: "What is the Test Pyramid?",
        back: "A testing strategy with a large base of fast unit tests, a strong middle layer of integration tests, and a focused top layer of E2E tests.",
      },
      {
        front: "Why should test databases be wiped or run in isolated transactions between tests?",
        back: "To prevent test pollution where leftover records from Test A cause false failures in Test B.",
      },
    ],
    recap: [
      "Test complete vertical slices from HTTP route to database.",
      "Verify tenant boundaries and IDOR protection under test.",
      "Assert optimistic concurrency conflict handling (409) under simultaneous writes.",
    ],
    references: [
      { label: "NestJS Testing Documentation", url: "https://docs.nestjs.com/fundamentals/testing" },
    ],
    nextBridge: "Phase 21 is complete! Now let's enter Phase 22: Production Data Access, Search & Pagination — covering full-text search, cursor pagination, filtering, and export pipelines.",
  },
];

export const LESSON_CONTENT_P21B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P21B.map((l) => [l.id, l])
);
