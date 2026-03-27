# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Build modules once, share them with anyone — customized per user, with controlled data access
**Current focus:** Phase 1 — Foundations

## Current Position

Phase: 1 of 4 (Foundations)
Plan: Not yet planned
Status: Ready to plan
Last activity: 2026-03-27 — Roadmap created, 26 requirements mapped across 4 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Prompt Runner is READ-ONLY — no modifications, ever. Pulse only consumes its API.
- [Init]: Separate Supabase project for Pulse (not shared with Prompt Runner)
- [Init]: Parallel card renderers (AgentViewer set) must be consolidated in Phase 1 before auth work begins
- [Init]: Client-side data filtering is intentional and acceptable at 5-20 users scale
- [Init]: is_admin boolean on profiles (not Postgres role) — simpler for this scale

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Do not expose service_role key in any VITE_* env var — only VITE_SUPABASE_ANON_KEY belongs in the frontend
- [Phase 2]: Test RLS isolation via JS client as a non-admin user, not via Supabase SQL editor (editor bypasses RLS)
- [Phase 2]: Wire resetAllStores() to SIGNED_OUT event in onAuthStateChange to prevent auth state leaking across sign-in cycles
- [Phase 3]: Prompt Runner API surface for filtering needs verification before Phase 3 — which query params /runs and /transcripts actually accept

## Session Continuity

Last session: 2026-03-27
Stopped at: Roadmap created and written to disk. Ready to begin Phase 1 planning.
Resume file: None
