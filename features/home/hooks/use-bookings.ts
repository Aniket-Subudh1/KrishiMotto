import { useQuery } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { bookingService } from '@/services/booking.service';

const DEFAULT_HOME_BOOKINGS_LIMIT = 5;

export function useHomeBookings(limit = DEFAULT_HOME_BOOKINGS_LIMIT) {
  return useQuery({
    queryKey: BOOKING_KEYS.list({ limit }),
    queryFn: async () => {
      const { data } = await bookingService.listBookings({ limit });
      return data.data;
    },
  });
}
