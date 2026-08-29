import type { LessonContent } from "./types";

export const LESSON_CONTENT_P29B: Record<string, LessonContent> = {
  "p29-l4": {
    id: "p29-l4",
    phaseId: "p29",
    title: "Outgoing HTTP: Timeouts, Retries, Circuit Breakers",
    level: "Advanced",
    minutes: 40,
    summary:
      "Prevent cascading microservice failures when calling external third-party APIs. Implement strict connection timeouts, exponential backoff with full jitter, and circuit breaker patterns using Cockatiel or Opossum.",
    prerequisites: ["p29-l1 REST Contracts"],
    objectives: [
      "Set aggressive socket and response timeouts on every outgoing HTTP client.",
      "Implement exponential backoff retry algorithms with randomized jitter to prevent the thundering herd.",
      "Integrate the Circuit Breaker pattern (Closed, Open, Half-Open) to fail fast when downstream services crash.",
    ],
    simple:
      "When your server calls an external shipping or SMS API that hangs, your server threads freeze waiting for a response. If 100 users visit simultaneously, all your Node.js event loop workers or database connections get clogged. Circuit breakers and timeouts cut the cord after 2 seconds and return an immediate graceful fallback.",
    why:
      "Unbounded outgoing HTTP calls are the #1 cause of catastrophic cascading outages in microservice architectures.",
    mentalModel: {
      title: "The Electrical Circuit Breaker in Your Home",
      body:
        "When an appliance shorts out and draws dangerous amounts of current, the physical breaker trips to 'OPEN', cutting electricity instantly so your house doesn't catch fire. Once you fix the toaster, you flip the switch to 'HALF-OPEN' to test 1 outlet before restoring full power.",
    },
    sections: [
      {
        heading: "1. Timeouts, Exponential Backoff & Full Jitter",
        body: [
          "1. **Never use default fetch/axios without timeouts**: A hung TCP socket will keep your connection open indefinitely.",
          "2. **Retry only transient errors**: Retry HTTP `429`, `502`, `503`, `504`, and `ECONNRESET`. NEVER retry `400`, `401`, `403`, or `404` (deterministic client errors).",
          "3. **Exponential Backoff Formula**: $\\text{Delay} = \\min(\\text{MaxDelay}, \\text{BaseDelay} \\times 2^{\\text{attempt}})$.",
          "4. **Full Jitter**: Multiply by a random fraction: $\\text{ActualDelay} = \\text{random}(0, \\text{Delay})$ to prevent millions of retrying clients from hitting the recovery server at the exact same millisecond.",
        ],
        code: [
          {
            file: "resilient-client.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "",
              "@Injectable()",
              "export class ResilientHttpClient {",
              "  private readonly logger = new Logger(ResilientHttpClient.name);",
              "",
              "  async fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {",
              "    for (let attempt = 0; attempt < maxRetries; attempt++) {",
              "      const controller = new AbortController();",
              "      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s strict timeout",
              "",
              "      try {",
              "        const res = await fetch(url, { ...options, signal: controller.signal });",
              "        clearTimeout(timeoutId);",
              "",
              "        if (res.ok) return res;",
              "        if (res.status < 500 && res.status !== 429) {",
              "          // Fatal client error (e.g. 400 Bad Request) - do not retry",
              "          return res;",
              "        }",
              "      } catch (err: any) {",
              "        clearTimeout(timeoutId);",
              "        if (attempt === maxRetries - 1) throw err;",
              "      }",
              "",
              "      // Calculate exponential backoff with full jitter",
              "      const backoff = Math.min(10000, 500 * Math.pow(2, attempt));",
              "      const jittered = Math.random() * backoff;",
              "      this.logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(jittered)}ms...`);",
              "      await new Promise((resolve) => setTimeout(resolve, jittered));",
              "    }",
              "    throw new Error(`Exceeded max retries for ${url}`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Custom resilient HTTP client with timeouts, retry, and jitter.",
          },
        ],
      },
      {
        heading: "2. Circuit Breaker States (Cockatiel / Opossum)",
        body: [
          "- **CLOSED (Normal Operation)**: All requests flow through to the downstream service. Failures are counted.",
          "- **OPEN (Failure State)**: When failure rate exceeds threshold (e.g. 50% errors over 10 seconds), the breaker trips. All subsequent calls fail immediately (Fast-Fail) with a fallback response, protecting downstream servers.",
          "- **HALF-OPEN (Probe State)**: After a cooldown reset period (e.g. 30 seconds), the breaker lets a single probe request pass. If it succeeds, the breaker resets to CLOSED. If it fails, it trips back to OPEN.",
        ],
        code: [
          {
            file: "circuit-breaker.ts",
            lang: "ts",
            code: [
              "import CircuitBreaker from 'opossum';",
              "",
              "const options: CircuitBreaker.Options = {",
              "  timeout: 3000, // If function takes longer than 3s, trigger failure",
              "  errorThresholdPercentage: 50, // When 50% of requests fail, open breaker",
              "  resetTimeout: 30000, // After 30s, enter HALF-OPEN and test 1 request",
              "};",
              "",
              "export const paymentBreaker = new CircuitBreaker(async (chargePayload) => {",
              "  return await fetch('https://api.stripe.com/v1/charges', {",
              "    method: 'POST',",
              "    body: JSON.stringify(chargePayload),",
              "  });",
              "}, options);",
              "",
              "paymentBreaker.fallback(() => ({",
              "  status: 'QUEUED_OFFLINE',",
              "  message: 'Payment gateway experiencing latency. Charge queued in background.',",
              "}));",
            ].join("\n"),
            caption: "Opossum Circuit Breaker with graceful offline fallback.",
          },
        ],
      },
    ],
    mistake: {
      title: "Retrying Non-Idempotent HTTP POST Requests Blindly",
      wrong: [
        "// ❌ Retrying POST /charges without an Idempotency-Key on timeout error:",
        "// If the original request actually went through at the bank, retrying charges the customer twice!",
      ].join("\n"),
      right: [
        "// ✅ Only retry POST operations when sending an explicit Idempotency-Key header:",
        "headers: { 'Idempotency-Key': transactionUuid }",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Simulating Downstream Outages with a Circuit Breaker",
      description:
        "Build a mock HTTP service that fails 80% of the time, wire a circuit breaker around it, and verify that the breaker trips and fast-fails within 5 requests.",
      tasks: [
        "Create a flaky route `GET /flaky-service` returning 500.",
        "Wrap the client in a Circuit Breaker with a 50% error threshold.",
        "Verify that after 5 failed calls, call 6 returns the fallback instantly in <1ms without touching the network.",
      ],
    },
    quiz: [
      {
        question: "Why is 'Full Jitter' critical when implementing exponential backoff retries?",
        options: [
          "It encrypts the payload over the wire.",
          "It spreads retry attempts randomly across time so thousands of crashed clients do not hit the recovering server in synchronized stampedes.",
          "It guarantees zero packet loss.",
          "It bypasses CORS security policies.",
        ],
        answer: 1,
        explanation:
          "Without jitter, all clients retry at exactly 1s, 2s, 4s, creating periodic spikes (thundering herds) that repeatedly knock down the recovering server.",
      },
    ],
  },

  "p29-l5": {
    id: "p29-l5",
    phaseId: "p29",
    title: "Webhooks: Signatures, Replays & Duplicate Delivery",
    level: "Advanced",
    minutes: 45,
    summary:
      "Build secure, enterprise-grade incoming and outgoing webhook systems. Implement HMAC-SHA256 signature verification with raw request buffers, timestamp tolerance windows, and replay protection.",
    prerequisites: ["p29-l1 REST Contracts", "p25-l1 Redis Basics"],
    objectives: [
      "Verify incoming webhook HMAC-SHA256 signatures using raw request bodies before JSON parsing.",
      "Enforce timestamp tolerance windows (5 minutes) to defeat replay attacks.",
      "Implement idempotent webhook event ingestion using Redis and Postgres transaction locks.",
    ],
    simple:
      "A webhook is an HTTP POST sent from a third-party server (like Stripe or GitHub) to your server when an event happens (e.g. `payment_intent.succeeded`). Because anyone on the internet can send POST requests to your public webhook URL, you must verify a cryptographic signature to prove the payload genuinely came from Stripe and hasn't been tampered with or replayed.",
    why:
      "Without signature verification and replay prevention, attackers can forge fake webhook events to grant themselves free lifetime subscriptions or drain merchant accounts.",
    mentalModel: {
      title: "The Wax Seal and Timestamped Envelope",
      body:
        "HMAC signing is like an unbroken royal wax seal. The sender hashes the exact body bytes with a shared secret key. If a hacker alters even a single comma in the payload or attempts to resubmit an old envelope from 3 weeks ago, the cryptographic seal breaks and the server rejects it.",
    },
    sections: [
      {
        heading: "1. HMAC-SHA256 Signature Verification & Raw Body Buffer",
        body: [
          "**Crucial Caveat**: Webhook signatures are computed over the **exact raw byte stream** received on the socket. If your Express/Fastify body parser normalizes whitespace or re-orders JSON keys before verification, the hash will NOT match.",
          "NestJS / Fastify configuration must capture `req.rawBody` buffer before body parsing.",
          "Verification requires `crypto.timingSafeEqual()` to protect against timing side-channel attacks.",
        ],
        code: [
          {
            file: "webhook-verifier.ts",
            lang: "ts",
            code: [
              "import * as crypto from 'crypto';",
              "import { Injectable, UnauthorizedException } from '@nestjs/common';",
              "",
              "@Injectable()",
              "export class WebhookSecurityService {",
              "  verifyHmacSignature(",
              "    rawBody: Buffer,",
              "    signatureHeader: string,",
              "    secret: string,",
              "    toleranceSeconds = 300, // 5 minutes tolerance",
              "  ): boolean {",
              "    // Format: t=1724883900,v1=9b1d...5c2a",
              "    const parts = signatureHeader.split(',');",
              "    const timestampStr = parts.find((p) => p.startsWith('t='))?.split('=')[1];",
              "    const signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1];",
              "",
              "    if (!timestampStr || !signature) {",
              "      throw new UnauthorizedException('Malformed webhook signature header.');",
              "    }",
              "",
              "    // 1. Defeat Replay Attacks with Timestamp Window",
              "    const timestamp = parseInt(timestampStr, 10);",
              "    const now = Math.floor(Date.now() / 1000);",
              "    if (Math.abs(now - timestamp) > toleranceSeconds) {",
              "      throw new UnauthorizedException('Webhook timestamp outside tolerance window.');",
              "    }",
              "",
              "    // 2. Compute Expected HMAC over (timestamp + '.' + rawBody)",
              "    const payloadToSign = Buffer.concat([",
              "      Buffer.from(`${timestamp}.`),",
              "      rawBody,",
              "    ]);",
              "    const expectedSignature = crypto",
              "      .createHmac('sha256', secret)",
              "      .update(payloadToSign)",
              "      .digest('hex');",
              "",
              "    // 3. Timing-Safe Constant-Time Comparison",
              "    const signatureBuffer = Buffer.from(signature, 'hex');",
              "    const expectedBuffer = Buffer.from(expectedSignature, 'hex');",
              "",
              "    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {",
              "      throw new UnauthorizedException('Invalid cryptographic webhook signature.');",
              "    }",
              "",
              "    return true;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Production HMAC-SHA256 signature verifier with replay protection.",
          },
        ],
      },
      {
        heading: "2. Idempotent Ingestion & Fast Acknowledgement",
        body: [
          "Webhook providers expect a `200 OK` response within 3–5 seconds. If your handler takes too long running heavy database queries, the provider marks it as failed and retries, triggering duplicate processing.",
          "**Standard Pipeline**:",
          "1. Verify HMAC signature instantly.",
          "2. Check if `eventId` was already processed (`SET webhook:processed:evt_123 1 NX EX 86400`). If duplicate, return `200 OK` immediately.",
          "3. Push raw event to background queue (BullMQ).",
          "4. Return `200 OK` in <50ms.",
        ],
      },
    ],
    mistake: {
      title: "Parsing JSON with body-parser Before Computing HMAC Hash",
      wrong: [
        "// ❌ Computing HMAC over JSON.stringify(req.body):",
        "const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');",
        "// Fails because V8 object key ordering and whitespace differ from the sender's original raw bytes!",
      ].join("\n"),
      right: [
        "// ✅ Verify against raw unparsed Buffer from HTTP socket:",
        "const hash = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex');",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Forge a Webhook and Verify Rejection",
      description:
        "Write a test script that attempts to forge a fake `payment_intent.succeeded` webhook with modified amounts, and confirm your verifier blocks it.",
      tasks: [
        "Send valid signed webhook -> expect 200 OK.",
        "Send webhook with modified `$10.00` to `$1000.00` -> expect 401 Unauthorized.",
        "Send valid webhook with timestamp from 2 hours ago -> expect 401 Unauthorized.",
      ],
    },
    quiz: [
      {
        question: "Why is crypto.timingSafeEqual() required when comparing cryptographic signatures?",
        options: [
          "Standard string comparison (a === b) returns early on the first mismatched byte, leaking timing clues that allow attackers to guess signatures byte-by-byte.",
          "It converts strings to UTF-16 automatically.",
          "It bypasses Node.js garbage collection pauses.",
          "It runs asynchronously on a worker thread.",
        ],
        answer: 0,
        explanation:
          "Timing attacks measure microsecond differences in comparison speed; constant-time comparison prevents attackers from exploiting early-exit string comparisons.",
      },
    ],
  },

  "p29-l6": {
    id: "p29-l6",
    phaseId: "p29",
    title: "Payment-Style Async Workflows & Reconciliation",
    level: "Advanced",
    minutes: 40,
    summary:
      "Architect bulletproof asynchronous commerce and billing workflows. Understand why browser redirects are never proof of payment, and implement scheduled nightly reconciliation crons.",
    prerequisites: ["p29-l5 Webhooks", "p23-l1 BullMQ"],
    objectives: [
      "Never trust client-side return URLs for business state mutations.",
      "Design an asynchronous Order State Machine (PENDING, PAID, FULFILLED, REFUNDED, FAILED).",
      "Build a scheduled reconciliation worker that queries third-party gateway APIs to resolve orphaned orders.",
    ],
    simple:
      "When a customer pays via PayPal or Stripe Checkout, they get redirected back to `yoursite.com/checkout/success?session_id=123`. A user can easily fake this browser URL by typing it into their address bar. Your database must only mark an order as PAID when you receive an authenticated webhook or verify the status directly with the payment gateway server-to-server.",
    why:
      "Relying on browser redirect query parameters to mark orders paid allows malicious users to steal products for free without paying.",
    mentalModel: {
      title: "The Court Order vs the Word of Mouth",
      body:
        "The customer returning from a redirect saying 'I paid!' is just word of mouth. The signed webhook or direct API response from the bank is the official certified court order. You only ship the goods when the court order arrives.",
    },
    sections: [
      {
        heading: "1. The 3-Legged Payment State Flow",
        body: [
          "1. **Order Creation**: Server creates `Order { status: 'PENDING_PAYMENT' }` and requests a payment session from Stripe/Paddle.",
          "2. **User Checkout**: User enters credit card on hosted checkout page.",
          "3. **Return Redirect**: Browser navigates to `/checkout/success`. The frontend displays 'Processing your order...', polling the server for status updates.",
          "4. **Server Webhook**: Stripe sends `checkout.session.completed` webhook. Server verifies HMAC, updates `Order { status: 'PAID' }`, and enqueues fulfillment.",
          "5. **Polling Resolves**: Frontend sees `status: 'PAID'` and shows the confirmed receipt.",
        ],
        code: [
          {
            file: "order-state-machine.ts",
            lang: "ts",
            code: [
              "export enum OrderStatus {",
              "  PENDING = 'PENDING',",
              "  PROCESSING = 'PROCESSING',",
              "  PAID = 'PAID',",
              "  FULFILLED = 'FULFILLED',",
              "  FAILED = 'FAILED',",
              "  REFUNDED = 'REFUNDED',",
              "}",
              "",
              "export function transitionOrderStatus(current: OrderStatus, next: OrderStatus): void {",
              "  const validTransitions: Record<OrderStatus, OrderStatus[]> = {",
              "    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.PAID, OrderStatus.FAILED],",
              "    [OrderStatus.PROCESSING]: [OrderStatus.PAID, OrderStatus.FAILED],",
              "    [OrderStatus.PAID]: [OrderStatus.FULFILLED, OrderStatus.REFUNDED],",
              "    [OrderStatus.FULFILLED]: [OrderStatus.REFUNDED],",
              "    [OrderStatus.FAILED]: [],",
              "    [OrderStatus.REFUNDED]: [],",
              "  };",
              "",
              "  if (!validTransitions[current].includes(next)) {",
              "    throw new Error(`Invalid state transition from ${current} to ${next}`);",
              "  }",
              "}",
            ].join("\n"),
            caption: "Strict order state transition machine.",
          },
        ],
      },
      {
        heading: "2. Nightly Reconciliation Crons (Healing Dropped Webhooks)",
        body: [
          "Webhooks can be dropped if your servers experience an outage or DNS failure. A scheduled reconciliation worker runs every night:",
          "1. Finds all orders created > 30 minutes ago still in `PENDING` state.",
          "2. Calls Stripe API `stripe.checkout.sessions.retrieve(order.sessionId)`.",
          "3. If Stripe reports `payment_status === 'paid'`, automatically reconciles the database to `PAID` and alerts operations.",
          "4. If Stripe reports expired, cancels the orphaned order and restores inventory.",
        ],
      },
    ],
    mistake: {
      title: "Trusting Client Query Parameters to Unlock Digital Goods",
      wrong: [
        "// ❌ Vulnerable Route Handler:",
        "app.get('/api/confirm-payment', async (req, res) => {",
        "  const { orderId, status } = req.query;",
        "  if (status === 'success') {",
        "    await db.order.update({ where: { id: orderId }, data: { status: 'PAID' } });",
        "  }",
        "});",
      ].join("\n"),
      right: [
        "// ✅ Verify directly with Stripe server API:",
        "const session = await stripe.checkout.sessions.retrieve(sessionId);",
        "if (session.payment_status === 'paid') {",
        "  await markOrderPaid(session.client_reference_id);",
        "}",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Build a Payment Reconciliation Cron",
      description:
        "Implement a NestJS `@Cron('0 */1 * * *')` job using `@nestjs/schedule` that inspects orphaned pending orders and synchronizes them against a mock payment gateway.",
      tasks: [
        "Query Prisma for `orders` created > 15m ago with status `PENDING`.",
        "Fetch payment status for each order from the gateway adapter.",
        "Update the order status and write an audit log entry in PostgreSQL.",
      ],
    },
    quiz: [
      {
        question: "Why is a scheduled reconciliation job necessary even if you have webhooks configured?",
        options: [
          "Because webhooks are slow.",
          "Because webhooks can fail or be dropped due to network partitions, server restarts, or provider delivery outages.",
          "Because Stripe requires reconciliation for PCI compliance.",
          "Because SQL databases cannot receive HTTP requests.",
        ],
        answer: 1,
        explanation:
          "Reconciliation provides an automated safety net to heal edge cases where webhooks were dropped or missed during server downtimes.",
      },
    ],
  },
};
