import type {
  BookingCompletionDocument,
  BookingPricing,
  BookingStatus,
  BookingStatusTimelineEntry,
  PaymentStatus,
} from '@/types/booking';

export const ASSIGNMENT_STATUSES = [
  'UNASSIGNED',
  'ASSIGNED',
  'EN_ROUTE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const EXPERT_ORDER_NEXT_STEPS = ['TRAVELLING', 'IN_PROGRESS', 'COMPLETED'] as const;

export type ExpertOrderNextStep = (typeof EXPERT_ORDER_NEXT_STEPS)[number];

export type ExpertBooking = {
  id: string;
  orderId: string;
  serviceIconType: string;
  serviceTitle: string;
  bookingStatus: BookingStatus;
  assignmentStatus: AssignmentStatus;
  paymentStatus: PaymentStatus;
  isOpenRequest: boolean;
  areaAcres?: number;
  quantityKg?: number;
  district?: string;
  pincode?: string;
  longitude?: number;
  latitude?: number;
  distanceKm?: number | null;
  pricing: BookingPricing;
  slaHours?: number;
  slaDueAt?: string | null;
  slaRemainingMinutes?: number | null;
  statusTimeline: BookingStatusTimelineEntry[];
  completionDocuments?: BookingCompletionDocument[];
  nextStep?: ExpertOrderNextStep | null;
  pollableUrl?: string;
  createdAt: string;
};

export type ExpertBookingListPage = {
  items: ExpertBooking[];
  nextCursor?: string;
  hasMore: boolean;
};

export type ExpertOrderStatusUpdatePayload = {
  status: ExpertOrderNextStep;
  note?: string;
};

export type ExpertOrderDocumentAttachPayload = {
  assetKey: string;
  label?: string;
};

export const NOTIFICATION_TYPES = ['BOOKING_OPENED', 'BOOKING_ASSIGNED', 'BOOKING_COMPLETED'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type ExpertNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type ExpertNotificationListPage = {
  items: ExpertNotification[];
  nextCursor?: string;
  hasMore: boolean;
};

export type ListExpertRequestsParams = {
  serviceIconType?: string;
  cursor?: string;
  limit?: number;
};

export type ListExpertOrdersParams = {
  cursor?: string;
  limit?: number;
};

export type ListExpertNotificationsParams = {
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
};
