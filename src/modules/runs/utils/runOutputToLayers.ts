/**
 * Maps prompt-runner run outputs (prompt_1, prompt_2, prompt_3) to extraction layers for the UI.
 * Supports V1 (passes) and V2 (visit_context, outcome, offerings, etc.).
 */
import type { RunOutputs, ParsedPass, OpportunityItem } from '@/shared/api/types';
import { detectExtractionVersion } from '@/shared/utils/versionDetect';

function firstPass(outputs: RunOutputs, key: 'prompt_1' | 'prompt_2' | 'prompt_3'): ParsedPass | undefined {
  const out = outputs[key];
  const pj = out?.parsed_json;
  const passes = (pj as { passes?: ParsedPass[] } | undefined)?.passes;
  return passes?.[0];
}

export interface ExtractionLayers {
  summaryText: string;
  buySignalStrength: number | null;
  buySignalDefinition: string | null;
  visitType: string | null;
  primaryConcerns: string[];
  desiredOutcomes: string[];
  riskAversion: string | null;
  clinicalConstraints: Array<{ key: string; value: string }>;
  productsAndServices: string[];
  opportunitiesSummary: string | null;
  opportunityItems: OpportunityItem[];
}

const BUY_SIGNAL_DEFINITION =
  'Buy signal strength (0–100%) reflects how ready the patient is to proceed with a recommended product or service based on the consultation.';

export function runOutputToLayers(outputs: RunOutputs | undefined): ExtractionLayers {
  const empty: ExtractionLayers = {
    summaryText: '',
    buySignalStrength: null,
    buySignalDefinition: BUY_SIGNAL_DEFINITION,
    visitType: null,
    primaryConcerns: [],
    desiredOutcomes: [],
    riskAversion: null,
    clinicalConstraints: [],
    productsAndServices: [],
    opportunitiesSummary: null,
    opportunityItems: [],
  };
  if (!outputs) return empty;

  if (detectExtractionVersion(outputs) === 'v2') {
    const p1 = outputs.prompt_1?.parsed_json as Record<string, unknown> | undefined;
    const p2 = outputs.prompt_2?.parsed_json as Record<string, unknown> | undefined;
    if (!p1 || !p2) return empty;
    const vc = p1.visit_context as Record<string, { value?: unknown }> | undefined;
    const pg = p1.patient_goals as Record<string, { value?: unknown }> | undefined;
    const offerings = (p1.offerings as Array<{ name: string; disposition?: string; value?: number | null; evidence?: { quote?: string } }>) ?? [];
    const OPP_DISPOSITIONS = ['recommended_receptive', 'recommended_hesitant', 'discussed'];
    const opportunityOfferings = offerings.filter((o) => o.disposition && OPP_DISPOSITIONS.includes(o.disposition));
    const outcome = p2.outcome as { summary?: { value?: string } } | undefined;
    const intentLevel = (p2.patient_signals as { intent_level?: { value?: number } })?.intent_level?.value;
    const summary = outcome?.summary?.value;
    const buyPct = intentLevel != null ? (intentLevel - 1) * 25 : null;
    const primaryConcernVal = pg?.primary_concern?.value;
    const secondaryConcernsVal = (pg as { secondary_concerns?: { value?: string[] } })?.secondary_concerns?.value ?? (pg as { additional_concerns?: { value?: string[] } })?.additional_concerns?.value;
    const legacyConcernsVal = (pg as { concerns?: { value?: string[] } })?.concerns?.value;
    const primaryConcernsList: string[] = [];
    if (typeof primaryConcernVal === 'string' && primaryConcernVal.trim()) primaryConcernsList.push(primaryConcernVal);
    if (Array.isArray(secondaryConcernsVal)) primaryConcernsList.push(...secondaryConcernsVal.map(String));
    if (primaryConcernsList.length === 0 && Array.isArray(legacyConcernsVal)) primaryConcernsList.push(...legacyConcernsVal.map(String));
    const goalsVal = pg?.goals?.value ?? (pg as { desired_outcomes?: { value?: string[] } })?.desired_outcomes?.value;
    const desiredOutcomesList = Array.isArray(goalsVal) ? (goalsVal as string[]).map(String) : [];
    return {
      summaryText: typeof summary === 'string' ? summary : 'No summary extracted.',
      buySignalStrength: buyPct,
      buySignalDefinition: BUY_SIGNAL_DEFINITION,
      visitType: vc?.visit_type?.value != null ? String(vc.visit_type.value) : null,
      primaryConcerns: primaryConcernsList,
      desiredOutcomes: desiredOutcomesList,
      riskAversion: null,
      clinicalConstraints: [],
      productsAndServices: offerings.map((o) => o.name),
      opportunitiesSummary:
        opportunityOfferings.length === 0
          ? null
          : opportunityOfferings.length === 1
            ? `1 opportunity: ${opportunityOfferings[0].name} — patient interested but not yet booked.`
            : `${opportunityOfferings.length} opportunities: ${opportunityOfferings.map((o) => o.name).join(', ')} — patient interested but not yet booked.`,
      opportunityItems: opportunityOfferings.map((o, i) => {
        const quote = o.evidence?.quote?.trim() ?? '';
        return {
          product_or_service: o.name,
          title: o.name,
          item_index: i,
          blurb: quote || `Patient interested in ${o.name}`,
          value: o.value ?? null,
        } as OpportunityItem;
      }),
    };
  }

  const p1 = firstPass(outputs, 'prompt_1');
  const p2 = firstPass(outputs, 'prompt_2');
  const p3 = firstPass(outputs, 'prompt_3');

  const goals = p1?.goals_and_concerns as Record<string, unknown> | undefined;
  const patientCtx = p1?.patient_context as Record<string, unknown> | undefined;
  const constraints = p2?.clinical_constraints as Record<string, string> | undefined;
  const commercial = p2?.commercial_signals as Record<string, unknown> | undefined;
  const opportunities = p3?.opportunities;

  const summaryParts: string[] = [];
  if (patientCtx?.visit_type) summaryParts.push(`Visit type: ${String(patientCtx.visit_type)}`);
  if (goals?.primary_concerns) {
    const c = goals.primary_concerns;
    summaryParts.push(`Primary concerns: ${Array.isArray(c) ? c.join(', ') : String(c)}`);
  }
  if (goals?.desired_outcomes) {
    const o = goals.desired_outcomes;
    summaryParts.push(`Desired outcomes: ${Array.isArray(o) ? o.join(', ') : String(o)}`);
  }
  if (opportunities?.summary) summaryParts.push(opportunities.summary);

  const products: string[] = [];
  if (commercial && typeof commercial === 'object') {
    const productsList = (commercial as Record<string, unknown>).products_or_services;
    if (Array.isArray(productsList)) {
      products.push(...productsList.filter((x): x is string => typeof x === 'string'));
    }
  }
  (opportunities?.items ?? []).forEach((item: OpportunityItem) => {
    if (item.product_or_service && !products.includes(item.product_or_service)) {
      products.push(item.product_or_service);
    }
  });

  const constraintsList = constraints
    ? Object.entries(constraints).map(([key, value]) => ({ key, value: String(value) }))
    : [];

  return {
    summaryText: summaryParts.join('\n\n') || 'No summary extracted.',
    buySignalStrength: p3?.buy_signal_strength ?? opportunities?.buy_signal_strength ?? null,
    buySignalDefinition: BUY_SIGNAL_DEFINITION,
    visitType: patientCtx?.visit_type != null ? String(patientCtx.visit_type) : null,
    primaryConcerns: goals?.primary_concerns
      ? Array.isArray(goals.primary_concerns)
        ? goals.primary_concerns.map(String)
        : [String(goals.primary_concerns)]
      : [],
    desiredOutcomes: goals?.desired_outcomes
      ? Array.isArray(goals.desired_outcomes)
        ? goals.desired_outcomes.map(String)
        : [String(goals.desired_outcomes)]
      : [],
    riskAversion: goals?.risk_aversion != null ? String(goals.risk_aversion) : null,
    clinicalConstraints: constraintsList,
    productsAndServices: products,
    opportunitiesSummary: opportunities?.summary ?? null,
    opportunityItems: opportunities?.items ?? [],
  };
}
