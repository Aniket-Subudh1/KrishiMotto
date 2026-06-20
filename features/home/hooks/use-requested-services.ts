import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';

import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import { useHomeStorageRequests } from '@/features/home/hooks/use-storage-requests';
import {
  buildRequestedServiceItems,
  REQUESTED_SERVICES_FETCH_LIMIT,
} from '@/features/home/utils/requested-services';
import { useFarmerLoans } from '@/features/ppacs-credit/hooks/use-ppacs-credit';

export function useRequestedServices() {
  const bookingsQuery = useHomeBookings(REQUESTED_SERVICES_FETCH_LIMIT);
  const storageQuery = useHomeStorageRequests(REQUESTED_SERVICES_FETCH_LIMIT);
  const loansQuery = useFarmerLoans();

  useFocusEffect(
    useCallback(() => {
      void bookingsQuery.refetch();
      void storageQuery.refetch();
      void loansQuery.refetch();
    }, [bookingsQuery.refetch, loansQuery.refetch, storageQuery.refetch]),
  );

  const items = useMemo(
    () =>
      buildRequestedServiceItems(
        bookingsQuery.data?.items ?? [],
        storageQuery.data?.items ?? [],
        loansQuery.data ?? [],
      ),
    [bookingsQuery.data?.items, loansQuery.data, storageQuery.data?.items],
  );

  const isLoading =
    bookingsQuery.isLoading || storageQuery.isLoading || loansQuery.isLoading;
  const isRefreshing =
    bookingsQuery.isRefetching || storageQuery.isRefetching || loansQuery.isRefetching;

  function refetch() {
    void bookingsQuery.refetch();
    void storageQuery.refetch();
    void loansQuery.refetch();
  }

  return { items, isLoading, isRefreshing, refetch };
}
