import type { Booking, BookingStatus, BookingStatusTimelineEntry } from '@/types/booking';
import { looksLikeOpaqueId } from '@/lib/assigned-expert-display';

const TERMINAL_STATUSES: BookingStatus[] = ['COMPLETED', 'CANCELLED'];

const BOOKING_STATUS_ORDER: BookingStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'OPEN',
  'ACCEPTED',
  'TRAVELLING',
  'IN_PROGRESS',
  'COMPLETED',
];

const EXPERT_ASSIGNED_STATUSES: BookingStatus[] = [
  'ACCEPTED',
  'TRAVELLING',
  'IN_PROGRESS',
  'COMPLETED',
];

export type BookingProgressMilestone = {
  key: 'submitted' | 'assigned' | 'active' | 'done';
  statuses: BookingStatus[];
};

export const BOOKING_PROGRESS_MILESTONES: BookingProgressMilestone[] = [
  { key: 'submitted', statuses: ['PENDING_PAYMENT', 'PAID', 'OPEN'] },
  { key: 'assigned', statuses: ['ACCEPTED'] },
  { key: 'active', statuses: ['TRAVELLING', 'IN_PROGRESS'] },
  { key: 'done', statuses: ['COMPLETED'] },
];

const EXPERT_NAME_NOTE_PATTERNS = [
  /^Accepted by expert (.+)$/u,
  /^Expert assigned by admin (.+)$/u,
  /^Expert reassigned to (.+)$/u,
] as const;

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

export function canFarmerUploadCompletionDocument(
  status: BookingStatus,
  serviceIconType?: string | null,
): boolean {
  if (serviceIconType === 'CROP_CALENDAR') {
    return false;
  }
  return canUploadCompletionDocument(status);
}

export function showPendingProgressDot(status: BookingStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

export function getBookingDetailRoute(id: string) {
  return `/bookings/${id}` as const;
}

export function parseExpertNameFromNote(note?: string | null): string | undefined {
  if (!note?.trim()) {
    return undefined;
  }

  const trimmed = note.trim();
  for (const pattern of EXPERT_NAME_NOTE_PATTERNS) {
    const match = trimmed.match(pattern);
    const candidate = match?.[1]?.trim();
    if (candidate && !looksLikeOpaqueId(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function getAssignedExpertName(
  booking: Pick<Booking, 'expertName' | 'expertId' | 'statusTimeline'>,
): string | undefined {
  if (booking.expertName?.trim() && !looksLikeOpaqueId(booking.expertName)) {
    return booking.expertName.trim();
  }

  for (let index = booking.statusTimeline.length - 1; index >= 0; index -= 1) {
    const name = parseExpertNameFromNote(booking.statusTimeline[index]?.note);
    if (name) {
      return name;
    }
  }

  return undefined;
}

export function hasAssignedExpert(
  booking: Pick<Booking, 'expertId' | 'bookingStatus'>,
): boolean {
  if (booking.expertId?.trim()) {
    return true;
  }

  return EXPERT_ASSIGNED_STATUSES.includes(booking.bookingStatus);
}

export function getBookingProgressPercent(status: BookingStatus): number {
  if (status === 'CANCELLED') {
    return 0;
  }

  const index = BOOKING_STATUS_ORDER.indexOf(status);
  if (index === -1) {
    return 0;
  }

  return Math.round(((index + 1) / BOOKING_STATUS_ORDER.length) * 100);
}

export function getMilestoneIndex(
  milestone: BookingProgressMilestone,
  currentStatus: BookingStatus,
): number {
  if (milestone.statuses.includes(currentStatus)) {
    return BOOKING_PROGRESS_MILESTONES.indexOf(milestone);
  }

  const currentOrder = BOOKING_STATUS_ORDER.indexOf(currentStatus);
  const milestoneMaxOrder = Math.max(
    ...milestone.statuses.map((status) => BOOKING_STATUS_ORDER.indexOf(status)),
  );

  return currentOrder > milestoneMaxOrder
    ? BOOKING_PROGRESS_MILESTONES.indexOf(milestone)
    : -1;
}

export function isExpertAssignmentStatus(status: BookingStatus): boolean {
  return EXPERT_ASSIGNED_STATUSES.includes(status);
}
