import { useQuery } from '@tanstack/react-query';

import { isActiveSmartContract } from '@/features/smart-contracts/utils/display';
import { FARMER_DATA_POLL_INTERVAL_MS } from '@/lib/query-cache-sync';
import { smartContractService } from '@/services/smart-contract.service';

export const SMART_CONTRACT_KEYS = {
  all: ['smart-contracts'] as const,
  list: ['smart-contracts', 'list'] as const,
  detail: (id: string) => ['smart-contracts', id] as const,
};

export function useFarmerSmartContracts(options?: { poll?: boolean }) {
  return useQuery({
    queryKey: SMART_CONTRACT_KEYS.list,
    queryFn: async () => {
      const { data } = await smartContractService.listForFarmer();
      return data.data.items;
    },
    refetchInterval: options?.poll ? FARMER_DATA_POLL_INTERVAL_MS : false,
  });
}

export function useFarmerSmartContract(id: string | null, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: SMART_CONTRACT_KEYS.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await smartContractService.getForFarmer(id!);
      return data.data;
    },
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      if (!options?.poll) {
        return false;
      }

      const contract = query.state.data;
      if (!contract || !isActiveSmartContract(contract.status)) {
        return false;
      }

      return FARMER_DATA_POLL_INTERVAL_MS;
    },
  });
}
