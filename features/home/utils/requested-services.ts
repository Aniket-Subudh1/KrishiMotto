import type { QueryClient } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { CREDIT_KEYS } from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import { isActiveLoan } from '@/features/ppacs-credit/utils/loan-display';
import { isActiveStorageRequest } from '@/features/home/utils/storage-display';
import { STORAGE_KEYS } from '@/features/storage/hooks/use-storage-request';
import type { Booking } from '@/types/booking';
import type { Loan } from '@/types/credit';
import type { StorageRequest } from '@/types/storage';

export const REQUESTED_SERVICES_PREVIEW_LIMIT = 2;
export const REQUESTED_SERVICES_FETCH_LIMIT = 50;

export type RequestedServiceItem =
  | { kind: 'booking'; createdAt: string; booking: Booking }
  | { kind: 'storage'; createdAt: string; request: StorageRequest }
  | { kind: 'loan'; createdAt: string; loan: Loan };

export function buildRequestedServiceItems(
  bookings: Booking[],
  storageRequests: StorageRequest[],
  loans: Loan[] = [],
): RequestedServiceItem[] {
  const activeBookings = bookings.filter(
    (booking) =>
      booking.bookingStatus !== 'CANCELLED' && booking.serviceIconType !== 'PPACS_CREDIT',
  );
  const activeStorage = storageRequests.filter((request) => isActiveStorageRequest(request));
  const activeLoans = loans.filter((loan) => isActiveLoan(loan));

  return [
    ...activeBookings.map((booking) => ({
      kind: 'booking' as const,
      createdAt: booking.createdAt,
      booking,
    })),
    ...activeStorage.map((request) => ({
      kind: 'storage' as const,
      createdAt: request.createdAt,
      request,
    })),
    ...activeLoans.map((loan) => ({
      kind: 'loan' as const,
      createdAt: loan.createdAt,
      loan,
    })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function invalidateRequestedServicesQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: STORAGE_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: CREDIT_KEYS.loans }),
  ]);
}
