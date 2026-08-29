import type { LessonContent } from "./types";

/**
 * Pass 021 bounded content batch: Phase 8 Next.js Foundations (L4–L6).
 * Phase 8: Next.js Foundations is now 100% complete!
 * Every lesson fulfills the full quality contract. No placeholders.
 */
export const LESSONS_P8B: LessonContent[] = [
  {
    id: "p08-l4",
    phaseId: "p08",
    title: "Server Components vs Client Components",
    level: "Frontend Developer",
    minutes: 40,
    summary:
      "React Server Components (RSC) fundamentally redefine the relationship between server compute and client interactivity. This lesson teaches the RSC mental model: how `'use client'` marks an entry point to the client module graph rather than a file-level execution switch, what props can cross the serialization boundary, how to pass Server Components as children to Client Components, and how RSC eliminates megabytes of client JavaScript.",
    prerequisites: [
      "p08-l1 — App Router project & file conventions",
      "p04-l2 — React components, props & children composition",
      "p07-l1 — HTTP request/response stream and payloads",
    ],
    objectives: [
      "Articulate the architectural difference between React Server Components (RSC) and Client Components.",
      "Explain what `'use client'` actually does: it defines the boundary where modules are bundled for the browser.",
      "Apply the 'Server-first' composition pattern: push Client Components to the leaf nodes of the UI tree.",
      "Pass Server Components as `{ children }` into Client Components to avoid forcing the entire subtree into the client bundle.",
      "Identify non-serializable props (functions, class instances, symbols) that cannot cross the server-to-client serialization wire.",
      "Inspect the React Flight Wire protocol and quantify client bundle size savings.",
    ],
    simple:
      "Imagine ordering a wooden dining table from an online store. A 'Client Component' is like receiving flat-packed wood, screws, tools, and a 40-page instruction manual that you have to assemble in your living room (the browser downloads all the heavy JavaScript and builds the UI). A 'Server Component' is like having the table fully built and polished at the factory and delivered directly into your dining room ready to use (0 KB of tools or instructions needed in your browser).",
    why:
      "Before RSC, React single-page applications suffered from severe bundle bloat: markdown parsers, syntax highlighters, date formatting libraries, and heavy API clients were all downloaded by every mobile phone visiting your website. RSC allows heavy computation to execute exclusively on the server, sending lightweight HTML and typed JSON data streams.",
    mentalModel: {
      title: "The Bakery Kitchen and the Customer Table",
      body: "Think of your app as a French bakery. The kitchen in the back is the Server Component realm: it has industrial ovens, bags of flour (heavy npm libraries), and secret family recipe books (database credentials). The customer sitting in the dining room is the Client Component realm: they only need a plate, a fork, and the finished croissant. You don't bring the 500-degree oven or the 50-pound bag of flour to the customer's table; you bake the croissant in the kitchen and serve only the finished pastry.",
    },
    sections: [
      {
        heading: "The Server-first mental model and 'use client' boundary",
        body: [
          "In Next.js App Router, every component is a React Server Component (RSC) by default. Server Components run ONLY on the server during request time (or build time). They never execute in the browser.",
          "Because Server Components never run in the browser, they cannot use browser-only APIs (`window`, `localStorage`, `document`) and cannot use interactive React hooks (`useState`, `useEffect`, `useReducer`, `useRef`).",
          "When you need interactivity (click handlers, state, event listeners), you add `'use client'` at the top of the file. `'use client'` is NOT a directive that says 'this code only runs on the client'; it is a marker that says 'this file is the entry point boundary where modules and their dependencies must be packaged into the client JavaScript bundle'.",
        ],
        code: [
          {
            file: "rsc-decision-matrix.txt",
            lang: "text",
            code: [
              "+------------------------------------------+------------------+------------------+",
              "| Capability / Requirement                 | Server Component | Client Component |",
              "+------------------------------------------+------------------+------------------+",
              "| Fetch data directly from DB / backend    | YES (Fast, 0 KB) | NO (Exposes DB)  |",
              "| Keep secret API keys / tokens secure     | YES (Secure)     | NO (Leaks to JS) |",
              "| Use heavy npm packages (date-fns, marked)| YES (0 KB JS)    | NO (Bloats JS)   |",
              "| Use useState, useReducer, useEffect      | NO               | YES              |",
              "| Attach onClick, onChange event listeners | NO               | YES              |",
              "| Access browser APIs (localStorage, geo)  | NO               | YES              |",
              "+------------------------------------------+------------------+------------------+",
            ].join("\n"),
          },
        ],
        demo: "rsc-wire",
      },
      {
        heading: "The Composition Pattern: Server Components as Children",
        body: [
          "A major misconception is that importing a Server Component inside a Client Component keeps it a Server Component. If you directly import and render `<ServerComponent />` inside a file with `'use client'`, it will be compiled into the client bundle!",
          "To render a Server Component inside a Client Component without converting it, use the Composition Pattern: pass the Server Component as a `{ children }` prop or slot into the Client Component container.",
        ],
        code: [
          {
            file: "components/ClientModal.tsx — accepting Server Component children",
            lang: "tsx",
            code: [
              "'use client';",
              "",
              "import { useState } from 'react';",
              "",
              "export function InteractiveModal({ children }: { children: React.ReactNode }) {",
              "  const [isOpen, setIsOpen] = useState(false);",
              "",
              "  return (",
              "    <div>",
              "      <button onClick={() => setIsOpen(true)} className=\"btn btn-primary\">",
              "        Open Project Details",
              "      </button>",
              "",
              "      {isOpen && (",
              "        <div className=\"modal-overlay\">",
              "          <div className=\"modal-card\">",
              "            <button onClick={() => setIsOpen(false)}>Close</button>",
              "            {/* children was rendered on the SERVER with 0 KB client JS! */}",
              "            {children}",
              "          </div>",
              "        </div>",
              "      )}",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
          {
            file: "app/projects/page.tsx — wiring server child into client modal",
            lang: "tsx",
            code: [
              "import { InteractiveModal } from '@/components/ClientModal';",
              "import { HeavyDatabaseReport } from '@/components/HeavyDatabaseReport';",
              "",
              "export default async function ProjectsPage() {",
              "  return (",
              "    <div>",
              "      <h1>Projects Dashboard</h1>",
              "      <InteractiveModal>",
              "        {/* HeavyDatabaseReport executes on the server and streams pure HTML */}",
              "        <HeavyDatabaseReport />",
              "      </InteractiveModal>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "The Serialization Wire Boundary & Flight Protocol",
        body: [
          "When a Server Component passes props to a Client Component, those props must be serializable across the network via JSON-compatible Flight format.",
          "Allowed prop types: strings, numbers, booleans, arrays, plain objects, null, undefined, BigInt, Date objects, Map/Set instances, and React JSX elements.",
          "FORBIDDEN prop types: JavaScript functions (e.g. `onClick={() => ...}`), class instances with methods, or symbols. Functions cannot be serialized over the HTTP wire into the client bundle.",
        ],
        code: [
          {
            file: "serialization-rules.ts",
            lang: "ts",
            code: [
              "// VALID PROPS (Can cross the Server -> Client boundary):",
              "<ClientCard",
              "  id=\"task-101\"",
              "  count={42}",
              "  createdAt={new Date()}",
              "  metadata={{ tags: [\"urgent\", \"frontend\"] }}",
              "  headerSlot={<ServerBadge />} // JSX elements are serializable Flight references!",
              "/>",
              "",
              "// INVALID PROPS (Will throw runtime serialization error):",
              "<ClientCard",
              "  // ERROR: Functions cannot be passed from Server Component to Client Component:",
              "  onDelete={(id) => db.tasks.delete(id)}",
              "/>",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Placing 'use client' at the top of every file out of habit",
      wrong: "Putting 'use client' at the top of layout.tsx, page.tsx, and every child component.",
      right: "Keeping layout.tsx and page.tsx as Server Components; extracting only interactive buttons/inputs into small 'use client' leaf components.",
      explain:
        "Making everything a Client Component destroys the performance benefits of Next.js, sending large JavaScript bundles to the browser and preventing direct database or server-side API access.",
    },
    tryIt: [
      "Open the interactive React Server Components Wire Lab above.",
      "Compare the Client-Only architecture vs RSC architecture bundle size.",
      "Inspect the React Flight payload stream and verify how Server Components render zero bytes of client JS.",
      "Practice passing a Server Component as a child prop into a Client Component modal.",
    ],
    challenge: {
      prompt:
        "Refactor an e-commerce product card: keep the heavy markdown product description on the Server, while isolating the interactive 'Add to Cart' button with optimistic count state as a leaf Client Component.",
      hints: [
        "Create `AddToCartButton.tsx` with `'use client'` containing `useState` and `onClick`.",
        "Create `ProductCard.tsx` as an async Server Component that renders the description and mounts `<AddToCartButton productId={product.id} />`.",
      ],
      solution: [
        "// 1. components/AddToCartButton.tsx",
        "'use client';",
        "",
        "import { useState } from 'react';",
        "",
        "export function AddToCartButton({ productId }: { productId: string }) {",
        "  const [added, setAdded] = useState(false);",
        "",
        "  return (",
        "    <button",
        "      onClick={() => setAdded(true)}",
        "      className=\"btn btn-primary text-sm px-4 py-2 bg-brand-ink text-white rounded\"",
        "    >",
        "      {added ? 'Added to Cart ✓' : 'Add to Cart'}",
        "    </button>",
        "  );",
        "}",
        "",
        "// 2. app/products/[id]/page.tsx (Server Component)",
        "import { AddToCartButton } from '@/components/AddToCartButton';",
        "",
        "export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {",
        "  const { id } = await params;",
        "  const product = await fetch(`https://api.example.com/products/${id}`).then((r) => r.json());",
        "",
        "  return (",
        "    <div className=\"p-6 max-w-xl border rounded-lg\">",
        "      <h1 className=\"text-2xl font-bold\">{product.name}</h1>",
        "      <p className=\"text-neutral-600 my-4\">{product.description}</p>",
        "      <AddToCartButton productId={product.id} />",
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What does the `'use client'` directive at the top of a file indicate in Next.js?",
        options: [
          "The file should only be compiled for mobile devices",
          "The file marks an entry point to the client module boundary, bundling it and its imported children for the browser",
          "The file disables TypeScript strict mode",
          "The file runs in a Web Worker thread",
        ],
        answer: 1,
        explain:
          "`'use client'` defines the boundary between the server-only module graph and the client JavaScript bundle.",
      },
      {
        q: "Which of the following can a Server Component do that a Client Component cannot?",
        options: [
          "Use the `useState` hook",
          "Directly query the database or access server-only environment variables without exposing credentials",
          "Attach an `onClick` event handler",
          "Read `localStorage`",
        ],
        answer: 1,
        explain:
          "Server Components execute strictly on the Node.js backend, allowing direct database access and zero secret leakage.",
      },
      {
        q: "Which prop CANNOT be passed from a Server Component to a Client Component?",
        options: [
          "A plain JavaScript object `{ title: 'Task' }`",
          "A number `42`",
          "A callback function `(e) => handleClick(e)`",
          "A React JSX element `<Badge />`",
        ],
        answer: 2,
        explain:
          "Functions cannot be serialized across the network boundary between server and client in the React Flight protocol.",
      },
      {
        q: "How can you render a Server Component inside a Client Component without converting the Server Component into a client bundle?",
        options: [
          "Import it with `dynamic()`",
          "Pass the Server Component as `{ children }` into the Client Component",
          "Use `eval()`",
          "Rename the file to `.server.tsx`",
        ],
        answer: 1,
        explain:
          "Passing the Server Component as a child prop allows the server to pre-render it to HTML/Flight before passing it into the client container.",
      },
      {
        q: "What is the client bundle size impact of a 500 KB npm library imported inside a Server Component?",
        options: [
          "500 KB added to the client bundle",
          "0 KB added to the client bundle (it executes purely on the server)",
          "250 KB after gzip",
          "It throws a compile error",
        ],
        answer: 1,
        explain:
          "Server Component dependencies remain on the server; zero kilobytes of the library's code are sent to the client browser.",
      },
      {
        q: "Can a Client Component import a Server Component directly via `import { ServerComp } from './ServerComp'`?",
        options: [
          "Yes, and it remains a Server Component",
          "No, importing it inside a 'use client' file forces that component to become part of the client bundle",
          "Yes, Next.js executes it via WebSockets",
          "Only in production builds",
        ],
        answer: 1,
        explain:
          "Directly importing a component inside a `'use client'` file brings it into the client module graph, bundling it for the browser.",
      },
    ],
    flashcards: [
      {
        front: "What is the primary benefit of React Server Components (RSC)?",
        back: "Zero client-side bundle size for server dependencies, instant server rendering, and secure direct access to backend databases.",
      },
      {
        front: "What is the purpose of the `'use client'` directive?",
        back: "It marks the boundary where the component and its subtree are packaged into the client-side JavaScript bundle for browser interactivity.",
      },
      {
        front: "Can Server Components use `useState` or `useEffect`?",
        back: "No. Server Components execute only once on the server and do not participate in client-side React lifecycle or hooks.",
      },
      {
        front: "How do you pass a Server Component to a Client Component without converting it to client JS?",
        back: "Pass it as a `{ children }` prop or slot from a parent Server Component.",
      },
      {
        front: "Why can't functions be passed as props across the RSC boundary?",
        back: "Props crossing from Server to Client must be serializable over HTTP (React Flight wire protocol); functions cannot be serialized into JSON/Flight.",
      },
      {
        front: "What is the React Flight protocol?",
        back: "The compact streaming format used by React to transmit the virtual DOM tree of Server Components to the browser.",
      },
      {
        front: "Where should Client Components be placed in your component hierarchy?",
        back: "At the leaf nodes of the UI tree, keeping layouts and data-heavy pages as Server Components.",
      },
      {
        front: "Can a Server Component be an `async` function?",
        back: "Yes! React Server Components natively support `async/await` for direct data fetching.",
      },
    ],
    recap: [
      "App Router components are Server Components by default, offering 0 KB client bundle size.",
      "`'use client'` marks the boundary for client bundle generation when interactivity (state, hooks, events) is needed.",
      "Push Client Components to leaf nodes and use the `{ children }` composition pattern for nested Server Components.",
      "Props crossing the server-to-client boundary must be serializable in the React Flight format (no functions or methods).",
    ],
    references: [
      { label: "Next.js Documentation — Server and Client Components", url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components" },
      { label: "React RFC — Server Components", url: "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md" },
    ],
    nextBridge:
      "With component boundaries clear, P08-L5 dives into Next.js caching architecture: Request Memoization, Data Cache, Full Route Cache, and on-demand revalidation.",
  },
  {
    id: "p08-l5",
    phaseId: "p08",
    title: "Data Fetching, Caching & Revalidation (Current)",
    level: "Frontend Developer",
    minutes: 40,
    summary:
      "Next.js features a multi-tiered caching engine designed to make full-stack web applications blazing fast. This lesson breaks down the 4 distinct caching layers: Request Memoization (per-render deduplication), Data Cache (persistent cross-request fetch cache), Full Route Cache (static HTML/RSC snapshots), and Router Cache (in-memory client navigation cache), along with on-demand cache busting via `revalidatePath()` and `revalidateTag()`.",
    prerequisites: [
      "p08-l4 — Server Components vs Client Components",
      "p07-l1 — HTTP request/response & caching headers",
      "p07-l5 — REST conventions and query parameters",
    ],
    objectives: [
      "Distinguish the four caching mechanisms in Next.js: Request Memoization, Data Cache, Full Route Cache, and Router Cache.",
      "Control fetch caching with `{ cache: 'force-cache' }`, `{ cache: 'no-store' }`, and `{ next: { revalidate: 60 } }`.",
      "Apply tag-based caching with `{ next: { tags: ['projects'] } }` for granular cache invalidation.",
      "Trigger on-demand server revalidation using `revalidatePath()` and `revalidateTag()` in Server Actions or Route Handlers.",
      "Explain the difference between Static Rendering (at build time) and Dynamic Rendering (at request time).",
    ],
    simple:
      "Imagine four assistants helping you run a restaurant: Assistant 1 (Request Memoization) remembers if two waiters asked for the exact same wine bottle during the same dinner order and only goes to the cellar once. Assistant 2 (Data Cache) keeps popular appetizers pre-made in the fridge so you don't cook them from scratch for every customer. Assistant 3 (Full Route Cache) prints out the daily menu ahead of time. Assistant 4 (Router Cache) keeps a copy of the menu on the waiter's tablet. When you change the menu, you call `revalidateTag('menu')` to tell all assistants to throw out the old copies and fetch fresh ingredients.",
    why:
      "Without caching, your database and upstream APIs get bombarded with identical queries on every single page load, creating massive server costs and slow loading times. Next.js caching makes applications instantaneous, but requires disciplined knowledge of how and when to bust caches so users never see stale data after creating or updating records.",
    mentalModel: {
      title: "The Four-Tier Acceleration Pipeline",
      body: "Think of Next.js caching as a 4-tier pipeline: Tier 1 (Request Memoization) lives inside a single server render tick. Tier 2 (Data Cache) lives across all server requests in persistent storage. Tier 3 (Full Route Cache) stores pre-computed HTML/RSC on the server. Tier 4 (Router Cache) lives in the user's browser memory during their session. When a mutation occurs, `revalidatePath()` or `revalidateTag()` purges Tier 2 and Tier 3 so the next request gets fresh data.",
    },
    sections: [
      {
        heading: "The 4 caching layers of Next.js",
        body: [
          "Next.js operates four distinct caching layers with specific lifecycles:",
          "1. Request Memoization: Deduplicates identical `fetch` requests with the same URL and options within a single render pass on the server (Lifecycle: single request).",
          "2. Data Cache: Persists fetch results across incoming user requests and deployments on the server (Lifecycle: persistent until revalidated).",
          "3. Full Route Cache: Stores HTML and RSC payload for statically generated routes on the server (Lifecycle: persistent until revalidated).",
          "4. Router Cache: In-memory client-side cache of RSC payloads inside the browser during user session navigation (Lifecycle: session / 30-300s).",
        ],
        code: [
          {
            file: "cache-matrix.txt",
            lang: "text",
            code: [
              "+---------------------+--------------------+--------------------+--------------------+",
              "| Caching Layer       | Where It Lives     | Purpose            | Invalidation       |",
              "+---------------------+--------------------+--------------------+--------------------+",
              "| Request Memoization | Server (RAM)       | Deduplicate fetch  | Auto per request   |",
              "| Data Cache          | Server (Disk/Store)| Persist API data   | revalidateTag/Time |",
              "| Full Route Cache    | Server (Disk/CDN)  | Static HTML / RSC  | Rebuild / revalid  |",
              "| Router Cache        | Browser (RAM)      | Fast back/forward  | router.refresh()   |",
              "+---------------------+--------------------+--------------------+--------------------+",
            ].join("\n"),
          },
        ],
        demo: "next-cache-matrix",
      },
      {
        heading: "Fetch caching configuration options",
        body: [
          "In Next.js Server Components, the native `fetch` API is extended with caching configurations:",
          "• Default / Force Cache: `fetch(url, { cache: 'force-cache' })` caches the response indefinitely in the Data Cache.",
          "• Dynamic / No Store: `fetch(url, { cache: 'no-store' })` fetches fresh data on every incoming request, making the route dynamically rendered.",
          "• Time-based Revalidation (ISR): `fetch(url, { next: { revalidate: 3600 } })` caches data for 1 hour, then serves stale data while fetching fresh data in the background (stale-while-revalidate).",
          "• Tag-based Revalidation: `fetch(url, { next: { tags: ['tasks'] } })` tags the cache entry for targeted on-demand purging.",
        ],
        code: [
          {
            file: "lib/api.ts — fetch cache patterns",
            lang: "ts",
            code: [
              "// 1. Static Cache (Indefinite)",
              "export async function getGlobalSettings() {",
              "  const res = await fetch('https://api.example.com/settings', {",
              "    cache: 'force-cache',",
              "  });",
              "  return res.json();",
              "}",
              "",
              "// 2. Real-Time Dynamic (No Cache)",
              "export async function getLiveStockPrice(symbol: string) {",
              "  const res = await fetch(`https://api.example.com/stocks/${symbol}`, {",
              "    cache: 'no-store',",
              "  });",
              "  return res.json();",
              "}",
              "",
              "// 3. Tagged Cache for On-Demand Busting",
              "export async function getProjectTasks(projectId: string) {",
              "  const res = await fetch(`https://api.example.com/projects/${projectId}/tasks`, {",
              "    next: { tags: [`project-${projectId}`, 'tasks'] },",
              "  });",
              "  return res.json();",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "On-demand revalidation with revalidatePath & revalidateTag",
        body: [
          "When a user creates, edits, or deletes data (e.g. creating a new task), you must bust the stale cache immediately so the UI reflects the change.",
          "In Next.js, call `revalidatePath('/dashboard/tasks')` to purge all cached data for a specific URL path.",
          "Alternatively, call `revalidateTag('tasks')` to purge every cached query tagged with `'tasks'` across your entire application.",
        ],
        code: [
          {
            file: "app/actions/task-actions.ts — revalidation in Server Action",
            lang: "ts",
            code: [
              "'use server';",
              "",
              "import { revalidateTag, revalidatePath } from 'next/cache';",
              "",
              "export async function createTaskAction(formData: FormData) {",
              "  const title = formData.get('title') as string;",
              "  const projectId = formData.get('projectId') as string;",
              "",
              "  // Mutate database via Fastify API or Prisma:",
              "  await fetch('https://api.example.com/tasks', {",
              "    method: 'POST',",
              "    body: JSON.stringify({ title, projectId }),",
              "  });",
              "",
              "  // Purge the tagged cache entries across the server:",
              "  revalidateTag(`project-${projectId}`);",
              "  revalidatePath('/dashboard');",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Forgetting to revalidate after mutating database state",
      wrong: "Mutates database in a Server Action -> redirects to /dashboard without calling revalidatePath() or revalidateTag().",
      right: "Mutates database -> calls revalidateTag('tasks') or revalidatePath('/dashboard') -> redirects to /dashboard.",
      explain:
        "If you do not call revalidatePath or revalidateTag, Next.js will continue serving the cached static HTML and data snapshot, causing the user to think their creation or update failed.",
    },
    tryIt: [
      "Open the interactive Next.js 4-Tier Cache Matrix lab above.",
      "Trigger fetch requests and observe which cache tier answers the query.",
      "Simulate a database mutation and click 'revalidateTag('tasks')' — watch the Data Cache and Full Route Cache reset to fresh state.",
      "Switch between Static and Dynamic route rendering modes.",
    ],
    challenge: {
      prompt:
        "Write an API webhook route handler `app/api/revalidate/route.ts` that verifies a secret bearer token and calls `revalidateTag(tag)` on-demand.",
      hints: [
        "Read the `Authorization` header or query string `?secret=...`.",
        "Compare with `process.env.REVALIDATION_SECRET`.",
        "Call `revalidateTag(tag)` and return `{ revalidated: true, now: Date.now() }`.",
      ],
      solution: [
        "import { NextRequest, NextResponse } from 'next/server';",
        "import { revalidateTag } from 'next/cache';",
        "",
        "export async function POST(request: NextRequest) {",
        "  const secret = request.nextUrl.searchParams.get('secret');",
        "  const tag = request.nextUrl.searchParams.get('tag');",
        "",
        "  if (secret !== process.env.REVALIDATION_SECRET) {",
        "    return NextResponse.json({ message: 'Invalid revalidation secret token' }, { status: 401 });",
        "  }",
        "",
        "  if (!tag) {",
        "    return NextResponse.json({ message: 'Missing tag parameter' }, { status: 400 });",
        "  }",
        "",
        "  revalidateTag(tag);",
        "  return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Which Next.js caching layer deduplicates identical `fetch` calls made within a single render pass on the server?",
        options: [
          "Data Cache",
          "Request Memoization",
          "Router Cache",
          "Full Route Cache",
        ],
        answer: 1,
        explain:
          "Request Memoization automatically deduplicates identical GET requests (same URL and options) across the component tree during a single render pass.",
      },
      {
        q: "How do you configure a `fetch` call to never cache and always execute dynamically on every request?",
        options: [
          "fetch(url, { cache: 'no-store' })",
          "fetch(url, { reload: true })",
          "fetch(url, { sync: true })",
          "fetch(url, { dynamic: true })",
        ],
        answer: 0,
        explain:
          "`{ cache: 'no-store' }` tells Next.js to skip the Data Cache and execute a fresh network request on every incoming user request.",
      },
      {
        q: "What function from `next/cache` is used to purge all cached fetch requests associated with a specific tag identifier?",
        options: [
          "clearCache()",
          "revalidateTag(tag)",
          "deleteTag(tag)",
          "purgeTag(tag)",
        ],
        answer: 1,
        explain:
          "`revalidateTag(tag)` purges all cached fetch data associated with that tag in the Next.js Data Cache.",
      },
      {
        q: "Where does the Next.js Router Cache reside?",
        options: [
          "In the PostgreSQL database",
          "In the browser's in-memory React state during a user session",
          "On the edge CDN server",
          "In the local storage of the server",
        ],
        answer: 1,
        explain:
          "The Router Cache lives in the client browser's memory, storing visited and prefetched route segments for instant back/forward navigation.",
      },
      {
        q: "What happens when a route uses `export const dynamic = 'force-dynamic'`?",
        options: [
          "It disables JavaScript on the client",
          "It skips the Full Route Cache and renders the page dynamically on every incoming request",
          "It compiles the app with WebAssembly",
          "It enables HTTP/3 protocol",
        ],
        answer: 1,
        explain:
          "`force-dynamic` forces the route to render dynamically on the server for each request, bypassing static pre-rendering.",
      },
      {
        q: "What is time-based Incremental Static Regeneration (ISR) syntax in Next.js fetch?",
        options: [
          "fetch(url, { interval: 60 })",
          "fetch(url, { next: { revalidate: 60 } })",
          "fetch(url, { cache: 'isr-60' })",
          "fetch(url, { timer: 60 })",
        ],
        answer: 1,
        explain:
          "`{ next: { revalidate: 60 } }` caches data for 60 seconds and then asynchronously revalidates it on subsequent requests.",
      },
    ],
    flashcards: [
      {
        front: "What are the 4 caching tiers in Next.js App Router?",
        back: "1. Request Memoization (per-render RAM), 2. Data Cache (server fetch persistence), 3. Full Route Cache (static HTML/RSC snapshot), 4. Router Cache (browser session RAM).",
      },
      {
        front: "How do you opt out of the Data Cache for a specific `fetch` call?",
        back: "Pass `{ cache: 'no-store' }` in the fetch options.",
      },
      {
        front: "What is tag-based cache revalidation in Next.js?",
        back: "Attaching tags via `{ next: { tags: ['tasks'] } }` to fetch calls, then purging them on-demand via `revalidateTag('tasks')`.",
      },
      {
        front: "What is the difference between `revalidatePath` and `revalidateTag`?",
        back: "`revalidatePath` purges cache for a specific URL pathname; `revalidateTag` purges every query associated with that tag across all pages.",
      },
      {
        front: "How does Request Memoization differ from Data Cache?",
        back: "Request Memoization lasts only for the duration of a single incoming request render pass; Data Cache persists across requests and users.",
      },
      {
        front: "What is Incremental Static Regeneration (ISR)?",
        back: "A caching strategy where static pages are served instantly from cache and re-generated in the background when a specified revalidate time window expires.",
      },
      {
        front: "How do cookies or headers in a page affect Next.js caching?",
        back: "Reading `cookies()` or `headers()` makes the route dynamic at request time, opting out of the Full Route Cache.",
      },
      {
        front: "How can client components invalidate the client Router Cache?",
        back: "By calling `router.refresh()` from `next/navigation`.",
      },
    ],
    recap: [
      "Next.js multi-tiered caching encompasses Request Memoization, Data Cache, Full Route Cache, and Router Cache.",
      "Fetch caching is controlled via `force-cache`, `no-store`, and `{ next: { revalidate: seconds, tags: [...] } }`.",
      "Mutations in Server Actions or API routes trigger on-demand cache busting via `revalidatePath()` and `revalidateTag()`.",
      "Static routes offer maximum speed; dynamic routes handle personalized, real-time user data.",
    ],
    references: [
      { label: "Next.js Documentation — Caching in Next.js", url: "https://nextjs.org/docs/app/building-your-application/caching" },
      { label: "Next.js Documentation — Data Fetching and Revalidating", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating" },
    ],
    nextBridge:
      "In the final lesson of Phase 8 (P08-L6), you will learn production build optimization, standalone output mode, Docker containerization, and deployment against mock backend APIs.",
  },
  {
    id: "p08-l6",
    phaseId: "p08",
    title: "Production Build & Deploy Against a Mock API",
    level: "Frontend Developer",
    minutes: 40,
    summary:
      "A completed frontend application is useless until it successfully compiles, containerizes, and runs reliably in production. This capstone lesson walks through the `npm run build` process: deciphering static (`○`) vs dynamic (`λ`) route output symbols, configuring `output: 'standalone'` in `next.config.mjs` for minimal Docker containers, configuring health checks, and integrating your Next.js frontend with backend Fastify/NestJS APIs.",
    prerequisites: [
      "p08-l1 — App Router project structure",
      "p08-l4 — Server vs Client component boundaries",
      "p08-l5 — Data fetching, caching & revalidation",
      "p07-l6 — Layer failure diagnostics",
    ],
    objectives: [
      "Execute `npm run build` and interpret the build log route breakdown symbols (`○` Static, `λ` Dynamic, `ƒ` Middleware).",
      "Configure `output: 'standalone'` in `next.config.mjs` to generate a self-contained production bundle with 80%+ smaller Docker image size.",
      "Author a multi-stage `Dockerfile` optimized for Next.js with non-root security privileges.",
      "Wire API environment variables (`API_INTERNAL_URL` for server-side RSC vs `NEXT_PUBLIC_API_URL` for client browser fetch).",
      "Implement a robust health check route `app/api/health/route.ts` for container orchestration (Kubernetes / Cloud Run).",
    ],
    simple:
      "When building a sports car, you don't ship the factory machines, welding torches, and spare steel to the customer — you deliver only the sleek finished car with its engine. Running `npm run build` with `output: 'standalone'` strips away all development tools, compilers, and unused node modules, leaving a tiny, secure, ultra-fast container image ready to deploy to the cloud in seconds.",
    why:
      "In enterprise environments, deployment pipelines fail when developers misunderstand build-time vs runtime execution. If a Server Component attempts to fetch from a database that doesn't exist during `next build`, the static build crashes. Mastering standalone configuration, route classification, and dual internal/external API routing ensures flawless continuous deployment.",
    mentalModel: {
      title: "The Multi-Stage Shipping Container",
      body: "Think of Docker deployment as a 3-stage assembly line: Stage 1 (Deps) downloads all raw materials. Stage 2 (Builder) compiles TypeScript, bundles React, and renders static pages. Stage 3 (Runner) throws away the heavy build tools and copies ONLY the compiled standalone server into a featherlight shipping container. The resulting image boots in milliseconds and uses minimal memory.",
    },
    sections: [
      {
        heading: "Interpreting the Next.js Build Output Matrix",
        body: [
          "When you execute `npm run build`, Next.js compiles the application and prints a route classification matrix:",
          "• `○ (Static)`: Prerendered as static HTML + JSON at build time. Ideal for landing pages, blogs, and public documentation.",
          "• `λ (Dynamic)`: Rendered on-demand on the server for each incoming request (triggered by dynamic functions like `cookies()`, `headers()`, or `no-store` fetches).",
          "• `ƒ (Middleware)`: Edge middleware running on incoming requests before routing.",
          "• First Load JS: Total JavaScript downloaded by the browser on initial page visit. Keep this under 100 KB for optimal Core Web Vitals.",
        ],
        code: [
          {
            file: "build-output-example.txt",
            lang: "text",
            code: [
              "Route (app)                              Size     First Load JS",
              "┌ ○ /                                    5.4 kB         87.2 kB",
              "├ ○ /_not-found                          871 B          82.6 kB",
              "├ ○ /about                               2.1 kB         83.9 kB",
              "├ λ /api/health                          0 B                0 B",
              "├ λ /dashboard                           4.2 kB         96.1 kB",
              "└ λ /projects/[id]                       3.8 kB         95.7 kB",
              "+ First Load JS shared by all            81.8 kB",
              "  ├ chunks/184-789a2b8e7.js              54.2 kB",
              "  ├ chunks/main-app-9812a.js             25.4 kB",
              "  └ other shared chunks (total)          2.2 kB",
              "",
              "○  (Static)   prerendered as static content",
              "λ  (Dynamic)  server-rendered on demand using Node.js runtime",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Configuring output: 'standalone' in next.config.mjs",
        body: [
          "By default, running a Next.js server in production requires copying the entire `node_modules` directory (often 500MB+).",
          "Setting `output: 'standalone'` in `next.config.mjs` instructs Next.js to trace all file dependencies and copy only the necessary files into `.next/standalone`, reducing your Docker container size to under 100MB.",
        ],
        code: [
          {
            file: "next.config.mjs — standalone output configuration",
            lang: "js",
            code: [
              "/** @type {import('next').NextConfig} */",
              "const nextConfig = {",
              "  output: 'standalone',",
              "  reactStrictMode: true,",
              "  poweredByHeader: false, // Security: remove X-Powered-By: Next.js",
              "  eslint: {",
              "    ignoreDuringBuilds: false,",
              "  },",
              "  typescript: {",
              "    ignoreBuildErrors: false,",
              "  },",
              "};",
              "",
              "export default nextConfig;",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Multi-stage production Dockerfile",
        body: [
          "A production Dockerfile uses a 3-stage build: `base` (alpine node), `builder` (compiles next app), and `runner` (runs standalone server as non-root `nextjs` user for security).",
        ],
        code: [
          {
            file: "Dockerfile — enterprise Next.js standalone container",
            lang: "text",
            code: [
              "FROM node:20-alpine AS base",
              "WORKDIR /app",
              "RUN apk add --no-cache libc6-compat",
              "",
              "# Step 1: Install dependencies",
              "FROM base AS deps",
              "COPY package.json package-lock.json ./",
              "RUN npm ci",
              "",
              "# Step 2: Build the application",
              "FROM base AS builder",
              "COPY --from=deps /app/node_modules ./node_modules",
              "COPY . .",
              "ENV NEXT_TELEMETRY_DISABLED=1",
              "ENV NODE_ENV=production",
              "RUN npm run build",
              "",
              "# Step 3: Minimal production runner",
              "FROM base AS runner",
              "ENV NODE_ENV=production",
              "ENV NEXT_TELEMETRY_DISABLED=1",
              "ENV PORT=3000",
              "ENV HOSTNAME=\"0.0.0.0\"",
              "",
              "RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs",
              "",
              "COPY --from=builder /app/public ./public",
              "COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./",
              "COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static",
              "",
              "USER nextjs",
              "EXPOSE 3000",
              "CMD [\"node\", \"server.js\"]",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Dual API Routing: Internal Docker Network vs Public Client",
        body: [
          "In full-stack architectures (Browser → Next.js → NestJS API), network paths differ depending on where code executes:",
          "• Server Components (RSC): Execute inside the Docker container and can communicate directly over the fast internal Docker network (`http://backend-api:4000/api/v1`).",
          "• Client Components: Execute in the user's browser and must route through the public domain (`https://api.myapp.com/api/v1`).",
          "Declare two environment variables: `API_INTERNAL_URL` (server-only) and `NEXT_PUBLIC_API_URL` (public browser).",
        ],
        code: [
          {
            file: "lib/api-client.ts — dual internal/external routing",
            lang: "ts",
            code: [
              "export function getBaseApiUrl(): string {",
              "  // If running on Server (Node.js runtime), use fast internal Docker DNS:",
              "  if (typeof window === 'undefined') {",
              "    return process.env.API_INTERNAL_URL || 'http://localhost:4000';",
              "  }",
              "  // If running in browser, use public HTTPS endpoint:",
              "  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';",
              "}",
              "",
              "export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {",
              "  const baseUrl = getBaseApiUrl();",
              "  const res = await fetch(`${baseUrl}${path}`, init);",
              "  if (!res.ok) throw new Error(`API error: ${res.status}`);",
              "  return res.json();",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Hardcoding localhost URLs in Server Component fetches for Docker deployment",
      wrong: "const res = await fetch('http://localhost:4000/api/tasks'); // Inside a Docker container, localhost refers to the container itself, NOT the backend!",
      right: "const res = await fetch(`${process.env.API_INTERNAL_URL}/api/tasks`); // Uses Docker service DNS e.g. http://api-service:4000",
      explain:
        "Inside Docker containers, 'localhost' points to the container's own isolated loopback interface. Connecting to sibling containers requires using environment variables with Docker service names.",
    },
    tryIt: [
      "Run `npm run build` in your terminal and inspect the route classification output.",
      "Check which routes were generated as static (`○`) vs dynamic (`λ`).",
      "Add `output: 'standalone'` in `next.config.mjs` and build to verify creation of the `.next/standalone` folder.",
      "Test your container health check endpoint `GET /api/health` and verify HTTP 200 response with JSON telemetry.",
    ],
    challenge: {
      prompt:
        "Create a production-grade container health check route handler `app/api/health/route.ts` that verifies memory usage, node version, process uptime, and returns 200 OK.",
      hints: [
        "Use `process.memoryUsage()`, `process.version`, and `process.uptime()`.",
        "Export an async `GET()` handler with `NextResponse.json()`.",
        "Set `export const dynamic = 'force-dynamic'` so the health check is never statically cached.",
      ],
      solution: [
        "import { NextResponse } from 'next/server';",
        "",
        "export const dynamic = 'force-dynamic';",
        "",
        "export async function GET() {",
        "  const memory = process.memoryUsage();",
        "",
        "  return NextResponse.json(",
        "    {",
        "      status: 'healthy',",
        "      timestamp: new Date().toISOString(),",
        "      uptimeSeconds: Math.floor(process.uptime()),",
        "      nodeVersion: process.version,",
        "      memory: {",
        "        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),",
        "        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),",
        "        rssMb: Math.round(memory.rss / 1024 / 1024),",
        "      },",
        "    },",
        "    { status: 200 }",
        "  );",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What does the `λ` (lambda) symbol signify in the `npm run build` route output summary?",
        options: [
          "The route is compiled to AWS Lambda WebAssembly",
          "The route is rendered dynamically on-demand on the server for each incoming request",
          "The route failed type checking",
          "The route is a static HTML export",
        ],
        answer: 1,
        explain:
          "In Next.js build logs, `λ (Dynamic)` indicates that the route is rendered on-demand using the Node.js server runtime.",
      },
      {
        q: "What is the primary benefit of configuring `output: 'standalone'` in `next.config.mjs`?",
        options: [
          "It disables CSS compilation",
          "It creates a self-contained bundle containing only necessary node_modules, reducing Docker image size by up to 85%",
          "It forces all components to become Client Components",
          "It enables live hot-reloading in production",
        ],
        answer: 1,
        explain:
          "`output: 'standalone'` performs dependency tracing to output only required files in `.next/standalone`, drastically reducing container footprint.",
      },
      {
        q: "Why does `localhost:4000` fail when a Next.js Server Component running inside Docker tries to call a backend API running in another container?",
        options: [
          "Because Docker does not support port 4000",
          "Because inside a Docker container, `localhost` resolves to the Next.js container itself, not the sibling container",
          "Because HTTP is banned in Docker",
          "Because Next.js blocks localhost in production",
        ],
        answer: 1,
        explain:
          "Inside Docker, each container has its own network namespace. Sibling containers must be addressed using Docker Compose service names (e.g. `http://api:4000`).",
      },
      {
        q: "Why should a production Docker container run as a non-root user (e.g. `USER nextjs`)?",
        options: [
          "To speed up CSS rendering",
          "Security best practice: to prevent container breakout vulnerabilities from obtaining root host access",
          "To avoid paying cloud taxes",
          "Because Node.js cannot run as root",
        ],
        answer: 1,
        explain:
          "Running as an unprivileged non-root user prevents potential security vulnerabilities in dependencies from gaining root privileges on the container host.",
      },
      {
        q: "Why is `export const dynamic = 'force-dynamic'` applied to health check API routes?",
        options: [
          "To ensure the health check is evaluated freshly on every probe rather than cached statically at build time",
          "To enable WebSockets",
          "To bypass CORS checks",
          "To format JSON output",
        ],
        answer: 0,
        explain:
          "Health checks must report current server uptime and memory stats dynamically, so static caching must be disabled.",
      },
      {
        q: "What is the entrypoint file to run a Next.js standalone build in Docker?",
        options: ["node server.js", "npm start", "next run", "node index.js"],
        answer: 0,
        explain:
          "The `.next/standalone` folder generates a minimal standalone `server.js` file executed via `node server.js`.",
      },
    ],
    flashcards: [
      {
        front: "What do the `○` and `λ` symbols mean in `npm run build` output?",
        back: "`○` means Static (prerendered at build time); `λ` means Dynamic (server-rendered on demand per request).",
      },
      {
        front: "What does `output: 'standalone'` do in Next.js?",
        back: "It creates a minimal self-contained `.next/standalone` folder with traced dependencies, avoiding the need to copy the entire node_modules into Docker.",
      },
      {
        front: "Why do we use multi-stage builds in Docker?",
        back: "To separate dependency installation and build compilation from the final runtime image, keeping production containers lightweight and secure.",
      },
      {
        front: "How do Server Components and Client Components address backend APIs differently?",
        back: "Server Components can use internal Docker service DNS (`http://api:4000`); Client Components in the browser must use the public domain (`https://api.app.com`).",
      },
      {
        front: "What is the purpose of `poweredByHeader: false` in `next.config.mjs`?",
        back: "It disables the `X-Powered-By: Next.js` HTTP header to prevent leaking framework technology details to attackers.",
      },
      {
        front: "What is a container health check route?",
        back: "An endpoint (e.g. `/api/health`) that orchestration tools (Kubernetes/Cloud Run) probe to verify container liveness and readiness.",
      },
      {
        front: "What command starts a standalone Next.js production build?",
        back: "`node server.js` from the `.next/standalone` directory.",
      },
      {
        front: "What is First Load JS in Next.js build stats?",
        back: "The total size of JavaScript chunks that the client browser must download when landing on a given page.",
      },
    ],
    recap: [
      "`npm run build` categorizes routes into Static (`○`) and Dynamic (`λ`) rendering paths.",
      "`output: 'standalone'` creates a self-contained production bundle that slashes Docker image size by 80%+.",
      "Multi-stage Dockerfiles enforce minimal attack surfaces and unprivileged non-root execution (`USER nextjs`).",
      "Dual API routing uses `API_INTERNAL_URL` for server-to-server container communication and `NEXT_PUBLIC_API_URL` for browser clients.",
    ],
    references: [
      { label: "Next.js Documentation — Deploying with Docker", url: "https://nextjs.org/docs/app/building-your-application/deploying#docker-image" },
      { label: "Next.js Documentation — Next.js Config (next.config.js)", url: "https://nextjs.org/docs/app/api-reference/next-config-js" },
    ],
    nextBridge:
      "Phase 8 is complete! You have mastered Next.js App Router, React Server Components, multi-tier caching, and production containerization. Now you are ready to enter Phase 9: Tailwind CSS v4, Modern UI & Accessibility!",
  },
];

export const LESSON_CONTENT_P8B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P8B.map((l) => [l.id, l]),
);

