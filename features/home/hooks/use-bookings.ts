import { useQuery } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { bookingService } from '@/services/booking.service';

export function useHomeBookings(limit = 50) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(),
    queryFn: async () => {
      const { data } = await bookingService.listBookings({ limit });
      return data.data;
    },
  });
}
