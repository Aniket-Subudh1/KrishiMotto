import { Stack } from 'expo-router';

import { ExpertNotificationsScreen } from '@/features/expert/components/expert-notifications-screen';

export default function ExpertNotificationsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExpertNotificationsScreen />
    </>
  );
}
