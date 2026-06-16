import { useQuery } from '@tanstack/react-query';

import { STORAGE_KEYS } from '@/features/storage/hooks/use-storage-request';
import { storageRequestService } from '@/services/storage-request.service';

const DEFAULT_HOME_STORAGE_LIMIT = 5;

export function useHomeStorageRequests(limit = DEFAULT_HOME_STORAGE_LIMIT) {
  return useQuery({
    queryKey: [...STORAGE_KEYS.list(), { limit }],
    queryFn: async () => {
      const { data } = await storageRequestService.list({ limit });
      return data.data;
    },
  });
}
