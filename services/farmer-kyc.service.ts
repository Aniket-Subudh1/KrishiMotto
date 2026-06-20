import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { FarmerKyc, SubmitFarmerKycPayload } from '@/types/credit';

export const farmerKycService = {
  get: () => apiClient.get<V1Response<FarmerKyc>>('/farmer/kyc'),

  submit: (payload: SubmitFarmerKycPayload) =>
    apiClient.post<V1Response<FarmerKyc>>('/farmer/kyc', payload),
};
