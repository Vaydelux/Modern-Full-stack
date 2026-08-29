import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FastForward,
  Filter,
  Flame,
  GitBranch,
  Layers,
  Network,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { useProgress } from "../lib/store";
import { Link } from "../lib/router";

export function NestJSArchitectureSection() {
  const [activeTab, setActiveTab] = useState<"lifecycle" | "di" | "monorepo">("lifecycle");
  const [selectedHookStep, setSelectedHookStep] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "observability" | "monolith">("all");
  const [openOutline, setOpenOutline] = useState<Record<string, boolean>>({});

  const { isComplete, toggleComplete, setMultipleComplete } = useProgress();

  const nestLessons = [
    {
      id: "p12-l7",
      title: "NestJS Lifecycle Hooks & Graceful Shutdown",
      minutes: 40,
      badge: "Core Lifecycle",
      category: "core",
      desc: "Initialization order (OnModuleInit vs OnApplicationBootstrap), OS signal trapping (SIGTERM/SIGINT), and graceful connection draining for Fastify and Prisma pools.",
      outline: [
        "OnModuleInit vs OnApplicationBootstrap execution semantics",
        "Shutdown hooks & OS signal listeners (SIGTERM/SIGINT)",
        "Draining Fastify in-flight HTTP connections without dropped requests",
        "Closing Prisma & Redis connection pools cleanly during termination",
      ],
    },
    {
      id: "p12-l8",
      title: "Advanced Dependency Injection: Custom Providers & Dynamic Modules",
      minutes: 45,
      badge: "IoC Engine",
      category: "core",
      desc: "Custom provider strategies (useClass, useValue, useFactory), type-safe symbol tokens, dynamic ConfigurableModuleBuilder, and provider scope tradeoffs.",
      outline: [
        "Custom providers: useClass, useValue, useFactory, useExisting",
        "Symbol and string injection tokens with @Inject()",
        "Dynamic modules & ConfigurableModuleBuilder (forRootAsync)",
        "Provider Scopes: DEFAULT vs REQUEST vs TRANSIENT tradeoffs",
      ],
    },
    {
      id: "p12-l9",
      title: "Modular Monorepo Architecture with Turborepo & pnpm",
      minutes: 45,
      badge: "Enterprise Monorepo",
      category: "monolith",
      desc: "Structuring apps/api, apps/web, packages/contracts (shared Zod + DTOs), packages/database, pnpm workspaces, and Turborepo topological pipeline caching.",
      outline: [
        "Enterprise structure: apps/api, apps/web, packages/*",
        "pnpm workspaces & internal workspace:* dependencies",
        "Shared @repo/contracts Zod schemas & typed DTOs",
        "Turborepo pipeline caching (^build) & pruned Docker builds",
      ],
    },
    {
      id: "p12-l1",
      title: "Feature Modules & Thin Controllers",
      minutes: 40,
      badge: "Domain Boundaries",
      category: "monolith",
      desc: "Bounded context feature modules, delegating HTTP routing immediately to domain services, and clean export boundaries.",
      outline: [
        "Bounded modules per feature domain",
        "Controllers delegate, services decide",
        "Lab: split a god module into isolated domains",
      ],
    },
    {
      id: "p12-l2",
      title: "Request Context, AsyncLocalStorage & Trace IDs",
      minutes: 40,
      badge: "Observability",
      category: "observability",
      desc: "Zero-cost ambient request context via Node AsyncLocalStorage, request IDs, and avoiding request-scoped provider performance degradation.",
      outline: [
        "Node.js AsyncLocalStorage for ambient context",
        "Correlating logs across deep async call stacks",
        "Avoiding Scope.REQUEST performance bottlenecks",
      ],
    },
    {
      id: "p12-l3",
      title: "Global Exception Filters & Error Invariants",
      minutes: 35,
      badge: "Error Handling",
      category: "observability",
      desc: "Custom exception hierarchies, RFC 7807 problem details envelopes, and centralizing unhandled rejections cleanly.",
      outline: [
        "Custom AppException class hierarchy",
        "Catch-all HttpExceptionFilter with Fastify reply",
        "Strict sanitization of internal database errors",
      ],
    },
    {
      id: "p12-l4",
      title: "Logging, Correlation IDs & Request Context",
      minutes: 35,
      badge: "Structured Logs",
      category: "observability",
      desc: "JSON structured logging with Pino and Fastify, log levels, secret masking, and distributed tracing metadata.",
      outline: [
        "Structured JSON output for cloud log aggregators",
        "Fastify request serializer & header masking",
        "Lab: follow a correlation ID through the full stack",
      ],
    },
    {
      id: "p12-l5",
      title: "Swagger/OpenAPI & API Versioning Judgment",
      minutes: 30,
      badge: "Contracts & Docs",
      category: "monolith",
      desc: "Decorating DTOs for automated OpenAPI 3.0 documentation, URI/Header versioning strategies, and avoiding premature API versioning.",
      outline: [
        "OpenAPI documentation generated from DTO decorators",
        "Versioning strategies: URI prefix vs Custom header",
        "Lab: interactive Swagger UI on /api/docs",
      ],
    },
    {
      id: "p12-l6",
      title: "Modular Monolith & the God-Service Anti-Pattern",
      minutes: 40,
      badge: "Architecture",
      category: "monolith",
      desc: "Deconstructing massive monolithic services into cohesive domain modules, circular dependency detection with Madge, and clean interfaces.",
      outline: [
        "Identifying god-services and shared-state traps",
        "Detecting circular dependencies using madge",
        "Refactoring into domain-driven feature modules",
      ],
    },
  ];

  const filteredLessons = nestLessons.filter((l) => {
    if (categoryFilter === "all") return true;
    return l.category === categoryFilter;
  });

  const allLessonIds = nestLessons.map((l) => l.id);
  const masteredCount = nestLessons.filter((l) => isComplete(l.id)).length;
  const allMastered = masteredCount === nestLessons.length;
  const pct = Math.round((masteredCount / nestLessons.length) * 100);

  const lifecycleSteps = [
    {
      phase: "Init 1",
      name: "OnModuleInit",
      scope: "Module Level",
      desc: "Called immediately once each module's internal providers and dependencies are resolved. Used for internal client instantiation and synchronous configuration verification.",
      code: `async onModuleInit(): Promise<void> {\n  this.logger.log('Prisma client initializing...');\n  await this.$connect();\n}`,
    },
    {
      phase: "Init 2",
      name: "OnApplicationBootstrap",
      scope: "Graph Level",
      desc: "Called after ALL modules across the entire application graph have finished OnModuleInit. Ideal for cross-module orchestration, warming caches, and DB readiness checks.",
      code: `async onApplicationBootstrap(): Promise<void> {\n  const health = await this.$queryRaw\`SELECT 1\`;\n  this.logger.log('All modules bootstrapped successfully.');\n}`,
    },
    {
      phase: "Runtime",
      name: "Fastify Listen",
      scope: "Network Level",
      desc: "The Fastify HTTP listener begins accepting incoming TCP connections on 0.0.0.0:3000. Middleware, guards, interceptors, and pipes process traffic.",
      code: `app.enableShutdownHooks();\nawait app.listen(3000, '0.0.0.0');`,
    },
    {
      phase: "Teardown 1",
      name: "beforeApplicationShutdown",
      scope: "Signal Drain",
      desc: "Triggered when Kubernetes or Docker sends SIGTERM. Marks readiness probes as unhealthy so load balancers stop sending new requests while in-flight requests finish.",
      code: `async beforeApplicationShutdown(signal?: string): Promise<void> {\n  this.health.setTerminating(true);\n  await new Promise(r => setTimeout(r, 2000)); // drain buffer\n}`,
    },
    {
      phase: "Teardown 2",
      name: "onApplicationShutdown",
      scope: "Resource Cleanup",
      desc: "Called once the Fastify HTTP listener has stopped accepting connections and all active requests are finished. Disconnects Prisma database pools and Redis sockets.",
      code: `async onApplicationShutdown(): Promise<void> {\n  await this.prisma.$disconnect();\n  this.logger.log('All persistent resources closed cleanly.');\n}`,
    },
  ];

  const toggleLessonOutline = (id: string) => {
    setOpenOutline((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBatchToggle = () => {
    setMultipleComplete(allLessonIds, !allMastered);
  };

  return (
    <section className="mt-14 mb-8" aria-label="Phase 4 NestJS Architecture Spotlight">
      {/* Header Banner */}
      <div
        className="panel p-6 sm:p-8 rounded-[var(--r-lg)] border relative overflow-hidden"
        style={{
          borderColor: "var(--brand)",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 60%, var(--brand-soft) 100%)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[0.66rem] uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5"
              style={{
                background: "var(--brand-soft)",
                color: "var(--brand-ink)",
                borderColor: "var(--brand)",
              }}
            >
              <Cpu size={12} />
              Phase 4 Architecture Spotlight
            </span>
            <span className="font-mono text-[0.66rem] text-[var(--muted)]">
              NestJS + Fastify + Monorepo
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[0.72rem]">
            <span
              className="px-2.5 py-1 rounded-full border flex items-center gap-1.5"
              style={{
                background: allMastered ? "var(--brand-soft)" : "var(--surface-2)",
                color: allMastered ? "var(--brand-ink)" : "var(--muted)",
                borderColor: allMastered ? "var(--brand)" : "var(--line-2)",
              }}
            >
              {allMastered && <Sparkles size={11} />}
              <span>{masteredCount}/{nestLessons.length} Mastered ({pct}%)</span>
            </span>

            {/* Batch Toggle Button */}
            <button
              type="button"
              onClick={handleBatchToggle}
              className="btn btn-soft btn-sm text-[0.68rem] font-mono py-1 px-2.5 flex items-center gap-1"
              title={allMastered ? "Reset all Phase 4 Architecture lessons" : "Mark all Phase 4 Architecture lessons as mastered"}
            >
              {allMastered ? (
                <>
                  <RotateCcw size={11} /> Reset All
                </>
              ) : (
                <>
                  <Check size={11} /> Master All (9)
                </>
              )}
            </button>
          </div>
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[var(--ink)]">
          Phase 4: NestJS Architecture & Modular Monorepo
        </h2>
        <p className="text-sm sm:text-base mt-2 max-w-[75ch] text-[var(--ink-2)] leading-relaxed">
          Master the three cornerstones of enterprise-grade NestJS applications: deterministic lifecycle hooks with
          zero-downtime graceful shutdown, advanced dependency injection with custom providers and dynamic modules, and
          a high-performance modular monorepo structure built with Turborepo and pnpm.
        </p>

        {/* Interactive Architecture Explorer Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: "var(--line)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("lifecycle")}
            className="px-3.5 py-1.5 rounded-full text-[0.78rem] font-medium flex items-center gap-2 transition-all border cursor-pointer"
            style={{
              background: activeTab === "lifecycle" ? "var(--brand)" : "var(--surface-3)",
              color: activeTab === "lifecycle" ? "#ffffff" : "var(--ink-2)",
              borderColor: activeTab === "lifecycle" ? "var(--brand)" : "var(--line-2)",
            }}
          >
            <Activity size={13} />
            <span>1. Lifecycle Hooks & Graceful Shutdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("di")}
            className="px-3.5 py-1.5 rounded-full text-[0.78rem] font-medium flex items-center gap-2 transition-all border cursor-pointer"
            style={{
              background: activeTab === "di" ? "var(--brand)" : "var(--surface-3)",
              color: activeTab === "di" ? "#ffffff" : "var(--ink-2)",
              borderColor: activeTab === "di" ? "var(--brand)" : "var(--line-2)",
            }}
          >
            <Workflow size={13} />
            <span>2. Advanced Dependency Injection & Dynamic Modules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monorepo")}
            className="px-3.5 py-1.5 rounded-full text-[0.78rem] font-medium flex items-center gap-2 transition-all border cursor-pointer"
            style={{
              background: activeTab === "monorepo" ? "var(--brand)" : "var(--surface-3)",
              color: activeTab === "monorepo" ? "#ffffff" : "var(--ink-2)",
              borderColor: activeTab === "monorepo" ? "var(--brand)" : "var(--line-2)",
            }}
          >
            <Boxes size={13} />
            <span>3. Modular Monorepo (Turborepo + pnpm)</span>
          </button>
        </div>

        {/* Interactive Architecture Content Panels */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            {activeTab === "lifecycle" && (
              <motion.div
                key="lifecycle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Left: Step Interactive Pipeline */}
                <div className="lg:col-span-5 flex flex-col gap-2">
                  <div className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--muted)] mb-1 flex items-center gap-1.5">
                    <Clock size={11} /> Application Lifecycle Sequence
                  </div>
                  {lifecycleSteps.map((step, idx) => (
                    <button
                      key={step.name}
                      type="button"
                      onClick={() => setSelectedHookStep(idx)}
                      className="text-left p-3 rounded-[var(--r-md)] border transition-all text-[0.82rem] flex items-center justify-between gap-3 cursor-pointer"
                      style={{
                        background: selectedHookStep === idx ? "var(--surface-1)" : "var(--surface-2)",
                        borderColor: selectedHookStep === idx ? "var(--brand)" : "var(--line-2)",
                        boxShadow: selectedHookStep === idx ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-[0.6rem] uppercase tracking-wider px-1.5 py-0.2 rounded"
                            style={{
                              background: idx < 3 ? "var(--brand-soft)" : "var(--amber-soft, #fef3c7)",
                              color: idx < 3 ? "var(--brand-ink)" : "var(--amber-ink, #92400e)",
                            }}
                          >
                            {step.phase}
                          </span>
                          <span className="font-semibold text-[var(--ink)]">{step.name}</span>
                        </div>
                        <p className="text-[0.74rem] text-[var(--muted)] line-clamp-1 mt-0.5">{step.scope}</p>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{
                          color: selectedHookStep === idx ? "var(--brand)" : "var(--muted)",
                          transform: selectedHookStep === idx ? "translateX(2px)" : "none",
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Right: Step Deep Dive & Code */}
                <div
                  className="lg:col-span-7 panel p-4 sm:p-5 rounded-[var(--r-md)] border flex flex-col justify-between"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--line)" }}>
                      <div>
                        <div className="font-mono text-[0.64rem] uppercase tracking-wider text-[var(--brand-ink)]">
                          {lifecycleSteps[selectedHookStep].phase} · {lifecycleSteps[selectedHookStep].scope}
                        </div>
                        <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                          {lifecycleSteps[selectedHookStep].name}
                        </h4>
                      </div>
                      <span className="badge font-mono text-[0.65rem]">
                        Step {selectedHookStep + 1} of 5
                      </span>
                    </div>

                    <p className="text-[0.82rem] mt-3 leading-relaxed text-[var(--ink-2)]">
                      {lifecycleSteps[selectedHookStep].desc}
                    </p>

                    <div className="mt-3">
                      <div className="font-mono text-[0.64rem] text-[var(--muted)] mb-1 flex items-center gap-1">
                        <Code2 size={11} /> Implementation Hook Pattern
                      </div>
                      <pre
                        className="p-3 rounded-[var(--r-sm)] font-mono text-[0.74rem] overflow-x-auto border text-[var(--ink)]"
                        style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
                      >
                        <code>{lifecycleSteps[selectedHookStep].code}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-[0.72rem] font-mono text-[var(--muted)]" style={{ borderColor: "var(--line)" }}>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} style={{ color: "var(--brand)" }} /> Zero 502 Downtime Protected
                    </span>
                    <Link to="lesson/p12-l7" className="text-[var(--brand-ink)] font-semibold flex items-center gap-1 hover:underline">
                      Open Lifecycle Lesson <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "di" && (
              <motion.div
                key="di"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="panel p-4 rounded-[var(--r-md)] border" style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-[var(--r-sm)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                      <Cpu size={14} />
                    </span>
                    <h4 className="font-semibold text-sm text-[var(--ink)]">4 Custom Provider Modes</h4>
                  </div>
                  <p className="text-[0.78rem] text-[var(--muted)] leading-relaxed mb-3">
                    Decouple business contracts from storage drivers using <code>useClass</code> (strategy), <code>useValue</code> (mocking), and <code>useFactory</code> (async DB / S3 configs).
                  </p>
                  <pre className="p-2.5 rounded-[var(--r-sm)] font-mono text-[0.7rem] bg-[var(--surface-2)] border overflow-x-auto" style={{ borderColor: "var(--line)" }}>
                    {`{\n  provide: STORAGE_TOKEN,\n  useFactory: (cfg: Config) =>\n    cfg.get('S3') ? new S3() : new Local(),\n  inject: [ConfigService]\n}`}
                  </pre>
                </div>

                <div className="panel p-4 rounded-[var(--r-md)] border" style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-[var(--r-sm)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                      <Workflow size={14} />
                    </span>
                    <h4 className="font-semibold text-sm text-[var(--ink)]">Dynamic Configurable Modules</h4>
                  </div>
                  <p className="text-[0.78rem] text-[var(--muted)] leading-relaxed mb-3">
                    Author clean dynamic modules without boilerplate using <code>ConfigurableModuleBuilder</code>, generating <code>forRootAsync()</code> with strict type inference.
                  </p>
                  <pre className="p-2.5 rounded-[var(--r-sm)] font-mono text-[0.7rem] bg-[var(--surface-2)] border overflow-x-auto" style={{ borderColor: "var(--line)" }}>
                    {`export const { \n  ConfigurableModuleClass,\n  MODULE_OPTIONS_TOKEN \n} = new ConfigurableModuleBuilder<\n  MailerOptions\n>().build();`}
                  </pre>
                </div>

                <div className="panel p-4 rounded-[var(--r-md)] border" style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1.5 rounded-[var(--r-sm)] bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                      <Layers size={14} />
                    </span>
                    <h4 className="font-semibold text-sm text-[var(--ink)]">Provider Scope Discipline</h4>
                  </div>
                  <p className="text-[0.78rem] text-[var(--muted)] leading-relaxed mb-3">
                    Default to <code>Scope.DEFAULT</code> (Singleton) for 50,000+ req/s throughput. Use <code>AsyncLocalStorage</code> for ambient user context instead of costly <code>Scope.REQUEST</code>.
                  </p>
                  <pre className="p-2.5 rounded-[var(--r-sm)] font-mono text-[0.7rem] bg-[var(--surface-2)] border overflow-x-auto" style={{ borderColor: "var(--line)" }}>
                    {`// Singleton + AsyncLocalStorage\n@Injectable()\nexport class RequestContext {\n  private readonly als = \n    new AsyncLocalStorage();\n}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === "monorepo" && (
              <motion.div
                key="monorepo"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Left: Tree */}
                <div
                  className="lg:col-span-6 panel p-4 rounded-[var(--r-md)] border"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--brand-ink)] mb-2 flex items-center gap-1.5">
                    <Boxes size={12} /> Enterprise Monorepo Topology
                  </div>
                  <pre
                    className="p-3 rounded-[var(--r-sm)] font-mono text-[0.72rem] bg-[var(--surface-2)] border overflow-x-auto leading-relaxed"
                    style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                  >
{`├── apps/
│   ├── api/             # NestJS + Fastify (Port 3000)
│   └── web/             # Next.js 15 App Router (Port 3001)
├── packages/
│   ├── contracts/       # Shared Zod Schemas & DTOs
│   ├── database/        # Prisma 7.9.15 Client & Schema
│   └── tsconfig/        # Base strict compiler configs
├── pnpm-workspace.yaml  # Workspace directory links
└── turbo.json           # Topological pipeline caching`}
                  </pre>
                </div>

                {/* Right: Golden Rules */}
                <div
                  className="lg:col-span-6 panel p-4 rounded-[var(--r-md)] border flex flex-col justify-between"
                  style={{ background: "var(--surface-1)", borderColor: "var(--line-2)" }}
                >
                  <div>
                    <h4 className="font-display font-semibold text-sm mb-2 text-[var(--ink)]">
                      Monorepo Architectural Principles
                    </h4>
                    <ul className="flex flex-col gap-2 text-[0.78rem] text-[var(--ink-2)]">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                        <span><strong>End-to-End Type Safety:</strong> Changes in <code>@repo/contracts</code> instantly type-check both backend controllers and frontend queries.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                        <span><strong>Strict Dependency Inversion:</strong> Applications import shared packages; shared packages never import from apps.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                        <span><strong>Turborepo Cache Hits:</strong> Unmodified packages build instantly from hash caches during CI/CD.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-[0.72rem] font-mono text-[var(--muted)]" style={{ borderColor: "var(--line)" }}>
                    <span>pnpm workspaces + Turborepo</span>
                    <Link to="lesson/p12-l9" className="text-[var(--brand-ink)] font-semibold flex items-center gap-1 hover:underline">
                      Explore Monorepo Lesson <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Lesson Grid for Phase 4 Architecture */}
        <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                Phase 4 Architecture Modules & Laboratory Tracks
              </h3>
              <p className="text-[0.76rem] text-[var(--muted)]">
                Directly explore and master each architectural pillar. Click checkboxes to track mastery.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 text-[0.75rem]">
              <span className="font-mono text-[0.66rem] uppercase tracking-wider text-[var(--muted)] mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className="px-2.5 py-0.5 rounded-full border text-[0.72rem] font-medium transition-colors cursor-pointer"
                style={{
                  background: categoryFilter === "all" ? "var(--brand-soft)" : "var(--surface)",
                  color: categoryFilter === "all" ? "var(--brand-ink)" : "var(--ink-2)",
                  borderColor: categoryFilter === "all" ? "var(--brand)" : "var(--line)",
                }}
              >
                All ({nestLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("core")}
                className="px-2.5 py-0.5 rounded-full border text-[0.72rem] font-medium transition-colors cursor-pointer"
                style={{
                  background: categoryFilter === "core" ? "var(--brand-soft)" : "var(--surface)",
                  color: categoryFilter === "core" ? "var(--brand-ink)" : "var(--ink-2)",
                  borderColor: categoryFilter === "core" ? "var(--brand)" : "var(--line)",
                }}
              >
                Core Pillars
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("monolith")}
                className="px-2.5 py-0.5 rounded-full border text-[0.72rem] font-medium transition-colors cursor-pointer"
                style={{
                  background: categoryFilter === "monolith" ? "var(--brand-soft)" : "var(--surface)",
                  color: categoryFilter === "monolith" ? "var(--brand-ink)" : "var(--ink-2)",
                  borderColor: categoryFilter === "monolith" ? "var(--brand)" : "var(--line)",
                }}
              >
                Monolith & Boundaries
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("observability")}
                className="px-2.5 py-0.5 rounded-full border text-[0.72rem] font-medium transition-colors cursor-pointer"
                style={{
                  background: categoryFilter === "observability" ? "var(--brand-soft)" : "var(--surface)",
                  color: categoryFilter === "observability" ? "var(--brand-ink)" : "var(--ink-2)",
                  borderColor: categoryFilter === "observability" ? "var(--brand)" : "var(--line)",
                }}
              >
                Observability
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLessons.map((l) => {
              const done = isComplete(l.id);
              const open = !!openOutline[l.id];

              return (
                <div
                  key={l.id}
                  className="panel p-4 rounded-[var(--r-md)] border transition-all flex flex-col justify-between"
                  style={{
                    background: done ? "var(--brand-soft)/20" : "var(--surface-1)",
                    borderColor: done ? "var(--brand)" : "var(--line-2)",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {/* Interactive Mastery Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleComplete(l.id)}
                          className="cursor-pointer focus:outline-none transition-transform active:scale-90"
                          aria-label={`Mark "${l.title}" as ${done ? "incomplete" : "mastered"}`}
                          title={done ? "Mastered — click to mark unmastered" : "Click to mark mastered"}
                          role="checkbox"
                          aria-checked={done}
                        >
                          {done ? (
                            <motion.div
                              initial={{ scale: 0.6, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <CheckCircle2 size={17} style={{ color: "var(--brand)" }} />
                            </motion.div>
                          ) : (
                            <Circle size={17} className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: "var(--line-2)" }} />
                          )}
                        </button>
                        <span className="font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[var(--surface-2)] text-[var(--ink-2)]" style={{ borderColor: "var(--line-2)" }}>
                          {l.badge}
                        </span>
                      </div>
                      <span className="font-mono text-[0.64rem] text-[var(--muted)] flex items-center gap-1">
                        <Clock size={10} /> {l.minutes}m
                      </span>
                    </div>

                    <Link
                      to={`lesson/${l.id}`}
                      className="font-display font-semibold text-[0.92rem] text-[var(--ink)] hover:text-[var(--brand)] transition-colors line-clamp-1 block"
                      style={{ textDecoration: "none" }}
                    >
                      {l.title}
                    </Link>

                    <p className="text-[0.78rem] text-[var(--muted)] mt-1 leading-relaxed line-clamp-2">
                      {l.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t flex flex-col gap-1" style={{ borderColor: "var(--line)" }}>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleLessonOutline(l.id)}
                        className="font-mono text-[0.66rem] text-[var(--brand-ink)] flex items-center gap-1 hover:underline cursor-pointer"
                        aria-expanded={open}
                        aria-label={`${open ? "Hide" : "View"} committed scope for ${l.title}`}
                      >
                        <span>{open ? "Hide Committed Scope" : "View Committed Scope"}</span>
                        <ChevronDown
                          size={11}
                          style={{
                            transform: open ? "rotate(180deg)" : "none",
                            transition: "transform 0.18s ease",
                          }}
                        />
                      </button>

                      <Link
                        to={`lesson/${l.id}`}
                        className="btn btn-soft btn-sm text-[0.72rem] py-0.5 px-2.5 font-mono flex items-center gap-1"
                      >
                        <span>{done ? "Review" : "Start"}</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>

                    {/* Collapsible Outline */}
                    <AnimatePresence>
                      {open && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="mt-2 flex flex-col gap-1 pl-2 border-l"
                          style={{ borderColor: "var(--brand)" }}
                        >
                          {l.outline.map((o) => (
                            <li key={o} className="text-[0.72rem] text-[var(--ink-2)]">
                              · {o}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
