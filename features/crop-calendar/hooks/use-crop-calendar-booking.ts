export {
  BOOKING_KEYS,
  getBookingError,
  mergeDocumentPublicUrls,
  useAttachCompletionDocument,
  useBooking,
} from '@/features/bookings/hooks/use-booking';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/bookings/hooks/use-booking';
import { invalidateBookingRelatedQueries } from '@/lib/query-cache-sync';
import { bookingService } from '@/services/booking.service';
import type { CreateCropCalendarBookingPayload } from '@/types/booking';

export function useCreateCropCalendarBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCropCalendarBookingPayload) => {
      const { data } = await bookingService.createCropCalendar(payload);
      return data.data;
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      void invalidateBookingRelatedQueries(queryClient);
    },
  });
}
