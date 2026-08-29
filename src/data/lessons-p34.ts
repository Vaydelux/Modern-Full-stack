import type { LessonContent } from "./types";

export const LESSON_CONTENT_P34: Record<string, LessonContent> = {
  "p34-l1": {
    id: "p34-l1",
    phaseId: "p34",
    title: "Images, Containers & Your First Dockerfile",
    level: "Advanced",
    minutes: 35,
    summary:
      "Deconstruct Linux namespaces, cgroups, and container runtimes. Build production-grade Dockerfiles for Node.js / NestJS applications with non-root security.",
    prerequisites: ["p10-l1 NestJS Core", "p07-l1 HTTP Fundamentals"],
    objectives: [
      "Explain the fundamental difference between Virtual Machines (Hypervisor + Guest OS) and Containers (Shared Kernel + Namespaces).",
      "Write a secure, standard Node.js 20 Alpine Dockerfile.",
      "Run, inspect, and execute interactive shells inside running Docker containers.",
    ],
    simple:
      "A container packages your code, Node.js version, system libraries, and dependencies into a single immutable artifact ('Image'). Whether you run it on a MacBook, Windows PC, or Ubuntu Cloud server, it runs in the exact same environment with zero 'it works on my machine' problems.",
    why:
      "Docker is the universal packaging and execution standard for modern cloud computing (Kubernetes, AWS ECS, Google Cloud Run).",
    mentalModel: {
      title: "The Standardized Intermodal Shipping Container",
      body:
        "Before 1956, cargo had to be manually unpacked and repacked when moving from train to ship to truck. Standardized steel shipping containers allowed any crane in the world to load any cargo instantly. Docker containers are the standardized shipping containers for software code.",
    },
    sections: [
      {
        heading: "1. The Anatomy of a Node.js Dockerfile",
        body: [
          "- Use official slim/alpine base images (`node:20-alpine`).",
          "- Never run as root: drop privileges to built-in `node` user.",
          "- Set `NODE_ENV=production` for optimized runtime performance.",
        ],
        code: [
          {
            file: "Dockerfile",
            lang: "dockerfile",
            code: [
              "# Base Alpine Linux with Node.js 20",
              "FROM node:20-alpine",
              "",
              "# Set working directory inside container",
              "WORKDIR /app",
              "",
              "# Copy package files first to take advantage of Docker layer caching",
              "COPY package*.json ./",
              "RUN npm ci --omit=dev",
              "",
              "# Copy compiled application code",
              "COPY dist/ ./dist/",
              "",
              "# Drop root privileges for security",
              "USER node",
              "",
              "# Expose application port and start server",
              "EXPOSE 3000",
              "CMD [\"node\", \"dist/main.js\"]",
            ].join("\n"),
            caption: "Production Node.js Alpine Dockerfile with non-root security.",
          },
        ],
      },
    ],
    mistake: {
      title: "Copying the Entire Project (Including local node_modules) Into the Image",
      wrong: [
        "// ❌ Missing .dockerignore file:",
        "COPY . .",
        "// Copies your Mac/Windows local node_modules into the Linux container, breaking native C++ binary addons!",
      ].join("\n"),
      right: [
        "// ✅ Add .dockerignore containing:",
        "node_modules",
        "dist",
        ".git",
        ".env",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build and Run a NestJS Container Locally",
      description:
        "Build a Docker image from scratch, run it with port binding `3000:3000`, and execute `curl http://localhost:3000/api/health`.",
      tasks: [
        "Create `.dockerignore`.",
        "Build image: `docker build -t taskforge-api:v1 .`.",
        "Run container: `docker run -p 3000:3000 --rm taskforge-api:v1`.",
      ],
    },
    quiz: [
      {
        question: "Why should you never run production Node.js applications as the 'root' user inside a Docker container?",
        options: [
          "Root users cannot access the internet.",
          "If an attacker executes Remote Code Execution (RCE) inside your app, running as root grants them unrestricted access to the container filesystem and increases the risk of container-escape exploits.",
          "Node.js crashes when run as root.",
          "Alpine Linux does not have a root user.",
        ],
        answer: 1,
        explanation:
          "Principle of Least Privilege requires running processes as non-root users (like 'node') to limit damage in the event of an exploit.",
      },
    ],
  },

  "p34-l2": {
    id: "p34-l2",
    phaseId: "p34",
    title: "Layers, Caching & Multi-Stage Builds",
    level: "Advanced",
    minutes: 35,
    summary:
      "Slash image sizes from 1.2GB down to 110MB using Multi-Stage Docker builds. Master Docker layer caching to reduce CI build times from 5 minutes to 15 seconds.",
    prerequisites: ["p34-l1 Dockerfile Basics"],
    objectives: [
      "Understand Docker union filesystems and copy-on-write layer caching.",
      "Write multi-stage Docker builds separating Build Tools (TypeScript, compilers) from Runtime artifacts.",
      "Optimize Dockerfile instruction ordering so dependency layers are never needlessly re-installed.",
    ],
    simple:
      "When building TypeScript apps, you need heavy compilers (`tsc`, `@types/*`, Webpack) to compile code into JavaScript. However, your production server only needs `node` and the generated `.js` files. Multi-stage builds use a temporary 'builder' container to compile the code, then copy only the tiny final JavaScript files into a super-slim production image.",
    why:
      "Slim images download 10x faster during autoscaling events and eliminate vulnerability attack surface by stripping compilers and dev dependencies.",
    mentalModel: {
      title: "The Construction Scaffolding",
      body:
        "You need heavy steel scaffolding, cranes, and cement mixers while building a skyscraper. But once the building is finished, you remove all the scaffolding so tenants can move into a clean, sleek building.",
    },
    sections: [
      {
        heading: "1. Production Multi-Stage Dockerfile Pattern",
        body: [
          "- **Stage 1 (Builder)**: Installs all dev dependencies, runs `prisma generate`, and compiles TypeScript (`npm run build`).",
          "- **Stage 2 (Runner)**: Starts from a fresh Alpine image, installs only production dependencies, copies compiled `/dist`, and runs as non-root.",
        ],
        code: [
          {
            file: "Dockerfile.multistage",
            lang: "dockerfile",
            code: [
              "# Stage 1: Build & Compile",
              "FROM node:20-alpine AS builder",
              "WORKDIR /app",
              "COPY package*.json ./",
              "RUN npm ci",
              "COPY prisma ./prisma/",
              "RUN npx prisma generate",
              "COPY . .",
              "RUN npm run build",
              "",
              "# Stage 2: Minimal Production Runtime",
              "FROM node:20-alpine AS runner",
              "WORKDIR /app",
              "ENV NODE_ENV=production",
              "",
              "# Copy production dependencies and compiled artifacts only",
              "COPY package*.json ./",
              "RUN npm ci --omit=dev",
              "COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma",
              "COPY --from=builder /app/dist ./dist",
              "",
              "USER node",
              "EXPOSE 3000",
              "CMD [\"node\", \"dist/main.js\"]",
            ].join("\n"),
            caption: "High-efficiency multi-stage build pattern.",
          },
        ],
      },
    ],
    mistake: {
      title: "Copying Source Code Before package.json in Dockerfile",
      wrong: [
        "// ❌ Bad layer order:",
        "COPY . .",
        "RUN npm install",
        "// Every time you change 1 line of source code, Docker invalidates the layer cache and re-downloads all npm packages!",
      ].join("\n"),
      right: [
        "// ✅ Copy package*.json first, run npm install, THEN copy source code:",
        "COPY package*.json ./",
        "RUN npm ci",
        "COPY . .",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Shrink an Image from 1GB to 120MB",
      description:
        "Build a single-stage image and inspect `docker images`, then convert to a multi-stage Dockerfile and observe the 90% size reduction.",
      tasks: [
        "Build single-stage -> note size: ~980MB.",
        "Refactor to multi-stage -> note size: ~115MB.",
        "Verify `docker run` starts identically and passes health checks.",
      ],
    },
    quiz: [
      {
        question: "What is the primary advantage of Docker multi-stage builds?",
        options: [
          "They eliminate heavy build tools, TypeScript compilers, and devDependencies from the final production runtime image.",
          "They make Docker images run in Kubernetes without YAML.",
          "They convert JavaScript to machine code.",
          "They bypass Linux permissions.",
        ],
        answer: 0,
        explanation:
          "Multi-stage builds let you compile in an intermediate environment and produce a stripped-down, secure final runtime container.",
      },
    ],
  },

  "p34-l3": {
    id: "p34-l3",
    phaseId: "p34",
    title: "Compose for Local API + Worker + Redis",
    level: "Advanced",
    minutes: 40,
    summary:
      "Orchestrate complete multi-container local engineering environments using Docker Compose. Connect NestJS API, BullMQ background worker, Redis, and PostgreSQL with a single `docker compose up` command.",
    prerequisites: ["p34-l1 Dockerfile Basics", "p25-l1 Redis", "p13-l1 Postgres"],
    objectives: [
      "Author declarative `docker-compose.yml` configurations with service networking.",
      "Coordinate service dependencies using `depends_on` with health condition checks.",
      "Share persistent named volumes across container restarts.",
    ],
    simple:
      "Instead of writing a 10-page onboarding guide telling new engineers to 'Install Postgres 16, install Redis 7, set these 15 environment variables, and start 3 separate terminal tabs', Docker Compose defines your entire stack in one YAML file. Running `docker compose up` starts everything in 5 seconds with pre-wired internal networking.",
    why:
      "Docker Compose ensures 100% environment parity between all team members and eliminates onboarding friction.",
    mentalModel: {
      title: "The Symphony Conductor Score",
      body:
        "Each musician (API, Worker, Postgres, Redis) plays their own instrument. Docker Compose is the conductor's sheet music that tells everyone when to start playing and keeps them perfectly in sync.",
    },
    sections: [
      {
        heading: "1. The Complete Local Stack docker-compose.yml",
        body: [
          "- Internal bridge network allows services to communicate by service name (`postgres:5432`, `redis:6379`).",
          "- Healthcheck-based `depends_on` ensures API does not start until Postgres is genuinely accepting connections.",
        ],
        code: [
          {
            file: "docker-compose.yml",
            lang: "yaml",
            code: [
              "version: '3.8'",
              "",
              "services:",
              "  postgres:",
              "    image: postgres:16-alpine",
              "    environment:",
              "      POSTGRES_USER: taskforge",
              "      POSTGRES_PASSWORD: secret_password",
              "      POSTGRES_DB: taskforge_dev",
              "    ports:",
              "      - '5432:5432'",
              "    volumes:",
              "      - postgres_data:/var/lib/postgresql/data",
              "    healthcheck:",
              "      test: ['CMD-SHELL', 'pg_isready -U taskforge -d taskforge_dev']",
              "      interval: 5s",
              "      timeout: 5s",
              "      retries: 5",
              "",
              "  redis:",
              "    image: redis:7-alpine",
              "    ports:",
              "      - '6379:6379'",
              "    volumes:",
              "      - redis_data:/data",
              "",
              "  api:",
              "    build: .",
              "    ports:",
              "      - '3000:3000'",
              "    environment:",
              "      DATABASE_URL: postgresql://taskforge:secret_password@postgres:5432/taskforge_dev",
              "      REDIS_URL: redis://redis:6379",
              "    depends_on:",
              "      postgres:",
              "        condition: service_healthy",
              "      redis:",
              "        condition: service_started",
              "",
              "volumes:",
              "  postgres_data:",
              "  redis_data:",
            ].join("\n"),
            caption: "Production-ready Docker Compose orchestration manifest.",
          },
        ],
      },
    ],
    mistake: {
      title: "Using 'localhost' for Database Host Inside a Docker Container",
      wrong: [
        "// ❌ Setting DATABASE_URL='postgresql://taskforge:secret@localhost:5432' inside the API container:",
        "// Inside the container, 'localhost' refers to the API container itself, NOT the host machine or the Postgres container!",
      ].join("\n"),
      right: [
        "// ✅ Use the Docker Compose service DNS name: `postgresql://taskforge:secret@postgres:5432/taskforge_dev`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Boot the Complete Stack with One Command",
      description:
        "Launch Postgres, Redis, and API via Docker Compose, insert a record via Prisma Studio, and verify data persists across `docker compose down` and `docker compose up`.",
      tasks: [
        "Run `docker compose up -d`.",
        "Check status with `docker compose ps`.",
        "Inspect logs with `docker compose logs -f api`.",
      ],
    },
    quiz: [
      {
        question: "How do Docker Compose services discover and communicate with each other over the default network bridge?",
        options: [
          "Using their declared YAML service names (e.g. 'postgres', 'redis') as automatic internal DNS hostnames.",
          "By broadcasting raw Ethernet packets.",
          "Via public IP addresses.",
          "Through USB ports.",
        ],
        answer: 0,
        explanation:
          "Docker Compose automatically configures an internal DNS server that resolves service names to their respective container IP addresses.",
      },
    ],
  },
};
