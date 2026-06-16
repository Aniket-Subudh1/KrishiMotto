import { isAxiosError } from 'axios';
import { AppState, type AppStateStatus } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { bookingService } from '@/services/booking.service';
import type { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

const POLL_INTERVAL_MS = 4000;
const RATE_LIMIT_BACKOFF_MS = 30_000;
const MAX_POLL_MS = 10 * 60 * 1000;

const PAID_BOOKING_STATUSES: readonly BookingStatus[] = [
  'PAID',
  'OPEN',
  'ACCEPTED',
  'TRAVELLING',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

async function dismissCheckoutBrowser() {
  try {
    await WebBrowser.dismissBrowser();
  } catch {
    // dismissBrowser is iOS-only.
  }
}

async function fetchBooking(bookingId: string): Promise<Booking> {
  const { data } = await bookingService.getBooking(bookingId);
  return data.data;
}

function createFallbackBooking(bookingId: string): Booking {
  const now = new Date().toISOString();
  return {
    id: bookingId,
    orderId: '',
    serviceIconType: 'CROP_CALENDAR',
    serviceTitle: 'Crop Calendar',
    paymentStatus: 'PENDING',
    bookingStatus: 'PENDING_PAYMENT',
    details: {},
    pricing: {
      basePaise: 0,
      areaUnits: 0,
      transportPaise: 0,
      totalPaise: 0,
      computedAt: now,
    },
    statusTimeline: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Infer payment outcome from booking fields because gateway callbacks can lag. */
export function resolvePaymentStatus(booking: Booking): PaymentStatus {
  if (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'FAILED') {
    return booking.paymentStatus;
  }

  if (PAID_BOOKING_STATUSES.includes(booking.bookingStatus)) {
    return 'PAID';
  }

  if (booking.bookingStatus === 'CANCELLED') {
    return 'FAILED';
  }

  return booking.paymentStatus;
}

function isTerminalStatus(status: PaymentStatus): boolean {
  return status === 'PAID' || status === 'FAILED';
}

export type PaymentCheckoutResult = {
  status: PaymentStatus;
  booking: Booking;
};

export async function checkBookingPaymentOnce(bookingId: string): Promise<PaymentCheckoutResult> {
  const booking = await fetchBooking(bookingId);
  const status = resolvePaymentStatus(booking);
  if (isTerminalStatus(status)) {
    await dismissCheckoutBrowser();
  }
  return { status, booking };
}

type PollerCallbacks = {
  onUpdate: (booking: Booking, status: PaymentStatus) => void;
  onTerminal: (result: PaymentCheckoutResult) => void;
};

/**
 * Poll booking status until terminal. Also re-checks immediately when the app
 * returns from PhonePe / another UPI app.
 */
export function startPaymentPoller(bookingId: string, callbacks: PollerCallbacks): () => void {
  const startedAt = Date.now();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastBooking: Booking | null = null;
  let lastStatus: PaymentStatus = 'PENDING';
  let inFlight = false;
  let nextDelayMs = POLL_INTERVAL_MS;

  const stop = () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const schedule = (delay = POLL_INTERVAL_MS) => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void tick();
    }, delay);
  };

  const tick = async () => {
    if (stopped || inFlight) return;
    inFlight = true;

    try {
      if (Date.now() - startedAt > MAX_POLL_MS) {
        stop();
        callbacks.onTerminal({
          status: lastStatus,
          booking: lastBooking ?? createFallbackBooking(bookingId),
        });
        return;
      }

      const booking = await fetchBooking(bookingId);
      const status = resolvePaymentStatus(booking);
      lastBooking = booking;
      lastStatus = status;
      callbacks.onUpdate(booking, status);

      if (isTerminalStatus(status)) {
        stop();
        await dismissCheckoutBrowser();
        callbacks.onTerminal({ status, booking });
        return;
      }

      nextDelayMs = POLL_INTERVAL_MS;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 429) {
        nextDelayMs = RATE_LIMIT_BACKOFF_MS;
      }
    } finally {
      inFlight = false;
    }

    schedule(nextDelayMs);
  };

  const handleAppState = (nextState: AppStateStatus) => {
    if (nextState === 'active' && !stopped) {
      if (timer) clearTimeout(timer);
      timer = null;
      void tick();
    }
  };

  const appStateSub = AppState.addEventListener('change', handleAppState);
  void tick();

  return () => {
    stop();
    appStateSub.remove();
  };
}

export function pollBookingPayment(
  bookingId: string,
  onUpdate?: (booking: Booking) => void,
): Promise<PaymentCheckoutResult> {
  return new Promise((resolve) => {
    let settled = false;
    let stopPoller = () => {};

    stopPoller = startPaymentPoller(bookingId, {
      onUpdate: (booking) => {
        onUpdate?.(booking);
      },
      onTerminal: (result) => {
        if (settled) return;
        settled = true;
        stopPoller();
        resolve(result);
      },
    });
  });
}
