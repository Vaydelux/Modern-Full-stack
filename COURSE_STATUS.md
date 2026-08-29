# COURSE_STATUS.md

> Generation history, decisions, gaps, technical debt, and the next batch.
> Rule: one pass = one bounded batch. Inspect → generate → review → update status → STOP.

---

## Pass log

### Pass 020 — Identity on the wire + the CORS boundary (Phase 7 at 4/6) — 2026-02

**Scope:**
- **P07-L3 "Cookies, Sessions & Bearer Tokens"** — stateless HTTP and the per-request identity claim, the four cookie locks (HttpOnly/Secure/SameSite/Max-Age) each with a cost, the ledger-vs-passport session/token tradeoff, JWT anatomy (header/payload/signature), and the decode-is-not-verify rule that Phase 17/18 rest on.
- **P07-L4 "CORS & Preflight, Demystified"** — the same-origin policy as a read-gate (the write still lands), the simple-vs-preflighted split, the four Access-Control-Allow-* slips, the credentials+wildcard trap, and the server-owned origin-allowlist fix, with the no-cors and dev-proxy non-fixes named for what they are.
- Two new live labs: **JWT Token Inspector** (decode / forge / expired states with a persistent "decoded — not verified" banner) and **CORS & Preflight Simulator** (simple-vs-preflighted detection with a live wire transcript and block reasons).
- Phase 7 advanced to 4/6 implemented.

**Decisions:**
- The course's auth architecture is stated once and reused everywhere: Supabase issues, the browser carries Bearer tokens, NestJS verifies every request — decode for display, verify for decisions.
- Cookies taught as four named locks with a cost-per-missing-lock, so learners audit real Set-Cookie lines rather than memorize attributes.
- CORS taught as a read-gate, not a firewall — the "the write landed anyway" consequence is surfaced explicitly because it is the dangerous half of the misdiagnosis.
- The JWT lab lets learners forge a claim and watch it still decode, making the signature's role experiential.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P07-L3/L4 render with both new labs, quizzes, flashcards, and checkpoints wired to persisted progress; roadmap/coverage reflect Phase 7 at 4/6.

### Pass 019 — Phase 7 (HTTP/REST) opened — the wire made visible — 2026-02

**Scope:**
- **P07-L1 "Anatomy of a Request: URL → DNS → Response"** — URL as typed data (fragment never reaches the server), the DNS/TCP/TLS pre-request journey and connection reuse, request/response envelopes, the Network timing waterfall with the four latency suspects, and curl -w timing variables.
- **P07-L2 "Methods, Status Codes & Headers"** — methods as promises (safe/idempotent/neither) driving retry policy, the status families with client choreography (401 refresh / 403 surface / 409 refetch / 422 map / 429 back off), and the headers that run the web (Content-Type, Accept, Authorization, Cache-Control, ETag, Location, Retry-After).
- Two new live labs: **Request Trace Lab** (clickable timing waterfall, four latency scenarios, longest-bar suspect finder) and **Status Match Lab** (method+status matching game with choreography explanations).
- Phase 7 advanced to 2/6 implemented; the Frontend Developer stage is open.

**Decisions:**
- Methods taught as promises, not labels — the safe/idempotent distinction is the retry policy TanStack Query (Phase 19) and webhook handling (Phase 29) inherit.
- Status codes taught as machine-readable outcomes with choreography; '200 with error:true' is named and refused as the costliest convenience.
- Latency taught as four owned suspects with the longest-bar rule — 'the API is slow' becomes a diagnosable claim.
- Headers-before-body established as the debugging habit; Authorization-in-headers installed before Supabase Auth lands.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P07-L1/L2 render with both new labs, quizzes, flashcards, and checkpoints wired to persisted progress; roadmap/coverage reflect Phase 7 at 2/6.

### Pass 018 — Phase 6 completed: the React Developer stage is done — 2026-02

**Scope:**
- **P06-L5 "Then-vs-Now: Outdated React vs Current Stable"** — class → function, lifecycle → effects, HOC/render-props → hooks/composition, and a safe-tutorial-reading checklist. The lab modernizes a 2018 component to its current-stable equivalent with behavior preserved.
- **P06-L6 "Design-System Components & Feature Folders"** — tokens → components (the Phase 1 payoff), accessible Button/Input/Modal with a11y baked in (focus trap, Escape/overlay dismiss, aria wiring), feature vs layer folder organization, and a shippable small design system.
- New live **Design System playground**: variant/state toggles, live Field wiring, and a fully accessible Modal demonstrating the component contract in motion.
- Phase 6 flipped to **implemented** (6/6). With P04, P05, and P06 all complete, the **entire React Developer stage is finished**.

**Decisions:**
- Then-vs-Now taught as a translation skill (old pattern → modern equivalent + why it changed), not a history lecture — so learners modernize legacy code safely instead of copying it.
- Design-system accessibility treated as non-optional: focus management, dismiss behaviors, and aria wiring are part of the component contract, never add-ons.
- Feature folders adopted as the default organization over layer folders, matching how real teams scope ownership and testing.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P06-L5/L6 render with the new design-system lab, quizzes, flashcards, and checkpoints wired to persisted progress; roadmap and coverage reflect Phase 6 at 6/6 and the React Developer stage complete.

### Pass 017 — State classification + performance profiling (Phase 6 at 4/6) — 2026-02

**Scope:**
- **P06-L3 "Optimistic UI & the State Classification Map"** — the six-state home map (local / derived / form / URL / server / auth) with owners and tools; the four-beat optimistic round trip (intent → overlay → network → commit or rollback); the cheap-and-reversible optimism gate; structural rollback via useOptimistic/cache layers; post-rollback UX with surfaced errors + Retry; and collision previews that point at Phase 19 guards and Phase 29 idempotency keys.
- **P06-L4 "Performance Profiling & Memoization Judgment"** — the four-move Profiler protocol with the 16ms frame budget; the three real problems (too many / too often / too slow) with matched cures; the memo contract and why memo-alone is theater; the five-step measure→name→treat→memoize→re-measure workflow; and the React Compiler's true scope (automates memoization, not judgment).
- Two new live labs: **Optimistic Lab** (latency dial, failure injection, per-row commit/revert timeline, round-trip log) and **Perf Lab** (memo / useCallback / state-split toggles with live render counts and measured ms — memo visibly fails, succeeds, then loses to treating the cause).
- Phase 6 advanced to 4/6 implemented.

**Decisions:**
- The six-state map is the canonical routing question for every value from Phase 8 onward — server state gets exactly one owner (TanStack Query, Phase 19), never scattered fetch-states.
- Optimism taught through structural rollback first; hand-rolled revert is framed as write-the-failure-path-first discipline.
- Memoization taught as step four of a measured workflow, never step one; the Perf Lab's state-split option proves "treat the cause beats skip the render."
- The trust line is now explicit across three lessons: forms (P01-L2) → optimistic overlays (P06-L3) → webhooks (P29): provisional presentation vs committed truth.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P06-L3/L4 render with both new labs, quizzes, flashcards, and checkpoints wired to persisted progress; roadmap/coverage reflect Phase 6 at 4/6.

### Pass 016 — Phase 6 (Advanced React) opened: component contracts + resilience layer — 2026-02

**Scope:**
- **P06-L1 "Component APIs & State Ownership"** — props as typed contracts, discriminated variants, status unions over boolean clusters, the compound Accordion pattern with private context, dual controlled/uncontrolled from one implementation, the five-level state-ownership map, and the six-point contract review.
- **P06-L2 "Error Boundaries, Suspense & Transitions"** — the typed/resettable/reporting boundary, the four fires boundaries never catch, per-feature placement, the cached-promise Suspense protocol, lazy route-splitting with intent preload, and the boundary+suspense+transition resilient shell.
- New **Error Boundary Lab**: one boundary vs a render bomb (sealed + reset) and an onClick explosion (ignored), plus a real Suspense curtain driven by the raw throw-a-cached-promise protocol, with an incident log.
- Phase 6 opened at 2/6 implemented; queue advanced.

**Decisions:**
- Compound components taught through the Radix/shadcn house style (private context, friendly outside-parent errors).
- Suspense taught via the raw protocol so the mechanism is understood before TanStack Query/Next.js automate it.
- The demo runtime is React 18, so the lab uses the version-agnostic protocol rather than React 19 `use()`; lesson text tracks current stable per the Version Matrix.
- Resilience placement rule installed: seal the volatile, curtain the slow, keep the way home outside every boundary.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P06-L1/L2 render with quizzes, flashcards, checkpoints, and the new lab wired; coverage reflects Phase 6 at 2/6.

### Pass 015 — Phase 5 (Hooks Mastery) completed + Hooks Gauntlet (BB-1) — 2026-02

**Scope:**
- **P05-L5 "useTransition, useDeferredValue & use"** — urgent vs transition updates, `isPending` as a "carried box" cue, `useDeferredValue` vs debounce, `use` for cached promises (Suspense + ErrorBoundary) and context, and the profile→memoize→then-transition last-resort discipline.
- **P05-L6 "Action Hooks: useActionState, useFormStatus, useOptimistic"** — the `[state, dispatch, isPending]` tuple, self-aware submit buttons via form context, structural optimistic rollback, and the optimism boundary (cheap/reversible vs costly/irreversible).
- **P05-L7 "Custom Hooks & the Hook Decision Matrix"** — the four-question sorting hat, logic-not-markup extraction, the lint-enforced Rules of Hooks, the hook-vs-component tell, and `useMediaQuery`/`usePrevious`/`useToggle`.
- **P05-L8 "Boss Battle: Hooks Gauntlet (BB-1)"** — five timed scenarios (stale closure, effect loop, search race, useless memo, state sprawl) graded on diagnose→fix→defend, with pass criteria and a remediation path.
- Phase 5 flipped to **implemented** (8/8). **BB-1 flipped to implemented** and now links to its lesson from the Boss Battles shelf. The React Developer stage's hooks core is complete.

**Decisions:**
- The Hook Decision Matrix (constant / derivable / paint-relevant / survives-renders) is the canonical value-placement tool — BB-1 grades against it, and Phase 6's state-classification map extends it.
- Concurrency taught strictly as a measured last resort after memoization; the spray-as-magic anti-pattern is named and refused.
- Optimism framed as a trust-line issue: optimistic overlays are presentation; the committed server state stays the source of truth (the Phase 20/21 line, rehearsed early).
- BB-1 authored as a real lesson with a timed quiz + written-defense criteria, not a placeholder; Boss Battles from here follow the same diagnose→fix→defend shape.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P05-L5–L8 render with quizzes, flashcards, and checkpoints wired to persisted progress; BB-1 links correctly from the Boss Battles shelf and the roadmap; coverage reflects Phase 5 at 8/8.

### Pass 014 — Phase 5 continues: refs/context/reducer + memoization discipline — 2026-02

**Scope:**
- **P05-L3 "useRef, useContext & useReducer"** — the notebook/intercom/rulebook model, DOM + value refs with the render-relevance law, previous-value and latest-callback patterns, the full context ceremony with breadth/churn fitness tests, the EverythingProvider anti-pattern, typed-action reducers reuniting with Phase 3 unions, and the four-question home audit.
- **P05-L4 "useMemo, useCallback & useId"** — memoization as a measured trade, the two legitimate useCallback consumers, the profile→treat-cause→memo→re-measure workflow, useId for SSR-safe accessible wiring, and the React Compiler's shifting defaults.
- Phase 5 advanced to 4/8 implemented.

**Decisions:**
- The four-question audit (constant? derivable? paint-relevant? survives renders?) is the canonical home-assignment tool — BB-1 grades against it.
- useCallback taught strictly by consumer (memo child / effect dep), never as hygiene.
- React Compiler positioned per Version Matrix policy: verified-stable awareness that changes defaults, not understanding.

### Pass 013 — Phase 5 (Hooks Mastery) opened: useState queues + useEffect synchronization — 2026-02

**Scope:**
- **P05-L1 "useState Deep Dive: Queues & Functional Updates"** — the snapshot-plus-mailbox model, batching everywhere (React 18+), the +1-not-+3 puzzle, functional updates and updater purity, the state checklist (varies/derivable/renders), lazy initializers, and Strict Mode as impurity detector.
- **P05-L2 "useEffect: Synchronization, Deps & Cleanup"** — the job-site contract (external systems only), dep arrays as honest reads-lists (Object.is), mirror-image cleanup, the infinite-loop family and its no-effect cures, AbortController + stale-guard race proofing, and the title-tag ceremony.
- Phase 5 opened at 2/8 implemented.

**Decisions:**
- useState taught as snapshot + queued tickets; stale-read bugs become predictions, not surprises.
- useEffect gated by "name the external system"; 'you might not need an effect' is a first-class skill.
- The abort-cleanup is both the leak fix AND the race fix — one mechanism, two enemies (tying back to P02-L6).

### Pass 012 — Phase 4 (React Foundations) completed: state architecture + render model — 2026-02

**Scope:**
- **P04-L6 "Lifting State & Derived State"** — the nearest-common-ancestor rule, data-down/events-up formalized, derive-don't-store (and the sync-effect smell that betrays duped state), prop drilling's honest limits, the temperature converter built two ways (drift vs lift).
- **P04-L7 "Reconciliation, Identity & Strict Mode"** — the full render-trigger list, diff-and-patch reconciliation, identity = type + position + key, reset-by-key, Strict Mode as a free impurity/leak detector, Profiler-driven measurement, and the phantom-re-render debugging lab.
- Phase 4 flipped to **implemented** (7/7). The React Developer stage's first phase is complete.

**Decisions:**
- State placement taught as a rule (nearest common ancestor) plus a test (derive vs store), so learners place values deliberately before context/reducers arrive.
- Strict Mode framed as a detector you keep, never remove — proper cleanup is the fix.
- Performance discipline: measure with the Profiler, then act; memoization is never a default.

### Pass 011 — React state, lists/keys, forms: the interactive core — 2026-02

**Scope:**
- **P04-L3 "State, Events & Immutable Updates"** — the snapshot model, batching, functional updates, the stale-read trap, camelCase synthetic events, the four immutable recipes applied to state, and the silent no-render mutation bug.
- **P04-L4 "Conditional Rendering, Lists & Keys"** — the three conditional idioms, the 0-truthy bug, keys as reconciliation identity, the index-key corruption bug, and loading/error/empty/success modeled as a discriminated union.
- **P04-L5 "Forms & Controlled Inputs"** — the controlled value+onChange loop, one-object-vs-many-states, checkbox/radio/select/textarea, touched-aware accessible validation, double-submit-guarded submission.
- Phase 4 advanced to 5/7 implemented.

**Decisions:**
- useState taught as snapshot-plus-queued-request from day one; batching and stale reads become predictions, not surprises.
- Keys taught as identity (demonstrating index-key corruption before stating the rule).
- Controlled forms keep Phase 1 native attributes — React owns the value; the platform owns semantics/a11y.

### Pass 010 — Phase 3 completed + Phase 4 opened: derivation types, declarative UI, components — 2026-02

**Scope:**
- **P03-L4 "keyof, typeof, unknown & Assertions"** — types-from-values, key unions, indexed access T[K], mapped types, unknown as the safe any, assertions as documented lies, and the compile-time-vs-runtime trust line. Phase 3 completed (6/6) — the Foundation stage is fully done.
- **P04-L1 "Declarative UI & JSX"** — the UI = f(state) flip (Then-vs-Now vs the Phase 2 render loop), JSX rules, the 0-truthy trap, createRoot mounting, ownership inversion.
- **P04-L2 "Components, Props & Composition"** — typed components, read-only props, children as the composition slot, prop-explosion smell, splitting by responsibility, data-down/events-up. Phase 4 opened (2/7).

**Decisions:**
- keyof/typeof positioned as the engine under Phase 19 typed API contracts and Prisma's generated client.
- The compile-time/runtime boundary made explicit in P03-L4 so Phase 20 runtime validation lands as a conclusion.

### Pass 009 — TS core closed: generics + strict tsconfig + migration lab — 2026-02

**Scope:**
- **P03-L3 "Generics & Utility Types"** — the molds-not-sculptures model, typed identity/first/pick, K extends keyof T, the utility toolbox (Partial/Required/Pick/Omit/Record/ReturnType/NonNullable), the three over-engineering tests, and request<T> + Result<T> as the course's API shape from here to the capstones.
- **P03-L5 "Strict tsconfig & Compiler Diagnostics"** — the strict family flag-by-flag, the six-code error catalog (2322/2339/2345/2532/7006/2769), ! and @ts-ignore framed as audited debt, noUncheckedIndexedAccess + verbatimModuleSyntax as course defaults, and the ten-error diagnostic lab.
- **P03-L6 "Lab: Migrate the Todo App to TypeScript"** — the Foundation stage's capstone Then-vs-Now: behavior-frozen incremental migration, two confessed bugs (the 204 parse crash, NaN ids), and the done→completed rename refactor with compiler receipts.
- Phase 3 now 5/6 implemented (only P03-L4 keyof/typeof/unknown remains). Queue advanced: Pass 013 added to close Phase 4.

**Decisions:**
- Generics taught with three honesty tests (connected positions? two type families? readable call sites?) so speculative abstraction is refused early.
- The strict tsconfig baseline (strict + noUncheckedIndexedAccess + verbatimModuleSyntax) is the inherited file for every project from Phase 4 onward.
- The migration lab freezes behavior by decree — "while I'm here" rewrites are the named anti-pattern, rehearsing expand/contract discipline reused in Phases 15 and 38.
- Non-null assertions and @ts-ignore are loans requiring justification; @ts-expect-error is the only self-healing sanctioned suppression.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P03-L3/L5/L6 render with quizzes, flashcards, and checkpoints wired to persisted progress; search indexes the new lessons; roadmap and coverage reflect Phase 3 at 5/6.

### Pass 008 — TypeScript opened: inference/objects + unions/narrowing — 2026-02

**Scope:**
- **P03-L1 "Inference, Annotations & Objects"** — inference vs annotation discipline (annotate at the edges, let the middle infer), object shapes (required/optional/readonly, structural typing, excess-property freshness), arrays + the undefined trap, the practical type-vs-interface rule, literal types + `as const`, and the Todo app's state fully typed.
- **P03-L2 "Unions, Narrowing & Literal Types"** — unions vs optional-field soup, narrowing (typeof/in/truthiness/discriminant equality), discriminated unions as the course default, the `Result<T>` pattern, `never` + `assertNever` exhaustiveness, and a typed status machine (open → done) where illegal transitions are unrepresentable.
- Phase 3 flipped to **partial** (2/6 implemented). The TypeScript track is open.
- Queue advanced: Pass 008 complete; Pass 012 added to continue Phase 4 (React state/rendering).

**Decisions:**
- Inference-first teaching stance — matches professional codebases and reduces annotation rot.
- Discriminated unions established as the course's default modeling tool; `Result<T>` = `{ ok: true; data } | { ok: false; error }` is the canonical API-result shape reused from Phase 19 onward.
- Exhaustiveness checking (`never` + `assertNever`) taught immediately with unions so "adding a case breaks the build everywhere it must" becomes a reflex.
- type-vs-interface resolved with a practical rule (type by default, interface for extendable contracts) — consistency over cleverness.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P03-L1/L2 render with quizzes, flashcards, and checkpoints wired to persisted progress; search indexes the new lessons; roadmap and coverage reflect Phase 3 at 2/6.

### Pass 007 — async/await + the event loop; Phase 2 complete — 2026-02

**Scope:**
- **P02-L5 "fetch, Promises & async/await"** — the Promise state machine (pending/fulfilled/rejected, settle-once), fetch's two-stage shape (await Response → check ok → await .json()), async/await as promise syntax with try/catch/finally, HTTP vs network error separation, sequential vs Promise.all/allSettled/race latency math, and the Todo app upgraded to speak HTTP through an isolated `api.js` module.
- **P02-L6 "Event Loop, Tasks & Debugging Labs"** — the chef-and-ticket-rail model, the loop's law (task → drain microtasks → one macrotask → paint), micro-vs-macro ordering puzzles, why setTimeout(0) is a floor, chunking heavy work, timing-floors-not-contracts, and a nine-step race-condition debugging lab (latest-id guard + AbortController). Includes a **live Event Loop scheduler lab**.
- Phase 2 flipped to **implemented** (6/6). The Foundation stage's JavaScript core (Phases 1–2) is now complete end-to-end.
- Queue advanced: Pass 008 opens Phase 3 (TypeScript); Pass 011 added to open Phase 4 (React).

**Decisions:**
- fetch taught as a two-stage await from day one — collapsing the stages is the most common beginner async bug, so it's named and prevented early.
- The Event Loop Lab makes the queue law perceptible (with a thread-block banner) rather than asserted.
- Timing framed as floors-not-contracts to defuse the setTimeout-as-synchronization superstition.
- The Todo `api.js` module is the deliberate seam for NestJS — only BASE changes when the real backend arrives.

**Moved files:** none. **Technical debt:** none new.
**QA performed:** `npm run build` green; P02-L5/L6 render with the Event Loop lab, quizzes, flashcards, and checkpoints wired to persisted progress; search indexes the new lessons; queue and roadmap updated.

### Pass 006 — Arrays/objects/immutability + the DOM, events & the Todo skeleton — 2026-02

**Scope:**
- **P02-L3 "Arrays, Objects & Immutability"** — filter/map/reduce pipelines, the mutator-vs-copy-maker line, toSorted/toReversed/with, shallow-depth traps, lookup tables (Object.fromEntries / Object.hasOwn), Map judgment, and the four update recipes. Includes a **live Immutability Lab** with a snapshot panel and reference-identity badges.
- **P02-L4 "The DOM, Events & Forms"** — querySelector discipline, safe node construction (textContent vs innerHTML), the first XSS encounter, event bubbling/delegation, FormData, and the **full vanilla Todo skeleton milestone** (filters, live counter, clear-completed, localStorage persistence).
- First cumulative milestone landed: the Todo skeleton unifies Phase 1 semantics/validation/tokens with Phase 2 closures/immutability/delegation.
- Phase 2 now 4/6 implemented; queue advanced (Pass 007 async/event-loop up next; Pass 010 added to close Phase 3).

**Decisions:**
- XSS taught at first DOM contact, not deferred to Phase 30 — the trust-boundary rule ("user data enters as text") installs the week it becomes possible to violate.
- The Todo skeleton is written explicitly as state → render → actions, so Phase 4 can present React as the same loop with bookkeeping automated (Then-vs-Now ready).
- toSorted/toReversed/with taught as current baseline (Baseline 2023) with the [...x].sort() fallback noted.

**Moved files:** none.
**Technical debt:** none new.
**QA performed:** `npm run build` green; P02-L3/L4 render with the Immutability Lab, quizzes, flashcards, and checkpoints wired to persisted progress; search indexes the new lessons automatically; Phase 2 coverage meter reflects 4/6.

### Pass 005 — Phase 2 opened + full-curriculum scope commitment — 2026-02

**Scope:**
- **P02-L1 "Values, Types & Control Flow"** — the eight types, value vs reference (postcards vs houses), the falsy list, `??` vs `||`, the `===` discipline, guard clauses, and money-as-integer-cents. Full quality contract + quiz + flashcards + challenge.
- **P02-L2 "Functions, Scope & Closures"** — function forms, outward-only scope lookup, hoisting + TDZ, the backpack model of closures, the 3-3-3 var bug, and debounce. Ships with a **live Closure Lab** (independent counters + debounce tester with call log).
- **Curriculum completeness:** every planned lesson across all 45 phases now carries a committed outline. Roadmap rows expand to show each module's promised scope, and the roadmap filter matches outline text. No module is a bare title anymore.

**Decisions:**
- Planned lessons are *specified* (title + committed scope), never merely named — the manifest promise is visible in-product while bodies stay honestly unauthored.
- Locked two course-wide metaphors taught in Phase 2 and reused later: postcards-vs-houses (reference semantics, reused in React state) and the backpack (closures, reused in hooks and TanStack Query).
- Money-as-integer-cents (P02) deliberately echoes Postgres `Decimal` (P13) and Prisma Decimal handling (P15) — one consistent discipline across the stack.
- Queue advanced: Pass 006 (arrays/DOM) is up next; Pass 009 (TypeScript close) added to keep four batches visible.

**Moved files:** none.
**Technical debt:** none new.
**QA performed:** `npm run build` green; both new lessons render with the Closure Lab, quiz, flashcards, and checkpoint wired to persisted progress; roadmap outlines expand/collapse with keyboard-accessible toggles; search auto-indexes the new lessons.

### Pass 004 — Phase 1 completed (layout + token system) — 2026-02

**Scope:**
- **P01-L4 "Flexbox, Grid & Responsive Layout"** — rail-vs-map mental model, the five-property flex core (direction/justify/align/wrap/gap + the `flex` shorthand), `fr` and `minmax`, `repeat(auto-fill, minmax(min(100%, Xpx), 1fr))` as the breakpoint-free card wall, `grid-template-areas` page skeletons, flex-vs-grid decision rule, mobile-first media queries for structure-only changes, and 200% zoom reflow testing. Includes a **live Flexbox/Grid playground** that emits the exact CSS it applies.
- **P01-L5 "Design Tokens, Custom Properties & Dark Mode"** — role-named tokens vs appearance names, anatomy of a token set (brand/surfaces/ink/states/spacing/radii/shadows/type/motion), themes-as-mappings under `[data-theme]` using this platform's real token file, dark mode as redesign (off-black surfaces, tuned brand, shadows→borders), WCAG 4.5:1/3:1 pairs, and the no-flash `<head>` boot pattern (stored → `prefers-color-scheme` → default). Includes a **live Token Lab** with real-time contrast-ratio computation.
- Phase 1 flipped to **implemented** (5/5). Foundation stage is now 2 of 4 phases complete.
- Dashboard now surfaces the Generation Queue inline; queue advanced (Pass 005 JS core is up next; Pass 008 TypeScript added).

**Decisions:**
- Container queries (`@container`, Baseline 2023) stay conceptual — viewport media queries cover course projects; revisit at P09/P19 if component-level theming needs them.
- Dark-mode teaching uses this site's actual `src/index.css` tokens and boot pattern as the canonical worked example — the theory and the artifact are the same object.
- The Token Lab computes WCAG contrast ratios live so the 4.5:1 rule is felt, not quoted.
- Layout/token examples avoid `px` widths and appearance names throughout — the habits taught are the habits the platform's own CSS uses.

**Moved files:** none.
**Technical debt:** Flex/Grid playground presets are curated (cards/holy/sidebar/even) rather than free-form track editing — intentional for pedagogy; a free-form track editor is a candidate P01-lab extension, not required.
**QA performed:** `npm run build` green; P01-L4/L5 render with both new labs, quizzes, flashcards, and checkpoints wired to persisted progress; search indexes the new lessons automatically; queue renders on both Status and Dashboard; theme toggle and reduced-motion unaffected.

### Pass 003 — Phase 1 mechanics + platform search & queue — 2026-02

**Scope:**
- **P01-L2 "Forms, Labels & Native Validation"** — fieldset/legend, constraints as data (required/type/pattern+title/min/max/minlength), the validation lifecycle (input → submit-block → checkValidity/reportValidity → ValidityState), setCustomValidity for cross-field rules, accessible errors (aria-invalid, aria-describedby, announced summary), FormData, double-submit guard, and the explicit trust line (native = UX, NestJS P20 = authority, Postgres constraints = final integrity). Includes a **live Constraint Validation lab**.
- **P01-L3 "Cascade, Specificity & the Box Model"** — the four-question cascade (origin → !important → specificity → source order), specificity triplets with inline-style and :where/:is rules, border-box vs content-box arithmetic, margin collapse, rem/em/%/px discipline, inheritance, and custom properties as the mechanism behind this course's own tokens. Includes **live Specificity Battle and Box Model labs**.
- **Course-wide search** (⌘K / Ctrl K, topbar button): indexed over lessons (authored + planned titles/outlines), glossary, troubleshooting, phases, and platform pages; keyboard navigable; index derives from curriculum data so new lessons are searchable at registration time.
- **Visible Generation Queue** on the Status page: ordered upcoming passes with rationale, published before authoring.

**Decisions:**
- Modern CSS baseline pinned in the Version Matrix: `:has()` (Baseline 2023-12) and `:user-invalid` (Baseline 2025) are safe to teach today; `@layer`/`@container` stay conceptual until a phase needs them.
- Interactive labs are now first-class lesson sections (`demo` field on `LessonSection`); mechanics lessons pair theory with an instrument.
- The nine-step debugging method from P00-L4 was applied to the new troubleshooting entries (t15 cascade, t16 validation, t17 box-model).

**Moved files:** none.
**Technical debt:** specificity lab parser is educational (common selectors, :not/:is contents, :where zeroing) — labeled as such in-UI; not a full CSS parser.
**QA performed:** `npm run build` green; new lessons render with labs, quiz, flashcards, checkpoint wired to persisted progress; search returns results across all five indexes; queue renders in order; theme + reduced-motion unaffected.

### Pass 002 — Phase 0 completed, Phase 1 opened — 2026-02
Authored P00-L4 (DevTools & the Debugging Mindset — nine-step loop installed as course method), P00-L5 (Environments, Secrets & Config Hygiene), and P01-L1 (Semantic HTML & Landmarks). Flipped Phase 0 to `implemented`. Added troubleshooting t13–t14, 9 glossary terms, Chrome DevTools version row.

### Pass 001 — Scaffold — 2026-02
Course platform shell, design tokens, curriculum inventory (45 phases), Phase 0 Lessons 1–3 authored, governance files created, initial gap discovery.

---

## Gap discovery (current)

| Gap | Classification | Recommendation |
|-----|----------------|----------------|
| Planned-module scope visibility | covered (Pass 005) | Every planned lesson now has a committed outline, expandable in the roadmap |
| Immutability / change-detection lab | covered (Pass 006) | Mutate-vs-copy lab with snapshot panel ships in P02-L3 |
| Vanilla Todo milestone | covered (Pass 007) | Skeleton (P02-L4) upgraded to HTTP via api module (P02-L5); Foundation JS project complete |
| Event loop / concurrency lab | covered (Pass 007) | Scheduler lab with thread-block banner ships in P02-L6 |
| Phase 2 JS core bodies | covered (Pass 007) | All 6 lessons implemented; Foundation JS core (Phases 1–2) done |
| Phase 3 TypeScript core bodies | partial (Pass 009) | 5/6 authored; only P03-L4 (keyof/typeof/unknown) remains — Pass 010 closes the phase |
| Generics / utility types | covered (Pass 009) | Molds model + toolbox + request<T>/Result<T> ship in P03-L3 |
| JS→TS migration lab | covered (Pass 009) | Behavior-frozen migration with two confessed bugs ships in P03-L6 |
| Strict tsconfig baseline | covered (Pass 009) | strict + noUncheckedIndexedAccess + verbatimModuleSyntax inherited by all projects from Phase 4 |
| keyof/typeof/unknown & assertions | covered (Pass 010) | P03-L4 authored; Phase 3 complete; powers the Phase 19 typed API contracts |
| React declarative model + components | covered (Pass 010–012) | All of Phase 4 authored (7/7) — JSX, components, state, lists/keys, forms, lifting, reconciliation |
| Hooks Mastery bodies | covered (Pass 013–015) | All 8 Phase 5 lessons implemented — the full current-stable hook toolbox |
| Hook Decision Matrix + custom hook design | covered (Pass 015) | Four-question sorting hat + logic-not-markup extraction ship in P05-L7 |
| Hooks Boss Battle (BB-1) | covered (Pass 015) | Five timed scenarios graded on diagnose→fix→defend ship in P05-L8 |
| Component APIs / state ownership | covered (Pass 016) | Typed contracts, compound components, dual controlled/uncontrolled, ownership map ship in P06-L1 |
| Error boundaries / Suspense / resilient shell | covered (Pass 016) | Per-feature boundaries, cached-promise Suspense, lazy splitting, transition no-flash ship in P06-L2 |
| Optimistic UI + state classification | covered (Pass 017) | Six-state home map + four-beat round trip + optimism gate ship in P06-L3 with a failure-injection lab |
| React performance profiling judgment | covered (Pass 017) | Four-move Profiler protocol + three-problem diagnosis + measured memo workflow ship in P06-L4 with a live perf lab |
| Then-vs-Now React + design-system folders | covered (Pass 018) | Legacy-translation skill + accessible design system + feature folders ship in P06-L5/L6; React Developer stage complete |
| HTTP request anatomy & timing | covered (Pass 019) | URL/DNS/TCP/TLS + waterfall + curl timings ship in P07-L1 with the Request Trace Lab |
| HTTP methods/status/headers vocabulary | covered (Pass 019) | Methods-as-promises + status choreography + headers ship in P07-L2 with the Status Match Lab |
| Cookies/sessions/bearer tokens (identity on the wire) | covered (Pass 020) | Four cookie locks + ledger-vs-passport + JWT anatomy + decode≠verify ship in P07-L3 with the Token Inspector lab |
| CORS & preflight demystified | covered (Pass 020) | Read-gate model + preflight transcript + server allowlist fix ship in P07-L4 with the CORS Simulator lab |
| REST conventions/pagination/structured errors | planned (P07-L5) | Pass 021 — the contract Phase 10 implements |
| Diagnose-which-layer-failed lab | planned (P07-L6) | Pass 021 — six planted failures, timed nine-step method, closes Phase 7 |
| Phase 1 HTML/CSS/a11y bodies | covered (Pass 004) | All 5 lessons implemented; accessible-site milestone requirements met in-lesson |
| Flexbox/Grid interactive lab | covered (Pass 004) | Playground ships in P01-L4 with generated-CSS output |
| DevTools Performance & memory panels | partial (P32) | Dedicated segment at P32 |
| Structured screen-reader lab (VoiceOver/NVDA) | partial (P01-L1 intro) | Structured lab in P01 milestone; axe automation in P31 |
| Core Web Vitals budgets & measurement | partial (P32) | Dedicated segment when P32 is authored |
| Node test runner vs Vitest decision | needs-decision | Decide at P31 scaffold; record in Version Matrix |
| Zod 3 vs Zod 4 baseline | needs-decision | Decide at P20 scaffold against current stable |
| Intl/dates/money handling | missing | Candidate lesson in P02 or P22 |
| OpenTelemetry vs Sentry-first observability | partial (P33) | Decide at P33; Sentry-first for beginners |
| Supabase Edge Functions | out-of-scope-note | Optional awareness page only; authority stays in NestJS |
| CSP/SRI/deep browser security | partial (P30) | Ensure P30 includes a dedicated segment |
| Older Prisma tutorial vs 7.9.15 lab | planned (P15) | Verify pinned-version behavior at authoring time |

## Next batch (Pass 021)

1. Author **P07-L5 "REST Conventions, Pagination & Structured Errors"** — resources, nesting, business actions, offset vs cursor pagination, and Problem-style error contracts.
2. Author **P07-L6 "Lab: Diagnose Which Layer Failed"** — six planted failures across the stack, evidence from Network/headers/timing, and the nine-step method under a timer.
3. Flip Phase 7 to implemented (6/6) and advance the queue (Pass 022 opens Phase 8 — Next.js).

---
*Do not mark placeholders complete. Do not silently upgrade pinned versions (Prisma `7.9.15`).*
