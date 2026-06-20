import type { Booking, BookingStatus, BookingStatusTimelineEntry } from '@/types/booking';

const TERMINAL_STATUSES: BookingStatus[] = ['COMPLETED', 'CANCELLED'];

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return !TERMINAL_STATUSES.includes(status);
}

export function getBookingTimelineEntries(booking: Pick<Booking, 'statusTimeline' | 'bookingStatus' | 'updatedAt'>): BookingStatusTimelineEntry[] {
  if (booking.statusTimeline.length > 0) {
    return booking.statusTimeline;
  }

  return [{ status: booking.bookingStatus, at: booking.updatedAt }];
}

export function canUploadCompletionDocument(status: BookingStatus): boolean {
  return ['ACCEPTED', 'TRAVELLING', 'IN_PROGRESS', 'COMPLETED'].includes(status);
}

export function showPendingProgressDot(status: BookingStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

export function getBookingDetailRoute(id: string) {
  return `/bookings/${id}` as const;
}
