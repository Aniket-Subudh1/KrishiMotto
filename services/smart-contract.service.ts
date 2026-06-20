import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { FarmerSmartContract } from '@/types/credit';

export const smartContractService = {
  listForFarmer: () =>
    apiClient.get<V1Response<{ items: FarmerSmartContract[] }>>('/farmer/smart-contracts'),

  getForFarmer: (id: string) =>
    apiClient.get<V1Response<FarmerSmartContract>>(`/farmer/smart-contracts/${id}`),
};
