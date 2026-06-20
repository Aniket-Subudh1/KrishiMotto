import { Redirect } from 'expo-router';

import { ExpertOrdersScreen } from '@/features/expert/components/expert-orders-screen';
import { useAuthStore } from '@/stores/auth.store';

export default function ExpertOrdersTab() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'EXPERT') {
    return <Redirect href="/(tabs)" />;
  }

  return <ExpertOrdersScreen />;
}
