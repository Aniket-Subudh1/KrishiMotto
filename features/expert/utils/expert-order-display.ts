import type { ExpertBooking, ExpertOrderNextStep } from '@/types/expert-booking';
import type { BookingStatus } from '@/types/booking';

export function getExpertOrderDetailRoute(id: string) {
  return `/expert-orders/${id}` as const;
}

export function getExpertRequestDetailRoute(id: string) {
  return `/expert-orders/${id}?source=request` as const;
}

export function getExpertNotificationRoute(notification: {
  type: string;
  payload: Record<string, unknown>;
}): string | null {
  const bookingId =
    typeof notification.payload.bookingId === 'string'
      ? notification.payload.bookingId
      : null;

  if (!bookingId) {
    return null;
  }

  if (notification.type === 'BOOKING_OPENED') {
    return getExpertRequestDetailRoute(bookingId);
  }

  return getExpertOrderDetailRoute(bookingId);
}

export function formatDistanceKm(distanceKm?: number | null): string | null {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatSlaRemaining(minutes?: number | null): string | null {
  if (minutes == null || minutes < 0) {
    return null;
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function isActiveExpertOrderStatus(status: BookingStatus): boolean {
  return !['COMPLETED', 'CANCELLED'].includes(status);
}

export function canExpertUploadDocument(status: BookingStatus): boolean {
  return ['ACCEPTED', 'TRAVELLING', 'IN_PROGRESS', 'COMPLETED'].includes(status);
}

export function getExpertStatusActionKey(nextStep: ExpertOrderNextStep): string {
  switch (nextStep) {
    case 'TRAVELLING':
      return 'expertDashboard.orderDetail.actions.travelling';
    case 'IN_PROGRESS':
      return 'expertDashboard.orderDetail.actions.inProgress';
    case 'COMPLETED':
      return 'expertDashboard.orderDetail.actions.completed';
    default:
      return 'expertDashboard.orderDetail.actions.travelling';
  }
}

export function toProgressBooking(booking: ExpertBooking) {
  return {
    statusTimeline: booking.statusTimeline,
    bookingStatus: booking.bookingStatus,
    updatedAt: booking.createdAt,
  };
}

export function formatServiceLocation(booking: Pick<ExpertBooking, 'district' | 'pincode'>): string {
  return [booking.district, booking.pincode].filter(Boolean).join(' · ');
}
