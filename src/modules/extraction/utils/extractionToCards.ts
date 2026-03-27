/**
 * Extraction JSON → Production Card Props Mapping Layer
 *
 * Transforms the raw JSON output from the A360 extraction prompt
 * (as defined in a360_extraction_proposal_v2) into the exact prop
 * shapes expected by the production Intelligence tab card components.
 *
 * This is the critical bridge between prompt output and UI rendering.
 */

import type { ProductItemV2 } from '@/shared/cards/intelligence/ProductsServicesCardV2';
import type { ObjectionItem } from '@/shared/cards/intelligence/ObjectionsCard';
import type { NextStepItem } from '@/shared/cards/intelligence/NextStepsTimelineCard';

// ─── Raw extraction JSON shape (from the prompt) ───

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
