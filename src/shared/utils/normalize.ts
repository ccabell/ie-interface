/**
 * Normalize V2 scores for display (intent 1-5 → %, plan clarity 0-5 → %).
 */

export function intentLevelToPercentage(level: number | null | undefined): number | null {
  if (level == null) return null;
  return Math.round((level - 1) * 25);
}

export function intentLevelToLabel(level: number | null | undefined): string {
  if (level == null) return 'Unknown';
  const labels: Record<number, string> = {
    1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High',
  };
  return labels[level] ?? 'Unknown';
}

export function planClarityToPercentage(clarity: number | null | undefined): number | null {
  if (clarity == null) return null;
  return Math.round(clarity * 20);
}

export function planClarityToLabel(clarity: number | null | undefined): string {
  if (clarity == null) return 'Unknown';
  const labels: Record<number, string> = {
    0: 'None', 1: 'Unclear', 2: 'Vague', 3: 'Partial', 4: 'Clear', 5: 'Very Clear',
  };
  return labels[clarity] ?? 'Unknown';
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const POTENTIAL_DISPOSITIONS = ['recommended_receptive', 'recommended_hesitant'];
const REALIZED_DISPOSITIONS = ['performed', 'purchased'];
const COMMITTED_DISPOSITIONS = ['scheduled', 'agreed_pending'];

export function computeOfferingValueMetrics(
  offerings: Array<{ disposition?: string; value?: number | null }>
): { potentialValue: number; realizedValue: number; committedValue: number; totalOpportunityValue: number } {
  let potential = 0;
  let realized = 0;
  let committed = 0;
  for (const o of offerings) {
    const v = o.value ?? 0;
    const d = o.disposition ?? '';
    if (POTENTIAL_DISPOSITIONS.includes(d)) potential += v;
    else if (REALIZED_DISPOSITIONS.includes(d)) realized += v;
    else if (COMMITTED_DISPOSITIONS.includes(d)) committed += v;
  }
  return {
    potentialValue: potential,
    realizedValue: realized,
    committedValue: committed,
    totalOpportunityValue: realized + committed + potential,
  };
}
