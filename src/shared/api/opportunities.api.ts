import { client } from './client';
import type { Opportunity } from './types';

export const opportunitiesApi = {
  list: () =>
    client.get<Opportunity[]>('/opportunities').then((r) => r.data),

  updateStage: (opportunityId: string, stage: Opportunity['stage']) =>
    client
      .patch<Opportunity>(`/opportunities/${opportunityId}`, { stage })
      .then((r) => r.data),
};
