import { Stack } from 'expo-router';

import { RequestedServicesScreen } from '@/features/home/components/requested-services-screen';

export default function RequestedServicesRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RequestedServicesScreen />
    </>
  );
}
