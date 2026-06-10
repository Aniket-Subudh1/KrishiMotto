import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { usePersistHydrated } from '@/hooks/use-persist-hydrated';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';

export default function Index() {
  const hydrated = usePersistHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  if (!hydrated) {
    return <View className="flex-1 bg-background" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={'/get-started' as Href} />;
  }

  return <Redirect href={'/sign-in' as Href} />;
}
