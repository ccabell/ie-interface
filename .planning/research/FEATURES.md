# Feature Landscape: A360 Pulse Multi-Tenant Module Sharing

**Domain:** Modular demo/analytics sharing platform (5-20 invited users, admin-managed)
**Researched:** 2026-03-27
**Confidence:** HIGH for table stakes, MEDIUM for differentiators (informed by embedded analytics and SaaS multi-tenancy patterns)

---

## Context and Scope

A360 Pulse is NOT a general SaaS product. It is a professional-facing demo and testing platform for a
specific operator (Chris) sharing specific modules with a small, known set of external users (clients,
partners, stakeholders). Scale is 5-20 users. This fundamentally changes the feature calculus:

- No self-serve registration — admin creates all users
- No public marketplace or discovery — everything is direct invite or explicit share
- No billing or subscription management — out of scope entirely
- Data source is read-only (Prompt Runner API) — Pulse cannot write data back to it
- Pulse's own Supabase project holds all user/permission/customization state

Features are evaluated against this specific context, not general SaaS expectations.

---

## Table Stakes

Features that users expect. Missing = platform feels broken or untrustworthy.

### 1. Supabase Auth — Email/Password Login

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Why Expected | Users need a stable identity. No login = no persistent access, no assignment. |
| Supabase provides | Built-in email/password auth, magic link, session management |
| Notes | Magic link (passwordless) is preferred UX for a small user set. Password reset required. |

### 2. Module Assignment — User Sees Only Assigned Modules

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Why Expected | External users should not see internal/WIP modules. Unassigned modules must be invisible. |
| Implementation | `user_module_assignments` join table in Supabase; RLS policy restricts reads to assigned rows |
| Notes | Supabase RLS (`auth.uid()` on `user_id` column) handles this at the database level without app-level filtering |

### 3. Dashboard with Assigned Modules Only

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Why Expected | After login, users must see a clear list of what they have access to — no dead ends. |
| Implementation | Query `user_module_assignments` on load, render only assigned `TestModule` descriptors |
| Notes | The existing `HomePage.tsx` module card grid is the natural foundation; gate it by assignment |

### 4. Direct Share URL (No Login Required)

| Attribute | Value |
|-----------|-------|
| Complexity | Low-Medium |
| Why Expected | The "quick share" use case is the fastest path to value. Sending a URL that requires login breaks demos. |
| Implementation | `share_tokens` table in Supabase — opaque token maps to `(module_id, user_context_id)`. Route: `/share/:token` resolves token, loads module with its associated data filter context. |
| Notes | Token must be opaque (not guessable). No expiry required for MVP but the row should have an `expires_at` column from day one. |

### 5. Admin User CRUD (Create, Assign, Deactivate)

| Attribute | Value |
|-----------|-------|
| Complexity | Low-Medium |
| Why Expected | Someone must manage the user list. With no self-serve registration, admin tooling is the only path. |
| Scope | Create user (email invite via Supabase invite), assign modules, deactivate access |
| Implementation | Admin module in Pulse itself (protected by `is_admin` flag on profile) OR direct Supabase Studio |
| Notes | For MVP, Supabase Studio is acceptable. A dedicated admin module is a differentiator for operator UX. |

### 6. Data Isolation per User — Prompt Runner Filter Context

| Attribute | Value |
|-----------|-------|
| Complexity | Medium |
| Why Expected | Two external users MUST NOT see each other's data from Prompt Runner. Each user should see only runs/transcripts relevant to their context (their practice, their patients). |
| Implementation | `user_data_context` table in Supabase stores filter parameters per user (e.g., `practice_id`, `run_ids`, date ranges). When a module loads, it fetches the user's context and applies it as query params to Prompt Runner API calls. |
| Notes | Prompt Runner is read-only — Pulse does NOT modify what data exists, only which subset gets queried. This is parameter-level filtering at the API call layer, not RLS at a database level. |

### 7. Basic Branding per User — Logo Override

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Why Expected | External users (clients) expect to see their own branding when viewing their data. Seeing A360 internal branding feels impersonal for client demos. |
| Implementation | `user_customizations` table: `logo_url`, `display_name`, `primary_color`. Shell reads this on load and applies to `ThemeProvider` and top nav. |
| Notes | Logo URL stored in Supabase Storage or as an external URL. Primary color override is optional for MVP — logo alone covers the most visible need. |

---

## Differentiators

Features that elevate the platform above bare minimum. Not expected, but valued when present.

### 1. Per-Module Customization (not just per-user)

| Attribute | Value |
|-----------|-------|
| Complexity | Medium |
| Value Proposition | Some modules may need different branding or data context per user+module combination (e.g., user A sees module X with filter set 1, module Y with filter set 2). |
| Implementation | Extend `user_module_assignments` with nullable `customization_override_id` — falls back to user-level defaults. |
| Notes | Only needed if users have meaningfully different contexts per module. Start with user-level; add per-module override when a real use case forces it. |

### 2. Share Link with Expiry

| Attribute | Value |
|-----------|-------|
| Complexity | Low (incremental over table-stakes share links) |
| Value Proposition | Time-bound access is good hygiene for client demos. "This link expires in 7 days" is professional. |
| Implementation | `expires_at` timestamp on `share_tokens`. Middleware/loader checks `expires_at < now()` and returns 410 Gone. |
| Notes | Include from day one in the schema even if the UI expiry-setting is deferred. |

### 3. Admin Module Inside Pulse (Not Supabase Studio)

| Attribute | Value |
|-----------|-------|
| Complexity | Medium |
| Value Proposition | Chris should not need Supabase Studio to manage users day-to-day. An in-platform admin view is faster and more professional. |
| Implementation | A protected `admin` module: user list, assignment table (checklist of modules per user), create user (fires Supabase invite email), deactivate user. |
| Notes | Protected by role check on load. Uses Supabase service-role key server-side (Vercel function) to call admin API — never expose service-role key to client. |

### 4. Share Link Copy Button on Module Header

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Value Proposition | Operator UX. One-click to generate and copy a share link for the current module without leaving the module. |
| Implementation | `POST /api/share-token` Vercel function creates token row, returns URL. Module header shows "Share" button visible only to admin/owner. |
| Notes | The share URL format is `/share/:token` — deterministic and memorable. |

### 5. Last-Accessed Timestamps on Module Assignments

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Value Proposition | Chris can see which external users have actually opened their assigned modules. Useful for demo follow-up. |
| Implementation | `last_accessed_at` on `user_module_assignments`; upserted when user loads a module. |
| Notes | Does not require analytics infrastructure — single column update. |

### 6. Color Theme Override per User

| Attribute | Value |
|-----------|-------|
| Complexity | Medium |
| Value Proposition | Some client demos benefit from using the client's brand color, not A360's. Makes the demo feel built for them. |
| Implementation | `primary_color` in `user_customizations`; injected into MUI `ThemeProvider` as `palette.primary.main`. |
| Notes | MUI v7 supports runtime theme overrides cleanly. Scope: primary color only — do not attempt full multi-theme. |

### 7. Module-Specific Data Context Notes

| Attribute | Value |
|-----------|-------|
| Complexity | Low |
| Value Proposition | Admin can attach a short context note per user-module assignment ("Showing runs from Q1 2026 Little Mountain demo"). Surfaces to the user as a subtle label so they know what data scope they're seeing. |
| Implementation | `context_note` text column on `user_module_assignments`. Rendered as a small MUI `Chip` or subtitle in the module frame. |
| Notes | Avoids confusion when a user wonders "whose data is this?" |

---

## Anti-Features

Features to deliberately NOT build. Each has a reason and a recommended alternative.

### 1. Self-Serve User Registration

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Public signup flow, email verification, onboarding wizard | 5-20 known users. An open registration door invites bots, unauthorized access, and support burden. | Admin creates all accounts via Supabase invite email. Zero ambiguity about who has access. |

### 2. Role Hierarchy Beyond Owner/User

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Roles like Viewer/Editor/Admin/SuperAdmin, role inheritance, permission matrices | Over-engineered for a 5-20 user internal demo tool. Every addition to a role system compounds surface area. | Two roles: `admin` (Chris) and `user` (external). Module visibility is the permission system. |

### 3. User-Controlled Module Preferences

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Users editing their own data filters, changing their branding, toggling module features | Users should see exactly what Chris configured for them — no drift, no support calls about "I changed something." | Admin controls all user customization. If a user needs something different, they ask and admin updates it. |

### 4. Real-Time Collaboration or Shared Sessions

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| "User B sees the same cursor as User A," live annotations, shared cursors | Out of scope per PROJECT.md. Adds WebSocket infrastructure, session complexity, and no clear value for demo use. | Each user independently views their assigned modules. |

### 5. Write-Back to Prompt Runner

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Saving notes, triggering new runs, editing data through Pulse | Prompt Runner is hands-off by explicit decision. Any write path risks corrupting the testing data store. | HITL feedback already exists in the existing RunDetail page via PATCH /runs/:id. If that needs to surface in Pulse, it goes through the existing API endpoint — no new write surface. |

### 6. Email Notifications / Alerts System

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| "You have been assigned a new module" emails, weekly digests, activity alerts | Adds transactional email infrastructure (SES, SendGrid, templates) for negligible value at 5-20 users. | Chris tells users directly when something new is available. Supabase's built-in invite email is sufficient. |

### 7. Audit Log UI

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full audit trail of who viewed what when, exportable logs, compliance reports | PHI risk is low (Prompt Runner data is already de-identified or internal test data). Audit complexity exceeds value at this scale. | `last_accessed_at` timestamps per module assignment (differentiator #5) cover the practical need. |

### 8. Tenant-Scoped Module Customization of Logic

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Users can have different versions of a module's business logic, different card sets, different AI prompts | Modules are fixed in code. Per-user variation is data and presentation only (logos, colors, data filters). | If a user needs a fundamentally different module, build a new module. Do not parameterize module logic. |

---

## Feature Dependencies

```
Supabase Auth (login)
  └── Dashboard with assigned modules (requires identity to query assignments)
       └── Module assignment table (requires users to exist)
            └── Admin user CRUD (requires admin role check)
                 └── Admin module UI (requires admin user CRUD to be worth building)

Share Token table (independent of auth — public route)
  └── Share link copy button (requires token generation)
  └── Share link expiry (requires expires_at column, zero incremental work if planned upfront)

user_data_context table (per-user Prompt Runner filter params)
  └── Data isolation per user (requires context table to exist before modules load filtered data)
  └── Module-specific data context notes (extends user_module_assignments, not user_data_context)

user_customizations table (logo_url, primary_color, display_name)
  └── Logo override (requires customizations table)
  └── Color theme override (incremental over logo override, same table)
```

**Critical path for MVP:**

Supabase Auth → `user_module_assignments` table → Dashboard gating → `share_tokens` table → Direct URL share → `user_data_context` table → Data isolation

Everything else is additive.

---

## MVP Recommendation

**Must have for the milestone to be complete:**

1. Supabase Auth (email invite flow, login page, session persistence)
2. `user_module_assignments` table + RLS policy (user sees only their modules)
3. Dashboard gated by assignments (existing `HomePage.tsx` filtered by query result)
4. `share_tokens` table + `/share/:token` route (no-login share link)
5. `user_data_context` table + filter injection into Prompt Runner API calls (data isolation)
6. `user_customizations` table + logo override in shell nav (basic branding)

**Defer to next milestone:**

- Admin module UI (Supabase Studio is acceptable for 5-20 users during this milestone)
- Color theme override (logo alone covers the demo need)
- Share link expiry UI (schema column yes, UI controls no)
- Per-module customization override (user-level is sufficient until proven otherwise)
- Last-accessed timestamps (useful, not blocking)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | These are established patterns for any invite-based multi-tenant tool; Supabase RLS docs confirm implementation approach |
| Anti-features | HIGH | Driven by explicit PROJECT.md constraints (no self-serve, no write-back, 5-20 users) — not opinion |
| Differentiators | MEDIUM | Based on embedded analytics platform patterns and common demo tool UX; specific value to Pulse context is inferred |
| Data isolation via filter params | MEDIUM | Pattern is well-established (parameterized API queries per user); exact Prompt Runner API surface for filtering needs verification against actual endpoints |
| Supabase RLS implementation | HIGH | Supabase official docs confirm `auth.uid()` + `user_id` column pattern works as described |

---

## Sources

- [Supabase Row Level Security — Official Docs](https://supabase.com/features/row-level-security)
- [Supabase RLS Multi-Tenant Architecture (AntStack)](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [WorkOS: Top User Management Features for SaaS](https://workos.com/blog/user-management-features)
- [Logto: Build Multi-Tenant SaaS Application](https://blog.logto.io/build-multi-tenant-saas-application)
- [Box: Link Sharing Best Practices](https://blog.box.com/link-sharing-best-practices)
- [Databrain: Role-Based Data Governance in Embedded Analytics](https://www.usedatabrain.com/blog/role-based-data-governance-embedded-analytics)
- [Knowi: Build Multi-Tenant Embedded Analytics](https://www.knowi.com/blog/build-multi-tenant-embedded-analytics/)
- [Propelius: Tenant Data Isolation Patterns](https://propelius.tech/blogs/tenant-data-isolation-patterns-and-anti-patterns/)
- [Frontegg: SaaS Multitenancy Best Practices](https://frontegg.com/blog/saas-multitenancy)
- [Hubble AI: Supabase User Management Dashboard (GitHub)](https://github.com/hubbleai/supabase-user-management-dashboard)
