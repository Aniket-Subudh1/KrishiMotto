import {
  getBookingDetailRoute,
  parseExpertNameFromNote,
} from '@/features/bookings/utils/booking-progress';
import { looksLikeOpaqueId } from '@/lib/assigned-expert-display';
import type { Booking, BookingStatus } from '@/types/booking';
import type { ServiceIconType } from '@/types/catalog';
import type { AppIconName } from '@/components/ui/app-icon';

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
  if (!key) {
    return status;
  }
  const translated = t(key);
  return translated === key ? status : translated;
}

const TIMELINE_NOTE_EXACT_KEYS: Record<string, string> = {
  'Booking submitted': 'bookingDetail.notes.bookingSubmitted',
  'Opened for expert assignment': 'bookingDetail.notes.openedForAssignment',
  'Expert accepted request': 'bookingDetail.notes.expertAccepted',
};

export function translateBookingTimelineNote(
  t: (key: string) => string,
  note: string | undefined,
): string | undefined {
  if (!note?.trim()) {
    return undefined;
  }

  const trimmed = note.trim();
  const exactKey = TIMELINE_NOTE_EXACT_KEYS[trimmed];
  if (exactKey) {
    return t(exactKey);
  }

  const statusUpdateMatch = trimmed.match(/^Status updated to ([A-Z_]+)$/);
  if (statusUpdateMatch) {
    const status = statusUpdateMatch[1] as BookingStatus;
    if (BOOKING_STATUS_KEYS[status]) {
      return t('bookingDetail.notes.statusUpdated').replace(
        '{{status}}',
        translateBookingStatus(t, status),
      );
    }
  }

  if (/^Accepted by expert /u.test(trimmed)) {
    const name = parseExpertNameFromNote(trimmed);
    if (name && !looksLikeOpaqueId(name)) {
      return t('bookingDetail.notes.expertAcceptedBy').replace('{{name}}', name);
    }
    return t('bookingDetail.notes.expertAccepted');
  }

  if (/^Expert assigned by admin /u.test(trimmed)) {
    const name = parseExpertNameFromNote(trimmed);
    if (name && !looksLikeOpaqueId(name)) {
      return t('bookingDetail.notes.expertAssignedBy').replace('{{name}}', name);
    }
    return t('bookingDetail.notes.expertAssigned');
  }

  if (/^Expert reassigned to /u.test(trimmed)) {
    const name = parseExpertNameFromNote(trimmed);
    if (name && !looksLikeOpaqueId(name)) {
      return t('bookingDetail.notes.expertReassignedTo').replace('{{name}}', name);
    }
    return t('bookingDetail.notes.expertReassigned');
  }

  return trimmed;
}

export function getBookingStatusColor(status: BookingStatus): string {
  return STATUS_BADGE_COLORS[status];
}

const BOOKING_STATUS_ICONS: Record<BookingStatus, AppIconName> = {
  PENDING_PAYMENT: 'credit-card-outline',
  PAID: 'check-circle-outline',
  OPEN: 'account-search-outline',
  ACCEPTED: 'account-check-outline',
  TRAVELLING: 'map-marker-path',
  IN_PROGRESS: 'progress-wrench',
  COMPLETED: 'check-decagram-outline',
  CANCELLED: 'close-circle-outline',
};

export function getBookingStatusIcon(status: BookingStatus): AppIconName {
  return BOOKING_STATUS_ICONS[status] ?? 'circle-outline';
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

  return getBookingDetailRoute(booking.id);
}

export function isServiceIconType(value: string): value is ServiceIconType {
  return /^[A-Z_]+$/.test(value);
}
