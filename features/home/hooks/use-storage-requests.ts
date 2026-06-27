import { STORAGE_KEYS, useStorageRequests } from '@/features/storage/hooks/use-storage-request';

export { STORAGE_KEYS };

/** @deprecated Use `useStorageRequests` directly — shares the same query cache. */
export function useHomeStorageRequests(options?: { poll?: boolean }) {
  return useStorageRequests(undefined, options);
}
