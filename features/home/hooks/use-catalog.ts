import { useQuery } from '@tanstack/react-query';

import { catalogService } from '@/services/catalog.service';

export const CATALOG_KEYS = {
  services: ['catalog', 'services'] as const,
};

export function useCatalog(enabled = true) {
  return useQuery({
    queryKey: CATALOG_KEYS.services,
    queryFn: async () => {
      const { data } = await catalogService.listActiveServices();
      return data.data.items;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
