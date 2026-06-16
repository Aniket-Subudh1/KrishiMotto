import { useMemo } from 'react';

import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import { useHomeStorageRequests } from '@/features/home/hooks/use-storage-requests';
import {
  buildRequestedServiceItems,
  REQUESTED_SERVICES_FETCH_LIMIT,
} from '@/features/home/utils/requested-services';

export function useRequestedServices() {
  const bookingsQuery = useHomeBookings(REQUESTED_SERVICES_FETCH_LIMIT);
  const storageQuery = useHomeStorageRequests(REQUESTED_SERVICES_FETCH_LIMIT);

  const items = useMemo(
    () =>
      buildRequestedServiceItems(
        bookingsQuery.data?.items ?? [],
        storageQuery.data?.items ?? [],
      ),
    [bookingsQuery.data?.items, storageQuery.data?.items],
  );

  const isLoading = bookingsQuery.isLoading || storageQuery.isLoading;
  const isRefreshing = bookingsQuery.isRefetching || storageQuery.isRefetching;

  function refetch() {
    void bookingsQuery.refetch();
    void storageQuery.refetch();
  }

  return { items, isLoading, isRefreshing, refetch };
}
