# Zero to Mastery — Modern Full-Stack Web Development

A living, project-first engineering curriculum spanning React, Next.js, NestJS, Fastify, Prisma 7.9.15, and Supabase PostgreSQL — from web fundamentals to production mastery.

---

## Progressive Web App (PWA) & Offline-First Architecture

This platform is configured as an installable, offline-capable Progressive Web App with zero external runtime dependencies.

### 1. Hand-Rolled Service Worker (`public/sw.js`)
- **App Shell Precaching**: Automatically precaches the core HTML shell, web manifest, and SVG vector brand icons on worker installation (`install` event).
- **Navigation Caching Strategy**: Employs **Network-First with Cached-Shell Fallback** for document requests (`request.mode === 'navigate'`). Fresh production deployments are immediately received online, while the full curriculum remains browsable offline when connectivity is unavailable.
- **Hashed Assets & Web Fonts**: Implements **Cache-First** strategy for Vite immutable chunks (`/assets/*`) and Google Web Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).
- **Dynamic Assets**: Implements **Stale-While-Revalidate** for static assets and secondary resources.
- **Versioned Lifecycle Management**: Versioned cache buckets (`z2m-shell-v1`) are swept cleanly on `activate`. New worker editions stay in a waiting state to avoid disrupting active study sessions until triggered by learner reload.

### 2. Web App Manifest (`public/manifest.webmanifest`)
- **Metadata**: Standalone display configuration with matching theme and background colors (`#0b100e`).
- **Adaptive Vector Iconography**: SVG-based maskable and standard icons (`/icons/icon.svg`) with proper safe-zone framing for Android squircles and desktop app launchers.
- **Direct Launch Shortcuts**: Instant launch links into Roadmap (`/#/roadmap`), Search (`/#/?search=1`), Glossary (`/#/glossary`), and Completion Ledger (`/#/dashboard`).

### 3. In-App PWA Affordances
- **Top Bar Install Chip**: Conditionally rendered when `beforeinstallprompt` is fired by Chromium/Edge/Android browsers.
- **Offline Indicator**: Amber badge with `WifiOff` icon signaling when content is being served from local cache.
- **Update Toast Notification**: Toast with animated pulsing indicator alerting learners when a new curriculum edition is waiting to activate, complete with instant one-click reload.

