import { Stack } from 'expo-router';

import { KrishiAiScreen } from '@/features/krishiai/components/krishiai-screen';

export default function KrishiAiRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KrishiAiScreen />
    </>
  );
}
