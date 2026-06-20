import type { ExpertBooking, ExpertBookingListPage } from '@/types/expert-booking';
import type { BookingPricing, BookingStatusTimelineEntry } from '@/types/booking';

export const EXPERT_REQUESTS_PAGE_SIZE = 20;
export const EXPERT_ORDERS_PAGE_SIZE = 20;
export const EXPERT_HOME_PREVIEW_LIMIT = 50;

export const EXPERT_REQUESTS_DEFAULT_PARAMS = {
  limit: EXPERT_REQUESTS_PAGE_SIZE,
} as const;

export const EXPERT_ORDERS_DEFAULT_PARAMS = {
  limit: EXPERT_ORDERS_PAGE_SIZE,
} as const;

export const EXPERT_HOME_LIST_PARAMS = {
  limit: EXPERT_HOME_PREVIEW_LIMIT,
} as const;

const EMPTY_PRICING: BookingPricing = {
  basePaise: 0,
  areaUnits: 0,
  transportPaise: 0,
  totalPaise: 0,
  computedAt: new Date(0).toISOString(),
};

export function cleanListParams<T extends Record<string, unknown>>(params?: T) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}

export function normalizeExpertBooking(booking: ExpertBooking): ExpertBooking {
  return {
    ...booking,
    statusTimeline: booking.statusTimeline ?? ([] as BookingStatusTimelineEntry[]),
    pricing: booking.pricing ?? EMPTY_PRICING,
    isOpenRequest: booking.isOpenRequest ?? false,
    completionDocuments: booking.completionDocuments ?? [],
  };
}

export function normalizeExpertBookingListPage(page: ExpertBookingListPage): ExpertBookingListPage {
  return {
    items: (page.items ?? []).map(normalizeExpertBooking),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore ?? false,
  };
}
