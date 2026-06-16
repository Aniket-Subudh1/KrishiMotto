import { resolveStoragePaymentStatus } from '@/lib/storage-payment';
import type { StorageRequest } from '@/types/storage';

export function getStorageRoute(request: StorageRequest) {
  const paymentStatus = resolveStoragePaymentStatus(request);

  if (
    request.status === 'PENDING_PAYMENT' ||
    paymentStatus === 'PENDING' ||
    (paymentStatus !== 'PAID' && Boolean(request.paymentUrl))
  ) {
    return {
      pathname: '/payment/checkout' as const,
      params: {
        storageRequestId: request.id,
        orderId: request.orderId ?? request.requestNumber,
      },
    };
  }

  return {
    pathname: '/payment/result' as const,
    params: {
      storageRequestId: request.id,
      orderId: request.orderId ?? request.requestNumber,
      status: paymentStatus,
    },
  };
}

export function isActiveStorageRequest(request: StorageRequest): boolean {
  return request.status !== 'CANCELLED';
}

export function isPaidStorageRequest(request: StorageRequest): boolean {
  return resolveStoragePaymentStatus(request) === 'PAID';
}
