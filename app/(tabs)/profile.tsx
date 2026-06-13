import { Redirect } from 'expo-router';

import { ProfileTab } from '@/features/home/components/profile-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfileScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const { profile, isLoading, isRefreshing, onRefresh } = useFarmerHome();

  if (user?.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ProfileTab
      profile={profile}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      t={t}
    />
  );
}
