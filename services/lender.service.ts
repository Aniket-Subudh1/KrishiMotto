import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { Lender } from '@/types/credit';

export const lenderService = {
  listPublic: () => apiClient.get<V1Response<{ items: Lender[] }>>('/lenders'),
};
