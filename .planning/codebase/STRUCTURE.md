# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```
ie-interface/
├── src/
│   ├── App.tsx                    # Root: module registration + router construction
│   ├── main.tsx                   # Vite entry point (mounts App)
│   ├── shell/                     # App shell — layout, nav, module contract
│   │   ├── ModuleRegistry.ts      # TestModule interface + moduleToRoutes()
│   │   ├── Layout.tsx             # AppBar, nav buttons, Outlet, footer
│   │   ├── HomePage.tsx           # Landing page with module cards grid
│   │   └── ErrorBoundary.tsx      # Class component error boundary for Outlet
│   ├── modules/                   # Self-contained test modules
│   │   ├── extraction/            # Prompt simulator + JSON preview
│   │   │   ├── index.tsx          # TestModule descriptor (extractionModule)
│   │   │   ├── pages/
│   │   │   │   ├── Simulator.tsx  # Run prompts → view output in cards
│   │   │   │   └── JsonPreview.tsx # Paste JSON → preview card rendering
│   │   │   ├── components/
│   │   │   │   └── IntelligenceRenderer.tsx  # Renders full Intelligence tab layout
│   │   │   └── utils/
│   │   │       └── extractionToCards.ts      # Maps raw prompt JSON → MappedCardData
│   │   ├── runs/                  # Browse runs, view outputs, trigger agents
│   │   │   ├── index.tsx          # TestModule descriptor (runsModule)
│   │   │   ├── pages/
│   │   │   │   ├── RunsList.tsx   # Paginated run list with transcript filter
│   │   │   │   ├── RunDetail.tsx  # Single run: layers, cards, agent triggers
│   │   │   │   └── Agents.tsx     # Agent management (list, create, delete)
│   │   │   ├── components/
│   │   │   │   └── AgentViewer/   # Typed rendering for downstream agent outputs
│   │   │   │       ├── AgentOutputCard.tsx   # Dispatcher: routes to typed card
│   │   │   │       ├── CoachingReportCard.tsx
│   │   │   │       ├── MetricsPanel.tsx
│   │   │   │       ├── ObjectionsCard.tsx
│   │   │   │       ├── ProductsServicesCard.tsx
│   │   │   │       └── SummaryCard.tsx
│   │   │   └── utils/
│   │   │       ├── runOutputToLayers.ts  # RunOutputs → ExtractionLayers (summary view)
│   │   │       └── runOutputToCards.ts   # RunOutputs → Card[] (detail view)
│   │   ├── opportunities/         # Kanban board for consultation opportunities
│   │   │   ├── index.tsx          # TestModule descriptor (opportunitiesModule)
│   │   │   └── pages/
│   │   │       └── OpportunitiesBoard.tsx
│   │   └── dashboard/             # KPI analytics and charts
│   │       ├── index.tsx          # TestModule descriptor (dashboardModule)
│   │       └── pages/
│   │           └── Dashboard.tsx
│   └── shared/                    # Cross-cutting code; never imports from modules/
│       ├── api/                   # API client and typed service functions
│       │   ├── client.ts          # Axios instance with proxy config + error interceptor
│       │   ├── index.ts           # Barrel export for all API symbols
│       │   ├── types.ts           # API response types (Run, Opportunity, Transcript, V2*)
│       │   ├── agentOutputs.ts    # Agent output types + detectOutputType() + mock data
│       │   ├── runs.api.ts        # runsApi: list, getById, getNeighbors, update
│       │   ├── agents.api.ts      # agentsApi: list, runDownstream, create, update, delete
│       │   ├── opportunities.api.ts
│       │   └── transcripts.api.ts
│       ├── cards/                 # Production card components (ported from a360-web-app)
│       │   ├── index.ts           # Barrel: re-exports base + intelligence
│       │   ├── base/              # Generic card primitives
│       │   │   ├── index.ts
│       │   │   ├── BaseAccordion.tsx
│       │   │   ├── EvidenceCard.tsx
│       │   │   ├── StatisticCard.tsx
│       │   │   ├── SummaryCard.tsx
│       │   │   └── ValueAccordionCard.tsx
│       │   └── intelligence/      # Intelligence tab domain cards
│       │       ├── index.ts
│       │       ├── GeneralSummarySection.tsx
│       │       ├── PatientGoalsCard.tsx
│       │       ├── ProductsServicesCardV2.tsx
│       │       ├── ObjectionsCard.tsx
│       │       ├── NextStepsTimelineCard.tsx
│       │       ├── VisitChecklistCardV2.tsx
│       │       ├── VisitContextCard.tsx
│       │       ├── CrossSellCardV3.tsx
│       │       ├── FutureInterestsCard.tsx
│       │       ├── ConcernsCard.tsx
│       │       └── AreasCard.tsx
│       ├── components/            # Shared UI building blocks (not domain cards)
│       │   ├── PageHeader.tsx
│       │   ├── EmptyState.tsx
│       │   └── MDChip.tsx
│       ├── constants/
│       │   └── routes.ts          # ROUTES const + runDetailPath() helper
│       ├── styles/
│       │   └── theme/             # MUI theme definition
│       └── utils/
│           ├── normalize.ts       # formatCurrency and similar formatters
│           └── versionDetect.ts   # detectExtractionVersion(outputs) → 'v1'|'v2'|'unknown'
├── .planning/
│   └── codebase/                  # GSD codebase map documents
├── .vercel/
│   └── project.json               # Vercel project config (deployment)
├── .claude/
│   └── launch.json
├── package.json
├── tsconfig.json                  # Strict TS, @/* alias to src/*
├── tsconfig.node.json
└── vite.config.ts                 # React plugin, @/ alias, /api proxy to Railway
```

## Directory Purposes

**`src/shell/`:**
- Purpose: App frame that is module-agnostic; only knows about the `TestModule` interface
- Key files: `ModuleRegistry.ts` (the contract), `Layout.tsx` (persistent chrome), `HomePage.tsx` (module discovery)
- Rule: Shell components receive modules as props. They do not import specific modules directly.

**`src/modules/`:**
- Purpose: One subdirectory per test capability; each is fully self-contained
- Each module directory must contain: `index.tsx` exporting a `TestModule` constant
- A module may contain: `pages/`, `components/`, `utils/` subdirectories
- Rule: Modules may import from `src/shared/`. They must not import from other modules.

**`src/shared/api/`:**
- Purpose: All HTTP communication lives here; no `axios` calls elsewhere
- `client.ts` is the single Axios instance — all API functions use it
- `types.ts` owns the API response type hierarchy
- `agentOutputs.ts` owns the downstream agent output type system and `detectOutputType()`

**`src/shared/cards/`:**
- Purpose: Production-mirror card components; must stay in sync with `a360-web-app` Intelligence tab
- `base/` — generic layout primitives (accordion, statistic, summary, evidence)
- `intelligence/` — domain-specific cards consuming production data shapes
- Import via barrel: `import { PatientGoalsCard } from '@/shared/cards'`

**`src/shared/components/`:**
- Purpose: Lightweight shared UI atoms that are not domain cards (`PageHeader`, `EmptyState`, `MDChip`)

## Key File Locations

**Entry Points:**
- `src/App.tsx`: Module registration, router construction, theme/toast providers
- `src/main.tsx`: Vite entry, mounts App into DOM

**Configuration:**
- `vite.config.ts`: Vite plugins, `@/` alias, `/api` dev proxy to Railway
- `tsconfig.json`: TypeScript strict mode, `@/*` path alias
- `package.json`: Dependencies and build scripts

**Module Registration:**
- `src/shell/ModuleRegistry.ts`: `TestModule` interface, `ModuleRoute` interface, `moduleToRoutes()`

**API Layer:**
- `src/shared/api/client.ts`: Axios instance (only place that creates an axios client)
- `src/shared/api/types.ts`: All API response types (`Run`, `V2Pass1Output`, `Opportunity`, etc.)
- `src/shared/api/index.ts`: Single import point for all API symbols

**Card System:**
- `src/shared/cards/index.ts`: Barrel for all card exports
- `src/modules/extraction/utils/extractionToCards.ts`: Critical mapping layer (prompt JSON → card props)
- `src/modules/extraction/components/IntelligenceRenderer.tsx`: Production-equivalent tab layout

**Utilities:**
- `src/shared/utils/versionDetect.ts`: V1/V2 extraction format detection
- `src/shared/constants/routes.ts`: Route string constants and path builder functions

## Naming Conventions

**Files:**
- Pages: PascalCase matching the component name — `RunDetail.tsx`, `Simulator.tsx`
- API modules: camelCase with `.api.ts` suffix — `runs.api.ts`, `agents.api.ts`
- Utility files: camelCase — `extractionToCards.ts`, `versionDetect.ts`
- Type-only files: camelCase — `types.ts`, `agentOutputs.ts`
- Barrel files: `index.ts` or `index.tsx`

**Directories:**
- Modules: kebab-case matching the module `id` — `extraction/`, `runs/`, `opportunities/`
- Shared subdirectories: kebab-case — `api/`, `cards/`, `components/`, `styles/`, `utils/`

**Components:**
- PascalCase function components matching filename — `export function Layout()`
- Named exports only (no default exports from component files, except `App.tsx`)

## How to Add a New Module

1. Create `src/modules/{name}/` directory

2. Create `src/modules/{name}/pages/MyPage.tsx` — the main page component

3. Create `src/modules/{name}/index.tsx`:
```typescript
import type { TestModule } from '@/shell/ModuleRegistry';
import SomeIcon from '@mui/icons-material/SomeIcon';
import { MyPage } from './pages/MyPage';

export const myModule: TestModule = {
  id: 'my-module',
  name: 'My Module',
  description: 'What this module does.',
  icon: SomeIcon,
  basePath: '/my-module',
  routes: [
    { path: '', label: 'Main Page', element: <MyPage /> },
  ],
};
```

4. Register in `src/App.tsx`:
```typescript
import { myModule } from '@/modules/my-module';
const modules = [...existingModules, myModule];
```

That's it. The shell auto-generates nav buttons and home page cards from the descriptor.

**Optional extras:**
- Add `components/` for module-specific sub-components
- Add `utils/` for module-specific data transformation functions
- Set `hidden: true` on the descriptor to suppress from nav/home during development

## Where to Add New Code

**New API endpoint:**
- Add typed function to the appropriate `src/shared/api/*.api.ts` file
- Add response types to `src/shared/api/types.ts`
- Export from `src/shared/api/index.ts`

**New card component (production mirror):**
- Add to `src/shared/cards/intelligence/` (domain card) or `src/shared/cards/base/` (primitive)
- Export from the appropriate `index.ts` barrel
- Keep prop interface in sync with `a360-web-app` production

**New shared utility:**
- Add to `src/shared/utils/{name}.ts`
- No barrel needed — import directly by path

**New page within existing module:**
- Add page file to `src/modules/{module}/pages/`
- Add a `ModuleRoute` entry to the module's `index.tsx` descriptor

**New route constant:**
- Add to `src/shared/constants/routes.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD codebase map documents
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes

**`node_modules/`:**
- Generated: Yes
- Committed: No

**`dist/`:**
- Purpose: Vite build output
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-27*
