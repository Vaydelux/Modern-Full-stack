import type { LessonContent } from "./types";

export const LESSON_CONTENT_P39B: Record<string, LessonContent> = {
  "p39-l4": {
    id: "p39-l4",
    phaseId: "p39",
    title: "Health, Graceful Shutdown, Timeouts & Retries",
    level: "Mastery",
    minutes: 35,
    summary:
      "Implement Kubernetes/Docker health probe endpoints (`/healthz/liveness` vs `/healthz/readiness`), terminate HTTP connections gracefully on `SIGTERM`, and configure retry budgets.",
    prerequisites: ["p10-l1 NestJS Core", "p38-l2 NestJS Deployment"],
    objectives: [
      "Distinguish Liveness probes (Is the process alive or deadlocked?) from Readiness probes (Is the DB connected and ready for traffic?).",
      "Intercept `SIGTERM` signals, drain in-flight HTTP connections over 15 seconds, and close database connection pools.",
      "Enforce explicit timeout budgets across all HTTP and database calls.",
    ],
    simple:
      "If a server process crashes, the load balancer should stop sending it traffic immediately. If the server is starting up or temporarily waiting for database reconnection, the Readiness probe returns 503 so the load balancer waits. When shutting down a server to deploy a new version, Graceful Shutdown finishes all currently active user downloads before turning off the power.",
    why:
      "Health probes and graceful shutdowns eliminate the 502 Bad Gateway errors users experience during deployments.",
    mentalModel: {
      title: "The Storefront 'Open / Closed' Sign",
      body:
        "The Open sign (Readiness) tells customers they can walk in. At 9:00 PM closing time (SIGTERM), the manager locks the front door to new customers but lets everyone already inside finish checking out before turning off the lights.",
    },
    sections: [
      {
        heading: "1. Terminus Health Check in NestJS",
        body: [
          "- `/healthz/liveness`: Checks memory and event loop responsiveness.",
          "- `/healthz/readiness`: Pings PostgreSQL and Redis to verify full readiness.",
        ],
        code: [
          {
            file: "src/health/health.controller.ts",
            lang: "ts",
            code: [
              "import { Controller, Get } from '@nestjs/common';",
              "import { HealthCheckService, HttpHealthIndicator, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';",
              "import { PrismaService } from '../prisma.service';",
              "",
              "@Controller('healthz')",
              "export class HealthController {",
              "  constructor(",
              "    private health: HealthCheckService,",
              "    private prismaIndicator: PrismaHealthIndicator,",
              "    private prisma: PrismaService,",
              "  ) {}",
              "",
              "  @Get('liveness')",
              "  @HealthCheck()",
              "  checkLiveness() {",
              "    return { status: 'ok', timestamp: new Date().toISOString() };",
              "  }",
              "",
              "  @Get('readiness')",
              "  @HealthCheck()",
              "  checkReadiness() {",
              "    return this.health.check([",
              "      () => this.prismaIndicator.pingCheck('database', this.prisma),",
              "    ]);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Liveness and Readiness health endpoints using @nestjs/terminus.",
          },
        ],
      },
    ],
    mistake: {
      title: "Restarting Containers When the External Database is Down (Misconfigured Liveness)",
      wrong: [
        "// ❌ Checking database in Liveness probe:",
        "// If PostgreSQL has a 10-second blip, Kubernetes will kill and restart all 20 healthy API pods simultaneously in an endless restart crashloop!",
      ].join("\n"),
      right: [
        "// ✅ Liveness probe checks process health only; Readiness probe checks external database connectivity.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Graceful Shutdown with In-Flight HTTP Requests",
      description:
        "Trigger a slow 5-second request, send `SIGTERM` to the server process, and verify the slow request completes successfully with 200 OK before process exit.",
      tasks: [
        "Create endpoint with 5s delay.",
        "Issue curl request.",
        "Send `kill -SIGTERM <PID>` and verify curl receives valid response.",
      ],
    },
    quiz: [
      {
        question: "What is the critical difference between a Liveness probe and a Readiness probe in production container orchestration?",
        options: [
          "Liveness determines if the container must be restarted; Readiness determines if the container should receive incoming network traffic from the load balancer.",
          "Liveness is for CSS; Readiness is for HTML.",
          "Readiness only runs once a year.",
          "Liveness tests internet speed.",
        ],
        answer: 0,
        explanation:
          "Failing a liveness probe causes container termination and restart; failing a readiness probe simply pauses routing traffic to that instance until it recovers.",
      },
    ],
  },

  "p39-l5": {
    id: "p39-l5",
    phaseId: "p39",
    title: "SPOFs, Backups & Managed Availability",
    level: "Mastery",
    minutes: 30,
    summary:
      "Identify Single Points of Failure (SPOFs) in system architecture. Configure multi-AZ database replication, automated Point-in-Time Recovery (PITR), and disaster recovery runbooks.",
    prerequisites: ["p13-l1 PostgreSQL Core", "p38-l6 Operations Checklist"],
    objectives: [
      "Audit system topology to identify and eliminate architectural SPOFs.",
      "Configure Multi-Availability-Zone (Multi-AZ) PostgreSQL read replicas with automated primary failover.",
      "Calculate Recovery Time Objective (RTO) and Recovery Point Objective (RPO) targets.",
    ],
    simple:
      "A Single Point of Failure (SPOF) is any single component whose failure brings down the entire company (e.g. one primary database in a single datacenter with no replica). High availability means having automatic backups, multi-datacenter failover, and hot standbys so that if an entire Amazon datacenter catches fire, traffic redirects to a backup datacenter with zero data loss.",
    why:
      "Eliminating SPOFs ensures business continuity and protects your organization from catastrophic outages.",
    mentalModel: {
      title: "The Twin-Engine Jet Airplane",
      body:
        "Commercial passenger airplanes always have at least two independent jet engines and two hydraulic systems. If engine 1 fails mid-flight, engine 2 can fly the entire plane safely to the nearest airport.",
    },
    sections: [
      {
        heading: "1. Key Disaster Recovery Metrics: RTO vs RPO",
        body: [
          "- **RTO (Recovery Time Objective)**: Maximum acceptable time to get the system back online after a disaster (e.g. Target < 15 minutes).",
          "- **RPO (Recovery Point Objective)**: Maximum acceptable age of data that can be lost in a disaster (e.g. PITR provides RPO < 1 minute).",
        ],
      },
    ],
    mistake: {
      title: "Relying on a Single Cron Backup Script that Dumps SQL into the Same Server's Local Drive",
      wrong: [
        "// ❌ pg_dump saved to /var/backups on the same server:",
        "// If the server disk crashes or server is corrupted, the backup is destroyed along with the database!",
      ].join("\n"),
      right: [
        "// ✅ Stream WAL logs and encrypted snapshots to an external multi-region object store (e.g. AWS S3 Glacier / Supabase PITR).",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Map System SPOFs and Calculate RTO/RPO",
      description:
        "Draw an architecture diagram for TaskForge, highlight 3 potential SPOFs, and document automated failover strategies for each.",
      tasks: [
        "Identify database single-primary SPOF.",
        "Identify Redis single-node SPOF.",
        "Draft Multi-AZ failover and PITR strategy document.",
      ],
    },
    quiz: [
      {
        question: "What does an RPO (Recovery Point Objective) of 5 minutes mean for a production database system?",
        options: [
          "In the worst-case disaster recovery scenario, at most 5 minutes of recent data transactions could be lost.",
          "The database restarts in 5 minutes.",
          "Queries take 5 minutes to run.",
          "Backups run every 5 years.",
        ],
        answer: 0,
        explanation:
          "RPO measures the maximum acceptable data loss window measured backward in time from the moment of an incident.",
      },
    ],
  },

  "p39-l6": {
    id: "p39-l6",
    phaseId: "p39",
    title: "Capacity Planning & Honest Availability Targets",
    level: "Mastery",
    minutes: 30,
    summary:
      "Calculate high availability mathematics ('The Nines': 99.9% vs 99.99%). Estimate compute headroom, disk growth trajectories, and cloud cost budgets.",
    prerequisites: ["p39-l1 Stateless Scaling"],
    objectives: [
      "Calculate downtime budgets for 99.9% (Three Nines) vs 99.99% (Four Nines) SLAs.",
      "Calculate server compute headroom (target <65% average CPU for burst capacity).",
      "Model monthly infrastructure costs and project data growth over 12 months.",
    ],
    simple:
      "Clients often ask for '100% uptime', but 100% uptime does not exist in software. 99.9% uptime ('Three Nines') allows for 43 minutes of downtime per month and costs $200/month. 99.999% uptime ('Five Nines') allows only 26 seconds of downtime per year and costs $50,000/month. Capacity planning is choosing the right balance of reliability and cost for your business.",
    why:
      "Understanding uptime mathematics helps engineering teams establish honest SLAs and make sensible infrastructure investments.",
    mentalModel: {
      title: "The Insurance Policy Tiers",
      body:
        "Standard health insurance protects you against 99.9% of normal life events for a modest monthly premium. Hiring a full-time personal emergency medical trauma surgeon to follow you 24/7 (99.999%) costs millions.",
    },
    sections: [
      {
        heading: "1. The High Availability Downtime Table",
        body: [
          "- **99% (Two Nines)**: 3.65 days downtime / year. (Fine for internal hobby tools).",
          "- **99.9% (Three Nines)**: 8.76 hours downtime / year (~43 mins/month). (Standard SaaS).",
          "- **99.95% (Three and a Half Nines)**: 4.38 hours downtime / year. (High-tier SaaS).",
          "- **99.99% (Four Nines)**: 52.56 minutes downtime / year. (Enterprise Banking/Payment Gateways).",
        ],
      },
    ],
    mistake: {
      title: "Promising 99.99% SLA in Customer Contracts When Relying on a Single 99.9% Cloud Provider",
      wrong: [
        "// ❌ Promising 99.99% uptime when your cloud vendor only guarantees 99.9% SLA:",
        "// When the cloud provider has a 20-minute outage, you breach your legal SLA and owe customers refunds!",
      ].join("\n"),
      right: [
        "// ✅ Your system SLA is mathematically bounded by the composite SLA of all your upstream infrastructure providers.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author a Capacity Planning and Cost Projection Memo",
      description:
        "Calculate the 12-month compute, storage, and bandwidth cost trajectory for an app growing from 1,000 to 100,000 monthly active users.",
      tasks: [
        "Calculate database disk growth (50MB/user/year).",
        "Determine pool size and container replicas needed for 500 req/sec peak.",
        "Produce infrastructure budget spreadsheet.",
      ],
    },
    quiz: [
      {
        question: "How much total downtime is permitted per year under a 99.9% ('Three Nines') Availability SLA?",
        options: [
          "Approximately 8 hours and 45 minutes per year (or ~43 minutes per month).",
          "30 days.",
          "5 seconds.",
          "0 seconds.",
        ],
        answer: 0,
        explanation:
          "99.9% availability allows for 0.1% downtime: 365 days * 24 hours * 0.001 = ~8.76 hours per year.",
      },
    ],
  },
};
