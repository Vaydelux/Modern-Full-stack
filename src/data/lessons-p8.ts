import type { LessonContent } from "./types";

/**
 * Pass 021 bounded content batch: Phase 8 Next.js Foundations (L1–L3).
 * Every lesson fulfills the full quality contract. No placeholders.
 */
export const LESSONS_P8: LessonContent[] = [
  {
    id: "p08-l1",
    phaseId: "p08",
    title: "App Router Project & File Conventions",
    level: "Frontend Developer",
    minutes: 35,
    summary:
      "Next.js App Router represents a paradigm shift in React architecture: every component inside the `app/` directory is a React Server Component (RSC) by default. This lesson teaches the file-system routing conventions (`page.tsx`, `layout.tsx`, `template.tsx`, `route.ts`), the strict `NEXT_PUBLIC_` environment variable security boundary, and feature-driven file colocation.",
    prerequisites: [
      "p04-l2 — React components, props & composition",
      "p06-l6 — design systems & feature folders",
      "p07-l1 — URL anatomy and HTTP request lifecycle",
    ],
    objectives: [
      "Explain the App Router file-system convention: folders define URL segments, special filenames define UI boundaries.",
      "Identify the roles of `page.tsx`, `layout.tsx`, `template.tsx`, `not-found.tsx`, `error.tsx`, and `route.ts`.",
      "State why Server Components are the default and what capabilities they possess (direct DB/API access, 0 client JS bundle).",
      "Enforce the `NEXT_PUBLIC_` environment variable boundary: never leak database credentials or private API keys to the browser bundle.",
      "Colocate non-routable helper components, hooks, and tests inside route folders safely without accidental route exposure.",
    ],
    simple:
      "In standard React (like Vite SPAs), you download an empty HTML shell and a massive JavaScript bundle that mounts in the browser. In Next.js App Router, the server renders your React components directly on the Node runtime. Creating a folder named `app/dashboard/settings` and dropping a `page.tsx` inside instantly creates the URL route `/dashboard/settings`. You don't configure a separate router table — the folder structure IS the router.",
    why:
      "Modern full-stack frontend engineering requires understanding where code executes. If you import a secret API key in a standard React file, it gets baked into the client JS bundle for anyone to read in DevTools. Next.js solves this by keeping Server Components strictly on the backend, while providing instant server rendering, optimal search engine indexing (SEO), and zero-bundle-size server libraries.",
    mentalModel: {
      title: "The File-System Blueprint and the Invisible Vault",
      body: "Think of the `app/` directory as an architectural blueprint for a building. Each folder is a room. `page.tsx` is the furniture inside the room; `layout.tsx` is the hallway and walls that remain standing when you walk between adjacent rooms. Everything in the room is built inside a secure vault on the server by default. Only if you explicitly hang a sign saying `'use client'` on the door does Next.js send the interactive JavaScript mechanics to the visitor's browser.",
    },
    sections: [
      {
        heading: "The App Router directory structure & special files",
        body: [
          "Next.js uses a folder-hierarchy routing system where folders define URL paths and special reserved filenames define UI behaviors:",
          "• `page.tsx`: The unique UI for a route segment. A route is not publicly accessible until a `page.tsx` is placed in its folder.",
          "• `layout.tsx`: Shared UI that wraps child pages and nested layouts. Layouts preserve state across route changes and do NOT re-render on navigation.",
          "• `template.tsx`: Similar to layouts, but creates a new instance on navigation (useful for enter/exit animations or logging page views).",
          "• `route.ts`: API endpoint handler (GET, POST, PATCH, DELETE) for custom backend webhooks or raw JSON responses.",
        ],
        code: [
          {
            file: "app/directory-structure.txt",
            lang: "text",
            code: [
              "app/",
              "├── layout.tsx             # Root layout (html, body, global nav)",
              "├── page.tsx               # Root homepage (/) ",
              "├── not-found.tsx          # Global 404 handler",
              "├── globals.css            # Tailwind / Global CSS tokens",
              "├── dashboard/             # URL segment: /dashboard",
              "│   ├── layout.tsx         # Dashboard sidebar & persistent shell",
              "│   ├── page.tsx           # Dashboard main overview (/dashboard)",
              "│   ├── loading.tsx        # Suspense streaming fallback",
              "│   ├── error.tsx          # Error boundary with reset()",
              "│   └── settings/          # URL segment: /dashboard/settings",
              "│       ├── page.tsx       # Settings view",
              "│       └── _components/   # Colocated private helper components (ignored by router)",
              "└── api/",
              "    └── health/",
              "        └── route.ts       # GET /api/health -> JSON status",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "The NEXT_PUBLIC_ environment variable boundary",
        body: [
          "In Next.js, all environment variables in `.env` are private and accessible ONLY on the Node server runtime (inside Server Components, Server Actions, and Route Handlers).",
          "To expose a configuration variable to the browser (Client Components), it MUST be explicitly prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).",
          "NEVER prefix database connection strings (`DATABASE_URL`), secret tokens (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`), or encryption secrets with `NEXT_PUBLIC_`. If you do, Next.js will inline the secret directly into the publicly downloaded JavaScript bundle!",
        ],
        code: [
          {
            file: ".env.example — secret hygiene",
            lang: "text",
            code: [
              "# SERVER ONLY (Never exposed to browser bundle)",
              "DATABASE_URL=\"postgresql://postgres:password@localhost:5432/mydb\"",
              "SUPABASE_SERVICE_ROLE_KEY=\"sb_secret_super_admin_key_do_not_leak\"",
              "JWT_SECRET=\"super_secure_signing_secret_991823\"",
              "",
              "# CLIENT SAFE (Inlined into browser bundle during next build)",
              "NEXT_PUBLIC_SUPABASE_URL=\"https://xyz.supabase.co\"",
              "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
              "NEXT_PUBLIC_APP_URL=\"http://localhost:3000\"",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Root layout — the HTML shell contract",
        body: [
          "The root layout `app/layout.tsx` is mandatory in Next.js App Router. It must define the top-level `<html>` and `<body>` tags.",
          "Unlike Pages Router where `_app.tsx` and `_document.tsx` were separate, App Router unifies the HTML shell, global fonts, providers, and metadata in the root layout.",
        ],
        code: [
          {
            file: "app/layout.tsx — clean root layout",
            lang: "tsx",
            code: [
              "import type { Metadata } from 'next';",
              "import './globals.css';",
              "",
              "export const metadata: Metadata = {",
              "  title: {",
              "    template: '%s | TaskForge',",
              "    default: 'TaskForge — Enterprise Work Management',",
              "  },",
              "  description: 'Production-grade full-stack work management platform.',",
              "};",
              "",
              "export default function RootLayout({",
              "  children,",
              "}: {",
              "  children: React.ReactNode;",
              "}) {",
              "  return (",
              "    <html lang=\"en\">",
              "      <body className=\"min-h-screen bg-neutral-50 text-neutral-900 antialiased\">",
              "        {children}",
              "      </body>",
              "    </html>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Adding NEXT_PUBLIC_ to backend database secrets",
      wrong: "NEXT_PUBLIC_DATABASE_URL=\"postgresql://postgres:secret@db.supabase.com:5432/postgres\"",
      right: "DATABASE_URL=\"postgresql://postgres:secret@db.supabase.com:5432/postgres\"",
      explain:
        "Prefixing DATABASE_URL with NEXT_PUBLIC_ causes the build compiler to bundle your database password directly into client-side JS chunks, allowing any visitor to read your credentials in browser DevTools.",
    },
    tryIt: [
      "Open your terminal and inspect how Next.js treats files inside `app/`.",
      "Verify that creating a folder `app/projects/page.tsx` creates the route `/projects`.",
      "Check that a file named `app/projects/button.tsx` is NOT accessible as a URL because it is not named `page.tsx`.",
      "Audit your `.env` file to verify that zero database passwords or private API keys have the `NEXT_PUBLIC_` prefix.",
    ],
    challenge: {
      prompt:
        "Construct a TypeScript Next.js route handler `app/api/health/route.ts` that returns the server status, uptime in seconds, and timestamp as JSON with HTTP status 200.",
      hints: [
        "Export an async function named `GET(request: Request)`.",
        "Use `Response.json({ ... }, { status: 200 })` or `NextResponse.json()`.",
        "Compute uptime using `process.uptime()`.",
      ],
      solution: [
        "import { NextResponse } from 'next/server';",
        "",
        "export async function GET() {",
        "  return NextResponse.json(",
        "    {",
        "      status: 'ok',",
        "      uptime: process.uptime(),",
        "      timestamp: new Date().toISOString(),",
        "    },",
        "    { status: 200 }",
        "  );",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "In Next.js App Router, which file is required inside a directory to make that path publicly accessible as a route?",
        options: ["index.tsx", "page.tsx", "route.tsx", "view.tsx"],
        answer: 1,
        explain:
          "In App Router, only folders containing a `page.tsx` (or `route.ts` for API handlers) are exposed as routable URL endpoints.",
      },
      {
        q: "What happens to the state of a `layout.tsx` when a user navigates between sibling pages inside that layout?",
        options: [
          "The layout unmounts and all state is destroyed",
          "The layout persists and its state is preserved without re-rendering",
          "The browser performs a full page reload",
          "The layout throws an ErrorBoundary exception",
        ],
        answer: 1,
        explain:
          "Layouts in Next.js App Router preserve state and do not re-render across navigation between child routes.",
      },
      {
        q: "Why should `DATABASE_URL` never have the `NEXT_PUBLIC_` prefix?",
        options: [
          "Because Next.js will crash during startup",
          "Because Postgres will reject connections with that prefix",
          "Because NEXT_PUBLIC_ variables are inlined into the client-side JavaScript bundle, leaking credentials to visitors",
          "Because TypeScript does not allow underscores in variable names",
        ],
        answer: 2,
        explain:
          "Any variable prefixed with `NEXT_PUBLIC_` is included in the browser bundle during build time.",
      },
      {
        q: "What is the key difference between `layout.tsx` and `template.tsx`?",
        options: [
          "layout.tsx runs on the client; template.tsx runs on the server",
          "layout.tsx persists across navigations; template.tsx creates a fresh instance and re-mounts on every navigation",
          "template.tsx can only be used in the root directory",
          "layout.tsx requires React class components",
        ],
        answer: 1,
        explain:
          "Templates create a new component instance for each navigation, re-running effects and re-mounting DOM nodes.",
      },
      {
        q: "Are components in Next.js `app/` directory Server Components or Client Components by default?",
        options: [
          "Client Components by default",
          "Server Components by default",
          "They are neither until 'use client' or 'use server' is declared",
          "They alternate depending on file size",
        ],
        answer: 1,
        explain:
          "All components inside the App Router are React Server Components (RSC) by default unless marked with the `'use client'` directive.",
      },
      {
        q: "Which file in the root `app/` directory must contain the `<html>` and `<body>` tags?",
        options: ["app/page.tsx", "app/layout.tsx", "app/template.tsx", "app/document.tsx"],
        answer: 1,
        explain:
          "The root layout (`app/layout.tsx`) is required to define the `<html>` and `<body>` tags for the application.",
      },
    ],
    flashcards: [
      {
        front: "What is the purpose of `page.tsx` in Next.js App Router?",
        back: "It defines the unique UI rendered for a specific route segment and makes the directory path accessible to users.",
      },
      {
        front: "What is the purpose of `layout.tsx` in Next.js App Router?",
        back: "It provides shared UI (headers, sidebars) wrapping child routes, preserving state across navigations without re-rendering.",
      },
      {
        front: "What does the `NEXT_PUBLIC_` prefix do in Next.js?",
        back: "It instructs the bundler to expose the environment variable to client-side browser JavaScript.",
      },
      {
        front: "What is a `route.ts` file in Next.js?",
        back: "A backend API route handler that exports HTTP method functions (GET, POST, PUT, PATCH, DELETE) for JSON/webhook responses.",
      },
      {
        front: "Why are Server Components advantageous for bundle size?",
        back: "Their dependencies and execution stay strictly on the server, sending rendered HTML and RSC flight payload with 0 KB client JS.",
      },
      {
        front: "How do you colocate private components inside an app route without exposing a URL?",
        back: "Prefix the folder name with an underscore (e.g. `_components`) or avoid creating a `page.tsx` inside that folder.",
      },
      {
        front: "Where is global metadata (title, OpenGraph) defined in Next.js App Router?",
        back: "In `layout.tsx` or `page.tsx` by exporting a `metadata: Metadata` object or `generateMetadata()` function.",
      },
      {
        front: "What happens if a folder in `app/` does NOT have a `page.tsx`?",
        back: "It serves solely as an organizational folder or URL segment path segment, but cannot be navigated to directly.",
      },
    ],
    recap: [
      "Next.js App Router uses folder-based routing where `page.tsx` defines routable pages and `layout.tsx` defines persistent shells.",
      "All components are React Server Components by default, executing purely on Node.js.",
      "The `NEXT_PUBLIC_` prefix is the security boundary between server-only secrets and public browser variables.",
      "Colocation of private components is supported using `_folder` conventions.",
    ],
    references: [
      { label: "Next.js Documentation — Project Structure & Routing Conventions", url: "https://nextjs.org/docs/app/building-your-application/routing" },
      { label: "Next.js Documentation — Environment Variables", url: "https://nextjs.org/docs/app/building-your-application/configuring/environment-variables" },
    ],
    nextBridge:
      "Now that you understand project conventions and file structure, in P08-L2 you will master nested layouts, link prefetching, dynamic routes `[id]`, and route groups `(group)`.",
  },
  {
    id: "p08-l2",
    phaseId: "p08",
    title: "Layouts, Navigation & Route Groups",
    level: "Frontend Developer",
    minutes: 35,
    summary:
      "Deeply nested web applications need structural UI that stays persistent without unnecessary re-renders. This lesson explores nested layouts, Link prefetching mechanics, dynamic segments (`[id]`, `[...slug]`), Route Groups (`(marketing)`, `(app)`) that organize folders without altering the URL path, and parallel/intercepting routes for modal dialogues.",
    prerequisites: [
      "p08-l1 — app router project & file conventions",
      "p04-l2 — React composition & children prop",
      "p07-l1 — URL anatomy and search query parameters",
    ],
    objectives: [
      "Design deeply nested layouts that share context, sidebars, and navigation breadcrumbs without remounting.",
      "Use `next/link` with automatic viewport prefetching for instantaneous client-side transitions.",
      "Implement dynamic route segments `app/projects/[projectId]/page.tsx` and catch-all routes `[...slug]`.",
      "Organize complex applications with Route Groups `(auth)`, `(dashboard)` to apply distinct layouts without adding path segments.",
      "Programmatically navigate using `useRouter()` and inspect route parameters with `useParams()` and `useSearchParams()`.",
    ],
    simple:
      "Imagine an email app: on the left is a list of folders (Inbox, Sent), in the middle is a list of emails, and on the right is the active email body. When you click between emails, you don't want the folder list or sidebar to flicker or reload. In Next.js, nested `layout.tsx` files let each section of the screen stay locked in place while only the inner page content swaps out instantaneously.",
    why:
      "In standard single-page applications, multi-tier layout hierarchies require complex nested router configurations and state hoisting. Next.js solves this at the filesystem level. Understanding route groups allows you to create completely different layout themes (e.g. a public marketing landing page vs an authenticated dark-mode SaaS dashboard) cleanly inside the same repository.",
    mentalModel: {
      title: "The Matryoshka Nesting Dolls and Route Group Folders",
      body: "Nested layouts are like Matryoshka nesting dolls: `RootLayout` wraps `DashboardLayout`, which in turn wraps `ProjectLayout`, which finally wraps `TaskPage`. When you move between tasks in the same project, only the smallest inner doll changes. Route Groups in parentheses `(marketing)` are invisible organizational folders: they allow you to wrap pages in a dedicated layout doll without adding `/marketing/` to the web address URL.",
    },
    sections: [
      {
        heading: "Nested layouts — persistent shells without flicker",
        body: [
          "Layouts nest hierarchically according to the folder tree. When a route changes from `/dashboard/projects` to `/dashboard/settings`, the `DashboardLayout` remains mounted and keeps its state, while only the child subtree changes.",
          "Layouts receive a `{ children: React.ReactNode }` prop. In Server Components, layouts can also fetch data directly (e.g., loading the active user's workspace list) without waterfalling through the child page.",
        ],
        code: [
          {
            file: "app/dashboard/layout.tsx — persistent sidebar shell",
            lang: "tsx",
            code: [
              "import Link from 'next/link';",
              "",
              "export default function DashboardLayout({",
              "  children,",
              "}: {",
              "  children: React.ReactNode;",
              "}) {",
              "  return (",
              "    <div className=\"flex min-h-screen\">",
              "      {/* Persistent Sidebar (Never re-mounts on navigation) */}",
              "      <aside className=\"w-64 border-r bg-neutral-900 text-white p-4\">",
              "        <div className=\"font-bold text-lg mb-6\">TaskForge</div>",
              "        <nav className=\"flex flex-col gap-2\">",
              "          <Link href=\"/dashboard\" className=\"px-3 py-2 rounded hover:bg-neutral-800\">Overview</Link>",
              "          <Link href=\"/dashboard/projects\" className=\"px-3 py-2 rounded hover:bg-neutral-800\">Projects</Link>",
              "          <Link href=\"/dashboard/settings\" className=\"px-3 py-2 rounded hover:bg-neutral-800\">Settings</Link>",
              "        </nav>",
              "      </aside>",
              "",
              "      {/* Page Content Slot */}",
              "      <main className=\"flex-1 p-8 bg-neutral-50\">",
              "        {children}",
              "      </main>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Dynamic route segments: [id], [...slug], [[...slug]]",
        body: [
          "Dynamic segments allow matching variable URL parameters. A folder wrapped in square brackets `[id]` matches a single segment (e.g. `/tasks/101`).",
          "• `[id]`: Single dynamic segment (e.g. `app/tasks/[id]/page.tsx` matches `/tasks/42`).",
          "• `[...slug]`: Catch-all segment (e.g. `app/docs/[...slug]/page.tsx` matches `/docs/guides/intro` and `/docs/a/b/c`).",
          "• `[[...slug]]`: Optional catch-all segment (matches `/docs` as well as `/docs/guides/intro`).",
          "In Server Component pages, route parameters are passed via the `params` promise or prop object.",
        ],
        code: [
          {
            file: "app/tasks/[id]/page.tsx — reading dynamic route parameters",
            lang: "tsx",
            code: [
              "interface TaskPageProps {",
              "  params: Promise<{ id: string }>;",
              "  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;",
              "}",
              "",
              "export default async function TaskPage({ params, searchParams }: TaskPageProps) {",
              "  const { id } = await params;",
              "  const query = await searchParams;",
              "",
              "  return (",
              "    <div>",
              "      <h1 className=\"text-2xl font-bold\">Task #{id}</h1>",
              "      <p className=\"text-sm text-neutral-600\">View mode: {query.view || 'summary'}</p>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Route Groups (group) — layout isolation without URL pollution",
        body: [
          "To apply different layouts to different sections of your app without changing the URL path, wrap folder names in parentheses: `(marketing)` and `(app)`.",
          "For example:",
          "• `app/(marketing)/about/page.tsx` maps to the URL `/about` and uses `app/(marketing)/layout.tsx` (public navbar, footer).",
          "• `app/(app)/dashboard/page.tsx` maps to the URL `/dashboard` and uses `app/(app)/layout.tsx` (authenticated sidebar, dark mode).",
          "Route Groups eliminate messy layout toggles and allow clean separation of concerns.",
        ],
        code: [
          {
            file: "app/route-groups.txt",
            lang: "text",
            code: [
              "app/",
              "├── (marketing)/           # Route group: invisible in URL",
              "│   ├── layout.tsx         # Marketing layout (Hero header, footer)",
              "│   ├── page.tsx           # URL: / (Landing page)",
              "│   └── pricing/page.tsx   # URL: /pricing",
              "└── (app)/                 # Route group: invisible in URL",
              "    ├── layout.tsx         # App layout (Sidebar, user session guard)",
              "    └── dashboard/page.tsx # URL: /dashboard",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Link prefetching & client navigation mechanics",
        body: [
          "Next.js `<Link href=\"/dashboard\">` automatically prefetches route assets in the background when the link enters the user's viewport.",
          "When the user clicks the link, the navigation is executed in-memory instantaneously via the React flight stream without a full browser reload.",
          "For programmatic transitions (e.g. after a form submission or button click), use the `useRouter()` hook from `next/navigation`.",
        ],
        code: [
          {
            file: "components/NavButton.tsx — client navigation",
            lang: "tsx",
            code: [
              "'use client';",
              "",
              "import { useRouter } from 'next/navigation';",
              "",
              "export function CreateProjectButton() {",
              "  const router = useRouter();",
              "",
              "  const handleCreate = async () => {",
              "    const res = await fetch('/api/projects', { method: 'POST' });",
              "    const newProject = await res.json();",
              "    // Programmatic client navigation:",
              "    router.push(`/projects/${newProject.id}`);",
              "    router.refresh(); // Refreshes Server Component data without losing client state",
              "  };",
              "",
              "  return (",
              "    <button onClick={handleCreate} className=\"btn btn-primary\">",
              "      Create Project",
              "    </button>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Importing useRouter from 'next/router' instead of 'next/navigation'",
      wrong: "import { useRouter } from 'next/router'; // Pages router legacy!",
      right: "import { useRouter } from 'next/navigation'; // App Router standard",
      explain:
        "Importing useRouter from 'next/router' in App Router throws a runtime error: 'NextRouter was not mounted'. In App Router, all navigation hooks come strictly from 'next/navigation'.",
    },
    tryIt: [
      "Create two route groups `(marketing)` and `(dashboard)` in an App Router tree.",
      "Verify that `app/(marketing)/about/page.tsx` is served at `/about` and not `/marketing/about`.",
      "Inspect network requests in DevTools when hovering over a `<Link>` component — notice the automatic prefetching of RSC payloads.",
      "Create a dynamic route `app/users/[id]/page.tsx` and verify that accessing `/users/42` supplies `{ id: '42' }` in `params`.",
    ],
    challenge: {
      prompt:
        "Build a nested breadcrumbs component for a dynamic project route `app/projects/[projectId]/tasks/[taskId]/page.tsx` that links back to parent levels using Next.js Link.",
      hints: [
        "Read params `{ projectId, taskId }`.",
        "Render links to `/projects`, `/projects/${projectId}`, and the current active task.",
      ],
      solution: [
        "import Link from 'next/link';",
        "",
        "interface BreadcrumbProps {",
        "  projectId: string;",
        "  taskId: string;",
        "}",
        "",
        "export function TaskBreadcrumbs({ projectId, taskId }: BreadcrumbProps) {",
        "  return (",
        "    <nav aria-label=\"Breadcrumb\" className=\"flex items-center gap-2 text-sm text-neutral-500 mb-4\">",
        "      <Link href=\"/projects\" className=\"hover:text-neutral-900 transition-colors\">Projects</Link>",
        "      <span>/</span>",
        "      <Link href={`/projects/${projectId}`} className=\"hover:text-neutral-900 transition-colors\">Project #{projectId}</Link>",
        "      <span>/</span>",
        "      <span className=\"font-medium text-neutral-900\">Task #{taskId}</span>",
        "    </nav>",
        "  );",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "What URL path corresponds to `app/(dashboard)/analytics/page.tsx`?",
        options: [
          "/dashboard/analytics",
          "/analytics",
          "/(dashboard)/analytics",
          "/app/dashboard/analytics",
        ],
        answer: 1,
        explain:
          "Route group names enclosed in parentheses `(group)` are completely omitted from the resulting URL pathname.",
      },
      {
        q: "Which hook should you import to programmatically navigate in Next.js App Router?",
        options: [
          "useRouter from 'next/router'",
          "useRouter from 'next/navigation'",
          "useNavigate from 'react-router-dom'",
          "useLocation from 'wouter'",
        ],
        answer: 1,
        explain:
          "In Next.js App Router, navigation hooks (`useRouter`, `usePathname`, `useSearchParams`) must be imported from `next/navigation`.",
      },
      {
        q: "What is the difference between `[slug]` and `[...slug]` in App Router directory names?",
        options: [
          "[slug] matches only numbers; [...slug] matches letters",
          "[slug] matches a single URL segment; [...slug] is a catch-all that matches multiple nested segments",
          "[...slug] is deprecated in Next.js",
          "[slug] runs on client; [...slug] runs on server",
        ],
        answer: 1,
        explain:
          "`[...slug]` is a catch-all dynamic segment that matches one or more segments (e.g. `/a/b/c` yields `params.slug = ['a', 'b', 'c']`).",
      },
      {
        q: "How does Next.js `<Link>` optimize navigation speed?",
        options: [
          "It downloads the entire database when the page loads",
          "It automatically prefetches the route payload in the background as the link enters the viewport",
          "It converts all React components into WebAssembly",
          "It disables CSS animations",
        ],
        answer: 1,
        explain:
          "Next.js automatically prefetches code and data for routes linked with `<Link>` when they are visible in the viewport.",
      },
      {
        q: "What happens to child component state when navigating between routes wrapped by the same `layout.tsx`?",
        options: [
          "The layout unmounts completely",
          "The layout persists and preserves its state; only the child route subtree updates",
          "All cookies are cleared",
          "The layout is recompiled from source",
        ],
        answer: 1,
        explain:
          "Layouts persist across child route transitions, maintaining their component state and scroll position.",
      },
      {
        q: "Which parameter type is returned for `app/blog/[...slug]/page.tsx` on the route `/blog/2026/08/release`?",
        options: [
          "params.slug = '2026/08/release'",
          "params.slug = ['2026', '08', 'release']",
          "params.slug = { year: 2026, month: 8 }",
          "params.slug = 2026",
        ],
        answer: 1,
        explain:
          "Catch-all routes return dynamic segments as an array of string segment parts.",
      },
    ],
    flashcards: [
      {
        front: "What is a Route Group `(name)` in Next.js App Router?",
        back: "A folder wrapped in parentheses that allows grouping routes and applying dedicated layouts without affecting the URL path structure.",
      },
      {
        front: "What is the difference between `[id]` and `[[...slug]]`?",
        back: "`[id]` matches exactly one segment; `[[...slug]]` is an optional catch-all that matches zero, one, or multiple segments.",
      },
      {
        front: "Which package provides navigation hooks in App Router?",
        back: "`next/navigation` (NOT `next/router`).",
      },
      {
        front: "What does `router.refresh()` do in Next.js?",
        back: "It refreshes the current route's Server Component data from the server without resetting client React state or scroll position.",
      },
      {
        front: "Why do nested layouts prevent UI flicker?",
        back: "Because Next.js re-renders only the changed child segment, leaving the parent layout DOM elements intact and mounted.",
      },
      {
        front: "How do you read query parameters in an App Router Server Component page?",
        back: "Via the `searchParams` prop passed into the page component.",
      },
      {
        front: "How do you read URL pathname in a Client Component?",
        back: "Using the `usePathname()` hook from `next/navigation`.",
      },
      {
        front: "What is prefetching in Next.js `<Link>`?",
        back: "The automatic background fetching of route RSC payloads when a `<Link>` enters the browser viewport.",
      },
    ],
    recap: [
      "Nested layouts preserve state and prevent re-rendering of shared UI like sidebars.",
      "Dynamic segments `[id]` and catch-all routes `[...slug]` enable flexible parameter matching.",
      "Route Groups `(name)` organize layouts without polluting the public URL structure.",
      "Client-side navigation uses `next/link` with automatic viewport prefetching and `useRouter` from `next/navigation`.",
    ],
    references: [
      { label: "Next.js Documentation — Linking and Navigating", url: "https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating" },
      { label: "Next.js Documentation — Dynamic Routes", url: "https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes" },
      { label: "Next.js Documentation — Route Groups", url: "https://nextjs.org/docs/app/building-your-application/routing/route-groups" },
    ],
    nextBridge:
      "With navigation and layouts mastered, P08-L3 covers streaming UI with loading.tsx, error boundaries with error.tsx, not-found.tsx, and SEO metadata generation.",
  },
  {
    id: "p08-l3",
    phaseId: "p08",
    title: "loading, error, not-found & Metadata",
    level: "Frontend Developer",
    minutes: 35,
    summary:
      "Resilient web applications handle edge states gracefully: loading skeletons during data fetches, localized error boundaries that keep the rest of the application functional, custom 404 pages, and dynamic search engine metadata (OpenGraph social cards). This lesson installs Next.js conventions for `loading.tsx`, `error.tsx`, `not-found.tsx`, and the typed `Metadata` API.",
    prerequisites: [
      "p08-l1 — app router project & file conventions",
      "p06-l2 — React Error Boundaries, Suspense & transitions",
      "p07-l2 — HTTP status codes and error headers",
    ],
    objectives: [
      "Implement instant loading skeletons with `loading.tsx` and React Suspense streaming.",
      "Create localized error boundaries with `error.tsx` (Client Component) and wire the `reset()` retry handler.",
      "Handle 404s cleanly with `not-found.tsx` and the `notFound()` trigger function.",
      "Generate static and dynamic SEO metadata using `export const metadata` and `generateMetadata()`.",
      "Construct OpenGraph and Twitter social card tags for rich link previews across social platforms.",
    ],
    simple:
      "When you click a link on a slow connection, an amateur website leaves you staring at a frozen white screen or crashes entirely if one API fails. In Next.js, `loading.tsx` instantly shows a skeleton placeholder while data is streaming; `error.tsx` catches crashes in a small corner of the screen without taking down your entire app; and `not-found.tsx` provides a helpful, branded 404 experience.",
    why:
      "User experience is measured at the edges: during network latency, unexpected server exceptions, and social media link previews. The App Router file convention automatically wraps your route components in React Suspense and Error Boundaries without requiring you to manually write boilerplate wrapper code around every page.",
    mentalModel: {
      title: "The Shock Absorbers and the Billboard",
      body: "`loading.tsx` is an instant preview skeleton that holds the layout steady so content doesn't jump around when data arrives. `error.tsx` and `not-found.tsx` are structural shock absorbers: if an engine part breaks, the shock absorber absorbs the impact and presents a 'Try Again' button, keeping the rest of the car moving. The `Metadata` API is the billboard on the roof: it tells Google, Twitter, and Slack exactly what photo, title, and description to show when someone shares your URL.",
    },
    sections: [
      {
        heading: "Instant UI streaming with loading.tsx & React Suspense",
        body: [
          "When a user navigates to a route that performs asynchronous data fetching on the server, Next.js automatically wraps the `page.tsx` in a React `<Suspense fallback={<Loading />}>` boundary using `loading.tsx`.",
          "Because `loading.tsx` is streamed immediately from the server, the user sees an instant interactive skeleton UI while server data continues streaming over the HTTP chunked connection.",
        ],
        code: [
          {
            file: "app/dashboard/loading.tsx — skeleton UI fallback",
            lang: "tsx",
            code: [
              "export default function DashboardLoading() {",
              "  return (",
              "    <div className=\"space-y-6 animate-pulse p-6\">",
              "      <div className=\"h-8 w-48 bg-neutral-200 rounded\" />",
              "      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">",
              "        <div className=\"h-28 bg-neutral-200 rounded-lg\" />",
              "        <div className=\"h-28 bg-neutral-200 rounded-lg\" />",
              "        <div className=\"h-28 bg-neutral-200 rounded-lg\" />",
              "      </div>",
              "      <div className=\"h-64 bg-neutral-200 rounded-lg\" />",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Error handling with error.tsx and reset()",
        body: [
          "`error.tsx` defines a React Error Boundary that catches runtime errors thrown inside its route segment and child pages.",
          "CRITICAL RULE: `error.tsx` MUST be a Client Component (`'use client'`) because Error Boundaries require client-side React lifecycle state to catch and recover from errors.",
          "It receives two props: `error` (the Error instance) and `reset` (a function that re-attempts to render the route segment).",
        ],
        code: [
          {
            file: "app/dashboard/error.tsx — client error boundary",
            lang: "tsx",
            code: [
              "'use client';",
              "",
              "import { useEffect } from 'react';",
              "",
              "export default function DashboardError({",
              "  error,",
              "  reset,",
              "}: {",
              "  error: Error & { digest?: string };",
              "  reset: () => void;",
              "}) {",
              "  useEffect(() => {",
              "    // Log error to telemetry / Sentry (Phase 33)",
              "    console.error('Dashboard route error:', error);",
              "  }, [error]);",
              "",
              "  return (",
              "    <div className=\"p-8 max-w-md mx-auto text-center\">",
              "      <div className=\"text-rose-600 font-bold text-lg mb-2\">Something went wrong!</div>",
              "      <p className=\"text-sm text-neutral-600 mb-4\">",
              "        {error.message || 'Failed to load dashboard metrics.'}",
              "      </p>",
              "      <button",
              "        onClick={() => reset()}",
              "        className=\"btn btn-primary text-sm px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700\"",
              "      >",
              "        Try again",
              "      </button>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Custom 404s with not-found.tsx and notFound()",
        body: [
          "When a user navigates to a URL that does not exist, Next.js renders the nearest `not-found.tsx` file.",
          "You can also trigger a 404 programmatically inside a Server Component by invoking the `notFound()` function (from `next/navigation`) when a database record is missing.",
        ],
        code: [
          {
            file: "app/projects/[id]/page.tsx — programmatic notFound() trigger",
            lang: "tsx",
            code: [
              "import { notFound } from 'next/navigation';",
              "",
              "async function getProject(id: string) {",
              "  const res = await fetch(`https://api.example.com/projects/${id}`);",
              "  if (res.status === 404) return null;",
              "  if (!res.ok) throw new Error('API query failed');",
              "  return res.json();",
              "}",
              "",
              "export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {",
              "  const { id } = await params;",
              "  const project = await getProject(id);",
              "",
              "  // If project is not in database, trigger not-found.tsx:",
              "  if (!project) {",
              "    notFound();",
              "  }",
              "",
              "  return <div>Project: {project.name}</div>;",
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "SEO & Metadata: Static & generateMetadata()",
        body: [
          "Next.js provides a built-in Metadata API that automatically renders `<title>`, `<meta name=\"description\">`, and OpenGraph tags into the HTML `<head>`.",
          "For static pages, export a `metadata: Metadata` object.",
          "For dynamic routes (e.g. `/products/[id]`), export an async `generateMetadata({ params }): Promise<Metadata>` function that fetches the title from your API or database.",
        ],
        code: [
          {
            file: "app/tasks/[id]/page.tsx — dynamic generateMetadata",
            lang: "tsx",
            code: [
              "import type { Metadata } from 'next';",
              "",
              "interface Props {",
              "  params: Promise<{ id: string }>;",
              "}",
              "",
              "export async function generateMetadata({ params }: Props): Promise<Metadata> {",
              "  const { id } = await params;",
              "  const task = await fetch(`https://api.example.com/tasks/${id}`).then((r) => r.json());",
              "",
              "  return {",
              "    title: `${task.title} | TaskForge`,",
              "    description: task.description || 'View task details on TaskForge.',",
              "    openGraph: {",
              "      title: task.title,",
              "      description: task.description,",
              "      url: `https://taskforge.app/tasks/${id}`,",
              "      siteName: 'TaskForge',",
              "      images: [{ url: 'https://taskforge.app/og-default.png', width: 1200, height: 630 }],",
              "      type: 'website',",
              "    },",
              "  };",
              "}",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Creating error.tsx as a Server Component",
      wrong: "export default function ErrorPage({ error }) { ... } // Missing 'use client'",
      right: "'use client';\nexport default function ErrorPage({ error, reset }) { ... }",
      explain:
        "React Error Boundaries must be Client Components because they rely on client-side state transitions to catch render exceptions and invoke the reset() function.",
    },
    tryIt: [
      "Add a `loading.tsx` file inside an app route and add an artificial 2-second `await new Promise(r => setTimeout(r, 2000))` in `page.tsx`.",
      "Observe how the loading skeleton streams immediately while the page data resolves in the background.",
      "Throw `throw new Error('Test crash')` inside a component and verify that `error.tsx` isolates the crash and provides a functional reset button.",
      "Call `notFound()` when an invalid ID is provided and observe `not-found.tsx` rendering with an HTTP 404 status.",
    ],
    challenge: {
      prompt:
        "Write a complete `app/not-found.tsx` component that renders a clean 404 notice, explains the resource was missing or moved, and provides a Next.js Link back to `/dashboard`.",
      hints: [
        "Create a functional React component named `NotFound`.",
        "Import `Link` from `next/link`.",
        "Use semantic HTML landmarks (`<main>`, `<h1>`, `<p>`).",
      ],
      solution: [
        "import Link from 'next/link';",
        "",
        "export default function NotFound() {",
        "  return (",
        "    <main className=\"flex min-h-[70vh] flex-col items-center justify-center p-6 text-center\">",
        "      <span className=\"font-mono text-sm font-bold text-brand-ink uppercase tracking-wider mb-2\">404 Error</span>",
        "      <h1 className=\"text-3xl font-bold text-neutral-900 mb-3\">Page or Resource Not Found</h1>",
        "      <p className=\"max-w-md text-sm text-neutral-600 mb-6\">",
        "        The page or item you requested does not exist, has been deleted, or was moved to another URL.",
        "      </p>",
        "      <Link",
        "        href=\"/dashboard\"",
        "        className=\"btn btn-primary px-5 py-2.5 rounded-md font-medium text-sm transition-all\"",
        "      >",
        "        Return to Dashboard",
        "      </Link>",
        "    </main>",
        "  );",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Why MUST `error.tsx` always include the `'use client'` directive at the top of the file?",
        options: [
          "Because Next.js does not allow TypeScript in server files",
          "Because React Error Boundaries require client-side component state to catch exceptions and trigger recovery",
          "To enable CSS animations",
          "To allow direct access to PostgreSQL",
        ],
        answer: 1,
        explain:
          "React Error Boundaries must be Client Components because catching rendering errors and resetting state occurs on the client runtime.",
      },
      {
        q: "What React feature powers `loading.tsx` streaming in Next.js App Router?",
        options: [
          "React.memo",
          "React Suspense",
          "useContext",
          "useReducer",
        ],
        answer: 1,
        explain:
          "Next.js automatically wraps route segments in `<Suspense fallback={<Loading />}>` when `loading.tsx` is defined.",
      },
      {
        q: "How do you programmatically trigger a 404 response from inside a Server Component page?",
        options: [
          "throw new Error('404')",
          "import { notFound } from 'next/navigation'; notFound();",
          "return null",
          "window.location.href = '/404'",
        ],
        answer: 1,
        explain:
          "Calling `notFound()` from `next/navigation` halts execution and renders the nearest `not-found.tsx` component.",
      },
      {
        q: "What is the role of `generateMetadata()` in dynamic Next.js routes?",
        options: [
          "To generate database tables automatically",
          "To dynamically compute SEO `<title>`, `<meta>`, and OpenGraph tags based on route parameters and fetched data",
          "To compile Tailwind CSS styles",
          "To create user authentication tokens",
        ],
        answer: 1,
        explain:
          "`generateMetadata()` allows asynchronous calculation of page metadata (like article titles or product descriptions) for SEO.",
      },
      {
        q: "What argument does the `reset()` function in `error.tsx` accept?",
        options: [
          "It takes a URL string to redirect to",
          "It takes no arguments; invoking `reset()` re-renders the error boundary's contents to attempt recovery",
          "It takes a database connection pool",
          "It takes the user's password",
        ],
        answer: 1,
        explain:
          "`reset()` is a zero-argument function provided by Next.js to attempt re-rendering the route segment that encountered an error.",
      },
      {
        q: "Where in the HTML document does Next.js inject the metadata defined in `layout.tsx` or `page.tsx`?",
        options: [
          "At the very bottom of `<body>`",
          "Inside the `<head>` tag of the rendered HTML document",
          "In the `loading.tsx` skeleton",
          "In the browser console only",
        ],
        answer: 1,
        explain:
          "Next.js automatically hoists and streams metadata tags into the `<head>` element of the document.",
      },
    ],
    flashcards: [
      {
        front: "What is the purpose of `loading.tsx` in Next.js?",
        back: "It provides an instant loading skeleton fallback using React Suspense streaming while server-side data is resolving.",
      },
      {
        front: "Why must `error.tsx` be a Client Component (`'use client'`)?",
        back: "Because React Error Boundaries require client-side component state to catch errors and execute recovery via `reset()`.",
      },
      {
        front: "What is `notFound()` and how is it used?",
        back: "A function from `next/navigation` that programmatically triggers the nearest `not-found.tsx` 404 error boundary.",
      },
      {
        front: "What is `generateMetadata()` in Next.js?",
        back: "An async function exported from a page or layout to dynamically calculate SEO title, description, and OpenGraph tags from dynamic route params.",
      },
      {
        front: "What is the difference between static `metadata` and `generateMetadata`?",
        back: "`metadata` is a static configuration object; `generateMetadata` is an async function that can fetch data and read dynamic route parameters.",
      },
      {
        front: "What are the two props passed into `error.tsx`?",
        back: "`error` (the JavaScript Error instance with optional `digest`) and `reset` (a callback function to re-attempt rendering).",
      },
      {
        front: "What are OpenGraph (`og:`) tags used for?",
        back: "They define the preview image, title, and description displayed when your website URL is shared on platforms like Slack, Twitter, and LinkedIn.",
      },
      {
        front: "Can a child route have its own `loading.tsx` independent of its parent layout?",
        back: "Yes, loading boundaries nest hierarchically; child segments stream their own independent skeleton fallbacks.",
      },
    ],
    recap: [
      "`loading.tsx` leverages React Suspense to stream instant skeleton UI while server data resolves.",
      "`error.tsx` is a Client Component error boundary that isolates crashes and provides a recovery `reset()` handler.",
      "`not-found.tsx` and `notFound()` handle missing resources and return standard HTTP 404 status codes.",
      "The Metadata API (`metadata` and `generateMetadata()`) automates SEO, OpenGraph cards, and `<title>` tag generation.",
    ],
    references: [
      { label: "Next.js Documentation — Loading UI and Streaming", url: "https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming" },
      { label: "Next.js Documentation — Error Handling", url: "https://nextjs.org/docs/app/building-your-application/routing/error-handling" },
      { label: "Next.js Documentation — Metadata", url: "https://nextjs.org/docs/app/building-your-application/optimizing/metadata" },
    ],
    nextBridge:
      "Now that you understand route conventions, layouts, and edge states, in P08-L4 you will master the React Server Components (RSC) vs Client Components boundary and the serialization wire protocol.",
  },
];

export const LESSON_CONTENT_P8: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P8.map((l) => [l.id, l]),
);

