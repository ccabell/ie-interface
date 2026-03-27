# Coding Conventions

**Analysis Date:** 2026-03-27

## TypeScript Configuration

**Strict Mode:** Fully enabled via `tsconfig.json`:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- Target: `ES2022`, module resolution: `bundler`

**Path Alias:**
- `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- Use `@/` for all cross-directory imports: `import { SummaryCard } from '@/shared/cards'`
- Relative imports are only used within the same directory

**Type Exports:**
- Types are co-located with their component or module, not centralized
- API types are centralized in `src/shared/api/types.ts`
- Card prop types are exported from the card file, re-exported from barrel `index.ts`
- Example: `export type { ProductItemV2 } from './ProductsServicesCardV2'`
- Use `type` keyword on imports when importing types: `import type { CardProps } from '@mui/material/Card'`

## React Patterns

**Components:**
- All components are functional components using `React.FC<Props>` annotation
- Props interface is defined as a `type` (not `interface`) immediately above the component
- Component props types are named `[ComponentName]Props` for exported components
- Private sub-components within the same file use shorter type names (e.g., `type EvidenceCardProps`)

**Pattern:**
```typescript
type MyCardProps = {
  title: string;
  items: ItemType[];
  optional?: boolean;
};

export const MyCard: React.FC<MyCardProps> = ({ title, items, optional = false }) => (
  // JSX
);
```

**Hooks:**
- `useState` for local UI state (expand/collapse, loading)
- State kept as close to use as possible — no global state in this codebase
- No Zustand or other state libraries used (dependencies exist but no stores implemented)

**Sub-components:**
- Private sub-components (used only within the parent file) are defined above the exported component
- Named with PascalCase, not exported, not moved to separate files
- Example pattern in `src/shared/cards/intelligence/PatientGoalsCard.tsx`: `SectionCard`, `BulletList`

**Compound component pattern:**
- Base components wrap lower-level MUI; intelligence cards wrap base components
- `SummaryCard` wraps `SummaryCardRoot` (styled Card)
- `ValueAccordionCard` wraps `BaseAccordion`
- `CrossSellCardV3` wraps `ValueAccordionCard`

## Import Organization

**Order (enforced by convention, not linter):**
1. React (only when hooks or types needed — `react-jsx` transform means no bare React import required)
2. MUI component imports (path-specific, e.g., `import Card from '@mui/material/Card'`)
3. MUI icon imports (`import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'`)
4. Internal `@/` imports

**MUI Import Style:**
- Always use deep path imports, never barrel: `import Card from '@mui/material/Card'` not `import { Card } from '@mui/material'`
- Each MUI component on its own import line

**Barrel Files:**
- Every directory that exports publicly has an `index.ts` barrel
- `src/shared/cards/index.ts` re-exports `./base` and `./intelligence` with `export *`
- `src/shared/cards/base/index.ts` and `src/shared/cards/intelligence/index.ts` export named symbols
- `src/shared/api/index.ts` exports named APIs and types
- Modules each have `src/modules/[name]/index.tsx` exporting the module definition object

## Card Component Patterns

**Two-layer card hierarchy:**

**Layer 1 — Base cards** (`src/shared/cards/base/`):
- Generic, reusable, no business logic
- `SummaryCard` — titled container with optional scroll and icon badge
- `BaseAccordion` — expandable card with header slot, info tooltip, keyboard accessible
- `ValueAccordionCard` — extends BaseAccordion with percentage + ProgressBar header
- `StatisticCard` — label/value display with optional tooltip
- `EvidenceCard` — score chip + italic snippet
- Styled primitives: `IconBadge`, `SummaryCardRoot`, `ProgressBar` (from `Card.styles.ts`)

**Layer 2 — Intelligence cards** (`src/shared/cards/intelligence/`):
- Domain-specific, composed from base cards
- Named with the domain concept: `PatientGoalsCard`, `ObjectionsCard`, `ProductsServicesCardV2`
- Versioned with suffix when updated: `V2`, `V3` (e.g., `ProductsServicesCardV2`, `CrossSellCardV3`)
- Each file contains the card component + any private sub-components + exported prop types

**Card props interface conventions:**
- Minimal props — only what the card needs to render
- Strings over objects where possible
- Arrays of typed items for list content
- Optional props use `?` with sensible defaults
- Example: `type PatientGoalsCardProps = { goals: string[]; anticipatedOutcomes: string[]; statedInterests: string[] }`

**Card file structure:**
```
/**
 * CardName — ported from a360-web-app production Intelligence tab.
 * One-line description.
 * Adapted: [notes about differences from production].
 */
// imports...

// exported type(s) for card items
export type SomeItem = { ... };

// private sub-component type(s)
type CardSectionProps = { ... };

// private sub-components
const CardSection: React.FC<CardSectionProps> = ...;

// exported card
export const CardName: React.FC<CardNameProps> = ...;
```

## API Client Patterns

**Client setup** (`src/shared/api/client.ts`):
- Single Axios instance, base URL from `VITE_API_URL` env var or `/api` default
- Error interceptor normalizes error messages: extracts `err.response?.data?.detail` or `err.message`
- All API modules use this shared `client`

**API module pattern:**
- One file per resource: `runs.api.ts`, `opportunities.api.ts`, `transcripts.api.ts`, `agents.api.ts`
- Each exports a single object (e.g., `runsApi`) with methods
- Methods return unwrapped data (`.then(r => r.data)`) — callers receive typed data, not Axios responses
- Generic type parameter on `client.get<T>` specifies expected response shape

**Response unwrapping:**
```typescript
export const runsApi = {
  list: (params?) =>
    client.get<{ data: Run[]; total: number } | Run[]>('/runs', { params })
      .then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : (d as { data: Run[] }).data ?? [];
      }),
  getById: (runId: string) =>
    client.get<Run>(`/runs/${runId}`).then((r) => r.data),
};
```

**Types** (`src/shared/api/types.ts`):
- Centralized API type definitions
- Uses `[key: string]: unknown` index signature for backend shapes that may have extra fields
- Deprecated fields documented with `@deprecated` JSDoc
- V2 types prefixed with `V2`: `V2Pass1Output`, `V2Offering`, `V2VisitContext`

## Styling Approach

**Theme:** Custom MUI theme at `src/shared/styles/theme/index.ts`, palette at `src/shared/styles/theme/palette.ts`

**Design tokens exported from theme:**
```typescript
export const tokens = { boxShadows, borderRadius };
export { palette, GREY_COLORS as colors } from './palette';
```

**Palette constants** (use these, not raw hex in components):
- `palette.primary.main` = `#547BA3`
- `palette.success.*`, `palette.warning.*`, `palette.error.*` — semantic colors
- `GREY_COLORS[50]` through `[900]` — grey scale
- Named surface tokens in palette: `surfaceSoft` (`#F9FAFB`), `surfaceMedium` (`#F2F4F7`), `surfaceStrong` (`#EAECF0`)

**Styling rules:**
- Use `styled()` from `@mui/material/styles` for structural/reusable styled components (see `Card.styles.ts`)
- Use `sx` prop for one-off layout tweaks and responsive values
- Responsive spacing via `sx={{ p: { xs: 1.5, sm: 2 } }}` — all cards use this pattern
- Do NOT use hardcoded hex colors for semantic colors — use `color="primary"`, `color="error"`, etc. on MUI components
- Exception: structural background colors can use hardcoded tokens that match the palette (e.g., `'#F9FAFB'`)

**MUI component conventions:**
- `Card` with `variant="outlined"` for secondary/nested cards
- `SummaryCardRoot` (from `Card.styles.ts`) for top-level section cards (renders with `#F9FAFB` background)
- `Stack` with `gap` prop for vertical/horizontal spacing (not `spacing` from Grid)
- `Grid` v2 API with `size={{ xs: 12, sm: 6 }}` (not deprecated `xs={12}` prop)
- Typography variants: `subtitle2 fontWeight={600}` for card titles, `body2` for secondary text, `overline` for field labels

## MDChip vs Chip Usage

**MDChip** (`src/shared/components/MDChip.tsx`):
- Production-faithful chip matching `a360-web-app`'s `MDChip`
- Key feature: `variant="soft"` renders tinted background + colored text (not solid fill)
- `isSquare` prop sets `borderRadius: 4px`
- Default: `variant="soft"`, `color="default"`
- Use MDChip when rendering chips that need the soft tinted appearance matching production

**MUI Chip (plain):**
- Used in currently-ported cards: `EvidenceCard`, `ObjectionsCard`, `ProductsServicesCardV2`
- These cards use `<Chip ... sx={{ borderRadius: 1 }} />` for square-ish corners
- This is a known gap from production — MDChip `variant="soft"` should replace plain Chip in these cards

**Rule:** New cards should use `MDChip` with appropriate `variant` and `color`. Existing cards using plain `Chip` are marked with "Adapted: uses MUI Chip instead of custom MDChip" in their file docstring.

## Module Structure

Each feature module under `src/modules/[name]/` follows:
```
modules/[name]/
  index.tsx          # Module definition (id, label, icon, routes)
  pages/             # Route-level page components
  components/        # Module-specific components
  utils/             # Pure transformation functions
```

Module `index.tsx` exports a typed module definition object consumed by `src/shell/ModuleRegistry.ts`.

## Comments and Documentation

**File-level docstring** on all non-trivial files:
```typescript
/**
 * ComponentName — brief description.
 * Ported from: [source if applicable].
 * Adapted: [what changed from source].
 */
```

**No inline comments** — logic is expressed through type names and function names.
Exception: section dividers using `// ─── Section Name ───` pattern (used in `extractionToCards.ts`).

**Const maps for color/label lookups:**
- Named `TYPE_COLORS`, `STATUS_COLORS`, `SOFT_COLOR_MAP` etc.
- Typed as `Record<UnionType, MUIColorType>` for exhaustiveness

---

*Convention analysis: 2026-03-27*
