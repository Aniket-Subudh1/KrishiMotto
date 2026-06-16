import { useQuery } from '@tanstack/react-query';

import { STORAGE_KEYS } from '@/features/storage/hooks/use-storage-request';
import { storageRequestService } from '@/services/storage-request.service';

const HOME_STORAGE_LIMIT = 5;

export function useHomeStorageRequests() {
  return useQuery({
    queryKey: STORAGE_KEYS.list(),
    queryFn: async () => {
      const { data } = await storageRequestService.list({ limit: HOME_STORAGE_LIMIT });
      return data.data;
    },
  });
}
