# Domain Pitfalls

**Domain:** Multi-tenant module sharing platform (React + Supabase Auth + read-only external API)
**Project:** A360 Pulse
**Researched:** 2026-03-27
**Confidence:** HIGH — pitfalls drawn from observed codebase issues (CONCERNS.md), confirmed by community sources, and verified against Supabase official documentation.

---

## Critical Pitfalls

Mistakes that cause rewrites, data leaks, or broken systems with no clean recovery path.

---

### Pitfall 1: Touching Prompt Runner

**What goes wrong:** A developer (or AI agent) makes a "small improvement" to the Prompt Runner backend, adds a Supabase table to the Prompt Runner project, or modifies the Railway API response shape. Multiple downstream systems that consume Prompt Runner break simultaneously. Because Prompt Runner has no test coverage, the breakage may not be detected until a demo fails.

**Why it happens:** The codebase already contains a Vercel proxy (`vite.config.ts`) pointing at the Railway backend. The natural impulse when debugging an API issue is to "fix it at the source." AI coding agents in particular will follow the call chain to the backend and propose changes there without understanding the hands-off constraint.

**Consequences:** Mid-Stream, IE Interface, and any other consumers of the Railway API break. Rollback requires Railway deployment history. No safe way to test the fix in isolation.

**Warning signs:**
- Any file change outside `C:/Projects/Prompts/ie-interface/` referencing Prompt Runner
- An agent suggesting changes to the Railway backend URL or schema
- A PR that includes changes to `vite.config.ts` proxy target

**Prevention:**
- Put `PROMPT RUNNER IS HANDS-OFF — READ ONLY` as the first line of the project's CLAUDE.md
- Add an `agents.md` rule: "Never suggest changes to Railway backend, Prompt Runner Supabase project, or any upstream API. Pulse is a consumer, not an owner."
- Create a typed `PromptRunnerApiClient` wrapper that makes it visually clear these calls are outbound/read-only
- Code-review rule: any PR touching `src/shared/api/client.ts` requires explicit review of whether it adds write operations

**Phase:** Address in the CLAUDE.md / agents.md milestone (already in Active requirements). Enforce before any multi-tenant or Supabase work begins.

---

### Pitfall 2: Supabase service_role Key Exposed in Frontend

**What goes wrong:** The service_role key is placed in a `VITE_` environment variable (which is bundled into the client-side JavaScript). Because Vite inlines all `VITE_*` env vars at build time, the key is visible in the browser's source. The service_role key bypasses all RLS policies — every table is fully accessible to anyone who opens DevTools.

**Why it happens:** Developers use the service_role key during local development because it "just works" without setting up RLS policies. The key gets committed to `.env` or pushed to Vercel environment variables with the wrong exposure scope.

**Consequences:** Full read/write access to the Pulse Supabase project for anyone with the Vercel URL. User module assignments, branding configs, and any stored session data exposed. Not PHI (Pulse uses synthetic data), but exposes the A360 demo infrastructure.

**Warning signs:**
- Any `VITE_SUPABASE_SERVICE_KEY` or similar env var in `vite.config.ts` or `.env`
- Supabase client initialized with the service key in any file under `src/`
- RLS disabled on any table that stores user or module data

**Prevention:**
- Only `VITE_SUPABASE_ANON_KEY` goes in the frontend. The service_role key is server-only (Vercel Edge Functions or never used at all for this scale).
- Enable RLS on every table before writing any data to them — not after
- Use the Supabase dashboard's "API" section security checker before launch
- Document in CLAUDE.md: "anon key = client-safe, service_role = never in frontend"

**Phase:** Must be established in the initial Supabase schema setup milestone, before any user data is written.

---

### Pitfall 3: RLS Policies Written After Data, Tested via SQL Editor

**What goes wrong:** Tables are created and populated first, RLS enabled second. Policies are tested by running SQL in the Supabase dashboard SQL editor — which runs as the postgres superuser and bypasses RLS entirely. The developer concludes policies work. In production, user A can read user B's module assignments because the actual policy was never exercised.

**Why it happens:** The SQL editor is the natural tool for Supabase schema work. The RLS bypass behavior is not obvious. Isolation failures return empty results (not errors), so the app appears to work.

**Consequences:** One user sees another user's assigned modules. Module customizations (logos, branding) leak across tenants. At Pulse's scale (5-20 users), this is embarrassing and breaks the demo value proposition.

**Warning signs:**
- RLS policies written after initial table population
- No test using `supabase.auth.signInWithPassword()` from a non-admin user to verify isolation
- SQL editor used as the only policy validation tool

**Prevention:**
- Enable RLS at table creation time, before any INSERT
- Test every policy from the Supabase client SDK authenticated as a test user, not the SQL editor
- Create two test users (user_a, user_b) and verify user_a cannot SELECT user_b's rows before calling the schema "done"
- Keep the policy model as simple as possible: `auth.uid() = user_id` for user-scoped rows, `tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid())` for tenant-scoped rows

**Phase:** Supabase Auth integration milestone. Write policy tests before writing application code that depends on isolation.

---

### Pitfall 4: Tenant Context Leaking Between Module Navigations

**What goes wrong:** A Zustand store holds the current user's tenant/org context. A user switches modules (or the admin views another user's data). The previous tenant context is still in the store when the new module loads. The new module fetches data scoped to the wrong tenant. Because RLS is a backstop (not the primary filter), this may not be caught if RLS policies have any gaps.

**Why it happens:** Global Zustand stores are initialized once and persist across route changes. React component unmount does not reset store slices by default. When adding multi-tenancy to a single-tenant app, existing stores are extended with a `tenantId` field but old code paths that never needed it don't reset it.

**Consequences:** Data from one tenant's context renders in another's module view. In a demo setting, this is a critical visible failure — the whole point of Pulse is to show Client A only Client A's data.

**Warning signs:**
- Tenant ID stored in a global Zustand slice with no reset-on-route-change logic
- Module components that read tenant context from the store without verifying it matches the current URL or session
- No `useEffect` cleanup resetting tenant context on navigation

**Prevention:**
- Derive tenant context from the authenticated session (Supabase session JWT), not from a writable store slice
- If a store slice is used for performance, reset it in a route-change effect at the shell level
- Pass tenant ID as a prop or React context scoped to each module, not as a global singleton
- Write an integration test that navigates between two module routes and asserts the second module fetches with the correct tenant ID

**Phase:** Multi-tenant routing and module access control milestone.

---

### Pitfall 5: "Simple Sharing" Becomes a Permission System

**What goes wrong:** The initial requirement is "user sees only their assigned modules." The first demo prompts: "Can they edit which modules they see?" Then: "Can I give them read-only vs edit access?" Then: "Can I share a module with a group?" Within two milestones, the project has a roles table, a permissions table, a group membership table, and a custom RBAC implementation that took longer to build than the modules it protects.

**Why it happens:** Each new access requirement sounds small ("just add a boolean flag"). But each flag becomes a dimension that multiplies every subsequent feature. "Can they share the share link?" "Does the admin override all flags?" This is the canonical scope creep vector for internal tools.

**Consequences:** The core value (build modules once, share them) gets buried under access management UI. The platform competes with itself for development time. The simple Supabase Auth + RLS model gets replaced with something that requires ongoing maintenance.

**Warning signs:**
- A requirements discussion that introduces the word "role" beyond admin/user
- A feature request for "view-only vs full access" per module
- Any table with more than three columns dedicated to access control flags

**Prevention:**
- Lock the permission model to two roles (admin, user) and one access pattern (user sees assigned modules) for the entire first version
- Explicitly out-of-scope in PROJECT.md: "No RBAC, no group permissions, no per-module access levels in v1"
- When a new access requirement emerges, log it as a future item and continue — do not implement during the current milestone
- The roadmap should enforce a "no new access patterns" rule until module count exceeds 10 and there is proven user demand

**Phase:** Establish the constraint before the auth milestone begins. Revisit only after all modules are built and sharing is validated.

---

## Moderate Pitfalls

Mistakes that cause rework or visible quality degradation but can be fixed without architectural changes.

---

### Pitfall 6: Production UI Parity Used as a Blocker

**What goes wrong:** A module is functional and useful, but it uses a plain MUI `Chip` instead of `MDChip`. The developer (or a reviewer) blocks the milestone until every card matches production exactly. The parity work takes longer than the feature work. Demos slip.

**Why it happens:** The stated goal is "mirrors the production a360-web-app UI exactly." This is interpreted as a gate rather than a direction. The codebase already has this problem: `MDChip` is built but not wired into six card files (per CONCERNS.md).

**Consequences:** Real features (auth, sharing, module customization) get deferred while visual polish work consumes sprints. The demo tool is production-accurate but not yet shareable.

**Prevention:**
- Define "production parity" as a direction, not a gate: "cards must look close enough that a client doesn't notice the difference at first glance"
- Separate the visual polish milestone from the functional milestone — never block shipping on cosmetic gaps
- The MDChip fix (wiring into 6 card files) is a single focused task; schedule it as its own item, not as a prerequisite for auth work
- Hardcoded colors (CONCERNS.md lists 7 locations) are a technical debt item, not a launch blocker

**Phase:** Card library polish milestone, run independently of auth/sharing milestones.

---

### Pitfall 7: Version Detection Fragility Breaks Multi-Pass Outputs

**What goes wrong:** `versionDetect.ts` uses field-presence heuristics to identify V1 vs V2 vs unknown. V3/V3.1 multi-pass outputs hit the `unknown` branch and fall back to the degraded text-only layers view. When Prompt Runner is updated to produce V3.1 outputs by default, the Simulator silently shows the wrong view for every new run.

**Why it happens:** The version detection logic predates V3. No tests exist to catch regressions. The `tryMapToCards` function in Simulator.tsx adds partial V3 handling but only grabs the first matching pass and discards the rest — a behavior that is easy to miss in code review.

**Consequences:** New runs produce degraded output in Pulse's primary demo view. Clients see a text dump instead of intelligence cards. The root cause is non-obvious because no error is thrown.

**Warning signs:**
- Simulator shows "layers" view (text accordion) instead of intelligence cards for recent runs
- `versionDetect.ts` returns `'unknown'` for a run that has valid card data
- `extractionToCards.ts` receives V3 nested structure but processes it as flat V2

**Prevention:**
- Add explicit `extraction_version` metadata to prompt outputs (prompt-runner side, but flagged as a requirement for Prompt Runner maintainers to consider)
- Extend `versionDetect.ts` to detect V3/V3.1 by explicit version field first, structural heuristics second
- Add Vitest unit tests for `versionDetect.ts` covering V1, V2, V3, and V3.1 sample payloads before the V3 mapping work begins
- Document the version taxonomy in CLAUDE.md so any agent working in this codebase knows the schema variants

**Phase:** extractionToCards V3 handling milestone.

---

### Pitfall 8: Zustand Store Reset Not Wired on Auth State Change

**What goes wrong:** A user logs out. The Supabase session is cleared. But the Zustand store still holds the previous user's module list, tenant ID, and cached run data. The next user to log in (or the same user logging in as a different test account) immediately sees stale data from the previous session.

**Why it happens:** Supabase's `onAuthStateChange` listener is set up to handle session restoration but not to clear application state on sign-out. Zustand stores have no built-in lifecycle tied to auth.

**Consequences:** In a demo tool where admin and client may be the same browser session switching accounts, this is a visible and confusing bug.

**Warning signs:**
- `onAuthStateChange` handler does not call store reset functions on `SIGNED_OUT` event
- Module list or run history still visible after logout and before next login

**Prevention:**
- In the Supabase auth listener, call a `resetAllStores()` function on `SIGNED_OUT`
- Design Zustand stores with explicit `reset()` actions from day one
- Test the sign-out flow as part of every auth milestone acceptance criteria

**Phase:** Supabase Auth integration milestone.

---

### Pitfall 9: Direct URL Shares Leak to Search Engines or Forwarded Accidentally

**What goes wrong:** `pulse.a360.com/share/abc123` is designed as a quick share link with no login required. A client forwards it. It gets indexed. The module content (even with synthetic data) is accessible to anyone. When real client data is eventually used, the share URLs become a data exposure vector.

**Why it happens:** "No login required" is the design goal for direct URL shares. The natural implementation is a fully public route — no token validation, no expiry, no referrer check.

**Consequences:** Pulse's demo content is exposed beyond the intended audience. If even a single real transcript is ever loaded into a share-accessible module, it becomes a potential PHI exposure.

**Prevention:**
- Direct URL shares must use opaque, unguessable tokens (UUID v4 minimum, not sequential IDs)
- Add link expiry: 7 days default, configurable by admin
- Log every share link access (IP, timestamp, user agent) in Pulse's Supabase project
- Add a "deactivate link" button in the admin module from day one
- Never allow share links to modules that display patient-identifying data — enforce this constraint in the module configuration schema

**Phase:** Direct URL share mode milestone.

---

### Pitfall 10: Parallel Card Implementations Diverge Permanently

**What goes wrong:** The codebase already has three card rendering paths: `src/shared/cards/intelligence/` (the canonical library), the inline `CardRenderer` in `RunDetail.tsx`, and `src/modules/runs/components/AgentViewer/` (an alternative set). Adding the multi-tenant sharing milestone introduces a fourth path (module-specific card overrides for branding). Fixes to the shared card library do not propagate to the other paths.

**Why it happens:** Each path was created for a slightly different need at a different time. Without a canonical-card-set rule, new developers and AI agents create a new component rather than extend an existing one.

**Consequences:** The same bug (e.g., `ObjectionsCard` React key collision from CONCERNS.md) must be fixed in three places. Branding overrides applied to one path don't apply to others.

**Prevention:**
- Establish canonical card set rule before the multi-tenant milestone: all card rendering goes through `src/shared/cards/intelligence/`. Period.
- Migrate `RunDetail.tsx` inline `CardRenderer` to use shared cards before adding any new card features
- Remove or deprecate `AgentViewer/` before the sharing milestone to eliminate the third path
- Document the rule in `agents.md`: "Add new card types to `src/shared/cards/intelligence/` before wiring into any renderer. Never create module-local card components."

**Phase:** Card consolidation milestone, must complete before multi-tenant module sharing.

---

## Minor Pitfalls

Mistakes that add friction or technical debt but don't block functionality.

---

### Pitfall 11: No Test Coverage Makes Card Mapping Regressions Silent

**What goes wrong:** A change to `extractionToCards.ts` or `runOutputToCards.ts` breaks a card mapping for a specific data shape. Because there are no tests (CONCERNS.md confirms zero test files), the regression is only caught when a human runs a specific transcript through the Simulator and notices a missing card.

**Prevention:**
- Add Vitest as a dev dependency in the first infrastructure milestone
- Write unit tests for all pure transformation functions before adding V3 support
- High-priority test targets: `versionDetect.ts`, `normalize.ts`, `extractionToCards.ts`, `runOutputToCards.ts`

**Phase:** Infrastructure / developer tooling milestone (can run parallel to auth work).

---

### Pitfall 12: Hardcoded Colors Break Branding Customization

**What goes wrong:** Pulse's per-user branding (logo, colors) requires the theme to be dynamically configurable. But seven files use hardcoded hex values instead of theme tokens (CONCERNS.md documents each). When a user's brand color is applied, card backgrounds and layout elements don't update because they're not reading from the theme.

**Prevention:**
- Replace all hardcoded hex values with `theme.palette.*` tokens before implementing the branding customization feature
- This is a prerequisite for the module customization milestone, not a post-launch cleanup item

**Phase:** Complete during card library polish milestone, before module customization work.

---

### Pitfall 13: Bundle Size Blocks Demo on Slow Networks

**What goes wrong:** The 961KB single bundle (CONCERNS.md) means ~3-4 seconds of blank screen on a typical hotel/conference WiFi before a demo starts. The client's first impression of a "production-ready" platform is a loading spinner.

**Prevention:**
- Add `manualChunks` to `vite.config.ts` before any milestone demo: `vendor-mui`, `vendor-charts`, `vendor-dnd`
- Enable React `lazy()` + `Suspense` for module routes so each module loads independently
- This is a one-hour fix; schedule it as a pre-demo checklist item

**Phase:** Any milestone before the first external client demo.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| CLAUDE.md / agents.md creation | Prompt Runner constraint not documented → AI agents touch it | Make hands-off rule the first item, use explicit "NEVER" language |
| Supabase schema setup | RLS enabled late or tested via SQL editor only | Enable RLS at table creation; test via client SDK as non-admin user |
| Supabase Auth integration | service_role key ends up in VITE_ env var | Enforce anon-key-only rule; service_role never touches the frontend |
| Auth integration | Store not reset on SIGNED_OUT event | Wire `resetAllStores()` to `onAuthStateChange` from day one |
| Module access control | Two roles grows to five | Lock to admin/user in PROJECT.md; defer everything else explicitly |
| Direct URL share mode | Public route indexed or forwarded beyond intent | UUID tokens, expiry, access logging, deactivate button |
| Module customization / branding | Hardcoded colors don't respond to theme changes | Replace hex values before writing branding code |
| extractionToCards V3 support | Version detection misidentifies V3 as V2 | Add explicit version field; add unit tests before mapping work |
| Card library consolidation | Third parallel card set created for modules | Canonical card rule in agents.md; deprecate AgentViewer first |
| First external client demo | 961KB bundle causes slow first load | Add Vite code splitting before any live demo |

---

## Sources

- [Supabase RLS Best Practices: Production Patterns for Secure Multi-Tenant Apps](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [6 Common Supabase Auth Mistakes and Fixes](https://startupik.com/6-common-supabase-auth-mistakes-and-fixes/)
- [Supabase Security: Exposed Anon Keys, RLS, and Misconfigurations](https://www.stingrai.io/blog/supabase-powerful-but-one-misconfiguration-away-from-disaster)
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Enforcing Row Level Security in Supabase: Multi-Tenant Architecture](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2)
- [Multi-Tenancy in React Applications: Complete Implementation Guide](https://clerk.com/articles/multi-tenancy-in-react-applications-guide)
- [Tenant Data Isolation: Patterns and Anti-Patterns](https://propelius.tech/blogs/tenant-data-isolation-patterns-and-anti-patterns/)
- [Multi-Tenant SaaS with React and Node.js in 2026](https://dev.to/waqarhabib/building-a-multi-tenant-saas-app-with-react-and-nodejs-in-2026-31ih)
- [Supabase Docs: Understanding API Keys](https://supabase.com/docs/guides/api/api-keys)
- Codebase audit: `.planning/codebase/CONCERNS.md` (2026-03-27) — direct source for pitfalls 7, 10, 11, 12, 13
