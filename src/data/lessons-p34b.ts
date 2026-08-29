import type { LessonContent } from "./types";

export const LESSON_CONTENT_P34B: Record<string, LessonContent> = {
  "p34-l4": {
    id: "p34-l4",
    phaseId: "p34",
    title: "Health Checks, Volumes & Environment Boundaries",
    level: "Advanced",
    minutes: 30,
    summary:
      "Configure robust container persistence, volume mounting strategies, and strict `.env` boundary isolation between local dev, preview branches, and production.",
    prerequisites: ["p34-l3 Docker Compose"],
    objectives: [
      "Distinguish Named Volumes (persistent DB storage) from Bind Mounts (local hot-reloading).",
      "Author Dockerfile `HEALTHCHECK` directives for standalone image self-testing.",
      "Safely manage secrets using Docker Compose `.env` interpolation without committing secrets to version control.",
    ],
    simple:
      "Containers are ephemeral by default — if you delete a Postgres container, all your tables and records vanish instantly. Named volumes map a permanent folder on your host machine to the container's `/var/lib/postgresql/data` directory, ensuring your database survives container upgrades and restarts.",
    why:
      "Understanding volumes prevents catastrophic data loss during routine Docker restarts.",
    mentalModel: {
      title: "The Rental Car and the Luggage Trunk",
      body:
        "The rental car (Container) can be swapped for a new model at any time. Your luggage (Volume) stays in your hands and can be placed in any trunk without losing your belongings.",
    },
    sections: [
      {
        heading: "1. Volumes vs Bind Mounts in Local Development",
        body: [
          "- **Named Volumes (`postgres_data:/var/lib/postgresql/data`)**: Managed by Docker engine; high I/O speed; ideal for databases.",
          "- **Bind Mounts (`./src:/app/src:ro`)**: Directly maps local source code into container for instant hot-reloading during development.",
        ],
        code: [
          {
            file: "docker-compose.override.yml",
            lang: "yaml",
            code: [
              "# Local development hot-reload override",
              "services:",
              "  api:",
              "    build:",
              "      context: .",
              "      target: builder",
              "    command: npm run start:dev",
              "    volumes:",
              "      - ./src:/app/src",
              "      - ./package.json:/app/package.json",
              "      - /app/node_modules # Anonymous volume to prevent local override of container dependencies",
            ].join("\n"),
            caption: "Development override with bind mounts for hot reloading.",
          },
        ],
      },
    ],
    mistake: {
      title: "Hardcoding Production Passwords in docker-compose.yml",
      wrong: [
        "// ❌ Committing plain secrets in docker-compose.yml:",
        "POSTGRES_PASSWORD: 'MySuperProductionPassword123!'",
      ].join("\n"),
      right: [
        "// ✅ Use environment variable interpolation with fallback: `${POSTGRES_PASSWORD}`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Test Database Volume Persistence",
      description:
        "Create a database record, execute `docker compose down`, delete the containers, start them back up with `docker compose up -d`, and verify the record is still present.",
      tasks: [
        "Insert mock user in PostgreSQL.",
        "Run `docker compose down`.",
        "Run `docker compose up -d` and query database -> verify user exists.",
      ],
    },
    quiz: [
      {
        question: "What happens to data stored in a Docker container if no volume is attached and the container is removed?",
        options: [
          "The data is backed up to Google Drive automatically.",
          "All data is permanently destroyed because the container's writable layer is deleted along with the container.",
          "The data is moved to the host's desktop.",
          "The data converts into a Docker image.",
        ],
        answer: 1,
        explanation:
          "Container filesystems are ephemeral; without volumes, all filesystem modifications are permanently lost upon container removal.",
      },
    ],
  },

  "p34-l5": {
    id: "p34-l5",
    phaseId: "p34",
    title: "Debugging Container Failures & When Managed Wins",
    level: "Advanced",
    minutes: 35,
    summary:
      "Triage common Docker exit codes (137 OOMKilled, 139 Segfault), inspect container networking with `docker exec`, and make pragmatic architectural decisions on when to use Self-Hosted Docker vs Managed Cloud Services (Supabase, Neon, Upstash).",
    prerequisites: ["p34-l1 Dockerfile Basics", "p34-l3 Docker Compose"],
    objectives: [
      "Diagnose Linux container exit codes (137 Out of Memory, 127 Command Not Found).",
      "Debug networking partitions using `docker network inspect` and `curl` from inside containers.",
      "Evaluate total cost of ownership (TCO) between Self-Hosted Docker databases and Managed Cloud Services.",
    ],
    simple:
      "When a container exits unexpectedly with code 137, it means the Linux Out-Of-Memory (OOM) Killer terminated your process because it exceeded its RAM limit. Knowing how to inspect container logs, attach interactive debuggers, and make the mature decision on when to run Docker vs paying $25/mo for a managed database is what separates senior engineers from juniors.",
    why:
      "Self-hosting a mission-critical database in Docker without backups, automated failover, and point-in-time recovery often leads to catastrophic data loss.",
    mentalModel: {
      title: "The Power Generator vs The Power Grid",
      body:
        "You can run your own diesel generator in the backyard (Self-hosted Docker Postgres). But you must buy diesel, change oil, and replace spark plugs. Plugging into the electrical grid (Managed Neon / Supabase) gives you reliable power with zero maintenance.",
    },
    sections: [
      {
        heading: "1. Essential Container Debugging Commands",
        body: [
          "- `docker logs -f --tail 100 <container_id>`: View live tailing logs.",
          "- `docker exec -it <container_id> /bin/sh`: Open an interactive shell inside the container.",
          "- `docker inspect <container_id> | grep ExitCode`: Inspect termination status codes.",
          "- **Exit Code 137**: OOM Killed (`128 + 9 (SIGKILL)`).",
          "- **Exit Code 143**: Graceful SIGTERM termination (`128 + 15`).",
        ],
        code: [
          {
            file: "debug-commands.sh",
            lang: "bash",
            code: [
              "# 1. Check exit code and memory limits",
              "docker inspect taskforge-api --format='{{.State.ExitCode}} {{.State.OOMKilled}}'",
              "",
              "# 2. Test PostgreSQL TCP connectivity from inside the API container",
              "docker exec -it taskforge-api nc -zv postgres 5432",
              "",
              "# 3. Inspect internal bridge network IP allocations",
              "docker network inspect taskforge_default",
            ].join("\n"),
            caption: "Container debugging and networking diagnosis commands.",
          },
        ],
      },
    ],
    mistake: {
      title: "Self-Hosting Production Databases in Bare Docker on a Single VPS Without Automated Backups",
      wrong: [
        "// ❌ Running production Postgres on a $5/mo VPS in raw Docker with no replica or WAL archiving:",
        "// A single disk crash or corrupted filesystem will permanently destroy your entire company's data!",
      ].join("\n"),
      right: [
        "// ✅ Use managed cloud databases (Neon, Supabase, RDS, Cloud SQL) for production; use Docker for local dev & testing.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Diagnose and Fix a Container Memory Crash",
      description:
        "Start a container with a 64MB memory limit, run a memory-intensive script to trigger exit code 137, inspect with `docker inspect`, and adjust memory limits.",
      tasks: [
        "Run container with `--memory=64m`.",
        "Trigger heap allocation -> observe exit code 137.",
        "Verify `OOMKilled: true` in `docker inspect`.",
      ],
    },
    quiz: [
      {
        question: "What does Docker Exit Code 137 signify?",
        options: [
          "Syntax error in TypeScript.",
          "The container was terminated by the Linux Out-Of-Memory (OOM) killer via SIGKILL (128 + 9) because it exceeded its allocated memory quota.",
          "Port 3000 is already in use.",
          "Missing Dockerfile.",
        ],
        answer: 1,
        explanation:
          "137 is the standard Linux exit code indicating process termination by SIGKILL (Signal 9), commonly issued by the kernel OOM killer.",
      },
    ],
  },
};
