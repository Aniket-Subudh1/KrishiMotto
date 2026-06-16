import { useMemo } from 'react';

import { useStorageRequests } from '@/features/storage/hooks/use-storage-request';
import { TRACKABLE_STORAGE_STATUSES, type StorageRequest } from '@/types/storage';

function pickTrackableRequest(requests: StorageRequest[]): StorageRequest | null {
  const trackable = requests.filter((request) =>
    TRACKABLE_STORAGE_STATUSES.includes(request.status),
  );

  if (trackable.length === 0) return null;

  const inStorage = trackable.find((request) => request.status === 'IN_STORAGE');
  if (inStorage) return inStorage;

  return trackable[0] ?? null;
}

export function useCropTrackerAccess() {
  const query = useStorageRequests();

  const requests = query.data?.items ?? [];
  const trackableRequest = useMemo(() => pickTrackableRequest(requests), [requests]);
  const latestRequest = requests[0] ?? null;

  return {
    ...query,
    requests,
    latestRequest,
    trackableRequest,
    hasStorageRequest: requests.length > 0,
    canTrack: Boolean(trackableRequest),
  };
}
