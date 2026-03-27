# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Module-registration shell with shared component library

**Key Characteristics:**
- A declarative `TestModule` descriptor drives all routing and navigation — no ad hoc route definitions
- Shared cards are direct ports from `a360-web-app` production; the testing platform renders the same components
- Single axios client in `src/shared/api/client.ts` proxies through Vite (dev) or Vercel rewrites (prod) to the prompt-runner backend on Railway
- No global state manager (no Zustand store in use); all state is local `useState` within pages

## Layers

**Shell:**
- Purpose: App frame — theme, routing, navigation bar, error boundary
- Location: `src/shell/`
- Contains: `Layout.tsx`, `HomePage.tsx`, `ModuleRegistry.ts`, `ErrorBoundary.tsx`
- Depends on: registered module array passed down from `App.tsx`
- Used by: `App.tsx` as the root route element

**Module Layer:**
- Purpose: Self-contained test capabilities, each owning its pages, components, and utils
- Location: `src/modules/{module-name}/`
- Contains: `index.tsx` (descriptor), `pages/`, `components/`, `utils/`
- Depends on: `src/shared/` (API client, cards, components)
- Used by: `App.tsx` — registered in the `modules` array, routes auto-generated via `moduleToRoutes()`

**Shared Layer:**
- Purpose: Cross-cutting code — API client, production card components, UI primitives, utilities
- Location: `src/shared/`
- Contains: `api/`, `cards/`, `components/`, `constants/`, `styles/`, `utils/`
- Depends on: MUI, axios, date-fns only
- Used by: all modules; never imports from modules

## Module Registration Contract

Every module exports a `TestModule` object conforming to the interface in `src/shell/ModuleRegistry.ts`:

```typescript
export interface TestModule {
  id: string;            // kebab-case unique identifier
  name: string;          // display name for nav and home page
  description: string;   // shown on the home page module card
  icon: SvgIconComponent; // MUI icon
  basePath: string;      // e.g. '/extraction'
  routes: ModuleRoute[]; // sub-routes with path, label, element
  hidden?: boolean;      // opt out of nav / home listing
}
```

Registration happens by adding to the `modules` array in `src/App.tsx`:

```typescript
import { extractionModule } from '@/modules/extraction';
const modules = [extractionModule, runsModule, opportunitiesModule, dashboardModule];
```

`moduleToRoutes()` in `ModuleRegistry.ts` flattens module routes into React Router children. The shell `Layout` and `HomePage` components receive the array and generate nav buttons and home cards automatically.

## Data Flow

**Extraction / Simulator flow:**

1. `Simulator.tsx` fetches prompt sets, transcripts, and runs from prompt-runner via `src/shared/api/client.ts`
2. User triggers a run — response is raw JSON from the prompt-runner backend
3. `extractionToCards.ts` maps raw JSON to `MappedCardData` prop shapes
4. `IntelligenceRenderer.tsx` receives `MappedCardData` and renders shared card components from `src/shared/cards/`

**Run Explorer flow:**

1. `RunsList.tsx` calls `runsApi.list()` → list of `Run` objects
2. `RunDetail.tsx` calls `runsApi.getById(runId)` → single `Run` with `outputs` (`prompt_1`, `prompt_2`, `prompt_3`, `downstream`)
3. `runOutputToLayers.ts` normalises V1 and V2 output shapes into `ExtractionLayers` for summary display
4. `runOutputToCards.ts` maps outputs to typed `Card` objects for the local `CardRenderer`
5. Downstream agents can be triggered via `agentsApi.runDownstream()` — results surface in `outputs.downstream`

**Extraction Version Handling:**

The backend emits two extraction formats. `detectExtractionVersion()` in `src/shared/utils/versionDetect.ts` inspects `prompt_1.parsed_json` to determine `'v1' | 'v2' | 'unknown'`, which drives conditional rendering in `RunDetail.tsx`.

**State Management:**
- No Zustand store. All page-level state is `useState` / `useEffect` within each page component.
- API calls are direct (no query cache layer) — each page owns its loading/error state.

## Key Abstractions

**TestModule Descriptor:**
- Purpose: Declarative registration object that fully describes a module's identity, routing, and nav presence
- Examples: `src/modules/extraction/index.tsx`, `src/modules/runs/index.tsx`
- Pattern: Each module's `index.tsx` imports its page components and exports a single `TestModule` constant

**Shared Card Library (`src/shared/cards/`):**
- Purpose: Production-equivalent card components ported from `a360-web-app` Intelligence tab
- Base cards: `BaseAccordion`, `EvidenceCard`, `StatisticCard`, `SummaryCard`, `ValueAccordionCard`
- Intelligence cards: `GeneralSummarySection`, `PatientGoalsCard`, `ProductsServicesCardV2`, `ObjectionsCard`, `NextStepsTimelineCard`, `VisitChecklistCardV2`, `VisitContextCard`, `CrossSellCardV3`, `FutureInterestsCard`, `ConcernsCard`, `AreasCard`
- Re-exported from `src/shared/cards/index.ts` as a single barrel

**API Client (`src/shared/api/client.ts`):**
- Axios instance with `baseURL = VITE_API_URL || '/api'`
- Vite dev server proxies `/api` to `https://prompt-runner-production.up.railway.app` (strips `/api` prefix)
- Vercel rewrites handle the same proxy in production
- Error interceptor normalises `err.response.data.detail` into `Error` objects

**AgentOutput Types (`src/shared/api/agentOutputs.ts`):**
- Canonical TypeScript types for all downstream agent output shapes: `consultation_intelligence`, `tcp`, `soap_note`, `kpi_evaluation`, `opportunity_extraction`, `coaching_report`
- Mirrors the A360 platform KPI data model from `CLAUDE.md`
- `detectOutputType()` heuristic identifies output type from response structure

## Entry Points

**`src/main.tsx` (implicit):**
- Standard Vite + React entry; mounts `<App />` into `#root`

**`src/App.tsx`:**
- Location: `src/App.tsx`
- Triggers: application load
- Responsibilities: Registers all modules, constructs the `createBrowserRouter` tree, wraps everything in `ThemeProvider` and `ToastContainer`

**Module `index.tsx` files:**
- Location: `src/modules/{name}/index.tsx`
- Triggers: imported by `App.tsx`
- Responsibilities: Declare module descriptor — routes and page components are defined here, not in App

## Error Handling

**Strategy:** Two-level boundary system

**Patterns:**
- `RouteErrorFallback` in `App.tsx` catches React Router route-level errors (e.g. lazy load failures, thrown from loaders)
- `ErrorBoundary` class component in `src/shell/ErrorBoundary.tsx` wraps the `<Outlet />` in `Layout.tsx` — catches render errors in any module page
- Both render centered error UI with the error message and a retry affordance
- API errors are normalised to `Error` objects by the axios interceptor; pages handle them with local `error` state

## Cross-Cutting Concerns

**Theming:** MUI theme defined in `src/shared/styles/theme/`; applied via `ThemeProvider` in `App.tsx`

**Path Aliases:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`)

**Routing:** React Router v7 `createBrowserRouter`; routes are fully flat after `moduleToRoutes()` expansion

**API Proxy:**
- Dev: Vite `server.proxy` rewrites `/api/*` → `https://prompt-runner-production.up.railway.app/*`
- Prod: Vercel rewrite handles same transformation; `VITE_API_URL` env var can override for direct connection

## Relationship to Production (`a360-web-app`)

This repo is an isolated testing harness that mirrors the production Intelligence tab card system:

| This repo | Production (`a360-web-app`) |
|-----------|----------------------------|
| `src/shared/cards/base/BaseAccordion.tsx` | `src/components/Card/BaseAccordion.tsx` |
| `src/shared/cards/intelligence/*.tsx` | `src/.../Intelligence/components/*.tsx` |
| `IntelligenceRenderer.tsx` | `IntelligenceTabContent.tsx` |
| `extractionToCards.ts` | Production data mapping layer |
| `agentOutputs.ts` | Mirrors `tremor-agent-viewer/src/types/agentOutputs.ts` |

Cards are manually kept in sync; changes to production Intelligence tab card props must be reflected here for testing fidelity.

## Relationship to Prompt Runner Backend

The prompt-runner backend runs on Railway (`https://prompt-runner-production.up.railway.app`). This UI is its primary test client.

**Backend endpoints consumed:**
- `GET /runs` — list extraction runs
- `GET /runs/:id` — single run with layered outputs (`prompt_1`, `prompt_2`, `prompt_3`, `downstream`)
- `GET /runs/neighbors` — prev/next run navigation
- `PATCH /runs/:id` — save notes and HITL feedback
- `GET /transcripts` — list available transcripts
- `GET /agents` — list downstream agents
- `POST /run_downstream` — trigger an agent against a run
- `GET /prompt_sets`, `GET /prompt_templates` — prompt configuration (Simulator page)

**Mid-Stream connection:** The `RunDetail` page can trigger "downstream" agent runs via `agentsApi.runDownstream()`, which calls `POST /run_downstream` with `run_id` and `module_id`. Results are stored in `outputs.downstream[agentId]` on the run record and rendered by the `AgentViewer` components in `src/modules/runs/components/AgentViewer/`.

---

*Architecture analysis: 2026-03-27*
