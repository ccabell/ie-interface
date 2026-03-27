import { client } from './client';
import type { Transcript } from './types';

export const transcriptsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    client
      .get<{ data: Transcript[]; total: number } | Transcript[]>('/transcripts', { params })
      .then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : (d as { data: Transcript[] }).data ?? [];
      }),

  getById: (id: string) =>
    client.get<Transcript>(`/transcripts/${id}`).then((r) => r.data),
};
