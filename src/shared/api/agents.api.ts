import { client } from './client';
import type { Agent } from './types';

export interface RunDownstreamParams {
  run_id: string;
  module_id: string;
  selected_outputs?: string[];
}

export const agentsApi = {
  list: () =>
    client.get<{ data: Agent[] }>('/agents').then((r) => r.data?.data ?? []),

  /** Run a downstream agent on a run. Accepts either (runId, agentId) or a RunDownstreamParams object. */
  runDownstream: (runIdOrParams: string | RunDownstreamParams, agentId?: string) => {
    const params: RunDownstreamParams =
      typeof runIdOrParams === 'string'
        ? { run_id: runIdOrParams, module_id: agentId ?? '' }
        : runIdOrParams;
    return client
      .post<unknown>('/run_downstream', {
        run_id: params.run_id,
        module_id: params.module_id,
        selected_outputs: params.selected_outputs ?? [],
      })
      .then((r) => r.data);
  },

  create: (body: Partial<Agent>) =>
    client.post<Agent>('/agents', body).then((r) => r.data),

  update: (agentId: string, body: Partial<Agent>) =>
    client.patch<Agent>(`/agents/${agentId}`, body).then((r) => r.data),

  delete: (agentId: string) =>
    client.delete(`/agents/${agentId}`).then((r) => r.data),
};
