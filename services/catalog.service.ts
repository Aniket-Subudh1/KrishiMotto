import { apiClient } from '@/lib/api-client';
import type { PaginatedItems, V1Response } from '@/types/api';
import type { CatalogService } from '@/types/catalog';

export const catalogService = {
  listActiveServices: () =>
    apiClient.get<V1Response<PaginatedItems<CatalogService>>>('/catalog/services'),
};
