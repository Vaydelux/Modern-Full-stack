import type { LessonContent } from "./types";
import { LESSON_CONTENT as P0 } from "./lessons-p0";
import { LESSON_CONTENT_P0B } from "./lessons-p0b";
import { LESSON_CONTENT_P1 } from "./lessons-p1";
import { LESSON_CONTENT_P2 } from "./lessons-p2";
import { LESSON_CONTENT_P2C } from "./lessons-p2c";
import { LESSON_CONTENT_P3 } from "./lessons-p3";
import { LESSON_CONTENT_P3B } from "./lessons-p3b";
import { LESSON_CONTENT_P3C } from "./lessons-p3c";
import { LESSON_CONTENT_P4 } from "./lessons-p4";
import { LESSON_CONTENT_P4B } from "./lessons-p4b";
import { LESSON_CONTENT_P4C } from "./lessons-p4c";
import { LESSON_CONTENT_P5 } from "./lessons-p5";
import { LESSON_CONTENT_P5B } from "./lessons-p5b";
import { LESSON_CONTENT_P5C } from "./lessons-p5c";
import { LESSON_CONTENT_P6 } from "./lessons-p6";
import { LESSON_CONTENT_P6B } from "./lessons-p6b";
import { LESSON_CONTENT_P6C } from "./lessons-p6c";
import { LESSON_CONTENT_P7 } from "./lessons-p7";
import { LESSON_CONTENT_P7B } from "./lessons-p7b";
import { LESSON_CONTENT_P7C } from "./lessons-p7c";
import { LESSON_CONTENT_P8 } from "./lessons-p8";
import { LESSON_CONTENT_P8B } from "./lessons-p8b";
import { LESSON_CONTENT_P9 } from "./lessons-p9";
import { LESSON_CONTENT_P9B } from "./lessons-p9b";
import { LESSON_CONTENT_P10 } from "./lessons-p10";
import { LESSON_CONTENT_P10B } from "./lessons-p10b";
import { LESSON_CONTENT_P11 } from "./lessons-p11";
import { LESSON_CONTENT_P11B } from "./lessons-p11b";
import { LESSON_CONTENT_P12 } from "./lessons-p12";
import { LESSON_CONTENT_P12B } from "./lessons-p12b";
import { LESSON_CONTENT_P12C } from "./lessons-p12c";
import { LESSON_CONTENT_P13 } from "./lessons-p13";
import { LESSON_CONTENT_P13B } from "./lessons-p13b";
import { LESSON_CONTENT_P14 } from "./lessons-p14";
import { LESSON_CONTENT_P14B } from "./lessons-p14b";
import { LESSON_CONTENT_P15 } from "./lessons-p15";
import { LESSON_CONTENT_P15B } from "./lessons-p15b";
import { LESSON_CONTENT_P16 } from "./lessons-p16";
import { LESSON_CONTENT_P16B } from "./lessons-p16b";
import { LESSON_CONTENT_P17 } from "./lessons-p17";
import { LESSON_CONTENT_P17B } from "./lessons-p17b";
import { LESSON_CONTENT_P18 } from "./lessons-p18";
import { LESSON_CONTENT_P18B } from "./lessons-p18b";
import { LESSON_CONTENT_P19 } from "./lessons-p19";
import { LESSON_CONTENT_P19B } from "./lessons-p19b";
import { LESSON_CONTENT_P20 } from "./lessons-p20";
import { LESSON_CONTENT_P20B } from "./lessons-p20b";
import { LESSON_CONTENT_P21 } from "./lessons-p21";
import { LESSON_CONTENT_P21B } from "./lessons-p21b";
import { LESSON_CONTENT_P22 } from "./lessons-p22";
import { LESSON_CONTENT_P22B } from "./lessons-p22b";
import { LESSON_CONTENT_P23 } from "./lessons-p23";
import { LESSON_CONTENT_P23B } from "./lessons-p23b";
import { LESSON_CONTENT_P24 } from "./lessons-p24";
import { LESSON_CONTENT_P25 } from "./lessons-p25";
import { LESSON_CONTENT_P25B } from "./lessons-p25b";
import { LESSON_CONTENT_P26 } from "./lessons-p26";
import { LESSON_CONTENT_P26B } from "./lessons-p26b";
import { LESSON_CONTENT_P27 } from "./lessons-p27";
import { LESSON_CONTENT_P27B } from "./lessons-p27b";
import { LESSON_CONTENT_P28 } from "./lessons-p28";
import { LESSON_CONTENT_P29 } from "./lessons-p29";
import { LESSON_CONTENT_P29B } from "./lessons-p29b";
import { LESSON_CONTENT_P30 } from "./lessons-p30";
import { LESSON_CONTENT_P30B } from "./lessons-p30b";
import { LESSON_CONTENT_P31 } from "./lessons-p31";
import { LESSON_CONTENT_P31B } from "./lessons-p31b";
import { LESSON_CONTENT_P32 } from "./lessons-p32";
import { LESSON_CONTENT_P32B } from "./lessons-p32b";
import { LESSON_CONTENT_P33 } from "./lessons-p33";
import { LESSON_CONTENT_P33B } from "./lessons-p33b";
import { LESSON_CONTENT_P34 } from "./lessons-p34";
import { LESSON_CONTENT_P34B } from "./lessons-p34b";
import { LESSON_CONTENT_P35 } from "./lessons-p35";
import { LESSON_CONTENT_P35B } from "./lessons-p35b";
import { LESSON_CONTENT_P36 } from "./lessons-p36";
import { LESSON_CONTENT_P36B } from "./lessons-p36b";
import { LESSON_CONTENT_P37 } from "./lessons-p37";
import { LESSON_CONTENT_P37B } from "./lessons-p37b";
import { LESSON_CONTENT_P38 } from "./lessons-p38";
import { LESSON_CONTENT_P38B } from "./lessons-p38b";
import { LESSON_CONTENT_P39 } from "./lessons-p39";
import { LESSON_CONTENT_P39B } from "./lessons-p39b";
import { LESSON_CONTENT_P40 } from "./lessons-p40";
import { LESSON_CONTENT_P40B } from "./lessons-p40b";
import { LESSON_CONTENT_P41 } from "./lessons-p41";
import { LESSON_CONTENT_P41B } from "./lessons-p41b";
import { LESSON_CONTENT_P42 } from "./lessons-p42";
import { LESSON_CONTENT_P42B } from "./lessons-p42b";
import { LESSON_CONTENT_P43 } from "./lessons-p43";
import { LESSON_CONTENT_P44 } from "./lessons-p44";
import { LESSON_CONTENT_P44B } from "./lessons-p44b";

/**
 * Merged lesson content index. Each pass adds a per-phase module and
 * registers it here — LessonView consumes only this record.
 *
 * Pass 001: lessons-p0.ts   (p00-l1 … p00-l3)
 * Pass 002: lessons-p0b.ts  (p00-l4, p00-l5) + lessons-p1.ts (p01-l1)
 * Pass 003: lessons-p1.ts   (p01-l2, p01-l3)
 * Pass 004: lessons-p1.ts   (p01-l4, p01-l5)
 * Pass 005: lessons-p2.ts   (p02-l1, p02-l2)
 * Pass 006: lessons-p2.ts   (p02-l3, p02-l4)
 * Pass 007: lessons-p2c.ts  (p02-l5, p02-l6) — Phase 2 complete
 * Pass 008: lessons-p3.ts   (p03-l1, p03-l2) — Phase 3 opened
 * Pass 009: lessons-p3b.ts  (p03-l3, p03-l5, p03-l6) — TS core closed
 * Pass 010: lessons-p3c.ts  (p03-l4) — Phase 3 complete
 *           lessons-p4.ts   (p04-l1, p04-l2) — Phase 4 (React) opened
 * Pass 011: lessons-p4b.ts  (p04-l3, p04-l4, p04-l5) — React state/lists/forms
 * Pass 012: lessons-p4c.ts  (p04-l6, p04-l7) — Phase 4 (React) complete
 * Pass 013: lessons-p5.ts   (p05-l1, p05-l2) — Phase 5 (Hooks) opened
 * Pass 014: lessons-p5b.ts  (p05-l3, p05-l4) — refs/context/reducer + memoization
 * Pass 015: lessons-p5c.ts  (p05-l5 … p05-l8) — Phase 5 (Hooks) complete + BB-1
 * Pass 016: lessons-p6.ts   (p06-l1, p06-l2) — Phase 6 (Advanced React) opened
 * Pass 017: lessons-p6b.ts  (p06-l3, p06-l4) — state classification + profiling
 * Pass 018: lessons-p6c.ts  (p06-l5, p06-l6) — Phase 6 (Advanced React) complete
 * Pass 019: lessons-p7.ts   (p07-l1, p07-l2) — Phase 7 (HTTP/REST) opened
 * Pass 020: lessons-p7b.ts  (p07-l3, p07-l4) — identity on the wire + CORS
 * Pass 021: lessons-p7c.ts  (p07-l5, p07-l6) — Phase 7 complete
 *           lessons-p8.ts   (p08-l1 … p08-l3) — Phase 8 (Next.js) opened
 *           lessons-p8b.ts  (p08-l4 … p08-l6) — Phase 8 (Next.js) complete
 * Pass 022: lessons-p9.ts   (p09-l1 … p09-l3) — Phase 9 (Next.js Arch) opened
 *           lessons-p9b.ts  (p09-l4 … p09-l6) — Phase 9 (Next.js Arch) complete
 * Pass 023: lessons-p10.ts  (p10-l1 … p10-l3) — Phase 10 (NestJS) opened
 *           lessons-p10b.ts (p10-l4 … p10-l5) — Phase 10 (NestJS) complete
 * Pass 024: lessons-p11.ts  (p11-l1 … p11-l3) — Phase 11 (Fastify) opened
 *           lessons-p11b.ts (p11-l4 … p11-l5) — Phase 11 (Fastify) complete
 * Pass 025: lessons-p12.ts  (p12-l1 … p12-l3) — Phase 12 (NestJS Arch) opened
 *           lessons-p12b.ts (p12-l4 … p12-l6) — Phase 12 (NestJS Arch) complete
 * Pass 026: lessons-p13.ts  (p13-l1 … p13-l3) — Phase 13 (PostgreSQL) opened
 *           lessons-p13b.ts (p13-l4 … p13-l6) — Phase 13 (PostgreSQL) complete
 * Pass 027: lessons-p14.ts  (p14-l1 … p14-l3) — Phase 14 (Prisma 7.9.15) opened
 *           lessons-p14b.ts (p14-l4 … p14-l6) — Phase 14 (Prisma 7.9.15) complete
 * Pass 028: lessons-p15.ts  (p15-l1 … p15-l4) — Phase 15 (Prisma 7.9.15 Pro) opened
 *           lessons-p15b.ts (p15-l5 … p15-l7) — Phase 15 (Prisma 7.9.15 Pro) complete
 * Pass 029: lessons-p16.ts  (p16-l1 … p16-l3) — Phase 16 (Supabase Integration) opened
 *           lessons-p16b.ts (p16-l4 … p16-l6) — Phase 16 (Supabase Integration) complete
 * Pass 030: lessons-p17.ts  (p17-l1 … p17-l3) — Phase 17 (Supabase Auth) opened
 *           lessons-p17b.ts (p17-l4 … p17-l6) — Phase 17 (Supabase Auth) complete
 * Pass 031: lessons-p18.ts  (p18-l1 … p18-l3) — Phase 18 (Authorization & RBAC) opened
 *           lessons-p18b.ts (p18-l4 … p18-l6) — Phase 18 (Authorization & RBAC) complete
 */
export const LESSON_CONTENT: Record<string, LessonContent> = {
  ...P0,
  ...LESSON_CONTENT_P0B,
  ...LESSON_CONTENT_P1,
  ...LESSON_CONTENT_P2,
  ...LESSON_CONTENT_P2C,
  ...LESSON_CONTENT_P3,
  ...LESSON_CONTENT_P3B,
  ...LESSON_CONTENT_P3C,
  ...LESSON_CONTENT_P4,
  ...LESSON_CONTENT_P4B,
  ...LESSON_CONTENT_P4C,
  ...LESSON_CONTENT_P5,
  ...LESSON_CONTENT_P5B,
  ...LESSON_CONTENT_P5C,
  ...LESSON_CONTENT_P6,
  ...LESSON_CONTENT_P6B,
  ...LESSON_CONTENT_P6C,
  ...LESSON_CONTENT_P7,
  ...LESSON_CONTENT_P7B,
  ...LESSON_CONTENT_P7C,
  ...LESSON_CONTENT_P8,
  ...LESSON_CONTENT_P8B,
  ...LESSON_CONTENT_P9,
  ...LESSON_CONTENT_P9B,
  ...LESSON_CONTENT_P10,
  ...LESSON_CONTENT_P10B,
  ...LESSON_CONTENT_P11,
  ...LESSON_CONTENT_P11B,
  ...LESSON_CONTENT_P12,
  ...LESSON_CONTENT_P12B,
  ...LESSON_CONTENT_P12C,
  ...LESSON_CONTENT_P13,
  ...LESSON_CONTENT_P13B,
  ...LESSON_CONTENT_P14,
  ...LESSON_CONTENT_P14B,
  ...LESSON_CONTENT_P15,
  ...LESSON_CONTENT_P15B,
  ...LESSON_CONTENT_P16,
  ...LESSON_CONTENT_P16B,
  ...LESSON_CONTENT_P17,
  ...LESSON_CONTENT_P17B,
  ...LESSON_CONTENT_P18,
  ...LESSON_CONTENT_P18B,
  ...LESSON_CONTENT_P19,
  ...LESSON_CONTENT_P19B,
  ...LESSON_CONTENT_P20,
  ...LESSON_CONTENT_P20B,
  ...LESSON_CONTENT_P21,
  ...LESSON_CONTENT_P21B,
  ...LESSON_CONTENT_P22,
  ...LESSON_CONTENT_P22B,
  ...LESSON_CONTENT_P23,
  ...LESSON_CONTENT_P23B,
  ...LESSON_CONTENT_P24,
  ...LESSON_CONTENT_P25,
  ...LESSON_CONTENT_P25B,
  ...LESSON_CONTENT_P26,
  ...LESSON_CONTENT_P26B,
  ...LESSON_CONTENT_P27,
  ...LESSON_CONTENT_P27B,
  ...LESSON_CONTENT_P28,
  ...LESSON_CONTENT_P29,
  ...LESSON_CONTENT_P29B,
  ...LESSON_CONTENT_P30,
  ...LESSON_CONTENT_P30B,
  ...LESSON_CONTENT_P31,
  ...LESSON_CONTENT_P31B,
  ...LESSON_CONTENT_P32,
  ...LESSON_CONTENT_P32B,
  ...LESSON_CONTENT_P33,
  ...LESSON_CONTENT_P33B,
  ...LESSON_CONTENT_P34,
  ...LESSON_CONTENT_P34B,
  ...LESSON_CONTENT_P35,
  ...LESSON_CONTENT_P35B,
  ...LESSON_CONTENT_P36,
  ...LESSON_CONTENT_P36B,
  ...LESSON_CONTENT_P37,
  ...LESSON_CONTENT_P37B,
  ...LESSON_CONTENT_P38,
  ...LESSON_CONTENT_P38B,
  ...LESSON_CONTENT_P39,
  ...LESSON_CONTENT_P39B,
  ...LESSON_CONTENT_P40,
  ...LESSON_CONTENT_P40B,
  ...LESSON_CONTENT_P41,
  ...LESSON_CONTENT_P41B,
  ...LESSON_CONTENT_P42,
  ...LESSON_CONTENT_P42B,
  ...LESSON_CONTENT_P43,
  ...LESSON_CONTENT_P44,
  ...LESSON_CONTENT_P44B,
};
