import type { LessonContent } from "./types";

/**
 * Pass 001 bounded content batch: Phase 0, Lessons 1–3.
 * Every lesson fulfills the full quality contract. No placeholders.
 */
export const LESSONS_P0: LessonContent[] = [
  {
    id: "p00-l1",
    phaseId: "p00",
    title: "The Full-Stack Map: Browser → Server → Database",
    level: "Foundation",
    minutes: 25,
    summary:
      "Before any framework, you need the map: a browser shows things, a server decides things, a database remembers things. This lesson pins every tool in this course to a job on that map.",
    prerequisites: ["Curiosity. No code required yet."],
    objectives: [
      "Name the three jobs of a web system: presentation, authority, memory.",
      "Place React/Next.js, NestJS, Prisma, and PostgreSQL on the request path.",
      "Explain why the browser is never trusted with important decisions.",
      "Distinguish authentication (who are you?) from authorization (may you do this?).",
    ],
    simple:
      "Every web app is three jobs working together. The browser (your phone or laptop) shows the screen and collects your input. A server (a computer that is always on) checks the rules and does the work. A database (an extremely careful filing system) remembers everything long-term. When you tap 'Buy', your browser sends a message to the server over HTTP, the server checks the rules — price, stock, your account — and asks the database to record the order. The database answers, the server answers, your browser updates the screen.",
    why:
      "Almost every serious web bug — and every serious web security hole — is a confusion about which layer owns which job. If you believe the browser enforces rules, you will build apps that anyone can bypass with free tools. If you believe the database is 'just storage', you will lose data to race conditions. This single mental map is the hook every later concept hangs on: hooks render the browser layer, guards protect the server layer, transactions protect the memory layer.",
    mentalModel: {
      title: "The Restaurant",
      body: "A web app is a restaurant. The dining room (browser) is where customers sit — it looks nice, takes orders, and shows the menu, but it cooks nothing. The kitchen (server) is where rules are enforced: it checks the order is valid, the ingredients exist, and the customer can pay. The walk-in pantry (database) is where things are stored permanently and precisely — labels, quantities, dates. The waiters (HTTP requests/responses) carry messages between rooms in a strict format (JSON). A customer yelling 'I'm the manager!' in the dining room changes nothing — the kitchen still checks. That is the whole security model of this course in one image.",
    },
    sections: [
      {
        heading: "The request path, exactly",
        body: [
          "Type a URL and press Enter, and a chain reaction begins. Your browser asks a DNS server to translate the domain name into an IP address, opens an encrypted HTTPS connection to that address, and sends an HTTP request — a structured text message with a method (like GET or POST), headers (metadata), and sometimes a JSON body (data).",
          "The server receives the request, runs your application code, and usually needs to remember or retrieve something, so it talks to the database — often through an ORM like Prisma, which turns JavaScript objects into SQL. The database answers, the server wraps the result into an HTTP response with a status code (200 means OK, 404 means not found, 401 means who are you, 403 means you are not allowed), and the browser renders it.",
          "Every lesson in this course lives on one stop of this path. When something breaks, your first debugging question will always be: which stop failed?",
        ],
        code: [
          {
            file: "terminal — talking to a real API",
            lang: "bash",
            code: [
              "# curl sends an HTTP request from your terminal — no browser involved.",
              "# This proves the server answers the same way to any correct client.",
              "curl -s https://api.github.com/zen",
              "",
              "# Ask for JSON and look at a real request/response cycle:",
              'curl -s -H "Accept: application/json" https://api.github.com/zen',
              "",
              "# A GET request with a JSON body comes back:",
              'curl -s https://api.github.com/users/torvalds | head -n 8',
            ].join("\n"),
            caption: "Run these in your terminal. You are the browser now.",
          },
        ],
      },
      {
        heading: "Who owns what (the table you will quote forever)",
        body: [
          "React and Next.js own presentation: what the user sees and how input feels. They validate input for friendliness — showing 'email looks wrong' instantly — but that validation is a courtesy, never a rule.",
          "NestJS (running on Node.js with the Fastify engine) owns authority: it verifies identity tokens, checks permissions, applies business rules, runs transactions, and writes audit logs. If a rule matters, it lives here.",
          "Prisma owns translation: it turns typed JavaScript calls into SQL and maps results back. It never decides rules by itself.",
          "PostgreSQL (hosted by Supabase in this course) owns memory and final integrity: constraints like 'email must be unique' and 'quantity cannot be negative' are the last line of defense, because the database outlives any single server.",
          "Supabase Auth owns identity: it issues the tokens that prove who a user is. NestJS then checks those tokens and decides what that identity may do. Authentication is 'who are you?'. Authorization is 'may you do this?'. Never confuse them.",
        ],
        code: [
          {
            file: "shape of the data they exchange — user.json",
            lang: "json",
            code: [
              "{",
              '  "id": "u_9f3b21",',
              '  "email": "ada@example.com",',
              '  "role": "admin",',
              '  "createdAt": "2026-02-03T18:22:41.000Z"',
              "}",
            ].join("\n"),
            caption: "JSON is the lingua franca: JavaScript Object Notation. Keys and values, sent as text over HTTP.",
          },
        ],
      },
      {
        heading: "Runtimes, frameworks, libraries, ORMs — four words people blur",
        body: [
          "A runtime executes code. Node.js runs JavaScript outside the browser — that is what lets the same language power your server. A library is a toolbox you call when you want (React: 'here, render this UI'). A framework is a house you move into — it calls your code and has opinions about where things live (Next.js, NestJS). An ORM maps objects in your language to rows in a database (Prisma).",
          "This course's stack is deliberately boring-in-a-good-way: React + Next.js in front, NestJS on Fastify behind, Prisma in the middle, PostgreSQL at the bottom, Supabase providing the managed database, auth, and file storage. Each one exists because the layer below it needed a specialist.",
        ],
      },
      {
        heading: "The browser is a hostile witness",
        body: [
          "Here is the single most important security fact of your new career: anything in the browser can be changed by the user. Buttons can be re-enabled with DevTools, hidden fields can be edited, JavaScript can be replaced entirely, and requests can be forged with curl. A 'disabled' delete button stops honest users, not attackers.",
          "So the rule of this course is absolute: the frontend validates for user experience; the backend validates and authorizes for truth. Every lesson that touches user input will repeat this boundary until it is reflex.",
        ],
      },
    ],
    mistake: {
      title: "Hiding the UI and calling it security",
      wrong: [
        "// DANGER: the only thing stopping a free user",
        "// from reaching admin tools is a UI check.",
        "if (user.plan === 'pro') {",
        "  showAdminPanel();   // 'secure' because it is hidden",
        "}",
        "",
        "// The endpoint trusts whoever calls it:",
        "app.get('/api/admin/export-all', (req, res) => {",
        "  res.send(database.everything()); // no check here!",
        "});",
      ].join("\n"),
      right: [
        "// UI: hide the panel for kindness (UX only)",
        "if (user.plan === 'pro') showAdminPanel();",
        "",
        "// Server: enforce the rule where it matters",
        "app.get('/api/admin/export-all', requireAuth, requireRole('admin'),",
        "  (req, res) => {",
        "    auditLog(req.user.id, 'export-all');",
        "    res.send(buildExport());",
        "  });",
      ].join("\n"),
      explain:
        "Anyone can call /api/admin/export-all directly with curl and a forged or stolen token. The server must verify identity (authentication) and permission (authorization) on every sensitive route. The UI check stays — but as politeness, not protection.",
    },
    tryIt: [
      "Open DevTools (F12) → Network tab on any site you use daily. Refresh. Click a request that returns JSON and read its status code, headers, and body.",
      "Find the request that loads your user/profile data. Which fields does the server trust you with? Which ones would be dangerous if you could edit them?",
      "Run the curl commands from this lesson in your terminal. Compare the responses to what the browser showed you.",
      "Write the stack of a food-delivery app on paper: what does the browser do when you tap 'Order'? What must the server check? What must the database remember?",
    ],
    challenge: {
      prompt:
        "Pick any app you know well (music streaming, notes, banking). Write a one-page 'layer audit': list 5 features and, for each, state what the browser shows, what the server must verify, and what the database must store. Flag any feature where trusting the browser would be dangerous, and say how an attacker would exploit it.",
      hints: [
        "Start with features that involve money, privacy, or other people's data — that is where the interesting boundaries are.",
        "For each feature ask: 'if I edited the request with curl before it left my machine, what could go wrong?'",
        "Structure each row as: Feature → Browser job → Server job → Database job → Danger if browser is trusted.",
      ],
      solution: [
        "Example rows for a banking app:",
        "",
        "1) View balance — Browser: render the number. Server: verify the session token and that the account belongs to the requester. DB: store balances with a constraint that they match the sum of transactions. Danger if browser trusted: edit the response to show any balance — harmless for display, catastrophic if any decision trusts it.",
        "",
        "2) Transfer money — Browser: form + confirmation. Server: re-verify amount limits, daily caps, recipient validity, then run a transaction (debit AND credit, or neither). DB: enforce the movement atomically; never allow negative balances. Danger: an attacker replays a modified request with amount: -5000 to deposit money. Only server-side rules and database constraints stop it.",
        "",
        "3) 'Forgot password' — Browser: the form. Server: rate-limit requests, issue a single-use, expiring token, and never reveal whether the email exists. DB: store hashed passwords only. Danger: without server rate limiting, attackers brute-force reset tokens.",
        "",
        "Notice the pattern: the browser is a display and input device; every consequential decision happens in the server layer, with the database as the final integrity guard.",
      ].join("\n"),
    },
    quiz: [
      {
        q: "A user edits a hidden form field to set price: 0 before checkout. Which layer must stop this?",
        options: [
          "The browser, because it rendered the form",
          "The server (NestJS), because it owns business rules",
          "The database cannot help here",
          "React state, because it held the original value",
        ],
        answer: 1,
        explain:
          "Anything in the browser can be tampered with. The server must re-validate the price against its own source of truth before creating the order.",
      },
      {
        q: "Which pairing is correct?",
        options: [
          "Authentication = may you do this? / Authorization = who are you?",
          "Authentication = who are you? / Authorization = may you do this?",
          "They are synonyms",
          "Authorization happens in the browser",
        ],
        answer: 1,
        explain:
          "Authentication proves identity (Supabase Auth issues the token). Authorization decides permission (NestJS checks it on every request).",
      },
      {
        q: "What is Prisma's job in this architecture?",
        options: [
          "Deciding which users are admins",
          "Rendering the user interface",
          "Translating typed code into SQL and mapping results back",
          "Issuing login tokens",
        ],
        answer: 2,
        explain:
          "Prisma is an ORM — a translator between your code and PostgreSQL. Rules live in NestJS; identity lives in Supabase Auth.",
      },
      {
        q: "An HTTP 403 status code means…",
        options: [
          "The server crashed",
          "The resource was not found",
          "You are authenticated but not allowed to do this",
          "The request succeeded",
        ],
        answer: 2,
        explain:
          "401 = who are you (missing/invalid identity). 403 = I know you, and the answer is no. Confusing them is a classic API bug.",
      },
      {
        q: "Why does this course keep Prisma out of the browser bundle entirely?",
        options: [
          "It would make the page load slightly slower",
          "Browser code is user-controlled; direct DB access from it would bypass every rule and leak credentials",
          "Prisma only works on Windows",
          "Next.js forbids it by license",
        ],
        answer: 1,
        explain:
          "A database connection in the browser means connection secrets in the browser and zero authority between user and data. Data access stays in NestJS/workers.",
      },
      {
        q: "Which statement about frontend validation is true?",
        options: [
          "It is unnecessary if the backend validates",
          "It is UX: instant, friendly feedback — never a security boundary",
          "It replaces backend validation for simple fields",
          "It runs on the server before the request",
        ],
        answer: 1,
        explain:
          "Frontend validation makes forms pleasant and catches typos early. The backend re-validates everything, because requests can arrive from anywhere.",
      },
    ],
    flashcards: [
      { front: "The three jobs of a web system", back: "Presentation (browser) shows and collects. Authority (server) verifies and decides. Memory (database) stores with integrity." },
      { front: "Authentication vs Authorization", back: "Authentication: who are you? (identity, tokens). Authorization: may you do this? (permissions, checked per request on the server)." },
      { front: "HTTP in one line", back: "A structured text protocol: request (method + headers + optional JSON body) → response (status code + headers + body), usually over encrypted HTTPS." },
      { front: "What an ORM does", back: "Maps objects in your language to rows in a database. Prisma turns typed calls into SQL and results back into typed objects. It translates; it does not decide rules." },
      { front: "Runtime vs framework vs library", back: "Runtime executes code (Node.js). Library: you call it (React). Framework: it calls you and has opinions (Next.js, NestJS)." },
      { front: "Why the browser is never trusted", back: "Everything in it — HTML, JS, state, requests — can be modified by the user or forged with curl. Consequential checks belong on the server." },
      { front: "200 / 401 / 403 / 404", back: "200 OK · 401 who are you? · 403 known but not allowed · 404 not found." },
      { front: "Where each course tool lives", back: "React/Next.js → presentation. NestJS+Fastify → authority. Prisma 7.9.15 → translation. PostgreSQL (Supabase) → memory + final constraints. Supabase Auth → identity." },
    ],
    recap: [
      "A web app = presentation (browser) + authority (server) + memory (database), connected by HTTP requests carrying JSON.",
      "React/Next.js render, NestJS decides, Prisma translates, PostgreSQL remembers, Supabase Auth proves identity.",
      "The browser is user-controlled: frontend validation is UX, backend validation is law.",
      "Authentication (who) and authorization (allowed?) are different jobs, and both are server-side concerns.",
      "When anything breaks, ask: which stop on the request path failed?",
    ],
    references: [
      { label: "MDN — Client-server overview", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview" },
      { label: "MDN — An overview of HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
      { label: "Next.js docs", url: "https://nextjs.org/docs" },
      { label: "NestJS docs", url: "https://docs.nestjs.com" },
      { label: "Prisma docs", url: "https://www.prisma.io/docs" },
      { label: "Supabase docs", url: "https://supabase.com/docs" },
    ],
    nextBridge:
      "You have the map. Next, you set up the tools every later lesson assumes: a terminal you can drive, Node.js, pnpm, Git, and a GitHub workflow — the Developer's Toolkit.",
  },

  {
    id: "p00-l2",
    phaseId: "p00",
    title: "The Developer's Toolkit: Terminal, Node, pnpm, Git",
    level: "Foundation",
    minutes: 35,
    summary:
      "Frameworks come and go; the terminal, Node.js, a package manager, and Git stay. This lesson makes those four tools reflexive — navigation, installing dependencies, reading package.json and semver, protecting secrets, and shipping code through GitHub.",
    prerequisites: ["p00-l1 — The Full-Stack Map"],
    objectives: [
      "Navigate and manage files from the terminal (PowerShell or bash).",
      "Install Node.js LTS and verify tool versions like a professional.",
      "Initialize a pnpm project and explain every field of package.json.",
      "Read semver ranges (^, ~, exact) and predict what they allow.",
      "Keep secrets out of Git with .gitignore and .env.example.",
      "Commit and push a project to GitHub with a clean history.",
    ],
    simple:
      "Professional developers spend their day in four places: a terminal (a text-message conversation with your computer), Node.js (the engine that runs JavaScript outside the browser), a package manager (a librarian that fetches and records the code libraries you depend on — we use pnpm), and Git (a time machine that records every change to your project and syncs it to GitHub). Master these four and every framework in this course is just a passenger.",
    why:
      "Every 'it doesn't work' forum post in history is usually one of: wrong folder, wrong version, missing dependency, or missing environment variable. This lesson removes those four failure classes permanently. It also establishes the secrets discipline (never commit .env) that the security phase will assume you already have.",
    mentalModel: {
      title: "The Workshop Ledger",
      body: "Think of your project folder as a workshop. The terminal is how you walk around it. package.json is the ledger: what the workshop is called, how to start the machines (scripts), and which supplies it ordered (dependencies). node_modules is the actual shelf of supplies — bulky, replaceable, and never shipped with the workshop, because anyone can re-order from the ledger with pnpm install. The .env file holds the workshop keys — kept in a personal safe, never in the shipping crate. Git is the workshop's photograph album: every commit is a dated photo you can restore, and GitHub is the off-site archive.",
    },
    sections: [
      {
        heading: "Terminal reflexes (PowerShell and bash)",
        body: [
          "You only need a small vocabulary, used constantly: pwd shows where you are, ls (or dir on PowerShell) lists contents, cd moves you, mkdir creates a folder, and tab-completion saves your fingers. Get comfortable moving three levels deep and back without thinking.",
          "One habit separates professionals from beginners: before running a command that fails, check where you are and what version you have. node -v, pnpm -v, git --version — ten seconds of checking prevents an hour of confusion.",
        ],
        code: [
          {
            file: "terminal — daily vocabulary",
            lang: "bash",
            code: [
              "pwd                    # print working directory (where am I?)",
              "ls                     # list files (PowerShell: dir / ls alias)",
              "cd projects            # go into the 'projects' folder",
              "cd ..                  # go up one level",
              "mkdir hello-node       # create a folder",
              "cd hello-node",
              "",
              "# Version checks — run before ANYTHING that 'doesn't work':",
              "node -v                # v22.x.x LTS expected",
              "pnpm -v                # 10.x expected",
              "git --version          # 2.x expected",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Node.js and pnpm: engines and librarians",
        body: [
          "Node.js is the JavaScript runtime that powers every server in this course. Install the current LTS version (22.x at course baseline — see the Version Matrix) from nodejs.org or via a version manager, then verify with node -v.",
          "pnpm manages packages: it reads package.json, downloads dependencies once, and links them into your project efficiently. Enable it with corepack (ships with Node) and you are ready. The two commands you will type thousands of times: pnpm install (fetch everything in the ledger) and pnpm add <name> (order a new supply and record it).",
        ],
        code: [
          {
            file: "terminal — enabling pnpm via corepack",
            lang: "bash",
            code: [
              "# corepack ships with Node and manages package-manager versions",
              "corepack enable",
              "corepack prepare pnpm@latest --activate",
              "pnpm -v",
              "",
              "# Start a project: creates package.json (the ledger)",
              "mkdir hello-node && cd hello-node",
              "pnpm init",
              "",
              "# Add a dependency (recorded in package.json + lockfile)",
              "pnpm add picocolors",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "package.json and the semver language",
        body: [
          "package.json is the contract of a JavaScript project: name, scripts (shortcuts like pnpm dev), and dependencies. The lockfile (pnpm-lock.yaml) records the exact resolved versions — commit it, because it is what makes 'works on my machine' work on every machine.",
          "Version numbers follow semver: MAJOR.MINOR.PATCH (7.9.15). A caret ^7.9.15 allows anything up to, but not including, 8.0.0 — patches and minors. A tilde ~7.9.15 allows only patches: up to 7.9.x. An exact 7.9.15 allows nothing else. This course pins Prisma to exactly 7.9.15 — no caret — because its behavior is part of the curriculum. Most other libraries get a caret and the lockfile keeps reality stable.",
        ],
        code: [
          {
            file: "package.json — anatomy",
            lang: "json",
            code: [
              "{",
              '  "name": "hello-node",',
              '  "version": "0.1.0",',
              '  "type": "module",            // use modern ESM import/export',
              '  "scripts": {',
              '    "start": "node server.mjs"',
              "  },",
              '  "dependencies": {',
              '    "picocolors": "^1.1.1"     // ^ = minors+patches OK',
              "  },",
              '  "devDependencies": {',
              '    "typescript": "~5.9.2"     // ~ = only patches OK',
              "  }",
              "}",
            ].join("\n"),
            caption: "dependencies ship to production; devDependencies are build/test tools only.",
          },
        ],
      },
      {
        heading: "Secrets, .gitignore, and the .env discipline",
        body: [
          "Real projects need secrets: database passwords, API keys, tokens. They live in a .env file — plain text, loaded into process.env at startup — and that file must never enter Git. Two files enforce this: .gitignore (tells Git what to refuse) and .env.example (a secret-free template showing which variables must exist, committed so teammates know what to set).",
          "This discipline is not optional etiquette. A committed .env is the most common real-world leak in junior codebases — and search engines index public GitHub. The habit starts now, before you have real secrets to lose.",
        ],
        code: [
          {
            file: ".gitignore",
            lang: "text",
            code: ["node_modules/", ".env", "dist/", "*.log", ".DS_Store"].join("\n"),
          },
          {
            file: ".env.example — committed, secret-free",
            lang: "text",
            code: [
              "# Copy to .env and fill in real values. NEVER commit .env.",
              "DATABASE_URL=",
              "SUPABASE_URL=",
              "SUPABASE_ANON_KEY=",
              "API_PORT=4000",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "Git and GitHub: the photograph album",
        body: [
          "Git records snapshots (commits) of your project with messages you write; GitHub hosts the archive and lets you share it. The daily loop is four commands: git add (choose what goes in the photo), git commit (take it, with a message), git push (upload to GitHub), and git status (what changed since the last photo).",
          "Write commit messages a future stranger can understand: 'add login form validation' beats 'fix stuff'. You are the future stranger.",
        ],
        code: [
          {
            file: "terminal — the daily Git loop",
            lang: "bash",
            code: [
              "git init                        # start tracking this folder",
              "git status                      # what does Git see?",
              "git add .                       # stage everything not ignored",
              'git commit -m "init project with pnpm and env discipline"',
              "",
              "# Create an empty repo on github.com, then:",
              "git branch -M main",
              "git remote add origin https://github.com/YOUR-USER/hello-node.git",
              "git push -u origin main",
            ].join("\n"),
          },
        ],
      },
    ],
    mistake: {
      title: "Committing node_modules and .env",
      wrong: [
        "# .gitignore: (empty — the classic first-repo mistake)",
        "",
        "git add .",
        "git commit -m 'everything'",
        "git push",
        "# → 40,000 library files uploaded…",
        "# → and your .env with the real DATABASE_URL.",
      ].join("\n"),
      right: [
        "# .gitignore, created BEFORE the first commit:",
        "# node_modules/",
        "# .env",
        "# dist/",
        "",
        "git add .",
        "git commit -m 'init project'",
        "# → clean repo: your code + package.json + lockfile + .env.example",
      ].join("\n"),
      explain:
        "node_modules is huge and fully reconstructable from the lockfile — shipping it invites version drift. A committed .env exposes secrets permanently: even if you delete it later, it lives in Git history. If it ever happens, rotate the secrets immediately and scrub history.",
    },
    tryIt: [
      "From your home folder, navigate to Desktop, create dev/hello-node, and initialize a pnpm project — using only the terminal.",
      "Add one dependency, then read package.json and pnpm-lock.yaml: find where the dependency appears in both. What does the caret before its version allow?",
      "Create .env with a fake secret and .env.example without it. Add a .gitignore, run git status, and confirm .env is invisible to Git while .env.example is visible.",
      "Make your first commit and push to a new GitHub repository. Open the repo in the browser and verify node_modules and .env are absent.",
    ],
    challenge: {
      prompt:
        "You inherit a project whose package.json lists these dependencies. For each, state the exact set of versions pnpm is allowed to install, and say which one you would change to an exact pin and why: \"express\": \"^4.18.2\", \"zod\": \"~3.23.8\", \"prisma\": \"^7.9.15\", \"typescript\": \"5.9.2\".",
      hints: [
        "Caret = same MAJOR, any MINOR or PATCH above the listed one. Tilde = same MAJOR.MINOR, any PATCH at or above. Bare number = exactly that version.",
        "Ask: which of these tools has behavior that is part of a teaching/production contract, where a surprise minor bump could change outcomes?",
      ],
      solution: [
        "express ^4.18.2 → any 4.x ≥ 4.18.2 (up to but not including 5.0.0). Fine: caret plus the lockfile keeps installs stable.",
        "zod ~3.23.8 → any 3.23.x ≥ 3.23.8 (stops before 3.24.0). Conservative but fine.",
        "prisma ^7.9.15 → any 7.x ≥ 7.9.15 (up to 8.0.0). This is the one to change: this course pins prisma to exactly 7.9.15 because its config and driver-adapter behavior are part of the curriculum and production contract. Exact pin: \"prisma\": \"7.9.15\".",
        "typescript 5.9.2 → exactly 5.9.2. Already exact; teams often pin TS because new minor releases can introduce new diagnostics that break CI.",
        "General rule: carets for ordinary libraries (lockfile provides stability), exact pins when a specific version is a deliberate decision — and write that decision down (this course does it in COURSE_VERSION_MATRIX.md).",
      ].join("\n"),
    },
    quiz: [
      {
        q: "Which file should NEVER be committed to Git?",
        options: ["package.json", "pnpm-lock.yaml", ".env", ".env.example"],
        answer: 2,
        explain:
          ".env holds real secrets. .env.example is the secret-free template and is committed on purpose so teammates know what to configure.",
      },
      {
        q: "What does the semver range ^7.9.15 allow?",
        options: [
          "Exactly 7.9.15 only",
          "Any version ≥ 7.9.15 and < 8.0.0",
          "Any version ≥ 7.9.15 and < 7.10.0",
          "Any version including 8.0.0",
        ],
        answer: 1,
        explain:
          "Caret allows minor and patch updates within the same major. 7.10.0 and 7.9.16 qualify; 8.0.0 does not.",
      },
      {
        q: "What is the purpose of the lockfile (pnpm-lock.yaml)?",
        options: [
          "It locks the repository so others cannot push",
          "It records the exact resolved versions so every install is identical",
          "It stores your npm login token",
          "It replaces package.json in production",
        ],
        answer: 1,
        explain:
          "Ranges in package.json are wishes; the lockfile is reality. Committing it makes 'works on my machine' portable.",
      },
      {
        q: "Which command both records a new dependency AND writes it to package.json?",
        options: ["pnpm install", "pnpm add <name>", "pnpm run <name>", "node <name>"],
        answer: 1,
        explain:
          "pnpm add fetches the package and records it. pnpm install (with no name) fetches everything already in the ledger.",
      },
      {
        q: "Your terminal says 'pnpm: command not found'. What is the correct first move?",
        options: [
          "Reinstall Windows",
          "Check where you are (pwd) and whether pnpm is enabled — e.g. corepack enable — then open a fresh terminal",
          "Delete node_modules",
          "Switch to a different framework",
        ],
        answer: 1,
        explain:
          "Diagnose before you demolish: verify the tool exists, is on your PATH, and that your terminal session was restarted after installing it.",
      },
      {
        q: "A teammate cloned your repo and their app crashes with 'DATABASE_URL is undefined'. What did your repo most likely forget?",
        options: [
          "The node_modules folder",
          "A committed .env.example documenting required variables",
          "A bigger hard drive",
          "The Git history",
        ],
        answer: 1,
        explain:
          "Secrets stay out of Git, so the contract for which variables must exist lives in .env.example. No template means teammates guess.",
      },
    ],
    flashcards: [
      { front: "pwd / ls / cd / mkdir", back: "Print working directory · list contents · change directory · make directory. The terminal's daily vocabulary." },
      { front: "What package.json is", back: "The project ledger: name, scripts (shortcuts), dependencies (production), devDependencies (build/test tools). Ranges are wishes; the lockfile is reality." },
      { front: "Semver: MAJOR.MINOR.PATCH", back: "Breaking change . new feature . bug fix. ^ = minors+patches, ~ = patches only, bare = exact." },
      { front: "Why pin Prisma to exactly 7.9.15", back: "Its config (prisma.config.ts), ESM/driver-adapter behavior is part of the course and production contract. Carets invite surprise drift; exact pins make versions a documented decision." },
      { front: ".env vs .env.example", back: ".env = real secrets, never committed, listed in .gitignore. .env.example = secret-free template of required variables, always committed." },
      { front: "The daily Git loop", back: "git status → git add → git commit -m 'clear message' → git push. Git is a snapshot album; GitHub is the off-site archive." },
      { front: "node_modules: ship it?", back: "Never. It is huge and fully reconstructable via pnpm install from the lockfile. Ignoring it prevents drift and bloat." },
      { front: "devDependencies vs dependencies", back: "dependencies run in production. devDependencies are only for development (TypeScript, test runners, linters)." },
    ],
    recap: [
      "The terminal is a conversation: pwd/ls/cd/mkdir, and always check versions before trusting a failure.",
      "Node.js runs JavaScript outside the browser; pnpm keeps the dependency ledger (package.json) and its exact reality (lockfile).",
      "Semver ranges encode promises: ^ minors+patches, ~ patches only, exact means exact. Pin deliberately and document it.",
      "Secrets live in .env, which never enters Git; .env.example documents the contract instead.",
      "Git + GitHub: small, well-named commits, pushed often — the photograph album you can always restore.",
    ],
    references: [
      { label: "Node.js — downloads & LTS schedule", url: "https://nodejs.org/en/download" },
      { label: "pnpm docs", url: "https://pnpm.io/installation" },
      { label: "npm docs — semver ranges", url: "https://docs.npmjs.com/cli/v10/using-npm/semver" },
      { label: "Git — getting started", url: "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F" },
      { label: "GitHub Docs — adding a local repo to GitHub", url: "https://docs.github.com/en/migrations/importing-source-code" },
    ],
    nextBridge:
      "Your tools are ready. In the next lesson you use them for real: build a tiny, framework-free Node HTTP server and watch raw HTTP requests and JSON responses flow — the same protocol every framework in this course will later wrap.",
  },

  {
    id: "p00-l3",
    phaseId: "p00",
    title: "HTTP & JSON, First Contact: A Tiny Node Server",
    level: "Foundation",
    minutes: 30,
    summary:
      "Before frameworks wrap HTTP in magic, you will speak it raw: build a 30-line Node server with no dependencies, return JSON, call it from a browser with fetch, and read the whole exchange in DevTools. Every abstraction in this course becomes obvious once you have done it by hand.",
    prerequisites: ["p00-l1 — The Full-Stack Map", "p00-l2 — The Developer's Toolkit"],
    objectives: [
      "Explain method, path, headers, status code, and body as the five parts of an HTTP exchange.",
      "Run a dependency-free Node HTTP server that serves JSON.",
      "Call an endpoint with fetch and handle non-OK responses properly.",
      "Read the full request/response pair in the DevTools Network panel.",
      "Say why frameworks like NestJS exist — from evidence, not faith.",
    ],
    simple:
      "HTTP is a strict conversation format. The client starts every sentence with a verb (GET = show me, POST = here is new data, PUT/PATCH = update this, DELETE = remove this), a path (/api/status), and optional headers and a JSON body. The server always answers with a three-digit status code, its own headers, and usually a JSON body. That is the entire protocol at the level this course needs. You are about to hold both ends of the conversation in your own code.",
    why:
      "When a full-stack bug appears — and it will — the debugger's first question is 'where did the exchange break?'. Developers who have only used frameworks see mysterious errors; developers who have spoken raw HTTP see a missing header, a wrong status code, a body that never parsed. Thirty minutes of raw server code buys you a lifetime of knowing which layer failed.",
    mentalModel: {
      title: "The Postal Contract",
      body: "HTTP is a postal system with obsessive rules. Every envelope (request) must state the action (method), the address (path), and may include a contents list (headers) and a package (body). Every reply (response) must stamp a three-digit receipt code: 2xx 'done', 3xx 'go over there', 4xx 'you messed up', 5xx 'we messed up'. Nobody phones ahead; every exchange is one envelope, one reply. JSON is the packing foam: a text format both sides agree on so any client, in any language, can unpack the data.",
    },
    sections: [
      {
        heading: "A server with zero dependencies",
        body: [
          "Node ships with an http module that speaks raw HTTP. The code below is a complete web server: it listens on a port, inspects the method and path of each request, and answers. GET / returns a small HTML page; GET /api/status returns JSON; anything else gets an honest 404 with a JSON error body.",
          "Read it slowly. This is the skeleton that NestJS will later dress in modules, controllers, and guards — and you will recognize every bone.",
        ],
        code: [
          {
            file: "server.mjs — run with: node server.mjs",
            lang: "js",
            code: [
              "import { createServer } from 'node:http';",
              "",
              "const PORT = process.env.API_PORT ?? 4000;",
              "const startedAt = Date.now();",
              "",
              "const server = createServer((req, res) => {",
              "  const url = new URL(req.url ?? '/', 'http://localhost');",
              "",
              "  // GET / — a tiny HTML page (presentation, inline for demo)",
              "  if (req.method === 'GET' && url.pathname === '/') {",
              "    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });",
              "    res.end('<h1>Raw HTTP server</h1><p>Open DevTools → Network, then reload.</p>');",
              "    return;",
              "  }",
              "",
              "  // GET /api/status — JSON, the shape every API in this course will grow from",
              "  if (req.method === 'GET' && url.pathname === '/api/status') {",
              "    const body = JSON.stringify({",
              "      ok: true,",
              "      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),",
              "      at: new Date().toISOString(),",
              "    });",
              "    res.writeHead(200, { 'Content-Type': 'application/json' });",
              "    res.end(body);",
              "    return;",
              "  }",
              "",
              "  // Everything else: an honest, structured 404",
              "  res.writeHead(404, { 'Content-Type': 'application/json' });",
              '  res.end(JSON.stringify({ error: "Not found", path: url.pathname }));',
              "});",
              "",
              "server.listen(PORT, () => {",
              "  console.log('Listening on http://localhost:' + PORT);",
              "});",
            ].join("\n"),
            caption: "No npm install needed. node:http ships with Node — this is the protocol with no costume on.",
          },
        ],
      },
      {
        heading: "The client side: fetch, done properly",
        body: [
          "fetch is the browser's (and modern Node's) built-in HTTP client. Two rules separate professionals from beginners: check res.ok before trusting the body — a 404 also resolves the promise, it did not 'fail' technically — and always tell the server what you are sending with a Content-Type header when you POST JSON.",
          "The Network panel in DevTools shows the raw truth: the request method, path, and headers going up; the status, headers, and body coming down. Get into the habit of verifying what actually flew, not what you meant to send.",
        ],
        code: [
          {
            file: "client.mjs — run with: node client.mjs (or paste in a browser console)",
            lang: "js",
            code: [
              "const res = await fetch('http://localhost:4000/api/status');",
              "",
              "// Rule 1: non-2xx responses still RESOLVE. Check res.ok.",
              "if (!res.ok) {",
              "  throw new Error('HTTP ' + res.status + ' for /api/status');",
              "}",
              "",
              "// Rule 2: parse the body only after you trust the status.",
              "const data = await res.json();",
              "console.log('Server says:', data);",
              "",
              "// Now ask for something that does not exist, on purpose:",
              "const missing = await fetch('http://localhost:4000/api/nope');",
              "console.log('Status for /api/nope:', missing.status); // 404",
              "console.log('Structured error:', await missing.json());",
            ].join("\n"),
          },
        ],
      },
      {
        heading: "The five parts, labeled on a real exchange",
        body: [
          "Open the DevTools Network tab, reload your server page, and click the /api/status row. You are looking at: (1) the method GET; (2) the path /api/status plus any ?query=params; (3) request headers like Accept; (4) the status code 200 plus response headers like Content-Type; (5) the JSON body. Headers are the metadata contract — Content-Type tells the receiver how to parse the body, and mismatches there cause a huge share of real-world API bugs.",
          "Try curl -v http://localhost:4000/api/status in a second terminal. The -v flag prints the raw text of both envelopes. You have now seen HTTP the way the wire sees it.",
        ],
      },
      {
        heading: "Why frameworks get to exist",
        body: [
          "Look at your server again: routing is an if-chain, JSON parsing would be manual, validation is absent, errors are ad hoc, and there is no place to hang authentication. Every one of those gaps is a job some framework took. NestJS gives you declarative routes, automatic body parsing, pipes for validation, guards for auth, filters for errors — on top of Fastify, which makes the raw layer fast.",
          "The framework is not magic; it is this code, organized. From the next phase onward, when you write a controller, you will know exactly which of these if-blocks you are being saved from.",
        ],
      },
    ],
    mistake: {
      title: "200 for everything (and lying with Content-Type)",
      wrong: [
        "// The 'it worked technically' server:",
        "if (url.pathname === '/api/orders') {",
        "  res.writeHead(200, { 'Content-Type': 'text/plain' });",
        '  res.end("{\\"orders\\": []}");   // JSON text, wrong header',
        "} else {",
        "  res.writeHead(200);            // 200… for a page that is not there",
        '  res.end("not found");',
        "}",
      ].join("\n"),
      right: [
        "if (url.pathname === '/api/orders') {",
        "  res.writeHead(200, { 'Content-Type': 'application/json' });",
        '  res.end(JSON.stringify({ orders: [] }));',
        "} else {",
        "  res.writeHead(404, { 'Content-Type': 'application/json' });",
        '  res.end(JSON.stringify({ error: "Not found" }));',
        "}",
      ].join("\n"),
      explain:
        "Status codes are the machine-readable outcome: clients branch on them (res.ok, retries, alerting). Content-Type is the parsing contract: res.json() and every typed client trust it. Lying with either turns predictable failures into mystery bugs — and breaks monitoring that counts 5xx/4xx rates.",
    },
    tryIt: [
      "Run server.mjs and open http://localhost:4000 in the browser with the Network panel open. Identify method, path, status, Content-Type, and body for both requests.",
      "Request a path that does not exist in the browser and in curl -v. Compare what you see in DevTools with the raw text curl prints.",
      "Change the /api/status handler to return status 503 with a JSON body explaining why. Run client.mjs and watch your res.ok check throw with a useful message.",
      "Add a query-parameter reader: return url.searchParams.get('name') inside the JSON when ?name=Ada is passed. Call it with fetch and verify in the Network tab.",
    ],
    challenge: {
      prompt:
        "Extend server.mjs with a new endpoint GET /api/time that returns JSON { iso, unix, timezoneOffsetMinutes } using the Date object. Then write a small HTML page served at GET /clock with a button that fetches /api/time and renders the result — using fetch, checking res.ok, and showing a friendly error message when the server is stopped.",
      hints: [
        "new Date().toISOString() gives the ISO string; Date.now() gives unix milliseconds (divide by 1000 and round for seconds); new Date().getTimezoneOffset() gives the offset in minutes.",
        "For the button handler, use async/await and wrap the fetch in try/catch so a stopped server shows your error message instead of a console mystery.",
        "Serve the HTML by writing the string inline in the GET / handler, exactly like the lesson does — one file, no build step.",
      ],
      solution: [
        "// Inside the createServer callback, before the 404 fallback:",
        "if (req.method === 'GET' && url.pathname === '/api/time') {",
        "  const now = new Date();",
        "  const body = JSON.stringify({",
        "    iso: now.toISOString(),",
        "    unix: Math.round(Date.now() / 1000),",
        "    timezoneOffsetMinutes: now.getTimezoneOffset(),",
        "  });",
        "  res.writeHead(200, { 'Content-Type': 'application/json' });",
        "  res.end(body);",
        "  return;",
        "}",
        "",
        "// And a GET /clock route:",
        "if (req.method === 'GET' && url.pathname === '/clock') {",
        "  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });",
        "  res.end([",
        "    '<h1>Clock</h1><p id=\"out\">Press the button.</p>',",
        "    '<button id=\"btn\">Fetch time</button>',",
        "    '<script>',",
        "    'document.getElementById(\"btn\").addEventListener(\"click\", async () => {',",
        "    '  const out = document.getElementById(\"out\");',",
        "    '  try {',",
        "    '    const res = await fetch(\"/api/time\");',",
        "    '    if (!res.ok) throw new Error(\"HTTP \" + res.status);',",
        "    '    const t = await res.json();',",
        "    '    out.textContent = t.iso + \" (unix \" + t.unix + \")\";',",
        "    '  } catch (err) {',",
        "    '    out.textContent = \"Could not reach the server: \" + err.message;',",
        "    '  }',",
        "    '});',",
        "    '</scr' + 'ipt>',",
        "  ].join(''));",
        "  return;",
        "}",
        "",
        "Stop the server (Ctrl+C) and click the button again — the catch branch is your proof that the client survives a dead backend gracefully.",
      ].join("\n"),
    },
    quiz: [
      {
        q: "A fetch to /api/orders resolves successfully but res.ok is false with status 404. What happened?",
        options: [
          "The network is down",
          "The request completed; the server answered 'no such resource'. fetch only rejects on network-level failures",
          "res.json() threw an exception",
          "The server crashed",
        ],
        answer: 1,
        explain:
          "fetch resolves for any HTTP response, even 404 or 500. It rejects on network errors. Always branch on res.ok before parsing.",
      },
      {
        q: "Which method conventionally means 'create a new resource'?",
        options: ["GET", "POST", "DELETE", "HEAD"],
        answer: 1,
        explain:
          "GET reads, POST creates, PUT/PATCH updates, DELETE removes. REST conventions make APIs predictable across teams.",
      },
      {
        q: "What does the Content-Type: application/json header tell the receiver?",
        options: [
          "The request was compressed",
          "How to parse the body — as JSON text",
          "That the server uses JavaScript",
          "That authentication is required",
        ],
        answer: 1,
        explain:
          "Headers are the metadata contract. Content-Type declares the body's format; clients like res.json() and typed API layers depend on that promise.",
      },
      {
        q: "Status code families: which pairing is correct?",
        options: [
          "2xx server error · 4xx success",
          "3xx redirection · 5xx server error",
          "1xx not found · 5xx client error",
          "4xx redirection · 2xx client error",
        ],
        answer: 1,
        explain:
          "1xx informational · 2xx success · 3xx redirection · 4xx client error (your request was wrong) · 5xx server error (our fault).",
      },
      {
        q: "Your server sends JSON but the browser renders it as plain text on the page. First thing you check?",
        options: [
          "Reinstall Node",
          "The response's Content-Type header — likely text/html or missing",
          "The DNS settings",
          "The client's operating system",
        ],
        answer: 1,
        explain:
          "Browsers decide how to treat a response largely from Content-Type. Wrong header, wrong interpretation — a top-five real-world API bug.",
      },
      {
        q: "Why does this course build a raw node:http server before introducing NestJS?",
        options: [
          "Because NestJS costs money",
          "So every framework feature (routing, parsing, validation, auth) is recognized as an organized version of code you have already written",
          "Because raw servers are faster in production",
          "To avoid learning TypeScript",
        ],
        answer: 1,
        explain:
          "Frameworks abstract the raw layer. If you have held the raw layer, abstractions become visible organization — and debugging becomes 'which layer broke' instead of fear.",
      },
    ],
    flashcards: [
      { front: "The five parts of an HTTP exchange", back: "Method (verb), path (+ query), request headers, status code + response headers, body (usually JSON). See all five in DevTools → Network." },
      { front: "GET / POST / PUT·PATCH / DELETE", back: "Read · create · update (replace/patch) · remove. The REST verb vocabulary." },
      { front: "Status families", back: "2xx success · 3xx redirect · 4xx client error · 5xx server error. 401 who are you · 403 not allowed · 404 not found." },
      { front: "fetch's #1 gotcha", back: "It resolves for 404/500 too — it only rejects on network failure. Always check res.ok before res.json()." },
      { front: "Content-Type", back: "The header that declares how to parse the body. application/json for APIs; mismatches cause 'valid JSON rendered as text' bugs." },
      { front: "What JSON is", back: "JavaScript Object Notation: a text format of keys and values (strings in double quotes, numbers, booleans, arrays, objects, null). The inter-language packing foam." },
      { front: "What a framework abstracts (evidence from this lesson)", back: "Routing (if-chains → controllers), body parsing (manual → automatic), validation, auth, structured errors — the raw server showed each gap by name." },
      { front: "curl -v", back: "Prints the raw request and response envelopes. The fastest way to see what the wire actually saw." },
    ],
    recap: [
      "HTTP is method + path + headers + status + body. You built and consumed both ends with zero dependencies.",
      "fetch resolves on every HTTP status — res.ok is your contract check before parsing.",
      "Content-Type is the parsing promise; status codes are the outcome contract. Lying with either manufactures mystery bugs.",
      "DevTools Network and curl -v show the raw exchange — verify what flew, not what you meant.",
      "NestJS/Fastify is this skeleton, organized: routing, parsing, validation, auth, errors — and you have met every one of those jobs in the raw.",
    ],
    references: [
      { label: "MDN — HTTP overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
      { label: "MDN — HTTP status codes", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status" },
      { label: "MDN — fetch()", url: "https://developer.mozilla.org/en-US/docs/Web/API/fetch" },
      { label: "Node.js — node:http", url: "https://nodejs.org/api/http.html" },
      { label: "MDN — Content-Type", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type" },
    ],
    nextBridge:
      "You can now send and receive HTTP with your eyes open. The next lesson turns that power into method: DevTools panels, breakpoints, and the nine-step debugging loop you will run every time something breaks — for the rest of your career.",
  },
];

export const LESSON_CONTENT: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P0.map((l) => [l.id, l]),
);
