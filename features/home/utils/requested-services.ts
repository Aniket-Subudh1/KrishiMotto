import { isActiveStorageRequest } from '@/features/home/utils/storage-display';
import type { Booking } from '@/types/booking';
import type { StorageRequest } from '@/types/storage';

export const REQUESTED_SERVICES_PREVIEW_LIMIT = 2;
export const REQUESTED_SERVICES_FETCH_LIMIT = 50;

export type RequestedServiceItem =
  | { kind: 'booking'; createdAt: string; booking: Booking }
  | { kind: 'storage'; createdAt: string; request: StorageRequest };

export function buildRequestedServiceItems(
  bookings: Booking[],
  storageRequests: StorageRequest[],
): RequestedServiceItem[] {
  const activeBookings = bookings.filter((booking) => booking.bookingStatus !== 'CANCELLED');
  const activeStorage = storageRequests.filter((request) => isActiveStorageRequest(request));

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
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
