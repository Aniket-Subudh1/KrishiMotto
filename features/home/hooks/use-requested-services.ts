import { useMemo } from 'react';

import { useOptionalFarmerHome } from '@/features/home/context/farmer-home-context';
import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import { useHomeStorageRequests } from '@/features/home/hooks/use-storage-requests';
import {
  buildRequestedServiceItems,
} from '@/features/home/utils/requested-services';
import { useFarmerLoans } from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import { useManualRefresh } from '@/hooks/use-manual-refresh';

export function useRequestedServices(options?: { poll?: boolean }) {
  const optionalHome = useOptionalFarmerHome();
  const poll = options?.poll ?? optionalHome?.shouldPollServices ?? false;

  const bookingsQuery = useHomeBookings(undefined, { poll });
  const storageQuery = useHomeStorageRequests({ poll });
  const loansQuery = useFarmerLoans({ poll });

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
