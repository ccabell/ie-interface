# A360 Pulse — v1 Requirements

## v1 Requirements

### Foundations
- [ ] **FOUND-01**: Project renamed from ie-interface to A360 Pulse (package.json, Vercel, branding)
- [ ] **FOUND-02**: CLAUDE.md created with Prompt Runner hands-off rule as first constraint
- [ ] **FOUND-03**: Parallel card renderers consolidated (AgentViewer set removed or unified with shared/cards)
- [ ] **FOUND-04**: IntelligenceRenderer renders all 11 production intelligence cards
- [ ] **FOUND-05**: extractionToCards.ts handles V3/V3.1 multi-pass extraction output
- [ ] **FOUND-06**: MDChip replaces MUI Chip in all intelligence cards for production parity
- [ ] **FOUND-07**: Hardcoded hex values replaced with theme tokens in shared/cards

### Authentication
- [ ] **AUTH-01**: User can log in with email and password via Supabase Auth
- [ ] **AUTH-02**: User session persists across page refreshes
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: Unauthenticated users are redirected to login page
- [ ] **AUTH-05**: Auth state stored in Zustand (consistent with existing pattern)

### Module Access Control
- [ ] **MOD-01**: Supabase schema created: profiles, user_module_access, share_tokens tables with RLS
- [ ] **MOD-02**: Dashboard shows only modules assigned to the logged-in user
- [ ] **MOD-03**: Route guards prevent access to unassigned modules (returns 403 or redirects)
- [ ] **MOD-04**: Admin user (Chris) sees all modules
- [ ] **MOD-05**: Module assignments managed via Supabase Studio (no custom admin UI in v1)

### Data Filtering
- [ ] **DATA-01**: Per-user data context stored in Supabase (which practice, runs, transcripts they can see)
- [ ] **DATA-02**: API layer filters Prompt Runner responses based on user's data context
- [ ] **DATA-03**: Users only see Prompt Runner data scoped to their access (not all 122 transcripts, all 94 runs)

### Production Card Parity
- [ ] **CARD-01**: All 11 intelligence cards render correctly from V3/V3.1 extraction output
- [ ] **CARD-02**: Card components visually match a360-web-app production (MDChip soft variant, theme tokens)
- [ ] **CARD-03**: Empty states display per-card messages (not blank cards)

### Deployment
- [ ] **DEPLOY-01**: Pulse's own Supabase project created (separate from Prompt Runner's Supabase)
- [ ] **DEPLOY-02**: Vercel deployment updated with Pulse branding and Supabase env vars
- [ ] **DEPLOY-03**: Vercel proxy continues to route /api/* to Prompt Runner (read-only)

---

## v2 Requirements (Deferred)

### Sharing
- [ ] Direct URL share links (no login required)
- [ ] Share link expiration controls
- [ ] Per-share data filtering (specific runs/transcripts/prompts)

### Customization
- [ ] Per-user logo in dashboard/modules
- [ ] Per-user color accent override
- [ ] Per-user module descriptions/titles

### Admin
- [ ] In-app admin module for user management
- [ ] In-app module assignment UI
- [ ] In-app share link management
- [ ] User activity/audit log

### Additional Modules
- [ ] Coaching output preview module
- [ ] TCP testing module
- [ ] Reach/email preview module
- [ ] Prompt comparison/versioning module (prompt lab)
- [ ] Step-by-step product walkthrough module

---

## Out of Scope

- Self-serve user registration — admin creates users via Supabase Studio
- Modifying Prompt Runner in any way — **READ ONLY, HANDS OFF**
- Real-time collaboration features
- Mobile app
- Multi-tier roles (only admin + user)
- Write-back to Prompt Runner from Pulse
- Email notifications
- User-editable preferences
- Full production-grade security audit (this is a demo/testing platform)

---

## Traceability

*(Updated by roadmapper)*

| REQ-ID | Phase | Status |
|--------|-------|--------|
| | | |
