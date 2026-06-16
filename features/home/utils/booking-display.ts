import type { Booking, BookingStatus } from '@/types/booking';
import type { ServiceIconType } from '@/types/catalog';

const BOOKING_STATUS_KEYS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'enums.bookingStatuses.pendingPayment',
  PAID: 'enums.bookingStatuses.paid',
  OPEN: 'enums.bookingStatuses.open',
  ACCEPTED: 'enums.bookingStatuses.accepted',
  TRAVELLING: 'enums.bookingStatuses.travelling',
  IN_PROGRESS: 'enums.bookingStatuses.inProgress',
  COMPLETED: 'enums.bookingStatuses.completed',
  CANCELLED: 'enums.bookingStatuses.cancelled',
};

const STATUS_BADGE_COLORS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: '#F59E0B',
  PAID: '#46962F',
  OPEN: '#1A365D',
  ACCEPTED: '#46962F',
  TRAVELLING: '#1A365D',
  IN_PROGRESS: '#1A365D',
  COMPLETED: '#64748B',
  CANCELLED: '#EF4444',
};

export function translateBookingStatus(t: (key: string) => string, status: BookingStatus): string {
  const key = BOOKING_STATUS_KEYS[status];
  const translated = t(key);
  return translated === key ? status : translated;
}

export function getBookingStatusColor(status: BookingStatus): string {
  return STATUS_BADGE_COLORS[status];
}

export function formatBookingDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getBookingRoute(booking: Booking) {
  if (booking.bookingStatus === 'PENDING_PAYMENT' || booking.paymentStatus === 'PENDING') {
    return {
      pathname: '/payment/checkout' as const,
      params: { bookingId: booking.id, orderId: booking.orderId },
    };
  }

  return {
    pathname: '/payment/result' as const,
    params: { bookingId: booking.id, orderId: booking.orderId },
  };
}

export function isServiceIconType(value: string): value is ServiceIconType {
  return /^[A-Z_]+$/.test(value);
}
