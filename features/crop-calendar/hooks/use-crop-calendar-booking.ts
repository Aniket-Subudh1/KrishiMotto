import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { bookingService, type ListBookingsParams } from '@/services/booking.service';
import type { CreateCropCalendarBookingPayload } from '@/types/booking';

export const BOOKING_KEYS = {
  all: ['bookings'] as const,
  list: (params?: ListBookingsParams) => ['bookings', 'list', params] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

export function useCreateCropCalendarBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCropCalendarBookingPayload) => {
      const { data } = await bookingService.createCropCalendar(payload);
      return data.data;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.setQueryData(BOOKING_KEYS.detail(booking.id), booking);
    },
  });
}

export function useBooking(id: string | null, pollPayment = false) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await bookingService.getBooking(id!);
      return data.data;
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!pollPayment) return false;
      const status = query.state.data?.paymentStatus;
      if (status === 'PAID' || status === 'FAILED') return false;
      return 3000;
    },
  });
}

export function getBookingError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
