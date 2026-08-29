import type { LessonContent } from "./types";

/**
 * Phase 24 Realtime — Where It Earns Its Place (L1–L5).
 */
export const LESSONS_P24: LessonContent[] = [
  {
    id: "p24-l1",
    phaseId: "p24",
    title: "Realtime Decision Tree: Polling vs SSE vs WS",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Architect realtime data synchronization pragmatically. Evaluate the architectural tradeoffs between Short Polling, Long Polling, Server-Sent Events (SSE), and full-duplex WebSockets using a strict decision tree to prevent over-engineering.",
    prerequisites: [
      "p07-l1 — HTTP Foundations: Request/Response Lifecycle",
      "p19-l2 — TanStack Query: Queries, Keys & Stale Time",
    ],
    objectives: [
      "Analyze the engineering costs, memory overhead, and load-balancer complexity of persistent WebSocket connections.",
      "Apply the 4-tier Realtime Decision Matrix (Periodic Polling vs Intent-based Polling vs SSE vs WebSockets).",
      "Understand why 90% of business applications only need smart polling (refetchInterval) or Server-Sent Events.",
      "Identify the true use-cases that demand full-duplex WebSockets (collaborative whiteboards, multiplayer gaming, low-latency live audio).",
    ],
    simple:
      "Beginner developers often rush to add complex WebSockets to every project just to update a task badge once every 10 minutes. Persistent WebSockets require sticky load balancer sessions, stateful server memory, heartbeat pings, and reconnection managers. If an app only needs occasional updates, a 30-second TanStack Query poll (`refetchInterval`) or lightweight Server-Sent Events (SSE) provides 100% of the value at 5% of the engineering complexity.",
    why:
      "Building full-duplex WebSockets when simple polling or SSE suffices creates unnecessary operational complexity, connection exhaustion, and deployment fragility.",
    mentalModel: {
      title: "The Phone Call vs The Text Message vs Checking The Mail",
      body: "Short Polling is walking to your physical mailbox once every 30 seconds to check for mail. Server-Sent Events (SSE) is subscribing to a one-way radio news bulletin: the broadcaster pushes news into your home whenever something happens. WebSockets is an open, uninterrupted telephone call where both people hold the phone to their ear 24 hours a day.",
    },
    sections: [
      {
        heading: "1. The Realtime Synchronization Matrix",
        body: [
          "Comparing transport protocols, bidirectional capabilities, and infrastructure overhead.",
        ],
        code: [
          {
            file: "REALTIME_DECISION_MATRIX.md",
            lang: "text",
            code: [
              "┌──────────────────┬─────────────────┬──────────────────┬─────────────────┬──────────────────────────────┐",
              "│ Technique        │ Direction       │ Protocol         │ Server Overhead │ Ideal Use Case               │",
              "├──────────────────┼─────────────────┼──────────────────┼─────────────────┼──────────────────────────────┤",
              "│ Short Polling    │ Client -> Server│ HTTP/1.1 or H2   │ Low / Stateless │ Dashboards, build statuses   │",
              "│ Long Polling     │ Client -> Server│ HTTP/1.1 (Held)  │ Medium          │ Legacy fallbacks             │",
              "│ SSE (EventSource)│ Server -> Client│ Standard HTTP H2 │ Low (Stateless) │ Stock tickers, AI streaming  │",
              "│ WebSockets (WS)  │ Full Duplex (<->│ ws:// or wss://  │ High (Stateful) │ Collaborative canvas, gaming │",
              "└──────────────────┴─────────────────┴──────────────────┴─────────────────┴──────────────────────────────┘",
            ].join("\n"),
            caption: "Architectural comparison of real-time communication protocols.",
          },
        ],
      },
      {
        heading: "2. The Pragmatic Realtime Decision Tree",
        body: [
          "Follow this sequential logic flow before adding any WebSocket dependencies to your project.",
        ],
        code: [
          {
            file: "DECISION_TREE.md",
            lang: "text",
            code: [
              "1. Does the data change faster than once every 5 seconds?",
              "   ├── NO  --> Use TanStack Query with `refetchInterval: 30000` (Stateless HTTP Polling).",
              "   └── YES --> Proceed to Step 2.",
              "",
              "2. Does the client need to send ultra-low-latency streams TO the server over the same socket?",
              "   ├── NO  --> Use Server-Sent Events (SSE) / Supabase Postgres Changes (One-way push).",
              "   └── YES --> Use WebSockets (Full Duplex bidirectional connection).",
            ].join("\n"),
            caption: "The pragmatic Realtime engineering decision tree.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Opening persistent WebSocket connections on public landing pages or read-mostly blogs, exhausting server socket descriptors.",
      right: "Using standard HTTP caching and periodic polling for read-mostly views, reserving realtime sockets for authenticated active workspaces.",
      explanation:
        "Each active WebSocket holds an open TCP socket and file descriptor in server memory.",
    },
    tryItYourself: {
      title: "Evaluate Your App's Realtime Requirements",
      instructions: [
        "1. Identify every dynamic feature in your application (notifications, task updates, chat).",
        "2. Run each feature through the 2-step Decision Tree.",
        "3. Choose between TanStack Query polling, Supabase Realtime CDC, or WebSockets.",
      ],
      expected: "Over 80% of features map cleanly to polling or Supabase CDC without custom WebSocket servers.",
    },
    challenge: {
      title: "Configure Conditional TanStack Query Polling",
      description:
        "Configure `refetchInterval` to poll every 5 seconds only while a long-running background export job has status `'PROCESSING'`, and automatically stop polling when status reaches `'COMPLETED'`.",
      hints: [
        "Pass a function to `refetchInterval: (query) => query.state.data?.status === 'PROCESSING' ? 5000 : false`.",
      ],
      solution: `const { data } = useQuery({\n  queryKey: ['job', jobId],\n  queryFn: () => fetchJob(jobId),\n  refetchInterval: (query) => query.state.data?.status === 'PROCESSING' ? 5000 : false,\n});`,
    },
    quiz: [
      {
        question: "When is Server-Sent Events (SSE) preferred over WebSockets?",
        options: [
          "When data only needs to flow in one direction (server to client) over standard HTTP without custom socket proxies",
          "When building 3D multiplayer action games",
          "When you need to transmit raw UDP packets",
          "When the client is offline",
        ],
        answer: 0,
        explanation: "SSE is a lightweight standard HTTP mechanism for streaming server-to-client events with automatic reconnection.",
      },
      {
        question: "What is the operational cost of maintaining WebSockets at scale?",
        options: [
          "Stateful connections require sticky load-balancing, connection state synchronization across server clusters (e.g. Redis Pub/Sub), and memory allocation per socket",
          "WebSockets require paying royalties to W3C",
          "WebSockets only run on port 80",
          "WebSockets cannot transmit JSON",
        ],
        answer: 0,
        explanation: "Stateful sockets require Redis PubSub adapters and sticky routing when scaling across multiple server nodes.",
      },
    ],
    flashcards: [
      {
        front: "What is Server-Sent Events (SSE)?",
        back: "A standard web technology where a browser receives automatic updates from a server via an HTTP connection (`text/event-stream`).",
      },
      {
        front: "What is Full Duplex communication?",
        back: "Bi-directional communication where both client and server can transmit data simultaneously across a single connection.",
      },
    ],
    recap: [
      "Follow the Realtime Decision Tree: Polling -> SSE -> WebSockets.",
      "Use periodic TanStack Query polling for slow-moving data.",
      "Reserve WebSockets for high-frequency collaborative features.",
    ],
    references: [
      { label: "MDN Server-Sent Events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events" },
    ],
    nextBridge: "Now let's implement Supabase Realtime Postgres Changes (Change Data Capture) with tenant filters.",
  },

  {
    id: "p24-l2",
    phaseId: "p24",
    title: "Supabase Realtime: Postgres Changes (CDC)",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Listen to real-time PostgreSQL database mutations. Harness Postgres Logical Replication Write-Ahead Logs (WAL) via Supabase Realtime, subscribe to INSERT, UPDATE, and DELETE events, and enforce tenant-scoped channel filters.",
    prerequisites: [
      "p24-l1 — Realtime Decision Tree: Polling vs SSE vs WS",
      "p17-l2 — Connecting NestJS & Prisma to Supabase",
    ],
    objectives: [
      "Understand how PostgreSQL Change Data Capture (CDC) streams row-level changes from the WAL log.",
      "Enable replication on specific PostgreSQL tables using `ALTER PUBLICATION supabase_realtime ADD TABLE ...`.",
      "Subscribe to `postgres_changes` events on specific tenant channels using the `@supabase/supabase-js` SDK.",
      "Filter event streams by tenant workspace ID (`filter: 'workspace_id=eq.ws_1'`).",
    ],
    simple:
      "When a teammate marks a task as 'Done' in their browser, the update is saved to the PostgreSQL database. PostgreSQL's Write-Ahead Log immediately broadcasts the change to Supabase Realtime, which pushes the updated row to every other connected browser in the same workspace in under 50 milliseconds. You get instant real-time synchronization without maintaining a custom WebSocket server.",
    why:
      "Building custom WebSocket event dispatchers in your backend requires maintaining Redis Pub/Sub clusters. Supabase Realtime reads database changes directly from PostgreSQL WAL logs.",
    mentalModel: {
      title: "The Newspaper Printing Press Wire",
      body: "PostgreSQL's Write-Ahead Log (WAL) is the master printing press. The moment a reporter writes an article (SQL INSERT/UPDATE), the printing press stamps the paper and immediately sends an electronic copy across the wire (Supabase Realtime) to all subscriber radios tuned to that workspace station (`channel`).",
    },
    sections: [
      {
        heading: "1. Enabling Realtime Replication on PostgreSQL Tables",
        body: [
          "Adding tables to the `supabase_realtime` publication via SQL migration.",
        ],
        code: [
          {
            file: "supabase/migrations/enable_realtime.sql",
            lang: "sql",
            code: [
              "-- 1. Enable full replica identity so UPDATE events contain previous row values",
              "ALTER TABLE tasks REPLICA IDENTITY FULL;",
              "",
              "-- 2. Add tasks table to Supabase Realtime publication",
              "ALTER PUBLICATION supabase_realtime ADD TABLE tasks;",
              "",
              "-- 3. Add task_comments table to publication",
              "ALTER TABLE task_comments REPLICA IDENTITY FULL;",
              "ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;",
            ].join("\n"),
            caption: "Enabling PostgreSQL replica identity and Realtime publication.",
          },
        ],
      },
      {
        heading: "2. Subscribing to Filtered Database Changes in React",
        body: [
          "Subscribing to tenant-filtered table change events with clean channel teardown.",
        ],
        code: [
          {
            file: "src/features/tasks/hooks/useTaskRealtimeSubscription.ts",
            lang: "ts",
            code: [
              "import { useEffect } from 'react';",
              "import { supabase } from '@/lib/supabase/client';",
              "import { TaskDto } from '@/lib/api/tasks';",
              "",
              "export function useTaskRealtimeSubscription(",
              "  workspaceId: string,",
              "  onTaskChange: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: TaskDto; old: Partial<TaskDto> }) => void,",
              ") {",
              "  useEffect(() => {",
              "    if (!workspaceId) return;",
              "",
              "    // 1. Create a dedicated tenant-scoped channel",
              "    const channel = supabase",
              "      .channel(`tasks:workspace:${workspaceId}`)",
              "      .on(",
              "        'postgres_changes',",
              "        {",
              "          event: '*', // Listen to INSERT, UPDATE, and DELETE",
              "          schema: 'public',",
              "          table: 'tasks',",
              "          filter: `workspace_id=eq.${workspaceId}`, // Restrict to active tenant",
              "        },",
              "        (payload) => {",
              "          onTaskChange({",
              "            eventType: payload.eventType as any,",
              "            new: payload.new as TaskDto,",
              "            old: payload.old as Partial<TaskDto>,",
              "          });",
              "        },",
              "      )",
              "      .subscribe();",
              "",
              "    // 2. Always clean up and unsubscribe on unmount",
              "    return () => {",
              "      supabase.removeChannel(channel);",
              "    };",
              "  }, [workspaceId, onTaskChange]);",
              "}",
            ].join("\n"),
            caption: "React hook subscribing to tenant-filtered PostgreSQL change events.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Forgetting `filter: 'workspace_id=eq.xxx'` in the subscription, causing every connected client to receive database change events for all other workspaces in the database.",
      right: "Always adding tenant filter conditions to `postgres_changes` subscriptions.",
      explanation:
        "Omitting tenant filters leaks real-time events across multi-tenant boundaries.",
    },
    tryItYourself: {
      title: "Observe Real-Time Database Change Events",
      instructions: [
        "1. Open your application in two separate browser windows side by side.",
        "2. In Window A, edit a task title and click save.",
        "3. Observe how Window B receives the `UPDATE` payload and logs it to console in <50ms.",
      ],
      expected: "The database change broadcasts across browser windows in real time.",
    },
    challenge: {
      title: "Filter Events by Task Assignee",
      description:
        "Create a subscription that only notifies the active user when a task assigned specifically to their `assignee_id` is created or updated.",
      hints: [
        "Set `filter: 'assignee_id=eq.' + currentUserId`.",
      ],
      solution: `supabase.channel('my-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: \`assignee_id=eq.\${userId}\` }, handler).subscribe();`,
    },
    quiz: [
      {
        question: "How does Supabase Realtime detect PostgreSQL database changes?",
        options: [
          "It reads PostgreSQL's Logical Replication Write-Ahead Log (WAL) stream directly",
          "It runs a polling query every 10 milliseconds",
          "It uses browser localStorage",
          "It requires NestJS to emit WebSocket events manually",
        ],
        answer: 0,
        explanation: "Supabase Realtime listens to PostgreSQL's native logical replication stream.",
      },
      {
        question: "What SQL command configures a table so that UPDATE events contain the previous row values?",
        options: [
          "ALTER TABLE tasks REPLICA IDENTITY FULL;",
          "CREATE INDEX tasks_realtime_idx;",
          "SET REALTIME = ON;",
          "GRANT ALL TO authenticated;",
        ],
        answer: 0,
        explanation: "REPLICA IDENTITY FULL instructs PostgreSQL to include previous column values in the replication payload.",
      },
    ],
    flashcards: [
      {
        front: "What is Change Data Capture (CDC)?",
        back: "A software pattern that identifies and captures changes made to database tables and delivers them as a real-time event stream.",
      },
      {
        front: "Why must `supabase.removeChannel(channel)` be called on component unmount?",
        back: "To close the WebSocket channel and prevent memory leaks and ghost event handlers.",
      },
    ],
    recap: [
      "Enable `REPLICA IDENTITY FULL` and add tables to `supabase_realtime`.",
      "Subscribe to `postgres_changes` with tenant filters (`workspace_id=eq.xxx`).",
      "Always clean up channels on unmount with `removeChannel()`.",
    ],
    references: [
      { label: "Supabase Realtime Postgres Changes", url: "https://supabase.com/docs/guides/realtime/postgres-changes" },
    ],
    nextBridge: "Now let's connect incoming Realtime events directly to our TanStack Query client cache.",
  },

  {
    id: "p24-l3",
    phaseId: "p24",
    title: "Connecting Realtime to TanStack Query Cache",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Bridge realtime event streams with TanStack Query's cache engine. Update query cache directly on INSERT/UPDATE/DELETE events using `setQueryData` and trigger targeted revalidations without full page refreshes.",
    prerequisites: [
      "p24-l2 — Supabase Realtime: Postgres Changes (CDC)",
      "p19-l2 — TanStack Query: Queries, Keys & Stale Time",
    ],
    objectives: [
      "Synthesize incoming Realtime CDC payloads into TanStack Query cache entries.",
      "Handle incoming `INSERT` events by prepending new tasks to cached list queries.",
      "Handle incoming `UPDATE` events by patching specific items in list and detail caches.",
      "Handle incoming `DELETE` events by filtering removed items out of cache collections.",
    ],
    simple:
      "When a real-time event arrives from the database, what should your React app do? If you just call `window.location.reload()`, the screen flashes and the user loses focus. If you only call `invalidateQueries()`, a network request is triggered. By directly updating TanStack Query's cache with `setQueryData`, the new or edited item pops onto the screen in 0ms with zero extra network requests!",
    why:
      "Directly updating query cache from real-time events creates seamless, multiplayer-feeling interfaces without redundant HTTP roundtrips.",
    mentalModel: {
      title: "The Live Stock Ticker Display Board",
      body: "When the stock market bell rings with a price change (Realtime event), the electronic display board (TanStack Query Cache) doesn't wipe all numbers blank and call Wall Street on the telephone. It simply repaints the single changed digit on the existing board instantly (`setQueryData`).",
    },
    sections: [
      {
        heading: "1. The Unified Realtime Cache Sync Hook",
        body: [
          "Bridging CDC events directly into TanStack Query list and detail cache addresses.",
        ],
        code: [
          {
            file: "src/features/tasks/hooks/useTasksRealtimeSync.ts",
            lang: "ts",
            code: [
              "import { useEffect } from 'react';",
              "import { useQueryClient } from '@tanstack/react-query';",
              "import { supabase } from '@/lib/supabase/client';",
              "import { taskKeys } from '@/lib/query/keys';",
              "import { TaskDto } from '@/lib/api/tasks';",
              "",
              "export function useTasksRealtimeSync(workspaceId: string) {",
              "  const queryClient = useQueryClient();",
              "",
              "  useEffect(() => {",
              "    if (!workspaceId) return;",
              "",
              "    const channel = supabase",
              "      .channel(`realtime-sync:tasks:${workspaceId}`)",
              "      .on(",
              "        'postgres_changes',",
              "        {",
              "          event: '*',",
              "          schema: 'public',",
              "          table: 'tasks',",
              "          filter: `workspace_id=eq.${workspaceId}`,",
              "        },",
              "        (payload) => {",
              "          const listKey = taskKeys.list(workspaceId);",
              "",
              "          // 1. Handle INSERT: prepend new task to list cache",
              "          if (payload.eventType === 'INSERT') {",
              "            const newTask = payload.new as TaskDto;",
              "            queryClient.setQueryData<{ data: TaskDto[]; total: number }>(listKey, (old) => {",
              "              if (!old) return old;",
              "              // Prevent duplicate insertion if current client created it",
              "              if (old.data.some((t) => t.id === newTask.id)) return old;",
              "              return { ...old, data: [newTask, ...old.data], total: old.total + 1 };",
              "            });",
              "          }",
              "",
              "          // 2. Handle UPDATE: patch updated item in list and detail cache",
              "          if (payload.eventType === 'UPDATE') {",
              "            const updatedTask = payload.new as TaskDto;",
              "            queryClient.setQueryData<{ data: TaskDto[] }>(listKey, (old) => {",
              "              if (!old) return old;",
              "              return {",
              "                ...old,",
              "                data: old.data.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),",
              "              };",
              "            });",
              "            queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);",
              "          }",
              "",
              "          // 3. Handle DELETE: remove item from cache",
              "          if (payload.eventType === 'DELETE') {",
              "            const deletedId = (payload.old as any).id;",
              "            queryClient.setQueryData<{ data: TaskDto[]; total: number }>(listKey, (old) => {",
              "              if (!old) return old;",
              "              return {",
              "                ...old,",
              "                data: old.data.filter((t) => t.id !== deletedId),",
              "                total: Math.max(0, old.total - 1),",
              "              };",
              "            });",
              "          }",
              "        },",
              "      )",
              "      .subscribe();",
              "",
              "    return () => {",
              "      supabase.removeChannel(channel);",
              "    };",
              "  }, [workspaceId, queryClient]);",
              "}",
            ].join("\n"),
            caption: "Bridging Postgres CDC events directly into TanStack Query cache with setQueryData.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Calling `queryClient.invalidateQueries()` on every single real-time event in high-traffic workspaces, causing a storm of HTTP refetch requests.",
      right: "Updating the cache directly with `queryClient.setQueryData()` using the event payload payload.new.",
      explanation:
        "The real-time event already contains the new row data. Applying it directly with `setQueryData` saves an unnecessary HTTP roundtrip.",
    },
    tryItYourself: {
      title: "Test Zero-Latency Realtime Synchronization",
      instructions: [
        "1. Open the tasks dashboard in Window A and Window B.",
        "2. In Window A, delete a task.",
        "3. Watch Window B remove the task instantly from its list view with 0ms delay and 0 HTTP requests in the Network tab.",
      ],
      expected: "The cache updates immediately based on the incoming WebSocket payload.",
    },
    challenge: {
      title: "Prevent Self-Echo Duplication",
      description:
        "When Client A creates a task via optimistic mutation and then receives the Realtime INSERT event from the database, ensure the task is not inserted twice.",
      hints: [
        "Check `if (old.data.some(t => t.id === newTask.id)) return old;` before appending.",
      ],
      solution: `const exists = old.data.some(t => t.id === newTask.id || (t.id.startsWith('temp-') && t.title === newTask.title));\nif (exists) return { ...old, data: old.data.map(t => t.id.startsWith('temp-') ? newTask : t) };`,
    },
    quiz: [
      {
        question: "Why is `setQueryData` preferred over `invalidateQueries` when handling real-time CDC events?",
        options: [
          "The event payload already contains the updated row, so applying it directly avoids an extra HTTP network request",
          "setQueryData disables React re-rendering",
          "invalidateQueries causes database crashes",
          "setQueryData is required by TypeScript",
        ],
        answer: 0,
        explanation: "Direct cache mutation is instant and eliminates redundant backend HTTP traffic.",
      },
      {
        question: "How do you update a single item inside a paginated list array with `setQueryData`?",
        options: [
          "old.data.map(item => item.id === updated.id ? updated : item)",
          "old.push(updated)",
          "delete old[updated.id]",
          "old.clear()",
        ],
        answer: 0,
        explanation: "Mapping over the array replaces the matched item immutably while preserving list order.",
      },
    ],
    flashcards: [
      {
        front: "What is Cache Hydration from WebSockets?",
        back: "Injecting server-pushed event data directly into client query cache without issuing HTTP GET requests.",
      },
      {
        front: "What is Self-Echo in real-time systems?",
        back: "When a client performs a mutation and subsequently receives its own broadcasted event back over the WebSocket channel.",
      },
    ],
    recap: [
      "Synthesize CDC events directly into TanStack Query with `setQueryData`.",
      "Handle INSERT, UPDATE, and DELETE operations cleanly in cache.",
      "Guard against duplicate insertions from optimistic mutations.",
    ],
    references: [
      { label: "TanStack Query Cache Manipulation", url: "https://tanstack.com/query/latest/docs/framework/react/guides/updates-from-mutation-responses" },
    ],
    nextBridge: "Now let's build multi-user Presence and collaborative awareness features.",
  },

  {
    id: "p24-l4",
    phaseId: "p24",
    title: "Presence & Collaborative Awareness",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Build live multi-user collaborative presence indicators. Implement Supabase Realtime Presence to track active online users, render live avatar clusters ('Sarah is currently viewing this task'), and broadcast ephemeral typing indicators.",
    prerequisites: [
      "p24-l2 — Supabase Realtime: Postgres Changes (CDC)",
      "p05-l1 — Component Lifecycle, Reconciliation & Keys",
    ],
    objectives: [
      "Understand the difference between persistent database state (Postgres) and ephemeral peer state (Presence).",
      "Track and sync user presence state with `channel.track()` and `channel.on('presence', ...)`.",
      "Render live collaborator avatar clusters on active task views.",
      "Implement ephemeral typing indicator broadcasts with debounced timeout clearers.",
    ],
    simple:
      "When working in Google Docs or Figma, you can see little colored bubbles showing who else is currently reading or editing the document. This is called 'Presence'. Presence data is ephemeral: it is not saved to the PostgreSQL database. When a user opens a task, their browser announces 'I am here' to the WebSocket channel. When they close their laptop, the presence system automatically removes their bubble.",
    why:
      "Collaborative presence prevents duplicate work by showing teammates when someone else is already reviewing or editing a task.",
    mentalModel: {
      title: "The Meeting Room Glass Wall & Name Badges",
      body: "Presence is looking through the glass wall of a conference room. You see Sarah and David sitting at the table with their name badges visible. They didn't sign a 5-year lease (database write); they simply walked into the room (socket join), and when they walk out, the chairs are empty.",
    },
    sections: [
      {
        heading: "1. The Supabase Realtime Presence Hook",
        body: [
          "Tracking and synchronizing active user presence on specific tasks.",
        ],
        code: [
          {
            file: "src/features/presence/hooks/useTaskPresence.ts",
            lang: "ts",
            code: [
              "import { useEffect, useState } from 'react';",
              "import { supabase } from '@/lib/supabase/client';",
              "import { useAuth } from '@/features/auth/hooks/useAuth';",
              "",
              "export interface PresenceUser {",
              "  userId: string;",
              "  name: string;",
              "  avatarUrl?: string;",
              "  onlineAt: string;",
              "}",
              "",
              "export function useTaskPresence(taskId: string) {",
              "  const { user } = useAuth();",
              "  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);",
              "",
              "  useEffect(() => {",
              "    if (!taskId || !user) return;",
              "",
              "    // 1. Join task presence channel",
              "    const channel = supabase.channel(`presence:task:${taskId}`, {",
              "      config: { presence: { key: user.id } },",
              "    });",
              "",
              "    channel",
              "      .on('presence', { event: 'sync' }, () => {",
              "        const state = channel.presenceState<PresenceUser>();",
              "        const activeUsers: PresenceUser[] = [];",
              "        Object.values(state).forEach((presences) => {",
              "          if (presences[0]) activeUsers.push(presences[0]);",
              "        });",
              "        setOnlineUsers(activeUsers);",
              "      })",
              "      .subscribe(async (status) => {",
              "        if (status === 'SUBSCRIBED') {",
              "          // 2. Track our active presence state",
              "          await channel.track({",
              "            userId: user.id,",
              "            name: user.name || user.email,",
              "            avatarUrl: user.avatarUrl,",
              "            onlineAt: new Date().toISOString(),",
              "          });",
              "        }",
              "      });",
              "",
              "    // 3. Clean up on unmount (automatically untracks presence)",
              "    return () => {",
              "      channel.untrack();",
              "      supabase.removeChannel(channel);",
              "    };",
              "  }, [taskId, user]);",
              "",
              "  return { onlineUsers };",
              "}",
            ].join("\n"),
            caption: "Custom presence hook tracking active task collaborators with presenceState sync.",
          },
        ],
      },
      {
        heading: "2. The Active Collaborators Avatar Cluster UI",
        body: [
          "Rendering stacked overlapping avatar bubbles with accessible tooltip names.",
        ],
        code: [
          {
            file: "src/features/presence/components/CollaboratorAvatars.tsx",
            lang: "tsx",
            code: [
              "import { PresenceUser } from '../hooks/useTaskPresence';",
              "",
              "export function CollaboratorAvatars({ users, currentUserId }: { users: PresenceUser[]; currentUserId?: string }) {",
              "  // Filter out ourselves so we only see other collaborators",
              "  const others = users.filter((u) => u.userId !== currentUserId);",
              "  if (others.length === 0) return null;",
              "",
              "  return (",
              "    <div className=\"flex items-center gap-2\">",
              "      <span className=\"text-[0.68rem] text-muted font-mono uppercase\">Viewing now:</span>",
              "      <div className=\"flex -space-x-2 overflow-hidden\">",
              "        {others.map((u) => (",
              "          <div",
              "            key={u.userId}",
              "            title={`${u.name} is currently viewing this task`}",
              "            className=\"inline-block h-6 w-6 rounded-full ring-2 ring-background bg-cyan-800 text-[0.65rem] font-bold text-white flex items-center justify-center\"",
              "          >",
              "            {u.name.slice(0, 2).toUpperCase()}",
              "          </div>",
              "        ))}",
              "      </div>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Collaborator avatar cluster rendering live peer presence bubbles.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Storing typing indicators or 'user is viewing' states in PostgreSQL database tables, creating thousands of useless database writes and vacuum churn.",
      right: "Using in-memory WebSocket Presence channels for ephemeral state.",
      explanation:
        "Ephemeral awareness data belongs in lightweight socket memory, not permanent database storage.",
    },
    tryItYourself: {
      title: "Test Live Multi-User Presence",
      instructions: [
        "1. Open Task #1 in Browser Window A.",
        "2. Open Task #1 in Browser Window B with a different test user.",
        "3. Observe Window A immediately displaying Window B's avatar bubble in the 'Viewing now' bar.",
        "4. Close Window B and watch the avatar bubble disappear in <1 second.",
      ],
      expected: "Presence state syncs and clears automatically without database calls.",
    },
    challenge: {
      title: "Add Live Typing Indicator Broadcast",
      description:
        "Use Supabase Broadcast channel (`channel.send({ type: 'broadcast', event: 'typing', payload: { user } })`) to show 'Sarah is typing a comment...' with a 3-second auto-clear timer.",
      hints: [
        "Broadcast on keystroke and clear typing indicator if no new keystroke arrives within 3000ms.",
      ],
      solution: `const sendTyping = () => channel.send({ type: 'broadcast', event: 'typing', payload: { name: user.name } });`,
    },
    quiz: [
      {
        question: "Why should presence and typing indicators NOT be written to PostgreSQL?",
        options: [
          "They are ephemeral states with high write frequency that would cause database bloat and unnecessary I/O",
          "PostgreSQL cannot store text",
          "Typing indicators are forbidden by GDPR",
          "Prisma does not support strings",
        ],
        answer: 0,
        explanation: "Ephemeral awareness data changes every few milliseconds and should stay in WebSocket memory.",
      },
      {
        question: "What happens when a user's browser tab closes or loses connection in Supabase Presence?",
        options: [
          "The server automatically removes the user's presence state and broadcasts a 'sync' event to remaining peers",
          "The server crashes",
          "The user's account is deleted",
          "The database locks",
        ],
        answer: 0,
        explanation: "Presence engines detect socket disconnects and automatically purge disconnected client state.",
      },
    ],
    flashcards: [
      {
        front: "What is Ephemeral State?",
        back: "Temporary data (e.g. typing indicators, active cursor positions) that loses all value once the session ends.",
      },
      {
        front: "What is `channel.presenceState()` in Supabase?",
        back: "A method returning the current mapping of all active peer presence objects on that channel.",
      },
    ],
    recap: [
      "Use Supabase Realtime Presence for ephemeral collaborator awareness.",
      "Render live collaborator avatar clusters on active views.",
      "Never persist ephemeral presence data in PostgreSQL database tables.",
    ],
    references: [
      { label: "Supabase Realtime Presence Guide", url: "https://supabase.com/docs/guides/realtime/presence" },
    ],
    nextBridge: "Now let's complete Phase 24 with Reconnection, Heartbeats & Graceful Degradation under poor network conditions.",
  },

  {
    id: "p24-l5",
    phaseId: "p24",
    title: "Reconnection, Heartbeats & Degradation",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Harden realtime connectivity for unstable networks. Implement WebSocket heartbeat pings, exponential backoff reconnection algorithms with jitter, state resynchronization on reconnect, and graceful fallback to HTTP polling when sockets fail.",
    prerequisites: [
      "p24-l3 — Connecting Realtime to TanStack Query Cache",
      "p19-l6 — Retries, Timeouts & Cancellation — Only Where Safe",
    ],
    objectives: [
      "Detect silent network drops using WebSocket heartbeat pings.",
      "Implement exponential backoff reconnection with randomized jitter to prevent Thundering Herd socket storms.",
      "Execute complete state reconciliation (invalidating query cache) upon successful reconnection.",
      "Design graceful fallback mechanisms that seamlessly switch to HTTP polling if corporate firewalls block WebSockets.",
    ],
    simple:
      "Mobile phones frequently lose signal when walking into elevators or driving through tunnels. When a WebSocket drops silently, the browser thinks it is still connected and stops receiving updates. With heartbeat pings, the browser sends a ping every 30 seconds: if no reply returns, it immediately initiates reconnection with exponential backoff and refreshes all data from the database once back online.",
    why:
      "Silent socket disconnections leave users looking at stale data indefinitely without knowing their connection dropped.",
    mentalModel: {
      title: "The Radar Heartbeat & The Emergency Generator",
      body: "Heartbeat pings are the submarine's radar ping: 'Ping... Pong'. If a ping goes unanswered for 10 seconds, the submarine declares an emergency, starts the reconnection engines, and if the main radio antenna is blocked (firewall blocks WS), it automatically deploys the emergency wire antenna (fallback HTTP polling).",
    },
    sections: [
      {
        heading: "1. Reconnection Lifecycle & Full Cache Revalidation",
        body: [
          "Listening to socket status changes and revalidating TanStack Query cache upon reconnect.",
        ],
        code: [
          {
            file: "src/lib/realtime/reconnection-manager.ts",
            lang: "ts",
            code: [
              "import { useQueryClient } from '@tanstack/react-query';",
              "import { supabase } from '../supabase/client';",
              "import { useEffect, useState } from 'react';",
              "import { taskKeys } from '../query/keys';",
              "",
              "export function useRealtimeConnectionStatus(workspaceId: string) {",
              "  const [status, setStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('CONNECTING');",
              "  const queryClient = useQueryClient();",
              "",
              "  useEffect(() => {",
              "    // Listen to Supabase Realtime socket state transitions",
              "    const sub = supabase.realtime.onOpen(() => {",
              "      setStatus('CONNECTED');",
              "      // CRITICAL: On reconnection, immediately invalidate cache to pull any updates missed while offline",
              "      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });",
              "    });",
              "",
              "    const closeSub = supabase.realtime.onClose(() => {",
              "      setStatus('DISCONNECTED');",
              "    });",
              "",
              "    const errSub = supabase.realtime.onError(() => {",
              "      setStatus('DISCONNECTED');",
              "    });",
              "",
              "    return () => {",
              "      // Cleanup listeners",
              "    };",
              "  }, [workspaceId, queryClient]);",
              "",
              "  return { status, isConnected: status === 'CONNECTED' };",
              "}",
            ].join("\n"),
            caption: "Reconnection manager invalidating query cache upon reconnect to bridge missed events.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Failing to revalidate the query cache after reconnecting, leaving the client in a permanently stale state missing all edits that happened while offline.",
      right: "Always calling `queryClient.invalidateQueries()` inside the `onOpen` socket reconnection callback.",
      explanation:
        "Any database events that occurred while the client was disconnected will be lost unless the client does a full query sync upon reconnecting.",
    },
    tryItYourself: {
      title: "Simulate an Elevator Network Drop and Reconnect",
      instructions: [
        "1. Open your app and check the connection status badge (shows 'Live Connected').",
        "2. Toggle 'Offline' in Chrome DevTools Network tab for 10 seconds.",
        "3. While offline, edit a task from another device/tab.",
        "4. Switch back to 'Online'.",
        "5. Verify that the app detects reconnection and instantly pulls the missed edits.",
      ],
      expected: "The application resynchronizes seamlessly with zero manual refreshes.",
    },
    challenge: {
      title: "Implement Fallback HTTP Polling on Persistent WS Failure",
      description:
        "If the WebSocket connection fails 5 times consecutively (e.g. corporate firewall blocking wss://), automatically activate `refetchInterval: 10000` on TanStack Query.",
      hints: [
        "Pass `refetchInterval: isConnected ? false : 10000` into `useTasks` hook.",
      ],
      solution: `const { isConnected } = useRealtimeConnectionStatus(workspaceId);\nreturn useQuery({\n  queryKey: taskKeys.list(workspaceId),\n  queryFn: () => tasksApi.list({ workspaceId }),\n  refetchInterval: isConnected ? false : 10000,\n});`,
    },
    quiz: [
      {
        question: "Why must query caches be invalidated immediately upon WebSocket reconnection?",
        options: [
          "To fetch any database mutations that occurred while the client was disconnected",
          "To delete the user's password",
          "To reset the browser window size",
          "To re-render CSS stylesheets",
        ],
        answer: 0,
        explanation: "Reconnection invalidation guarantees no updates are missed during the offline window.",
      },
      {
        question: "What is Exponential Backoff with Jitter in network reconnects?",
        options: [
          "Increasing the wait time between retry attempts (1s, 2s, 4s, 8s) and adding a random millisecond offset to prevent millions of clients from hitting the server at the exact same microsecond",
          "A CSS animation curve",
          "A type of database index",
          "A password hashing algorithm",
        ],
        answer: 0,
        explanation: "Exponential backoff with jitter prevents Thundering Herd server crashes after network outages.",
      },
    ],
    flashcards: [
      {
        front: "What is a Thundering Herd problem?",
        back: "When thousands of disconnected clients all attempt to reconnect and query the server at the exact same millisecond.",
      },
      {
        front: "What is a Heartbeat Ping?",
        back: "A periodic probe message sent across a socket to verify that the underlying TCP connection is still alive.",
      },
    ],
    recap: [
      "Detect silent disconnections with heartbeat monitors.",
      "Use exponential backoff with jitter for socket reconnects.",
      "Always invalidate query cache upon reconnect to bridge missed events.",
      "Gracefully fall back to HTTP polling when WebSockets are blocked.",
    ],
    references: [
      { label: "Exponential Backoff and Jitter (AWS Architecture)", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter" },
    ],
    nextBridge: "Phase 24 is complete! All Full-Stack Developer Stage phases (P19 through P24) are now fully implemented and verified.",
  },
];

export const LESSON_CONTENT_P24: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P24.map((l) => [l.id, l])
);
