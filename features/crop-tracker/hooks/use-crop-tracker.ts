import { useMemo } from 'react';

import {
  isActiveStorageRequest,
  isPaidStorageRequest,
} from '@/features/home/utils/storage-display';
import {
  isTrackableStorageRequest,
  pickDefaultStorageRequest,
} from '@/features/crop-tracker/hooks/use-selected-storage-request';
import { useStorageRequests } from '@/features/storage/hooks/use-storage-request';
import { resolveStoragePaymentStatus } from '@/lib/storage-payment';
import { TRACKABLE_STORAGE_STATUSES, type StorageRequest } from '@/types/storage';

function sortByNewest(requests: StorageRequest[]): StorageRequest[] {
  return [...requests].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function findPendingPaymentRequests(requests: StorageRequest[]): StorageRequest[] {
  return requests.filter(
    (request) =>
      request.status === 'PENDING_PAYMENT' ||
      resolveStoragePaymentStatus(request) === 'PENDING',
  );
}

export function useCropTrackerAccess(options?: { poll?: boolean }) {
  const query = useStorageRequests(undefined, { poll: options?.poll });

  const requests = useMemo(
    () => sortByNewest((query.data?.items ?? []).filter(isActiveStorageRequest)),
    [query.data?.items],
  );

  const paidRequests = useMemo(
    () => requests.filter(isPaidStorageRequest),
    [requests],
  );

  const trackableRequests = useMemo(
    () => paidRequests.filter((request) => TRACKABLE_STORAGE_STATUSES.includes(request.status)),
    [paidRequests],
  );

  const trackableRequest = useMemo(
    () => pickDefaultStorageRequest(trackableRequests),
    [trackableRequests],
  );

  const pendingPaymentRequests = useMemo(
    () => findPendingPaymentRequests(requests),
    [requests],
  );

  const pendingPaymentRequest = pendingPaymentRequests[0] ?? null;

  const latestRequest = requests[0] ?? null;

  return {
    ...query,
    requests,
    paidRequests,
    trackableRequests,
    pendingPaymentRequests,
    pendingPaymentRequest,
    latestRequest,
    trackableRequest,
    hasStorageRequest: requests.length > 0,
    hasPaidStorageRequest: paidRequests.length > 0,
    canTrack: trackableRequests.some(isTrackableStorageRequest),
  };
}
