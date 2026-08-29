import type { LessonContent } from "./types";

/**
 * Phase 20 Forms & End-to-End Validation (L4–L6).
 */
export const LESSONS_P20B: LessonContent[] = [
  {
    id: "p20-l4",
    phaseId: "p20",
    title: "Backend DTOs: Whitelisting & Cross-Field Rules",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Harden NestJS validation pipelines with `class-validator` and `class-transformer`. Enforce strict property whitelisting (`forbidNonWhitelisted: true`), prevent Mass Assignment parameter pollution, and write custom cross-field validation decorators.",
    prerequisites: [
      "p12-l2 — Pipes, Guards & Custom Decorators",
      "p10-l4 — DTOs, Config & Environment Validation",
    ],
    objectives: [
      "Configure global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.",
      "Decorate complex nested DTOs with `@ValidateNested()` and `@Type()` transformers.",
      "Prevent Mass Assignment vulnerabilities where malicious extra JSON keys bypass business logic.",
      "Write custom validation decorators for cross-field business constraints (e.g. `IsBeforeDate`).",
    ],
    simple:
      "When a client sends a JSON payload to your backend, an attacker can attach extra fields like `{ \"role\": \"SUPER_ADMIN\", \"workspaceId\": \"victim_ws\" }`. If your backend automatically passes the entire request body to the database, the attacker has successfully hijacked admin privileges. With NestJS `whitelist` and `forbidNonWhitelisted`, any property not explicitly decorated in the DTO is immediately rejected with HTTP 400.",
    why:
      "Mass assignment vulnerabilities are one of the most widespread OWASP API Security Top 10 vulnerabilities. Enforcing strict DTO whitelisting closes this vector completely.",
    mentalModel: {
      title: "The VIP Guest List & The Metal Detector",
      body: "Your NestJS DTO is the strict VIP guest list at the door. If a guest arrives with uninvited strangers hiding in their luggage (`role: 'ADMIN'`), the security guard (`ValidationPipe`) detects the unlisted guest, rejects the entire group at the door with HTTP 400 Bad Request, and refuses entry.",
    },
    sections: [
      {
        heading: "1. Global ValidationPipe Whitelist Configuration",
        body: [
          "In `main.ts`, configure ValidationPipe with strict security defaults.",
        ],
        code: [
          {
            file: "src/main.ts",
            lang: "ts",
            code: [
              "import { ValidationPipe } from '@nestjs/common';",
              "",
              "app.useGlobalPipes(",
              "  new ValidationPipe({",
              "    whitelist: true, // Strip any properties not decorated in the DTO",
              "    forbidNonWhitelisted: true, // Throw HTTP 400 error if unrecognized properties exist",
              "    transform: true, // Automatically cast payloads into DTO class instances",
              "    transformOptions: {",
              "      enableImplicitConversion: false, // Prevent loose accidental type coercion",
              "    },",
              "  }),",
              ");",
            ].join("\n"),
            caption: "Hardened global ValidationPipe configuration.",
          },
        ],
      },
      {
        heading: "2. Nested DTOs & Custom Cross-Field Validators",
        body: [
          "Validating nested arrays of objects and custom business constraints.",
        ],
        code: [
          {
            file: "src/tasks/dto/create-task.dto.ts",
            lang: "ts",
            code: [
              "import {",
              "  IsString,",
              "  IsNotEmpty,",
              "  IsEnum,",
              "  IsOptional,",
              "  IsDateString,",
              "  IsArray,",
              "  ValidateNested,",
              "  MinLength,",
              "  MaxLength,",
              "} from 'class-validator';",
              "import { Type } from 'class-transformer';",
              "",
              "export class CreateSubtaskDto {",
              "  @IsString()",
              "  @IsNotEmpty()",
              "  @MaxLength(100)",
              "  title!: string;",
              "}",
              "",
              "export enum TaskPriority {",
              "  LOW = 'LOW',",
              "  MEDIUM = 'MEDIUM',",
              "  HIGH = 'HIGH',",
              "  URGENT = 'URGENT',",
              "}",
              "",
              "export class CreateTaskDto {",
              "  @IsString()",
              "  @IsNotEmpty()",
              "  @MinLength(3)",
              "  @MaxLength(100)",
              "  title!: string;",
              "",
              "  @IsString()",
              "  @IsOptional()",
              "  @MaxLength(1000)",
              "  description?: string;",
              "",
              "  @IsEnum(TaskPriority, { message: 'priority must be LOW, MEDIUM, HIGH, or URGENT' })",
              "  priority!: TaskPriority;",
              "",
              "  @IsDateString()",
              "  @IsOptional()",
              "  dueDate?: string;",
              "",
              "  @IsArray()",
              "  @ValidateNested({ each: true })",
              "  @Type(() => CreateSubtaskDto)",
              "  @IsOptional()",
              "  subtasks?: CreateSubtaskDto[];",
              "}",
            ].join("\n"),
            caption: "Nested DTO with strict class-validator and class-transformer decorators.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Forgetting `@ValidateNested()` and `@Type(() => SubtaskDto)` on nested DTO arrays, allowing invalid child objects to slip into the database without validation.",
      right: "Always pairing `@ValidateNested({ each: true })` with `@Type(() => DtoClass)` for object and array properties.",
      explanation:
        "class-validator cannot inspect nested object properties unless class-transformer explicitly converts the plain JS objects into class instances.",
    },
    tryItYourself: {
      title: "Attack Your Endpoint with an Unrecognized Property",
      instructions: [
        "1. Open your API client (Postman/curl) and target `POST /api/v1/tasks`.",
        "2. Send a valid payload with an extra field: `{ \"title\": \"Test\", \"priority\": \"LOW\", \"hackerField\": 123 }`.",
        "3. Verify that NestJS rejects the request with HTTP 400: `property hackerField should not exist`.",
      ],
      expected: "The request is rejected before executing any controller or service code.",
    },
    challenge: {
      title: "Write an @IsFutureDate Custom Constraint Decorator",
      description:
        "Implement a custom `class-validator` decorator using `registerDecorator` that verifies an ISO date string is at least 1 hour in the future.",
      hints: [
        "Use `ValidatorConstraint` and `ValidatorConstraintInterface`.",
      ],
      solution: `@ValidatorConstraint({ name: 'isFutureDate', async: false })\nexport class IsFutureDateConstraint implements ValidatorConstraintInterface {\n  validate(val: any) {\n    return typeof val === 'string' && new Date(val).getTime() > Date.now() + 3600000;\n  }\n  defaultMessage() { return 'Date must be at least 1 hour in the future'; }\n}`,
    },
    quiz: [
      {
        question: "What does `forbidNonWhitelisted: true` do in NestJS ValidationPipe?",
        options: [
          "It blocks non-whitelisted IP addresses",
          "It throws HTTP 400 Bad Request if the client sends any property not explicitly decorated in the DTO",
          "It encrypts all database passwords",
          "It disables CORS preflights",
        ],
        answer: 1,
        explanation: "forbidNonWhitelisted treats any unknown payload properties as a malicious request and throws HTTP 400.",
      },
      {
        question: "Why is `@Type(() => NestedDto)` required alongside `@ValidateNested()`?",
        options: [
          "To instruct class-transformer how to instantiate the nested class for validation",
          "To format JSON as XML",
          "To generate Swagger documentation",
          "To trigger a Prisma migration",
        ],
        answer: 0,
        explanation: "Without @Type, JavaScript objects in nested arrays remain plain objects that class-validator cannot inspect.",
      },
    ],
    flashcards: [
      {
        front: "What is Mass Assignment Vulnerability?",
        back: "An attack where a client sends unexpected payload keys (e.g. `isAdmin: true`) that the backend blindly binds into the database.",
      },
      {
        front: "What does `transform: true` in ValidationPipe do?",
        back: "It automatically converts incoming plain JavaScript request bodies into strongly typed instances of the DTO class.",
      },
    ],
    recap: [
      "Set `whitelist: true` and `forbidNonWhitelisted: true` globally.",
      "Use `@ValidateNested()` and `@Type()` for nested objects and arrays.",
      "Write custom constraint decorators for domain-specific cross-field rules.",
    ],
    references: [
      { label: "NestJS Validation Documentation", url: "https://docs.nestjs.com/techniques/validation" },
      { label: "class-validator Repository", url: "https://github.com/typestack/class-validator" },
    ],
    nextBridge: "Now let's examine the Two Trust Boundaries: why client Zod validation does NOT replace server DTO validation.",
  },

  {
    id: "p20-l5",
    phaseId: "p20",
    title: "Two Trust Boundaries: Zod Does Not Replace DTOs",
    level: "Full-Stack Developer",
    minutes: 30,
    summary:
      "Internalize the Two Trust Boundaries mental model. Understand why client-side Zod validation is purely a User Experience (UX) optimization, while backend NestJS DTO validation is an uncompromising Security Boundary.",
    prerequisites: [
      "p20-l2 — React Hook Form + Zod: Accessible by Default",
      "p20-l4 — Backend DTOs: Whitelisting & Cross-Field Rules",
    ],
    objectives: [
      "Articulate the difference between UX Validation (client) and Security Validation (server).",
      "Prove that any client-side JavaScript validation can be trivially bypassed using `curl` or Postman.",
      "Maintain parity between client Zod schemas and backend DTOs without sharing unsafe backend code in browser bundles.",
      "Design defensive validation architectures that assume the client is compromised.",
    ],
    simple:
      "Never trust the client. A user can open their browser DevTools, disable JavaScript, or send raw HTTP requests using `curl` or Postman. Client-side Zod validation is there to make the user happy (instant feedback, accessible error messages). Backend NestJS DTO validation is there to protect the database from hackers. You need BOTH: Zod for speed, NestJS for security.",
    why:
      "Beginners often think 'I validated the form with Zod on the frontend, so I don't need to validate on the backend'. This is one of the most common causes of data corruption and server security breaches.",
    mentalModel: {
      title: "The Airport Ticket Kiosk & The Security Gate",
      body: "Client-side Zod validation is the self-service ticket kiosk in the airport lobby: it helps you spell your name correctly and select your seat nicely (UX). Backend NestJS validation is the armed TSA security gate and X-ray scanner: regardless of what sticker the kiosk printed, the security gate scans your actual luggage before you are allowed onto the plane (Security).",
    },
    sections: [
      {
        heading: "1. The Two-Boundary Architecture Comparison",
        body: [
          "Understanding why both layers exist independently and their distinct responsibilities.",
        ],
        code: [
          {
            file: "TRUST_BOUNDARIES.md",
            lang: "text",
            code: [
              "┌───────────────────────────────────────┬───────────────────────────────────────┐",
              "│ CLIENT-SIDE VALIDATION (ZOD / UX)     │ SERVER-SIDE VALIDATION (DTO / SEC)    │",
              "├───────────────────────────────────────┼───────────────────────────────────────┤",
              "│ • Runs in browser JavaScript          │ • Runs in authoritative NestJS backend│",
              "│ • Purpose: Instant user feedback      │ • Purpose: System & database integrity│",
              "│ • Can be bypassed by curl / attackers │ • Cannot be bypassed by any client    │",
              "│ • Provides field focus & accessibility│ • Prevents SQLi, XSS, parameter hacks │",
              "│ • Never authoritative                 │ • 100% Authoritative                  │",
              "└───────────────────────────────────────┴───────────────────────────────────────┘",
            ].join("\n"),
            caption: "The Two Trust Boundaries model.",
          },
        ],
      },
      {
        heading: "2. Attacking Your Own Endpoint with curl",
        body: [
          "Proving that client validation does not protect the server.",
        ],
        code: [
          {
            file: "terminal",
            lang: "bash",
            code: [
              "# An attacker bypasses React Hook Form + Zod completely:",
              "curl -X POST https://api.yourapp.com/tasks \\",
              "  -H \"Content-Type: application/json\" \\",
              "  -H \"Authorization: Bearer <token>\" \\",
              "  -d '{",
              "    \"title\": \"\",",
              "    \"priority\": \"INVALID_PRIORITY\",",
              "    \"maliciousExtraField\": \"DROP TABLE users;\"",
              "  }'",
              "",
              "# Expected Backend Response (HTTP 400):",
              "# {",
              "#   \"statusCode\": 400,",
              "#   \"message\": [",
              "#     \"title must be longer than 3 characters\",",
              "#     \"priority must be LOW, MEDIUM, HIGH, or URGENT\",",
              "#     \"property maliciousExtraField should not exist\"",
              "#   ],",
              "#   \"error\": \"Bad Request\"",
              "# }",
            ].join("\n"),
            caption: "Executing a direct curl attack to verify server-side DTO enforcement.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Importing backend Prisma models or NestJS classes into client React bundles to share validation logic, ballooning bundle size and leaking backend secrets.",
      right: "Keeping client Zod schemas and backend DTOs isolated or shared via a clean shared types package.",
      explanation:
        "Bundling NestJS or backend packages in Vite breaks the client build due to Node-specific dependencies (fs, crypto).",
    },
    tryItYourself: {
      title: "Simulate a Direct API Attack with curl",
      instructions: [
        "1. Start your local dev server.",
        "2. Run a curl command with an empty title and invalid priority directly against `POST /api/v1/tasks`.",
        "3. Verify that your NestJS ValidationPipe blocks the request with a structured 400 Bad Request.",
      ],
      expected: "The database remains untouched and an HTTP 400 error is returned.",
    },
    challenge: {
      title: "Design a Shared Monorepo Contract (Preview)",
      description:
        "Explain how a pnpm workspace monorepo allows sharing TypeScript interfaces and Zod schemas between `apps/web` and `apps/api` without sharing Node runtime dependencies.",
      hints: [
        "Create a `packages/contracts` package that exports pure TypeScript types and Zod schemas.",
      ],
      solution: `In packages/contracts/src/tasks.ts, export createTaskSchema and type CreateTaskDto = z.infer<typeof createTaskSchema>. Both Next.js and NestJS import from '@workspace/contracts' cleanly.`,
    },
    quiz: [
      {
        question: "Why can client-side validation never be trusted for security?",
        options: [
          "Browsers do not support SSL",
          "Any client can bypass browser JavaScript completely by issuing raw HTTP requests using curl, Postman, or custom scripts",
          "Zod only works on Tuesdays",
          "React is not an authenticated runtime",
        ],
        answer: 1,
        explanation: "HTTP endpoints are publicly addressable; anyone can send arbitrary HTTP packets directly to the server.",
      },
      {
        question: "What is the primary role of client-side Zod validation?",
        options: [
          "Database backup",
          "Immediate user experience feedback and accessible error messaging",
          "Database indexing",
          "DNS routing",
        ],
        answer: 1,
        explanation: "Client validation improves user experience by giving immediate feedback before making expensive network calls.",
      },
    ],
    flashcards: [
      {
        front: "What is the 'Zero Trust Client' principle?",
        back: "The security rule that every incoming server request must be treated as potentially malicious regardless of client validation.",
      },
      {
        front: "Why should you never share backend Prisma code directly with frontend bundles?",
        back: "Prisma requires Node binary engines and filesystem access that will crash browser Vite builds.",
      },
    ],
    recap: [
      "Client validation = User Experience (UX).",
      "Server validation = Security & System Integrity.",
      "Always assume the client is hostile and enforce strict DTO validation on every endpoint.",
    ],
    references: [
      { label: "OWASP API Security Top 10", url: "https://owasp.org/www-project-api-security" },
    ],
    nextBridge: "Now let's complete Phase 20 by mapping backend HTTP 400/422 field errors dynamically into React Hook Form.",
  },

  {
    id: "p20-l6",
    phaseId: "p20",
    title: "Mapping Backend Field Errors Into Forms",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Complete the full-stack error loop. Capture backend HTTP 400/422 validation error responses, parse structured field violation maps, and dynamically inject them into React Hook Form using `setError()` so server errors display directly under the relevant inputs.",
    prerequisites: [
      "p20-l2 — React Hook Form + Zod: Accessible by Default",
      "p19-l1 — Designing the Typed API Layer",
    ],
    objectives: [
      "Catch `ApiError` instances during form submission in `handleSubmit`.",
      "Extract field-level error messages from backend HTTP 400/422 payloads.",
      "Map server errors into React Hook Form using `setError(fieldName, { message })`.",
      "Distinguish between field-specific errors (e.g. 'Email already in use') and global root errors (e.g. 'Database timeout').",
    ],
    simple:
      "Sometimes validation can only happen on the server—for example, checking if an email address or workspace slug is already taken in the database. When the backend rejects the submission, we don't want to show a generic alert popup. Instead, we catch the server response and dynamically attach the error to the exact input field in React Hook Form so the input turns red with the server's explanation.",
    why:
      "Showing generic 'An error occurred' banners forces users to guess which input failed. Mapping backend errors directly to inputs creates seamless, professional user experiences.",
    mentalModel: {
      title: "The Returned Mail Envelope & The Sticky Note",
      body: "When the postal service rejects a package because 'Apartment 4B does not exist' (server error), they don't just dump the package in the street. They stamp a sticky note directly on the Apartment field of the address label (`setError('apartment', ...)`). When you pick up the envelope, you see the exact field that needs correction.",
    },
    sections: [
      {
        heading: "1. The Server Error Mapper Utility",
        body: [
          "Building a generic helper function that inspects an `ApiError` and populates React Hook Form errors.",
        ],
        code: [
          {
            file: "src/lib/forms/mapServerErrors.ts",
            lang: "ts",
            code: [
              "import { UseFormSetError, FieldValues, Path } from 'react-hook-form';",
              "import { ApiError } from '@/lib/api/errors';",
              "",
              "export function mapServerErrorsToForm<TFormValues extends FieldValues>(",
              "  error: unknown,",
              "  setError: UseFormSetError<TFormValues>,",
              "  setGlobalError?: (msg: string) => void,",
              "): void {",
              "  if (!(error instanceof ApiError)) {",
              "    setGlobalError?.('An unexpected network error occurred. Please try again.');",
              "    return;",
              "  }",
              "",
              "  // 1. Handle structured field validation errors (HTTP 400 / 422)",
              "  if (error.validationErrors) {",
              "    Object.entries(error.validationErrors).forEach(([field, messages]) => {",
              "      setError(field as Path<TFormValues>, {",
              "        type: 'server',",
              "        message: Array.isArray(messages) ? messages[0] : String(messages),",
              "      });",
              "    });",
              "    return;",
              "  }",
              "",
              "  // 2. Handle HTTP 409 Conflict (e.g. slug already taken)",
              "  if (error.isConflict) {",
              "    setError('slug' as Path<TFormValues>, {",
              "      type: 'server',",
              "      message: error.message || 'This value is already in use',",
              "    });",
              "    return;",
              "  }",
              "",
              "  // 3. Fallback to global error banner for 500, 403, 401",
              "  setGlobalError?.(error.message);",
              "}",
            ].join("\n"),
            caption: "Generic utility mapping ApiError field violations directly into React Hook Form.",
          },
        ],
      },
      {
        heading: "2. Consuming Server Error Mapping in Form Submit Handler",
        body: [
          "Wiring `mapServerErrorsToForm` inside a real mutation submit handler.",
        ],
        code: [
          {
            file: "src/features/workspaces/components/CreateWorkspaceForm.tsx",
            lang: "tsx",
            code: [
              "import { useState } from 'react';",
              "import { useForm } from 'react-hook-form';",
              "import { mapServerErrorsToForm } from '@/lib/forms/mapServerErrors';",
              "import { apiClient } from '@/lib/api/client';",
              "",
              "interface FormValues {",
              "  name: string;",
              "  slug: string;",
              "}",
              "",
              "export function CreateWorkspaceForm({ onSuccess }: { onSuccess: () => void }) {",
              "  const [globalError, setGlobalError] = useState<string | null>(null);",
              "  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>();",
              "",
              "  const onSubmit = async (values: FormValues) => {",
              "    setGlobalError(null);",
              "    try {",
              "      await apiClient('/workspaces', { method: 'POST', body: values });",
              "      onSuccess();",
              "    } catch (err) {",
              "      mapServerErrorsToForm(err, setError, setGlobalError);",
              "    }",
              "  };",
              "",
              "  return (",
              "    <form onSubmit={handleSubmit(onSubmit)} noValidate className=\"space-y-4\">",
              "      {globalError && (",
              "        <div className=\"p-3 bg-rose-950/80 border border-rose-600 rounded text-xs text-rose-300\" role=\"alert\">",
              "          {globalError}",
              "        </div>",
              "      )}",
              "",
              "      <div>",
              "        <label className=\"block text-xs font-semibold mb-1\">Workspace Slug</label>",
              "        <input {...register('slug')} className=\"input w-full\" aria-invalid={Boolean(errors.slug)} />",
              "        {errors.slug && <p className=\"text-xs text-rose-400 mt-1\">{errors.slug.message}</p>}",
              "      </div>",
              "",
              "      <button disabled={isSubmitting} className=\"btn btn-primary w-full\">",
              "        {isSubmitting ? 'Creating...' : 'Create Workspace'}",
              "      </button>",
              "    </form>",
              "  );",
              "}",
            ].join("\n"),
            caption: "Form handling server validation errors with inline field annotations.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Displaying all server errors in a single alert() or generic top toast without indicating which field caused the rejection.",
      right: "Using form.setError() to bind backend errors directly to the responsible input field.",
      explanation:
        "Inline error annotations provide clear, immediate guidance on what the user needs to fix.",
    },
    tryItYourself: {
      title: "Trigger a Duplicate Slug Server Error",
      instructions: [
        "1. Attempt to create a workspace with a slug that already exists in the database (e.g. 'acme-corp').",
        "2. Submit the form.",
        "3. Verify that the 'slug' input turns red with the message 'This value is already in use'.",
      ],
      expected: "The server error maps directly under the slug field with zero page reload.",
    },
    challenge: {
      title: "Clear Server Errors Automatically on Field Edit",
      description:
        "Configure React Hook Form `reValidateMode: 'onChange'` so that once a user starts correcting a field that received a server error, the error is cleared immediately.",
      hints: [
        "Pass `reValidateMode: 'onChange'` in the `useForm` options object.",
      ],
      solution: `const form = useForm<FormValues>({\n  reValidateMode: 'onChange',\n});`,
    },
    quiz: [
      {
        question: "What React Hook Form method manually injects an error into a specific field?",
        options: ["form.addError()", "form.setError(fieldName, errorObj)", "form.attachError()", "form.dispatchError()"],
        answer: 1,
        explanation: "`setError('fieldName', { type: 'server', message: 'Error text' })` programmatically binds an error to that field.",
      },
      {
        question: "What is the recommended fallback when a server error does not belong to any specific form field?",
        options: [
          "Crash the application",
          "Display a global form-level error banner or toast notification",
          "Clear all inputs",
          "Logout the user",
        ],
        answer: 1,
        explanation: "Global errors (500 internal server error, network drop) should be surfaced in an accessible top-level banner.",
      },
    ],
    flashcards: [
      {
        front: "What does `setError('root', { message })` do in React Hook Form?",
        back: "Sets a form-level root error accessible via `errors.root.message`.",
      },
      {
        front: "Why should `type: 'server'` be specified in `setError`?",
        back: "It designates that the error originated from the server rather than client-side schema validation.",
      },
    ],
    recap: [
      "Capture `ApiError` instances in form submission handlers.",
      "Map field-level backend errors using `setError(field, { message })`.",
      "Render a global alert banner for general system errors.",
    ],
    references: [
      { label: "React Hook Form setError API", url: "https://react-hook-form.com/docs/useform/seterror" },
    ],
    nextBridge: "Phase 20 is complete! Now let's enter Phase 21: Complete CRUD Vertical Slice — assembling requirements, ERD, NestJS, Prisma, permissions, and typed UI into a production-grade Task module.",
  },
];

export const LESSON_CONTENT_P20B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P20B.map((l) => [l.id, l])
);
