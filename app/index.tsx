import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { usePersistHydrated } from '@/hooks/use-persist-hydrated';
import { useAuthStore } from '@/stores/auth.store';

export default function Index() {
  const hydrated = usePersistHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) {
    return <View className="flex-1 bg-background" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href={'/get-started' as Href} />;
}
