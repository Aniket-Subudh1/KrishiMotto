import { apiClient } from '@/lib/api-client';
import type { PaginatedItems, V1Response } from '@/types/api';
import type { Warehouse } from '@/types/storage';

export const warehouseService = {
  listActive: () => apiClient.get<V1Response<PaginatedItems<Warehouse>>>('/warehouses'),
};
