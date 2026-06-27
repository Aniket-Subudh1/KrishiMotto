import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  BOOKING_KEYS,
  getBookingError,
} from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { invalidateBookingRelatedQueries } from '@/lib/query-cache-sync';
import { bookingService } from '@/services/booking.service';
import type { CreateDroneSprayBookingPayload } from '@/types/booking';

export { getBookingError };

export function useCreateDroneSprayBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDroneSprayBookingPayload) => {
      const { data } = await bookingService.createDroneSpray(payload);
      return data.data;
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
      void invalidateBookingRelatedQueries(queryClient);
    },
  });
}
