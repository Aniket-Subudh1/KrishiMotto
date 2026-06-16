import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  BOOKING_KEYS,
  getBookingError,
} from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
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
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
    },
  });
}
