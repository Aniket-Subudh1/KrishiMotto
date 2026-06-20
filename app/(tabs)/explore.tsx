import { Redirect } from 'expo-router';

import { ToolsTab } from '@/features/home/components/tools-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

function FarmerExploreScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const { profile, parcels, isRefreshing, onRefresh } = useFarmerHome();

  return (
    <ToolsTab
      isFarmer={user?.role === 'FARMER'}
      profile={profile}
      parcelCount={parcels.length}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      t={t}
    />
  );
}

export default function ExploreScreen() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  return <FarmerExploreScreen />;
}
