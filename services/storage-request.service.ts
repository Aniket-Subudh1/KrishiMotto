import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type {
  CreateStorageRequestPayload,
  StorageIotDashboard,
  StorageRequest,
  StorageRequestListPage,
  StorageRequestStatus,
} from '@/types/storage';

export type ListStorageRequestsParams = {
  status?: StorageRequestStatus;
  cursor?: string;
  limit?: number;
};

export const storageRequestService = {
  create: (payload: CreateStorageRequestPayload) =>
    apiClient.post<V1Response<StorageRequest>>('/farmer/storage-requests', payload),

  list: (params?: ListStorageRequestsParams) =>
    apiClient.get<V1Response<StorageRequestListPage>>('/farmer/storage-requests', { params }),

  get: (id: string) =>
    apiClient.get<V1Response<StorageRequest>>(`/farmer/storage-requests/${id}`),

  getDashboard: (id: string) =>
    apiClient.get<V1Response<StorageIotDashboard>>(
      `/farmer/storage-requests/${id}/dashboard`,
    ),
};
