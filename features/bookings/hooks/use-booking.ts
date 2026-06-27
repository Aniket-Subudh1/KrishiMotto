import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isActiveBookingStatus } from '@/features/bookings/utils/booking-progress';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rememberUploadedCompletionDocument,
  uploadNameForContentType,
  withResolvedCompletionDocuments,
} from '@/lib/completion-document';
import { invalidateBookingRelatedQueries } from '@/lib/query-cache-sync';
import { ensureUploadUrlCacheHydrated } from '@/lib/upload-url-cache';
import { bookingService, type ListBookingsParams } from '@/services/booking.service';
import { uploadService } from '@/services/upload.service';
import type { AttachCompletionDocumentPayload, Booking } from '@/types/booking';

export const BOOKING_KEYS = {
  all: ['bookings'] as const,
  list: (params?: ListBookingsParams) => ['bookings', 'list', params] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export function useBooking(id: string | null, options?: { pollPayment?: boolean; pollStatus?: boolean }) {
  const pollPayment = options?.pollPayment ?? false;
  const pollStatus = options?.pollStatus ?? false;

  return useQuery({
    queryKey: BOOKING_KEYS.detail(id ?? ''),
    queryFn: async () => {
      await ensureUploadUrlCacheHydrated();
      const { data } = await bookingService.getBooking(id!);
      return withResolvedCompletionDocuments(data.data);
    },
    enabled: Boolean(id),
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const booking = query.state.data;
      if (!booking) return false;

      if (pollPayment && booking.paymentStatus === 'PENDING') {
        return 3000;
      }

      if (pollStatus && isActiveBookingStatus(booking.bookingStatus)) {
        return 15000;
      }

      return false;
    },
  });
}

export function useAttachCompletionDocument(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uri,
      contentType,
      label,
    }: {
      uri: string;
      contentType: string;
      label?: string;
    }) => {
      const { data: presignData } = await uploadService.presign('land_doc', contentType);
      const presign = presignData.data;
      await uploadService.uploadToPresignedUrl(
        presign.uploadUrl,
        uri,
        contentType,
        uploadNameForContentType(contentType),
      );
      rememberUploadedCompletionDocument(presign.assetKey, presign.publicUrl);

      const payload: AttachCompletionDocumentPayload = {
        assetKey: presign.assetKey,
        ...(label?.trim() ? { label: label.trim() } : {}),
      };

      const { data } = await bookingService.attachCompletionDocument(bookingId, payload);
      return withResolvedCompletionDocuments(data.data);
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      void invalidateBookingRelatedQueries(queryClient);
    },
  });
}

export function mergeDocumentPublicUrls(
  booking: Booking,
  previous?: Booking | null,
): Booking {
  let result = booking;

  if (booking.completionDocuments?.length && previous?.completionDocuments?.length) {
    const urlByKey = new Map(
      previous.completionDocuments
        .filter((doc) => doc.publicUrl)
        .map((doc) => [doc.assetKey, doc.publicUrl!]),
    );

    if (urlByKey.size > 0) {
      result = {
        ...booking,
        completionDocuments: booking.completionDocuments.map((doc) => ({
          ...doc,
          publicUrl: doc.publicUrl ?? urlByKey.get(doc.assetKey),
        })),
      };
    }
  }

  return withResolvedCompletionDocuments(result);
}

export function getBookingError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
