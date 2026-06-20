import { Redirect } from 'expo-router';

import { ExpertRequestsScreen } from '@/features/expert/components/expert-requests-screen';
import { useAuthStore } from '@/stores/auth.store';

export default function ExpertRequestsTab() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'EXPERT') {
    return <Redirect href="/(tabs)" />;
  }

  return <ExpertRequestsScreen />;
}
