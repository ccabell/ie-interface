# Architecture Patterns: Multi-Tenant Module Sharing

**Domain:** Modular React SPA with Supabase-backed auth and per-user access control
**Researched:** 2026-03-27
**Overall confidence:** HIGH — patterns are well-established in the Supabase + React ecosystem

---

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────┐  │
│  │  Pulse SPA   │    │  Auth + Permission Layer             │  │
│  │  (React 19)  │◄───│  Zustand authStore (session, perms)  │  │
│  └──────┬───────┘    └──────────────────────────────────────┘  │
│         │                         │                             │
│  ┌──────▼───────┐    ┌────────────▼─────────────────────────┐  │
│  │  Module      │    │  Supabase JS Client                  │  │
│  │  Registry    │    │  (auth + DB queries)                 │  │
│  │  (filtered)  │    └────────────────────────────────────── │  │
│  └──────┬───────┘                                             │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────────────┐  │
│  │  Route Layer (React Router v7)                           │  │
│  │  AuthGuard → PermissionGuard → Module Route              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────┬────────────────────────┘
                     │                  │
          ┌──────────▼─────┐  ┌─────────▼───────────┐
          │  Supabase       │  │  Prompt Runner       │
          │  (Pulse-owned)  │  │  (READ-ONLY)         │
          │  - Auth         │  │  - runs              │
          │  - profiles     │  │  - transcripts       │
          │  - user_modules │  │  - agents            │
          │  - share_tokens │  │  - prompt_sets       │
          │  - Storage      │  └──────────────────────┘
          └─────────────────┘
```

### Two Data Sources — Never Mixed

Pulse reads from exactly two backends. They have separate concerns and separate API clients.

| Source | What Pulse Reads | Client |
|--------|-----------------|--------|
| **Supabase** (Pulse-owned) | Users, sessions, module permissions, share tokens, customizations, logos | `@supabase/supabase-js` direct client |
| **Prompt Runner** (read-only) | Runs, transcripts, agents, prompt sets | Existing `src/shared/api/client.ts` (Axios + proxy) |

The Prompt Runner API client never receives auth headers from Supabase. Data filtering for Prompt Runner access is enforced client-side in Pulse (see Data Proxy Layer section below).

---

## Component Boundaries

### 1. Auth Layer (New)

**Location:** `src/auth/`

**Responsibility:** Wrap the Supabase client, expose auth state via Zustand, provide the `AuthProvider` React context.

**Communicates with:** Supabase JS client (outbound), Zustand `authStore` (writes session + user), route guards (reads session).

**Boundary rule:** Nothing outside `src/auth/` imports the Supabase client directly. All auth operations go through this layer.

```
src/auth/
├── supabase.ts          # createClient() — single Supabase instance for the app
├── AuthProvider.tsx     # React context: initializes onAuthStateChange listener
├── useAuth.ts           # Hook: reads from authStore (session, user, perms, loading)
└── types.ts             # PulseUser, UserPermissions, ShareToken types
```

### 2. Zustand Auth Store (New)

**Location:** `src/store/authStore.ts`

**Responsibility:** Hold session, user profile, and resolved module permissions. Updated exclusively by `AuthProvider` via `onAuthStateChange`.

**Communicates with:** `AuthProvider` (writes), route guards (reads), `ModuleRegistry` filtering logic (reads).

**State shape:**

```typescript
interface AuthState {
  session: Session | null;
  user: PulseUser | null;               // profile + metadata from Supabase
  allowedModuleIds: string[];           // e.g. ['extraction', 'runs']
  dataFilters: UserDataFilters;         // which transcripts/runs the user can see
  customization: UserCustomization;     // logo URL, display name overrides
  shareContext: ShareContext | null;    // populated when entering via share link
  loading: boolean;
  initialized: boolean;
}
```

The store is initialized once at app startup. Route guards read `initialized` before evaluating access — they wait rather than redirect on initial load to prevent flash-of-wrong-state.

### 3. Route Guard Components (New)

**Location:** `src/auth/guards/`

**Two guards — used in combination:**

```
src/auth/guards/
├── AuthGuard.tsx        # Requires authenticated session (redirects to /login if not)
└── ModuleGuard.tsx      # Requires module in allowedModuleIds (redirects to /403 if not)
```

**Pattern:** Guards wrap module routes in the router tree, not inside modules. Modules remain unaware of access control.

```typescript
// src/App.tsx router construction — guards compose around existing moduleToRoutes() output
{
  element: <AuthGuard />,
  children: [
    {
      element: <ModuleGuard moduleId="extraction" />,
      children: moduleToRoutes(extractionModule),
    },
    {
      element: <ModuleGuard moduleId="runs" />,
      children: moduleToRoutes(runsModule),
    },
    // ...
  ],
}
```

**Share routes are exempt from AuthGuard** — they sit outside the `<AuthGuard>` wrapper but still validate their own token.

### 4. Extended Module Registry (Modified)

**Location:** `src/shell/ModuleRegistry.ts` — extend, do not rewrite.

**Change:** `TestModule` interface gains an `id` (already present) that is matched against `allowedModuleIds`. `HomePage` and `Layout` receive the filtered module list already resolved by `App.tsx`.

**Pattern:** Filtering happens in `App.tsx` before passing modules to the shell:

```typescript
// App.tsx
const allModules = [extractionModule, runsModule, opportunitiesModule, dashboardModule, adminModule];
const visibleModules = allModules.filter(m => allowedModuleIds.includes(m.id) || m.id === 'admin');
// Shell receives visibleModules — no guard logic inside shell components
```

This preserves the existing shell contract: shell components render whatever they receive, they do not gate access themselves.

### 5. Supabase Schema (New)

**Lives in Supabase Pulse project — no schema changes to Prompt Runner.**

```sql
-- User profile extending Supabase auth.users
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  practice_id  text,          -- mirrors A360 practice structure loosely
  logo_url     text,          -- path in Supabase Storage
  data_filters jsonb,         -- { transcript_ids: [...], run_ids: [...], practice_filter: '...' }
  is_admin     boolean default false,
  created_at   timestamptz default now()
);

-- Module access assignment
create table public.user_modules (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  module_id text not null,    -- matches TestModule.id
  granted_at timestamptz default now(),
  granted_by uuid references public.profiles(id),
  unique(user_id, module_id)
);

-- Share tokens for direct URL mode
create table public.share_tokens (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null default encode(gen_random_bytes(24), 'base64url'),
  module_id    text not null,
  created_by   uuid references public.profiles(id),
  data_filters jsonb,         -- what data this share can see
  expires_at   timestamptz,   -- null = no expiry
  created_at   timestamptz default now()
);
```

**RLS policies:** `profiles` readable by owner + admin. `user_modules` readable by the user it belongs to + admin. `share_tokens` readable by `anon` role (for public share access, limited to token lookup by token value only).

### 6. Share Link Architecture

**Decision: Custom tokens over Supabase magic links.**

Supabase magic links are one-time-use and expire in 1 hour — unsuitable for share links that need to work repeatedly. Supabase anonymous sign-ins persist a single device session but cannot be shared. The right approach is a custom short-lived token stored in the `share_tokens` table.

**Share link flow:**

```
/share/:token
     │
     ▼
ShareRoute component (no AuthGuard)
     │
     ├── Look up token in share_tokens table (anon Supabase client)
     ├── If expired or not found → render ShareExpired page
     ▼
     │
     ├── Store shareContext in authStore (module_id + data_filters)
     ▼
     │
     └── Render the target module directly, bypassing normal auth
         Data filtering applied from shareContext.data_filters
```

**Share token URL format:** `/share/:token` — readable URL, token is a URL-safe base64 string (24 random bytes = 32 character token).

**Token generation:** Admin module calls a Supabase function to insert a `share_tokens` row and returns the `/share/:token` URL. Token is never derived from user identity — it is purely random.

**Expiry:** Tokens have an optional `expires_at`. The share route checks this client-side on load. For demo/review shares, no expiry is set. For time-sensitive shares, admin sets expiry.

### 7. Data Proxy Layer

**Prompt Runner is read-only and returns ALL data.** Pulse does not own or modify Prompt Runner's filtering behavior. Per-user data access is enforced in Pulse's own API wrapper layer.

**Location:** `src/shared/api/` — extend existing API modules, do not replace them.

**Pattern:** Every API function that can return filtered results checks `authStore.dataFilters` before returning data.

```typescript
// src/shared/api/runs.api.ts — extended
import { useAuthStore } from '@/store/authStore';

export async function listRuns(params?: RunListParams): Promise<Run[]> {
  const { dataFilters } = useAuthStore.getState();
  const response = await client.get<Run[]>('/runs', { params });

  if (dataFilters.transcript_ids?.length) {
    return response.data.filter(run =>
      dataFilters.transcript_ids.includes(run.transcript_id)
    );
  }
  return response.data;
}
```

**`UserDataFilters` shape (stored in `profiles.data_filters`):**

```typescript
interface UserDataFilters {
  transcript_ids?: string[];    // only show runs for these transcripts
  run_ids?: string[];           // explicit run allowlist (for tighter demos)
  practice_filter?: string;     // filter by practice name in run metadata
  // null values = no filter (admin sees everything)
}
```

**Tradeoff acknowledged:** This is client-side filtering — the Prompt Runner backend still receives all API calls. For 5-20 users in demo/prototype context this is acceptable. If Prompt Runner ever gains auth headers this layer can be upgraded to server-side without changing the consumer interface.

### 8. Customization Storage

**Location:** Supabase Storage bucket `user-assets`, with RLS.

**What is stored per user:**

| Asset | Storage Path | Table Column |
|-------|-------------|--------------|
| Practice logo | `user-assets/{user_id}/logo.{ext}` | `profiles.logo_url` |
| Display name override | n/a — stored directly in `profiles.display_name` | `profiles.display_name` |
| Data filters | n/a — stored in `profiles.data_filters` JSONB | `profiles.data_filters` |

**Bucket policy:** Authenticated users can read their own assets. Admin can read all. Uploads restricted to authenticated users for their own path only.

**In the UI:** `useAuth()` hook exposes `customization.logoUrl`. `Layout.tsx` conditionally renders the logo in the AppBar when `logoUrl` is set.

### 9. Admin Module

**Location:** `src/modules/admin/` — registered as a normal `TestModule`, gated by `is_admin: true`.

**Three pages:**

```
src/modules/admin/
├── index.tsx                   # TestModule descriptor (hidden from non-admins)
└── pages/
    ├── UserList.tsx            # List all users, click to edit
    ├── UserDetail.tsx          # Edit profile, assign modules, set data_filters
    └── ShareTokens.tsx         # List active share tokens, create new, revoke
```

**Admin guard:** `ModuleGuard` for `admin` module checks `user.is_admin` in addition to module assignment. Non-admin users who somehow navigate to `/admin` get the 403 page.

**Admin data access:** Admin module queries Supabase directly (bypassing Prompt Runner). It reads `profiles`, `user_modules`, and `share_tokens` tables. All mutations write back to those tables.

---

## Data Flow

### 1. App Startup / Auth Initialization

```
main.tsx
  └── App.tsx mounts
        └── AuthProvider useEffect
              ├── supabase.auth.onAuthStateChange(event, session) registers
              ├── Initial INITIAL_SESSION event fires
              ├── If session → fetch profiles + user_modules from Supabase
              ├── Write to authStore: { session, user, allowedModuleIds, dataFilters, ... }
              └── authStore.initialized = true

App.tsx reads initialized from authStore
  ├── false → render loading spinner (no route evaluation yet)
  └── true → filter modules, construct router, render app
```

### 2. Protected Module Route Access

```
User navigates to /runs
  └── React Router matches route
        └── AuthGuard renders
              ├── authStore.loading = true → render null (wait)
              ├── authStore.session = null → redirect to /login
              └── session exists → render <Outlet />
                    └── ModuleGuard moduleId="runs" renders
                          ├── 'runs' not in allowedModuleIds → render <ForbiddenPage />
                          └── 'runs' in allowedModuleIds → render <Outlet /> → RunsList.tsx
```

### 3. Share Link Access

```
User visits /share/abc123xyz
  └── React Router matches /share/:token (outside AuthGuard)
        └── ShareRoute component renders
              ├── Fetch share_tokens where token = 'abc123xyz' (anon Supabase client)
              ├── Not found or expired → render <ShareExpiredPage />
              └── Found → write shareContext to authStore
                    └── Render <ModulePage moduleId={token.module_id} dataFilters={token.data_filters} />
                          └── Module renders with filtered data
```

### 4. Admin Creates Share Link

```
Admin on /admin/share-tokens → clicks "New Share"
  └── ShareTokens.tsx calls supabase.from('share_tokens').insert({...})
        └── Returns generated token
              └── Constructs URL: https://pulse.a360.com/share/{token}
                    └── Displays copyable URL to admin
```

### 5. Data Fetch with Filtering

```
RunsList.tsx calls runsApi.list()
  └── runsApi.list() reads authStore.dataFilters
        ├── shareContext present → use shareContext.data_filters
        └── logged-in user → use user.dataFilters
              └── Fetch all from Prompt Runner
                    └── Filter client-side by transcript_ids / run_ids
                          └── Return filtered array to RunsList.tsx
```

---

## Suggested Build Order

Dependencies must be resolved in this sequence. Each phase depends on the one before it.

### Phase 1: Auth Foundation
**Build first — everything else depends on session state.**

- `src/auth/supabase.ts` — Supabase client singleton
- `src/store/authStore.ts` — Zustand store (session + user + allowedModuleIds)
- `src/auth/AuthProvider.tsx` — mounts `onAuthStateChange`, hydrates store
- `src/auth/useAuth.ts` — consumer hook
- Login page at `/login` with email/password form (Supabase `signInWithPassword`)
- Logout action (Supabase `signOut` + clear store)

Nothing can be guarded until this is stable and the store is reliably initialized.

### Phase 2: Route Guards
**Depends on Phase 1 (store must be initialized before guards evaluate).**

- `src/auth/guards/AuthGuard.tsx`
- `src/auth/guards/ModuleGuard.tsx`
- `src/pages/ForbiddenPage.tsx`
- Wire guards into `App.tsx` router tree, preserving existing `moduleToRoutes()` output
- Test: navigate to `/runs` logged out → redirects to `/login`; logged in without permission → 403

### Phase 3: Supabase Schema + Admin Module
**Depends on Phase 1 (needs auth to query tables). Phase 2 not required for admin to function.**

- Create Supabase project, define schema (`profiles`, `user_modules`, `share_tokens`)
- Enable RLS, write policies
- `src/modules/admin/` — UserList, UserDetail, ShareTokens pages
- Wire admin into App.tsx with `is_admin` guard

Admin must exist before any user permissions can be assigned.

### Phase 4: Per-User Module Filtering
**Depends on Phase 3 (user_modules table must be populated).**

- Extend `AuthProvider` to fetch `user_modules` after session resolves
- Populate `authStore.allowedModuleIds` from fetched rows
- Extend `App.tsx` module filtering to use `allowedModuleIds`
- Test: assign only `extraction` to a user → they see only extraction in nav

### Phase 5: Share Links
**Depends on Phase 3 (share_tokens table) and Phase 4 (data filtering logic is reusable).**

- `src/modules/share/ShareRoute.tsx` — token lookup + shareContext write
- Add `/share/:token` route to App.tsx outside AuthGuard
- Extend `AuthProvider` and API layer to use `shareContext.data_filters` when set
- Admin ShareTokens page creates tokens

### Phase 6: Customization + Logos
**Depends on Phase 3 (profiles table). Independent of Phases 4 and 5.**

- Create Supabase Storage bucket `user-assets`
- Add logo upload to admin UserDetail page
- Extend `AuthProvider` to load `profiles.logo_url` into `authStore.customization`
- Extend `Layout.tsx` to render logo from `customization.logoUrl` in AppBar

### Phase 7: Data Proxy Layer
**Depends on Phase 4 (data_filters must be in store). Can be done alongside Phase 4.**

- Extend `runs.api.ts`, `transcripts.api.ts` with filter application logic
- `src/shared/api/dataProxy.ts` — shared `applyDataFilters()` helper
- Test: assign `transcript_ids: ['abc']` to a user → runs list shows only matching runs

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Zustand for auth state (not React Context alone) | Consistent with existing codebase preference; allows non-component code (API layer) to read filters via `getState()` |
| Guards in router tree, not inside modules | Modules stay unaware of access control; guards are a cross-cutting concern owned by App.tsx |
| Client-side data filtering | Prompt Runner is read-only and unmodifiable; acceptable for 5-20 user prototype scale |
| Custom tokens for share links | Supabase magic links are one-time-use; anonymous sessions are device-local; neither works for a stable share URL |
| Supabase `is_admin` flag on profile (not a Postgres role) | Simpler for 5-20 users; avoids Supabase Postgres role complexity; admin check is an RLS policy + app check |
| `data_filters` as JSONB on profiles | Flexible schema for evolving filter shapes without migrations |
| `authStore.initialized` flag | Prevents route guards from redirecting before session hydration completes (flash-of-wrong-state prevention) |

---

## Anti-Patterns to Avoid

### Importing Supabase client outside `src/auth/`
**What goes wrong:** Multiple client instances diverge in auth state; hard to mock in tests.
**Instead:** All Supabase access goes through `src/auth/supabase.ts` singleton.

### Filtering data inside module page components
**What goes wrong:** Filter logic scatters across modules; share context data filters are ignored.
**Instead:** All filtering in `src/shared/api/` layer — modules receive already-filtered data.

### Putting access logic inside `TestModule` descriptor
**What goes wrong:** Shell components start knowing about auth; hard to add modules without auth changes.
**Instead:** Guards in router tree; module descriptors are pure metadata.

### Blocking app render until permissions load
**What goes wrong:** Auth network request on cold start causes perceptible delay + layout shift.
**Instead:** Render loading state (spinner in Layout) while `authStore.initialized = false`; never block the shell mount.

### Supabase magic links for share tokens
**What goes wrong:** One-time use + 1-hour expiry; second click on same share link fails.
**Instead:** Custom `share_tokens` table with stable, reusable tokens.

---

## Scalability Notes

For the current target of 5-20 users with prototype quality requirements, the above architecture is appropriately sized. Noted upgrade paths if scale grows:

| Current | Upgrade Trigger | Upgrade Path |
|---------|----------------|-------------|
| Client-side data filtering | >50 users or Prompt Runner adds auth | Move filtering to a Vercel Edge Function that proxies Prompt Runner with user context |
| `is_admin` boolean on profile | Role hierarchy needed | Add `role` enum to profiles, extend RLS |
| Single Supabase project | Separate prod/dev environments needed | Supabase branching or separate projects per environment |

---

## Sources

- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous) — HIGH confidence (official docs, explains why anonymous sessions are unsuitable for share links)
- [Custom Claims & RBAC with Supabase](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence (official docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence (official docs)
- [React Router v7 + Supabase Auth Example](https://github.com/brainicorn/reactrouter7-auth-example) — MEDIUM confidence (community example, current year)
- [React Router v7 Private Routes Pattern](https://www.robinwieruch.de/react-router-private-routes/) — MEDIUM confidence (canonical reference)
- [Supabase + React Router Starter Kit](https://github.com/saltcod/rr-v7) — MEDIUM confidence (community reference, React Router v7 specific)
- [Supabase Zustand Integration](https://www.restack.io/docs/supabase-knowledge-supabase-zustand-integration) — MEDIUM confidence (community guide)
- [Supabase Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart) — HIGH confidence (official docs)

---

*Architecture analysis: 2026-03-27*
