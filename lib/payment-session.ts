import {
  checkBookingPaymentOnce,
  confirmFailedPayment,
  pollBookingPayment,
  startPaymentPoller,
  type PaymentCheckoutResult,
} from "@/lib/booking-payment";
import {
  checkStoragePaymentOnce,
  confirmFailedStoragePayment,
  pollStoragePayment,
  startStoragePaymentPoller,
  type StoragePaymentCheckoutResult,
} from "@/lib/storage-payment";
import type { PaymentStatus } from "@/types/booking";

export type PaymentSessionKind = "booking" | "storage";

export type PaymentSessionRef = {
  kind: PaymentSessionKind;
  id: string;
};

export type PaymentSessionSnapshot = {
  orderId: string;
  paymentUrl: string | null;
  totalPaise: number;
};

export type PaymentSessionResult =
  | ({ kind: "booking" } & PaymentCheckoutResult)
  | ({ kind: "storage" } & StoragePaymentCheckoutResult);

export function parsePaymentSession(params: {
  bookingId?: string;
  storageRequestId?: string;
}): PaymentSessionRef | null {
  if (params.storageRequestId) {
    return { kind: "storage", id: params.storageRequestId };
  }
  if (params.bookingId) {
    return { kind: "booking", id: params.bookingId };
  }
  return null;
}

export function toPaymentSessionSnapshot(result: PaymentSessionResult): PaymentSessionSnapshot {
  if (result.kind === "booking") {
    return {
      orderId: result.booking.orderId,
      paymentUrl: result.booking.paymentUrl ?? null,
      totalPaise: result.booking.pricing.totalPaise,
    };
  }

  return {
    orderId: result.request.orderId ?? result.request.requestNumber,
    paymentUrl: result.request.paymentUrl ?? null,
    totalPaise: result.request.pricing.totalPaise,
  };
}

export async function checkPaymentOnce(
  session: PaymentSessionRef,
): Promise<PaymentSessionResult> {
  if (session.kind === "booking") {
    const result = await checkBookingPaymentOnce(session.id);
    return { kind: "booking", ...result };
  }

  const result = await checkStoragePaymentOnce(session.id);
  return { kind: "storage", ...result };
}

export async function confirmFailedPaymentForSession(
  session: PaymentSessionRef,
): Promise<PaymentSessionResult> {
  if (session.kind === "booking") {
    const result = await confirmFailedPayment(session.id);
    return { kind: "booking", ...result };
  }

  const result = await confirmFailedStoragePayment(session.id);
  return { kind: "storage", ...result };
}

export function startPaymentPollerForSession(
  session: PaymentSessionRef,
  callbacks: {
    onUpdate: (snapshot: PaymentSessionSnapshot, status: PaymentStatus) => void;
    onTerminal: (result: PaymentSessionResult) => void;
  },
) {
  if (session.kind === "booking") {
    return startPaymentPoller(session.id, {
      onUpdate: (booking, status) => {
        callbacks.onUpdate(
          {
            orderId: booking.orderId,
            paymentUrl: booking.paymentUrl ?? null,
            totalPaise: booking.pricing.totalPaise,
          },
          status,
        );
      },
      onTerminal: (result) => {
        callbacks.onTerminal({ kind: "booking", ...result });
      },
    });
  }

  return startStoragePaymentPoller(session.id, {
    onUpdate: (request, status) => {
      callbacks.onUpdate(
        {
          orderId: request.orderId ?? request.requestNumber,
          paymentUrl: request.paymentUrl ?? null,
          totalPaise: request.pricing.totalPaise,
        },
        status,
      );
    },
    onTerminal: (result) => {
      callbacks.onTerminal({ kind: "storage", ...result });
    },
  });
}

export async function pollPaymentForSession(
  session: PaymentSessionRef,
  onUpdate?: (snapshot: PaymentSessionSnapshot) => void,
): Promise<PaymentSessionResult> {
  if (session.kind === "booking") {
    const result = await pollBookingPayment(session.id, (booking) => {
      onUpdate?.({
        orderId: booking.orderId,
        paymentUrl: booking.paymentUrl ?? null,
        totalPaise: booking.pricing.totalPaise,
      });
    });
    return { kind: "booking", ...result };
  }

  const result = await pollStoragePayment(session.id, (request) => {
    onUpdate?.({
      orderId: request.orderId ?? request.requestNumber,
      paymentUrl: request.paymentUrl ?? null,
      totalPaise: request.pricing.totalPaise,
    });
  });
  return { kind: "storage", ...result };
}

export function buildPaymentResultParams(
  session: PaymentSessionRef,
  status: PaymentStatus,
  snapshot: PaymentSessionSnapshot,
) {
  if (session.kind === "booking") {
    return {
      bookingId: session.id,
      orderId: snapshot.orderId,
      status,
    };
  }

  return {
    storageRequestId: session.id,
    orderId: snapshot.orderId,
    status,
  };
}
