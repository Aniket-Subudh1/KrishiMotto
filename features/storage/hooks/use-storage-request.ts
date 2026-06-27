import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isActiveStorageRequest } from '@/features/home/utils/storage-display';
import { FARMER_DATA_POLL_INTERVAL_MS } from '@/lib/query-cache-sync';
import { storageRequestService } from '@/services/storage-request.service';
import type { CreateStorageRequestPayload, StorageRequestStatus } from '@/types/storage';

export const STORAGE_KEYS = {
  all: ['storage-requests'] as const,
  list: (status?: StorageRequestStatus) => ['storage-requests', 'list', status] as const,
  detail: (id: string) => ['storage-requests', 'detail', id] as const,
  dashboard: (id: string) => ['storage-requests', 'dashboard', id] as const,
};

export function useCreateStorageRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStorageRequestPayload) => {
      const { data } = await storageRequestService.create(payload);
      return data.data;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: STORAGE_KEYS.all });
      queryClient.setQueryData(STORAGE_KEYS.detail(request.id), request);
    },
  });
}

export function useStorageRequests(
  status?: StorageRequestStatus,
  options?: { poll?: boolean },
) {
  return useQuery({
    queryKey: STORAGE_KEYS.list(status),
    queryFn: async () => {
      const { data } = await storageRequestService.list({ status, limit: 50 });
      return data.data;
    },
    refetchInterval: options?.poll ? FARMER_DATA_POLL_INTERVAL_MS : false,
  });
}

export function useStorageRequest(id: string | null, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: STORAGE_KEYS.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await storageRequestService.get(id!);
      return data.data;
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!options?.poll) {
        return false;
      }

      const request = query.state.data;
      if (!request || !isActiveStorageRequest(request)) {
        return false;
      }

      return FARMER_DATA_POLL_INTERVAL_MS;
    },
  });
}

export function useStorageDashboard(id: string | null, enabled = true) {
  return useQuery({
    queryKey: STORAGE_KEYS.dashboard(id ?? ''),
    queryFn: async () => {
      const { data } = await storageRequestService.getDashboard(id!);
      return data.data;
    },
    enabled: Boolean(id) && enabled,
    refetchInterval: 30_000,
  });
}
