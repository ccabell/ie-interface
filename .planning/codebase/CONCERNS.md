# Codebase Concerns

**Analysis Date:** 2026-03-27

---

## Production Parity Gaps

**IntelligenceRenderer renders only 5 of 11 available intelligence cards:**
- Issue: `src/modules/extraction/components/IntelligenceRenderer.tsx` renders only `GeneralSummarySection`, `PatientGoalsCard`, `ProductsServicesCardV2`, `ObjectionsCard`, and `NextStepsTimelineCard`. The card library exports 11 cards total.
- Missing cards: `AreasCard`, `ConcernsCard`, `FutureInterestsCard`, `VisitChecklistCardV2`, `VisitContextCard`, `CrossSellCardV3`
- Impact: The Simulator page presents an incomplete view of extraction output. Reviewers cannot verify rendering of 6 card types via the Simulator workflow.
- Fix approach: Extend `MappedCardData` in `src/modules/extraction/utils/extractionToCards.ts` to include fields for all missing cards, update `IntelligenceRenderer.tsx` to render them conditionally like the existing cards.

**MDChip built but not used in any card:**
- Issue: `src/shared/components/MDChip.tsx` implements the production `soft` variant (tinted bg + colored text) but every ported card (`AreasCard`, `ConcernsCard`, `FutureInterestsCard`, `ObjectionsCard`, `ProductsServicesCardV2`, `EvidenceCard`) uses plain MUI `Chip` instead. Comments in each file say "Adapted: uses MUI Chip instead of custom MDChip."
- Impact: Status and type chips in cards render with MUI's default filled/outlined styles instead of the soft-tint style used in production a360-web-app. Visual parity is not achieved.
- Fix approach: Replace `Chip` imports with `MDChip` in the six card files listed above, switching to `variant="soft"` where production uses soft chips.

**`VisitContextCard` ignores `referredBy` prop:**
- Issue: In `src/shared/cards/intelligence/VisitContextCard.tsx`, the `referredBy` prop is destructured as `_referredBy` (prefixed underscore = intentionally unused). The "Referred By" field in the rendered card actually displays the `referrals` value instead.
- Impact: Wrong data shown for the referred-by field; `referredBy` data is silently dropped.
- Fix approach: Remove the underscore prefix and render `referredBy` in the "Referred By" field; rename the "Referred By" label to "Referrals" for the `referrals` value.

**`PatientGoalsCard` does not render `primaryConcern`, `secondaryConcerns`, `treatmentAreas`, or `futureInterests`:**
- Issue: `src/shared/cards/intelligence/PatientGoalsCard.tsx` accepts only `goals`, `anticipatedOutcomes`, and `statedInterests`. The richer V2 patient goals shape in `src/modules/runs/utils/runOutputToCards.ts` extracts `primaryConcern`, `secondaryConcerns`, `treatmentAreas`, and `futureInterests` but they have no card to render into from the Simulator path.
- Impact: Rich V2 data partially lost in the Simulator view.
- Fix approach: Either extend `PatientGoalsCard` props or wire the Simulator path to use the run-detail `CardRenderer` for patient goals.

**`ProductsServicesCardV2` has a hardcoded description string:**
- Issue: `src/shared/cards/intelligence/ProductsServicesCardV2.tsx` line 87 renders `description="Provider discussed multiple treatment options tailored to patient's concerns and aesthetic goals."` unconditionally regardless of what is actually in the consultation.
- Impact: Misleading static text appears in all renders, even consultations with a single or no treatment mentioned.
- Fix approach: Remove the hardcoded `description` prop from the `SummaryCard` call or make it a prop driven by actual data.

---

## Missing Components vs Production

**No `AccordionCard` variant for the Run Detail page:**
- Issue: `src/modules/runs/pages/RunDetail.tsx` implements its own bespoke `LayerCard` and `CardRenderer` components (inline in the same file) instead of using the shared card library from `src/shared/cards/`.
- Impact: Run Detail cards are visually inconsistent with the Simulator/IntelligenceRenderer output. Same data renders with different chrome. Changes to the card library are not automatically reflected in Run Detail.
- Fix approach: Replace `CardRenderer` inline components with the shared intelligence card components, or extract `CardRenderer` into `src/modules/runs/components/`.

**No shared `OpportunitiesCard` component wired to the Simulator:**
- Issue: `OpportunitiesCard` is defined as a TypeScript interface in `src/modules/runs/utils/runOutputToCards.ts` (line 100) and rendered in Run Detail's `CardRenderer` via the `'opportunities'` case. There is no standalone React component in `src/shared/cards/intelligence/` for opportunities, and the Simulator's `extractionToCards.ts` does not produce an opportunities card at all.
- Impact: Opportunities data visible in Run Detail but invisible in the Simulator rendering path.
- Fix approach: Create `src/shared/cards/intelligence/OpportunitiesCard.tsx` using the existing Run Detail rendering logic as a starting point, then wire it into `IntelligenceRenderer`.

**V1 extraction format shows degraded "layers" view only:**
- Issue: `src/modules/runs/utils/runOutputToCards.ts` returns an empty array for V1 outputs (line 389: `if (detectExtractionVersion(outputs) !== 'v2') return []`). V1 runs fall back to the text-only `runOutputToLayers` view in Run Detail. `versionDetect.ts` only distinguishes `v1 | v2 | unknown` — there is no V3/V3.1 handling.
- Impact: Any runs produced with the V3 or V3.1 multi-pass prompt schema will hit the `unknown` branch and render the degraded layers fallback.
- Fix approach: Extend `detectExtractionVersion` to recognize V3/V3.1 shape indicators, then add a corresponding mapping function in `runOutputToCards.ts`.

---

## `extractionToCards.ts` Handles Simple Format Only

**`mapExtractionToCards` is designed for the simple V2 extraction schema only:**
- Issue: `src/modules/extraction/utils/extractionToCards.ts` expects `ExtractionOutput` with flat fields (`summary`, `patient_goals`, `treatments_discussed`, etc.). The V3/V3.1 multi-pass prompt schema uses nested `outputs.prompt_1`, `outputs.prompt_2`, etc. with `parsed_json` — the same shape that `runOutputToCards.ts` handles.
- The `tryMapToCards` function in `Simulator.tsx` (lines 236-251) attempts partial V3 handling by looking inside `outputs.prompt_1/2/3` for a `parsed_json` with simple extraction fields, but it only grabs the first matching pass and discards the others.
- Impact: Running a V3/V3.1 prompt set in the Simulator will likely produce a partial or failed card render even if the backend returns valid data.
- Fix approach: Add a `mapV2RunOutputToCards` path in `extractionToCards.ts` (or import from `runOutputToCards.ts`) that handles the full two-pass V2/V3 shape. Update `Simulator.tryMapToCards` to route to it when the V2 shape is detected.

---

## No Test Coverage

**Zero test files in `src/`:**
- Issue: No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files exist anywhere under `src/`. No test runner is configured — `package.json` has no `vitest`, `jest`, or test script.
- Impact: `mapExtractionToCards`, `runOutputToCards`, `runOutputToLayers`, `versionDetect`, and `normalize` are pure transformation functions with no automated verification. Regressions in the mapping layer (the most critical logic for production parity) would not be caught.
- High-risk untested areas:
  - `src/modules/extraction/utils/extractionToCards.ts` — all mapping logic
  - `src/modules/runs/utils/runOutputToCards.ts` — V2 card building (11 card builders)
  - `src/shared/utils/versionDetect.ts` — version detection branching
  - `src/shared/utils/normalize.ts` — score normalization math
- Fix approach: Add Vitest (`vitest`, `@testing-library/react`, `@testing-library/user-event`). Start with unit tests for all pure utility functions, then component smoke tests for the card library.

---

## No Supabase / Persistence Integration

**Test results are ephemeral — no save mechanism:**
- Issue: The Simulator runs prompts and renders output in memory only. There is no mechanism to save a run result, annotate it, compare it across prompt versions, or retrieve it later. The API client (`src/shared/api/client.ts`) connects only to the Railway prompt-runner backend. No Supabase client, database connection, or persistence layer exists in the project.
- Impact: Prompt evaluation sessions cannot be audited, reproduced, or compared. Regression testing of prompt changes requires manual re-running.
- Fix approach: Add Supabase client (or extend the Railway backend with a persistence endpoint). Store `{ prompt_set_id, transcript_id, raw_output, mapped_cards, timestamp }` on run completion. Display saved runs in a history panel.

---

## API Client Gaps

**No retry logic for transient failures:**
- Issue: `src/shared/api/client.ts` configures an Axios instance with a single error interceptor that normalizes error messages. There is no retry-on-timeout, no exponential backoff, and no request timeout configuration.
- Impact: Railway backend cold starts (~5-10s) cause immediate 504/network errors rather than transparent retries. The Simulator shows a hard error to the user.
- Fix approach: Add `axios-retry` or a manual retry interceptor with 2-3 retries and exponential backoff for 5xx/network errors. Set a request timeout of 60s minimum (LLM calls are slow).

**No request cancellation:**
- Issue: The Simulator's `handleRun` callback in `src/modules/extraction/pages/Simulator.tsx` does not cancel the in-flight request when the user navigates away or triggers a new run. Stale responses from a previous run can overwrite newer results.
- Impact: Race condition possible if a user triggers multiple runs quickly.
- Fix approach: Use `AbortController` with Axios `cancelToken` / `signal` option; cancel on re-run or unmount.

---

## Bundle Size

**Single bundle of ~961KB (no code splitting):**
- Issue: `vite.config.ts` has no `build.rollupOptions.output.manualChunks` configuration. The entire app — including `@mui/material`, `@mui/x-charts`, `@dnd-kit/*`, `date-fns`, and `axios` — bundles into one JS chunk. The `dist/assets/index-Bn44CEFk.js` in the committed build artifact reflects this.
- Impact: Initial load is slow. Any page load downloads the full bundle even if the user only needs the Simulator.
- Fix approach: Add `manualChunks` to `vite.config.ts` splitting at minimum: `vendor-mui` (MUI core + icons), `vendor-charts` (@mui/x-charts), `vendor-dnd` (@dnd-kit). Enable React lazy/Suspense for module routes.

---

## No Authentication or Access Control

**The app is fully open — no auth gate:**
- Issue: No authentication layer exists. `src/shell/Layout.tsx` renders all routes unconditionally. The API client sends no authorization headers. There is no Cognito, Supabase Auth, or any other identity check anywhere in the codebase.
- Impact: Anyone with the Vercel URL can access all transcripts, runs, and prompt configurations exposed by the Railway backend. The Railway backend itself may have its own auth; this is not verified from the frontend.
- Fix approach: This is a dev/testing tool, but if deployed to a shared URL, add HTTP Basic Auth at the Vercel level (vercel.json `headers` + password protection) or a simple bearer token passed via `VITE_API_TOKEN` env var injected into the Axios client.

---

## Prompt Version Mismatch

**Default prompt set uses V3, not V3.1:**
- Issue: The Simulator UI defaults to "Prompt Set" mode with a blank selection ("Default — server decides"). The actual default the Railway backend uses when no `prompt_set_id` is supplied is not controlled by this frontend. There is no visual indicator in the UI of which prompt version is active when running with the default.
- Impact: Developers may unknowingly test against V3 rather than V3.1 outputs, getting different field shapes without realizing it. The `versionDetect.ts` utility only knows about V1 and V2, not V3/V3.1.
- Fix approach: Display the active prompt version in the result panel (read from the response metadata if available). Extend `versionDetect.ts` to recognize V3/V3.1. Document which prompt set ID corresponds to each version.

---

## Hardcoded Values Instead of Theme Tokens

**Hardcoded hex colors in non-theme files:**
- Issue: Several files outside `src/shared/styles/theme/` use hardcoded hex values instead of theme tokens:
  - `src/shell/Layout.tsx:48` — `background: 'linear-gradient(135deg, #547BA3 0%, #324A68 100%)'` (should use `palette.primary.main` and `palette.primary.darker`)
  - `src/shared/cards/base/BaseAccordion.tsx:99` — `bgcolor: '#F9FAFB'` (should use `theme.palette.grey[50]` or `background.surfaceSoft`)
  - `src/shared/cards/base/Card.styles.ts:23` — `background: '#F9FAFB'` (same token available)
  - `src/shared/cards/base/Card.styles.ts:29` — `backgroundColor: '#EAECF0'` (should use `theme.palette.grey[200]` or `background.surfaceStrong`)
  - `src/modules/extraction/pages/Simulator.tsx:501` — `bgcolor: '#F9FAFB'`
  - `src/modules/extraction/pages/JsonPreview.tsx:174` — `bgcolor: '#F9FAFB'`
  - `src/shared/components/MDChip.tsx:20-26` — entire `SOFT_COLOR_MAP` hardcodes colors that match the palette; should derive from `palette` import
- Impact: If the palette changes, these components will not update automatically. Theme dark mode (if ever added) will not apply.
- Fix approach: Replace hardcoded values with `palette.*` imports or `theme.palette.*` in `useTheme()` / `styled()` calls.

**Hardcoded colors in `theme/index.ts` component overrides:**
- Issue: The `MuiCard`, `MuiAppBar`, `MuiOutlinedInput`, `MuiTableRow`, and `MuiTableCell` overrides in `src/shared/styles/theme/index.ts` use raw hex strings (e.g., `'#EAECF0'`, `'#FFFFFF'`, `'#F9FAFB'`) instead of referencing the `palette` object defined in the same file.
- Impact: Minor — palette is not expected to change frequently — but these are the values most likely to drift from the true production palette.
- Fix approach: Replace with `palette.background.surfaceSoft`, `palette.divider`, etc. in component overrides.

---

## Missing Documentation

**No CLAUDE.md for this project:**
- Issue: No `CLAUDE.md` or `agents.md` exists in the project root. The global `~/.claude/CLAUDE.md` provides A360 platform context but does not describe this specific repo's purpose, architecture decisions, or agent conventions.
- Impact: Any Claude agent working in this repo lacks project-specific guidance (e.g., which endpoint corresponds to which mode, what the Railway backend exposes, what V2 vs V3 means here).
- Fix approach: Create `/c/Projects/Prompts/ie-interface/CLAUDE.md` covering: project purpose, Railway backend endpoints, prompt version taxonomy, card rendering pipeline summary, and known limitations.

**No per-agent coding standards (agents.md):**
- Issue: No `agents.md` file equivalent exists for this project.
- Fix approach: Add coding standards specific to this testing tool (e.g., "add new card types to shared/cards/intelligence/ before wiring into IntelligenceRenderer", "all mapping logic goes in extractionToCards.ts or runOutputToCards.ts — never inline in page components").

---

## Relationship to Mid-Stream Not Documented

**Connection between ie-interface and Mid-Stream is undocumented:**
- Issue: No documentation exists in this repo describing how `ie-interface` relates to the Mid-Stream prompt evaluation pipeline. The Railway backend (`prompt-runner-production.up.railway.app`) is referenced only as a hardcoded proxy target in `vite.config.ts`. There is no documentation of which endpoints the backend exposes, what the expected request/response contract is, or how prompt sets map to Mid-Stream prompt versions.
- Impact: Onboarding is difficult. It is unclear whether `ie-interface` is a consumer of Mid-Stream output, a parallel system, or a replacement for an earlier evaluation UI.
- Fix approach: Add a `docs/ARCHITECTURE.md` or expand `README.md` with a system diagram showing `ie-interface → Railway backend → Bedrock/prompt engine → transcripts` flow and its relationship to Mid-Stream.

---

## Fragile Areas

**`tryMapToCards` in Simulator uses structural duck-typing:**
- Files: `src/modules/extraction/pages/Simulator.tsx` lines 226-263
- Why fragile: The function checks for the presence of specific keys (`parsed_json`, `result.parsed_json`, `summary`, `patient_goals`, `outputs.prompt_1/2/3`) in an untyped `unknown` response to determine how to map the output. If the backend changes its response envelope even slightly (e.g., renaming `parsed_json` to `extraction`), the mapping silently falls through to an error state.
- Safe modification: Any change to the Railway backend response shape must be coordinated with updates to this function.
- Test coverage: None.

**Version detection in `versionDetect.ts` relies on field presence heuristics:**
- Files: `src/shared/utils/versionDetect.ts`
- Why fragile: Returns `'v2'` if `parsed_json` has `extraction_version === '2.0'` OR has a `visit_context` key. Returns `'v1'` if it has a `passes` array. Everything else is `'unknown'`. A V3 output that happens to have a `visit_context` field would be misidentified as V2.
- Safe modification: Do not rely on field presence alone; require explicit `extraction_version` metadata in prompt output.
- Test coverage: None.

**`ObjectionsCard` (intelligence) uses `item.title` as React key:**
- Files: `src/shared/cards/intelligence/ObjectionsCard.tsx` line 80
- Why fragile: `items.map(item => <ObjectionCard key={item.title} {...item} />)` — if two objections have the same title text, React will render only one and produce a key collision warning.
- Fix approach: Use index or a generated unique ID as key.

---

## Dependencies at Risk

**`@mui/x-charts` at v7 pinned alongside MUI v7 — both are major-version upgrades:**
- Risk: MUI v7 and `@mui/x-charts` v7 were released recently. Some Grid v2 API (`size` prop) is used throughout the codebase. If MUI releases a v7.x breaking patch, the Grid `size` prop signature could change.
- Impact: Grid layouts across all card components would break silently.
- Migration plan: Pin minor versions in `package.json` and test on upgrades.

**`react-router-dom` v7:**
- Risk: React Router v7 has breaking changes from v6 (loader API, `createBrowserRouter` preferred). This app uses the legacy JSX `<Routes>` / `<Route>` API via `src/App.tsx`. Future migration to data router APIs will require significant refactoring.
- Impact: Low immediate risk; moderate long-term migration cost.

---

## Unused or Orphaned Code

**`src/shared/api/agentOutputs.ts` is largely unused at runtime:**
- Issue: `agentOutputs.ts` defines extensive types (`ConsultationIntelligence`, `TreatmentCarePlan`, `SoapNote`, `KpiEvaluation`, etc.) and two large mock objects (`MOCK_CONSULTATION_OUTPUT`, `MOCK_COACHING_OUTPUT`). Only `CoachingReportCard.tsx` imports from this file. The mock data is never rendered in the main app flow.
- Impact: Dead code adds ~350 lines of maintenance surface. Mock data contains hardcoded model names (`claude-3-sonnet`, `claude-3-opus`) that are outdated.
- Fix approach: Audit whether `ConsultationIntelligence` and mock data are needed. If not, remove. If yes, document their intended use.

**`src/modules/runs/components/AgentViewer/` components are built but not integrated into Run Detail:**
- Issue: The AgentViewer directory contains `AgentOutputCard`, `CoachingReportCard`, `MetricsPanel`, `ProductsServicesCard`, `ObjectionsCard`, `SummaryCard` — a full alternative card set. These are separate from the `src/shared/cards/` library and from the inline `CardRenderer` in `RunDetail.tsx`. It is unclear which set is canonical.
- Files: `src/modules/runs/components/AgentViewer/*.tsx`
- Impact: Two parallel card implementations exist with different visual styles and prop shapes. Risk of maintaining both diverging from production.
- Fix approach: Decide which card set is canonical for the Run Detail view. Remove or deprecate the other.

---

*Concerns audit: 2026-03-27*
