import type { LessonContent } from "./types";

export const LESSON_CONTENT_P30B: Record<string, LessonContent> = {
  "p30-l4": {
    id: "p30-l4",
    phaseId: "p30",
    title: "JWT/Session Mistakes & Secret Hygiene",
    level: "Advanced",
    minutes: 40,
    summary:
      "Audit common cryptographic authentication failures. Understand the `alg: none` and algorithm-confusion vulnerabilities, manage secure key rotation drills, and secure secrets using cloud key management.",
    prerequisites: ["p17-l1 Supabase Auth & JWTs", "p30-l1 Threat Modeling"],
    objectives: [
      "Avoid the classic JWT vulnerabilities (`alg: none`, RS256/HS256 algorithm confusion, weak shared secrets).",
      "Implement zero-downtime JWT secret rotation using JWKS (JSON Web Key Sets).",
      "Enforce strict secret hygiene (no `.env` in git, automated secret scanning in CI).",
    ],
    simple:
      "A JSON Web Token (JWT) is only as secure as the algorithm and secret key used to verify it. If your server blindly accepts the algorithm specified in the token header, an attacker can modify their role to `admin`, change the header to `\"alg\": \"none\"`, and your server might authenticate them without checking any signature at all.",
    why:
      "Authentication vulnerabilities allow unauthorized access to every account in your application without needing passwords.",
    mentalModel: {
      title: "The Signet Ring vs the Rubber Stamp",
      body:
        "A proper asymmetric JWT (RS256/ES256) is like a royal signet ring: only the private key in the king's castle can sign a decree, but any guard at the city gates can verify the seal using the public key. If you use a weak 4-character symmetric secret (HS256), it's like a rubber stamp anyone can buy at a toy store.",
    },
    sections: [
      {
        heading: "1. JWT Anti-Patterns & Defenses",
        body: [
          "1. **Never Trust the Header's `alg` Property**: Hardcode the expected algorithm in your verification options (`algorithms: ['RS256']`). Never allow `none`.",
          "2. **Algorithm Confusion (RS256 vs HS256)**: In this attack, a server expecting RS256 is tricked into using HS256, verifying the signature using the *public key* as the HMAC secret key. Hardcoding the algorithm completely neutralizes this attack.",
          "3. **Short Expirations + Refresh Token Rotation**: Keep Access Tokens short-lived (15 minutes). Store Refresh Tokens in an encrypted Redis store or database table with rotation on every use.",
        ],
        code: [
          {
            file: "jwt-verification.ts",
            lang: "ts",
            code: [
              "import * as jwt from 'jsonwebtoken';",
              "import { UnauthorizedException } from '@nestjs/common';",
              "",
              "export function verifyAccessToken(token: string, publicKey: string) {",
              "  try {",
              "    return jwt.verify(token, publicKey, {",
              "      algorithms: ['RS256'], // Explicitly whitelist RS256 only (rejects 'none' and 'HS256')",
              "      issuer: 'https://auth.taskforge.dev',",
              "      audience: 'https://api.taskforge.dev',",
              "      clockTolerance: 5, // 5 seconds drift allowance",
              "    });",
              "  } catch (err: any) {",
              "    throw new UnauthorizedException(`Invalid or expired token: ${err.message}`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Strict JWT verification configuration.",
          },
        ],
      },
      {
        heading: "2. Secret Hygiene & Zero-Downtime Key Rotation",
        body: [
          "- **Pre-commit hooks**: Use `gitleaks` or `trufflehog` to prevent API keys from ever being committed to Git.",
          "- **JWKS (JSON Web Key Set)**: Distribute public keys via `/.well-known/jwks.json`. Give keys a `kid` (Key ID).",
          "- **Rotation Drill**: To rotate secrets without logging out millions of active users: 1) Deploy new key alongside old key; 2) Sign new tokens with new key while accepting both old and new keys for verification; 3) After access token TTL expires (e.g. 24h), safely decommission the old key.",
        ],
      },
    ],
    mistake: {
      title: "Storing Sensitive PII or Credit Card Info Inside JWT Payloads",
      wrong: [
        "// ❌ Storing unencrypted secrets in JWT payload:",
        "const payload = { userId: 1, ssn: '123-45-6789', stripeSecretKey: 'sk_live_...' };",
        "// JWT payloads are only Base64 encoded, NOT encrypted! Anyone can read them.",
      ].join("\n"),
      right: [
        "// ✅ Store only minimal identifiers in JWT:",
        "const payload = { sub: user.id, org: user.orgId, role: user.role };",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Simulate the 'alg: none' Exploit",
      description:
        "Construct an unsigned JWT with `\"alg\": \"none\"` and verify that your NestJS JWT guard rejects it with 401 Unauthorized.",
      tasks: [
        "Create a base64 encoded token with header `{\"alg\": \"none\", \"typ\": \"JWT\"}` and payload `{\"sub\": \"admin-id\"}`.",
        "Submit it to the protected route.",
        "Ensure `algorithms: ['RS256']` causes `jsonwebtoken` to reject the token immediately.",
      ],
    },
    quiz: [
      {
        question: "Why should you never store sensitive secrets or passwords in a standard JWT payload?",
        options: [
          "Because JWTs expire quickly.",
          "Because JWT payloads are simply Base64Url-encoded strings that anyone who intercepts the token can decode and read in plaintext.",
          "Because JWTs can only store numbers.",
          "Because databases cannot store JWT strings.",
        ],
        answer: 1,
        explanation:
          "JWTs are signed for integrity, but they are not encrypted (unless using JWE). Anyone with the token can decode and inspect the payload.",
      },
    ],
  },

  "p30-l5": {
    id: "p30-l5",
    phaseId: "p30",
    title: "SSRF, Webhook Abuse & File Threats",
    level: "Advanced",
    minutes: 40,
    summary:
      "Protect against Server-Side Request Forgery (SSRF), metadata service probing (AWS/GCP `169.254.169.254`), zip bombs, and malicious file upload exploits.",
    prerequisites: ["p30-l1 Threat Modeling", "p29-l5 Webhooks"],
    objectives: [
      "Mitigate SSRF by validating DNS resolution against private RFC 1918 IP ranges and cloud metadata endpoints.",
      "Defend file uploads against double-extensions, MIME-type spoofing, and decompressive zip bombs.",
      "Offload public file uploads to S3/GCS presigned URLs with strict IAM boundary policies.",
    ],
    simple:
      "Server-Side Request Forgery (SSRF) occurs when your server accepts a URL from a user (e.g. 'Fetch profile picture from this URL') and downloads it without validation. An attacker enters `http://169.254.169.254/computeMetadata/v1/` or `http://localhost:5432`, tricking your backend server into stealing cloud IAM keys or querying internal database ports.",
    why:
      "SSRF was the root cause of the famous Capital One breach, leaking over 100 million customer records via cloud metadata service theft.",
    mentalModel: {
      title: "The Blind Courier with Access to the Vault",
      body:
        "If you tell a courier 'Go pick up a package from this address and bring it to me', and the address is 'The Internal Bank Safe Behind You', an unrestricted courier will walk inside and hand over the gold. An SSRF filter is a guard who blocks any internal address, localhost, or private IP.",
    },
    sections: [
      {
        heading: "1. Preventing SSRF: Private IP & Metadata Blocking",
        body: [
          "- Never trust hostname validation alone: `evil.com` can resolve via DNS to `127.0.0.1` or `169.254.169.254` (DNS Rebinding).",
          "- **Safe Ingestion Protocol**:",
          "1. Resolve the hostname to an IP address using `dns.promises.lookup()`.",
          "2. Check if the IP falls inside private RFC 1918 blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), localhost (`127.0.0.0/8`), or link-local metadata (`169.254.0.0/16`).",
          "3. Pin the resolved IP address when opening the HTTP socket.",
        ],
        code: [
          {
            file: "ssrf-guard.ts",
            lang: "ts",
            code: [
              "import * as dns from 'dns/promises';",
              "import * as ipaddr from 'ipaddr.js';",
              "import { BadRequestException } from '@nestjs/common';",
              "",
              "export async function validateSafeExternalUrl(rawUrl: string): Promise<string> {",
              "  const parsed = new URL(rawUrl);",
              "  if (!['http:', 'https:'].includes(parsed.protocol)) {",
              "    throw new BadRequestException('Only HTTP and HTTPS protocols allowed.');",
              "  }",
              "",
              "  // 1. Resolve DNS to physical IP",
              "  const { address } = await dns.lookup(parsed.hostname);",
              "  const addr = ipaddr.parse(address);",
              "  const range = addr.range();",
              "",
              "  // 2. Reject private, loopback, and cloud metadata ranges",
              "  const forbiddenRanges = ['loopback', 'private', 'linkLocal', 'uniqueLocal', 'broadcast'];",
              "  if (forbiddenRanges.includes(range) || address === '169.254.169.254') {",
              "    throw new BadRequestException('Target IP address is in a restricted network range.');",
              "  }",
              "",
              "  return rawUrl;",
              "}",
            ].join("\n"),
            caption: "Production DNS-resolving SSRF protection filter.",
          },
        ],
      },
      {
        heading: "2. Secure File Upload Defenses",
        body: [
          "1. **Never store uploaded files directly on local server disk**: If an attacker uploads `exploit.php` or `shell.jsp`, a misconfigured web server might execute it.",
          "2. **Direct-to-S3 Presigned URLs**: Client uploads directly to an isolated S3 bucket; S3 strips executable permissions and serves with `Content-Disposition: attachment`.",
          "3. **Magic Byte Inspection**: Check the actual binary header bytes using `file-type` library rather than trusting the user's `Content-Type` header.",
        ],
      },
    ],
    mistake: {
      title: "Validating URLs with Regex without Checking Resolved IP Addresses",
      wrong: [
        "// ❌ Vulnerable regex check:",
        "if (!url.includes('localhost') && !url.includes('127.0.0.1')) { fetch(url); }",
        "// Attacker registers 'evil.com' pointing to 169.254.169.254 or uses 0x7f000001 to bypass!",
      ].join("\n"),
      right: [
        "// ✅ Resolve hostname via DNS and check IP range mathematically with ipaddr.js",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build an SSRF Probe Detector",
      description:
        "Test an avatar URL importer function against various bypass techniques (decimal IPs, IPv6 mapped IPv4, AWS metadata IP) and verify all are blocked.",
      tasks: [
        "Test `http://169.254.169.254/latest/meta-data/` -> verify blocked.",
        "Test `http://127.0.0.1:5432/` -> verify blocked.",
        "Test `https://avatars.githubusercontent.com/u/583231` -> verify allowed.",
      ],
    },
    quiz: [
      {
        question: "Why is checking the URL string against 'localhost' insufficient to prevent SSRF?",
        options: [
          "Because DNS names like 'local.evil.com' can resolve to 127.0.0.1, and hex/decimal formats like 0177.0.0.1 bypass string regexes.",
          "Because Node.js does not support regexes.",
          "Because HTTP 2.0 does not use URLs.",
          "Because Postgres blocks regexes.",
        ],
        answer: 0,
        explanation:
          "Attackers can use custom DNS records resolving to loopback addresses or alternative IP encodings to bypass naive string matching.",
      },
    ],
  },

  "p30-l6": {
    id: "p30-l6",
    phaseId: "p30",
    title: "Headers, Dependencies & Least Privilege",
    level: "Advanced",
    minutes: 35,
    summary:
      "Harden the runtime perimeter with modern HTTP security headers via Helmet, establish automated dependency vulnerability auditing, and configure database least-privilege connection roles.",
    prerequisites: ["p30-l1 Threat Modeling", "p13-l1 Postgres Fundamentals"],
    objectives: [
      "Configure Helmet with strict Content-Security-Policy (CSP), HSTS, and X-Content-Type-Options.",
      "Triage `npm audit` findings realistically without breaking production builds.",
      "Split database connection strings into runtime least-privilege roles (App Role vs Migration Role).",
    ],
    simple:
      "Security headers instruct the user's browser to enforce strict rules: 'Never load scripts from untrusted websites' (CSP), 'Always use HTTPS for the next 2 years' (HSTS), and 'Never try to guess MIME types' (nosniff). Combined with automated dependency checks and restricted database users, this creates deep defense-in-depth.",
    why:
      "Even if a developer accidentally introduces a vulnerability in one component, security headers and least-privilege database roles prevent the vulnerability from being weaponized into a full breach.",
    mentalModel: {
      title: "The Submarine Compartment Bulkheads",
      body:
        "If water leaks into one compartment of a submarine, sealed steel bulkheads prevent the entire vessel from sinking. Security headers, non-root Docker users, and restricted database permissions are the bulkheads in your software architecture.",
    },
    sections: [
      {
        heading: "1. HTTP Security Headers with Helmet",
        body: [
          "Install `helmet` in NestJS/Fastify to inject security headers on every response:",
          "- `Strict-Transport-Security` (HSTS): Enforces HTTPS and protects against SSL stripping.",
          "- `X-Content-Type-Options: nosniff`: Prevents browsers from executing uploaded `.txt` files as `.js`.",
          "- `X-Frame-Options: DENY`: Prevents Clickjacking attacks by forbidding iframe embedding.",
          "- `Content-Security-Policy` (CSP): Whitelists legitimate script and style domains.",
        ],
        code: [
          {
            file: "helmet-setup.ts",
            lang: "ts",
            code: [
              "import helmet from 'helmet';",
              "import { INestApplication } from '@nestjs/common';",
              "",
              "export function setupSecurityHeaders(app: INestApplication) {",
              "  app.use(",
              "    helmet({",
              "      contentSecurityPolicy: {",
              "        directives: {",
              "          defaultSrc: [\"'self'\"],",
              "          scriptSrc: [\"'self'\", \"'wasm-unsafe-eval'\", 'https://challenges.cloudflare.com'],",
              "          styleSrc: [\"'self'\", \"'unsafe-inline'\", 'https://fonts.googleapis.com'],",
              "          fontSrc: [\"'self'\", 'https://fonts.gstatic.com'],",
              "          imgSrc: [\"'self'\", 'data:', 'https://*.supabase.co', 'https://*.amazonaws.com'],",
              "          connectSrc: [\"'self'\", 'https://*.supabase.co', 'https://api.stripe.com'],",
              "          frameAncestors: [\"'none'\"],",
              "        },",
              "      },",
              "      hsts: {",
              "        maxAge: 31536000, // 1 year",
              "        includeSubDomains: true,",
              "        preload: true,",
              "      },",
              "      crossOriginEmbedderPolicy: false,",
              "    }),",
              "  );",
              "}",
            ].join("\n"),
            caption: "Production Helmet security header configuration.",
          },
        ],
      },
      {
        heading: "2. Database Least Privilege Roles",
        body: [
          "- **Never connect your backend app with the PostgreSQL `postgres` superuser!**",
          "- **Migration Role (`taskforge_migrator`)**: Has `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` permissions. Used only during CI/CD migration runs.",
          "- **Application Role (`taskforge_app`)**: Has only `SELECT`, `INSERT`, `UPDATE`, `DELETE` permissions on application tables. Cannot `DROP TABLE` or access PostgreSQL system catalogs.",
        ],
      },
    ],
    mistake: {
      title: "Running Application Containers as the Root User",
      wrong: [
        "// ❌ Dockerfile with default root user:",
        "FROM node:20-alpine",
        "COPY . .",
        "CMD [\"node\", \"dist/main.js\"]",
        "// If an attacker escapes Node.js via RCE, they have root access to the container filesystem!",
      ].join("\n"),
      right: [
        "// ✅ Drop privileges to built-in 'node' non-root user:",
        "USER node",
        "CMD [\"node\", \"dist/main.js\"]",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Audit Security Headers and npm Dependencies",
      description:
        "Inspect your HTTP response headers using `curl -I http://localhost:3000` and verify all Helmet protections are active.",
      tasks: [
        "Run `npm audit --omit=dev` and triage flagged CVEs.",
        "Verify `X-Content-Type-Options: nosniff` is present on all API routes.",
        "Test embedding the application inside an external `<iframe>` to confirm clickjacking defense.",
      ],
    },
    quiz: [
      {
        question: "What is the primary danger of running your production Node.js process as a PostgreSQL database superuser?",
        options: [
          "Queries run 10% slower.",
          "If an attacker finds a SQL injection flaw in any endpoint, they can read file systems (`pg_read_file`), write shell scripts (`COPY TO PROGRAM`), and drop all databases.",
          "Postgres connections will max out at 5.",
          "JSON serialization will fail.",
        ],
        answer: 1,
        explanation:
          "Postgres superusers have administrative operating system hooks; running with a least-privilege role isolates potential SQL injection exploits.",
      },
    ],
  },
};
