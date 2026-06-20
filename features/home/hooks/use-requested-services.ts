import { useMemo } from 'react';

import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import { useHomeStorageRequests } from '@/features/home/hooks/use-storage-requests';
import {
  buildRequestedServiceItems,
} from '@/features/home/utils/requested-services';
import { useFarmerLoans } from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import { useManualRefresh } from '@/hooks/use-manual-refresh';

export function useRequestedServices() {
  const bookingsQuery = useHomeBookings();
  const storageQuery = useHomeStorageRequests();
  const loansQuery = useFarmerLoans();

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

  const refreshData = async () => {
    await Promise.all([
      bookingsQuery.refetch(),
      storageQuery.refetch(),
      loansQuery.refetch(),
    ]);
  };

  const { isRefreshing, onRefresh } = useManualRefresh(refreshData);

  return { items, isLoading, isRefreshing, refetch: onRefresh };
}
