import type { LessonContent } from "./types";

export const LESSON_CONTENT_P32: Record<string, LessonContent> = {
  "p32-l1": {
    id: "p32-l1",
    phaseId: "p32",
    title: "Measure Before You Optimize",
    level: "Advanced",
    minutes: 30,
    summary:
      "Establish scientific performance baselines using Core Web Vitals (LCP, INP, CLS) and Server Latency percentiles (p50, p95, p99) before refactoring code.",
    prerequisites: ["p07-l1 HTTP Fundamentals", "p04-l1 React Fundamentals"],
    objectives: [
      "Define quantitative Performance Budgets (e.g. LCP < 1.2s, p95 API response < 80ms).",
      "Measure Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift).",
      "Understand why Average latency is misleading and why Percentiles (p95/p99) reveal real customer pain.",
    ],
    simple:
      "Donald Knuth famously stated: 'Premature optimization is the root of all evil.' If your app feels slow, don't guess and randomly wrap functions in `useMemo`. Instrument your application with metrics, find the exact bottleneck (e.g. a slow database query or a 3MB JavaScript bundle), and measure before and after your fix.",
    why:
      "Optimizing code without measurement wastes weeks fixing things that don't matter while leaving the true bottlenecks untouched.",
    mentalModel: {
      title: "The Medical Diagnostic Lab",
      body:
        "A doctor doesn't perform heart surgery because a patient 'feels tired'. They order blood tests, an EKG, and an MRI. Profilers and APM dashboards are the blood tests of your software application.",
    },
    sections: [
      {
        heading: "1. Core Web Vitals (The Frontend Golden Metrics)",
        body: [
          "- **LCP (Largest Contentful Paint)**: How long until the main hero image or headline renders. Target: **< 2.5 seconds**.",
          "- **INP (Interaction to Next Paint)**: How fast the browser updates visually after a user taps, clicks, or types. Target: **< 200 milliseconds**.",
          "- **CLS (Cumulative Layout Shift)**: Visual stability (do buttons jump around while ads load?). Target: **< 0.1**.",
        ],
        code: [
          {
            file: "vitals-tracker.ts",
            lang: "ts",
            code: [
              "import { onLCP, onINP, onCLS } from 'web-vitals';",
              "",
              "function sendToAnalytics(metric: { name: string; value: number; id: string }) {",
              "  const body = JSON.stringify(metric);",
              "  // Use sendBeacon so metrics are transmitted even if the user closes the tab",
              "  if (navigator.sendBeacon) {",
              "    navigator.sendBeacon('/api/v1/telemetry/vitals', body);",
              "  } else {",
              "    fetch('/api/v1/telemetry/vitals', { body, method: 'POST', keepalive: true });",
              "  }",
              "}",
              "",
              "export function initPerformanceMonitoring() {",
              "  onLCP(sendToAnalytics);",
              "  onINP(sendToAnalytics);",
              "  onCLS(sendToAnalytics);",
              "}",
            ].join("\n"),
            caption: "Real-user Core Web Vitals tracking with navigator.sendBeacon.",
          },
        ],
      },
      {
        heading: "2. Backend Percentiles: Why Average Latency Lies",
        body: [
          "If 99 users get a 10ms response and 1 user waits 10,000ms (10 seconds), the **Average is 109ms** (looks great on paper!).",
          "However, your **p99 is 10,000ms** — meaning 1 out of every 100 customers experienced a catastrophic hang.",
          "Engineering teams set SLOs strictly on **p95 and p99 percentiles**.",
        ],
      },
    ],
    mistake: {
      title: "Relying on Localhost Dev Mode to Benchmark Rendering Speed",
      wrong: [
        "// ❌ Benchmarking React components in development mode (npm run dev):",
        "// React dev mode runs extra checks, strict mode double-invocations, and unminified bundles that are 5x slower than production builds!",
      ].join("\n"),
      right: [
        "// ✅ Always benchmark performance against production builds (npm run build && npm run start).",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Audit Web Vitals with Lighthouse CLI",
      description:
        "Run `npx lighthouse-ci` against a production build, record baseline LCP and CLS scores, and document three highest-impact opportunities.",
      tasks: [
        "Execute `npm run build` and preview locally.",
        "Run `npx lighthouse http://localhost:3000 --view`.",
        "Identify large uncompressed images or blocking render scripts.",
      ],
    },
    quiz: [
      {
        question: "What does INP (Interaction to Next Paint) measure in modern browser performance?",
        options: [
          "The time taken to download the HTML file.",
          "The overall latency from when a user interacts (clicks/keys) to when the browser successfully renders the visual frame update.",
          "The SQL query execution duration.",
          "The size of the CSS bundle in kilobytes.",
        ],
        answer: 1,
        explanation:
          "INP measures the UI responsiveness by tracking the latency of all user interactions throughout the page lifecycle.",
      },
    ],
  },

  "p32-l2": {
    id: "p32-l2",
    phaseId: "p32",
    title: "React Rendering & Profiler Analysis",
    level: "Advanced",
    minutes: 40,
    summary:
      "Diagnose unnecessary React re-renders using the React DevTools Flamegraph profiler. Master virtualized lists with TanStack Virtual and surgical state colocation.",
    prerequisites: ["p04-l1 React Fundamentals", "p05-l1 Hooks In-Depth"],
    objectives: [
      "Interpret React Profiler Flamegraphs (Commit duration, Render vs Idle time).",
      "Implement windowing/virtualization for 10,000+ item lists using `@tanstack/react-virtual`.",
      "Eliminate re-renders through state colocation rather than over-using `useMemo` / `useCallback`.",
    ],
    simple:
      "When a React parent component updates, all of its children re-render by default. If your table has 5,000 rows, rendering 5,000 DOM nodes freezes the browser for 600ms. Virtualization only renders the 15 rows currently visible in the user's viewport, keeping memory low and scrolling at a silky 60 FPS.",
    why:
      "Rendering huge unvirtualized lists is the most common cause of stuttering, dropped animation frames, and high memory consumption in web applications.",
    mentalModel: {
      title: "The Film Projector Reel",
      body:
        "A movie projector doesn't display all 200,000 frames of a film on the wall at once. It pulls only the single active frame in front of the lens for 1/24th of a second. Virtualization does the exact same thing for long scrollable lists.",
    },
    sections: [
      {
        heading: "1. Virtualizing Massive Lists with TanStack Virtual",
        body: [
          "- Only mount DOM nodes for items inside the visible scroll container viewport plus a 5-item overscan buffer.",
          "- Supports dynamic row heights, horizontal carousels, and grid layouts.",
        ],
        code: [
          {
            file: "VirtualizedList.tsx",
            lang: "tsx",
            code: [
              "import React, { useRef } from 'react';",
              "import { useVirtualizer } from '@tanstack/react-virtual';",
              "",
              "interface VirtualizedListProps {",
              "  items: Array<{ id: string; title: string; subtitle: string }>;",
              "}",
              "",
              "export function VirtualizedList({ items }: VirtualizedListProps) {",
              "  const parentRef = useRef<HTMLDivElement>(null);",
              "",
              "  const rowVirtualizer = useVirtualizer({",
              "    count: items.length,",
              "    getScrollElement: () => parentRef.current,",
              "    estimateSize: () => 64, // Estimated 64px row height",
              "    overscan: 5, // Render 5 extra rows above and below viewport",
              "  });",
              "",
              "  return (",
              "    <div",
              "      ref={parentRef}",
              "      className=\"h-[500px] overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-lg\"",
              "    >",
              "      <div",
              "        className=\"w-full relative\"",
              "        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}",
              "      >",
              "        {rowVirtualizer.getVirtualItems().map((virtualRow) => {",
              "          const item = items[virtualRow.index];",
              "          return (",
              "            <div",
              "              key={virtualRow.key}",
              "              className=\"absolute top-0 left-0 w-full p-3 flex flex-col justify-center border-b border-neutral-100 dark:border-neutral-800\"",
              "              style={{",
              "                height: `${virtualRow.size}px`,",
              "                transform: `translateY(${virtualRow.start}px)`,",
              "              }}",
              "            >",
              "              <span className=\"font-medium text-sm text-neutral-900 dark:text-neutral-100\">{item.title}</span>",
              "              <span className=\"text-xs text-neutral-500\">{item.subtitle}</span>",
              "            </div>",
              "          );",
              "        })}",
              "      </div>",
              "    </div>",
              "  );",
              "}",
            ].join("\n"),
            caption: "High-performance list virtualization with TanStack Virtual.",
          },
        ],
      },
    ],
    mistake: {
      title: "Wrapping Every Function in useCallback Without Measuring",
      wrong: [
        "// ❌ Unnecessary useCallback on primitive handlers without memoized children:",
        "const handleClick = useCallback(() => setCount(c => c + 1), []);",
        "<button onClick={handleClick}>Click</button>",
        "// Instantiating useCallback hooks has CPU/memory overhead that often exceeds the cost of inline functions!",
      ].join("\n"),
      right: [
        "// ✅ Use useCallback only when passing functions to React.memo components or useEffect dependency arrays.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Render 50,000 Mock Records at 60 FPS",
      description:
        "Build a benchmark page comparing unvirtualized list rendering (50k nodes) vs TanStack Virtual, measuring frame drops via Chrome DevTools Performance tab.",
      tasks: [
        "Generate 50,000 mock audit log entries.",
        "Mount with standard `.map()` -> observe browser freeze.",
        "Replace with `useVirtualizer` -> observe instant 60 FPS scroll performance.",
      ],
    },
    quiz: [
      {
        question: "Why does list virtualization maintain high performance regardless of whether there are 1,000 or 1,000,000 items?",
        options: [
          "Because it compresses the items into WebP images.",
          "Because it only creates DOM elements for the small subset of rows currently visible inside the viewport bounds.",
          "Because it runs in WebAssembly.",
          "Because it bypasses React reconciliation.",
        ],
        answer: 1,
        explanation:
          "DOM operations are expensive; by keeping total active DOM nodes capped to ~20-30 elements, memory and reflow times remain constant (O(1)).",
      },
    ],
  },

  "p32-l3": {
    id: "p32-l3",
    phaseId: "p32",
    title: "Bundles, Payloads, Images & Fonts",
    level: "Advanced",
    minutes: 35,
    summary:
      "Slash initial page payload sizes by 40%+. Master dynamic `import()` code-splitting, modern AVIF/WebP image pipelines, and self-hosted subsetted variable fonts.",
    prerequisites: ["p04-l1 React Fundamentals", "p08-l1 Next.js App Router"],
    objectives: [
      "Analyze bundle size maps with `rollup-plugin-visualizer` or `@next/bundle-analyzer`.",
      "Implement lazy-loaded route boundaries with `React.lazy()` and `Suspense`.",
      "Eliminate font layout shifts using CSS `font-display: swap` and variable fonts.",
    ],
    simple:
      "When a user visits your app over a 4G mobile connection, downloading a 2MB JavaScript bundle takes 4 seconds before the page is interactive. By code-splitting secondary views (like the Admin Analytics Dashboard or Heavy Chart Canvas), the initial landing bundle drops to 80KB, loading in under 300ms.",
    why:
      "Every 100ms decrease in page load time increases e-commerce conversion rates by 1%.",
    mentalModel: {
      title: "The Carry-On Suitcase",
      body:
        "You don't pack your winter parka, ski boots, and snorkel mask for a 2-hour flight to a business meeting. You pack only what you need for today. Code splitting delivers only the exact JavaScript needed for the current screen.",
    },
    sections: [
      {
        heading: "1. Dynamic Route Splitting with React.lazy",
        body: [
          "- Heavy third-party libraries (e.g. Monaco Editor, Recharts, Three.js) should never be in the main entry bundle.",
          "- Defer loading until the user navigates to that specific view or tab.",
        ],
        code: [
          {
            file: "LazyHeavyComponent.tsx",
            lang: "tsx",
            code: [
              "import React, { Suspense, lazy } from 'react';",
              "",
              "// Monaco editor is 3MB — load it only when the user opens the Code Editor tab",
              "const MonacoEditor = lazy(() => import('./HeavyMonacoEditor'));",
              "",
              "export function CodeEditorTab() {",
              "  return (",
              "    <Suspense fallback={<div className=\"p-8 text-neutral-500\">Loading code editor...</div>}>",
              "      <MonacoEditor />",
              "    </Suspense>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Lazy loading heavy components with React.lazy and Suspense.",
          },
        ],
      },
    ],
    mistake: {
      title: "Importing Massive Utility Libraries Directly",
      wrong: [
        "// ❌ Importing full lodash library:",
        "import _ from 'lodash';",
        "// Pulls all 300+ lodash methods into your client bundle!",
      ].join("\n"),
      right: [
        "// ✅ Import specific subpaths or use native ES6 methods:",
        "import debounce from 'lodash/debounce';",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Cut Bundle Size by 40%",
      description:
        "Run bundle analysis, replace heavy date-fns/moment with dayjs or native Intl, lazy-load secondary tabs, and verify bundle size reduction.",
      tasks: [
        "Install `rollup-plugin-visualizer` in `vite.config.ts`.",
        "Generate `stats.html` bundle map.",
        "Convert two heavy components to `React.lazy()` and observe chunk splitting.",
      ],
    },
    quiz: [
      {
        question: "What is the primary benefit of React.lazy() and dynamic import()?",
        options: [
          "It splits your code into smaller chunk files that the browser only downloads when the specific component is actually rendered.",
          "It converts React components to WebAssembly.",
          "It encrypts JavaScript files on disk.",
          "It speeds up SQL queries.",
        ],
        answer: 0,
        explanation:
          "Dynamic imports allow bundlers to generate separate split chunks, reducing the initial JavaScript payload downloaded on first page load.",
      },
    ],
  },
};
