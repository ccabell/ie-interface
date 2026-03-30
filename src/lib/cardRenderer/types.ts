/**
 * Config-Driven Card Renderer — Type Definitions
 *
 * This file defines the CONTRACT between AI output and UI rendering.
 *
 * The pattern:
 *   AI outputs → { cardType: string, props: {...} }
 *   Mapper validates → PageLayout JSON
 *   Renderer looks up component by cardType → spreads props → renders
 *
 * To add a new card:
 *   1. Add cardType to CardType union
 *   2. Add props interface
 *   3. Add component to registry
 *   4. Add mapper case (validates props shape)
 *
 * The renderer NEVER changes — all logic is in mapper + registry.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * GRID BREAKPOINTS — MUI Grid v2 responsive sizing
 * ──────────────────────────────────────────────────────────────────────────── */

export type GridBreakpoints = {
  xs?: number;  // 0px+
  sm?: number;  // 600px+
  md?: number;  // 900px+
  lg?: number;  // 1200px+
  xl?: number;  // 1536px+
};

/* ────────────────────────────────────────────────────────────────────────────
 * CARD TYPES — Registry of all supported cards
 *
 * These are GENERIC cards — they can display any content.
 * The cardType determines the visual layout, not the domain meaning.
 * ──────────────────────────────────────────────────────────────────────────── */

export type CardType =
  // ─── Base Cards (from src/components/Card/) ───
  | 'statistic'        // Single label + value
  | 'summary'          // Title + description text block
  | 'accordion'        // Expandable card with percentage value
  | 'valueAccordion'   // Percentage value with progress bar
  | 'evidence'         // Quote/snippet with score badge

  // ─── List Cards ───
  | 'list'             // Bullet/numbered/check list
  | 'keyValue'         // Key-value pairs table
  | 'chips'            // Tag cloud / chip group
  | 'timeline'         // Sequential events

  // ─── Grouped Data Cards ───
  | 'chipGroup'        // Two groups of chips (primary/secondary style)
  | 'bulletGroup'      // Multiple bullet lists in columns
  | 'itemList'         // List of structured items with status/tags

  // ─── Grouped Data Cards (domain-agnostic) ───
  | 'chipGroup'        // Two groups of chips (primary/secondary style)
  | 'bulletGroup'      // Multiple bullet lists in columns
  | 'itemList'         // List of structured items with status/tags

  // ─── Domain Cards (can be renamed for your domain) ───
  | 'concerns'         // Primary/secondary chip groups
  | 'areas'            // Treatment/concern area chips
  | 'patientGoals'     // Goals, outcomes, interests lists
  | 'futureInterests'  // Items with priority labels
  | 'productsServices' // Items with status badges
  | 'nextSteps'        // Action items with owner/timing
  | 'objections'       // Items with type/status badges
  | 'visitContext'     // Key-value context info
  | 'visitChecklist'   // Checklist items
  | 'crossSell'        // Score + description

  // ─── Composite Cards ───
  | 'sectionCard';     // Wrapper with title containing child content

/* ────────────────────────────────────────────────────────────────────────────
 * CARD PROP INTERFACES — Each card's expected props
 *
 * These interfaces define the CONTRACT for each card type.
 * AI prompts should output props matching these shapes.
 * ──────────────────────────────────────────────────────────────────────────── */

// ─── Base Cards ───

export interface StatisticCardProps {
  label: string;
  value: string;
  tooltip?: string;
}

export interface SummaryCardProps {
  title?: string;
  description: string;
  icon?: string;  // Icon name
  hasScroll?: boolean;
  scrollHeight?: number;
}

export interface AccordionCardProps {
  title: string;
  value: number;  // 0-100 percentage
  isExpandedByDefault?: boolean;
  hasToggleIcon?: boolean;
  tooltipText?: string;
  content?: string;  // Expandable content
}

export interface ValueAccordionCardProps {
  title: string;
  value: number;  // 0-100 percentage
  isExpandedByDefault?: boolean;
  isDisableToggle?: boolean;
  tooltipText?: string;
}

export interface EvidenceCardProps {
  title: string;
  score: number;  // 0-100 percentage
  snippet: string;
}

// ─── List Cards ───

export interface ListCardProps {
  title?: string;
  items: string[];
  variant?: 'bullet' | 'numbered' | 'check';
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface KeyValueCardProps {
  title?: string;
  items: KeyValuePair[];
}

export interface ChipsCardProps {
  title?: string;
  chips: string[];
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  variant?: 'filled' | 'outlined' | 'soft';
}

export interface TimelineEvent {
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'current' | 'pending';
}

export interface TimelineCardProps {
  title?: string;
  events: TimelineEvent[];
}

// ─── Grouped Data Cards ───

export interface ChipGroupCardProps {
  title?: string;
  groups: Array<{
    label: string;
    chips: string[];
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default';
    variant?: 'filled' | 'outlined' | 'soft';
  }>;
  isExpandedByDefault?: boolean;
}

export interface BulletGroupCardProps {
  title?: string;
  groups: Array<{
    label: string;
    items: string[];
  }>;
}

export interface ItemStatus {
  label: string;
  color?: 'success' | 'warning' | 'error' | 'primary' | 'default';
}

export interface ListItem {
  title: string;
  subtitle?: string;
  snippet?: string;
  tags?: string[];
  status?: ItemStatus;
  metadata?: Record<string, string>;
}

export interface ItemListCardProps {
  title?: string;
  items: ListItem[];
  isExpandedByDefault?: boolean;
}

// ─── Domain Cards (rename props for your domain) ───

export interface ConcernsCardProps {
  primary: string[];
  secondary: string[];
  isExpandedByDefault?: boolean;
}

export interface AreasCardProps {
  treatmentAreas: string[];
  concernAreas: string[];
  isExpandedByDefault?: boolean;
}

export interface PatientGoalsCardProps {
  goals: string[];
  anticipatedOutcomes: string[];
  statedInterests: string[];
}

export interface FutureInterestItem {
  label: string;
  priority: 'High' | 'Medium' | 'Low';
  snippet?: string;
}

export interface FutureInterestsCardProps {
  items: FutureInterestItem[];
}

export interface ProductItem {
  title: string;
  status: string;
  area?: string;
  quantity?: string;
  snippet?: string;
}

export interface ProductsServicesCardProps {
  items: ProductItem[];
  potentialValue?: string;
  potentialValueNote?: string;
}

export interface NextStepItem {
  title: string;
  when: string;
  owner: string;
  isCompleted?: boolean;
}

export interface NextStepsCardProps {
  items: NextStepItem[];
}

export interface ObjectionItem {
  type: 'Objection' | 'Hesitation' | 'Concern';
  status: 'Addressed' | 'Resolved' | 'Not addressed';
  title: string;
  snippet: string;
  coachingResponse?: string;
}

export interface ObjectionsCardProps {
  items: ObjectionItem[];
  isExpandedByDefault?: boolean;
}

export interface VisitContextCardProps {
  visitType: string;
  referredBy: string;
  reasonForVisit: string;
  referrals?: string;
  motivatingEvent?: string;
}

export interface VisitChecklistItem {
  label: string;
  completed: boolean;
  snippet?: string;
}

export interface VisitChecklistCardProps {
  items: VisitChecklistItem[];
  isExpandedByDefault?: boolean;
}

export interface CrossSellCardProps {
  score: number;
  description: string;
}

// ─── Composite Cards ───

export interface SectionCardProps {
  title: string;
  description?: string;
  icon?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * LAYOUT STRUCTURES — How cards are organized on a page
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * LayoutCell — A single card in the layout
 */
export interface LayoutCell<T extends CardType = CardType> {
  id: string;
  cardType: T;
  grid: GridBreakpoints;
  props: Record<string, unknown>;
}

/**
 * LayoutSection — A group of cards with optional title
 */
export interface LayoutSection {
  id: string;
  title?: string;
  cells: LayoutCell[];
}

/**
 * PageLayout — The complete page structure
 */
export interface PageLayout {
  sections: LayoutSection[];
  spacing?: number;
  metadata?: {
    version?: string;
    generatedAt?: string;
    source?: string;
    promptSetId?: string;
    transcriptId?: string;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * AI OUTPUT TYPES — Raw structures from AI extraction
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * OutputField — Single field from AI output
 * The AI outputs this shape; mapper validates and normalizes to LayoutCell
 */
export interface OutputField {
  cardType: string;           // String — might be invalid
  grid?: GridBreakpoints;     // Optional — mapper applies defaults
  props: Record<string, unknown>;  // Raw props — mapper validates shape
}

/**
 * OutputSection — Group of fields from AI output
 */
export interface OutputSection {
  id?: string;
  title?: string;
  fields: OutputField[];
}

/**
 * AIOutput — Complete AI extraction output
 */
export interface AIOutput {
  sections: OutputSection[];
  metadata?: Record<string, unknown>;
}
