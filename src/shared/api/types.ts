/** Run from prompt-runner API (GET /runs, GET /runs/:id) */
export interface Run {
  id: string;
  /** Human-readable run identifier (e.g. R-0042). */
  run_id?: string | null;
  transcript_id?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string | null;
  outputs?: RunOutputs;
  [key: string]: unknown;
}

/** Parsed extraction from a single pass */
export interface ParsedPass {
  patient_context?: Record<string, unknown>;
  goals_and_concerns?: Record<string, unknown>;
  clinical_constraints?: Record<string, unknown>;
  commercial_signals?: Record<string, unknown>;
  opportunities?: OpportunityBlock;
  buy_signal_strength?: number;
  [key: string]: unknown;
}

export interface OpportunityBlock {
  summary?: string;
  buy_signal_strength?: number;
  items?: OpportunityItem[];
  [key: string]: unknown;
}

export interface OpportunityItem {
  title?: string;
  description?: string;
  product_or_service?: string;
  /** Short description or quote (blurb). */
  blurb?: string;
  /** Estimated value (monetary). */
  value?: number | null;
  [key: string]: unknown;
}

/** Downstream agent result for a run (outputs.downstream[agentId]) */
export interface DownstreamResult {
  ran_at: string;
  agent_id: string;
  result: unknown;
}

/** Outputs from prompt-runner (prompt_1, prompt_2, prompt_3) — V1 shape; includes downstream agent results */
export interface RunOutputs {
  prompt_1?: { parsed_json?: { passes?: ParsedPass[] }; raw?: string };
  prompt_2?: { parsed_json?: { passes?: ParsedPass[] }; raw?: string };
  prompt_3?: { parsed_json?: { passes?: ParsedPass[] }; raw?: string };
  /** Agent results keyed by module_id */
  downstream?: Record<string, DownstreamResult>;
  [key: string]: unknown;
}

/** Agent from GET /agents (built-in, config, or DB) */
export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  url?: string;
  workflow_id?: string;
}

/** V2: evidence item */
export interface Evidence {
  quote: string;
  speaker: 'patient' | 'provider';
  confidence: number;
}

/** V2: field with value + evidence */
export interface FieldWithEvidence<T> {
  value: T | null;
  evidence?: Evidence[];
  missing_reason?: string | null;
}

/** V2 Pass 1 */
export type VisitType = 'initial' | 'follow_up' | 'procedure' | 'consultation' | 'unknown';
export interface V2VisitContext {
  visit_type?: FieldWithEvidence<VisitType>;
  reason_for_visit?: FieldWithEvidence<string>;
  referred_by?: FieldWithEvidence<string>;
  referrals?: FieldWithEvidence<string>;
  motivating_event?: FieldWithEvidence<string>;
  /** @deprecated use referred_by */
  referral_source?: FieldWithEvidence<string>;
  /** @deprecated use referrals */
  referral_details?: FieldWithEvidence<string>;
  /** @deprecated use motivating_event */
  timeline_event?: FieldWithEvidence<string>;
}
export interface V2FutureInterest {
  interest: string;
  interest_level?: 'high' | 'medium' | 'low' | null;
  evidence?: Evidence;
}
export interface V2PatientGoals {
  primary_concern?: FieldWithEvidence<string>;
  secondary_concerns?: FieldWithEvidence<string[]>;
  goals?: FieldWithEvidence<string[]>;
  anticipated_outcomes?: FieldWithEvidence<string[]>;
  treatment_areas?: FieldWithEvidence<string[]>;
  stated_interests?: FieldWithEvidence<string[]>;
  future_interests?: FieldWithEvidence<V2FutureInterest[]>;
  /** @deprecated use secondary_concerns */
  additional_concerns?: FieldWithEvidence<string[]>;
  /** @deprecated use anticipated_outcomes */
  expectations?: FieldWithEvidence<string[]>;
  /** @deprecated use future_interests */
  future_interest_signals?: FieldWithEvidence<string[]>;
}
export type OfferingDisposition =
  | 'performed' | 'scheduled' | 'agreed_pending'
  | 'recommended_receptive' | 'recommended_hesitant' | 'recommended_declined'
  | 'discussed' | 'purchased';
export interface V2Offering {
  name: string;
  type: 'product' | 'service' | 'package';
  disposition: OfferingDisposition;
  area?: string | null;
  quantity?: string | null;
  value?: number | null;
  mentioned_value?: number | null;
  evidence?: Evidence;
}
export interface V2Pass1Output {
  extraction_version?: string;
  pass?: number;
  visit_context?: V2VisitContext;
  patient_goals?: V2PatientGoals;
  offerings?: V2Offering[];
}

/** V2 Pass 2 */
export interface V2Outcome {
  status?: FieldWithEvidence<string>;
  summary?: FieldWithEvidence<string>;
}
export interface V2NextStep {
  action: string;
  timing?: string | null;
  owner: 'patient' | 'provider' | 'staff';
  evidence?: Evidence;
}
export interface V2Objection {
  type: string;
  statement?: string;
  resolved?: boolean | null;
  evidence?: Evidence;
}
export interface V2Hesitation {
  topic: string;
  statement?: string;
  resolved?: boolean | null;
  evidence?: Evidence;
}
export interface V2Concern {
  concern: string;
  raised_by: 'patient' | 'provider';
  addressed?: boolean | null;
  evidence?: Evidence;
}
export interface V2VisitChecklistItem {
  item_label: string;
  completed: boolean | null;
  evidence?: string | null;
}
export interface V2PatientSignals {
  intent_level?: FieldWithEvidence<number>;
  objections?: V2Objection[];
  hesitations?: V2Hesitation[];
  concerns?: V2Concern[];
}
export interface V2ProviderQuality {
  plan_clarity?: FieldWithEvidence<number>;
  benefits_explained?: FieldWithEvidence<boolean>;
  risks_discussed?: FieldWithEvidence<boolean>;
  aftercare_mentioned?: FieldWithEvidence<boolean>;
  asked_for_booking?: FieldWithEvidence<boolean>;
}
export interface V2Pass2Output {
  extraction_version?: string;
  pass?: number;
  outcome?: V2Outcome;
  next_steps?: V2NextStep[];
  patient_signals?: V2PatientSignals;
  visit_checklist?: V2VisitChecklistItem[];
  provider_cross_sell_effort?: FieldWithEvidence<'yes' | 'no' | 'unclear'>;
  provider_quality?: V2ProviderQuality;
}

/** Opportunity card for kanban (GET /opportunities, PATCH /opportunities/:id). Interest but not booked. */
export interface Opportunity {
  id: string;
  run_id: string;
  item_index?: number;
  stage: 'New' | 'In progress' | 'Won' | 'Lost';
  title?: string;
  description?: string;
  product_or_service?: string;
  /** Short description or quote for this opportunity (blurb). */
  blurb?: string;
  /** Estimated value (monetary) for this opportunity. */
  value?: number | null;
  /** Run-level opportunity summary (narrative). */
  opportunities_summary?: string;
  updated_at?: string;
}

/** Transcript from prompt-runner (GET /transcripts) */
export interface Transcript {
  id: string;
  consultation_id?: string;
  consult_number?: number | null;
  transcript_date?: string | null;
  duration_minutes?: number | null;
  clinic?: string | null;
  transcript_summary?: string | null;
  consult_type?: string | null;
  transcript_raw?: string;
  created_at?: string;
  [key: string]: unknown;
}
