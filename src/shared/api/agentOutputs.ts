/**
 * A360 Agent Output Types
 *
 * These types define the structure of AI agent outputs from the A360 platform.
 * Used for rendering consultation intelligence, TCP, SOAP notes, and KPIs.
 *
 * Based on: tremor-agent-viewer/src/types/agentOutputs.ts
 */

// ============================================================================
// Agent Output Types
// ============================================================================

export type AgentOutputType =
  | 'consultation_intelligence'
  | 'tcp'
  | 'soap_note'
  | 'kpi_evaluation'
  | 'opportunity_extraction'
  | 'coaching_report'
  | 'unknown';

export interface AgentOutput {
  type: AgentOutputType;
  data: Record<string, unknown>;
  metadata?: {
    model?: string;
    tokens?: number;
    latency_ms?: number;
  };
}

// ============================================================================
// Consultation Intelligence
// ============================================================================

export interface ConsultationIntelligence {
  // Summary
  general_summary?: string;

  // Tier 1 - Real-time fields
  patient_goal_primary_value?: string;
  intent_strength_0_100_value?: number;
  call_type?: string;
  target_areas_value?: string[];
  buy_signals_value?: string[];
  pricing_discussed_value?: boolean;
  next_step_status_value?: string;

  // Tier 2 - KPI Scores
  patient_sentiment_score?: number;
  protocol_adherence_score?: number;
  patient_engagement_score?: number;
  plan_clarity_score?: number;
  close_attempt_rate?: number;
  objection_handling_rate?: number;
  empathy_statement_rate?: number;

  // Concerns & Areas
  concerns?: {
    primary?: string[];
    secondary?: string[];
  };
  treatment_areas?: string[];
  concern_areas?: string[];

  // Visit Context
  visit_context?: {
    visit_type?: string;
    referred_by?: string;
    reason_for_visit?: string;
    motivating_event?: string;
  };

  // Goals
  patient_goals?: string[];
  anticipated_outcomes?: string[];
  stated_interests?: string[];

  // Products & Services
  products_discussed?: ProductServiceItem[];
  services_discussed?: ProductServiceItem[];

  // Opportunities
  primary_opportunity?: Opportunity;
  secondary_opportunities?: Opportunity[];
  future_opportunities?: Opportunity[];

  // Objections
  objections?: Objection[];

  // Next Steps
  next_steps?: NextStep[];

  // Cross-sell
  cross_sell_score?: number;
  cross_sell_description?: string;
}

export interface ProductServiceItem {
  title: string;
  status: 'Recommended - receptive' | 'Discussed - considering' | 'Mentioned - hesitant';
  area?: string;
  quantity?: string;
  snippet?: string;
}

export interface Opportunity {
  opportunity_type: 'primary' | 'secondary' | 'future';
  service_id?: string;
  service_name?: string;
  status: 'discussed' | 'recommended' | 'booked' | 'deferred';
  patient_intent: 'high' | 'medium' | 'low';
  pricing_discussed: boolean;
  area?: string;
  evidence?: string[];
  confidence_score?: number;
  next_step?: string;
  estimated_value?: number;
}

export interface Objection {
  type: 'Objection' | 'Hesitation' | 'Concern';
  status: 'Addressed' | 'Resolved' | 'Not addressed';
  title: string;
  snippet?: string;
  coaching_response?: string;
}

export interface NextStep {
  title: string;
  when?: string;
  owner?: string;
  is_completed?: boolean;
}

// ============================================================================
// Treatment & Care Plan (TCP)
// ============================================================================

export interface TreatmentCarePlan {
  plan_summary?: string;
  options?: TreatmentOption[];
  total_value?: number;
  package_savings?: number;
  patient_education?: string[];
  follow_up_care?: FollowUpItem[];
  provider_recommendations?: string[];
}

export interface TreatmentOption {
  tier: 'good' | 'better' | 'best';
  name: string;
  description?: string;
  services: TreatmentService[];
  total_price: number;
  savings?: number;
}

export interface TreatmentService {
  name: string;
  quantity?: string;
  unit_price?: number;
  total_price?: number;
  notes?: string;
}

export interface FollowUpItem {
  action: string;
  timing: string;
  responsible_party?: string;
}

// ============================================================================
// SOAP Note
// ============================================================================

export interface SoapNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

// ============================================================================
// KPI Evaluation
// ============================================================================

export interface KpiEvaluation {
  category: string;
  scores: KpiScore[];
  overall_score?: number;
  recommendations?: string[];
}

export interface KpiScore {
  kpi_name: string;
  score: number;
  evidence?: string[];
  coaching_tip?: string;
}

// ============================================================================
// Coaching Report (Sales Excellence Framework)
// ============================================================================

export interface CoachingReport {
  overallScore: number;
  consultationSummary: string;
  dimensionScores: DimensionScore[];
  coachingReport: CoachingFeedback;
}

export interface DimensionScore {
  id: DimensionId;
  score: number;
  evidence: string;
  key_quote: string;
}

export type DimensionId =
  | 'rapport_trust'
  | 'needs_assessment'
  | 'education'
  | 'value_presentation'
  | 'objection_handling'
  | 'closing_commitment'
  | 'upsell_crosssell'
  | 'follow_up';

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  rapport_trust: 'Rapport & Trust',
  needs_assessment: 'Needs Assessment',
  education: 'Patient Education',
  value_presentation: 'Value Presentation',
  objection_handling: 'Objection Handling',
  closing_commitment: 'Closing & Commitment',
  upsell_crosssell: 'Ethical Upselling',
  follow_up: 'Follow-Up & Continuity',
};

export const DIMENSION_FRAMEWORK_REFS: Record<DimensionId, string> = {
  rapport_trust: 'Part 6: Building Rapport and Trust',
  needs_assessment: 'Part 4: Needs Assessment',
  education: 'Part 5: Patient Education',
  value_presentation: 'Part 9: Value Presentation',
  objection_handling: 'Part 10: Objection Handling',
  closing_commitment: 'Part 11: Closing & Commitment',
  upsell_crosssell: 'Part 12: Ethical Upselling',
  follow_up: 'Part 15: Follow-Up & Continuity',
};

export interface CoachingFeedback {
  strengths: CoachingStrength[];
  improvements: CoachingImprovement[];
  quick_wins: QuickWin[];
  coaching_focus: string;
  coaching_focus_rationale: string;
}

export interface CoachingStrength {
  title: string;
  observation: string;
  quote: string;
  framework_principle: string;
  framework_ref: string;
  impact: string;
}

export interface CoachingImprovement {
  title: string;
  priority: 'high' | 'medium' | 'low';
  observation: string;
  technique: string;
  rewrite: string;
  framework_ref: string;
  expected_impact: string;
}

export interface QuickWin {
  action: string;
  rationale: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function detectOutputType(data: Record<string, unknown>): AgentOutputType {
  // Check for coaching report structure
  if ('overallScore' in data && 'dimensionScores' in data && 'coachingReport' in data) {
    return 'coaching_report';
  }

  // Check for SOAP note structure
  if ('subjective' in data || 'objective' in data || 'assessment' in data) {
    return 'soap_note';
  }

  // Check for TCP structure
  if ('options' in data || 'treatment_options' in data || 'plan_summary' in data) {
    return 'tcp';
  }

  // Check for KPI evaluation
  if ('scores' in data && 'category' in data) {
    return 'kpi_evaluation';
  }

  // Check for opportunity extraction
  if ('primary_opportunity' in data || 'opportunities' in data) {
    return 'opportunity_extraction';
  }

  // Check for consultation intelligence
  if (
    'patient_goal_primary_value' in data ||
    'intent_strength_0_100_value' in data ||
    'products_discussed' in data ||
    'services_discussed' in data ||
    'general_summary' in data
  ) {
    return 'consultation_intelligence';
  }

  return 'unknown';
}

export type ScoreColor = 'success' | 'warning' | 'error' | 'info';

export function getScoreColor(score: number): ScoreColor {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'error';
  return 'info';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// Mock Data for Development
// ============================================================================

export const MOCK_CONSULTATION_OUTPUT: AgentOutput = {
  type: 'consultation_intelligence',
  data: {
    general_summary:
      'Patient presented for consultation regarding facial rejuvenation concerns, specifically addressing volume loss and skin texture. Provider recommended a combination approach including dermal fillers and skin resurfacing treatments.',
    patient_goal_primary_value: 'Natural facial rejuvenation',
    intent_strength_0_100_value: 78,
    call_type: 'Initial Consultation',
    target_areas_value: ['Cheeks', 'Nasolabial folds', 'Under-eye area'],
    patient_sentiment_score: 85,
    protocol_adherence_score: 92,
    patient_engagement_score: 88,
    plan_clarity_score: 90,
    concerns: {
      primary: ['Volume loss in mid-face', 'Deep nasolabial folds'],
      secondary: ['Fine lines around eyes', 'Skin texture concerns'],
    },
    patient_goals: [
      'Look more refreshed and youthful',
      'Maintain natural appearance',
      'Minimize downtime',
    ],
    products_discussed: [
      {
        title: 'Juvederm Voluma',
        status: 'Recommended - receptive',
        area: 'Cheeks',
        quantity: '2 syringes',
        snippet: 'Patient showed strong interest in cheek augmentation',
      },
      {
        title: 'Restylane Lyft',
        status: 'Discussed - considering',
        area: 'Nasolabial folds',
        quantity: '1 syringe',
      },
      {
        title: 'HydraFacial',
        status: 'Mentioned - hesitant',
        area: 'Full face',
        snippet: 'Patient asked about pricing',
      },
    ],
    objections: [
      {
        type: 'Hesitation',
        status: 'Addressed',
        title: 'Concerns about looking overdone',
        snippet: 'I just want to look like myself, not different',
        coaching_response:
          'Provider effectively addressed by showing before/after photos of natural results',
      },
      {
        type: 'Objection',
        status: 'Not addressed',
        title: 'Budget considerations',
        snippet: 'This seems more expensive than I expected',
      },
    ],
    next_steps: [
      { title: 'Schedule treatment appointment', when: 'Within 2 weeks', is_completed: false },
      { title: 'Send pre-treatment instructions', when: 'Immediately', is_completed: true },
      { title: 'Follow up on financing options', when: 'Within 3 days', is_completed: false },
    ],
  },
  metadata: {
    model: 'claude-3-sonnet',
    tokens: 2450,
    latency_ms: 3200,
  },
};

export const MOCK_COACHING_OUTPUT: AgentOutput = {
  type: 'coaching_report',
  data: {
    overallScore: 7.8,
    consultationSummary:
      'Strong consultation with excellent rapport building and patient education. Areas for improvement include more proactive addressing of pricing concerns and stronger close attempt.',
    dimensionScores: [
      {
        id: 'rapport_trust',
        score: 9,
        evidence: 'Provider established personal connection early, used patient name frequently',
        key_quote: 'I really appreciate you taking the time to explain your concerns',
      },
      {
        id: 'needs_assessment',
        score: 8,
        evidence: 'Thorough discovery questions about goals and timeline',
        key_quote: "Tell me more about what you're hoping to achieve",
      },
      {
        id: 'education',
        score: 8,
        evidence: 'Clear explanation of treatment options with visual aids',
        key_quote: "Let me show you how this works and what you can expect",
      },
      {
        id: 'value_presentation',
        score: 7,
        evidence: 'Good benefit focus but missed opportunity to quantify value',
        key_quote: 'This treatment typically lasts 12-18 months',
      },
      {
        id: 'objection_handling',
        score: 6,
        evidence: 'Addressed natural look concern well but avoided pricing objection',
        key_quote: "I understand your concern about looking natural",
      },
      {
        id: 'closing_commitment',
        score: 7,
        evidence: 'Soft close attempted but no urgency created',
        key_quote: "When you're ready, we can get you scheduled",
      },
      {
        id: 'upsell_crosssell',
        score: 8,
        evidence: 'Naturally introduced complementary treatment',
        key_quote: 'Many patients combine this with a HydraFacial for enhanced results',
      },
      {
        id: 'follow_up',
        score: 9,
        evidence: 'Clear next steps established with timeline',
        key_quote: "I'll have my coordinator reach out within 48 hours",
      },
    ],
    coachingReport: {
      strengths: [
        {
          title: 'Exceptional Rapport Building',
          observation:
            'Provider created immediate trust through active listening and empathy',
          quote: 'I really appreciate you taking the time to explain your concerns',
          framework_principle: 'Connection before correction',
          framework_ref: 'Part 6: Building Rapport and Trust',
          impact: 'Patient felt heard and valued, leading to open dialogue',
        },
      ],
      improvements: [
        {
          title: 'Address Pricing Objections Directly',
          priority: 'high',
          observation:
            'When patient mentioned budget concerns, provider changed subject rather than addressing',
          technique: 'Feel-Felt-Found method for price objections',
          rewrite:
            "I understand the investment feels significant. Many patients initially feel the same way. What they've found is that when they calculate the cost per month over the treatment duration, it becomes very manageable.",
          framework_ref: 'Part 10: Objection Handling',
          expected_impact: 'Convert more price-sensitive patients by reframing value',
        },
      ],
      quick_wins: [
        {
          action: 'Create urgency with limited availability',
          rationale:
            'Provider has capacity constraints that could be positioned as exclusive access',
        },
        {
          action: 'Offer financing options proactively',
          rationale: 'Removes price as barrier before it becomes objection',
        },
      ],
      coaching_focus: 'Objection Handling',
      coaching_focus_rationale:
        'Improving response to pricing concerns will have the highest impact on conversion rates based on current performance gaps',
    },
  },
  metadata: {
    model: 'claude-3-opus',
    tokens: 3850,
    latency_ms: 5200,
  },
};
