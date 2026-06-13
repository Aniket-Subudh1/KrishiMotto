import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { usePersistHydrated } from '@/hooks/use-persist-hydrated';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';

export default function Index() {
  const hydrated = usePersistHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const signupStep = useAuthFlowStore((s) => s.signupStep);

  if (!hydrated) {
    return <View className="flex-1 bg-background" />;
  }

  if (isAuthenticated) {
    if (user?.role === 'FARMER') {
      if (signupStep === 'land') {
        return <Redirect href={'/farmer/land-boundary' as Href} />;
      }

      if (!profileCompleted) {
        return <Redirect href={'/farmer/sign-up' as Href} />;
      }
    }

    if (user?.role === 'EXPERT') {
      if (signupStep === 'kyc') {
        return <Redirect href={'/expert/sign-up' as Href} />;
      }

      if (!profileCompleted) {
        return <Redirect href={'/expert/sign-up' as Href} />;
      }
    }

    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href={'/get-started' as Href} />;
}
