import type { LessonContent } from "./types";

/**
 * Phase 19 Frontend API Client & TanStack Query (L4–L6).
 */
export const LESSONS_P19B: LessonContent[] = [
  {
    id: "p19-l4",
    phaseId: "p19",
    title: "Pagination, Prefetching & DevTools",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Implement smooth paginated and infinite queries in TanStack Query. Use `placeholderData: keepPreviousData` to eliminate flashing empty loading screens between page transitions, prefetch next pages on hover, and debug cache state with React Query DevTools.",
    prerequisites: [
      "p19-l2 — TanStack Query: Queries, Keys & Stale Time",
      "p07-l5 — REST Conventions, Pagination & Structured Errors",
    ],
    objectives: [
      "Implement smooth page-by-page queries using `placeholderData: keepPreviousData`.",
      "Build infinite scrolling queries with `useInfiniteQuery` and `getNextPageParam`.",
      "Implement intent-based prefetching on link hover and button focus.",
      "Master React Query DevTools to inspect query observers, cache timers, and background fetches.",
    ],
    simple:
      "When a user clicks 'Next Page' in a standard web app, the table disappears, an ugly loading spinner flashes, and the UI shifts. With TanStack Query's pagination and prefetching, the previous page remains visible while the next page loads seamlessly in the background. Even better, by prefetching data when the user hovers over a page number, the next page displays instantly with zero loading time.",
    why:
      "Flashing spinners between page changes disorient users and cause layout shifts. Intent-driven prefetching delivers perceived zero-latency application experiences.",
    mentalModel: {
      title: "The Projector Slide & The Next Slide Carousel",
      body: "Think of an old photo slide projector. Instead of turning the light off completely (empty loading screen) while loading the next slide, the projector keeps the current slide brightly lit until the new slide drops smoothly into place. If the projectionist sees your finger reaching for slide #3 (hovering on the link), they preload slide #3 into the chamber before you even press the button.",
    },
    sections: [
      {
        heading: "1. Paginated Queries with `placeholderData: keepPreviousData`",
        body: [
          "In TanStack Query v5, `placeholderData: keepPreviousData` keeps the previous page rendered while the new page query executes.",
        ],
        code: [
          {
            file: "src/features/tasks/hooks/usePaginatedTasks.ts",
            lang: "tsx",
            code: [
              "import { useQuery, keepPreviousData } from '@tanstack/react-query';",
              "import { taskKeys } from '@/lib/query/keys';",
              "import { tasksApi } from '@/lib/api/tasks';",
              "",
              "export function usePaginatedTasks(workspaceId: string, page: number, limit = 10) {",
              "  return useQuery({",
              "    queryKey: taskKeys.list(workspaceId, { page, limit }),",
              "    queryFn: () => tasksApi.list({ workspaceId, page, limit }),",
              "    placeholderData: keepPreviousData,",
              "    staleTime: 60 * 1000,",
              "  });",
              "}",
            ].join("\n"),
            caption: "Using keepPreviousData to maintain seamless table layout during pagination transitions.",
          },
        ],
      },
      {
        heading: "2. Prefetching on Hover for Instant Perceived Performance",
        body: [
          "Prefetching loads data into the TanStack Query cache before the user actually clicks the navigation target.",
        ],
        code: [
          {
            file: "src/components/PaginationControls.tsx",
            lang: "tsx",
            code: [
              "import { useQueryClient } from '@tanstack/react-query';",
              "import { taskKeys } from '@/lib/query/keys';",
              "import { tasksApi } from '@/lib/api/tasks';",
              "",
              "export function PaginationControls({",
              "  workspaceId,",
              "  currentPage,",
              "  totalPages,",
              "  onPageChange,",
              "}: {",
              "  workspaceId: string;",
              "  currentPage: number;",
              "  totalPages: number;",
              "  onPageChange: (p: number) => void;",
              "}) {",
              "  const queryClient = useQueryClient();",
              "",
              "  const prefetchNextPage = (nextPage: number) => {",
              "    if (nextPage > totalPages) return;",
              "    queryClient.prefetchQuery({",
              "      queryKey: taskKeys.list(workspaceId, { page: nextPage, limit: 10 }),",
              "      queryFn: () => tasksApi.list({ workspaceId, page: nextPage, limit: 10 }),",
              "      staleTime: 60 * 1000,",
              "    });",
              "  };",
              "",
              "  return (",
              "    <div className=\"flex items-center gap-2 mt-4\">",
              "      <button",
              "        disabled={currentPage <= 1}",
              "        onClick={() => onPageChange(currentPage - 1)}",
              "        className=\"btn btn-secondary text-xs\"",
              "      >",
              "        Previous",
              "      </button>",
              "      <span className=\"text-xs text-muted font-mono\">Page {currentPage} of {totalPages}</span>",
              "      <button",
              "        disabled={currentPage >= totalPages}",
              "        onMouseEnter={() => prefetchNextPage(currentPage + 1)}",
              "        onFocus={() => prefetchNextPage(currentPage + 1)}",
              "        onClick={() => onPageChange(currentPage + 1)}",
              "        className=\"btn btn-secondary text-xs\"",
              "      >",
              "        Next",
              "      </button>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Prefetching onMouseEnter and onFocus to prepare cache entries before click.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Prefetching without setting a staleTime, causing the prefetched data to be marked immediately stale and re-fetched on click.",
      right: "Ensuring `staleTime` matches between the prefetchQuery call and the consuming useQuery hook.",
      explanation:
        "If staleTime is 0, when the user clicks the link, useQuery sees stale data and executes an immediate background refetch anyway.",
    },
    tryItYourself: {
      title: "Inspect Prefetched Queries in DevTools",
      instructions: [
        "1. Open React Query DevTools at the bottom of the screen.",
        "2. Hover your mouse over the 'Next Page' button without clicking.",
        "3. Verify that the query key for page 2 appears in DevTools in green (fresh) state immediately.",
      ],
      expected: "Clicking 'Next Page' transitions to page 2 instantaneously.",
    },
    challenge: {
      title: "Implement Infinite Scrolling with useInfiniteQuery",
      description:
        "Build a `useInfiniteTaskList` hook that uses cursor pagination and automatically loads the next page when an IntersectionObserver target enters the viewport.",
      hints: [
        "Return `nextCursor` from your backend API.",
        "Configure `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined`.",
      ],
      solution: `export function useInfiniteTasks(workspaceId: string) {\n  return useInfiniteQuery({\n    queryKey: ['tasks', 'infinite', workspaceId],\n    queryFn: ({ pageParam }) => tasksApi.list({ workspaceId, cursor: pageParam }),\n    initialPageParam: undefined,\n    getNextPageParam: (lastPage) => lastPage.nextCursor,\n  });\n}`,
    },
    quiz: [
      {
        question: "What does `placeholderData: keepPreviousData` do in TanStack Query v5?",
        options: [
          "It permanently caches data in localStorage",
          "It keeps the data from the previous query key visible while the new query key is fetching",
          "It disables all error boundaries",
          "It prevents the server from returning 500 errors",
        ],
        answer: 1,
        explanation: "keepPreviousData prevents flash-of-loading-content by showing the prior page's data until the new page arrives.",
      },
      {
        question: "When should prefetching be triggered?",
        options: [
          "When the user hovers over a link, focuses a navigation button, or is likely to navigate next",
          "On every single mouse movement across the document",
          "Only when the browser window loses focus",
          "Never, because prefetching is forbidden on HTTP/2",
        ],
        answer: 0,
        explanation: "Intent-based prefetching leverages hover and focus cues to load data milliseconds before user clicks.",
      },
    ],
    flashcards: [
      {
        front: "What is `isPlaceholderData` property on the query result?",
        back: "A boolean flag indicating that the currently rendered data is placeholder/previous data rather than the fresh result.",
      },
      {
        front: "How do you render React Query Devtools?",
        back: "By importing `<ReactQueryDevtools initialIsOpen={false} />` from `@tanstack/react-query-devtools`.",
      },
    ],
    recap: [
      "Use `placeholderData: keepPreviousData` for smooth pagination.",
      "Prefetch on hover and focus to achieve perceived zero latency.",
      "Use DevTools to inspect query keys and observer lifecycles.",
    ],
    references: [
      { label: "TanStack Query Pagination", url: "https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries" },
      { label: "TanStack Query Prefetching", url: "https://tanstack.com/query/latest/docs/framework/react/guides/prefetching" },
    ],
    nextBridge: "Now let's examine the complete 6-tier State Taxonomy and learn why Redux is usually unnecessary in modern full-stack apps.",
  },

  {
    id: "p19-l5",
    phaseId: "p19",
    title: "The State Taxonomy: No Redux by Default",
    level: "Full-Stack Developer",
    minutes: 30,
    summary:
      "Classify application state into its six canonical homes: Local, Derived, Form, URL, Auth, and Server state. Understand why separating server cache (TanStack Query) from URL state eliminates 90% of complex Redux/Zustand boilerplate.",
    prerequisites: [
      "p06-l3 — Optimistic UI & the State Classification Map",
      "p19-l2 — TanStack Query: Queries, Keys & Stale Time",
    ],
    objectives: [
      "Categorize any application variable into one of the 6 state archetypes.",
      "Identify state duplication anti-patterns (e.g., copying server props into useState).",
      "Select the single optimal tool for each state category.",
      "Evaluate when lightweight global state (Zustand) is legitimately necessary.",
    ],
    simple:
      "In the past, developers threw everything into a massive global Redux store: tasks from the backend, form inputs, modal toggles, search query params, and auth tokens. This caused huge complexity. In modern full-stack architecture, we recognize that server data is not client state—it is a remote cache managed by TanStack Query. Filters belong in the URL. Forms belong in React Hook Form. Once you route state to its true home, your need for global state disappears.",
    why:
      "Putting server data in global client stores leads to stale synchronization bugs, missing cache invalidation, and hundreds of lines of useless action/reducer boilerplate.",
    mentalModel: {
      title: "The 6-Drawer Filing Cabinet",
      body: "Every piece of data belongs in exactly one drawer: 1. Local (a dropdown toggle in `useState`), 2. Derived (total item count calculated on the fly), 3. Form (unsubmitted inputs in React Hook Form), 4. URL (search query in `useSearchParams`), 5. Auth (verified session in Context), and 6. Server (database tasks in TanStack Query). Never copy data between drawers.",
    },
    sections: [
      {
        heading: "1. The 6-Archetype State Matrix",
        body: [
          "Understanding where every variable should live in a production React application.",
        ],
        code: [
          {
            file: "STATE_TAXONOMY_MATRIX.md",
            lang: "text",
            code: [
              "┌──────────────┬─────────────────────────────────┬────────────────────────────┬────────────────────────┐",
              "│ Archetype    │ Description / Examples          │ Optimal Tool               │ Anti-Pattern Smell     │",
              "├──────────────┼─────────────────────────────────┼────────────────────────────┼────────────────────────┤",
              "│ 1. Local     │ Dropdown open, tooltip hover    │ useState, useReducer       │ Storing in Redux       │",
              "│ 2. Derived   │ filteredList, totalInvoicePrice │ Pure JS expressions/useMemo│ Storing in useEffect   │",
              "│ 3. Form      │ Unsubmitted input values, errors│ React Hook Form + Zod      │ Controlled state soup  │",
              "│ 4. URL       │ ?page=2&status=DONE&search=auth │ useSearchParams, nuqs      │ Local state (unshared) │",
              "│ 5. Auth      │ Active JWT token, user profile  │ React Context / Supabase   │ Storing in localStorage│",
              "│ 6. Server    │ Tasks, workspaces, comments     │ TanStack Query (cache)     │ Redux / global store   │",
              "└──────────────┴─────────────────────────────────┴────────────────────────────┴────────────────────────┘",
            ].join("\n"),
            caption: "The canonical 6-part state taxonomy.",
          },
        ],
      },
      {
        heading: "2. The 'Derive, Don't Store' Law in Action",
        body: [
          "Never duplicate server data into `useState` or `useEffect` to compute filtered results.",
        ],
        code: [
          {
            file: "src/features/tasks/components/TaskList.tsx",
            lang: "tsx",
            code: [
              "import { useMemo } from 'react';",
              "import { useTasksQuery } from '../hooks/useTasksQuery';",
              "import { useSearchParams } from 'react-router-dom';",
              "",
              "export function TaskList({ workspaceId }: { workspaceId: string }) {",
              "  const [searchParams] = useSearchParams();",
              "  const filterStatus = searchParams.get('status') || 'ALL';",
              "",
              "  // 1. Server State: owned by TanStack Query",
              "  const { data: tasks = [], isLoading } = useTasksQuery({ workspaceId });",
              "",
              "  // 2. Derived State: calculated purely during render (no duplicate useState/useEffect)",
              "  const filteredTasks = useMemo(() => {",
              "    if (filterStatus === 'ALL') return tasks;",
              "    return tasks.filter((t) => t.status === filterStatus);",
              "  }, [tasks, filterStatus]);",
              "",
              "  if (isLoading) return <div>Loading tasks...</div>;",
              "",
              "  return (",
              "    <ul>",
              "      {filteredTasks.map((task) => (",
              "        <li key={task.id}>{task.title}</li>",
              "      ))}",
              "    </ul>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Computing derived state on the fly rather than synchronizing stale copies.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Copying query data into local useState via useEffect: `useEffect(() => { setItems(data) }, [data])`.",
      right: "Deriving values directly in render or transforming via the query `select` option.",
      explanation:
        "Syncing state with useEffect introduces extra render passes, desynchronization bugs, and stale closure traps.",
    },
    tryItYourself: {
      title: "Audit an Existing Component's State",
      instructions: [
        "1. Open any component in your app that has more than 3 `useState` calls.",
        "2. Test each variable against the 6-state taxonomy.",
        "3. Refactor any derived calculations out of useState into pure expressions.",
      ],
      expected: "The component reduces complexity and eliminates unnecessary useEffect hooks.",
    },
    challenge: {
      title: "When Is Global Client Store (Zustand) Legitimate?",
      description:
        "Identify 3 real-world scenarios where a lightweight global client store (Zustand) is legitimately needed rather than TanStack Query or URL state.",
      hints: [
        "Think of transient UI features that span multiple unrelated routes and do not belong in URLs.",
      ],
      solution: `1. Complex multi-step audio/media playback queues.\n2. Global floating command palette (⌘K) modal open/closed states.\n3. Ephemeral local notification toasts.`,
    },
    quiz: [
      {
        question: "Why should active search filters and pagination numbers live in URL search params rather than React state?",
        options: [
          "URL params are faster than memory",
          "URL params allow users to bookmark, refresh, and share exact filtered views with teammates",
          "React state cannot hold strings",
          "It reduces backend database CPU usage",
        ],
        answer: 1,
        explanation: "URL state makes views shareable, bookmarkable, and resilient to page reloads.",
      },
      {
        question: "Why is copying `data` from `useQuery` into `useState` considered an anti-pattern?",
        options: [
          "It doubles memory usage and leads to stale desynchronized state when the query refetches in the background",
          "TypeScript prohibits calling useState after useQuery",
          "TanStack Query throws a runtime error",
          "React will permanently unmount the component",
        ],
        answer: 0,
        explanation: "When background refetches update the query cache, the duplicated useState copy remains stale.",
      },
    ],
    flashcards: [
      {
        front: "What is Server State?",
        back: "Data persisted on a remote server that the client does not own (it only holds a cached snapshot).",
      },
      {
        front: "What is Derived State?",
        back: "Values computed purely from existing props, queries, or state without requiring their own storage variable.",
      },
    ],
    recap: [
      "Classify state into 6 archetypes: Local, Derived, Form, URL, Auth, and Server.",
      "Let TanStack Query own server cache; never duplicate into useState.",
      "Use URL search params for filters, sorting, and pagination.",
    ],
    references: [
      { label: "Kent C. Dodds: Application State Management", url: "https://kentcdodds.com/blog/application-state-management-with-react" },
    ],
    nextBridge: "Now let's examine request cancellation, timeout resilience, and retry policies for safe HTTP operations.",
  },

  {
    id: "p19-l6",
    phaseId: "p19",
    title: "Retries, Timeouts & Cancellation — Only Where Safe",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Configure bulletproof network resilience in TanStack Query. Wire AbortController signals for search query cancellation, enforce HTTP-method aware retry policies (retrying idempotent GETs, never non-idempotent POSTs), and prevent async race conditions.",
    prerequisites: [
      "p19-l1 — Designing the Typed API Layer",
      "p02-l6 — Event Loop, Tasks & Debugging Labs",
    ],
    objectives: [
      "Pass `signal` from `queryFn` into `apiClient` to enable automatic browser request aborting.",
      "Implement idempotent-aware retry algorithms with exponential backoff and jitter.",
      "Enforce hard request timeouts to prevent hung connections on mobile networks.",
      "Prevent async race conditions during rapid search input typing.",
    ],
    simple:
      "When a user types 'react' into a search box, the browser might fire 5 requests: 'r', 're', 'rea', 'reac', 'react'. If the 'r' request takes 1 second and the 'react' request takes 100ms, the 'r' response could arrive last and overwrite your search results with old data! By wiring AbortController cancellation into TanStack Query, the previous in-flight requests are physically cancelled on the wire the moment the user types the next letter.",
    why:
      "Uncancelled async requests waste server bandwidth and cause out-of-order race conditions where stale data overwrites fresh user inputs.",
    mentalModel: {
      title: "The Radio Operator & The Cut Signal",
      body: "When you change your mind mid-broadcast, you don't let the radio operator keep transmitting the old paragraph. You flip the kill switch (`signal.abort()`). The transmitter immediately ceases broadcasting the old message and immediately dedicates 100% of its antenna power to the new message.",
    },
    sections: [
      {
        heading: "1. Wiring AbortSignal to `fetch` for Live Query Cancellation",
        body: [
          "TanStack Query automatically passes an `AbortSignal` inside `queryFn`. Forwarding it to `fetch` cancels the HTTP request when the query unmounts or changes keys.",
        ],
        code: [
          {
            file: "src/features/search/hooks/useSearchQuery.ts",
            lang: "ts",
            code: [
              "import { useQuery } from '@tanstack/react-query';",
              "import { apiClient } from '@/lib/api/client';",
              "",
              "export function useSearchQuery(searchTerm: string, workspaceId: string) {",
              "  return useQuery({",
              "    queryKey: ['search', workspaceId, searchTerm],",
              "    queryFn: ({ signal }) =>",
              "      apiClient<{ results: any[] }>('/search', {",
              "        params: { q: searchTerm, workspaceId },",
              "        signal, // Forward AbortSignal to browser fetch",
              "      }),",
              "    enabled: searchTerm.trim().length >= 2,",
              "    staleTime: 10 * 1000,",
              "  });",
              "}",
            ].join("\n"),
            caption: "Forwarding queryFn signal to apiClient for automatic request cancellation.",
          },
        ],
      },
      {
        heading: "2. Safe Retry Discipline: Idempotent vs Non-Idempotent Operations",
        body: [
          "Only retry safe/idempotent reads (GET/HEAD) or idempotent writes (PUT/DELETE). NEVER blindly retry non-idempotent POSTs (e.g., checkout/payment).",
        ],
        code: [
          {
            file: "src/lib/query/retryPolicy.ts",
            lang: "ts",
            code: [
              "import { ApiError } from '../api/errors';",
              "",
              "export function safeQueryRetry(failureCount: number, error: unknown): boolean {",
              "  // Never retry fatal client errors",
              "  if (error instanceof ApiError) {",
              "    if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404 || error.status === 422) {",
              "      return false;",
              "    }",
              "  }",
              "",
              "  // Max 3 retries for transient 500, 502, 503, 504 network errors",
              "  return failureCount < 3;",
              "}",
            ].join("\n"),
            caption: "Safe retry policy filtering out fatal 4xx errors.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Configuring automatic retries on useMutation for POST /orders/checkout, resulting in duplicate credit card charges on flaky networks.",
      right: "Setting `retry: 0` on non-idempotent mutations and using backend idempotency keys.",
      explanation:
        "If a payment request times out on the client, the server might have already completed the charge. Retrying automatically charges the user twice.",
    },
    tryItYourself: {
      title: "Observe Request Cancellation in Network Tab",
      instructions: [
        "1. Open your browser DevTools Network tab and filter by 'Fetch/XHR'.",
        "2. Type rapidly in a search box wired to `useSearchQuery` with `signal` forwarded.",
        "3. Look for requests with Status `(canceled)` in red.",
      ],
      expected: "Previous incomplete search requests are cancelled immediately when the query key updates.",
    },
    challenge: {
      title: "Implement a Timeout Wrapper with AbortSignal.timeout()",
      description:
        "Enhance `apiClient` to enforce a hard 10-second timeout using modern `AbortSignal.any([signal, AbortSignal.timeout(10000)])`.",
      hints: [
        "`AbortSignal.any` combines multiple cancellation signals into one.",
      ],
      solution: `const timeoutSignal = AbortSignal.timeout(10000);\nconst combinedSignal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;\nreturn fetch(url, { ...options, signal: combinedSignal });`,
    },
    quiz: [
      {
        question: "Why should `signal` be passed from TanStack Query's `queryFn` into `fetch()`?",
        options: [
          "It physically aborts in-flight network requests when components unmount or search terms change",
          "It increases HTTP download speeds by 50%",
          "It encrypts request bodies with SSL",
          "It bypasses backend rate limits",
        ],
        answer: 0,
        explanation: "Forwarding AbortSignal allows the browser to cancel pending socket connections when queries are abandoned.",
      },
      {
        question: "Which HTTP status code SHOULD be considered for automatic retry?",
        options: [
          "401 Unauthorized",
          "404 Not Found",
          "503 Service Unavailable",
          "422 Unprocessable Entity",
        ],
        answer: 2,
        explanation: "503 Service Unavailable is typically a transient server outage or restart that often recovers on retry.",
      },
    ],
    flashcards: [
      {
        front: "What is an Idempotent HTTP method?",
        back: "A method that produces the same server side-effects whether executed once or ten times (GET, PUT, DELETE, HEAD).",
      },
      {
        front: "Why is POST generally non-idempotent?",
        back: "Executing POST multiple times creates multiple duplicate resources (e.g. creating multiple order records).",
      },
    ],
    recap: [
      "Always forward `signal` from `queryFn` to native `fetch`.",
      "Never retry non-idempotent operations without idempotency keys.",
      "Enforce request timeouts to prevent zombie mobile network connections.",
    ],
    references: [
      { label: "MDN AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController" },
      { label: "TanStack Query Query Cancellation", url: "https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation" },
    ],
    nextBridge: "Phase 19 is complete! Now let's enter Phase 20: Forms & End-to-End Validation with React Hook Form, Zod, and NestJS DTOs.",
  },
];

export const LESSON_CONTENT_P19B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P19B.map((l) => [l.id, l])
);
