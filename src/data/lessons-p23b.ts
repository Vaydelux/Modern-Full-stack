import type { LessonContent } from "./types";

/**
 * Phase 23 File Uploads & Supabase Storage (L4–L6).
 */
export const LESSONS_P23B: LessonContent[] = [
  {
    id: "p23-l4",
    phaseId: "p23",
    title: "Image Processing Pipeline: Sharp & Responsive Thumbnails",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Transform high-resolution image uploads into optimized responsive formats. Use `sharp` for high-speed C-based image resizing, convert bulky PNG/JPEGs into modern WebP/AVIF formats, extract width/height metadata, and generate instant low-byte blurhash placeholders.",
    prerequisites: [
      "p23-l3 — Secure File Validation: Magic Bytes & MIME Sniffing",
      "p09-l1 — Node.js Architecture: V8, Libuv & Event Loop",
    ],
    objectives: [
      "Process images at near C-speed using the `sharp` libvips image processing engine.",
      "Generate standard thumbnail variant sets (small 128px avatar, medium 640px preview, large 1200px full).",
      "Convert uploads to modern WebP format with 80% lossy compression for ~70% bandwidth reduction.",
      "Compute low-byte BlurHash / LQIP placeholder strings for zero-layout-shift UI image loading.",
    ],
    simple:
      "When a user uploads a 12-Megabyte camera photo (4000x3000px) as their avatar, serving that 12MB raw file in a 40px circle on mobile slows the entire page down and consumes mobile data plans. With an automated Sharp pipeline, the backend resizes the image to 128x128px, converts it to modern WebP format (shrinking it from 12MB to 18KB!), and extracts a blurhash placeholder that displays instantly while the photo loads.",
    why:
      "Unoptimized images account for >60% of all bytes transferred on the modern web. Automated thumbnail pipelines guarantee fast Core Web Vitals (LCP).",
    mentalModel: {
      title: "The Tailor's Cutting Board & The Color Sketch",
      body: "Delivering a raw 12MB photo is like wrapping someone in an uncut 50-meter roll of raw silk fabric. Sharp is the master tailor: it cuts the fabric to the exact measurements needed for the wearer (128px avatar), stitches it cleanly (WebP compression), and sends a tiny 20-byte color sketch (blurhash) ahead of time so the wearer knows what dress to expect.",
    },
    sections: [
      {
        heading: "1. The Sharp Thumbnail & Variant Pipeline",
        body: [
          "Processing raw image buffers into optimized WebP variants and extracting image dimensions.",
        ],
        code: [
          {
            file: "src/storage/processors/image-processor.ts",
            lang: "ts",
            code: [
              "import sharp from 'sharp';",
              "",
              "export interface ProcessedImageVariant {",
              "  buffer: Buffer;",
              "  width: number;",
              "  height: number;",
              "  format: 'webp';",
              "  size: number;",
              "}",
              "",
              "export class ImageProcessor {",
              "  static async processAvatar(inputBuffer: Buffer): Promise<ProcessedImageVariant> {",
              "    const image = sharp(inputBuffer);",
              "    const metadata = await image.metadata();",
              "",
              "    // Resize to 256x256 square with smart face/center crop and WebP compression",
              "    const buffer = await image",
              "      .rotate() // Auto-orient according to EXIF data",
              "      .resize(256, 256, { fit: 'cover', position: 'center' })",
              "      .webp({ quality: 85, effort: 4 })",
              "      .toBuffer();",
              "",
              "    return {",
              "      buffer,",
              "      width: 256,",
              "      height: 256,",
              "      format: 'webp',",
              "      size: buffer.length,",
              "    };",
              "  }",
              "",
              "  static async generateThumbnail(inputBuffer: Buffer, maxWidth = 640): Promise<ProcessedImageVariant> {",
              "    const image = sharp(inputBuffer);",
              "    const buffer = await image",
              "      .rotate()",
              "      .resize(maxWidth, undefined, { withoutEnlargement: true })",
              "      .webp({ quality: 80 })",
              "      .toBuffer();",
              "",
              "    const meta = await sharp(buffer).metadata();",
              "    return {",
              "      buffer,",
              "      width: meta.width || maxWidth,",
              "      height: meta.height || 0,",
              "      format: 'webp',",
              "      size: buffer.length,",
              "    };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Processing image variants with Sharp auto-orientation, center cropping, and WebP encoding.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Forgetting `.rotate()` before resizing, causing photos taken on iPhones in portrait orientation to be rendered upside-down or sideways.",
      right: "Always including `.rotate()` so Sharp automatically inspects EXIF orientation tags and corrects rotation.",
      explanation:
        "Smartphones store orientation in EXIF metadata; without `.rotate()`, the image will appear rotated sideways on non-Apple devices.",
    },
    tryItYourself: {
      title: "Inspect Compressed Image File Size",
      instructions: [
        "1. Take a 5MB camera JPEG photo.",
        "2. Run it through `ImageProcessor.processAvatar()`.",
        "3. Compare the original byte size (5,000,000 bytes) with the resulting WebP buffer (~22,000 bytes).",
      ],
      expected: "The file size decreases by over 99% with no visible quality loss on screen.",
    },
    challenge: {
      title: "Generate BlurHash Strings for Instant Placeholders",
      description:
        "Use the `blurhash` library to encode a tiny 4x3 component blurhash string from the resized Sharp raw pixel buffer and store it in PostgreSQL.",
      hints: [
        "Extract raw pixels using `sharp(buffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true })`.",
      ],
      solution: `const { data, info } = await sharp(buffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });\nconst blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);`,
    },
    quiz: [
      {
        question: "Why is WebP preferred over JPEG and PNG for web delivery?",
        options: [
          "It delivers superior lossy and lossless compression with smaller byte payloads and supports transparency",
          "It only works on Chrome",
          "It increases image resolution by 4x",
          "It does not require HTTP",
        ],
        answer: 0,
        explanation: "WebP provides ~30% smaller files than JPEG at equivalent visual quality and supports alpha transparency.",
      },
      {
        question: "Why is `sharp` dramatically faster than pure JavaScript image libraries (like Jimp)?",
        options: [
          "sharp is backed by the high-performance C-based libvips image processing library",
          "sharp runs on quantum computers",
          "sharp disables image compression",
          "sharp only processes black and white images",
        ],
        answer: 0,
        explanation: "sharp utilizes native C/libvips bindings, utilizing multi-threading and SIMD vector instructions.",
      },
    ],
    flashcards: [
      {
        front: "What does `withoutEnlargement: true` do in Sharp resize?",
        back: "Prevents smaller images from being upscaled and pixelated if their original width is less than the requested target width.",
      },
      {
        front: "What is a BlurHash?",
        back: "A compact representation (20-30 characters) of an image placeholder that decodes into a smooth blurred gradient canvas.",
      },
    ],
    recap: [
      "Use `sharp` for fast, memory-safe image resizing and compression.",
      "Convert uploaded images to WebP format.",
      "Always call `.rotate()` to respect EXIF camera orientation.",
    ],
    references: [
      { label: "Sharp Image Processing Library", url: "https://sharp.pixelplumbing.com" },
    ],
    nextBridge: "Now let's examine access control for private storage buckets and generating time-limited signed read URLs.",
  },

  {
    id: "p23-l5",
    phaseId: "p23",
    title: "Access Control, Private Buckets & Signed Read URLs",
    level: "Full-Stack Developer",
    minutes: 40,
    summary:
      "Protect sensitive files from unauthorized access. Implement private Supabase Storage buckets, enforce Row-Level Security (RLS) storage policies, and generate time-limited signed download URLs with custom Content-Disposition headers.",
    prerequisites: [
      "p23-l1 — Upload Topologies: Presigned vs Server Proxy",
      "p18-l1 — Supabase Auth Foundations: GoTrue & RLS",
    ],
    objectives: [
      "Distinguish when to use Public Buckets (static CDN) vs Private Buckets (authenticated signed URLs).",
      "Author PostgreSQL RLS policies on the `storage.objects` table for workspace-scoped authorization.",
      "Generate time-limited signed read URLs (e.g. valid for 15 minutes) in NestJS services.",
      "Deliver inline previews for images and forced attachment downloads for sensitive spreadsheets/PDFs.",
    ],
    simple:
      "If you put patient medical records, legal contracts, or internal invoices into a public storage bucket, anyone who guesses or shares the URL can view those files without logging in. With private buckets, files are completely hidden from the public internet. When an authorized user wants to view a document, your backend verifies their workspace membership and generates a signed URL that automatically expires in 15 minutes.",
    why:
      "Public storage buckets containing sensitive user attachments lead to major data exposure incidents. Private buckets guarantee strict authorization checks.",
    mentalModel: {
      title: "The Secret Documents Vault & The 15-Minute Visitor Badge",
      body: "A public bucket is a billboard on the side of the highway. A private bucket is a bank vault with an armed guard (`RLS`). When an authorized employee needs to inspect a contract, the guard issues a temporary 15-minute visitor badge (`Signed Read URL`). Once 15 minutes pass, the badge deactivates and the link becomes completely useless.",
    },
    sections: [
      {
        heading: "1. Supabase Storage RLS Policies for Multi-Tenant Workspaces",
        body: [
          "Authoring PostgreSQL Row-Level Security policies on `storage.objects` to restrict file access to workspace members.",
        ],
        code: [
          {
            file: "supabase/storage-policies.sql",
            lang: "sql",
            code: [
              "-- 1. Enable RLS on storage.objects table",
              "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;",
              "",
              "-- 2. Allow users to READ files if they belong to the workspace in the file path",
              "-- Path convention: workspaceId/year/uuid.ext",
              "CREATE POLICY \"Workspace members can read attachments\"",
              "ON storage.objects FOR SELECT",
              "TO authenticated",
              "USING (",
              "  bucket_id = 'workspace-attachments'",
              "  AND EXISTS (",
              "    SELECT 1 FROM workspace_memberships wm",
              "    WHERE wm.user_id = auth.uid()",
              "      AND wm.workspace_id = (storage.foldername(name))[1]",
              "  )",
              ");",
            ].join("\n"),
            caption: "PostgreSQL RLS policy on storage.objects enforcing workspace membership validation.",
          },
        ],
      },
      {
        heading: "2. Generating Time-Limited Signed Read URLs in NestJS",
        body: [
          "Creating secure, time-limited download links for private attachments.",
        ],
        code: [
          {
            file: "src/storage/storage-access.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, NotFoundException } from '@nestjs/common';",
              "import { PrismaService } from '../prisma/prisma.service';",
              "import { createClient, SupabaseClient } from '@supabase/supabase-js';",
              "",
              "@Injectable()",
              "export class StorageAccessService {",
              "  private supabase: SupabaseClient;",
              "",
              "  constructor(private readonly prisma: PrismaService) {",
              "    this.supabase = createClient(",
              "      process.env.SUPABASE_URL!,",
              "      process.env.SUPABASE_SERVICE_ROLE_KEY!,",
              "    );",
              "  }",
              "",
              "  async getSignedDownloadUrl(workspaceId: string, attachmentId: string, download = false) {",
              "    // 1. Verify attachment exists in the authorized workspace",
              "    const attachment = await this.prisma.attachment.findFirst({",
              "      where: { id: attachmentId, workspaceId, deletedAt: null },",
              "    });",
              "",
              "    if (!attachment) throw new NotFoundException('Attachment not found');",
              "",
              "    // 2. Generate signed URL valid for 15 minutes (900 seconds)",
              "    const { data, error } = await this.supabase.storage",
              "      .from('workspace-attachments')",
              "      .createSignedUrl(attachment.storagePath, 900, {",
              "        download: download ? attachment.filename : false,",
              "      });",
              "",
              "    if (error || !data) throw new NotFoundException('Failed to generate secure download link');",
              "",
              "    return { url: data.signedUrl, filename: attachment.filename, expiresAt: new Date(Date.now() + 900000) };",
              "  }",
              "}",
            ].join("\n"),
            caption: "Generating 15-minute signed download URLs with download flag support.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Storing signed URLs in the PostgreSQL database permanently, which causes links to break after 15 minutes and fail on future page reloads.",
      right: "Storing only the permanent storage path (e.g. `ws_1/2026/file.pdf`) in the database, and generating signed URLs on demand when requested.",
      explanation:
        "Signed URLs contain expiration timestamps. Persisting them in the database guarantees broken links once the expiration time passes.",
    },
    tryItYourself: {
      title: "Test Expired Signed URL Behavior",
      instructions: [
        "1. Generate a signed URL with a 5-second expiration.",
        "2. Open the URL immediately in your browser (it loads successfully).",
        "3. Wait 10 seconds and refresh the browser tab.",
        "4. Verify that Supabase Storage returns HTTP 403 / Access Denied.",
      ],
      expected: "The signed link deactivates automatically after the expiration window.",
    },
    challenge: {
      title: "Implement Signed URL Batch Resolution Hook",
      description:
        "Write a React hook `useSignedAttachmentUrls(attachments)` that resolves fresh signed URLs in a single batch request and caches them for 10 minutes in TanStack Query.",
      hints: [
        "Set `staleTime: 10 * 60 * 1000` on the query hook to prevent unnecessary signed URL re-generation on every render.",
      ],
      solution: `export function useSignedUrls(workspaceId: string, ids: string[]) {\n  return useQuery({\n    queryKey: ['signedUrls', workspaceId, ids],\n    queryFn: () => apiClient('/storage/batch-signed-urls', { params: { ids } }),\n    staleTime: 10 * 60 * 1000,\n  });\n}`,
    },
    quiz: [
      {
        question: "Why should only the permanent storage path (not the signed URL) be saved in PostgreSQL?",
        options: [
          "Signed URLs expire after a short time; saving them would cause broken links on future visits",
          "PostgreSQL cannot store URLs",
          "Signed URLs are 50 megabytes long",
          "It violates CSS specifications",
        ],
        answer: 0,
        explanation: "Signed URLs are ephemeral; always persist the immutable storage path and generate signed tokens on demand.",
      },
      {
        question: "What does the `download` option do in Supabase `createSignedUrl()`?",
        options: [
          "It attaches `Content-Disposition: attachment; filename=...` headers to force a browser file save dialog instead of inline display",
          "It deletes the file from storage",
          "It compresses the file into a ZIP",
          "It runs an antivirus scan",
        ],
        answer: 0,
        explanation: "The download option sets Content-Disposition headers to trigger browser download behavior.",
      },
    ],
    flashcards: [
      {
        front: "What is an RLS Storage Policy?",
        back: "A PostgreSQL row-level security rule applied to `storage.objects` that decides if the active user token can read or write a specific file.",
      },
      {
        front: "What is the recommended TTL for private document signed URLs?",
        back: "Between 5 to 15 minutes (short enough to minimize leak windows, long enough to complete downloading).",
      },
    ],
    recap: [
      "Keep sensitive user files in private storage buckets.",
      "Store immutable storage paths in PostgreSQL; generate signed URLs dynamically.",
      "Apply RLS policies on `storage.objects` matching tenant paths.",
    ],
    references: [
      { label: "Supabase Storage Access Control", url: "https://supabase.com/docs/guides/storage/security/access-control" },
    ],
    nextBridge: "Now let's complete Phase 23 with Storage Garbage Collection & Orphaned File Cleanup.",
  },

  {
    id: "p23-l6",
    phaseId: "p23",
    title: "Storage Garbage Collection & Orphaned File Cleanup",
    level: "Full-Stack Developer",
    minutes: 35,
    summary:
      "Prevent costly cloud storage bloat. Design automated garbage collection pipelines for orphaned storage blobs (files uploaded to storage where the user abandoned the form before saving), and schedule background cleanup cron jobs in NestJS.",
    prerequisites: [
      "p23-l2 — Client Direct-to-Storage with Presigned URLs",
      "p22-l5 — Bulk Operations & Soft-Delete Cascades",
    ],
    objectives: [
      "Identify the 'Orphaned Blob' problem caused by abandoned presigned uploads.",
      "Implement reconciliation queries that find storage objects without corresponding PostgreSQL database records.",
      "Build a scheduled NestJS cleanup cron job using `@nestjs/schedule`.",
      "Safely purge hard-deleted files from Supabase Storage buckets without deleting active files.",
    ],
    simple:
      "When a user drops an image into a task form, the image is uploaded directly to Supabase Storage immediately. But what if the user changes their mind, closes the browser tab, and never clicks 'Save Task'? The image sits in your storage bucket forever, costing you money every month. In this lesson, we build a scheduled cleanup job that finds any storage files older than 24 hours that are not linked to a real task in the database and purges them safely.",
    why:
      "Abandoned file uploads accumulate over time, wasting gigabytes of cloud storage and increasing monthly cloud hosting bills.",
    mentalModel: {
      title: "The Unclaimed Baggage Carousel & The Lost-and-Found Sweep",
      body: "When luggage arrives at the airport carousel (uploaded to storage), passengers are supposed to claim it with their ticket (save task record). If a bag sits unclaimed on the carousel for more than 24 hours with no owner ticket registered in the airline system, the airport sweep team moves it out of the terminal to keep the carousel clear.",
    },
    sections: [
      {
        heading: "1. The Scheduled Storage Garbage Collection Service",
        body: [
          "Finding and purging unreferenced storage files using NestJS cron schedules.",
        ],
        code: [
          {
            file: "src/storage/jobs/storage-gc.service.ts",
            lang: "ts",
            code: [
              "import { Injectable, Logger } from '@nestjs/common';",
              "import { Cron, CronExpression } from '@nestjs/schedule';",
              "import { PrismaService } from '../../prisma/prisma.service';",
              "import { createClient, SupabaseClient } from '@supabase/supabase-js';",
              "",
              "@Injectable()",
              "export class StorageGcService {",
              "  private readonly logger = new Logger(StorageGcService.name);",
              "  private supabase: SupabaseClient;",
              "",
              "  constructor(private readonly prisma: PrismaService) {",
              "    this.supabase = createClient(",
              "      process.env.SUPABASE_URL!,",
              "      process.env.SUPABASE_SERVICE_ROLE_KEY!,",
              "    );",
              "  }",
              "",
              "  // Run every night at 3:00 AM",
              "  @Cron(CronExpression.EVERY_DAY_AT_3AM)",
              "  async cleanupOrphanedBlobs() {",
              "    this.logger.log('Starting Storage Garbage Collection job...');",
              "    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);",
              "",
              "    // 1. List objects in the storage bucket",
              "    const { data: storageFiles, error } = await this.supabase.storage",
              "      .from('workspace-attachments')",
              "      .list('', { limit: 1000 });",
              "",
              "    if (error || !storageFiles) return;",
              "",
              "    // 2. Identify candidates older than 24h",
              "    const candidatePaths = storageFiles",
              "      .filter((f) => new Date(f.created_at) < oneDayAgo)",
              "      .map((f) => f.name);",
              "",
              "    if (candidatePaths.length === 0) return;",
              "",
              "    // 3. Query PostgreSQL for valid attachments matching candidate paths",
              "    const existingAttachments = await this.prisma.attachment.findMany({",
              "      where: { storagePath: { in: candidatePaths } },",
              "      select: { storagePath: true },",
              "    });",
              "",
              "    const activePathsSet = new Set(existingAttachments.map((a) => a.storagePath));",
              "    const orphanedPaths = candidatePaths.filter((path) => !activePathsSet.has(path));",
              "",
              "    if (orphanedPaths.length > 0) {",
              "      this.logger.warn(`Purging ${orphanedPaths.length} orphaned storage blobs.`);",
              "      await this.supabase.storage.from('workspace-attachments').remove(orphanedPaths);",
              "    }",
              "",
              "    this.logger.log('Storage Garbage Collection completed successfully.');",
              "  }",
              "}",
            ].join("\n"),
            caption: "Daily background cron job finding and purging orphaned storage blobs.",
          },
        ],
      },
    ],
    commonMistake: {
      wrong: "Deleting storage objects immediately without a grace period (e.g. 24 hours), causing active in-progress uploads by slow users to be deleted while they are still filling out the form.",
      right: "Enforcing a minimum age buffer (e.g. 24 hours old) before marking an unreferenced storage object as orphaned.",
      explanation:
        "A grace period ensures that users taking a few minutes to write long descriptions do not have their uploaded images deleted prematurely.",
    },
    tryItYourself: {
      title: "Simulate an Abandoned Upload and Trigger GC",
      instructions: [
        "1. Upload a test image to the storage bucket without saving a corresponding Task in PostgreSQL.",
        "2. Manually invoke the `cleanupOrphanedBlobs()` service method.",
        "3. Verify that the orphaned file is identified and removed from Supabase Storage.",
      ],
      expected: "The orphaned file is purged without affecting active referenced attachments.",
    },
    challenge: {
      title: "Add Soft-Delete Permanent Storage Purge",
      description:
        "Extend the GC job to find attachments that were soft-deleted (`deletedAt < 30 days ago`) and permanently purge both the database record and the storage file.",
      hints: [
        "Find attachments where `deletedAt < thirtyDaysAgo`, delete from Supabase Storage with `.remove()`, then call `prisma.attachment.deleteMany()`.",
      ],
      solution: `const expired = await this.prisma.attachment.findMany({ where: { deletedAt: { lte: thirtyDaysAgo } } });\nawait this.supabase.storage.from('attachments').remove(expired.map(e => e.storagePath));\nawait this.prisma.attachment.deleteMany({ where: { id: { in: expired.map(e => e.id) } } });`,
    },
    quiz: [
      {
        question: "What is an 'Orphaned Blob' in cloud storage architectures?",
        options: [
          "A file that exists in the storage bucket but has no corresponding reference record in the application database",
          "A corrupted hard drive sector",
          "A file without a file extension",
          "A CSS stylesheet with syntax errors",
        ],
        answer: 0,
        explanation: "Orphaned blobs occur when uploads succeed to storage but the user abandons form submission before saving.",
      },
      {
        question: "Why should garbage collection jobs enforce a 24-hour age buffer before deleting unlinked files?",
        options: [
          "To avoid deleting files that were just uploaded by a user who is currently in the middle of typing their form",
          "PostgreSQL requires 24 hours to create an index",
          "Storage buckets cannot delete files on the same day",
          "Cron jobs cannot run during daylight hours",
        ],
        answer: 0,
        explanation: "An age buffer prevents race conditions between upload completion and final form submission.",
      },
    ],
    flashcards: [
      {
        front: "What is the `@nestjs/schedule` module used for?",
        back: "Executing automated recurring cron jobs, intervals, and timeouts in NestJS applications.",
      },
      {
        front: "What method removes files in bulk from Supabase Storage?",
        back: "`supabase.storage.from(bucket).remove(['path/file1.png', 'path/file2.png'])`.",
      },
    ],
    recap: [
      "Orphaned storage files occur on abandoned form submissions.",
      "Implement reconciliation cron jobs to cross-reference storage files against database records.",
      "Enforce a 24-hour grace window to protect in-flight user sessions.",
    ],
    references: [
      { label: "NestJS Task Scheduling", url: "https://docs.nestjs.com/techniques/task-scheduling" },
    ],
    nextBridge: "Phase 23 is complete! Now let's enter Phase 24: Realtime — Where It Earns Its Place — covering SSE, WebSockets, Supabase Realtime, and presence.",
  },
];

export const LESSON_CONTENT_P23B: Record<string, LessonContent> = Object.fromEntries(
  LESSONS_P23B.map((l) => [l.id, l])
);
