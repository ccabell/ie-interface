/**
 * Config-Driven Card Renderer
 *
 * A system for rendering AI extraction output as UI cards.
 *
 * The pipeline:
 *   AI Output → Mapper → PageLayout JSON → Renderer → UI
 *
 * Usage:
 *   import { mapAIOutputToPageLayout, PageRenderer } from 'lib/cardRenderer';
 *
 *   const layout = mapAIOutputToPageLayout(aiOutput);
 *   <PageRenderer layout={layout} />
 *
 * Or directly from JSON string:
 *   import { JSONRenderer } from 'lib/cardRenderer';
 *
 *   <JSONRenderer json={jsonString} />
 */

// Types
export type {
  AIOutput,
  CardType,
  GridBreakpoints,
  LayoutCell,
  LayoutSection,
  OutputField,
  OutputSection,
  PageLayout,
  // Card prop types
  AccordionCardProps,
  AreasCardProps,
  ChipsCardProps,
  ConcernsCardProps,
  CrossSellCardProps,
  EvidenceCardProps,
  FutureInterestItem,
  FutureInterestsCardProps,
  KeyValueCardProps,
  KeyValuePair,
  ListCardProps,
  NextStepItem,
  NextStepsCardProps,
  ObjectionItem,
  ObjectionsCardProps,
  PatientGoalsCardProps,
  ProductItem,
  ProductsServicesCardProps,
  StatisticCardProps,
  SummaryCardProps,
  TimelineCardProps,
  TimelineEvent,
  ValueAccordionCardProps,
  VisitChecklistCardProps,
  VisitChecklistItem,
  VisitContextCardProps,
} from './types';

// Registry
export {
  CARD_REGISTRY,
  DEFAULT_GRIDS,
  getCardComponent,
  getDefaultGrid,
  isValidCardType,
} from './registry';

// Mapper
export {
  fieldToCell,
  mapAIOutputToPageLayout,
  parseAndMapJSON,
  sectionToLayoutSection,
} from './mapper';

// Renderer
export { JSONRenderer, PageRenderer } from './PageRenderer';

// Cards (generic)
export { ChipsCard, KeyValueCard, ListCard, TimelineCard } from './cards';
