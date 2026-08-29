import type { LessonContent } from "./types";

/**
 * Phase 23 File Uploads & Supabase Storage (L1–L3).
 */
export const LESSONS_P23: LessonContent[] = [
  {
    id: "p23-l1",
    phaseId: "p23",
    title: "Upload Topologies: Presigned vs Server Proxy",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Compare modern file upload architectures. Analyze the network and CPU tradeoffs between direct-to-storage presigned uploads versus traditional backend multipart proxy servers, and design secure Supabase Storage bucket topologies.",
    prerequisites: [
      "p07-l1 — HTTP Foundations: Request/Response Lifecycle",
      "p17-l3 — Supabase Local Dev & Cloud Parity",
    ],
    objectives: [
      "Compare the resource consumption of Multipart Server Proxies vs Direct Presigned Client Uploads.",
      "Understand why routing large multi-gigabyte video/file uploads through Node.js chokes event loop bandwidth.",
      "Design Supabase Storage bucket topologies (Public vs Private, avatars vs workspace assets).",
      "Establish the 3-step presigned upload lifecycle: Request Ticket → Direct Upload → Confirm Metadata.",
    ],
    simple:
      "In traditional web apps, when a user uploads a 500MB file, the file is sent to the Node.js backend server, which buffers the file in memory and re-transmits it to S3/Supabase. This wastes double bandwidth and freezes the Node.js server. With presigned direct uploads, the browser asks the backend for a 60-second signed permission ticket, and then uploads the 500MB file directly to Supabase Storage. Your backend server does zero heavy lifting.",
    why:
      "Routing multi-megabyte binary uploads through API servers causes CPU spikes, memory exhaustion, and slow API response times for all other users.",
    mentalModel: {
      title: "The VIP Warehouse Loading Dock Pass",
      body: "A server proxy is like bringing a 10-ton shipping container into the corporate office lobby, unpacking it on the CEO's desk, and having the CEO drive it to the warehouse. A presigned upload is having the office manager hand the truck driver a 15-minute VIP access pass directly to the shipping warehouse dock.",
    },
    sections: [
      {
        heading: "1. The Two Upload Topologies Compared",
        body: [
          "Understanding why direct presigned uploads are the gold standard for full-stack web applications.",
        ],
        code: [
          {
            file: "UPLOAD_TOPOLOGIES.md",
            lang: "text",
            code: [
              "TOPOLOGY A: SERVER PROXY (Legacy/High-Load Smell)",
              "  Browser ──(500MB HTTP Multipart)──> [NestJS Node Server] ──(500MB S3 API)──> [Storage Bucket]",
              "  • Double bandwidth consumption",
              "  • High Node.js memory pressure and stream buffering",
              "  • Server timeout risks on slow mobile uploads",
              "",
              "TOPOLOGY B: PRESIGNED DIRECT-TO-STORAGE (Modern Gold Standard)",
              "  1. Browser ──(Small JSON Ticket Request)──> [NestJS API] (Generates signed token in 2ms)",
              "  2. Browser ──(500MB Direct Binary Stream)──> [Supabase Storage / S3]",
              "  3. Browser ──(Confirm Metadata JSON)───────> [NestJS API] (Persists File record in Postgres)",
            ].join("\n"),
            caption: "Architectural comparison between proxy and direct presigned uploads.",
          },
        ],
      },
      {
        heading: "2. Supabase Storage Bucket Configuration",
        body: [
          "Defining public vs private storage buckets for distinct asset types.",
        ],
        code: [
          {
            file: "supabase/storage-buckets.sql",
            lang: "sql",
            code: [
              "-- 1. Public Bucket: Avatars and public logos (Publicly readable, authenticated write)",
              "INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)",
              "VALUES (",
              "  'avatars',",
              "  'avatars',",
              "  true,",
              "  2097152, -- 2 MB limit",
              "  ARRAY['image/png', 'image/jpeg', 'image/webp']",
              ") ON CONFLICT (id) DO NOTHING;",
              "",
              "-- 2. Private Bucket: Task attachments and sensitive documents (RLS protected)",
              "INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)",
              "VALUES (",
              "  'workspace-attachments',",
              "  'workspace-attachments',",
              "  false,",
              "  26214400, -- 25 MB limit",
              "  ARRAY['image/*', 'application/pdf', 'text/plain', 'application/zip']",
              ") ON CONFLICT (id) DO NOTHING;",
            ].join("\n"),
            caption: "Storage bucket configuration enforcing byte limits and allowed MIME types.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Buffering entire file uploads in Node.js RAM using Multer memoryStorage before uploading to S3, crashing the server when multiple users upload simultaneously.",
      right: "Using direct-to-storage presigned uploads so binary streams never touch backend RAM.",
      explanation:
        "Node.js memory buffers do not scale. Direct presigned uploads eliminate server memory bottlenecks.",
    },
    tryItYourself: {
      title: "Inspect Storage Buckets in Supabase Dashboard",
      instructions: [
        "1. Open your Supabase Dashboard and click on 'Storage'.",
        "2. Inspect the configured buckets and verify that `workspace-attachments` is set to Private.",
        "3. Check the file size limit and MIME restrictions.",
      ],
      expected: "Buckets are configured with strict size and type constraints.",
    },
    challenge: {
      title: "Design a Resumable Chunked Upload Flow",
      description:
        "Explain how the TUS protocol enables resumable uploads for multi-gigabyte files so network interruptions do not require restarting from 0%.",
      hints: [
        "Supabase Storage natively supports TUS via the `/storage/v1/upload/resumable` endpoint.",
      ],
      solution: `The TUS protocol uploads files in distinct offset byte chunks (e.g. 5MB chunks). If the connection drops at 45MB, the client queries the current server offset (45MB) and resumes uploading from chunk #10.`,
    },
    quiz: [
      {
        question: "Why are direct presigned client uploads superior to server proxy uploads?",
        options: [
          "They bypass the backend server entirely during large binary transfers, eliminating memory and CPU bottlenecks",
          "They are only compatible with Windows",
          "They encrypt data using RSA 4096",
          "They disable CORS headers",
        ],
        answer: 0,
        explanation: "Presigned direct uploads send binary data directly from browser to storage, saving backend resources.",
      },
      {
        question: "What is the primary difference between a public and private storage bucket in Supabase?",
        options: [
          "Public buckets allow anyone with the URL to download files; private buckets require authenticated signed tokens or RLS policies",
          "Public buckets only store text files",
          "Private buckets do not support HTTPS",
          "Public buckets cannot store images",
        ],
        answer: 0,
        explanation: "Public buckets generate static CDN URLs; private buckets require signed time-limited tokens to view.",
      },
    ],
    flashcards: [
      {
        front: "What is a Presigned Upload URL?",
        back: "A cryptographically signed URL allowing a client to PUT/POST an object directly to a storage bucket with a temporary expiration time.",
      },
      {
        front: "What is the 3-step presigned upload lifecycle?",
        back: "1. Request upload signature -> 2. Upload file directly to storage -> 3. Confirm file record in database.",
      },
    ],
    recap: [
      "Avoid routing large file uploads through backend Node.js proxies.",
      "Use presigned direct uploads to Supabase Storage.",
      "Configure bucket size limits and MIME restrictions at the storage layer.",
    ],
    references: [
      { label: "Supabase Storage Architecture", url: "https://supabase.com/docs/guides/storage" },
    ],
    nextBridge: "Now let's implement the complete direct-to-storage presigned upload flow with upload progress tracking in React.",
  },

  {
    id: "p23-l2",
    phaseId: "p23",
    title: "Client Direct-to-Storage with Presigned URLs",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Construct the end-to-end direct presigned upload pipeline. Generate signed upload URLs in NestJS, upload raw binary payloads directly via browser `XMLHttpRequest` or `fetch` with granular progress tracking, and persist metadata in Prisma.",
    prerequisites: [
      "p23-l1 — Upload Topologies: Presigned vs Server Proxy",
      "p20-l2 — React Hook Form + Zod: Accessible by Default",
    ],
    objectives: [
      "Implement a NestJS endpoint generating signed upload URLs using `@supabase/supabase-js`.",
      "Build a React `useFileUpload` hook with smooth 0–100% progress tracking.",
      "Support drag-and-drop file selection with accessible dropzone states.",
      "Persist file metadata (storage path, size, MIME type, owner) atomically in PostgreSQL.",
    ],
    simple:
      "When a user drops an image into our task attachment zone, three fast actions happen: 1. React asks NestJS for an upload ticket, 2. The browser uploads the raw bytes directly to Supabase with a live progress bar (20%... 60%... 100%), and 3. Once complete, React tells NestJS: 'The file is in bucket X at path Y—link it to Task #4'.",
    why:
      "Direct uploads with live progress bars give users instant visual confirmation and prevent upload abandonment on slow connections.",
    mentalModel: {
      title: "The Secure Valet Ticket & The Assigned Parking Space",
      body: "You pull up to the garage (upload intent). The attendant gives you a valet ticket with a designated space number (`path: 'workspace_1/task_4/photo.png'`) and a signed barcode valid for 5 minutes. You drive directly to space #42 and park your car (direct upload). Then you hand the stamped ticket to the building reception to log the car in the building register (Prisma metadata record).",
    },
    sections: [
      {
        heading: "1. NestJS Presigned URL Generation Service",
        body: [
          "Generating secure signed upload URLs with isolated tenant paths.",
        ],
        code: [
          {
            file: "src/storage/storage.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, ForbiddenException } from '@nestjs/common';",
              "import { createClient, SupabaseClient } from '@supabase/supabase-js';",
              "import { v4 as uuidv4 } from 'uuid';",
              "",
              "@Injectable()",
              "export class StorageService {",
              "  private supabase: SupabaseClient;",
              "",
              "  constructor() {",
              "    this.supabase = createClient(",
              "      process.env.SUPABASE_URL!,",
              "      process.env.SUPABASE_SERVICE_ROLE_KEY!,",
              "    );",
              "  }",
              "",
              "  async createSignedUploadUrl(workspaceId: string, filename: string) {",
              "    // Enforce isolated tenant directory path: workspaceId/year/month/uuid-filename",
              "    const ext = filename.split('.').pop();",
              "    const storagePath = `${workspaceId}/${new Date().getFullYear()}/${uuidv4()}.${ext}`;",
              "",
              "    const { data, error } = await this.supabase.storage",
              "      .from('workspace-attachments')",
              "      .createSignedUploadUrl(storagePath);",
              "",
              "    if (error || !data) throw new ForbiddenException('Failed to create signed upload ticket');",
              "",
              "    return {",
              "      signedUrl: data.signedUrl,",
              "      token: data.token,",
              "      path: data.path,",
              "    };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Generating time-limited signed upload tickets with tenant-isolated paths.",
          },
        ],
      },
      {
        heading: "2. React Direct Upload Hook with XMLHttpRequest Progress",
        body: [
          "Using `XMLHttpRequest` to capture real-time upload progress events (which `fetch` does not support for uploads).",
        ],
        code: [
          {
            file: "src/features/storage/hooks/useFileUpload.ts",
            lang: "ts",
            code: [
              "import { useState } from 'react';",
              "import { apiClient } from '@/lib/api/client';",
              "",
              "export function useFileUpload() {",
              "  const [progress, setProgress] = useState<number>(0);",
              "  const [isUploading, setIsUploading] = useState(false);",
              "",
              "  const uploadFile = async (workspaceId: string, file: File) => {",
              "    setIsUploading(true);",
              "    setProgress(0);",
              "",
              "    try {",
              "      // 1. Get signed ticket from NestJS API",
              "      const ticket = await apiClient<{ signedUrl: string; token: string; path: string }>(",
              "        `/workspaces/${workspaceId}/storage/upload-ticket`,",
              "        { method: 'POST', body: { filename: file.name, contentType: file.type } },",
              "      );",
              "",
              "      // 2. Direct upload to Supabase Storage with XMLHttpRequest for progress events",
              "      await new Promise<void>((resolve, reject) => {",
              "        const xhr = new XMLHttpRequest();",
              "        xhr.open('PUT', ticket.signedUrl);",
              "        xhr.setRequestHeader('Content-Type', file.type);",
              "",
              "        xhr.upload.onprogress = (e) => {",
              "          if (e.lengthComputable) {",
              "            setProgress(Math.round((e.loaded / e.total) * 100));",
              "          }",
              "        };",
              "",
              "        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));",
              "        xhr.onerror = () => reject(new Error('Network error during upload'));",
              "        xhr.send(file);",
              "      });",
              "",
              "      // 3. Confirm metadata in database",
              "      const savedAttachment = await apiClient(`/workspaces/${workspaceId}/attachments`, {",
              "        method: 'POST',",
              "        body: { path: ticket.path, filename: file.name, size: file.size, mimeType: file.type },",
              "      });",
              "",
              "      return savedAttachment;",
              "    } finally {",
              "      setIsUploading(false);",
              "    }",
              "  };",
              "",
              "  return { uploadFile, progress, isUploading };",
              "}",
            ].join("\n"),
            caption: "Custom upload hook bridging signed ticket, direct XHR upload, and database confirmation.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Using `fetch()` and wondering why you cannot track upload progress percentages.",
      right: "Using `XMLHttpRequest.upload.onprogress` to capture real byte stream upload progress.",
      explanation:
        "The standard browser `fetch()` API does not support upload progress streams; `XMLHttpRequest` remains the standard for upload progress tracking.",
    },
    tryItYourself: {
      title: "Upload a File and Watch the Progress Bar",
      instructions: [
        "1. Select a 10MB test file in the Task Attachment dropzone.",
        "2. Watch the progress bar increment from 0% to 100%.",
        "3. Verify that the file appears in the task attachment list and is stored in Supabase Storage.",
      ],
      expected: "The file uploads with real-time percentage feedback and persists metadata in PostgreSQL.",
    },
    challenge: {
      title: "Implement Drag-and-Drop Dropzone Component",
      description:
        "Build an accessible `<Dropzone />` component supporting `onDragOver`, `onDragLeave`, and `onDrop` with visual hover highlights and keyboard Enter file picker support.",
      hints: [
        "Prevent default on `e.preventDefault()` during `onDragOver`.",
      ],
      solution: `<div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} ...>`,
    },
    quiz: [
      {
        question: "Why is XMLHttpRequest preferred over fetch for file uploads with progress bars?",
        options: [
          "XMLHttpRequest exposes the `xhr.upload.onprogress` event containing `loaded` and `total` byte counts",
          "fetch is deprecated in Chrome",
          "XMLHttpRequest encrypts uploads with AES-256",
          "fetch does not support PUT requests",
        ],
        answer: 0,
        explanation: "fetch lacks an upload progress callback, making XHR the universal choice for upload progress tracking.",
      },
      {
        question: "Why should filenames be prefixed with a UUID in storage paths?",
        options: [
          "To prevent duplicate filename collisions and avoid overwriting existing files when two users upload 'screenshot.png'",
          "Because S3 forbids vowels in filenames",
          "To format the file as PDF",
          "To compress the file size",
        ],
        answer: 0,
        explanation: "UUID prefixes guarantee unique storage paths and prevent accidental file overwrites.",
      },
    ],
    flashcards: [
      {
        front: "Why should storage paths include the tenant `workspaceId` prefix?",
        back: "To enforce tenant data isolation and make bulk workspace storage cleanup simple.",
      },
      {
        front: "What is the role of the database confirmation step after upload?",
        back: "To record the permanent PostgreSQL metadata record (file size, path, MIME type, uploader ID) linked to the parent entity.",
      },
    ],
    recap: [
      "Generate time-limited signed upload tickets in NestJS.",
      "Upload raw bytes directly from browser to storage using `XMLHttpRequest` for progress tracking.",
      "Persist file metadata in PostgreSQL upon upload completion.",
    ],
    references: [
      { label: "Supabase Storage JavaScript SDK", url: "https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl" },
    ],
    nextBridge: "Now let's examine secure file validation: detecting true magic bytes and preventing malicious file uploads.",
  },

  {
    id: "p23-l3",
    phaseId: "p23",
    title: "Secure File Validation: Magic Bytes & MIME Sniffing",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Harden file upload security. Understand why file extensions and client MIME headers are untrusted user input, inspect binary magic bytes using `file-type`, sanitize dangerous SVGs against Cross-Site Scripting (XSS), and enforce strict size boundaries.",
    prerequisites: [
      "p23-l2 — Client Direct-to-Storage with Presigned URLs",
      "p20-l5 — Two Trust Boundaries: Zod Does Not Replace DTOs",
    ],
    objectives: [
      "Demonstrate how an attacker renames a malicious executable (`malware.exe` -> `avatar.png`) to bypass extension checks.",
      "Inspect binary Magic Bytes (the leading header bytes of a file) to verify true file format.",
      "Sanitize SVG uploads using `DOMPurify` / `svg-sanitizer` to eliminate embedded `<script>` XSS vectors.",
      "Enforce maximum byte size limits at the network edge, backend API, and storage bucket levels.",
    ],
    simple:
      "Anyone can take a virus file, rename it from `virus.exe` to `family_photo.jpg`, and upload it to a server. If your app only checks the `.jpg` extension or trusts the client's `Content-Type: image/jpeg` header, you are vulnerable to severe attacks. Real file validation reads the first few bytes inside the file (the Magic Bytes: PNGs always start with `89 50 4E 47`, JPEGs start with `FF D8 FF`). If the magic bytes don't match, the file is rejected.",
    why:
      "Trusting client-reported file extensions is a critical security flaw that enables Remote Code Execution (RCE) and Stored XSS attacks.",
    mentalModel: {
      title: "The Counterfeit Passport & The Chemical DNA Test",
      body: "The file extension is a hand-drawn paper sticker on the outside of a box that says 'Apples'. A hacker can write 'Apples' on a box full of explosives. Magic Byte inspection is the chemical scanner: it cuts open the corner of the box and tests the molecular structure of the contents before allowing it through customs.",
    },
    sections: [
      {
        heading: "1. Magic Byte Binary Signatures",
        body: [
          "Every genuine file format begins with a unique hexadecimal signature in its first 4-12 bytes.",
        ],
        code: [
          {
            file: "MAGIC_BYTES_TABLE.md",
            lang: "text",
            code: [
              "┌────────────┬─────────────────────────────┬────────────────────────────────────────────┐",
              "│ Format     │ Hex Magic Byte Signature    │ ASCII / Meaning                            │",
              "├────────────┼─────────────────────────────┼────────────────────────────────────────────┤",
              "│ PNG        │ 89 50 4E 47 0D 0A 1A 0A     │ .PNG....                                   │",
              "│ JPEG / JPG │ FF D8 FF                    │ Standard JPEG Header                       │",
              "│ GIF        │ 47 49 46 38 37 61 / 39 61   │ GIF87a or GIF89a                           │",
              "│ PDF        │ 25 50 44 46                 │ %PDF                                       │",
              "│ ZIP / DOCX │ 50 4B 03 04                 │ PK.. (PKZip archive)                       │",
              "│ EXE / DLL  │ 4D 5A                       │ MZ (DOS / Windows Executable)              │",
              "└────────────┴─────────────────────────────┴────────────────────────────────────────────┘",
            ].join("\n"),
            caption: "Universal hexadecimal magic byte signatures for common file formats.",
          },
        ],
      },
      {
        heading: "2. Backend Magic Byte Validation with `file-type`",
        body: [
          "Inspecting buffer headers to verify true MIME types before saving metadata.",
        ],
        code: [
          {
            file: "src/storage/validators/file-validator.ts",
            lang: "ts",
            code: [
              "import { fromBuffer } from 'file-type';",
              "import { BadRequestException } from '@nestjs/common';",
              "",
              "const ALLOWED_MIME_TYPES = new Set([",
              "  'image/jpeg',",
              "  'image/png',",
              "  'image/webp',",
              "  'application/pdf',",
              "]);",
              "",
              "export async function validateFileMagicBytes(buffer: Buffer) {",
              "  // Read the true binary signature from the first 4100 bytes",
              "  const detected = await fromBuffer(buffer);",
              "",
              "  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {",
              "    throw new BadRequestException(",
              "      `Invalid or disguised file type detected (${detected?.mime || 'unknown'}). Allowed: JPEG, PNG, WEBP, PDF`,",
              "    );",
              "  }",
              "",
              "  return detected;",
              "}",
            ].join("\n"),
            caption: "Inspecting binary buffer signatures using file-type to prevent disguised malware uploads.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Accepting `.svg` vector files without sanitization, allowing attackers to upload SVGs containing `<script>alert(document.cookie)</script>` and stealing user sessions via Stored XSS.",
      right: "Sanitizing SVGs with a strict XML parser (e.g. DOMPurify or svg-purify) or converting SVGs to raster PNGs on upload.",
      explanation:
        "SVGs are executable XML documents capable of running inline JavaScript when opened directly in a browser tab.",
    },
    tryItYourself: {
      title: "Test Disguised File Rejection",
      instructions: [
        "1. Create a text file containing `Hello World` and rename it to `fake_photo.jpg`.",
        "2. Attempt to upload it through your file validation pipeline.",
        "3. Verify that the magic byte scanner rejects the file because its binary signature is plain text rather than `FF D8 FF`.",
      ],
      expected: "The upload is rejected with HTTP 400 Bad Request.",
    },
    challenge: {
      title: "Write an SVG XSS Stripper",
      description:
        "Build a sanitizer function that parses incoming SVG text and strips all `<script>`, `onload=`, `onerror=`, and `<foreignObject>` tags before saving.",
      hints: [
        "Use `isomorphic-dompurify` with `USE_PROFILES: { svg: true, svgFilters: true }`.",
      ],
      solution: `import DOMPurify from 'isomorphic-dompurify';\nexport function sanitizeSvg(rawSvg: string): string {\n  return DOMPurify.sanitize(rawSvg, { USE_PROFILES: { svg: true } });\n}`,
    },
    quiz: [
      {
        question: "Why is checking the file extension (`.png`) insufficient for file security?",
        options: [
          "Anyone can rename any malicious executable or script to end with `.png`",
          "File extensions do not work in Linux",
          "TypeScript removes file extensions at compile time",
          "Browser cookies conflict with extensions",
        ],
        answer: 0,
        explanation: "File extensions are arbitrary string labels that can be altered by any user or attacker.",
      },
      {
        question: "Why are raw SVG uploads dangerous if served without sanitization?",
        options: [
          "SVGs are XML documents that can embed executable `<script>` tags, causing Stored Cross-Site Scripting (XSS)",
          "SVGs take up 100GB of disk space",
          "SVGs crash PostgreSQL",
          "SVGs are not supported in CSS",
        ],
        answer: 0,
        explanation: "Unsanitized SVGs can execute arbitrary JavaScript in the context of your domain.",
      },
    ],
    flashcards: [
      {
        front: "What are Magic Bytes?",
        back: "The unique binary signature embedded in the first few bytes of a file that identifies its true file format.",
      },
      {
        front: "What is Stored XSS via File Upload?",
        back: "An attack where a malicious script (e.g. inside an SVG or HTML file) is stored on the server and executed in victims' browsers when viewed.",
      },
    ],
    recap: [
      "Never trust client file extensions or `Content-Type` headers.",
      "Verify true MIME types using binary Magic Byte inspection.",
      "Strictly sanitize SVG uploads to eliminate embedded JavaScript.",
    ],
    references: [
      { label: "OWASP File Upload Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html" },
    ],
    nextBridge: "Now let's build an automated Image Processing Pipeline with Sharp for responsive WebP thumbnails and blurhashes.",
  },
];

export const LESSON_CONTENT_P23: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P23.map((l) => [l.id, l])
);
