# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**Prompt Runner Backend (Railway):**
- Service: `https://prompt-runner-production.up.railway.app`
- Purpose: AI prompt execution engine, transcript storage, agent management, opportunity tracking
- Auth: None detected (no Authorization header in `src/shared/api/client.ts`)
- All communication is proxied — the frontend never calls Railway directly

## Data Storage

**Databases:**
- Supabase (indirect) — accessed by the prompt-runner backend on Railway, not directly from this frontend. No Supabase SDK present in `package.json`.

**File Storage:**
- Not applicable — no direct file storage integration

**Caching:**
- None — no client-side caching layer beyond React component state

## Authentication & Identity

**Auth Provider:**
- None detected — no auth library, no login flow, no protected routes, no tokens in the API client

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or equivalent)

**Logs:**
- Browser console only

## CI/CD & Deployment

**Hosting:**
- Vercel (static SPA)
- Install command: `npm install --force`
- SPA fallback: `{ "source": "/(.*)", "destination": "/index.html" }` (last rewrite rule)
- Config: `vercel.json`

**CI Pipeline:**
- Not detected (no GitHub Actions or Vercel CI config in repo root)

## Proxy Architecture

### Development (Vite)
Configured in `vite.config.ts`:
```
/api/* → https://prompt-runner-production.up.railway.app/*
```
The `/api` prefix is stripped before forwarding (`rewrite: (path) => path.replace(/^\/api/, '')`).

### Production (Vercel)
Configured in `vercel.json` as explicit rewrites (no wildcard catch-all for `/api`):

| Vercel Source | Railway Destination |
|---|---|
| `/api/runs` | `/runs` |
| `/api/runs/:path*` | `/runs/:path*` |
| `/api/agents` | `/agents` |
| `/api/agents/:path*` | `/agents/:path*` |
| `/api/transcripts` | `/transcripts` |
| `/api/transcripts/:path*` | `/transcripts/:path*` |
| `/api/opportunities` | `/opportunities` |
| `/api/opportunities/:path*` | `/opportunities/:path*` |
| `/api/run_downstream` | `/run_downstream` |
| `/api/run_downstream/:path*` | `/run_downstream/:path*` |
| `/api/run_extraction` | `/run_extraction` |
| `/api/prompt_sets` | `/prompt_sets` |
| `/api/prompt_sets/:path*` | `/prompt_sets/:path*` |
| `/api/prompt_templates` | `/prompt_templates` |
| `/api/prompt_templates/:path*` | `/prompt_templates/:path*` |
| `/api/practices` | `/practices` |
| `/api/practices/:path*` | `/practices/:path*` |
| `(.*)` | `/index.html` (SPA fallback) |

**Important:** Adding a new backend endpoint requires a matching rewrite entry in `vercel.json` for production. Dev proxy handles all `/api/*` automatically.

## Prompt Runner API Endpoints Used

All requests go through the Axios client at `src/shared/api/client.ts` with `baseURL = /api`.

### Runs — `src/shared/api/runs.api.ts`
| Method | Path | Purpose |
|---|---|---|
| GET | `/runs` | List runs (params: `transcript_id`, `limit`, `offset`) |
| GET | `/runs/:runId` | Get single run with full outputs |
| GET | `/runs/neighbors?run_id=...` | Get prev/next run IDs for navigation |
| PATCH | `/runs/:runId` | Update run notes or HITL feedback |

Response shape: `{ data: Run[], total: number }` or bare `Run[]` (both handled).

### Agents — `src/shared/api/agents.api.ts`
| Method | Path | Purpose |
|---|---|---|
| GET | `/agents` | List all available agents |
| POST | `/agents` | Create a new agent |
| PATCH | `/agents/:agentId` | Update an agent |
| DELETE | `/agents/:agentId` | Delete an agent |
| POST | `/run_downstream` | Execute a downstream agent on a run (body: `{ run_id, module_id, selected_outputs }`) |

### Transcripts — `src/shared/api/transcripts.api.ts`
| Method | Path | Purpose |
|---|---|---|
| GET | `/transcripts` | List transcripts (params: `limit`, `offset`) |
| GET | `/transcripts/:id` | Get single transcript with raw text |

Response shape: `{ data: Transcript[], total: number }` or bare `Transcript[]` (both handled).

### Opportunities — `src/shared/api/opportunities.api.ts`
| Method | Path | Purpose |
|---|---|---|
| GET | `/opportunities` | List all opportunities (for kanban board) |
| PATCH | `/opportunities/:id` | Update opportunity stage (`New`, `In progress`, `Won`, `Lost`) |

### Prompt Sets / Templates / Practices — `src/modules/extraction/pages/Simulator.tsx`
Called directly via `apiClient` (not through a dedicated API module):
| Method | Path | Purpose |
|---|---|---|
| GET | `/prompt_sets` | List available prompt sets for Simulator |
| GET | `/prompt_templates` | List available prompt templates for Simulator |
| GET | `/practices` | List practices for practice library selection |
| POST | `/run_extraction` | Execute a new extraction run from the Simulator |

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Environment Configuration

**Required env vars:**
- None strictly required — app defaults to `/api` proxy when `VITE_API_URL` is unset

**Optional env vars:**
- `VITE_API_URL` — set to override the proxy and connect directly to a backend URL (e.g., `https://prompt-runner-production.up.railway.app` for local testing without proxy)

**Secrets location:**
- No secrets stored in this frontend repo
- Railway backend URL is public (`https://prompt-runner-production.up.railway.app`) and appears in both `vite.config.ts` and `vercel.json`

---

*Integration audit: 2026-03-27*
