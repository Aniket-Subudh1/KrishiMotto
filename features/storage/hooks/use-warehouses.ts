import { useQuery } from '@tanstack/react-query';

import { warehouseService } from '@/services/warehouse.service';

export const WAREHOUSE_KEYS = {
  active: ['warehouses', 'active'] as const,
};

export function useWarehouses() {
  return useQuery({
    queryKey: WAREHOUSE_KEYS.active,
    queryFn: async () => {
      const { data } = await warehouseService.listActive();
      return data.data.items;
    },
  });
}
