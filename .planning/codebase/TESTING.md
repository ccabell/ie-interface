# Testing Patterns

**Analysis Date:** 2026-03-27

## Current Test Coverage

**Status: No tests exist.**

There are zero test files in the repository. A search for `*.test.*` and `*.spec.*` files returns nothing. No test runner is configured.

**No test infrastructure present:**
- No `jest.config.*`
- No `vitest.config.*`
- No `@testing-library/react` in `package.json`
- No `vitest` in `package.json`
- No `jest` in `package.json`
- `package.json` scripts: only `dev`, `build`, `preview`, `lint` — no `test` command

The `devDependencies` contain only `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, and `vite`. No test tooling.

## What Should Be Tested

The highest-value test targets are the pure transformation functions. These have no side effects and are critical to correct rendering.

### 1. Extraction-to-cards mapping (`src/modules/extraction/utils/extractionToCards.ts`)

**Why:** This is the bridge between prompt JSON output and UI rendering. Bugs here produce wrong card data silently.

**Test cases for `mapExtractionToCards`:**
- Maps `treatments_discussed[].interest` to correct `ProductItemV2.status` (`high` → `'Recommended - receptive'`, etc.)
- Passes through explicit `status` string if already a valid `ProductStatus`
- Maps `concerns[].type` to `ObjectionItem.type`, `concerns[].addressed` to `ObjectionItem.status`
- Falls back to empty arrays when optional fields are absent
- `isEmpty` flags correctly reflect absent vs present fields
- `commitmentScore` defaults to 50 when absent
- `sentiment` passes through unchanged

**Test cases for `validateExtractionJson`:**
- Returns `{ valid: false }` for `null`, non-object, and empty object
- Returns `{ valid: true, data }` for object with any expected key
- Returns `{ valid: false, error }` for object with no recognized keys

### 2. Run output-to-cards mapping (`src/modules/runs/utils/runOutputToCards.ts`)

**Why:** Complex V2 multi-pass mapping with deprecation handling. High cognitive load, easy to break silently.

**Test cases for `runOutputToCards`:**
- Returns `[]` for `undefined` outputs
- Returns `[]` for V1 (non-v2) extraction version
- Returns `[]` if `prompt_1` or `prompt_2` absent
- `buildPatientGoalsCard` falls back to legacy field names (`additional_concerns` → `secondary_concerns`, `expectations` → `anticipated_outcomes`, `future_interest_signals` → `future_interests`)
- `buildVisitContextCard` coalesces deprecated fields (`referral_source` → `referred_by`, `timeline_event` → `motivating_event`)
- `buildObjectionsCard` merges objections, hesitations, concerns into unified `items[]` with correct `kind` and `resolvedLabel`
- `buildOfferingsCard` groups by disposition correctly, excludes empty groups
- `buildOpportunitiesCard` filters to only opportunity dispositions (`recommended_receptive`, `recommended_hesitant`, `discussed`)
- `hideEmptyCards: true` filters out cards where `isEmpty === true`
- `buildCrossSellEffortCard` prefers HITL feedback over extracted value

### 3. Normalize utilities (`src/shared/utils/normalize.ts`)

**Why:** Small pure functions, trivial to test, used in KPI card rendering.

**Test cases:**
- `intentLevelToPercentage`: 1→0, 3→50, 5→100, null→null
- `intentLevelToLabel`: 1→'Very Low', 5→'Very High', null→'Unknown', out-of-range→'Unknown'
- `planClarityToPercentage`: 0→0, 3→60, 5→100, null→null
- `computeOfferingValueMetrics`: correctly sums by disposition bucket, ignores null values
- `formatCurrency`: formats numbers as USD, returns `'—'` for null/undefined

### 4. Card component rendering (React Testing Library)

**Why:** Verify that cards render without throwing when given valid and edge-case props.

**Test cases:**
- `SummaryCard` renders `title`, `description`, and `children`; skips header when no title
- `BaseAccordion` starts collapsed, expands on click, `isExpandedByDefault` starts expanded
- `EvidenceCard` renders `score` as percentage chip with correct color (≥80 green, 50-79 orange, <50 red)
- `StatisticCard` renders label and value; omits tooltip button when no tooltip prop
- `PatientGoalsCard` renders all three columns
- `ObjectionsCard` renders items with type and status chips; `coachingResponse` block appears only when set
- `ProductsServicesCardV2` renders all items in grid; potential value section appears only when set
- `MDChip` with `variant="soft"` applies tinted background color, not solid fill
- `MDChip` with `isSquare` applies `borderRadius: 4px`

### 5. IntelligenceRenderer integration (`src/modules/extraction/components/IntelligenceRenderer.tsx`)

**Why:** Orchestrates card layout logic with `showEmptyCards` flag. Tests confirm empty state handling.

**Test cases:**
- All cards render with `SAMPLE_EXTRACTION_JSON` piped through `mapExtractionToCards`
- `showEmptyCards={false}` hides sections where `isEmpty` flag is true
- `showEmptyCards={true}` (default) shows `EmptyMessage` placeholders

## Recommended Testing Strategy

### Framework: Vitest + React Testing Library

Vitest is the natural choice given the Vite build setup. Add to `devDependencies`:

```json
{
  "vitest": "^1.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^25.x"
}
```

**`vite.config.ts` addition:**
```typescript
export default defineConfig({
  // ...existing config...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

**`src/test-setup.ts`:**
```typescript
import '@testing-library/jest-dom';
```

**`package.json` scripts:**
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "coverage": "vitest run --coverage"
}
```

### Test File Location

Co-locate tests with the file under test:

```
src/
  modules/extraction/utils/
    extractionToCards.ts
    extractionToCards.test.ts      # pure function tests
  modules/runs/utils/
    runOutputToCards.ts
    runOutputToCards.test.ts
  shared/utils/
    normalize.ts
    normalize.test.ts
  shared/cards/base/
    SummaryCard.tsx
    SummaryCard.test.tsx           # component render tests
  shared/components/
    MDChip.tsx
    MDChip.test.tsx
```

### Priority Order

Start with pure functions — no browser environment required, highest ROI:

1. `normalize.test.ts` — fastest to write, zero setup
2. `extractionToCards.test.ts` — core mapping, sample fixture already in the source file (`SAMPLE_EXTRACTION_JSON`)
3. `runOutputToCards.test.ts` — complex V2 mapping with deprecation paths
4. `MDChip.test.tsx` — validates production parity of soft variant
5. Component render tests for base cards

### Using Existing Sample Data

`src/modules/extraction/utils/extractionToCards.ts` already exports `SAMPLE_EXTRACTION_JSON` — use this directly in extraction mapping tests to avoid duplicating fixtures.

For `runOutputToCards` tests, construct minimal V2 `RunOutputs` objects targeting each builder function independently.

## Test Coverage Gaps (Current Risk)

**High risk (no coverage, critical logic):**
- `runOutputToCards.ts` — V2 multi-pass parsing, deprecation fallbacks, HITL override logic
- `extractionToCards.ts` — `interestToStatus` mapping, `isEmpty` flag calculation

**Medium risk (no coverage, rendering correctness):**
- `MDChip.tsx` — `variant="soft"` color logic (`SOFT_COLOR_MAP` lookups)
- `EvidenceCard.tsx` — `getScoreColor` threshold rendering
- `IntelligenceRenderer.tsx` — `showEmptyCards` conditional rendering

**Low risk (no coverage, stable primitives):**
- `normalize.ts` — pure arithmetic, very readable
- Base card structure tests (`SummaryCard`, `StatisticCard`)

---

*Testing analysis: 2026-03-27*
