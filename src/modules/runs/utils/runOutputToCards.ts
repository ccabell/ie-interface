/**
 * Map run outputs to card data for the Run detail page. V2 only; V1 returns [].
 */

import type { RunOutputs, V2Pass1Output, V2Pass2Output } from '@/shared/api/types';
import { detectExtractionVersion } from '@/shared/utils/versionDetect';
import { intentLevelToPercentage, intentLevelToLabel, computeOfferingValueMetrics } from '@/shared/utils/normalize';

export type CardType =
  | 'summary'
  | 'value_metrics'
  | 'kpi_intent'
  | 'visit_checklist'
  | 'visit_context'
  | 'patient_goals'
  | 'offerings'
  | 'opportunities'
  | 'next_steps'
  | 'objections'
  | 'cross_sell_effort';

export interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  isEmpty: boolean;
}

export interface SummaryCard extends BaseCard {
  type: 'summary';
  summary: string | null;
}

export interface ValueMetricsCard extends BaseCard {
  type: 'value_metrics';
  realizedValue: number;
  committedValue: number;
  potentialValue: number;
  totalOpportunityValue: number;
  hasAnyValue: boolean;
}

export interface KPICard extends BaseCard {
  type: 'kpi_intent';
  score: number | null;
  percentage: number | null;
  label: string;
}

export interface VisitChecklistCard extends BaseCard {
  type: 'visit_checklist';
  items: { label: string; completed: boolean | null; evidence?: string | null }[];
}

export interface VisitContextCard extends BaseCard {
  type: 'visit_context';
  visitType: string | null;
  reasonForVisit: string | null;
  referredBy: string | null;
  referrals: string | null;
  motivatingEvent: string | null;
}

export interface PatientGoalsCard extends BaseCard {
  type: 'patient_goals';
  primaryConcern: string | null;
  secondaryConcerns: string[];
  goals: string[];
  anticipatedOutcomes: string[];
  treatmentAreas: string[];
  statedInterests: string[];
  futureInterests: { interest: string; interestLevel?: string | null }[];
}

export interface OfferingsCard extends BaseCard {
  type: 'offerings';
  groups: { label: string; dispositions: string[]; offerings: Array<{ name: string; disposition: string; value?: number | null }> }[];
  valueMetrics: { potentialValue: number; realizedValue: number; committedValue: number; totalOpportunityValue: number };
}

export interface NextStepsCard extends BaseCard {
  type: 'next_steps';
  steps: { action: string; timing: string | null; owner: string }[];
}

export interface ObjectionsCard extends BaseCard {
  type: 'objections';
  items: { kind: 'objection' | 'hesitation' | 'concern'; typeOrTopic: string; statement?: string; resolved: boolean | null; resolvedLabel: string }[];
  resolvedCount: number;
  totalCount: number;
}

export interface CrossSellEffortCard extends BaseCard {
  type: 'cross_sell_effort';
  value: 'yes' | 'no' | 'unclear' | 'n/a' | null;
  label: string;
}

/** Interest but not booked: recommended_receptive, recommended_hesitant, discussed */
export interface OpportunitiesCard extends BaseCard {
  type: 'opportunities';
  opportunitiesSummary: string | null;
  items: { name: string; blurb: string; value: number | null }[];
}

export type Card =
  | SummaryCard
  | ValueMetricsCard
  | KPICard
  | VisitChecklistCard
  | VisitContextCard
  | PatientGoalsCard
  | OfferingsCard
  | OpportunitiesCard
  | NextStepsCard
  | ObjectionsCard
  | CrossSellEffortCard;

const OFFERING_GROUPS: { label: string; dispositions: string[] }[] = [
  { label: 'Completed this visit', dispositions: ['performed', 'purchased'] },
  { label: 'Scheduled / Committed', dispositions: ['scheduled', 'agreed_pending'] },
  { label: 'Recommended', dispositions: ['recommended_receptive', 'recommended_hesitant'] },
  { label: 'Declined', dispositions: ['recommended_declined'] },
  { label: 'Discussed', dispositions: ['discussed'] },
];

/** Interest but not booked — for Opportunities card and board */
const OPPORTUNITY_DISPOSITIONS = ['recommended_receptive', 'recommended_hesitant', 'discussed'];

function buildSummaryCard(p2: V2Pass2Output): SummaryCard {
  const summary = p2.outcome?.summary?.value ?? null;
  return {
    id: 'summary',
    type: 'summary',
    title: 'Consultation summary',
    isEmpty: !summary,
    summary: typeof summary === 'string' ? summary : null,
  };
}

function buildValueMetricsCard(p1: V2Pass1Output): ValueMetricsCard {
  const offerings = p1.offerings ?? [];
  const metrics = computeOfferingValueMetrics(
    offerings.map((o) => ({ disposition: o.disposition, value: o.value }))
  );
  const hasAnyValue = offerings.some((o) => o.value != null);
  return {
    id: 'value_metrics',
    type: 'value_metrics',
    title: 'Value metrics',
    isEmpty: !hasAnyValue,
    realizedValue: metrics.realizedValue,
    committedValue: metrics.committedValue,
    potentialValue: metrics.potentialValue,
    totalOpportunityValue: metrics.totalOpportunityValue,
    hasAnyValue,
  };
}

function buildKPIIntentCard(p2: V2Pass2Output): KPICard {
  const level = p2.patient_signals?.intent_level?.value ?? null;
  return {
    id: 'kpi_intent',
    type: 'kpi_intent',
    title: 'Commitment level',
    isEmpty: level == null,
    score: level ?? null,
    percentage: intentLevelToPercentage(level),
    label: intentLevelToLabel(level),
  };
}

function buildVisitChecklistCard(p2: V2Pass2Output): VisitChecklistCard {
  const items = p2.visit_checklist ?? [];
  return {
    id: 'visit_checklist',
    type: 'visit_checklist',
    title: 'Visit checklist',
    isEmpty: items.length === 0,
    items: items.map((i) => ({ label: i.item_label, completed: i.completed ?? null, evidence: i.evidence ?? null })),
  };
}

function buildVisitContextCard(p1: V2Pass1Output): VisitContextCard {
  const vc = p1.visit_context;
  const reason = vc?.reason_for_visit?.value ?? (vc as { patient_reason?: { value?: string } })?.patient_reason?.value ?? null;
  const referredBy = vc?.referred_by?.value ?? vc?.referral_source?.value ?? null;
  const referrals = vc?.referrals?.value ?? vc?.referral_details?.value ?? null;
  const motivatingEvent = vc?.motivating_event?.value ?? vc?.timeline_event?.value ?? null;
  return {
    id: 'visit_context',
    type: 'visit_context',
    title: 'Visit context',
    isEmpty: !vc?.visit_type?.value && !reason && !referredBy,
    visitType: vc?.visit_type?.value ?? null,
    reasonForVisit: typeof reason === 'string' ? reason : null,
    referredBy: typeof referredBy === 'string' ? referredBy : null,
    referrals: typeof referrals === 'string' ? referrals : null,
    motivatingEvent: typeof motivatingEvent === 'string' ? motivatingEvent : null,
  };
}

function buildPatientGoalsCard(p1: V2Pass1Output): PatientGoalsCard {
  const pg = p1.patient_goals;
  const legacyConcerns = (pg as { concerns?: { value?: string[] } })?.concerns?.value;
  const legacyOutcomes = (pg as { desired_outcomes?: { value?: string[] } })?.desired_outcomes?.value;
  const primaryConcern = pg?.primary_concern?.value ?? (Array.isArray(legacyConcerns) && legacyConcerns.length > 0 ? legacyConcerns[0] : null);
  const secondaryConcerns = pg?.secondary_concerns?.value ?? pg?.additional_concerns?.value ?? (Array.isArray(legacyConcerns) && legacyConcerns.length > 1 ? legacyConcerns.slice(1) : []);
  const goals = pg?.goals?.value ?? legacyOutcomes ?? [];
  const anticipatedOutcomes = pg?.anticipated_outcomes?.value ?? pg?.expectations?.value ?? [];
  const treatmentAreas = pg?.treatment_areas?.value ?? [];
  const statedInterests = pg?.stated_interests?.value ?? [];
  const futureInterestsRaw = pg?.future_interests?.value;
  const futureInterests = Array.isArray(futureInterestsRaw)
    ? futureInterestsRaw.map((fi) => ({ interest: fi.interest ?? '', interestLevel: fi.interest_level ?? null }))
    : [];
  const legacyFutureSignals = pg?.future_interest_signals?.value;
  if (futureInterests.length === 0 && Array.isArray(legacyFutureSignals) && legacyFutureSignals.length > 0) {
    legacyFutureSignals.forEach((s: string) => futureInterests.push({ interest: s, interestLevel: null }));
  }
  const hasAny =
    (typeof primaryConcern === 'string' && primaryConcern.trim() !== '') ||
    secondaryConcerns.length > 0 ||
    goals.length > 0 ||
    anticipatedOutcomes.length > 0 ||
    treatmentAreas.length > 0 ||
    statedInterests.length > 0 ||
    futureInterests.length > 0;
  return {
    id: 'patient_goals',
    type: 'patient_goals',
    title: 'Patient goals',
    isEmpty: !hasAny,
    primaryConcern: typeof primaryConcern === 'string' ? primaryConcern : null,
    secondaryConcerns: Array.isArray(secondaryConcerns) ? secondaryConcerns : [],
    goals: Array.isArray(goals) ? goals : [],
    anticipatedOutcomes: Array.isArray(anticipatedOutcomes) ? anticipatedOutcomes : [],
    treatmentAreas: Array.isArray(treatmentAreas) ? treatmentAreas : [],
    statedInterests: Array.isArray(statedInterests) ? statedInterests : [],
    futureInterests,
  };
}

function buildOfferingsCard(p1: V2Pass1Output): OfferingsCard {
  const offerings = p1.offerings ?? [];
  const valueMetrics = computeOfferingValueMetrics(
    offerings.map((o) => ({ disposition: o.disposition, value: o.value }))
  );
  const groups = OFFERING_GROUPS.map((g) => ({
    label: g.label,
    dispositions: g.dispositions,
    offerings: offerings
      .filter((o) => g.dispositions.includes(o.disposition))
      .map((o) => ({ name: o.name, disposition: o.disposition, value: o.value })),
  })).filter((g) => g.offerings.length > 0);
  return {
    id: 'offerings',
    type: 'offerings',
    title: 'Products & services',
    isEmpty: offerings.length === 0,
    groups,
    valueMetrics: {
      potentialValue: valueMetrics.potentialValue,
      realizedValue: valueMetrics.realizedValue,
      committedValue: valueMetrics.committedValue,
      totalOpportunityValue: valueMetrics.totalOpportunityValue,
    },
  };
}

function buildOpportunitiesCard(p1: V2Pass1Output): OpportunitiesCard {
  const offerings = p1.offerings ?? [];
  const opportunityOfferings = offerings.filter((o) =>
    OPPORTUNITY_DISPOSITIONS.includes(o.disposition)
  );
  const items: OpportunitiesCard['items'] = opportunityOfferings.map((o) => {
    const quote =
      (typeof o.evidence === 'object' && o.evidence && 'quote' in o.evidence && typeof (o.evidence as { quote?: string }).quote === 'string')
        ? (o.evidence as { quote: string }).quote
        : '';
    const blurb = quote.trim() || `Patient interested in ${o.name}`;
    return {
      name: o.name,
      blurb,
      value: o.value ?? null,
    };
  });
  const opportunitiesSummary =
    items.length === 0
      ? null
      : items.length === 1
        ? `1 opportunity: ${items[0].name} — patient interested but not yet booked.`
        : `${items.length} opportunities: ${items.map((i) => i.name).join(', ')} — patient interested but not yet booked.`;
  return {
    id: 'opportunities',
    type: 'opportunities',
    title: 'Opportunities',
    isEmpty: items.length === 0,
    opportunitiesSummary,
    items,
  };
}

function buildNextStepsCard(p2: V2Pass2Output): NextStepsCard {
  const steps = p2.next_steps ?? [];
  return {
    id: 'next_steps',
    type: 'next_steps',
    title: 'Next steps',
    isEmpty: steps.length === 0,
    steps: steps.map((s) => ({
      action: s.action,
      timing: s.timing ?? null,
      owner: s.owner ?? 'staff',
    })),
  };
}

function buildCrossSellEffortCard(outputs: RunOutputs, p2: V2Pass2Output): CrossSellEffortCard {
  const hitl = (outputs as Record<string, unknown>).hitl_feedback as { cross_sell_effort?: string } | undefined;
  const hitlVal = hitl?.cross_sell_effort?.toLowerCase();
  const extractedVal = p2.provider_cross_sell_effort?.value;
  const value = hitlVal === 'n/a' ? 'n/a' : (hitlVal ?? extractedVal) as CrossSellEffortCard['value'];
  const label = value == null ? '—' : value === 'n/a' ? 'N/A' : value.charAt(0).toUpperCase() + value.slice(1);
  return {
    id: 'cross_sell_effort',
    type: 'cross_sell_effort',
    title: 'Cross-sell / upsell effort',
    isEmpty: value == null,
    value: value ?? null,
    label,
  };
}

function buildObjectionsCard(p2: V2Pass2Output): ObjectionsCard {
  const objections = p2.patient_signals?.objections ?? [];
  const hesitations = p2.patient_signals?.hesitations ?? [];
  const concerns = p2.patient_signals?.concerns ?? [];
  const items: ObjectionsCard['items'] = [];
  objections.forEach((o) => {
    items.push({
      kind: 'objection',
      typeOrTopic: o.type,
      statement: o.statement ?? undefined,
      resolved: o.resolved ?? null,
      resolvedLabel: o.resolved === true ? 'Resolved' : o.resolved === false ? 'Unresolved' : 'Unknown',
    });
  });
  hesitations.forEach((h) => {
    items.push({
      kind: 'hesitation',
      typeOrTopic: h.topic,
      statement: h.statement ?? undefined,
      resolved: h.resolved ?? null,
      resolvedLabel: h.resolved === true ? 'Resolved' : h.resolved === false ? 'Unresolved' : 'Unknown',
    });
  });
  concerns.forEach((c) => {
    items.push({
      kind: 'concern',
      typeOrTopic: c.concern,
      statement: undefined,
      resolved: c.addressed ?? null,
      resolvedLabel: c.addressed === true ? 'Addressed' : c.addressed === false ? 'Not addressed' : 'Unknown',
    });
  });
  const resolvedCount = items.filter((i) => i.resolved === true).length;
  return {
    id: 'objections',
    type: 'objections',
    title: 'Objections, concerns & hesitations',
    isEmpty: items.length === 0,
    items,
    resolvedCount,
    totalCount: items.length,
  };
}

export interface RunOutputToCardsOptions {
  hideEmptyCards?: boolean;
}

export function runOutputToCards(
  outputs: RunOutputs | undefined,
  options: RunOutputToCardsOptions = {}
): Card[] {
  const { hideEmptyCards = false } = options;
  if (!outputs) return [];
  if (detectExtractionVersion(outputs) !== 'v2') return [];
  const p1 = outputs.prompt_1?.parsed_json as V2Pass1Output | undefined;
  const p2 = outputs.prompt_2?.parsed_json as V2Pass2Output | undefined;
  if (!p1 || !p2) return [];

  let cards: Card[] = [
    buildSummaryCard(p2),
    buildValueMetricsCard(p1),
    buildKPIIntentCard(p2),
    buildVisitChecklistCard(p2),
    buildVisitContextCard(p1),
    buildPatientGoalsCard(p1),
    buildOfferingsCard(p1),
    buildOpportunitiesCard(p1),
    buildNextStepsCard(p2),
    buildObjectionsCard(p2),
    buildCrossSellEffortCard(outputs, p2),
  ];
  if (hideEmptyCards) cards = cards.filter((c) => !c.isEmpty);
  return cards;
}
