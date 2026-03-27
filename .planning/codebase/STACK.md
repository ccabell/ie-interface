# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- TypeScript 5.8 — all source code under `src/`

**Compilation Target:**
- ES2022 with DOM and DOM.Iterable libs
- Strict mode enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)

## Runtime

**Environment:**
- Browser (SPA — no SSR)

**Package Manager:**
- npm (lockfile present via `npm install --force` in Vercel install command)

## Frameworks

**Core:**
- React 19.0 — UI rendering (`src/App.tsx`, all components)
- React DOM 19.0 — DOM mounting (`src/main.tsx`)

**Routing:**
- React Router DOM 7.9 — `createBrowserRouter` with nested routes and module-auto-registration pattern (`src/App.tsx`, `src/shell/ModuleRegistry.ts`)

**Build/Dev:**
- Vite 6.2 with `@vitejs/plugin-react` 4.3 — dev server on port 3001, `@` alias for `src/`
- TypeScript compiler (`tsc -b`) runs before Vite build
- Config: `vite.config.ts`

**TypeScript Config:**
- `tsconfig.json` — app source (`src/`)
- `tsconfig.node.json` — Vite config files
- Path alias: `@/*` → `src/*`

## UI Library

**Core:**
- `@mui/material` 7.2 — component library
- `@mui/icons-material` 7.3 — icon set
- `@emotion/react` 11.14 + `@emotion/styled` 11.14 — MUI styling engine

**Extended MUI:**
- `@mui/x-charts` 7.22 — chart components
- `@mui/x-date-pickers` 8.7 — date picker components (paired with `date-fns` 3.6 as adapter)

**Theme System:**
- Theme defined in `src/shared/styles/theme/index.ts` via `createTheme()`
- Palette defined in `src/shared/styles/theme/palette.ts`
- Brand primary: `#547BA3` (A360 slate blue)
- Font: `"Plus Jakarta Sans"`, Inter, Helvetica Neue, Arial
- Design tokens exported: `tokens.boxShadows`, `tokens.borderRadius` (xs=4, sm=6, md=8, lg=12, xl=16, full=9999)
- Component overrides defined for: MuiButton, MuiCard, MuiCardContent, MuiChip, MuiTextField, MuiOutlinedInput, MuiAppBar, MuiToolbar, MuiLinearProgress, MuiDivider, MuiDialog, MuiTooltip, MuiAlert, MuiTableCell, MuiTableRow
- `ThemeProvider` wraps the entire app in `src/App.tsx`
- Re-exports: `import { palette, colors } from '@/shared/styles/theme'`

## State Management

**Global State:**
- Zustand 5.0 — installed but no stores detected in current source (all state is local React `useState`/`useEffect` within page components)

**Local State:**
- `useState` / `useEffect` / `useCallback` used throughout page components

## HTTP Client

**Library:** Axios 1.7

**Client singleton:** `src/shared/api/client.ts`
- `baseURL`: `VITE_API_URL` env var → falls back to `/api` (proxied in dev, rewritten in production)
- Default header: `Content-Type: application/json`
- Response interceptor: extracts `err.response?.data?.detail` for error messages, returns `Promise.reject(new Error(...))`

**API modules** (all under `src/shared/api/`):
- `runs.api.ts` — `runsApi`
- `agents.api.ts` — `agentsApi`
- `transcripts.api.ts` — `transcriptsApi`
- `opportunities.api.ts` — `opportunitiesApi`
- Barrel export: `src/shared/api/index.ts`

## Forms

**Library:** React Hook Form 7.54 with `@hookform/resolvers` 4.1
**Validation:** Yup 1.6

## Drag-and-Drop

**Library:** `@dnd-kit/core` 6.3, `@dnd-kit/sortable` 10.0, `@dnd-kit/utilities` 3.2

**Used in:** Opportunities Kanban board (`src/modules/opportunities/pages/OpportunitiesBoard.tsx`)

## Notifications

**Library:** react-toastify 10.0
- Mounted in `src/App.tsx`: `<ToastContainer position="bottom-right" theme="light" />`
- CSS imported: `react-toastify/dist/ReactToastify.css`

## Date Handling

**Library:** date-fns 3.6 — used as MUI date picker adapter

## Key Dev Dependencies

- `@types/node` 22 — Node type definitions for Vite config
- `@types/react` 19, `@types/react-dom` 19 — React type definitions
- `@rollup/rollup-win32-x64-msvc` 4.60 — Windows-specific Rollup native binding (required for Vite on Windows)
- ESLint — `eslint . --ext ts,tsx` (config files not detected in root; may be in `package.json` or separate config)

## Configuration

**Environment Variables:**
- `VITE_API_URL` — optional; overrides base URL for direct backend connection (skips `/api` proxy)

**Build:**
- `npm run build` → `tsc -b && vite build`
- `npm run dev` → `vite` (dev server port 3001)
- `npm run preview` → `vite preview`
- `npm run lint` → `eslint . --ext ts,tsx`

## Platform Requirements

**Development:**
- Node with npm
- Windows build requires `@rollup/rollup-win32-x64-msvc` (included as dependency)

**Production:**
- Vercel (static SPA hosting with rewrites — see INTEGRATIONS.md)

---

*Stack analysis: 2026-03-27*
