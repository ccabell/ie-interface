# Project Research Summary

**Project:** A360 Pulse — Multi-Tenant Module Sharing
**Domain:** Invite-only modular demo and analytics sharing platform (React SPA + Supabase Auth)
**Researched:** 2026-03-27
**Confidence:** HIGH

---

## Executive Summary

A360 Pulse is an invite-only, admin-managed platform for sharing specific AI intelligence modules with a small set of external users (5-20 clients, partners, stakeholders). It is not a general SaaS product and should not be built like one. The correct mental model is a professional demo tool with persistent identities and controlled data scoping — closer to an embedded analytics viewer than a multi-tenant application. Experts build this kind of platform with a minimal auth layer (Supabase Auth), a junction-table-based access control model backed by Row Level Security, and a custom share-token table for direct URL sharing. One new npm dependency (`@supabase/supabase-js` 2.x) covers the entire auth and database need.

The recommended approach is to build in strict dependency order: auth foundation first, route guards second, Supabase schema and admin tooling third, then per-user module filtering and share links in parallel, and finally customization and data proxy filtering. Every phase depends on the session state established in Phase 1. The architecture deliberately keeps Prompt Runner (the existing Railway backend) read-only and untouched — Pulse is a consumer that applies its own data filters client-side, not an owner that modifies the upstream API. The Zustand store is the integration point between auth state and the API layer, consistent with the existing codebase.

The primary risks are security misconfigurations (service_role key exposed client-side, RLS enabled too late or tested incorrectly) and architectural scope creep (a two-role system growing into a full RBAC implementation). Both are entirely preventable by establishing clear rules before the first line of code is written. A secondary risk specific to this codebase is the existence of parallel card rendering paths and a fragmented component library — these technical debts must be consolidated before the multi-tenant module sharing work begins, or branding customization will require fixes in multiple places.

---

## Key Findings

### Recommended Stack

The existing stack requires exactly one new dependency. `@supabase/supabase-js` v2.100.1 (published March 2026) is the current, official, actively maintained Supabase client for Vite/React SPAs. The previously common `@supabase/auth-helpers-react` was deprecated in April 2024 and must not be used. The SSR-focused `@supabase/ssr` package is not applicable — Pulse has no server rendering.

All auth state flows through a Zustand auth store (`authStore`), consistent with the existing codebase preference for Zustand over React Context for global state. React Context is used only for the initial `AuthProvider` wrapper that listens to `onAuthStateChange`. The Supabase client is a singleton in `src/auth/supabase.ts` — nothing outside that directory imports it directly.

**Core technologies:**
- `@supabase/supabase-js` 2.x: auth, database queries, storage — the only new package required
- Zustand 5.0 (already installed): auth store (`session`, `user`, `allowedModuleIds`, `dataFilters`, `customization`)
- React Router v7 (already installed): route guards as layout routes wrapping module routes
- Supabase PostgreSQL + RLS: four tables (`profiles`, `user_module_access`, `user_module_preferences`, `share_tokens`)

**Critical version note:** Use `@supabase/supabase-js` 2.100.1 or later. Do not install `@supabase/auth-helpers-react` (deprecated) or `@supabase/ssr` (SSR-only).

### Expected Features

The feature set is tightly constrained by the platform's nature: 5-20 known users, no self-serve registration, admin-managed access, read-only data source. Features are evaluated against this context, not general SaaS expectations.

**Must have (table stakes):**
- Supabase Auth via email invite / magic link — stable identity without open registration
- Module assignment per user, enforced by RLS — unassigned modules are invisible, not forbidden
- Dashboard gated by assignments — the existing `HomePage.tsx` card grid filtered by `user_module_access` query
- Direct share URL (`/share/:token`) requiring no login — fastest path to demo value
- Admin user CRUD (create, assign, deactivate) — Supabase Studio is acceptable for MVP, in-app UI is a differentiator
- Per-user data context (filter params applied to Prompt Runner API calls) — users must not see each other's data
- Basic branding per user (logo override in shell nav) — clients expect to see their own branding

**Should have (differentiators):**
- In-app admin module (user list, module assignment, share token management) — removes dependency on Supabase Studio
- Share link expiry with admin-configurable duration — professional hygiene for demos
- One-click share button on module header — operator UX improvement
- Last-accessed timestamps on module assignments — demo follow-up visibility
- Color theme override per user (primary color into MUI ThemeProvider) — stronger client branding

**Defer to v2+:**
- Per-module customization override (user-level is sufficient until proven otherwise)
- Email notifications for new module assignments
- Audit log UI (last-accessed timestamps cover practical need)
- Real-time collaboration, shared sessions
- Write-back to Prompt Runner

**Hard anti-features (never build):**
- Self-serve user registration
- Role hierarchy beyond admin/user
- User-controlled module preferences (admin controls all configuration)

### Architecture Approach

The architecture uses two cleanly separated data sources (Supabase for identity/permissions, Prompt Runner for content), a Zustand auth store as the central integration point, and route guards that live in the router tree rather than inside module components. This keeps modules unaware of access control — they receive already-filtered data and render it. The share link path bypasses `AuthGuard` entirely but performs its own token validation, writing a `shareContext` to the auth store that the API layer reads in place of user-level data filters.

**Major components:**
1. `src/auth/` — Supabase client singleton, `AuthProvider`, `useAuth` hook, guard components; nothing outside this boundary imports Supabase directly
2. `src/store/authStore.ts` — Zustand store holding session, user, `allowedModuleIds`, `dataFilters`, `customization`, `shareContext`, and `initialized` flag
3. `src/auth/guards/` — `AuthGuard` (session check) and `ModuleGuard` (assignment check), composed in the router tree in `App.tsx`
4. Supabase schema (Pulse-owned project) — `profiles`, `user_modules`, `share_tokens` tables with RLS policies
5. `src/shared/api/` data proxy layer — existing API modules extended to read `authStore.dataFilters` and apply client-side filtering before returning data to modules
6. `src/modules/admin/` — protected admin module with UserList, UserDetail, and ShareTokens pages

**Key architectural decisions:**
- Client-side data filtering is intentional and acceptable at this scale (5-20 users); Prompt Runner is read-only and cannot be modified
- Custom `share_tokens` table (not Supabase magic links or `signInAnonymously()`) — magic links are one-time-use, anonymous sessions are device-local, neither is stable enough for a reusable share URL
- `authStore.initialized` flag prevents route guards from redirecting before session hydration (eliminates flash-of-wrong-state)
- `is_admin` boolean on `profiles` (not a Postgres role) — simpler for this scale, avoids Supabase role complexity

### Critical Pitfalls

1. **Touching Prompt Runner** — Any change to the Railway backend, its Supabase project, or its response shape breaks multiple downstream consumers simultaneously. Establish "PROMPT RUNNER IS HANDS-OFF — READ ONLY" as the first rule in CLAUDE.md before any Supabase work begins. Create a typed `PromptRunnerApiClient` wrapper to make the read-only boundary visually explicit.

2. **service_role key exposed in the frontend** — `VITE_*` env vars are bundled into client-side JavaScript at build time. The service_role key bypasses all RLS. Only `VITE_SUPABASE_ANON_KEY` belongs in the frontend. Enable RLS on every table before writing any data to them. Security comes from RLS policies, not from hiding the anon key.

3. **RLS policies tested via SQL Editor** — The Supabase SQL editor runs as the postgres superuser and bypasses RLS entirely. Policies that appear to work in the editor may silently fail in production. Test every isolation policy by signing in as a non-admin test user via the Supabase JS client SDK.

4. **Zustand store not reset on SIGNED_OUT** — Auth state including module assignments and data filters persists across sign-out/sign-in cycles. Wire a `resetAllStores()` call to the `SIGNED_OUT` event in `onAuthStateChange` from day one. Design every Zustand store with an explicit `reset()` action.

5. **Permission system scope creep** — "Just add a boolean flag" is how a two-role system becomes five roles and a custom RBAC implementation. Lock the model to admin/user + module assignment for the entire first version. Document this explicitly in PROJECT.md as out-of-scope.

---

## Implications for Roadmap

The build order is dictated by hard dependencies. Auth state must exist before guards can evaluate it. Guards must exist before module access can be enforced. The Supabase schema must exist before user assignments can be created. Per-user filtering depends on the schema. Share links depend on both the schema and the filtering logic. This is not a preference — it is a dependency chain.

Two existing codebase issues must be addressed before the multi-tenant work begins, or they will compound: the parallel card rendering paths (three distinct renderers that don't share fixes) and the hardcoded hex values in seven files (which will break per-user branding). These are prerequisite cleanup items, not polish.

### Phase 1: Codebase Foundations (Prerequisite)

**Rationale:** Two existing issues block the multi-tenant milestone: parallel card rendering paths mean branding fixes won't propagate everywhere, and hardcoded hex values mean per-user color theming won't work. Must be resolved before any auth or customization work starts.
**Delivers:** Single canonical card rendering path (`src/shared/cards/intelligence/`), all hardcoded hex values replaced with `theme.palette.*` tokens, Vitest installed with unit tests for `versionDetect.ts` and card mapping functions, CLAUDE.md rule established that Prompt Runner is hands-off.
**Addresses:** CONCERNS.md-identified debt (parallel card sets, MDChip not wired, hardcoded colors), Pitfall 1 (Prompt Runner), Pitfall 10 (parallel card implementations), Pitfall 12 (hardcoded colors).
**Research flag:** Standard patterns — no research phase needed.

### Phase 2: Auth Foundation

**Rationale:** Everything else depends on session state. No guard, no module filter, no share link works without a stable auth store. This phase must be complete and confirmed working before any other phase begins.
**Delivers:** Supabase client singleton, `AuthProvider` with `onAuthStateChange`, `authStore` (session + user + initialized), login page at `/login`, logout action with `resetAllStores()` wired to `SIGNED_OUT`.
**Uses:** `@supabase/supabase-js` 2.x (the only new install), Zustand 5.0 (existing), React Router v7 (existing).
**Avoids:** Pitfall 2 (service_role key in frontend), Pitfall 8 (store not reset on sign-out).
**Research flag:** Well-documented official pattern — no research phase needed.

### Phase 3: Supabase Schema + RLS

**Rationale:** The schema must exist before user assignments can be created or route guards can query them. RLS must be enabled at table creation time, before any data is inserted — enabling it after exposes a validation gap.
**Delivers:** `profiles`, `user_modules`, `share_tokens` tables with RLS policies enabled at creation. Indexes on `user_id` columns and partial index on `share_tokens.token where is_active = true`. Two test users created and cross-user isolation verified via Supabase JS client (not SQL editor).
**Avoids:** Pitfall 3 (RLS enabled after data, tested via SQL editor only).
**Research flag:** Official Supabase docs cover this directly — no research phase needed.

### Phase 4: Route Guards + Module Access Control

**Rationale:** With auth state stable and schema in place, guards can be wired. Guards live in the router tree in `App.tsx`, not inside module components — this is the architectural rule that keeps modules clean.
**Delivers:** `AuthGuard` and `ModuleGuard` components, `ForbiddenPage`, guards composed into `App.tsx` router tree. `AuthProvider` extended to fetch `user_modules` after session resolves, populating `allowedModuleIds` in the store. Dashboard card grid filtered by assignments.
**Implements:** Route guard architecture component, module registry filtering in App.tsx.
**Avoids:** Pitfall 4 (tenant context leaking between navigations), Pitfall 5 (two roles growing to five — lock admin/user here).
**Research flag:** Standard React Router + Supabase pattern — no research phase needed.

### Phase 5: Admin Module

**Rationale:** Before external users can be given access, an admin must be able to create them and assign modules. Supabase Studio covers MVP, but the in-app admin module is required for ongoing operation without developer intervention.
**Delivers:** `src/modules/admin/` with UserList, UserDetail (assign modules, set data_filters, upload logo), and ShareTokens pages. Admin module gated by `is_admin` flag. Supabase service-role operations via Vercel Edge Function (service key never touches the browser).
**Avoids:** Pitfall 2 (service_role key in frontend — admin mutations go through server-side function).
**Research flag:** Needs validation of Vercel Edge Function pattern for Supabase admin API calls — consider a light research pass on the specific invocation pattern.

### Phase 6: Data Proxy + Per-User Filtering

**Rationale:** With user assignments working, data isolation becomes the priority — users must not see each other's Prompt Runner data. The proxy layer extends existing API modules; it does not replace them.
**Delivers:** `src/shared/api/dataProxy.ts` helper, `runs.api.ts` and `transcripts.api.ts` extended to read `authStore.dataFilters` and apply client-side filtering. `UserDataFilters` shape defined in `authStore`. Verified: user with `transcript_ids: ['abc']` sees only matching runs.
**Implements:** Data proxy layer architecture component.
**Research flag:** Standard pattern for this scale — no research phase needed. Note gap: Prompt Runner API surface for filtering (which query params are available) needs verification against actual endpoints before implementation.

### Phase 7: Share Links

**Rationale:** Direct URL sharing is the highest-value external-facing feature. It depends on the schema (Phase 3) and the filtering logic (Phase 6) both being in place.
**Delivers:** `src/modules/share/ShareRoute.tsx`, `/share/:token` route outside `AuthGuard`, token lookup via anon Supabase client, `shareContext` written to `authStore`, module rendered with `shareContext.data_filters`. Admin share token creation in admin module (Phase 5). UUID v4 tokens, `expires_at` column, access logging, deactivate button.
**Avoids:** Pitfall 9 (share links indexed or forwarded beyond intent).
**Research flag:** Standard pattern — no research phase needed.

### Phase 8: Customization + Branding

**Rationale:** Depends only on Phase 3 (profiles table) and Phase 1 (hex values already replaced with theme tokens). Can be started after Phase 4 if Phase 1 cleanup was thorough.
**Delivers:** Supabase Storage bucket `user-assets`, logo upload in admin UserDetail, `profiles.logo_url` loaded into `authStore.customization`, `Layout.tsx` renders logo in AppBar when set. Optional: `primary_color` injected into MUI ThemeProvider as `palette.primary.main`.
**Avoids:** Pitfall 12 (hardcoded colors — already resolved in Phase 1).
**Research flag:** No research needed. MUI v7 runtime theme override is well-documented.

### Phase 9: Bundle Optimization (Pre-Demo Gate)

**Rationale:** The current 961KB single bundle causes 3-4 second blank screens on typical demo WiFi. This must be resolved before any external client sees the platform.
**Delivers:** `manualChunks` in `vite.config.ts` (vendor-mui, vendor-charts, vendor-dnd), React `lazy()` + `Suspense` for module routes.
**Avoids:** Pitfall 13 (bundle size blocks demo on slow networks).
**Research flag:** Vite code splitting is standard — no research phase needed.

### Phase Ordering Rationale

- Phase 1 (Foundations) is prerequisite, not optional — parallel card paths and hardcoded colors will cause rework in later phases if not resolved first
- Phase 2 (Auth) must be stable before any other phase can be tested — session state is the dependency of all dependencies
- Phase 3 (Schema) must precede Phase 4 (Guards) because guards query the schema
- Phase 4 (Guards) and Phase 5 (Admin) can overlap once Phase 3 is complete
- Phase 6 (Data Proxy) can run in parallel with Phase 5 once Phase 4 is done
- Phase 7 (Share Links) requires both Phase 5 and Phase 6 to be complete
- Phase 8 (Branding) is independent after Phase 3, but the Phase 1 hardcoded-color fix is its prerequisite
- Phase 9 (Bundle) should be inserted before any live external demo, regardless of where in the sequence that falls

### Research Flags

Phases needing deeper research during planning:
- **Phase 5 (Admin Module):** Verify the exact Vercel Edge Function invocation pattern for Supabase admin API calls (service-role key server-side). The pattern is established but the specific wiring for this project's Vercel setup needs a targeted look.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 2:** Official Supabase + React quickstart covers this exactly
- **Phase 3:** Official Supabase RLS docs are authoritative
- **Phase 4:** React Router v7 layout route guards are documented
- **Phase 6:** Client-side filtering from Zustand store is straightforward
- **Phase 7:** Custom token table pattern is well-established in community sources
- **Phase 8:** MUI v7 runtime theme is documented
- **Phase 9:** Vite `manualChunks` is standard

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `@supabase/supabase-js` v2.100.1 verified on npm March 2026; deprecation of auth-helpers confirmed via official notice; all other technologies already installed and in use |
| Features | HIGH for table stakes and anti-features; MEDIUM for differentiators | Table stakes driven by explicit PROJECT.md constraints (no self-serve, read-only, 5-20 users); differentiators inferred from embedded analytics platform patterns |
| Architecture | HIGH | Core patterns (Supabase RLS + auth.uid(), custom share tokens, Zustand for auth state) are verified against official Supabase docs; React Router guard pattern is community-confirmed |
| Pitfalls | HIGH | Five of thirteen pitfalls sourced directly from codebase audit (CONCERNS.md); remainder from confirmed Supabase documentation and community sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Prompt Runner API surface for filtering:** The data proxy layer (Phase 6) needs to know which query parameters Prompt Runner actually accepts. Before implementation, verify actual `/runs` and `/transcripts` endpoint parameters against the Railway API. The client-side fallback filter works regardless, but server-side param filtering is cleaner if the API supports it.
- **Vercel Edge Function for admin operations:** The pattern for calling the Supabase admin API (user invite, service-role mutations) via a Vercel serverless function needs a targeted verification pass before Phase 5 begins. The approach is standard, but the specific project setup (Vite + Vercel, not Next.js) has fewer documented examples.
- **Supabase Storage bucket behavior for logos:** The `user-assets` bucket RLS configuration (authenticated read for own assets, admin read-all) is a standard pattern but should be verified during Phase 8 setup before any logo upload UI is wired.

---

## Sources

### Primary (HIGH confidence)
- [@supabase/supabase-js npm — v2.100.1, March 2026](https://www.npmjs.com/package/@supabase/supabase-js)
- [Supabase Auth Helpers Deprecation Notice](https://github.com/supabase/auth-helpers/blob/main/DEPRECATED.md)
- [Supabase Row Level Security — Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Custom Claims and RBAC — Official Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Auth with React — Official Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Anonymous Sign-Ins — Official Docs](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase JSONB Guide](https://supabase.com/docs/guides/database/json)
- [Supabase Storage Quickstart — Official Docs](https://supabase.com/docs/guides/storage/quickstart)
- [Supabase API Keys — Official Docs](https://supabase.com/docs/guides/api/api-keys)
- Codebase audit: `.planning/codebase/CONCERNS.md` (2026-03-27) — direct source for pitfalls 7, 10, 11, 12, 13

### Secondary (MEDIUM confidence)
- [Supabase RLS Best Practices (makerkit.dev)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — RLS policy performance, `(select auth.uid())` subquery form
- [6 Common Supabase Auth Mistakes (startupik.com)](https://startupik.com/6-common-supabase-auth-mistakes-and-fixes/) — service_role key exposure
- [Multi-Tenant Applications with RLS on Supabase (AntStack)](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [React Router v7 Private Routes Pattern (robinwieruch.de)](https://www.robinwieruch.de/react-router-private-routes/)
- [React Router v7 + Supabase Auth Example (brainicorn/reactrouter7-auth-example)](https://github.com/brainicorn/reactrouter7-auth-example)
- [Supabase Zustand Integration (restack.io)](https://www.restack.io/docs/supabase-knowledge-supabase-zustand-integration)
- [Tenant Data Isolation Patterns and Anti-Patterns (propelius.tech)](https://propelius.tech/blogs/tenant-data-isolation-patterns-and-anti-patterns/)
- [Knowi: Build Multi-Tenant Embedded Analytics](https://www.knowi.com/blog/build-multi-tenant-embedded-analytics/)
- [Frontegg: SaaS Multitenancy Best Practices](https://frontegg.com/blog/saas-multitenancy)

---

*Research completed: 2026-03-27*
*Ready for roadmap: yes*
