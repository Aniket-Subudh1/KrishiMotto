import type { QueryClient } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/bookings/hooks/use-booking';
import { CREDIT_KEYS } from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import { SMART_CONTRACT_KEYS } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { STORAGE_KEYS } from '@/features/storage/hooks/use-storage-request';

export const FARMER_DATA_POLL_INTERVAL_MS = 15_000;

export function invalidateBookingRelatedQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ['assigned-expert'] }),
  ]);
}

export function invalidateFarmerServiceQueries(queryClient: QueryClient) {
  return Promise.all([
    invalidateBookingRelatedQueries(queryClient),
    queryClient.invalidateQueries({ queryKey: STORAGE_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: CREDIT_KEYS.loans }),
    queryClient.invalidateQueries({ queryKey: CREDIT_KEYS.kyc }),
    queryClient.invalidateQueries({ queryKey: SMART_CONTRACT_KEYS.list }),
  ]);
}

/** @deprecated Use `invalidateFarmerServiceQueries`. */
export function invalidateRequestedServicesQueries(queryClient: QueryClient) {
  return invalidateFarmerServiceQueries(queryClient);
}

export function invalidateExpertMarketplaceQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['expert', 'marketplace'] }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'requests'] }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'orders'] }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'notifications'] }),
  ]);
}

/** Keeps farmer booking views in sync when experts change order state. */
export function invalidateCrossRoleBookingQueries(queryClient: QueryClient) {
  return Promise.all([
    invalidateBookingRelatedQueries(queryClient),
    invalidateExpertMarketplaceQueries(queryClient),
  ]);
}
