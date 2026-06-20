import { Stack } from 'expo-router';

import { ExpertOrderDetailScreen } from '@/features/expert/components/expert-order-detail-screen';

export default function ExpertOrderDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExpertOrderDetailScreen />
    </>
  );
}
