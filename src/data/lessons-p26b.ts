import type { LessonContent } from "./types";

export const LESSON_CONTENT_P26B: Record<string, LessonContent> = {
  "p26-l4": {
    id: "p26-l4",
    phaseId: "p26",
    title: "In-App Notifications: Tables, Unread, Preferences",
    level: "Advanced",
    minutes: 40,
    summary:
      "Design and implement a complete in-app notification center. Build the database schema with indexes for instant unread badge counts, mark-as-read mutations, pagination, and granular per-user notification preferences.",
    prerequisites: ["p21-l5 UI CRUD States", "p22-l1 Offset vs Cursor Pagination"],
    objectives: [
      "Design an efficient `Notification` schema with compound indexes on `[userId, isRead, createdAt]`.",
      "Implement unread counter queries with sub-millisecond execution times.",
      "Build per-user category notification preferences (Email vs In-App toggles).",
    ],
    simple:
      "An in-app notification center is the bell icon at the top right of every modern SaaS. Clicking it opens a dropdown showing recent mentions, task assignments, and workspace updates with an unread badge counter that decrements in real time.",
    why:
      "Naive notification queries (`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`) cause full table scans on large datasets if indexes are missing, bringing your database to a halt every time a user refreshes their dashboard.",
    mentalModel: {
      title: "The Physical Inbox Tray and Sticky Notes",
      body:
        "Every employee has an inbox tray. When a new sticky note arrives, the red counter increments. Flipping the note over marks it as read. Changing your preferences is telling your assistant: 'Only put urgent finance notes in my tray; email me weekly summaries for the rest.'",
    },
    sections: [
      {
        heading: "1. The Notification Schema & Index Strategy",
        body: [
          "Every notification record must store recipient `userId`, `actorId` (who caused it), `type`, `title`, `body`, `actionUrl`, `isRead`, and optional JSON `metadata`. Compound indexes are critical for high-speed counter queries.",
        ],
        code: [
          {
            file: "prisma/schema.prisma",
            lang: "prisma",
            code: [
              "enum NotificationType {",
              "  TASK_ASSIGNED",
              "  TASK_COMMENTED",
              "  WORKSPACE_INVITATION",
              "  MENTION",
              "}",
              "",
              "model Notification {",
              "  id          String           @id @default(uuid())",
              "  userId      String",
              "  actorId     String?",
              "  type        NotificationType",
              "  title       String",
              "  body        String",
              "  actionUrl   String?",
              "  isRead      Boolean          @default(false)",
              "  readAt      DateTime?",
              "  createdAt   DateTime         @default(now())",
              "",
              "  @@index([userId, isRead, createdAt(sort: Desc)])",
              "  @@index([userId, createdAt(sort: Desc)])",
              "}",
              "",
              "model NotificationPreference {",
              "  id          String           @id @default(uuid())",
              "  userId      String",
              "  type        NotificationType",
              "  inApp       Boolean          @default(true)",
              "  email       Boolean          @default(true)",
              "",
              "  @@unique([userId, type])",
              "}",
            ].join("\n"),
            caption: "Prisma schema for scalable in-app notifications and preferences.",
          },
        ],
      },
      {
        heading: "2. The Fast Unread Counter Endpoint",
        body: [
          "The unread count endpoint runs on almost every navigation. It must be optimized with indexed counts.",
        ],
        code: [
          {
            file: "src/notifications/notifications.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "",
              "@Injectable()",
              "export class NotificationsService {",
              "  constructor(private readonly prisma: PrismaService) {}",
              "",
              "  async getUnreadCount(userId: string): Promise<number> {",
              "    return this.prisma.notification.count({",
              "      where: {",
              "        userId,",
              "        isRead: false,",
              "      },",
              "    });",
              "  }",
              "",
              "  async markAllAsRead(userId: string): Promise<void> {",
              "    await this.prisma.notification.updateMany({",
              "      where: { userId, isRead: false },",
              "      data: { isRead: true, readAt: new Date() },",
              "    });",
              "  }",
              "}",
            ].join("\n"),
            caption: "High-performance unread count and bulk mark-as-read operations.",
          },
        ],
      },
    ],
    mistake: {
      title: "Querying Full Notification Payloads Just to Display the Unread Badge Number",
      wrong: [
        "// ❌ Fetches 500 rows and calculates array length in Node memory",
        "const all = await prisma.notification.findMany({ where: { userId } });",
        "const unread = all.filter(n => !n.isRead).length;",
      ].join("\n"),
      right: [
        "// ✅ Uses indexed SQL COUNT query without loading any rows into memory",
        "const unread = await prisma.notification.count({",
        "  where: { userId, isRead: false },",
        "});",
      ].join("\n"),
      explain:
        "Fetching full records into application memory wastes bandwidth, DB CPU, and Node.js heap memory, while `count()` uses index-only scans directly in PostgreSQL.",
    },
    tryIt: [
      "Add a notification record using Prisma Studio or SQL.",
      "Verify that `getUnreadCount` returns `1`, and calling `markAllAsRead` sets `isRead: true` with a timestamp.",
    ],
    challenge: {
      prompt: "Implement a cursor-based pagination query in NestJS that returns 20 notifications per page ordered by `createdAt` descending.",
      hints: [
        "Use `take: 20`, `skip: cursor ? 1 : 0`, and `cursor: cursor ? { id: cursor } : undefined`.",
      ],
      solution: [
        "async getFeed(userId: string, cursor?: string) {",
        "  const items = await this.prisma.notification.findMany({",
        "    where: { userId },",
        "    take: 21,",
        "    skip: cursor ? 1 : 0,",
        "    cursor: cursor ? { id: cursor } : undefined,",
        "    orderBy: { createdAt: 'desc' },",
        "  });",
        "  const hasMore = items.length > 20;",
        "  const results = hasMore ? items.slice(0, 20) : items;",
        "  return {",
        "    items: results,",
        "    nextCursor: hasMore ? results[results.length - 1].id : null,",
        "  };",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Which compound index is optimal for querying unread notifications sorted by most recent first?",
        options: [
          "@@index([body])",
          "@@index([userId, isRead, createdAt(sort: Desc)])",
          "@@index([actorId])",
          "@@index([actionUrl])",
        ],
        answer: 1,
        explanation:
          "This index allows PostgreSQL to filter by `userId` and `isRead = false`, and return rows in order of `createdAt DESC` without a separate sorting step.",
      },
    ],
    flashcards: [
      {
        front: "Why are compound indexes necessary on notifications tables?",
        back: "Because every user query filters simultaneously on `userId`, `isRead`, and sorts by `createdAt DESC`.",
      },
    ],
    recap: [
      "Structure notifications with type, actor, recipient, and payload.",
      "Use compound indexes to guarantee sub-millisecond unread counts.",
      "Respect user preferences before generating in-app or email alerts.",
    ],
    references: [
      { label: "PostgreSQL Indexing Best Practices", url: "https://www.postgresql.org/docs/current/indexes-multicolumn.html" },
    ],
    nextBridge: "Now let's look at Event-Driven Notification Creation using NestJS EventEmitter and domain events.",
  },

  "p26-l5": {
    id: "p26-l5",
    phaseId: "p26",
    title: "Event-Driven Notification Creation",
    level: "Advanced",
    minutes: 35,
    summary:
      "Decouple core business mutations from notification side-effects using Domain Events and NestJS `@nestjs/event-emitter`. Ensure task updates and comments don't tightly couple to email or push dispatch logic.",
    prerequisites: ["p26-l4 In-App Notifications", "p15-l4 Services & Dependency Injection"],
    objectives: [
      "Emit typed domain events (e.g., `TaskAssignedEvent`) from services.",
      "Handle events asynchronously using `@OnEvent('task.assigned', { async: true })`.",
      "Evaluate user notification preferences before queuing emails or inserting in-app alerts.",
    ],
    simple:
      "When a project manager assigns a task to an engineer, the `TasksService` should only care about updating the database record. It emits an event: `task.assigned`. A separate `NotificationEventListener` hears this event, checks if the engineer wants emails, creates the in-app notification, and dispatches an email job.",
    why:
      "Putting email, push notification, audit logging, and webhook logic directly inside `updateTask()` creates bloated 500-line service methods that violate the Single Responsibility Principle and fail if a secondary notification service throws an error.",
    mentalModel: {
      title: "The Press Release Announcement",
      body:
        "When the CEO signs a company merger (core event), they don't personally print newspapers, email stockholders, or update the website banner. They issue a single press release (Event). Different department heads (Event Listeners) read the release and take their own specific actions.",
    },
    sections: [
      {
        heading: "1. Emitting Domain Events in NestJS",
        body: [
          "Define clean, typed event classes and emit them via `EventEmitter2` from `@nestjs/event-emitter`.",
        ],
        code: [
          {
            file: "src/tasks/events/task-assigned.event.ts",
            lang: "ts",
            code: [
              "export class TaskAssignedEvent {",
              "  constructor(",
              "    public readonly taskId: string,",
              "    public readonly taskTitle: string,",
              "    public readonly assigneeId: string,",
              "    public readonly assignerId: string,",
              "    public readonly workspaceId: string,",
              "  ) {}",
              "}",
            ].join("\n"),
            caption: "Typed domain event payload class.",
          },
          {
            file: "src/tasks/tasks.service.ts",
            lang: "ts",
            code: [
              "import { Injectable } from '@nestjs/common';",
              "import { EventEmitter2 } from '@nestjs/event-emitter';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { TaskAssignedEvent } from './events/task-assigned.event';",
              "",
              "@Injectable()",
              "export class TasksService {",
              "  constructor(",
              "    private readonly prisma: PrismaService,",
              "    private readonly eventEmitter: EventEmitter2,",
              "  ) {}",
              "",
              "  async assignTask(taskId: string, assigneeId: string, actorId: string) {",
              "    const task = await this.prisma.task.update({",
              "      where: { id: taskId },",
              "      data: { assigneeId },",
              "    });",
              "",
              "    // Emit domain event — does not block or fail the primary transaction",
              "    this.eventEmitter.emit(",
              "      'task.assigned',",
              "      new TaskAssignedEvent(task.id, task.title, assigneeId, actorId, task.workspaceId)",
              "    );",
              "",
              "    return task;",
              "  }",
              "}",
            ].join("\n"),
            caption: "Emitting domain event after state mutation.",
          },
        ],
      },
      {
        heading: "2. The Notification Listener: Preferences and Dispatch",
        body: [
          "The listener receives the event, checks the recipient's preferences, creates an in-app notification, and enqueues an email job if requested.",
        ],
        code: [
          {
            file: "src/notifications/listeners/task-notification.listener.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "import { OnEvent } from '@nestjs/event-emitter';",
              "import { InjectQueue } from '@nestjs/bullmq';",
              "import { Queue } from 'bullmq';",
              "import { TaskAssignedEvent } from '../../tasks/events/task-assigned.event';",
              "import { PrismaService } from '../../prisma/prisma.service';",
              "",
              "@Injectable()",
              "export class TaskNotificationListener {",
              "  private readonly logger = new Logger(TaskNotificationListener.name);",
              "",
              "  constructor(",
              "    private readonly prisma: PrismaService,",
              "    @InjectQueue('emails') private readonly emailQueue: Queue,",
              "  ) {}",
              "",
              "  @OnEvent('task.assigned', { async: true })",
              "  async handleTaskAssigned(event: TaskAssignedEvent) {",
              "    // Don't notify yourself if you assign a task to yourself",
              "    if (event.assigneeId === event.assignerId) return;",
              "",
              "    // 1. Create in-app notification",
              "    await this.prisma.notification.create({",
              "      data: {",
              "        userId: event.assigneeId,",
              "        actorId: event.assignerId,",
              "        type: 'TASK_ASSIGNED',",
              "        title: 'New task assignment',",
              "        body: `You were assigned to \"${event.taskTitle}\"`,",
              "        actionUrl: `/workspaces/${event.workspaceId}/tasks/${event.taskId}`,",
              "      },",
              "    });",
              "",
              "    // 2. Queue email dispatch",
              "    const assignee = await this.prisma.user.findUnique({ where: { id: event.assigneeId } });",
              "    if (assignee?.email) {",
              "      await this.emailQueue.add('task-assigned', {",
              "        to: assignee.email,",
              "        name: assignee.name,",
              "        taskTitle: event.taskTitle,",
              "        url: `https://app.taskforge.dev/tasks/${event.taskId}`,",
              "      });",
              "    }",
              "  }",
              "}",
            ].join("\n"),
            caption: "Async event listener orchestrating in-app and email notifications.",
          },
        ],
      },
    ],
    mistake: {
      title: "Notifying the Actor for Their Own Actions",
      wrong: [
        "// ❌ User A assigns task to User A -> User A receives an email notification!",
        "await emailQueue.add({ to: user.email, message: 'You assigned a task to yourself' });",
      ].join("\n"),
      right: [
        "// ✅ Skip notification if actor is the same as the target recipient",
        "if (event.actorId === event.recipientId) return;",
      ].join("\n"),
      explain:
        "Sending notifications to users for actions they personally initiated creates notification fatigue and spam complaints.",
    },
    tryIt: [
      "Import `EventEmitterModule.forRoot()` in your `AppModule`.",
      "Emit a custom test event and verify the `@OnEvent()` handler receives the payload.",
    ],
    challenge: {
      prompt: "How can you ensure that an error inside `TaskNotificationListener` never rolls back the database transaction that assigned the task?",
      hints: [
        "Use `{ async: true }` in `@OnEvent` decorator and wrap the handler body in a `try/catch` block with logging.",
      ],
      solution: [
        "@OnEvent('task.assigned', { async: true })",
        "async handleTaskAssigned(event: TaskAssignedEvent) {",
        "  try {",
        "    // notification logic...",
        "  } catch (error) {",
        "    this.logger.error(`Failed to dispatch notification for event ${event.taskId}`, error);",
        "    // Do not re-throw! The task assignment transaction is already committed.",
        "  }",
        "}",
      ].join("\n"),
    },
    quiz: [
      {
        question: "What is the primary benefit of emitting Domain Events for notifications?",
        options: [
          "It makes PostgreSQL queries run in parallel.",
          "It adheres to Single Responsibility Principle by decoupling primary business operations from secondary side-effects.",
          "It replaces the need for database tables.",
          "It automatically encrypts network payloads.",
        ],
        answer: 1,
        explanation:
          "Domain events decouple side-effects (emails, analytics, push notifications) from core transactional state transitions.",
      },
    ],
    flashcards: [
      {
        front: "Why should notification event listeners be asynchronous (`{ async: true }`)?",
        back: "To prevent notification latency or errors from blocking or rolling back the primary user-facing database mutation.",
      },
    ],
    recap: [
      "Use `EventEmitter2` to publish typed domain events.",
      "Keep core business services focused exclusively on domain updates.",
      "Handle secondary side-effects (in-app alerts, email queue jobs) in decoupled event listeners.",
    ],
    references: [
      { label: "NestJS Event Emitter Documentation", url: "https://docs.nestjs.com/techniques/events" },
    ],
    nextBridge: "In the final lesson of Phase 26, we explore the crucial boundary between Auth verification emails and application domain notifications.",
  },

  "p26-l6": {
    id: "p26-l6",
    phaseId: "p26",
    title: "Verification/Reset Emails vs App Notifications",
    level: "Advanced",
    minutes: 30,
    summary:
      "Clarify the critical architectural difference between Authentication Lifecycle Emails (Signup verification, Magic links, Password resets managed by Supabase/Auth provider) and Application Domain Notifications (Task updates, Invoices, Mentions managed by your NestJS/BullMQ system).",
    prerequisites: ["p17-l1 Supabase Auth Flows", "p26-l1 Email Provider Boundary"],
    objectives: [
      "Understand when to delegate email delivery to Supabase Auth vs when to use your custom NestJS email queue.",
      "Configure custom SMTP / transactional providers in Supabase Auth settings.",
      "Prevent split-brain email architectures by establishing clear domain ownership rules.",
    ],
    simple:
      "When a user signs up or requests a password reset, Supabase Auth sends the confirmation link with a secure cryptographically signed token. You don't manage those tokens in your application database. For everything else (e.g. 'Sarah mentioned you on Task #42'), your NestJS backend generates and sends the email.",
    why:
      "Trying to roll your own password reset token generation in NestJS when using Supabase Auth leads to security vulnerabilities and token synchronization bugs. Let the Auth provider handle Auth tokens, and let your backend handle app alerts.",
    mentalModel: {
      title: "Building Security Keys vs Office Memos",
      body:
        "The building landlord (Supabase Auth) hands you the physical electronic keycard to unlock the front door (Auth verification/reset). The department team inside the office sends you meeting invitations and memos (App notifications).",
    },
    sections: [
      {
        heading: "1. The Responsibility Matrix",
        body: [
          "Maintain strict boundaries between Identity Provider communications and Application Domain communications.",
        ],
        code: [
          {
            file: "architecture-boundaries.ts",
            lang: "ts",
            code: [
              "// Category A: Managed by Supabase Auth (or Auth0 / Clerk)",
              "// - Email Confirmation / Signup Verification",
              "// - Password Reset (Forgot Password)",
              "// - Magic Link Sign In",
              "// - Change Email Confirmation",
              "// - Multi-Factor Authentication (MFA) SMS / Email Codes",
              "",
              "// Category B: Managed by NestJS + BullMQ + Resend / Postmark",
              "// - Workspace Invitations & Team Onboarding",
              "// - Task Assignment & @Mentions",
              "// - Monthly Billing Invoices & Receipts",
              "// - Weekly Digest Summaries & Usage Reports",
              "// - In-App Bell Notifications",
            ].join("\n"),
            caption: "Clear architectural division of email responsibilities.",
          },
        ],
      },
      {
        heading: "2. Linking Supabase Auth Custom SMTP to Resend",
        body: [
          "To maintain a single unified sender reputation, configure Supabase Auth to use your existing Resend or Postmark SMTP credentials rather than the default rate-limited Supabase testing pool.",
        ],
        code: [
          {
            file: "supabase/config.toml",
            lang: "text",
            code: [
              "[auth.email]",
              "enable_signup = true",
              "double_confirm_changes = true",
              "enable_confirmations = true",
              "",
              "[auth.email.smtp]",
              "host = \"smtp.resend.com\"",
              "port = 465",
              "user = \"resend\"",
              "pass = \"env(RESEND_SMTP_API_KEY)\"",
              "admin_email = \"security@taskforge.dev\"",
              "sender_name = \"TaskForge Security\"",
            ].join("\n"),
            caption: "Configuring Supabase Auth to route security emails through your production SMTP provider.",
          },
        ],
      },
    ],
    mistake: {
      title: "Generating Custom Password Reset Tokens in NestJS While Supabase Auth Is the Identity Authority",
      wrong: [
        "// ❌ Rolling custom password reset in NestJS while Supabase holds the hashed passwords",
        "const resetToken = crypto.randomBytes(32).toString('hex');",
        "await prisma.passwordReset.create({ data: { token: resetToken, userId } });",
      ].join("\n"),
      right: [
        "// ✅ Trigger standard Supabase Auth reset flow",
        "await supabase.auth.resetPasswordForEmail(email, {",
        "  redirectTo: 'https://app.taskforge.dev/auth/update-password',",
        "});",
      ].join("\n"),
      explain:
        "Supabase Auth manages salt hashing, password rotation, and token invalidation. Generating parallel password reset mechanisms in your application layer creates critical authentication bypass vectors.",
    },
    tryIt: [
      "Review your Supabase Auth dashboard SMTP settings and set sender name to your application brand.",
      "Test a password reset flow from the frontend and verify the email arrives from your custom domain.",
    ],
    challenge: {
      prompt: "Why should transactional workspace invitation emails with custom roles and permission payloads be handled by NestJS rather than Supabase's basic `inviteUserByEmail`?",
      hints: [
        "NestJS has access to your full workspace database, role hierarchy, and rich React Email templates.",
      ],
      solution: [
        "// NestJS handles the rich workspace invitation flow:",
        "// 1. Creates WorkspaceInvite record with specific role (ADMIN / MEMBER)",
        "// 2. Renders custom React Email with inviter's avatar and workspace stats",
        "// 3. Delivers via BullMQ queue with custom tracking tags",
      ].join("\n"),
    },
    quiz: [
      {
        question: "Which type of email should be handled directly by Supabase Auth rather than a custom NestJS queue?",
        options: [
          "Monthly PDF billing receipts.",
          "Password reset and signup verification emails.",
          "Task assignment alerts.",
          "Weekly summary newsletters.",
        ],
        answer: 1,
        explanation:
          "Security-sensitive credential and verification links contain cryptographically signed tokens generated and validated by the authentication provider.",
      },
    ],
    flashcards: [
      {
        front: "What is the boundary between Auth security emails and Application notifications?",
        back: "Auth emails (resets, signups, magic links) are generated by the Identity Provider (Supabase). Application notifications (tasks, invites, invoices) are generated by your NestJS background worker.",
      },
    ],
    recap: [
      "Delegate password resets and email verifications to the Identity Provider.",
      "Route Identity Provider emails through your custom SMTP to protect domain deliverability.",
      "Handle all application domain notifications and digests in NestJS with BullMQ.",
    ],
    references: [
      { label: "Supabase Custom SMTP Configuration", url: "https://supabase.com/docs/guides/auth/auth-smtp" },
    ],
    nextBridge: "Phase 26 is complete! Next up is Phase 27: Caching Mastery across Browser, CDN, Redis, and Application layers.",
  },
};
