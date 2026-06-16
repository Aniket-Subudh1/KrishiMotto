import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  BOOKING_KEYS,
  getBookingError,
} from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { bookingService } from '@/services/booking.service';
import type { CreatePpacsCreditBookingPayload } from '@/types/booking';

export { getBookingError };

export function useCreatePpacsCreditBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePpacsCreditBookingPayload) => {
      const { data } = await bookingService.createPpacsCredit(payload);
      return data.data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
    },
  });
}
