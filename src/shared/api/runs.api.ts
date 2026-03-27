import { client } from './client';
import type { Run } from './types';

export const runsApi = {
  list: (params?: { transcript_id?: string; limit?: number; offset?: number }) =>
    client
      .get<{ data: Run[]; total: number } | Run[]>('/runs', { params })
      .then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : (d as { data: Run[] }).data ?? [];
      }),

  getById: (runId: string) =>
    client.get<Run>(`/runs/${runId}`).then((r) => r.data),

  getNeighbors: (runId: string) =>
    client
      .get<{ prev_run_id: string | null; next_run_id: string | null }>(
        `/runs/neighbors?run_id=${encodeURIComponent(runId)}`
      )
      .then((r) => r.data),

  update: (
    runId: string,
    body: { notes?: string | null; hitl_feedback?: Record<string, string> }
  ) => client.patch<Run>(`/runs/${runId}`, body).then((r) => r.data),
};
