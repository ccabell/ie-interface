export const ROUTES = {
  HOME: '/',
  RUNS: '/runs',
  RUN_DETAIL: '/runs/:runId',
  OPPORTUNITIES: '/opportunities',
  DASHBOARD: '/dashboard',
  AGENTS: '/agents',
  SIMULATOR: '/simulator',
  PREVIEW: '/preview',
} as const;

export function runDetailPath(runId: string): string {
  return `/runs/${runId}`;
}
