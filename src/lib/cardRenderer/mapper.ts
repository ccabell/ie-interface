/**
 * Mapper — Validates AI output and produces PageLayout
 *
 * Takes raw AI output (fields with cardType + props) and:
 *   1. Validates that cardType is known
 *   2. Validates that props match the card's interface
 *   3. Normalizes props (stringify numbers, add defaults, clamp ranges)
 *   4. Produces LayoutCell with validated props
 *
 * Uses plain switch statements for validation.
 * Can be upgraded to ts-pattern for cleaner code if desired.
 */
import type {
  AIOutput,
  GridBreakpoints,
  LayoutCell,
  LayoutSection,
  OutputField,
  OutputSection,
  PageLayout,
} from './types';
import { getDefaultGrid, isValidCardType } from './registry';

/* ────────────────────────────────────────────────────────────────────────────
 * VALIDATION HELPERS
 * ──────────────────────────────────────────────────────────────────────────── */

const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number';
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
const isStringArray = (v: unknown): v is string[] =>
  isArray(v) && v.every(isString);
const isObjectArray = (v: unknown): v is Record<string, unknown>[] =>
  isArray(v) && v.every((item) => typeof item === 'object' && item !== null);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/* ────────────────────────────────────────────────────────────────────────────
 * FIELD TO CELL MAPPER
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Maps a single AI output field to a LayoutCell.
 * Returns null if cardType is unknown or props are invalid.
 */
export function fieldToCell(id: string, field: OutputField): LayoutCell | null {
  const { cardType, props, grid } = field;

  if (!isValidCardType(cardType)) {
    console.warn(`[mapper] Unknown cardType: "${cardType}"`);
    return null;
  }

  const defaultGrid = getDefaultGrid(cardType);
  const resolvedGrid: GridBreakpoints = { ...defaultGrid, ...grid };

  switch (cardType) {
    /* ────────────────── statistic ────────────────── */
    case 'statistic': {
      if (!isString(props.label)) return null;
      return {
        id,
        cardType: 'statistic',
        grid: resolvedGrid,
        props: {
          label: props.label,
          value: String(props.value ?? '—'),
          tooltip: isString(props.tooltip) ? props.tooltip : undefined,
        },
      };
    }

    /* ────────────────── summary ────────────────── */
    case 'summary': {
      if (!isString(props.description)) return null;
      return {
        id,
        cardType: 'summary',
        grid: resolvedGrid,
        props: {
          title: isString(props.title) ? props.title : undefined,
          description: props.description,
        },
      };
    }

    /* ────────────────── accordion ────────────────── */
    case 'accordion': {
      if (!isString(props.title)) return null;
      if (!isNumber(props.value)) return null;
      return {
        id,
        cardType: 'accordion',
        grid: resolvedGrid,
        props: {
          title: props.title,
          value: clamp(props.value, 0, 100),
          isExpandedByDefault: isBoolean(props.isExpandedByDefault)
            ? props.isExpandedByDefault
            : false,
        },
      };
    }

    /* ────────────────── valueAccordion ────────────────── */
    case 'valueAccordion': {
      if (!isString(props.title)) return null;
      if (!isNumber(props.value)) return null;
      return {
        id,
        cardType: 'valueAccordion',
        grid: resolvedGrid,
        props: {
          title: props.title,
          value: clamp(props.value, 0, 100),
          isExpandedByDefault: isBoolean(props.isExpandedByDefault)
            ? props.isExpandedByDefault
            : false,
          isDisableToggle: isBoolean(props.isDisableToggle)
            ? props.isDisableToggle
            : false,
        },
      };
    }

    /* ────────────────── concerns ────────────────── */
    case 'concerns': {
      if (!isStringArray(props.primary)) return null;
      if (props.primary.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'concerns',
        grid: resolvedGrid,
        props: {
          primary: props.primary,
          secondary: isStringArray(props.secondary) ? props.secondary : [],
          isExpandedByDefault: true,
        },
      };
    }

    /* ────────────────── areas ────────────────── */
    case 'areas': {
      if (!isStringArray(props.treatmentAreas)) return null;
      if (props.treatmentAreas.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'areas',
        grid: resolvedGrid,
        props: {
          treatmentAreas: props.treatmentAreas,
          concernAreas: isStringArray(props.concernAreas)
            ? props.concernAreas
            : props.treatmentAreas,
          isExpandedByDefault: true,
        },
      };
    }

    /* ────────────────── patientGoals ────────────────── */
    case 'patientGoals': {
      return {
        id,
        cardType: 'patientGoals',
        grid: resolvedGrid,
        props: {
          goals: isStringArray(props.goals) ? props.goals : [],
          anticipatedOutcomes: isStringArray(props.anticipatedOutcomes)
            ? props.anticipatedOutcomes
            : [],
          statedInterests: isStringArray(props.statedInterests)
            ? props.statedInterests
            : [],
        },
      };
    }

    /* ────────────────── futureInterests ────────────────── */
    case 'futureInterests': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'futureInterests',
        grid: resolvedGrid,
        props: {
          items: props.items.map((item) => ({
            label: isString(item.label) ? item.label : 'Interest',
            priority: ['High', 'Medium', 'Low'].includes(item.priority as string)
              ? item.priority
              : 'Medium',
            snippet: isString(item.snippet) ? item.snippet : undefined,
          })),
        },
      };
    }

    /* ────────────────── productsServices ────────────────── */
    case 'productsServices': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'productsServices',
        grid: resolvedGrid,
        props: {
          items: props.items.map((item) => ({
            title: isString(item.title) ? item.title : 'Unknown',
            status: isString(item.status) ? item.status : 'Discussed',
            area: isString(item.area) ? item.area : undefined,
            quantity: isString(item.quantity) ? item.quantity : undefined,
            snippet: isString(item.snippet) ? item.snippet : undefined,
          })),
          potentialValue: isString(props.potentialValue)
            ? props.potentialValue
            : undefined,
          potentialValueNote: isString(props.potentialValueNote)
            ? props.potentialValueNote
            : undefined,
        },
      };
    }

    /* ────────────────── nextSteps ────────────────── */
    case 'nextSteps': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'nextSteps',
        grid: resolvedGrid,
        props: {
          items: props.items.map((item) => ({
            title: isString(item.title) ? item.title : 'Step',
            when: isString(item.when) ? item.when : '',
            owner: isString(item.owner) ? item.owner : '',
            isCompleted: isBoolean(item.isCompleted) ? item.isCompleted : false,
          })),
        },
      };
    }

    /* ────────────────── objections ────────────────── */
    case 'objections': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'objections',
        grid: resolvedGrid,
        props: {
          items: props.items.map((item) => ({
            type: ['Objection', 'Hesitation', 'Concern'].includes(
              item.type as string
            )
              ? item.type
              : 'Concern',
            status: ['Addressed', 'Resolved', 'Not addressed'].includes(
              item.status as string
            )
              ? item.status
              : 'Not addressed',
            title: isString(item.title) ? item.title : 'Item',
            snippet: isString(item.snippet) ? item.snippet : '',
            coachingResponse: isString(item.coachingResponse)
              ? item.coachingResponse
              : undefined,
          })),
          isExpandedByDefault: true,
        },
      };
    }

    /* ────────────────── visitContext ────────────────── */
    case 'visitContext': {
      return {
        id,
        cardType: 'visitContext',
        grid: resolvedGrid,
        props: {
          visitType: isString(props.visitType) ? props.visitType : '',
          referredBy: isString(props.referredBy) ? props.referredBy : '',
          reasonForVisit: isString(props.reasonForVisit)
            ? props.reasonForVisit
            : '',
          referrals: isString(props.referrals) ? props.referrals : undefined,
          motivatingEvent: isString(props.motivatingEvent)
            ? props.motivatingEvent
            : undefined,
        },
      };
    }

    /* ────────────────── visitChecklist ────────────────── */
    case 'visitChecklist': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'visitChecklist',
        grid: resolvedGrid,
        props: {
          items: props.items.map((item) => ({
            label: isString(item.label) ? item.label : 'Item',
            completed: isBoolean(item.completed) ? item.completed : false,
            snippet: isString(item.snippet) ? item.snippet : undefined,
          })),
          isExpandedByDefault: true,
        },
      };
    }

    /* ────────────────── crossSell ────────────────── */
    case 'crossSell': {
      if (!isNumber(props.score)) return null;
      return {
        id,
        cardType: 'crossSell',
        grid: resolvedGrid,
        props: {
          score: clamp(props.score, 0, 100),
          description: isString(props.description) ? props.description : '',
        },
      };
    }

    /* ────────────────── evidence ────────────────── */
    case 'evidence': {
      if (!isString(props.quote)) return null;
      return {
        id,
        cardType: 'evidence',
        grid: resolvedGrid,
        props: {
          quote: props.quote,
          speaker: isString(props.speaker) ? props.speaker : undefined,
          timestamp: isString(props.timestamp) ? props.timestamp : undefined,
        },
      };
    }

    /* ────────────────── list ────────────────── */
    case 'list': {
      if (!isStringArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'list',
        grid: resolvedGrid,
        props: {
          title: props.title,
          items: props.items,
          variant: ['bullet', 'numbered', 'check'].includes(
            props.variant as string
          )
            ? props.variant
            : 'bullet',
        },
      };
    }

    /* ────────────────── keyValue ────────────────── */
    case 'keyValue': {
      if (!isObjectArray(props.items)) return null;
      if (props.items.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'keyValue',
        grid: resolvedGrid,
        props: {
          title: isString(props.title) ? props.title : undefined,
          items: props.items
            .filter((item) => isString(item.key) && isString(item.value))
            .map((item) => ({
              key: item.key as string,
              value: item.value as string,
            })),
        },
      };
    }

    /* ────────────────── timeline ────────────────── */
    case 'timeline': {
      if (!isObjectArray(props.events)) return null;
      if (props.events.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'timeline',
        grid: resolvedGrid,
        props: {
          title: isString(props.title) ? props.title : undefined,
          events: props.events.map((event) => ({
            title: isString(event.title) ? event.title : 'Event',
            description: isString(event.description)
              ? event.description
              : undefined,
            timestamp: isString(event.timestamp) ? event.timestamp : undefined,
            status: ['completed', 'current', 'pending'].includes(
              event.status as string
            )
              ? event.status
              : 'pending',
          })),
        },
      };
    }

    /* ────────────────── chips ────────────────── */
    case 'chips': {
      if (!isStringArray(props.chips)) return null;
      if (props.chips.length === 0) return null;  // Skip empty
      return {
        id,
        cardType: 'chips',
        grid: resolvedGrid,
        props: {
          title: isString(props.title) ? props.title : undefined,
          chips: props.chips,
          color: [
            'primary',
            'secondary',
            'success',
            'warning',
            'error',
            'info',
          ].includes(props.color as string)
            ? props.color
            : 'primary',
        },
      };
    }

    default:
      console.warn(`[mapper] Unhandled cardType: "${cardType}"`);
      return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * SECTION MAPPER
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Maps an AI output section to a LayoutSection.
 * Filters out invalid fields.
 */
export function sectionToLayoutSection(section: OutputSection): LayoutSection {
  const cells: LayoutCell[] = [];

  section.fields.forEach((field, index) => {
    const cell = fieldToCell(`${section.id}-${index}`, field);
    if (cell) {
      cells.push(cell);
    }
  });

  return {
    id: section.id ?? `section-${Date.now()}`,
    title: section.title,
    cells,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * MAIN MAPPER FUNCTION
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Maps raw AI output to a validated PageLayout.
 *
 * Usage:
 *   const layout = mapAIOutputToPageLayout(aiOutput);
 *   <PageRenderer layout={layout} />
 */
export function mapAIOutputToPageLayout(output: AIOutput): PageLayout {
  const sections = output.sections.map(sectionToLayoutSection);

  return {
    sections,
    spacing: 2,
    metadata: {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      ...output.metadata,
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * CONVENIENCE: Parse and Map JSON
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Parses JSON string and maps to PageLayout.
 * Returns null if parsing fails or structure is invalid.
 */
export function parseAndMapJSON(jsonString: string): PageLayout | null {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate basic structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      console.warn('[mapper] Invalid structure: missing sections array');
      return null;
    }

    return mapAIOutputToPageLayout(parsed as AIOutput);
  } catch (error) {
    console.error('[mapper] Failed to parse JSON:', error);
    return null;
  }
}
