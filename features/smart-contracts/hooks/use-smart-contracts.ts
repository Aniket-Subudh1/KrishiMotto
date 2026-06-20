import { useQuery } from '@tanstack/react-query';

import { smartContractService } from '@/services/smart-contract.service';

export const SMART_CONTRACT_KEYS = {
  all: ['smart-contracts'] as const,
  list: ['smart-contracts', 'list'] as const,
  detail: (id: string) => ['smart-contracts', id] as const,
};

export function useFarmerSmartContracts() {
  return useQuery({
    queryKey: SMART_CONTRACT_KEYS.list,
    queryFn: async () => {
      const { data } = await smartContractService.listForFarmer();
      return data.data.items;
    },
  });
}

export function useFarmerSmartContract(id: string | null) {
  return useQuery({
    queryKey: SMART_CONTRACT_KEYS.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await smartContractService.getForFarmer(id!);
      return data.data;
    },
  });
}
