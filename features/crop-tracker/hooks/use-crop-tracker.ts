import { useMemo } from 'react';

import {
  isActiveStorageRequest,
  isPaidStorageRequest,
} from '@/features/home/utils/storage-display';
import { useStorageRequests } from '@/features/storage/hooks/use-storage-request';
import { resolveStoragePaymentStatus } from '@/lib/storage-payment';
import { TRACKABLE_STORAGE_STATUSES, type StorageRequest } from '@/types/storage';

function sortByNewest(requests: StorageRequest[]): StorageRequest[] {
  return [...requests].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function pickTrackableRequest(requests: StorageRequest[]): StorageRequest | null {
  const trackable = requests.filter((request) =>
    TRACKABLE_STORAGE_STATUSES.includes(request.status),
  );

  if (trackable.length === 0) {
    return null;
  }

  const inStorage = trackable.find((request) => request.status === 'IN_STORAGE');
  if (inStorage) {
    return inStorage;
  }

  return trackable[0] ?? null;
}

function findPendingPaymentRequest(requests: StorageRequest[]): StorageRequest | null {
  return (
    requests.find(
      (request: StorageRequest) =>
        request.status === 'PENDING_PAYMENT' ||
        resolveStoragePaymentStatus(request) === 'PENDING',
    ) ?? null
  );
}

export function useCropTrackerAccess() {
  const query = useStorageRequests();

  const requests = useMemo(
    () => sortByNewest((query.data?.items ?? []).filter(isActiveStorageRequest)),
    [query.data?.items],
  );

  const paidRequests = useMemo(
    () => requests.filter(isPaidStorageRequest),
    [requests],
  );

  const trackableRequest = useMemo(
    () => pickTrackableRequest(paidRequests),
    [paidRequests],
  );

  const pendingPaymentRequest = useMemo(() => {
    if (trackableRequest) {
      return null;
    }
    return findPendingPaymentRequest(requests);
  }, [requests, trackableRequest]);

  const latestRequest = requests[0] ?? null;

  return {
    ...query,
    requests,
    paidRequests,
    pendingPaymentRequest,
    latestRequest,
    trackableRequest,
    hasStorageRequest: requests.length > 0,
    hasPaidStorageRequest: paidRequests.length > 0,
    canTrack: Boolean(trackableRequest),
  };
}
