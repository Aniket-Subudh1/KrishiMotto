import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  BOOKING_KEYS,
  getBookingError,
} from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { bookingService } from '@/services/booking.service';
import type { CreateExpertVisitBookingPayload } from '@/types/booking';

export { getBookingError };

export function useCreateExpertVisitBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpertVisitBookingPayload) => {
      const { data } = await bookingService.createExpertVisit(payload);
      return data.data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
    },
  });
}
