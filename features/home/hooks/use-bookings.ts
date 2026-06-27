import { useQuery } from '@tanstack/react-query';

import { BOOKING_KEYS } from '@/features/bookings/hooks/use-booking';
import { FARMER_DATA_POLL_INTERVAL_MS } from '@/lib/query-cache-sync';
import { bookingService } from '@/services/booking.service';

export function useHomeBookings(limit = 50, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(),
    queryFn: async () => {
      const { data } = await bookingService.listBookings({ limit });
      return data.data;
    },
    refetchInterval: options?.poll ? FARMER_DATA_POLL_INTERVAL_MS : false,
  });
}
