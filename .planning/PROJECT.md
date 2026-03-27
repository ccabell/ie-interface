# A360 Pulse — Project Context

## What This Is

**A360 Pulse** is a modular web platform that mirrors the A360 production environment, enabling Chris to build, test, demo, and share modules with external users. It's the professional, shareable face of the A360 prototyping ecosystem.

## Core Value

**Build modules once, share them with anyone — customized per user, with controlled data access.**

## Context

A360 is a medical tool platform (mobile + web) for the medical aesthetics industry. The production platform lives in three GitHub repos (a360-web-app, a360-notes-ios, a360-genai-platform). Chris has been building testing/prototyping tools (Prompt Runner, Mid-Stream, IE Interface, Admin App) that have grown organically but are sprawling and inconsistent.

Pulse consolidates the shareable/professional side into one modular platform that:
- Mirrors the production a360-web-app UI exactly (MUI v7, same cards, same theme)
- Connects to Prompt Runner as a read-only API consumer
- Supports multi-tenant module sharing via Supabase Auth
- Can be customized per user (logos, data filtering, branding)

## What This Is NOT

- NOT a replacement for Mid-Stream (Chris keeps Mid-Stream for internal testing/docs)
- NOT a modification to Prompt Runner (Prompt Runner is hands-off — read-only API consumption)
- NOT a production environment (prototyping/demo quality, not perfection)

## Critical Constraints

### 🔴 PROMPT RUNNER IS HANDS-OFF
**Nothing touches Prompt Runner unless expressly ordered.** Prompt Runner runs multiple modules as an API. No updates, no schema changes, no direct database modifications. Pulse only READS from Prompt Runner's API endpoints. All Pulse-specific data lives in Pulse's own Supabase project.

### Production UI Parity
Default stack matches a360-web-app exactly (React 19, MUI v7, Zustand, React Router, Axios). Other libraries (Tailwind, etc.) are OK per-module if needed. The goal is that modules built here could become production features.

### Simplest Multi-Tenancy
Use Supabase Auth (built-in) for user management. Minimal custom code. Mirror A360's user/practice structure loosely. 5-20 users in near term.

### Two Share Modes
1. **Direct URL** — quick shares: `pulse.a360.com/share/abc123` opens directly into module
2. **Login** — ongoing users: log in, see dashboard with only their assigned modules

## Requirements

### Validated (already built)

- ✓ Module system architecture (shell → modules → shared)
- ✓ 4 modules: extraction cards, run explorer, opportunities, dashboard
- ✓ Production card library (12 intelligence cards ported from a360-web-app)
- ✓ A360 theme system (palette, typography, tokens)
- ✓ Prompt Runner API integration (via Vercel proxy)
- ✓ Deployed on Vercel (https://ie-interface-amber.vercel.app)
- ✓ MDChip component (production-faithful soft variant)

### Active

- [ ] Supabase Auth integration (Pulse's own Supabase project)
- [ ] User → module access control
- [ ] Module customization per user (logo, branding, data filtering)
- [ ] Direct URL share mode (no login required for quick shares)
- [ ] Dashboard with module cards + left navigation
- [ ] Full production card parity (all 11 cards rendering, MDChip in all cards)
- [ ] IntelligenceRenderer renders all 11 cards (currently only 5)
- [ ] extractionToCards handles V3/V3.1 multi-pass output
- [ ] Rename to A360 Pulse (project name, Vercel, branding)
- [ ] CLAUDE.md and agents.md for the project
- [ ] Reusable page templates for new modules
- [ ] Admin module for managing users and module assignments

### Out of Scope

- Modifying Prompt Runner in any way — READ ONLY
- Replacing Mid-Stream (it stays for internal use)
- Building a full production-grade auth system
- Self-serve user registration (admin creates users manually for now)
- Real-time collaboration features
- Mobile app

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase Auth for multi-tenancy | Simplest out-of-box solution, minimal custom code | Decided |
| Separate Supabase project from Prompt Runner | Prompt Runner is hands-off, cannot be touched | Decided |
| Mirror A360 user/practice structure | Natural multi-tenancy, mirrors production for demos | Decided |
| MUI v7 as default, other libraries OK per module | Matches production but not limited | Decided |
| Prompt Runner as read-only API | Safety — Pulse only consumes, never modifies | Decided |
| Keep Mid-Stream separate | Internal tool, not professional enough to share | Decided |
| Deprecate IE Interface | Absorbed into Pulse extraction module | Decided |

## Related Projects

| Project | Role | Relationship to Pulse |
|---------|------|----------------------|
| **Prompt Runner** | Backend engine | READ-ONLY API consumer. Never modify. |
| **Mid-Stream** | Internal testing/docs | Separate. Some page overlap. Link later. |
| **a360-web-app** | Production frontend | Source of truth for UI components. Mirror exactly. |
| **a360-genai-platform** | Production backend | Reference for data structures. No direct connection. |
| **Core_Docs** | Documentation hub | `C:\Projects\Core_Docs` — all architecture docs live here |

## Team

| Role | Person |
|------|--------|
| Product/Architecture | Chris Cabell |
| Frontend (Production) | Vadym Diachenko |
| Backend (Production) | Dmytro Usenko |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after initialization*
