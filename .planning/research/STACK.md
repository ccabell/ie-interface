# Technology Stack — Supabase Auth + Multi-Tenancy Layer

**Project:** A360 Pulse
**Milestone:** Multi-tenant module sharing
**Researched:** 2026-03-27
**Overall Confidence:** HIGH (core packages), MEDIUM (RLS patterns), HIGH (share link approach)

---

## Context

The existing app is a React 19 + MUI v7 + Vite SPA deployed on Vercel. It has no auth today.
This milestone adds:

1. Supabase Auth (login + session management)
2. RLS-backed module access control (user sees only their assigned modules)
3. Share links (direct URL access without login)
4. Per-user module customization (logo, branding, data filtering)

Prompt Runner is **read-only**. All new data lives in Pulse's own Supabase project.

---

## Recommended Stack

### Core Auth Library

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@supabase/supabase-js` | 2.100.1 | Supabase client: auth, database, storage | The single official client. Ships auth, realtime, storage, RPC. No other package needed for a React SPA. |

**Do NOT install `@supabase/auth-helpers-react`.** That package was deprecated in April 2024 and is no longer maintained. Final version was 0.15.0. It was replaced by `@supabase/ssr`, but `@supabase/ssr` is for SSR frameworks (Next.js, SvelteKit). For a Vite/React SPA, `@supabase/supabase-js` alone is the correct and current answer.

**Confidence:** HIGH — verified via npm (2.100.1 published March 2026) and official deprecation notice.

### Client Initialization (SPA Pattern)

Create a singleton client. Do not re-create it per component.

```typescript
// src/shared/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.generated'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Environment variables to add:**
- `VITE_SUPABASE_URL` — project URL (e.g., `https://xxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — publishable anon key (safe to expose client-side; RLS is the enforcement layer)

The anon key is intentionally public. Security comes from RLS policies, not from hiding the key.

### Auth State Management

Use an `AuthProvider` with React Context + `onAuthStateChange`. Wire into the existing Zustand store for global session access.

```typescript
// src/shared/context/AuthContext.tsx
// Wraps the app, listens to onAuthStateChange,
// exposes { session, user, loading } via context.
```

Session is persisted automatically in `localStorage` by `supabase-js`. No manual token management needed.

**Confidence:** HIGH — official docs pattern, confirmed current.

### Protected Routes (React Router 7)

The existing app uses `createBrowserRouter`. Add a guard layout route:

```typescript
// src/shell/ProtectedRoute.tsx
// Renders <Outlet /> if session exists, redirects to /login otherwise.
// Check session with supabase.auth.getSession() on mount.
```

This is the established community pattern for React Router + Supabase SPAs. No library needed beyond what's already installed.

**Confidence:** MEDIUM — community pattern, not officially documented step-by-step for React Router v7, but the underlying API is stable.

---

## Database Layer

### Supabase Project Schema (New: Pulse-specific)

Four tables are needed. All live in Pulse's own Supabase project.

#### `profiles` — User display data

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );
```

#### `user_module_access` — Module entitlements (junction table)

This is the access control spine. One row per (user, module) pair.

```sql
create table public.user_module_access (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,        -- matches module registry key, e.g. 'extraction'
  granted_at  timestamptz default now(),
  granted_by  uuid references auth.users(id),
  unique(user_id, module_slug)
);

alter table public.user_module_access enable row level security;

-- Users can read their own access rows
create policy "Users can see their own module access"
  on public.user_module_access for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Only service role (admin operations) can insert/delete
-- No authenticated-user insert policy = users cannot grant themselves access
```

RLS policy logic: a user's dashboard only renders module cards where a matching row exists in `user_module_access`. The query is:

```typescript
const { data } = await supabase
  .from('user_module_access')
  .select('module_slug')
  .eq('user_id', user.id)
```

**Confidence:** HIGH — standard junction-table RBAC pattern, directly supported by RLS `auth.uid()` helpers.

#### `user_module_preferences` — Per-user customization

Hybrid structure: known fields as columns, flexible overrides as JSONB.

```sql
create table public.user_module_preferences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,
  -- Known customization fields (indexed, queryable)
  logo_url    text,
  brand_color text,
  -- Flexible overrides (filters, display toggles, etc.)
  custom_config jsonb default '{}'::jsonb,
  updated_at  timestamptz default now(),
  unique(user_id, module_slug)
);

alter table public.user_module_preferences enable row level security;

create policy "Users own their preferences"
  on public.user_module_preferences for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
```

JSONB is used for `custom_config` because the shape varies per module and will evolve. Known fields (`logo_url`, `brand_color`) are columns because they are queried and displayed consistently across all modules.

**Confidence:** HIGH — official Supabase JSONB guidance confirms this hybrid approach.

#### `share_tokens` — Direct URL share links

This table drives the "Direct URL" share mode (`/share/:token`).

```sql
create table public.share_tokens (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  module_slug  text not null,
  created_by   uuid references auth.users(id),
  expires_at   timestamptz,                        -- null = no expiry
  is_active    boolean default true,
  config       jsonb default '{}'::jsonb,           -- module-specific context passed to the view
  created_at   timestamptz default now()
);

alter table public.share_tokens enable row level security;

-- Public read: any visitor can look up a token (app checks is_active + expiry)
create policy "Anyone can read active share tokens"
  on public.share_tokens for select
  to anon, authenticated
  using ( is_active = true and (expires_at is null or expires_at > now()) );

-- Only authenticated users can create share tokens
create policy "Authenticated users can create share tokens"
  on public.share_tokens for insert
  to authenticated
  with check ( (select auth.uid()) = created_by );
```

**Why this approach instead of Supabase Storage signed URLs:**
Storage signed URLs are for files (images, PDFs), not for application views. Share tokens in a custom table give full control: revokable, configurable, audit-logged, and readable by the anon role without needing a Storage bucket.

**Confidence:** MEDIUM — this pattern is community-established (not officially documented by Supabase as a named pattern), but the underlying primitives (anon role access, RLS on custom tables) are official and stable.

---

## Share Link Architecture

### Two Modes

**Mode 1: Direct URL (no login)**

Flow:
1. Visitor lands on `/share/:token`
2. App calls `supabase.from('share_tokens').select('*').eq('token', token).single()`
3. If token is valid and active: render the module in read-only view
4. No `signInAnonymously()` needed — the `anon` role can read active tokens via RLS
5. Module fetches Prompt Runner data via the existing Vercel proxy (no auth)

The visitor never logs in. The share token controls what they see. Prompt Runner data is already public through the proxy.

**Mode 2: Login (ongoing users)**

Flow:
1. User logs in via Supabase Auth (email/password or magic link)
2. App fetches `user_module_access` rows for their `user_id`
3. Dashboard renders only their assigned modules
4. Preferences fetched from `user_module_preferences`

### What NOT to Do for Share Links

- **Do NOT use `signInAnonymously()`** — creates database users that accumulate, require cleanup, and complicate RLS policies. The anon role on the `share_tokens` table is sufficient.
- **Do NOT use Supabase Storage signed URLs** — those are for files. Application views need a custom token table.
- **Do NOT skip `is_active` + `expires_at`** on the token — tokens need to be revokable.

**Confidence:** MEDIUM for the overall architecture (assembled from primitives, not a single official guide), HIGH for individual components.

---

## Admin Operations

For admin tasks (creating users, granting module access), use a **server-side function** or Supabase's built-in dashboard, never the service role key in the browser.

Options ranked by simplicity for Pulse's scale (5-20 users):
1. **Supabase Dashboard** — directly insert rows into `user_module_access`. Zero code. Use for the first milestone.
2. **Edge Function** with service role — callable from a private admin module. Medium effort.
3. **Admin module in Pulse** — full UI for user management. Highest effort, but required by `PROJECT.md` eventually.

Start with option 1. Build option 3 as a later milestone.

---

## Zustand Store Integration

The existing app has Zustand 5.0 installed but unused for global state. Add an auth store:

```typescript
// src/shared/store/auth.store.ts
// State: { session, user, moduleAccess, preferences, isLoading }
// Actions: setSession, clearSession, loadModuleAccess, loadPreferences
```

This keeps auth state out of React Context (no re-render cascade) while staying consistent with the existing Zustand-first architecture.

**Confidence:** HIGH — consistent with existing codebase pattern.

---

## Installation

```bash
npm install @supabase/supabase-js
```

That is the only new dependency. Everything else (React Context, Zustand, React Router, Axios) is already present.

**New environment variables (add to Vercel + local `.env.local`):**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth library | `@supabase/supabase-js` 2.x | `@supabase/auth-helpers-react` | Deprecated April 2024, no longer maintained |
| Auth library | `@supabase/supabase-js` 2.x | `@supabase/ssr` | SSR-only; Pulse is a Vite SPA, no server rendering |
| Auth provider | Supabase | Auth0, Clerk | Supabase is already decided; Auth0/Clerk add cost and a third integration point |
| Share links | Custom `share_tokens` table | Supabase Storage signed URLs | Storage signed URLs are for files, not application views |
| Share links | Custom `share_tokens` table | Magic links (Supabase Auth) | Magic links create real user accounts and require an email address |
| Share links | Custom `share_tokens` table | `signInAnonymously()` | Creates accumulating anonymous users in the auth schema, complicates RLS |
| Per-user config | JSONB `custom_config` column | Separate table per config type | Over-engineering for 5-20 users; JSONB is simpler with adequate performance |
| RBAC | Junction table + RLS | Custom JWT claims via hook | JWT claims are appropriate for roles; module access changes often enough that a table is more maintainable than re-issuing JWTs |

---

## RLS Performance Notes

Index every column referenced in RLS policies. For this schema:

```sql
create index on public.user_module_access (user_id);
create index on public.user_module_preferences (user_id, module_slug);
create index on public.share_tokens (token) where is_active = true;
```

Use `(select auth.uid())` rather than `auth.uid()` directly in policies. The subquery form prevents the function from being called once per row, which matters at scale.

**Confidence:** HIGH — official Supabase performance guidance.

---

## What Is NOT Needed

- **`@supabase/ssr`** — SSR package, no server in this app
- **`@supabase/auth-helpers-react`** — deprecated
- **Supabase Realtime subscriptions** — not required for this milestone; shares and access control are read-at-page-load, not live
- **Supabase Storage buckets** — per-user logos/assets can be hosted externally (Cloudinary, direct URL) or added later; not blocking for milestone 1
- **Row-level encryption** — not warranted for a demo/prototyping platform

---

## Sources

- [@supabase/supabase-js npm (v2.100.1, March 2026)](https://www.npmjs.com/package/@supabase/supabase-js)
- [Auth Helpers deprecation notice](https://github.com/supabase/auth-helpers/blob/main/DEPRECATED.md)
- [Supabase Auth with React — official quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Row Level Security — official docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Custom Claims and RBAC — official docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Anonymous Sign-Ins — official docs](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase JSONB guide](https://supabase.com/docs/guides/database/json)
- [Custom Access Token Hook — official docs](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Supabase RLS best practices (makerkit.dev)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)

---

*Stack research: 2026-03-27*
