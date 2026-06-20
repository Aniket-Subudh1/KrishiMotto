import { Stack } from 'expo-router';

import { BookingDetailScreen } from '@/features/bookings/components/booking-detail-screen';

export default function BookingDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BookingDetailScreen />
    </>
  );
}
