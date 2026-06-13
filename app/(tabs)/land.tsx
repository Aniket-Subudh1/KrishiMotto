import { Redirect } from 'expo-router';

import { LandTab } from '@/features/home/components/land-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function LandScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const { profile, parcels, isLoading, isRefreshing, onRefresh, setSelectedParcelId } =
    useFarmerHome();

  if (user?.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <LandTab
      profile={profile}
      parcels={parcels}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      onParcelPress={setSelectedParcelId}
      t={t}
    />
  );
}
