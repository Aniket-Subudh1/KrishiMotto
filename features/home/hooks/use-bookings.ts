import { useQuery } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/crop-calendar/hooks/use-crop-calendar-booking';
import { bookingService } from '@/services/booking.service';

const HOME_BOOKINGS_LIMIT = 5;

export function useHomeBookings() {
  return useQuery({
    queryKey: BOOKING_KEYS.list({ limit: HOME_BOOKINGS_LIMIT }),
    queryFn: async () => {
      const { data } = await bookingService.listBookings({ limit: HOME_BOOKINGS_LIMIT });
      return data.data;
    },
  });
}
