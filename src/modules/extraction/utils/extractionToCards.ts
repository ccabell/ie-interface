/**
 * Extraction JSON → Production Card Props Mapping Layer
 *
 * Transforms the raw JSON output from the A360 extraction prompt
 * (as defined in a360_extraction_proposal_v2) into the exact prop
 * shapes expected by the production Intelligence tab card components.
 *
 * This is the critical bridge between prompt output and UI rendering.
 *
 * Supports both:
 * - Legacy format (flat structure)
 * - V3 format (nested structure with evidence, split across prompt_1/prompt_2)
 */

import type { ProductItemV2 } from '@/shared/cards/intelligence/ProductsServicesCardV2';
import type { ObjectionItem } from '@/shared/cards/intelligence/ObjectionsCard';
import type { NextStepItem } from '@/shared/cards/intelligence/NextStepsTimelineCard';

// ─── Raw extraction JSON shape (from the prompt) ───

// Legacy format
export interface ExtractionOutput {
  summary?: string;
  patient_goals?: string[];
  treatments_discussed?: TreatmentDiscussed[];
  concerns?: ConcernItem[];
  next_steps?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'unclear';
  commitment_score?: number;
}

interface TreatmentDiscussed {
  name: string;
  interest?: 'high' | 'medium' | 'low';
  status?: string; // "Recommended - receptive" | "Discussed - considering" | "Mentioned - hesitant"
  area?: string;
  quote?: string;
}

interface ConcernItem {
  text: string;
  type?: 'Objection' | 'Hesitation' | 'Concern';
  addressed?: boolean;
}

// ─── V3 Extraction Format Types ───

interface V3Evidence {
  quote: string;
  speaker: string;
  confidence: number;
}

interface V3ValueWithEvidence<T> {
  value: T;
  evidence?: V3Evidence[];
  missing_reason?: string | null;
}

interface V3Offering {
  name: string;
  type: string;
  disposition: string;
  area?: string;
  quantity?: string;
  mentioned_value?: number | null;
  guidance_discovery?: {
    provider_guided: boolean;
    guidance_type: string;
    patient_reception: string;
    reception_evidence?: string;
    guidance_rationale?: string;
  };
  evidence?: V3Evidence;
}

interface V3Concern {
  concern: string;
  raised_by: string;
  category: string;
  addressed: boolean;
  response?: string;
  evidence?: V3Evidence;
}

interface V3NextStep {
  action: string;
  timing?: string;
  owner?: string;
  evidence?: V3Evidence;
}

export interface V3ExtractionPass1 {
  extraction_version: '3.0';
  pass: 1;
  visit_context?: {
    visit_type?: V3ValueWithEvidence<string>;
    reason_for_visit?: V3ValueWithEvidence<string>;
    referred_by?: V3ValueWithEvidence<string>;
    referrals?: V3ValueWithEvidence<string | null>;
    motivating_event?: V3ValueWithEvidence<string | null>;
  };
  patient_goals?: {
    primary_concern?: V3ValueWithEvidence<string>;
    secondary_concerns?: V3ValueWithEvidence<string[]>;
    goals?: V3ValueWithEvidence<string[]>;
    anticipated_outcomes?: V3ValueWithEvidence<string[]>;
  };
  areas?: {
    treatment_areas?: V3ValueWithEvidence<string[]>;
    concern_areas?: V3ValueWithEvidence<string[]>;
  };
  interests?: {
    stated_interests?: V3ValueWithEvidence<string[]>;
    future_interests?: V3ValueWithEvidence<string[] | null>;
  };
  offerings?: V3Offering[];
}

export interface V3ExtractionPass2 {
  extraction_version: '3.0';
  pass: 2;
  signal_tags?: string[];
  intent_score?: V3ValueWithEvidence<number>;
  sentiment_final?: V3ValueWithEvidence<number>;
  sentiment_trajectory?: V3ValueWithEvidence<number[]>;
  outcome?: {
    status?: V3ValueWithEvidence<string>;
    summary?: V3ValueWithEvidence<string>;
  };
  next_steps?: V3NextStep[];
  patient_signals?: {
    commitment_level?: V3ValueWithEvidence<string>;
  };
  objections?: V3Concern[];
  hesitations?: V3Concern[];
  concerns?: V3Concern[];
  visit_checklist?: Array<{
    item_id: string;
    item_label: string;
    category: string;
    completed: boolean;
    evidence?: V3Evidence;
  }>;
}

export interface V3CombinedExtraction {
  prompt_1?: V3ExtractionPass1;
  prompt_2?: V3ExtractionPass2;
}

// Type guard for V3 format
export function isV3Extraction(obj: unknown): obj is V3ExtractionPass1 | V3ExtractionPass2 {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'extraction_version' in obj &&
    (obj as Record<string, unknown>).extraction_version === '3.0'
  );
}

// ─── Mapped card props ───

export interface MappedCardData {
  generalSummary: {
    description: string;
    stats: Array<{ label: string; value: string; score?: number }>;
    commitmentLevel: number;
    sentiment?: 'positive' | 'neutral' | 'negative' | 'unclear';
  };
  patientGoals: {
    goals: string[];
    anticipatedOutcomes: string[];
    statedInterests: string[];
  };
  productsServices: {
    items: ProductItemV2[];
  };
  objections: {
    items: ObjectionItem[];
  };
  nextSteps: {
    items: NextStepItem[];
  };
  isEmpty: {
    summary: boolean;
    patientGoals: boolean;
    treatments: boolean;
    concerns: boolean;
    nextSteps: boolean;
    commitmentScore: boolean;
  };
}

// ─── Empty state messages (from PDF section 4) ───

export const EMPTY_STATE_MESSAGES = {
  summary: 'No summary available \u2014 transcript may be too short or unclear.',
  patientGoals: 'No patient goals identified in this consultation.',
  treatments: 'No catalog treatments were mentioned in this consultation.',
  concerns: 'No objections or concerns were identified.',
  nextSteps: 'No next steps were identified.',
  commitmentScore: 'Insufficient signal \u2014 score may not be reliable.',
} as const;

// ─── Interest level to status mapping ───

function interestToStatus(interest?: string, status?: string): ProductItemV2['status'] {
  // If the prompt already returned a status string, use it directly
  if (status === 'Recommended - receptive' || status === 'Discussed - considering' || status === 'Mentioned - hesitant') {
    return status;
  }
  // Otherwise map from interest level
  switch (interest) {
    case 'high':
      return 'Recommended - receptive';
    case 'medium':
      return 'Discussed - considering';
    case 'low':
      return 'Mentioned - hesitant';
    default:
      return 'Discussed - considering';
  }
}

// ─── V3 disposition to status mapping ───

function dispositionToStatus(disposition: string, reception?: string): ProductItemV2['status'] {
  if (disposition === 'performed' || disposition === 'scheduled' || reception === 'engaged') {
    return 'Recommended - receptive';
  }
  if (disposition === 'recommended' || reception === 'receptive') {
    return 'Discussed - considering';
  }
  if (disposition === 'mentioned' || reception === 'hesitant') {
    return 'Mentioned - hesitant';
  }
  return 'Discussed - considering';
}

// ─── Map V3 combined extraction to MappedCardData ───

export function mapV3ExtractionToCards(combined: V3CombinedExtraction): MappedCardData {
  const p1 = combined.prompt_1;
  const p2 = combined.prompt_2;

  // Extract summary from prompt_2's outcome
  const summary = p2?.outcome?.summary?.value ?? '';

  // Extract patient goals from prompt_1
  const goalsArray = p1?.patient_goals?.goals?.value ?? [];
  const primaryConcern = p1?.patient_goals?.primary_concern?.value;
  const patientGoals = primaryConcern ? [primaryConcern, ...goalsArray] : goalsArray;

  // Extract anticipated outcomes
  const anticipatedOutcomes = p1?.patient_goals?.anticipated_outcomes?.value ?? [];

  // Extract stated interests
  const statedInterests = p1?.interests?.stated_interests?.value ?? [];

  // Map offerings to treatments
  const offerings = p1?.offerings ?? [];
  const treatments: ProductItemV2[] = offerings.map((o) => ({
    title: o.name,
    status: dispositionToStatus(o.disposition, o.guidance_discovery?.patient_reception),
    area: o.area,
    snippet: o.evidence?.quote ?? o.guidance_discovery?.reception_evidence,
  }));

  // Map concerns/objections/hesitations from prompt_2
  const allConcerns: ObjectionItem[] = [];

  for (const c of p2?.objections ?? []) {
    allConcerns.push({
      type: 'Objection',
      status: c.addressed ? 'Addressed' : 'Not addressed',
      title: c.concern,
      snippet: c.evidence?.quote ?? c.response ?? '',
    });
  }
  for (const c of p2?.hesitations ?? []) {
    allConcerns.push({
      type: 'Hesitation',
      status: c.addressed ? 'Addressed' : 'Not addressed',
      title: c.concern,
      snippet: c.evidence?.quote ?? c.response ?? '',
    });
  }
  for (const c of p2?.concerns ?? []) {
    allConcerns.push({
      type: 'Concern',
      status: c.addressed ? 'Addressed' : 'Not addressed',
      title: c.concern,
      snippet: c.evidence?.quote ?? c.response ?? '',
    });
  }

  // Map next steps from prompt_2
  const nextSteps: NextStepItem[] = (p2?.next_steps ?? []).map((ns) => ({
    title: ns.action,
    when: ns.timing ?? '',
    owner: ns.owner ?? '',
  }));

  // Calculate commitment score (V3 uses 0-1 scale, we need 0-100)
  const intentScore = p2?.intent_score?.value ?? 0.5;
  const commitmentScore = Math.round(intentScore * 100);

  // Map sentiment (V3 uses 0-1 scale)
  const sentimentValue = p2?.sentiment_final?.value ?? 0.5;
  let sentiment: 'positive' | 'neutral' | 'negative' | 'unclear';
  if (sentimentValue >= 0.7) {
    sentiment = 'positive';
  } else if (sentimentValue >= 0.4) {
    sentiment = 'neutral';
  } else if (sentimentValue >= 0.2) {
    sentiment = 'negative';
  } else {
    sentiment = 'unclear';
  }

  return {
    generalSummary: {
      description: summary,
      stats: [],
      commitmentLevel: commitmentScore,
      sentiment,
    },
    patientGoals: {
      goals: patientGoals,
      anticipatedOutcomes,
      statedInterests,
    },
    productsServices: {
      items: treatments,
    },
    objections: {
      items: allConcerns,
    },
    nextSteps: {
      items: nextSteps,
    },
    isEmpty: {
      summary: !summary,
      patientGoals: patientGoals.length === 0,
      treatments: treatments.length === 0,
      concerns: allConcerns.length === 0,
      nextSteps: nextSteps.length === 0,
      commitmentScore: intentScore === 0.5 && sentimentValue === 0.5,
    },
  };
}

// ─── Main mapping function ───

export function mapExtractionToCards(extraction: ExtractionOutput): MappedCardData {
  const summary = extraction.summary ?? '';
  const patientGoals = extraction.patient_goals ?? [];
  const treatments = extraction.treatments_discussed ?? [];
  const concerns = extraction.concerns ?? [];
  const nextSteps = extraction.next_steps ?? [];
  const commitmentScore = extraction.commitment_score ?? 50;
  const sentiment = extraction.sentiment;

  return {
    generalSummary: {
      description: summary,
      stats: [],
      commitmentLevel: commitmentScore,
      sentiment,
    },

    patientGoals: {
      goals: patientGoals,
      anticipatedOutcomes: [], // Not in simple extraction prompt
      statedInterests: [], // Not in simple extraction prompt
    },

    productsServices: {
      items: treatments.map(t => ({
        title: t.name,
        status: interestToStatus(t.interest, t.status),
        area: t.area,
        snippet: t.quote,
      })),
    },

    objections: {
      items: concerns.map(c => ({
        type: c.type ?? 'Concern',
        status: c.addressed ? 'Addressed' : 'Not addressed',
        title: c.text,
        snippet: '', // Simple prompt doesn't extract quotes for concerns
      })),
    },

    nextSteps: {
      items: nextSteps.map(step => ({
        title: step,
        when: '',
        owner: '',
      })),
    },

    isEmpty: {
      summary: !summary,
      patientGoals: patientGoals.length === 0,
      treatments: treatments.length === 0,
      concerns: concerns.length === 0,
      nextSteps: nextSteps.length === 0,
      commitmentScore: commitmentScore === 50 && !sentiment,
    },
  };
}

// ─── JSON validation ───

export function validateExtractionJson(json: unknown): { valid: boolean; error?: string; data?: ExtractionOutput } {
  if (typeof json !== 'object' || json === null) {
    return { valid: false, error: 'Expected a JSON object, got ' + typeof json };
  }

  const obj = json as Record<string, unknown>;

  // Check for required-ish fields (all are optional per spec, but warn if totally empty)
  const hasAnyField = [
    'summary',
    'patient_goals',
    'treatments_discussed',
    'concerns',
    'next_steps',
    'sentiment',
    'commitment_score',
  ].some(key => key in obj);

  if (!hasAnyField) {
    return { valid: false, error: 'JSON object has none of the expected extraction fields (summary, patient_goals, treatments_discussed, concerns, next_steps, sentiment, commitment_score)' };
  }

  return { valid: true, data: obj as ExtractionOutput };
}

// ─── V3 JSON validation ───

export function validateV3ExtractionJson(json: unknown): { valid: boolean; error?: string; data?: V3ExtractionPass1 | V3ExtractionPass2 } {
  if (typeof json !== 'object' || json === null) {
    return { valid: false, error: 'Expected a JSON object, got ' + typeof json };
  }

  const obj = json as Record<string, unknown>;

  // Check for V3 signature fields
  if (obj.extraction_version !== '3.0') {
    return { valid: false, error: 'Not a V3 extraction (missing extraction_version: "3.0")' };
  }

  const pass = obj.pass;
  if (pass !== 1 && pass !== 2) {
    return { valid: false, error: 'V3 extraction must have pass: 1 or pass: 2' };
  }

  return { valid: true, data: obj as unknown as V3ExtractionPass1 | V3ExtractionPass2 };
}

// ─── Combined extraction from full API response ───

export interface RunExtractionResponse {
  id: string;
  run_id: string;
  status: string;
  outputs?: {
    prompt_1?: { parsed_json?: V3ExtractionPass1 };
    prompt_2?: { parsed_json?: V3ExtractionPass2 };
  };
  // Legacy format fields (might be at top level)
  parsed_json?: ExtractionOutput;
  result?: { parsed_json?: ExtractionOutput };
}

export function mapRunResponseToCards(response: RunExtractionResponse): MappedCardData | null {
  // Check for V3 format (outputs.prompt_1 / prompt_2 structure)
  if (response.outputs?.prompt_1?.parsed_json || response.outputs?.prompt_2?.parsed_json) {
    const p1 = response.outputs.prompt_1?.parsed_json;
    const p2 = response.outputs.prompt_2?.parsed_json;

    // Verify at least one pass is V3
    if ((p1 && isV3Extraction(p1)) || (p2 && isV3Extraction(p2))) {
      return mapV3ExtractionToCards({
        prompt_1: p1 as V3ExtractionPass1 | undefined,
        prompt_2: p2 as V3ExtractionPass2 | undefined,
      });
    }
  }

  // Check for legacy format at top level
  if (response.parsed_json) {
    const validation = validateExtractionJson(response.parsed_json);
    if (validation.valid && validation.data) {
      return mapExtractionToCards(validation.data);
    }
  }

  // Check for legacy format in result.parsed_json
  if (response.result?.parsed_json) {
    const validation = validateExtractionJson(response.result.parsed_json);
    if (validation.valid && validation.data) {
      return mapExtractionToCards(validation.data);
    }
  }

  return null;
}

// ─── Sample extraction JSON (from PDF spec) ───

export const SAMPLE_EXTRACTION_JSON: ExtractionOutput = {
  summary:
    'Patient presented for initial consultation regarding anti-aging treatments, specifically Botox and dermal fillers. Patient expressed strong interest in natural-looking results but raised concerns about downtime. Provider discussed treatment options and scheduled follow-up.',
  patient_goals: [
    'Achieve a refreshed, natural look',
    'Look youthful for upcoming family event',
    'Maintain results for 6-12 months',
  ],
  treatments_discussed: [
    {
      name: 'Botox',
      interest: 'high',
      status: 'Recommended - receptive',
      area: 'Forehead, glabella',
      quote: "I've been wanting to try Botox for a while now",
    },
    {
      name: 'Dermal filler (Juvederm)',
      interest: 'high',
      status: 'Recommended - receptive',
      area: 'Nasolabial folds',
      quote: "I'm interested but want to start small",
    },
    {
      name: 'Chemical Peel (light)',
      interest: 'medium',
      status: 'Discussed - considering',
      area: 'Full face',
      quote: 'Interested but not urgent',
    },
    {
      name: 'HydraFacial',
      interest: 'low',
      status: 'Mentioned - hesitant',
      area: 'Full face',
      quote: 'Maybe something to consider down the road',
    },
  ],
  concerns: [
    { text: 'Concerned about downtime and recovery period', type: 'Concern', addressed: true },
    { text: 'Cost and payment options', type: 'Objection', addressed: true },
    { text: 'Natural results uncertainty', type: 'Hesitation', addressed: false },
  ],
  next_steps: [
    'Schedule Botox appointment for next Tuesday',
    'Send pre-treatment instructions 3 days before',
    'Follow-up consultation for filler planning',
  ],
  sentiment: 'positive',
  commitment_score: 78,
};
