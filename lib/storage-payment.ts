import { isAxiosError } from "axios";
import * as WebBrowser from "expo-web-browser";
import { AppState, type AppStateStatus } from "react-native";

import { storageRequestService } from "@/services/storage-request.service";
import type { PaymentStatus } from "@/types/booking";
import type { StorageRequest, StorageRequestStatus } from "@/types/storage";

const POLL_INTERVAL_MS = 4000;
const RATE_LIMIT_BACKOFF_MS = 30_000;
const MAX_POLL_MS = 10 * 60 * 1000;
const FAILED_CONFIRM_ATTEMPTS = 3;
const FAILED_CONFIRM_INTERVAL_MS = 2000;

const PAID_STORAGE_STATUSES: readonly StorageRequestStatus[] = [
  "SUBMITTED",
  "ACCEPTED",
  "PAYOUT_PAID",
  "PICKED_UP",
  "IN_STORAGE",
  "RELEASED",
] as const;

async function dismissCheckoutBrowser() {
  try {
    await WebBrowser.dismissBrowser();
  } catch {
    // dismissBrowser is iOS-only.
  }
}

async function fetchStorageRequest(requestId: string): Promise<StorageRequest> {
  const { data } = await storageRequestService.get(requestId);
  return data.data;
}

function createFallbackStorageRequest(requestId: string): StorageRequest {
  const now = new Date().toISOString();
  return {
    id: requestId,
    requestNumber: "",
    farmerId: "",
    warehouseId: "",
    cropType: "",
    quantityKg: 0,
    details: {},
    bankDetails: {
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
    },
    valuationPaise: 0,
    pricing: {
      basePaise: 0,
      areaUnits: 0,
      transportPaise: 0,
      totalPaise: 0,
      computedAt: now,
    },
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
    statusTimeline: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Infer payment outcome from storage request fields because gateway callbacks can lag. */
export function resolveStoragePaymentStatus(request: StorageRequest): PaymentStatus {
  if (request.paymentStatus === "PAID" || request.paymentStatus === "FAILED") {
    return request.paymentStatus;
  }

  if (PAID_STORAGE_STATUSES.includes(request.status)) {
    return "PAID";
  }

  if (request.status === "CANCELLED") {
    return "FAILED";
  }

  return request.paymentStatus ?? "PENDING";
}

function isTerminalStatus(status: PaymentStatus): boolean {
  return status === "PAID" || status === "FAILED";
}

export type StoragePaymentCheckoutResult = {
  status: PaymentStatus;
  request: StorageRequest;
};

export async function checkStoragePaymentOnce(
  requestId: string,
): Promise<StoragePaymentCheckoutResult> {
  const request = await fetchStorageRequest(requestId);
  const status = resolveStoragePaymentStatus(request);
  if (isTerminalStatus(status)) {
    await dismissCheckoutBrowser();
  }
  return { status, request };
}

/**
 * Gateway callbacks and WebView redirects can briefly report FAILED while the
 * UPI app is still settling. Re-check before treating failure as final.
 */
export async function confirmFailedStoragePayment(
  requestId: string,
): Promise<StoragePaymentCheckoutResult> {
  let lastResult: StoragePaymentCheckoutResult | null = null;

  for (let attempt = 0; attempt < FAILED_CONFIRM_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, FAILED_CONFIRM_INTERVAL_MS),
      );
    }

    lastResult = await checkStoragePaymentOnce(requestId);
    if (lastResult.status === "PAID") {
      return lastResult;
    }
    if (lastResult.status !== "FAILED") {
      return lastResult;
    }
  }

  return lastResult!;
}

type PollerCallbacks = {
  onUpdate: (request: StorageRequest, status: PaymentStatus) => void;
  onTerminal: (result: StoragePaymentCheckoutResult) => void;
};

/**
 * Poll storage request status until terminal. Also re-checks immediately when
 * the app returns from PhonePe / another UPI app.
 */
export function startStoragePaymentPoller(
  requestId: string,
  callbacks: PollerCallbacks,
): () => void {
  const startedAt = Date.now();
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastRequest: StorageRequest | null = null;
  let lastStatus: PaymentStatus = "PENDING";
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
          request: lastRequest ?? createFallbackStorageRequest(requestId),
        });
        return;
      }

      const request = await fetchStorageRequest(requestId);
      const status = resolveStoragePaymentStatus(request);
      lastRequest = request;
      lastStatus = status;
      callbacks.onUpdate(request, status);

      if (status === "PAID") {
        stop();
        await dismissCheckoutBrowser();
        callbacks.onTerminal({ status, request });
        return;
      }

      if (status === "FAILED") {
        const confirmed = await confirmFailedStoragePayment(requestId);
        lastRequest = confirmed.request;
        lastStatus = confirmed.status;
        callbacks.onUpdate(confirmed.request, confirmed.status);

        if (confirmed.status === "PAID") {
          stop();
          await dismissCheckoutBrowser();
          callbacks.onTerminal(confirmed);
          return;
        }

        if (confirmed.status === "FAILED") {
          stop();
          await dismissCheckoutBrowser();
          callbacks.onTerminal(confirmed);
          return;
        }
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
    if (nextState === "active" && !stopped) {
      if (timer) clearTimeout(timer);
      timer = null;
      void tick();
    }
  };

  const appStateSub = AppState.addEventListener("change", handleAppState);
  void tick();

  return () => {
    stop();
    appStateSub.remove();
  };
}

export function pollStoragePayment(
  requestId: string,
  onUpdate?: (request: StorageRequest) => void,
): Promise<StoragePaymentCheckoutResult> {
  return new Promise((resolve) => {
    let settled = false;
    let stopPoller = () => {};

    stopPoller = startStoragePaymentPoller(requestId, {
      onUpdate: (request) => {
        onUpdate?.(request);
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
