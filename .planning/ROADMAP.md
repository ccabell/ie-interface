# Roadmap: A360 Pulse

## Overview

A360 Pulse transforms the existing ie-interface prototype into a professional, shareable module platform. The work runs in four phases: first consolidating the brownfield codebase into a single canonical card path with full production parity; then wiring Supabase Auth and creating the schema that everything else depends on; then adding route guards, module assignments, and per-user data filtering; and finally updating the deployment to match the new identity and verify the live proxy. Each phase delivers a coherent, verifiable capability before the next begins.

**Critical constraint carried through all phases:** Prompt Runner is read-only. Nothing in any phase modifies the Railway backend, its Supabase project, or its API response shape. Pulse only reads.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundations** - Consolidate the codebase, achieve full card parity, and establish the project identity and CLAUDE.md rules before any auth work begins
- [ ] **Phase 2: Auth + Supabase Setup** - Install Supabase Auth, create the Pulse Supabase project and schema, and establish a stable session that all subsequent phases depend on
- [ ] **Phase 3: Module Access + Data Filtering** - Wire route guards and dashboard filtering from Supabase assignments, then apply per-user data context to all Prompt Runner API calls
- [ ] **Phase 4: Deploy + Verify** - Promote the Vercel deployment to A360 Pulse branding, inject Supabase env vars, and confirm the read-only proxy still routes correctly

## Phase Details

### Phase 1: Foundations
**Goal**: The codebase has a single canonical card rendering path, all intelligence cards render with production fidelity, theme tokens replace hardcoded values everywhere, and the project is named A360 Pulse with a CLAUDE.md that makes the Prompt Runner hands-off rule impossible to miss
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, CARD-01, CARD-02, CARD-03
**Success Criteria** (what must be TRUE):
  1. Opening the extraction module renders all 11 intelligence cards with real V3/V3.1 data — no blank cards, no fallback placeholders for missing card types
  2. Every intelligence card uses MDChip (soft variant) where chips appear — no MUI Chip instances remain in shared/cards
  3. A developer reading the codebase finds one card renderer (src/shared/cards/intelligence/) — the AgentViewer parallel set is gone or unified
  4. The project is named "A360 Pulse" in package.json and the browser tab title; CLAUDE.md exists with "PROMPT RUNNER IS HANDS-OFF" as the first rule
  5. No hardcoded hex values remain in shared/cards — all colors reference theme.palette tokens
**Plans**: TBD
**UI hint**: yes

### Phase 2: Auth + Supabase Setup
**Goal**: Users can log in with email and password, their session persists across refreshes, and the Pulse Supabase project exists with profiles, user_module_access, and share_tokens tables protected by RLS — the foundation every subsequent phase queries
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, MOD-01, DEPLOY-01
**Success Criteria** (what must be TRUE):
  1. A user navigating to any Pulse route while unauthenticated is redirected to /login
  2. A user who logs in with valid email and password lands on the dashboard and stays logged in after a hard page refresh
  3. A user who clicks Log Out is signed out and redirected to /login; returning to any protected route requires logging in again
  4. Auth state (session, user, initialized flag) lives in the Zustand authStore — no React Context or component-local state holds auth
  5. The Pulse Supabase project exists as a separate project from Prompt Runner's Supabase; profiles, user_module_access, and share_tokens tables exist with RLS enabled and cross-user isolation verified via the JS client (not the SQL editor)
**Plans**: TBD
**UI hint**: yes

### Phase 3: Module Access + Data Filtering
**Goal**: Each logged-in user sees only the modules assigned to them, route guards block access to unassigned modules, and every Prompt Runner API call is filtered so users see only their scoped data — not all 122 transcripts or all 94 runs
**Depends on**: Phase 2
**Requirements**: MOD-02, MOD-03, MOD-04, MOD-05, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. A regular user's dashboard shows only the module cards that an admin has assigned to them in Supabase Studio — unassigned modules do not appear
  2. A regular user who manually navigates to an unassigned module URL is redirected (not shown a JS error or blank page)
  3. Chris (admin user, is_admin = true in profiles) sees all modules regardless of assignment records
  4. Module assignments can be created and removed via Supabase Studio without any code change
  5. A user with a restricted data context (specific practice or run IDs) sees only matching Prompt Runner results — they cannot see runs or transcripts outside their assigned scope
**Plans**: TBD

### Phase 4: Deploy + Verify
**Goal**: The live Vercel deployment reflects the A360 Pulse identity, connects to the Pulse Supabase project via environment variables, and the read-only Prompt Runner proxy continues to route correctly after all changes
**Depends on**: Phase 3
**Requirements**: DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. The live Vercel URL shows "A360 Pulse" branding (title, favicon, any visible name) — no references to "ie-interface" remain in the deployed app
  2. The Supabase anon key and project URL are present as Vercel environment variables; no service_role key is present in any VITE_* variable
  3. /api/* requests from the deployed app continue to proxy to Prompt Runner and return data — the proxy was not broken by the deployment changes
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations | 0/TBD | Not started | - |
| 2. Auth + Supabase Setup | 0/TBD | Not started | - |
| 3. Module Access + Data Filtering | 0/TBD | Not started | - |
| 4. Deploy + Verify | 0/TBD | Not started | - |
