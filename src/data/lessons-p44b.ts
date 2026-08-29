import type { LessonContent } from "./types";

export const LESSON_CONTENT_P44B: Record<string, LessonContent> = {
  "p44-l4": {
    id: "p44-l4",
    phaseId: "p44",
    title: "Interview Drills: JS/TS/React/Next/Nest/SQL",
    level: "Mastery",
    minutes: 60,
    summary:
      "Master modern Senior Full-Stack technical interviews. Practice high-frequency system design, live-coding frameworks, and deep technical defenses across JavaScript, TypeScript, React, Next.js, NestJS, and PostgreSQL.",
    prerequisites: ["p44-l1", "p44-l2", "p44-l3"],
    objectives: [
      "Structure live-coding responses: Clarify requirements -> Propose API/Data model -> Implement core logic -> Address edge cases -> Analyze complexity.",
      "Defend architectural choices in System Design interviews (Tradeoffs, Caching, Sharding, Consistency vs Availability).",
      "Confidently answer deep dive technical questions (Event Loop microtasks vs macrotasks, React Fiber reconciliation, PostgreSQL MVCC, Prisma query generation).",
    ],
    simple:
      "Technical interviews for senior roles test how clearly you communicate tradeoffs and solve problems under observation. In this lesson, we practice real interview scenarios: whiteboard system design of a real-time collaborative tool, live-coding an async rate limiter in TypeScript, and deep dive conceptual questions on how the Node.js event loop and PostgreSQL transactions work under the hood.",
    why:
      "Structured communication and deep foundational knowledge turn stressful interviews into confident technical conversations.",
    mentalModel: {
      title: "The Senior Flight Captain Checkride",
      body:
        "The flight examiner gives unexpected engine failure scenarios. The captain doesn't panic — they calmly verbalize their checklist steps, adjust flight controls systematically, and explain every action clearly.",
    },
    sections: [
      {
        heading: "1. The 5-Step Live-Coding Framework",
        body: [
          "1. **Clarify**: Ask 2-3 scoping questions (inputs, expected outputs, scale, error handling).",
          "2. **Contract First**: Write the TypeScript interface or function signature before writing logic.",
          "3. **Verbalize Strategy**: Explain your algorithmic approach in 2 sentences before typing.",
          "4. **Implement Cleanly**: Write readable, idiomatic TypeScript with descriptive variable names.",
          "5. **Self-Test & Edge Cases**: Walk through an example with null/empty inputs and state Big-O time/space complexity.",
        ],
      },
    ],
    mistake: {
      title: "Jumping into Writing Code Instantly Without Asking Clarifying Questions or Explaining Strategy",
      wrong: [
        "// ❌ Starting to type silently the second the interviewer finishes speaking:",
        "// If you misunderstand the requirements, you waste 30 minutes solving the wrong problem!",
      ].join("\n"),
      right: [
        "// ✅ Spend 2 minutes confirming requirements and outlining your strategy before typing.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Timed Mock Technical Interview Circuit",
      description:
        "Complete 3 timed technical interview challenges: 1) Implement a generic Async Concurrency Pool in TypeScript, 2) Design an URL Shortener with PostgreSQL & Redis, 3) Explain React Server Components mental model.",
      tasks: [
        "Code async concurrency pool with unit tests.",
        "Draw system design architecture diagram.",
        "Record 3-minute verbal defense.",
      ],
    },
    quiz: [
      {
        question: "What is the most effective way to communicate during a live technical coding interview?",
        options: [
          "Think out loud, verbalize your reasoning and tradeoffs continuously, clarify requirements upfront, and test your own code with edge cases before declaring it finished.",
          "Remain completely silent until all code is typed.",
          "Argue aggressively with the interviewer.",
          "Copy and paste answers from ChatGPT.",
        ],
        answer: 0,
        explanation:
          "Interviewers evaluate problem-solving clarity, communication skills, and collaborative reasoning as much as final syntax.",
      },
    ],
  },

  "p44-l5": {
    id: "p44-l5",
    phaseId: "p44",
    title: "Portfolio, README & Architecture Diagrams",
    level: "Mastery",
    minutes: 35,
    summary:
      "Craft world-class GitHub repositories that impress engineering managers and lead architects. Author high-signal READMEs, interactive C4 architecture diagrams, and live demonstration walk-throughs.",
    prerequisites: ["p41-m6", "p42-m5", "p43-m4"],
    objectives: [
      "Structure GitHub repository READMEs that engineering leaders love to read in under 60 seconds.",
      "Create clean, informative architecture diagrams using Mermaid.js and C4 model notation.",
      "Document performance benchmarks, test coverage reports, and Architecture Decision Records (ADRs).",
    ],
    simple:
      "Hiring managers look at hundreds of GitHub profiles. Generic to-do lists get ignored in 5 seconds. A repository with a live demo link, crisp Architecture Diagram, ERD schema, documented tradeoffs, test coverage badges, and clear local setup instructions immediately signals: 'This engineer understands how real software is built.'",
    why:
      "A high-signal portfolio and well-documented open-source repos open doors to top-tier engineering roles.",
    mentalModel: {
      title: "The Architect's Exhibition Model",
      body:
        "When an architect presents a project to city planners, they don't just dump a stack of raw blueprints on the table. They present a beautiful 3D scale physical model alongside clear cross-section diagrams and environmental impact reports.",
    },
    sections: [
      {
        heading: "1. The Anatomy of a World-Class Repository README",
        body: [
          "1. **Header**: Project Name, 1-sentence value proposition, live demo link, CI build badge.",
          "2. **Architecture Diagram**: Mermaid.js diagram illustrating Frontend, Backend, Redis, and PostgreSQL data flows.",
          "3. **Core Engineering Features**: Highlight technical depth (e.g. 'Pessimistic locking prevents overselling', 'Full-Text GIN search <3ms').",
          "4. **Tech Stack & Tradeoffs**: Documented ADRs explaining key technology choices.",
          "5. **Local Quickstart**: 3-command Docker Compose local development setup instructions.",
        ],
      },
    ],
    mistake: {
      title: "Leaving the Default 'Created with Create-React-App / Next.js' Template README in Your Project",
      wrong: [
        "// ❌ Default template README: 'This is a Next.js project bootstrapped with create-next-app...':",
        "// Gives an immediate impression of low effort and lack of polish!",
      ].join("\n"),
      right: [
        "// ✅ Replace default READMEs with custom, professional documentation showcasing architecture and engineering depth.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author Production README for Capstone Portfolio",
      description:
        "Write a comprehensive, professional `README.md` for your capstone project including Mermaid architecture diagrams, ERD, tech stack choices, and Docker setup.",
      tasks: [
        "Create Mermaid.js architecture flow diagram.",
        "Document 4 key engineering achievements.",
        "Add step-by-step local development instructions with Docker Compose.",
      ],
    },
    quiz: [
      {
        question: "What elements make an engineering repository README immediately stand out to hiring managers and engineering leads?",
        options: [
          "A live demo link, clear architecture diagram, explanation of technical tradeoffs and invariants, test coverage, and a smooth 1-step local setup guide.",
          "Using 50 animated GIFs.",
          "Writing 10,000 words with no headings.",
          "Leaving the file blank.",
        ],
        answer: 0,
        explanation:
          "Clear visual architecture, documented engineering tradeoffs, and reproducible setup signal high engineering maturity.",
      },
    ],
  },

  "p44-l6": {
    id: "p44-l6",
    phaseId: "p44",
    title: "Staying Current: Release Notes as a Habit",
    level: "Mastery",
    minutes: 25,
    summary:
      "Build lifelong engineering excellence habits. Learn how to scan release notes, evaluate major framework breaking changes, manage automated dependency upgrades, and navigate technical shifts gracefully.",
    prerequisites: ["p00-l1 Development Setup"],
    objectives: [
      "Establish a weekly 15-minute rhythm for reading framework release notes (TypeScript, Next.js, React, Node.js, PostgreSQL).",
      "Evaluate major version upgrade breaking changes and author migration plans.",
      "Safely automate patch/minor dependency upgrades with Dependabot or Renovate.",
    ],
    simple:
      "Web development evolves constantly: React introduces Server Components, TypeScript adds new type-narrowing operators, PostgreSQL adds new index types. The best engineers don't panic or chase every Twitter trend — they build a simple habit of reading official Release Notes, understanding the 'why' behind new APIs, and keeping dependencies updated incrementally.",
    why:
      "Lifelong curiosity and disciplined release note reading ensure your skills remain elite for decades.",
    mentalModel: {
      title: "The Master Chef's Seasonal Market Visit",
      body:
        "A master chef visits the fresh morning market every week to see what new ingredients are in season. They don't throw away their classic French cooking techniques — they simply enrich their recipes with the best fresh produce.",
    },
    sections: [
      {
        heading: "1. The 15-Minute Weekly Radar Routine",
        body: [
          "- **Monday Morning**: Scan official GitHub Releases for core stack: TypeScript, React, Next.js, NestJS, Prisma.",
          "- **Evaluate RFCs**: Read 'RFC' (Request for Comments) discussions to see what features are being designed 6-12 months ahead.",
          "- **Automate Upgrades**: Use Renovate Bot to create automated PRs for minor/patch dependencies with passing CI checks.",
        ],
      },
    ],
    mistake: {
      title: "Letting Dependencies Age 3 Years Without Upgrades Until a Massive Broken Rewrite is Required",
      wrong: [
        "// ❌ Ignoring dependencies for years until a critical zero-day CVE forces a nightmare 5-version jump all at once!",
      ].join("\n"),
      right: [
        "// ✅ Keep dependencies updated continuously with weekly automated Renovate PRs backed by green CI test suites.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Author a Major Framework Migration Memo",
      description:
        "Read a major version migration guide (e.g. Next.js 14 to 15 or Prisma 5 to 6), identify breaking changes relevant to an application, and author the Upgrade Plan.",
      tasks: [
        "Identify 3 breaking changes in release notes.",
        "Write step-by-step code migration instructions.",
        "Produce `UPGRADE_MIGRATION_MEMO.md`.",
      ],
    },
    quiz: [
      {
        question: "What is the most sustainable strategy for keeping production software dependencies healthy and secure over multiple years?",
        options: [
          "Continuous, automated minor and patch updates backed by comprehensive CI test suites, combined with disciplined reading of major release notes.",
          "Never updating anything ever again.",
          "Reinstalling the operating system weekly.",
          "Rewriting the entire application from scratch every 6 months.",
        ],
        answer: 0,
        explanation:
          "Continuous automated incremental upgrades backed by automated tests prevent painful technical debt and security vulnerabilities.",
      },
    ],
  },
};
