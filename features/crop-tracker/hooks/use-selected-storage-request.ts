import { useEffect, useMemo, useState } from 'react';

import { resolveStoragePaymentStatus } from '@/lib/storage-payment';
import { TRACKABLE_STORAGE_STATUSES, type StorageRequest } from '@/types/storage';

export type StorageRequestViewMode = 'track' | 'pending_intake' | 'pending_payment';

export function getStorageRequestViewMode(request: StorageRequest): StorageRequestViewMode {
  if (TRACKABLE_STORAGE_STATUSES.includes(request.status)) {
    return 'track';
  }

  if (
    request.status === 'PENDING_PAYMENT' ||
    resolveStoragePaymentStatus(request) === 'PENDING'
  ) {
    return 'pending_payment';
  }

  return 'pending_intake';
}

export function isTrackableStorageRequest(request: StorageRequest): boolean {
  return TRACKABLE_STORAGE_STATUSES.includes(request.status);
}

export function pickDefaultStorageRequest(requests: StorageRequest[]): StorageRequest | null {
  if (requests.length === 0) {
    return null;
  }

  const inStorage = requests.find((request) => request.status === 'IN_STORAGE');
  if (inStorage) {
    return inStorage;
  }

  const trackable = requests.find((request) => isTrackableStorageRequest(request));
  if (trackable) {
    return trackable;
  }

  return requests[0] ?? null;
}

export function useSelectedStorageRequest(requests: StorageRequest[]) {
  const defaultRequest = useMemo(() => pickDefaultStorageRequest(requests), [requests]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId && !requests.some((request) => request.id === selectedId)) {
      setSelectedId(null);
    }
  }, [requests, selectedId]);

  const selectedRequest = useMemo(() => {
    if (selectedId) {
      const match = requests.find((request) => request.id === selectedId);
      if (match) {
        return match;
      }
    }
    return defaultRequest;
  }, [defaultRequest, requests, selectedId]);

  return {
    selectedRequest,
    selectedId: selectedRequest?.id ?? null,
    setSelectedId,
  };
}
