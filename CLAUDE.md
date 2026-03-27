<!-- GSD:project-start source:PROJECT.md -->
## Project

**A360 Pulse — Project Context**

**A360 Pulse** is a modular web platform that mirrors the A360 production environment, enabling Chris to build, test, demo, and share modules with external users. It's the professional, shareable face of the A360 prototyping ecosystem.

**Core Value:** **Build modules once, share them with anyone — customized per user, with controlled data access.**
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.8 — all source code under `src/`
- ES2022 with DOM and DOM.Iterable libs
- Strict mode enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
## Runtime
- Browser (SPA — no SSR)
- npm (lockfile present via `npm install --force` in Vercel install command)
## Frameworks
- React 19.0 — UI rendering (`src/App.tsx`, all components)
- React DOM 19.0 — DOM mounting (`src/main.tsx`)
- React Router DOM 7.9 — `createBrowserRouter` with nested routes and module-auto-registration pattern (`src/App.tsx`, `src/shell/ModuleRegistry.ts`)
- Vite 6.2 with `@vitejs/plugin-react` 4.3 — dev server on port 3001, `@` alias for `src/`
- TypeScript compiler (`tsc -b`) runs before Vite build
- Config: `vite.config.ts`
- `tsconfig.json` — app source (`src/`)
- `tsconfig.node.json` — Vite config files
- Path alias: `@/*` → `src/*`
## UI Library
- `@mui/material` 7.2 — component library
- `@mui/icons-material` 7.3 — icon set
- `@emotion/react` 11.14 + `@emotion/styled` 11.14 — MUI styling engine
- `@mui/x-charts` 7.22 — chart components
- `@mui/x-date-pickers` 8.7 — date picker components (paired with `date-fns` 3.6 as adapter)
- Theme defined in `src/shared/styles/theme/index.ts` via `createTheme()`
- Palette defined in `src/shared/styles/theme/palette.ts`
- Brand primary: `#547BA3` (A360 slate blue)
- Font: `"Plus Jakarta Sans"`, Inter, Helvetica Neue, Arial
- Design tokens exported: `tokens.boxShadows`, `tokens.borderRadius` (xs=4, sm=6, md=8, lg=12, xl=16, full=9999)
- Component overrides defined for: MuiButton, MuiCard, MuiCardContent, MuiChip, MuiTextField, MuiOutlinedInput, MuiAppBar, MuiToolbar, MuiLinearProgress, MuiDivider, MuiDialog, MuiTooltip, MuiAlert, MuiTableCell, MuiTableRow
- `ThemeProvider` wraps the entire app in `src/App.tsx`
- Re-exports: `import { palette, colors } from '@/shared/styles/theme'`
## State Management
- Zustand 5.0 — installed but no stores detected in current source (all state is local React `useState`/`useEffect` within page components)
- `useState` / `useEffect` / `useCallback` used throughout page components
## HTTP Client
- `baseURL`: `VITE_API_URL` env var → falls back to `/api` (proxied in dev, rewritten in production)
- Default header: `Content-Type: application/json`
- Response interceptor: extracts `err.response?.data?.detail` for error messages, returns `Promise.reject(new Error(...))`
- `runs.api.ts` — `runsApi`
- `agents.api.ts` — `agentsApi`
- `transcripts.api.ts` — `transcriptsApi`
- `opportunities.api.ts` — `opportunitiesApi`
- Barrel export: `src/shared/api/index.ts`
## Forms
## Drag-and-Drop
## Notifications
- Mounted in `src/App.tsx`: `<ToastContainer position="bottom-right" theme="light" />`
- CSS imported: `react-toastify/dist/ReactToastify.css`
## Date Handling
## Key Dev Dependencies
- `@types/node` 22 — Node type definitions for Vite config
- `@types/react` 19, `@types/react-dom` 19 — React type definitions
- `@rollup/rollup-win32-x64-msvc` 4.60 — Windows-specific Rollup native binding (required for Vite on Windows)
- ESLint — `eslint . --ext ts,tsx` (config files not detected in root; may be in `package.json` or separate config)
## Configuration
- `VITE_API_URL` — optional; overrides base URL for direct backend connection (skips `/api` proxy)
- `npm run build` → `tsc -b && vite build`
- `npm run dev` → `vite` (dev server port 3001)
- `npm run preview` → `vite preview`
- `npm run lint` → `eslint . --ext ts,tsx`
## Platform Requirements
- Node with npm
- Windows build requires `@rollup/rollup-win32-x64-msvc` (included as dependency)
- Vercel (static SPA hosting with rewrites — see INTEGRATIONS.md)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## TypeScript Configuration
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- Target: `ES2022`, module resolution: `bundler`
- `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- Use `@/` for all cross-directory imports: `import { SummaryCard } from '@/shared/cards'`
- Relative imports are only used within the same directory
- Types are co-located with their component or module, not centralized
- API types are centralized in `src/shared/api/types.ts`
- Card prop types are exported from the card file, re-exported from barrel `index.ts`
- Example: `export type { ProductItemV2 } from './ProductsServicesCardV2'`
- Use `type` keyword on imports when importing types: `import type { CardProps } from '@mui/material/Card'`
## React Patterns
- All components are functional components using `React.FC<Props>` annotation
- Props interface is defined as a `type` (not `interface`) immediately above the component
- Component props types are named `[ComponentName]Props` for exported components
- Private sub-components within the same file use shorter type names (e.g., `type EvidenceCardProps`)
- `useState` for local UI state (expand/collapse, loading)
- State kept as close to use as possible — no global state in this codebase
- No Zustand or other state libraries used (dependencies exist but no stores implemented)
- Private sub-components (used only within the parent file) are defined above the exported component
- Named with PascalCase, not exported, not moved to separate files
- Example pattern in `src/shared/cards/intelligence/PatientGoalsCard.tsx`: `SectionCard`, `BulletList`
- Base components wrap lower-level MUI; intelligence cards wrap base components
- `SummaryCard` wraps `SummaryCardRoot` (styled Card)
- `ValueAccordionCard` wraps `BaseAccordion`
- `CrossSellCardV3` wraps `ValueAccordionCard`
## Import Organization
- Always use deep path imports, never barrel: `import Card from '@mui/material/Card'` not `import { Card } from '@mui/material'`
- Each MUI component on its own import line
- Every directory that exports publicly has an `index.ts` barrel
- `src/shared/cards/index.ts` re-exports `./base` and `./intelligence` with `export *`
- `src/shared/cards/base/index.ts` and `src/shared/cards/intelligence/index.ts` export named symbols
- `src/shared/api/index.ts` exports named APIs and types
- Modules each have `src/modules/[name]/index.tsx` exporting the module definition object
## Card Component Patterns
- Generic, reusable, no business logic
- `SummaryCard` — titled container with optional scroll and icon badge
- `BaseAccordion` — expandable card with header slot, info tooltip, keyboard accessible
- `ValueAccordionCard` — extends BaseAccordion with percentage + ProgressBar header
- `StatisticCard` — label/value display with optional tooltip
- `EvidenceCard` — score chip + italic snippet
- Styled primitives: `IconBadge`, `SummaryCardRoot`, `ProgressBar` (from `Card.styles.ts`)
- Domain-specific, composed from base cards
- Named with the domain concept: `PatientGoalsCard`, `ObjectionsCard`, `ProductsServicesCardV2`
- Versioned with suffix when updated: `V2`, `V3` (e.g., `ProductsServicesCardV2`, `CrossSellCardV3`)
- Each file contains the card component + any private sub-components + exported prop types
- Minimal props — only what the card needs to render
- Strings over objects where possible
- Arrays of typed items for list content
- Optional props use `?` with sensible defaults
- Example: `type PatientGoalsCardProps = { goals: string[]; anticipatedOutcomes: string[]; statedInterests: string[] }`
## API Client Patterns
- Single Axios instance, base URL from `VITE_API_URL` env var or `/api` default
- Error interceptor normalizes error messages: extracts `err.response?.data?.detail` or `err.message`
- All API modules use this shared `client`
- One file per resource: `runs.api.ts`, `opportunities.api.ts`, `transcripts.api.ts`, `agents.api.ts`
- Each exports a single object (e.g., `runsApi`) with methods
- Methods return unwrapped data (`.then(r => r.data)`) — callers receive typed data, not Axios responses
- Generic type parameter on `client.get<T>` specifies expected response shape
- Centralized API type definitions
- Uses `[key: string]: unknown` index signature for backend shapes that may have extra fields
- Deprecated fields documented with `@deprecated` JSDoc
- V2 types prefixed with `V2`: `V2Pass1Output`, `V2Offering`, `V2VisitContext`
## Styling Approach
- `palette.primary.main` = `#547BA3`
- `palette.success.*`, `palette.warning.*`, `palette.error.*` — semantic colors
- `GREY_COLORS[50]` through `[900]` — grey scale
- Named surface tokens in palette: `surfaceSoft` (`#F9FAFB`), `surfaceMedium` (`#F2F4F7`), `surfaceStrong` (`#EAECF0`)
- Use `styled()` from `@mui/material/styles` for structural/reusable styled components (see `Card.styles.ts`)
- Use `sx` prop for one-off layout tweaks and responsive values
- Responsive spacing via `sx={{ p: { xs: 1.5, sm: 2 } }}` — all cards use this pattern
- Do NOT use hardcoded hex colors for semantic colors — use `color="primary"`, `color="error"`, etc. on MUI components
- Exception: structural background colors can use hardcoded tokens that match the palette (e.g., `'#F9FAFB'`)
- `Card` with `variant="outlined"` for secondary/nested cards
- `SummaryCardRoot` (from `Card.styles.ts`) for top-level section cards (renders with `#F9FAFB` background)
- `Stack` with `gap` prop for vertical/horizontal spacing (not `spacing` from Grid)
- `Grid` v2 API with `size={{ xs: 12, sm: 6 }}` (not deprecated `xs={12}` prop)
- Typography variants: `subtitle2 fontWeight={600}` for card titles, `body2` for secondary text, `overline` for field labels
## MDChip vs Chip Usage
- Production-faithful chip matching `a360-web-app`'s `MDChip`
- Key feature: `variant="soft"` renders tinted background + colored text (not solid fill)
- `isSquare` prop sets `borderRadius: 4px`
- Default: `variant="soft"`, `color="default"`
- Use MDChip when rendering chips that need the soft tinted appearance matching production
- Used in currently-ported cards: `EvidenceCard`, `ObjectionsCard`, `ProductsServicesCardV2`
- These cards use `<Chip ... sx={{ borderRadius: 1 }} />` for square-ish corners
- This is a known gap from production — MDChip `variant="soft"` should replace plain Chip in these cards
## Module Structure
## Comments and Documentation
- Named `TYPE_COLORS`, `STATUS_COLORS`, `SOFT_COLOR_MAP` etc.
- Typed as `Record<UnionType, MUIColorType>` for exhaustiveness
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- A declarative `TestModule` descriptor drives all routing and navigation — no ad hoc route definitions
- Shared cards are direct ports from `a360-web-app` production; the testing platform renders the same components
- Single axios client in `src/shared/api/client.ts` proxies through Vite (dev) or Vercel rewrites (prod) to the prompt-runner backend on Railway
- No global state manager (no Zustand store in use); all state is local `useState` within pages
## Layers
- Purpose: App frame — theme, routing, navigation bar, error boundary
- Location: `src/shell/`
- Contains: `Layout.tsx`, `HomePage.tsx`, `ModuleRegistry.ts`, `ErrorBoundary.tsx`
- Depends on: registered module array passed down from `App.tsx`
- Used by: `App.tsx` as the root route element
- Purpose: Self-contained test capabilities, each owning its pages, components, and utils
- Location: `src/modules/{module-name}/`
- Contains: `index.tsx` (descriptor), `pages/`, `components/`, `utils/`
- Depends on: `src/shared/` (API client, cards, components)
- Used by: `App.tsx` — registered in the `modules` array, routes auto-generated via `moduleToRoutes()`
- Purpose: Cross-cutting code — API client, production card components, UI primitives, utilities
- Location: `src/shared/`
- Contains: `api/`, `cards/`, `components/`, `constants/`, `styles/`, `utils/`
- Depends on: MUI, axios, date-fns only
- Used by: all modules; never imports from modules
## Module Registration Contract
```typescript
```
```typescript
```
## Data Flow
- No Zustand store. All page-level state is `useState` / `useEffect` within each page component.
- API calls are direct (no query cache layer) — each page owns its loading/error state.
## Key Abstractions
- Purpose: Declarative registration object that fully describes a module's identity, routing, and nav presence
- Examples: `src/modules/extraction/index.tsx`, `src/modules/runs/index.tsx`
- Pattern: Each module's `index.tsx` imports its page components and exports a single `TestModule` constant
- Purpose: Production-equivalent card components ported from `a360-web-app` Intelligence tab
- Base cards: `BaseAccordion`, `EvidenceCard`, `StatisticCard`, `SummaryCard`, `ValueAccordionCard`
- Intelligence cards: `GeneralSummarySection`, `PatientGoalsCard`, `ProductsServicesCardV2`, `ObjectionsCard`, `NextStepsTimelineCard`, `VisitChecklistCardV2`, `VisitContextCard`, `CrossSellCardV3`, `FutureInterestsCard`, `ConcernsCard`, `AreasCard`
- Re-exported from `src/shared/cards/index.ts` as a single barrel
- Axios instance with `baseURL = VITE_API_URL || '/api'`
- Vite dev server proxies `/api` to `https://prompt-runner-production.up.railway.app` (strips `/api` prefix)
- Vercel rewrites handle the same proxy in production
- Error interceptor normalises `err.response.data.detail` into `Error` objects
- Canonical TypeScript types for all downstream agent output shapes: `consultation_intelligence`, `tcp`, `soap_note`, `kpi_evaluation`, `opportunity_extraction`, `coaching_report`
- Mirrors the A360 platform KPI data model from `CLAUDE.md`
- `detectOutputType()` heuristic identifies output type from response structure
## Entry Points
- Standard Vite + React entry; mounts `<App />` into `#root`
- Location: `src/App.tsx`
- Triggers: application load
- Responsibilities: Registers all modules, constructs the `createBrowserRouter` tree, wraps everything in `ThemeProvider` and `ToastContainer`
- Location: `src/modules/{name}/index.tsx`
- Triggers: imported by `App.tsx`
- Responsibilities: Declare module descriptor — routes and page components are defined here, not in App
## Error Handling
- `RouteErrorFallback` in `App.tsx` catches React Router route-level errors (e.g. lazy load failures, thrown from loaders)
- `ErrorBoundary` class component in `src/shell/ErrorBoundary.tsx` wraps the `<Outlet />` in `Layout.tsx` — catches render errors in any module page
- Both render centered error UI with the error message and a retry affordance
- API errors are normalised to `Error` objects by the axios interceptor; pages handle them with local `error` state
## Cross-Cutting Concerns
- Dev: Vite `server.proxy` rewrites `/api/*` → `https://prompt-runner-production.up.railway.app/*`
- Prod: Vercel rewrite handles same transformation; `VITE_API_URL` env var can override for direct connection
## Relationship to Production (`a360-web-app`)
| This repo | Production (`a360-web-app`) |
|-----------|----------------------------|
| `src/shared/cards/base/BaseAccordion.tsx` | `src/components/Card/BaseAccordion.tsx` |
| `src/shared/cards/intelligence/*.tsx` | `src/.../Intelligence/components/*.tsx` |
| `IntelligenceRenderer.tsx` | `IntelligenceTabContent.tsx` |
| `extractionToCards.ts` | Production data mapping layer |
| `agentOutputs.ts` | Mirrors `tremor-agent-viewer/src/types/agentOutputs.ts` |
## Relationship to Prompt Runner Backend
- `GET /runs` — list extraction runs
- `GET /runs/:id` — single run with layered outputs (`prompt_1`, `prompt_2`, `prompt_3`, `downstream`)
- `GET /runs/neighbors` — prev/next run navigation
- `PATCH /runs/:id` — save notes and HITL feedback
- `GET /transcripts` — list available transcripts
- `GET /agents` — list downstream agents
- `POST /run_downstream` — trigger an agent against a run
- `GET /prompt_sets`, `GET /prompt_templates` — prompt configuration (Simulator page)
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
