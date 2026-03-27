/**
 * Detect extraction version from run outputs.
 */

import type { RunOutputs } from '@/shared/api/types';

export type ExtractionVersion = 'v1' | 'v2' | 'unknown';

export function detectExtractionVersion(outputs: RunOutputs | undefined): ExtractionVersion {
  if (!outputs) return 'unknown';
  const p1 = outputs.prompt_1?.parsed_json as Record<string, unknown> | undefined;
  if (!p1) return 'unknown';
  if (p1.extraction_version === '2.0') return 'v2';
  if ('visit_context' in p1) return 'v2';
  if ('passes' in p1 && Array.isArray(p1.passes)) return 'v1';
  return 'unknown';
}
