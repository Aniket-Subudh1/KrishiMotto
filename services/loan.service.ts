import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { ApplyAgriCreditPayload, Loan, LoanTrack } from '@/types/credit';

export const loanService = {
  listForFarmer: () => apiClient.get<V1Response<{ items: Loan[] }>>('/farmer/loans'),

  getForFarmer: (id: string) => apiClient.get<V1Response<Loan>>(`/farmer/loans/${id}`),

  applyAgriCredit: (payload: ApplyAgriCreditPayload) =>
    apiClient.post<V1Response<Loan>>('/farmer/loans/apply', payload),

  trackForFarmer: (id: string) =>
    apiClient.get<V1Response<LoanTrack>>(`/farmer/loans/${id}/track`),
};
